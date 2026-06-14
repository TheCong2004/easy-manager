"use client";

import React, { useState, useMemo } from "react";
import { AdsAccount, UtilityItem } from "@/components/quan-ly/tai-khoan-qc/types";
import ToolbarHeader from "@/components/quan-ly/tai-khoan-qc/ToolbarHeader";
import AccountsTable from "@/components/quan-ly/tai-khoan-qc/AccountsTable";
import UserProfileCard from "@/components/quan-ly/tai-khoan-qc/UserProfileCard";
import UtilitiesPanel from "@/components/quan-ly/tai-khoan-qc/UtilitiesPanel";
import ConfigModal from "@/components/quan-ly/tai-khoan-qc/ConfigModal";

const initialUtilities: UtilityItem[] = [
  { id: "1", name: "Kích hoạt trả trước", enabled: true, color: "bg-amber-500" },
  { id: "2", name: "Thêm người", enabled: true, color: "bg-emerald-500" },
  { id: "3", name: "Thoát tài khoản", enabled: true, color: "bg-rose-500" },
  { id: "4", name: "Đóng mở tài khoản", enabled: true, color: "bg-teal-500" },
  { id: "5", name: "Xóa admin", enabled: true, color: "bg-red-500" },
  { id: "6", name: "Xóa đối tác", enabled: true, color: "bg-orange-500" },
  { id: "7", name: "Đổi tên tài khoản", enabled: true, color: "bg-blue-500" },
  { id: "8", name: "Share đối tác BM", enabled: true, color: "bg-sky-500" },
];

const mockAccounts: AdsAccount[] = [
  {
    id: "1",
    name: "Võ Thế Công - Profile Via 01",
    uid: "100029343473480",
    status: "ACTIVE",
    type: "PERSONAL",
    balance: "50.000.000đ",
    threshold: "20.000.000đ",
    limit: "Không giới hạn",
    currency: "VND",
    role: "Quản trị viên",
    paymentMethod: "Visa *4321",
  },
  {
    id: "2",
    name: "Nguyễn Văn A - BM Agency 02",
    uid: "204859604938482",
    status: "ACTIVE",
    type: "BM",
    balance: "20.000.000đ",
    threshold: "10.000.000đ",
    limit: "5.000.000đ/ngày",
    currency: "VND",
    role: "Nhà quảng cáo",
    paymentMethod: "Momo Wallet",
  },
  {
    id: "3",
    name: "Lê Hoàng B - Clone Via 05",
    uid: "109283749501834",
    status: "DISABLED",
    type: "PERSONAL",
    balance: "0đ (Nợ)",
    threshold: "5.000.000đ",
    limit: "1.100.000đ/ngày",
    currency: "VND",
    role: "Quản trị viên",
    paymentMethod: "Mastercard *8872",
  },
  {
    id: "4",
    name: "Phạm Minh C - Personal Ads",
    uid: "102834748596023",
    status: "PENDING_REVIEW",
    type: "PERSONAL",
    balance: "12.500.000đ",
    threshold: "4.000.000đ",
    limit: "Không giới hạn",
    currency: "VND",
    role: "Quản trị viên",
    paymentMethod: "Visa *9012",
  },
  {
    id: "5",
    name: "Trần Thị D - BM Business 01",
    uid: "305849603928173",
    status: "ACTIVE",
    type: "BM",
    balance: "150.000.000đ",
    threshold: "40.000.000đ",
    limit: "Không giới hạn",
    currency: "VND",
    role: "Nhà quảng cáo",
    paymentMethod: "Invoice Payment",
  },
  {
    id: "6",
    name: "Vũ Văn E - Agency Invoice",
    uid: "405829103948273",
    status: "ACTIVE",
    type: "BM",
    balance: "500.000.000đ",
    threshold: "100.000.000đ",
    limit: "Không giới hạn",
    currency: "VND",
    role: "Quản trị viên",
    paymentMethod: "Credit Line",
  },
  {
    id: "7",
    name: "Phan Văn F - Page Ads Account",
    uid: "102938475610293",
    status: "DISABLED",
    type: "PERSONAL",
    balance: "0đ (Khoá)",
    threshold: "2.000.000đ",
    limit: "500.000đ/ngày",
    currency: "VND",
    role: "Nhà quảng cáo",
    paymentMethod: "Visa *1102",
  },
];

export default function TaiKhoanQC() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Filters & Settings
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceType, setSourceType] = useState<"all" | "by-id" | "by-bm">("all");
  const [accountFilter, setAccountFilter] = useState<"all" | "personal" | "bm">("all");
  const [limitApi, setLimitApi] = useState(500);

  // Data Options (Checkboxes)
  const [dataOptions, setDataOptions] = useState({
    financial: true,
    insights: true,
    adminRights: true,
    timestamps: true,
    hiddenAccounts: false,
    payments: false,
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

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return mockAccounts.filter((acc) => {
      const matchesSearch =
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.uid.includes(searchQuery);

      const matchesType =
        accountFilter === "all" ||
        (accountFilter === "personal" && acc.type === "PERSONAL") ||
        (accountFilter === "bm" && acc.type === "BM");

      return matchesSearch && matchesType;
    });
  }, [searchQuery, accountFilter]);

  // Select all checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredAccounts.map((acc) => acc.id));
      setSelectedRegion(filteredAccounts.length > 0 ? 1 : 0);
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

    const colors = ["bg-purple-500", "bg-pink-500", "bg-cyan-500", "bg-violet-500", "bg-indigo-500"];
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
            accountFilter={accountFilter}
            setAccountFilter={setAccountFilter}
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
          <AccountsTable
            isLoading={isLoading}
            loadingProgress={loadingProgress}
            dataLoaded={dataLoaded}
            filteredAccounts={filteredAccounts}
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
        accountFilter={accountFilter}
        setAccountFilter={setAccountFilter}
        dataOptions={dataOptions}
        setDataOptions={setDataOptions}
        limitApi={limitApi}
        setLimitApi={setLimitApi}
        onLoadData={handleLoadData}
      />
    </div>
  );
}
