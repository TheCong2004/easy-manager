"use client";

import React, { useState, useCallback, useEffect } from "react";
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
import { createLandingPage, deleteLandingPage, deleteLandingPages, isValidPageId } from "@/components/landing-pages/editor/core/editor-supabase-storage";
import { LANDING_TEMPLATE_PRESETS, resolveTemplatePresetId, instantiateTemplateBlocks } from "@/components/landing-pages/editor/template-library";
import { migrateTemplateFlatBlocks, migrateEditorData, recalculateSectionHeights } from "@/components/landing-pages/editor/core/editor-migration";
import { createDefaultPageSettings, ensureOnlookBlockMeta } from "@/components/landing-pages/editor/types";
import { CURRENT_EDITOR_SCHEMA_VERSION } from "@/components/landing-pages/editor/core/editor-migration";
import { supabase } from "@/lib/supabase";
import { listTemplates, incrementTemplateDownloads } from "@/components/landing-pages/templates/template-service";



const initialPages: LandingPageItem[] = [];



function formatLandingPageRow(item: any): LandingPageItem {
  return {
    id: item.id,
    name: item.name || "Untitled Page",
    templateId: item.editor_data?.templateId || undefined,
    status: item.status === "published" ? "PUBLISHED" : "UNPUBLISHED",
    updatedAt: item.updated_at
      ? new Date(item.updated_at).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }) +
        ", " +
        new Date(item.updated_at).toLocaleDateString("vi-VN")
      : "",
    views: 0,
    conversions: 0,
    revenue: 0,
  };
}

function collectLocalLandingBackups() {
  const localPages: Array<{
    key: string;
    pageId: string;
    editorData: any;
    savedAt?: string;
  }> = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("landing-editor-autosave:")) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const backup = JSON.parse(raw);
      const pageId = String(backup?.pageId || backup?.editorData?.pageId || key.replace("landing-editor-autosave:", ""));
      localPages.push({
        key,
        pageId,
        editorData: backup?.editorData || {},
        savedAt: backup?.savedAt,
      });
    }
  } catch (err) {
    console.warn("Failed to read local storage pages:", err);
  }

  return localPages;
}

async function syncLocalBackupsToSupabase(remoteIds: Set<string>): Promise<LandingPageItem[]> {
  if (!supabase) return [];

  const migrated: LandingPageItem[] = [];
  const localBackups = collectLocalLandingBackups();

  for (const backup of localBackups) {
    const nextId = isValidPageId(backup.pageId)
      ? backup.pageId
      : typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "";

    if (!isValidPageId(nextId) || remoteIds.has(nextId)) continue;

    const pageName = backup.editorData?.pageName || "Untitled Page";
    const editorData = {
      ...backup.editorData,
      pageId: nextId,
      pageName,
    };

    try {
      const created = await createLandingPage({
        id: nextId,
        name: pageName,
        slug: pageName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || `page-${Date.now()}`,
        editor_data: editorData,
      });

      if (created?.id && isValidPageId(created.id)) {
        migrated.push(formatLandingPageRow(created));
        remoteIds.add(created.id);
        localStorage.removeItem(backup.key);
        console.info("[LandingPages Sync] Migrated local page to Supabase", {
          oldPageId: backup.pageId,
          newPageId: created.id,
        });
      }
    } catch (err) {
      console.warn("[LandingPages Sync] Failed to migrate local page:", err);
    }
  }

  return migrated;
}



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




export default function LandingPagesManagement() {
  const router = useRouter();
  const [pages, setPages] = useState<LandingPageItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState("pages");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState("");

  // Dynamic pages loading effect
  useEffect(() => {
    async function loadPages() {
      // 1. Try Supabase first
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("landing_pages")
            .select("id, name, status, updated_at, editor_data")
            .order("updated_at", { ascending: false });

          if (!error && data) {
            const dbPages: LandingPageItem[] = data.map(formatLandingPageRow);
            const migratedPages = await syncLocalBackupsToSupabase(new Set(dbPages.map((page) => page.id)));
            setPages([...migratedPages, ...dbPages]);
            return;
          }
        } catch (err) {
          console.warn("Supabase fetch pages failed, falling back to local storage:", err);
        }
      }

      // 2. Local storage fallback: scan all landing-editor-autosave: keys
      const localPages: LandingPageItem[] = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("landing-editor-autosave:")) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const backup = JSON.parse(raw);
              const pageId = key.replace("landing-editor-autosave:", "");
              localPages.push({
                id: pageId,
                name: backup?.editorData?.pageName || "Untitled Page",
                status: "UNPUBLISHED",
                updatedAt: backup?.savedAt
                  ? new Date(backup.savedAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }) +
                    ", " +
                    new Date(backup.savedAt).toLocaleDateString("vi-VN")
                  : "",
                views: 0,
                conversions: 0,
                revenue: 0,
              });
            }
          }
        }
      } catch (err) {
        console.warn("Failed to read local storage pages:", err);
      }



      // Sort by updatedAt descending
      localPages.sort((a, b) => {
        const timeA = new Date(a.updatedAt.split(", ")[1]?.split("/").reverse().join("-") + "T" + a.updatedAt.split(", ")[0]).getTime() || 0;
        const timeB = new Date(b.updatedAt.split(", ")[1]?.split("/").reverse().join("-") + "T" + b.updatedAt.split(", ")[0]).getTime() || 0;
        return timeB - timeA;
      });

      setPages(localPages);
    }

    void loadPages();
  }, []);

  // Creating page state
  const [isCreating, setIsCreating] = useState(false);


  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [pendingTemplate, setPendingTemplate] = useState<TemplateItem | null>(null);

  // Templates Sub-View States
  const [activeTemplateTab, setActiveTemplateTab] = useState("sample"); 
  const [activeCategory, setActiveCategory] = useState("all");
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<TemplateItem | null>(null);
  const [likedTemplates, setLikedTemplates] = useState<Record<string, boolean>>({});
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTemplates() {
      setIsTemplatesLoading(true);
      setTemplatesError(null);
      try {
        const data = await listTemplates();
        if (cancelled) return;

        const mapped: TemplateItem[] = data.map((t: any) => ({
          id: t.id,
          templateId: t.template_key,
          name: t.name,
          image: t.thumbnail_url || t.preview_image_url || "/images/grid-image/image-01.png",
          category: t.category === "ecommerce" || t.category === "Bán hàng" ? "ecommerce" : t.category === "service" || t.category === "Dịch vụ" ? "service" : "others",
          isPro: t.price_type === "pro",
          views: t.views_count || 0,
          likes: t.downloads_count || 0,
          scrollDist: "calc(-100% + 260px)",
          editor_data: t.editor_data,
        }));

        setTemplates(mapped);
      } catch (err: any) {
        console.error("Failed to load templates from Supabase:", err);
        if (!cancelled) {
          setTemplatesError(err.message || "Không thể tải kho giao diện");
        }
      } finally {
        if (!cancelled) {
          setIsTemplatesLoading(false);
        }
      }
    }

    void loadTemplates();

    return () => {
      cancelled = true;
    };
  }, []);

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
      if (typeof crypto === "undefined" || !crypto.randomUUID) {
        throw new Error("Browser does not support crypto.randomUUID.");
      }

      const pageId = crypto.randomUUID();

      // Build initial editor data from template if provided
      let initialEditorData: any = {
        pageId,
        pageName: newPageName.trim(),
        sections: [],
        pageSettings: createDefaultPageSettings(newPageName.trim()),
        schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
        templateId: pendingTemplate?.templateId ?? null,
      };

      if (pendingTemplate) {
        try {
          if (pendingTemplate.editor_data) {
            // Deep clone editor_data
            const cloned = JSON.parse(JSON.stringify(pendingTemplate.editor_data));
            cloned.pageId = pageId;
            cloned.pageName = newPageName.trim();
            const migrated = migrateEditorData(cloned, pageId);
            migrated.sections = recalculateSectionHeights(migrated.sections);
            initialEditorData = migrated;
          } else {
            const presetId = resolveTemplatePresetId({ name: pendingTemplate.name, id: pendingTemplate.id, templateId: pendingTemplate.templateId });
            const flatBlocks = instantiateTemplateBlocks(presetId).map(ensureOnlookBlockMeta);
            const sections = migrateTemplateFlatBlocks(flatBlocks);
            const migrated = migrateEditorData({
              pageId,
              pageName: newPageName.trim(),
              sections,
              pageSettings: createDefaultPageSettings(newPageName.trim()),
              schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
            }, pageId);
            migrated.sections = recalculateSectionHeights(migrated.sections);
            initialEditorData = migrated;
          }
          console.info("[LandingPage Create:template]", {
            pageId,
            templateId: pendingTemplate?.templateId ?? pendingTemplate?.id,
            sections: initialEditorData.sections?.length || 0,
          });
        } catch (err) {
          console.warn("Template apply failed, starting blank:", err);
        }
      }

      const slug = newPageName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const created = await createLandingPage({
        id: pageId,
        name: newPageName.trim(),
        slug: slug || `page-${Date.now()}`,
        editor_data: initialEditorData,
      });

      if (!created?.id || !isValidPageId(created.id)) {
        throw new Error("Supabase did not return a valid landing page id.");
      }

      // Increment template downloads count
      if (pendingTemplate?.id) {
        await incrementTemplateDownloads(pendingTemplate.id);
      }

      const newPg: LandingPageItem = {
        id: created.id,
        name: created.name,
        templateId: pendingTemplate?.templateId || undefined,
        status: "UNPUBLISHED",
        updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
        views: 0,
        conversions: 0,
        revenue: 0,
      };

      setPages((prev) => [newPg, ...prev]);
      setNewPageName("");
      setPendingTemplate(null);
      setIsCreateModalOpen(false);

      // Redirect to the editor route for this new page
      router.push(`/landing-pages/editor/${created.id}`);
    } catch (err) {
      console.error("Failed to create landing page:", err);
      alert("Không tạo được landing page trên Supabase. Kiểm tra RLS/policy hoặc service key rồi thử lại.");
    } finally {
      setIsCreating(false);
    }
  }, [newPageName, pendingTemplate, isCreating, router]);


  // Create page from template
  const handleUseTemplate = (template: TemplateItem) => {
    setNewPageName(template.name.split("-")[0].trim().toLowerCase() + "-copy");
    setPendingTemplate(template);
    setIsCreateModalOpen(true);
  };


  // Handler for editing a page — navigate to the editor route
  const handleEditPage = useCallback((page: LandingPageItem) => {
    router.push(`/landing-pages/editor/${page.id}`);
  }, [router]);


  // Handler for deleting a page
  const handleDeletePage = useCallback(async (page: LandingPageItem) => {
    try {
      await deleteLandingPage(page.id);
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      setSelectedIds((prev) => prev.filter((id) => id !== page.id));
    } catch (err) {
      console.error("Failed to delete page:", err);
      alert("Không thể xóa landing page. Vui lòng thử lại.");
    }
  }, []);

  // Handler for deleting multiple selected pages
  const handleDeleteSelectedPages = useCallback(async (ids: string[]) => {
    try {
      await deleteLandingPages(ids);
      setPages((prev) => prev.filter((p) => !ids.includes(p.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to delete selected pages:", err);
      alert("Không thể xóa các landing page đã chọn. Vui lòng thử lại.");
    }
  }, []);


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
  const filteredTemplates = templates.filter(t => {
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
            isLoading={isTemplatesLoading}
            error={templatesError}
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
              if (open) setPendingTemplate(null);
              setIsCreateModalOpen(open);
            }}
            onEdit={handleEditPage}
            onDelete={handleDeletePage}
            onDeleteSelected={handleDeleteSelectedPages}
          />
        )}
      </div>

      {/* 3. Modal for creating a new Landing Page */}
      <CreatePageModal 
        isOpen={isCreateModalOpen}
        onClose={() => {
          setPendingTemplate(null);
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
