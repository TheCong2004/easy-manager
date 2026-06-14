"use client";
import React, { useRef } from "react";
import { useDrop, useDrag } from "react-dnd";
import {
  EditorBlock, BlockType, DND_TYPES, PaletteDragItem, CanvasDragItem,
  DeviceMode, DEVICE_WIDTHS,
} from "./types";
import { HeroBlock } from "./blocks/HeroBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ButtonBlock } from "./blocks/ButtonBlock";
import { SpacerBlock, DividerBlock } from "./blocks/SpacerBlock";
import { FeatureCardBlock, TestimonialBlock } from "./blocks/SocialBlocks";
import { CountdownBlock, VideoBlock, FormCaptureBlock } from "./blocks/AdvancedBlocks";

// ── Block Renderer ────────────────────────────────────────────
const BlockRenderer: React.FC<{
  block: EditorBlock;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ block, isSelected, onSelect }) => {
  switch (block.type) {
    case "hero": return <HeroBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "text": return <TextBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "image": return <ImageBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "button": return <ButtonBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "spacer": return <SpacerBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "divider": return <DividerBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "feature_card": return <FeatureCardBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "testimonial": return <TestimonialBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "countdown": return <CountdownBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "video": return <VideoBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "form_capture": return <FormCaptureBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "columns":
      return (
        <div
          onClick={onSelect}
          className={`relative w-full p-4 cursor-pointer transition-all ${
            isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
          }`}
        >
          <div
            className="grid w-full"
            style={{ gridTemplateColumns: `repeat(${block.props.columns}, 1fr)`, gap: block.props.gap }}
          >
            {Array.from({ length: block.props.columns }).map((_, ci) => (
              <div
                key={ci}
                className="min-h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm"
              >
                Cột {ci + 1}
              </div>
            ))}
          </div>
          {isSelected && (
            <div className="absolute top-1 left-1 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
              COLUMNS
            </div>
          )}
        </div>
      );
    default:
      return null;
  }
};

// ── Sortable Block Wrapper (handles canvas reorder drag) ──────
const SortableBlock: React.FC<{
  block: EditorBlock;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}> = ({ block, index, isSelected, onSelect, onMove, onDelete, onDuplicate, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag<CanvasDragItem, unknown, { isDragging: boolean }>({
    type: DND_TYPES.CANVAS_BLOCK,
    item: { type: DND_TYPES.CANVAS_BLOCK, blockId: block.id, index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [{ isOver, canDrop }, drop] = useDrop<CanvasDragItem, unknown, { isOver: boolean; canDrop: boolean }>({
    accept: DND_TYPES.CANVAS_BLOCK,
    hover: (dragItem) => {
      if (dragItem.index === index) return;
      onMove(dragItem.index, index);
      dragItem.index = index;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="relative group"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      {/* Drop indicator top */}
      {isOver && canDrop && (
        <div className="absolute -top-0.5 left-0 right-0 h-1 bg-purple-500 rounded z-30" />
      )}

      {/* Block content */}
      <BlockRenderer block={block} isSelected={isSelected} onSelect={onSelect} />

      {/* Hover toolbar — shows on hover or selected */}
      <div
        className={`absolute right-2 top-2 z-20 flex items-center gap-1 transition-opacity ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {/* Drag handle */}
        <button
          title="Kéo để sắp xếp"
          className="w-7 h-7 flex items-center justify-center rounded bg-gray-800/80 text-gray-300 hover:bg-gray-700 cursor-grab active:cursor-grabbing"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
        </button>
        {/* Move up */}
        {!isFirst && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(index); }}
            title="Lên"
            className="w-7 h-7 flex items-center justify-center rounded bg-gray-800/80 text-gray-300 hover:bg-gray-700"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
        )}
        {/* Move down */}
        {!isLast && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(index); }}
            title="Xuống"
            className="w-7 h-7 flex items-center justify-center rounded bg-gray-800/80 text-gray-300 hover:bg-gray-700"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        )}
        {/* Duplicate */}
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(block.id); }}
          title="Nhân đôi"
          className="w-7 h-7 flex items-center justify-center rounded bg-gray-800/80 text-gray-300 hover:bg-gray-700"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
          </svg>
        </button>
        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
          title="Xóa block"
          className="w-7 h-7 flex items-center justify-center rounded bg-red-600/80 text-white hover:bg-red-600"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ── Drop Zone (empty canvas or between blocks) ────────────────
const DropZone: React.FC<{
  onDrop: (blockType: BlockType) => void;
  isCompact?: boolean;
}> = ({ onDrop, isCompact = false }) => {
  const [{ isOver, canDrop }, drop] = useDrop<PaletteDragItem, unknown, { isOver: boolean; canDrop: boolean }>({
    accept: DND_TYPES.PALETTE_BLOCK,
    drop: (item) => onDrop(item.blockType),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  if (isCompact) {
    return (
      <div
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        className={`transition-all h-2 mx-4 my-0.5 rounded-full ${
          isOver && canDrop ? "bg-purple-500 h-4" : canDrop ? "bg-purple-400/20" : ""
        }`}
      />
    );
  }

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`flex flex-col items-center justify-center gap-4 transition-all rounded-2xl border-2 border-dashed mx-4 my-8 ${
        isOver && canDrop
          ? "border-purple-500 bg-purple-500/10 scale-[1.01]"
          : canDrop
          ? "border-purple-400/40 bg-purple-500/5"
          : "border-gray-300/40 bg-transparent"
      }`}
      style={{ minHeight: 200 }}
    >
      <div className="w-14 h-14 rounded-2xl bg-gray-100/10 flex items-center justify-center">
        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-400">Kéo component vào đây</p>
        <p className="text-xs text-gray-500 mt-1">hoặc chọn từ bảng Component ở bên trái</p>
      </div>
    </div>
  );
};

// ── Main Canvas ────────────────────────────────────────────────
interface CanvasProps {
  blocks: EditorBlock[];
  selectedId: string | null;
  deviceMode: DeviceMode;
  zoom: number;
  pageBgColor: string;
  onSelectBlock: (id: string | null) => void;
  onDropFromPalette: (blockType: BlockType, insertIndex?: number) => void;
  onMoveBlock: (fromIndex: number, toIndex: number) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  blocks,
  selectedId,
  deviceMode,
  zoom,
  pageBgColor,
  onSelectBlock,
  onDropFromPalette,
  onMoveBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveUp,
  onMoveDown,
}) => {
  const canvasWidth = DEVICE_WIDTHS[deviceMode];

  // Click on canvas bg deselects
  const handleCanvasBgClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onSelectBlock(null);
  };

  return (
    <div
      className="flex-1 overflow-auto flex items-start justify-center"
      style={{
        background: "radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0a0a0f 100%)",
        backgroundImage: `radial-gradient(#1d1d2e 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
      onClick={handleCanvasBgClick}
    >
      {/* Device frame */}
      <div
        className="relative shadow-2xl my-8 transition-all duration-300"
        style={{
          width: canvasWidth * zoom,
          minHeight: 600 * zoom,
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          marginBottom: `calc(2rem + ${(600 * zoom - 600)}px)`,
        }}
      >
        {/* Page background */}
        <div
          className="w-full min-h-full"
          style={{
            width: canvasWidth,
            backgroundColor: pageBgColor,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
          onClick={handleCanvasBgClick}
        >
          {blocks.length === 0 ? (
            <DropZone onDrop={(bt) => onDropFromPalette(bt, 0)} />
          ) : (
            <>
              {blocks.map((block, index) => (
                <React.Fragment key={block.id}>
                  {/* Inter-block drop zone (compact) */}
                  <DropZone isCompact onDrop={(bt) => onDropFromPalette(bt, index)} />
                  <SortableBlock
                    block={block}
                    index={index}
                    isSelected={selectedId === block.id}
                    onSelect={() => onSelectBlock(block.id)}
                    onMove={onMoveBlock}
                    onDelete={onDeleteBlock}
                    onDuplicate={onDuplicateBlock}
                    onMoveUp={onMoveUp}
                    onMoveDown={onMoveDown}
                    isFirst={index === 0}
                    isLast={index === blocks.length - 1}
                  />
                </React.Fragment>
              ))}
              {/* Drop zone at the end */}
              <DropZone isCompact onDrop={(bt) => onDropFromPalette(bt, blocks.length)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
