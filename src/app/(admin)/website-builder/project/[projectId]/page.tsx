"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getWebsiteProject,
  publishWebsite,
  unpublishWebsite,
  WebsiteProject,
  DEFAULT_SCHEMA
} from "@/components/website-builder/core/website-db-storage";
import WebsiteRenderer from "@/components/website-builder/renderer/WebsiteRenderer";
import { usePublishWebsiteProject } from "@/hooks/use-website-builder";
import { JobProgressModal } from "@/components/website-builder/shared/job-progress";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default function WebsiteProjectDetailPage({ params }: ProjectPageProps) {
  const router = useRouter();
  const { projectId } = use(params);

  const [project, setProject] = useState<WebsiteProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for publish modal
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSlug, setPublishSlug] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const publishMutation = usePublishWebsiteProject(projectId);

  // Load project details
  const loadProject = async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      const data = await getWebsiteProject(projectId);
      if (data) {
        setProject(data);
        if (!publishSlug && data.slug) {
          setPublishSlug(data.slug);
        } else if (!publishSlug) {
          setPublishSlug(data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
        }
        setError(null);
      } else {
        setError("Không tìm thấy dự án.");
      }
    } catch (err) {
      console.error("Failed to load project:", err);
      setError("Đã xảy ra lỗi khi tải thông tin dự án.");
    } finally {
      if (showSkeleton) setLoading(false);
    }
  };

  useEffect(() => {
    loadProject(true);
  }, [projectId]);

  // Polling for generating projects
  useEffect(() => {
    if (!project || project.status !== "generating") return;

    const interval = setInterval(async () => {
      try {
        const data = await getWebsiteProject(projectId);
        if (data) {
          setProject(data);
          if (data.status !== "generating") {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Error polling project status:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [project?.status, projectId]);

  // Handle publish action
  const USE_MOCK_API = true;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishSlug) return;
    setPublishing(true);
    
    if (USE_MOCK_API) {
      try {
        const success = await publishWebsite(projectId, publishSlug.trim());
        if (success) {
          setShowPublishModal(false);
          setActiveJobId(projectId);
        } else {
          alert("Không thể xuất bản. Vui lòng kiểm tra lại slug.");
        }
      } catch (err) {
        console.error("Publish failed:", err);
        alert("Xuất bản thất bại.");
      } finally {
        setPublishing(false);
      }
    } else {
      publishMutation.mutate(undefined, {
        onSuccess: (data: any) => {
          setShowPublishModal(false);
          setPublishing(false);
          const jobId = data?.jobId;
          if (jobId) {
            setActiveJobId(jobId);
          } else {
            alert("Xuất bản website thành công!");
            loadProject(false);
          }
        },
        onError: (err: any) => {
          console.error("Publish failed:", err);
          alert(err?.message || "Xuất bản thất bại.");
          setPublishing(false);
        }
      });
    }
  };

  // Handle unpublish action
  const handleUnpublish = async () => {
    if (!confirm("Bạn có chắc chắn muốn ngừng xuất bản website này?")) return;
    try {
      const success = await unpublishWebsite(projectId);
      if (success) {
        await loadProject(false);
      }
    } catch (err) {
      console.error("Unpublish failed:", err);
      alert("Ngừng xuất bản thất bại.");
    }
  };

  // Skeleton Loader Component
  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        {/* Header Skeleton */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-boxdark p-4 rounded-md border border-stroke dark:border-strokedark animate-pulse shadow-sm">
          <div className="h-6 w-48 bg-gray-200 dark:bg-zinc-800 rounded"></div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-gray-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-9 w-28 bg-gray-200 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>

        {/* Website Render Skeleton */}
        <div className="border border-stroke dark:border-strokedark rounded-md bg-white dark:bg-boxdark p-8 space-y-12 animate-pulse min-h-[500px]">
          {/* Header section skeleton */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-strokedark">
            <div className="h-6 w-32 bg-gray-200 dark:bg-zinc-800 rounded"></div>
            <div className="flex gap-4">
              <div className="h-4 w-12 bg-gray-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-4 w-12 bg-gray-200 dark:bg-zinc-800 rounded"></div>
            </div>
          </div>
          {/* Hero section skeleton */}
          <div className="py-12 flex flex-col items-center text-center space-y-4">
            <div className="h-8 w-96 bg-gray-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-4 w-120 bg-gray-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-10 w-36 bg-gray-200 dark:bg-zinc-800 rounded-full mt-4"></div>
          </div>
          {/* Grid section skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6 border border-gray-100 dark:border-strokedark rounded-xl space-y-3">
                <div className="h-10 w-10 bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
                <div className="h-5 w-24 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-3 w-full bg-gray-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-3 w-4/5 bg-gray-200 dark:bg-zinc-800 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State Component
  if (error || !project) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-stroke bg-white px-4 py-12 text-center dark:border-strokedark dark:bg-boxdark shadow-sm">
          <span className="mb-4 text-4xl text-rose-500 font-mono">⚠</span>
          <h3 className="mb-2 text-xl font-bold text-black dark:text-white">Lỗi tải dữ liệu</h3>
          <p className="mb-6 max-w-md text-sm text-gray-500 dark:text-gray-400">
            {error || "Không thể truy xuất thông tin dự án website builder."}
          </p>
          <div className="flex gap-3">
            <Link
              href="/website-builder"
              className="rounded-md border border-stroke py-2 px-5 text-sm font-semibold text-black hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
            >
              Quay lại danh sách
            </Link>
            <button
              onClick={() => loadProject(true)}
              className="rounded-md bg-primary py-2 px-5 text-sm font-semibold text-white hover:bg-opacity-95 shadow"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isGenerating = project.status === "generating";
  const isPublished = project.status === "published";
  const schema = project.schema_data || DEFAULT_SCHEMA;
  const sections = schema.pages?.[0]?.sections || schema.sections || [];

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      {/* Header Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-boxdark p-4 rounded-md border border-stroke dark:border-strokedark shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/website-builder"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stroke hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4 text-black"
            title="Quay lại"
          >
            ←
          </Link>
          <div>
            <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2.5">
              {project.name}
              {/* Status Badge */}
              {isGenerating && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600 dark:bg-amber-950/20 dark:text-amber-500 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  Đang tạo AI ({project.job_progress || 0}%)
                </span>
              )}
              {isPublished && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Đã xuất bản
                </span>
              )}
              {!isGenerating && !isPublished && project.status === "failed" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600 dark:bg-rose-950/20 dark:text-rose-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                  Lỗi tạo AI
                </span>
              )}
              {!isGenerating && !isPublished && project.status !== "failed" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600 dark:bg-meta-4 dark:text-gray-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                  Bản nháp
                </span>
              )}
            </h2>
            {isPublished && project.slug && (
              <p className="text-xs text-gray-400 mt-0.5 font-medium">
                URL công khai:{" "}
                <a
                  href={`/p/w/${project.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  /p/w/{project.slug}
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preview Button */}
          {!isGenerating && project.status !== "failed" && (
            <button
              onClick={() => {
                if (isPublished && project.slug) {
                  window.open(`/p/w/${project.slug}`, "_blank");
                } else {
                  // Mở preview cục bộ trong tab mới
                  window.open(`/p/w/${project.slug || `preview-${project.id}`}`, "_blank");
                }
              }}
              className="rounded border border-stroke py-2 px-4 text-sm font-semibold text-black hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
            >
              Xem trước (Preview)
            </button>
          )}

          {/* Open Builder */}
          {!isGenerating && (
            <Link
              href={`/website-builder/builder/${project.id}`}
              className="rounded bg-primary py-2 px-4 text-sm font-semibold text-white hover:bg-opacity-95 shadow"
            >
              Mở Trình biên tập (Builder)
            </Link>
          )}

          {/* Publish / Unpublish Toggle */}
          {!isGenerating && project.status !== "failed" && (
            isPublished ? (
              <button
                onClick={handleUnpublish}
                className="rounded bg-rose-600 py-2 px-4 text-sm font-semibold text-white hover:bg-opacity-95 shadow"
              >
                Hủy xuất bản
              </button>
            ) : (
              <button
                onClick={() => setShowPublishModal(true)}
                className="rounded bg-emerald-600 py-2 px-4 text-sm font-semibold text-white hover:bg-opacity-95 shadow"
              >
                Xuất bản (Publish)
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="border border-stroke dark:border-strokedark rounded-md bg-white dark:bg-boxdark overflow-hidden min-h-[500px] shadow-sm flex flex-col">
        {/* If AI is generating */}
        {isGenerating && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-boxdark">
            <div className="h-16 w-16 mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary animate-spin"></div>
              <div className="absolute inset-2 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                AI
              </div>
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white mb-2">AI đang tạo Landing Page của bạn</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
              Vui lòng đợi trong giây lát. Hệ thống đang viết nội dung, phối màu sắc và xây dựng cấu trúc website tối ưu.
            </p>
            
            {/* Progress Bar */}
            <div className="w-full max-w-md bg-gray-200 dark:bg-zinc-800 rounded-full h-2.5 mb-2 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${project.job_progress || 5}%` }}
              ></div>
            </div>
            <span className="text-sm font-extrabold text-primary">{project.job_progress || 5}% hoàn thành</span>
            {project.job_error && (
              <p className="text-xs text-amber-500 mt-2 italic">{project.job_error}</p>
            )}
          </div>
        )}

        {/* If project creation failed */}
        {!isGenerating && project.status === "failed" && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-rose-50/10">
            <span className="text-4xl text-rose-500 mb-4">✕</span>
            <h3 className="text-lg font-bold text-black dark:text-white mb-2">Tạo website thất bại</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
              Đã xảy ra sự cố trong quá trình tự động sinh trang web bằng AI.
            </p>
            {project.job_error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-4 rounded text-xs font-mono max-w-lg mb-6 border border-rose-100 dark:border-rose-900/50">
                {project.job_error}
              </div>
            )}
            <Link
              href="/website-builder"
              className="rounded bg-primary py-2 px-5 text-sm font-semibold text-white hover:bg-opacity-90"
            >
              Quay lại Dashboard để thử lại
            </Link>
          </div>
        )}

        {/* Empty State */}
        {!isGenerating && project.status !== "failed" && sections.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
            <span className="text-4xl mb-4">🗏</span>
            <p className="text-sm mb-4">Trang web này chưa có khối nội dung (Section) nào.</p>
            <Link
              href={`/website-builder/builder/${project.id}`}
              className="rounded bg-primary py-2 px-5 text-sm font-semibold text-white hover:bg-opacity-90"
            >
              + Thêm Section ngay
            </Link>
          </div>
        )}

        {/* Real Dynamic Page Render */}
        {!isGenerating && project.status !== "failed" && sections.length > 0 && (
          <div className="flex-1 bg-white text-black dark:bg-zinc-950">
            <WebsiteRenderer schema={schema} mode="preview" />
          </div>
        )}
      </div>

      {/* Publish Slug Setting Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-md bg-white p-6 shadow-lg dark:bg-boxdark border border-stroke dark:border-strokedark">
            <h3 className="text-lg font-bold text-black dark:text-white mb-4">Cấu hình URL Xuất bản</h3>
            <form onSubmit={handlePublish}>
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
                  Đường dẫn slug cho website
                </label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-r-0 border-stroke py-2.5 px-3 rounded-l dark:bg-meta-4 dark:border-strokedark text-gray-500 text-sm">
                    /p/w/
                  </span>
                  <input
                    type="text"
                    placeholder="ten-website"
                    value={publishSlug}
                    onChange={(e) => setPublishSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    className="w-full rounded-r border border-stroke bg-transparent py-2.5 px-4 outline-none focus:border-primary dark:border-strokedark text-black dark:text-white text-sm"
                    required
                    disabled={publishing}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                  Địa chỉ này sẽ dùng để truy cập công khai trang web sau khi xuất bản.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="rounded border border-stroke py-2 px-4 hover:bg-gray-50 dark:border-strokedark dark:text-white text-black"
                  disabled={publishing}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded bg-emerald-600 py-2 px-4 text-white hover:bg-opacity-90 disabled:opacity-55"
                  disabled={publishing}
                >
                  {publishing ? "Đang xuất bản..." : "Xác nhận Xuất bản"}
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
            await loadProject(false);
          }}
          onClose={async () => {
            setActiveJobId(null);
            await loadProject(false);
          }}
        />
      )}
    </div>
  );
}
