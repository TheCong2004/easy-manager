import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebsiteJob, websiteQueryKeys } from "@/hooks/use-website-builder";

// --- JobStatusBadge Component ---
interface JobStatusBadgeProps {
  status: "queued" | "processing" | "success" | "failed" | string;
  className?: string;
}

export const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ status, className = "" }) => {
  const normStatus = status.toLowerCase();

  let styles = "bg-gray-100 text-gray-700 dark:bg-meta-4 dark:text-gray-300";
  let label = "Chờ xử lý";

  switch (normStatus) {
    case "queued":
      styles = "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500 animate-pulse";
      label = "Đang chờ...";
      break;
    case "processing":
      styles = "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-500 animate-pulse";
      label = "Đang xử lý...";
      break;
    case "building":
      styles = "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-500 animate-pulse";
      label = "Đang build...";
      break;
    case "deploying":
      styles = "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-500 animate-pulse";
      label = "Đang deploy...";
      break;
    case "live":
    case "success":
      styles = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-500";
      label = normStatus === "live" ? "Live" : "Thành công";
      break;
    case "failed":
      styles = "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-500";
      label = "Thất bại";
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${styles} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        normStatus === "queued" ? "bg-amber-500" :
        normStatus === "building" ? "bg-blue-500" :
        normStatus === "deploying" ? "bg-indigo-500" :
        (normStatus === "success" || normStatus === "live") ? "bg-emerald-500" :
        normStatus === "failed" ? "bg-rose-500" : "bg-gray-400"
      }`}></span>
      {label}
    </span>
  );
};


// --- JobProgressModal Component ---
interface JobProgressModalProps {
  jobId: string;
  onSuccess?: (projectId: string) => void;
  onFailed?: (error?: string) => void;
  onClose?: () => void;
  title?: string;
}

export const JobProgressModal: React.FC<JobProgressModalProps> = ({
  jobId,
  onSuccess,
  onFailed,
  onClose,
  title,
}) => {
  const queryClient = useQueryClient();
  const [isPolling, setIsPolling] = useState(true);

  // Reset polling state when jobId changes
  useEffect(() => {
    setIsPolling(true);
  }, [jobId]);

  // Poll API every 2s, stop if success/failed
  const { data: job, error: queryError } = useWebsiteJob(jobId, {
    enabled: !!jobId && isPolling,
    refetchInterval: 2000,
  });

  // Stop polling when success/failed/live status is detected
  useEffect(() => {
    if (job && (job.status === "success" || job.status === "failed" || job.status === "live")) {
      setIsPolling(false);
    }
  }, [job?.status]);

  const status = job?.status || "processing";
  const progress = job?.progress ?? 5;
  const errorMsg = job?.error || (queryError ? "Lỗi kết nối máy chủ" : "");

  // Detect status change to trigger callback & invalidate queries
  useEffect(() => {
    if (!job) return;

    if (job.status === "success" || job.status === "live") {
      // Invalidate project cache to refresh lists and detail views
      queryClient.invalidateQueries({ queryKey: websiteQueryKeys.projects.all });
      if (job.projectId) {
        queryClient.invalidateQueries({ queryKey: websiteQueryKeys.projects.detail(job.projectId) });
        onSuccess?.(job.projectId);
      }
    } else if (job.status === "failed") {
      onFailed?.(errorMsg);
    }
  }, [job?.status, job?.projectId, queryClient]);

  // Determine progress text helper based on job type
  const getProgressMessage = () => {
    if (status === "failed") return `Lỗi: ${errorMsg || "Tác vụ thất bại"}`;
    if (status === "success" || status === "live") return "Tác vụ hoàn thành thành công!";

    const jobType = job?.type || "generate";
    if (jobType === "generate") {
      if (progress < 25) return "Đang phân tích ý tưởng website và ngành nghề...";
      if (progress < 55) return "Đang khởi tạo các trang và cấu trúc schema...";
      if (progress < 85) return "Đang phối hợp màu sắc và viết mô tả sản phẩm...";
      return "Đang tối ưu hóa giao diện trên thiết bị di động...";
    } else if (jobType === "clone") {
      if (progress < 25) return "Đang kết nối tới URL nguồn...";
      if (progress < 55) return "Đang phân tích mã nguồn HTML và tài nguyên CSS...";
      if (progress < 85) return "Đang chuyển đổi cấu trúc sang JSON Schema...";
      return "Đang tải ảnh và tối ưu hóa tài nguyên...";
    } else if (jobType === "import") {
      if (progress < 25) return "Đang giải nén tập tin lưu trữ...";
      if (progress < 55) return "Đang phân tích các file HTML/ZIP...";
      if (progress < 85) return "Đang biên dịch thành các sections tương thích...";
      return "Đang liên kết dữ liệu canvas...";
    } else if (jobType === "publish") {
      if (status === "queued") return "Đang xếp hàng xuất bản (Queued)...";
      if (status === "building") return "Đang biên dịch và đóng gói mã nguồn (Building)...";
      if (status === "deploying") return "Đang phân phối tài nguyên lên CDN (Deploying)...";
      return "Đang cấu hình máy chủ xuất bản...";
    } else {
      if (progress < 50) return "Đang đóng gói tài nguyên phân phối...";
      return "Đang cập nhật bản ghi DNS và xuất bản trang...";
    }
  };

  const displayTitle = title || (
    job?.type === "clone" ? "Đang Clone giao diện Website" :
    job?.type === "import" ? "Đang Import tệp giao diện" :
    job?.type === "publish" ? "Đang xuất bản Website" :
    "AI đang thiết kế Landing Page của bạn"
  );

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-md bg-white p-6 shadow-xl dark:bg-boxdark border border-stroke dark:border-strokedark text-center">
        {status === "failed" ? (
          <div className="flex flex-col items-center justify-center">
            <span className="text-4xl text-rose-500 font-mono mb-4">✕</span>
            <h3 className="text-lg font-bold text-black dark:text-white mb-2">Tác vụ thất bại</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
              {getProgressMessage()}
            </p>
            <button
              onClick={onClose}
              className="rounded bg-primary py-2 px-6 text-sm font-semibold text-white hover:bg-opacity-90 transition"
            >
              Đóng
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 mb-5 relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary animate-spin"></div>
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-extrabold text-sm">
                {(status === "success" || status === "live") ? "✓" : "AI"}
              </div>
            </div>

            <h3 className="text-lg font-bold text-black dark:text-white mb-2">{displayTitle}</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 min-h-[40px] max-w-xs leading-relaxed">
              {getProgressMessage()}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-sm font-extrabold text-primary">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
