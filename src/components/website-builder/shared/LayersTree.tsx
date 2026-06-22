import React from "react";
import { WebsiteSchema } from "@/types/website-builder";
import { getLayerTree, getNodeTypeFromId } from "../core/builder-node-adapter";

interface LayersTreeProps {
  schema: WebsiteSchema;
  activePageId: string;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
}

export const LayersTree: React.FC<LayersTreeProps> = ({
  schema,
  activePageId,
  selectedNodeId,
  onNodeSelect,
}) => {
  const layerTree = getLayerTree(schema);
  const pageNode = layerTree.find((p) => p.id === activePageId) || layerTree[0];
  const sections = pageNode?.children || [];

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "section":
        return (
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case "heading":
        return (
          <span className="text-[10px] font-extrabold text-blue-500 bg-blue-50 dark:bg-blue-950/40 px-1 py-0.2 rounded border border-blue-200 dark:border-blue-900">
            H
          </span>
        );
      case "text":
        return (
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        );
      case "button":
        return (
          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1 py-0.2 rounded border border-amber-200 dark:border-amber-900">
            BTN
          </span>
        );
      case "image":
        return (
          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "card":
        return (
          <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      default:
        return (
          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Cấu trúc Lớp (Layers Tree)</p>
        <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-meta-4 px-2 py-0.5 rounded-full font-mono">
          {sections.length} sections
        </span>
      </div>

      <div className="space-y-2 select-none">
        {sections.map((sectionNode) => {
          const isSectionSelected = selectedNodeId === sectionNode.id;
          return (
            <div key={sectionNode.id} className="border border-gray-100 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-boxdark shadow-sm">
              {/* Section Header Row */}
              <div
                onClick={() => onNodeSelect(sectionNode.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition ${
                  isSectionSelected
                    ? "bg-primary/10 border-l-4 border-l-primary text-primary font-bold"
                    : "hover:bg-gray-50 dark:hover:bg-meta-4 text-black dark:text-white border-l-4 border-l-transparent"
                }`}
              >
                <div className="shrink-0">{getNodeIcon("section")}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate leading-snug">{sectionNode.name}</p>
                </div>
              </div>

              {/* Children Nodes (Elements) */}
              {sectionNode.children && sectionNode.children.length > 0 && (
                <div className="border-t border-gray-50 dark:border-zinc-800 bg-gray-50/30 dark:bg-meta-4/10 py-1.5 px-2 space-y-1">
                  {sectionNode.children.map((childNode) => {
                    const isChildSelected = selectedNodeId === childNode.id;
                    const childType = getNodeTypeFromId(childNode.id);
                    return (
                      <div
                        key={childNode.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNodeSelect(childNode.id);
                        }}
                        className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-md cursor-pointer transition text-[11px] ${
                          isChildSelected
                            ? "bg-primary/5 text-primary font-semibold ring-1 ring-primary/20"
                            : "hover:bg-gray-100/70 dark:hover:bg-meta-4/50 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        <div className="shrink-0 flex items-center justify-center w-4 h-4">
                          {getNodeIcon(childType)}
                        </div>
                        <span className="truncate flex-1">{childNode.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LayersTree;
