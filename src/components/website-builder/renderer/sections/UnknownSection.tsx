import React from "react";
import { BaseSectionProps } from "../types";

interface UnknownSectionProps extends BaseSectionProps {
  type: string;
}

export const UnknownSection: React.FC<UnknownSectionProps> = ({
  type,
  mode = "preview",
}) => {
  const isEdit = mode === "edit";

  return (
    <section className="py-12 px-6 border-2 border-dashed border-gray-300 dark:border-strokedark bg-gray-50 dark:bg-meta-4 rounded-lg my-4 text-center">
      <div className="max-w-md mx-auto">
        <span className="inline-block p-3 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500 mb-4 font-mono text-xl font-bold">
          ⚠
        </span>
        <h3 className="text-base font-bold text-black dark:text-white mb-1">
          Khối giao diện chưa được hỗ trợ
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Kiểu section <code className="bg-gray-100 dark:bg-boxdark px-1.5 py-0.5 rounded font-mono font-semibold text-rose-500">{type}</code> hiện tại chưa có giao diện hiển thị chính thức.
        </p>
        {isEdit && (
          <span className="inline-block text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded bg-amber-500 text-white">
            Chế độ chỉnh sửa
          </span>
        )}
      </div>
    </section>
  );
};

export default UnknownSection;
