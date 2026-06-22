import { WebsiteSchema, WebsiteSection, WebsitePage } from "@/types/website-builder";

export interface BuilderNode {
  id: string;
  type: "section" | "heading" | "text" | "button" | "image" | "card";
  props: Record<string, any>;
  label: string;
}

export interface LayerNode {
  id: string;
  name: string;
  type: string;
  children?: LayerNode[];
}

/**
 * Node ID Convention:
 * - section: [sectionId]
 * - heading: [sectionId]-heading
 * - text: [sectionId]-text
 * - button: [sectionId]-button
 * - image: [sectionId]-image
 * - card item: [sectionId]-card-[index]
 */

export function getSectionIdFromNodeId(nodeId: string): string {
  if (!nodeId) return "";
  const parts = nodeId.split("-");
  return parts[0]; // The first part is always the section ID
}

export function getNodeTypeFromId(nodeId: string): BuilderNode["type"] {
  if (!nodeId) return "section";
  const parts = nodeId.split("-");
  if (parts.length === 1) return "section";
  
  const suffix = parts[1];
  if (suffix === "heading") return "heading";
  if (suffix === "text") return "text";
  if (suffix === "button") return "button";
  if (suffix === "image") return "image";
  if (suffix === "card") return "card";
  return "text";
}

export function getNodeLabel(nodeId: string, sectionType: string, itemTitle?: string): string {
  const type = getNodeTypeFromId(nodeId);
  const formattedSecType = sectionType.charAt(0).toUpperCase() + sectionType.slice(1);
  
  switch (type) {
    case "section":
      return `Section ${formattedSecType}`;
    case "heading":
      return `Tiêu đề (${formattedSecType})`;
    case "text":
      return `Đoạn văn (${formattedSecType})`;
    case "button":
      return `Nút bấm (${formattedSecType})`;
    case "image":
      return `Hình ảnh (${formattedSecType})`;
    case "card":
      return itemTitle ? `Thẻ: ${itemTitle}` : `Thẻ danh sách (${formattedSecType})`;
    default:
      return "Phần tử";
  }
}

export function resolveSelectedNode(schema: WebsiteSchema, nodeId: string): BuilderNode | null {
  if (!schema || !nodeId) return null;
  const sectionId = getSectionIdFromNodeId(nodeId);
  const type = getNodeTypeFromId(nodeId);

  // Find section in pages
  let section: WebsiteSection | undefined;
  for (const page of schema.pages || []) {
    section = page.sections?.find((s) => s.id === sectionId);
    if (section) break;
  }

  if (!section) return null;

  const resolvedProps = {
    ...section,
    ...(section.props || {}),
  } as Record<string, any>;

  const parts = nodeId.split("-");
  
  switch (type) {
    case "section":
      return {
        id: nodeId,
        type: "section",
        label: getNodeLabel(nodeId, section.type || ""),
        props: {
          minHeight: resolvedProps.settings?.minHeight || resolvedProps.minHeight || "",
          backgroundColor: resolvedProps.settings?.backgroundColor || resolvedProps.backgroundColor || "",
          backgroundImage: resolvedProps.settings?.backgroundImage || resolvedProps.backgroundImage || "",
          overlayOpacity: resolvedProps.settings?.overlayOpacity !== undefined ? resolvedProps.settings.overlayOpacity : (resolvedProps.overlayOpacity !== undefined ? resolvedProps.overlayOpacity : 0.4),
          paddingTop: resolvedProps.settings?.paddingTop || resolvedProps.paddingTop || "16",
          paddingBottom: resolvedProps.settings?.paddingBottom || resolvedProps.paddingBottom || "16",
        }
      };

    case "heading":
      return {
        id: nodeId,
        type: "heading",
        label: getNodeLabel(nodeId, section.type || ""),
        props: {
          text: resolvedProps.title || "",
          fontSize: resolvedProps.titleFontSize || "text-2xl sm:text-3xl",
          fontWeight: resolvedProps.titleFontWeight || "font-bold",
          color: resolvedProps.titleColor || "#000000",
          align: resolvedProps.titleAlign || "center",
        }
      };

    case "text":
      return {
        id: nodeId,
        type: "text",
        label: getNodeLabel(nodeId, section.type || ""),
        props: {
          text: resolvedProps.subtitle || resolvedProps.content || "",
          fontSize: resolvedProps.textFontSize || "text-sm",
          color: resolvedProps.textColor || "#4B5563",
          align: resolvedProps.textAlign || "center",
          lineHeight: resolvedProps.textLineHeight || "leading-relaxed",
        }
      };

    case "button":
      return {
        id: nodeId,
        type: "button",
        label: getNodeLabel(nodeId, section.type || ""),
        props: {
          text: resolvedProps.buttonText || "",
          href: resolvedProps.buttonLink || "#",
          backgroundColor: resolvedProps.buttonBgColor || "#3B82F6",
          textColor: resolvedProps.buttonTextColor || "#FFFFFF",
          borderRadius: resolvedProps.buttonBorderRadius || "rounded-full",
          align: resolvedProps.buttonAlign || "center",
        }
      };

    case "image":
      return {
        id: nodeId,
        type: "image",
        label: getNodeLabel(nodeId, section.type || ""),
        props: {
          src: resolvedProps.imageUrl || resolvedProps.backgroundImage || "",
          alt: resolvedProps.imageAlt || "",
          opacity: resolvedProps.imageOpacity !== undefined ? resolvedProps.imageOpacity : 1,
          objectFit: resolvedProps.imageObjectFit || "cover",
        }
      };

    case "card": {
      const cardIndex = parseInt(parts[2] || "0", 10);
      const items = resolvedProps.items || [];
      const cardItem = items[cardIndex] || {};
      
      return {
        id: nodeId,
        type: "card",
        label: getNodeLabel(nodeId, section.type || "", cardItem.title),
        props: {
          title: cardItem.title || "",
          description: cardItem.description || "",
          backgroundColor: cardItem.backgroundColor || "#FFFFFF",
          borderColor: cardItem.borderColor || "#E5E7EB",
          radius: cardItem.radius || "rounded-xl",
        }
      };
    }

    default:
      return null;
  }
}

export function updateNodeProps(schema: WebsiteSchema, nodeId: string, patch: Record<string, any>): WebsiteSchema {
  if (!schema || !nodeId) return schema;
  const sectionId = getSectionIdFromNodeId(nodeId);
  const type = getNodeTypeFromId(nodeId);
  const parts = nodeId.split("-");

  const newPages = schema.pages.map((page) => {
    const hasSection = page.sections?.some((s) => s.id === sectionId);
    if (!hasSection) return page;

    const newSections = page.sections.map((section) => {
      if (section.id !== sectionId) return section;

      // Create new section object
      const updatedSection = { ...section };
      if (!updatedSection.props) updatedSection.props = {};

      const currentProps = { ...section, ...section.props };

      switch (type) {
        case "section":
          updatedSection.props = {
            ...updatedSection.props,
            settings: {
              ...(updatedSection.props.settings || {}),
              minHeight: patch.minHeight,
              backgroundColor: patch.backgroundColor,
              backgroundImage: patch.backgroundImage,
              overlayOpacity: patch.overlayOpacity,
              paddingTop: patch.paddingTop,
              paddingBottom: patch.paddingBottom,
            },
            backgroundColor: patch.backgroundColor,
            backgroundImage: patch.backgroundImage,
            minHeight: patch.minHeight,
          };
          // Also set direct keys for fallback compatibility
          if (patch.backgroundColor !== undefined) (updatedSection as any).backgroundColor = patch.backgroundColor;
          if (patch.backgroundImage !== undefined) (updatedSection as any).backgroundImage = patch.backgroundImage;
          if (patch.minHeight !== undefined) (updatedSection as any).minHeight = patch.minHeight;
          break;

        case "heading":
          if (patch.text !== undefined) {
            updatedSection.title = patch.text;
            updatedSection.props.title = patch.text;
          }
          if (patch.fontSize !== undefined) updatedSection.props.titleFontSize = patch.fontSize;
          if (patch.fontWeight !== undefined) updatedSection.props.titleFontWeight = patch.fontWeight;
          if (patch.color !== undefined) updatedSection.props.titleColor = patch.color;
          if (patch.align !== undefined) updatedSection.props.titleAlign = patch.align;
          break;

        case "text":
          if (patch.text !== undefined) {
            if (section.subtitle !== undefined) {
              updatedSection.subtitle = patch.text;
              updatedSection.props.subtitle = patch.text;
            } else {
              updatedSection.content = patch.text;
              updatedSection.props.content = patch.text;
            }
          }
          if (patch.fontSize !== undefined) updatedSection.props.textFontSize = patch.fontSize;
          if (patch.color !== undefined) updatedSection.props.textColor = patch.color;
          if (patch.align !== undefined) updatedSection.props.textAlign = patch.align;
          if (patch.lineHeight !== undefined) updatedSection.props.textLineHeight = patch.lineHeight;
          break;

        case "button":
          if (patch.text !== undefined) {
            updatedSection.buttonText = patch.text;
            updatedSection.props.buttonText = patch.text;
          }
          if (patch.href !== undefined) {
            updatedSection.buttonLink = patch.href;
            updatedSection.props.buttonLink = patch.href;
          }
          if (patch.backgroundColor !== undefined) updatedSection.props.buttonBgColor = patch.backgroundColor;
          if (patch.textColor !== undefined) updatedSection.props.buttonTextColor = patch.textColor;
          if (patch.borderRadius !== undefined) updatedSection.props.buttonBorderRadius = patch.borderRadius;
          if (patch.align !== undefined) updatedSection.props.buttonAlign = patch.align;
          break;

        case "image":
          if (patch.src !== undefined) updatedSection.props.imageUrl = patch.src;
          if (patch.alt !== undefined) updatedSection.props.imageAlt = patch.alt;
          if (patch.opacity !== undefined) updatedSection.props.imageOpacity = patch.opacity;
          if (patch.objectFit !== undefined) updatedSection.props.imageObjectFit = patch.objectFit;
          break;

        case "card": {
          const cardIndex = parseInt(parts[2] || "0", 10);
          const currentItems = [...((currentProps.items || []) as any[])];
          if (currentItems[cardIndex]) {
            currentItems[cardIndex] = {
              ...currentItems[cardIndex],
              title: patch.title !== undefined ? patch.title : currentItems[cardIndex].title,
              description: patch.description !== undefined ? patch.description : currentItems[cardIndex].description,
              backgroundColor: patch.backgroundColor !== undefined ? patch.backgroundColor : currentItems[cardIndex].backgroundColor,
              borderColor: patch.borderColor !== undefined ? patch.borderColor : currentItems[cardIndex].borderColor,
              radius: patch.radius !== undefined ? patch.radius : currentItems[cardIndex].radius,
            };
            updatedSection.items = currentItems;
            updatedSection.props.items = currentItems;
          }
          break;
        }
      }

      return updatedSection;
    });

    return { ...page, sections: newSections };
  });

  return { ...schema, pages: newPages };
}

export function getLayerTree(schema: WebsiteSchema): LayerNode[] {
  if (!schema || !schema.pages) return [];
  const tree: LayerNode[] = [];

  for (const page of schema.pages) {
    const pageNode: LayerNode = {
      id: page.id,
      name: page.title,
      type: "page",
      children: []
    };

    for (const section of page.sections || []) {
      const sectionNode: LayerNode = {
        id: section.id,
        name: getNodeLabel(section.id, section.type || ""),
        type: "section",
        children: []
      };

      const resolvedProps = { ...section, ...section.props } as Record<string, any>;

      // Add child elements based on section props
      if (resolvedProps.title) {
        sectionNode.children?.push({
          id: `${section.id}-heading`,
          name: "Tiêu đề",
          type: "heading"
        });
      }
      if (resolvedProps.subtitle || resolvedProps.content) {
        sectionNode.children?.push({
          id: `${section.id}-text`,
          name: "Mô tả / Nội dung",
          type: "text"
        });
      }
      if (resolvedProps.buttonText) {
        sectionNode.children?.push({
          id: `${section.id}-button`,
          name: "Nút bấm",
          type: "button"
        });
      }
      if (resolvedProps.imageUrl) {
        sectionNode.children?.push({
          id: `${section.id}-image`,
          name: "Hình ảnh",
          type: "image"
        });
      }
      if (resolvedProps.items && resolvedProps.items.length > 0) {
        resolvedProps.items.forEach((item: any, idx: number) => {
          sectionNode.children?.push({
            id: `${section.id}-card-${idx}`,
            name: item.title ? `Thẻ: ${item.title}` : `Thẻ ${idx + 1}`,
            type: "card"
          });
        });
      }

      pageNode.children?.push(sectionNode);
    }
  }

  return tree;
}
