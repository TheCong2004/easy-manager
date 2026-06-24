"use client";

import React from "react";
import Link from "next/link";
import { SEARCHATLAS_APPS, SearchAtlasApp } from "@/config/searchatlas-apps";

// Helper to render appropriate SVG icons based on the app config
function getAppIcon(iconName: string) {
  const baseClass = "w-6 h-6";
  switch (iconName) {
    case "coworker":
      return (
        <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      );
    case "otto-seo":
      return (
        <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
        </svg>
      );
    case "site-metrics":
      return (
        <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      );
    case "llm-visibility":
      return (
        <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      );
    case "local":
      return (
        <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      );
    case "content":
      return (
        <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
      );
    case "keywords":
      return (
        <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637zM7.5 10.5h6" />
        </svg>
      );
    case "reports":
      return (
        <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" />
        </svg>
      );
    case "authority":
      return (
        <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
        </svg>
      );
    case "e-learning":
      return (
        <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5.25 3.75 9.75 12 14.25l8.25-4.5L12 5.25Z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.15a60 60 0 0 0-.49 6.34A48.62 48.62 0 0 1 12 20.9c2.79 0 5.43-.22 8.01-.64a60 60 0 0 0-.49-6.35"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25v6.5"/>
        </svg>
      );
    case "facebook-ads":
      return (
        <svg className={baseClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case "cloudphone":
      return (
        <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="7" y="2.5" width="10" height="19" rx="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 18.5h3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8.5a8.5 8.5 0 0 1 14 0" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a11 11 0 0 1 18 0" />
        </svg>
      );
    case "offerkit":
      return (
        <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5h16" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16h8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m15 9 1 1 2-3" />
        </svg>
      );
    default:
      return (
        <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      );
  }
}

export default function AppsLauncherPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          SearchAtlas Suite
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Hệ thống ứng dụng tự động hóa SEO, nghiên cứu từ khóa và tối ưu hóa thứ hạng tìm kiếm.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SEARCHATLAS_APPS.map((app: SearchAtlasApp) => {
          const isReady = app.status === "ready";
          const isComing = app.status === "coming_soon";
          const isPartial = app.status === "partial";

          return (
            <div
              key={app.key}
              className="bg-white dark:bg-[#1e1e2d] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-lime-50 dark:bg-lime-950/30 text-lime-600 dark:text-lime-400 rounded-xl">
                    {getAppIcon(app.icon)}
                  </div>
                  
                  {isReady && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                      Sẵn sàng
                    </span>
                  )}
                  {isPartial && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                      Đang hoàn thiện
                    </span>
                  )}
                  {isComing && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      Sắp ra mắt
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {app.label}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {app.description}
                </p>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1b1b28] border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Route: {app.route}
                </span>

                <Link
                  href={app.route}
                  className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer ${
                    isComing
                      ? "bg-gray-100 dark:bg-gray-850 text-gray-450 dark:text-gray-500 border border-gray-200 dark:border-gray-800/80 cursor-not-allowed pointer-events-none"
                      : "bg-lime-500 hover:bg-lime-600 text-white"
                  }`}
                >
                  {isComing ? "Chưa khả dụng" : "Mở ứng dụng"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
