import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Loader2 } from "lucide-react";
import { useConnectedLandingPagesQuery } from "../../hooks/useLandingPageQueries";
import AiSeoLandingPageScoreCards from "./AiSeoLandingPageScoreCards";
import AiSeoLandingPageTable from "./AiSeoLandingPageTable";
import ConnectLandingPageModal from "./ConnectLandingPageModal";
import AiSeoLandingPageTaskDrawer from "./AiSeoLandingPageTaskDrawer";

interface AiSeoLandingPagesPanelProps {
  projectId: string;
  orgId?: string;
}

export function AiSeoLandingPagesPanel({
  projectId,
  orgId = "org-1"
}: AiSeoLandingPagesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [selectedTaskPage, setSelectedTaskPage] = useState<{ id: string; url: string } | null>(null);

  const { data: pages, isLoading } = useConnectedLandingPagesQuery(orgId, projectId);

  const filteredPages = pages?.filter(p =>
    p.pageUrl.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/ai-seo"
            className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại Dashboard AI SEO
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Quản lý Landing Pages
            </h1>
            <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
              Tích hợp Website Builder
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Liên kết các trang con hoặc Landing Page từ Website Builder để đo lường, kiểm toán và chấm điểm tối ưu hóa SEO.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsConnectOpen(true)}
          className="sm:self-end bg-slate-950 text-white font-extrabold text-xs px-4.5 py-3 rounded-xl hover:bg-slate-900 transition flex items-center justify-center gap-2 shadow-lg shadow-slate-950/15 shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          Kết nối Landing Page
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-9 h-9 animate-spin text-slate-950" />
          <span className="text-xs text-slate-500 font-extrabold">Đang tải danh sách trang liên kết...</span>
        </div>
      ) : (
        <>
          {/* Summary Score Cards */}
          <AiSeoLandingPageScoreCards pages={pages || []} />

          {/* Table list section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            {/* Search and Filters */}
            <div className="flex items-center gap-3 mb-6 max-w-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Pages Table */}
            <AiSeoLandingPageTable
              pages={filteredPages}
              projectId={projectId}
              orgId={orgId}
              onViewTasks={(id, url) => setSelectedTaskPage({ id, url })}
            />
          </div>
        </>
      )}

      {/* Modals & Slide Drawers */}
      <ConnectLandingPageModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        projectId={projectId}
        orgId={orgId}
      />

      {selectedTaskPage && (
        <AiSeoLandingPageTaskDrawer
          isOpen={true}
          onClose={() => setSelectedTaskPage(null)}
          pageId={selectedTaskPage.id}
          pageUrl={selectedTaskPage.url}
          projectId={projectId}
          orgId={orgId}
        />
      )}
    </div>
  );
}
export default AiSeoLandingPagesPanel;
