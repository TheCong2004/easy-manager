import React, { useState } from "react";
import { X, Globe, Library, Link as LinkIcon, Loader2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useWebsiteProjectsQuery,
  useWebsitePagesQuery,
  useLinkLandingPageMutation
} from "../../hooks/useLandingPageQueries";

interface ConnectLandingPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  orgId?: string;
}

const externalSchema = z.object({
  pageUrl: z.string()
    .min(1, { message: "Đường dẫn URL là bắt buộc" })
    .url({ message: "Cung cấp một URL hợp lệ như https://example.com" }),
});

export function ConnectLandingPageModal({
  isOpen,
  onClose,
  projectId,
  orgId = "org-1"
}: ConnectLandingPageModalProps) {
  const [sourceType, setSourceType] = useState<"internal" | "external">("internal");
  const [selectedWebsiteProjectId, setSelectedWebsiteProjectId] = useState<string>("");
  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Queries
  const { data: websiteProjects, isLoading: loadingProjects } = useWebsiteProjectsQuery(orgId);
  const { data: websitePages, isLoading: loadingPages } = useWebsitePagesQuery(orgId, selectedWebsiteProjectId);

  // Mutation
  const linkMutation = useLinkLandingPageMutation(orgId, projectId);

  // Form for external URL
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(externalSchema),
    defaultValues: { pageUrl: "" }
  });

  if (!isOpen) return null;

  const handleLinkInternal = async () => {
    if (!selectedPageId) {
      setSubmitError("Vui lòng chọn một trang Landing Page");
      return;
    }
    const page = websitePages?.find(p => p.id === selectedPageId);
    if (!page) return;

    setSubmitError(null);
    try {
      await linkMutation.mutateAsync({
        pageUrl: page.published_url || page.page_url,
        websitePageId: page.id,
        source: "internal"
      });
      onClose();
      setSelectedWebsiteProjectId("");
      setSelectedPageId("");
    } catch (err: any) {
      setSubmitError(err.message || "Đã xảy ra lỗi khi kết nối trang.");
    }
  };

  const handleLinkExternal = async (data: { pageUrl: string }) => {
    setSubmitError(null);
    try {
      await linkMutation.mutateAsync({
        pageUrl: data.pageUrl,
        websitePageId: null,
        source: "external"
      });
      reset();
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || "Đã xảy ra lỗi khi kết nối trang.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Kết nối Landing Page</h3>
            <p className="text-xs text-slate-500 mt-0.5">Liên kết trang Landing Page để AI SEO theo dõi và chấm điểm</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-2 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-slate-100 mx-6 mt-6 rounded-xl">
          <button
            onClick={() => { setSourceType("internal"); setSubmitError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-lg transition duration-150 ${
              sourceType === "internal"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Library className="w-4 h-4" />
            Website Builder
          </button>
          <button
            onClick={() => { setSourceType("external"); setSubmitError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-lg transition duration-150 ${
              sourceType === "external"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Globe className="w-4 h-4" />
            URL bên ngoài
          </button>
        </div>

        {/* Content body */}
        <div className="p-6">
          {submitError && (
            <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs px-4 py-3 rounded-xl flex items-start gap-2.5 font-bold">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {sourceType === "internal" ? (
            <div className="space-y-4">
              {/* Project select */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Dự án Website Builder
                </label>
                {loadingProjects ? (
                  <div className="flex items-center justify-center py-3 bg-slate-50 border border-slate-150 rounded-xl">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <select
                    value={selectedWebsiteProjectId}
                    onChange={(e) => {
                      setSelectedWebsiteProjectId(e.target.value);
                      setSelectedPageId("");
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                  >
                    <option value="">-- Chọn dự án website --</option>
                    {websiteProjects?.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name} ({proj.domain})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Page select */}
              {selectedWebsiteProjectId && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Trang Landing Page con
                  </label>
                  {loadingPages ? (
                    <div className="flex items-center justify-center py-3 bg-slate-50 border border-slate-150 rounded-xl">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    </div>
                  ) : (
                    <select
                      value={selectedPageId}
                      onChange={(e) => setSelectedPageId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                    >
                      <option value="">-- Chọn trang con --</option>
                      {websitePages?.map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.title} ({page.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Status Warning if draft */}
              {selectedPageId && websitePages?.find(p => p.id === selectedPageId)?.status === "draft" && (
                <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs px-4 py-3.5 rounded-xl flex gap-2.5">
                  <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block">Trang chưa được xuất bản!</span>
                    <span className="text-[11px] font-medium text-amber-700 block mt-0.5">
                      Trang này đang ở trạng thái bản nháp. Bạn vẫn có thể liên kết nó, nhưng cần xuất bản trước khi chạy quét SEO.
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleLinkInternal}
                  disabled={linkMutation.isPending || !selectedPageId}
                  className="w-full bg-slate-950 text-white font-extrabold text-xs py-3.5 rounded-xl hover:bg-slate-900 transition flex items-center justify-center gap-2 shadow-lg shadow-slate-950/15 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {linkMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4" />
                      Kết nối Landing Page
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleLinkExternal)} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Đường dẫn Landing Page URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="https://example.com/landing-page"
                    {...register("pageUrl")}
                    className={`w-full bg-white border ${
                      errors.pageUrl ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:ring-slate-900"
                    } rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:border-transparent transition`}
                  />
                </div>
                {errors.pageUrl && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1.5">
                    {errors.pageUrl.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={linkMutation.isPending}
                  className="w-full bg-slate-950 text-white font-extrabold text-xs py-3.5 rounded-xl hover:bg-slate-900 transition flex items-center justify-center gap-2 shadow-lg shadow-slate-950/15 disabled:opacity-50"
                >
                  {linkMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Đang kết nối...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4" />
                      Kết nối Landing Page
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
export default ConnectLandingPageModal;
