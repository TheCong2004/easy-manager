import React from "react";
import { FanpageItem } from "./types";

interface PagesTableProps {
  isLoading: boolean;
  loadingProgress: number;
  dataLoaded: boolean;
  filteredPages: FanpageItem[];
  selectedIds: string[];
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  dataOptions: {
    status: boolean;
    badge: boolean;
    likes: boolean;
    posts: boolean;
    live: boolean;
    monetize: boolean;
  };
  selectedRegion: number;
  openConfig: () => void;
}

export default function PagesTable({
  isLoading,
  loadingProgress,
  dataLoaded,
  filteredPages,
  selectedIds,
  onSelectAll,
  onSelectRow,
  dataOptions,
  selectedRegion,
  openConfig,
}: PagesTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[500px] w-full text-center">
        <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin mb-4" />
        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1">Đang quét danh sách Fanpage của bạn...</h3>
        <p className="text-xs text-gray-400 max-w-xs mb-3">Vui lòng chờ trong giây lát...</p>
        <div className="w-48 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-blue-600 h-1.5 transition-all duration-100" style={{ width: `${loadingProgress}%` }} />
        </div>
        <span className="text-[10px] text-blue-500 font-bold mt-1">{loadingProgress}%</span>
      </div>
    );
  }

  if (!dataLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[500px] text-center">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-900/30">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Chưa có dữ liệu</h2>
        <p className="text-sm text-gray-400 max-w-sm mb-6">
          Hiện chưa có dữ liệu để hiển thị. Thiết lập và nhấn Tải dữ liệu để quét danh sách Fanpage của bạn.
        </p>
        <button
          onClick={openConfig}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-xs transition cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98]"
        >
          Tải dữ liệu
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-gray-150 dark:divide-gray-800">
          <thead className="bg-gray-50/70 dark:bg-gray-900/60 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-4 py-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredPages.length && filteredPages.length > 0}
                  onChange={onSelectAll}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </th>
              <th scope="col" className="px-4 py-3.5 text-center w-28">Trạng thái</th>
              <th scope="col" className="px-5 py-3.5">Tên Page</th>
              {dataOptions.likes && <th scope="col" className="px-4 py-3.5 text-center">Người theo dõi</th>}
              {dataOptions.posts && <th scope="col" className="px-4 py-3.5 text-center">Số bài viết</th>}
              {dataOptions.monetize && <th scope="col" className="px-4 py-3.5 text-center">Kiếm tiền</th>}
              {dataOptions.live && <th scope="col" className="px-5 py-3.5">Tiến trình</th>}
              <th scope="col" className="px-4 py-3.5 text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 dark:divide-gray-800 text-xs text-gray-700 dark:text-gray-300">
            {filteredPages.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                  Không tìm thấy Fanpage nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredPages.map((page) => {
                const isSelected = selectedIds.includes(page.id);
                return (
                  <tr
                    key={page.id}
                    className={`hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-all ${
                      isSelected ? "bg-blue-50/30 dark:bg-blue-950/10" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelectRow(page.id, e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {page.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-150 dark:border-green-900/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Hoạt động
                        </span>
                      ) : page.status === "DISABLED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-150 dark:border-rose-900/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Hạn chế quảng cáo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-150 dark:border-amber-900/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Xem xét
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                          {page.name}
                          {page.verification === "BLUE" ? (
                            <span className="text-[9px] bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-150 dark:border-blue-900/30 font-extrabold px-1 rounded">Tích xanh</span>
                          ) : page.verification === "GRAY" ? (
                            <span className="text-[9px] bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-150 dark:border-gray-700 font-extrabold px-1 rounded">Tích xám</span>
                          ) : null}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">Page ID: {page.pageId}</span>
                      </div>
                    </td>
                    {dataOptions.likes && (
                      <td className="px-4 py-3.5 text-center font-semibold text-gray-900 dark:text-white">{page.followers}</td>
                    )}
                    {dataOptions.posts && (
                      <td className="px-4 py-3.5 text-center font-medium">{page.postsCount}</td>
                    )}
                    {dataOptions.monetize && (
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          page.monetization === "Đủ điều kiện"
                            ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-150 dark:border-green-900/30"
                            : page.monetization === "Đang xem xét"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-150 dark:border-amber-900/30"
                            : "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                        }`}>
                          {page.monetization}
                        </span>
                      </td>
                    )}
                    {dataOptions.live && (
                      <td className="px-5 py-3.5">
                        <span className="text-gray-500 dark:text-gray-400 text-[11px] font-medium">{page.distribution}</span>
                      </td>
                    )}
                    <td className="px-4 py-3.5 text-center">
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Stat Panel */}
      <div className="bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-150 dark:border-gray-800 px-5 py-3.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-semibold select-none">
        <div className="flex gap-4">
          <span>TỔNG: <strong className="text-gray-700 dark:text-white">{filteredPages.length}</strong></span>
          <span>CHỌN: <strong className="text-blue-600 dark:text-blue-400">{selectedIds.length}</strong></span>
          <span>VÙNG: <strong className="text-gray-700 dark:text-white">{selectedRegion}</strong></span>
        </div>
        <button
          onClick={openConfig}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold transition flex items-center gap-1 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Cấu hình tải dữ liệu Page
        </button>
      </div>
    </div>
  );
}
