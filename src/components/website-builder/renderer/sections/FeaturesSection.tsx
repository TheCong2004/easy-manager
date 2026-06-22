import React from "react";
import { FeaturesProps } from "../types";

export const FeaturesSection: React.FC<FeaturesProps> = ({
  sectionId,
  mode = "preview",
  onFieldClick,
  title,
  subtitle,
  items = [],
  primaryColor,
  selectedNodeId,
  onNodeSelect,
}) => {
  const isEdit = mode === "edit";
  const displayTitle = title || "Tính năng & Lợi ích";
  const displaySubtitle = subtitle || "";

  const getSelectableClasses = (field: string) => {
    if (!isEdit) return "";
    const nodeId = `${sectionId}-${field}`;
    const isSelected = selectedNodeId === nodeId;
    return `cursor-pointer transition-all hover:ring-2 hover:ring-primary/40 hover:ring-dashed ${
      isSelected ? "ring-2 ring-primary ring-dashed bg-primary/5" : ""
    }`;
  };

  return (
    <section className="py-16 px-6 bg-zinc-50 dark:bg-boxdark text-black dark:text-white relative">
      <div className="text-center mb-12 relative z-10">
        {isEdit ? (
          <h2
            data-node-id={`${sectionId}-heading`}
            onClick={(e) => {
              e.stopPropagation();
              onNodeSelect?.(`${sectionId}-heading`);
            }}
            className={`text-2xl font-bold sm:text-3xl hover:bg-zinc-200 dark:hover:bg-zinc-800 p-1.5 rounded transition ${getSelectableClasses("heading")}`}
          >
            {displayTitle}
          </h2>
        ) : (
          <h2 className="text-2xl font-bold sm:text-3xl">{displayTitle}</h2>
        )}
        
        {displaySubtitle && (
          isEdit ? (
            <p
              data-node-id={`${sectionId}-text`}
              onClick={(e) => {
                e.stopPropagation();
                onNodeSelect?.(`${sectionId}-text`);
              }}
              className={`text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-xl mx-auto hover:bg-zinc-200 dark:hover:bg-zinc-800 p-1 rounded transition ${getSelectableClasses("text")}`}
            >
              {displaySubtitle}
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-xl mx-auto">{displaySubtitle}</p>
          )
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto relative z-10">
        {items.map((item, i) => {
          const itemTitle = item.title || `Ưu điểm ${i + 1}`;
          const itemDesc = item.description || "Mô tả chi tiết ưu điểm vượt trội.";
          const nodeId = `${sectionId}-card-${i}`;
          const isSelected = selectedNodeId === nodeId;

          return (
            <div
              key={i}
              data-node-id={nodeId}
              onClick={(e) => {
                if (isEdit) {
                  e.stopPropagation();
                  onNodeSelect?.(nodeId);
                }
              }}
              className={`bg-white dark:bg-meta-4 p-6 rounded-xl border border-gray-100 dark:border-strokedark shadow-sm hover:shadow-md transition ${
                isEdit ? "cursor-pointer hover:ring-2 hover:ring-primary/40 hover:ring-dashed" : ""
              } ${isSelected ? "ring-2 ring-primary ring-dashed bg-primary/5" : ""}`}
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center mb-4 text-white font-bold text-lg"
                style={{ backgroundColor: primaryColor || "#3B82F6" }}
              >
                ✓
              </div>
              <h3 className="font-bold text-lg mb-2 text-black dark:text-white">{itemTitle}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{itemDesc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesSection;
