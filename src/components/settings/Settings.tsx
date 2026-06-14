"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [themeMode, setThemeMode] = useState<string>("system");

  // Facebook Tokens State
  const [eaag, setEaag] = useState("");
  const [eaab, setEaab] = useState("");
  const [eaai, setEaai] = useState("");
  const [eaah, setEaah] = useState("");
  const [cookie, setCookie] = useState("");

  // Password Visibility States
  const [showEaag, setShowEaag] = useState(false);
  const [showEaab, setShowEaab] = useState(false);
  const [showEaai, setShowEaai] = useState(false);
  const [showEaah, setShowEaah] = useState(false);
  const [showCookie, setShowCookie] = useState(false);

  // Loading indicator for reload button
  const [isReloading, setIsReloading] = useState(false);

  // Load from localStorage on mount safely
  useEffect(() => {
    try {
      const savedThemeMode = localStorage.getItem("settings_theme_mode") || "system";
      setThemeMode(savedThemeMode);

      setEaag(localStorage.getItem("settings_token_eaag") || "");
      setEaab(localStorage.getItem("settings_token_eaab") || "");
      setEaai(localStorage.getItem("settings_token_eaai") || "");
      setEaah(localStorage.getItem("settings_token_eaah") || "");
      setCookie(localStorage.getItem("settings_token_cookie") || "");
    } catch (e) {
      console.error("Failed to load settings from localStorage:", e);
    }
  }, []);

  // Handle Theme Mode Change (System / Light / Dark)
  const handleThemeModeChange = (mode: string) => {
    setThemeMode(mode);
    try {
      localStorage.setItem("settings_theme_mode", mode);
    } catch (e) {
      console.error(e);
    }

    if (mode === "light") {
      if (theme === "dark") toggleTheme();
    } else if (mode === "dark") {
      if (theme === "light") toggleTheme();
    } else {
      // System Mode
      try {
        const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (isSystemDark && theme === "light") {
          toggleTheme();
        } else if (!isSystemDark && theme === "dark") {
          toggleTheme();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Watch system theme changes if mode is 'system'
  useEffect(() => {
    if (themeMode !== "system") return;

    try {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const isDark = e.matches;
        if (isDark && theme === "light") {
          toggleTheme();
        } else if (!isDark && theme === "dark") {
          toggleTheme();
        }
      };

      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    } catch (err) {
      console.error(err);
    }
  }, [themeMode, theme, toggleTheme]);

  // Handle reload simulation
  const handleReload = () => {
    setIsReloading(true);
    setTimeout(() => {
      setIsReloading(false);
      alert("Đã làm mới thông tin Facebook Tokens.");
    }, 1000);
  };

  // Helper to save token changes safely
  const saveToken = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full text-gray-800 dark:text-gray-200">
      {/* Container Settings Panel */}
      <div className="flex flex-col bg-white dark:bg-[#11121e]  dark:border-gray-800 rounded-2xl shadow-theme-xs min-h-[550px] w-full overflow-hidden p-6 md:p-8">
      
        {/* Content */}
        <div className="flex flex-col gap-6 text-left">
          {/* Row 1: Giao diện */}
          <div className="bg-gray-50/50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-800 rounded-xl p-4.5 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">Giao diện</span>
              <span className="text-[10px] text-gray-400 mt-1 font-medium">Lựa chọn chế độ hiển thị màn hình của bạn.</span>
            </div>
            <select
              value={themeMode}
              onChange={(e) => handleThemeModeChange(e.target.value)}
              className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl py-1.5 px-3 text-xs font-bold outline-none cursor-pointer focus:border-blue-500 text-gray-800 dark:text-gray-200"
            >
              <option value="system">Hệ thống</option>
              <option value="light">Sáng</option>
              <option value="dark">Tối</option>
            </select>
          </div>

          {/* Row 2: Thông tin Facebook */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex flex-col">
                <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">Thông tin Facebook</h3>
                <p className="text-[10px] text-red-500 dark:text-red-400 font-bold mt-1">Các thông tin bảo mật, không chia sẻ với bất kỳ ai.</p>
              </div>
              <button
                onClick={handleReload}
                disabled={isReloading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <svg
                  className={`w-3.5 h-3.5 ${isReloading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>{isReloading ? "Đang tải..." : "Tải lại"}</span>
              </button>
            </div>

            {/* Token fields */}
            <div className="space-y-4">
              {/* TOKEN EAAG */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                  TOKEN EAAG
                </label>
                <div className="relative">
                  <input
                    type={showEaag ? "text" : "password"}
                    placeholder="Nhập Token EAAG..."
                    value={eaag}
                    onChange={(e) => {
                      setEaag(e.target.value);
                      saveToken("settings_token_eaag", e.target.value);
                    }}
                    className="w-full bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-xl py-2 pl-4 pr-10 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-theme-xs text-gray-800 dark:text-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEaag(!showEaag)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition cursor-pointer"
                  >
                    {showEaag ? (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.815 7.815L21 21m-2.956-2.956l-2.64-2.64m-2.287-2.287a3 3 0 00-4.243-4.242m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* TOKEN EAAB */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                  TOKEN EAAB
                </label>
                <div className="relative">
                  <input
                    type={showEaab ? "text" : "password"}
                    placeholder="Nhập Token EAAB..."
                    value={eaab}
                    onChange={(e) => {
                      setEaab(e.target.value);
                      saveToken("settings_token_eaab", e.target.value);
                    }}
                    className="w-full bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-xl py-2 pl-4 pr-10 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-theme-xs text-gray-800 dark:text-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEaab(!showEaab)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition cursor-pointer"
                  >
                    {showEaab ? (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.815 7.815L21 21m-2.956-2.956l-2.64-2.64m-2.287-2.287a3 3 0 00-4.243-4.242m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* TOKEN EAAI */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                  TOKEN EAAI
                </label>
                <div className="relative">
                  <input
                    type={showEaai ? "text" : "password"}
                    placeholder="Nhập Token EAAI..."
                    value={eaai}
                    onChange={(e) => {
                      setEaai(e.target.value);
                      saveToken("settings_token_eaai", e.target.value);
                    }}
                    className="w-full bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-xl py-2 pl-4 pr-10 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-theme-xs text-gray-800 dark:text-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEaai(!showEaai)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition cursor-pointer"
                  >
                    {showEaai ? (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.815 7.815L21 21m-2.956-2.956l-2.64-2.64m-2.287-2.287a3 3 0 00-4.243-4.242m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* TOKEN EAAH */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                  TOKEN EAAH
                </label>
                <div className="relative">
                  <input
                    type={showEaah ? "text" : "password"}
                    placeholder="Nhập Token EAAH..."
                    value={eaah}
                    onChange={(e) => {
                      setEaah(e.target.value);
                      saveToken("settings_token_eaah", e.target.value);
                    }}
                    className="w-full bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-xl py-2 pl-4 pr-10 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-theme-xs text-gray-800 dark:text-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEaah(!showEaah)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition cursor-pointer"
                  >
                    {showEaah ? (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.815 7.815L21 21m-2.956-2.956l-2.64-2.64m-2.287-2.287a3 3 0 00-4.243-4.242m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* COOKIE */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                  COOKIE
                </label>
                <div className="relative">
                  <input
                    type={showCookie ? "text" : "password"}
                    placeholder="Nhập Cookie Facebook..."
                    value={cookie}
                    onChange={(e) => {
                      setCookie(e.target.value);
                      saveToken("settings_token_cookie", e.target.value);
                    }}
                    className="w-full bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-xl py-2 pl-4 pr-10 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-theme-xs text-gray-800 dark:text-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCookie(!showCookie)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition cursor-pointer"
                  >
                    {showCookie ? (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.815 7.815L21 21m-2.956-2.956l-2.64-2.64m-2.287-2.287a3 3 0 00-4.243-4.242m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
