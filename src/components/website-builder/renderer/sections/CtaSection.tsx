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
}) => {
  const isEdit = mode === "edit";
  const displayTitle = title || "Bắt đầu hành trình của bạn ngay hôm nay";
  const displaySubtitle = subtitle || "Tham gia cùng hàng nghìn khách hàng đang phát triển vượt bậc cùng giải pháp của chúng tôi.";
  const displayButtonText = buttonText || "Trải nghiệm miễn phí";

  const bgStyle = backgroundColor || primaryColor || "#3B82F6";

  return (
    <section
      className="py-16 px-8 text-center"
      style={{
        backgroundColor: bgStyle,
        color: textColor,
      }}
    >
      <div className="max-w-3xl mx-auto">
        {isEdit ? (
          <h2
            onClick={() => onFieldClick?.(sectionId, "title", displayTitle)}
            className="text-2xl sm:text-4xl font-extrabold mb-4 cursor-pointer hover:bg-white/10 p-1.5 rounded transition"
          >
            {displayTitle}
          </h2>
        ) : (
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">{displayTitle}</h2>
        )}

        {isEdit ? (
          <p
            onClick={() => onFieldClick?.(sectionId, "subtitle", displaySubtitle)}
            className="text-sm sm:text-lg opacity-90 mb-8 max-w-xl mx-auto cursor-pointer hover:bg-white/10 p-1.5 rounded transition"
          >
            {displaySubtitle}
          </p>
        ) : (
          <p className="text-sm sm:text-lg opacity-90 mb-8 max-w-xl mx-auto">{displaySubtitle}</p>
        )}

        {isEdit ? (
          <button
            onClick={() => onFieldClick?.(sectionId, "buttonText", displayButtonText)}
            className="bg-white text-black hover:bg-opacity-95 font-extrabold px-8 py-3.5 rounded-full shadow-lg text-sm sm:text-base transition transform hover:-translate-y-0.5"
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
