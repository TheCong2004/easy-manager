import React from "react";
import Image from "next/image";
import { TemplateItem } from "../dung-chung/types";
import { IconSearch, IconEye, IconHeart, IconPlus, IconDownload } from "../dung-chung/icons";

interface TemplatesLibraryProps {
  activeTemplateTab: string;
  setActiveTemplateTab: (tab: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  templateSearchQuery: string;
  setTemplateSearchQuery: (query: string) => void;
  filteredTemplates: TemplateItem[];
  likedTemplates: Record<string, boolean>;
  toggleLikeTemplate: (e: React.MouseEvent, id: string) => void;
  setSelectedTemplateForPreview: (template: TemplateItem) => void;
  handleUseTemplate: (template: TemplateItem) => void;
}

export const TemplatesLibrary: React.FC<TemplatesLibraryProps> = ({
  activeTemplateTab,
  setActiveTemplateTab,
  activeCategory,
  setActiveCategory,
  templateSearchQuery,
  setTemplateSearchQuery,
  filteredTemplates,
  likedTemplates,
  toggleLikeTemplate,
  setSelectedTemplateForPreview,
  handleUseTemplate,
}) => {
  return (
    <div className="space-y-6">
      {/* Header: Title, subtitle and discovery button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5 mb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Kho Template
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Khám phá bộ sưu tập template chuyên nghiệp.
          </p>
        </div>

        <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-lime-500 bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-2xs transition dark:bg-gray-800 dark:text-lime-300 dark:border-gray-800 cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3" />
          </svg>
          <span>Khám phá Marketplace</span>
        </button>
      </div>

      {/* Inner Pill Tabs */}
      <div className="inline-flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1 gap-1 self-start">
        <button 
          onClick={() => setActiveTemplateTab("sample")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition duration-150 cursor-pointer ${
            activeTemplateTab === "sample"
              ? "bg-white dark:bg-gray-800 text-slate-800 dark:text-white shadow-2xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-gray-350"
          }`}
        >
          Giao diện mẫu
        </button>
        <button 
          onClick={() => setActiveTemplateTab("featured")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition duration-150 cursor-pointer ${
            activeTemplateTab === "featured"
              ? "bg-white dark:bg-gray-800 text-slate-800 dark:text-white shadow-2xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-gray-350"
          }`}
        >
          Mẫu thiết kế nổi bật
        </button>
        <button 
          onClick={() => setActiveTemplateTab("marketplace")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition duration-150 cursor-pointer ${
            activeTemplateTab === "marketplace"
              ? "bg-white dark:bg-gray-800 text-slate-800 dark:text-white shadow-2xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-gray-350"
          }`}
        >
          Cửa hàng Giao diện mẫu
        </button>
        <button 
          onClick={() => setActiveTemplateTab("service")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition duration-150 cursor-pointer ${
            activeTemplateTab === "service"
              ? "bg-white dark:bg-gray-800 text-slate-800 dark:text-white shadow-2xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-gray-350"
          }`}
        >
          Dịch vụ thiết kế
        </button>
      </div>

      {/* Category selection row */}
      <div className="flex flex-wrap items-center gap-6 border-b border-gray-100 dark:border-gray-800 pb-3 mt-4">
        <button 
          onClick={() => setActiveCategory("all")}
          className={`whitespace-nowrap pb-2.5 text-[13px] transition-all cursor-pointer border-b-2 -mb-3 ${
            activeCategory === "all"
              ? "font-semibold border-lime-500 text-lime-500 dark:border-lime-300 dark:text-lime-300"
              : "font-medium border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          }`}
        >
          Tất cả
        </button>
        <button 
          onClick={() => setActiveCategory("ecommerce")}
          className={`whitespace-nowrap pb-2.5 text-[13px] transition-all cursor-pointer border-b-2 -mb-3 flex items-center gap-1 ${
            activeCategory === "ecommerce"
              ? "font-semibold border-lime-500 text-lime-500 dark:border-lime-300 dark:text-lime-300"
              : "font-medium border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          }`}
        >
          <span>Thương mại điện tử</span>
          <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        <button 
          onClick={() => setActiveCategory("service")}
          className={`whitespace-nowrap pb-2.5 text-[13px] transition-all cursor-pointer border-b-2 -mb-3 flex items-center gap-1 ${
            activeCategory === "service"
              ? "font-semibold border-lime-500 text-lime-500 dark:border-lime-300 dark:text-lime-300"
              : "font-medium border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          }`}
        >
          <span>Dịch vụ</span>
          <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        <button 
          onClick={() => setActiveCategory("others")}
          className={`whitespace-nowrap pb-2.5 text-[13px] transition-all cursor-pointer border-b-2 -mb-3 flex items-center gap-1 ${
            activeCategory === "others"
              ? "font-semibold border-lime-500 text-lime-500 dark:border-lime-300 dark:text-lime-300"
              : "font-medium border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          }`}
        >
          <span>Khác</span>
          <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        <div className="flex items-center gap-1.5 ml-auto pb-1 text-slate-500 text-[13px] font-semibold">
          <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 font-normal">Dịch vụ Thiết kế chỉ từ 1tr500k</span>
          <span className="px-1.5 py-0.5 text-[8px] font-bold text-white bg-red-500 rounded uppercase">
            ƯU ĐÃI
          </span>
        </div>
      </div>

      {/* Sub Search & Filter selector inputs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 my-4">
        {/* Search box for templates */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-3 flex items-center pl-1 text-slate-400">
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={templateSearchQuery}
            onChange={(e) => setTemplateSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-hidden focus:border-lime-400"
          />
        </div>

        {/* Mocks select filter boxes */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select className="w-full md:w-36 appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-1.5 pr-8 text-[13px] font-medium text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer">
              <option>Tất cả</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>
          <div className="relative flex-1 md:flex-none">
            <select className="w-full md:w-36 appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-1.5 pr-8 text-[13px] font-medium text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer">
              <option>Tất cả</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Grid display templates list */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredTemplates.map((item) => (
            <div 
              key={item.id}
              className="group rounded-xl border border-gray-200 dark:border-gray-800 p-2.5 bg-white dark:bg-gray-900 flex flex-col justify-between shadow-2xs hover:shadow-lg transition-all duration-300 relative"
            >
              {/* Image Container with Hover Scroll */}
              <div className="relative aspect-[3/4.2] overflow-hidden bg-gray-50 dark:bg-gray-950 rounded-lg select-none">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={350}
                  height={1000}
                  style={{
                    "--scroll-dist": item.scrollDist,
                  } as React.CSSProperties}
                  className="w-full h-auto object-top mobile-scroll-effect"
                />

                {/* PRO / FREE badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 text-[8px] font-black text-white bg-[#f97316] rounded-sm uppercase tracking-wider z-10 shadow-xs">
                  {item.isPro ? "PRO" : "FREE"}
                </span>

                {/* Like icon click indicator */}
                <button 
                  onClick={(e) => toggleLikeTemplate(e, item.id)}
                  className="absolute top-2 right-2 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 bg-white/95 dark:bg-gray-800/95 p-1.5 rounded-full shadow-xs text-red-500 hover:scale-110 z-10 cursor-pointer"
                >
                  <IconHeart
                    size={14}
                    fill={likedTemplates[item.id] ? "currentColor" : "none"}
                  />
                </button>

                {/* Overlay action buttons on Hover (No dark overlay, positioned side-by-side at the bottom) */}
                <div className="absolute bottom-3 left-2.5 right-2.5 flex items-center justify-between gap-2 z-9 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    onClick={() => setSelectedTemplateForPreview(item)}
                    className="flex-1 py-1.5 bg-white text-slate-800 hover:bg-slate-50 text-[11px] font-bold rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <IconEye size={12} />
                    <span>Xem trước</span>
                  </button>
                  <button 
                    onClick={() => handleUseTemplate(item)}
                    className="flex-1 py-1.5 bg-lime-500 text-white hover:bg-lime-600 text-[11px] font-bold rounded-lg shadow-sm transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <IconPlus size={12} />
                    <span>Sử dụng</span>
                  </button>
                </div>
              </div>

              {/* Footer Info details */}
              <div className="mt-3.5 space-y-1">
                <span className="text-[12px] font-bold text-slate-800 dark:text-gray-200 truncate block hover:text-lime-500 cursor-pointer">
                  {item.name}
                </span>
                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <IconEye size={11} />
                    {item.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconDownload size={11} />
                    {item.likes.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-sm font-medium text-slate-455 dark:text-slate-500 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">
          Chưa có mẫu nào phù hợp với tìm kiếm của bạn
        </div>
      )}
    </div>
  );
};
