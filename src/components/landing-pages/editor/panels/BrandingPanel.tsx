"use client";
import React from "react";
import { EditorData } from "../types";
import { PageSettingsPanel } from "../InspectorPanel";

interface BrandingPanelProps {
  settings: EditorData["pageSettings"];
  onUpdateSettings: (key: string, value: string | number | boolean) => void;
}

export const BrandingPanel: React.FC<BrandingPanelProps> = ({
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white text-gray-800">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-1.178-.256H5.25a2.25 2.25 0 00-2.25 2.25v1.875c0 .345.029.689.086 1.026a3.385 3.385 0 006.084 1.15l.982-1.656a3 3 0 00.57-1.56h.03c.105 0 .21-.005.312-.015" />
          <circle cx="12" cy="7" r="1.5" />
          <circle cx="17" cy="10" r="1.5" />
          <circle cx="15" cy="15" r="1.5" />
        </svg>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cấu hình Brand & Trang</h3>
      </div>
      <PageSettingsPanel settings={settings} onUpdateSettings={onUpdateSettings} />
    </div>
  );
};
