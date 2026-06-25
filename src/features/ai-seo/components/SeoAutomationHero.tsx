import React from "react";
import Link from "next/link";
import { Play, Plus } from "lucide-react";

interface SeoAutomationHeroProps {
  onCreateClick?: () => void;
}

export function SeoAutomationHero({ onCreateClick }: SeoAutomationHeroProps) {
  return (
    <div className="bg-slate-900 pt-10 pb-20 px-8 text-left text-white border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3.5 max-w-3xl">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-white">
              Tối ưu hóa SEO tự động
            </h1>
            <button className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-305 hover:text-white rounded-lg text-xs font-bold transition">
              <Play className="w-3 h-3 fill-current" />
              Cách hoạt động
            </button>
          </div>
          <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
            Triển khai hàng ngàn tối ưu hóa on-page và sửa lỗi kỹ thuật chỉ trong vài cú nhấp chuột bằng AI SEO Agent. 
            Tự động thực hiện các thay đổi trực tiếp trên website của bạn mà không cần rời khỏi dashboard quản trị. 
            Loại bỏ hoàn toàn các công việc SEO thủ công bằng công nghệ AI.
          </p>
        </div>

        {/* Create Button */}
        <Link
          href="/ai-seo/projects/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-violet-500/25 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          + Tạo mới
        </Link>
      </div>
    </div>
  );
}
export default SeoAutomationHero;
