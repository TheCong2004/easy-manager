"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  listWebsiteProjects,
  createWebsiteProject,
  deleteWebsiteProject,
  publishWebsite,
  unpublishWebsite,
  triggerJobSimulation,
  DEFAULT_SCHEMA
} from "@/components/website-builder/core/website-db-storage";
import { JobProgressModal } from "@/components/website-builder/shared/job-progress";

// Import API Client & Hooks dùng cho API thật
import {
  useWebsiteProjects,
  useCreateWebsiteProject,
  useDeleteWebsiteProject,
  usePublishWebsiteProject,
  useCreateAiWebsite,
  useCreateCloneWebsite,
  useCreateImportWebsite,
  useCreatePpcLandingPage
} from "@/hooks/use-website-builder";
import type { WebsiteProject, CreateAiWebsitePayload, CreateCloneWebsitePayload, CreateImportWebsitePayload, CreatePpcLandingPagePayload } from "@/types/website-builder";
import { getWebsiteJob } from "@/lib/claw-api/website-builder";
import { PPC_MOCK_DATA } from "@/components/website-builder/core/ppc-mock-data";

export default function WebsiteBuilderDashboard() {
  const router = useRouter();

  // Flag switch API - Đặt true để dùng LocalStorage/Supabase client fallback, false để gọi NestJS API thật
  // TODO: Đổi thành false khi backend NestJS API thật sẵn sàng
  const USE_MOCK_API = true;

  // Local state dùng cho Mock API
  const [mockProjects, setMockProjects] = useState<WebsiteProject[]>([]);
  const [mockLoading, setMockLoading] = useState(true);

  // States lọc và sắp xếp
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("updatedAt"); // "updatedAt", "createdAt", "name"

  // Modals
  const [showAiModal, setShowAiModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<WebsiteProject | null>(null);

  // Form inputs
  const [aiWebsiteName, setAiWebsiteName] = useState("");
  const [aiBusinessName, setAiBusinessName] = useState("");
  const [aiIndustry, setAiIndustry] = useState("");
  const [aiLocation, setAiLocation] = useState("");
  const [aiGoal, setAiGoal] = useState("generate_leads");
  const [aiAudience, setAiAudience] = useState("");
  const [aiStyle, setAiStyle] = useState("modern");
  const [aiSelectedPages, setAiSelectedPages] = useState<string[]>(["Home", "About", "Services", "Contact"]);
  const [aiPrompt, setAiPrompt] = useState("");
  
  // Clone URL Form inputs
  const [cloneProjectName, setCloneProjectName] = useState("");
  const [cloneUrl, setCloneUrl] = useState("");
  const [cloneMode, setCloneMode] = useState<"visual_clone" | "seo_landing_page">("visual_clone");
  const [cloneKeyword, setCloneKeyword] = useState("");
  const [cloneLocation, setCloneLocation] = useState("");

  // ZIP/HTML Import Form inputs
  const [importProjectName, setImportProjectName] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importNote, setImportNote] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // PPC Form inputs
  const [showPpcModal, setShowPpcModal] = useState(false);
  const [ppcProjectName, setPpcProjectName] = useState("");
  const [ppcSource, setPpcSource] = useState("manual"); // "google_ads" | "facebook_ads" | "tiktok_ads" | "manual"
  const [ppcAccountId, setPpcAccountId] = useState("");
  const [ppcCampaignId, setPpcCampaignId] = useState("");
  const [ppcKeyword, setPpcKeyword] = useState("");
  const [ppcGoal, setPpcGoal] = useState("generate_leads");
  const [ppcOffer, setPpcOffer] = useState("");
  const [ppcCta, setPpcCta] = useState("");

  const [projectType, setProjectType] = useState<"seo_landing_page" | "ppc_landing_page">("seo_landing_page");
  const [publishSlug, setPublishSlug] = useState("");

  // Job Progress states
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const resetAiForm = () => {
    setAiWebsiteName("");
    setAiBusinessName("");
    setAiIndustry("");
    setAiLocation("");
    setAiGoal("generate_leads");
    setAiAudience("");
    setAiStyle("modern");
    setAiSelectedPages(["Home", "About", "Services", "Contact"]);
    setAiPrompt("");
  };

  const togglePage = (page: string) => {
    setAiSelectedPages(prev =>
      prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page]
    );
  };

  const resetCloneForm = () => {
    setCloneProjectName("");
    setCloneUrl("");
    setCloneMode("visual_clone");
    setCloneKeyword("");
    setCloneLocation("");
  };

  const resetImportForm = () => {
    setImportProjectName("");
    setImportFile(null);
    setImportNote("");
    setDragActive(false);
  };

  const resetPpcForm = () => {
    setPpcProjectName("");
    setPpcSource("manual");
    setPpcAccountId("");
    setPpcCampaignId("");
    setPpcKeyword("");
    setPpcGoal("generate_leads");
    setPpcOffer("");
    setPpcCta("");
  };

  const handleUploadFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== "html" && ext !== "zip") {
      triggerToast("Only .html and .zip files are supported", "error");
      return;
    }
    const maxSizeBytes = 50 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      triggerToast("File must be 50MB or smaller", "error");
      return;
    }
    setImportFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // -------------------------------------------------------------
  // REAL API QUERY & MUTATION HOOKS (Dùng khi USE_MOCK_API = false)
  // -------------------------------------------------------------
  const { 
    data: queryProjects, 
    isLoading: queryLoading, 
    error: queryError, 
    refetch: refetchQueryProjects 
  } = useWebsiteProjects({
    search: searchQuery || undefined,
    type: typeFilter !== "ALL" ? typeFilter : undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined
  });

  const createProjectMutation = useCreateWebsiteProject();
  const deleteProjectMutation = useDeleteWebsiteProject();
  const publishProjectMutation = usePublishWebsiteProject(selectedProject?.id || "");
  const createAiMutation = useCreateAiWebsite();
  const createCloneMutation = useCreateCloneWebsite();
  const createImportMutation = useCreateImportWebsite();
  const createPpcMutation = useCreatePpcLandingPage();

  // Load Mock Projects
  const loadMockProjects = useCallback(async () => {
    try {
      const data = await listWebsiteProjects();
      setMockProjects(data);
    } catch (err) {
      console.error("Failed to load local projects:", err);
    } finally {
      setMockLoading(false);
    }
  }, []);

  useEffect(() => {
    if (USE_MOCK_API) {
      loadMockProjects();
    }
  }, [USE_MOCK_API, loadMockProjects]);

  // Polling for running jobs (Giả lập hoặc chạy thật)
  useEffect(() => {
    const activeProjects = USE_MOCK_API ? mockProjects : (queryProjects || []);
    const hasRunningJobs = activeProjects.some(
      (p: any) => p.job_status === "pending" || p.job_status === "processing" || p.status === "generating"
    );

    if (hasRunningJobs) {
      const timer = setInterval(() => {
        if (USE_MOCK_API) {
          loadMockProjects();
        } else {
          refetchQueryProjects();
        }
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [mockProjects, queryProjects, USE_MOCK_API, loadMockProjects, refetchQueryProjects]);

  // -------------------------------------------------------------
  // ACTIONS HANDLERS (Chuyển đổi giữa MOCK và REAL API)
  // -------------------------------------------------------------
  
  // 1. Tạo web trống (Scratch)
  const handleCreateScratch = async () => {
    if (USE_MOCK_API) {
      try {
        const project = await createWebsiteProject({
          name: `Website Project ${mockProjects.length + 1}`,
          type: "seo_landing_page",
          status: "draft",
          source_type: "scratch",
          job_status: "completed",
          job_progress: 100
        });
        triggerToast("Tạo dự án trống thành công!");
        loadMockProjects();
        router.push(`/website-builder/builder/${project.id}`);
      } catch (err) {
        triggerToast("Lỗi khi tạo dự án trống", "error");
      }
    } else {
      createProjectMutation.mutate({
        name: `Website Project ${((queryProjects as any)?.length || 0) + 1}`,
        type: "seo_landing_page",
        status: "draft"
      }, {
        onSuccess: (data: any) => {
          triggerToast("Tạo dự án trống thành công!");
          router.push(`/website-builder/builder/${data.id}`);
        },
        onError: () => triggerToast("Lỗi khi tạo dự án trống", "error")
      });
    }
  };

  // 2. Tạo bằng AI Prompt
  const handleCreateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation
    if (!aiWebsiteName.trim()) {
      triggerToast("Vui lòng điền tên Website", "error");
      return;
    }
    if (!aiBusinessName.trim()) {
      triggerToast("Vui lòng điền tên thương hiệu / doanh nghiệp", "error");
      return;
    }
    if (!aiIndustry.trim()) {
      triggerToast("Vui lòng điền lĩnh vực hoạt động", "error");
      return;
    }
    if (aiSelectedPages.length === 0) {
      triggerToast("Vui lòng chọn ít nhất 1 trang", "error");
      return;
    }
    if (!aiPrompt.trim()) {
      triggerToast("Vui lòng mô tả yêu cầu / ý tưởng cho website", "error");
      return;
    }

    if (USE_MOCK_API) {
      try {
        const pagesData = aiSelectedPages.map(pageName => ({
          id: pageName.toLowerCase(),
          title: pageName,
          slug: pageName === "Home" ? "" : pageName.toLowerCase(),
          path: pageName === "Home" ? "/" : `/${pageName.toLowerCase()}`,
          sections: []
        }));

        const project = await createWebsiteProject({
          name: aiWebsiteName,
          type: projectType,
          status: "generating",
          source_type: "ai_prompt",
          source_value: aiPrompt,
          job_status: "pending",
          job_progress: 0,
          schema_data: {
            pages: pagesData,
            primaryColor: "#10B981",
            fontFamily: "Inter"
          }
        });

        setShowAiModal(false);
        setActiveJobId(project.id);
        loadMockProjects();

        // Giả lập tiến trình chạy ngầm
        triggerJobSimulation(
          project.id,
          "ai_prompt",
          aiPrompt,
          undefined,
          {
            websiteName: aiWebsiteName,
            businessName: aiBusinessName,
            industry: aiIndustry,
            location: aiLocation || undefined,
            goal: aiGoal,
            style: aiStyle,
            pages: aiSelectedPages
          }
        );
      } catch (err) {
        triggerToast("Lỗi khi gửi yêu cầu tạo AI", "error");
      }
    } else {
      const payload: CreateAiWebsitePayload = {
        prompt: aiPrompt,
        type: projectType,
        websiteName: aiWebsiteName,
        businessName: aiBusinessName,
        industry: aiIndustry,
        location: aiLocation || undefined,
        goal: aiGoal,
        targetAudience: aiAudience || undefined,
        style: aiStyle,
        pages: aiSelectedPages
      };

      createAiMutation.mutate(payload, {
        onSuccess: (data: any) => {
          setShowAiModal(false);
          
          const jobId = data?.jobId;
          const project = data?.project;
          const projectId = project?.id || data?.projectId;

          if (jobId) {
            setActiveJobId(jobId);
          } else if (projectId) {
            triggerToast("Tạo website thành công!");
            router.push(`/website-builder/builder/${projectId}`);
            resetAiForm();
          } else {
            triggerToast("Dự án đang được đưa vào hàng đợi xử lý.");
            resetAiForm();
          }
        },
        onError: (err: any) => {
          triggerToast(err?.message || "Lỗi khi kết nối với AI Generator backend", "error");
        }
      });
    }
  };

  // 3. Clone URL
  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation
    if (!cloneProjectName.trim()) {
      triggerToast("Vui lòng nhập tên dự án website", "error");
      return;
    }
    if (!cloneUrl.trim()) {
      triggerToast("Vui lòng nhập URL trang web nguồn", "error");
      return;
    }

    // 2. URL Normalization
    let normalizedUrl = cloneUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // 3. Validate URL regex
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (!urlPattern.test(normalizedUrl)) {
      triggerToast("Đường dẫn URL trang web không hợp lệ", "error");
      return;
    }

    if (USE_MOCK_API) {
      try {
        const project = await createWebsiteProject({
          name: cloneProjectName,
          type: projectType,
          status: "generating",
          source_type: "clone_url",
          source_value: normalizedUrl,
          job_status: "pending",
          job_progress: 0
        });

        setShowCloneModal(false);
        setActiveJobId(project.id);
        loadMockProjects();

        // Giả lập tiến trình nhân bản
        triggerJobSimulation(project.id, "clone_url", normalizedUrl);
      } catch (err) {
        triggerToast("Lỗi khi nhân bản website", "error");
      }
    } else {
      const payload: CreateCloneWebsitePayload = {
        projectName: cloneProjectName,
        sourceUrl: normalizedUrl,
        cloneMode: cloneMode,
        targetKeyword: cloneMode === "seo_landing_page" ? cloneKeyword : undefined,
        location: cloneLocation || undefined,
        type: projectType
      };

      createCloneMutation.mutate(payload, {
        onSuccess: (data: any) => {
          setShowCloneModal(false);
          
          const jobId = data?.jobId;
          const project = data?.project;
          const projectId = project?.id || data?.projectId;

          if (jobId) {
            setActiveJobId(jobId);
          } else if (projectId) {
            triggerToast("Nhân bản website thành công!");
            router.push(`/website-builder/builder/${projectId}`);
            resetCloneForm();
          } else {
            triggerToast("Đã gửi yêu cầu nhân bản lên hệ thống.");
            resetCloneForm();
          }
        },
        onError: (err: any) => {
          triggerToast(err?.message || "Lỗi khi kết nối với máy chủ clone", "error");
        }
      });
    }
  };

  // 4. Import ZIP/HTML
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation
    if (!importProjectName.trim()) {
      triggerToast("Vui lòng nhập tên dự án", "error");
      return;
    }
    if (!importFile) {
      triggerToast("Vui lòng tải lên tệp tin HTML hoặc ZIP", "error");
      return;
    }

    // 2. Validate Extension (.html, .zip)
    const fileExt = importFile.name.split('.').pop()?.toLowerCase();
    if (fileExt !== "html" && fileExt !== "zip") {
      triggerToast("Only .html and .zip files are supported", "error");
      return;
    }

    // 3. Validate Size (Max 50MB)
    const maxSizeBytes = 50 * 1024 * 1024;
    if (importFile.size > maxSizeBytes) {
      triggerToast("File must be 50MB or smaller", "error");
      return;
    }

    if (USE_MOCK_API) {
      try {
        const project = await createWebsiteProject({
          name: importProjectName,
          type: projectType,
          status: "generating",
          source_type: "import_zip",
          source_value: importFile.name,
          job_status: "pending",
          job_progress: 0
        });

        setShowImportModal(false);
        setActiveJobId(project.id);
        loadMockProjects();

        // Giả lập tiến trình Import ZIP
        triggerJobSimulation(project.id, "import_zip", importFile.name);
      } catch (err) {
        triggerToast("Upload failed", "error");
      }
    } else {
      const payload: CreateImportWebsitePayload = {
        projectName: importProjectName,
        file: importFile,
        fileName: importFile.name,
        note: importNote || undefined,
        type: projectType
      };

      createImportMutation.mutate(payload, {
        onSuccess: (data: any) => {
          setShowImportModal(false);
          
          const jobId = data?.jobId;
          const project = data?.project;
          const projectId = project?.id || data?.projectId;

          if (jobId) {
            setActiveJobId(jobId);
          } else if (projectId) {
            triggerToast("Nhập dữ liệu HTML/ZIP thành công!");
            router.push(`/website-builder/builder/${projectId}`);
            resetImportForm();
          } else {
            triggerToast("Đã tải tệp tin lên server thành công.");
            resetImportForm();
          }
        },
        onError: (err: any) => {
          triggerToast(err?.message || "Upload failed", "error");
        }
      });
    }
  };

  // 4.5. Tạo PPC Landing Page
  const handleCreatePpc = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate required fields
    if (!ppcProjectName.trim()) {
      triggerToast("Vui lòng nhập tên dự án Website PPC", "error");
      return;
    }

    const isManual = ppcSource === "manual";
    if (isManual || !ppcAccountId || !ppcCampaignId) {
      if (!ppcKeyword.trim()) {
        triggerToast("Vui lòng nhập từ khóa mục tiêu (Target Keyword)", "error");
        return;
      }
      if (!ppcGoal.trim()) {
        triggerToast("Vui lòng chọn mục tiêu trang Landing Page", "error");
        return;
      }
      if (!ppcOffer.trim()) {
        triggerToast("Vui lòng nhập chương trình ưu đãi (Offer)", "error");
        return;
      }
      if (!ppcCta.trim()) {
        triggerToast("Vui lòng nhập kêu gọi hành động (CTA)", "error");
        return;
      }
    }

    if (USE_MOCK_API) {
      try {
        const project = await createWebsiteProject({
          name: ppcProjectName,
          type: "ppc_landing_page",
          status: "generating",
          source_type: "scratch",
          source_value: ppcKeyword || "PPC Manual",
          job_status: "pending",
          job_progress: 0
        });

        setShowPpcModal(false);
        setActiveJobId(project.id);
        loadMockProjects();

        // Sử dụng triggerJobSimulation với metadata để tạo sections chuẩn PPC
        triggerJobSimulation(
          project.id,
          "ai_prompt",
          `Tạo trang PPC cho từ khóa ${ppcKeyword}. Ưu đãi: ${ppcOffer}. CTA: ${ppcCta}`,
          undefined,
          {
            websiteName: ppcProjectName,
            businessName: ppcProjectName,
            industry: ppcKeyword || "PPC Marketing",
            location: undefined,
            goal: ppcGoal,
            style: "bold", // Phễu PPC dùng style Bold nổi bật
            pages: ["Home"] // PPC thường là đơn trang (chỉ có Home)
          }
        );
      } catch (err) {
        triggerToast("Lỗi khi tạo trang PPC", "error");
      }
    } else {
      const payload: CreatePpcLandingPagePayload = {
        projectName: ppcProjectName,
        campaignSource: ppcSource,
        platformId: ppcSource !== "manual" ? "ad-platform" : undefined,
        accountId: ppcSource !== "manual" ? ppcAccountId || undefined : undefined,
        campaignId: ppcSource !== "manual" ? ppcCampaignId || undefined : undefined,
        targetKeyword: ppcKeyword || undefined,
        landingPageGoal: ppcGoal || undefined,
        offer: ppcOffer || undefined,
        cta: ppcCta || undefined,
        type: "ppc_landing_page"
      };

      createPpcMutation.mutate(payload, {
        onSuccess: (data: any) => {
          setShowPpcModal(false);

          const jobId = data?.jobId;
          const project = data?.project;
          const projectId = project?.id || data?.projectId;

          if (jobId) {
            setActiveJobId(jobId);
          } else if (projectId) {
            triggerToast("Tạo trang PPC Landing Page thành công!");
            router.push(`/website-builder/builder/${projectId}`);
            resetPpcForm();
          } else {
            triggerToast("Yêu cầu tạo phễu PPC đã được gửi.");
            resetPpcForm();
          }
        },
        onError: (err: any) => {
          triggerToast(err?.message || "Lỗi khi kết nối với AI Generator backend", "error");
        }
      });
    }
  };

  // 5. Xóa Website
  const handleDeleteClick = (project: WebsiteProject) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProject) return;

    if (USE_MOCK_API) {
      try {
        await deleteWebsiteProject(selectedProject.id);
        triggerToast("Đã xóa dự án thành công!");
        setShowDeleteModal(false);
        setSelectedProject(null);
        loadMockProjects();
      } catch (err) {
        triggerToast("Lỗi khi xóa dự án", "error");
      }
    } else {
      deleteProjectMutation.mutate(selectedProject.id, {
        onSuccess: () => {
          triggerToast("Xóa dự án thành công!");
          setShowDeleteModal(false);
          setSelectedProject(null);
        },
        onError: () => triggerToast("Lỗi khi xóa dự án trên server", "error")
      });
    }
  };

  // 6. Xuất bản Website
  const handlePublishClick = (project: WebsiteProject) => {
    setSelectedProject(project);
    setPublishSlug(project.slug || project.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || `site-${project.id.substring(0, 6)}`);
    setShowPublishModal(true);
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !publishSlug.trim()) return;

    if (USE_MOCK_API) {
      try {
        await publishWebsite(selectedProject.id, publishSlug);
        triggerToast("Xuất bản website thành công!");
        setShowPublishModal(false);
        setSelectedProject(null);
        loadMockProjects();
      } catch (err) {
        triggerToast("Slug đã tồn tại hoặc không hợp lệ", "error");
      }
    } else {
      publishProjectMutation.mutate(undefined, {
        onSuccess: () => {
          triggerToast("Xuất bản website thành công!");
          setShowPublishModal(false);
          setSelectedProject(null);
        },
        onError: () => triggerToast("Không thể xuất bản. Vui lòng kiểm tra lại slug tên miền.", "error")
      });
    }
  };

  const handleUnpublish = async (project: WebsiteProject) => {
    if (USE_MOCK_API) {
      try {
        await unpublishWebsite(project.id);
        triggerToast("Đã hủy xuất bản website thành công!");
        loadMockProjects();
      } catch (err) {
        triggerToast("Lỗi khi hủy xuất bản", "error");
      }
    } else {
      // Mock unpublish bằng cách gọi API update schema/project status
      triggerToast("Chức năng đang chờ API thật kết nối", "error");
    }
  };

  // -------------------------------------------------------------
  // LỌC & SẮP XẾP DỮ LIỆU PHÍA CLIENT
  // -------------------------------------------------------------
  const activeProjects = USE_MOCK_API ? mockProjects : (queryProjects || []);
  const isLoadingState = USE_MOCK_API ? mockLoading : queryLoading;
  const isErrorState = !USE_MOCK_API && !!queryError;

  const filteredProjects = activeProjects.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.slug && p.slug.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.domain && p.domain.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Type Filter
    let matchesType = true;
    if (typeFilter !== "ALL") {
      if (typeFilter === "ai_generated") matchesType = p.source_type === "ai_prompt" || p.type === "ai_generated";
      else if (typeFilter === "clone") matchesType = p.source_type === "clone_url" || p.type === "clone";
      else if (typeFilter === "import") matchesType = p.source_type === "import_zip" || p.type === "import";
      else matchesType = p.type === typeFilter;
    }

    // Status Filter
    let matchesStatus = true;
    if (statusFilter !== "ALL") {
      if (statusFilter === "DRAFT") matchesStatus = p.status === "draft" || p.status === "editing";
      else if (statusFilter === "PUBLISHED") matchesStatus = p.status === "published" || p.status === "ready";
      else if (statusFilter === "GENERATING") matchesStatus = p.status === "generating" || p.job_status === "processing" || p.job_status === "pending";
      else if (statusFilter === "FAILED") matchesStatus = p.status === "failed" || p.job_status === "failed";
      else matchesStatus = p.status.toLowerCase() === statusFilter.toLowerCase();
    }

    return matchesSearch && matchesType && matchesStatus;
  }).sort((a: any, b: any) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "createdAt") {
      const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
      const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
      return dateB - dateA;
    }
    // Mặc định: updatedAt
    const dateA = new Date(a.updated_at || a.updatedAt || 0).getTime();
    const dateB = new Date(b.updated_at || b.updatedAt || 0).getTime();
    return dateB - dateA;
  });

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 2xl:p-10">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg border text-white ${
          toast.type === "success" ? "bg-emerald-600 border-emerald-500" : "bg-rose-600 border-rose-500"
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white sm:text-3xl">
            Website Builder
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            Create AI websites, landing pages, clone pages, and import HTML projects.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center justify-center rounded-md bg-primary py-2.5 px-4 text-center font-medium text-white hover:bg-opacity-90"
          >
            Create with AI
          </button>
          <button
            onClick={() => setShowPpcModal(true)}
            className="inline-flex items-center justify-center rounded-md bg-white border border-stroke py-2.5 px-4 text-center font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-90"
          >
            PPC Landing Page
          </button>
          <button
            onClick={() => setShowCloneModal(true)}
            className="inline-flex items-center justify-center rounded-md bg-white border border-stroke py-2.5 px-4 text-center font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-90"
          >
            Clone URL
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center justify-center rounded-md bg-white border border-stroke py-2.5 px-4 text-center font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-90"
          >
            Import HTML/ZIP
          </button>
          <button
            onClick={handleCreateScratch}
            className="inline-flex items-center justify-center rounded-md bg-white border border-stroke py-2.5 px-3 text-center font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-90 text-sm"
            title="Tạo trang trống"
          >
            Create Empty
          </button>
        </div>
      </div>

      {/* Control Panel: Filters & Sorting */}
      <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search projects by name, domain, slug..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-stroke bg-transparent py-2 pl-4 pr-10 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 text-black dark:text-white text-sm"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="rounded-md border border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 text-black dark:text-white text-sm font-medium"
            >
              <option value="ALL">All Types</option>
              <option value="ai_generated">AI Generated</option>
              <option value="clone">Clone URL</option>
              <option value="import">ZIP/HTML Import</option>
              <option value="seo_landing_page">SEO Landing Page</option>
              <option value="ppc_landing_page">PPC Landing Page</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-md border border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 text-black dark:text-white text-sm font-medium"
            >
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="GENERATING">Generating</option>
              <option value="PUBLISHED">Published</option>
              <option value="FAILED">Failed</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="rounded-md border border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 text-black dark:text-white text-sm font-medium"
            >
              <option value="updatedAt">Recently Updated</option>
              <option value="createdAt">Recently Created</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
          
          {/* API Switch Info Indicator */}
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
              <span className={`h-2 w-2 rounded-full ${USE_MOCK_API ? "bg-amber-400" : "bg-emerald-500"}`}></span>
              {USE_MOCK_API ? "Mock LocalStorage Active" : "Real NestJS API Active"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      {isLoadingState ? (
        <div className="rounded-sm border border-stroke bg-white p-20 shadow-default dark:border-strokedark dark:bg-boxdark text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Loading projects...</p>
        </div>
      ) : isErrorState ? (
        <div className="rounded-sm border border-stroke bg-rose-50 border-rose-100 p-12 text-center dark:bg-meta-4/10">
          <p className="text-rose-600 font-bold mb-2">Không thể tải dữ liệu từ server API thật</p>
          <span className="text-xs text-gray-400 block mb-4">Vui lòng kiểm tra cổng kết nối hoặc đổi cờ USE_MOCK_API thành true trong page.tsx để tiếp tục dùng mock.</span>
          <button
            onClick={() => refetchQueryProjects()}
            className="rounded bg-rose-600 py-1.5 px-4 text-white text-xs font-semibold hover:bg-opacity-95"
          >
            Thử lại
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-sm border border-stroke bg-white p-20 shadow-default dark:border-strokedark dark:bg-boxdark text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21a9 9 0 0 0 8.72-6.75M12 21a9 9 0 0 1-8.72-6.75M12 21c2.49 0 4.5-4.03 4.5-9S14.49 3 12 3m0 18c-2.49 0-4.5-4.03-4.5-9S9.51 3 12 3" />
          </svg>
          <span className="font-bold text-lg text-black dark:text-white block">No website projects found</span>
          <p className="text-sm mt-1 text-gray-400">Try changing your search terms or create a new project above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project: any) => {
            const isPublished = project.status === "published";
            const isGenerating = project.job_status === "pending" || project.job_status === "processing" || project.status === "generating";
            
            // Format updated time
            const updatedAtStr = project.updated_at || project.updatedAt
              ? new Date(project.updated_at || project.updatedAt).toLocaleDateString("vi-VN")
              : "Vừa mới";

            return (
              <div key={project.id} className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark flex flex-col overflow-hidden group">
                {/* Thumbnail view */}
                <div className="relative aspect-[16/10] bg-zinc-100 border-b border-stroke dark:border-strokedark overflow-hidden flex items-center justify-center">
                  {project.thumbnailUrl ? (
                    <img src={project.thumbnailUrl} alt={project.name} className="w-full h-full object-cover group-hover:scale-102 transition duration-300" />
                  ) : (
                    // Creative visual mock thumbnail based on primary color
                    <div 
                      className="w-full h-full flex flex-col justify-between p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-900 group-hover:from-slate-200 transition duration-300"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">ECO-TEMPLATE</span>
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.schema_data?.primaryColor || "#10B981" }}></div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-3 w-3/4 rounded bg-gray-300/60 dark:bg-zinc-700/60"></div>
                        <div className="h-2 w-1/2 rounded bg-gray-300/40 dark:bg-zinc-700/40"></div>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="h-4 w-12 rounded bg-gray-300/50 dark:bg-zinc-700/50"></div>
                        <div className="h-4 w-8 rounded bg-gray-300/30 dark:bg-zinc-700/30"></div>
                      </div>
                    </div>
                  )}

                  {/* Overlays for generating status */}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10">
                      <div className="h-7 w-7 animate-spin rounded-full border-3 border-solid border-primary border-t-transparent mb-3"></div>
                      <span className="text-white text-xs font-bold animate-pulse">{project.job_error || "Generating Website..."}</span>
                      <span className="text-gray-400 text-[10px] mt-1 block">Progress: {project.job_progress || 0}%</span>
                    </div>
                  )}
                </div>

                {/* Card detail body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      {/* Name */}
                      <h4 className="font-bold text-black dark:text-white text-base line-clamp-1 flex-1">
                        {project.name}
                      </h4>
                      {/* Type Badge */}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 border dark:bg-meta-4/20 px-2 py-0.5 rounded">
                        {project.type === "seo_landing_page" ? "SEO" : project.type === "ppc_landing_page" ? "PPC" : project.type}
                      </span>
                    </div>

                    {/* Slug live url */}
                    {isPublished && project.slug ? (
                      <a
                        href={`/p/w/${project.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline font-semibold leading-none block mb-3.5"
                      >
                        /p/w/{project.slug}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 block mb-3.5">Draft / Unconfigured URL</span>
                    )}
                  </div>

                  <div>
                    {/* Status badges & Update time */}
                    <div className="flex items-center justify-between border-t border-stroke dark:border-strokedark pt-3.5 mt-2">
                      <span className={`inline-flex rounded-full py-0.5 px-2.5 text-[10px] font-bold ${
                        isPublished
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : isGenerating
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                      }`}>
                        {isPublished ? "Published" : isGenerating ? "Generating" : "Draft"}
                      </span>

                      <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                        Updated: {updatedAtStr}
                      </span>
                    </div>

                    {/* Actions list */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {isPublished ? (
                        <button
                          onClick={() => handleUnpublish(project)}
                          className="flex items-center justify-center rounded border border-stroke py-1.5 px-3 text-center text-xs font-semibold text-black hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                          disabled={isGenerating}
                        >
                          Unpublish
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePublishClick(project)}
                          className="flex items-center justify-center rounded bg-emerald-600 hover:bg-opacity-90 py-1.5 px-3 text-center text-xs font-semibold text-white"
                          disabled={isGenerating}
                        >
                          Publish
                        </button>
                      )}

                      <Link
                        href={`/website-builder/builder/${project.id}`}
                        className={`flex items-center justify-center rounded bg-primary hover:bg-opacity-95 py-1.5 px-3 text-center text-xs font-semibold text-white ${
                          isGenerating ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        Open Builder
                      </Link>

                      <a
                        href={isPublished && project.slug ? `/p/w/${project.slug}` : `/website-builder/builder/${project.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="col-span-2 flex items-center justify-center rounded border border-stroke py-1 px-3 text-center text-xs font-semibold text-black hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4/20"
                      >
                        Preview Site
                      </a>

                      <button
                        onClick={() => handleDeleteClick(project)}
                        className="col-span-2 mt-1 py-1 text-center text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 rounded transition"
                      >
                        Delete Project
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Prompt Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-md bg-white p-6 shadow-xl dark:bg-boxdark border border-stroke dark:border-strokedark my-8">
            <h3 className="text-xl font-bold text-black dark:text-white mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Thiết kế Website thông minh với AI
            </h3>
            
            <form onSubmit={handleCreateAI} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cột 1: Thông tin doanh nghiệp */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                      Tên Website <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: My Spa Portfolio"
                      value={aiWebsiteName}
                      onChange={e => setAiWebsiteName(e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                      Tên Doanh nghiệp / Thương hiệu <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Green Beauty Spa"
                      value={aiBusinessName}
                      onChange={e => setAiBusinessName(e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                      Lĩnh vực hoạt động <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Chăm sóc da, Làm đẹp, Spa"
                      value={aiIndustry}
                      onChange={e => setAiIndustry(e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                      Địa điểm / Khu vực kinh doanh <span className="text-gray-400 text-xs">(Không bắt buộc)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh"
                      value={aiLocation}
                      onChange={e => setAiLocation(e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                      Mục tiêu chính của Website <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={aiGoal}
                      onChange={e => setAiGoal(e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm font-medium"
                    >
                      <option value="generate_leads">Generate Leads (Thu thập lead)</option>
                      <option value="sell_product">Sell Products (Bán sản phẩm)</option>
                      <option value="booking">Booking (Đặt lịch hẹn)</option>
                      <option value="showcase">Showcase (Trưng bày tác phẩm)</option>
                      <option value="local_business">Local Business (Kinh doanh địa phương)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                      Đối tượng khách hàng mục tiêu <span className="text-gray-400 text-xs">(Không bắt buộc)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Phụ nữ tuổi từ 20-45 quan tâm mỹ phẩm tự nhiên"
                      value={aiAudience}
                      onChange={e => setAiAudience(e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* Cột 2: Layout & Tùy biến AI */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                      Phong cách thiết kế <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={aiStyle}
                      onChange={e => setAiStyle(e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm font-medium"
                    >
                      <option value="modern">Modern (Hiện đại)</option>
                      <option value="premium">Premium (Sang trọng)</option>
                      <option value="minimal">Minimal (Tối giản)</option>
                      <option value="bold">Bold (Mạnh mẽ, ấn tượng)</option>
                      <option value="friendly">Friendly (Thân thiện, gần gũi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-black dark:text-white">
                      Các trang cần tạo <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-2.5 border border-stroke dark:border-strokedark rounded bg-gray-50/50 dark:bg-meta-4/10">
                      {["Home", "About", "Services", "Contact", "FAQ"].map(pageName => {
                        const isChecked = aiSelectedPages.includes(pageName);
                        return (
                          <label key={pageName} className="flex items-center gap-2 text-sm text-black dark:text-white cursor-pointer select-none font-medium">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePage(pageName)}
                              className="rounded border-stroke text-primary focus:ring-primary h-4 w-4 dark:border-strokedark dark:bg-zinc-800"
                            />
                            {pageName}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                      Chế độ chiến dịch (Campaign Mode) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-4 p-2 border border-stroke dark:border-strokedark rounded bg-gray-50/50 dark:bg-meta-4/10">
                      <label className="flex items-center gap-2 text-black dark:text-white text-sm cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="aiCampaignMode"
                          checked={projectType === "seo_landing_page"}
                          onChange={() => setProjectType("seo_landing_page")}
                          className="h-4 w-4 text-primary focus:ring-primary border-stroke dark:border-strokedark"
                        />
                        SEO Mode (Nhiều trang)
                      </label>
                      <label className="flex items-center gap-2 text-black dark:text-white text-sm cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="aiCampaignMode"
                          checked={projectType === "ppc_landing_page"}
                          onChange={() => setProjectType("ppc_landing_page")}
                          className="h-4 w-4 text-primary focus:ring-primary border-stroke dark:border-strokedark"
                        />
                        PPC Mode (Phễu đơn trang)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                      Ý tưởng thiết kế / Mô tả bổ sung <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      placeholder="Ví dụ: Thiết kế trang web tông màu ấm nhẹ, sử dụng font chữ mềm mại, hình ảnh thiên nhiên, có phần giới thiệu dịch vụ nổi bật..."
                      rows={3}
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-stroke dark:border-strokedark pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAiModal(false);
                    resetAiForm();
                  }}
                  className="rounded border border-stroke py-2 px-4 hover:bg-gray-50 dark:border-strokedark dark:text-white text-black text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary py-2 px-5 text-white hover:bg-opacity-90 text-sm font-semibold flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Tạo Website với AI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Progress Modal */}
      {activeJobId && (
        <JobProgressModal
          jobId={activeJobId}
          onSuccess={(projectId) => {
            triggerToast("Tạo website thành công!");
            setActiveJobId(null);
            router.push(`/website-builder/builder/${projectId}`);
            resetAiForm();
            resetCloneForm();
            resetImportForm();
            resetPpcForm();
            if (USE_MOCK_API) {
              loadMockProjects();
            }
          }}
          onFailed={(error) => {
            triggerToast(error || "Tác vụ thất bại", "error");
            setActiveJobId(null);
            if (USE_MOCK_API) {
              loadMockProjects();
            }
          }}
          onClose={() => {
            setActiveJobId(null);
            if (USE_MOCK_API) {
              loadMockProjects();
            }
          }}
        />
      )}

      {/* Clone URL Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-md bg-white p-6 shadow-xl dark:bg-boxdark border border-stroke dark:border-strokedark my-8">
            <h3 className="text-xl font-bold text-black dark:text-white mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              Nhân bản Website từ URL
            </h3>
            
            <form onSubmit={handleClone} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                  Tên dự án Website <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Landing Page Mẫu A"
                  value={cloneProjectName}
                  onChange={e => setCloneProjectName(e.target.value)}
                  className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                  Đường dẫn URL trang web nguồn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: example.com hoặc https://example.com"
                  value={cloneUrl}
                  onChange={e => setCloneUrl(e.target.value)}
                  className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                  required
                />
                <span className="text-[11px] text-gray-400 block mt-1">Đường dẫn sẽ được chuẩn hóa tự động sang giao thức bảo mật https://.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                    Phương thức nhân bản <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={cloneMode}
                    onChange={e => setCloneMode(e.target.value as any)}
                    className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm font-medium"
                  >
                    <option value="visual_clone">Visual Clone (Sao chép giao diện)</option>
                    <option value="seo_landing_page">SEO Clone (Tối ưu hóa nội dung SEO)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                    Khu vực / Địa điểm <span className="text-gray-400 text-xs">(Không bắt buộc)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Hà Nội, Việt Nam"
                    value={cloneLocation}
                    onChange={e => setCloneLocation(e.target.value)}
                    className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                  />
                </div>
              </div>

              {cloneMode === "seo_landing_page" && (
                <div className="animate-fadeIn">
                  <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                    Từ khóa SEO mục tiêu <span className="text-gray-400 text-xs">(Không bắt buộc)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: spa cham soc da tu nhien hieu qua"
                    value={cloneKeyword}
                    onChange={e => setCloneKeyword(e.target.value)}
                    className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                  Chế độ chiến dịch (Campaign Mode) <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-4 p-2 border border-stroke dark:border-strokedark rounded bg-gray-50/50 dark:bg-meta-4/10">
                  <label className="flex items-center gap-2 text-black dark:text-white text-sm cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="cloneCampaignMode"
                      checked={projectType === "seo_landing_page"}
                      onChange={() => setProjectType("seo_landing_page")}
                      className="h-4 w-4 text-primary focus:ring-primary border-stroke dark:border-strokedark"
                    />
                    SEO Mode (Nhiều trang)
                  </label>
                  <label className="flex items-center gap-2 text-black dark:text-white text-sm cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="cloneCampaignMode"
                      checked={projectType === "ppc_landing_page"}
                      onChange={() => setProjectType("ppc_landing_page")}
                      className="h-4 w-4 text-primary focus:ring-primary border-stroke dark:border-strokedark"
                    />
                    PPC Mode (Phễu đơn trang)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-stroke dark:border-strokedark pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCloneModal(false);
                    resetCloneForm();
                  }}
                  className="rounded border border-stroke py-2 px-4 hover:bg-gray-50 dark:border-strokedark dark:text-white text-black text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary py-2 px-5 text-white hover:bg-opacity-90 text-sm font-semibold flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  Bắt đầu Clone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ZIP Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-md bg-white p-6 shadow-xl dark:bg-boxdark border border-stroke dark:border-strokedark my-8">
            <h3 className="text-xl font-bold text-black dark:text-white mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Nhập dữ liệu từ HTML/ZIP
            </h3>
            
            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                  Tên dự án Website <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trang giới thiệu sản phẩm"
                  value={importProjectName}
                  onChange={e => setImportProjectName(e.target.value)}
                  className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                  Tải lên tệp tin thiết kế (.zip hoặc .html) <span className="text-rose-500">*</span>
                </label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-upload-input")?.click()}
                  className={`mb-2 p-8 border-2 border-dashed rounded-md text-center cursor-pointer transition ${
                    dragActive
                      ? "border-primary bg-primary/5 dark:bg-meta-4/20"
                      : "border-stroke dark:border-strokedark hover:bg-gray-50/50 dark:hover:bg-meta-4/10"
                  }`}
                >
                  <input
                    id="file-upload-input"
                    type="file"
                    className="hidden"
                    accept=".html,.zip"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUploadFile(e.target.files[0]);
                      }
                    }}
                  />
                  
                  {importFile ? (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-black dark:text-white line-clamp-1 max-w-[250px]">
                            {importFile.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(importFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImportFile(null)}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 underline"
                      >
                        Chọn tệp khác
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                      <span className="text-sm font-semibold text-black dark:text-white block">
                        Kéo thả tệp tin hoặc Click để duyệt
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        Chấp nhận định dạng .zip, .html dung lượng tối đa 50MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                  Ghi chú bổ sung <span className="text-gray-400 text-xs">(Không bắt buộc)</span>
                </label>
                <textarea
                  placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt của bạn..."
                  rows={3}
                  value={importNote}
                  onChange={e => setImportNote(e.target.value)}
                  className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                  Chế độ chiến dịch (Campaign Mode) <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-4 p-2 border border-stroke dark:border-strokedark rounded bg-gray-50/50 dark:bg-meta-4/10">
                  <label className="flex items-center gap-2 text-black dark:text-white text-sm cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="importCampaignMode"
                      checked={projectType === "seo_landing_page"}
                      onChange={() => setProjectType("seo_landing_page")}
                      className="h-4 w-4 text-primary focus:ring-primary border-stroke dark:border-strokedark"
                    />
                    SEO Mode (Nhiều trang)
                  </label>
                  <label className="flex items-center gap-2 text-black dark:text-white text-sm cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="importCampaignMode"
                      checked={projectType === "ppc_landing_page"}
                      onChange={() => setProjectType("ppc_landing_page")}
                      className="h-4 w-4 text-primary focus:ring-primary border-stroke dark:border-strokedark"
                    />
                    PPC Mode (Phễu đơn trang)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-stroke dark:border-strokedark pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    resetImportForm();
                  }}
                  className="rounded border border-stroke py-2 px-4 hover:bg-gray-50 dark:border-strokedark dark:text-white text-black text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary py-2 px-5 text-white hover:bg-opacity-90 text-sm font-semibold flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Bắt đầu Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PPC Landing Page Generation Modal */}
      {showPpcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-md bg-white p-6 shadow-xl dark:bg-boxdark border border-stroke dark:border-strokedark my-8">
            <h3 className="text-xl font-bold text-black dark:text-white mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Tạo Landing Page PPC tối ưu Conversion
            </h3>
            
            <form onSubmit={handleCreatePpc} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cột 1: Tích hợp nguồn Chiến dịch */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                      Tên dự án Website <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Campaign Lọc Nước Ion Kiềm"
                      value={ppcProjectName}
                      onChange={e => setPpcProjectName(e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                      Nguồn chiến dịch quảng cáo (Campaign Source) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={ppcSource}
                      onChange={(e) => {
                        setPpcSource(e.target.value);
                        setPpcAccountId("");
                        setPpcCampaignId("");
                      }}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm font-medium"
                    >
                      <option value="manual">Manual Mode (Nhập tay thủ công)</option>
                      <option value="google_ads">Google Ads</option>
                      <option value="facebook_ads">Facebook Ads</option>
                      <option value="tiktok_ads">TikTok Ads</option>
                    </select>
                  </div>

                  {ppcSource !== "manual" && (
                    <div className="space-y-4 p-3 border border-stroke dark:border-strokedark rounded bg-gray-50/50 dark:bg-meta-4/10 animate-fadeIn">
                      <div>
                        <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 block mb-2 uppercase tracking-widest">
                          Tích hợp nền tảng
                        </span>
                        <label className="mb-1 block text-xs font-semibold text-black dark:text-white">
                          Tài khoản doanh nghiệp (Ad Account)
                        </label>
                        <select
                          value={ppcAccountId}
                          onChange={(e) => {
                            setPpcAccountId(e.target.value);
                            setPpcCampaignId("");
                          }}
                          className="w-full rounded border border-stroke bg-transparent py-1.5 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm font-medium"
                        >
                          <option value="">-- Chọn tài khoản --</option>
                          {PPC_MOCK_DATA[ppcSource]?.accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-black dark:text-white">
                          Chiến dịch quảng cáo (Ad Campaign)
                        </label>
                        <select
                          value={ppcCampaignId}
                          onChange={(e) => {
                            const campaignId = e.target.value;
                            setPpcCampaignId(campaignId);
                            
                            // Autofill fields
                            const account = PPC_MOCK_DATA[ppcSource]?.accounts.find(a => a.id === ppcAccountId);
                            const campaign = account?.campaigns.find(c => c.id === campaignId);
                            if (campaign) {
                              setPpcKeyword(campaign.keyword);
                              setPpcGoal(campaign.goal);
                              setPpcOffer(campaign.offer);
                              setPpcCta(campaign.cta);
                            }
                          }}
                          className="w-full rounded border border-stroke bg-transparent py-1.5 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm font-medium"
                          disabled={!ppcAccountId}
                        >
                          <option value="">-- Chọn chiến dịch --</option>
                          {PPC_MOCK_DATA[ppcSource]?.accounts
                            .find(a => a.id === ppcAccountId)
                            ?.campaigns.map(camp => (
                              <option key={camp.id} value={camp.id}>{camp.name}</option>
                            ))}
                        </select>
                        <span className="text-[10px] text-gray-400 block mt-1">
                          Hệ thống sẽ tự động điền (Autofill) từ khóa, mục tiêu và nội dung ưu đãi dựa trên chiến dịch quảng cáo đã chọn.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cột 2: Cấu hình Phễu & Manual Fallback */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                      Từ khóa mục tiêu (Target Keyword) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: máy lọc nước ion kiềm tốt nhất"
                      value={ppcKeyword}
                      onChange={e => setPpcKeyword(e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                      Mục tiêu chuyển đổi (Landing Page Goal) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={ppcGoal}
                      onChange={e => setPpcGoal(e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm font-medium"
                    >
                      <option value="generate_leads">Generate Leads (Thu thập lead đăng ký)</option>
                      <option value="sell_product">Sell Product (Bán sản phẩm trực tiếp)</option>
                      <option value="booking">Booking (Đặt lịch hẹn tư vấn)</option>
                      <option value="showcase">Showcase (Trưng bày danh mục/sản phẩm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                      Nội dung ưu đãi chính (Offer) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Giảm ngay 10% cho 50 khách hàng đăng ký sớm nhất"
                      value={ppcOffer}
                      onChange={e => setPpcOffer(e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
                      Lời kêu gọi hành động (CTA) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Nhận ưu đãi ngay"
                      value={ppcCta}
                      onChange={e => setPpcCta(e.target.value)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-stroke dark:border-strokedark pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPpcModal(false);
                    resetPpcForm();
                  }}
                  className="rounded border border-stroke py-2 px-4 hover:bg-gray-50 dark:border-strokedark dark:text-white text-black text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary py-2 px-5 text-white hover:bg-opacity-90 text-sm font-semibold flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Tạo PPC Landing Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-md bg-white p-6 shadow-lg dark:bg-boxdark border border-stroke dark:border-strokedark">
            <h3 className="text-lg font-bold text-black dark:text-white mb-4">Xuất bản Website</h3>
            <form onSubmit={handlePublishSubmit}>
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-black dark:text-white">Đường dẫn công khai (Slug)</label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-r-0 border-stroke py-2.5 px-3 rounded-l dark:bg-meta-4 dark:border-strokedark text-gray-500 text-sm">
                    /p/w/
                  </span>
                  <input
                    type="text"
                    placeholder="ten-mien-viet-lien-khong-dau"
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
                  onClick={() => {
                    setShowPublishModal(false);
                    setSelectedProject(null);
                  }}
                  className="rounded border border-stroke py-2 px-4 hover:bg-gray-50 dark:border-strokedark dark:text-white text-black text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded bg-emerald-600 py-2 px-4 text-white hover:bg-opacity-90 text-sm font-semibold"
                >
                  Đồng ý Xuất bản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-md bg-white p-6 shadow-lg dark:bg-boxdark border border-stroke dark:border-strokedark text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 mb-4 dark:bg-rose-950/20">
              <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-2">Xác nhận xóa dự án website</h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn có chắc chắn muốn xóa dự án <strong className="text-black dark:text-white">"{selectedProject.name}"</strong>? Hành động này sẽ xóa vĩnh viễn và không thể khôi phục.
            </p>
            
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProject(null);
                }}
                className="rounded border border-stroke py-2 px-4 hover:bg-gray-50 dark:border-strokedark dark:text-white text-black text-sm"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded bg-rose-600 py-2 px-4 text-white hover:bg-rose-700 text-sm font-semibold"
              >
                Đồng ý Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
