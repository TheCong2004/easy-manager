import {
  EditorBlock,
  createDefaultBlock,
  ensureOnlookBlockMeta,
} from "@/components/landing-pages/editor/types";
import { ImportedLandingPageSchema } from "./import-types";
import { unwrapProxyUrl } from "./asset-rewriter";
import { sanitizeElement } from "./html-sanitizer";

const CANVAS_WIDTH = 1280;
const DEFAULT_PRESERVED_HEIGHT = 12000;
const MAX_PRESERVED_HEIGHT = 50000;

function createImportId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function unwrapProxyUrlsInDocument(doc: Document): void {
  const elements = Array.from(
    doc.querySelectorAll("[src], [srcset], [href], [style], link[rel='stylesheet']")
  );

  for (const el of elements) {
    const src = el.getAttribute("src");
    if (src) {
      const unwrapped = unwrapProxyUrl(src);
      if (unwrapped !== src) el.setAttribute("src", unwrapped);
    }

    const href = el.getAttribute("href");
    if (href) {
      const unwrapped = unwrapProxyUrl(href);
      if (unwrapped !== href) el.setAttribute("href", unwrapped);
    }

    const srcset = el.getAttribute("srcset");
    if (srcset) {
      const rewritten = srcset
        .split(",")
        .map((item) => {
          const parts = item.trim().split(/\s+/);
          const url = parts[0];
          const rest = parts.slice(1);
          return [unwrapProxyUrl(url), ...rest].join(" ");
        })
        .join(", ");

      if (rewritten !== srcset) el.setAttribute("srcset", rewritten);
    }

    const style = el.getAttribute("style");
    if (style && style.includes("url(")) {
      const rewritten = style.replace(
        /url\(\s*(['"]?)(.*?)\1\s*\)/g,
        (_match, quote, urlPath) => {
          return `url(${quote}${unwrapProxyUrl(urlPath)}${quote})`;
        }
      );

      if (rewritten !== style) el.setAttribute("style", rewritten);
    }
  }
}


function extractGlobalCss(doc: Document): string {
  const styleTags = Array.from(doc.querySelectorAll("style"));
  const styleCss = styleTags.map((tag) => tag.innerHTML).join("\n");

  const absoluteImports = Array.from(doc.querySelectorAll("link[rel~='stylesheet']"))
    .map((tag) => {
      const href = tag.getAttribute("href");
      if (!href) return "";

      if (/^(https?:|\/\/)/i.test(href)) {
        return `@import url("${href}");`;
      }

      return "";
    })
    .filter(Boolean)
    .join("\n");

  return `${absoluteImports}\n${styleCss}`.trim();
}

function getRuntimeCss(globalCss: string): string {
  return `
${globalCss || ""}

/* Easy Manager import runtime fix */
html,
body {
  width: 100% !important;
  min-height: 100% !important;
  height: auto !important;
  overflow: visible !important;
}

body {
  margin: 0 !important;
  position: relative;
}

img,
video,
canvas,
svg,
picture {
  max-width: 100%;
}

* {
  box-sizing: border-box;
}
`.trim();
}

function getResizeScript(): string {
  return `
<script>
(function () {
  function getPageHeight() {
    var html = document.documentElement;
    var body = document.body;

    return Math.max(
      html ? html.scrollHeight : 0,
      body ? body.scrollHeight : 0,
      html ? html.offsetHeight : 0,
      body ? body.offsetHeight : 0,
      html ? html.clientHeight : 0,
      body ? body.clientHeight : 0,
      1200
    );
  }

  function publishHeight() {
    var height = getPageHeight();

    try {
      if (window.frameElement) {
        window.frameElement.style.height = height + "px";
        window.frameElement.setAttribute("data-imported-height", String(height));
      }
    } catch (err) {}

    try {
      window.parent && window.parent.postMessage({
        type: "EASY_MANAGER_IMPORTED_HTML_HEIGHT",
        height: height
      }, "*");
    } catch (err) {}
  }

  window.addEventListener("load", function () {
    publishHeight();
    setTimeout(publishHeight, 300);
    setTimeout(publishHeight, 1000);
    setTimeout(publishHeight, 2500);
    setTimeout(publishHeight, 5000);
  });

  if ("ResizeObserver" in window) {
    try {
      var observer = new ResizeObserver(publishHeight);
      observer.observe(document.documentElement);
      if (document.body) observer.observe(document.body);
    } catch (err) {}
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(publishHeight).catch(function () {});
  }

  setInterval(publishHeight, 1500);
})();
</script>
`.trim();
}

function estimatePreservedHeight(doc: Document): number {
  const body = doc.body;
  if (!body) return DEFAULT_PRESERVED_HEIGHT;

  const textLength = body.textContent?.trim().length || 0;
  const mediaCount = body.querySelectorAll("img, picture, video, iframe, canvas, svg").length;
  const semanticSectionCount = body.querySelectorAll(
    [
      "section",
      "header",
      "nav",
      "main",
      "article",
      "aside",
      "footer",
      "[class*='section']",
      "[class*='hero']",
      "[class*='feature']",
      "[class*='pricing']",
      "[class*='contact']",
      "[class*='about']",
      "[class*='service']",
      "[class*='testimonial']",
      "[class*='faq']",
    ].join(",")
  ).length;

  let explicitHeight = 0;

  const topLevelElements = Array.from(body.children) as HTMLElement[];

  for (const el of topLevelElements) {
    const style = (el.getAttribute("style") || "").toLowerCase();

    const pxMatch = style.match(/(?:height|min-height)\s*:\s*(\d+)px/);
    const vhMatch = style.match(/(?:height|min-height)\s*:\s*(\d+)vh/);

    if (pxMatch?.[1]) {
      explicitHeight += Number(pxMatch[1]);
    } else if (vhMatch?.[1]) {
      explicitHeight += Math.round((Number(vhMatch[1]) / 100) * 900);
    }
  }

  const textEstimate = Math.ceil(textLength / 90) * 32;
  const mediaEstimate = mediaCount * 450;
  const sectionEstimate = Math.max(semanticSectionCount, 1) * 900;

  const height = Math.max(
    DEFAULT_PRESERVED_HEIGHT,
    explicitHeight + 1000,
    textEstimate + mediaEstimate + 1600,
    sectionEstimate
  );

  return Math.min(height, MAX_PRESERVED_HEIGHT);
}

function buildFullHtmlDocument(doc: Document, globalCss: string): string {
  const htmlEl = doc.documentElement;
  const body = doc.body;

  const originalHtmlStyle = htmlEl?.getAttribute("style") || "";
  const originalBodyStyle = body?.getAttribute("style") || "";

  const forcedHtmlStyle = [
    originalHtmlStyle,
    "width:100% !important",
    "min-height:100% !important",
    "height:auto !important",
    "overflow:visible !important",
  ]
    .filter(Boolean)
    .join("; ");

  const forcedBodyStyle = [
    originalBodyStyle,
    "width:100% !important",
    "min-height:100% !important",
    "height:auto !important",
    "overflow:visible !important",
  ]
    .filter(Boolean)
    .join("; ");

  const bodyClass = body?.className || "";
  const headHtml = doc.head?.innerHTML || "";
  const bodyHtml = body?.innerHTML || "";

  return `<!DOCTYPE html>
<html style="${escapeAttr(forcedHtmlStyle)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${headHtml}
  <style id="easy-manager-import-runtime-css">
${getRuntimeCss(globalCss)}
  </style>
</head>
<body class="${escapeAttr(bodyClass)}" style="${escapeAttr(forcedBodyStyle)}">
${bodyHtml}
${getResizeScript()}
</body>
</html>`;
}

/**
 * Mặc định import HTML/ZIP phải dùng preserve mode.
 * Không convert nhỏ ra text/button/image nữa vì sẽ vỡ CSS/flex/grid.
 */
export function parseHtmlToImportedPageSchema(html: string): ImportedLandingPageSchema {
  return parseHtmlToEditableBlocksSchema(html);
}

/**
 * API cũ vẫn giữ, nhưng chuyển sang preserve để không mất layout.
 */
export function parseHtmlToLandingPageSchema(html: string): EditorBlock[] {
  return parseHtmlToPreservedHtmlSchema(html).sections;
}

export function parseHtmlToPreservedHtmlSchema(html: string): ImportedLandingPageSchema {
  if (typeof window === "undefined" || !html) {
    return {
      globalCss: "",
      assets: [],
      sections: [],
    };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (!doc.body) {
      return {
        globalCss: "",
        assets: [],
        sections: [],
      };
    }

    unwrapProxyUrlsInDocument(doc);
    unwrapProxyUrlsInDocument(doc);

    sanitizeElement(doc.body, {
      preserveScripts: true,
      removeOpenDesignScripts: false,
      allowIframes: true,
    });

    if (doc.head) {
      sanitizeElement(doc.head, {
        preserveScripts: true,
        removeOpenDesignScripts: false,
        allowIframes: true,
      });
    }

    const globalCss = extractGlobalCss(doc);
    const fullHtml = buildFullHtmlDocument(doc, globalCss);
    const height = estimatePreservedHeight(doc);

    const sectionId = createImportId("section_preserved");
    const htmlBlockId = createImportId("html_preserved");

    const htmlBlock = createDefaultBlock("html_code");
    htmlBlock.id = htmlBlockId;
    htmlBlock.parentId = sectionId;
    htmlBlock.label = "Mã HTML Bảo toàn Bố cục";
    htmlBlock.props = {
      code: fullHtml,
      height,
      preserveHtml: true,
      mode: "iframe",
      autoResize: true,
    };
    htmlBlock.frame = {
      x: 0,
      y: 0,
      width: CANVAS_WIDTH,
      height,
      zIndex: 10,
    };

    const section = createDefaultBlock("custom_section");
    section.id = sectionId;
    section.label = "Preserved Section";
    section.children = [ensureOnlookBlockMeta(htmlBlock)];
    section.props = {
      ...section.props,
      title: "Preserved Section",
      description: "Khối chứa toàn bộ trang HTML gốc",
      minHeight: height + 80,
      bgColor: "#ffffff",
    };

    if (section.frame) {
      section.frame.x = 0;
      section.frame.y = 0;
      section.frame.width = CANVAS_WIDTH;
      section.frame.height = height + 80;
    }

    return {
      globalCss,
      assets: [],
      sections: [ensureOnlookBlockMeta(section)],
    };
  } catch (error) {
    console.error("Failed to parse preserved HTML:", error);
    return {
      globalCss: "",
      assets: [],
      sections: [],
    };
  }
}

/**
 * Các hàm dưới đây giữ lại để không vỡ import cũ.
 * Nhưng không nên dùng cho import mặc định vì convert block nhỏ sẽ làm mất CSS/layout.
 */

export function isComplexLayoutContainer(el: HTMLElement): boolean {
  const tagName = el.tagName.toLowerCase();

  if (
    /^(header|nav|footer|main|section|article|aside|form|table|svg|ul|ol|iframe|picture|video|canvas)$/i.test(
      tagName
    )
  ) {
    return true;
  }

  const className = String(el.className || "").toLowerCase();
  const idName = String(el.id || "").toLowerCase();
  const style = String(el.getAttribute("style") || "").toLowerCase();
  const mixed = `${className} ${idName} ${style}`;

  return (
    mixed.includes("flex") ||
    mixed.includes("grid") ||
    mixed.includes("container") ||
    mixed.includes("wrapper") ||
    mixed.includes("row") ||
    mixed.includes("column") ||
    mixed.includes("navbar") ||
    mixed.includes("menu") ||
    mixed.includes("hero") ||
    mixed.includes("card") ||
    mixed.includes("pricing") ||
    mixed.includes("section") ||
    mixed.includes("display:flex") ||
    mixed.includes("display: flex") ||
    mixed.includes("display:grid") ||
    mixed.includes("display: grid") ||
    mixed.includes("position") ||
    mixed.includes("background") ||
    mixed.includes("height") ||
    mixed.includes("width")
  );
}

export function isSemanticSection(el: HTMLElement): boolean {
  const tagName = el.tagName.toLowerCase();

  if (/^(section|header|nav|footer|main|article|aside)$/i.test(tagName)) {
    return true;
  }

  const className = String(el.className || "").toLowerCase();
  const idName = String(el.id || "").toLowerCase();
  const mixed = `${className} ${idName}`;

  return (
    mixed.includes("section") ||
    mixed.includes("hero") ||
    mixed.includes("feature") ||
    mixed.includes("pricing") ||
    mixed.includes("contact") ||
    mixed.includes("footer") ||
    mixed.includes("header") ||
    mixed.includes("navbar")
  );
}

export function partitionIntoSections(element: HTMLElement, doc: Document): HTMLElement[] {
  const sections: HTMLElement[] = [];
  let virtualSection: HTMLDivElement | null = null;

  function flushVirtual() {
    if (virtualSection && virtualSection.childNodes.length > 0) {
      sections.push(virtualSection);
    }
    virtualSection = null;
  }

  function appendVirtual(node: Node) {
    if (!virtualSection) {
      virtualSection = doc.createElement("div");
      virtualSection.className = "virtual-section-wrapper";
    }
    virtualSection.appendChild(node.cloneNode(true));
  }

  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent?.trim()) appendVirtual(node);
      continue;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) continue;

    const el = node as HTMLElement;
    const tagName = el.tagName.toLowerCase();

    if (/^(script|style|noscript)$/i.test(tagName)) continue;

    if (isComplexLayoutContainer(el) || isSemanticSection(el)) {
      flushVirtual();
      sections.push(el);
    } else {
      appendVirtual(el);
    }
  }

  flushVirtual();

  return sections;
}

export function extractElementsRecursive(
  node: Node,
  elements: EditorBlock[],
  sectionId: string,
  currentY: { val: number },
  globalCss = ""
) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (!text) return;

    const block = createDefaultBlock("text");
    block.id = createImportId("text");
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

    const width = 800;
    const height = Math.max(40, Math.ceil(text.length / 80) * 28);

    block.frame = {
      x: Math.max(0, Math.floor((CANVAS_WIDTH - width) / 2)),
      y: currentY.val,
      width,
      height,
      zIndex: 10,
    };

    elements.push(block);
    currentY.val += height + 24;
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const el = node as HTMLElement;
  const tagName = el.tagName.toLowerCase();

  if (/^(script|style|noscript)$/i.test(tagName)) return;

  if (isComplexLayoutContainer(el)) {
    const htmlBlock = createDefaultBlock("html_code");
    htmlBlock.id = createImportId("html");
    htmlBlock.parentId = sectionId;
    htmlBlock.label = "Khối HTML";
    htmlBlock.props = {
      code: `${globalCss ? `<style>${globalCss}</style>\n` : ""}${el.outerHTML}`,
      height: 900,
      preserveHtml: false,
      mode: "iframe",
      autoResize: true,
    };
    htmlBlock.frame = {
      x: 40,
      y: currentY.val,
      width: 1200,
      height: 900,
      zIndex: 10,
    };

    elements.push(htmlBlock);
    currentY.val += 924;
    return;
  }

  const text = el.textContent?.trim();

  if (text && /^(h1|h2|h3|h4|h5|h6|p|span|small|li)$/i.test(tagName)) {
    const block = createDefaultBlock("text");
    block.id = createImportId("text");
    block.parentId = sectionId;
    block.label = tagName.startsWith("h") ? "Heading" : "Paragraph";
    block.props = {
      content: text,
      fontSize: tagName === "h1" ? 40 : tagName === "h2" ? 32 : tagName === "h3" ? 24 : 16,
      color: el.style.color || "#111827",
      textAlign: (el.style.textAlign as "left" | "center" | "right") || "left",
      lineHeight: tagName.startsWith("h") ? 1.25 : 1.7,
      paddingX: 0,
      paddingY: 0,
    };

    const width = 800;
    const height = Math.max(48, Math.ceil(text.length / 80) * 32);

    block.frame = {
      x: Math.max(0, Math.floor((CANVAS_WIDTH - width) / 2)),
      y: currentY.val,
      width,
      height,
      zIndex: 10,
    };

    elements.push(block);
    currentY.val += height + 24;
    return;
  }

  if (tagName === "img") {
    const src = el.getAttribute("src") || "";
    if (!src) return;

    const block = createDefaultBlock("image");
    block.id = createImportId("image");
    block.parentId = sectionId;
    block.label = "Hình ảnh";
    block.props = {
      src,
      alt: el.getAttribute("alt") || "Hình ảnh",
      caption: "",
      width: "full",
      borderRadius: 8,
      showCaption: false,
      objectFit: "cover",
    };
    block.frame = {
      x: 390,
      y: currentY.val,
      width: 500,
      height: 350,
      zIndex: 10,
    };

    elements.push(block);
    currentY.val += 374;
    return;
  }

  for (const child of Array.from(node.childNodes)) {
    extractElementsRecursive(child, elements, sectionId, currentY, globalCss);
  }
}

export function parseHtmlToEditableBlocksSchema(html: string): ImportedLandingPageSchema {
  if (typeof window === "undefined" || !html) {
    return {
      globalCss: "",
      assets: [],
      sections: [],
    };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (!doc.body) {
      return {
        globalCss: "",
        assets: [],
        sections: [],
      };
    }

    unwrapProxyUrlsInDocument(doc);
    sanitizeElement(doc.body, {
      preserveScripts: false,
      removeOpenDesignScripts: true,
      allowIframes: false,
    });

    if (doc.head) {
      sanitizeElement(doc.head, {
        preserveScripts: false,
        removeOpenDesignScripts: true,
        allowIframes: false,
      });
    }
    const globalCss = extractGlobalCss(doc);
    const sectionElements = partitionIntoSections(doc.body, doc);
    const sections: EditorBlock[] = [];

    for (let index = 0; index < sectionElements.length; index++) {
      const sectionEl = sectionElements[index];
      const sectionId = createImportId(`section_${index}`);

      const section = createDefaultBlock("custom_section");
      section.id = sectionId;
      section.label = `Section ${index + 1}`;
      section.children = [];
      section.props = {
        ...section.props,
        title: `Section ${index + 1}`,
        description: "Khối được chuyển đổi từ HTML",
        bgColor: sectionEl.style.backgroundColor || "#ffffff",
      };

      const currentY = { val: 40 };
      const children: EditorBlock[] = [];

      for (const child of Array.from(sectionEl.childNodes)) {
        extractElementsRecursive(child, children, sectionId, currentY, globalCss);
      }

      section.children = children;
      section.props.minHeight = Math.max(600, currentY.val + 80);

      if (section.frame) {
        section.frame.height = section.props.minHeight;
      }

      sections.push(ensureOnlookBlockMeta(section));
    }

    return {
      globalCss,
      assets: [],
      sections,
    };
  } catch (error) {
    console.error("Failed to parse editable HTML:", error);
    return {
      globalCss: "",
      assets: [],
      sections: [],
    };
  }
}