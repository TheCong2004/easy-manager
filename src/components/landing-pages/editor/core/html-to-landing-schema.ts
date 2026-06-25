import { EditorBlock, BlockType, createDefaultBlock, ensureOnlookBlockMeta } from "../types";

/**
 * Extracts inline style colors from an element.
 */
function getStyleColor(el: HTMLElement): string | null {
  if (el.style.color) return el.style.color;
  return null;
}

/**
 * Extracts inline style text alignments from an element.
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
 * Checks if an element represents a complex layout container (flexbox, grid, columns, navbar, footer, table, etc.)
 * that should be preserved as an html_code block rather than being recursively flattened.
 */
function isComplexLayoutContainer(el: HTMLElement): boolean {
  const tagName = el.tagName.toLowerCase();
  
  // These tags should always be preserved as raw HTML blocks to keep their semantic layout/style
  if (/^(header|nav|footer|form|table|svg|ul|ol|iframe)$/i.test(tagName)) {
    return true;
  }
  
  // If it's a div, check if it has layout styles/classes
  if (tagName === "div") {
    const className = (el.className || "").toLowerCase();
    const styleAttr = (el.getAttribute("style") || "").toLowerCase();
    
    if (
      className.includes("flex") || 
      className.includes("grid") || 
      className.includes("col-") || 
      className.includes("row-") || 
      className.includes("inline") ||
      className.includes("navbar") ||
      className.includes("menu") ||
      className.includes("card") ||
      styleAttr.includes("display: flex") ||
      styleAttr.includes("display: inline") ||
      styleAttr.includes("display: grid") ||
      styleAttr.includes("float:")
    ) {
      return true;
    }
    
    // Also, if it has many direct child elements (e.g. more than 2) that are buttons, links, or images,
    // they are likely laid out horizontally or in a grid.
    const children = Array.from(el.children);
    if (children.length > 2) {
      const childTags = children.map(c => c.tagName.toLowerCase());
      const hasManyInline = childTags.filter(t => /^(a|button|img|span)$/i.test(t)).length > 1;
      if (hasManyInline) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Checks if a DOM node is a section wrapper.
 */
/**
 * Checks if a node is a semantic section container.
 */
function isSemanticSection(el: HTMLElement): boolean {
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
 * Traverses the DOM tree to locate all semantic section wrappers.
 * If a section container contains other section containers, it recurses into them.
 */
function collectSections(el: HTMLElement): HTMLElement[] {
  const sections: HTMLElement[] = [];
  
  function traverse(node: HTMLElement) {
    const tagName = node.tagName.toLowerCase();
    if (/^(script|style|noscript|iframe)$/i.test(tagName)) {
      return;
    }
    
    const isSec = isSemanticSection(node);
    
    if (isSec) {
      // Check if it contains nested semantic sections
      let hasNestedSection = false;
      const children = Array.from(node.children) as HTMLElement[];
      for (const child of children) {
        const found = child.querySelector(
          'section, header, nav, footer, main, article, aside, [class*="section"], [id*="section"], [class*="hero"], [id*="hero"]'
        );
        if (found) {
          hasNestedSection = true;
          break;
        }
        if (isSemanticSection(child)) {
          hasNestedSection = true;
          break;
        }
      }
      
      if (!hasNestedSection) {
        sections.push(node);
        return;
      }
    }
    
    const children = Array.from(node.children) as HTMLElement[];
    for (const child of children) {
      traverse(child);
    }
  }
  
  traverse(el);
  return sections;
}

/**
 * Recursively parses DOM nodes into editor blocks, appending them to a flat array.
 */
function extractElementsRecursive(
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

  // Strip unsafe or unsupported tags
  if (/^(script|style|noscript)$/i.test(tagName)) {
    return;
  }

  // Preserve complex container layouts (flex, grid, header, nav, footer, form, table) as raw html_code blocks
  if (isComplexLayoutContainer(el)) {
    const block = createDefaultBlock("html_code");
    block.id = `${tagName}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    block.parentId = sectionId;
    block.label = tagName === "header" || tagName === "nav" ? "Navbar / Header" :
                  tagName === "footer" ? "Footer trang" :
                  tagName === "table" ? "Bảng dữ liệu" :
                  tagName === "form" ? "Form đăng ký" : "Khối bố cục HTML";
                  
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

  // 1. Fallback tags like iframe/embed/object -> html_code block
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

  // SVG: map to html_code block
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

  // 2. Heading tags (H1 - H6) -> text block with label Heading
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

  // 3. Anchor or Button tag -> button block
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
        style: tagName === "a" && !el.style.backgroundColor && !el.classList.contains("btn") && !el.classList.contains("button") ? "outline" : "filled",
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

  // 4. Image tag -> image block
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

  // 5. Paragraph / spans / simple list items -> Paragraph blocks
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

  // 6. Divider line (hr)
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

  // 7. Form tags
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

  // Unknown containers (div, ul, ol, main, article, header, section, footer, nav, etc.)
  if (node.hasChildNodes()) {
    const childNodes = Array.from(node.childNodes);
    for (const child of childNodes) {
      extractElementsRecursive(child, elements, sectionId, currentY);
    }
  }
}

/**
 * Parses an HTML string using DOMParser and converts it to editor native sections and elements.
 */
export function parseHtmlToLandingPageSchema(html: string): EditorBlock[] {
  const sections: EditorBlock[] = [];
  if (typeof window === "undefined" || !html) return sections;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const body = doc.body;
    if (!body) return sections;

    // Collect all semantic section elements in the body
    let sectionElements = collectSections(body);
    if (sectionElements.length === 0) {
      sectionElements = [body];
    }

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
      
      // Parse child nodes inside this section element
      const childNodes = Array.from(el.childNodes);
      for (const childNode of childNodes) {
        extractElementsRecursive(childNode, elements, sectionId, currentY);
      }

      activeSection.children = elements;
      
      // Calculate section height based on its elements
      activeSection.props.minHeight = Math.max(120, currentY.val + 40);
      if (activeSection.frame) {
        activeSection.frame.height = activeSection.props.minHeight;
      }
      
      const normalized = ensureOnlookBlockMeta(activeSection);
      sections.push(normalized);
    }
  } catch (err) {
    console.error("Failed to parse HTML structure:", err);
  }

  return sections;
}
