"use client";

import React, { useState, useMemo } from "react";
import { FanpageItem, UtilityItem } from "@/components/quan-ly/fanpage/types";
import ToolbarHeader from "@/components/quan-ly/fanpage/ToolbarHeader";
import PagesTable from "@/components/quan-ly/fanpage/PagesTable";
import UserProfileCard from "@/components/quan-ly/fanpage/UserProfileCard";
import UtilitiesPanel from "@/components/quan-ly/fanpage/UtilitiesPanel";
import ConfigModal from "@/components/quan-ly/fanpage/ConfigModal";

const initialUtilities: UtilityItem[] = [
  { id: "1", name: "Thêm vào nhóm tài sản", enabled: true, color: "bg-orange-500" },
  { id: "2", name: "Chỉ định Page BM", enabled: true, color: "bg-teal-500" },
  { id: "3", name: "Đổi Avatar & Cover", enabled: true, color: "bg-blue-500" },
  { id: "4", name: "Đổi thông tin Page", enabled: true, color: "bg-amber-500" },
  { id: "5", name: "Xóa bài viết", enabled: true, color: "bg-purple-500" },
  { id: "6", name: "Xóa QTV Page", enabled: true, color: "bg-red-500" },
  { id: "7", name: "Xóa Page khỏi BM", enabled: true, color: "bg-rose-500" },
  { id: "8", name: "Đổi tên Page", enabled: true, color: "bg-indigo-500" },
  { id: "9", name: "Share Page", enabled: true, color: "bg-sky-500" },
];

const mockPages: FanpageItem[] = [
  {
    id: "1",
    name: "Võ Thế Công - Shop Mỹ Phẩm Mỹ",
    pageId: "109283749501834",
    status: "ACTIVE",
    followers: "15.420",
    postsCount: 24,
    verification: "BLUE",
    distribution: "Bình thường",
    monetization: "Đủ điều kiện",
  },
  {
    id: "2",
    name: "Thời Trang Nam LadiStyle",
    pageId: "305849603928173",
    status: "ACTIVE",
    followers: "3.250",
    postsCount: 12,
    verification: "NONE",
    distribution: "Bình thường",
    monetization: "Đang xem xét",
  },
  {
    id: "3",
    name: "Trà Thảo Mộc Gia Truyền",
    pageId: "102834748596023",
    status: "DISABLED",
    followers: "1.200",
    postsCount: 5,
    verification: "NONE",
    distribution: "Hạn chế phân phối",
    monetization: "Không đủ điều kiện",
  },
  {
    id: "4",
    name: "EzTool Hỗ Trợ Kỹ Thuật",
    pageId: "203948273619283",
    status: "ACTIVE",
    followers: "8.900",
    postsCount: 42,
    verification: "GRAY",
    distribution: "Bình thường",
    monetization: "Đủ điều kiện",
  },
  {
    id: "5",
    name: "Wedding Planner & Decor",
    pageId: "102938475610293",
    status: "PENDING_REVIEW",
    followers: "540",
    postsCount: 2,
    verification: "NONE",
    distribution: "Bình thường",
    monetization: "Chưa kích hoạt",
  },
];

export default function Fanpage() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Filters & Settings
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceType, setSourceType] = useState<"all" | "mine" | "by-bm" | "by-id">("all");
  const [pageFilter, setPageFilter] = useState<"all" | "active" | "disabled">("all");
  const [limitApi, setLimitApi] = useState(100);

  // Threads & Delay from screenshot toolbar
  const [threads, setThreads] = useState(3);
  const [delay, setDelay] = useState(0);

  // Data Options (Checkboxes)
  const [dataOptions, setDataOptions] = useState({
    status: true,
    badge: true,
    likes: true,
    posts: true,
    live: true,
    monetize: true,
  });

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState(0);

  // Utilities list
  const [utilities, setUtilities] = useState<UtilityItem[]>(initialUtilities);
  const [newUtilityName, setNewUtilityName] = useState("");
  const [isAddUtilityOpen, setIsAddUtilityOpen] = useState(false);

  // Simulated Loader
  const handleLoadData = () => {
    setIsConfigModalOpen(false);
    setIsLoading(true);
    setLoadingProgress(0);
    setSelectedIds([]);

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);
            setDataLoaded(true);
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  // Filtered Pages
  const filteredPages = useMemo(() => {
    return mockPages.filter((page) => {
      const matchesSearch =
        page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.pageId.includes(searchQuery);

      const matchesStatus =
        pageFilter === "all" ||
        (pageFilter === "active" && page.status === "ACTIVE") ||
        (pageFilter === "disabled" && page.status === "DISABLED");

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, pageFilter]);

  // Select all checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredPages.map((page) => page.id));
      setSelectedRegion(filteredPages.length > 0 ? 1 : 0);
    } else {
      setSelectedIds([]);
      setSelectedRegion(0);
    }
  };

  // Select row
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
      if (selectedRegion === 0) setSelectedRegion(1);
    } else {
      const updated = selectedIds.filter((item) => item !== id);
      setSelectedIds(updated);
      if (updated.length === 0) setSelectedRegion(0);
    }
  };

  // Toggle utility status
  const handleToggleUtility = (id: string) => {
    setUtilities((prev) =>
      prev.map((ut) => (ut.id === id ? { ...ut, enabled: !ut.enabled } : ut))
    );
  };

  // Delete utility
  const handleDeleteUtility = (id: string) => {
    setUtilities((prev) => prev.filter((ut) => ut.id !== id));
  };

  // Add utility
  const handleAddUtility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUtilityName.trim()) return;

    const colors = ["bg-orange-500", "bg-teal-500", "bg-blue-500", "bg-amber-500", "bg-purple-500"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newUt: UtilityItem = {
      id: String(Date.now()),
      name: newUtilityName.trim(),
      enabled: true,
      color: randomColor,
    };

    setUtilities((prev) => [...prev, newUt]);
    setNewUtilityName("");
    setIsAddUtilityOpen(false);
  };

  // Move Utility Up/Down for order sorting
  const handleMoveUtility = (index: number, direction: "up" | "down") => {
    const updated = [...utilities];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;

    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setUtilities(updated);
  };

  return (
    <div className="flex flex-col gap-5 min-h-[calc(100vh-100px)] text-gray-800 dark:text-gray-200">
      {/* Main Layout Flexbox */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        {/* Left Column: Actions + Table */}
        <div className="flex-1 w-full flex flex-col gap-5">
          {/* Action Toolbar Header */}
          <ToolbarHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            threads={threads}
            setThreads={setThreads}
            delay={delay}
            setDelay={setDelay}
            selectedIdsCount={selectedIds.length}
            dataLoaded={dataLoaded}
            isLoading={isLoading}
            handleLoadData={handleLoadData}
          />

          {/* Left Column: Data Table Container */}
          <div className="flex-1 w-full flex flex-col bg-white dark:bg-[#11121e] border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden shadow-theme-xs min-h-[550px]">
            <PagesTable
              isLoading={isLoading}
              loadingProgress={loadingProgress}
              dataLoaded={dataLoaded}
              filteredPages={filteredPages}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
              dataOptions={dataOptions}
              selectedRegion={selectedRegion}
              openConfig={() => setIsConfigModalOpen(true)}
            />
          </div>
        </div>

        {/* Right Column: Profile + Utilities */}
        <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-5">
          <UserProfileCard />

          <UtilitiesPanel
            utilities={utilities}
            onToggleUtility={handleToggleUtility}
            onDeleteUtility={handleDeleteUtility}
            onMoveUtility={handleMoveUtility}
            newUtilityName={newUtilityName}
            setNewUtilityName={setNewUtilityName}
            isAddUtilityOpen={isAddUtilityOpen}
            setIsAddUtilityOpen={setIsAddUtilityOpen}
            onAddUtility={handleAddUtility}
          />
        </div>
      </div>

      {/* Configuration Modal ("Cấu hình tải dữ liệu Page") */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        sourceType={sourceType}
        setSourceType={setSourceType}
        dataOptions={dataOptions}
        setDataOptions={setDataOptions}
        limitApi={limitApi}
        setLimitApi={setLimitApi}
        onLoadData={handleLoadData}
      />
    </div>
  );
}
