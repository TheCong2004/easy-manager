import React from "react";
import { FooterProps } from "../types";

export const FooterSection: React.FC<FooterProps> = ({
  sectionId,
  mode = "preview",
  onFieldClick,
  title,
  subtitle,
}) => {
  const isEdit = mode === "edit";
  const displayTitle = title || "© 2026 Bản quyền thuộc về doanh nghiệp.";
  const displaySubtitle = subtitle || "Chính sách bảo mật | Điều khoản sử dụng";

  return (
    <footer className="py-10 px-6 bg-zinc-800 text-white text-center dark:bg-boxdark dark:border-t dark:border-strokedark">
      {isEdit ? (
        <p
          onClick={() => onFieldClick?.(sectionId, "title", displayTitle)}
          className="text-sm font-semibold cursor-pointer hover:bg-white/10 p-1 rounded transition max-w-xl mx-auto inline-block"
        >
          {displayTitle}
        </p>
      ) : (
        <p className="text-sm font-semibold">{displayTitle}</p>
      )}

      {displaySubtitle && (
        isEdit ? (
          <p
            onClick={() => onFieldClick?.(sectionId, "subtitle", displaySubtitle)}
            className="text-xs text-gray-400 mt-2 cursor-pointer hover:bg-white/10 p-1 rounded transition max-w-xl mx-auto"
          >
            {displaySubtitle}
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-2">{displaySubtitle}</p>
        )
      )}
    </footer>
  );
};

export default FooterSection;
