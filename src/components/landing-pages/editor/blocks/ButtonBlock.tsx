"use client";
import React from "react";
import { ButtonProps } from "../types";

interface ButtonBlockProps {
  props: ButtonProps;
  isSelected: boolean;
  onSelect: () => void;
}

const sizeStyles: Record<string, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export const ButtonBlock: React.FC<ButtonBlockProps> = ({ props, isSelected, onSelect }) => {
  const { label, style, color, textColor, size, fullWidth, borderRadius, align } = props;

  const alignStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
    padding: "16px 32px",
  };

  const buttonStyle: React.CSSProperties = {
    borderRadius,
    backgroundColor: style === "filled" ? color : "transparent",
    color: style === "filled" ? textColor : color,
    border: style !== "ghost" ? `2px solid ${color}` : "2px solid transparent",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.15s",
    width: fullWidth ? "100%" : undefined,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };

  return (
    <div
      onClick={onSelect}
      className={`relative w-full cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
      style={alignStyle}
    >
      <button
        className={`${sizeStyles[size]}`}
        style={buttonStyle}
        onClick={(e) => e.preventDefault()}
      >
        {label}
      </button>
      {isSelected && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          BUTTON
        </div>
      )}
    </div>
  );
};
