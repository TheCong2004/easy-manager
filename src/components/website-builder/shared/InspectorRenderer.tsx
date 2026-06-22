import React from "react";
import { WebsiteSchema } from "@/types/website-builder";
import { resolveSelectedNode } from "../core/builder-node-adapter";

interface InspectorRendererProps {
  schema: WebsiteSchema;
  selectedNodeId: string;
  onChangeProps: (field: string, value: any) => void;
  onClose: () => void;
}

export const InspectorRenderer: React.FC<InspectorRendererProps> = ({
  schema,
  selectedNodeId,
  onChangeProps,
  onClose,
}) => {
  const selectedNode = resolveSelectedNode(schema, selectedNodeId);
  if (!selectedNode) {
    return (
      <div className="p-6 text-center text-gray-400 text-xs">
        Không thể phân tích phần tử được chọn (#{selectedNodeId})
      </div>
    );
  }

  const { type, label, props } = selectedNode;

  const renderColorInput = (field: string, currentValue: string, labelText: string) => {
    const val = currentValue || "";
    return (
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {labelText}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={val.startsWith("#") && val.length === 7 ? val : "#ffffff"}
            onChange={(e) => onChangeProps(field, e.target.value)}
            className="h-8 w-12 border border-stroke dark:border-strokedark p-0 cursor-pointer rounded overflow-hidden"
          />
          <input
            type="text"
            value={val}
            onChange={(e) => onChangeProps(field, e.target.value)}
            className="flex-1 rounded border border-stroke dark:border-strokedark bg-transparent py-1.5 px-3 outline-none focus:border-primary text-xs text-black dark:text-white"
            placeholder="e.g. #3B82F6 hoặc transparent"
          />
        </div>
      </div>
    );
  };

  return (
    <aside className="w-80 border-l border-stroke bg-white dark:border-strokedark dark:bg-boxdark flex flex-col z-20 shadow-sm overflow-hidden h-full">
      {/* Title Header */}
      <div className="p-4 border-b border-stroke dark:border-strokedark flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-meta-4/20">
        <div>
          <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
            Thuộc tính
          </h3>
          <p className="text-[10px] text-primary font-semibold mt-0.5">{label}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-black dark:hover:text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-meta-4"
        >
          ✕
        </button>
      </div>

      {/* Editor Fields Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* SECTION EDITOR */}
        {type === "section" && (
          <>
            {renderColorInput("backgroundColor", props.backgroundColor, "Màu nền (Background Color)")}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ảnh nền URL (Background Image)
              </label>
              <input
                type="text"
                value={props.backgroundImage || ""}
                onChange={(e) => onChangeProps("backgroundImage", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-1.5 px-3 outline-none focus:border-primary text-xs text-black dark:text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {props.backgroundImage && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <span>Độ mờ lớp phủ (Overlay Opacity)</span>
                  <span className="font-mono text-primary">{Math.round((props.overlayOpacity || 0) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={props.overlayOpacity !== undefined ? props.overlayOpacity : 0.4}
                  onChange={(e) => onChangeProps("overlayOpacity", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Chiều cao tối thiểu (Min Height)
              </label>
              <select
                value={props.minHeight || "min-h-[400px]"}
                onChange={(e) => onChangeProps("minHeight", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-2 px-3 outline-none focus:border-primary text-xs text-black dark:text-white"
              >
                <option value="min-h-[300px]">300px (Nhỏ)</option>
                <option value="min-h-[400px]">400px (Trung bình)</option>
                <option value="min-h-[500px]">500px (Khá lớn)</option>
                <option value="min-h-[600px]">600px (Lớn)</option>
                <option value="min-h-[700px]">700px (Rất lớn)</option>
                <option value="min-h-screen">Toàn màn hình (100vh)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Padding Trên
                </label>
                <select
                  value={props.paddingTop || "16"}
                  onChange={(e) => onChangeProps("paddingTop", e.target.value)}
                  className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-2 px-3 outline-none focus:border-primary text-xs text-black dark:text-white"
                >
                  {["4", "8", "12", "16", "20", "24", "28", "32", "40", "48"].map((v) => (
                    <option key={v} value={v}>
                      {v} ({parseInt(v) * 4}px)
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Padding Dưới
                </label>
                <select
                  value={props.paddingBottom || "16"}
                  onChange={(e) => onChangeProps("paddingBottom", e.target.value)}
                  className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-2 px-3 outline-none focus:border-primary text-xs text-black dark:text-white"
                >
                  {["4", "8", "12", "16", "20", "24", "28", "32", "40", "48"].map((v) => (
                    <option key={v} value={v}>
                      {v} ({parseInt(v) * 4}px)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* HEADING EDITOR */}
        {type === "heading" && (
          <>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nội dung tiêu đề
              </label>
              <textarea
                rows={3}
                value={props.text || ""}
                onChange={(e) => onChangeProps("text", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-1.5 px-3 outline-none focus:border-primary text-xs text-black dark:text-white leading-relaxed"
                placeholder="Nhập nội dung tiêu đề..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cỡ chữ (Font Size)
              </label>
              <select
                value={props.fontSize || "text-2xl sm:text-3xl"}
                onChange={(e) => onChangeProps("fontSize", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-2 px-3 outline-none focus:border-primary text-xs text-black dark:text-white font-mono"
              >
                <option value="text-lg font-semibold">Nhỏ (18px)</option>
                <option value="text-xl sm:text-2xl font-bold">Vừa (24px)</option>
                <option value="text-2xl sm:text-3xl font-bold">Lớn (30px)</option>
                <option value="text-3xl sm:text-4xl font-extrabold">Rất Lớn (36px)</option>
                <option value="text-4xl sm:text-5xl font-extrabold">Khổng Lồ (48px)</option>
                <option value="text-5xl sm:text-6xl font-black">Cực Đại (60px)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Độ dày chữ (Font Weight)
              </label>
              <select
                value={props.fontWeight || "font-bold"}
                onChange={(e) => onChangeProps("fontWeight", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-2 px-3 outline-none focus:border-primary text-xs text-black dark:text-white"
              >
                <option value="font-normal">Normal (400)</option>
                <option value="font-medium">Medium (500)</option>
                <option value="font-semibold">Semibold (600)</option>
                <option value="font-bold">Bold (700)</option>
                <option value="font-extrabold">Extra Bold (800)</option>
                <option value="font-black">Black (900)</option>
              </select>
            </div>

            {renderColorInput("color", props.color, "Màu chữ (Text Color)")}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Căn lề (Alignment)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["left", "center", "right"].map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => onChangeProps("align", align)}
                    className={`py-1.5 text-xs font-semibold rounded capitalize border transition ${
                      props.align === align
                        ? "bg-primary/5 border-primary text-primary"
                        : "border-stroke dark:border-strokedark text-gray-500 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TEXT EDITOR */}
        {type === "text" && (
          <>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nội dung đoạn văn
              </label>
              <textarea
                rows={5}
                value={props.text || ""}
                onChange={(e) => onChangeProps("text", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-1.5 px-3 outline-none focus:border-primary text-xs text-black dark:text-white leading-relaxed"
                placeholder="Nhập nội dung đoạn văn..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cỡ chữ (Font Size)
              </label>
              <select
                value={props.fontSize || "text-sm"}
                onChange={(e) => onChangeProps("fontSize", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-2 px-3 outline-none focus:border-primary text-xs text-black dark:text-white font-mono"
              >
                <option value="text-[11px]">Cực nhỏ (11px)</option>
                <option value="text-xs">Rất nhỏ (12px)</option>
                <option value="text-sm">Nhỏ (14px)</option>
                <option value="text-base">Trung bình (16px)</option>
                <option value="text-lg">Lớn (18px)</option>
                <option value="text-xl">Rất lớn (20px)</option>
              </select>
            </div>

            {renderColorInput("color", props.color, "Màu chữ (Text Color)")}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Giãn dòng (Line Height)
              </label>
              <select
                value={props.lineHeight || "leading-relaxed"}
                onChange={(e) => onChangeProps("lineHeight", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-2 px-3 outline-none focus:border-primary text-xs text-black dark:text-white"
              >
                <option value="leading-none">Khít (none)</option>
                <option value="leading-tight">Hơi khít (tight)</option>
                <option value="leading-normal">Bình thường (normal)</option>
                <option value="leading-relaxed">Giãn rộng (relaxed)</option>
                <option value="leading-loose">Rất rộng (loose)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Căn lề (Alignment)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["left", "center", "right"].map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => onChangeProps("align", align)}
                    className={`py-1.5 text-xs font-semibold rounded capitalize border transition ${
                      props.align === align
                        ? "bg-primary/5 border-primary text-primary"
                        : "border-stroke dark:border-strokedark text-gray-500 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* BUTTON EDITOR */}
        {type === "button" && (
          <>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Chữ trên nút (Button Text)
              </label>
              <input
                type="text"
                value={props.text || ""}
                onChange={(e) => onChangeProps("text", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-1.5 px-3 outline-none focus:border-primary text-xs text-black dark:text-white"
                placeholder="Nhập nội dung nút..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Đường dẫn liên kết (Link Href)
              </label>
              <input
                type="text"
                value={props.href || ""}
                onChange={(e) => onChangeProps("href", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-1.5 px-3 outline-none focus:border-primary text-xs text-black dark:text-white font-mono"
                placeholder="# hoặc https://example.com"
              />
            </div>

            {renderColorInput("backgroundColor", props.backgroundColor, "Màu nền nút")}
            {renderColorInput("textColor", props.textColor, "Màu chữ nút")}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Bo góc nút (Border Radius)
              </label>
              <select
                value={props.borderRadius || "rounded-full"}
                onChange={(e) => onChangeProps("borderRadius", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-2 px-3 outline-none focus:border-primary text-xs text-black dark:text-white"
              >
                <option value="rounded-none">Không bo góc (Vuông)</option>
                <option value="rounded-sm">Bo góc nhỏ (sm)</option>
                <option value="rounded-md">Bo góc vừa (md)</option>
                <option value="rounded-lg">Bo góc lớn (lg)</option>
                <option value="rounded-xl">Bo góc rất lớn (xl)</option>
                <option value="rounded-2xl">Bo góc 2xl</option>
                <option value="rounded-full">Bo tròn hoàn toàn (full)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Vị trí nút (Alignment)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["left", "center", "right"].map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => onChangeProps("align", align)}
                    className={`py-1.5 text-xs font-semibold rounded capitalize border transition ${
                      props.align === align
                        ? "bg-primary/5 border-primary text-primary"
                        : "border-stroke dark:border-strokedark text-gray-500 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* IMAGE EDITOR */}
        {type === "image" && (
          <>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Đường dẫn hình ảnh (Source URL)
              </label>
              <textarea
                rows={3}
                value={props.src || ""}
                onChange={(e) => onChangeProps("src", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-1.5 px-3 outline-none focus:border-primary text-xs text-black dark:text-white font-mono"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Mô tả hình ảnh (Alt Text)
              </label>
              <input
                type="text"
                value={props.alt || ""}
                onChange={(e) => onChangeProps("alt", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-1.5 px-3 outline-none focus:border-primary text-xs text-black dark:text-white"
                placeholder="Nhập mô tả hình ảnh cho SEO..."
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <span>Độ mờ (Opacity)</span>
                <span className="font-mono text-primary">{Math.round((props.opacity !== undefined ? props.opacity : 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={props.opacity !== undefined ? props.opacity : 1}
                onChange={(e) => onChangeProps("opacity", parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Kiểu hiển thị (Object Fit)
              </label>
              <select
                value={props.objectFit || "cover"}
                onChange={(e) => onChangeProps("objectFit", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-2 px-3 outline-none focus:border-primary text-xs text-black dark:text-white"
              >
                <option value="cover">Cắt vừa khung (Cover)</option>
                <option value="contain">Thu nhỏ đủ ảnh (Contain)</option>
                <option value="fill">Kéo giãn đầy (Fill)</option>
              </select>
            </div>
          </>
        )}

        {/* CARD EDITOR */}
        {type === "card" && (
          <>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tiêu đề thẻ
              </label>
              <input
                type="text"
                value={props.title || ""}
                onChange={(e) => onChangeProps("title", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-1.5 px-3 outline-none focus:border-primary text-xs text-black dark:text-white"
                placeholder="Nhập tiêu đề thẻ..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Mô tả thẻ
              </label>
              <textarea
                rows={4}
                value={props.description || ""}
                onChange={(e) => onChangeProps("description", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-1.5 px-3 outline-none focus:border-primary text-xs text-black dark:text-white leading-relaxed"
                placeholder="Nhập mô tả thẻ..."
              />
            </div>

            {renderColorInput("backgroundColor", props.backgroundColor, "Màu nền thẻ")}
            {renderColorInput("borderColor", props.borderColor, "Màu viền thẻ")}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Bo góc thẻ (Radius)
              </label>
              <select
                value={props.radius || "rounded-xl"}
                onChange={(e) => onChangeProps("radius", e.target.value)}
                className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-2 px-3 outline-none focus:border-primary text-xs text-black dark:text-white"
              >
                <option value="rounded-none">Không bo góc (Vuông)</option>
                <option value="rounded-sm">Bo góc nhỏ (sm)</option>
                <option value="rounded-md">Bo góc vừa (md)</option>
                <option value="rounded-lg">Bo góc lớn (lg)</option>
                <option value="rounded-xl">Bo góc rất lớn (xl)</option>
                <option value="rounded-2xl">Bo góc 2xl</option>
              </select>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default InspectorRenderer;
