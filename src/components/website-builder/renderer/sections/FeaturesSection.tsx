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
}) => {
  const isEdit = mode === "edit";
  const displayTitle = title || "Tính năng & Lợi ích";
  const displaySubtitle = subtitle || "";

  return (
    <section className="py-16 px-6 bg-zinc-50 dark:bg-boxdark text-black dark:text-white">
      <div className="text-center mb-12">
        {isEdit ? (
          <h2
            onClick={() => onFieldClick?.(sectionId, "title", displayTitle)}
            className="text-2xl font-bold sm:text-3xl cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 p-1.5 rounded transition"
          >
            {displayTitle}
          </h2>
        ) : (
          <h2 className="text-2xl font-bold sm:text-3xl">{displayTitle}</h2>
        )}
        
        {displaySubtitle && (
          isEdit ? (
            <p
              onClick={() => onFieldClick?.(sectionId, "subtitle", displaySubtitle)}
              className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-xl mx-auto cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 p-1 rounded transition"
            >
              {displaySubtitle}
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-xl mx-auto">{displaySubtitle}</p>
          )
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {items.map((item, i) => {
          const itemTitle = item.title || `Ưu điểm ${i + 1}`;
          const itemDesc = item.description || "Mô tả chi tiết ưu điểm vượt trội.";

          return (
            <div
              key={i}
              className="bg-white dark:bg-meta-4 p-6 rounded-xl border border-gray-100 dark:border-strokedark shadow-sm hover:shadow-md transition"
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
