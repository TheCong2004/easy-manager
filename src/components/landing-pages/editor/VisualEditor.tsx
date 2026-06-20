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
import { InspectorPanel } from "./InspectorPanel";
import { LANDING_ASSETS, LANDING_TEMPLATE_PRESETS, instantiateTemplateBlocks, resolveTemplatePresetId } from "./template-library";
import { LandingPageItem } from "../dung-chung/types";
import { FUNNELX_FLAGS } from "@onlook/funnel";

// Import modular split sub-panels
import { PageListingPanel } from "./panels/PageListingPanel";
import { BrandingPanel } from "./panels/BrandingPanel";
import { TemplatesAssetsPanel } from "./panels/TemplatesAssetsPanel";
import { FunnelPanel } from "./panels/FunnelPanel";
import { SandboxPanel } from "./panels/SandboxPanel";
import { HistoryPanel } from "./panels/HistoryPanel";
import { BranchesPanel } from "./panels/BranchesPanel";
import { AIChatPanel } from "./panels/AIChatPanel";

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

function buildInitialData(page: LandingPageItem): EditorData {
  const presetId = resolveTemplatePresetId(page);
  const presetBlocks = instantiateTemplateBlocks(presetId);

  return {
    pageId: page.id,
    pageName: page.name,
    blocks: presetBlocks.length > 0
      ? presetBlocks
      : [
          ensureOnlookBlockMeta(createDefaultBlock("hero")),
          ensureOnlookBlockMeta(createDefaultBlock("countdown")),
          ensureOnlookBlockMeta(createDefaultBlock("columns")),
        ],
    pageSettings: createDefaultPageSettings(page.name),
  };
}

function isUntouchedStarterData(data: EditorData): boolean {
  const [first, second, third] = data.blocks;
  const defaultStarter = data.blocks.length === 3
    && first?.type === "hero"
    && second?.type === "countdown"
    && third?.type === "columns"
    && (first.label === "Hero Section" || first.componentName === "HeroBlock");
  const oldImageBackdropPreset = first?.type === "hero"
    && typeof first.props?.bgImage === "string"
    && first.props.bgImage.includes("template_");

  return (defaultStarter || oldImageBackdropPreset)
    && !data.pageSettings.customDomain
    && !data.pageSettings.pixelId;
}

function isLegacyTemplateData(data: EditorData, page: LandingPageItem): boolean {
  const presetId = resolveTemplatePresetId(page);
  const pagePresetIds = new Set(LANDING_TEMPLATE_PRESETS.filter((preset) => preset.category === "page").map((preset) => preset.id));

  if (page.templateId && pagePresetIds.has(page.templateId) && isUntouchedStarterData(data)) return true;

  if (presetId === "herb-tea") {
    const teaBlocks = data.blocks.filter((block) => block.type === "tea_landing");
    if (teaBlocks.length !== 1 || data.blocks.length !== 1) return true;
  }
  if (presetId !== "herb-tea") return false;

  return data.blocks.some((block) => {
    const props = block.props as Record<string, unknown>;
    return block.label?.toLowerCase().includes("herb")
      || block.label?.toLowerCase().includes("zen green")
      || String(props.src ?? props.bgImage ?? "").includes("template_tea")
      || String(props.title ?? props.headline ?? "").toLowerCase().includes("green tea");
  });
}

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
      return `Đã chèn ${action.blockType} tại ${action.index + 1}`;
    case "remove-element":
      return `Đã xóa khối ${action.blockType}`;
    case "move-element":
      return `Di chuyển khối ${action.fromIndex + 1} -> ${action.toIndex + 1}`;
    case "update-props":
      return `Cập nhật ${action.blockType}: ${action.keys.join(", ") || "thuộc tính"}`;
    case "update-page-settings":
      return `Cài đặt trang: ${action.key}`;
    default:
      return "Thao tác chỉnh sửa";
  }
}

interface EditorRevision {
  id: string;
  name: string;
  snapshot: LandingEditorSnapshot;
  createdAt: string;
}

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

  const [activeTab, setActiveTab] = useState<"layers" | "brand" | "pages" | "images" | "funnel" | "sandbox" | "history" | "branches">("layers");

  const sidebarTabs = [
    {
      id: "layers",
      label: "Layers & Thêm phần tử",
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
      label: "Templates & Assets",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
    {
      id: "funnel",
      label: "Funnel & Logic",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 5.25h15l-6 7.125v4.875l-3 1.5v-6.375L4.5 5.25z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h3m-1.5-1.5v3" />
        </svg>
      ),
    },
    {
      id: "history",
      label: "Lịch sử & Bản lưu",
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
      label: "Branches Git",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
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
          if (isUntouchedStarterData(snapshot.data) || isLegacyTemplateData(snapshot.data, page)) {
            applySnapshot(createEditorSnapshot(buildInitialData(page), []));
          } else {
            applySnapshot(snapshot);
          }
        }
      }
    } catch {
      localStorage.setItem(storageKey, JSON.stringify(createEditorSnapshot(buildInitialData(page), [])));
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

  const handleAddBlock = useCallback((blockType: BlockType, customProps?: Record<string, unknown>) => {
    const defaultBlock = createDefaultBlock(blockType);
    const newBlock = ensureOnlookBlockMeta({
      ...defaultBlock,
      props: {
        ...defaultBlock.props,
        ...customProps,
      },
    });
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
    showToast("Đã xóa khối", "info");
  }, [data, push, recordAction, selectedId, handleSelectBlock]);

  const handleDuplicateBlock = useCallback((id: string) => {
    const index = data.blocks.findIndex((b) => b.id === id);
    if (index === -1) return;
    const original = data.blocks[index];
    const cloned: EditorBlock = {
      ...original,
      id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      props: JSON.parse(JSON.stringify(original.props)), // deep copy props
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

  const handleUpdatePageSettings = useCallback((key: string, value: string | number | boolean) => {
    push({ ...data, pageSettings: { ...data.pageSettings, [key]: value } });
    recordAction({ type: "update-page-settings", key, timestamp: Date.now() });
  }, [data, push, recordAction]);

  const handleSendChatMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const userMsg = { sender: "user" as const, text, timestamp: new Date().toLocaleTimeString() };
    setChatHistory(prev => [...prev, userMsg]);
    setIsAiTyping(true);

    setTimeout(() => {
      let aiResponse = "Tôi đã tiếp nhận yêu cầu và đang tối ưu hóa thiết kế cho bạn.";
      let actionTaken = false;

      const normalizedText = text.toLowerCase().trim();
      const currentSelectedBlock = selectedId ? data.blocks.find(b => b.id === selectedId) : null;

      if (currentSelectedBlock) {
        const blockId = currentSelectedBlock.id;
        const currentProps = { ...currentSelectedBlock.props };

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
        }

        if (actionTaken) {
          handleUpdateBlock(blockId, currentProps);
        }
      }

      if (!actionTaken) {
        if (normalizedText.includes("nền trang màu đen") || normalizedText.includes("nền đen")) {
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
          aiResponse = `Tôi đã tạo và chèn thêm một khối ${typeToAdd.toUpperCase()} mới vào cuối trang cho bạn!`;
          actionTaken = true;
        }
      }

      if (!actionTaken) {
        aiResponse = "Tôi đã hiểu ý tưởng thiết kế của bạn. Hãy chọn một khối cụ thể (như Hero, Text, Nút CTA) để tôi có thể chỉnh sửa chính xác các chi tiết hoặc màu sắc của khối đó!";
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

  const handlePublish = () => {
    saveSnapshot();
    showToast("Đã xuất bản trang thành công! 🎉", "success");
    if (onPublish) onPublish({ ...page, name: pageName, status: "PUBLISHED" });
  };

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
    showToast("Đã lưu bản thiết kế thiết kế", "success");
  }, [saveSnapshot]);

  const handleExportJson = useCallback(() => {
    const snapshot = createEditorSnapshot({ ...data, pageName }, actionLog);
    downloadFile(`${pageName || "landing-page"}.json`, JSON.stringify(snapshot, null, 2), "application/json");
    showToast("Đã xuất file JSON", "success");
  }, [actionLog, data, downloadFile, pageName]);

  const handleExportHtml = useCallback(() => {
    const html = renderLandingPageHtml({ ...data, pageName });
    downloadFile(`${pageName || "landing-page"}.html`, html, "text/html");
    showToast("Đã xuất file HTML", "success");
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
        showToast("Đã import bản thiết kế thành công", "success");
      } catch {
        showToast("File JSON không hợp lệ", "info");
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
      name: name?.trim() || `Phiên bản ngày ${new Date().toLocaleString("vi-VN")}`,
      snapshot,
      createdAt: snapshot.updatedAt,
    };
    persistRevisions([revision, ...revisions]);
    showToast("Đã tạo điểm lưu thành công", "success");
  }, [actionLog, data, pageName, persistRevisions, revisions]);

  const handleRestoreRevision = useCallback((revision: EditorRevision) => {
    applySnapshot(revision.snapshot);
    saveSnapshot(revision.snapshot.data, revision.snapshot.actions);
    showToast("Đã khôi phục thiết kế", "success");
  }, [applySnapshot, saveSnapshot]);

  const handleClearCanvas = useCallback(() => {
    if (!confirm("Bạn có muốn xóa tất cả các block trên trang này?")) return;
    push(normalizeEditorData({ ...data, blocks: [] }));
    setSelectedId(null);
    recordAction({ type: "update-page-settings", key: "clear-canvas", timestamp: Date.now() });
    showToast("Đã dọn sạch canvas", "info");
  }, [data, push, recordAction]);

  const handleApplyTemplate = useCallback((templateId: string, mode: "append" | "replace" = "append") => {
    const templateBlocks = instantiateTemplateBlocks(templateId);
    if (templateBlocks.length === 0) return;
    if (mode === "replace" && data.blocks.length > 0 && !confirm("Thay toàn bộ canvas bằng mẫu này?")) return;

    const nextBlocks = mode === "replace" ? templateBlocks : [...data.blocks, ...templateBlocks];
    push(normalizeEditorData({ ...data, blocks: nextBlocks }));
    templateBlocks.forEach((block, offset) => {
      recordAction({
        type: "insert-element",
        blockId: block.id,
        blockType: block.type,
        index: mode === "replace" ? offset : data.blocks.length + offset,
        timestamp: Date.now(),
      });
    });
    handleSelectBlock(templateBlocks[0].id);
    showToast(mode === "replace" ? "Đã áp dụng mẫu trang mới" : "Đã chèn mẫu thiết kế", "success");
  }, [data, handleSelectBlock, push, recordAction]);

  const handleUseAsset = useCallback((url: string, name: string) => {
    if (selectedId) {
      const current = data.blocks.find((block) => block.id === selectedId);
      if (current?.type === "image") {
        handleUpdateBlock(current.id, { ...current.props, src: url, alt: name });
        showToast(`Đã gán ảnh ${name}`, "success");
        return;
      }
      if (current?.type === "hero") {
        handleUpdateBlock(current.id, { ...current.props, bgImage: url });
        showToast(`Đã gán ảnh nền ${name}`, "success");
        return;
      }
      if (current?.type === "testimonial") {
        handleUpdateBlock(current.id, { ...current.props, authorAvatar: url });
        showToast(`Đã gán avatar ${name}`, "success");
        return;
      }
    }

    navigator.clipboard?.writeText(url);
    showToast(`Đã copy link ảnh: ${name}`, "info");
  }, [data.blocks, handleUpdateBlock, selectedId]);

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
        className="fixed inset-0 z-[999999] flex flex-col bg-gray-50 text-gray-800"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Top bar (Light Theme already) */}
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
          <div className="flex flex-shrink-0 bg-white border-r border-gray-200 h-full overflow-hidden select-none">
            {/* Narrow sidebar strip */}
            <div className="w-14 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-4 flex-shrink-0 select-none">
              {sidebarTabs.map((tabItem) => {
                const isActive = activeTab === tabItem.id;
                return (
                  <button
                    key={tabItem.id}
                    onClick={() => setActiveTab(tabItem.id)}
                    title={tabItem.label}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                        : "text-gray-400 hover:text-gray-800 hover:bg-gray-200/50"
                    }`}
                  >
                    {tabItem.icon}
                  </button>
                );
              })}
            </div>

            {/* Wide Panel Content */}
            <div className={`${activeTab === "layers" ? "w-[420px]" : "w-64"} flex flex-shrink-0 flex-col h-full bg-white border-r border-gray-200 overflow-hidden transition-all duration-200`}>
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
                <BrandingPanel settings={data.pageSettings} onUpdateSettings={handleUpdatePageSettings} />
              )}
              {activeTab === "pages" && (
                <PageListingPanel
                  page={page}
                  pages={pages}
                  onSwitchPage={onSwitchPage}
                  onCreatePage={onCreatePage}
                  onDeletePage={onDeletePage}
                />
              )}
              {activeTab === "images" && (
                <TemplatesAssetsPanel onApplyTemplate={handleApplyTemplate} onUseAsset={handleUseAsset} />
              )}
              {activeTab === "funnel" && (
                <FunnelPanel settings={data.pageSettings} onUpdateSettings={handleUpdatePageSettings} />
              )}
              {activeTab === "sandbox" && (
                <SandboxPanel
                  settings={data.pageSettings}
                  onUpdateSettings={handleUpdatePageSettings}
                  sandboxPreviewUrl={sandboxPreviewUrl}
                  showToast={showToast}
                />
              )}
              {activeTab === "history" && (
                <HistoryPanel
                  actionLog={actionLog}
                  revisions={revisions}
                  onCreateRevision={() => handleCreateRevision()}
                  onRestoreRevision={handleRestoreRevision}
                  formatActionLabel={formatActionLabel}
                />
              )}
              {activeTab === "branches" && (
                <BranchesPanel />
              )}
            </div>
          </div>

          {/* CENTER — Canvas */}
          {activeViewMode === "code" ? (
            <div className="flex-1 overflow-auto bg-gray-100 p-6">
              <pre className="min-h-full rounded-lg border border-gray-200 bg-white p-4 text-xs leading-relaxed text-gray-800 whitespace-pre-wrap font-mono shadow-sm">
                {codeView}
              </pre>
            </div>
          ) : activeViewMode === "preview" ? (
            <div className="flex-1 overflow-auto bg-gray-150 p-8">
              <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm">
                <div className="min-w-0 truncate font-mono text-gray-500">{sandboxPreviewUrl}</div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${data.pageSettings.sandboxStatus === "ready" ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <span className="font-bold text-gray-600">{data.pageSettings.sandboxProvider.toUpperCase()}</span>
                </div>
              </div>
              <div className="flex items-start justify-center">
                <iframe
                  title="Landing page preview"
                  srcDoc={previewHtml}
                  sandbox="allow-modals allow-forms allow-same-origin allow-scripts allow-popups allow-downloads"
                  allow="geolocation; microphone; camera; midi; encrypted-media"
                  className="bg-white shadow-2xl rounded-lg border border-gray-200"
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
          <div className="w-[344px] flex-shrink-0 flex flex-col bg-white border-l border-gray-200 h-full overflow-hidden">
            {/* Tab selector header */}
            <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-gray-50 select-none">
              <div className="flex rounded-md border border-gray-250 bg-gray-100 p-0.5">
                {(["chat", "inspector"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setRightTab(tab)}
                    className={`rounded px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest transition ${
                      rightTab === tab
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {tab === "chat" ? "Chat AI" : "Inspect"}
                  </button>
                ))}
              </div>

              {rightTab === "chat" && (
                <button
                  onClick={() => setChatHistory([])}
                  className="cursor-pointer rounded-md border border-purple-500/20 bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700 hover:bg-purple-100 transition shadow-sm"
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
                <AIChatPanel
                  chatHistory={chatHistory}
                  setChatHistory={setChatHistory}
                  selectedBlock={selectedBlock}
                  chatInput={chatInput}
                  setChatInput={setChatInput}
                  isAiTyping={isAiTyping}
                  handleSendChatMessage={handleSendChatMessage}
                />
              )}
            </div>
          </div>
        </div>

        {/* Command Palette */}
        {isCommandOpen && (
          <div className="absolute inset-0 z-[9998] flex items-start justify-center bg-black/30 pt-24" onClick={() => setIsCommandOpen(false)}>
            <div
              className="w-[520px] max-w-[calc(100vw-32px)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Command Palette</div>
                <div className="mt-1 text-sm font-bold text-gray-850">{pageName}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3 bg-white">
                {[
                  { label: "Add Hero Section", action: () => handleAddBlock("hero") },
                  { label: "Add Form Capture", action: () => handleAddBlock("form_capture") },
                  { label: "Save Design", action: handleManualSave },
                  { label: "Create Revision Point", action: () => handleCreateRevision() },
                  { label: "Preview Mode", action: () => setActiveViewMode("preview") },
                  { label: "Code View Mode", action: () => setActiveViewMode("code") },
                  { label: "Open Sandbox Config", action: () => setActiveTab("sandbox") },
                  { label: "Connect Sandbox", action: () => handleUpdatePageSettings("sandboxStatus", "ready") },
                  { label: "Export JSON Design", action: handleExportJson },
                  { label: "Export HTML Bundle", action: handleExportHtml },
                  { label: "Clear Canvas Blocks", action: handleClearCanvas },
                ].map((command) => (
                  <button
                    key={command.label}
                    onClick={() => {
                      command.action();
                      setIsCommandOpen(false);
                    }}
                    className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-700 transition hover:border-purple-500/50 hover:bg-purple-50 hover:text-purple-700"
                  >
                    {command.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-2.5 text-[10px] text-gray-400 font-semibold">
                Bấm Ctrl+K để mở nhanh
              </div>
            </div>
          </div>
        )}

        {/* Toast notifications */}
        {toast && <Toast message={toast.message} type={toast.type} />}

        {/* Keyboard shortcuts hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 font-semibold pointer-events-none select-none bg-white/90 border border-gray-200 shadow px-3 py-1 rounded-full hidden lg:block">
          Delete — xóa block &nbsp;·&nbsp; Ctrl+D — nhân đôi &nbsp;·&nbsp; Ctrl+Z — hoàn tác &nbsp;·&nbsp; Esc — bỏ chọn
        </div>
      </div>
    </DndProvider>
  );
};
