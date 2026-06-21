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
    case "chat_widget":
      return renderSupportChatWidgetHtml(attrs, props);
    case "funnel_popup":
      return renderFunnelPopupHtml(attrs, props);
    case "tea_landing":
      return renderTeaLandingHtml(attrs, props);
    case "columns": {
      const cols = Array.isArray(props.children) ? (props.children as EditorBlock[][]) : [[], []];
      const colsHtml = cols.map((colBlocks) => {
        const colContent = colBlocks.map(renderBlockHtml).join("\n");
        return `<div style="display:flex;flex-direction:column;gap:12px;min-height:48px;">${colContent}</div>`;
      }).join("");
      return `<section ${attrs} style="padding:32px;"><div style="display:grid;grid-template-columns:repeat(${num(props.columns, 2)},minmax(0,1fr));gap:${num(props.gap, 24)}px;">${colsHtml}</div></section>`;
    }
    case "product_section":
    case "form_section":
    case "footer":
    case "custom_section":
    case "box": {
      const shadowClass = props.shadow === "sm" ? "rgba(0,0,0,0.05) 0px 1px 2px 0px" : props.shadow === "md" ? "rgba(0,0,0,0.1) 0px 4px 6px -1px" : props.shadow === "lg" ? "rgba(0,0,0,0.1) 0px 10px 15px -3px" : "none";
      const borderStyle = num(props.borderWidth, 0) > 0 ? `border:${num(props.borderWidth, 0)}px solid ${str(props.borderColor, "#e5e7eb")};` : "";
      const childrenHtml = (block.children || []).map(renderBlockHtml).join("\n");
      const tag = b.type === "box" ? "div" : "section";
      
      const containerStyle = [
        `background-color:${str(props.bgColor, "transparent")}`,
        borderStyle,
        `border-radius:${num(props.borderRadius, 0)}px`,
        `padding:${num(props.paddingY, 16)}px ${num(props.paddingX, 16)}px`,
        `box-shadow:${shadowClass}`,
      ].filter(Boolean).join(";");

      return `<${tag} ${attrs} style="${containerStyle}">` +
        (props.title ? `<h4 style="margin:0 0 4px;font-size:16px;font-weight:750;color:#1f2937;">${escapeHtml(str(props.title))}</h4>` : "") +
        (props.description ? `<p style="margin:0 0 12px;font-size:14px;color:#6b7280;">${escapeHtml(str(props.description))}</p>` : "") +
        childrenHtml +
        `</${tag}>`;
    }
    default:
      return `<section ${attrs} style="padding:32px;border:1px solid #e5e7eb;"><strong>${escapeHtml(b.label ?? b.type)}</strong></section>`;
  }
}

function renderSupportChatWidgetHtml(attrs: string, props: Record<string, unknown>): string {
  const accent = str(props.accentColor, "#111827");
  const visual = "/images/landing/support-ai-section.png";
  const isLeft = str(props.position, "right") === "left";
  const visualOrder = isLeft ? 2 : 1;
  const cardOrder = isLeft ? 1 : 2;

  return `<section ${attrs} style="padding:40px 18px;background:#f7f8fb;font-family:Inter,Arial,sans-serif;font-size:13px;color:#0f172a;"><div style="max-width:1024px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:24px;align-items:center;"><div style="order:${visualOrder};overflow:hidden;border:1px solid #e2e8f0;border-radius:20px;background:#fff;box-shadow:0 18px 55px rgba(15,23,42,.10);"><div style="position:relative;aspect-ratio:16/10;background:#f1f5f9;"><img src="${visual}" alt="AI support workspace" style="width:100%;height:100%;object-fit:cover;" /><div style="position:absolute;left:0;right:0;bottom:0;border-top:1px solid #e2e8f0;background:rgba(255,255,255,.92);padding:12px;"><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;"><span style="border:1px solid #e2e8f0;border-radius:12px;background:#fff;padding:8px 6px;text-align:center;font-size:11px;line-height:1.15;font-weight:800;color:#334155;">Lead</span><span style="border:1px solid #e2e8f0;border-radius:12px;background:#fff;padding:8px 6px;text-align:center;font-size:11px;line-height:1.15;font-weight:800;color:#334155;">Course</span><span style="border:1px solid #e2e8f0;border-radius:12px;background:#fff;padding:8px 6px;text-align:center;font-size:11px;line-height:1.15;font-weight:800;color:#334155;">Support</span></div></div></div></div><div style="order:${cardOrder};width:100%;overflow:hidden;border:1px solid #e2e8f0;border-radius:20px;background:${str(props.bgColor, "#ffffff")};box-shadow:0 18px 50px rgba(15,23,42,.14);"><div style="padding:22px;color:#fff;background:${accent};"><div style="display:flex;gap:12px;align-items:flex-start;"><div style="width:44px;height:44px;flex:0 0 44px;border-radius:999px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;">LC</div><div style="min-width:0;"><h3 style="margin:0;font-size:20px;line-height:1.15;font-weight:900;">${escapeHtml(str(props.title, "LadiChat"))}</h3><p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,.78);font-weight:700;">${escapeHtml(str(props.replyTime, "Reply in a few minutes"))}</p></div></div><p style="margin:20px 0 0;font-size:13px;line-height:1.65;color:rgba(255,255,255,.9);">${escapeHtml(str(props.greeting))}</p></div><div style="padding:20px;"><div style="display:flex;align-items:center;gap:12px;border-radius:14px;background:#f8fafc;border:1px solid #f1f5f9;padding:12px;"><div style="width:40px;height:40px;flex:0 0 40px;border-radius:999px;background:#e2e8f0;"></div><div style="min-width:0;"><strong style="display:block;color:#0f172a;font-size:13px;line-height:1.25;">${escapeHtml(str(props.agentName, "Advisor"))}</strong><span style="font-size:12px;color:#64748b;font-weight:700;">Online</span></div></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:8px;margin-top:16px;"><button style="min-height:40px;border:1px solid #cbd5e1;background:#fff;border-radius:12px;padding:10px;font-size:13px;line-height:1.2;font-weight:800;color:#334155;">${escapeHtml(str(props.primaryChannel, "Chat now"))}</button><button style="min-height:40px;border:1px solid #cbd5e1;background:#fff;border-radius:12px;padding:10px;font-size:13px;line-height:1.2;font-weight:800;color:#334155;">${escapeHtml(str(props.secondaryChannel, "Zalo"))}</button></div>${props.showSurvey ? `<div style="margin-top:16px;border-radius:14px;background:#f8fafc;padding:12px;"><p style="margin:0 0 8px;font-size:12px;font-weight:800;color:#64748b;">Choose a topic</p><span style="display:inline-block;margin-right:6px;border:1px solid #e2e8f0;border-radius:999px;background:#fff;padding:5px 10px;font-size:11px;font-weight:800;color:#475569;">Consult</span><span style="display:inline-block;margin-right:6px;border:1px solid #e2e8f0;border-radius:999px;background:#fff;padding:5px 10px;font-size:11px;font-weight:800;color:#475569;">Pricing</span><span style="display:inline-block;border:1px solid #e2e8f0;border-radius:999px;background:#fff;padding:5px 10px;font-size:11px;font-weight:800;color:#475569;">Support</span></div>` : ""}<button style="width:100%;min-height:48px;margin-top:16px;border:0;border-radius:12px;padding:13px 16px;background:${accent};color:#fff;font-size:13px;line-height:1.2;font-weight:900;">${escapeHtml(str(props.buttonLabel, "Start chat"))}</button></div></div></div></section>`;
}

function renderChatWidgetHtml(attrs: string, props: Record<string, unknown>): string {
  const accent = str(props.accentColor, "#2511d9");
  const position = str(props.position, "right") === "left" ? "flex-start" : "flex-end";

  return `<section ${attrs} style="padding:42px 32px;background:#f7f8fb;"><div style="max-width:1024px;margin:0 auto;display:flex;justify-content:${position};"><div style="width:380px;max-width:100%;overflow:hidden;border:1px solid #e2e8f0;border-radius:20px;background:${str(props.bgColor, "#ffffff")};box-shadow:0 18px 50px rgba(15,23,42,.16);"><div style="padding:22px;color:#fff;background:linear-gradient(135deg,${accent},#6d5dfc);"><div style="display:flex;gap:12px;align-items:center;"><div style="width:44px;height:44px;border-radius:999px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-weight:900;">LC</div><div><h3 style="margin:0;font-size:20px;">${escapeHtml(str(props.title, "LadiChat hỗ trợ"))}</h3><p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,.78);font-weight:700;">${escapeHtml(str(props.replyTime, "Phản hồi trong vài phút"))}</p></div></div><p style="margin:20px 0 0;font-size:14px;line-height:1.65;color:rgba(255,255,255,.9);">${escapeHtml(str(props.greeting))}</p></div><div style="padding:20px;"><div style="display:flex;align-items:center;gap:12px;border-radius:14px;background:#f8fafc;border:1px solid #f1f5f9;padding:12px;"><div style="width:40px;height:40px;border-radius:999px;background:#d1fae5;"></div><div><strong style="display:block;color:#0f172a;">${escapeHtml(str(props.agentName, "Tư vấn viên"))}</strong><span style="font-size:12px;color:#059669;font-weight:700;">Online</span></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px;"><button style="border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:10px;font-weight:800;color:#334155;">${escapeHtml(str(props.primaryChannel, "Chat ngay"))}</button><button style="border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:10px;font-weight:800;color:#334155;">${escapeHtml(str(props.secondaryChannel, "Zalo"))}</button></div>${props.showSurvey ? `<div style="margin-top:16px;border-radius:14px;background:#f8fafc;padding:12px;"><p style="margin:0 0 8px;font-size:12px;font-weight:800;color:#64748b;">Bạn quan tâm nội dung nào?</p><span style="display:inline-block;margin-right:6px;border-radius:999px;background:#fff;padding:5px 10px;font-size:11px;font-weight:800;color:#475569;">Tư vấn</span><span style="display:inline-block;margin-right:6px;border-radius:999px;background:#fff;padding:5px 10px;font-size:11px;font-weight:800;color:#475569;">Báo giá</span><span style="display:inline-block;border-radius:999px;background:#fff;padding:5px 10px;font-size:11px;font-weight:800;color:#475569;">Hỗ trợ</span></div>` : ""}<button style="width:100%;margin-top:16px;border:0;border-radius:12px;padding:13px 16px;background:${accent};color:#fff;font-weight:900;">${escapeHtml(str(props.buttonLabel, "Bắt đầu trò chuyện"))}</button></div></div></div></section>`;
}

function renderFunnelPopupHtml(attrs: string, props: Record<string, unknown>): string {
  const accent = str(props.accentColor, "#65a30d");
  const image = str(props.imageUrl);

  return `<section ${attrs} data-funnel-trigger="${escapeAttr(str(props.trigger, "exit_intent"))}" data-funnel-value="${num(props.triggerValue, 60)}" data-funnel-frequency="${escapeAttr(str(props.frequency, "session"))}" style="padding:52px 32px;background:${props.showBackdrop ? "rgba(15,23,42,.72)" : "#f8fafc"};"><div style="max-width:780px;margin:0 auto;display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);overflow:hidden;border-radius:22px;background:${str(props.bgColor, "#ffffff")};border:1px solid rgba(255,255,255,.55);box-shadow:0 24px 80px rgba(15,23,42,.24);"><div style="min-height:260px;background:#f1f5f9;">${image ? `<img src="${escapeAttr(image)}" alt="${escapeAttr(str(props.title))}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="height:100%;min-height:260px;display:flex;flex-direction:column;justify-content:flex-end;padding:24px;background:linear-gradient(135deg,#ecfccb,#fff,#f1f5f9);"><span style="width:max-content;border-radius:999px;background:rgba(255,255,255,.82);padding:6px 12px;font-size:11px;font-weight:900;color:#334155;">FunnelX</span><div style="height:96px;margin-top:16px;border-radius:16px;background:rgba(255,255,255,.65);box-shadow:inset 0 2px 16px rgba(15,23,42,.05);"></div></div>`}</div><div style="padding:30px;"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;"><span style="border-radius:999px;background:#f1f5f9;padding:6px 10px;font-size:11px;font-weight:800;color:#475569;">Trigger: ${escapeHtml(str(props.trigger, "exit_intent").replaceAll("_", " "))}</span><span style="border-radius:999px;background:#f1f5f9;padding:6px 10px;font-size:11px;font-weight:800;color:#475569;">Frequency: ${escapeHtml(str(props.frequency, "session"))}</span></div><h2 style="margin:0;color:#020617;font-size:32px;line-height:1.12;font-weight:900;">${escapeHtml(str(props.title))}</h2><p style="margin:14px 0 0;color:#475569;line-height:1.7;font-size:15px;">${escapeHtml(str(props.description))}</p><a href="${escapeAttr(str(props.ctaUrl, "#"))}" style="display:inline-flex;margin-top:24px;border-radius:12px;padding:13px 20px;background:${accent};color:#fff;text-decoration:none;font-weight:900;">${escapeHtml(str(props.ctaText, "Nhận ưu đãi"))}</a></div></div></section>`;
}

function renderTeaLandingHtml(attrs: string, props: Record<string, unknown>): string {
  const accent = str(props.accentColor, "#6f8f22");
  const bg = str(props.bgColor, "#f5f2e7");
  const heroImage = str(props.heroImage, "/images/product/green_tea_product.png");
  const navItems = stringArray(props.navItems, ["Shop", "About", "FAQ", "Contact"]);
  const blends = objectArray(props.blends);
  const ingredients = objectArray(props.ingredients);
  const brewSteps = objectArray(props.brewSteps);

  return `<section ${attrs} style="background:${bg};background-image:linear-gradient(180deg,rgba(255,255,255,.78),rgba(245,242,231,.92));padding:0 18px;"><div style="max-width:980px;margin:0 auto;background:rgba(255,253,245,.96);box-shadow:0 28px 70px rgba(77,64,31,.18);"><header style="display:flex;align-items:center;justify-content:space-between;gap:24px;padding:20px 40px;color:#2f3d1c;"><strong style="font-size:22px;color:#263312;">${escapeHtml(str(props.brand, "Pure Leaf"))}</strong><nav style="display:flex;gap:24px;font-size:12px;font-weight:800;">${navItems.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</nav><span style="border-radius:999px;background:${accent};color:#fff;padding:7px 16px;font-size:11px;font-weight:900;">Sign Up</span></header><div style="position:relative;min-height:460px;overflow:hidden;"><div style="position:absolute;top:0;right:0;bottom:0;width:48%;"><img src="${escapeAttr(heroImage)}" alt="${escapeAttr(str(props.headline))}" style="width:100%;height:100%;object-fit:cover;" /><div style="position:absolute;inset:0;background:linear-gradient(90deg,#fffdf5,rgba(255,253,245,.28),transparent);"></div></div><div style="position:relative;z-index:1;min-height:460px;display:flex;flex-direction:column;justify-content:center;padding:56px 48px;"><h1 style="max-width:430px;margin:0;color:#22310f;font-size:clamp(42px,6vw,70px);line-height:.93;font-weight:950;letter-spacing:0;">${escapeHtml(str(props.headline, "Pure Leaf Organic Green Tea"))}</h1><p style="max-width:360px;margin:18px 0 0;color:#6d754c;font-size:15px;line-height:1.7;font-weight:600;">${escapeHtml(str(props.subheadline))}</p><a href="${escapeAttr(str(props.ctaUrl, "#order"))}" style="width:max-content;margin-top:24px;border-radius:999px;padding:11px 22px;background:${accent};color:#fff;text-decoration:none;font-size:12px;font-weight:950;">${escapeHtml(str(props.ctaText, "Shop Now"))}</a></div></div><section style="display:grid;grid-template-columns:180px 1fr;gap:32px;align-items:center;padding:42px 48px;"><div style="width:96px;height:96px;margin:auto;border-radius:999px;border:1px solid #bfce89;background:#f3f8df;"></div><div><h2 style="margin:0;color:#263312;font-size:26px;font-weight:950;">${escapeHtml(str(props.philosophyTitle, "Our Philosophy"))}</h2><p style="margin:10px 0 0;color:#677047;line-height:1.7;font-size:14px;">${escapeHtml(str(props.philosophyText))}</p></div></section><section style="padding:0 48px 42px;text-align:center;"><h2 style="margin:0;color:#263312;font-size:34px;font-weight:950;">Our Blends</h2><p style="margin:6px 0 0;color:#8a915f;font-size:12px;font-weight:900;text-transform:uppercase;">Revitalize your mind and body, naturally.</p><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin-top:28px;">${blends.map((item) => `<article style="border:1px solid #d7dfad;border-radius:16px;background:#fff;padding:22px;box-shadow:0 2px 8px rgba(15,23,42,.04);"><div style="width:80px;height:80px;margin:0 auto 14px;border-radius:999px;background:#eef6d8;"></div><h3 style="margin:0;color:#2b3618;font-size:17px;font-weight:950;">${escapeHtml(str(item.name))}</h3><p style="min-height:40px;margin:9px 0 0;color:#77805a;font-size:12px;line-height:1.6;">${escapeHtml(str(item.description))}</p><button style="margin-top:16px;border:0;border-radius:999px;background:#7d8f2a;color:#fff;padding:7px 15px;font-size:10px;font-weight:950;">View Blend</button></article>`).join("")}</div></section><section style="display:grid;grid-template-columns:1.1fr .9fr;gap:34px;background:#fbfaf2;padding:42px 48px;"><div><h2 style="margin:0;color:#263312;font-size:26px;font-weight:950;">Pure & Natural Ingredients</h2><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:24px;text-align:center;">${ingredients.map((item) => `<div><div style="width:64px;height:64px;margin:0 auto 9px;border-radius:999px;background:#eef6d8;"></div><h3 style="margin:0;color:#2b3618;font-size:14px;font-weight:950;">${escapeHtml(str(item.name))}</h3><p style="margin:5px 0 0;color:#77805a;font-size:10px;line-height:1.6;">${escapeHtml(str(item.description))}</p></div>`).join("")}</div></div><aside style="display:grid;gap:18px;"><div style="border:1px solid #d9e3b6;border-radius:18px;background:#fff;padding:20px;"><h3 style="margin:0 0 16px;color:#263312;font-size:19px;font-weight:950;">The Perfect Brew</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center;">${brewSteps.map((step) => `<div><strong style="display:block;color:${accent};font-size:15px;">${escapeHtml(str(step.value))}</strong><span style="display:block;margin-top:4px;color:#77805a;font-size:10px;">${escapeHtml(str(step.label))}</span></div>`).join("")}</div></div><div style="border:1px solid #d9e3b6;border-radius:18px;background:#fff;padding:20px;"><h3 style="margin:0;color:#263312;font-size:19px;font-weight:950;">Customer Reviews</h3><div style="margin-top:12px;color:#f5a623;">*****</div><p style="margin:10px 0 0;color:#58603c;line-height:1.65;font-size:14px;">${escapeHtml(str(props.reviewQuote))}</p><strong style="display:block;margin-top:12px;color:#263312;font-size:12px;">${escapeHtml(str(props.reviewAuthor))}</strong></div></aside></section><section style="padding:42px 48px;text-align:center;"><h2 style="margin:0;color:#263312;font-size:26px;font-weight:950;">${escapeHtml(str(props.signupTitle, "Join Our Community"))}</h2><form style="display:flex;max-width:440px;margin:20px auto 0;border:1px solid #d4dfaa;background:#fff;border-radius:999px;padding:4px;"><input placeholder="${escapeAttr(str(props.signupPlaceholder, "Your email address"))}" style="flex:1;border:0;outline:0;padding:10px 16px;border-radius:999px;color:#6b7280;" /><button type="button" style="border:0;border-radius:999px;background:${accent};color:#fff;padding:10px 20px;font-weight:950;">${escapeHtml(str(props.signupButton, "Subscribe"))}</button></form></section></div></section>`;
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

function stringArray(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : fallback;
}

function objectArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : [];
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
