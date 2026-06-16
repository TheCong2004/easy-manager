"use client";
import React from "react";
import { TextProps } from "../types";

interface TextBlockProps {
  props: TextProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate?: (props: Record<string, unknown>) => void;
}

export const TextBlock: React.FC<TextBlockProps> = ({ props, isSelected, onSelect, onUpdate }) => {
  const { content, fontSize, color, textAlign, lineHeight, paddingX, paddingY } = props;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full cursor-pointer transition-all ${
        isSelected
          ? "ring-2 ring-purple-500 ring-offset-1"
          : "hover:ring-1 hover:ring-purple-400/40"
      }`}
      style={{ paddingLeft: paddingX, paddingRight: paddingX, paddingTop: paddingY, paddingBottom: paddingY }}
    >
      <p
        contentEditable={isSelected}
        suppressContentEditableWarning
        onBlur={(e) => onUpdate?.({ ...props, content: e.currentTarget.textContent || "" })}
        onClick={(e) => {
          if (isSelected) e.stopPropagation();
        }}
        style={{ fontSize, color, textAlign, lineHeight, margin: 0, outline: "none" }}
      >
        {content}
      </p>
      {isSelected && (
        <div className="absolute top-1 left-1 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          TEXT
        </div>
      )}
    </div>
  );
};
