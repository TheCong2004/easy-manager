import { EditorBlock, EditorData, ONLOOK_ATTRIBUTES, createDefaultPageSettings, ensureOnlookBlockMeta } from "./types";

export type LandingEditorAction =
  | {
      type: "insert-element";
      blockId: string;
      blockType: EditorBlock["type"];
      index: number;
      timestamp: number;
    }
  | {
      type: "remove-element";
      blockId: string;
      blockType: EditorBlock["type"];
      timestamp: number;
    }
  | {
      type: "move-element";
      blockId: string;
      fromIndex: number;
      toIndex: number;
      timestamp: number;
    }
  | {
      type: "update-props";
      blockId: string;
      blockType: EditorBlock["type"];
      keys: string[];
      timestamp: number;
    }
  | {
      type: "update-page-settings";
      key: string;
      timestamp: number;
    };

export interface LandingEditorSnapshot {
  data: EditorData;
  actions: LandingEditorAction[];
  html: string;
  updatedAt: string;
}

export function normalizeEditorData(data: EditorData): EditorData {
  return {
    ...data,
    pageSettings: {
      ...createDefaultPageSettings(data.pageName),
      ...data.pageSettings,
    },
    blocks: data.blocks.map(ensureOnlookBlockMeta),
  };
}

export function createEditorSnapshot(data: EditorData, actions: LandingEditorAction[]): LandingEditorSnapshot {
  const normalizedData = normalizeEditorData(data);

  return {
    data: normalizedData,
    actions,
    html: renderLandingPageHtml(normalizedData),
    updatedAt: new Date().toISOString(),
  };
}

export function renderLandingPageHtml(data: EditorData): string {
  const normalized = normalizeEditorData(data);
  const body = normalized.blocks.map(renderBlockHtml).join("\n");

  return [
    `<!doctype html>`,
    `<html lang="vi">`,
    `<head>`,
    `<meta charset="utf-8" />`,
    `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
    `<title>${escapeHtml(normalized.pageSettings.seoTitle || normalized.pageName)}</title>`,
    `<meta name="description" content="${escapeAttr(normalized.pageSettings.seoDescription)}" />`,
    normalized.pageSettings.canonicalUrl ? `<link rel="canonical" href="${escapeAttr(normalized.pageSettings.canonicalUrl)}" />` : "",
    normalized.pageSettings.pixelId ? `<meta name="facebook-domain-verification" content="${escapeAttr(normalized.pageSettings.pixelId)}" />` : "",
    `<style>body{margin:0;background:${normalized.pageSettings.bgColor};font-family:${normalized.pageSettings.fontFamily};}*{box-sizing:border-box}img{max-width:100%;display:block}</style>`,
    `</head>`,
    `<body>`,
    `<main style="max-width:${normalized.pageSettings.maxWidth}px;margin:0 auto;background:${normalized.pageSettings.bgColor};">`,
    body,
    `</main>`,
    `</body>`,
    `</html>`,
  ].join("\n");
}

function renderBlockHtml(block: EditorBlock): string {
  const b = ensureOnlookBlockMeta(block);
  const attrs = renderOnlookAttrs(b);
  const props = b.props as Record<string, unknown>;

  switch (b.type) {
    case "hero":
      return `<section ${attrs} style="min-height:${num(props.minHeight, 480)}px;background:${styleBg(props)};position:relative;display:flex;align-items:center;justify-content:center;text-align:${str(props.textAlign, "center")};padding:64px 32px;"><div style="max-width:820px;position:relative;z-index:1;"><h1 style="font-size:clamp(32px,5vw,56px);line-height:1.05;margin:0 0 20px;font-weight:800;color:${heroTextColor(props)};">${escapeHtml(str(props.headline))}</h1><p style="font-size:18px;line-height:1.7;margin:0 0 28px;color:${heroSubTextColor(props)};">${escapeHtml(str(props.subheadline))}</p><a href="${escapeAttr(str(props.ctaUrl, "#"))}" style="display:inline-flex;padding:14px 28px;border-radius:12px;background:${str(props.ctaColor, "#65a30d")};color:#fff;text-decoration:none;font-weight:700;">${escapeHtml(str(props.ctaText, "CTA"))}</a></div></section>`;
    case "text":
      return `<section ${attrs} style="padding:${num(props.paddingY, 24)}px ${num(props.paddingX, 32)}px;"><p style="margin:0;font-size:${num(props.fontSize, 16)}px;line-height:${num(props.lineHeight, 1.7)};color:${str(props.color, "#374151")};text-align:${str(props.textAlign, "left")};">${escapeHtml(str(props.content))}</p></section>`;
    case "image":
      return `<figure ${attrs} style="margin:0 auto;padding:24px 32px;max-width:${imageWidth(str(props.width, "full"))};"><img src="${escapeAttr(str(props.src))}" alt="${escapeAttr(str(props.alt))}" style="width:100%;border-radius:${num(props.borderRadius, 8)}px;object-fit:${str(props.objectFit, "cover")};" />${props.showCaption ? `<figcaption style="font-size:13px;color:#64748b;margin-top:8px;text-align:center;">${escapeHtml(str(props.caption))}</figcaption>` : ""}</figure>`;
    case "button":
      return `<section ${attrs} style="padding:16px 32px;text-align:${str(props.align, "center")};"><a href="${escapeAttr(str(props.url, "#"))}" style="display:inline-flex;width:${props.fullWidth ? "100%" : "auto"};justify-content:center;padding:${buttonPadding(str(props.size, "md"))};border-radius:${num(props.borderRadius, 8)}px;background:${props.style === "filled" ? str(props.color, "#65a30d") : "transparent"};border:${props.style === "ghost" ? "2px solid transparent" : `2px solid ${str(props.color, "#65a30d")}`};color:${props.style === "filled" ? str(props.textColor, "#ffffff") : str(props.color, "#65a30d")};text-decoration:none;font-weight:700;">${escapeHtml(str(props.label, "Button"))}</a></section>`;
    case "spacer":
      return `<div ${attrs} style="height:${num(props.height, 48)}px;background:${str(props.bgColor, "transparent")};"></div>`;
    case "divider":
      return `<div ${attrs} style="padding:${num(props.paddingY, 16)}px ${num(props.paddingX, 32)}px;"><hr style="border:0;border-top:${num(props.thickness, 1)}px ${str(props.style, "solid")} ${str(props.color, "#e5e7eb")};" /></div>`;
    case "feature_card":
      return `<section ${attrs} style="padding:32px;"><div style="background:${str(props.bgColor, "#ffffff")};border:1px solid ${str(props.borderColor, "#e5e7eb")};border-radius:${num(props.borderRadius, 12)}px;padding:28px;"><div style="width:44px;height:44px;border-radius:12px;background:${str(props.iconBg, "#dbeafe")};color:${str(props.iconColor, "#65a30d")};display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px;">${escapeHtml(str(props.icon))}</div><h3 style="margin:0 0 10px;color:#0f172a;font-size:22px;">${escapeHtml(str(props.title))}</h3><p style="margin:0;color:#475569;line-height:1.7;">${escapeHtml(str(props.description))}</p></div></section>`;
    case "testimonial":
      return `<section ${attrs} style="padding:32px;"><figure style="margin:0;background:${str(props.bgColor, "#f8fafc")};color:${str(props.textColor, "#1e293b")};border-radius:16px;padding:28px;"><blockquote style="margin:0 0 18px;font-size:18px;line-height:1.7;">${escapeHtml(str(props.quote))}</blockquote><figcaption style="display:flex;align-items:center;gap:12px;"><img src="${escapeAttr(str(props.authorAvatar))}" alt="${escapeAttr(str(props.authorName))}" style="width:44px;height:44px;border-radius:999px;object-fit:cover;background:#e5e7eb;" /><div><strong>${escapeHtml(str(props.authorName))}</strong><div style="font-size:13px;color:#64748b;">${escapeHtml(str(props.authorRole))}</div></div></figcaption>${props.showRating ? `<div style="margin-top:14px;color:#f59e0b;">${"★".repeat(Math.max(1, Math.min(5, num(props.rating, 5))))}</div>` : ""}</figure></section>`;
    case "countdown":
      return `<section ${attrs} style="padding:32px;background:${str(props.bgColor, "#1e293b")};color:#fff;text-align:center;"><h2 style="margin:0 0 18px;font-size:28px;">${escapeHtml(str(props.title))}</h2><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">${["days", "hours", "minutes", "seconds"].map((label) => `<div style="min-width:78px;border-radius:12px;background:${str(props.accentColor, "#f97316")};padding:14px;"><strong style="display:block;font-size:28px;">--</strong><span style="font-size:12px;text-transform:uppercase;">${label}</span></div>`).join("")}</div></section>`;
    case "video":
      return `<section ${attrs} style="padding:32px;"><div style="aspect-ratio:${str(props.aspectRatio, "16/9")};border-radius:${num(props.borderRadius, 8)}px;overflow:hidden;background:#0f172a;display:flex;align-items:center;justify-content:center;color:#fff;"><a href="${escapeAttr(str(props.url, "#"))}" style="color:#fff;text-decoration:none;font-weight:700;">Open video</a></div></section>`;
    case "form_capture":
      return `<section ${attrs} style="padding:32px;"><form style="max-width:560px;margin:0 auto;background:${str(props.bgColor, "#ffffff")};border-radius:${num(props.borderRadius, 12)}px;padding:28px;border:1px solid #e5e7eb;"><h2 style="margin:0 0 8px;color:#0f172a;">${escapeHtml(str(props.title))}</h2><p style="margin:0 0 20px;color:#64748b;">${escapeHtml(str(props.subtitle))}</p>${formFieldsHtml(props.fields)}<button type="button" style="width:100%;border:0;border-radius:10px;background:${str(props.submitColor, "#16a34a")};color:#fff;padding:14px 18px;font-weight:700;">${escapeHtml(str(props.submitLabel, "Submit"))}</button></form></section>`;
    case "columns":
      return `<section ${attrs} style="padding:32px;"><div style="display:grid;grid-template-columns:repeat(${num(props.columns, 2)},minmax(0,1fr));gap:${num(props.gap, 24)}px;"><div style="min-height:120px;border:1px dashed #cbd5e1;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#94a3b8;">Column 1</div><div style="min-height:120px;border:1px dashed #cbd5e1;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#94a3b8;">Column 2</div></div></section>`;
    default:
      return `<section ${attrs} style="padding:32px;border:1px solid #e5e7eb;"><strong>${escapeHtml(b.label ?? b.type)}</strong></section>`;
  }
}

function renderOnlookAttrs(block: EditorBlock): string {
  return [
    `${ONLOOK_ATTRIBUTES.DATA_ONLOOK_ID}="${escapeAttr(block.oid ?? block.id)}"`,
    `${ONLOOK_ATTRIBUTES.DATA_ONLOOK_INSTANCE_ID}="${escapeAttr(block.instanceId ?? block.id)}"`,
    `${ONLOOK_ATTRIBUTES.DATA_ONLOOK_DOM_ID}="${escapeAttr(block.domId ?? block.id)}"`,
    `${ONLOOK_ATTRIBUTES.DATA_ONLOOK_COMPONENT_NAME}="${escapeAttr(block.componentName ?? block.type)}"`,
  ].join(" ");
}

function styleBg(props: Record<string, unknown>): string {
  const image = str(props.bgImage);
  if (image) {
    return `linear-gradient(rgba(0,0,0,${num(props.overlayOpacity, 0.5)}),rgba(0,0,0,${num(props.overlayOpacity, 0.5)})),url('${escapeAttr(image)}') center/cover`;
  }
  return str(props.bgColor, "#0f172a");
}

function heroTextColor(props: Record<string, unknown>): string {
  return str(props.bgImage) || str(props.bgColor) !== "#ffffff" ? "#ffffff" : "#0f172a";
}

function heroSubTextColor(props: Record<string, unknown>): string {
  return str(props.bgImage) || str(props.bgColor) !== "#ffffff" ? "rgba(255,255,255,.85)" : "#475569";
}

function imageWidth(width: string): string {
  const widths: Record<string, string> = {
    full: "100%",
    large: "80%",
    medium: "60%",
    small: "40%",
  };
  return widths[width] ?? "100%";
}

function buttonPadding(size: string): string {
  const sizes: Record<string, string> = {
    sm: "8px 16px",
    md: "12px 24px",
    lg: "16px 32px",
  };
  return sizes[size] ?? sizes.md;
}

function formFieldsHtml(value: unknown): string {
  if (!Array.isArray(value)) return "";

  return value.map((field) => {
    if (!field || typeof field !== "object") return "";
    const item = field as { label?: unknown; type?: unknown; required?: unknown };
    const type = str(item.type, "text") === "phone" ? "tel" : str(item.type, "text");
    return `<label style="display:block;margin-bottom:14px;"><span style="display:block;font-size:13px;color:#334155;margin-bottom:6px;">${escapeHtml(str(item.label, "Field"))}</span><input type="${escapeAttr(type)}" ${item.required ? "required" : ""} style="width:100%;border:1px solid #cbd5e1;border-radius:10px;padding:12px 14px;" /></label>`;
  }).join("");
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}
