import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWebsiteProjects,
  getWebsiteProject,
  createWebsiteProject,
  deleteWebsiteProject,
  getWebsiteSchema,
  updateWebsiteSchema,
  createAiWebsite,
  createCloneWebsite,
  createImportWebsite,
  createPpcLandingPage,
  publishWebsiteProject,
  getWebsiteJob
} from "@/lib/claw-api/website-builder";
import type { WebsiteProject, WebsiteSchema, CreateAiWebsitePayload, CreateCloneWebsitePayload, CreateImportWebsitePayload, CreatePpcLandingPagePayload } from "@/types/website-builder";

// Query Keys
export const websiteQueryKeys = {
  projects: {
    all: ["website-projects"] as const,
    list: (params?: unknown) => ["website-projects", "list", params] as const,
    detail: (id: string) => ["website-projects", "detail", id] as const,
  },
  schema: {
    detail: (projectId: string) => ["website-projects", "schema", projectId] as const,
  },
  jobs: {
    detail: (jobId: string) => ["website-projects", "job", jobId] as const,
  }
};

/** Hook lấy danh sách website projects */
export function useWebsiteProjects(params?: {
  type?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: websiteQueryKeys.projects.list(params),
    queryFn: () => getWebsiteProjects(params),
  });
}

/** Hook lấy thông tin chi tiết website project */
export function useWebsiteProject(id: string) {
  return useQuery({
    queryKey: websiteQueryKeys.projects.detail(id),
    queryFn: () => getWebsiteProject(id),
    enabled: !!id,
  });
}

/** Hook lấy schema chi tiết của website project */
export function useWebsiteSchema(projectId: string) {
  return useQuery({
    queryKey: websiteQueryKeys.schema.detail(projectId),
    queryFn: () => getWebsiteSchema(projectId),
    enabled: !!projectId,
  });
}

/** Hook tạo website project trống mới */
export function useCreateWebsiteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<WebsiteProject>) => createWebsiteProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websiteQueryKeys.projects.all });
    },
  });
}

/** Hook xóa website project */
export function useDeleteWebsiteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWebsiteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websiteQueryKeys.projects.all });
    },
  });
}

/** Hook cập nhật schema website project */
export function useUpdateWebsiteSchema(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (schema: WebsiteSchema) => updateWebsiteSchema(projectId, schema),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: websiteQueryKeys.schema.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: websiteQueryKeys.projects.detail(projectId) });
    },
  });
}

/** Hook tạo website bằng AI */
export function useCreateAiWebsite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAiWebsitePayload) =>
      createAiWebsite(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websiteQueryKeys.projects.all });
    },
  });
}

/** Hook clone website từ URL */
export function useCreateCloneWebsite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCloneWebsitePayload) =>
      createCloneWebsite(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websiteQueryKeys.projects.all });
    },
  });
}

/** Hook import website từ ZIP/HTML */
export function useCreateImportWebsite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateImportWebsitePayload) =>
      createImportWebsite(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websiteQueryKeys.projects.all });
    },
  });
}

/** Hook tạo PPC Landing Page */
export function useCreatePpcLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePpcLandingPagePayload) => createPpcLandingPage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websiteQueryKeys.projects.all });
    },
  });
}

/** Hook xuất bản website project */
export function usePublishWebsiteProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => publishWebsiteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websiteQueryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: websiteQueryKeys.projects.detail(projectId) });
    },
  });
}

/** Hook kiểm tra trạng thái Job chạy ngầm */
export function useWebsiteJob(jobId: string, options?: { enabled?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: websiteQueryKeys.jobs.detail(jobId),
    queryFn: () => getWebsiteJob(jobId),
    enabled: !!jobId && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  });
}
