"use client";
import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { BlockType, PALETTE_CATEGORIES, DND_TYPES, PaletteDragItem, EditorBlock, canNodeHaveChildren } from "./types";
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
  product_section: "Section sản phẩm",
  form_section: "Section biểu mẫu",
  footer: "Footer trang",
  custom_section: "Section tùy chỉnh",
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

// ── Layers Panel Item (Recursive Tree View) ─────────────────────────────────
const LayerItem: React.FC<{
  block: EditorBlock;
  isSelected: boolean;
  selectedId: string | null;
  onSelectBlock: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
  depth?: number;
}> = ({ block, isSelected, selectedId, onSelectBlock, onDeleteBlock, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);

  const columns = block.type === "columns" && Array.isArray(block.props.children)
    ? block.props.children as EditorBlock[][]
    : null;

  const childrenToRender: { block?: EditorBlock; label?: string; isVirtual?: boolean; children?: EditorBlock[] }[] = [];

  if (columns) {
    columns.forEach((col, colIdx) => {
      if (col.length > 0) {
        childrenToRender.push({
          label: `Cột ${colIdx + 1}`,
          isVirtual: true,
          children: col,
        });
      }
    });
  } else if (block.children && block.children.length > 0) {
    block.children.forEach((child) => {
      childrenToRender.push({ block: child });
    });
  }

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="text-gray-800" style={{ marginLeft: depth > 0 ? 6 : 0 }}>
      <div
        onClick={() => onSelectBlock(block.id)}
        className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-left transition border group cursor-pointer ${
          isSelected
            ? "bg-purple-50 text-purple-750 border-purple-200 font-semibold shadow-sm"
            : "text-gray-650 hover:bg-gray-50 border-transparent"
        }`}
      >
        {childrenToRender.length > 0 ? (
          <button
            onClick={toggleOpen}
            className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded transition cursor-pointer"
          >
            <svg
              className={`w-2.5 h-2.5 transform transition-transform ${isOpen ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-4" />
        )}

        <span className="text-gray-400 flex-shrink-0 w-3.5 h-3.5 group-hover:text-purple-600 transition">
          {BLOCK_ICONS[block.type] ?? BLOCK_ICONS.box}
        </span>

        <span className="flex-1 truncate text-xs">
          {block.label || BLOCK_LABELS[block.type] || block.type}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteBlock(block.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition ml-1"
          title="Xóa block"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {isOpen && childrenToRender.length > 0 && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-gray-150 pl-1.5">
          {childrenToRender.map((item, idx) => {
            if (item.isVirtual && item.children) {
              return (
                <div key={idx} className="space-y-0.5">
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 px-2 py-0.5 select-none">
                    {item.label}
                  </div>
                  <div className="ml-1 border-l border-gray-150 pl-1.5">
                    {item.children.map((childBlock) => (
                      <LayerItem
                        key={childBlock.id}
                        block={childBlock}
                        isSelected={selectedId === childBlock.id}
                        selectedId={selectedId}
                        onSelectBlock={onSelectBlock}
                        onDeleteBlock={onDeleteBlock}
                        depth={depth + 1}
                      />
                    ))}
                  </div>
                </div>
              );
            } else if (item.block) {
              return (
                <LayerItem
                  key={item.block.id}
                  block={item.block}
                  isSelected={selectedId === item.block.id}
                  selectedId={selectedId}
                  onSelectBlock={onSelectBlock}
                  onDeleteBlock={onDeleteBlock}
                  depth={depth + 1}
                />
              );
            }
            return null;
          })}
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
    widget: BLOCK_ICONS.chat_widget,
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
        className="group flex cursor-pointer select-none flex-col gap-2 border-b border-gray-200 bg-white px-3 py-3 transition hover:bg-gray-50"
        title="Click để chèn vào cuối trang"
      >
        <div className="w-full pointer-events-none">{item.element}</div>
        <div className="flex items-center justify-between select-none">
          <span className="max-w-[170px] truncate text-[11px] font-extrabold uppercase tracking-wide text-gray-800 group-hover:text-[#2511d9]">
            {item.label}
          </span>
          <span className="text-[11px] font-black text-gray-400 transition group-hover:text-[#2511d9]">
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
            <div className="w-[132px] bg-gray-50 border-r border-gray-200 flex flex-col py-2 flex-shrink-0 select-none overflow-y-auto no-scrollbar">
              {([
                "text", "button", "image", "gallery", "box", "icon", "divider", "form",
                "product", "video", "collection", "carousel", "tabs", "frame", "accordion",
                "table", "survey", "menu", "widget", "html"
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
                  widget: "Widget",
                  html: "Mã HTML",
                };
                const isActive = activeCategory === catId;
                return (
                  <button
                    key={catId}
                    onClick={() => setActiveCategory(catId)}
                    className={`w-full min-h-11 px-3 py-2 flex flex-row items-center justify-start gap-2 transition-all text-left border-l-2 cursor-pointer ${
                      isActive
                        ? "bg-white text-purple-600 border-purple-500 font-bold"
                        : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/70"
                    }`}
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center transition">{categoryIcons[catId]}</span>
                    <span className="min-w-0 truncate text-[12px] font-extrabold">{labelMap[catId]}</span>
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
                {blocks.map((block) => (
                  <LayerItem
                    key={block.id}
                    block={block}
                    isSelected={selectedId === block.id}
                    selectedId={selectedId}
                    onSelectBlock={onSelectBlock}
                    onDeleteBlock={onDeleteBlock}
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
