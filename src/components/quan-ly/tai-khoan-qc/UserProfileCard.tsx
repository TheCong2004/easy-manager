import React from "react";

export default function UserProfileCard() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl select-none">
        <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
          <span className="flex h-full w-full items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 font-bold text-sm">
            TC
          </span>
        </span>
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-gray-800 dark:text-white leading-tight">Võ Thế Công</span>
          <span className="text-[10px] text-gray-400">UID: 100029343473480</span>
        </div>
      </div>
    </div>
  );
}
