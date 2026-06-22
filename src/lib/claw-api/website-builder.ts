import { request, post, put, del } from "./core";
import type {
  WebsiteProject,
  WebsiteSchema,
  WebsiteJob,
  CreateAiWebsitePayload,
  CreateCloneWebsitePayload,
  CreateImportWebsitePayload,
  CreatePpcLandingPagePayload,
  AiEditSectionPayload,
  AiEditSectionResponse
} from "@/types/website-builder";

/**
 * TODO: Cần cấu hình backend endpoint tương ứng trên NestJS
 * Lấy danh sách website projects từ backend
 */
export async function getWebsiteProjects(params?: {
  type?: string;
  status?: string;
  search?: string;
}): Promise<WebsiteProject[]> {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.set("type", params.type);
  if (params?.status) queryParams.set("status", params.status);
  if (params?.search) queryParams.set("search", params.search);
  
  const query = queryParams.toString();
  const url = `/website-builder/projects${query ? `?${query}` : ""}`;
  const response = await request<{ projects: WebsiteProject[] }>(url);
  return response.projects;
}

/**
 * TODO: Cần cấu hình backend endpoint tương ứng trên NestJS
 * Lấy thông tin chi tiết một website project từ backend
 */
export async function getWebsiteProject(id: string): Promise<WebsiteProject> {
  const response = await request<{ project: WebsiteProject }>(`/website-builder/projects/${id}`);
  return response.project;
}

/**
 * TODO: Cần cấu hình backend endpoint tương ứng trên NestJS
 * Tạo mới một website project trống
 */
export async function createWebsiteProject(payload: Partial<WebsiteProject>): Promise<WebsiteProject> {
  const response = await post<{ project: WebsiteProject }>("/website-builder/projects", payload);
  return response.project;
}

/**
 * TODO: Cần cấu hình backend endpoint tương ứng trên NestJS
 * Xóa một website project trên backend
 */
export async function deleteWebsiteProject(id: string): Promise<void> {
  await del(`/website-builder/projects/${id}`);
}

/**
 * TODO: Cần cấu hình backend endpoint tương ứng trên NestJS
 * Lấy schema chi tiết của website project
 */
export async function getWebsiteSchema(projectId: string): Promise<WebsiteSchema> {
  const response = await request<{ schema: WebsiteSchema }>(`/website-builder/projects/${projectId}/schema`);
  return response.schema;
}

/**
 * TODO: Cần cấu hình backend endpoint tương ứng trên NestJS
 * Cập nhật schema của website project
 */
export async function updateWebsiteSchema(projectId: string, schema: WebsiteSchema): Promise<WebsiteSchema> {
  const response = await put<{ schema: WebsiteSchema }>(`/website-builder/projects/${projectId}/schema`, schema);
  return response.schema;
}

/**
 * TODO: Cần cấu hình backend endpoint tương ứng trên NestJS
 * Yêu cầu AI sinh giao diện website
 */
export async function createAiWebsite(
  payload: CreateAiWebsitePayload
): Promise<{ project: WebsiteProject; jobId: string }> {
  return post<{ project: WebsiteProject; jobId: string }>("/website-builder/projects/ai-generate", payload);
}

/**
 * TODO: Cần cấu hình backend endpoint tương ứng trên NestJS
 * Yêu cầu nhân bản từ website nguồn
 */
export async function createCloneWebsite(
  payload: CreateCloneWebsitePayload
): Promise<{ project: WebsiteProject; jobId: string }> {
  return post<{ project: WebsiteProject; jobId: string }>("/website-builder/projects/clone", payload);
}

/**
 * TODO: Cần cấu hình backend endpoint tương ứng trên NestJS
 * Yêu cầu nhập website từ gói HTML/ZIP
 */
export async function createImportWebsite(
  payload: CreateImportWebsitePayload
): Promise<{ project: WebsiteProject; jobId: string }> {
  const formData = new FormData();
  formData.append("projectName", payload.projectName);
  formData.append("fileName", payload.fileName);
  formData.append("type", payload.type);
  if (payload.note) formData.append("note", payload.note);
  if (payload.file) formData.append("file", payload.file);

  return request<{ project: WebsiteProject; jobId: string }>("/website-builder/projects/import", {
    method: "POST",
    body: formData,
  });
}

/**
 * TODO: Cần cấu hình backend endpoint tương ứng trên NestJS
 * Tạo trang PPC landing page
 */
export async function createPpcLandingPage(
  payload: CreatePpcLandingPagePayload
): Promise<{ project: WebsiteProject; jobId?: string; projectId?: string }> {
  return post<{ project: WebsiteProject; jobId?: string; projectId?: string }>("/website-builder/projects/ppc", payload);
}

/**
 * TODO: Cần cấu hình backend endpoint tương ứng trên NestJS
 * Xuất bản website project ra công khai
 */
export async function publishWebsiteProject(projectId: string): Promise<{ project: WebsiteProject; jobId?: string }> {
  return post<{ project: WebsiteProject; jobId?: string }>(`/website-builder/projects/${projectId}/publish`);
}

/**
 * Lấy URL phiên làm việc bảo mật cho Trình soạn thảo (Visual Editor)
 */
export async function getWebsiteBuilderSession(projectId: string): Promise<{ builderUrl: string; expiresAt?: string }> {
  return post<{ builderUrl: string; expiresAt?: string }>(`/website-builder/projects/${projectId}/builder-session`);
}

/**
 * TODO: Cần cấu hình backend endpoint tương ứng trên NestJS
 * Lấy trạng thái của tác vụ chạy ngầm từ backend
 */
export async function getWebsiteJob(jobId: string): Promise<WebsiteJob> {
  try {
    const response = await request<{ job: WebsiteJob }>(`/website-builder/jobs/${jobId}`);
    if (response?.job) return response.job;
  } catch (err) {
    console.warn("NestJS API getWebsiteJob error, trying LocalStorage fallback:", err);
  }

  // Fallback: Check LocalStorage for a project with this ID (which acts as the jobId in mock mode)
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("website_builder_projects");
      const projects = raw ? JSON.parse(raw) : [];
      const project = projects.find((p: any) => p.id === jobId);
      if (project) {
        // Map project status/progress to WebsiteJob
        let status: WebsiteJob["status"] = "processing";
        if (project.status === "published") {
          status = "live";
        } else if (project.job_status === "completed" || project.status === "ready") {
          status = "success";
        } else if (project.job_status === "failed" || project.status === "failed") {
          status = "failed";
        } else if (project.job_status === "pending") {
          status = "queued";
        }

        let jobType: WebsiteJob["type"] = "generate";
        if (project.source_type === "clone_url") {
          jobType = "clone";
        } else if (project.source_type === "import_zip") {
          jobType = "import";
        }

        return {
          id: jobId,
          projectId: project.id,
          type: jobType,
          status,
          progress: project.job_progress ?? 0,
          error: project.job_error || ""
        };
      }
    } catch (localErr) {
      console.error("Failed to parse LocalStorage projects in getWebsiteJob:", localErr);
    }
  }

  throw new Error(`Job not found: ${jobId}`);
}

/**
 * Yêu cầu AI chỉnh sửa section dựa trên prompt và props hiện tại.
 * Chỉ hoạt động ở chế độ mock khi có biến môi trường NEXT_PUBLIC_ENABLE_WEBSITE_BUILDER_MOCK=true.
 */
export async function aiEditSection(
  projectId: string,
  payload: AiEditSectionPayload
): Promise<AiEditSectionResponse> {
  if (process.env.NEXT_PUBLIC_ENABLE_WEBSITE_BUILDER_MOCK === "true") {
    // Isolated Mock Logic for local development:
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const promptLower = payload.prompt.toLowerCase();
    
    // Default clone of current props
    const updatedProps = { ...payload.currentProps };
    
    // Check if background image/image changes are requested
    if (promptLower.includes("ảnh") || promptLower.includes("image") || promptLower.includes("hình ảnh")) {
      updatedProps.imageUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600";
      updatedProps.backgroundImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600";
      if (!updatedProps.props) updatedProps.props = {};
      updatedProps.props.imageUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600";
      updatedProps.props.backgroundImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600";
    }
    
    if (promptLower.includes("màu") || promptLower.includes("color") || promptLower.includes("nền") || promptLower.includes("background")) {
      updatedProps.backgroundColor = "#ECFDF5"; // Light emerald green
      if (!updatedProps.props) updatedProps.props = {};
      updatedProps.props.backgroundColor = "#ECFDF5";
      if (!updatedProps.props.settings) updatedProps.props.settings = {};
      updatedProps.props.settings.backgroundColor = "#ECFDF5";
      updatedProps.props.settings.textColor = "#064E3B";
    }
    
    if (promptLower.includes("chữ") || promptLower.includes("text") || promptLower.includes("tiêu đề") || promptLower.includes("title")) {
      updatedProps.title = "Đột Phá Doanh Nghiệp Với Giải Pháp AI";
      updatedProps.subtitle = "Hệ thống tự động hóa chuyển đổi số giúp doanh nghiệp bứt phá doanh thu vượt trội trong kỷ nguyên số.";
      if (!updatedProps.props) updatedProps.props = {};
      updatedProps.props.title = "Đột Phá Doanh Nghiệp Với Giải Pháp AI";
      updatedProps.props.subtitle = "Hệ thống tự động hóa chuyển đổi số giúp doanh nghiệp bứt phá doanh thu vượt trội trong kỷ nguyên số.";
    }
    
    if (promptLower.includes("nút") || promptLower.includes("button")) {
      updatedProps.buttonText = "Nhận Tư Vấn Miễn Phí";
      updatedProps.buttonBgColor = "#10B981";
      if (!updatedProps.props) updatedProps.props = {};
      updatedProps.props.buttonText = "Nhận Tư Vấn Miễn Phí";
      updatedProps.props.buttonBgColor = "#10B981";
    }

    // Fallback if no specific keyword matched
    if (JSON.stringify(updatedProps) === JSON.stringify(payload.currentProps)) {
      updatedProps.title = (payload.currentProps.title || "Tiêu đề mới") + " (AI Updated)";
      if (!updatedProps.props) updatedProps.props = {};
      updatedProps.props.title = (payload.currentProps.title || "Tiêu đề mới") + " (AI Updated)";
    }
    
    return {
      updatedProps,
      explanation: "Mock AI đã cập nhật lại nội dung, màu nền và chữ kêu gọi hành động (CTA) của section theo yêu cầu."
    };
  }

  // Real Production API logic:
  return post<AiEditSectionResponse>(
    `/website-builder/projects/${projectId}/ai-edit-section`,
    payload
  );
}
