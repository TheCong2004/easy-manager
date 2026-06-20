"use client";
import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { BlockType, PALETTE_CATEGORIES, DND_TYPES, PaletteDragItem, EditorBlock } from "./types";
import { BLOCK_ICONS, getCategoryPresets, PaletteItem } from "./presets/CategoryPresets";

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero Section",
  text: "Văn bản",
  image: "Hình ảnh",
  button: "Nút CTA",
  spacer: "Khoảng cách",
  divider: "Đường kẻ",
  columns: "Bố cục cột",
  feature_card: "Feature Card",
  testimonial: "Nhận xét",
  countdown: "Đếm ngược",
  video: "Video",
  form_capture: "Thu thập leads",
  chat_widget: "Chat widget",
  funnel_popup: "Funnel popup",
  tea_landing: "Herb Tea Page",
  smartwatch_landing: "Smartwatch Page",
  gallery: "Gallery",
  box: "Hình hộp",
  icon: "Biểu tượng",
  product_card: "Sản phẩm mẫu",
  collection_list: "Collection List",
  carousel: "Carousel",
  tabs: "Tabs",
  frame: "Frame",
  accordion: "Accordion",
  table: "Table",
  survey: "Survey",
  menu: "Menu",
  html_code: "Mã HTML",
};

const LAYER_CHILDREN: Partial<Record<BlockType, string[]>> = {
  hero: ["Headline", "Subheadline", "CTA Button"],
  text: ["Text"],
  image: ["Image", "Caption"],
  button: ["Button Label"],
  columns: ["Column 1", "Column 2"],
  feature_card: ["Icon", "Title", "Description"],
  testimonial: ["Quote", "Author", "Rating"],
  countdown: ["Title", "Timer Units"],
  video: ["Embed"],
  form_capture: ["Title", "Fields", "Submit Button"],
  chat_widget: ["Header", "Agent", "Channels", "Survey"],
  funnel_popup: ["Trigger", "Content", "CTA", "Frequency"],
  tea_landing: ["Navigation", "Hero", "Blends", "Ingredients", "Reviews", "Signup"],
  smartwatch_landing: ["Header", "Hero", "Specs Card", "Countdown", "Reviews", "Order Form"],
};

// ── Layers Panel Item (Light Theme) ─────────────────────────────────────────
const LayerItem: React.FC<{
  block: EditorBlock;
  isSelected: boolean;
  index: number;
  onSelect: () => void;
  onDelete: (id: string) => void;
}> = ({ block, isSelected, index, onSelect, onDelete }) => {
  const children = LAYER_CHILDREN[block.type] ?? [];

  return (
    <div className="text-gray-800">
      <button
        onClick={onSelect}
        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-left transition border group ${
          isSelected
            ? "bg-purple-50 text-purple-750 border-purple-200 font-semibold shadow-sm"
            : "text-gray-650 hover:bg-gray-50 border-transparent"
        }`}
      >
        <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-sm border ${isSelected ? "border-purple-300 bg-purple-100" : "border-gray-300 bg-white"}`} />
        <span className="text-gray-400 flex-shrink-0 w-4 h-4 group-hover:text-purple-600 transition">{BLOCK_ICONS[block.type]}</span>
        <span className="flex-1 truncate text-xs">
          {block.label || BLOCK_LABELS[block.type]}
        </span>
        <span className="text-[9px] text-gray-400 font-mono font-bold bg-gray-100 px-1 rounded">{index + 1}</span>
        <span
          onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition ml-1"
          role="button"
          tabIndex={0}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      </button>

      {children.length > 0 && (
        <div className="ml-7 mt-1 space-y-1 border-l border-gray-200 pl-3">
          {children.map((child) => (
            <button
              key={`${block.id}-${child}`}
              onClick={onSelect}
              className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-[11px] text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
            >
              <span className="h-2.5 w-2.5 rounded-[3px] border border-gray-300 bg-white" />
              <span className="truncate font-medium">{child}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Left Panel (Light Theme) ───────────────────────────────────────────
interface LayersPanelProps {
  blocks: EditorBlock[];
  selectedId: string | null;
  onSelectBlock: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
  onAddBlock: (blockType: BlockType, customProps?: Record<string, unknown>) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  blocks,
  selectedId,
  onSelectBlock,
  onDeleteBlock,
  onAddBlock,
}) => {
  const [tab, setTab] = useState<"layers" | "components">("components");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("text");

  const categoryIcons: Record<string, React.ReactNode> = {
    text: BLOCK_ICONS.text,
    button: BLOCK_ICONS.button,
    image: BLOCK_ICONS.image,
    gallery: BLOCK_ICONS.gallery,
    box: BLOCK_ICONS.box,
    icon: BLOCK_ICONS.icon,
    divider: BLOCK_ICONS.divider,
    form: BLOCK_ICONS.form_capture,
    product: BLOCK_ICONS.product_card,
    video: BLOCK_ICONS.video,
    collection: BLOCK_ICONS.collection_list,
    carousel: BLOCK_ICONS.carousel,
    tabs: BLOCK_ICONS.tabs,
    frame: BLOCK_ICONS.frame,
    accordion: BLOCK_ICONS.accordion,
    table: BLOCK_ICONS.table,
    survey: BLOCK_ICONS.survey,
    menu: BLOCK_ICONS.menu,
    html: BLOCK_ICONS.html_code,
  };

  const renderCategoryContent = (category: string, q: string) => {
    const query = q.trim().toLowerCase();
    const items = getCategoryPresets(category);

    const filtered = query
      ? items.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            item.sub.toLowerCase().includes(query)
        )
      : items;

    if (filtered.length === 0) {
      return (
        <div className="text-center py-8 text-xs text-gray-400 font-medium">
          Không tìm thấy phần tử phù hợp
        </div>
      );
    }

    return filtered.map((item) => (
      <div
        key={item.id}
        onClick={() => onAddBlock(item.blockType, item.props)}
        className="group flex flex-col gap-1.5 rounded-xl border border-gray-200 bg-gray-50 p-2.5 hover:border-purple-500 hover:bg-purple-50/20 transition duration-150 cursor-pointer select-none shadow-sm"
        title="Click để chèn vào cuối trang"
      >
        <div className="w-full pointer-events-none">{item.element}</div>
        <div className="flex items-center justify-between mt-1 select-none">
          <span className="text-[9px] font-extrabold text-gray-700 group-hover:text-purple-750 uppercase tracking-wider truncate max-w-[170px]">
            {item.label}
          </span>
          <span className="text-[9px] text-gray-400 group-hover:text-purple-650 font-black transition">
            + Thêm
          </span>
        </div>
      </div>
    ));
  };

  return (
    <div className="w-full flex flex-col bg-white h-full overflow-hidden border-r border-gray-200">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0 px-3 pt-2">
        {(["components", "layers"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`cursor-pointer flex-1 rounded-t-md py-2.5 text-[11px] font-bold tracking-wider transition uppercase ${
              tab === t
                ? "bg-white text-purple-700 shadow-[inset_0_-2px_0_#8b5cf6]"
                : "text-gray-550 hover:text-gray-800"
            }`}
          >
            {t === "components" ? "Thêm phần tử" : "Quản lý Layers"}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {tab === "components" ? (
          <>
            {/* Split panel: Left Sub-sidebar for element categories */}
            <div className="w-[100px] bg-gray-50 border-r border-gray-200 flex flex-col py-2 flex-shrink-0 select-none overflow-y-auto no-scrollbar">
              {([
                "text", "button", "image", "gallery", "box", "icon", "divider", "form",
                "product", "video", "collection", "carousel", "tabs", "frame", "accordion",
                "table", "survey", "menu", "html"
              ] as const).map((catId) => {
                const labelMap: Record<string, string> = {
                  text: "Văn bản",
                  button: "Nút bấm",
                  image: "Ảnh",
                  gallery: "Gallery",
                  box: "Hình hộp",
                  icon: "Biểu tượng",
                  divider: "Đường kẻ",
                  form: "Form",
                  product: "Sản phẩm",
                  video: "Video",
                  collection: "Collection",
                  carousel: "Carousel",
                  tabs: "Tabs",
                  frame: "Frame",
                  accordion: "Accordion",
                  table: "Table",
                  survey: "Survey",
                  menu: "Menu",
                  html: "Mã HTML",
                };
                const isActive = activeCategory === catId;
                return (
                  <button
                    key={catId}
                    onClick={() => setActiveCategory(catId)}
                    className={`w-full py-3.5 px-1 flex flex-col items-center gap-1.5 transition-all text-center border-l-2 cursor-pointer ${
                      isActive
                        ? "bg-white text-purple-600 border-purple-500 font-bold"
                        : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/70"
                    }`}
                  >
                    <span className="flex-shrink-0 transition">{categoryIcons[catId]}</span>
                    <span className="text-[9px] tracking-wide uppercase font-bold truncate max-w-[80px]">{labelMap[catId]}</span>
                  </button>
                );
              })}
            </div>

            {/* Split panel: Right Content for element options */}
            <div className="flex-1 bg-white p-3 overflow-y-auto flex flex-col gap-3">
              {/* Active category search box */}
              <div className="relative flex-shrink-0">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-gray-250 bg-gray-50 py-1.5 pl-8 pr-3 text-xs text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:outline-none shadow-inner"
                />
              </div>

              <div className="flex-1 flex flex-col gap-2.5">
                {renderCategoryContent(activeCategory, search)}
              </div>
            </div>
          </>
        ) : (
          /* Layers tab - single scrollable column list of existing blocks */
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 bg-white">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                </svg>
                <p className="text-xs text-gray-400 font-bold">Chưa có block nào trên canvas.</p>
                <p className="text-[10px] text-gray-450 mt-1 max-w-[160px] leading-relaxed">Hãy thêm khối từ bảng phần tử bên trái.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {blocks.map((block, i) => (
                  <LayerItem
                    key={block.id}
                    block={block}
                    isSelected={selectedId === block.id}
                    index={i}
                    onSelect={() => onSelectBlock(block.id)}
                    onDelete={onDeleteBlock}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
