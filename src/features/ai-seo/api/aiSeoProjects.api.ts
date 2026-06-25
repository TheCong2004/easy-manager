import { AiSeoProjectListItem } from "../types";

export async function fetchAiSeoProjects(orgId = "org-1"): Promise<AiSeoProjectListItem[]> {
  const res = await fetch(`/api/ai-seo/projects?orgId=${orgId}`, {
    headers: { "x-org-id": orgId },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch AI SEO projects");
  }
  return res.json();
}

export async function createAiSeoProject(
  data: { name: string; hostname: string },
  orgId = "org-1"
): Promise<any> {
  const res = await fetch(`/api/ai-seo/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-org-id": orgId,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to create project");
  }
  return res.json();
}

export async function toggleFavoriteProject(
  projectId: string,
  orgId = "org-1"
): Promise<{ id: string; projectId: string; isFavorite: boolean }> {
  const res = await fetch(`/api/ai-seo/projects/${projectId}/favorite`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-org-id": orgId,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to update favorite status");
  }
  return res.json();
}

export async function toggleAgentStatus(
  projectId: string,
  orgId = "org-1"
): Promise<{ id: string; projectId: string; isEngaged: boolean }> {
  const res = await fetch(`/api/ai-seo/projects/${projectId}/agent-status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-org-id": orgId,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to update agent status");
  }
  return res.json();
}

export async function triggerProjectScan(
  projectId: string,
  orgId = "org-1"
): Promise<{ jobId: string; status: string }> {
  const res = await fetch(`/api/ai-seo/projects/${projectId}/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-org-id": orgId,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to trigger scan");
  }
  return res.json();
}

export async function deleteProject(
  projectId: string,
  orgId = "org-1"
): Promise<{ success: boolean }> {
  const res = await fetch(`/api/ai-seo/projects/${projectId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-org-id": orgId,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to delete project");
  }
  return res.json();
}
