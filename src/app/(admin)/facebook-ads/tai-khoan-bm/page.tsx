"use client";

import React, { useState, useMemo } from "react";
import { BusinessManager, UtilityItem } from "@/components/quan-ly/tai-khoan-bm/types";
import ToolbarHeader from "@/components/quan-ly/tai-khoan-bm/ToolbarHeader";
import BMsTable from "@/components/quan-ly/tai-khoan-bm/BMsTable";
import UserProfileCard from "@/components/quan-ly/tai-khoan-bm/UserProfileCard";
import UtilitiesPanel from "@/components/quan-ly/tai-khoan-bm/UtilitiesPanel";
import ConfigModal from "@/components/quan-ly/tai-khoan-bm/ConfigModal";

const initialUtilities: UtilityItem[] = [
  { id: "1", name: "Kích Bm3", enabled: true, color: "bg-orange-500" },
  { id: "2", name: "Thêm tài sản cho user", enabled: true, color: "bg-blue-500" },
  { id: "3", name: "Backup BM", enabled: true, color: "bg-emerald-500" },
  { id: "4", name: "Nhóm tài sản BM", enabled: true, color: "bg-purple-500" },
  { id: "5", name: "Hủy lời mời", enabled: true, color: "bg-red-500" },
  { id: "6", name: "Nhét dòng 1 BM", enabled: true, color: "bg-amber-500" },
  { id: "7", name: "Tạo TKQC", enabled: true, color: "bg-sky-500" },
  { id: "8", name: "Tạo ứng dụng", enabled: true, color: "bg-teal-500" },
];

const mockBMs: BusinessManager[] = [
  {
    id: "1",
    name: "Võ Thế Công - Agency Hub",
    bmId: "128394857392847",
    status: "ACTIVE",
    limit: "Không giới hạn",
    pagesCount: 12,
    partnersCount: 4,
    adminsCount: 2,
    instagramCount: 2,
    whatsappCount: 1,
    paymentMethod: "Visa *4321",
  },
  {
    id: "2",
    name: "Nguyễn Văn A - BM250 Ads",
    bmId: "209485739201834",
    status: "ACTIVE",
    limit: "5.000.000đ/ngày",
    pagesCount: 3,
    partnersCount: 1,
    adminsCount: 1,
    instagramCount: 0,
    whatsappCount: 0,
    paymentMethod: "Momo Wallet",
  },
  {
    id: "3",
    name: "Lê Hoàng B - Business Backup",
    bmId: "109482938472938",
    status: "DISABLED",
    limit: "0đ (Khoá)",
    pagesCount: 8,
    partnersCount: 0,
    adminsCount: 2,
    instagramCount: 1,
    whatsappCount: 0,
    paymentMethod: "Mastercard *8872",
  },
  {
    id: "4",
    name: "Phạm Minh C - Agency Verify",
    bmId: "302948573928173",
    status: "ACTIVE",
    limit: "Không giới hạn",
    pagesCount: 45,
    partnersCount: 8,
    adminsCount: 3,
    instagramCount: 5,
    whatsappCount: 2,
    paymentMethod: "Invoice Payment",
  },
  {
    id: "5",
    name: "Trần Thị D - BM50 Scan",
    bmId: "203948273619283",
    status: "PENDING_REVIEW",
    limit: "1.100.000đ/ngày",
    pagesCount: 5,
    partnersCount: 1,
    adminsCount: 1,
    instagramCount: 0,
    whatsappCount: 0,
    paymentMethod: "Visa *9012",
  },
];

export default function TaiKhoanBM() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Filters & Settings
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceType, setSourceType] = useState<"all" | "by-id">("all");
  const [bmFilter, setBmFilter] = useState<"all" | "active" | "disabled">("all");
  const [limitApi, setLimitApi] = useState(50);
  const [advancedConfig, setAdvancedConfig] = useState(true);

  // Data Options (Checkboxes)
  const [dataOptions, setDataOptions] = useState({
    status: true,
    page: true,
    limit: true,
    bmAccount: true,
    partner: true,
    admin: true,
    instagram: true,
    whatsapp: true,
    share: true,
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

  // Filtered BMs
  const filteredBMs = useMemo(() => {
    return mockBMs.filter((bm) => {
      const matchesSearch =
        bm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bm.bmId.includes(searchQuery);

      const matchesStatus =
        bmFilter === "all" ||
        (bmFilter === "active" && bm.status === "ACTIVE") ||
        (bmFilter === "disabled" && bm.status === "DISABLED");

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, bmFilter]);

  // Select all checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredBMs.map((bm) => bm.id));
      setSelectedRegion(filteredBMs.length > 0 ? 1 : 0);
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

    const colors = ["bg-orange-500", "bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-red-500"];
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
    <div className="flex flex-col text-gray-800 dark:text-gray-200 w-full min-h-[calc(100vh-46px)]">
      {/* Row 1: Unified Header Toolbar Card (Toolbar + User Profile) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full shrink-0">
        <div className="flex-1 min-w-0">
          <ToolbarHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            bmFilter={bmFilter}
            setBmFilter={setBmFilter}
            selectedIdsCount={selectedIds.length}
            dataLoaded={dataLoaded}
            isLoading={isLoading}
            handleLoadData={handleLoadData}
          />
        </div>
        <div className="shrink-0">
          <UserProfileCard />
        </div>
      </div>

      {/* Row 2: Table and Utilities Panel */}
      <div className="flex-1 flex flex-col lg:flex-row w-full min-w-0 h-full">
        {/* Left Column: Table Card */}
        <div className="flex-1 w-full flex flex-col min-w-0 min-h-[550px] border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden">
          <BMsTable
            isLoading={isLoading}
            loadingProgress={loadingProgress}
            dataLoaded={dataLoaded}
            filteredBMs={filteredBMs}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
            dataOptions={dataOptions}
            selectedRegion={selectedRegion}
            openConfig={() => setIsConfigModalOpen(true)}
          />
        </div>

        {/* Right Column: Utilities Card */}
        <div className="w-full lg:w-[320px] shrink-0 bg-gray-50/20 dark:bg-gray-950/10 flex flex-col">
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

      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        sourceType={sourceType}
        setSourceType={setSourceType}
        advancedConfig={advancedConfig}
        setAdvancedConfig={setAdvancedConfig}
        dataOptions={dataOptions}
        setDataOptions={setDataOptions}
        limitApi={limitApi}
        setLimitApi={setLimitApi}
        onLoadData={handleLoadData}
      />
    </div>
  );
}
