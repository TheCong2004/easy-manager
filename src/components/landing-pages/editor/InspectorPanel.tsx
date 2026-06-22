"use client";
import React, { useCallback, useState } from "react";
import { EditorBlock, BlockType, EditorData, DeviceMode, ElementFrame, getEffectiveFrame } from "./types";

// ── Field sub-components (Light Theme) ──────────────────────────────────────

const FieldLabel: React.FC<{ label: string; hint?: string }> = ({ label, hint }) => (
  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
    {label}
    {hint && <span className="ml-1 text-gray-400 normal-case font-medium text-[10px]">({hint})</span>}
  </label>
);

const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  multiline?: boolean;
  rows?: number;
}> = ({ label, value, onChange, hint, multiline, rows = 3 }) => (
  <div>
    <FieldLabel label={label} hint={hint} />
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none shadow-sm font-mono"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 shadow-sm"
      />
    )}
  </div>
);

const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  hint?: string;
}> = ({ label, value, onChange, min = 0, max = 2000, step = 1, unit, hint }) => (
  <div>
    <FieldLabel label={label} hint={hint} />
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-purple-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md px-2 py-1 min-w-[56px] shadow-sm">
        <input
          type="number"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-10 text-xs bg-transparent text-gray-800 font-bold focus:outline-none text-right"
        />
        {unit && <span className="text-[10px] text-gray-400 font-bold">{unit}</span>}
      </div>
    </div>
  </div>
);

const ColorField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div>
    <FieldLabel label={label} />
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value.startsWith("#") ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded-md border border-gray-250 cursor-pointer bg-transparent p-0.5 flex-shrink-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 font-mono shadow-sm"
        placeholder="#000000"
      />
    </div>
  </div>
);

const SelectField: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div>
    <FieldLabel label={label} />
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 cursor-pointer shadow-sm"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const ToggleField: React.FC<{
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${value ? "bg-purple-650" : "bg-gray-300"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : ""}`} />
    </button>
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-2 mt-5 mb-3 first:mt-0">
    <span className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase">{title}</span>
    <div className="flex-1 h-px bg-gray-200" />
  </div>
);

// ── Per-block field definitions ───────────────────────────────

type UpdateFn = (key: string, value: unknown) => void;

const HeroInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Nội dung" />
    <TextField label="Tiêu đề chính" value={p.headline as string} onChange={(v) => update("headline", v)} />
    <TextField label="Tiêu đề phụ" value={p.subheadline as string} onChange={(v) => update("subheadline", v)} multiline />
    <TextField label="Nút CTA — văn bản" value={p.ctaText as string} onChange={(v) => update("ctaText", v)} />
    <TextField label="Nút CTA — đường dẫn" value={p.ctaUrl as string} onChange={(v) => update("ctaUrl", v)} hint="URL" />
    <SectionHeader title="Hình thức" />
    <SelectField label="Căn chỉnh văn bản" value={p.textAlign as string} options={[{value:"left",label:"Trái"},{value:"center",label:"Giữa"},{value:"right",label:"Phải"}]} onChange={(v) => update("textAlign", v)} />
    <NumberField label="Chiều cao tối thiểu" value={p.minHeight as number} onChange={(v) => update("minHeight", v)} min={200} max={1000} step={10} unit="px" />
    <SectionHeader title="Màu sắc" />
    <ColorField label="Màu nút CTA" value={p.ctaColor as string} onChange={(v) => update("ctaColor", v)} />
    <ColorField label="Màu nền" value={p.bgColor as string} onChange={(v) => update("bgColor", v)} />
    <TextField label="URL ảnh nền" value={p.bgImage as string} onChange={(v) => update("bgImage", v)} hint="https://..." />
    {p.bgImage && (
      <NumberField label="Độ mờ overlay" value={p.overlayOpacity as number} onChange={(v) => update("overlayOpacity", v)} min={0} max={1} step={0.05} hint="0–1" />
    )}
  </>
);

const TextInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Nội dung" />
    <TextField label="Văn bản" value={p.content as string} onChange={(v) => update("content", v)} multiline />
    <SectionHeader title="Typography" />
    <NumberField label="Kích thước chữ" value={p.fontSize as number} onChange={(v) => update("fontSize", v)} min={10} max={80} unit="px" />
    <NumberField label="Chiều cao dòng" value={p.lineHeight as number} onChange={(v) => update("lineHeight", v)} min={1} max={3} step={0.05} hint="x" />
    <SelectField label="Căn chỉnh" value={p.textAlign as string} options={[{value:"left",label:"Trái"},{value:"center",label:"Giữa"},{value:"right",label:"Phải"}]} onChange={(v) => update("textAlign", v)} />
    <SectionHeader title="Màu & Khoảng cách" />
    <ColorField label="Màu chữ" value={p.color as string} onChange={(v) => update("color", v)} />
    <NumberField label="Padding trái/phải" value={p.paddingX as number} onChange={(v) => update("paddingX", v)} max={200} unit="px" />
    <NumberField label="Padding trên/dưới" value={p.paddingY as number} onChange={(v) => update("paddingY", v)} max={200} unit="px" />
  </>
);

const ImageInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Hình ảnh" />
    <TextField label="URL ảnh" value={p.src as string} onChange={(v) => update("src", v)} hint="https://..." />
    <TextField label="Alt text" value={p.alt as string} onChange={(v) => update("alt", v)} />
    <TextField label="Caption" value={p.caption as string} onChange={(v) => update("caption", v)} />
    <SectionHeader title="Hình thức" />
    <SelectField label="Kích thước" value={p.width as string} options={[{value:"full",label:"Toàn chiều rộng"},{value:"large",label:"Lớn (80%)"},{value:"medium",label:"Trung bình (60%)"},{value:"small",label:"Nhỏ (40%)"}]} onChange={(v) => update("width", v)} />
    <SelectField label="Object fit" value={p.objectFit as string} options={[{value:"cover",label:"Cover"},{value:"contain",label:"Contain"},{value:"fill",label:"Fill"}]} onChange={(v) => update("objectFit", v)} />
    <NumberField label="Bo góc" value={p.borderRadius as number} onChange={(v) => update("borderRadius", v)} max={48} unit="px" />
    <ToggleField label="Hiện caption" value={p.showCaption as boolean} onChange={(v) => update("showCaption", v)} />
  </>
);

const ButtonInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Nội dung" />
    <TextField label="Văn bản nút" value={p.label as string} onChange={(v) => update("label", v)} />
    <TextField label="Đường dẫn (URL)" value={p.url as string} onChange={(v) => update("url", v)} />
    <SectionHeader title="Giao diện" />
    <SelectField label="Kiểu nút" value={p.style as string} options={[{value:"filled",label:"Đặc (Filled)"},{value:"outline",label:"Viền (Outline)"},{value:"ghost",label:"Ghost"}]} onChange={(v) => update("style", v)} />
    <SelectField label="Kích thước" value={p.size as string} options={[{value:"sm",label:"Nhỏ"},{value:"md",label:"Trung bình"},{value:"lg",label:"Lớn"}]} onChange={(v) => update("size", v)} />
    <SelectField label="Căn chỉnh" value={p.align as string} options={[{value:"left",label:"Trái"},{value:"center",label:"Giữa"},{value:"right",label:"Phải"}]} onChange={(v) => update("align", v)} />
    <SectionHeader title="Màu sắc & Bo góc" />
    <ColorField label="Màu nền / viền" value={p.color as string} onChange={(v) => update("color", v)} />
    <ColorField label="Màu chữ" value={p.textColor as string} onChange={(v) => update("textColor", v)} />
    <NumberField label="Bo góc" value={p.borderRadius as number} onChange={(v) => update("borderRadius", v)} max={50} unit="px" />
    <ToggleField label="Toàn chiều rộng" value={p.fullWidth as boolean} onChange={(v) => update("fullWidth", v)} />
  </>
);

const SpacerInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Khoảng cách" />
    <NumberField label="Chiều cao" value={p.height as number} onChange={(v) => update("height", v)} min={8} max={400} step={4} unit="px" />
    <SectionHeader title="Màu sắc" />
    <ColorField label="Màu nền" value={(p.bgColor as string) === "transparent" ? "#ffffff" : (p.bgColor as string)} onChange={(v) => update("bgColor", v)} />
  </>
);

const DividerInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Đường kẻ" />
    <ColorField label="Màu" value={p.color as string} onChange={(v) => update("color", v)} />
    <NumberField label="Độ dày" value={p.thickness as number} onChange={(v) => update("thickness", v)} min={1} max={10} unit="px" />
    <SelectField label="Kiểu đường" value={p.style as string} options={[{value:"solid",label:"Liền"},{value:"dashed",label:"Gạch"},{value:"dotted",label:"Chấm"}]} onChange={(v) => update("style", v)} />
    <SectionHeader title="Khoảng cách" />
    <NumberField label="Padding trên/dưới" value={p.paddingY as number} onChange={(v) => update("paddingY", v)} max={100} unit="px" />
  </>
);

const ColumnsInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Bố cục" />
    <NumberField label="Số cột" value={p.columns as number} onChange={(v) => update("columns", v)} min={2} max={4} step={1} />
    <NumberField label="Khoảng cách giữa cột" value={p.gap as number} onChange={(v) => update("gap", v)} min={0} max={80} unit="px" />
  </>
);

const FeatureCardInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Nội dung" />
    <TextField label="Icon (emoji)" value={p.icon as string} onChange={(v) => update("icon", v)} />
    <TextField label="Tiêu đề" value={p.title as string} onChange={(v) => update("title", v)} />
    <TextField label="Mô tả" value={p.description as string} onChange={(v) => update("description", v)} multiline />
    <SectionHeader title="Màu sắc" />
    <ColorField label="Màu icon" value={p.iconColor as string} onChange={(v) => update("iconColor", v)} />
    <ColorField label="Nền icon" value={p.iconBg as string} onChange={(v) => update("iconBg", v)} />
    <ColorField label="Màu nền card" value={p.bgColor as string} onChange={(v) => update("bgColor", v)} />
    <ColorField label="Màu viền" value={p.borderColor as string} onChange={(v) => update("borderColor", v)} />
    <NumberField label="Bo góc" value={p.borderRadius as number} onChange={(v) => update("borderRadius", v)} max={32} unit="px" />
  </>
);

const TestimonialInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Nội dung" />
    <TextField label="Nội dung nhận xét" value={p.quote as string} onChange={(v) => update("quote", v)} multiline />
    <TextField label="Tên tác giả" value={p.authorName as string} onChange={(v) => update("authorName", v)} />
    <TextField label="Chức danh" value={p.authorRole as string} onChange={(v) => update("authorRole", v)} />
    <TextField label="URL avatar" value={p.authorAvatar as string} onChange={(v) => update("authorAvatar", v)} hint="https://..." />
    <SectionHeader title="Đánh giá & Màu sắc" />
    <NumberField label="Số sao" value={p.rating as number} onChange={(v) => update("rating", v)} min={1} max={5} step={1} unit="★" />
    <ToggleField label="Hiện đánh giá sao" value={p.showRating as boolean} onChange={(v) => update("showRating", v)} />
    <ColorField label="Màu nền" value={p.bgColor as string} onChange={(v) => update("bgColor", v)} />
    <ColorField label="Màu chữ" value={p.textColor as string} onChange={(v) => update("textColor", v)} />
  </>
);

const CountdownInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Cài đặt" />
    <TextField label="Tiêu đề" value={p.title as string} onChange={(v) => update("title", v)} />
    <div>
      <FieldLabel label="Ngày đếm ngược đến" />
      <input
        type="date"
        value={(p.targetDate as string).slice(0, 10)}
        onChange={(e) => update("targetDate", e.target.value)}
        className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 shadow-sm"
      />
    </div>
    <TextField label="Văn bản khi hết hạn" value={p.expiredText as string} onChange={(v) => update("expiredText", v)} />
    <SectionHeader title="Màu sắc" />
    <ColorField label="Màu nền" value={p.bgColor as string} onChange={(v) => update("bgColor", v)} />
    <ColorField label="Màu accent (ô số)" value={p.accentColor as string} onChange={(v) => update("accentColor", v)} />
  </>
);

const VideoInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Video" />
    <TextField label="URL YouTube / Vimeo" value={p.url as string} onChange={(v) => update("url", v)} hint="https://..." />
    <SelectField label="Tỷ lệ khung hình" value={p.aspectRatio as string} options={[{value:"16/9",label:"16:9 (Widescreen)"},{value:"4/3",label:"4:3 (Standard)"},{value:"1/1",label:"1:1 (Vuông)"}]} onChange={(v) => update("aspectRatio", v)} />
    <NumberField label="Bo góc" value={p.borderRadius as number} onChange={(v) => update("borderRadius", v)} max={32} unit="px" />
    <SectionHeader title="Điều khiển" />
    <ToggleField label="Tự động phát" value={p.autoplay as boolean} onChange={(v) => update("autoplay", v)} />
    <ToggleField label="Tắt tiếng" value={p.muted as boolean} onChange={(v) => update("muted", v)} />
    <ToggleField label="Hiện controls" value={p.controls as boolean} onChange={(v) => update("controls", v)} />
  </>
);

const FormCaptureInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => {
  const fields = p.fields as { id: string; label: string; type: string; required: boolean }[];
  return (
    <>
      <SectionHeader title="Nội dung form" />
      <TextField label="Tiêu đề form" value={p.title as string} onChange={(v) => update("title", v)} />
      <TextField label="Mô tả" value={p.subtitle as string} onChange={(v) => update("subtitle", v)} />
      <TextField label="Văn bản nút gửi" value={p.submitLabel as string} onChange={(v) => update("submitLabel", v)} />
      <SectionHeader title="Màu sắc & Bo góc" />
      <ColorField label="Màu nút gửi" value={p.submitColor as string} onChange={(v) => update("submitColor", v)} />
      <ColorField label="Màu nền form" value={p.bgColor as string} onChange={(v) => update("bgColor", v)} />
      <NumberField label="Bo góc" value={p.borderRadius as number} onChange={(v) => update("borderRadius", v)} max={32} unit="px" />
      <SectionHeader title={`Trường nhập (${fields.length})`} />
      {fields.map((f, i) => (
        <div key={f.id} className="p-2.5 bg-gray-50 border border-gray-250 rounded-lg mb-2 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Trường {i + 1}</span>
            {fields.length > 1 && (
              <button
                onClick={() => {
                  const next = fields.filter((_, fi) => fi !== i);
                  update("fields", next);
                }}
                className="text-red-500 text-[10px] hover:text-red-650 font-bold"
              >
                Xóa
              </button>
            )}
          </div>
          <input
            type="text"
            value={f.label}
            placeholder="Nhãn trường"
            onChange={(e) => {
              const next = [...fields];
              next[i] = { ...next[i], label: e.target.value };
              update("fields", next);
            }}
            className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 mb-1.5 shadow-inner"
          />
          <select
            value={f.type}
            onChange={(e) => {
              const next = [...fields];
              next[i] = { ...next[i], type: e.target.value };
              update("fields", next);
            }}
            className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 cursor-pointer shadow-sm"
          >
            <option value="text">Văn bản</option>
            <option value="email">Email</option>
            <option value="phone">Điện thoại</option>
          </select>
        </div>
      ))}
      <button
        onClick={() => update("fields", [...fields, { id: `f_${Date.now()}`, label: "Trường mới", type: "text", required: false }])}
        className="cursor-pointer w-full text-xs text-purple-600 border border-purple-300 rounded-lg py-2 hover:bg-purple-50 transition bg-white shadow-sm font-semibold"
      >
        + Thêm trường
      </button>
    </>
  );
};

const TeaLandingInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Template Herb Tea" />
    <TextField label="Brand Name" value={p.brand as string} onChange={(v) => update("brand", v)} />
    <TextField label="Hero Image Link" value={p.heroImage as string} onChange={(v) => update("heroImage", v)} hint="URL" />
    <SectionHeader title="Màu sắc" />
    <ColorField label="Màu Accent" value={p.accentColor as string} onChange={(v) => update("accentColor", v)} />
    <ColorField label="Nền trang" value={p.bgColor as string} onChange={(v) => update("bgColor", v)} />
  </>
);

const ChatWidgetInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Chat widget" />
    <TextField label="Tiêu đề" value={p.title as string} onChange={(v) => update("title", v)} />
    <TextField label="Lời chào" value={p.greeting as string} onChange={(v) => update("greeting", v)} multiline />
    <TextField label="Tên tư vấn viên" value={p.agentName as string} onChange={(v) => update("agentName", v)} />
    <TextField label="Thời gian phản hồi" value={p.replyTime as string} onChange={(v) => update("replyTime", v)} />
    <SectionHeader title="Kênh liên hệ" />
    <TextField label="Kênh chính" value={p.primaryChannel as string} onChange={(v) => update("primaryChannel", v)} />
    <TextField label="Kênh phụ" value={p.secondaryChannel as string} onChange={(v) => update("secondaryChannel", v)} />
    <TextField label="Nút bắt đầu" value={p.buttonLabel as string} onChange={(v) => update("buttonLabel", v)} />
    <SectionHeader title="Hiển thị" />
    <SelectField label="Vị trí" value={p.position as string} options={[{ value: "right", label: "Phải" }, { value: "left", label: "Trái" }]} onChange={(v) => update("position", v)} />
    <ToggleField label="Hiện câu hỏi nhanh" value={p.showSurvey as boolean} onChange={(v) => update("showSurvey", v)} />
    <ColorField label="Màu chính" value={p.accentColor as string} onChange={(v) => update("accentColor", v)} />
    <ColorField label="Màu nền" value={p.bgColor as string} onChange={(v) => update("bgColor", v)} />
  </>
);

const FunnelPopupInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Funnel popup" />
    <TextField label="Tiêu đề" value={p.title as string} onChange={(v) => update("title", v)} />
    <TextField label="Mô tả" value={p.description as string} onChange={(v) => update("description", v)} multiline />
    <TextField label="Nút CTA" value={p.ctaText as string} onChange={(v) => update("ctaText", v)} />
    <TextField label="Đường dẫn CTA" value={p.ctaUrl as string} onChange={(v) => update("ctaUrl", v)} />
    <SectionHeader title="Trigger" />
    <SelectField
      label="Kiểu kích hoạt"
      value={p.trigger as string}
      options={[
        { value: "immediate", label: "Ngay lập tức" },
        { value: "time_on_page", label: "Theo thời gian" },
        { value: "scroll_progress", label: "Theo cuộn trang" },
        { value: "exit_intent", label: "Thoát trang" },
        { value: "inactivity", label: "Không hoạt động" },
      ]}
      onChange={(v) => update("trigger", v)}
    />
    <NumberField label="Ngưỡng trigger" value={p.triggerValue as number} onChange={(v) => update("triggerValue", v)} min={0} max={10000} step={100} />
    <SelectField label="Tần suất" value={p.frequency as string} options={[{ value: "once", label: "Một lần" }, { value: "session", label: "Mỗi phiên" }, { value: "always", label: "Luôn hiện" }]} onChange={(v) => update("frequency", v)} />
    <SectionHeader title="Giao diện" />
    <TextField label="Ảnh popup" value={p.imageUrl as string} onChange={(v) => update("imageUrl", v)} hint="URL" />
    <ToggleField label="Nền mờ" value={p.showBackdrop as boolean} onChange={(v) => update("showBackdrop", v)} />
    <ColorField label="Màu CTA" value={p.accentColor as string} onChange={(v) => update("accentColor", v)} />
    <ColorField label="Màu nền popup" value={p.bgColor as string} onChange={(v) => update("bgColor", v)} />
  </>
);

// ── NEW: Product Card / Grid Inspector ────────────────────────
const ProductCardInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => {
  const items = p.items as { id: string; title: string; description: string; price: string; oldPrice?: string; image: string; badge?: string }[] | undefined;
  const isGrid = Array.isArray(items) && items.length > 0;

  const convertToGrid = () => {
    update("items", [
      {
        id: `p_${Date.now()}_1`,
        title: (p.title as string) || "Sản phẩm 1",
        description: (p.description as string) || "Mô tả sản phẩm 1",
        price: (p.price as string) || "399.000đ",
        oldPrice: (p.oldPrice as string) || "550.000đ",
        image: (p.image as string) || "/images/product/skincare_product.png",
        badge: (p.badge as string) || "Bán chạy"
      },
      {
        id: `p_${Date.now()}_2`,
        title: "Sản phẩm 2",
        description: "Mô tả sản phẩm 2",
        price: "249.000đ",
        oldPrice: "320.000đ",
        image: "/images/product/green_tea_product.png",
        badge: "Mới"
      }
    ]);
    update("columns", 2);
  };

  const convertToSingle = () => {
    if (isGrid && items.length > 0) {
      const first = items[0];
      update("title", first.title);
      update("description", first.description);
      update("price", first.price);
      update("oldPrice", first.oldPrice || "");
      update("image", first.image);
      update("badge", first.badge || "");
    }
    update("items", undefined);
    update("columns", undefined);
  };

  return (
    <>
      <SectionHeader title="Cài đặt khối sản phẩm" />
      <TextField label="Văn bản nút mua" value={(p.ctaText as string) || "MUA NGAY"} onChange={(v) => update("ctaText", v)} />
      <ColorField label="Màu nền khối" value={(p.bgColor as string) || "#ffffff"} onChange={(v) => update("bgColor", v)} />
      <ColorField label="Màu viền" value={(p.borderColor as string) || "#e2e8f0"} onChange={(v) => update("borderColor", v)} />
      <NumberField label="Bo góc thẻ" value={(p.borderRadius as number) || 16} onChange={(v) => update("borderRadius", v)} max={32} unit="px" />

      {isGrid ? (
        <>
          <SectionHeader title="Cấu hình lưới (Grid)" />
          <NumberField label="Số cột hiển thị" value={(p.columns as number) || 2} onChange={(v) => update("columns", v)} min={1} max={4} step={1} />
          <button
            onClick={convertToSingle}
            className="cursor-pointer w-full text-center text-xs font-semibold text-purple-650 bg-purple-50 border border-purple-200 py-2 rounded-lg hover:bg-purple-100 transition mt-2 mb-4 shadow-sm"
          >
            Chuyển về 1 sản phẩm đơn lẻ
          </button>

          <SectionHeader title={`Danh sách sản phẩm (${items.length})`} />
          {items.map((item, idx) => (
            <div key={item.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl mb-3 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500">Sản phẩm #{idx + 1}</span>
                {items.length > 1 && (
                  <button
                    onClick={() => {
                      const next = items.filter((_, i) => i !== idx);
                      update("items", next);
                    }}
                    className="text-red-500 text-[10px] hover:text-red-650 font-bold"
                  >
                    Xóa
                  </button>
                )}
              </div>
              <input
                type="text"
                value={item.title}
                placeholder="Tên sản phẩm"
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...next[idx], title: e.target.value };
                  update("items", next);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 shadow-sm"
              />
              <textarea
                value={item.description}
                placeholder="Mô tả chi tiết"
                rows={2}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...next[idx], description: e.target.value };
                  update("items", next);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 resize-none shadow-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.price}
                  placeholder="Giá bán (399.000đ)"
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], price: e.target.value };
                    update("items", next);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 shadow-sm"
                />
                <input
                  type="text"
                  value={item.oldPrice || ""}
                  placeholder="Giá cũ (nếu có)"
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], oldPrice: e.target.value };
                    update("items", next);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 shadow-sm"
                />
              </div>
              <input
                type="text"
                value={item.image}
                placeholder="Đường dẫn ảnh sản phẩm"
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...next[idx], image: e.target.value };
                  update("items", next);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 shadow-sm"
              />
              <input
                type="text"
                value={item.badge || ""}
                placeholder="Nhãn (ví dụ: Bán chạy, Mới)"
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...next[idx], badge: e.target.value };
                  update("items", next);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 shadow-sm"
              />
            </div>
          ))}
          <button
            onClick={() => {
              const newId = `p_${Date.now()}`;
              update("items", [
                ...items,
                {
                  id: newId,
                  title: `Sản phẩm #${items.length + 1}`,
                  description: "Mô tả sản phẩm mới thêm.",
                  price: "299.000đ",
                  oldPrice: "",
                  image: "/images/product/skincare_product.png",
                  badge: ""
                }
              ]);
            }}
            className="cursor-pointer w-full text-xs text-purple-650 border border-purple-300 rounded-lg py-2 hover:bg-purple-50 transition bg-white shadow-sm font-semibold"
          >
            + Thêm sản phẩm vào lưới
          </button>
        </>
      ) : (
        <>
          <SectionHeader title="Thông tin sản phẩm" />
          <button
            onClick={convertToGrid}
            className="cursor-pointer w-full text-center text-xs font-semibold text-purple-650 bg-purple-50 border border-purple-250 py-2 rounded-lg hover:bg-purple-100 transition mt-1 mb-4 shadow-sm"
          >
            Chuyển sang dạng lưới nhiều sản phẩm
          </button>
          <TextField label="Tên sản phẩm" value={(p.title as string) || ""} onChange={(v) => update("title", v)} />
          <TextField label="Mô tả sản phẩm" value={(p.description as string) || ""} onChange={(v) => update("description", v)} multiline />
          <div className="grid grid-cols-2 gap-2">
            <TextField label="Giá bán" value={(p.price as string) || ""} onChange={(v) => update("price", v)} />
            <TextField label="Giá cũ" value={(p.oldPrice as string) || ""} onChange={(v) => update("oldPrice", v)} />
          </div>
          <TextField label="Ảnh sản phẩm" value={(p.image as string) || ""} onChange={(v) => update("image", v)} hint="URL hoặc đường dẫn" />
          <TextField label="Nhãn nổi bật" value={(p.badge as string) || ""} onChange={(v) => update("badge", v)} hint="Ví dụ: Bán chạy" />
        </>
      )}
    </>
  );
};

const HtmlCodeInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Mã HTML nhúng" />
    <TextField label="Mã HTML/CSS/JS" value={(p.code as string) ?? ""} onChange={(v) => update("code", v)} multiline rows={12} />
    <NumberField label="Chiều cao tối thiểu" value={(p.height as number) ?? 200} onChange={(v) => update("height", v)} min={50} max={1500} unit="px" />
  </>
);

// ── Page settings (Light Theme) ─────────────────────────────────────────────
export const PageSettingsPanel: React.FC<{
  settings: EditorData["pageSettings"];
  onUpdateSettings: (key: string, value: string | number | boolean) => void;
}> = ({ settings, onUpdateSettings }) => (
  <div className="space-y-4 text-gray-800">
    <SectionHeader title="Cài đặt trang" />
    <ColorField label="Màu nền trang" value={settings.bgColor} onChange={(v) => onUpdateSettings("bgColor", v)} />
    <NumberField label="Chiều rộng tối đa" value={settings.maxWidth} onChange={(v) => onUpdateSettings("maxWidth", v)} min={800} max={1920} step={40} unit="px" />
    <ColorField label="Màu accent chính" value={settings.primaryColor} onChange={(v) => onUpdateSettings("primaryColor", v)} />
    <SelectField
      label="Font chữ"
      value={settings.fontFamily}
      options={[
        { value: "Inter, sans-serif", label: "Inter" },
        { value: "Roboto, sans-serif", label: "Roboto" },
        { value: "'Be Vietnam Pro', sans-serif", label: "Be Vietnam Pro" },
        { value: "Montserrat, sans-serif", label: "Montserrat" },
        { value: "Georgia, serif", label: "Georgia (Serif)" },
      ]}
      onChange={(v) => onUpdateSettings("fontFamily", v)}
    />
  </div>
);

// ── Main Inspector Panel (Light Theme) ──────────────────────────────────────

const INSPECTOR_MAP: Partial<Record<BlockType, React.FC<{ props: Record<string, unknown>; update: UpdateFn }>>> = {
  hero: HeroInspector,
  text: TextInspector,
  image: ImageInspector,
  button: ButtonInspector,
  spacer: SpacerInspector,
  divider: DividerInspector,
  columns: ColumnsInspector,
  feature_card: FeatureCardInspector,
  testimonial: TestimonialInspector,
  countdown: CountdownInspector,
  video: VideoInspector,
  form_capture: FormCaptureInspector,
  chat_widget: ChatWidgetInspector,
  funnel_popup: FunnelPopupInspector,
  tea_landing: TeaLandingInspector,
  product_card: ProductCardInspector,
  html_code: HtmlCodeInspector,
};

const FrameInspector: React.FC<{
  block: EditorBlock;
  deviceMode: DeviceMode;
  onUpdateNodeFrame: (id: string, frame: Partial<ElementFrame>) => void;
  onUpdateResponsiveFrame: (id: string, deviceMode: DeviceMode, frame: Partial<ElementFrame>) => void;
}> = ({ block, deviceMode, onUpdateNodeFrame, onUpdateResponsiveFrame }) => {
  const frame = getEffectiveFrame(block, deviceMode);
  const isSection = block.kind === "section" || block.type === "hero" || block.type === "product_section" || block.type === "form_section" || block.type === "footer" || block.type === "custom_section";

  const updateField = (key: keyof ElementFrame, value: number) => {
    const patch = { [key]: value };
    if (deviceMode === "desktop") {
      onUpdateNodeFrame(block.id, patch);
    } else {
      onUpdateResponsiveFrame(block.id, deviceMode, patch);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 space-y-3 mb-4 text-gray-800 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold text-purple-750 tracking-wider uppercase">
          Kích thước & Tọa độ ({deviceMode.toUpperCase()})
        </span>
        {block.responsive?.[deviceMode]?.frame && (
          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
            Đè layout
          </span>
        )}
      </div>

      {isSection ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1">CHIỀU CAO (px)</label>
            <input
              type="number"
              value={frame.height}
              onChange={(e) => updateField("height", Number(e.target.value))}
              className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-550 font-bold shadow-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1">Z-INDEX</label>
            <input
              type="number"
              value={frame.zIndex}
              onChange={(e) => updateField("zIndex", Number(e.target.value))}
              className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-550 font-bold shadow-sm"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">TỌA ĐỘ X (px)</label>
              <input
                type="number"
                value={frame.x}
                onChange={(e) => updateField("x", Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-550 font-bold shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">TỌA ĐỘ Y (px)</label>
              <input
                type="number"
                value={frame.y}
                onChange={(e) => updateField("y", Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-550 font-bold shadow-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">RỘNG (W - px)</label>
              <input
                type="number"
                value={frame.width}
                onChange={(e) => updateField("width", Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-550 font-bold shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">CAO (H - px)</label>
              <input
                type="number"
                value={frame.height}
                onChange={(e) => updateField("height", Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-550 font-bold shadow-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">GÓC XOAY (°)</label>
              <input
                type="number"
                value={frame.rotate ?? 0}
                onChange={(e) => updateField("rotate", Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-550 font-bold shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">Z-INDEX</label>
              <input
                type="number"
                value={frame.zIndex}
                onChange={(e) => updateField("zIndex", Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-purple-550 font-bold shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface InspectorPanelProps {
  selectedBlock: EditorBlock | null;
  pageSettings: EditorData["pageSettings"];
  onUpdateBlock: (id: string, newProps: Record<string, unknown>) => void;
  onUpdatePageSettings: (key: string, value: string | number | boolean) => void;
  deviceMode: DeviceMode;
  onUpdateNodeFrame: (id: string, frame: Partial<ElementFrame>) => void;
  onUpdateResponsiveFrame: (id: string, deviceMode: DeviceMode, frame: Partial<ElementFrame>) => void;
  handleSendChatMessage?: (text: string) => void;
  isAiTyping?: boolean;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedBlock,
  pageSettings,
  onUpdateBlock,
  onUpdatePageSettings,
  deviceMode,
  onUpdateNodeFrame,
  onUpdateResponsiveFrame,
  handleSendChatMessage,
  isAiTyping = false,
}) => {
  const [aiPrompt, setAiPrompt] = useState("");

  const handleSendAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || !handleSendChatMessage) return;
    handleSendChatMessage(aiPrompt);
    setAiPrompt("");
  };

  const update: UpdateFn = useCallback(
    (key, value) => {
      if (!selectedBlock) return;
      onUpdateBlock(selectedBlock.id, { ...selectedBlock.props, [key]: value });
    },
    [selectedBlock, onUpdateBlock]
  );

  const InspectorComponent = selectedBlock ? INSPECTOR_MAP[selectedBlock.type] : null;

  return (
    <div className="w-full flex flex-col bg-white h-full overflow-hidden border-l border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0 bg-gray-50">
        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Inspector</p>
        {selectedBlock && (
          <p className="text-sm font-bold text-purple-700 mt-0.5">
            {selectedBlock.label || selectedBlock.type.replace("_", " ").toUpperCase()}
          </p>
        )}
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-white">
        {selectedBlock && (
          <FrameInspector
            block={selectedBlock}
            deviceMode={deviceMode}
            onUpdateNodeFrame={onUpdateNodeFrame}
            onUpdateResponsiveFrame={onUpdateResponsiveFrame}
          />
        )}
        {selectedBlock && InspectorComponent ? (
          <InspectorComponent props={selectedBlock.props} update={update} />
        ) : !selectedBlock ? (
          <PageSettingsPanel settings={pageSettings} onUpdateSettings={onUpdatePageSettings} />
        ) : null}
      </div>

      {/* AI Edit Section - Sticky at bottom */}
      {selectedBlock && handleSendChatMessage && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <form onSubmit={handleSendAi} className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🤖</span>
              <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
                Chỉnh sửa bằng AI
              </p>
            </div>
            
            <div className="relative flex items-center rounded-lg border border-gray-250 bg-white px-2.5 py-1.5 focus-within:border-purple-500 transition-all shadow-sm">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ví dụ: Đổi màu nút thành đỏ và đổi chữ thành Nhận quà ngay..."
                rows={1}
                disabled={isAiTyping}
                className="flex-1 bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none resize-none no-scrollbar pr-6 font-medium"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (aiPrompt.trim() && !isAiTyping) {
                      handleSendChatMessage(aiPrompt);
                      setAiPrompt("");
                    }
                  }
                }}
              />
              <button
                type="submit"
                disabled={!aiPrompt.trim() || isAiTyping}
                className="cursor-pointer absolute right-2 text-purple-600 hover:text-purple-700 transition-all disabled:opacity-30"
              >
                {isAiTyping ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-solid border-purple-600 border-t-transparent inline-block" />
                ) : (
                  <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bottom hint */}
      {!selectedBlock && (
        <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
            Chọn một khối trên canvas để chỉnh sửa thuộc tính.
          </p>
        </div>
      )}
    </div>
  );
};

