"use client";

import { EyeCloseIcon, EyeIcon } from "@/icons";
import type { FacebookTokenValues, TokenFieldConfig } from "../types";

type TokenSecretFieldProps = {
  field: TokenFieldConfig;
  value: string;
  isVisible: boolean;
  onChange: (key: keyof FacebookTokenValues, value: string) => void;
  onToggleVisibility: (key: keyof FacebookTokenValues) => void;
};

export default function TokenSecretField({
  field,
  value,
  isVisible,
  onChange,
  onToggleVisibility,
}: TokenSecretFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 sm:text-xs">
        {field.label}
      </label>
      <div className="relative">
        <input
          type={isVisible ? "text" : "password"}
          placeholder={field.placeholder}
          value={value}
          onChange={(event) => onChange(field.key, event.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-4 pr-10 text-xs font-semibold text-gray-800 shadow-theme-xs transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
        />
        <button
          type="button"
          onClick={() => onToggleVisibility(field.key)}
          aria-label={isVisible ? `Ẩn ${field.label}` : `Hiện ${field.label}`}
          className="absolute right-3 top-2.5 cursor-pointer text-gray-400 transition hover:text-blue-500 dark:hover:text-blue-400"
        >
          {isVisible ? <EyeCloseIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
        </button>
      </div>
    </div>
  );
}
