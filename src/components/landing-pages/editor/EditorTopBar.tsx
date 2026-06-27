"use client";
import React from "react";
import { DeviceMode } from "./types";

interface EditorTopBarProps {
  pageName: string;
  setPageName: (name: string) => void;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClose: () => void;
  onSave: () => void;
  onCreateRevision: () => void;
  onOpenCommand: () => void;
  onImportJson: () => void;
  onImportHtml: () => void;
  onExportJson: () => void;
  onExportHtml: () => void;
  onPublish: () => void;
  onUnpublish?: () => void;
  isSaved: boolean;
  isSaving?: boolean;
  lastSavedAt?: string | null;
  activeViewMode: "design" | "code" | "preview";
  setActiveViewMode: (mode: "design" | "code" | "preview") => void;
  blockCount: number;
  /** Trạng thái bảo mật: 'draft' | 'published' | 'archived' */
  pageStatus?: string;
  /** Trạng thái hiển thị: 'private' | 'public' */
  pageVisibility?: string;
  /** Slug của trang (dùng để tạo public link /p/[slug]) */
  pageSlug?: string | null;
}

const ZOOM_PRESETS = [0.5, 0.75, 1, 1.25, 1.5];

export const EditorTopBar: React.FC<EditorTopBarProps> = ({
  pageName,
  setPageName,
  deviceMode,
  setDeviceMode,
  zoom,
  setZoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClose,
  onSave,
  onCreateRevision,
  onOpenCommand,
  onImportJson,
  onImportHtml,
  onExportJson,
  onExportHtml,
  onPublish,
  onUnpublish,
  isSaved,
  isSaving = false,
  lastSavedAt,
  activeViewMode,
  setActiveViewMode,
  blockCount,
  pageStatus = "draft",
  pageVisibility = "private",
  pageSlug,
}) => {
  const isPublished = pageStatus === "published" && pageVisibility === "public";
  const [isToolsOpen, setIsToolsOpen] = React.useState(false);
  const toolsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCopyPublicLink = () => {
    if (!isPublished) {
      alert("Trang chưa xuất bản, người khác chưa xem được.\nHãy bấm 'Xuất bản trang' trước.");
      return;
    }
    const link = pageSlug
      ? `${window.location.origin}/p/${pageSlug}`
      : `${window.location.origin}/p/${pageName.toLowerCase().replace(/\s+/g, "-")}`;
    navigator.clipboard.writeText(link).then(() => {
      alert(`Đã sao chép link công khai:\n${link}`);
    });
  };

  return (
    <div className="flex items-center h-14 px-3 gap-3 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm shadow-gray-100 select-none overflow-x-auto">
      {/* ← Back */}
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all text-xs font-semibold px-2.5 py-1.5 rounded-md hover:bg-gray-100 border border-transparent hover:border-gray-200 flex-shrink-0 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span>Quay lại</span>
      </button>

      <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

      {/* Page name — editable */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1.5 bg-purple-50 rounded-md border border-purple-200 text-purple-600 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <div className="flex flex-col min-w-0">
          <input
            type="text"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none border-b border-transparent focus:border-purple-500 hover:bg-gray-100 focus:bg-gray-100 px-2 py-0.5 rounded transition pb-0.5 min-w-0 max-w-[140px] truncate"
            spellCheck={false}
          />
        </div>
        <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 hidden sm:inline-flex items-center font-medium">
          {blockCount} blocks
        </span>
      </div>

      {/* Privacy badge */}
      <div className="flex-shrink-0">
        {isPublished ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Đã xuất bản · công khai
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Riêng tư · chỉ bạn xem được
          </span>
        )}
      </div>

      <div className="flex-1" />

      {/* View mode switcher */}
      <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200 flex-shrink-0">
        {(
          [
            { mode: "design", label: "Design" },
            { mode: "preview", label: "Preview" },
            { mode: "code", label: "Code" },
          ] as const
        ).map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setActiveViewMode(mode)}
            className={`h-7.5 px-3 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeViewMode === mode
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

      {/* Device switcher */}
      <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200 flex-shrink-0">
        {(
          [
            {
              mode: "desktop" as DeviceMode,
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                </svg>
              ),
              label: "Máy tính",
            },
            {
              mode: "tablet" as DeviceMode,
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.75h3M3.75 6.75h16.5M3.75 12h16.5m-7.5 7.5h3M5.625 21h12.75c.621 0 1.125-.504 1.125-1.125V4.125C19.5 3.504 18.996 3 18.375 3H5.625C5.004 3 4.5 3.504 4.5 4.125v15.75c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              ),
              label: "Máy tính bảng",
            },
            {
              mode: "mobile" as DeviceMode,
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              ),
              label: "Điện thoại",
            },
          ] as const
        ).map(({ mode, icon, label }) => (
          <button
            key={mode}
            onClick={() => setDeviceMode(mode)}
            title={label}
            className={`flex items-center justify-center w-9 h-7.5 rounded-lg transition-all cursor-pointer ${
              deviceMode === mode
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

      {/* Zoom control */}
      <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200 flex-shrink-0">
        <button
          onClick={() => setZoom(Math.max(0.5, +(zoom - 0.25).toFixed(2)))}
          className="w-7 h-7.5 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 cursor-pointer transition"
          title="Thu nhỏ"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
          </svg>
        </button>
        <select
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="bg-transparent text-xs text-gray-700 focus:outline-none cursor-pointer w-14 text-center py-1 font-semibold"
        >
          {ZOOM_PRESETS.map((z) => (
            <option key={z} value={z} className="bg-white text-gray-800">
              {Math.round(z * 100)}%
            </option>
          ))}
        </select>
        <button
          onClick={() => setZoom(Math.min(1.5, +(zoom + 0.25).toFixed(2)))}
          className="w-7 h-7.5 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 cursor-pointer transition"
          title="Phóng to"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

      {/* Undo / Redo */}
      <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200 flex-shrink-0">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Hoàn tác (Ctrl+Z)"
          className="w-8 h-7.5 flex items-center justify-center rounded-lg transition text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Làm lại (Ctrl+Y)"
          className="w-8 h-7.5 flex items-center justify-center rounded-lg transition text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
        </button>
      </div>

      <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

      {/* Save status */}
      <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-100 rounded-lg border border-gray-200 text-xs text-gray-600 flex-shrink-0 hidden md:flex">
        {isSaving ? (
          <>
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
            <span className="font-semibold text-blue-600">Đang lưu...</span>
          </>
        ) : isSaved ? (
          <>
            <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span className="text-green-600 font-semibold">{lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "Đã lưu"}</span>
          </>
        ) : (
          <>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-500 font-semibold">Chưa lưu</span>
          </>
        )}
      </div>

      <div className="relative flex-shrink-0" ref={toolsRef}>
        <button
          onClick={() => setIsToolsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 h-8.5 px-3 rounded-lg text-[12px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition cursor-pointer"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774a1.125 1.125 0 01.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.094c0 .55-.398 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.164.398-.143.854.107 1.204l.527.738a1.125 1.125 0 01-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.448-.12l-.774-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Công cụ</span>
          <svg className={`w-3 h-3 text-gray-500 transition-transform ${isToolsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {isToolsOpen && (
          <div className="absolute right-0 mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Save */}
            <button
              disabled={isSaved || isSaving}
              onClick={() => {
                if (isSaved || isSaving) return;
                setIsToolsOpen(false);
                onSave();
              }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer text-left disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white disabled:hover:text-gray-700"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              <span>Lưu thiết kế (Save)</span>
            </button>

            {/* Version */}
            <button
              onClick={() => {
                setIsToolsOpen(false);
                onCreateRevision();
              }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer text-left border-b border-gray-100"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3.75 2.25M3.75 12a8.25 8.25 0 111.833 5.197M3.75 18v-4.5h4.5" />
              </svg>
              <span>Tạo bản lưu (Version)</span>
            </button>

            {/* Command Palette */}
            <button
              onClick={() => {
                setIsToolsOpen(false);
                onOpenCommand();
              }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer text-left border-b border-gray-100"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096L9 21zm0 0l6.6-6.6a1.5 1.5 0 10-2.12-2.12l-6.6 6.6M9 21l6.6-6.6m-6.6 6.6L9 21zm0 0V9m0 0l-3.3 3.3M9 9l3.3 3.3" />
              </svg>
              <span>Lệnh AI (Cmd)</span>
            </button>

            {/* Imp JSON */}
            <button
              onClick={() => {
                setIsToolsOpen(false);
                onImportJson();
              }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer text-left"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Nhập JSON (Imp JSON)</span>
            </button>

            {/* Imp HTML */}
            <button
              onClick={() => {
                setIsToolsOpen(false);
                onImportHtml();
              }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer text-left border-b border-gray-100"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
              </svg>
              <span>Nhập HTML/ZIP (Imp HTML)</span>
            </button>

            {/* Exp JSON */}
            <button
              onClick={() => {
                setIsToolsOpen(false);
                onExportJson();
              }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer text-left"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>Xuất JSON (Exp JSON)</span>
            </button>

            {/* Exp HTML */}
            <button
              onClick={() => {
                setIsToolsOpen(false);
                onExportHtml();
              }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer text-left border-b border-gray-100"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
              <span>Xuất HTML (Exp HTML)</span>
            </button>

            {/* Link */}
            <button
              onClick={() => {
                setIsToolsOpen(false);
                handleCopyPublicLink();
              }}
              className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] font-semibold transition cursor-pointer text-left ${
                isPublished
                  ? "text-green-700 hover:bg-green-50"
                  : "text-gray-400 hover:bg-gray-50"
              }`}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              <span>{isPublished ? "Copy Link công khai" : "Link (Trang chưa xuất bản)"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Unpublish button — chỉ hiện khi đã published */}
      {isPublished && onUnpublish && (
        <button
          onClick={onUnpublish}
          title="Hủy xuất bản · Đưa về draft/private"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
          Hủy xuất bản
        </button>
      )}

      {/* Publish button */}
      {!isPublished && (
        <button
          onClick={onPublish}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-lime-500 hover:from-purple-500 hover:to-lime-400 text-white text-xs font-bold rounded-lg transition-all duration-200 shadow-md shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
          </svg>
          Xuất bản trang
        </button>
      )}
    </div>
  );
};
