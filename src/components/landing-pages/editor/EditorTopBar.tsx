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
  onExportJson: () => void;
  onExportHtml: () => void;
  onPublish: () => void;
  isSaved: boolean;
  lastSavedAt?: string | null;
  activeViewMode: "design" | "code" | "preview";
  setActiveViewMode: (mode: "design" | "code" | "preview") => void;
  blockCount: number;
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
  onExportJson,
  onExportHtml,
  onPublish,
  isSaved,
  lastSavedAt,
  activeViewMode,
  setActiveViewMode,
  blockCount,
}) => {
  return (
    <div className="flex items-center h-14 px-3 gap-3 bg-[#09090f] border-b border-[#202032] flex-shrink-0 shadow-lg shadow-black/20 select-none overflow-x-auto">
      {/* ← Back */}
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-all text-xs font-semibold px-2.5 py-1.5 rounded-md hover:bg-white/5 border border-transparent hover:border-gray-800/60 flex-shrink-0 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span>Quay lại</span>
      </button>

      <div className="w-px h-6 bg-gray-800/60 flex-shrink-0" />

      {/* Page name — editable */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1.5 bg-purple-600/10 rounded-md border border-purple-500/20 text-purple-400 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <div className="flex flex-col min-w-0">
          <input
            type="text"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            className="bg-transparent text-sm font-semibold text-gray-100 focus:outline-none border-b border-transparent focus:border-purple-500 hover:bg-white/5 focus:bg-white/5 px-2 py-0.5 rounded transition pb-0.5 min-w-0 max-w-[140px] truncate"
            spellCheck={false}
          />
        </div>
        <span className="text-[10px] text-gray-500 bg-gray-800/40 px-2 py-0.5 rounded-full border border-gray-800 hidden sm:inline-flex items-center">
          {blockCount} blocks
        </span>
      </div>

      <div className="flex-1" />

      {/* View mode switcher */}
      <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-gray-800/80 flex-shrink-0 shadow-inner">
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
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-800/60 flex-shrink-0" />

      {/* Device switcher */}
      <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-gray-800/80 flex-shrink-0 shadow-inner">
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
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-800/60 flex-shrink-0" />

      {/* Zoom control */}
      <div className="flex items-center gap-1.5 bg-white/5 rounded-lg p-0.5 border border-gray-800/80 flex-shrink-0">
        <button
          onClick={() => setZoom(Math.max(0.5, +(zoom - 0.25).toFixed(2)))}
          className="w-7 h-7.5 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5 cursor-pointer transition"
          title="Thu nhỏ"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
          </svg>
        </button>
        <select
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="bg-transparent text-xs text-gray-300 focus:outline-none cursor-pointer w-14 text-center py-1 font-semibold"
        >
          {ZOOM_PRESETS.map((z) => (
            <option key={z} value={z} className="bg-[#0f0f15] text-gray-200">
              {Math.round(z * 100)}%
            </option>
          ))}
        </select>
        <button
          onClick={() => setZoom(Math.min(1.5, +(zoom + 0.25).toFixed(2)))}
          className="w-7 h-7.5 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5 cursor-pointer transition"
          title="Phóng to"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      <div className="w-px h-6 bg-gray-800/60 flex-shrink-0" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-gray-800/80 flex-shrink-0">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Hoàn tác (Ctrl+Z)"
          className="w-8 h-7.5 flex items-center justify-center rounded-lg transition text-gray-400 hover:text-gray-200 hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Làm lại (Ctrl+Y)"
          className="w-8 h-7.5 flex items-center justify-center rounded-lg transition text-gray-400 hover:text-gray-200 hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
        </button>
      </div>

      <div className="w-px h-6 bg-gray-800/60 flex-shrink-0" />

      {/* Save status */}
      <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-lg border border-gray-800/50 text-xs text-gray-400 flex-shrink-0 hidden md:flex">
        {isSaved ? (
          <>
            <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span className="text-green-400/90 font-medium">{lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "Da luu"}</span>
          </>
        ) : (
          <>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-500/95 font-medium">Chưa lưu thay đổi</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-gray-800/80 flex-shrink-0">
        <button
          onClick={onSave}
          title="Save"
          className="h-7.5 px-3 rounded-lg text-[11px] font-bold text-gray-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
        >
          Save
        </button>
        <button
          onClick={onCreateRevision}
          title="Create version"
          className="h-7.5 px-3 rounded-lg text-[11px] font-bold text-gray-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
        >
          Version
        </button>
        <button
          onClick={onOpenCommand}
          title="Command palette"
          className="h-7.5 px-3 rounded-lg text-[11px] font-bold text-gray-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
        >
          Cmd
        </button>
        <button
          onClick={onImportJson}
          title="Import JSON"
          className="h-7.5 px-3 rounded-lg text-[11px] font-bold text-gray-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
        >
          Import
        </button>
        <button
          onClick={onExportJson}
          title="Export JSON"
          className="h-7.5 px-3 rounded-lg text-[11px] font-bold text-gray-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
        >
          JSON
        </button>
        <button
          onClick={onExportHtml}
          title="Export HTML"
          className="h-7.5 px-3 rounded-lg text-[11px] font-bold text-gray-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
        >
          HTML
        </button>
      </div>

      {/* Publish */}
      <button
        onClick={onPublish}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-lime-500 hover:from-purple-500 hover:to-lime-400 text-white text-xs font-bold rounded-lg transition-all duration-200 shadow-md shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex-shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
        Xuất bản trang
      </button>
    </div>
  );
};
