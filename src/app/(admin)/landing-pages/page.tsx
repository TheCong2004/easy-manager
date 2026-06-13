"use client";

import React, { useState } from "react";
import { LandingPageItem, TemplateItem, FormConfigItem } from "@/components/landing-pages/dung-chung/types";
import { SubSidebar } from "@/components/landing-pages/sidebar/SubSidebar";
import { PagesList } from "@/components/landing-pages/pages/PagesList";
import { TemplatesLibrary } from "@/components/landing-pages/templates/TemplatesLibrary";
import { FormConfig } from "@/components/landing-pages/form-config/FormConfig";
import { CreatePageModal } from "@/components/landing-pages/pages/CreatePageModal";
import { TemplatePreviewModal } from "@/components/landing-pages/templates/TemplatePreviewModal";

const initialPages: LandingPageItem[] = [
  {
    id: "1",
    name: "daotao",
    status: "UNPUBLISHED",
    updatedAt: "21:46, 27/02/2026",
    views: 0,
    conversions: 0,
    revenue: 0,
  },
];

const templatesData: TemplateItem[] = [
  {
    id: "t1",
    name: "LDP112305 - Theme TikTok Shop Mỹ Phẩm",
    image: "/images/template_cosmetics.png",
    category: "ecommerce",
    isPro: true,
    views: 6120,
    likes: 3120,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t2",
    name: "LDP112306 - Thiệp cưới Modern Elegant Wedding",
    image: "/images/template_wedding.png",
    category: "others",
    isPro: true,
    views: 4300,
    likes: 2150,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t3",
    name: "LDP112307 - Trà thảo mộc chạy TikTok Ads",
    image: "/images/template_tea.png",
    category: "ecommerce",
    isPro: false,
    views: 5800,
    likes: 2800,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t4",
    name: "LDP112308 - Đồng hồ thông minh Smartwatch Pro",
    image: "/images/template_electronics.png",
    category: "ecommerce",
    isPro: true,
    views: 3900,
    likes: 1950,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t5",
    name: "LDP112309 - Spa & Skincare Landing Page",
    image: "/images/template_cosmetics.png",
    category: "service",
    isPro: false,
    views: 4500,
    likes: 2200,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t6",
    name: "LDP112310 - Sự kiện Khai trương cửa hàng",
    image: "/images/template_tea.png",
    category: "others",
    isPro: false,
    views: 3100,
    likes: 1400,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t7",
    name: "LDP112311 - Dịch vụ Tư vấn tài chính",
    image: "/images/template_electronics.png",
    category: "service",
    isPro: true,
    views: 5120,
    likes: 2560,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t8",
    name: "LDP112312 - Khóa học thiết kế LadiPage",
    image: "/images/template_wedding.png",
    category: "others",
    isPro: false,
    views: 2900,
    likes: 1100,
    scrollDist: "calc(-100% + 260px)",
  },
];

export default function LandingPagesManagement() {
  const [pages, setPages] = useState<LandingPageItem[]>(initialPages);
  const [activeSubTab, setActiveSubTab] = useState("pages");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("");

  // Templates Sub-View States
  const [activeTemplateTab, setActiveTemplateTab] = useState("sample"); 
  const [activeCategory, setActiveCategory] = useState("all");
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<TemplateItem | null>(null);
  const [likedTemplates, setLikedTemplates] = useState<Record<string, boolean>>({});

  // Form Config Sub-View States
  const [formConfigs, setFormConfigs] = useState<FormConfigItem[]>([]);

  // Handler for select-all checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredPages.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handler for single checkbox
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // Modal confirm submit
  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) return;

    const newPage: LandingPageItem = {
      id: String(Date.now()),
      name: newPageName.trim().toLowerCase(),
      status: "UNPUBLISHED",
      updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
      views: 0,
      conversions: 0,
      revenue: 0,
    };

    setPages(prev => [newPage, ...prev]);
    setNewPageName("");
    setIsCreateModalOpen(false);
    setActiveSubTab("pages"); // Redirect to pages list
  };

  // Template select trigger
  const handleUseTemplate = (template: TemplateItem) => {
    setNewPageName(template.name.split("-")[0].trim().toLowerCase() + "-copy");
    setIsCreateModalOpen(true);
  };

  // Like action toggle
  const toggleLikeTemplate = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedTemplates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Add a new Form configuration
  const handleAddFormConfig = (name: string, type: "Google Forms" | "API" | "OTP") => {
    const newConfig: FormConfigItem = {
      id: String(Date.now()),
      name,
      linkedAccounts: 1, // mock count
      type,
      status: "ACTIVE",
      updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
    };
    setFormConfigs(prev => [newConfig, ...prev]);
  };

  // Filter calculation for pages
  const filteredPages = pages.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" 
      || (statusFilter === "PUBLISHED" && p.status === "PUBLISHED")
      || (statusFilter === "UNPUBLISHED" && p.status === "UNPUBLISHED");
    return matchesSearch && matchesStatus;
  });

  // Filter calculation for templates
  const filteredTemplates = templatesData.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(templateSearchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 -m-4 md:-m-6 h-[calc(100vh-72px)] md:h-[calc(100vh-80px)] overflow-hidden">
      
      {/* 1. Secondary Sub-sidebar */}
      <SubSidebar 
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        tagSearchQuery={tagSearchQuery}
        setTagSearchQuery={setTagSearchQuery}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f1016] overflow-y-auto p-6">
        {activeSubTab === "templates" ? (
          <TemplatesLibrary 
            activeTemplateTab={activeTemplateTab}
            setActiveTemplateTab={setActiveTemplateTab}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            templateSearchQuery={templateSearchQuery}
            setTemplateSearchQuery={setTemplateSearchQuery}
            filteredTemplates={filteredTemplates}
            likedTemplates={likedTemplates}
            toggleLikeTemplate={toggleLikeTemplate}
            setSelectedTemplateForPreview={setSelectedTemplateForPreview}
            handleUseTemplate={handleUseTemplate}
          />
        ) : activeSubTab === "forms" ? (
          <FormConfig 
            configs={formConfigs}
            onAddConfig={handleAddFormConfig}
          />
        ) : (
          <PagesList 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            filteredPages={filteredPages}
            selectedIds={selectedIds}
            handleSelectAll={handleSelectAll}
            handleSelectRow={handleSelectRow}
            setIsCreateModalOpen={setIsCreateModalOpen}
          />
        )}
      </div>

      {/* 3. Modal for creating a new Landing Page */}
      <CreatePageModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        newPageName={newPageName}
        setNewPageName={setNewPageName}
        onCreatePage={handleCreatePage}
      />

      {/* 4. Modal for template preview */}
      <TemplatePreviewModal 
        template={selectedTemplateForPreview}
        onClose={() => setSelectedTemplateForPreview(null)}
        onUseTemplate={(temp) => {
          setSelectedTemplateForPreview(null);
          handleUseTemplate(temp);
        }}
      />
    </div>
  );
}
