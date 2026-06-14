"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FacebookAdsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Tài khoản QC",
      path: "/facebook-ads/tai-khoan-qc",
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.68-.34-1.16-1.04-1.16-1.84V9.58c0-.8.48-1.5 1.16-1.84L15.34 5.9c1.03-.52 2.16.24 2.16 1.4v13.4c0 1.16-1.13 1.92-2.16 1.4l-5-2.66zM7.5 9.5h-1a2.5 2.5 0 00-2.5 2.5v1a2.5 2.5 0 002.5 2.5h1" />
        </svg>
      ),
    },
    {
      name: "Tài khoản BM",
      path: "/facebook-ads/tai-khoan-bm",
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5l6.74-6.76zM16.5 10.5h-3v3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18" />
        </svg>
      ),
    },
    {
      name: "Fanpage",
      path: "/facebook-ads/fanpage",
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 8h6M9 12h6M9 16h6" />
        </svg>
      ),
    },
    {
      name: "Cài đặt",
      path: "/facebook-ads/cai-dat",
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-[#11121e] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl overflow-hidden shadow-theme-xs min-h-[calc(100vh-46px)]">
      {/* Sub Sidebar */}
      <div className="w-full md:w-52 shrink-0 bg-gray-50/30 dark:bg-gray-950/20 border-b md:border-b-0 py-5 px-3 flex flex-col gap-4 select-none">
        {/* Sub Sidebar Header */}
        <div className="flex items-center gap-2 px-2 pb-3.5">
          <span className="font-black text-sm text-gray-850 dark:text-white truncate">Ads Manager</span>
          <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase leading-none">App</span>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-blue-50/70 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                    : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-850"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {children}
      </div>
    </div>
  );
}
