"use client";

import React from "react";
import Link from "next/link";

export default function LlmVisibilityPlaceholder() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
            Đang hoàn thiện (Partial)
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mt-2">
            LLM Visibility
          </h1>
        </div>
        <Link
          href="/apps"
          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition"
        >
          Quay lại App Launcher
        </Link>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 mb-8 text-sm text-amber-800 dark:text-amber-300 flex items-start gap-3">
        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZMM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <div>
          <p className="font-semibold">Chưa kết nối dữ liệu (Not Connected)</p>
          <p className="mt-1 opacity-90">
            Để theo dõi tỷ lệ hiển thị (Share of Voice) trên các công cụ tìm kiếm AI, vui lòng kết nối tài khoản SearchAtlas API của bạn.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1e2d] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8">
        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl mb-8">
          <svg className="w-16 h-16 mx-auto text-gray-350 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Chưa phân tích AI Search Visibility</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
            Không có lịch sử chạy hoặc báo cáo LLM nào được tìm thấy. Bạn cần cấu hình bộ từ khóa và các câu hỏi mẫu để bắt đầu quét.
          </p>
          <button className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700 pointer-events-none cursor-not-allowed">
            + Chạy phân tích mới
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Các tính năng đang được phát triển:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Đo lường sự xuất hiện thương hiệu trên ChatGPT Search, Gemini, Claude",
              "Theo dõi và phân loại các chủ đề (Topics) người dùng hay hỏi AI",
              "Phân tích hành trình tìm kiếm AI (AI Engine Response tracking)",
              "Cảnh báo độ phủ hiển thị khi đối thủ cạnh tranh tăng trưởng"
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                <svg className="w-5 h-5 text-lime-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
