"use client";
import React, { useCallback } from "react";
import { EditorBlock, BlockType, EditorData } from "./types";

// ── Field sub-components ──────────────────────────────────────

const FieldLabel: React.FC<{ label: string; hint?: string }> = ({ label, hint }) => (
  <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wide">
    {label}
    {hint && <span className="ml-1 text-gray-600 normal-case font-normal text-[10px]">({hint})</span>}
  </label>
);

const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  multiline?: boolean;
}> = ({ label, value, onChange, hint, multiline }) => (
  <div>
    <FieldLabel label={label} hint={hint} />
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-2.5 py-2 text-xs bg-white/5 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-2 text-xs bg-white/5 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500"
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
        className="flex-1 accent-purple-500 h-1"
      />
      <div className="flex items-center gap-1 bg-white/5 border border-gray-700/50 rounded-md px-2 py-1 min-w-[52px]">
        <input
          type="number"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-10 text-xs bg-transparent text-gray-200 focus:outline-none text-right"
        />
        {unit && <span className="text-[10px] text-gray-500">{unit}</span>}
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
        className="w-8 h-8 rounded-md border border-gray-700/50 cursor-pointer bg-transparent p-0.5 flex-shrink-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-2.5 py-1.5 text-xs bg-white/5 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:border-purple-500 font-mono"
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
      className="w-full px-2.5 py-2 text-xs bg-[#1a1a26] border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:border-purple-500 cursor-pointer"
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
    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${value ? "bg-purple-600" : "bg-gray-700"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : ""}`} />
    </button>
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-2 mt-5 mb-3 first:mt-0">
    <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">{title}</span>
    <div className="flex-1 h-px bg-gray-800" />
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
    <NumberField label="Padding trái/phải" value={p.paddingX as number} onChange={(v) => update("paddingX", v)} max={200} unit="px" />
    <NumberField label="Padding trên/dưới" value={p.paddingY as number} onChange={(v) => update("paddingY", v)} max={100} unit="px" />
  </>
);

const ColumnsInspector: React.FC<{ props: Record<string, unknown>; update: UpdateFn }> = ({ props: p, update }) => (
  <>
    <SectionHeader title="Bố cục" />
    <NumberField label="Số cột" value={p.columns as number} onChange={(v) => update("columns", v)} min={2} max={4} step={1} />
    <NumberField label="Khoảng cách giữa cột" value={p.gap as number} onChange={(v) => update("gap", v)} min={0} max={80} unit="px" />
    <SelectField label="Phân phối chiều rộng" value={p.distribution as string} options={[{value:"equal",label:"Đồng đều"},{value:"60-40",label:"60% - 40%"},{value:"40-60",label:"40% - 60%"},{value:"70-30",label:"70% - 30%"},{value:"30-70",label:"30% - 70%"}]} onChange={(v) => update("distribution", v)} />
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
        className="w-full px-2.5 py-2 text-xs bg-white/5 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:border-purple-500"
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
        <div key={f.id} className="p-2.5 bg-white/5 rounded-lg border border-gray-700/40 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Trường {i + 1}</span>
            {fields.length > 1 && (
              <button
                onClick={() => {
                  const next = fields.filter((_, fi) => fi !== i);
                  update("fields", next);
                }}
                className="text-red-500 text-[10px] hover:text-red-400"
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
            className="w-full px-2 py-1.5 text-xs bg-white/5 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:border-purple-500 mb-1.5"
          />
          <select
            value={f.type}
            onChange={(e) => {
              const next = [...fields];
              next[i] = { ...next[i], type: e.target.value };
              update("fields", next);
            }}
            className="w-full px-2 py-1.5 text-xs bg-[#1a1a26] border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:border-purple-500"
          >
            <option value="text">Văn bản</option>
            <option value="email">Email</option>
            <option value="phone">Điện thoại</option>
          </select>
        </div>
      ))}
      <button
        onClick={() => update("fields", [...fields, { id: `f_${Date.now()}`, label: "Trường mới", type: "text", required: false }])}
        className="w-full text-xs text-purple-400 border border-purple-500/30 rounded-lg py-2 hover:bg-purple-600/10 transition"
      >
        + Thêm trường
      </button>
    </>
  );
};

// ── Page settings ─────────────────────────────────────────────
export const PageSettingsPanel: React.FC<{
  settings: EditorData["pageSettings"];
  onUpdateSettings: (key: string, value: string | number | boolean) => void;
}> = ({ settings, onUpdateSettings }) => (
  <div className="space-y-4">
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

// ── Main Inspector Panel ──────────────────────────────────────

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
};

interface InspectorPanelProps {
  selectedBlock: EditorBlock | null;
  pageSettings: EditorData["pageSettings"];
  onUpdateBlock: (id: string, newProps: Record<string, unknown>) => void;
  onUpdatePageSettings: (key: string, value: string | number | boolean) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedBlock,
  pageSettings,
  onUpdateBlock,
  onUpdatePageSettings,
}) => {
  const update: UpdateFn = useCallback(
    (key, value) => {
      if (!selectedBlock) return;
      onUpdateBlock(selectedBlock.id, { ...selectedBlock.props, [key]: value });
    },
    [selectedBlock, onUpdateBlock]
  );

  const InspectorComponent = selectedBlock ? INSPECTOR_MAP[selectedBlock.type] : null;

  return (
    <div className="w-full flex flex-col bg-[#111118] h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800/80 flex-shrink-0">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Inspector</p>
        {selectedBlock && (
          <p className="text-sm font-semibold text-purple-300 mt-0.5">
            {selectedBlock.label || selectedBlock.type}
          </p>
        )}
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {selectedBlock && InspectorComponent ? (
          <InspectorComponent props={selectedBlock.props} update={update} />
        ) : (
          <PageSettingsPanel settings={pageSettings} onUpdateSettings={onUpdatePageSettings} />
        )}
      </div>

      {/* Bottom hint */}
      {!selectedBlock && (
        <div className="px-4 py-3 border-t border-gray-800/80 flex-shrink-0">
          <p className="text-[10px] text-gray-600 leading-relaxed">
            Click vào một block trên canvas để chỉnh sửa thuộc tính.
          </p>
        </div>
      )}
    </div>
  );
};
