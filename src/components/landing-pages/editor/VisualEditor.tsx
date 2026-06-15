"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  EditorBlock, EditorData, BlockType, DeviceMode, createDefaultBlock,
} from "./types";
import { EditorTopBar } from "./EditorTopBar";
import { LayersPanel } from "./LayersPanel";
import { Canvas } from "./Canvas";
import { InspectorPanel } from "./InspectorPanel";
import { LandingPageItem } from "../dung-chung/types";

// ── Undo/Redo stack ──────────────────────────────────────────
const MAX_HISTORY = 60;

function useHistory<T>(initial: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initial);
  const [future, setFuture] = useState<T[]>([]);

  const push = useCallback((next: T) => {
    setPast((p) => [...p.slice(-MAX_HISTORY), present]);
    setPresent(next);
    setFuture([]);
  }, [present]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [present, ...f]);
    setPresent(prev);
  }, [past, present]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, present]);
    setPresent(next);
  }, [future, present]);

  return {
    state: present,
    push,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}

// ── Initial editor data factory ───────────────────────────────
function buildInitialData(page: LandingPageItem): EditorData {
  return {
    pageId: page.id,
    pageName: page.name,
    blocks: [],
    pageSettings: {
      bgColor: "#ffffff",
      maxWidth: 1280,
      fontFamily: "Inter, sans-serif",
      primaryColor: "#65a30d",
    },
  };
}

// ── Toast notification ─────────────────────────────────────────
const Toast: React.FC<{ message: string; type: "success" | "info" }> = ({ message, type }) => (
  <div
    className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white transition-all animate-bounce-in ${
      type === "success" ? "bg-green-600" : "bg-lime-500"
    }`}
  >
    {type === "success" ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    )}
    {message}
  </div>
);

// ── Main Visual Editor ─────────────────────────────────────────
interface VisualEditorProps {
  page: LandingPageItem;
  onClose: () => void;
  onPublish?: (page: LandingPageItem) => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({ page, onClose, onPublish }) => {
  const { state: data, push, undo, redo, canUndo, canRedo } = useHistory<EditorData>(
    buildInitialData(page)
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [zoom, setZoom] = useState(1);
  const [pageName, setPageName] = useState(page.name);
  const [isSaved, setIsSaved] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mark dirty on any data change
  useEffect(() => {
    setIsSaved(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setIsSaved(true), 1500); // auto-save simulation
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [data]);

  // Show toast
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  // ── Block mutations ──────────────────────────────────────────

  const handleDropFromPalette = useCallback((blockType: BlockType, insertIndex?: number) => {
    const newBlock = createDefaultBlock(blockType);
    const newBlocks = [...data.blocks];
    if (insertIndex !== undefined) {
      newBlocks.splice(insertIndex, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }
    push({ ...data, blocks: newBlocks });
    setSelectedId(newBlock.id);
    showToast(`Đã thêm ${newBlock.label}`);
  }, [data, push]);

  const handleAddBlock = useCallback((blockType: BlockType) => {
    const newBlock = createDefaultBlock(blockType);
    const newBlocks = [...data.blocks, newBlock];
    push({ ...data, blocks: newBlocks });
    setSelectedId(newBlock.id);
    showToast(`Đã thêm ${newBlock.label}`);
  }, [data, push]);

  const handleMoveBlock = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newBlocks = [...data.blocks];
    const [moved] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, moved);
    push({ ...data, blocks: newBlocks });
  }, [data, push]);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    handleMoveBlock(index, index - 1);
  }, [handleMoveBlock]);

  const handleMoveDown = useCallback((index: number) => {
    if (index === data.blocks.length - 1) return;
    handleMoveBlock(index, index + 1);
  }, [data, handleMoveBlock]);

  const handleDeleteBlock = useCallback((id: string) => {
    const newBlocks = data.blocks.filter((b) => b.id !== id);
    push({ ...data, blocks: newBlocks });
    if (selectedId === id) setSelectedId(null);
    showToast("Đã xóa block", "info");
  }, [data, push, selectedId]);

  const handleDuplicateBlock = useCallback((id: string) => {
    const index = data.blocks.findIndex((b) => b.id === id);
    if (index === -1) return;
    const original = data.blocks[index];
    const cloned: EditorBlock = {
      ...original,
      id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      props: { ...original.props },
    };
    const newBlocks = [...data.blocks];
    newBlocks.splice(index + 1, 0, cloned);
    push({ ...data, blocks: newBlocks });
    setSelectedId(cloned.id);
    showToast(`Đã nhân đôi ${cloned.label}`);
  }, [data, push]);

  const handleUpdateBlock = useCallback((id: string, newProps: Record<string, unknown>) => {
    const newBlocks = data.blocks.map((b) =>
      b.id === id ? { ...b, props: newProps } : b
    );
    push({ ...data, blocks: newBlocks });
  }, [data, push]);

  const handleUpdatePageSettings = useCallback((key: string, value: string | number) => {
    push({ ...data, pageSettings: { ...data.pageSettings, [key]: value } });
  }, [data, push]);

  // ── Keyboard shortcuts ───────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const ctrlMeta = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlMeta && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if (ctrlMeta && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); redo(); }
      if (e.key === "Escape") setSelectedId(null);
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        // Only delete if not focused on an input
        const tag = (e.target as HTMLElement)?.tagName;
        if (!["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
          e.preventDefault();
          handleDeleteBlock(selectedId);
        }
      }
      if (ctrlMeta && e.key === "d" && selectedId) {
        e.preventDefault();
        handleDuplicateBlock(selectedId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, selectedId, handleDeleteBlock, handleDuplicateBlock]);

  // ── Publish handler ───────────────────────────────────────────
  const handlePublish = () => {
    setIsSaved(true);
    showToast("Đã xuất bản trang thành công! 🎉");
    if (onPublish) onPublish({ ...page, name: pageName, status: "PUBLISHED" });
  };

  // ── Selected block ────────────────────────────────────────────
  const selectedBlock = selectedId ? data.blocks.find((b) => b.id === selectedId) ?? null : null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="fixed inset-0 z-[999999] flex flex-col bg-[#0a0a0f]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Top bar */}
        <EditorTopBar
          pageName={pageName}
          setPageName={setPageName}
          deviceMode={deviceMode}
          setDeviceMode={setDeviceMode}
          zoom={zoom}
          setZoom={setZoom}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onClose={onClose}
          onPublish={handlePublish}
          isSaved={isSaved}
          blockCount={data.blocks.length}
        />

        {/* 3-column editor body */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT — Layers + Palette */}
          <LayersPanel
            blocks={data.blocks}
            selectedId={selectedId}
            onSelectBlock={(id) => setSelectedId(id)}
            onDeleteBlock={handleDeleteBlock}
            onAddBlock={handleAddBlock}
          />

          {/* CENTER — Canvas */}
          <Canvas
            blocks={data.blocks}
            selectedId={selectedId}
            deviceMode={deviceMode}
            zoom={zoom}
            pageBgColor={data.pageSettings.bgColor}
            onSelectBlock={setSelectedId}
            onDropFromPalette={handleDropFromPalette}
            onMoveBlock={handleMoveBlock}
            onDeleteBlock={handleDeleteBlock}
            onDuplicateBlock={handleDuplicateBlock}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />

          {/* RIGHT — Inspector */}
          <InspectorPanel
            selectedBlock={selectedBlock}
            pageSettings={data.pageSettings}
            onUpdateBlock={handleUpdateBlock}
            onUpdatePageSettings={handleUpdatePageSettings}
          />
        </div>

        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} />}

        {/* Keyboard shortcuts hint (bottom of canvas) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-gray-700 pointer-events-none select-none hidden lg:block">
          Delete — xóa block &nbsp;·&nbsp; Ctrl+D — nhân đôi &nbsp;·&nbsp; Ctrl+Z — hoàn tác &nbsp;·&nbsp; Esc — bỏ chọn
        </div>
      </div>
    </DndProvider>
  );
};
