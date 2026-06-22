import React from "react";
import { NavbarProps } from "../types";

export const NavbarSection: React.FC<NavbarProps> = ({
  sectionId,
  mode = "preview",
  onFieldClick,
  title,
  items = [],
}) => {
  const isEdit = mode === "edit";
  const displayTitle = title || "Logo Brand";

  return (
    <header className="py-4 px-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-50 shadow-sm dark:bg-boxdark dark:border-strokedark">
      {isEdit ? (
        <span
          onClick={() => onFieldClick?.(sectionId, "title", displayTitle)}
          className="font-bold text-lg text-black dark:text-white cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 p-1 rounded transition"
        >
          {displayTitle}
        </span>
      ) : (
        <span className="font-bold text-lg text-black dark:text-white">
          {displayTitle}
        </span>
      )}

      <div className="flex gap-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
        {items.map((item, i) => {
          const itemTitle = item.title || `Menu ${i + 1}`;
          const itemLink = item.description || "#";
          
          return isEdit ? (
            <span
              key={i}
              className="hover:text-black dark:hover:text-white cursor-pointer p-1 rounded transition"
            >
              {itemTitle}
            </span>
          ) : (
            <a
              key={i}
              href={itemLink}
              className="hover:text-primary dark:hover:text-primary transition-all"
            >
              {itemTitle}
            </a>
          );
        })}
      </div>
    </header>
  );
};

export default NavbarSection;
