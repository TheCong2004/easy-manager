"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LandingPageItem, TemplateItem, FormConfigItem, TagItem, DomainItem } from "@/components/landing-pages/dung-chung/types";
import { SubSidebar } from "@/components/landing-pages/sidebar/SubSidebar";
import { PagesList } from "@/components/landing-pages/pages/PagesList";
import { TemplatesLibrary } from "@/components/landing-pages/templates/TemplatesLibrary";
import { FormConfig } from "@/components/landing-pages/form-config/FormConfig";
import { TagManagement } from "@/components/landing-pages/tags/TagManagement";
import { DomainsConfig } from "@/components/landing-pages/domains/DomainsConfig";
import { DataLeads } from "@/components/landing-pages/leads/DataLeads";
import { CreatePageModal } from "@/components/landing-pages/pages/CreatePageModal";
import { TemplatePreviewModal } from "@/components/landing-pages/templates/TemplatePreviewModal";
import { createLandingPage } from "@/components/landing-pages/editor/core/editor-supabase-storage";
import { resolveTemplatePresetId, instantiateTemplateBlocks } from "@/components/landing-pages/editor/template-library";
import { migrateTemplateFlatBlocks } from "@/components/landing-pages/editor/core/editor-migration";
import { createDefaultPageSettings, ensureOnlookBlockMeta } from "@/components/landing-pages/editor/types";
import { CURRENT_EDITOR_SCHEMA_VERSION } from "@/components/landing-pages/editor/core/editor-migration";


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
  {
    id: "t9",
    name: "LDP112313 - Hero Slide Show Carousel",
    image: "/images/carousel/carousel-01.png",
    category: "others",
    isPro: false,
    views: 7240,
    likes: 3610,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t10",
    name: "LDP112314 - Product Grid Flash Sale",
    image: "/images/product/smartwatch_product.png",
    category: "ecommerce",
    isPro: false,
    views: 8350,
    likes: 4180,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t11",
    name: "LDP112315 - Course Funnel E-Learning",
    image: "/images/carousel/carousel-02.png",
    category: "service",
    isPro: true,
    views: 6920,
    likes: 3420,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t12",
    name: "LDP112316 - Gallery Showcase Portfolio",
    image: "/images/grid-image/image-01.png",
    category: "others",
    isPro: false,
    views: 5480,
    likes: 2280,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t13",
    name: "LDP112317 - Builder Product Kit",
    image: "/images/product/skincare_product.png",
    category: "ecommerce",
    isPro: true,
    views: 9210,
    likes: 4690,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t14",
    name: "LDP112318 - Builder UI Elements",
    image: "/images/grid-image/image-03.png",
    category: "service",
    isPro: false,
    views: 6370,
    likes: 3010,
    scrollDist: "calc(-100% + 260px)",
  },
  // ── 12 mẫu mới ─────────────────────────────────────────────────────────────
  {
    id: "t15",
    name: "SaaS Minimal Clean — Flux AI CRM",
    image: "/images/product/smartwatch_product.png",
    category: "service",
    isPro: false,
    views: 8120,
    likes: 4060,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t16",
    name: "E-commerce Bold Offer — Flash Sale 70%",
    image: "/images/product/skincare_product.png",
    category: "ecommerce",
    isPro: false,
    views: 11430,
    likes: 5780,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t17",
    name: "Premium Real Estate — Luxury Biệt thự",
    image: "/images/grid-image/image-01.png",
    category: "service",
    isPro: true,
    views: 5340,
    likes: 2890,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t18",
    name: "Online Course Conversion — GrowthAcademy",
    image: "/images/carousel/carousel-02.png",
    category: "service",
    isPro: false,
    views: 9870,
    likes: 4920,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t19",
    name: "Webinar Event Modern — Growth Summit 2026",
    image: "/images/carousel/carousel-01.png",
    category: "others",
    isPro: false,
    views: 7650,
    likes: 3820,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t20",
    name: "Agency Portfolio — VOID Studio Creative",
    image: "/images/grid-image/image-02.png",
    category: "others",
    isPro: true,
    views: 6210,
    likes: 3140,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t21",
    name: "Clinic Trust Landing — VitaCare Phòng khám",
    image: "/images/grid-image/image-04.png",
    category: "service",
    isPro: false,
    views: 4980,
    likes: 2490,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t22",
    name: "Restaurant Premium Menu — Nhà hàng Umami",
    image: "/images/grid-image/image-05.png",
    category: "service",
    isPro: false,
    views: 5720,
    likes: 2960,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t23",
    name: "Mobile App Launch — Pendo Finance App",
    image: "/images/product/green_tea_product.png",
    category: "others",
    isPro: false,
    views: 8880,
    likes: 4440,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t24",
    name: "Finance Lead Generation — ProsperWealth",
    image: "/images/product/smartwatch_product.png",
    category: "service",
    isPro: true,
    views: 6560,
    likes: 3280,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t25",
    name: "Beauty Spa Elegant — Lumière Spa & Skincare",
    image: "/images/product/skincare_product.png",
    category: "service",
    isPro: false,
    views: 7340,
    likes: 3670,
    scrollDist: "calc(-100% + 260px)",
  },
  {
    id: "t26",
    name: "Local Service Lead Gen — AirFix Điều hòa",
    image: "/images/grid-image/image-06.png",
    category: "service",
    isPro: false,
    views: 9120,
    likes: 4560,
    scrollDist: "calc(-100% + 260px)",
  },
];

const initialTags: TagItem[] = [
  {
    id: "1",
    name: "oke",
    count: 0,
    createdAt: "17:20, 13/06/2026",
    status: "UNLOCKED",
    updatedAt: "17:20, 13/06/2026",
  },
];

function mapTemplateToEditorPreset(template: TemplateItem): string {
  const value = `${template.id} ${template.name} ${template.category}`.toLowerCase();
  // Legacy templates
  if (value.includes("112306") || value.includes("wedding") || value.includes("cưới")) return "wedding-invite";
  if (value.includes("112305") || value.includes("112309") || value.includes("mỹ phẩm")) return "beauty-shop";
  if (value.includes("112307") || value.includes("trà") || value.includes("tea")) return "herb-tea";
  if (value.includes("112308") || value.includes("smartwatch") || value.includes("đồng hồ")) return "smartwatch-performance";
  if (value.includes("112312") || value.includes("khóa học")) return "webinar-lead";
  if (value.includes("112313") || value.includes("slide show") || value.includes("carousel")) return "hero-slide-show";
  if (value.includes("112314") || value.includes("product grid") || value.includes("flash sale")) return "ladi-product-grid";
  if (value.includes("112315") || value.includes("course funnel") || value.includes("e-learning")) return "course-slide-funnel";
  if (value.includes("112316") || value.includes("gallery showcase")) return "gallery-showcase";
  if (value.includes("112317") || value.includes("builder product kit")) return "builder-product-kit";
  if (value.includes("112318") || value.includes("builder ui elements")) return "builder-ui-elements";
  if (value.includes("112310") || value.includes("grand") || value.includes("khai trương")) return "grand-opening";
  if (value.includes("112311")) return "finance-consulting";
  // 12 template mới — khớp theo ID t15–t26
  if (value.includes("t15") || value.includes("saas") || value.includes("flux ai crm")) return "saas-minimal";
  if (value.includes("t16") || value.includes("ecommerce") || value.includes("flash sale 70")) return "ecommerce-bold";
  if (value.includes("t17") || value.includes("real estate") || value.includes("biệt thự")) return "real-estate-premium";
  if (value.includes("t18") || value.includes("online course") || value.includes("growthacademy")) return "online-course";
  if (value.includes("t19") || value.includes("webinar event") || value.includes("growth summit")) return "webinar-event";
  if (value.includes("t20") || value.includes("agency") || value.includes("void studio")) return "agency-portfolio";
  if (value.includes("t21") || value.includes("clinic") || value.includes("vitacare")) return "clinic-trust";
  if (value.includes("t22") || value.includes("restaurant") || value.includes("umami")) return "restaurant-menu";
  if (value.includes("t23") || value.includes("mobile app") || value.includes("pendo")) return "mobile-app";
  if (value.includes("t24") || value.includes("finance lead") || value.includes("prosperwealth")) return "finance-lead";
  if (value.includes("t25") || value.includes("beauty spa") || value.includes("lumière")) return "beauty-spa";
  if (value.includes("t26") || value.includes("local service") || value.includes("airfix")) return "local-service";
  return "product-launch";
}


export default function LandingPagesManagement() {
  const router = useRouter();
  const [pages, setPages] = useState<LandingPageItem[]>(initialPages);
  const [activeSubTab, setActiveSubTab] = useState("pages");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState("");

  // Creating page state
  const [isCreating, setIsCreating] = useState(false);


  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [pendingTemplateId, setPendingTemplateId] = useState<string | undefined>();

  // Templates Sub-View States
  const [activeTemplateTab, setActiveTemplateTab] = useState("sample"); 
  const [activeCategory, setActiveCategory] = useState("all");
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<TemplateItem | null>(null);
  const [likedTemplates, setLikedTemplates] = useState<Record<string, boolean>>({});

  // Form Config Sub-View States
  const [formConfigs, setFormConfigs] = useState<FormConfigItem[]>([]);

  // Tag Management Sub-View States
  const [tags, setTags] = useState<TagItem[]>(initialTags);

  // Domains Sub-View States
  const [domains, setDomains] = useState<DomainItem[]>([]);

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

  // Modal confirm submit — create page in Supabase, then redirect to editor route
  const handleCreatePage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      // Build initial editor data from template if provided
      let initialEditorData: any = {
        pageName: newPageName.trim(),
        sections: [],
        pageSettings: createDefaultPageSettings(newPageName.trim()),
        schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
      };

      if (pendingTemplateId) {
        try {
          const flatBlocks = instantiateTemplateBlocks(pendingTemplateId).map(ensureOnlookBlockMeta);
          const sections = migrateTemplateFlatBlocks(flatBlocks);
          initialEditorData = {
            ...initialEditorData,
            sections,
          };
        } catch (err) {
          console.warn("Template apply failed, starting blank:", err);
        }
      }

      const slug = newPageName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const created = await createLandingPage({
        name: newPageName.trim(),
        slug: slug || `page-${Date.now()}`,
        editor_data: initialEditorData,
      });

      const newPg: LandingPageItem = {
        id: created.id,
        name: created.name,
        templateId: pendingTemplateId,
        status: "UNPUBLISHED",
        updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
        views: 0,
        conversions: 0,
        revenue: 0,
      };

      setPages((prev) => [newPg, ...prev]);
      setNewPageName("");
      setPendingTemplateId(undefined);
      setIsCreateModalOpen(false);

      // Redirect to the editor route for this new page
      router.push(`/landing-pages/editor/${created.id}`);
    } catch (err) {
      console.error("Failed to create landing page:", err);
      // Fallback: create local-only page and redirect
      const fallbackId = `local-${Date.now()}`;
      const newPg: LandingPageItem = {
        id: fallbackId,
        name: newPageName.trim().toLowerCase(),
        templateId: pendingTemplateId,
        status: "UNPUBLISHED",
        updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
        views: 0,
        conversions: 0,
        revenue: 0,
      };
      setPages((prev) => [newPg, ...prev]);
      setNewPageName("");
      setPendingTemplateId(undefined);
      setIsCreateModalOpen(false);
      router.push(`/landing-pages/editor/${fallbackId}`);
    } finally {
      setIsCreating(false);
    }
  }, [newPageName, pendingTemplateId, isCreating, router]);


  // Create page from template
  const handleUseTemplate = (template: TemplateItem) => {
    setNewPageName(template.name.split("-")[0].trim().toLowerCase() + "-copy");
    setPendingTemplateId(mapTemplateToEditorPreset(template));
    setIsCreateModalOpen(true);
  };

  // Handler for editing a page — navigate to the editor route
  const handleEditPage = useCallback((page: LandingPageItem) => {
    router.push(`/landing-pages/editor/${page.id}`);
  }, [router]);


  // Handler when published from editor
  const handlePublishFromEditor = (updatedPage: LandingPageItem) => {
    setPages((prev) => prev.map((p) => (p.id === updatedPage.id ? updatedPage : p)));
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

  // Add a new Tag
  const handleAddTag = (name: string) => {
    const newTag: TagItem = {
      id: String(Date.now()),
      name,
      count: 0,
      createdAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
      status: "UNLOCKED",
      updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
    };
    setTags(prev => [newTag, ...prev]);
  };

  // Add a new Domain
  const handleAddDomain = (name: string, platform: string) => {
    const newDomain: DomainItem = {
      id: String(Date.now()),
      name,
      status: "VERIFIED",
      platform,
      sslStatus: "ACTIVE",
      updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
    };
    setDomains(prev => [newDomain, ...prev]);
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
    <>

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
        ) : activeSubTab === "tags" ? (
          <TagManagement 
            tags={tags}
            onAddTag={handleAddTag}
          />
        ) : activeSubTab === "domains" ? (
          <DomainsConfig 
            domains={domains}
            onAddDomain={handleAddDomain}
          />
        ) : activeSubTab === "leads" ? (
          <DataLeads />
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
            setIsCreateModalOpen={(open) => {
              if (open) setPendingTemplateId(undefined);
              setIsCreateModalOpen(open);
            }}
            onEdit={handleEditPage}
          />
        )}
      </div>

      {/* 3. Modal for creating a new Landing Page */}
      <CreatePageModal 
        isOpen={isCreateModalOpen}
        onClose={() => {
          setPendingTemplateId(undefined);
          setIsCreateModalOpen(false);
        }}
        newPageName={newPageName}
        setNewPageName={setNewPageName}
        onCreatePage={handleCreatePage}
        isLoading={isCreating}
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
  </>
  );
}
