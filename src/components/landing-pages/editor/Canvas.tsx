"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDrop } from "react-dnd";
import {
  EditorBlock, BlockType, DND_TYPES, DeviceMode, DEVICE_WIDTHS,
  ONLOOK_ATTRIBUTES, ensureOnlookBlockMeta, ElementFrame, getEffectiveFrame,
  getNodeKind,
} from "./types";
import { HeroBlock } from "./blocks/HeroBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ButtonBlock } from "./blocks/ButtonBlock";
import { SpacerBlock, DividerBlock } from "./blocks/SpacerBlock";
import { FeatureCardBlock, TestimonialBlock } from "./blocks/SocialBlocks";
import { CountdownBlock, VideoBlock, FormCaptureBlock } from "./blocks/AdvancedBlocks";
import { TeaLandingBlock } from "./blocks/TeaLandingBlock";
import { ChatWidgetBlock, FunnelPopupBlock } from "./blocks/WidgetBlocks";
import {
  GalleryBlock, BoxBlock, IconBlock, ProductCardBlock, CollectionListBlock,
  CarouselBlock, TabsBlock, FrameBlock, AccordionBlock, TableBlock,
  SurveyBlock, MenuBlock, HtmlCodeBlock
} from "./blocks/NewLadiBlocks";

// ── Block Renderer ────────────────────────────────────────────
const BlockRenderer: React.FC<{
  block: EditorBlock;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateBlock: (id: string, nextProps: Record<string, unknown>) => void;
  globalCss?: string;
}> = ({ block, isSelected, onSelect, onUpdateBlock, globalCss }) => {
  const update = (nextProps: Record<string, unknown>) => onUpdateBlock(block.id, nextProps);

  switch (block.type) {
    case "hero": return <HeroBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "text": return <TextBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "image": return <ImageBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "button": return <ButtonBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "spacer": return <SpacerBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "divider": return <DividerBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "feature_card": return <FeatureCardBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "testimonial": return <TestimonialBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "countdown": return <CountdownBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "video": return <VideoBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "form_capture": return <FormCaptureBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "chat_widget": return <ChatWidgetBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "funnel_popup": return <FunnelPopupBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "tea_landing": return <TeaLandingBlock props={block.props} isSelected={isSelected} onSelect={onSelect} onUpdate={update} />;
    case "gallery": return <GalleryBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "product_section":
    case "form_section":
    case "footer":
    case "custom_section":
    case "box": return <BoxBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "icon": return <IconBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "product_card": return <ProductCardBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "collection_list": return <CollectionListBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "carousel": return <CarouselBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "tabs": return <TabsBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "frame": return <FrameBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "accordion": return <AccordionBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "table": return <TableBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "survey": return <SurveyBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "menu": return <MenuBlock props={block.props} isSelected={isSelected} onSelect={onSelect} />;
    case "html_code": return <HtmlCodeBlock props={block.props} isSelected={isSelected} onSelect={onSelect} globalCss={globalCss} />;
    default:
      return null;
  }
};

// ── Floating Toolbar ──────────────────────────────────────────
const FloatingToolbar: React.FC<{
  block: EditorBlock;
  zoom: number;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}> = ({ block, zoom, onDelete, onDuplicate, onBringForward, onSendBackward }) => {
  return (
    <div
      className="absolute bg-gray-900/95 text-white flex items-center gap-1 p-1 rounded-lg shadow-xl z-50 border border-gray-800 select-none whitespace-nowrap"
      style={{
        top: `-${40 / zoom}px`,
        right: 0,
        transformOrigin: "top right",
        fontSize: `${11 / zoom}px`,
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onBringForward(); }}
        title="Lên trên (zIndex + 1)"
        className="px-2 py-1 rounded hover:bg-gray-800 flex items-center justify-center font-bold"
      >
        ▲
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onSendBackward(); }}
        title="Xuống dưới (zIndex - 1)"
        className="px-2 py-1 rounded hover:bg-gray-800 flex items-center justify-center font-bold"
      >
        ▼
      </button>
      <div className="w-[1px] h-4 bg-gray-800 self-center mx-1" />
      <button
        onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
        title="Nhân đôi"
        className="px-2 py-1 rounded hover:bg-gray-800"
      >
        Nhân đôi
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        title="Xóa"
        className="px-2 py-1 rounded bg-red-650/80 hover:bg-red-650"
      >
        Xóa
      </button>
    </div>
  );
};

// ── Selection Overlay ─────────────────────────────────────────
const SelectionOverlay: React.FC<{
  block: EditorBlock;
  frame: ElementFrame;
  zoom: number;
  onPointerDownResize: (e: React.PointerEvent, direction: string) => void;
  onPointerDownRotate: (e: React.PointerEvent) => void;
}> = ({ block, frame, zoom, onPointerDownResize, onPointerDownRotate }) => {
  const handleSize = 7 / zoom;
  const offset = 1 / zoom;

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: `-${offset}px`,
    border: "1.5px dashed #8b5cf6", // violet-500
    pointerEvents: "none",
    borderRadius: "2px",
    zIndex: 1000,
  };

  const handleBaseStyle = (cursor: string): React.CSSProperties => ({
    position: "absolute",
    width: `${handleSize}px`,
    height: `${handleSize}px`,
    backgroundColor: "#ffffff",
    border: "1.5px solid #8b5cf6",
    cursor,
    pointerEvents: "auto",
    zIndex: 1001,
  });

  const rotateHandleStyle: React.CSSProperties = {
    position: "absolute",
    bottom: `-${24 / zoom}px`,
    left: "50%",
    transform: "translateX(-50%)",
    width: `${14 / zoom}px`,
    height: `${14 / zoom}px`,
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    border: "1.5px solid #8b5cf6",
    cursor: "alias",
    pointerEvents: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1002,
  };

  return (
    <div style={overlayStyle}>
      <div
        className="absolute bg-purple-650 text-white font-extrabold rounded select-none tracking-wider uppercase"
        style={{
          top: `-${18 / zoom}px`,
          left: `-${offset}px`,
          fontSize: `${9 / zoom}px`,
          padding: `${1 / zoom}px ${4 / zoom}px`,
          transformOrigin: "top left",
        }}
      >
        {block.type}
      </div>

      <div
        data-handle="top"
        style={{ ...handleBaseStyle("ns-resize"), top: `-${handleSize / 2}px`, left: "50%", transform: "translateX(-50%)" }}
        onPointerDown={(e) => onPointerDownResize(e, "top")}
      />
      <div
        data-handle="bottom"
        style={{ ...handleBaseStyle("ns-resize"), bottom: `-${handleSize / 2}px`, left: "50%", transform: "translateX(-50%)" }}
        onPointerDown={(e) => onPointerDownResize(e, "bottom")}
      />
      <div
        data-handle="left"
        style={{ ...handleBaseStyle("ew-resize"), left: `-${handleSize / 2}px`, top: "50%", transform: "translateY(-50%)" }}
        onPointerDown={(e) => onPointerDownResize(e, "left")}
      />
      <div
        data-handle="right"
        style={{ ...handleBaseStyle("ew-resize"), right: `-${handleSize / 2}px`, top: "50%", transform: "translateY(-50%)" }}
        onPointerDown={(e) => onPointerDownResize(e, "right")}
      />
      <div
        data-handle="top-left"
        style={{ ...handleBaseStyle("nwse-resize"), top: `-${handleSize / 2}px`, left: `-${handleSize / 2}px` }}
        onPointerDown={(e) => onPointerDownResize(e, "top-left")}
      />
      <div
        data-handle="top-right"
        style={{ ...handleBaseStyle("nesw-resize"), top: `-${handleSize / 2}px`, right: `-${handleSize / 2}px` }}
        onPointerDown={(e) => onPointerDownResize(e, "top-right")}
      />
      <div
        data-handle="bottom-left"
        style={{ ...handleBaseStyle("nesw-resize"), bottom: `-${handleSize / 2}px`, left: `-${handleSize / 2}px` }}
        onPointerDown={(e) => onPointerDownResize(e, "bottom-left")}
      />
      <div
        data-handle="bottom-right"
        style={{ ...handleBaseStyle("nwse-resize"), bottom: `-${handleSize / 2}px`, right: `-${handleSize / 2}px` }}
        onPointerDown={(e) => onPointerDownResize(e, "bottom-right")}
      />

      <div
        data-handle="rotate"
        style={rotateHandleStyle}
        onPointerDown={onPointerDownRotate}
        title="Xoay phần tử"
      >
        <svg
          style={{ width: `${8 / zoom}px`, height: `${8 / zoom}px`, color: "#8b5cf6" }}
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      </div>
    </div>
  );
};

// ── Element Absolute Container Wrapper ───────────────────────
const AbsoluteElementWrapper: React.FC<{
  block: EditorBlock;
  isSelected: boolean;
  deviceMode: DeviceMode;
  zoom: number;
  onSelect: (e: React.MouseEvent) => void;
  onPointerDownDrag: (e: React.PointerEvent, block: EditorBlock) => void;
  onPointerDownResize: (e: React.PointerEvent, block: EditorBlock, direction: string) => void;
  onPointerDownRotate: (e: React.PointerEvent, block: EditorBlock) => void;
  onUpdateBlock: (id: string, nextProps: Record<string, unknown>) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onMoveNodeZIndex: (id: string, direction: "forward" | "backward") => void;
  draftFrame: Partial<ElementFrame> | null;
  globalCss?: string;
}> = ({
  block,
  isSelected,
  deviceMode,
  zoom,
  onSelect,
  onPointerDownDrag,
  onPointerDownResize,
  onPointerDownRotate,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveNodeZIndex,
  draftFrame,
  globalCss,
}) => {
  const frame = getEffectiveFrame(block, deviceMode);
  const finalX = draftFrame?.x !== undefined ? draftFrame.x : frame.x;
  const finalY = draftFrame?.y !== undefined ? draftFrame.y : frame.y;
  const finalW = draftFrame?.width !== undefined ? draftFrame.width : frame.width;
  const finalH = draftFrame?.height !== undefined ? draftFrame.height : frame.height;
  const finalZ = draftFrame?.zIndex !== undefined ? draftFrame.zIndex : frame.zIndex;
  const finalR = draftFrame?.rotate !== undefined ? draftFrame.rotate : (frame.rotate || 0);

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${finalX}px`,
    top: `${finalY}px`,
    width: `${finalW}px`,
    height: `${finalH}px`,
    zIndex: finalZ,
    transform: finalR ? `rotate(${finalR}deg)` : undefined,
    userSelect: "none",
  };

  return (
    <div
      style={style}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("[data-handle]")) return;
        onPointerDownDrag(e, block);
      }}
      onClick={onSelect}
      id={block.id}
      {...{
        [ONLOOK_ATTRIBUTES.DATA_ONLOOK_ID]: block.oid,
        [ONLOOK_ATTRIBUTES.DATA_ONLOOK_INSTANCE_ID]: block.instanceId,
        [ONLOOK_ATTRIBUTES.DATA_ONLOOK_DOM_ID]: block.domId,
        [ONLOOK_ATTRIBUTES.DATA_ONLOOK_COMPONENT_NAME]: block.componentName,
      }}
    >
      <div style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
        <BlockRenderer block={block} isSelected={false} onSelect={() => {}} onUpdateBlock={onUpdateBlock} globalCss={globalCss} />
      </div>

      {isSelected && (
        <>
          <SelectionOverlay
            block={block}
            frame={{ x: finalX, y: finalY, width: finalW, height: finalH, zIndex: finalZ, rotate: finalR }}
            zoom={zoom}
            onPointerDownResize={(e, dir) => onPointerDownResize(e, block, dir)}
            onPointerDownRotate={(e) => onPointerDownRotate(e, block)}
          />
          <FloatingToolbar
            block={block}
            zoom={zoom}
            onDelete={() => onDeleteBlock(block.id)}
            onDuplicate={() => onDuplicateBlock(block.id)}
            onBringForward={() => onMoveNodeZIndex(block.id, "forward")}
            onSendBackward={() => onMoveNodeZIndex(block.id, "backward")}
          />
        </>
      )}
    </div>
  );
};

// ── Section Drop Zone Wrapper ─────────────────────────────────
const SectionDropZoneWrapper: React.FC<{
  section: EditorBlock;
  zoom: number;
  onDropItem: (
    item: { id?: string; type?: BlockType; isPalette?: boolean },
    containerId?: string,
    columnIndex?: number,
    index?: number,
    x?: number,
    y?: number
  ) => void;
  children: React.ReactNode;
}> = ({ section, zoom, onDropItem, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop<
    { type: string; blockType?: BlockType; blockId?: string },
    unknown,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: [DND_TYPES.PALETTE_BLOCK, DND_TYPES.CANVAS_BLOCK],
    canDrop: (item) => {
      if (item.type === DND_TYPES.PALETTE_BLOCK) {
        return getNodeKind(item.blockType || "box") !== "section";
      }
      return true;
    },
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const dropX = Math.round((clientOffset.x - rect.left) / zoom);
      const dropY = Math.round((clientOffset.y - rect.top) / zoom);

      if (item.type === DND_TYPES.PALETTE_BLOCK && item.blockType) {
        onDropItem({ type: item.blockType, isPalette: true }, section.id, undefined, undefined, dropX, dropY);
      } else if (item.type === DND_TYPES.CANVAS_BLOCK && item.blockId) {
        if (item.blockId === section.id) return;
        onDropItem({ id: item.blockId }, section.id, undefined, undefined, dropX, dropY);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  drop(ref);

  return (
    <div
      ref={ref}
      className={`relative w-full transition-colors ${
        isOver && canDrop ? "bg-purple-500/5 ring-1 ring-purple-300" : ""
      }`}
    >
      {children}
    </div>
  );
};

// ── Root Section Drop Zone (compact) ──────────────────────────
const SectionDropZone: React.FC<{
  index: number;
  onDropItem: (
    item: { id?: string; type?: BlockType; isPalette?: boolean },
    containerId?: string,
    columnIndex?: number,
    index?: number
  ) => void;
}> = ({ index, onDropItem }) => {
  const [{ isOver, canDrop }, drop] = useDrop<
    { type: string; blockType?: BlockType; blockId?: string },
    unknown,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: [DND_TYPES.PALETTE_BLOCK, DND_TYPES.CANVAS_BLOCK],
    canDrop: (item) => {
      if (item.type === DND_TYPES.PALETTE_BLOCK) {
        return getNodeKind(item.blockType || "box") === "section";
      }
      return false;
    },
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;
      if (item.type === DND_TYPES.PALETTE_BLOCK && item.blockType) {
        onDropItem({ type: item.blockType, isPalette: true }, undefined, undefined, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`transition-all h-2 my-1 rounded-full ${
        isOver && canDrop ? "bg-purple-600 h-5" : canDrop ? "bg-purple-400/20" : "bg-transparent"
      }`}
    />
  );
};

// ── Drag & Resize state types ─────────────────────────────────
interface DragState {
  type: "drag" | "resize" | "rotate";
  blockId: string;
  baseFrame: ElementFrame;
  startPointerX: number;
  startPointerY: number;
  direction?: string;
}

// Section types with natural full-height rendering (not collapsed)
const SECTION_NATURAL_TYPES = new Set([
  "hero", "product_section", "form_section", "footer",
  "custom_section", "tea_landing", "smartwatch_landing", "menu",
]);

// Self-contained rich components that render their own content (no absolute children)
const SELF_CONTAINED_SECTION_TYPES = new Set([
  "tea_landing", "smartwatch_landing",
  "menu",
  "feature_card", "collection_list", "testimonial",
  "countdown", "video", "chat_widget", "funnel_popup",
  "gallery", "tabs", "accordion", "product_card", "carousel",
  "form_capture", "survey", "table", "html_code",
  "columns",
]);


// ── Main Canvas ───────────────────────────────────────────────
interface CanvasProps {
  sections: EditorBlock[];
  selectedId: string | null;
  deviceMode: DeviceMode;
  zoom: number;
  pageBgColor: string;
  onSelectBlock: (id: string | null) => void;
  onDropItem: (
    item: { id?: string; type?: BlockType; isPalette?: boolean },
    containerId?: string,
    columnIndex?: number,
    index?: number,
    x?: number,
    y?: number
  ) => void;
  onMoveBlock: (fromIndex: number, toIndex: number) => void;
  onMoveWithinParent: (parentId: string | undefined, columnIndex: number | undefined, fromIndex: number, toIndex: number) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onUpdateBlock: (id: string, nextProps: Record<string, unknown>) => void;
  onUpdateNodeFrame: (id: string, frame: Partial<ElementFrame>) => void;
  onUpdateResponsiveFrame: (id: string, deviceMode: DeviceMode, frame: Partial<ElementFrame>) => void;
  onAddSection: (blockType: BlockType, index?: number) => void;
  onAddElementToSection: (sectionId: string, blockType: BlockType, x: number, y: number) => void;
  onMoveNodeZIndex: (id: string, direction: "forward" | "backward") => void;
  globalCss?: string;
}

export const Canvas: React.FC<CanvasProps> = ({
  sections,
  selectedId,
  deviceMode,
  zoom,
  pageBgColor,
  onSelectBlock,
  onDropItem,
  onDeleteBlock,
  onDuplicateBlock,
  onUpdateBlock,
  onUpdateNodeFrame,
  onUpdateResponsiveFrame,
  onMoveNodeZIndex,
  globalCss,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const canvasWidth = DEVICE_WIDTHS[deviceMode];
  const minPageHeight = 1600;
  const deviceLabel = deviceMode.charAt(0).toUpperCase() + deviceMode.slice(1);
  
  const fitZoom = viewportWidth
    ? Math.min(1, Math.max(0.28, (viewportWidth - 48) / canvasWidth))
    : 1;
  const effectiveZoom = Math.min(zoom, fitZoom);
  const scaledWidth = canvasWidth * effectiveZoom;

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [draftFrame, setDraftFrame] = useState<Partial<ElementFrame> | null>(null);
  const [snapGuides, setSnapGuides] = useState<{ vertical?: number; horizontal?: number } | null>(null);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const updateViewportWidth = () => setViewportWidth(node.clientWidth);
    updateViewportWidth();

    const resizeObserver = new ResizeObserver(updateViewportWidth);
    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, []);

  // Recursively find element parent ID
  const findParentId = useCallback((id: string): string | null => {
    const node = findBlockRecursive(sections, id);
    return node?.parentId ?? null;
  }, [sections]);

  // Recursively find block
  const findBlockRecursive = (nodes: EditorBlock[], id: string): EditorBlock | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findBlockRecursive(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Pointer Interaction Handlers
  const handlePointerDownDrag = useCallback((e: React.PointerEvent, block: EditorBlock) => {
    if (block.locked) return;
    e.stopPropagation();
    const frame = getEffectiveFrame(block, deviceMode);
    setDragState({
      type: "drag",
      blockId: block.id,
      baseFrame: frame,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
    });
    setDraftFrame(null);
  }, [deviceMode]);

  const handlePointerDownResize = useCallback((e: React.PointerEvent, block: EditorBlock, direction: string) => {
    if (block.locked) return;
    e.stopPropagation();
    const frame = getEffectiveFrame(block, deviceMode);
    setDragState({
      type: "resize",
      blockId: block.id,
      baseFrame: frame,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      direction,
    });
    setDraftFrame(null);
  }, [deviceMode]);

  const handlePointerDownRotate = useCallback((e: React.PointerEvent, block: EditorBlock) => {
    if (block.locked) return;
    e.stopPropagation();
    const frame = getEffectiveFrame(block, deviceMode);
    setDragState({
      type: "rotate",
      blockId: block.id,
      baseFrame: frame,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
    });
    setDraftFrame(null);
  }, [deviceMode]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragState) return;
    e.preventDefault();

    const dx = (e.clientX - dragState.startPointerX) / effectiveZoom;
    const dy = (e.clientY - dragState.startPointerY) / effectiveZoom;

    if (dragState.type === "drag") {
      let nextX = Math.round(dragState.baseFrame.x + dx);
      let nextY = Math.round(dragState.baseFrame.y + dy);

      // Clamping bounds inside parent section
      const parentId = findParentId(dragState.blockId);
      const parentSection = parentId ? findBlockRecursive(sections, parentId) : null;
      const sectionW = parentSection?.frame?.width ?? canvasWidth;
      const sectionH = parentSection?.frame?.height ?? 800;

      nextX = Math.max(0, Math.min(sectionW - dragState.baseFrame.width, nextX));
      nextY = Math.max(0, Math.min(sectionH - dragState.baseFrame.height, nextY));

      // Snap guidelines
      const snapInterval = 10;
      nextX = Math.round(nextX / snapInterval) * snapInterval;
      nextY = Math.round(nextY / snapInterval) * snapInterval;

      // Section center snapping
      const sectionCenter = sectionW / 2;
      const elCenter = nextX + dragState.baseFrame.width / 2;
      if (Math.abs(elCenter - sectionCenter) < 15) {
        nextX = sectionCenter - dragState.baseFrame.width / 2;
        setSnapGuides({ vertical: sectionCenter });
      } else {
        setSnapGuides(null);
      }

      // Auto-grow section height
      if (parentSection && parentSection.frame) {
        const bottomEdge = nextY + dragState.baseFrame.height;
        if (bottomEdge > parentSection.frame.height - 40) {
          const newHeight = Math.max(parentSection.frame.height, bottomEdge + 80);
          if (deviceMode === "desktop") {
            onUpdateNodeFrame(parentSection.id, { height: newHeight });
          } else {
            onUpdateResponsiveFrame(parentSection.id, deviceMode, { height: newHeight });
          }
        }
      }

      // Request animation frame layout update
      requestAnimationFrame(() => {
        setDraftFrame({ x: nextX, y: nextY });
      });
    } else if (dragState.type === "resize") {
      const direction = dragState.direction || "";
      let nextX = dragState.baseFrame.x;
      let nextY = dragState.baseFrame.y;
      let nextW = dragState.baseFrame.width;
      let nextH = dragState.baseFrame.height;

      if (direction.includes("right")) {
        nextW = Math.max(20, Math.round(dragState.baseFrame.width + dx));
      }
      if (direction.includes("left")) {
        const potentialW = dragState.baseFrame.width - dx;
        if (potentialW >= 20) {
          nextW = Math.round(potentialW);
          nextX = Math.round(dragState.baseFrame.x + dx);
        }
      }
      if (direction.includes("bottom")) {
        nextH = Math.max(20, Math.round(dragState.baseFrame.height + dy));
      }
      if (direction.includes("top")) {
        const potentialH = dragState.baseFrame.height - dy;
        if (potentialH >= 20) {
          nextH = Math.round(potentialH);
          nextY = Math.round(dragState.baseFrame.y + dy);
        }
      }

      // Snap dimensions
      nextW = Math.round(nextW / 5) * 5;
      nextH = Math.round(nextH / 5) * 5;
      nextX = Math.round(nextX / 5) * 5;
      nextY = Math.round(nextY / 5) * 5;

      requestAnimationFrame(() => {
        setDraftFrame({ x: nextX, y: nextY, width: nextW, height: nextH });
      });
    } else if (dragState.type === "rotate") {
      const el = document.getElementById(dragState.blockId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const angleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      let angleDeg = Math.round(angleRad * (180 / Math.PI)) - 90;
      if (angleDeg < 0) angleDeg += 360;

      if (e.shiftKey) {
        angleDeg = Math.round(angleDeg / 15) * 15;
      }

      requestAnimationFrame(() => {
        setDraftFrame({ rotate: angleDeg });
      });
    }
  }, [dragState, effectiveZoom, sections, canvasWidth, deviceMode, onUpdateNodeFrame, onUpdateResponsiveFrame, findParentId]);

  const handlePointerUp = useCallback(() => {
    if (!dragState) return;

    if (draftFrame) {
      if (deviceMode === "desktop") {
        onUpdateNodeFrame(dragState.blockId, draftFrame);
      } else {
        onUpdateResponsiveFrame(dragState.blockId, deviceMode, draftFrame);
      }
    }

    setDragState(null);
    setDraftFrame(null);
    setSnapGuides(null);
  }, [dragState, draftFrame, deviceMode, onUpdateNodeFrame, onUpdateResponsiveFrame]);

  // Pointer Event listeners
  useEffect(() => {
    if (!dragState) return;

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState, handlePointerMove, handlePointerUp]);

  // Keyboard Event shortcuts
  useEffect(() => {
    if (!selectedId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      const selectedNode = findBlockRecursive(sections, selectedId);
      if (!selectedNode || selectedNode.locked) return;

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdCtrl && e.key.toLowerCase() === "d") {
        e.preventDefault();
        onDuplicateBlock(selectedId);
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onDeleteBlock(selectedId);
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onSelectBlock(null);
        return;
      }

      if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const frame = getEffectiveFrame(selectedNode, deviceMode);
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;

        if (e.key === "ArrowUp") dy = -step;
        if (e.key === "ArrowDown") dy = step;
        if (e.key === "ArrowLeft") dx = -step;
        if (e.key === "ArrowRight") dx = step;

        const nextFrame = {
          x: frame.x + dx,
          y: frame.y + dy,
        };

        if (deviceMode === "desktop") {
          onUpdateNodeFrame(selectedId, nextFrame);
        } else {
          onUpdateResponsiveFrame(selectedId, deviceMode, nextFrame);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, sections, deviceMode, onDuplicateBlock, onDeleteBlock, onSelectBlock, onUpdateNodeFrame, onUpdateResponsiveFrame]);

  // Click on canvas background to deselect
  const handleCanvasBgClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectBlock(null);
    }
  };

  return (
    <div
      ref={viewportRef}
      className="flex-1 overflow-auto bg-gray-50 flex items-start justify-center relative select-none"
      onClick={handleCanvasBgClick}
      style={{ padding: "40px 20px" }}
    >
      <div
        className="relative bg-white border border-gray-200 shadow-2xl transition-all"
        style={{
          width: `${canvasWidth}px`,
          minHeight: `${minPageHeight}px`,
          transform: `scale(${effectiveZoom})`,
          transformOrigin: "top center",
          backgroundColor: pageBgColor,
        }}
        onClick={handleCanvasBgClick}
      >
        {/* Render Snap Lines */}
        {snapGuides?.vertical !== undefined && (
          <div
            className="absolute border-l border-dashed border-pink-500 z-50 pointer-events-none"
            style={{
              left: `${snapGuides.vertical}px`,
              top: 0,
              bottom: 0,
            }}
          />
        )}
        {snapGuides?.horizontal !== undefined && (
          <div
            className="absolute border-t border-dashed border-pink-500 z-50 pointer-events-none"
            style={{
              top: `${snapGuides.horizontal}px`,
              left: 0,
              right: 0,
            }}
          />
        )}

        {/* Stack Sections Vertically */}
        {sections.map((section, index) => {
          const hasAbsoluteChildren = (section.children ?? []).length > 0;

          const isSelfContained = SELF_CONTAINED_SECTION_TYPES.has(section.type);

          const naturalHeight =
            section.frame?.height ??
            (typeof section.props?.minHeight === "number"
              ? (section.props.minHeight as number)
              : SECTION_NATURAL_TYPES.has(section.type)
              ? 500
              : 120);

          const sectionStyle: React.CSSProperties = isSelfContained
            ? {
                // Let rich components render at their intrinsic height
                position: "relative",
                width: "100%",
                minHeight: `${naturalHeight}px`,
                zIndex: section.frame?.zIndex ?? 1,
                overflow: "visible",
                border: selectedId === section.id ? "1.5px solid #a855f7" : "1px dashed #cbd5e1",
              }
            : {
                // Explicit height for container sections with absolute elements
                position: "relative",
                width: "100%",
                height: `${naturalHeight}px`,
                zIndex: section.frame?.zIndex ?? 1,
                overflow: "hidden",
                border: selectedId === section.id ? "1.5px solid #a855f7" : "1px dashed #cbd5e1",
              };

          return (
            <React.Fragment key={section.id}>
              {/* Root Section Drop Zone */}
              <SectionDropZone index={index} onDropItem={onDropItem} />

              <SectionDropZoneWrapper section={section} zoom={effectiveZoom} onDropItem={onDropItem}>
                <div
                  style={sectionStyle}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      onSelectBlock(section.id);
                    }
                  }}
                >
                  {/* Render Section Background/Title props using Box renderer */}
                  <div style={{ width: "100%", height: isSelfContained ? "auto" : "100%", pointerEvents: "none" }}>
                    <BlockRenderer
                      block={section}
                      isSelected={false}
                      onSelect={() => {}}
                      onUpdateBlock={onUpdateBlock}
                      globalCss={globalCss}
                    />
                  </div>

                  {selectedId === section.id && (
                    <div
                      className="absolute bg-purple-650 text-white font-extrabold rounded select-none uppercase pointer-events-none z-50"
                      style={{
                        top: "4px",
                        left: "4px",
                        fontSize: "9px",
                        padding: "1px 4px",
                      }}
                    >
                      SECTION
                    </div>
                  )}

                  {/* Absolute Element Layers inside this Section */}
                  {(section.children ?? []).map((element) => (
                    <AbsoluteElementWrapper
                      key={element.id}
                      block={element}
                      isSelected={selectedId === element.id}
                      deviceMode={deviceMode}
                      zoom={effectiveZoom}
                      onSelect={(e) => {
                        e.stopPropagation();
                        onSelectBlock(element.id);
                      }}
                      onPointerDownDrag={handlePointerDownDrag}
                      onPointerDownResize={handlePointerDownResize}
                      onPointerDownRotate={handlePointerDownRotate}
                      onUpdateBlock={onUpdateBlock}
                      onDeleteBlock={onDeleteBlock}
                      onDuplicateBlock={onDuplicateBlock}
                      onMoveNodeZIndex={onMoveNodeZIndex}
                      draftFrame={dragState?.blockId === element.id ? draftFrame : null}
                      globalCss={globalCss}
                    />
                  ))}
                </div>
              </SectionDropZoneWrapper>
            </React.Fragment>
          );
        })}

        {/* Ending Drop Zone */}
        <SectionDropZone index={sections.length} onDropItem={onDropItem} />
      </div>

      {/* Device Indicator Widget floating on bottom left */}
      <div className="fixed bottom-4 left-4 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-lg text-xs font-black text-gray-800 z-50 select-none flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        {deviceLabel} ({canvasWidth}px) | Scale: {Math.round(effectiveZoom * 100)}%
      </div>
    </div>
  );
};
