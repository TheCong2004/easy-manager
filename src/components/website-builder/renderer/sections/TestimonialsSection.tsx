import React from "react";
import { TestimonialsProps } from "../types";

export const TestimonialsSection: React.FC<TestimonialsProps> = ({
  sectionId,
  mode = "preview",
  onFieldClick,
  title,
  subtitle,
  items = [],
}) => {
  const isEdit = mode === "edit";
  const displayTitle = title || "Đánh giá từ khách hàng";
  const displaySubtitle = subtitle || "Được tin tưởng bởi hàng nghìn doanh nghiệp toàn cầu.";

  return (
    <section className="py-16 px-6 bg-white dark:bg-boxdark text-black dark:text-white">
      <div className="text-center mb-12">
        {isEdit ? (
          <h2
            onClick={() => onFieldClick?.(sectionId, "title", displayTitle)}
            className="text-2xl font-bold sm:text-3xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded transition"
          >
            {displayTitle}
          </h2>
        ) : (
          <h2 className="text-2xl font-bold sm:text-3xl">{displayTitle}</h2>
        )}

        {isEdit ? (
          <p
            onClick={() => onFieldClick?.(sectionId, "subtitle", displaySubtitle)}
            className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-xl mx-auto cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded transition"
          >
            {displaySubtitle}
          </p>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-xl mx-auto">{displaySubtitle}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {items.map((item, i) => {
          const authorName = item.author || `Khách hàng ${i + 1}`;
          const authorRole = item.role || "Đối tác";
          const feedback = item.description || "Dịch vụ tuyệt vời, chúng tôi rất hài lòng.";
          const avatarUrl = item.avatar || "";

          return (
            <div
              key={i}
              className="bg-zinc-50 dark:bg-meta-4 p-8 rounded-xl border border-gray-100 dark:border-strokedark shadow-sm leading-relaxed flex flex-col justify-between"
            >
              <p className="text-gray-600 dark:text-gray-300 text-sm italic mb-6">"{feedback}"</p>
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={authorName}
                    className="h-12 w-12 rounded-full object-cover border border-stroke"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 font-bold text-sm">
                    {authorName[0]}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-black dark:text-white">{authorName}</h4>
                  <span className="text-xs text-gray-400">{authorRole}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TestimonialsSection;
