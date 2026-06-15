// ============================================================
//  VISUAL EDITOR — TYPE DEFINITIONS
//  Inspired by: Onlook (UI/UX) + Puck (data model/fields)
// ============================================================

// ── Device Preview Modes ────────────────────────────────────
export type DeviceMode = "desktop" | "tablet" | "mobile";

export const DEVICE_WIDTHS: Record<DeviceMode, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 390,
};

// ── Block Types (Component Palette) ─────────────────────────
export type BlockType =
  | "hero"
  | "text"
  | "image"
  | "button"
  | "spacer"
  | "columns"
  | "feature_card"
  | "testimonial"
  | "divider"
  | "countdown"
  | "video"
  | "form_capture";

// ── Block Palette Categories ─────────────────────────────────
export interface PaletteCategory {
  id: string;
  label: string;
  icon: string;
  blocks: BlockType[];
}

export const PALETTE_CATEGORIES: PaletteCategory[] = [
  {
    id: "layout",
    label: "Bố cục",
    icon: "grid",
    blocks: ["columns", "spacer", "divider"],
  },
  {
    id: "typography",
    label: "Nội dung",
    icon: "type",
    blocks: ["hero", "text", "countdown"],
  },
  {
    id: "media",
    label: "Media",
    icon: "image",
    blocks: ["image", "video"],
  },
  {
    id: "cta",
    label: "Hành động",
    icon: "cursor",
    blocks: ["button", "form_capture"],
  },
  {
    id: "social",
    label: "Social Proof",
    icon: "star",
    blocks: ["feature_card", "testimonial"],
  },
];

// ── Per-block Prop Schemas ───────────────────────────────────

export interface HeroProps {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaUrl: string;
  ctaColor: string;
  bgColor: string;
  bgImage: string;
  textAlign: "left" | "center" | "right";
  minHeight: number;
  overlayOpacity: number;
}

export interface TextProps {
  content: string;
  fontSize: number;
  color: string;
  textAlign: "left" | "center" | "right";
  lineHeight: number;
  paddingX: number;
  paddingY: number;
}

export interface ImageProps {
  src: string;
  alt: string;
  caption: string;
  width: "full" | "large" | "medium" | "small";
  borderRadius: number;
  showCaption: boolean;
  objectFit: "cover" | "contain" | "fill";
}

export interface ButtonProps {
  label: string;
  url: string;
  style: "filled" | "outline" | "ghost";
  color: string;
  textColor: string;
  size: "sm" | "md" | "lg";
  fullWidth: boolean;
  borderRadius: number;
  align: "left" | "center" | "right";
  icon: string;
}

export interface SpacerProps {
  height: number;
  bgColor: string;
}

export interface DividerProps {
  color: string;
  thickness: number;
  style: "solid" | "dashed" | "dotted";
  paddingX: number;
  paddingY: number;
}

export interface ColumnsProps {
  columns: number;
  gap: number;
  distribution: "equal" | "60-40" | "40-60" | "70-30" | "30-70";
  children: EditorBlock[][];
}

export interface FeatureCardProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  bgColor: string;
  borderColor: string;
  borderRadius: number;
}

export interface TestimonialProps {
  quote: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  rating: number;
  bgColor: string;
  textColor: string;
  showRating: boolean;
}

export interface CountdownProps {
  targetDate: string;
  title: string;
  expiredText: string;
  bgColor: string;
  accentColor: string;
}

export interface VideoProps {
  url: string;
  thumbnail: string;
  autoplay: boolean;
  muted: boolean;
  controls: boolean;
  aspectRatio: "16/9" | "4/3" | "1/1";
  borderRadius: number;
}

export interface FormCaptureProps {
  title: string;
  subtitle: string;
  fields: { id: string; label: string; type: "text" | "email" | "phone"; required: boolean }[];
  submitLabel: string;
  submitColor: string;
  bgColor: string;
  borderRadius: number;
}

// ── Union of all block props ─────────────────────────────────
export type BlockProps =
  | { type: "hero"; props: HeroProps }
  | { type: "text"; props: TextProps }
  | { type: "image"; props: ImageProps }
  | { type: "button"; props: ButtonProps }
  | { type: "spacer"; props: SpacerProps }
  | { type: "divider"; props: DividerProps }
  | { type: "columns"; props: ColumnsProps }
  | { type: "feature_card"; props: FeatureCardProps }
  | { type: "testimonial"; props: TestimonialProps }
  | { type: "countdown"; props: CountdownProps }
  | { type: "video"; props: VideoProps }
  | { type: "form_capture"; props: FormCaptureProps };

// ── Editor Block (single canvas item) ───────────────────────
export interface EditorBlock {
  id: string;
  type: BlockType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any;
  label?: string;
  locked?: boolean;
  hidden?: boolean;
}

// ── Root editor data (serialisable state) ───────────────────
export interface EditorData {
  pageId: string;
  pageName: string;
  blocks: EditorBlock[];
  pageSettings: {
    bgColor: string;
    maxWidth: number;
    fontFamily: string;
    primaryColor: string;
  };
}

// ── Drag & Drop item types ───────────────────────────────────
export const DND_TYPES = {
  PALETTE_BLOCK: "PALETTE_BLOCK",   // dragging FROM palette
  CANVAS_BLOCK: "CANVAS_BLOCK",     // reordering inside canvas
} as const;

export interface PaletteDragItem {
  type: typeof DND_TYPES.PALETTE_BLOCK;
  blockType: BlockType;
}

export interface CanvasDragItem {
  type: typeof DND_TYPES.CANVAS_BLOCK;
  blockId: string;
  index: number;
}

// ── Default props factory ───────────────────────────────────
export function createDefaultBlock(blockType: BlockType): EditorBlock {
  const id = `block_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const defaults: Record<BlockType, EditorBlock["props"]> = {
    hero: {
      headline: "Tiêu đề chính của bạn ở đây",
      subheadline: "Mô tả ngắn gọn về sản phẩm hoặc dịch vụ của bạn để thu hút khách hàng.",
      ctaText: "Mua ngay",
      ctaUrl: "#",
      ctaColor: "#65a30d",
      bgColor: "#0f172a",
      bgImage: "",
      textAlign: "center",
      minHeight: 480,
      overlayOpacity: 0.5,
    } as HeroProps,
    text: {
      content: "Nhập nội dung văn bản của bạn tại đây. Bạn có thể thay đổi font, màu sắc và căn chỉnh từ bảng inspector bên phải.",
      fontSize: 16,
      color: "#374151",
      textAlign: "left",
      lineHeight: 1.7,
      paddingX: 32,
      paddingY: 24,
    } as TextProps,
    image: {
      src: "",
      alt: "Mô tả ảnh",
      caption: "",
      width: "full",
      borderRadius: 8,
      showCaption: false,
      objectFit: "cover",
    } as ImageProps,
    button: {
      label: "Nhấn vào đây",
      url: "#",
      style: "filled",
      color: "#65a30d",
      textColor: "#ffffff",
      size: "md",
      fullWidth: false,
      borderRadius: 8,
      align: "center",
      icon: "",
    } as ButtonProps,
    spacer: {
      height: 48,
      bgColor: "transparent",
    } as SpacerProps,
    divider: {
      color: "#e5e7eb",
      thickness: 1,
      style: "solid",
      paddingX: 32,
      paddingY: 16,
    } as DividerProps,
    columns: {
      columns: 2,
      gap: 24,
      distribution: "equal",
      children: [[], []],
    } as ColumnsProps,
    feature_card: {
      icon: "⚡",
      iconColor: "#65a30d",
      iconBg: "#dbeafe",
      title: "Tiêu đề tính năng",
      description: "Mô tả ngắn gọn về tính năng hoặc lợi ích mà khách hàng nhận được.",
      bgColor: "#ffffff",
      borderColor: "#e5e7eb",
      borderRadius: 12,
    } as FeatureCardProps,
    testimonial: {
      quote: "Sản phẩm tuyệt vời! Tôi đã sử dụng và rất hài lòng với chất lượng dịch vụ.",
      authorName: "Nguyễn Văn A",
      authorRole: "Giám đốc Marketing",
      authorAvatar: "",
      rating: 5,
      bgColor: "#f8fafc",
      textColor: "#1e293b",
      showRating: true,
    } as TestimonialProps,
    countdown: {
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      title: "Ưu đãi kết thúc sau",
      expiredText: "Ưu đãi đã kết thúc",
      bgColor: "#1e293b",
      accentColor: "#f97316",
    } as CountdownProps,
    video: {
      url: "",
      thumbnail: "",
      autoplay: false,
      muted: true,
      controls: true,
      aspectRatio: "16/9",
      borderRadius: 8,
    } as VideoProps,
    form_capture: {
      title: "Đăng ký nhận ưu đãi",
      subtitle: "Điền thông tin để nhận ngay quà tặng hấp dẫn",
      fields: [
        { id: "name", label: "Họ và tên", type: "text", required: true },
        { id: "phone", label: "Số điện thoại", type: "phone", required: true },
      ],
      submitLabel: "Đăng ký ngay",
      submitColor: "#16a34a",
      bgColor: "#ffffff",
      borderRadius: 12,
    } as FormCaptureProps,
  };

  const label: Record<BlockType, string> = {
    hero: "Hero Section",
    text: "Văn bản",
    image: "Hình ảnh",
    button: "Nút CTA",
    spacer: "Khoảng cách",
    divider: "Đường kẻ",
    columns: "Bố cục cột",
    feature_card: "Feature Card",
    testimonial: "Nhận xét",
    countdown: "Đếm ngược",
    video: "Video",
    form_capture: "Form thu thập",
  };

  return { id, type: blockType, props: defaults[blockType], label: label[blockType] };
}
