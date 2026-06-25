import { EditorBlock, BlockType, createDefaultBlock, ensureOnlookBlockMeta } from "@/components/landing-pages/editor/types";
import { ImportedLandingPageSchema } from "./import-types";

/**
 * Lấy mã màu văn bản inline từ phần tử.
 */
function getStyleColor(el: HTMLElement): string | null {
  if (el.style.color) return el.style.color;
  return null;
}

/**
 * Lấy hướng căn chỉnh văn bản inline từ phần tử.
 */
function getStyleAlign(el: HTMLElement): "left" | "center" | "right" | null {
  if (el.style.textAlign) {
    const align = el.style.textAlign.toLowerCase();
    if (align === "left" || align === "center" || align === "right") {
      return align;
    }
  }
  if (el.classList.contains("text-center")) return "center";
  if (el.classList.contains("text-right")) return "right";
  if (el.classList.contains("text-left")) return "left";
  return null;
}

/**
 * Thuật toán Layout-Aware:
 * Kiểm tra xem phần tử có phải là một container bố cục phức tạp (flex, grid, navbar, footer, table, form...)
 * nên được giữ nguyên dưới dạng khối html_code thay vì bóc tách sâu hơn.
 */
export function isComplexLayoutContainer(el: HTMLElement): boolean {
  const tagName = el.tagName.toLowerCase();

  // Các thẻ semantic này luôn giữ nguyên cấu trúc HTML thô để bảo toàn layout
  if (/^(header|nav|footer|form|table|svg|ul|ol|iframe)$/i.test(tagName)) {
    return true;
  }

  const className = (el.className || "").toLowerCase();
  const styleAttr = (el.getAttribute("style") || "").toLowerCase();
  const idName = (el.id || "").toLowerCase();
  const classOrStyleOrId = `${className} ${styleAttr} ${idName}`;

  // Kiểm tra các thuộc tính layout class, style hoặc id quan trọng
  if (
    classOrStyleOrId.includes("flex") ||
    classOrStyleOrId.includes("grid") ||
    classOrStyleOrId.includes("col-") ||
    classOrStyleOrId.includes("row-") ||
    classOrStyleOrId.includes("inline") ||
    classOrStyleOrId.includes("navbar") ||
    classOrStyleOrId.includes("menu") ||
    classOrStyleOrId.includes("card") ||
    classOrStyleOrId.includes("container") ||
    classOrStyleOrId.includes("wrapper") ||
    classOrStyleOrId.includes("columns") ||
    classOrStyleOrId.includes("row") ||
    classOrStyleOrId.includes("pricing-grid") ||
    classOrStyleOrId.includes("section-wrapper") ||
    styleAttr.includes("display: flex") ||
    styleAttr.includes("display: inline") ||
    styleAttr.includes("display: grid") ||
    styleAttr.includes("float:")
  ) {
    return true;
  }

  // Nếu có nhiều phần tử con thuộc loại inline/nút liên kết cạnh nhau, có thể chúng xếp hàng ngang (navbar/menu)
  const children = Array.from(el.children);
  if (children.length > 2) {
    const childTags = children.map((c) => c.tagName.toLowerCase());
    const hasManyInline = childTags.filter((t) => /^(a|button|img|span)$/i.test(t)).length > 1;
    if (hasManyInline) {
      return true;
    }
  }

  return false;
}

/**
 * Kiểm tra xem một phần tử có đại diện cho một semantic section hay không.
 */
export function isSemanticSection(el: HTMLElement): boolean {
  const tagName = el.tagName.toLowerCase();
  if (/^(section|header|nav|footer|main|article|aside)$/i.test(tagName)) {
    return true;
  }
  const className = el.className || "";
  const idName = el.id || "";
  const classOrId = `${className} ${idName}`.toLowerCase();
  if (
    classOrId.includes("section") ||
    classOrId.includes("container") ||
    classOrId.includes("hero") ||
    classOrId.includes("feature") ||
    classOrId.includes("pricing") ||
    classOrId.includes("contact") ||
    classOrId.includes("footer") ||
    classOrId.includes("header") ||
    classOrId.includes("navbar")
  ) {
    return true;
  }
  return false;
}

/**
 * Thuật toán Phân vùng không mất DOM (Lossless Partitioning):
 * Duyệt cây DOM và phân bổ tất cả phần tử vào các section, gom phần tử tự do vào Virtual Sections.
 */
export function partitionIntoSections(element: HTMLElement, doc: Document): HTMLElement[] {
  const sections: HTMLElement[] = [];
  let currentVirtualSection: HTMLDivElement | null = null;

  function flushVirtualSection() {
    if (currentVirtualSection && currentVirtualSection.childNodes.length > 0) {
      sections.push(currentVirtualSection);
      currentVirtualSection = null;
    }
  }

  function appendToVirtualSection(node: Node) {
    if (!currentVirtualSection) {
      currentVirtualSection = doc.createElement("div");
      currentVirtualSection.className = "virtual-section-wrapper";
    }
    currentVirtualSection.appendChild(node.cloneNode(true));
  }

  function traverse(el: HTMLElement) {
    const children = Array.from(el.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim();
        if (text) {
          appendToVirtualSection(child);
        }
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }

      const childEl = child as HTMLElement;
      const tagName = childEl.tagName.toLowerCase();
      if (/^(script|style|noscript)$/i.test(tagName)) {
        continue;
      }

      const isSec = isSemanticSection(childEl);
      const hasNestedSec =
        childEl.querySelector(
          'section, header, nav, footer, main, article, aside, [class*="section"], [id*="section"], [class*="hero"], [id*="hero"]'
        ) !== null || Array.from(childEl.children).some((c) => isSemanticSection(c as HTMLElement));

      if (isSec) {
        if (!hasNestedSec) {
          // Leaf section
          flushVirtualSection();
          sections.push(childEl);
        } else {
          // Section cha chứa các section con: duyệt sâu hơn để chia nhỏ
          traverse(childEl);
        }
      } else if (hasNestedSec) {
        // Layout wrapper (div) chứa các section con: duyệt sâu hơn
        traverse(childEl);
      } else {
        // Phần tử nội dung thông thường: gom vào virtual section
        appendToVirtualSection(childEl);
      }
    }
    flushVirtualSection();
  }

  traverse(element);
  return sections;
}

/**
 * Duyệt đệ quy để trích xuất các phần tử con thành blocks trong Editor.
 */
export function extractElementsRecursive(
  node: Node,
  elements: EditorBlock[],
  sectionId: string,
  currentY: { val: number }
) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim() || "";
    if (text) {
      const block = createDefaultBlock("text");
      block.id = `text_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      block.parentId = sectionId;
      block.label = "Paragraph";
      block.props = {
        content: text,
        fontSize: 16,
        color: "#374151",
        textAlign: "left",
        lineHeight: 1.7,
        paddingX: 0,
        paddingY: 0,
      };

      const w = 800;
      const h = Math.max(40, Math.ceil(text.length / 80) * 24);
      block.frame = {
        x: Math.max(0, Math.floor((1280 - w) / 2)),
        y: currentY.val,
        width: w,
        height: h,
        zIndex: 10,
      };
      elements.push(block);
      currentY.val += h + 24;
    }
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  const el = node as HTMLElement;
  const tagName = el.tagName.toLowerCase();

  // Bỏ qua thẻ script, style, noscript vì đã được xử lý ở bước giải nén/lọc độc
  if (/^(script|style|noscript)$/i.test(tagName)) {
    return;
  }

  // Nếu gặp khối layout phức tạp, lưu nó thành mã nguồn HTML độc lập (html_code)
  if (isComplexLayoutContainer(el)) {
    const block = createDefaultBlock("html_code");
    block.id = `${tagName}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    block.parentId = sectionId;
    block.label =
      tagName === "header" || tagName === "nav"
        ? "Navbar / Header"
        : tagName === "footer"
        ? "Footer trang"
        : tagName === "table"
        ? "Bảng dữ liệu"
        : tagName === "form"
        ? "Form đăng ký"
        : "Khối bố cục HTML";

    let estimatedHeight = 350;
    if (tagName === "header" || tagName === "nav") estimatedHeight = 80;
    else if (tagName === "footer") estimatedHeight = 240;
    else if (tagName === "svg") estimatedHeight = 64;

    block.props = {
      code: el.outerHTML,
      height: estimatedHeight,
    };

    const w = 1200;
    block.frame = {
      x: 40,
      y: currentY.val,
      width: w,
      height: estimatedHeight,
      zIndex: 10,
    };

    elements.push(block);
    currentY.val += estimatedHeight + 24;
    return;
  }

  // HTML embedded elements
  if (/^(iframe|embed|object)$/i.test(tagName)) {
    const block = createDefaultBlock("html_code");
    block.id = `html_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    block.parentId = sectionId;
    block.label = "Mã HTML Nhúng";
    block.props = {
      code: el.outerHTML,
      height: el.getAttribute("height") ? parseInt(el.getAttribute("height") || "300") : 300,
    };
    const w = el.getAttribute("width") ? parseInt(el.getAttribute("width") || "800") : 800;
    const h = el.getAttribute("height") ? parseInt(el.getAttribute("height") || "300") : 300;
    block.frame = {
      x: Math.max(0, Math.floor((1280 - w) / 2)),
      y: currentY.val,
      width: w,
      height: h,
      zIndex: 10,
    };
    elements.push(block);
    currentY.val += h + 24;
    return;
  }

  // Vector SVG
  if (tagName === "svg") {
    const block = createDefaultBlock("html_code");
    block.id = `svg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    block.parentId = sectionId;
    block.label = "Biểu tượng Vector (SVG)";
    block.props = {
      code: el.outerHTML,
      height: el.getAttribute("height") ? parseInt(el.getAttribute("height") || "48") : 48,
    };

    const w = el.getAttribute("width") ? parseInt(el.getAttribute("width") || "48") : 48;
    const h = el.getAttribute("height") ? parseInt(el.getAttribute("height") || "48") : 48;
    block.frame = {
      x: Math.max(0, Math.floor((1280 - w) / 2)),
      y: currentY.val,
      width: w,
      height: h,
      zIndex: 10,
    };
    elements.push(block);
    currentY.val += h + 24;
    return;
  }

  // Heading tags (h1-h6)
  if (/^h[1-6]$/.test(tagName)) {
    const level = parseInt(tagName.substring(1));
    const text = el.textContent?.trim() || "";
    if (text) {
      const fontSize = level === 1 ? 36 : level === 2 ? 28 : level === 3 ? 22 : 18;
      const color = getStyleColor(el) || "#111827";
      const align = getStyleAlign(el) || "left";

      const block = createDefaultBlock("text");
      block.id = `heading_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      block.parentId = sectionId;
      block.label = "Heading";
      block.props = {
        content: text,
        fontSize,
        color,
        textAlign: align,
        lineHeight: 1.3,
        paddingX: 0,
        paddingY: 0,
      };

      const w = 800;
      const h = level === 1 ? 70 : 50;
      block.frame = {
        x: Math.max(0, Math.floor((1280 - w) / 2)),
        y: currentY.val,
        width: w,
        height: h,
        zIndex: 10,
      };
      elements.push(block);
      currentY.val += h + 24;
      return;
    }
  }

  // Button & Link tags
  if (tagName === "button" || tagName === "a") {
    const hasImgOrBlockChild = Array.from(el.children).some((child) =>
      /^(img|p|div|section|article|aside|h[1-6]|button|ul|ol|form|hr|table|svg)$/i.test(
        child.tagName
      )
    );
    if (hasImgOrBlockChild) {
      if (node.hasChildNodes()) {
        const childNodes = Array.from(node.childNodes);
        for (const child of childNodes) {
          extractElementsRecursive(child, elements, sectionId, currentY);
        }
      }
      return;
    }

    const text = el.textContent?.trim() || "";
    if (text) {
      const url = el.getAttribute("href") || "#";
      const color = el.style.backgroundColor || "#65a30d";
      const textColor = el.style.color || "#ffffff";
      const align = getStyleAlign(el) || "center";

      const block = createDefaultBlock("button");
      block.id = `button_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      block.parentId = sectionId;
      block.label = tagName === "a" ? "Nút liên kết" : "Nút bấm";
      block.props = {
        label: text,
        url,
        style:
          tagName === "a" &&
          !el.style.backgroundColor &&
          !el.classList.contains("btn") &&
          !el.classList.contains("button")
            ? "outline"
            : "filled",
        color,
        textColor,
        size: "md",
        fullWidth: false,
        borderRadius: 8,
        align,
        icon: "",
      };

      const w = 200;
      const h = 48;
      block.frame = {
        x: Math.max(0, Math.floor((1280 - w) / 2)),
        y: currentY.val,
        width: w,
        height: h,
        zIndex: 10,
      };
      elements.push(block);
      currentY.val += h + 24;
      return;
    }
  }

  // Images
  if (tagName === "img") {
    const src = el.getAttribute("src") || "";
    const alt = el.getAttribute("alt") || "Hình ảnh";
    if (src) {
      const isRelative =
        !src.startsWith("http://") && !src.startsWith("https://") && !src.startsWith("data:");

      const block = createDefaultBlock("image");
      block.id = `image_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      block.parentId = sectionId;
      block.label = "Hình ảnh";
      block.props = {
        src,
        alt,
        caption: "",
        width: "full",
        borderRadius: 8,
        showCaption: false,
        objectFit: "cover",
      };

      if (isRelative) {
        (block as any).assetMissing = true;
      }

      const w = 500;
      const h = 350;
      block.frame = {
        x: Math.max(0, Math.floor((1280 - w) / 2)),
        y: currentY.val,
        width: w,
        height: h,
        zIndex: 10,
      };
      elements.push(block);
      currentY.val += h + 24;
      return;
    }
  }

  // Paragraph / spans / simple list items
  if (/^(p|span|small|li|label|figcaption)$/i.test(tagName)) {
    const text = el.textContent?.trim() || "";
    const hasBlockChildren = Array.from(el.children).some((child) =>
      /^(p|div|section|article|aside|h[1-6]|img|button|ul|ol|form|hr|table|svg)$/i.test(
        child.tagName
      )
    );

    if (text && !hasBlockChildren) {
      const color = getStyleColor(el) || "#374151";
      const align = getStyleAlign(el) || "left";
      const fontSize = tagName === "small" || tagName === "figcaption" ? 12 : 16;

      const block = createDefaultBlock("text");
      block.id = `text_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      block.parentId = sectionId;
      block.label = "Paragraph";
      block.props = {
        content: text,
        fontSize,
        color,
        textAlign: align,
        lineHeight: 1.7,
        paddingX: 0,
        paddingY: 0,
      };

      const w = 800;
      const h = Math.max(40, Math.ceil(text.length / 80) * 24);
      block.frame = {
        x: Math.max(0, Math.floor((1280 - w) / 2)),
        y: currentY.val,
        width: w,
        height: h,
        zIndex: 10,
      };
      elements.push(block);
      currentY.val += h + 24;
      return;
    }
  }

  // Divider line (hr)
  if (tagName === "hr") {
    const block = createDefaultBlock("divider");
    block.id = `divider_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    block.parentId = sectionId;
    block.label = "Đường kẻ";
    block.props = {
      color: el.style.borderColor || "#e5e7eb",
      thickness: 1,
      style: "solid",
      paddingX: 0,
      paddingY: 0,
    };

    const w = 800;
    const h = 20;
    block.frame = {
      x: Math.max(0, Math.floor((1280 - w) / 2)),
      y: currentY.val,
      width: w,
      height: h,
      zIndex: 10,
    };
    elements.push(block);
    currentY.val += h + 24;
    return;
  }

  // Form tag
  if (tagName === "form") {
    const block = createDefaultBlock("form_capture");
    block.id = `form_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    block.parentId = sectionId;
    block.label = "Form đăng ký";

    const w = 600;
    const h = 400;
    block.frame = {
      x: Math.max(0, Math.floor((1280 - w) / 2)),
      y: currentY.val,
      width: w,
      height: h,
      zIndex: 10,
    };
    elements.push(block);
    currentY.val += h + 24;
    return;
  }

  // Khối chứa khác: duyệt đệ quy các con
  if (node.hasChildNodes()) {
    const childNodes = Array.from(node.childNodes);
    for (const child of childNodes) {
      extractElementsRecursive(child, elements, sectionId, currentY);
    }
  }
}

/**
 * Phiên bản tương thích ngược trả về danh sách sections phẳng.
 */
export function parseHtmlToLandingPageSchema(html: string): EditorBlock[] {
  const imported = parseHtmlToImportedPageSchema(html);
  return imported.sections;
}

/**
 * Triển khai đầy đủ phân tích HTML sang cấu trúc trang ImportedLandingPageSchema.
 */
export function parseHtmlToImportedPageSchema(html: string): ImportedLandingPageSchema {
  const sections: EditorBlock[] = [];
  if (typeof window === "undefined" || !html) {
    return { globalCss: "", assets: [], sections: [] };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const body = doc.body;
    if (!body) {
      return { globalCss: "", assets: [], sections: [] };
    }

    // 1. Trích xuất CSS toàn cục và chuyển đổi link CSS tuyệt đối thành @import
    const styleTags = Array.from(doc.querySelectorAll("style"));
    const styleContent = styleTags.map((tag) => tag.innerHTML).join("\n");

    const linkTags = Array.from(doc.querySelectorAll("link[rel='stylesheet']"));
    const linkImports = linkTags
      .map((tag) => {
        const href = tag.getAttribute("href");
        if (href && /^(https?:|\/\/)/i.test(href)) {
          return `@import url("${href}");`;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");

    const globalCss = `${linkImports}\n${styleContent}`.trim();

    // 2. Phân vùng body thành các semantic/virtual sections
    const sectionElements = partitionIntoSections(body, doc);

    // 3. Xử lý chi tiết từng phần
    for (let index = 0; index < sectionElements.length; index++) {
      const el = sectionElements[index];
      const tagName = el.tagName.toLowerCase();

      const sectionId = `section_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`;
      let label = "Khối tùy chỉnh";
      let blockType: BlockType = "custom_section";

      if (tagName === "header" || tagName === "nav") {
        label = "Navbar / Header";
      } else if (tagName === "footer") {
        label = "Footer trang";
        blockType = "footer";
      } else {
        const className = el.className || "";
        const idName = el.id || "";
        const classOrId = `${className} ${idName}`.toLowerCase();
        if (classOrId.includes("hero")) {
          label = "Hero Section";
        } else if (classOrId.includes("feature")) {
          label = "Features Section";
        } else if (classOrId.includes("contact")) {
          label = "Contact Section";
        } else {
          label = `Section ${sections.length + 1}`;
        }
      }

      let bgImage = "";
      const styleAttr = el.getAttribute("style") || "";
      const bgImgMatch = styleAttr.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/i);
      if (bgImgMatch && bgImgMatch[1]) {
        bgImage = bgImgMatch[1];
      }

      const activeSection = createDefaultBlock(blockType);
      activeSection.id = sectionId;
      activeSection.label = label;
      activeSection.children = [];
      activeSection.props = {
        ...activeSection.props,
        title: label,
        description: "Khối tùy chỉnh tạo từ mã HTML",
        bgColor: el.style.backgroundColor || (blockType === "footer" ? "#0f172a" : "#ffffff"),
        bgImage: bgImage || activeSection.props.bgImage || "",
      };

      const currentY = { val: 40 };
      const elements: EditorBlock[] = [];

      // Phân tích đệ quy các phần tử con bên trong section này
      const childNodes = Array.from(el.childNodes);
      for (const childNode of childNodes) {
        extractElementsRecursive(childNode, elements, sectionId, currentY);
      }

      activeSection.children = elements;

      // Tính toán chiều cao tự nhiên của Section
      activeSection.props.minHeight = Math.max(120, currentY.val + 40);
      if (activeSection.frame) {
        activeSection.frame.height = activeSection.props.minHeight;
      }

      const normalized = ensureOnlookBlockMeta(activeSection);
      sections.push(normalized);
    }

    return {
      globalCss,
      assets: [], // Bản thô không có assets, ZIP importer sẽ tự điền
      sections,
    };
  } catch (err) {
    console.error("Failed to parse HTML structure:", err);
    return { globalCss: "", assets: [], sections: [] };
  }
}
