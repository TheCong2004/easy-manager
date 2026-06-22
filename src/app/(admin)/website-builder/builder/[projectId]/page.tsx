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
import { getWebsiteBuilderSession } from "@/lib/claw-api/website-builder";
import {
  getSectionIdFromNodeId,
  getNodeTypeFromId,
  resolveSelectedNode,
  updateNodeProps,
  getLayerTree
} from "@/components/website-builder/core/builder-node-adapter";
import LayersTree from "@/components/website-builder/shared/LayersTree";
import InspectorRenderer from "@/components/website-builder/shared/InspectorRenderer";
import InspectPanel from "@/components/website-builder/shared/InspectPanel";

const USE_MOCK_API = true;

interface BuilderPageProps {
  params: Promise<{ projectId: string }>;
}

export default function WebsiteBuilderCanvas({ params }: BuilderPageProps) {
  const router = useRouter();
  const { projectId } = use(params);

  const [project, setProject] = useState<WebsiteProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pages" | "layers" | "ai-chat" | "seo" | "style" | "add-sections">("add-sections");
  const [activePageId, setActivePageId] = useState("home");
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "failed">("saved");
  const isFirstLoad = useRef(true);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [past, setPast] = useState<WebsiteSchema[]>([]);
  const [future, setFuture] = useState<WebsiteSchema[]>([]);

  const updateSchemaMutation = useUpdateWebsiteSchema(projectId);
  
  // States for selected element to edit
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<"section" | "heading" | "text" | "button" | "image" | "card" | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSlug, setPublishSlug] = useState("");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const publishMutation = usePublishWebsiteProject(projectId);

  // States for secure iframe handoff
  const [builderUrl, setBuilderUrl] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const schema: WebsiteSchema = project?.schema_data || DEFAULT_SCHEMA;
  const currentPage = schema.pages.find((p) => p.id === activePageId) || schema.pages[0];

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

          // Fetch secure builder session URL
          try {
            if (USE_MOCK_API) {
              const mockUrl = `${window.location.origin}/p/w/preview-${projectId}`;
              setBuilderUrl(mockUrl);
            } else {
              const session = await getWebsiteBuilderSession(projectId);
              if (session?.builderUrl) {
                setBuilderUrl(session.builderUrl);
              } else {
                setSessionError("Không thể tạo phiên làm việc của Trình soạn thảo.");
              }
            }
          } catch (sessionErr: any) {
            console.error("Failed to load builder session:", sessionErr);
            setSessionError(sessionErr?.message || "Lỗi tạo phiên soạn thảo bảo mật.");
          } finally {
            setSessionLoading(false);
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

  // Listen for secure messages from builder iframe
  useEffect(() => {
    if (typeof window === "undefined" || !builderUrl) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        // Verify origin whitelist dynamically from builderUrl
        const allowedOrigin = new URL(builderUrl).origin;
        if (event.origin !== allowedOrigin) {
          console.warn("Rejected postMessage from unauthorized origin:", event.origin);
          return;
        }

        const data = event.data;
        if (data?.type === "select_section") {
          const sectionId = data.sectionId;
          setEditingSectionId(sectionId);
          setSelectedSectionId(sectionId);
          setSelectedNodeId(sectionId);
          setSelectedNodeType("section");
        }
        if (data?.type === "select_node") {
          const nodeId = data.nodeId;
          setSelectedNodeId(nodeId);
          if (nodeId) {
            const sectionId = getSectionIdFromNodeId(nodeId);
            setSelectedSectionId(sectionId);
            setEditingSectionId(sectionId);
            setSelectedNodeType(getNodeTypeFromId(nodeId));
          } else {
            setSelectedSectionId(null);
            setEditingSectionId(null);
            setSelectedNodeType(null);
          }
        }
        if (data?.type === "schema_update" && data?.schema) {
          updateSchema(data.schema);
        }
      } catch (err) {
        console.error("Error processing postMessage from iframe:", err);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [builderUrl]);

  // Sync local schema changes to visual iframe editor
  useEffect(() => {
    if (iframeRef.current && builderUrl) {
      try {
        const allowedOrigin = new URL(builderUrl).origin;
        iframeRef.current.contentWindow?.postMessage(
          { type: "sync_schema", schema },
          allowedOrigin
        );
      } catch (err) {
        console.error("Error syncing schema to iframe:", err);
      }
    }
  }, [schema, builderUrl]);

  // Sync selected section id to iframe
  useEffect(() => {
    if (iframeRef.current && builderUrl) {
      try {
        const allowedOrigin = new URL(builderUrl).origin;
        iframeRef.current.contentWindow?.postMessage(
          { type: "select_section", sectionId: editingSectionId },
          allowedOrigin
        );
      } catch (err) {
        console.error("Error syncing selected section to iframe:", err);
      }
    }
  }, [editingSectionId, builderUrl]);

  // Sync selected node id to iframe
  useEffect(() => {
    if (iframeRef.current && builderUrl) {
      try {
        const allowedOrigin = new URL(builderUrl).origin;
        iframeRef.current.contentWindow?.postMessage(
          { type: "select_node", nodeId: selectedNodeId },
          allowedOrigin
        );
      } catch (err) {
        console.error("Error syncing selected node to iframe:", err);
      }
    }
  }, [selectedNodeId, builderUrl]);

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

  const handleAiQuickAction = async (actionType: string) => {
    if (!selectedNodeId) return;
    setAiLoading(true);
    triggerToast("AI đang phân tích và cải thiện phần tử...");
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    try {
      const selectedNode = resolveSelectedNode(schema, selectedNodeId);
      if (!selectedNode) return;
      
      let patch: Record<string, any> = {};
      let successMsg = "Đã cập nhật thay đổi thành công!";
      
      switch (actionType) {
        case "heading_rewrite":
          patch.text = "EcoTech: Giải Pháp Xanh Kiến Tạo Tương Lai Vượt Trội";
          successMsg = "AI đã viết lại tiêu đề lôi cuốn hơn!";
          break;
        case "heading_shorten":
          patch.text = "Giải Pháp Xanh Cho Tương Lai";
          successMsg = "AI đã rút gọn tiêu đề súc tích hơn!";
          break;
        case "text_seo":
          patch.text = "EcoTech mang đến giải pháp công nghệ xanh đột phá, tối ưu hóa năng suất và giảm phát thải bền vững cho mọi doanh nghiệp toàn cầu.";
          successMsg = "AI đã tối ưu đoạn văn chuẩn SEO!";
          break;
        case "text_professional":
          patch.text = "Chúng tôi cam kết đồng hành cùng doanh nghiệp trong quá trình chuyển đổi số và phát triển bền vững thông qua công nghệ xanh hiện đại.";
          successMsg = "AI đã chuyển đổi giọng văn chuyên nghiệp!";
          break;
        case "button_cta":
          patch.text = "Bắt đầu hành trình xanh ngay";
          successMsg = "AI đã cải thiện chữ kêu gọi hành động!";
          break;
        case "button_color":
          patch.backgroundColor = "#10B981"; // Emerald green
          successMsg = "AI đã đổi màu nút sang xanh ngọc phong thủy!";
          break;
        case "section_color":
          patch.backgroundColor = "#F0FDF4"; // Light green bg
          successMsg = "AI đã phối lại màu nền section tươi mát!";
          break;
        case "card_content":
          patch.title = "Năng lượng sạch";
          patch.description = "Tận dụng tối đa nguồn năng lượng tái tạo tự nhiên.";
          successMsg = "AI đã tóm tắt thông tin thẻ danh sách!";
          break;
      }
      
      const newSchema = updateNodeProps(schema, selectedNodeId, patch);
      updateSchema(newSchema);
      triggerToast(successMsg, "success");
    } catch (err) {
      console.error(err);
      triggerToast("Lỗi khi gọi trợ lý AI", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendAiPrompt = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    
    // Simulate AI API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    try {
      const promptLower = aiPrompt.toLowerCase();
      let patch: Record<string, any> = {};
      let targetNodeId = selectedNodeId;
      
      if (!targetNodeId) {
        // Fallback to first section heading
        const pageNode = getLayerTree(schema).find(p => p.id === activePageId);
        const sections = pageNode?.children || [];
        if (sections.length > 0) {
          targetNodeId = `${sections[0].id}-heading`;
        }
      }
      
      if (targetNodeId) {
        const selectedNode = resolveSelectedNode(schema, targetNodeId);
        if (selectedNode) {
          if (promptLower.includes("tiêu đề") || promptLower.includes("chữ") || promptLower.includes("text") || promptLower.includes("viết")) {
            patch.text = "EcoTech - Giải Pháp Phát Triển Bền Vững";
          } else if (promptLower.includes("màu") || promptLower.includes("nền") || promptLower.includes("background")) {
            if (selectedNode.type === "button") {
              patch.backgroundColor = "#E0F2FE"; // Light blue
              patch.textColor = "#0369A1"; // Dark blue text
            } else {
              patch.backgroundColor = "#ECFDF5"; // Light emerald bg
            }
          } else {
            patch.text = "Cập nhật tự động bởi AI: " + aiPrompt.slice(0, 30) + "...";
          }
          
          const newSchema = updateNodeProps(schema, targetNodeId, patch);
          updateSchema(newSchema);
          triggerToast(`AI đã áp dụng thay đổi cho: ${selectedNode.label}`, "success");
        }
      } else {
        triggerToast("Không tìm thấy phần tử đích phù hợp cho AI", "error");
      }
      setAiPrompt("");
    } catch (err) {
      console.error(err);
      triggerToast("Lỗi xử lý prompt của AI", "error");
    } finally {
      setAiLoading(false);
    }
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
          <div className="grid grid-cols-6 border-b border-stroke dark:border-strokedark shrink-0">
            {[
              { id: "add-sections", label: "+Khối" },
              { id: "layers", label: "Lớp" },
              { id: "ai-chat", label: "AI" },
              { id: "pages", label: "Trang" },
              { id: "seo", label: "SEO" },
              { id: "style", label: "Style" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 text-center text-[10px] font-bold border-b-2 transition-all ${
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

            {/* Layers Tree */}
            {activeTab === "layers" && (
              <LayersTree
                schema={schema}
                activePageId={activePageId}
                selectedNodeId={selectedNodeId}
                onNodeSelect={(nodeId) => {
                  setSelectedNodeId(nodeId);
                  if (nodeId) {
                    const secId = getSectionIdFromNodeId(nodeId);
                    setSelectedSectionId(secId);
                    setEditingSectionId(secId);
                    setSelectedNodeType(getNodeTypeFromId(nodeId));
                  } else {
                    setSelectedSectionId(null);
                    setEditingSectionId(null);
                    setSelectedNodeType(null);
                  }
                }}
              />
            )}

            {/* AI Chat Tab */}
            {activeTab === "ai-chat" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-lg">
                  <span className="text-xl shrink-0">🤖</span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 leading-tight">Trợ lý AI Builder</h4>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5">Nhập yêu cầu để AI chỉnh sửa trực tiếp trên canvas.</p>
                  </div>
                </div>

                {/* Selected Context */}
                <div className="p-3 bg-gray-50 dark:bg-meta-4/30 rounded-lg border border-gray-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Bối cảnh chỉnh sửa</span>
                  {selectedNodeId ? (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-black dark:text-white truncate">
                          🎯 {resolveSelectedNode(schema, selectedNodeId)?.label}
                        </span>
                        <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                          {selectedNodeType}
                        </span>
                      </div>
                      <p className="text-[9px] text-gray-400 truncate">
                        ID: <span className="font-mono">{selectedNodeId}</span>
                      </p>

                      {/* Quick AI Suggestions based on type */}
                      <div className="space-y-1.5 pt-2 border-t border-gray-200 dark:border-zinc-800">
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">Gợi ý hành động AI:</span>
                        {selectedNodeType === "heading" && (
                          <>
                            <button
                              onClick={() => handleAiQuickAction("heading_rewrite")}
                              className="w-full text-left text-[11px] bg-white dark:bg-boxdark hover:bg-gray-50 dark:hover:bg-meta-4 p-2 rounded border border-stroke dark:border-strokedark transition flex items-center gap-1.5 text-black dark:text-white font-medium"
                            >
                              ✨ Viết lại tiêu đề thu hút hơn
                            </button>
                            <button
                              onClick={() => handleAiQuickAction("heading_shorten")}
                              className="w-full text-left text-[11px] bg-white dark:bg-boxdark hover:bg-gray-50 dark:hover:bg-meta-4 p-2 rounded border border-stroke dark:border-strokedark transition flex items-center gap-1.5 text-black dark:text-white font-medium"
                            >
                              ✍ Ngắn gọn & Súc tích hơn
                            </button>
                          </>
                        )}
                        {selectedNodeType === "text" && (
                          <>
                            <button
                              onClick={() => handleAiQuickAction("text_seo")}
                              className="w-full text-left text-[11px] bg-white dark:bg-boxdark hover:bg-gray-50 dark:hover:bg-meta-4 p-2 rounded border border-stroke dark:border-strokedark transition flex items-center gap-1.5 text-black dark:text-white font-medium"
                            >
                              📈 Viết lại tối ưu SEO
                            </button>
                            <button
                              onClick={() => handleAiQuickAction("text_professional")}
                              className="w-full text-left text-[11px] bg-white dark:bg-boxdark hover:bg-gray-50 dark:hover:bg-meta-4 p-2 rounded border border-stroke dark:border-strokedark transition flex items-center gap-1.5 text-black dark:text-white font-medium"
                            >
                              💼 Giọng văn chuyên nghiệp hơn
                            </button>
                          </>
                        )}
                        {selectedNodeType === "button" && (
                          <>
                            <button
                              onClick={() => handleAiQuickAction("button_cta")}
                              className="w-full text-left text-[11px] bg-white dark:bg-boxdark hover:bg-gray-50 dark:hover:bg-meta-4 p-2 rounded border border-stroke dark:border-strokedark transition flex items-center gap-1.5 text-black dark:text-white font-medium"
                            >
                              🔥 Chữ CTA kích thích nhấp chuột
                            </button>
                            <button
                              onClick={() => handleAiQuickAction("button_color")}
                              className="w-full text-left text-[11px] bg-white dark:bg-boxdark hover:bg-gray-50 dark:hover:bg-meta-4 p-2 rounded border border-stroke dark:border-strokedark transition flex items-center gap-1.5 text-black dark:text-white font-medium"
                            >
                              🎨 Đổi màu nút hợp phong thủy
                            </button>
                          </>
                        )}
                        {selectedNodeType === "section" && (
                          <>
                            <button
                              onClick={() => handleAiQuickAction("section_color")}
                              className="w-full text-left text-[11px] bg-white dark:bg-boxdark hover:bg-gray-50 dark:hover:bg-meta-4 p-2 rounded border border-stroke dark:border-strokedark transition flex items-center gap-1.5 text-black dark:text-white font-medium"
                            >
                              🌈 Phối màu nền section chuyên nghiệp
                            </button>
                          </>
                        )}
                        {selectedNodeType === "card" && (
                          <>
                            <button
                              onClick={() => handleAiQuickAction("card_content")}
                              className="w-full text-left text-[11px] bg-white dark:bg-boxdark hover:bg-gray-50 dark:hover:bg-meta-4 p-2 rounded border border-stroke dark:border-strokedark transition flex items-center gap-1.5 text-black dark:text-white font-medium"
                            >
                              📝 Viết lại nội dung thẻ ngắn gọn
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded p-2 leading-relaxed">
                      💡 Hãy chọn một khối hoặc phần tử (tiêu đề, nút, ảnh, thẻ...) trên canvas/cây lớp để bắt đầu.
                    </div>
                  )}
                </div>

                {/* Prompt Chat Box */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Nhập yêu cầu sửa đổi</label>
                  <textarea
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={aiLoading}
                    className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-2.5 px-3 outline-none focus:border-primary text-xs text-black dark:text-white"
                    placeholder={selectedNodeId ? "Ví dụ: hãy viết lại tiêu đề này cho thật lôi cuốn, hướng tới khách hàng công nghệ..." : "Ví dụ: hãy sửa tiêu đề của khối Hero thành EcoTech Solution..."}
                  />
                  <button
                    onClick={handleSendAiPrompt}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="w-full py-2 bg-primary hover:bg-opacity-95 text-white font-semibold text-xs rounded-md shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
                        AI đang xử lý...
                      </>
                    ) : (
                      <>
                        <span>🚀 Gửi yêu cầu sửa</span>
                      </>
                    )}
                  </button>
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
                        setSelectedNodeId(null);
                        setSelectedNodeType(null);
                        setSelectedSectionId(null);
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
                      const isSelected = selectedNodeId === sec.id || editingSectionId === sec.id;
                      return (
                        <div
                          key={sec.id}
                          onClick={() => {
                            setEditingSectionId(sec.id);
                            setSelectedSectionId(sec.id);
                            setSelectedNodeId(sec.id);
                            setSelectedNodeType("section");
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded border text-xs font-semibold cursor-pointer transition ${
                            isSelected
                              ? "bg-primary/5 text-primary border-primary font-bold"
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
        <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center gap-6 bg-zinc-100 dark:bg-zinc-900/50">
          <div
            className={`bg-white shadow-2xl transition-all duration-300 overflow-hidden relative min-h-[500px] border border-stroke dark:border-strokedark flex flex-col shrink-0 ${
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

            {/* Dynamic Schema Render (Decoupled Visual Canvas Iframe) */}
            {sessionLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent mb-3"></div>
                <p className="text-gray-500 text-sm">Đang bảo mật và khởi tạo phiên soạn thảo...</p>
              </div>
            ) : sessionError ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-rose-50/10">
                <span className="text-4xl text-rose-500 mb-3">⚠</span>
                <h4 className="text-sm font-bold text-black dark:text-white mb-2">Lỗi kết nối phiên làm việc</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-4">{sessionError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded bg-primary py-1.5 px-4 text-xs font-semibold text-white hover:bg-opacity-95"
                >
                  Tải lại trang
                </button>
              </div>
            ) : builderUrl ? (
              <iframe
                ref={iframeRef}
                src={builderUrl}
                className="w-full flex-1 border-0 min-h-[500px]"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-forms"
                title="Website Builder Editor Canvas"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
                <p className="text-sm">Không tìm thấy địa chỉ phiên soạn thảo.</p>
              </div>
            )}
          </div>

          {/* Inspect Panel */}
          <InspectPanel
            projectId={projectId}
            schema={schema}
            selectedSectionId={selectedSectionId}
            onUpdateSchema={(newSchema) => {
              updateSchema(newSchema);
            }}
            onClose={() => {
              setSelectedSectionId(null);
              setSelectedNodeId(null);
              setSelectedNodeType(null);
              setEditingSectionId(null);
            }}
          />
        </main>

        {/* Right Props Editor Panel */}
        {(selectedNodeId || editingSectionId) && (() => {
          const activeNodeId = selectedNodeId || editingSectionId;
          if (!activeNodeId) return null;

          const handlePropChange = (field: string, val: any) => {
            const newSchema = updateNodeProps(schema, activeNodeId, { [field]: val });
            updateSchema(newSchema);
          };

          return (
            <InspectorRenderer
              schema={schema}
              selectedNodeId={activeNodeId}
              onChangeProps={handlePropChange}
              onClose={() => {
                setSelectedNodeId(null);
                setEditingSectionId(null);
                setSelectedNodeType(null);
                setSelectedSectionId(null);
              }}
            />
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
