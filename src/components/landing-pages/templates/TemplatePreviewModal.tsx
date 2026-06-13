import React from "react";
import { TemplateItem } from "../dung-chung/types";
import { IconX, IconPlus } from "../dung-chung/icons";

interface TemplatePreviewModalProps {
  template: TemplateItem | null;
  onClose: () => void;
  onUseTemplate: (template: TemplateItem) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  onClose,
  onUseTemplate,
}) => {
  if (!template) return null;

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xl max-w-4xl w-full h-[85vh] flex flex-col justify-between overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 p-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Xem trước: {template.name}
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
              Lượt xem: {template.views.toLocaleString()} | Tải về: {template.likes.toLocaleString()}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-950 overflow-y-auto p-6 flex justify-center">
          <div className="w-full max-w-[480px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-md h-fit">
            {/* Browser bar mock */}
            <div className="bg-slate-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="ml-4 text-[10px] font-medium text-slate-400 bg-white dark:bg-gray-900 px-6 py-0.5 rounded border border-gray-150 dark:border-gray-700 select-none">ladi.page/preview</span>
            </div>
            <img
              src={template.image}
              alt={template.name}
              className="w-full h-auto object-top"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-900/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-650 hover:bg-gray-100 rounded-lg dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={() => onUseTemplate(template)}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5"
          >
            <IconPlus size={16} />
            <span>Sử dụng Template này</span>
          </button>
        </div>
      </div>
    </div>
  );
};
