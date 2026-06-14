"use client";
import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { BlockType, PALETTE_CATEGORIES, DND_TYPES, PaletteDragItem, EditorBlock } from "./types";

// ── Palette block icon map ──────────────────────────────────
const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
  hero: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M21 3H3m18 9H3" />
    </svg>
  ),
  text: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
  ),
  image: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  button: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
    </svg>
  ),
  spacer: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75M3 18h14.25M17.25 18.75V9.75m0 9l2.25-2.25M17.25 18.75l-2.25-2.25M17.25 9.75l2.25 2.25m-2.25-2.25l-2.25 2.25" />
    </svg>
  ),
  divider: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.499 11.998h15" />
    </svg>
  ),
  columns: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  feature_card: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  testimonial: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  countdown: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  video: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
  ),
  form_capture: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

const BLOCK_LABELS: Record<BlockType, string> = {
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
};

// ── Draggable Palette Item ────────────────────────────────────
const PaletteItem: React.FC<{
  blockType: BlockType;
  onClickAdd: (bt: BlockType) => void;
}> = ({ blockType, onClickAdd }) => {
  const [{ isDragging }, drag] = useDrag<PaletteDragItem, unknown, { isDragging: boolean }>({
    type: DND_TYPES.PALETTE_BLOCK,
    item: { type: DND_TYPES.PALETTE_BLOCK, blockType },
    collect: (m) => ({ isDragging: m.isDragging() }),
  });

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      onClick={() => onClickAdd(blockType)}
      title={`Kéo hoặc click để thêm ${BLOCK_LABELS[blockType]}`}
      className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-grab active:cursor-grabbing transition-all select-none ${
        isDragging
          ? "border-purple-500 bg-purple-900/30 opacity-50"
          : "border-gray-700/50 hover:border-purple-500/60 hover:bg-purple-600/10"
      }`}
    >
      <span className="text-gray-400 flex-shrink-0">{BLOCK_ICONS[blockType]}</span>
      <span className="text-xs font-medium text-gray-300 truncate">{BLOCK_LABELS[blockType]}</span>
    </div>
  );
};

// ── Layers Panel Item ─────────────────────────────────────────
const LayerItem: React.FC<{
  block: EditorBlock;
  isSelected: boolean;
  index: number;
  onSelect: () => void;
  onDelete: (id: string) => void;
}> = ({ block, isSelected, index, onSelect, onDelete }) => (
  <button
    onClick={onSelect}
    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition group ${
      isSelected
        ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
        : "text-gray-400 hover:bg-white/5 border border-transparent"
    }`}
  >
    <span className="text-gray-500 flex-shrink-0 w-4 h-4">{BLOCK_ICONS[block.type]}</span>
    <span className="flex-1 truncate text-xs">
      {block.label || BLOCK_LABELS[block.type]}
    </span>
    <span className="text-[10px] text-gray-600 font-mono">{index + 1}</span>
    <button
      onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition ml-1"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </button>
);

// ── Main Left Panel ───────────────────────────────────────────
interface LayersPanelProps {
  blocks: EditorBlock[];
  selectedId: string | null;
  onSelectBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onAddBlock: (blockType: BlockType) => void;
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
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(["layout", "typography", "cta"])
  );

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    layout: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
    typography: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>,
    media: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" /></svg>,
    cta: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672z" /></svg>,
    social: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
  };

  return (
    <div className="w-60 flex-shrink-0 flex flex-col bg-[#111118] border-r border-gray-800/80 h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-800/80 flex-shrink-0">
        {(["components", "layers"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[11px] font-semibold tracking-wide transition uppercase ${
              tab === t
                ? "text-purple-400 border-b-2 border-purple-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t === "components" ? "Components" : "Layers"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {tab === "components" ? (
          <>
            {/* Search */}
            <div className="relative mb-2">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm component..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/5 border border-gray-700/50 rounded-lg text-gray-300 placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Categories */}
            {PALETTE_CATEGORIES.map((cat) => {
              const filtered = search
                ? cat.blocks.filter((bt) =>
                    BLOCK_LABELS[bt].toLowerCase().includes(search.toLowerCase())
                  )
                : cat.blocks;
              if (filtered.length === 0) return null;
              const isOpen = openCategories.has(cat.id);

              return (
                <div key={cat.id}>
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center justify-between px-1 py-1.5 mb-1 text-[10px] font-bold text-gray-500 tracking-widest uppercase hover:text-gray-400 transition"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600">{categoryIcons[cat.id]}</span>
                      {cat.label}
                    </div>
                    <svg
                      className={`w-3 h-3 transition-transform ${isOpen ? "rotate-90" : ""}`}
                      fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="grid grid-cols-1 gap-1 mb-2">
                      {filtered.map((bt) => (
                        <PaletteItem key={bt} blockType={bt} onClickAdd={onAddBlock} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Tip */}
            <div className="mt-4 p-2.5 rounded-lg bg-purple-900/20 border border-purple-800/40">
              <p className="text-[10px] text-purple-400/80 leading-relaxed">
                💡 <strong>Kéo</strong> component vào canvas hoặc <strong>click</strong> để thêm vào cuối trang
              </p>
            </div>
          </>
        ) : (
          /* Layers tab */
          <>
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="w-10 h-10 text-gray-700 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                </svg>
                <p className="text-xs text-gray-600">Chưa có block nào.<br/>Thêm từ tab Components.</p>
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
          </>
        )}
      </div>
    </div>
  );
};
