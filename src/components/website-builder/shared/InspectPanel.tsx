import React, { useState, useEffect, useRef } from "react";
import { WebsiteSchema, WebsiteSection } from "@/types/website-builder";
import { useAiEditSection } from "@/hooks/use-website-builder";

interface InspectPanelProps {
  projectId: string;
  schema: WebsiteSchema;
  selectedSectionId: string | null;
  onUpdateSchema: (newSchema: WebsiteSchema) => void;
  onClose: () => void;
}

export const InspectPanel: React.FC<InspectPanelProps> = ({
  projectId,
  schema,
  selectedSectionId,
  onUpdateSchema,
  onClose,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"manual" | "assets" | "ai">("manual");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiDiffProps, setAiDiffProps] = useState<Record<string, any> | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const aiEditMutation = useAiEditSection(projectId);

  // Clear diff and prompt when switching selected section
  useEffect(() => {
    setAiDiffProps(null);
    setAiExplanation(null);
    setAiPrompt("");
  }, [selectedSectionId]);

  if (!selectedSectionId) {
    return (
      <div className="w-full max-w-[1100px] border border-stroke dark:border-strokedark bg-white dark:bg-boxdark rounded-xl p-8 text-center text-gray-500 dark:text-gray-400 shadow-lg shrink-0">
        <span className="text-3xl block mb-2">💡</span>
        <p className="text-sm font-semibold">Chọn một Section trên canvas để xem và sửa đổi thuộc tính ở đây.</p>
      </div>
    );
  }

  // Find the page and section in the schema
  let pageIndex = -1;
  let sectionIndex = -1;
  for (let i = 0; i < schema.pages.length; i++) {
    const idx = schema.pages[i].sections?.findIndex((s) => s.id === selectedSectionId);
    if (idx !== undefined && idx !== -1) {
      pageIndex = i;
      sectionIndex = idx;
      break;
    }
  }

  if (pageIndex === -1 || sectionIndex === -1) {
    return (
      <div className="w-full max-w-[1100px] border border-stroke dark:border-strokedark bg-white dark:bg-boxdark rounded-xl p-6 text-center text-rose-500 font-semibold shadow-lg shrink-0">
        Không tìm thấy section #{selectedSectionId} trong schema của trang web.
      </div>
    );
  }

  const section = schema.pages[pageIndex].sections[sectionIndex];

  // Helper to extract nested/flat property values
  const getPropValue = (field: string): string => {
    const secAny = section as any;
    if (field === "backgroundColor") {
      return (
        secAny.props?.settings?.backgroundColor ||
        secAny.props?.backgroundColor ||
        secAny.settings?.backgroundColor ||
        secAny.backgroundColor ||
        ""
      );
    }
    if (field === "textColor") {
      return (
        secAny.props?.settings?.textColor ||
        secAny.props?.textColor ||
        secAny.settings?.textColor ||
        secAny.textColor ||
        ""
      );
    }
    return (secAny.props?.[field] !== undefined ? secAny.props[field] : secAny[field]) || "";
  };

  // Helper to handle prop changes
  const handlePropChange = (field: string, val: any) => {
    const newPages = schema.pages.map((p, pIdx) => {
      if (pIdx !== pageIndex) return p;
      const newSections = p.sections.map((s, sIdx) => {
        if (sIdx !== sectionIndex) return s;

        const updated = { ...s } as any;
        if (!updated.props) updated.props = {};

        if (field === "backgroundColor" || field === "textColor") {
          updated.props[field] = val;
          if (!updated.props.settings) updated.props.settings = {};
          updated.props.settings[field] = val;
          updated[field] = val;
          if (!updated.settings) updated.settings = {};
          updated.settings[field] = val;
        } else if (
          [
            "image",
            "imageUrl",
            "backgroundImage",
            "logo",
            "logoUrl",
            "avatar",
            "thumbnail",
          ].includes(field)
        ) {
          updated[field] = val;
          updated.props[field] = val;
          if (field === "imageUrl") {
            updated.imageUrl = val;
            updated.props.imageUrl = val;
          }
          if (field === "backgroundImage") {
            updated.backgroundImage = val;
            updated.props.backgroundImage = val;
          }
        } else {
          updated[field] = val;
          updated.props[field] = val;
        }

        return updated as WebsiteSection;
      });
      return { ...p, sections: newSections };
    });

    onUpdateSchema({ ...schema, pages: newPages });
  };

  // Check which properties are available for manual edit
  const showTitle = section.title !== undefined || section.props?.title !== undefined;
  const showSubtitle = section.subtitle !== undefined || section.props?.subtitle !== undefined;
  const showContent = section.content !== undefined || section.props?.content !== undefined;
  const showButtonText = section.buttonText !== undefined || section.props?.buttonText !== undefined;
  const showButtonLink = section.buttonLink !== undefined || section.props?.buttonLink !== undefined;

  // Detect common image props
  const imageKeys = [
    "image",
    "imageUrl",
    "backgroundImage",
    "logo",
    "logoUrl",
    "avatar",
    "thumbnail",
  ].filter((key) => {
    return (
      (section as any)[key] !== undefined ||
      section.props?.[key] !== undefined
    );
  });

  // Assets image uploader base64 reader
  const handleLocalImageUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      handlePropChange(field, base64Url);
    };
    reader.readAsDataURL(file);
  };

  // Submit AI Prompts for section edits
  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    try {
      // Gather current section values to pass as payload context
      const currentPropsContext = {
        ...section,
        ...(section.props || {}),
      };

      const result = await aiEditMutation.mutateAsync({
        sectionId: section.id,
        sectionType: section.type,
        prompt: aiPrompt,
        currentProps: currentPropsContext,
      });

      if (result?.updatedProps) {
        setAiDiffProps(result.updatedProps);
        setAiExplanation(result.explanation || null);
      }
    } catch (err) {
      console.error("AI editing section error:", err);
    }
  };

  // Merge diff props into section schema on confirm
  const handleApplyAiChanges = () => {
    if (!aiDiffProps) return;

    const newPages = schema.pages.map((p, pIdx) => {
      if (pIdx !== pageIndex) return p;
      const newSections = p.sections.map((s, sIdx) => {
        if (sIdx !== sectionIndex) return s;

        const updated = { ...s } as any;
        if (!updated.props) updated.props = {};

        // Merge AI updatedProps properties
        Object.keys(aiDiffProps).forEach((key) => {
          const val = aiDiffProps[key];
          if (key === "props" && typeof val === "object") {
            updated.props = {
              ...updated.props,
              ...val,
            };
          } else if (key === "settings" && typeof val === "object") {
            updated.settings = {
              ...updated.settings,
              ...val,
            };
          } else {
            updated[key] = val;
            updated.props[key] = val;
          }
        });

        return updated as WebsiteSection;
      });
      return { ...p, sections: newSections };
    });

    onUpdateSchema({ ...schema, pages: newPages });
    // Reset diff states
    setAiDiffProps(null);
    setAiExplanation(null);
    setAiPrompt("");
  };

  const handleDiscardAiChanges = () => {
    setAiDiffProps(null);
    setAiExplanation(null);
  };

  // Compile difference list for Diff UI
  const getDiffFields = () => {
    if (!aiDiffProps) return [];
    const list: Array<{ label: string; oldVal: string; newVal: string }> = [];

    const keysToCheck = [
      "title",
      "subtitle",
      "content",
      "buttonText",
      "buttonLink",
      "imageUrl",
      "backgroundImage",
      "backgroundColor",
      "textColor",
    ];

    keysToCheck.forEach((key) => {
      let oldVal = getPropValue(key);
      let newVal = aiDiffProps[key] !== undefined ? aiDiffProps[key] : aiDiffProps.props?.[key];

      // Format if object
      if (newVal !== undefined && JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        list.push({
          label: key,
          oldVal: String(oldVal || ""),
          newVal: String(newVal || ""),
        });
      }
    });

    return list;
  };

  const diffFields = getDiffFields();

  return (
    <div className="w-full max-w-[1100px] border border-stroke dark:border-strokedark bg-white dark:bg-boxdark rounded-xl shadow-lg shrink-0 flex flex-col overflow-hidden min-h-[300px]">
      {/* Header bar */}
      <div className="bg-gray-50 dark:bg-meta-4/20 px-5 py-3 border-b border-stroke dark:border-strokedark flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center bg-primary/10 text-primary w-6 h-6 rounded text-xs font-mono font-bold">
            🔍
          </span>
          <div>
            <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
              Inspect Mode: {section.type} Section
            </h4>
            <p className="text-[10px] text-gray-400 mt-0.5">ID: <span className="font-mono">{section.id}</span></p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-black dark:hover:text-white text-xs font-bold"
        >
          Đóng Inspect Panel ✕
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-stroke dark:border-strokedark bg-white dark:bg-boxdark shrink-0">
        {[
          { id: "manual", label: "✍ Manual Edit" },
          { id: "assets", label: "🖼 Assets" },
          { id: "ai", label: "🤖 AI Edit" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-6 py-2.5 text-xs font-bold border-b-2 transition ${
              activeSubTab === tab.id
                ? "border-primary text-primary bg-primary/2"
                : "border-transparent text-gray-500 hover:text-black dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel main editor body */}
      <div className="flex-1 p-5 overflow-y-auto max-h-[280px]">
        {/* MANUAL EDIT */}
        {activeSubTab === "manual" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {showTitle && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Tiêu đề (Title)
                  </label>
                  <input
                    type="text"
                    value={getPropValue("title")}
                    onChange={(e) => handlePropChange("title", e.target.value)}
                    className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-1.5 px-3 outline-none text-xs text-black dark:text-white"
                  />
                </div>
              )}

              {showSubtitle && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Mô tả phụ (Subtitle)
                  </label>
                  <textarea
                    rows={2}
                    value={getPropValue("subtitle")}
                    onChange={(e) => handlePropChange("subtitle", e.target.value)}
                    className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-1.5 px-3 outline-none text-xs text-black dark:text-white"
                  />
                </div>
              )}

              {showContent && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Nội dung (Content)
                  </label>
                  <textarea
                    rows={3}
                    value={getPropValue("content")}
                    onChange={(e) => handlePropChange("content", e.target.value)}
                    className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-1.5 px-3 outline-none text-xs text-black dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              {showButtonText && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Nội dung Nút bấm (Button Text)
                  </label>
                  <input
                    type="text"
                    value={getPropValue("buttonText")}
                    onChange={(e) => handlePropChange("buttonText", e.target.value)}
                    className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-1.5 px-3 outline-none text-xs text-black dark:text-white"
                  />
                </div>
              )}

              {showButtonLink && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Liên kết Nút bấm (Button Link)
                  </label>
                  <input
                    type="text"
                    value={getPropValue("buttonLink")}
                    onChange={(e) => handlePropChange("buttonLink", e.target.value)}
                    className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-1.5 px-3 outline-none text-xs text-black dark:text-white"
                  />
                </div>
              )}

              {/* Color configurations */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Màu nền (BG Color)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={
                        getPropValue("backgroundColor").startsWith("#")
                          ? getPropValue("backgroundColor")
                          : "#ffffff"
                      }
                      onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                      className="w-8 h-8 rounded border border-stroke dark:border-strokedark cursor-pointer"
                    />
                    <input
                      type="text"
                      value={getPropValue("backgroundColor")}
                      onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                      placeholder="Inherit"
                      className="flex-1 rounded border border-stroke dark:border-strokedark bg-transparent px-2 outline-none text-xs text-black dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Màu chữ (Text Color)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={
                        getPropValue("textColor").startsWith("#")
                          ? getPropValue("textColor")
                          : "#000000"
                      }
                      onChange={(e) => handlePropChange("textColor", e.target.value)}
                      className="w-8 h-8 rounded border border-stroke dark:border-strokedark cursor-pointer"
                    />
                    <input
                      type="text"
                      value={getPropValue("textColor")}
                      onChange={(e) => handlePropChange("textColor", e.target.value)}
                      placeholder="Inherit"
                      className="flex-1 rounded border border-stroke dark:border-strokedark bg-transparent px-2 outline-none text-xs text-black dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ASSETS */}
        {activeSubTab === "assets" && (
          <div className="space-y-4">
            {imageKeys.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                Section này không chứa hình ảnh cấu hình nào.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imageKeys.map((key) => {
                  const currentValue = getPropValue(key);
                  return (
                    <div
                      key={key}
                      className="p-3 bg-gray-50 dark:bg-meta-4/20 rounded-lg border border-stroke dark:border-strokedark"
                    >
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                        Ảnh: {key}
                      </label>
                      <div className="flex gap-3 items-start">
                        {currentValue && (
                          <div className="w-16 h-16 rounded border border-stroke shrink-0 overflow-hidden bg-zinc-100">
                            <img
                              src={currentValue}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={currentValue}
                            onChange={(e) => handlePropChange(key, e.target.value)}
                            placeholder="Nhập đường dẫn ảnh URL..."
                            className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-1.5 px-3 outline-none text-xs text-black dark:text-white"
                          />

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[key]?.click()}
                              className="bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold py-1.5 px-3 rounded shadow-sm"
                            >
                              📁 Tải ảnh lên
                            </button>
                            <input
                              type="file"
                              accept="image/*"
                              ref={(el) => {
                                fileInputRefs.current[key] = el;
                              }}
                              onChange={(e) => handleLocalImageUpload(key, e)}
                              className="hidden"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {imageKeys.length > 0 && (
              <p className="text-[10px] text-gray-400">
                💡 Lưu ý: Ảnh upload trực tiếp từ máy tính sẽ được chuyển sang định dạng Base64 Data URL để preview lập tức trên Canvas và sẽ lưu chính thức khi bạn lưu thiết kế.
              </p>
            )}
          </div>
        )}

        {/* AI EDIT */}
        {activeSubTab === "ai" && (
          <div className="space-y-4">
            {/* Diff review block */}
            {aiDiffProps ? (
              <div className="border border-emerald-100 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                    🔍 Xem trước các thay đổi đề xuất từ AI (AI Diff Preview)
                  </h5>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                    Chờ duyệt
                  </span>
                </div>

                {aiExplanation && (
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed italic bg-emerald-500/5 p-2 rounded">
                    &quot;{aiExplanation}&quot;
                  </p>
                )}

                {diffFields.length === 0 ? (
                  <p className="text-xs text-gray-400 py-1">Không phát hiện thay đổi thuộc tính nào so với bản cũ.</p>
                ) : (
                  <div className="border border-stroke dark:border-strokedark rounded overflow-hidden max-h-[140px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-meta-4 text-[10px] font-bold text-gray-500 uppercase border-b border-stroke">
                          <th className="p-2">Thuộc tính</th>
                          <th className="p-2">Bản cũ</th>
                          <th className="p-2 text-emerald-700">Đề xuất AI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stroke bg-white dark:bg-boxdark text-black dark:text-white">
                        {diffFields.map((field) => (
                          <tr key={field.label}>
                            <td className="p-2 font-mono text-[10px] font-semibold">{field.label}</td>
                            <td className="p-2 truncate max-w-[200px] text-gray-400">{field.oldVal}</td>
                            <td className="p-2 truncate max-w-[200px] text-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 font-semibold">
                              {field.newVal}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    onClick={handleDiscardAiChanges}
                    className="border border-stroke hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4 py-1.5 px-3 rounded text-xs font-semibold text-black dark:text-white bg-transparent"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleApplyAiChanges}
                    className="bg-emerald-600 hover:bg-opacity-95 text-white py-1.5 px-4 rounded text-xs font-bold shadow"
                  >
                    Xác nhận áp dụng (Apply AI Changes)
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAiSubmit} className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <div>
                    <h5 className="text-xs font-bold text-black dark:text-white">
                      AI Edit Section
                    </h5>
                    <p className="text-[10px] text-gray-400">
                      Gửi yêu cầu tới AI để thiết kế lại nội dung và cấu hình của section này.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">
                    Nhập yêu cầu AI (Prompt)
                  </label>
                  <textarea
                    rows={2}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={aiEditMutation.isPending}
                    placeholder="Ví dụ: thay đổi tiêu đề lôi cuốn hơn và đổi màu nền sang tông xanh ngọc..."
                    className="w-full rounded border border-stroke dark:border-strokedark bg-transparent py-2 px-3 outline-none text-xs text-black dark:text-white"
                    required
                  />
                </div>

                {/* Quick actions suggestions */}
                <div className="space-y-1.5">
                  <span className="block text-[9px] font-bold text-gray-400 uppercase">
                    Gợi ý nhanh (Quick Actions):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { prompt: "Viết lại tiêu đề và phụ đề hấp dẫn, thu hút người đọc", label: "✨ Viết lại tiêu đề" },
                      { prompt: "Tối ưu hóa nội dung văn bản chuẩn SEO chuyên nghiệp", label: "📈 Tối ưu SEO" },
                      { prompt: "Sửa chữ trên nút CTA để tăng tỷ lệ nhấp chuột", label: "🔥 CTA Nút bấm" },
                      { prompt: "Đổi tông màu nền và màu nút sang màu xanh ngọc phong thủy", label: "🎨 Phối màu nền" },
                    ].map((act) => (
                      <button
                        key={act.label}
                        type="button"
                        onClick={() => setAiPrompt(act.prompt)}
                        disabled={aiEditMutation.isPending}
                        className="text-[10px] bg-gray-50 hover:bg-gray-100 border border-stroke dark:bg-meta-4 dark:border-strokedark dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    type="submit"
                    disabled={aiEditMutation.isPending || !aiPrompt.trim()}
                    className="bg-primary hover:bg-opacity-95 disabled:opacity-50 text-white text-xs font-bold py-1.5 px-4 rounded shadow-sm flex items-center gap-1.5"
                  >
                    {aiEditMutation.isPending ? (
                      <>
                        <span className="w-3 h-3 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
                        AI đang thiết kế...
                      </>
                    ) : (
                      <>🚀 Sửa bằng AI</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectPanel;
