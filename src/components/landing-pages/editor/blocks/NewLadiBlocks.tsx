"use client";
import React, { useState } from "react";
import {
  GalleryProps, BoxProps, IconProps, ProductCardProps, CollectionListProps,
  CarouselProps, TabsProps, FrameProps, AccordionProps, TableProps,
  SurveyProps, MenuProps, HtmlCodeProps
} from "../types";

// ── Gallery Block ─────────────────────────────────────────────
export const GalleryBlock: React.FC<{ props: GalleryProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { images, columns, gap, borderRadius, aspectRatio } = props;
  const aspectClass = aspectRatio === "1/1" ? "aspect-square" : aspectRatio === "16/9" ? "aspect-video" : aspectRatio === "4/3" ? "aspect-[4/3]" : "aspect-auto";

  return (
    <div
      onClick={onSelect}
      className={`relative w-full p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${columns > 2 ? 120 : 160}px), 1fr))`,
          gap: `${gap}px`
        }}
      >
        {images.map((img, i) => (
          <div key={i} className={`overflow-hidden bg-gray-900 border border-gray-800 ${aspectClass}`} style={{ borderRadius }}>
            <img src={img} alt={`Gallery item ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          GALLERY
        </div>
      )}
    </div>
  );
};

// ── Box Block ─────────────────────────────────────────────────
export const BoxBlock: React.FC<{ props: BoxProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { bgColor, borderColor, borderWidth, borderRadius, paddingX, paddingY, shadow, title, description } = props;
  const shadowClass = shadow === "sm" ? "shadow-sm" : shadow === "md" ? "shadow-md" : shadow === "lg" ? "shadow-lg" : "shadow-none";

  return (
    <div
      onClick={onSelect}
      className={`relative w-full p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div
        className={`w-full transition-all ${shadowClass}`}
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderWidth: `${borderWidth}px`,
          borderStyle: borderWidth > 0 ? "solid" : "none",
          borderRadius: `${borderRadius}px`,
          padding: `${paddingY}px ${paddingX}px`
        }}
      >
        {title && <h4 className="text-sm font-bold text-gray-800 mb-1">{title}</h4>}
        {description && <p className="text-xs text-gray-500 leading-relaxed">{description}</p>}
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          BOX / CONTAINER
        </div>
      )}
    </div>
  );
};

// ── Icon Block ────────────────────────────────────────────────
export const IconBlock: React.FC<{ props: IconProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { icon, size, color, bgColor, borderRadius, align } = props;
  const alignClass = align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";

  return (
    <div
      onClick={onSelect}
      className={`relative w-full p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div className={`flex w-full ${alignClass}`}>
        <div
          className="flex items-center justify-center transition-transform hover:scale-110"
          style={{
            width: `${size * 1.5}px`,
            height: `${size * 1.5}px`,
            backgroundColor: bgColor,
            color: color,
            borderRadius: `${borderRadius}px`,
            fontSize: `${size}px`
          }}
        >
          {icon}
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          ICON
        </div>
      )}
    </div>
  );
};

// ── Product Card Block ────────────────────────────────────────
export const ProductCardBlock: React.FC<{ props: ProductCardProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { title, description, price, oldPrice, image, badge, ctaText, bgColor, borderColor, borderRadius, items, columns = 1 } = props;

  // Helper to render a single product card layout
  const renderProductItem = (itemTitle: string, itemDesc: string, itemPrice: string, itemOldPrice?: string, itemImage?: string, itemBadge?: string) => (
    <div
      className="overflow-hidden border border-gray-200 shadow-md flex flex-col h-full bg-white rounded-xl hover:shadow-lg transition-shadow duration-200"
      style={{ borderColor, borderRadius }}
    >
      <div className="relative aspect-square w-full bg-gray-50">
        <img src={itemImage || image} alt={itemTitle} className="w-full h-full object-cover" />
        {itemBadge && (
          <span className="absolute top-2.5 left-2.5 bg-slate-950 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
            {itemBadge}
          </span>
        )}
      </div>
      <div className="p-3.5 flex flex-col flex-1">
        <div className="flex items-center gap-0.5 mb-1">
          {Array.from({ length: 5 }).map((_, idx) => (
            <span key={idx} className="text-slate-400 text-[10px]">★</span>
          ))}
          <span className="text-[9px] text-gray-400 font-medium ml-1">(95 đánh giá)</span>
        </div>
        <h3 className="text-xs font-bold text-gray-800 line-clamp-1">{itemTitle}</h3>
        {itemDesc && <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5 mb-2 leading-normal">{itemDesc}</p>}
        <div className="flex items-baseline gap-1.5 mt-auto">
          <span className="text-xs font-black text-slate-950">{itemPrice}</span>
          {itemOldPrice && <span className="text-[9px] text-gray-400 line-through">{itemOldPrice}</span>}
        </div>
        <button className="mt-2.5 min-h-10 w-full rounded-lg bg-slate-950 px-3 py-2 text-[11px] font-bold leading-tight text-white shadow-sm transition duration-155 hover:bg-slate-800">
          {ctaText || "MUA NGAY"}
        </button>
      </div>
    </div>
  );

  const hasGridItems = Array.isArray(items) && items.length > 0;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
      style={{ backgroundColor: bgColor }}
    >
      {hasGridItems ? (
        <div
          className="grid gap-4 w-full"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${columns > 2 ? 170 : 220}px), 1fr))`,
          }}
        >
          {items.map((item) => (
            <div key={item.id} className="w-full">
              {renderProductItem(item.title, item.description, item.price, item.oldPrice, item.image, item.badge)}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full max-w-sm mx-auto">
          {renderProductItem(title, description, price, oldPrice, image, badge)}
        </div>
      )}
      
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          {hasGridItems ? `PRODUCT GRID (${columns} CỘT)` : "PRODUCT CARD"}
        </div>
      )}
    </div>
  );
};

// ── Collection List Block ─────────────────────────────────────
export const CollectionListBlock: React.FC<{ props: CollectionListProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { items, columns, layout, bgColor } = props;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
      style={{ backgroundColor: bgColor }}
    >
      <div
        className={
          layout === "grid"
            ? "grid gap-4"
            : "flex flex-col gap-3"
        }
        style={
          layout === "grid"
            ? { gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${columns > 2 ? 190 : 240}px), 1fr))` }
            : {}
        }
      >
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3.5 rounded-xl border border-slate-700 bg-slate-900 p-4 transition duration-150 hover:border-slate-500">
            <span className="flex-shrink-0 rounded-lg bg-slate-800 p-2 text-2xl text-white">{item.icon}</span>
            <div className="space-y-0.5">
              <h4 className="text-[13px] font-bold text-white">{item.title}</h4>
              <p className="text-[13px] leading-relaxed text-slate-300">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          COLLECTION
        </div>
      )}
    </div>
  );
};

// ── Carousel Block ────────────────────────────────────────────
export const CarouselBlock: React.FC<{ props: CarouselProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { images, autoplay, interval, showIndicators, showArrows, height } = props;
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => setActiveIndex((idx) => (idx === 0 ? images.length - 1 : idx - 1));
  const next = () => setActiveIndex((idx) => (idx === images.length - 1 ? 0 : idx + 1));

  return (
    <div
      onClick={onSelect}
      className={`relative w-full p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div className="relative w-full overflow-hidden rounded-2xl bg-gray-900 border border-gray-800" style={{ height: `${height}px` }}>
        <img src={images[activeIndex]} alt="Carousel slide" className="w-full h-full object-cover transition-opacity duration-300" />
        
        {showArrows && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-sm font-bold z-10 transition"
            >
              ⟨
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-sm font-bold z-10 transition"
            >
              ⟩
            </button>
          </>
        )}

        {showIndicators && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${activeIndex === i ? "bg-white w-3" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          CAROUSEL
        </div>
      )}
    </div>
  );
};

// ── Tabs Block ────────────────────────────────────────────────
export const TabsBlock: React.FC<{ props: TabsProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { tabs, accentColor, style } = props;
  const [activeTabId, setActiveTabId] = useState(props.activeTabId || tabs[0]?.id);

  const activeContent = tabs.find((t) => t.id === activeTabId)?.content || "";

  return (
    <div
      onClick={onSelect}
      className={`relative w-full p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div className="w-full rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex gap-2 border-b border-slate-200 pb-2 select-none">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                onClick={(e) => { e.stopPropagation(); setActiveTabId(tab.id); }}
                className={`text-xs font-bold px-3 py-1.5 rounded transition ${
                  style === "underline"
                    ? isActive ? "border-b-2 text-slate-950" : "text-slate-500 hover:text-slate-900"
                    : isActive
                      ? "text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-950"
                }`}
                style={
                  isActive && style !== "underline"
                    ? { backgroundColor: accentColor }
                    : isActive && style === "underline"
                      ? { borderColor: accentColor, color: accentColor }
                      : {}
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <p className="min-h-12 text-[13px] leading-relaxed text-slate-600">{activeContent}</p>
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          TABS
        </div>
      )}
    </div>
  );
};

// ── Frame Block ───────────────────────────────────────────────
export const FrameBlock: React.FC<{ props: FrameProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { url, height, title, browserMockup } = props;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      {browserMockup ? (
        <div className="w-full overflow-hidden border border-white/10 bg-gray-950 rounded-xl shadow-lg" style={{ height: `${height}px` }}>
          <div className="flex items-center gap-1.5 bg-gray-900 px-3 py-2 border-b border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            <div className="flex-1 bg-black/30 border border-white/5 rounded px-2.5 py-0.5 text-[9px] text-gray-500 font-mono truncate max-w-sm mx-auto text-center">
              {url || "https://example.com"}
            </div>
          </div>
          <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center text-xs text-gray-500 bg-gray-950 select-none">
            <svg className="w-8 h-8 text-gray-600 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
            </svg>
            <span className="font-bold text-gray-400">{title || "Browser Frame Mockup"}</span>
            <span className="text-[10px] text-gray-600 mt-1">Nội dung từ {url || "liên kết bên ngoài"}</span>
          </div>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center border border-dashed border-gray-700 bg-gray-900 text-gray-400 rounded-lg text-xs py-10">
          Iframe placeholder ({url})
        </div>
      )}
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          FRAME
        </div>
      )}
    </div>
  );
};

// ── Accordion Block ───────────────────────────────────────────
export const AccordionBlock: React.FC<{ props: AccordionProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { items, accentColor, allowMultiple } = props;
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ [items[0]?.id]: true });

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      if (allowMultiple) {
        return { ...prev, [id]: !prev[id] };
      } else {
        return { [id]: !prev[id] };
      }
    });
  };

  return (
    <div
      onClick={onSelect}
      className={`relative w-full p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div className="w-full space-y-2 select-none">
        {items.map((item) => {
          const isOpen = !!openIds[item.id];
          return (
            <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <button
                onClick={(e) => { e.stopPropagation(); toggle(item.id); }}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-[13px] font-bold text-slate-950 transition hover:bg-slate-50"
              >
                <span>{item.question}</span>
                <span className={`text-[10px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} style={{ color: isOpen ? accentColor : undefined }}>
                  ▼
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50 px-4 pb-3 pt-2 text-[13px] leading-relaxed text-slate-600">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          ACCORDION
        </div>
      )}
    </div>
  );
};

// ── Table Block ───────────────────────────────────────────────
export const TableBlock: React.FC<{ props: TableProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { headers, rows, bgColor, borderColor } = props;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div className="overflow-x-auto w-full rounded-xl border" style={{ borderColor }}>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b bg-slate-50 font-bold text-slate-700" style={{ borderColor }}>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 border-r last:border-r-0" style={{ borderColor }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: bgColor }}>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b last:border-b-0" style={{ borderColor }}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border-r px-4 py-3 text-slate-600 last:border-r-0" style={{ borderColor }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          TABLE
        </div>
      )}
    </div>
  );
};

// ── Survey Block ──────────────────────────────────────────────
export const SurveyBlock: React.FC<{ props: SurveyProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { question, options, accentColor, submitLabel } = props;
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  return (
    <div
      onClick={onSelect}
      className={`relative w-full p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow select-none">
        <h4 className="mb-4 text-center text-[13px] font-bold leading-snug text-slate-950">{question}</h4>
        <div className="space-y-2">
          {options.map((opt, i) => {
            const isChecked = selectedIdx === i;
            return (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setSelectedIdx(i); }}
                className={`w-full flex items-center justify-between text-left text-xs font-semibold px-4 py-3.5 rounded-xl border transition-all ${
                  isChecked
                    ? "border-slate-950 bg-slate-100 text-slate-950"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
                style={isChecked ? { borderColor: accentColor, backgroundColor: `${accentColor}10` } : {}}
              >
                <span>{opt}</span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-black ${
                    isChecked ? "text-white" : "border-gray-600"
                  }`}
                  style={isChecked ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                >
                  {isChecked && "✓"}
                </span>
              </button>
            );
          })}
        </div>
        <button
          className="w-full text-white font-bold text-xs py-3.5 rounded-xl mt-5 shadow-sm transition hover:opacity-90 active:scale-[0.99]"
          style={{ backgroundColor: accentColor || "#65a30d" }}
          onClick={(e) => { e.stopPropagation(); alert("Cảm ơn bạn đã tham gia khảo sát!"); }}
        >
          {submitLabel}
        </button>
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          SURVEY
        </div>
      )}
    </div>
  );
};

// ── Menu Block ────────────────────────────────────────────────
export const MenuBlock: React.FC<{ props: MenuProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { logoText, items, bgColor, textColor } = props;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div
        className="w-full flex items-center justify-between px-6 py-4 shadow-sm border border-gray-150/10"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <span className="font-black text-sm uppercase tracking-wider">{logoText}</span>
        <div className="flex items-center gap-5">
          {items.map((item, idx) => (
            <span key={idx} className="text-xs font-semibold hover:opacity-80 transition cursor-pointer select-none">
              {item.label}
            </span>
          ))}
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          NAVIGATION MENU
        </div>
      )}
    </div>
  );
};

// ── HTML Code Block ───────────────────────────────────────────
export const HtmlCodeBlock: React.FC<{ props: HtmlCodeProps; isSelected: boolean; onSelect: () => void }> = ({ props, isSelected, onSelect }) => {
  const { code, height } = props;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
    >
      <div
        className="w-full overflow-hidden rounded-xl border border-dashed border-gray-700 bg-black/40"
        style={{ minHeight: `${height}px` }}
        dangerouslySetInnerHTML={{ __html: code }}
      />
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          HTML EMBED
        </div>
      )}
    </div>
  );
};
