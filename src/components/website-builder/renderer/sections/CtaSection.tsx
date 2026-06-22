import React from "react";
import { CtaProps } from "../types";

export const CtaSection: React.FC<CtaProps> = ({
  sectionId,
  mode = "preview",
  onFieldClick,
  title,
  subtitle,
  buttonText,
  buttonLink = "#",
  backgroundColor,
  textColor = "#FFFFFF",
  primaryColor,
  selectedNodeId,
  onNodeSelect,
}) => {
  const isEdit = mode === "edit";
  const displayTitle = title || "Bắt đầu hành trình của bạn ngay hôm nay";
  const displaySubtitle = subtitle || "Tham gia cùng hàng nghìn khách hàng đang phát triển vượt bậc cùng giải pháp của chúng tôi.";
  const displayButtonText = buttonText || "Trải nghiệm miễn phí";

  const bgStyle = backgroundColor || primaryColor || "#3B82F6";

  const getSelectableClasses = (field: string) => {
    if (!isEdit) return "";
    const nodeId = `${sectionId}-${field}`;
    const isSelected = selectedNodeId === nodeId;
    return `cursor-pointer transition-all hover:ring-2 hover:ring-primary/40 hover:ring-dashed ${
      isSelected ? "ring-2 ring-primary ring-dashed bg-primary/5" : ""
    }`;
  };

  return (
    <section
      className="py-16 px-8 text-center relative"
      style={{
        backgroundColor: bgStyle,
        color: textColor,
      }}
    >
      <div className="max-w-3xl mx-auto relative z-10">
        {isEdit ? (
          <h2
            data-node-id={`${sectionId}-heading`}
            onClick={(e) => {
              e.stopPropagation();
              onNodeSelect?.(`${sectionId}-heading`);
            }}
            className={`text-2xl sm:text-4xl font-extrabold mb-4 hover:bg-white/10 p-1.5 rounded transition ${getSelectableClasses("heading")}`}
          >
            {displayTitle}
          </h2>
        ) : (
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">{displayTitle}</h2>
        )}

        {isEdit ? (
          <p
            data-node-id={`${sectionId}-text`}
            onClick={(e) => {
              e.stopPropagation();
              onNodeSelect?.(`${sectionId}-text`);
            }}
            className={`text-sm sm:text-lg opacity-90 mb-8 max-w-xl mx-auto hover:bg-white/10 p-1.5 rounded transition ${getSelectableClasses("text")}`}
          >
            {displaySubtitle}
          </p>
        ) : (
          <p className="text-sm sm:text-lg opacity-90 mb-8 max-w-xl mx-auto">{displaySubtitle}</p>
        )}

        {isEdit ? (
          <button
            data-node-id={`${sectionId}-button`}
            onClick={(e) => {
              e.stopPropagation();
              onNodeSelect?.(`${sectionId}-button`);
            }}
            className={`bg-white text-black hover:bg-opacity-95 font-extrabold px-8 py-3.5 rounded-full shadow-lg text-sm sm:text-base transition transform hover:-translate-y-0.5 ${getSelectableClasses("button")}`}
          >
            {displayButtonText}
          </button>
        ) : (
          <a
            href={buttonLink}
            className="inline-block bg-white text-black hover:bg-opacity-95 font-extrabold px-8 py-3.5 rounded-full shadow-lg text-sm sm:text-base transition transform hover:-translate-y-0.5"
          >
            {displayButtonText}
          </a>
        )}
      </div>
    </section>
  );
};

export default CtaSection;
