"use client";
import React from "react";
import { useDrag } from "react-dnd";
import { BlockType, PALETTE_CATEGORIES, DND_TYPES, PaletteDragItem } from "../types";

export const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
  hero: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M21 3H3m18 9H3" />
    </svg>
  ),
  text: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
  ),
  image: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  button: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
    </svg>
  ),
  spacer: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75M3 18h14.25M17.25 18.75V9.75m0 9l2.25-2.25M17.25 18.75l-2.25-2.25M17.25 9.75l2.25 2.25m-2.25-2.25l-2.25 2.25" />
    </svg>
  ),
  divider: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.499 11.998h15" />
    </svg>
  ),
  columns: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  feature_card: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.561 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  testimonial: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  countdown: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  video: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
  ),
  form_capture: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  chat_widget: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 4.142-4.03 7.5-9 7.5a10.7 10.7 0 01-3.533-.594L3 20.25l1.783-4.161A6.884 6.884 0 013 12c0-4.142 4.03-7.5 9-7.5s9 3.358 9 7.5z" />
    </svg>
  ),
  funnel_popup: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875h16.5v4.5H3.75v-4.5zm2.25 7.5h12v6.75h-12v-6.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15.75h6" />
    </svg>
  ),
  tea_landing: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.5-4.5-4.5-10.5 1.5-16.5C18 9 18 15 12 21z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c0-5 1.5-9 5-12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 13c4.5-.5 7.5 1 9 4.5C8.5 18.5 5.5 17 4 13z" />
    </svg>
  ),
  smartwatch_landing: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6V3h6v3M9 18v3h6v-3" />
    </svg>
  ),
  gallery: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  box: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.561 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  product_card: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  collection_list: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  carousel: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
    </svg>
  ),
  tabs: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  frame: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
    </svg>
  ),
  accordion: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
    </svg>
  ),
  table: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5M4.5 19.5h15a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H4.5A1.5 1.5 0 003 6v12a1.5 1.5 0 001.5 1.5z" />
    </svg>
  ),
  survey: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  menu: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  html_code: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
};

export const PaletteItem: React.FC<{
  blockType: BlockType;
  onClickAdd: (bt: BlockType) => void;
}> = ({ blockType, onClickAdd }) => {
  const [{ isDragging }, drag] = useDrag<PaletteDragItem, unknown, { isDragging: boolean }>({
    type: DND_TYPES.PALETTE_BLOCK,
    item: { type: DND_TYPES.PALETTE_BLOCK, blockType },
    collect: (m) => ({ isDragging: m.isDragging() }),
  });

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      onClick={() => onClickAdd(blockType)}
      className={`group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-grab active:cursor-grabbing transition-all select-none ${
        isDragging
          ? "border-purple-500 bg-purple-50 opacity-50"
          : "border-gray-200 bg-gray-50 hover:border-purple-500/60 hover:bg-purple-50"
      }`}
    >
      <span className="text-gray-500 flex-shrink-0 transition group-hover:text-purple-600">{BLOCK_ICONS[blockType]}</span>
      <span className="text-xs font-semibold text-gray-700 truncate">{blockType.replace("_", " ").toUpperCase()}</span>
    </div>
  );
};

export interface PresetItem {
  id: string;
  label: string;
  sub: string;
  blockType: BlockType;
  props?: Record<string, unknown>;
  element: React.ReactNode;
}

export const getCategoryPresets = (category: string): PresetItem[] => {
  const items: PresetItem[] = [];

  if (category === "text") {
    items.push(
      {
        id: "h1",
        label: "Tiêu đề lớn nhất (H1)",
        sub: "h1 head title van ban",
        blockType: "text",
        props: { fontSize: 36, content: "TIÊU ĐỀ CHÍNH LANDING PAGE" },
        element: <div className="text-lg font-extrabold text-gray-900 tracking-tight leading-tight">Heading 1 (36px)</div>
      },
      {
        id: "h2",
        label: "Tiêu đề vừa (H2)",
        sub: "h2 sub subtitle van ban",
        blockType: "text",
        props: { fontSize: 24, content: "Tiêu đề phụ nổi bật H2" },
        element: <div className="text-sm font-bold text-gray-800 tracking-tight leading-tight">Heading 2 (24px)</div>
      },
      {
        id: "h3",
        label: "Tiêu đề nhỏ (H3)",
        sub: "h3 sub subtitle van ban",
        blockType: "text",
        props: { fontSize: 18, content: "Tiêu đề phân đoạn H3" },
        element: <div className="text-xs font-semibold text-gray-700 leading-tight">Heading 3 (18px)</div>
      },
      {
        id: "p",
        label: "Đoạn văn mô tả",
        sub: "paragraph body text van ban",
        blockType: "text",
        props: { fontSize: 15, content: "Đây là đoạn văn bản chi tiết giới thiệu về dịch vụ hoặc sản phẩm của bạn. Hãy chỉnh sửa nội dung này trong thanh công cụ bên phải." },
        element: <div className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">Đoạn văn tiêu chuẩn dùng để thuyết phục khách hàng và mô tả chi tiết tính năng sản phẩm.</div>
      },
      {
        id: "hero-text",
        label: "Banner Hero Mini",
        sub: "hero banner layout header van ban",
        blockType: "hero",
        element: (
          <div className="h-14 rounded border border-purple-200 bg-purple-50/50 flex flex-col items-center justify-center p-2 text-center border-dashed">
            <span className="font-extrabold text-[10px] text-purple-700">HERO BANNER MINI</span>
            <span className="text-[8px] text-gray-500">Tiêu đề + CTA + Ảnh nền</span>
          </div>
        )
      }
    );
  } else if (category === "button") {
    items.push(
      {
        id: "btn-solid-orange",
        label: "Nút Đặt Hàng (Cam)",
        sub: "button orange solid buy now cta nut bam",
        blockType: "button",
        props: { style: "filled", label: "ĐẶT HÀNG NGAY", color: "#f97316", textColor: "#ffffff", borderRadius: 8 },
        element: <button className="w-full bg-[#f97316] text-white text-[10px] py-1.5 font-bold pointer-events-none rounded shadow-sm">ĐẶT HÀNG NGAY</button>
      },
      {
        id: "btn-outline-purple",
        label: "Nút Tìm Hiểu Thêm (Tím)",
        sub: "button purple outline learn more cta nut bam",
        blockType: "button",
        props: { style: "outline", label: "TÌM HIỂU THÊM", color: "#8b5cf6", textColor: "#8b5cf6", borderRadius: 8 },
        element: <button className="w-full bg-transparent text-[#8b5cf6] border border-[#8b5cf6] text-[10px] py-1.5 font-bold pointer-events-none rounded">TÌM HIỂU THÊM</button>
      },
      {
        id: "btn-buy-green",
        label: "Nút Mua Ngay (Bo tròn xanh)",
        sub: "button green rounded buy now cta nut bam",
        blockType: "button",
        props: { style: "filled", label: "MUA NGAY →", color: "#16a34a", textColor: "#ffffff", borderRadius: 9999 },
        element: <button className="w-full bg-[#16a34a] text-white rounded-full text-[10px] py-1.5 font-bold pointer-events-none shadow-sm">MUA NGAY →</button>
      },
      {
        id: "btn-link-blue",
        label: "Nút dạng văn bản (Link)",
        sub: "button text link blue click here cta nut bam",
        blockType: "button",
        props: { style: "text", label: "Xem chi tiết chính sách →", color: "transparent", textColor: "#2563eb", borderRadius: 0 },
        element: <span className="text-blue-600 text-[10px] font-bold underline text-center block pointer-events-none">Xem chi tiết chính sách →</span>
      }
    );
  } else if (category === "image") {
    items.push(
      {
        id: "img-classic",
        label: "Hình ảnh cơ bản",
        sub: "image single picture photo anh",
        blockType: "image",
        props: { src: "/images/product/skincare_product.png", alt: "Sản phẩm", showCaption: false },
        element: (
          <div className="h-16 bg-gray-100 border border-gray-250 rounded flex flex-col items-center justify-center text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
            </svg>
          </div>
        )
      },
      {
        id: "img-modern-rounded",
        label: "Ảnh bo góc sang trọng",
        sub: "image rounded corners avatar border anh",
        blockType: "image",
        props: { src: "/images/product/green_tea_product.png", alt: "Green Tea Organic", borderRadius: 16, showCaption: true, caption: "Trà xanh Organic nguyên chất" },
        element: (
          <div className="h-16 bg-gray-100 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
            <span className="text-[10px] text-gray-500 font-bold">Image rounded corners</span>
          </div>
        )
      }
    );
  } else if (category === "gallery") {
    items.push(
      {
        id: "gallery-3-cols",
        label: "Ảnh trưng bày (3 cột)",
        sub: "gallery columns photos grid images list layout",
        blockType: "gallery",
        props: { columns: 3, gap: 12, borderRadius: 8 },
        element: (
          <div className="grid grid-cols-3 gap-1 h-12">
            <div className="bg-gray-200 border border-gray-300 rounded"></div>
            <div className="bg-gray-200 border border-gray-300 rounded"></div>
            <div className="bg-gray-200 border border-gray-300 rounded"></div>
          </div>
        )
      },
      {
        id: "gallery-2-cols",
        label: "Ảnh trưng bày (2 cột)",
        sub: "gallery columns grid images list layout",
        blockType: "gallery",
        props: { columns: 2, gap: 16, borderRadius: 12 },
        element: (
          <div className="grid grid-cols-2 gap-1.5 h-12">
            <div className="bg-gray-200 border border-gray-300 rounded"></div>
            <div className="bg-gray-200 border border-gray-300 rounded"></div>
          </div>
        )
      }
    );
  } else if (category === "box") {
    items.push(
      {
        id: "box-border-dashed",
        label: "Hộp chứa viền nét đứt",
        sub: "box container outline border dashed hinh hop",
        blockType: "box",
        props: { bgColor: "#f9fafb", borderColor: "#cbd5e1", borderWidth: 2, borderRadius: 8, paddingX: 16, paddingY: 16 },
        element: <div className="h-12 border-2 border-dashed border-gray-300 bg-gray-50 rounded flex items-center justify-center text-[9px] text-gray-400 font-bold">Container nét đứt</div>
      },
      {
        id: "box-shadow-card",
        label: "Hộp thẻ trắng có bóng đổ",
        sub: "box container card solid premium shadow hinh hop",
        blockType: "box",
        props: { bgColor: "#ffffff", borderColor: "#e2e8f0", borderWidth: 1, borderRadius: 16, paddingX: 24, paddingY: 24 },
        element: <div className="h-12 border border-gray-200 bg-white shadow-md rounded-xl flex items-center justify-center text-[9px] text-gray-700 font-extrabold">White Premium Card</div>
      }
    );
  } else if (category === "icon") {
    items.push(
      {
        id: "icon-gold-star",
        label: "Sao đánh giá vàng",
        sub: "icon star badge rating gold bieu tuong",
        blockType: "icon",
        props: { icon: "⭐", size: 36, color: "#f59e0b", bgColor: "#fef3c7", borderRadius: 9999, align: "center" },
        element: (
          <div className="flex justify-center py-1">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs">⭐</div>
          </div>
        )
      },
      {
        id: "icon-purple-bolt",
        label: "Tia chớp nhanh nhẹn",
        sub: "icon bolt speed feature quick bieu tuong",
        blockType: "icon",
        props: { icon: "⚡", size: 36, color: "#8b5cf6", bgColor: "#f3e8ff", borderRadius: 12, align: "center" },
        element: (
          <div className="flex justify-center py-1">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-xs">⚡</div>
          </div>
        )
      }
    );
  } else if (category === "divider") {
    items.push(
      {
        id: "div-thick-solid",
        label: "Đường kẻ chia phần liền",
        sub: "divider line solid separator duong ke",
        blockType: "divider",
        props: { style: "solid", color: "#e2e8f0", thickness: 2 },
        element: <div className="h-4 flex items-center justify-center"><div className="w-full h-0.5 bg-gray-200"></div></div>
      },
      {
        id: "div-thin-dashed",
        label: "Đường ngăn cách nét đứt",
        sub: "divider line dashed separator duong ke",
        blockType: "divider",
        props: { style: "dashed", color: "#cbd5e1", thickness: 1 },
        element: <div className="h-4 flex items-center justify-center"><div className="w-full h-px border-t border-dashed border-gray-300"></div></div>
      }
    );
  } else if (category === "form") {
    items.push(
      {
        id: "form-newsletter",
        label: "Form đăng ký nhận tin (Email)",
        sub: "form newsletter capture lead contact email form",
        blockType: "form_capture",
        props: {
          title: "Đăng Ký Nhận Bản Tin",
          subtitle: "Nhận ưu đãi 10% cho đơn hàng đầu tiên của bạn.",
          submitLabel: "ĐĂNG KÝ NGAY",
          submitColor: "#8b5cf6",
          bgColor: "#ffffff",
          borderRadius: 16,
          fields: [
            { id: "f_email", label: "Nhập địa chỉ Email của bạn", type: "email", required: true }
          ]
        },
        element: (
          <div className="p-2 border border-gray-200 bg-white rounded-lg space-y-1">
            <div className="text-[9px] font-bold text-gray-800 text-center">Đăng Ký Nhận Bản Tin</div>
            <div className="h-5 bg-gray-50 border border-gray-200 rounded px-1.5 text-[8px] text-gray-400 flex items-center">Nhập email...</div>
            <div className="h-5 bg-[#8b5cf6] rounded text-[9px] font-bold text-white flex items-center justify-center">ĐĂNG KÝ</div>
          </div>
        )
      },
      {
        id: "form-full-lead",
        label: "Form liên hệ tư vấn đầy đủ",
        sub: "form capture contact lead sales details form",
        blockType: "form_capture",
        props: {
          title: "Nhận Tư Vấn Miễn Phí",
          subtitle: "Để lại thông tin, đội ngũ chuyên gia sẽ gọi lại cho bạn sau 15 phút.",
          submitLabel: "GỬI THÔNG TIN",
          submitColor: "#16a34a",
          bgColor: "#ffffff",
          borderRadius: 16,
          fields: [
            { id: "f_name", label: "Họ và tên của bạn", type: "text", required: true },
            { id: "f_phone", label: "Số điện thoại liên hệ", type: "phone", required: true },
            { id: "f_email", label: "Địa chỉ Email", type: "email", required: false }
          ]
        },
        element: (
          <div className="space-y-1.5 p-2 bg-white border border-gray-200 rounded-lg">
            <div className="h-4 bg-gray-50 border border-gray-200 rounded px-1.5 text-[7px] text-gray-400 flex items-center">Họ và tên...</div>
            <div className="h-4 bg-gray-50 border border-gray-200 rounded px-1.5 text-[7px] text-gray-400 flex items-center">Số điện thoại...</div>
            <div className="h-4.5 bg-[#16a34a] rounded text-[8px] font-bold text-white flex items-center justify-center">GỬI ĐĂNG KÝ</div>
          </div>
        )
      }
    );
  } else if (category === "product") {
    items.push(
      {
        id: "prod-single-skincare",
        label: "1 Sản phẩm: Kem Dưỡng Organic",
        sub: "product card single showcase skincare premium store ecommerce san pham",
        blockType: "product_card",
        props: {
          title: "Kem Dưỡng Da Organic Cao Cấp",
          description: "Chiết xuất 100% thảo mộc hữu cơ giúp làn da sáng mịn rạng ngời tự nhiên.",
          price: "399.000đ",
          oldPrice: "550.000đ",
          image: "/images/product/skincare_product.png",
          badge: "Bán chạy",
          ctaText: "MUA NGAY",
          bgColor: "#ffffff",
          borderColor: "#e2e8f0",
          borderRadius: 16
        },
        element: (
          <div className="p-2 border border-gray-200 bg-white rounded-lg flex gap-2 items-center">
            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
              <img src="/images/product/skincare_product.png" alt="Skincare" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-800 truncate">Kem Dưỡng Organic</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[9px] text-red-655 font-black">399.000đ</span>
                <span className="text-[8px] text-gray-400 line-through">550.000đ</span>
              </div>
            </div>
          </div>
        )
      },
      {
        id: "prod-grid-double-row",
        label: "2 Sản phẩm trên 1 Hàng (Hot)",
        sub: "product grid row double 2 items columns e-commerce organic tea skincare",
        blockType: "product_card",
        props: {
          title: "", // Empty title means grid mode
          description: "",
          price: "",
          ctaText: "MUA NGAY",
          bgColor: "#ffffff",
          borderColor: "#e2e8f0",
          borderRadius: 16,
          columns: 2,
          items: [
            {
              id: "p_1",
              title: "Kem Dưỡng Da Organic",
              description: "Nuôi dưỡng làn da ban đêm chuyên sâu.",
              price: "399.000đ",
              oldPrice: "550.000đ",
              image: "/images/product/skincare_product.png",
              badge: "Bán chạy"
            },
            {
              id: "p_2",
              title: "Trà Xanh Zen Organic",
              description: "Hỗ trợ thải độc, thanh nhiệt cơ thể.",
              price: "249.000đ",
              oldPrice: "320.000đ",
              image: "/images/product/green_tea_product.png",
              badge: "Mới"
            }
          ]
        },
        element: (
          <div className="p-2 border border-purple-200 bg-purple-50/30 rounded-lg space-y-1.5">
            <div className="text-[8px] font-bold text-purple-700 text-center uppercase tracking-wider">Hàng 2 sản phẩm (1 dòng)</div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-white border border-gray-250 p-1.5 rounded flex flex-col items-center">
                <div className="w-8 h-8 rounded overflow-hidden bg-gray-100">
                  <img src="/images/product/skincare_product.png" alt="p1" className="w-full h-full object-cover" />
                </div>
                <span className="text-[8px] font-bold text-gray-800 text-center mt-1 truncate w-full">Kem Dưỡng</span>
                <span className="text-[8px] text-red-655 font-bold">399k</span>
              </div>
              <div className="bg-white border border-gray-250 p-1.5 rounded flex flex-col items-center">
                <div className="w-8 h-8 rounded overflow-hidden bg-gray-100">
                  <img src="/images/product/green_tea_product.png" alt="p2" className="w-full h-full object-cover" />
                </div>
                <span className="text-[8px] font-bold text-gray-800 text-center mt-1 truncate w-full">Trà Xanh Organic</span>
                <span className="text-[8px] text-red-655 font-bold">249k</span>
              </div>
            </div>
          </div>
        )
      },
      {
        id: "prod-grid-triple-row",
        label: "3 Sản phẩm trên 1 Hàng",
        sub: "product grid row triple 3 items columns e-commerce",
        blockType: "product_card",
        props: {
          title: "",
          description: "",
          price: "",
          ctaText: "MUA NGAY",
          bgColor: "#ffffff",
          borderColor: "#e2e8f0",
          borderRadius: 16,
          columns: 3,
          items: [
            {
              id: "p_1",
              title: "Đồng Hồ Thông Minh S7",
              description: "Hỗ trợ theo dõi sức khỏe 24/7.",
              price: "1.250.000đ",
              oldPrice: "1.890.000đ",
              image: "/images/product/smartwatch_product.png",
              badge: "Hot"
            },
            {
              id: "p_2",
              title: "Kem Dưỡng Da Organic",
              description: "Chiết xuất thảo dược.",
              price: "399.000đ",
              oldPrice: "550.000đ",
              image: "/images/product/skincare_product.png"
            },
            {
              id: "p_3",
              title: "Trà Xanh Zen Organic",
              description: "Chống oxy hóa tự nhiên.",
              price: "249.000đ",
              image: "/images/product/green_tea_product.png",
              badge: "Eco"
            }
          ]
        },
        element: (
          <div className="p-2 border border-gray-250 bg-white rounded-lg space-y-1">
            <div className="grid grid-cols-3 gap-1">
              {[
                { img: "/images/product/smartwatch_product.png", price: "1250k" },
                { img: "/images/product/skincare_product.png", price: "399k" },
                { img: "/images/product/green_tea_product.png", price: "249k" }
              ].map((pItem, pIdx) => (
                <div key={pIdx} className="bg-gray-50 border border-gray-200 p-1 rounded flex flex-col items-center">
                  <div className="w-6 h-6 rounded overflow-hidden bg-gray-100">
                    <img src={pItem.img} alt="item" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[7px] text-red-655 font-black mt-1">{pItem.price}</span>
                </div>
              ))}
            </div>
          </div>
        )
      }
    );
  } else if (category === "video") {
    items.push(
      {
        id: "vid-youtube",
        label: "Video Youtube Embed",
        sub: "video player embed youtube video clip",
        blockType: "video",
        props: { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", autoplay: false, muted: true, controls: true, borderRadius: 12 },
        element: (
          <div className="h-16 bg-gray-50 border border-gray-255 rounded-xl flex flex-col items-center justify-center text-red-500 gap-1">
            <span className="text-xl">▶</span>
            <span className="text-[8px] text-gray-500 font-bold">YouTube Video Embed</span>
          </div>
        )
      }
    );
  } else if (category === "collection") {
    items.push(
      {
        id: "coll-benefits-grid",
        label: "Lợi ích nổi bật (3 Cột)",
        sub: "collection list features grid cards collection benefits",
        blockType: "collection_list",
        props: {
          columns: 3,
          layout: "grid",
          bgColor: "#ffffff",
          items: [
            { id: "b_1", title: "Giao Hàng Siêu Tốc", desc: "Nhận hàng trong vòng 2 giờ kể từ khi thanh toán.", icon: "⚡" },
            { id: "b_2", title: "Hữu Cơ 100%", desc: "Chứng nhận chất lượng USDA quốc tế.", icon: "🍃" },
            { id: "b_3", title: "Bảo Hành 12 Tháng", desc: "Lỗi 1 đổi 1 tận nơi nhanh chóng.", icon: "🛡️" }
          ]
        },
        element: (
          <div className="grid grid-cols-3 gap-1 h-12">
            <div className="bg-gray-50 border border-gray-200 rounded p-1 flex flex-col items-center justify-center"><span className="text-[8px]">⚡</span></div>
            <div className="bg-gray-50 border border-gray-200 rounded p-1 flex flex-col items-center justify-center"><span className="text-[8px]">🍃</span></div>
            <div className="bg-gray-50 border border-gray-200 rounded p-1 flex flex-col items-center justify-center"><span className="text-[8px]">🛡️</span></div>
          </div>
        )
      }
    );
  } else if (category === "carousel") {
    items.push(
      {
        id: "caro-products",
        label: "Slider ảnh xoay vòng",
        sub: "carousel slider images slideshow active index product banner",
        blockType: "carousel",
        props: {
          images: [
            "/images/product/green_tea_product.png",
            "/images/product/skincare_product.png",
            "/images/product/smartwatch_product.png"
          ],
          autoplay: true,
          interval: 3000,
          showIndicators: true,
          showArrows: true,
          height: 350
        },
        element: (
          <div className="p-2 border border-gray-255 bg-white rounded-lg flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-bold">⟨</span>
            <span className="text-[8px] text-purple-600 font-extrabold">Carousel Slider (3 ảnh)</span>
            <span className="text-[10px] text-gray-400 font-bold">⟩</span>
          </div>
        )
      }
    );
  } else if (category === "tabs") {
    items.push(
      {
        id: "tab-specs",
        label: "Tabs chi tiết kỹ thuật",
        sub: "tabs info navigation switch product reviews specs",
        blockType: "tabs",
        element: (
          <div className="flex gap-1 p-1 bg-gray-50 border border-gray-200 rounded">
            <div className="bg-white text-[8px] text-purple-600 font-bold px-2 py-0.5 rounded shadow-sm border border-gray-200">Mô tả</div>
            <div className="text-[8px] text-gray-500 font-bold px-2 py-0.5">Thông số</div>
            <div className="text-[8px] text-gray-500 font-bold px-2 py-0.5">Ưu đãi</div>
          </div>
        )
      }
    );
  } else if (category === "frame") {
    items.push(
      {
        id: "frame-browser-window",
        label: "Mockup Cửa sổ Trình duyệt",
        sub: "frame iframe window web mockup site frame",
        blockType: "frame",
        element: (
          <div className="border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-100 h-2.5 w-full flex gap-1 items-center px-1.5">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              <span className="w-1 h-1 rounded-full bg-yellow-400"></span>
              <span className="w-1 h-1 rounded-full bg-green-400"></span>
            </div>
            <div className="h-6 flex items-center justify-center text-[7px] text-gray-400">Browser Preview Window</div>
          </div>
        )
      }
    );
  } else if (category === "accordion") {
    items.push(
      {
        id: "acc-faq-list",
        label: "Hộp FAQ xếp chồng",
        sub: "accordion faq collapse collapse question list accordion",
        blockType: "accordion",
        element: (
          <div className="space-y-1 p-1 bg-white border border-gray-200 rounded-lg">
            <div className="h-4 border border-gray-200 bg-gray-50 rounded px-1.5 text-[7px] text-gray-700 flex items-center justify-between"><span>Làm thế nào để đổi trả hàng?</span><span>▼</span></div>
            <div className="h-4 border border-gray-200 bg-gray-50 rounded px-1.5 text-[7px] text-gray-700 flex items-center justify-between"><span>Sản phẩm có an toàn cho bà bầu?</span><span>▼</span></div>
          </div>
        )
      }
    );
  } else if (category === "table") {
    items.push(
      {
        id: "tbl-pricing-matrix",
        label: "Bảng giá so sánh dịch vụ",
        sub: "table pricing grid package compare features table",
        blockType: "table",
        element: (
          <div className="border border-gray-200 bg-white rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 text-[6px] font-bold text-gray-500 p-1 border-b border-gray-200">
              <span>GÓI</span><span>HỖ TRỢ</span><span>GIÁ</span>
            </div>
            <div className="grid grid-cols-3 text-[6px] text-gray-650 p-1 border-b border-gray-150">
              <span>Cá nhân</span><span>Email</span><span>99k/tháng</span>
            </div>
            <div className="grid grid-cols-3 text-[6px] text-gray-650 p-1">
              <span>Doanh nghiệp</span><span>24/7</span><span>499k/tháng</span>
            </div>
          </div>
        )
      }
    );
  } else if (category === "survey") {
    items.push(
      {
        id: "sv-feedback-stars",
        label: "Khảo sát ý kiến đánh giá",
        sub: "survey poll quiz checklist rating questionnaire survey",
        blockType: "survey",
        element: (
          <div className="p-2 border border-gray-250 bg-white rounded-lg space-y-1">
            <div className="text-[7px] font-bold text-gray-800 text-center">Khảo sát chất lượng dịch vụ</div>
            <div className="h-4 border border-purple-500 bg-purple-50 rounded px-1.5 text-[7px] text-purple-700 flex items-center justify-between"><span>Rất hài lòng</span><span>✓</span></div>
            <div className="h-4 border border-gray-200 bg-white rounded px-1.5 text-[7px] text-gray-400 flex items-center justify-between"><span>Chưa hài lòng</span><span></span></div>
          </div>
        )
      }
    );
  } else if (category === "menu") {
    items.push(
      {
        id: "mnu-header-nav",
        label: "Menu liên kết Header",
        sub: "menu navigation bar header link logo menu navbar",
        blockType: "menu",
        element: (
          <div className="p-1.5 px-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between text-[7px] text-gray-700 font-extrabold">
            <span className="text-purple-600">LADI-BRAND</span>
            <div className="flex gap-2"><span>Trang chủ</span><span>Dịch vụ</span><span>Liên hệ</span></div>
          </div>
        )
      }
    );
  } else if (category === "html") {
    items.push(
      {
        id: "html-custom-embed",
        label: "Khung nhúng HTML tùy chỉnh",
        sub: "html code custom script embed iframe html_code",
        blockType: "html_code",
        element: (
          <div className="h-10 rounded border border-purple-300 bg-purple-50 text-center flex items-center justify-center text-[8px] text-purple-700 font-mono border-dashed">
            {"</> HTML Custom Embed Code"}
          </div>
        )
      }
    );
  }

  return items;
};
