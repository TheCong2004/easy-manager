"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  GraduationCap,
  Users,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react";
import Image from "next/image";

export default function ELearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Bảng điều khiển",
      path: "/e-learning/tong-quan",
      icon: <LayoutDashboard className="w-4.5 h-4.5" />,
    },
    {
      name: "Khóa học",
      path: "/e-learning/khoa-hoc",
      icon: <BookOpen className="w-4.5 h-4.5" />,
    },
    {
      name: "Danh mục",
      path: "/e-learning/danh-muc",
      icon: <FolderOpen className="w-4.5 h-4.5" />,
    },
    {
      name: "Sinh viên",
      path: "/e-learning/sinh-vien",
      icon: <GraduationCap className="w-4.5 h-4.5" />,
    },
    {
      name: "Giảng viên",
      path: "/e-learning/giang-vien",
      icon: <Users className="w-4.5 h-4.5" />,
    },
    {
      name: "Thời khóa biểu",
      path: "/e-learning/thoi-khoa-bieu",
      icon: <Calendar className="w-4.5 h-4.5" />,
    },
    {
      name: "Báo cáo & Thống kê",
      path: "/e-learning/bao-cao",
      icon: <BarChart3 className="w-4.5 h-4.5" />,
    },
    {
      name: "Thiết lập",
      path: "/e-learning/thiet-lap",
      icon: <Settings className="w-4.5 h-4.5" />,
    },
  ];

  return (
    <div className="flex flex-col md:flex-row bg-[#f8fafc] dark:bg-[#0c0d14] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl overflow-hidden shadow-theme-xs min-h-[calc(100vh-46px)]">
      {/* Sub Sidebar */}
      <div className="w-full md:w-58 shrink-0 bg-white dark:bg-[#090a0f] border-r border-gray-100 dark:border-gray-800/60 py-5 px-3.5 flex flex-col select-none">
        {/* Sub Sidebar Header */}
        <div className="flex items-center gap-2 px-2 pb-4 border-b border-gray-100 dark:border-gray-800/30">
          <div className="flex flex-col gap-0.5">
            <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Đại học Đông Á</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">E-Learning Console</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-1.5 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#10B981] text-white shadow-md shadow-emerald-100 dark:shadow-none"
                    : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900/50"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Status card at bottom */}
        <div className="hidden md:block mt-auto p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-950/20 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Hệ thống đang hoạt động</span>
          </div>
          <span className="block text-[9px] text-emerald-600 dark:text-emerald-500 font-medium mt-0.5">UEMS Admin Console</span>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 min-w-0 flex flex-col bg-[#f8fafc] dark:bg-[#0c0d14]">
        {children}
      </div>
    </div>
  );
}
