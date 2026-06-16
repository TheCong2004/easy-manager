"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  EditorBlock, EditorData, BlockType, DeviceMode, EditorViewMode, DEVICE_WIDTHS, createDefaultBlock,
  createDefaultPageSettings, ensureOnlookBlockMeta,
} from "./types";
import {
  LandingEditorAction,
  LandingEditorSnapshot,
  createEditorSnapshot,
  normalizeEditorData,
  renderLandingPageHtml,
} from "./editor-actions";
import { EditorTopBar } from "./EditorTopBar";
import { LayersPanel } from "./LayersPanel";
import { Canvas } from "./Canvas";
import { InspectorPanel, PageSettingsPanel } from "./InspectorPanel";
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

  const replace = useCallback((next: T) => {
    setPast([]);
    setPresent(next);
    setFuture([]);
  }, []);

  return {
    state: present,
    push,
    replace,
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
    blocks: [
      ensureOnlookBlockMeta(createDefaultBlock("hero")),
      ensureOnlookBlockMeta(createDefaultBlock("countdown")),
      ensureOnlookBlockMeta(createDefaultBlock("columns")),
    ],
    pageSettings: createDefaultPageSettings(page.name),
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

function formatActionLabel(action: LandingEditorAction): string {
  switch (action.type) {
    case "insert-element":
      return `Inserted ${action.blockType} at ${action.index + 1}`;
    case "remove-element":
      return `Removed ${action.blockType}`;
    case "move-element":
      return `Moved block ${action.fromIndex + 1} -> ${action.toIndex + 1}`;
    case "update-props":
      return `Updated ${action.blockType}: ${action.keys.join(", ") || "props"}`;
    case "update-page-settings":
      return `Updated page ${action.key}`;
    default:
      return "Editor action";
  }
}

interface EditorRevision {
  id: string;
  name: string;
  snapshot: LandingEditorSnapshot;
  createdAt: string;
}

// ── Main Visual Editor ─────────────────────────────────────────
interface VisualEditorProps {
  page: LandingPageItem;
  pages?: LandingPageItem[];
  onClose: () => void;
  onPublish?: (page: LandingPageItem) => void;
  onSwitchPage?: (page: LandingPageItem) => void;
  onCreatePage?: (name: string) => LandingPageItem;
  onDeletePage?: (id: string) => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  page,
  pages,
  onClose,
  onPublish,
  onSwitchPage,
  onCreatePage,
  onDeletePage,
}) => {
  const { state: data, push, replace, undo, redo, canUndo, canRedo } = useHistory<EditorData>(
    buildInitialData(page)
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [zoom, setZoom] = useState(1);
  const [pageName, setPageName] = useState(page.name);
  const [isSaved, setIsSaved] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<EditorViewMode>("design");
  const [actionLog, setActionLog] = useState<LandingEditorAction[]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const isHydratedRef = useRef(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<EditorRevision[]>([]);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const storageKey = `landing-page-editor:${page.id}`;
  const revisionsKey = `landing-page-editor-revisions:${page.id}`;

  const [activeTab, setActiveTab] = useState<"layers" | "brand" | "pages" | "images" | "sandbox" | "history" | "branches">("layers");

  const sidebarTabs = [
    {
      id: "layers",
      label: "Layers",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
        </svg>
      ),
    },
    {
      id: "brand",
      label: "Branding",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-1.178-.256H5.25a2.25 2.25 0 00-2.25 2.25v1.875c0 .345.029.689.086 1.026a3.385 3.385 0 006.084 1.15l.982-1.656a3 3 0 00.57-1.56h.03c.105 0 .21-.005.312-.015" />
          <circle cx="12" cy="7" r="1.5" />
          <circle cx="17" cy="10" r="1.5" />
          <circle cx="15" cy="15" r="1.5" />
        </svg>
      ),
    },
    {
      id: "pages",
      label: "Pages",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      id: "images",
      label: "Images",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
    {
      id: "history",
      label: "History",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3.75 2.25M3.75 12a8.25 8.25 0 111.833 5.197M3.75 18v-4.5h4.5" />
        </svg>
      ),
    },
    {
      id: "sandbox",
      label: "Sandbox",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25M21 7.5v9l-9 5.25m0-9L3 7.5m9 5.25v9M3 7.5v9l9 5.25" />
        </svg>
      ),
    },
    {
      id: "branches",
      label: "Branches",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M18 15V9a4 4 0 0 0-4-4H9" />
          <line x1="6" y1="9" x2="6" y2="15" />
        </svg>
      ),
    },
  ] as const;

  const [rightTab, setRightTab] = useState<"inspector" | "chat">("chat");
  const [chatHistory, setChatHistory] = useState<{ sender: "user" | "ai"; text: string; timestamp: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  const handleSelectBlock = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) {
      setRightTab("inspector");
    }
  }, []);

  const saveSnapshot = useCallback((nextData: EditorData = data, nextActions: LandingEditorAction[] = actionLog) => {
    const snapshot = createEditorSnapshot({ ...nextData, pageName }, nextActions);
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
    setLastSavedAt(snapshot.updatedAt);
    setIsSaved(true);
    return snapshot;
  }, [actionLog, data, pageName, storageKey]);

  const applySnapshot = useCallback((snapshot: LandingEditorSnapshot) => {
    const normalized = normalizeEditorData(snapshot.data);
    replace(normalized);
    setPageName(normalized.pageName);
    setActionLog(snapshot.actions ?? []);
    setLastSavedAt(snapshot.updatedAt ?? null);
    setSelectedId(null);
    setIsSaved(true);
  }, [replace]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const snapshot = JSON.parse(raw) as LandingEditorSnapshot;
        if (snapshot?.data?.pageId === page.id) {
          applySnapshot(snapshot);
        }
      }
    } catch {
      localStorage.removeItem(storageKey);
    } finally {
      isHydratedRef.current = true;
    }
  }, [applySnapshot, page.id, storageKey]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(revisionsKey);
      setRevisions(raw ? (JSON.parse(raw) as EditorRevision[]) : []);
    } catch {
      localStorage.removeItem(revisionsKey);
      setRevisions([]);
    }
  }, [revisionsKey]);

  // Mark dirty and autosave on any data change
  useEffect(() => {
    if (!isHydratedRef.current) return;
    setIsSaved(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveSnapshot(), 700);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [data, pageName, actionLog, saveSnapshot]);

  // Show toast
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const recordAction = useCallback((action: LandingEditorAction) => {
    setActionLog((prev) => [...prev.slice(-119), action]);
  }, []);

  // ── Block mutations ──────────────────────────────────────────

  const handleDropFromPalette = useCallback((blockType: BlockType, insertIndex?: number) => {
    const newBlock = ensureOnlookBlockMeta(createDefaultBlock(blockType));
    const newBlocks = [...data.blocks];
    const nextIndex = insertIndex ?? newBlocks.length;
    if (insertIndex !== undefined) {
      newBlocks.splice(insertIndex, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }
    push(normalizeEditorData({ ...data, blocks: newBlocks }));
    recordAction({ type: "insert-element", blockId: newBlock.id, blockType, index: nextIndex, timestamp: Date.now() });
    handleSelectBlock(newBlock.id);
    showToast(`Đã thêm ${newBlock.label}`);
  }, [data, push, recordAction, handleSelectBlock]);

  const handleAddBlock = useCallback((blockType: BlockType) => {
    const newBlock = ensureOnlookBlockMeta(createDefaultBlock(blockType));
    const newBlocks = [...data.blocks, newBlock];
    push(normalizeEditorData({ ...data, blocks: newBlocks }));
    recordAction({ type: "insert-element", blockId: newBlock.id, blockType, index: newBlocks.length - 1, timestamp: Date.now() });
    handleSelectBlock(newBlock.id);
    showToast(`Đã thêm ${newBlock.label}`);
  }, [data, push, recordAction, handleSelectBlock]);

  const handleMoveBlock = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newBlocks = [...data.blocks];
    const [moved] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, moved);
    push(normalizeEditorData({ ...data, blocks: newBlocks }));
    recordAction({ type: "move-element", blockId: moved.id, fromIndex, toIndex, timestamp: Date.now() });
  }, [data, push, recordAction]);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    handleMoveBlock(index, index - 1);
  }, [handleMoveBlock]);

  const handleMoveDown = useCallback((index: number) => {
    if (index === data.blocks.length - 1) return;
    handleMoveBlock(index, index + 1);
  }, [data, handleMoveBlock]);

  const handleDeleteBlock = useCallback((id: string) => {
    const removed = data.blocks.find((b) => b.id === id);
    const newBlocks = data.blocks.filter((b) => b.id !== id);
    push(normalizeEditorData({ ...data, blocks: newBlocks }));
    if (removed) {
      recordAction({ type: "remove-element", blockId: removed.id, blockType: removed.type, timestamp: Date.now() });
    }
    if (selectedId === id) handleSelectBlock(null);
    showToast("Đã xóa block", "info");
  }, [data, push, recordAction, selectedId, handleSelectBlock]);

  const handleDuplicateBlock = useCallback((id: string) => {
    const index = data.blocks.findIndex((b) => b.id === id);
    if (index === -1) return;
    const original = data.blocks[index];
    const cloned: EditorBlock = {
      ...original,
      id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      props: { ...original.props },
      oid: undefined,
      instanceId: undefined,
      domId: undefined,
    };
    const normalizedClone = ensureOnlookBlockMeta(cloned);
    const newBlocks = [...data.blocks];
    newBlocks.splice(index + 1, 0, normalizedClone);
    push(normalizeEditorData({ ...data, blocks: newBlocks }));
    recordAction({ type: "insert-element", blockId: normalizedClone.id, blockType: normalizedClone.type, index: index + 1, timestamp: Date.now() });
    handleSelectBlock(normalizedClone.id);
    showToast(`Đã nhân đôi ${cloned.label}`);
  }, [data, push, recordAction, handleSelectBlock]);

  const handleUpdateBlock = useCallback((id: string, newProps: Record<string, unknown>) => {
    const current = data.blocks.find((b) => b.id === id);
    const newBlocks = data.blocks.map((b) =>
      b.id === id ? { ...b, props: newProps } : b
    );
    push(normalizeEditorData({ ...data, blocks: newBlocks }));
    if (current) {
      const oldProps = current.props as Record<string, unknown>;
      const keys = Object.keys(newProps).filter((key) => oldProps[key] !== newProps[key]);
      recordAction({ type: "update-props", blockId: id, blockType: current.type, keys, timestamp: Date.now() });
    }
  }, [data, push, recordAction]);

  const handleUpdatePageSettings = useCallback((key: string, value: string | number) => {
    push({ ...data, pageSettings: { ...data.pageSettings, [key]: value } });
    recordAction({ type: "update-page-settings", key, timestamp: Date.now() });
  }, [data, push, recordAction]);

  const handleSendChatMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: "user" as const, text, timestamp: new Date().toLocaleTimeString() };
    setChatHistory(prev => [...prev, userMsg]);
    setIsAiTyping(true);

    setTimeout(() => {
      let aiResponse = "Tôi đã tiếp nhận yêu cầu và đang tối ưu hóa thiết kế cho bạn.";
      let actionTaken = false;

      const normalizedText = text.toLowerCase().trim();

      // Check if a block is selected
      const currentSelectedBlock = selectedId ? data.blocks.find(b => b.id === selectedId) : null;

      if (currentSelectedBlock) {
        const blockId = currentSelectedBlock.id;
        const currentProps = { ...currentSelectedBlock.props };

        // 1. Change color instructions
        if (normalizedText.includes("màu cam") || normalizedText.includes("orange")) {
          if ("color" in currentProps) {
            currentProps.color = "#f97316";
            aiResponse = `Đã cập nhật màu sắc sang màu cam ấm (#f97316) cho block ${currentSelectedBlock.label || currentSelectedBlock.type}!`;
            actionTaken = true;
          } else if ("ctaColor" in currentProps) {
            currentProps.ctaColor = "#f97316";
            aiResponse = `Đã cập nhật màu nút CTA sang màu cam ấm (#f97316) cho block ${currentSelectedBlock.label || currentSelectedBlock.type}!`;
            actionTaken = true;
          }
        }
        else if (normalizedText.includes("màu đỏ") || normalizedText.includes("red")) {
          if ("color" in currentProps) {
            currentProps.color = "#ef4444";
            aiResponse = `Đã đổi màu sắc sang màu đỏ (#ef4444) cho block ${currentSelectedBlock.label || currentSelectedBlock.type}!`;
            actionTaken = true;
          } else if ("ctaColor" in currentProps) {
            currentProps.ctaColor = "#ef4444";
            aiResponse = `Đã đổi màu nút CTA sang màu đỏ (#ef4444) cho block ${currentSelectedBlock.label || currentSelectedBlock.type}!`;
            actionTaken = true;
          }
        }
        else if (normalizedText.includes("màu đen") || normalizedText.includes("black")) {
          if ("color" in currentProps) {
            currentProps.color = "#000000";
            aiResponse = `Đã đổi màu sang màu đen (#000000) cho block ${currentSelectedBlock.label || currentSelectedBlock.type}!`;
            actionTaken = true;
          } else if ("bgColor" in currentProps) {
            currentProps.bgColor = "#0f172a";
            aiResponse = `Đã cập nhật nền tối màu sang đen tối (#0f172a) cho block ${currentSelectedBlock.label || currentSelectedBlock.type}!`;
            actionTaken = true;
          }
        }

        // 2. Change text/title instructions
        const titleMatch = text.match(/(?:tiêu đề|tên nút|chữ thành|đổi chữ|sửa chữ)\s+['"“](.+?)['"”]/i) 
          || text.match(/(?:tiêu đề|tên nút|chữ thành|đổi chữ|sửa chữ)\s+(.+)$/i);
        if (titleMatch) {
          const newText = titleMatch[1].trim();
          if ("headline" in currentProps) {
            currentProps.headline = newText;
            aiResponse = `Đã sửa tiêu đề chính thành: "${newText}"!`;
            actionTaken = true;
          } else if ("content" in currentProps) {
            currentProps.content = newText;
            aiResponse = `Đã cập nhật nội dung văn bản thành: "${newText}"!`;
            actionTaken = true;
          } else if ("label" in currentProps) {
            currentProps.label = newText;
            aiResponse = `Đã đổi nhãn nút thành: "${newText}"!`;
            actionTaken = true;
          } else if ("title" in currentProps) {
            currentProps.title = newText;
            aiResponse = `Đã đổi tiêu đề thành: "${newText}"!`;
            actionTaken = true;
          }
        }

        // 3. Alignments
        if (normalizedText.includes("căn giữa") || normalizedText.includes("center")) {
          if ("textAlign" in currentProps) {
            currentProps.textAlign = "center";
            aiResponse = `Đã căn giữa văn bản cho block ${currentSelectedBlock.label || currentSelectedBlock.type}.`;
            actionTaken = true;
          } else if ("align" in currentProps) {
            currentProps.align = "center";
            aiResponse = `Đã căn giữa nút cho block ${currentSelectedBlock.label || currentSelectedBlock.type}.`;
            actionTaken = true;
          }
        } else if (normalizedText.includes("căn trái") || normalizedText.includes("left")) {
          if ("textAlign" in currentProps) {
            currentProps.textAlign = "left";
            aiResponse = `Đã căn trái văn bản cho block ${currentSelectedBlock.label || currentSelectedBlock.type}.`;
            actionTaken = true;
          } else if ("align" in currentProps) {
            currentProps.align = "left";
            aiResponse = `Đã căn trái nút cho block ${currentSelectedBlock.label || currentSelectedBlock.type}.`;
            actionTaken = true;
          }
        }

        if (actionTaken) {
          handleUpdateBlock(blockId, currentProps);
        }
      }

      // 4. Page wide settings modifications
      if (!actionTaken) {
        if (normalizedText.includes("nền trang màu đen") || normalizedText.includes("page background black") || normalizedText.includes("nền đen")) {
          handleUpdatePageSettings("bgColor", "#09090b");
          aiResponse = "Đã cập nhật màu nền của toàn bộ Landing Page sang màu đen tuyền (#09090b).";
          actionTaken = true;
        } else if (normalizedText.includes("nền trang màu trắng") || normalizedText.includes("nền trắng")) {
          handleUpdatePageSettings("bgColor", "#ffffff");
          aiResponse = "Đã trả màu nền Landing Page về màu trắng tinh khôi (#ffffff).";
          actionTaken = true;
        } else if (normalizedText.includes("font") || normalizedText.includes("phông chữ")) {
          handleUpdatePageSettings("fontFamily", "Georgia, serif");
          aiResponse = "Đã chuyển font chữ toàn bộ trang sang phông Georgia sang trọng.";
          actionTaken = true;
        }
      }

      // 5. Block creation via AI
      if (!actionTaken) {
        if (normalizedText.includes("thêm block") || normalizedText.includes("tạo block") || normalizedText.includes("add block")) {
          let typeToAdd: BlockType = "text";
          if (normalizedText.includes("countdown") || normalizedText.includes("đếm ngược")) {
            typeToAdd = "countdown";
          } else if (normalizedText.includes("video")) {
            typeToAdd = "video";
          } else if (normalizedText.includes("button") || normalizedText.includes("nút")) {
            typeToAdd = "button";
          } else if (normalizedText.includes("hero")) {
            typeToAdd = "hero";
          } else if (normalizedText.includes("form") || normalizedText.includes("thu thập")) {
            typeToAdd = "form_capture";
          }
          
          handleAddBlock(typeToAdd);
          aiResponse = `Tôi đã tạo và chèn thêm một block ${typeToAdd.toUpperCase()} mới vào cuối trang cho bạn!`;
          actionTaken = true;
        }
      }

      if (!actionTaken) {
        aiResponse = "Tôi đã hiểu ý tưởng thiết kế của bạn. Hãy chọn một block cụ thể (như Hero, Text, Nút CTA) để tôi có thể chỉnh sửa chính xác các chi tiết hoặc màu sắc của block đó!";
      }

      const aiMsg = { sender: "ai" as const, text: aiResponse, timestamp: new Date().toLocaleTimeString() };
      setChatHistory(prev => [...prev, aiMsg]);
      setIsAiTyping(false);
    }, 1000);
  }, [selectedId, data.blocks, handleUpdateBlock, handleUpdatePageSettings, handleAddBlock]);

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
      if (ctrlMeta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, selectedId, handleDeleteBlock, handleDuplicateBlock]);

  // ── Publish handler ───────────────────────────────────────────
  const handlePublish = () => {
    saveSnapshot();
    showToast("Đã xuất bản trang thành công! 🎉");
    if (onPublish) onPublish({ ...page, name: pageName, status: "PUBLISHED" });
  };

  // ── Selected block ────────────────────────────────────────────
  const downloadFile = useCallback((fileName: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleManualSave = useCallback(() => {
    saveSnapshot();
    showToast("Da luu ban thiet ke", "success");
  }, [saveSnapshot]);

  const handleExportJson = useCallback(() => {
    const snapshot = createEditorSnapshot({ ...data, pageName }, actionLog);
    downloadFile(`${pageName || "landing-page"}.json`, JSON.stringify(snapshot, null, 2), "application/json");
    showToast("Da xuat JSON", "success");
  }, [actionLog, data, downloadFile, pageName]);

  const handleExportHtml = useCallback(() => {
    const html = renderLandingPageHtml({ ...data, pageName });
    downloadFile(`${pageName || "landing-page"}.html`, html, "text/html");
    showToast("Da xuat HTML", "success");
  }, [data, downloadFile, pageName]);

  const handleImportJson = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const snapshot = JSON.parse(String(reader.result)) as LandingEditorSnapshot;
        if (!snapshot?.data?.blocks || !snapshot?.data?.pageSettings) {
          throw new Error("Invalid landing page snapshot");
        }
        applySnapshot({
          ...snapshot,
          data: {
            ...snapshot.data,
            pageId: page.id,
            pageName: snapshot.data.pageName || pageName,
          },
        });
        showToast("Da import ban thiet ke", "success");
      } catch {
        showToast("File JSON khong hop le", "info");
      }
    };
    reader.readAsText(file);
  }, [applySnapshot, page.id, pageName]);

  const persistRevisions = useCallback((nextRevisions: EditorRevision[]) => {
    const trimmed = nextRevisions.slice(0, 30);
    setRevisions(trimmed);
    localStorage.setItem(revisionsKey, JSON.stringify(trimmed));
  }, [revisionsKey]);

  const handleCreateRevision = useCallback((name?: string) => {
    const snapshot = createEditorSnapshot({ ...data, pageName }, actionLog);
    const revision: EditorRevision = {
      id: `rev_${Date.now()}`,
      name: name?.trim() || `Version ${new Date().toLocaleString("vi-VN")}`,
      snapshot,
      createdAt: snapshot.updatedAt,
    };
    persistRevisions([revision, ...revisions]);
    showToast("Da tao version", "success");
  }, [actionLog, data, pageName, persistRevisions, revisions]);

  const handleRestoreRevision = useCallback((revision: EditorRevision) => {
    applySnapshot(revision.snapshot);
    saveSnapshot(revision.snapshot.data, revision.snapshot.actions);
    showToast("Da khoi phuc version", "success");
  }, [applySnapshot, saveSnapshot]);

  const handleClearCanvas = useCallback(() => {
    if (!confirm("Xoa tat ca block tren trang nay?")) return;
    push(normalizeEditorData({ ...data, blocks: [] }));
    setSelectedId(null);
    recordAction({ type: "update-page-settings", key: "clear-canvas", timestamp: Date.now() });
    showToast("Da xoa canvas", "info");
  }, [data, push, recordAction]);

  const selectedBlock = selectedId ? data.blocks.find((b) => b.id === selectedId) ?? null : null;
  const sandboxPreviewUrl = data.pageSettings.sandboxUrl
    || (data.pageSettings.sandboxProvider === "codesandbox" && data.pageSettings.sandboxId
      ? `https://${data.pageSettings.sandboxId}-${data.pageSettings.sandboxPort}.csb.app`
      : `${data.pageSettings.customDomain || "local-preview"}${data.pageSettings.previewPath || "/"}`);
  const previewHtml = renderLandingPageHtml({ ...data, pageName });
  const codeView = JSON.stringify(createEditorSnapshot({ ...data, pageName }, actionLog), null, 2);

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
          onSave={handleManualSave}
          onCreateRevision={() => handleCreateRevision()}
          onOpenCommand={() => setIsCommandOpen(true)}
          onImportJson={() => importInputRef.current?.click()}
          onExportJson={handleExportJson}
          onExportHtml={handleExportHtml}
          onPublish={handlePublish}
          isSaved={isSaved}
          lastSavedAt={lastSavedAt}
          activeViewMode={activeViewMode}
          setActiveViewMode={setActiveViewMode}
          blockCount={data.blocks.length}
        />
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImportJson}
        />

        {/* 3-column editor body */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT SIDEBAR STRIP + WIDE PANEL */}
          <div className="flex flex-shrink-0 bg-[#111118] border-r border-gray-800/80 h-full overflow-hidden select-none">
            {/* Narrow sidebar strip */}
            <div className="w-14 bg-[#0a0a0f] border-r border-gray-800/80 flex flex-col items-center py-4 gap-4 flex-shrink-0 select-none">
              {sidebarTabs.map((tabItem) => {
                const isActive = activeTab === tabItem.id;
                return (
                  <button
                    key={tabItem.id}
                    onClick={() => setActiveTab(tabItem.id)}
                    title={tabItem.label}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    {tabItem.icon}
                  </button>
                );
              })}
            </div>

            {/* Wide Panel Content */}
            <div className="w-60 flex flex-col h-full bg-[#111118] overflow-hidden">
              {activeTab === "layers" && (
                <LayersPanel
                  blocks={data.blocks}
                  selectedId={selectedId}
                  onSelectBlock={handleSelectBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onAddBlock={handleAddBlock}
                />
              )}
              {activeTab === "brand" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-800/60">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-1.178-.256H5.25a2.25 2.25 0 00-2.25 2.25v1.875c0 .345.029.689.086 1.026a3.385 3.385 0 006.084 1.15l.982-1.656a3 3 0 00.57-1.56h.03c.105 0 .21-.005.312-.015" />
                    </svg>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cấu hình Brand & Trang</h3>
                  </div>
                  <PageSettingsPanel settings={data.pageSettings} onUpdateSettings={handleUpdatePageSettings} />
                </div>
              )}
              {activeTab === "pages" && (
                <div className="flex-1 flex flex-col h-full overflow-hidden p-4">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800/60 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Danh sách Trang</h3>
                    </div>
                    <button
                      onClick={() => {
                        const name = prompt("Nhập tên trang mới:");
                        if (name && name.trim()) {
                          const newPg = onCreatePage?.(name.trim());
                          if (newPg && onSwitchPage) onSwitchPage(newPg);
                        }
                      }}
                      className="cursor-pointer text-xs font-bold text-purple-400 hover:text-purple-300 transition"
                    >
                      + Mới
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-1.5">
                    {pages?.map((p) => {
                      const isCurrent = p.id === page.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (!isCurrent && onSwitchPage) {
                              onSwitchPage(p);
                            }
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer border transition-all ${
                            isCurrent
                              ? "bg-purple-600/20 text-purple-300 border-purple-500/40 font-semibold"
                              : "border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-300"
                          }`}
                        >
                          <span className="truncate flex-1">{p.name}</span>
                          {isCurrent ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500 flex-shrink-0 ml-2" />
                          ) : onDeletePage ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Bạn có chắc chắn muốn xóa trang "${p.name}"?`)) {
                                  onDeletePage(p.id);
                                }
                              }}
                              className="text-gray-600 hover:text-red-450 p-1 transition ml-2 cursor-pointer"
                              title="Xóa trang"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {activeTab === "images" && (
                <div className="flex-1 flex flex-col h-full overflow-hidden p-4">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800/60 flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M21 3H3" />
                    </svg>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thư viện Ảnh</h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2">
                    {[
                      { name: "Cosmetics", url: "/images/template_cosmetics.png" },
                      { name: "Wedding", url: "/images/template_wedding.png" },
                      { name: "Herb Tea", url: "/images/template_tea.png" },
                      { name: "Smartwatch", url: "/images/template_electronics.png" },
                    ].map((img, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          navigator.clipboard.writeText(img.url);
                          showToast(`Đã copy link ảnh: ${img.name}`);
                        }}
                        className="group relative cursor-pointer aspect-square rounded-lg border border-gray-850 overflow-hidden bg-gray-900 hover:border-purple-500/50 transition"
                        title="Click để copy URL ảnh"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/75 px-1.5 py-1 text-[9px] text-gray-300 truncate">
                          {img.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "sandbox" && (
                <div className="flex-1 flex flex-col h-full overflow-hidden p-4">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800/60 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25M21 7.5v9l-9 5.25m0-9L3 7.5m9 5.25v9M3 7.5v9l9 5.25" />
                      </svg>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sandbox & Publish</h3>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      data.pageSettings.sandboxStatus === "ready"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : data.pageSettings.sandboxStatus === "error"
                        ? "bg-red-500/15 text-red-300"
                        : "bg-amber-500/15 text-amber-300"
                    }`}>
                      {data.pageSettings.sandboxStatus}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4">
                    <div className="rounded-lg border border-gray-800 bg-white/[0.03] p-3 space-y-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Preview Environment</div>
                      <select
                        value={data.pageSettings.sandboxProvider}
                        onChange={(e) => handleUpdatePageSettings("sandboxProvider", e.target.value)}
                        className="w-full rounded-lg border border-gray-700/50 bg-[#1a1a26] px-2.5 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                      >
                        <option value="local">Local iframe</option>
                        <option value="codesandbox">CodeSandbox</option>
                        <option value="vercel">Vercel Sandbox</option>
                      </select>
                      <input
                        value={data.pageSettings.sandboxId}
                        onChange={(e) => handleUpdatePageSettings("sandboxId", e.target.value)}
                        placeholder="sandbox id"
                        className="w-full rounded-lg border border-gray-700/50 bg-white/5 px-2.5 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={data.pageSettings.sandboxPort}
                          onChange={(e) => handleUpdatePageSettings("sandboxPort", Number(e.target.value) || 3000)}
                          className="rounded-lg border border-gray-700/50 bg-white/5 px-2.5 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                        />
                        <input
                          value={data.pageSettings.previewPath}
                          onChange={(e) => handleUpdatePageSettings("previewPath", e.target.value)}
                          placeholder="/landing-page"
                          className="rounded-lg border border-gray-700/50 bg-white/5 px-2.5 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div className="rounded-lg bg-black/30 p-2 font-mono text-[10px] text-gray-500 break-all">
                        {sandboxPreviewUrl}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            handleUpdatePageSettings("sandboxStatus", "ready");
                            showToast("Sandbox ready", "success");
                          }}
                          className="rounded-lg border border-purple-500/30 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/10"
                        >
                          Connect
                        </button>
                        <button
                          onClick={() => {
                            handleUpdatePageSettings("sandboxStatus", "connecting");
                            setTimeout(() => handleUpdatePageSettings("sandboxStatus", "ready"), 600);
                            showToast("Restart sandbox", "info");
                          }}
                          className="rounded-lg border border-gray-700 py-2 text-xs font-bold text-gray-300 hover:bg-white/5"
                        >
                          Restart
                        </button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-800 bg-white/[0.03] p-3 space-y-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">SEO & Tracking</div>
                      <input
                        value={data.pageSettings.seoTitle}
                        onChange={(e) => handleUpdatePageSettings("seoTitle", e.target.value)}
                        placeholder="SEO title"
                        className="w-full rounded-lg border border-gray-700/50 bg-white/5 px-2.5 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500"
                      />
                      <textarea
                        value={data.pageSettings.seoDescription}
                        onChange={(e) => handleUpdatePageSettings("seoDescription", e.target.value)}
                        placeholder="SEO description"
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-700/50 bg-white/5 px-2.5 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500"
                      />
                      <input
                        value={data.pageSettings.customDomain}
                        onChange={(e) => handleUpdatePageSettings("customDomain", e.target.value)}
                        placeholder="custom domain"
                        className="w-full rounded-lg border border-gray-700/50 bg-white/5 px-2.5 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500"
                      />
                      <input
                        value={data.pageSettings.pixelId}
                        onChange={(e) => handleUpdatePageSettings("pixelId", e.target.value)}
                        placeholder="Meta pixel / verification id"
                        className="w-full rounded-lg border border-gray-700/50 bg-white/5 px-2.5 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "history" && (
                <div className="flex-1 flex flex-col h-full overflow-hidden p-4">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800/60 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3.75 2.25M3.75 12a8.25 8.25 0 111.833 5.197M3.75 18v-4.5h4.5" />
                      </svg>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Action History</h3>
                    </div>
                    <span className="text-[10px] text-gray-500">{actionLog.length}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2">
                    <div className="rounded-lg border border-purple-500/20 bg-purple-950/10 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Versions</span>
                        <button
                          onClick={() => handleCreateRevision()}
                          className="text-[10px] font-bold text-purple-300 hover:text-purple-200"
                        >
                          + Save
                        </button>
                      </div>
                      {revisions.length === 0 ? (
                        <p className="text-[11px] text-gray-500">Chua co version nao.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {revisions.slice(0, 8).map((revision) => (
                            <div key={revision.id} className="flex items-center justify-between gap-2 rounded-md bg-white/[0.03] px-2 py-1.5">
                              <div className="min-w-0">
                                <div className="truncate text-[11px] font-semibold text-gray-300">{revision.name}</div>
                                <div className="text-[10px] text-gray-600">{new Date(revision.createdAt).toLocaleString("vi-VN")}</div>
                              </div>
                              <button
                                onClick={() => handleRestoreRevision(revision)}
                                className="flex-shrink-0 text-[10px] font-bold text-purple-300 hover:text-purple-200"
                              >
                                Restore
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {actionLog.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-800 p-4 text-xs text-gray-500 leading-relaxed">
                        Chua co thao tac nao.
                      </div>
                    ) : (
                      [...actionLog].reverse().map((action, index) => (
                        <div key={`${action.timestamp}-${index}`} className="rounded-lg border border-gray-800 bg-white/[0.03] p-2.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-gray-300 truncate">{formatActionLabel(action)}</span>
                            <span className="text-[10px] text-gray-600 flex-shrink-0">
                              {new Date(action.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          {"blockId" in action && (
                            <div className="mt-1 truncate font-mono text-[10px] text-gray-600">{action.blockId}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              {activeTab === "branches" && (
                <div className="flex-1 flex flex-col h-full overflow-hidden p-4">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800/60 flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <circle cx="18" cy="18" r="3" />
                      <circle cx="6" cy="6" r="3" />
                      <circle cx="6" cy="18" r="3" />
                      <path d="M18 15V9a4 4 0 0 0-4-4H9" />
                      <line x1="6" y1="9" x2="6" y2="15" />
                    </svg>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Git Branches</h3>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2">
                    <div className="bg-purple-950/20 border border-purple-500/20 p-2.5 rounded-lg text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono text-purple-300 font-semibold">main</span>
                      </div>
                      <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded uppercase">Active</span>
                    </div>

                    {["development", "feature-puck-editor", "staging"].map((br) => (
                      <div key={br} className="border border-gray-800 p-2.5 rounded-lg text-xs text-gray-500 hover:border-gray-700 hover:text-gray-400 transition cursor-pointer flex items-center justify-between">
                        <span className="font-mono">{br}</span>
                        <span className="text-[9px] text-gray-650 font-semibold">Offline</span>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        const name = prompt("Nhập tên branch mới:");
                        if (name) alert(`Đã tạo branch mới: ${name}`);
                      }}
                      className="w-full text-center text-xs text-purple-400 py-2 border border-purple-500/20 rounded-lg hover:bg-purple-500/5 transition mt-2 cursor-pointer"
                    >
                      + Create Branch
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CENTER — Canvas */}
          {activeViewMode === "code" ? (
            <div className="flex-1 overflow-auto bg-[#07070b] p-6">
              <pre className="min-h-full rounded-lg border border-gray-800 bg-[#0f0f16] p-4 text-xs leading-relaxed text-gray-300 whitespace-pre-wrap">
                {codeView}
              </pre>
            </div>
          ) : activeViewMode === "preview" ? (
            <div className="flex-1 overflow-auto bg-[#07070b] p-8">
              <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between gap-3 rounded-lg border border-gray-800 bg-[#111118] px-3 py-2 text-xs">
                <div className="min-w-0 truncate font-mono text-gray-500">{sandboxPreviewUrl}</div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${data.pageSettings.sandboxStatus === "ready" ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <span className="font-bold text-gray-400">{data.pageSettings.sandboxProvider}</span>
                </div>
              </div>
              <div className="flex items-start justify-center">
                <iframe
                  title="Landing page preview"
                  srcDoc={previewHtml}
                  sandbox="allow-modals allow-forms allow-same-origin allow-scripts allow-popups allow-downloads"
                  allow="geolocation; microphone; camera; midi; encrypted-media"
                  className="bg-white shadow-2xl"
                  style={{
                    width: DEVICE_WIDTHS[deviceMode],
                    minHeight: 720,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top center",
                  }}
                />
              </div>
            </div>
          ) : (
            <Canvas
              blocks={data.blocks}
              selectedId={selectedId}
              deviceMode={deviceMode}
              zoom={zoom}
              pageBgColor={data.pageSettings.bgColor}
              onSelectBlock={handleSelectBlock}
              onDropFromPalette={handleDropFromPalette}
              onMoveBlock={handleMoveBlock}
              onDeleteBlock={handleDeleteBlock}
              onDuplicateBlock={handleDuplicateBlock}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onUpdateBlock={handleUpdateBlock}
            />
          )}

          {/* RIGHT — Inspector / AI Copilot */}
          <div className="w-[344px] flex-shrink-0 flex flex-col bg-[#101016] border-l border-[#252535] h-full overflow-hidden">
            {/* Tab selector header */}
            <div className="px-3 py-2 border-b border-[#252535] flex items-center justify-between flex-shrink-0 bg-[#0b0b11] select-none">
              <div className="flex rounded-md border border-[#252535] bg-[#0e0e15] p-0.5">
                {(["chat", "inspector"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setRightTab(tab)}
                    className={`rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition ${
                      rightTab === tab
                        ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {tab === "chat" ? "Chat AI" : "Inspect"}
                  </button>
                ))}
              </div>

              {rightTab === "chat" && (
                <button
                  onClick={() => setChatHistory([])}
                  className="cursor-pointer rounded-md border border-purple-500/20 px-2 py-1 text-[10px] font-bold text-purple-300 hover:bg-purple-500/10 transition"
                >
                  New
                </button>
              )}
            </div>

            {/* Content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {rightTab === "inspector" ? (
                <InspectorPanel
                  selectedBlock={selectedBlock}
                  pageSettings={data.pageSettings}
                  onUpdateBlock={handleUpdateBlock}
                  onUpdatePageSettings={handleUpdatePageSettings}
                />
              ) : (
                /* Chat view */
                <div className="flex-1 flex flex-col overflow-hidden bg-[#0b0b12] relative">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.length === 0 ? (
                      /* Empty state: Select element to chat with AI */
                      <div className="flex flex-col items-center justify-center h-full text-center p-6 select-none">
                        <div className="w-14 h-14 border border-dashed border-[#3a3a4d] rounded-xl flex items-center justify-center mb-4 text-purple-300/70 bg-purple-500/5">
                          <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m0 0l-1.5-1.5M12 4.5l1.5-1.5" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-300">Select an element</p>
                        <p className="text-xs text-gray-500 mt-1.5 max-w-[220px] leading-relaxed">
                          Chọn một khối trên Canvas hoặc nhập yêu cầu chỉnh sửa giao diện ở dưới!
                        </p>
                      </div>
                    ) : (
                      /* Chat message history */
                      <div className="space-y-3.5">
                        {selectedBlock && (
                          <div className="bg-purple-950/20 border border-purple-500/20 p-2 rounded-lg text-[10px] text-purple-300 flex items-center gap-1.5 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            Đang chọn chỉnh sửa: <span className="font-bold">{selectedBlock.label || selectedBlock.type}</span>
                          </div>
                        )}
                        
                        {chatHistory.map((msg, i) => {
                          const isUser = msg.sender === "user";
                          return (
                            <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                              <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                                isUser
                                  ? "bg-purple-600 text-white rounded-tr-none"
                                  : "bg-white/5 text-gray-300 border border-gray-800/80 rounded-tl-none"
                              }`}>
                                {msg.text}
                              </div>
                              <span className="text-[9px] text-gray-500 mt-1 px-1">{msg.timestamp}</span>
                            </div>
                          );
                        })}

                        {isAiTyping && (
                          <div className="flex items-center gap-1 text-gray-500 text-xs pl-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Input area */}
                  <div className="p-3 border-t border-[#252535] bg-[#0b0b11] flex-shrink-0">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (chatInput.trim()) {
                          handleSendChatMessage(chatInput);
                          setChatInput("");
                        }
                      }}
                      className="relative flex items-center rounded-lg border border-[#2b2b3c] bg-[#101018] px-3 py-2 focus-within:border-purple-500 transition-all"
                    >
                      <textarea
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={selectedBlock ? `Yêu cầu sửa block này...` : `Hỏi AI chỉnh sửa giao diện...`}
                        rows={1}
                        className="flex-1 bg-transparent text-xs text-gray-300 placeholder-gray-600 focus:outline-none resize-none no-scrollbar py-1 pr-6"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (chatInput.trim()) {
                              handleSendChatMessage(chatInput);
                              setChatInput("");
                            }
                          }
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="cursor-pointer absolute right-2 text-purple-400 hover:text-purple-300 transition-all disabled:opacity-30"
                      >
                        <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                      </button>
                    </form>
                  </div>

                  {/* Quick AI action */}
                  <div className="absolute right-4 bottom-16 select-none cursor-pointer group">
                    <div className="w-9 h-9 rounded-md border border-purple-500/30 bg-[#141421] flex items-center justify-center shadow-lg shadow-black/30 hover:border-purple-400 transition-all">
                      <svg className="h-4 w-4 text-purple-300" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4m0 10v4m9-9h-4M7 12H3m14.657-5.657-2.829 2.829M9.172 14.828l-2.829 2.829m11.314 0-2.829-2.829M9.172 9.172 6.343 6.343" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isCommandOpen && (
          <div className="absolute inset-0 z-[9998] flex items-start justify-center bg-black/50 pt-24" onClick={() => setIsCommandOpen(false)}>
            <div
              className="w-[520px] max-w-[calc(100vw-32px)] overflow-hidden rounded-xl border border-gray-800 bg-[#111118] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-800 px-4 py-3">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Command Palette</div>
                <div className="mt-1 text-sm font-semibold text-gray-200">{pageName}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                {[
                  { label: "Add Hero", action: () => handleAddBlock("hero") },
                  { label: "Add Form", action: () => handleAddBlock("form_capture") },
                  { label: "Save", action: handleManualSave },
                  { label: "Create Version", action: () => handleCreateRevision() },
                  { label: "Preview", action: () => setActiveViewMode("preview") },
                  { label: "Code", action: () => setActiveViewMode("code") },
                  { label: "Open Sandbox Panel", action: () => setActiveTab("sandbox") },
                  { label: "Connect Sandbox", action: () => handleUpdatePageSettings("sandboxStatus", "ready") },
                  { label: "Export JSON", action: handleExportJson },
                  { label: "Export HTML", action: handleExportHtml },
                  { label: "Clear Canvas", action: handleClearCanvas },
                ].map((command) => (
                  <button
                    key={command.label}
                    onClick={() => {
                      command.action();
                      setIsCommandOpen(false);
                    }}
                    className="rounded-lg border border-gray-800 bg-white/[0.03] px-3 py-2 text-left text-xs font-semibold text-gray-300 transition hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-white"
                  >
                    {command.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-800 px-4 py-2 text-[10px] text-gray-600">Ctrl+K de mo nhanh</div>
            </div>
          </div>
        )}

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
