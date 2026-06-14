"use client";

import React, { useState, useMemo } from "react";
import { BusinessManager, UtilityItem } from "@/components/quan-ly/tai-khoan-bm/types";
import ToolbarHeader from "@/components/quan-ly/tai-khoan-bm/ToolbarHeader";
import BMsTable from "@/components/quan-ly/tai-khoan-bm/BMsTable";
import UserProfileCard from "@/components/quan-ly/tai-khoan-bm/UserProfileCard";
import UtilitiesPanel from "@/components/quan-ly/tai-khoan-bm/UtilitiesPanel";
import ConfigModal from "@/components/quan-ly/tai-khoan-bm/ConfigModal";

import { facebookAuthService } from "@/features/auth/services/facebook-auth.service";
import { facebookApiClient } from "@/lib/facebook/facebook-api.client";

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
    name: "Võ Thế Công Agency BM 01",
    bmId: "102938475610293",
    status: "ACTIVE",
    limit: "Không giới hạn",
    pagesCount: 5,
    partnersCount: 2,
    adminsCount: 3,
    instagramCount: 1,
    whatsappCount: 0,
    paymentMethod: "Visa *4321",
  },
  {
    id: "2",
    name: "Nguyễn Văn A Business BM 02",
    bmId: "305849603928173",
    status: "ACTIVE",
    limit: "5.000.000đ/ngày",
    pagesCount: 2,
    partnersCount: 1,
    adminsCount: 2,
    instagramCount: 0,
    whatsappCount: 0,
    paymentMethod: "Momo Wallet",
  },
  {
    id: "3",
    name: "Lê Hoàng B Personal BM 03",
    bmId: "109283749501834",
    status: "DISABLED",
    limit: "1.100.000đ/ngày",
    pagesCount: 1,
    partnersCount: 0,
    adminsCount: 1,
    instagramCount: 0,
    whatsappCount: 0,
    paymentMethod: "N/A",
  },
];

export default function TaiKhoanBM() {
  const [bms, setBms] = useState<BusinessManager[]>(mockBMs);
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

  // Simulated Loader connecting to facebookAuthService & facebookApiClient
  const handleLoadData = async () => {
    setIsConfigModalOpen(false);
    setIsLoading(true);
    setLoadingProgress(0);
    setSelectedIds([]);

    const interval = setInterval(() => {
      setLoadingProgress((prev) => (prev >= 90 ? 90 : prev + 15));
    }, 100);

    try {
      // Refresh Facebook tokens
      await facebookAuthService.refreshFullTokens();
      // Fetch Businesses using Api Client
      const res = await facebookApiClient.getMyBusinesses();
      if (res?.data && Array.isArray(res.data)) {
        const mapped: BusinessManager[] = res.data.map((bm: any) => ({
          id: bm.id,
          name: bm.name,
          bmId: bm.id,
          status: "ACTIVE",
          limit: "Không giới hạn",
          pagesCount: 1,
          partnersCount: 0,
          adminsCount: 1,
          instagramCount: 0,
          whatsappCount: 0,
          paymentMethod: "N/A",
        }));
        setBms(mapped);
      } else {
        setBms(mockBMs);
      }
      setLoadingProgress(100);
    } catch (err) {
      console.warn("[TaiKhoanBM] API call failed, falling back to mocks:", err);
      setBms(mockBMs);
      setLoadingProgress(100);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsLoading(false);
        setDataLoaded(true);
      }, 300);
    }
  };

  // Filtered BMs
  const filteredBMs = useMemo(() => {
    return bms.filter((bm) => {
      const matchesSearch =
        bm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bm.bmId.includes(searchQuery);

      const matchesStatus =
        bmFilter === "all" ||
        (bmFilter === "active" && bm.status === "ACTIVE") ||
        (bmFilter === "disabled" && bm.status === "DISABLED");

      return matchesSearch && matchesStatus;
    });
  }, [bms, searchQuery, bmFilter]);

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
