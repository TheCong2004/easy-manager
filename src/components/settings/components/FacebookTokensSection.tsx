"use client";

import { TOKEN_FIELDS } from "../constants";
import type { FacebookTokenValues, VisibleTokenFields } from "../types";
import TokenSecretField from "./TokenSecretField";

type FacebookTokensSectionProps = {
  tokenValues: FacebookTokenValues;
  visibleTokenFields: VisibleTokenFields;
  isRefreshing: boolean;
  statusMessage: string;
  onRefresh: () => void;
  onTokenChange: (key: keyof FacebookTokenValues, value: string) => void;
  onToggleVisibility: (key: keyof FacebookTokenValues) => void;
};

export default function FacebookTokensSection({
  tokenValues,
  visibleTokenFields,
  isRefreshing,
  statusMessage,
  onRefresh,
  onTokenChange,
  onToggleVisibility,
}: FacebookTokensSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 dark:border-gray-800">
        <div className="flex flex-col">
          <h3 className="text-xs font-extrabold text-gray-900 dark:text-white sm:text-sm">
            Thông tin Facebook
          </h3>
          <p className="mt-1 text-[10px] font-bold text-red-500 dark:text-red-400">
            Các thông tin bảo mật, không chia sẻ với bất kỳ ai.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992m-18.03 10.296v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          <span>{isRefreshing ? "Đang tải..." : "Tải lại"}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
          {statusMessage}
        </div>
      )}

      <div className="space-y-4">
        {TOKEN_FIELDS.map((field) => (
          <TokenSecretField
            key={field.key}
            field={field}
            value={tokenValues[field.key]}
            isVisible={visibleTokenFields[field.key]}
            onChange={onTokenChange}
            onToggleVisibility={onToggleVisibility}
          />
        ))}
      </div>
    </div>
  );
}
