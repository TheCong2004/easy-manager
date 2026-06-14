import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppItem } from "./types";
import AppCard from "./AppCard";

const initialApps: AppItem[] = [
  {
    id: "1",
    name: "Website Builder",
    description: "Giúp người dùng dễ dàng tạo ra trang web chuyên nghiệp và hiệu quả cho doanh nghiệp.",
    iconName: "website",
    status: "INSTALLED",
    category: "sales",
    price: "Đã cài đặt",
    downloads: "10.847",
    isPinned: true,
  },
  {
    id: "2",
    name: "Ecom Store",
    description: "Tạo nhanh trang thanh toán và bán hàng trực tuyến cho sản phẩm, dịch vụ, khoá học.",
    iconName: "store",
    status: "INSTALLED",
    category: "sales",
    price: "Đã cài đặt",
    downloads: "6.873",
    isPinned: true,
  },
  {
    id: "3",
    name: "Short Links",
    description: "Rút gọn đường dẫn, giúp việc chia sẻ đường dẫn trở nên ngắn gọn và thuận tiện.",
    iconName: "link",
    status: "INSTALLED",
    category: "marketing",
    price: "Đã cài đặt",
    downloads: "1.168",
    tags: ["300 links", "1 tên miền riêng"],
    isPinned: true,
  },
  {
    id: "4",
    name: "Blog",
    description: "Công cụ viết Blog tích hợp sẵn các giao diện giúp bạn dễ dàng tạo ra trang web sáng tạo.",
    iconName: "blog",
    status: "INSTALLED",
    category: "content",
    price: "Đã cài đặt",
    downloads: "987",
    tags: ["1 Blog", "1 domain", "25.000 traffic"],
    isPinned: true,
  },
  {
    id: "5",
    name: "Dynamic",
    description: "Các chiến dịch để nhắm đến từng phân khúc khách hàng phù hợp cho mục đích của bạn.",
    iconName: "dynamic",
    status: "INSTALLED",
    category: "marketing",
    price: "Đã cài đặt",
    downloads: "2.295",
    isPinned: true,
  },
  {
    id: "6",
    name: "E-Learning",
    description: "Số hoá kiến thức thành khoá học online — đào tạo nội bộ hoặc bán khoá học kiếm tiền.",
    iconName: "elearning",
    status: "NOT_INSTALLED",
    category: "sales",
    price: "Từ 1.200.000 đ/năm",
    downloads: "4.218",
  },
  {
    id: "7",
    name: "Affiliate Center",
    description: "Xây dựng hệ thống Affiliates cho riêng bạn dễ dàng – nhanh chóng.",
    iconName: "affiliate",
    status: "NOT_INSTALLED",
    category: "marketing",
    price: "Từ 2.400.000 đ/năm",
    downloads: "1.301",
  },
  {
    id: "8",
    name: "PopupX",
    description: "PopupX có thể tích hợp trên mọi Landing Page và Website giúp bạn dễ dàng thu hút khách hàng tiềm năng.",
    iconName: "popup",
    status: "NOT_INSTALLED",
    category: "conversion",
    price: "Miễn phí",
    downloads: "5.932",
  },
  {
    id: "9",
    name: "Page Access",
    description: "Tính năng Page Access cho phép bạn quản lý quyền truy cập trang web một cách dễ dàng.",
    iconName: "access",
    status: "NOT_INSTALLED",
    category: "conversion",
    price: "Miễn phí",
    downloads: "234",
  },
  {
    id: "10",
    name: "App trình quản lý quảng cáo fb",
    description: "Công cụ quản lý chiến dịch quảng cáo Facebook, tối ưu hóa ngân sách và đo lường báo cáo hiệu quả thời gian thực.",
    iconName: "fbads",
    status: "NOT_INSTALLED",
    category: "marketing",
    price: "Miễn phí",
    downloads: "1.520",
  },
  {
    id: "11",
    name: "LadiFlow Pro",
    description: "Hệ thống tự động hóa chăm sóc khách hàng đa kênh theo kịch bản thông minh.",
    iconName: "dynamic",
    status: "NOT_INSTALLED",
    category: "upcoming",
    price: "Sắp ra mắt",
  },
  {
    id: "12",
    name: "AI Content Generator",
    description: "Tự động tạo nội dung quảng cáo và viết bài blog chuẩn SEO bằng trí tuệ nhân tạo.",
    iconName: "blog",
    status: "NOT_INSTALLED",
    category: "upcoming",
    price: "Sắp ra mắt",
  },
  {
    id: "13",
    name: "Email Template Builder",
    description: "Thiết kế email responsive kéo thả chuyên nghiệp với kho giao diện phong phú.",
    iconName: "website",
    status: "NOT_INSTALLED",
    category: "content",
    price: "Miễn phí",
  }
];

export default function AppStore() {
  const router = useRouter();
  const [apps, setApps] = useState<AppItem[]>(initialApps);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Handler for installing an app
  const handleInstall = (id: string) => {
    setApps((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: "INSTALLED", price: "Đã cài đặt" } : app
      )
    );
  };

  // Handler for uninstalling an app
  const handleUninstall = (id: string) => {
    setApps((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: "NOT_INSTALLED", price: "Miễn phí" } : app
      )
    );
  };

  // Handler for opening an app
  const handleOpen = (id: string) => {
    const app = apps.find((a) => a.id === id);
    if (id === "10") {
      router.push("/tai-khoan-qc");
    } else if (id === "1") {
      router.push("/landing-pages");
    } else if (id === "2") {
      router.push("/ban-hang");
    } else {
      alert(`Mở ứng dụng: ${app?.name}`);
    }
  };

  // Get tab counts dynamically
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: 0,
      marketing: 0,
      sales: 0,
      conversion: 0,
      content: 0,
      upcoming: 0,
    };

    apps.forEach((app) => {
      if (app.category !== "upcoming") {
        counts.all += 1;
      }
      counts[app.category] += 1;
    });

    return counts;
  }, [apps]);

  // Filter apps
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      // Search filter
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Tab category filter
      if (activeTab === "all") {
        return app.category !== "upcoming";
      }
      return app.category === activeTab;
    });
  }, [apps, activeTab, searchQuery]);

  // Group filtered apps into Pinned (Đã ghim) vs Recommended (Đề xuất)
  const pinnedApps = useMemo(() => {
    return filteredApps.filter((app) => app.isPinned && app.category !== "upcoming");
  }, [filteredApps]);

  const recommendedApps = useMemo(() => {
    // If it's upcoming, show everything in one list. Otherwise show non-pinned as recommended
    if (activeTab === "upcoming") {
      return filteredApps;
    }
    return filteredApps.filter((app) => !app.isPinned);
  }, [filteredApps, activeTab]);

  return (
    <div className="flex flex-col gap-6 text-gray-800 dark:text-gray-200">
      {/* Title Header */}
      <div className="flex flex-col text-left">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          Kho ứng dụng
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            {apps.length}
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">
          Khám phá và cài đặt các ứng dụng mở rộng
        </p>
      </div>

      {/* Tabs navigation & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-150 dark:border-gray-800 pb-px gap-4 select-none">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
          {[
            { id: "all", label: "Tất cả" },
            { id: "marketing", label: "Marketing" },
            { id: "sales", label: "Bán hàng" },
            { id: "conversion", label: "Chuyển đổi" },
            { id: "content", label: "Nội dung" },
            { id: "upcoming", label: "Sắp ra mắt", isHighlight: true },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                className={`pb-3 px-3 relative font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {tab.isHighlight && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                <span>{tab.label}</span>
                <span className="text-[10px] font-semibold opacity-70">
                  {tabCounts[tab.id]}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 animate-fade-in" />
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm ứng dụng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-theme-xs"
          />
          <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
          </svg>
        </div>
      </div>

      {/* Main Apps Grid Display */}
      {filteredApps.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 min-h-[350px] text-center bg-white dark:bg-[#11121e] border border-gray-150 dark:border-gray-800 rounded-2xl">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-900/30">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1">Không tìm thấy ứng dụng</h3>
          <p className="text-xs text-gray-400 max-w-xs">Thử tìm kiếm từ khóa khác hoặc chuyển danh mục tabs.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Pinned Apps Category */}
          {pinnedApps.length > 0 && activeTab !== "upcoming" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 text-left">
                Đã ghim
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {pinnedApps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    onInstall={handleInstall}
                    onUninstall={handleUninstall}
                    onOpen={handleOpen}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recommended / All remaining Apps Category */}
          {recommendedApps.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 text-left">
                {activeTab === "upcoming" ? "Sắp ra mắt" : "Đề xuất cho bạn"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {recommendedApps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    onInstall={handleInstall}
                    onUninstall={handleUninstall}
                    onOpen={handleOpen}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
