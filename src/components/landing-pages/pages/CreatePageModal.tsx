import React from "react";
import { IconX } from "../dung-chung/icons";

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  newPageName: string;
  setNewPageName: (name: string) => void;
  onCreatePage: (e: React.FormEvent) => void;
}

export const CreatePageModal: React.FC<CreatePageModalProps> = ({
  isOpen,
  onClose,
  newPageName,
  setNewPageName,
  onCreatePage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xl max-w-md w-full p-6 space-y-4 animate-scale-up">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Tạo Landing Page mới
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 p-1 cursor-pointer"
          >
            <IconX size={16} />
          </button>
        </div>

        <form onSubmit={onCreatePage} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tên Landing Page
            </label>
            <input
              type="text"
              placeholder="Ví dụ: km-tet-2026, landing-gioithieu"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-hidden focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
              required
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-650 hover:bg-gray-100 rounded-lg dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer"
            >
              Tạo trang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
