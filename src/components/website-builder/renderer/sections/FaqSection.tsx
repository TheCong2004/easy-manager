import React, { useState } from "react";
import { FaqProps } from "../types";

export const FaqSection: React.FC<FaqProps> = ({
  sectionId,
  mode = "preview",
  onFieldClick,
  title,
  subtitle,
  items = [],
  primaryColor,
}) => {
  const isEdit = mode === "edit";
  const displayTitle = title || "Câu hỏi thường gặp";
  const displaySubtitle = subtitle || "Tìm câu trả lời cho các thắc mắc phổ biến về giải pháp của chúng tôi.";

  // State to track open states for accordion effect
  const [openIndexes, setOpenIndexes] = useState<Record<number, boolean>>({ 0: true });

  const toggleIndex = (index: number) => {
    setOpenIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

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

        {isEdit ? (
          <p
            onClick={() => onFieldClick?.(sectionId, "subtitle", displaySubtitle)}
            className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-xl mx-auto cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 p-1 rounded transition"
          >
            {displaySubtitle}
          </p>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-xl mx-auto">{displaySubtitle}</p>
        )}
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {items.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-4">Chưa có câu hỏi nào.</div>
        ) : (
          items.map((item, i) => {
            const question = item.question || item.title || `Câu hỏi thường gặp ${i + 1}?`;
            const answer = item.answer || item.description || "Câu trả lời tương ứng cho câu hỏi này sẽ xuất hiện tại đây.";
            const isOpen = !!openIndexes[i];

            return (
              <div
                key={i}
                className="bg-white dark:bg-meta-4 rounded-lg border border-gray-200 dark:border-strokedark shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(i)}
                  className="w-full text-left p-5 font-bold text-sm sm:text-base flex justify-between items-center text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                >
                  <span>{question}</span>
                  <span
                    className="ml-2 font-mono text-xs transition-transform duration-200"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      color: primaryColor || "#3B82F6",
                    }}
                  >
                    ▼
                  </span>
                </button>

                {isOpen && (
                  <div className="p-5 border-t border-gray-100 dark:border-strokedark text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    {answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default FaqSection;
