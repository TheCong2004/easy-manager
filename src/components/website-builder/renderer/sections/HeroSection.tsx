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
  selectedNodeId,
  onNodeSelect,
}) => {
  const isEdit = mode === "edit";
  const displayTitle = title || "Tiêu đề Hero mới";
  const displaySubtitle = subtitle || "";
  const displayContent = content || "";
  const displayButtonText = buttonText || "";

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
      className="py-20 px-8 text-center relative"
      style={{
        backgroundColor: bgStyle,
        color: textColor,
      }}
    >
      <div className="max-w-4xl mx-auto relative z-10">
        {isEdit ? (
          <h1
            data-node-id={`${sectionId}-heading`}
            onClick={(e) => {
              e.stopPropagation();
              onNodeSelect?.(`${sectionId}-heading`);
            }}
            className={`text-3xl font-extrabold sm:text-5xl mb-5 leading-tight hover:bg-white/10 p-1.5 rounded transition ${getSelectableClasses("heading")}`}
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
              data-node-id={`${sectionId}-text`}
              onClick={(e) => {
                e.stopPropagation();
                onNodeSelect?.(`${sectionId}-text`);
              }}
              className={`text-lg sm:text-xl max-w-2xl mx-auto opacity-90 mb-4 leading-relaxed hover:bg-white/10 p-1.5 rounded transition ${getSelectableClasses("text")}`}
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
              data-node-id={`${sectionId}-text`}
              onClick={(e) => {
                e.stopPropagation();
                onNodeSelect?.(`${sectionId}-text`);
              }}
              className={`text-sm max-w-xl mx-auto opacity-75 mb-8 leading-relaxed hover:bg-white/10 p-1.5 rounded transition ${getSelectableClasses("text")}`}
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
              data-node-id={`${sectionId}-button`}
              onClick={(e) => {
                e.stopPropagation();
                onNodeSelect?.(`${sectionId}-button`);
              }}
              className={`bg-white text-black hover:bg-opacity-90 font-bold px-8 py-3 rounded-full shadow-md text-sm transition transform hover:-translate-y-0.5 ${getSelectableClasses("button")}`}
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
