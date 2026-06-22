import React from "react";
import { HeroProps } from "../types";

export const HeroSection: React.FC<HeroProps> = ({
  sectionId,
  mode = "preview",
  onFieldClick,
  primaryColor,
  title,
  subtitle,
  content,
  buttonText,
  buttonLink = "#",
  backgroundColor,
  textColor = "#FFFFFF",
}) => {
  const isEdit = mode === "edit";
  const displayTitle = title || "Tiêu đề Hero mới";
  const displaySubtitle = subtitle || "";
  const displayContent = content || "";
  const displayButtonText = buttonText || "";

  const bgStyle = backgroundColor || primaryColor || "#3B82F6";

  return (
    <section
      className="py-20 px-8 text-center"
      style={{
        backgroundColor: bgStyle,
        color: textColor,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {isEdit ? (
          <h1
            onClick={() => onFieldClick?.(sectionId, "title", displayTitle)}
            className="text-3xl font-extrabold sm:text-5xl mb-5 leading-tight cursor-pointer hover:bg-white/10 p-1.5 rounded transition"
          >
            {displayTitle}
          </h1>
        ) : (
          <h1 className="text-3xl font-extrabold sm:text-5xl mb-5 leading-tight">
            {displayTitle}
          </h1>
        )}

        {displaySubtitle && (
          isEdit ? (
            <p
              onClick={() => onFieldClick?.(sectionId, "subtitle", displaySubtitle)}
              className="text-lg sm:text-xl max-w-2xl mx-auto opacity-90 mb-4 leading-relaxed cursor-pointer hover:bg-white/10 p-1.5 rounded transition"
            >
              {displaySubtitle}
            </p>
          ) : (
            <p className="text-lg sm:text-xl max-w-2xl mx-auto opacity-90 mb-4 leading-relaxed">
              {displaySubtitle}
            </p>
          )
        )}

        {displayContent && (
          isEdit ? (
            <p
              onClick={() => onFieldClick?.(sectionId, "content", displayContent)}
              className="text-sm max-w-xl mx-auto opacity-75 mb-8 leading-relaxed cursor-pointer hover:bg-white/10 p-1.5 rounded transition"
            >
              {displayContent}
            </p>
          ) : (
            <p className="text-sm max-w-xl mx-auto opacity-75 mb-8 leading-relaxed">
              {displayContent}
            </p>
          )
        )}

        {displayButtonText && (
          isEdit ? (
            <button
              onClick={() => onFieldClick?.(sectionId, "buttonText", displayButtonText)}
              className="bg-white text-black hover:bg-opacity-90 font-bold px-8 py-3 rounded-full shadow-md text-sm transition transform hover:-translate-y-0.5"
            >
              {displayButtonText}
            </button>
          ) : (
            <a
              href={buttonLink}
              className="inline-block bg-white text-black hover:bg-opacity-90 font-bold px-8 py-3 rounded-full shadow-md text-sm transition transform hover:-translate-y-0.5"
            >
              {displayButtonText}
            </a>
          )
        )}
      </div>
    </section>
  );
};

export default HeroSection;
