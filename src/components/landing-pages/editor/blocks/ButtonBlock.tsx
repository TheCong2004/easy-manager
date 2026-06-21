"use client";
import React from "react";
import { ButtonProps } from "../types";

interface ButtonBlockProps {
  props: ButtonProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate?: (props: Record<string, unknown>) => void;
}

const sizeStyles: Record<string, string> = {
  sm: "px-4 py-2 text-[13px]",
  md: "px-5 py-2.5 text-[13px]",
  lg: "px-6 py-3 text-[13px]",
};

export const ButtonBlock: React.FC<ButtonBlockProps> = ({ props, isSelected, onSelect, onUpdate }) => {
  const { label, style, color, textColor, size, fullWidth, borderRadius, align } = props;

  const alignStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
    padding: "16px 32px",
  };

  const buttonStyle: React.CSSProperties = {
    borderRadius,
    backgroundColor: style === "filled" ? color : "transparent",
    color: style === "filled" ? textColor : (style === "text" || style === "ghost" ? textColor || color : color),
    border: (style === "text" || style === "ghost") ? "2px solid transparent" : `2px solid ${color}`,
    fontWeight: 700,
    fontSize: 13,
    lineHeight: "18px",
    cursor: "pointer",
    transition: "all 0.15s",
    width: fullWidth ? "100%" : undefined,
    textDecoration: style === "text" ? "underline" : "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  };

  return (
    <div
      onClick={onSelect}
      className="w-full flex cursor-pointer"
      style={{
        display: "flex",
        justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        padding: "12px 16px",
      }}
    >
      <div
        className={`relative transition-all ${
          isSelected
            ? "ring-2 ring-purple-500 ring-offset-1 rounded-lg"
            : "hover:ring-1 hover:ring-purple-400/40 rounded-lg"
        }`}
      >
        <button
          className={`${sizeStyles[size]}`}
          style={buttonStyle}
          onClick={(e) => {
            e.preventDefault();
            if (isSelected) e.stopPropagation();
          }}
        >
          <span
            contentEditable={isSelected}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate?.({ ...props, label: e.currentTarget.textContent || "" })}
            style={{ outline: "none" }}
          >
            {label}
          </span>
        </button>
        {isSelected && (
          <div className="absolute -top-7 left-0 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md tracking-wide z-20 select-none whitespace-nowrap">
            BUTTON
          </div>
        )}
      </div>
    </div>
  );
};
