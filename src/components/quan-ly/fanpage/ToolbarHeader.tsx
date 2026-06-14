import React from "react";

interface ToolbarHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  threads: number;
  setThreads: (threads: number) => void;
  delay: number;
  setDelay: (delay: number) => void;
  selectedIdsCount: number;
  dataLoaded: boolean;
  isLoading: boolean;
  handleLoadData: () => void;
}

export default function ToolbarHeader({
  searchQuery,
  setSearchQuery,
  threads,
  setThreads,
  delay,
  setDelay,
  selectedIdsCount,
  dataLoaded,
  isLoading,
  handleLoadData,
}: ToolbarHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#11121e] border border-gray-150 dark:border-gray-800 rounded-2xl p-4 shadow-theme-xs">
      {/* Left Toolbar Items */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Start Action Button */}
        <button
          onClick={() => {
            if (selectedIdsCount === 0) {
              alert("Vui lòng chọn ít nhất một Fanpage để bắt đầu.");
              return;
            }
            alert(`Bắt đầu chạy tiện ích trên ${selectedIdsCount} Fanpage với ${threads} luồng và delay ${delay} giây!`);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl transition shadow-xs cursor-pointer select-none"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>Bắt đầu</span>
        </button>

        {/* Group of icons */}
        <div className="flex items-center bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-0.5">
          <button className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer" title="Lọc">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer" title="Danh sách">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer" title="Tải xuống">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer" title="Layout">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (dataLoaded) {
                handleLoadData();
              }
            }}
            className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer"
            title="Tải lại"
          >
            <svg className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-500" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-40 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
          </svg>
        </div>

        {/* Threads count input */}
        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl px-2.5 py-1 text-xs">
          <span className="text-gray-400 font-medium select-none">Luồng</span>
          <input
            type="number"
            value={threads}
            onChange={(e) => setThreads(Math.max(1, Number(e.target.value)))}
            className="w-10 bg-transparent text-center font-bold focus:outline-none text-gray-700 dark:text-gray-300"
          />
        </div>

        {/* Delay count input */}
        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl px-2.5 py-1 text-xs">
          <span className="text-gray-400 font-medium select-none">Delay</span>
          <input
            type="number"
            value={delay}
            onChange={(e) => setDelay(Math.max(0, Number(e.target.value)))}
            className="w-10 bg-transparent text-center font-bold focus:outline-none text-gray-700 dark:text-gray-300"
            placeholder="0"
          />
        </div>

        {/* Action buttons */}
        <button
          onClick={() => alert("Chức năng Tạo Page đang được liên kết...")}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-xl transition cursor-pointer select-none"
        >
          <span>+ Tạo Page</span>
        </button>
        <button
          onClick={() => alert("Chức năng Chấp nhận Page đang được xử lý...")}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-xl transition cursor-pointer select-none"
        >
          <span>Chấp nhận Page</span>
        </button>
      </div>
    </div>
  );
}
