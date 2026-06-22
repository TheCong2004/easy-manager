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
  lastSavedAt,
  activeViewMode,
  setActiveViewMode,
  blockCount,
  pageStatus = "draft",
  pageVisibility = "private",
  pageSlug,
}) => {
  const isPublished = pageStatus === "published" && pageVisibility === "public";

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
        {isSaved ? (
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

      <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200 flex-shrink-0">
        <button
          onClick={onSave}
          title="Save"
          className="h-7.5 px-3 rounded-lg text-[11px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 transition cursor-pointer"
        >
          Save
        </button>
        <button
          onClick={onCreateRevision}
          title="Create version"
          className="h-7.5 px-3 rounded-lg text-[11px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 transition cursor-pointer"
        >
          Version
        </button>
        <button
          onClick={onOpenCommand}
          title="Command palette"
          className="h-7.5 px-3 rounded-lg text-[11px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 transition cursor-pointer"
        >
          Cmd
        </button>
        <button
          onClick={onImportJson}
          title="Import JSON"
          className="h-7.5 px-3 rounded-lg text-[11px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 transition cursor-pointer"
        >
          Imp JSON
        </button>
        <button
          onClick={onImportHtml}
          title="Import HTML"
          className="h-7.5 px-3 rounded-lg text-[11px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 transition cursor-pointer"
        >
          Imp HTML
        </button>
        <button
          onClick={onExportJson}
          title="Export JSON"
          className="h-7.5 px-3 rounded-lg text-[11px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 transition cursor-pointer"
        >
          Exp JSON
        </button>
        <button
          onClick={onExportHtml}
          title="Export HTML"
          className="h-7.5 px-3 rounded-lg text-[11px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 transition cursor-pointer"
        >
          Exp HTML
        </button>
        {/* Copy public link */}
        <button
          onClick={handleCopyPublicLink}
          title={isPublished ? "Copy link công khai" : "Trang chưa xuất bản"}
          className={`h-7.5 px-3 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
            isPublished
              ? "text-green-700 hover:text-green-900 hover:bg-green-100"
              : "text-gray-400 hover:bg-gray-200/50"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          Link
        </button>
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
