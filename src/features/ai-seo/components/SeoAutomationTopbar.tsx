import React from "react";
import { Search, Compass, Bell, Cpu } from "lucide-react";

export function SeoAutomationTopbar() {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 text-white z-10 shrink-0">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-96 relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3" />
        <input
          type="text"
          placeholder="Tìm kiếm dự án, từ khóa, báo cáo..."
          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-350 focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder-slate-600 transition"
        />
      </div>

      {/* Right Tools & Quota */}
      <div className="flex items-center gap-4">
        {/* Quota Button */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-900/30 px-3.5 py-1.5 rounded-xl">
          <Cpu className="w-3.5 h-3.5 text-violet-400" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-slate-400 font-semibold leading-none">
              Hạn mức AI
            </span>
            <span className="text-xs text-violet-300 font-bold leading-normal">
              7,450 / 10,000 từ
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition">
            <Compass className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition relative">
            <Bell className="w-4 h-4" />
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full absolute top-2 right-2"></span>
          </button>
        </div>

        <div className="w-px h-6 bg-slate-800"></div>

        {/* User Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-violet-300 border border-slate-600">
            TC
          </div>
          <div className="flex flex-col text-left hidden md:block">
            <span className="text-xs font-semibold text-white leading-none">
              Thế Công
            </span>
            <span className="text-[10px] text-slate-500 leading-normal">
              Administrator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
export default SeoAutomationTopbar;
