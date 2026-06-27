"use client";

import React, { useEffect, useRef, useState } from "react";
import { EditorBlock, getNodeKind } from "../types";

interface EditorContextToolbarProps {
  block: EditorBlock;
  zoom: number;
  orientation?: "horizontal" | "vertical";
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onMoveToFirst?: () => void;
  onMoveToLast?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onToggleHidden?: () => void;
  isHidden?: boolean;
  onOpenSettings?: () => void;
  onAddFormField?: () => void;
  onSaveFormData?: () => void;
}

const ToolbarButton: React.FC<{
  title: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  danger?: boolean;
  active?: boolean;
  disabled?: boolean;
}> = ({ title, onClick, children, danger, active, disabled }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={onClick}
    className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] transition disabled:cursor-not-allowed disabled:opacity-30 ${
      danger
        ? "text-red-500 hover:bg-red-50 hover:text-red-650"
        : active
        ? "bg-[#ede9fe] text-[#3b0df6]"
        : "text-[#111827] hover:bg-[#f3f4f6]"
    }`}
  >
    {children}
  </button>
);

const Divider: React.FC<{ vertical?: boolean }> = ({ vertical }) =>
  vertical ? (
    <div className="my-0.5 h-px w-5 bg-[#e5e7eb]" />
  ) : (
    <div className="mx-0.5 h-5 w-px bg-[#e5e7eb]" />
  );

const MenuItem: React.FC<{
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}> = ({ label, onClick, danger, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation();
      if (!disabled) onClick();
    }}
    className={`flex h-[28px] w-full cursor-pointer items-center px-2.5 text-left text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
      danger ? "text-red-600 hover:bg-red-50" : "text-[#374151] hover:bg-[#f3f4f6]"
    }`}
  >
    {label}
  </button>
);

export const EditorContextToolbar: React.FC<EditorContextToolbarProps> = ({
  block,
  zoom,
  orientation = "horizontal",
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onMoveToFirst,
  onMoveToLast,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onToggleHidden,
  isHidden = false,
  onOpenSettings,
  onAddFormField,
  onSaveFormData,
}) => {
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const layerMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const isSection = getNodeKind(block.type, block.kind) === "section";
  const isForm = block.type === "form_capture";
  const isVertical = orientation === "vertical";

  useEffect(() => {
    if (!isLayerMenuOpen && !isMoreMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (layerMenuRef.current && !layerMenuRef.current.contains(event.target as Node)) {
        setIsLayerMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLayerMenuOpen(false);
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isLayerMenuOpen, isMoreMenuOpen]);

  const hasLayerActions =
    onMoveUp ||
    onMoveDown ||
    onMoveToFirst ||
    onMoveToLast ||
    onBringForward ||
    onSendBackward ||
    onBringToFront ||
    onSendToBack ||
    onToggleHidden;

  const toolbarOffset = 38 / zoom;

  const positionStyle: React.CSSProperties = isVertical
    ? {
        right: `-${toolbarOffset}px`,
        top: "50%",
        transform: `translateY(-50%) scale(${1 / zoom})`,
        transformOrigin: "left center",
      }
    : {
        bottom: `-${toolbarOffset}px`,
        left: "50%",
        transform: `translateX(-50%) scale(${1 / zoom})`,
        transformOrigin: "top center",
      };

  const renderLayerMenu = () => (
    <div
      className={`absolute z-[60] min-w-[170px] overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white py-0.5 shadow-lg ${
        isVertical
          ? "left-full top-1/2 ml-2 -translate-y-1/2"
          : "bottom-full left-1/2 mb-2 -translate-x-1/2"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {isSection && onMoveUp && (
        <MenuItem label="Di chuyển section lên" onClick={() => { onMoveUp(); setIsLayerMenuOpen(false); }} />
      )}
      {isSection && onMoveDown && (
        <MenuItem label="Di chuyển section xuống" onClick={() => { onMoveDown(); setIsLayerMenuOpen(false); }} />
      )}
      {isSection && onMoveToFirst && (
        <MenuItem label="Đưa section lên đầu" onClick={() => { onMoveToFirst(); setIsLayerMenuOpen(false); }} />
      )}
      {isSection && onMoveToLast && (
        <MenuItem label="Đưa section xuống cuối" onClick={() => { onMoveToLast(); setIsLayerMenuOpen(false); }} />
      )}
      {!isSection && onBringForward && (
        <MenuItem label="Đưa lên một lớp" onClick={() => { onBringForward(); setIsLayerMenuOpen(false); }} />
      )}
      {!isSection && onSendBackward && (
        <MenuItem label="Đưa xuống một lớp" onClick={() => { onSendBackward(); setIsLayerMenuOpen(false); }} />
      )}
      {!isSection && onBringToFront && (
        <MenuItem label="Đưa lên trên cùng" onClick={() => { onBringToFront(); setIsLayerMenuOpen(false); }} />
      )}
      {!isSection && onSendToBack && (
        <MenuItem label="Đưa xuống dưới cùng" onClick={() => { onSendToBack(); setIsLayerMenuOpen(false); }} />
      )}
      {!isSection && onBringForward && (
        <MenuItem label="Tăng z-index" onClick={() => { onBringForward(); setIsLayerMenuOpen(false); }} />
      )}
      {!isSection && onSendBackward && (
        <MenuItem label="Giảm z-index" onClick={() => { onSendBackward(); setIsLayerMenuOpen(false); }} />
      )}
      {onToggleHidden && (
        <MenuItem
          label={isHidden ? "Hiện section" : isSection ? "Ẩn section" : "Ẩn phần tử"}
          onClick={() => { onToggleHidden(); setIsLayerMenuOpen(false); }}
        />
      )}
      <Divider />
      <MenuItem label="Nhân bản" onClick={() => { onDuplicate(); setIsLayerMenuOpen(false); }} />
      <MenuItem label="Xóa" danger onClick={() => { onDelete(); setIsLayerMenuOpen(false); }} />
    </div>
  );

  return (
    <div
      className={`absolute z-50 flex gap-1 rounded-[10px] border border-[#e5e7eb] bg-white p-1 shadow-[0_4px_16px_rgba(15,23,42,0.08)] select-none ${
        isVertical ? "w-[36px] flex-col items-center py-1.5" : "h-[36px] items-center px-1.5"
      }`}
      style={positionStyle}
    >
      {isSection && onOpenSettings && (
        <ToolbarButton title="Cài đặt section" onClick={(e) => { e.stopPropagation(); onOpenSettings(); }}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.193c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774a1.125 1.125 0 01.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.094c0 .55-.398 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.164.398-.143.854.107 1.204l.527.738a1.125 1.125 0 01-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.448-.12l-.774-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </ToolbarButton>
      )}

      {isSection && onMoveUp && (
        <ToolbarButton title="Di chuyển section lên" onClick={(e) => { e.stopPropagation(); onMoveUp(); }}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </ToolbarButton>
      )}

      {isSection && onMoveDown && (
        <ToolbarButton title="Di chuyển section xuống" onClick={(e) => { e.stopPropagation(); onMoveDown(); }}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </ToolbarButton>
      )}

      {isSection && onToggleHidden && (
        <ToolbarButton
          title={isHidden ? "Hiện section" : "Ẩn section"}
          active={isHidden}
          onClick={(e) => { e.stopPropagation(); onToggleHidden(); }}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            {isHidden ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            )}
          </svg>
        </ToolbarButton>
      )}

      {!isSection && hasLayerActions && (
        <div className="relative font-sans" ref={layerMenuRef}>
          <ToolbarButton
            title="Thứ tự lớp / di chuyển"
            active={isLayerMenuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setIsLayerMenuOpen((open) => !open);
              setIsMoreMenuOpen(false);
            }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h12M6 12h12M6 18h12" />
            </svg>
          </ToolbarButton>
          {isLayerMenuOpen && renderLayerMenu()}
        </div>
      )}

      {isForm && onAddFormField && (
        <ToolbarButton title="Thêm trường" onClick={(e) => { e.stopPropagation(); onAddFormField(); }}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </ToolbarButton>
      )}

      {isForm && onSaveFormData && (
        <ToolbarButton title="Lưu cấu hình form" onClick={(e) => { e.stopPropagation(); onSaveFormData(); }}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </ToolbarButton>
      )}

      <Divider vertical={isVertical} />

      <ToolbarButton title="Nhân bản" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9m9 9H3.375" />
        </svg>
      </ToolbarButton>

      <ToolbarButton title="Xóa" onClick={(e) => { e.stopPropagation(); onDelete(); }} danger>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </ToolbarButton>

      {!isSection && onOpenSettings && (
        <>
          <Divider vertical={isVertical} />
          <ToolbarButton title="Cài đặt" onClick={(e) => { e.stopPropagation(); onOpenSettings(); }}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.193c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774a1.125 1.125 0 01.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.094c0 .55-.398 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.164.398-.143.854.107 1.204l.527.738a1.125 1.125 0 01-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.448-.12l-.774-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </ToolbarButton>
        </>
      )}

      {(isSection ? hasLayerActions : true) && (
        <div className="relative font-sans" ref={moreMenuRef}>
          <ToolbarButton
            title="Thêm thao tác"
            active={isMoreMenuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setIsMoreMenuOpen((open) => !open);
              setIsLayerMenuOpen(false);
            }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </ToolbarButton>
          {isMoreMenuOpen && (
            <div
              className={`absolute z-[60] min-w-[170px] overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white py-0.5 shadow-lg ${
                isVertical
                  ? "left-full top-1/2 ml-2 -translate-y-1/2"
                  : "bottom-full left-1/2 mb-2 -translate-x-1/2"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {isSection && hasLayerActions && (
                <>
                  {onMoveToFirst && (
                    <MenuItem label="Đưa section lên đầu" onClick={() => { onMoveToFirst(); setIsMoreMenuOpen(false); }} />
                  )}
                  {onMoveToLast && (
                    <MenuItem label="Đưa section xuống cuối" onClick={() => { onMoveToLast(); setIsMoreMenuOpen(false); }} />
                  )}
                  <Divider />
                </>
              )}
              {!isSection && onToggleHidden && (
                <MenuItem
                  label={isHidden ? "Hiện phần tử" : "Ẩn phần tử"}
                  onClick={() => { onToggleHidden(); setIsMoreMenuOpen(false); }}
                />
              )}
              {onOpenSettings && (
                <MenuItem label="Mở inspector" onClick={() => { onOpenSettings(); setIsMoreMenuOpen(false); }} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function getBlockDisplayLabel(block: EditorBlock): string {
  const typeLabel = (block.type || "block").replace(/_/g, " ").toUpperCase();
  const shortId = block.id.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || "0000";
  const kindPrefix =
    getNodeKind(block.type, block.kind) === "section" ? "SECTION" :
    getNodeKind(block.type, block.kind) === "container" ? "GROUP" :
    block.type === "form_capture" ? "FORM" :
    block.type === "html_code" ? "HTML" :
    typeLabel.split(" ")[0];
  return `${kindPrefix}${shortId}`;
}