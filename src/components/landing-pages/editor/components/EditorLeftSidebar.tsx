"use client";
import React from "react";

interface EditorLeftSidebarProps {
  activeAction: string | null;
  onOpenElements: () => void;
  onOpenLayers: () => void;
  onOpenAssets: () => void;
  onOpenPageSettings: () => void;
}

export const EditorLeftSidebar: React.FC<EditorLeftSidebarProps> = ({
  activeAction,
  onOpenElements,
  onOpenLayers,
  onOpenAssets,
  onOpenPageSettings,
}) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-between bg-white py-3">
      {/* Top Section Icons */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          title="Trang quản trị"
          onClick={() => window.open("/landing-pages", "_blank")}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-blue-600 bg-blue-50 transition hover:bg-blue-100"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 12.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25z" />
          </svg>
        </button>

        <div className="h-[1px] w-6 bg-gray-100 my-1" />

        <button
          type="button"
          title="Thêm phần tử"
          onClick={onOpenElements}
          className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition ${
            activeAction === "elements"
              ? "bg-purple-50 text-[#5b21b6]"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <svg className="h-5.5 w-5.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>

        <button
          type="button"
          title="Layers"
          onClick={onOpenLayers}
          className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition ${
            activeAction === "layers"
              ? "bg-purple-50 text-[#5b21b6]"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm0 5.25h.007v.008H3.75v-.008Zm0 5.25h.007v.008H3.75v-.008Z" />
          </svg>
        </button>

        <button
          type="button"
          title="Thiết lập trang"
          onClick={onOpenPageSettings}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.193c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774a1.125 1.125 0 01.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.094c0 .55-.398 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.164.398-.143.854.107 1.204l.527.738a1.125 1.125 0 01-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.448-.12l-.774-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <button
          type="button"
          title="Assets"
          onClick={onOpenAssets}
          className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition ${
            activeAction === "assets"
              ? "bg-purple-50 text-[#5b21b6]"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25M21 7.5v9l-9 5.25m0-9L3 7.5m9 5.25v9M3 7.5v9l9 5.25" />
          </svg>
        </button>
      </div>

      {/* Bottom Section Icons */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          title="Trợ giúp"
          onClick={() => alert("Nhấn double click vào element để chỉnh sửa nhanh. Bảng bên phải chứa các cài đặt chi tiết.")}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        </button>

        <button
          type="button"
          title="Video hướng dẫn"
          onClick={() => window.open("https://youtube.com", "_blank")}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </button>

        <button
          type="button"
          title="Tạo trang mới"
          onClick={() => window.open("/landing-pages", "_blank")}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
