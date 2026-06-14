import React from "react";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceType: "all" | "by-id" | "by-bm";
  setSourceType: (type: "all" | "by-id" | "by-bm") => void;
  accountFilter: "all" | "personal" | "bm";
  setAccountFilter: (filter: "all" | "personal" | "bm") => void;
  dataOptions: {
    financial: boolean;
    insights: boolean;
    adminRights: boolean;
    timestamps: boolean;
    hiddenAccounts: boolean;
    payments: boolean;
  };
  setDataOptions: React.Dispatch<
    React.SetStateAction<{
      financial: boolean;
      insights: boolean;
      adminRights: boolean;
      timestamps: boolean;
      hiddenAccounts: boolean;
      payments: boolean;
    }>
  >;
  limitApi: number;
  setLimitApi: (limit: number) => void;
  onLoadData: () => void;
}

export default function ConfigModal({
  isOpen,
  onClose,
  sourceType,
  setSourceType,
  accountFilter,
  setAccountFilter,
  dataOptions,
  setDataOptions,
  limitApi,
  setLimitApi,
  onLoadData,
}: ConfigModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-all duration-300 animate-fade-in">
      <div className="bg-white dark:bg-[#11121e] border border-gray-150 dark:border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-150 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Cấu hình tải dữ liệu Ads</h3>
              <span className="text-[10px] sm:text-xs text-gray-400">Thiết lập nguồn dữ liệu và tùy chọn trước khi tải tài khoản quảng cáo.</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Modal */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[60vh] text-left">
          {/* NGUỒN TÀI LIỆU */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">Nguồn tài liệu</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: "all", title: "Tải toàn bộ", desc: "Quét toàn bộ TKQC hiện có" },
                { id: "by-id", title: "Tải theo ID", desc: "Tải theo danh sách ID TKQC" },
                { id: "by-bm", title: "Tải theo ID...", desc: "Lấy TKQC theo danh sách BM ID" },
              ].map((src) => (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => setSourceType(src.id as any)}
                  className={`flex flex-col text-left p-4.5 rounded-xl border transition-all cursor-pointer ${
                    sourceType === src.id
                      ? "bg-blue-50/40 border-blue-500 dark:bg-blue-950/10 dark:border-blue-500 text-blue-700 dark:text-blue-400 shadow-sm"
                      : "bg-gray-50/50 hover:bg-gray-50 dark:bg-gray-900/50 dark:hover:bg-gray-900 border-gray-150 dark:border-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs sm:text-sm font-bold">{src.title}</span>
                    {sourceType === src.id && (
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">{src.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* LOẠI TÀI KHOẢN */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">Loại tài khoản</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: "all", title: "Tất cả", desc: "Mặc định" },
                { id: "personal", title: "Cá nhân", desc: "Via/Clone" },
                { id: "bm", title: "BM", desc: "Business" },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setAccountFilter(type.id as any)}
                  className={`flex flex-col text-left p-4.5 rounded-xl border transition-all cursor-pointer ${
                    accountFilter === type.id
                      ? "bg-blue-50/40 border-blue-500 dark:bg-blue-950/10 dark:border-blue-500 text-blue-700 dark:text-blue-400 shadow-sm"
                      : "bg-gray-50/50 hover:bg-gray-50 dark:bg-gray-900/50 dark:hover:bg-gray-900 border-gray-150 dark:border-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs sm:text-sm font-bold">{type.title}</span>
                    {accountFilter === type.id && (
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">{type.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* TÙY CHỌN DỮ LIỆU */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">Tùy chọn dữ liệu</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "financial", label: "Tài chính", desc: "Số dư, ngưỡng, limit, tiền tệ" },
                { key: "insights", label: "Tổng tiêu", desc: "Insights tổng chi tiêu" },
                { key: "adminRights", label: "Admin & quyền", desc: "Số admin và quyền sở hữu" },
                { key: "timestamps", label: "Thời gian", desc: "Ngày tạo, hóa đơn, lý do khóa, múi giờ" },
                { key: "hiddenAccounts", label: "Tài khoản ẩn", desc: "Bao gồm cả tài khoản bị ẩn" },
                { key: "payments", label: "Thanh toán", desc: "Thông tin thẻ thanh toán" },
              ].map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-start gap-3 p-3.5 bg-gray-50/50 hover:bg-gray-50 dark:bg-gray-900/40 dark:hover:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl cursor-pointer select-none transition"
                >
                  <input
                    type="checkbox"
                    checked={(dataOptions as any)[opt.key]}
                    onChange={(e) =>
                      setDataOptions((prev) => ({
                        ...prev,
                        [opt.key]: e.target.checked,
                      }))
                    }
                    className="rounded text-blue-600 focus:ring-blue-500 w-4.5 h-4.5 mt-0.5 cursor-pointer"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* GIỚI HẠN MỖI TRANG */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4.5 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-800 rounded-xl">
            <div className="flex flex-col text-left">
              <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">Giới hạn mỗi trang (Limit API)</span>
              <span className="text-[10px] text-gray-400 mt-0.5">Số lượng Ads tối đa mỗi lần gọi API phân trang</span>
            </div>
            <input
              type="number"
              value={limitApi}
              onChange={(e) => setLimitApi(Number(e.target.value))}
              className="w-24 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 text-center"
            />
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-4.5 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-150 dark:border-gray-800 flex items-center justify-end gap-3.5">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition cursor-pointer select-none"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onLoadData}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer select-none"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Tải dữ liệu
          </button>
        </div>
      </div>
    </div>
  );
}
