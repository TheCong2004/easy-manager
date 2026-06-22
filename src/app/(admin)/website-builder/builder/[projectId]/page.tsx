"use client";

import React, { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getWebsiteProject,
  updateWebsiteProject,
  publishWebsite,
  unpublishWebsite,
  WebsiteProject,
  WebsiteSection,
  WebsiteSchema,
  DEFAULT_SCHEMA
} from "@/components/website-builder/core/website-db-storage";
import WebsiteRenderer from "@/components/website-builder/renderer/WebsiteRenderer";
import SectionRenderer from "@/components/website-builder/renderer/SectionRenderer";
import { useUpdateWebsiteSchema, usePublishWebsiteProject } from "@/hooks/use-website-builder";
import { JobProgressModal } from "@/components/website-builder/shared/job-progress";

interface BuilderPageProps {
  params: Promise<{ projectId: string }>;
}

export default function WebsiteBuilderCanvas({ params }: BuilderPageProps) {
  const router = useRouter();
  const { projectId } = use(params);

  const [project, setProject] = useState<WebsiteProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pages" | "seo" | "style" | "add-sections">("add-sections");
  const [activePageId, setActivePageId] = useState("home");
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "failed">("saved");
  const isFirstLoad = useRef(true);
  const [past, setPast] = useState<WebsiteSchema[]>([]);
  const [future, setFuture] = useState<WebsiteSchema[]>([]);

  const updateSchemaMutation = useUpdateWebsiteSchema(projectId);
  
  // States for selected element to edit
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSlug, setPublishSlug] = useState("");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const publishMutation = usePublishWebsiteProject(projectId);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await getWebsiteProject(projectId);
        if (data) {
          setProject(data);
          setPublishSlug(data.slug || data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
          const schemaData = data.schema_data;
          if (schemaData?.pages && schemaData.pages.length > 0) {
            setActivePageId(schemaData.pages[0].id);
          }
        } else {
          triggerToast("Không tìm thấy dự án", "error");
          router.push("/website-builder");
        }
      } catch (err) {
        console.error(err);
        triggerToast("Lỗi khi tải dự án", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId, router]);

  // Set isFirstLoad to false after loading completes
  useEffect(() => {
    if (!loading && project) {
      const timer = setTimeout(() => {
        isFirstLoad.current = false;
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [loading, project]);

  // Debounced Autosave Effect
  useEffect(() => {
    if (loading || isFirstLoad.current || !isDirty || !project) return;

    const timer = setTimeout(async () => {
      const activeSchema = project.schema_data || DEFAULT_SCHEMA;
      setSaveStatus("saving");
      try {
        await updateSchemaMutation.mutateAsync(activeSchema);
        await updateWebsiteProject(project.id, {
          schema_data: activeSchema
        });
        setIsDirty(false);
        setSaveStatus("saved");
      } catch (err) {
        console.error("Autosave error:", err);
        setSaveStatus("failed");
      }
    }, 1000); // 1000ms debounce

    return () => clearTimeout(timer);
  }, [project?.schema_data, isDirty, loading]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-meta-4">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Đang khởi tạo trình dựng website...</p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const schema: WebsiteSchema = project.schema_data || DEFAULT_SCHEMA;
  const currentPage = schema.pages.find((p) => p.id === activePageId) || schema.pages[0];

  const updateSchema = async (newSchema: WebsiteSchema) => {
    const currentSchema = project?.schema_data || DEFAULT_SCHEMA;
    if (JSON.stringify(currentSchema) === JSON.stringify(newSchema)) {
      return;
    }

    if (!isFirstLoad.current) {
      setPast(prevPast => {
        const nextPast = [...prevPast, currentSchema];
        if (nextPast.length > 50) {
          nextPast.shift();
        }
        return nextPast;
      });
      setFuture([]);
    }

    const updated = { ...project, schema_data: newSchema } as WebsiteProject;
    setProject(updated);
    setIsDirty(true);
    setSaveStatus("unsaved");
  };

  const handleUndo = () => {
    if (past.length === 0 || !project) return;

    const previousSchema = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const currentSchema = project.schema_data || DEFAULT_SCHEMA;

    setPast(newPast);
    setFuture(prevFuture => [currentSchema, ...prevFuture]);

    const updated = { ...project, schema_data: previousSchema } as WebsiteProject;
    setProject(updated);
    setIsDirty(true);
    setSaveStatus("unsaved");
  };

  const handleRedo = () => {
    if (future.length === 0 || !project) return;

    const nextSchema = future[0];
    const newFuture = future.slice(1);
    const currentSchema = project.schema_data || DEFAULT_SCHEMA;

    setPast(prevPast => {
      const nextPast = [...prevPast, currentSchema];
      if (nextPast.length > 50) {
        nextPast.shift();
      }
      return nextPast;
    });
    setFuture(newFuture);

    const updated = { ...project, schema_data: nextSchema } as WebsiteProject;
    setProject(updated);
    setIsDirty(true);
    setSaveStatus("unsaved");
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await updateSchemaMutation.mutateAsync(schema);
      await updateWebsiteProject(project.id, {
        schema_data: schema
      });
      setIsDirty(false);
      setSaveStatus("saved");
      triggerToast("Đã lưu thiết kế thành công!");
    } catch (err) {
      console.error("Save schema error:", err);
      setSaveStatus("failed");
      triggerToast("Lỗi khi lưu thiết kế", "error");
    }
  };

  const USE_MOCK_API = true;

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishSlug.trim()) return;

    if (USE_MOCK_API) {
      try {
        await publishWebsite(project.id, publishSlug);
        setProject((prev: WebsiteProject | null) => prev ? { ...prev, status: "published", slug: publishSlug } : null);
        setShowPublishModal(false);
        setActiveJobId(project.id);
      } catch (err) {
        triggerToast("Tên miền / Slug đã tồn tại", "error");
      }
    } else {
      publishMutation.mutate(undefined, {
        onSuccess: (data: any) => {
          setShowPublishModal(false);
          const jobId = data?.jobId;
          if (jobId) {
            setActiveJobId(jobId);
          } else {
            triggerToast("Xuất bản trang web thành công!");
            setProject((prev: WebsiteProject | null) => prev ? { ...prev, status: "published", slug: publishSlug } : null);
          }
        },
        onError: (err: any) => {
          triggerToast(err?.message || "Lỗi khi xuất bản trang", "error");
        }
      });
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishWebsite(project.id);
      setProject((prev: WebsiteProject | null) => prev ? { ...prev, status: "draft", slug: undefined } : null);
      triggerToast("Đã hủy xuất bản trang web!");
    } catch (err) {
      triggerToast("Lỗi khi hủy xuất bản", "error");
    }
  };

  // Section Manipulations
  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...currentPage.sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    // Swap
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const newPages = schema.pages.map((p: any) => 
      p.id === activePageId ? { ...p, sections: newSections } : p
    );
    updateSchema({ ...schema, pages: newPages });
  };

  const deleteSection = (index: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa section này?")) {
      const newSections = currentPage.sections.filter((_: any, i: number) => i !== index);
      const newPages = schema.pages.map((p: any) => 
        p.id === activePageId ? { ...p, sections: newSections } : p
      );
      updateSchema({ ...schema, pages: newPages });
      setEditingSectionId(null);
    }
  };

  const duplicateSection = (index: number) => {
    const sectionToDup = currentPage.sections[index];
    const newSection = {
      ...sectionToDup,
      id: `${sectionToDup.type}-${Date.now()}`
    };
    const newSections = [...currentPage.sections];
    newSections.splice(index + 1, 0, newSection);

    const newPages = schema.pages.map((p: any) => 
      p.id === activePageId ? { ...p, sections: newSections } : p
    );
    updateSchema({ ...schema, pages: newPages });
  };

  const addSection = (type: WebsiteSection["type"]) => {
    let newSec: WebsiteSection;
    const baseId = `${type}-${Date.now()}`;

    switch (type) {
      case "hero":
        newSec = {
          id: baseId,
          type: "hero",
          title: "Tiêu đề Hero mới",
          subtitle: "Nhập phụ đề mô tả ngắn gọn về dịch vụ hoặc sản phẩm của bạn ở đây.",
          content: "Chi tiết các lợi ích vượt trội.",
          buttonText: "Nhấp để hành động",
          buttonLink: "#",
          settings: { backgroundColor: schema.primaryColor || "#3B82F6", textColor: "#FFFFFF" }
        };
        break;
      case "features":
        newSec = {
          id: baseId,
          type: "features",
          title: "Tính năng & Lợi ích",
          subtitle: "Đưa ra các điểm mạnh cốt lõi của doanh nghiệp.",
          items: [
            { title: "Ưu điểm 1", description: "Mô tả chi tiết ưu điểm vượt trội thứ nhất.", icon: "zap" },
            { title: "Ưu điểm 2", description: "Mô tả chi tiết ưu điểm vượt trội thứ hai.", icon: "activity" }
          ]
        };
        break;
      case "testimonials":
        newSec = {
          id: baseId,
          type: "testimonials",
          title: "Đánh giá từ khách hàng",
          subtitle: "Những lời khen ngợi chân thực từ đối tác.",
          items: [
            { author: "Khách hàng A", role: "Manager", description: "Trải nghiệm tuyệt vời, sản phẩm hoạt động ổn định và hỗ trợ rất nhanh." }
          ]
        };
        break;
      case "contact":
        newSec = {
          id: baseId,
          type: "contact",
          title: "Kết nối với chúng tôi",
          subtitle: "Để lại lời nhắn và chuyên gia của chúng tôi sẽ liên hệ lại ngay.",
          buttonText: "Gửi thông tin"
        };
        break;
      default:
        newSec = {
          id: baseId,
          type: "footer",
          title: "© 2026 Bản quyền thuộc về doanh nghiệp.",
          subtitle: "Chính sách bảo mật | Điều khoản sử dụng"
        };
    }

    const newSections = [...currentPage.sections];
    // Chèn trước footer nếu có
    const footerIdx = newSections.findIndex(s => s.type === "footer");
    if (footerIdx !== -1) {
      newSections.splice(footerIdx, 0, newSec);
    } else {
      newSections.push(newSec);
    }

    const newPages = schema.pages.map((p: any) => 
      p.id === activePageId ? { ...p, sections: newSections } : p
    );
    updateSchema({ ...schema, pages: newPages });
    triggerToast("Đã thêm section mới!");
  };

  // Inline Editing
  const startInlineEdit = (sectionId: string, field: string, currentValue: string) => {
    setEditingSectionId(sectionId);
    setEditingField(field);
    setEditingValue(currentValue);
  };

  const saveInlineEdit = () => {
    if (!editingSectionId || !editingField) return;

    const newSections = currentPage.sections.map((sec: any) => {
      if (sec.id === editingSectionId) {
        return { ...sec, [editingField]: editingValue };
      }
      return sec;
    });

    const newPages = schema.pages.map((p: any) => 
      p.id === activePageId ? { ...p, sections: newSections } : p
    );
    updateSchema({ ...schema, pages: newPages });
    setEditingField(null);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100 dark:bg-meta-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg border text-white ${
          toast.type === "success" ? "bg-emerald-600 border-emerald-500" : "bg-rose-600 border-rose-500"
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Editor Top Bar */}
      <header className="flex h-16 items-center justify-between border-b border-stroke bg-white px-6 shadow-sm dark:border-strokedark dark:bg-boxdark z-30">
        <div className="flex items-center gap-4">
          <Link
            href={`/website-builder/project/${project.id}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-black hover:text-primary dark:text-white dark:hover:text-primary"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </Link>
          <span className="h-4 w-px bg-stroke dark:bg-strokedark"></span>
          <div>
            <h2 className="text-base font-bold text-black dark:text-white leading-tight">{project.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex rounded-full px-2 py-0.2 text-[10px] font-semibold ${
                project.status === "published"
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
                  : "bg-amber-50 text-amber-600 dark:bg-amber-950/20"
              }`}>
                {project.status === "published" ? "Công khai" : "Bản nháp"}
              </span>
              <span className="text-[10px] text-gray-400">
                {project.type} Campaign
              </span>
            </div>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex rounded-md bg-gray-100 p-0.5 dark:bg-meta-4">
            <button
              onClick={() => setViewMode("desktop")}
              className={`rounded px-3 py-1 text-xs font-medium transition-all ${
                viewMode === "desktop" ? "bg-white text-black shadow-sm dark:bg-boxdark dark:text-white" : "text-gray-500"
              }`}
            >
              Desktop
            </button>
            <button
              onClick={() => setViewMode("tablet")}
              className={`rounded px-3 py-1 text-xs font-medium transition-all ${
                viewMode === "tablet" ? "bg-white text-black shadow-sm dark:bg-boxdark dark:text-white" : "text-gray-500"
              }`}
            >
              Tablet
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`rounded px-3 py-1 text-xs font-medium transition-all ${
                viewMode === "mobile" ? "bg-white text-black shadow-sm dark:bg-boxdark dark:text-white" : "text-gray-500"
              }`}
            >
              Mobile
            </button>
          </div>

          {/* Undo/Redo Controls */}
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded dark:bg-meta-4">
            <button
              onClick={handleUndo}
              disabled={past.length === 0}
              className="rounded px-2.5 py-1 text-xs font-bold transition-all disabled:opacity-30 text-gray-500 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-boxdark bg-transparent border-0"
              title="Hoàn tác (Undo)"
            >
              ↩ Undo
            </button>
            <span className="text-gray-300 dark:text-zinc-600 text-xs">|</span>
            <button
              onClick={handleRedo}
              disabled={future.length === 0}
              className="rounded px-2.5 py-1 text-xs font-bold transition-all disabled:opacity-30 text-gray-500 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-boxdark bg-transparent border-0"
              title="Làm lại (Redo)"
            >
              Redo ↪
            </button>
          </div>

          <div className="flex items-center gap-2">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-xs text-blue-500 font-semibold mr-2 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                Đang tự động lưu...
              </span>
            )}
            {saveStatus === "saved" && !isDirty && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold mr-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Đã lưu thiết kế
              </span>
            )}
            {(saveStatus === "unsaved" || (isDirty && saveStatus !== "saving" && saveStatus !== "failed")) && (
              <span className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold mr-2 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Thay đổi chưa lưu
              </span>
            )}
            {saveStatus === "failed" && (
              <span className="flex items-center gap-1.5 text-xs text-rose-500 font-bold mr-2 animate-bounce">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                Lưu thất bại! Thử lại
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className="rounded-md border border-stroke py-1.5 px-4 text-center font-medium text-sm text-black hover:bg-gray-50 dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-90 bg-white disabled:opacity-50"
            >
              Lưu thiết kế
            </button>

            {project.status === "published" ? (
              <>
                <a
                  href={`/p/w/${project.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-zinc-800 text-white hover:bg-zinc-700 py-1.5 px-4 text-center font-medium text-sm"
                >
                  Xem live
                </a>
                <button
                  onClick={handleUnpublish}
                  className="rounded-md bg-amber-500 text-white hover:bg-opacity-90 py-1.5 px-4 text-center font-medium text-sm"
                >
                  Hủy xuất bản
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowPublishModal(true)}
                className="rounded-md bg-emerald-600 text-white hover:bg-opacity-95 py-1.5 px-4 text-center font-medium text-sm"
              >
                Xuất bản
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Editor Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Control Panel */}
        <aside className="w-80 border-r border-stroke bg-white dark:border-strokedark dark:bg-boxdark flex flex-col z-20 shadow-sm">
          {/* Tab Navigation */}
          <div className="grid grid-cols-4 border-b border-stroke dark:border-strokedark">
            {[
              { id: "add-sections", label: "+Khối" },
              { id: "pages", label: "Trang" },
              { id: "seo", label: "SEO" },
              { id: "style", label: "Style" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 text-center text-xs font-bold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-black dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Add Sections */}
            {activeTab === "add-sections" && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 font-medium">Nhấp vào một khối mẫu để thêm vào thiết kế:</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { type: "hero", label: "Hero Banner", desc: "Ảnh bìa khổ lớn ở đầu trang kèm tiêu đề & nút bấm." },
                    { type: "features", label: "Tính năng", desc: "Hộp lưới hiển thị các đặc điểm nổi bật." },
                    { type: "testimonials", label: "Đánh giá", desc: "Ý kiến nhận xét, đánh giá từ khách hàng." },
                    { type: "contact", label: "Liên hệ", desc: "Form thu thập thông tin email và số điện thoại." },
                    { type: "footer", label: "Footer", desc: "Thông tin chân trang bản quyền." }
                  ].map(secType => (
                    <button
                      key={secType.type}
                      onClick={() => addSection(secType.type as any)}
                      className="flex flex-col items-start p-3 rounded-lg border border-stroke text-left hover:border-primary hover:bg-primary/5 dark:border-strokedark dark:hover:border-primary transition"
                    >
                      <span className="text-sm font-bold text-black dark:text-white">{secType.label}</span>
                      <span className="text-xs text-gray-400 mt-1">{secType.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pages Manager */}
            {activeTab === "pages" && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 font-medium">Danh sách các trang của Website:</p>
                <div className="space-y-1.5">
                  {schema.pages.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePageId(p.id);
                        setEditingSectionId(null);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-md border text-sm font-semibold transition ${
                        p.id === activePageId
                          ? "bg-primary text-white border-primary"
                          : "border-stroke bg-transparent text-black hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                      }`}
                    >
                      <span>{p.title}</span>
                      <span className="text-xs opacity-60">{p.path}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const title = window.prompt("Nhập tên trang mới:");
                    if (title) {
                      const newId = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                      if (schema.pages.some((p: any) => p.id === newId)) {
                        alert("ID trang đã tồn tại!");
                        return;
                      }
                      const newPage = {
                        id: newId,
                        title,
                        path: `/${newId}`,
                        sections: [
                          { id: `header-${Date.now()}`, type: "header" as const, title: project.name },
                          { id: `hero-${Date.now()}`, type: "hero" as const, title: `Chào mừng tới ${title}` },
                          { id: `footer-${Date.now()}`, type: "footer" as const, title: `© 2026 ${project.name}` }
                        ]
                      };
                      updateSchema({
                        ...schema,
                        pages: [...schema.pages, newPage]
                      });
                      setActivePageId(newPage.id);
                      triggerToast("Đã thêm trang mới!");
                    }
                  }}
                  className="w-full py-2 border border-dashed border-stroke dark:border-strokedark text-sm font-semibold hover:border-primary hover:text-primary rounded-md text-center text-gray-500 block dark:text-white"
                >
                  + Thêm trang mới
                </button>

                {/* Outline các Sections của Trang hiện tại */}
                <div className="pt-4 border-t border-stroke dark:border-strokedark mt-4">
                  <p className="text-xs text-gray-400 font-bold mb-2.5 uppercase tracking-wider">Cấu trúc trang (Page Outline):</p>
                  <div className="space-y-1.5">
                    {currentPage.sections.map((sec: any, idx: number) => {
                      const isSelected = editingSectionId === sec.id;
                      return (
                        <div
                          key={sec.id}
                          onClick={() => setEditingSectionId(sec.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded border text-xs font-semibold cursor-pointer transition ${
                            isSelected
                              ? "bg-primary/5 text-primary border-primary"
                              : "border-stroke bg-transparent text-black hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="capitalize">{sec.type}</span>
                            <span className="text-[10px] opacity-60 font-mono mt-0.5">{sec.title || "Khối nội dung"}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">#{idx + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SEO Options */}
            {activeTab === "seo" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold text-black dark:text-white">TIÊU ĐỀ SEO (META TITLE)</label>
                  <input
                    type="text"
                    value={schema.seoTitle || ""}
                    onChange={e => updateSchema({ ...schema, seoTitle: e.target.value })}
                    className="w-full rounded border border-stroke bg-transparent py-2.5 px-4 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                    placeholder="Mặc định tiêu đề website"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-black dark:text-white">MÔ TẢ SEO (META DESCRIPTION)</label>
                  <textarea
                    rows={4}
                    value={schema.seoDescription || ""}
                    onChange={e => updateSchema({ ...schema, seoDescription: e.target.value })}
                    className="w-full rounded border border-stroke bg-transparent py-2.5 px-4 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                    placeholder="Nhập mô tả chuẩn SEO giúp tăng thứ hạng tìm kiếm"
                  />
                </div>
              </div>
            )}

            {/* Global Style Options */}
            {activeTab === "style" && (
              <div className="space-y-5">
                <div>
                  <label className="mb-2.5 block text-xs font-bold text-black dark:text-white">MÀU CHỦ ĐẠO (PRIMARY COLOR)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={schema.primaryColor || "#10B981"}
                      onChange={e => updateSchema({ ...schema, primaryColor: e.target.value })}
                      className="h-10 w-16 border-0 p-0 cursor-pointer rounded overflow-hidden"
                    />
                    <input
                      type="text"
                      value={schema.primaryColor || "#10B981"}
                      onChange={e => updateSchema({ ...schema, primaryColor: e.target.value })}
                      className="flex-1 rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-sm text-black dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2.5 block text-xs font-bold text-black dark:text-white">KIỂU CHỮ (FONT FAMILY)</label>
                  <select
                    value={schema.fontFamily || "Inter"}
                    onChange={e => updateSchema({ ...schema, fontFamily: e.target.value })}
                    className="w-full rounded border border-stroke bg-transparent py-2.5 px-3 outline-none focus:border-primary dark:border-strokedark text-sm text-black dark:text-white font-medium"
                  >
                    <option value="Inter">Inter (Khuyên dùng)</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Montserrat">Montserrat</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-black dark:text-white">CAMPAIGN MODE</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setProject(prev => prev ? { ...prev, type: "seo_landing_page" } : null)}
                      className={`flex-1 py-2 text-xs font-bold rounded border ${
                        project.type === "seo_landing_page"
                          ? "bg-primary/5 border-primary text-primary"
                          : "border-stroke text-gray-500 hover:border-black dark:border-strokedark"
                      }`}
                    >
                      SEO Mode
                    </button>
                    <button
                      onClick={() => setProject(prev => prev ? { ...prev, type: "ppc_landing_page" } : null)}
                      className={`flex-1 py-2 text-xs font-bold rounded border ${
                        project.type === "ppc_landing_page"
                          ? "bg-primary/5 border-primary text-primary"
                          : "border-stroke text-gray-500 hover:border-black dark:border-strokedark"
                      }`}
                    >
                      PPC Mode
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Central Design Canvas */}
        <main className="flex-1 overflow-y-auto p-8 flex justify-center bg-zinc-100 dark:bg-zinc-900/50">
          <div
            className={`bg-white shadow-2xl transition-all duration-300 overflow-hidden relative min-h-[700px] border border-stroke dark:border-strokedark flex flex-col ${
              viewMode === "desktop" ? "w-full max-w-[1100px]" : viewMode === "tablet" ? "w-[768px]" : "w-[375px]"
            }`}
            style={{ fontFamily: schema.fontFamily || "Inter" }}
          >
            {/* Inline Input editor popover */}
            {editingField && (
              <div className="sticky top-0 left-0 right-0 bg-primary/10 border-b border-primary/20 p-2.5 flex items-center justify-between z-40 bg-white/90 backdrop-blur">
                <div className="flex-1 mr-4">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={e => setEditingValue(e.target.value)}
                    className="w-full rounded border border-stroke px-3 py-1 text-sm outline-none focus:border-primary text-black"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === "Enter") saveInlineEdit();
                      if (e.key === "Escape") setEditingField(null);
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveInlineEdit}
                    className="bg-primary text-white text-xs font-semibold py-1.5 px-3 rounded shadow hover:bg-opacity-95"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="border border-stroke text-xs font-semibold py-1.5 px-3 rounded hover:bg-gray-50 text-black bg-white"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Schema Render (Canvas) */}
            {currentPage.sections.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
                <p className="text-sm">Trang này chưa có Section nào.</p>
                <button
                  onClick={() => setActiveTab("add-sections")}
                  className="mt-3 text-xs text-primary font-bold hover:underline"
                >
                  + Thêm section mới
                </button>
              </div>
            ) : (
              currentPage.sections.map((section: any, idx: number) => {
                const isSelected = editingSectionId === section.id;
                
                return (
                  <div
                    key={section.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSectionId(section.id);
                    }}
                    className={`relative group border-2 border-transparent hover:border-primary/50 cursor-pointer transition-all ${
                      isSelected ? "border-primary bg-primary/2" : ""
                    }`}
                  >
                    {/* Floating Controls */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 bg-white shadow-lg border border-stroke rounded-md p-1 z-20 transition dark:bg-boxdark dark:border-strokedark">
                      <button
                        onClick={() => moveSection(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-meta-4 rounded text-black dark:text-white disabled:opacity-30"
                        title="Di chuyển lên"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveSection(idx, "down")}
                        disabled={idx === currentPage.sections.length - 1}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-meta-4 rounded text-black dark:text-white disabled:opacity-30"
                        title="Di chuyển xuống"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => duplicateSection(idx)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-meta-4 rounded text-black dark:text-white"
                        title="Nhân bản"
                      >
                        ❐
                      </button>
                      <button
                        onClick={() => deleteSection(idx)}
                        className="p-1 hover:bg-rose-50 rounded text-rose-600 dark:hover:bg-rose-950/20"
                        title="Xóa"
                      >
                        ✕
                      </button>
                    </div>

                    {/* RENDER DYNAMIC SECTION */}
                    <SectionRenderer
                      section={section}
                      mode="edit"
                      activeSectionId={editingSectionId}
                      onFieldClick={startInlineEdit}
                      primaryColor={schema.primaryColor}
                    />
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* Right Props Editor Panel */}
        {editingSectionId && (() => {
          const selectedSection = currentPage.sections.find((s: any) => s.id === editingSectionId);
          if (!selectedSection) return null;

          const resolvedProps = {
            ...selectedSection,
            ...(selectedSection.props || {})
          } as any;

          const handlePropChange = (field: string, val: any) => {
            const newSections = currentPage.sections.map((sec: any) => {
              if (sec.id === editingSectionId) {
                return {
                  ...sec,
                  [field]: val,
                  props: {
                    ...(sec.props || {}),
                    [field]: val
                  }
                };
              }
              return sec;
            });
            const newPages = schema.pages.map((p: any) => 
              p.id === activePageId ? { ...p, sections: newSections } : p
            );
            updateSchema({ ...schema, pages: newPages });
          };

          return (
            <aside className="w-80 border-l border-stroke bg-white dark:border-strokedark dark:bg-boxdark flex flex-col z-20 shadow-sm overflow-y-auto">
              <div className="p-4 border-b border-stroke dark:border-strokedark flex items-center justify-between">
                <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">Cấu hình: {selectedSection.type}</h3>
                <button
                  onClick={() => setEditingSectionId(null)}
                  className="text-gray-400 hover:text-black dark:hover:text-white text-sm font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 space-y-4">
                {/* Text fields */}
                {resolvedProps.title !== undefined && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-500 uppercase">Tiêu đề (Title)</label>
                    <input
                      type="text"
                      value={resolvedProps.title}
                      onChange={e => handlePropChange("title", e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-sm text-black dark:text-white"
                    />
                  </div>
                )}
                {resolvedProps.subtitle !== undefined && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-500 uppercase">Phụ đề (Subtitle)</label>
                    <textarea
                      rows={3}
                      value={resolvedProps.subtitle}
                      onChange={e => handlePropChange("subtitle", e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-sm text-black dark:text-white"
                    />
                  </div>
                )}
                {resolvedProps.content !== undefined && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-500 uppercase">Nội dung (Content)</label>
                    <textarea
                      rows={4}
                      value={resolvedProps.content}
                      onChange={e => handlePropChange("content", e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-sm text-black dark:text-white"
                    />
                  </div>
                )}
                {resolvedProps.buttonText !== undefined && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-500 uppercase">Chữ trên nút (Button Text)</label>
                    <input
                      type="text"
                      value={resolvedProps.buttonText}
                      onChange={e => handlePropChange("buttonText", e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-sm text-black dark:text-white"
                    />
                  </div>
                )}
                {resolvedProps.buttonLink !== undefined && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-500 uppercase">Liên kết nút (Button Link)</label>
                    <input
                      type="text"
                      value={resolvedProps.buttonLink}
                      onChange={e => handlePropChange("buttonLink", e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-sm text-black dark:text-white"
                    />
                  </div>
                )}

                {/* Sub-items for FAQ, Features, Services, Testimonials */}
                {resolvedProps.items && Array.isArray(resolvedProps.items) && (
                  <div className="space-y-4 pt-3 border-t border-stroke dark:border-strokedark">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Danh sách các phần tử (Items):</label>
                    {resolvedProps.items.map((item: any, i: number) => {
                      const handleItemChange = (itemField: string, itemVal: string) => {
                        const newItems = resolvedProps.items.map((it: any, idx: number) => 
                          idx === i ? { ...it, [itemField]: itemVal } : it
                        );
                        handlePropChange("items", newItems);
                      };
                      return (
                        <div key={i} className="p-3 bg-gray-50 dark:bg-meta-4 rounded border border-stroke dark:border-strokedark space-y-2">
                          <span className="text-[10px] font-bold text-primary">Phần tử #{i + 1}</span>
                          {(item.title !== undefined || item.question !== undefined) && (
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 block mb-0.5">Tiêu đề / Câu hỏi</label>
                              <input
                                type="text"
                                value={item.title !== undefined ? item.title : item.question || ""}
                                onChange={e => handleItemChange(item.title !== undefined ? "title" : "question", e.target.value)}
                                className="w-full rounded border border-stroke bg-white dark:bg-boxdark py-1.5 px-2.5 outline-none text-xs text-black dark:text-white"
                              />
                            </div>
                          )}
                          {(item.description !== undefined || item.answer !== undefined) && (
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 block mb-0.5">Mô tả / Câu trả lời</label>
                              <textarea
                                rows={2}
                                value={item.description !== undefined ? item.description : item.answer || ""}
                                onChange={e => handleItemChange(item.description !== undefined ? "description" : "answer", e.target.value)}
                                className="w-full rounded border border-stroke bg-white dark:bg-boxdark py-1.5 px-2.5 outline-none text-xs text-black dark:text-white"
                              />
                            </div>
                          )}
                          {item.author !== undefined && (
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 block mb-0.5">Tác giả</label>
                              <input
                                type="text"
                                value={item.author}
                                onChange={e => handleItemChange("author", e.target.value)}
                                className="w-full rounded border border-stroke bg-white dark:bg-boxdark py-1.5 px-2.5 outline-none text-xs text-black dark:text-white"
                              />
                            </div>
                          )}
                          {item.role !== undefined && (
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 block mb-0.5">Chức danh</label>
                              <input
                                type="text"
                                value={item.role}
                                onChange={e => handleItemChange("role", e.target.value)}
                                className="w-full rounded border border-stroke bg-white dark:bg-boxdark py-1.5 px-2.5 outline-none text-xs text-black dark:text-white"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>
          );
        })()}
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-md bg-white p-6 shadow-lg dark:bg-boxdark border border-stroke dark:border-strokedark">
            <h3 className="text-lg font-bold text-black dark:text-white mb-4">Xuất bản trang web</h3>
            <form onSubmit={handlePublishSubmit}>
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-black dark:text-white">Đường dẫn slug cho website</label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-r-0 border-stroke py-2.5 px-3 rounded-l dark:bg-meta-4 dark:border-strokedark text-gray-500 text-sm">
                    /p/w/
                  </span>
                  <input
                    type="text"
                    placeholder="ten-mien-cua-ban"
                    value={publishSlug}
                    onChange={e => setPublishSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    className="w-full rounded-r border border-stroke bg-transparent py-2.5 px-4 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="rounded border border-stroke py-2 px-4 hover:bg-gray-50 dark:border-strokedark dark:text-white text-black"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded bg-emerald-600 py-2 px-4 text-white hover:bg-opacity-90"
                >
                  Xác nhận Xuất bản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {activeJobId && (
        <JobProgressModal
          jobId={activeJobId}
          onSuccess={async () => {
            setActiveJobId(null);
            triggerToast("Xuất bản trang web thành công!");
            try {
              const data = await getWebsiteProject(projectId);
              if (data) setProject(data);
            } catch (err) {
              console.error(err);
            }
          }}
          onClose={() => setActiveJobId(null)}
        />
      )}
    </div>
  );
}
