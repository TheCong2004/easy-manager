"use client";

import React from "react";

interface EditorShellLayoutProps {
  topBar: React.ReactNode;
  leftSidebar: React.ReactNode;
  leftRail: React.ReactNode;
  leftDrawer: React.ReactNode;
  canvas: React.ReactNode;
  inspector: React.ReactNode;
  aiPanel?: React.ReactNode;
  overlays?: React.ReactNode;
}

export const EditorShellLayout: React.FC<EditorShellLayoutProps> = ({
  topBar,
  leftSidebar,
  leftRail,
  leftDrawer,
  canvas,
  inspector,
  aiPanel,
  overlays,
}) => {
  return (
    <div
      className="landing-editor-shell fixed inset-0 z-[999999] flex flex-col text-gray-800"
      style={{ fontFamily: "Inter, sans-serif", fontSize: 13, backgroundColor: "#f7f7f8" }}
    >
      {/* A. Topbar — full width, sticky */}
      <header className="relative z-50 flex-shrink-0">{topBar}</header>

      {/* B. Workspace — gray background, canvas centered independently */}
      <div className="relative min-h-0 flex-1">
        {/* Leftmost Fixed Sidebar */}
        <aside className="absolute top-0 bottom-0 left-0 z-20 w-[52px] border-r border-gray-200 bg-white flex flex-col items-center justify-between pointer-events-auto">
          {leftSidebar}
        </aside>

        {/* C. Canvas center layer — starts at left-[52px] */}
        <main className="absolute top-0 bottom-0 left-[52px] right-0 z-10 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
          {canvas}
        </main>

        {/* D. Floating overlays — fixed/absolute, never push canvas */}
        {leftDrawer}

        <div className="pointer-events-none absolute inset-0 z-30 pl-[52px]">{leftRail}</div>

        <div className="pointer-events-none absolute inset-0 z-[45]">{inspector}</div>

        {aiPanel}

        {overlays}
      </div>
    </div>
  );
};