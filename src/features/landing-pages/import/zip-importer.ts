import JSZip from "jszip";
import { parseHtmlToImportedPageSchema } from "./html-to-landing-schema";
import { ImportedLandingPageSchema, ImportedAsset } from "./import-types";
import { sanitizeElement } from "./html-sanitizer";
import {
  resolveRelativePath,
  uploadAssetToSupabase,
  getBase64DataUrl,
  rewriteCssUrls,
  getMimeType,
} from "./asset-rewriter";

/**
 * Xử lý nhập khẩu toàn bộ tài liệu từ file ZIP tải lên ở client.
 * Quy trình:
 * 1. Giải nén ZIP
 * 2. Tìm tệp HTML chính (ưu tiên index.html)
 * 3. Tìm các file CSS tương đối và gộp (inline) nội dung đã được viết lại URL vào HTML
 * 4. Trích xuất và tải lên (hoặc inline base64) hình ảnh, font chữ, video
 * 5. Lọc mã độc hại (sanitize)
 * 6. Phân tích sang schema EditorBlock của trang.
 */
export async function importZipLandingPage(
  file: File,
  pageId: string,
  onProgress?: (progress: number, statusText: string) => void
): Promise<ImportedLandingPageSchema> {
  const updateProgress = (progress: number, statusText: string) => {
    if (onProgress) onProgress(progress, statusText);
  };

  updateProgress(10, "Đang đọc tập tin ZIP...");
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  updateProgress(25, "Đang quét cấu trúc thư mục...");
  // 1. Tìm tệp HTML chính
  const allFiles = Object.keys(loadedZip.files);
  const htmlFiles = allFiles.filter((name) => !loadedZip.files[name].dir && name.toLowerCase().endsWith(".html"));

  if (htmlFiles.length === 0) {
    throw new Error("Không tìm thấy tệp HTML nào trong file ZIP.");
  }

  // Ưu tiên tệp index.html hoặc tệp HTML đầu tiên ở thư mục gốc
  const htmlFilePath =
    htmlFiles.find(
      (name) => name.toLowerCase() === "index.html" || name.toLowerCase().endsWith("/index.html")
    ) || htmlFiles[0];

  const htmlRawContent = await loadedZip.files[htmlFilePath].async("string");

  // Khởi tạo DOMParser để phân tích cấu trúc HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlRawContent, "text/html");

  // 2. Thu thập và xử lý các liên kết CSS nội bộ tương đối
  updateProgress(40, "Đang xử lý các tệp CSS tương đối...");
  const linkTags = Array.from(doc.querySelectorAll("link[rel='stylesheet']"));
  const localCssFiles: { tag: HTMLLinkElement; zipPath: string }[] = [];

  for (const tag of linkTags) {
    const href = tag.getAttribute("href");
    // Bỏ qua link tuyệt đối
    if (!href || /^(https?:|\/\/|data:)/i.test(href)) {
      continue;
    }
    const resolvedCssPath = resolveRelativePath(htmlFilePath, href);
    if (loadedZip.files[resolvedCssPath]) {
      localCssFiles.push({ tag: tag as HTMLLinkElement, zipPath: resolvedCssPath });
    }
  }

  // 3. Thu thập tất cả các tài nguyên liên kết tương đối trong DOM
  updateProgress(50, "Đang trích xuất hình ảnh, video và font chữ...");
  const assetMap = new Map<string, string>(); // relativePath -> URL/Base64
  const importedAssets: ImportedAsset[] = [];

  const elementsWithSrc = Array.from(doc.querySelectorAll("[src], source[srcset]"));
  const localAssetPaths = new Set<string>();

  // Thu thập các file ảnh/video từ thuộc tính src hoặc srcset tương đối
  for (const el of elementsWithSrc) {
    const src = el.getAttribute("src") || el.getAttribute("srcset");
    if (!src || /^(https?:|\/\/|data:)/i.test(src)) {
      continue;
    }
    // Gỡ bỏ các query string nếu có (vd: image.png?v=1)
    const cleanSrc = src.split("?")[0].split("#")[0];
    const resolvedAssetPath = resolveRelativePath(htmlFilePath, cleanSrc);
    if (loadedZip.files[resolvedAssetPath]) {
      localAssetPaths.add(resolvedAssetPath);
    }
  }

  // Thu thập ảnh nền style inline (background-image)
  const allElements = Array.from(doc.querySelectorAll("*")) as HTMLElement[];
  for (const el of allElements) {
    const style = el.getAttribute("style") || "";
    const bgMatch = style.match(/background-image:\s*url\(['"]?(.*?)['"]?\)/i);
    if (bgMatch && bgMatch[1]) {
      const bgUrl = bgMatch[1].trim();
      if (!/^(https?:|\/\/|data:)/i.test(bgUrl)) {
        const cleanBg = bgUrl.split("?")[0].split("#")[0];
        const resolvedAssetPath = resolveRelativePath(htmlFilePath, cleanBg);
        if (loadedZip.files[resolvedAssetPath]) {
          localAssetPaths.add(resolvedAssetPath);
        }
      }
    }
  }

  // Quét thêm các tệp tin trong các file CSS tương đối để lấy font chữ, ảnh nền trong CSS
  for (const cssFile of localCssFiles) {
    const cssRaw = await loadedZip.files[cssFile.zipPath].async("string");
    const urlsInCss = cssRaw.match(/url\(\s*(['"]?)(.*?)\1\s*\)/g) || [];
    for (const match of urlsInCss) {
      const urlPath = match.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/, "$2").trim();
      if (urlPath && !/^(https?:|\/\/|data:)/i.test(urlPath)) {
        const cleanUrl = urlPath.split("?")[0].split("#")[0];
        const resolvedAssetPath = resolveRelativePath(cssFile.zipPath, cleanUrl);
        if (loadedZip.files[resolvedAssetPath]) {
          localAssetPaths.add(resolvedAssetPath);
        }
      }
    }
  }

  // 4. Xử lý tải lên hoặc inlining Base64 cho tất cả các tài nguyên đã quét
  let processedCount = 0;
  const totalAssets = localAssetPaths.size;

  for (const assetPath of localAssetPaths) {
    processedCount++;
    const percent = 50 + Math.round((processedCount / (totalAssets || 1)) * 30);
    updateProgress(percent, `Đang xử lý tài nguyên (${processedCount}/${totalAssets}): ${assetPath}...`);

    const fileZip = loadedZip.files[assetPath];
    const buffer = await fileZip.async("arraybuffer");

    // 4.1 Thử tải lên Supabase Storage
    let finalUrl = await uploadAssetToSupabase(pageId, assetPath, buffer);

    // 4.2 Cơ chế dự phòng: Convert sang Base64
    if (!finalUrl) {
      finalUrl = getBase64DataUrl(assetPath, buffer);
    }

    assetMap.set(assetPath, finalUrl);
    importedAssets.push({
      path: assetPath,
      mimeType: getMimeType(assetPath),
      url: finalUrl,
      size: buffer.byteLength,
    });
  }

  // 5. Giải quyết inlining CSS và viết lại các url(...)
  updateProgress(85, "Đang biên dịch lại các file CSS...");
  for (const cssFile of localCssFiles) {
    let cssContent = await loadedZip.files[cssFile.zipPath].async("string");
    
    // Viết lại url(...) trong CSS
    cssContent = rewriteCssUrls(cssContent, cssFile.zipPath, assetMap);

    // Tạo thẻ <style> thay thế thẻ <link> để inlined CSS vào HTML trực tiếp
    const styleTag = doc.createElement("style");
    styleTag.innerHTML = `/* Inlined from ZIP: ${cssFile.zipPath} */\n${cssContent}`;
    cssFile.tag.parentNode?.replaceChild(styleTag, cssFile.tag);
  }

  // 6. Viết lại src / inline styles trong HTML bằng assetMap
  updateProgress(90, "Đang viết lại các đường dẫn tài nguyên trong trang...");
  for (const el of elementsWithSrc) {
    const src = el.getAttribute("src");
    if (src && !/^(https?:|\/\/|data:)/i.test(src)) {
      const cleanSrc = src.split("?")[0].split("#")[0];
      const resolvedAssetPath = resolveRelativePath(htmlFilePath, cleanSrc);
      const mappedUrl = assetMap.get(resolvedAssetPath);
      if (mappedUrl) {
        el.setAttribute("src", mappedUrl);
      }
    }

    const srcset = el.getAttribute("srcset");
    if (srcset && !/^(https?:|\/\/|data:)/i.test(srcset)) {
      const cleanSrcset = srcset.split("?")[0].split("#")[0];
      const resolvedAssetPath = resolveRelativePath(htmlFilePath, cleanSrcset);
      const mappedUrl = assetMap.get(resolvedAssetPath);
      if (mappedUrl) {
        el.setAttribute("srcset", mappedUrl);
      }
    }
  }

  // Viết lại style background-image
  for (const el of allElements) {
    const style = el.getAttribute("style") || "";
    if (style.includes("background-image")) {
      const newStyle = style.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/g, (match, quote, urlPath) => {
        if (/^(https?:|\/\/|data:)/i.test(urlPath)) {
          return match;
        }
        const cleanBg = urlPath.split("?")[0].split("#")[0];
        const resolvedAssetPath = resolveRelativePath(htmlFilePath, cleanBg);
        const mappedUrl = assetMap.get(resolvedAssetPath);
        if (mappedUrl) {
          return `url(${quote}${mappedUrl}${quote})`;
        }
        return match;
      });
      el.setAttribute("style", newStyle);
    }
  }

  // 7. Bảo mật: Khử trùng, lọc mã độc hại (Sanitize HTML)
  updateProgress(95, "Đang làm sạch và kiểm tra an toàn mã HTML...");
  sanitizeElement(doc.body);
  if (doc.head) {
    sanitizeElement(doc.head);
  }

  // 8. Chuyển đổi mã HTML sau khi inline hoàn chỉnh sang schema EditorBlock
  updateProgress(98, "Đang phân tích cấu trúc và hoàn thiện giao diện...");
  const inlinedHtmlContent = doc.documentElement.innerHTML;
  const importedSchema = parseHtmlToImportedPageSchema(inlinedHtmlContent);

  // Gán lại danh sách assets đã import
  importedSchema.assets = importedAssets;

  updateProgress(100, "Nhập thiết kế thành công!");
  return importedSchema;
}
