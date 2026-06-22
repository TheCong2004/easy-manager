import React from "react";
import { ServicesProps } from "../types";

export const ServicesSection: React.FC<ServicesProps> = ({
  sectionId,
  mode = "preview",
  onFieldClick,
  title,
  subtitle,
  items = [],
  primaryColor,
}) => {
  const isEdit = mode === "edit";
  const displayTitle = title || "Dịch vụ của chúng tôi";
  const displaySubtitle = subtitle || "Cung cấp các giải pháp chuyên nghiệp đáp ứng mọi nhu cầu.";

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {items.length === 0 ? (
          <div className="col-span-3 text-center text-gray-400 text-sm py-4">Chưa có dịch vụ nào.</div>
        ) : (
          items.map((item, i) => {
            const serviceTitle = item.title || `Gói dịch vụ ${i + 1}`;
            const serviceDesc = item.description || "Mô tả chi tiết giải pháp gói dịch vụ của bạn.";
            const servicePrice = item.price || "";
            const serviceBadge = item.badge || "";

            return (
              <div
                key={i}
                className="relative bg-zinc-50 dark:bg-meta-4 p-6 rounded-xl border border-gray-200 dark:border-strokedark shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                {serviceBadge && (
                  <span
                    className="absolute -top-3 right-4 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: primaryColor || "#3B82F6" }}
                  >
                    {serviceBadge}
                  </span>
                )}
                <div>
                  <h3 className="font-bold text-lg mb-2 text-black dark:text-white">{serviceTitle}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">{serviceDesc}</p>
                </div>
                {servicePrice && (
                  <div className="mt-4 border-t border-gray-100 dark:border-strokedark pt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-black dark:text-white">{servicePrice}</span>
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

export default ServicesSection;
