import { EditorBlock, ensureOnlookBlockMeta } from "./types";

export interface LandingTemplatePreset {
  id: string;
  name: string;
  description: string;
  category: "section" | "page";
  blocks: Omit<EditorBlock, "id">[];
}

export interface LandingAssetPreset {
  id: string;
  name: string;
  url: string;
  tone: string;
}

const id = () => `block_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const PRODUCT_ACCENT = "#111827";
const PRODUCT_ACCENT_SOFT = "#f3f4f6";
const PRODUCT_BORDER = "#d1d5db";

export const LANDING_ASSETS: LandingAssetPreset[] = [
  {
    id: "cosmetics",
    name: "Cosmetics",
    url: "/images/product/skincare_product.png",
    tone: "Beauty / product",
  },
  {
    id: "wedding",
    name: "Wedding",
    url: "/images/product/wedding_couple.png",
    tone: "Event / romantic",
  },
  {
    id: "tea",
    name: "Herb Tea",
    url: "/images/product/green_tea_product.png",
    tone: "Organic / wellness",
  },
  {
    id: "smartwatch",
    name: "Smartwatch",
    url: "/images/product/smartwatch_product.png",
    tone: "Tech / ecommerce",
  },
];

function normalizeProductBlock(block: Omit<EditorBlock, "id">): Omit<EditorBlock, "id"> {
  const props = { ...block.props };

  if ("ctaColor" in props) props.ctaColor = PRODUCT_ACCENT;
  if ("submitColor" in props) props.submitColor = PRODUCT_ACCENT;
  if ("accentColor" in props) props.accentColor = PRODUCT_ACCENT;
  if ("color" in props && block.type === "button") props.color = PRODUCT_ACCENT;
  if ("textColor" in props && block.type === "button") props.textColor = "#ffffff";
  if ("borderColor" in props) props.borderColor = PRODUCT_BORDER;
  if ("iconColor" in props) props.iconColor = PRODUCT_ACCENT;
  if ("iconBg" in props) props.iconBg = PRODUCT_ACCENT_SOFT;

  if (block.type === "product_card") {
    props.badge = props.badge || "SELECTED";
    props.bgColor = "#ffffff";
    props.borderColor = PRODUCT_BORDER;
    props.ctaText = props.ctaText || "Chon mau";
    if (Array.isArray(props.items)) {
      props.items = props.items.map((item: Record<string, unknown>) => ({
        ...item,
        badge: typeof item.badge === "string" && item.badge.length > 0 ? item.badge : "ITEM",
      }));
    }
  }

  if (block.type === "collection_list") {
    props.bgColor = PRODUCT_ACCENT;
  }

  return {
    ...block,
    props,
  };
}

const BASE_LANDING_TEMPLATE_PRESETS: LandingTemplatePreset[] = [
  {
    id: "beauty-shop",
    name: "Beauty Shop",
    description: "My pham, spa, skincare voi hero anh san pham va form tu van.",
    category: "page",
    blocks: [
      {
        type: "hero",
        label: "Hero - Beauty Shop",
        props: {
          headline: "Lan da sang khoe moi ngay",
          subheadline: "Gioi thieu san pham cham soc da voi uu dai rieng cho khach hang moi.",
          ctaText: "Nhan tu van",
          ctaUrl: "#form",
          ctaColor: "#db2777",
          bgColor: "#831843",
          bgImage: LANDING_ASSETS[0].url,
          textAlign: "left",
          minHeight: 540,
          overlayOpacity: 0.48,
        },
      },
      {
        type: "feature_card",
        label: "Cam ket san pham",
        props: {
          icon: "+",
          iconColor: "#db2777",
          iconBg: "#fce7f3",
          title: "Thanh phan duoc chon loc",
          description: "Tap trung vao loi ich, cam ket va bang chung de khach hang tin tuong truoc khi de lai thong tin.",
          bgColor: "#fff7fb",
          borderColor: "#fbcfe8",
          borderRadius: 16,
        },
      },
      {
        type: "form_capture",
        label: "Form tu van skincare",
        props: {
          title: "Nhan phac do mien phi",
          subtitle: "De lai thong tin de duoc tu van san pham phu hop.",
          fields: [
            { id: "name", label: "Ho va ten", type: "text", required: true },
            { id: "phone", label: "So dien thoai", type: "phone", required: true },
          ],
          submitLabel: "Nhan tu van",
          submitColor: "#db2777",
          bgColor: "#ffffff",
          borderRadius: 16,
        },
      },
    ],
  },
  {
    id: "wedding-invite",
    name: "Wedding Invite",
    description: "Thiep cuoi online voi hero lang man va thong tin su kien.",
    category: "page",
    blocks: [
      {
        type: "hero",
        label: "Hero - Wedding",
        props: {
          headline: "Minh Anh & The Cong",
          subheadline: "Tran trong kinh moi ban den chung vui trong ngay hanh phuc cua chung toi.",
          ctaText: "Xac nhan tham du",
          ctaUrl: "#rsvp",
          ctaColor: "#f97316",
          bgColor: "#7c2d12",
          bgImage: LANDING_ASSETS[1].url,
          textAlign: "center",
          minHeight: 620,
          overlayOpacity: 0.35,
        },
      },
      {
        type: "text",
        label: "Thong tin tiec cuoi",
        props: {
          content: "Le cuoi bat dau luc 18:00, thu Bay tai trung tam tiec cuoi. Su hien dien cua ban la niem vui lon cua gia dinh.",
          fontSize: 20,
          color: "#7c2d12",
          textAlign: "center",
          lineHeight: 1.8,
          paddingX: 48,
          paddingY: 40,
        },
      },
      {
        type: "form_capture",
        label: "Form RSVP",
        props: {
          title: "Xac nhan tham du",
          subtitle: "Hay cho chung toi biet ban co the den chung vui khong nhe.",
          fields: [
            { id: "name", label: "Ten khach moi", type: "text", required: true },
            { id: "phone", label: "So dien thoai", type: "phone", required: false },
          ],
          submitLabel: "Gui xac nhan",
          submitColor: "#f97316",
          bgColor: "#fff7ed",
          borderRadius: 18,
        },
      },
    ],
  },
  {
    id: "herb-tea",
    name: "Herb Tea",
    description: "Landing page tra thao moc tach thanh tung khoi sua duoc.",
    category: "page",
    blocks: [
      {
        type: "tea_landing",
        label: "Herb Tea Landing Page",
        props: {
          brand: "Pure Leaf",
          navItems: ["Shop", "About", "FAQ", "Contact"],
          headline: "Pure Leaf Organic Green Tea",
          subheadline: "Revitalize your mind and body, naturally.",
          ctaText: "Shop Now",
          ctaUrl: "#order",
          heroImage: LANDING_ASSETS[2].url,
          philosophyTitle: "Our Philosophy",
          philosophyText: "Source organic ingredients and effortless sales. We build a landing page that tells the product story, shows benefits, and closes orders clearly.",
          blends: [
            { id: "zen", name: "Zen Green Tea", description: "Lower caffeine blend for calm focus, wellness routines and a gentle start to the day.", icon: "leaf" },
            { id: "mint", name: "Mint Fresh", description: "Refreshing mint profile for digestion, breath freshness and light daily energy.", icon: "mint" },
            { id: "jasmine", name: "Jasmine Blossom", description: "Soft floral notes with a relaxing aroma, suitable for evening tea rituals.", icon: "flower" },
          ],
          ingredients: [
            { id: "tea", name: "Tea Leaf", description: "Natural green tea leaves.", icon: "leaf" },
            { id: "mint", name: "Mint Fresh", description: "Cool and refreshing.", icon: "mint" },
            { id: "ginger", name: "Ginger Root", description: "Warm herbal balance.", icon: "ginger" },
          ],
          brewSteps: [
            { id: "temp", label: "Temperature", value: "80C" },
            { id: "time", label: "Time", value: "3 min" },
            { id: "enjoy", label: "Enjoy", value: "Sip slow" },
          ],
          reviewQuote: "The freshest tea I have ever tasted.",
          reviewAuthor: "Verified customer",
          signupTitle: "Join Our Community",
          signupPlaceholder: "Your email address",
          signupButton: "Subscribe",
          accentColor: "#6f8f22",
          bgColor: "#f5f2e7",
        },
      },
    ],
  },
  {
    id: "product-launch",
    name: "Product Launch",
    description: "Hero, loi ich, hinh san pham, countdown va form thu lead.",
    category: "page",
    blocks: [
      {
        type: "hero",
        label: "Hero - Product Launch",
        props: {
          headline: "Ra mat san pham moi",
          subheadline: "Tao trang gioi thieu san pham voi thong diep ro rang, CTA noi bat va hinh anh day cam hung.",
          ctaText: "Nhan uu dai som",
          ctaUrl: "#register",
          ctaColor: "#65a30d",
          bgColor: "#111827",
          bgImage: "",
          textAlign: "center",
          minHeight: 460,
          overlayOpacity: 0.55,
        },
      },
      {
        type: "image",
        label: "Anh san pham",
        props: {
          src: LANDING_ASSETS[3].url,
          alt: "Product campaign visual",
          caption: "Hinh anh san pham co the thay doi trong Inspector.",
          width: "large",
          borderRadius: 18,
          showCaption: true,
          objectFit: "cover",
        },
      },
      {
        type: "feature_card",
        label: "Loi ich chinh",
        props: {
          icon: "*",
          iconColor: "#65a30d",
          iconBg: "#ecfccb",
          title: "Gia tri khac biet",
          description: "Neu ro loi ich lon nhat de khach hang hieu vi sao nen hanh dong ngay.",
          bgColor: "#ffffff",
          borderColor: "#d9f99d",
          borderRadius: 12,
        },
      },
      {
        type: "countdown",
        label: "Countdown uu dai",
        props: {
          targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          title: "Uu dai mo ban ket thuc sau",
          expiredText: "Uu dai da ket thuc",
          bgColor: "#0f172a",
          accentColor: "#65a30d",
        },
      },
      {
        type: "form_capture",
        label: "Form dang ky",
        props: {
          title: "Dang ky nhan tu van",
          subtitle: "De lai thong tin, doi ngu se lien he trong ngay.",
          fields: [
            { id: "name", label: "Ho va ten", type: "text", required: true },
            { id: "phone", label: "So dien thoai", type: "phone", required: true },
            { id: "email", label: "Email", type: "email", required: false },
          ],
          submitLabel: "Gui thong tin",
          submitColor: "#65a30d",
          bgColor: "#ffffff",
          borderRadius: 14,
        },
      },
    ],
  },
  {
    id: "smartwatch-performance",
    name: "Smartwatch Performance",
    description: "Landing page ban dong ho thong minh voi cac khoi UI tach rieng de sua.",
    category: "page",
    blocks: [
      {
        type: "hero",
        label: "Hero - Smartwatch",
        props: {
          headline: "SMARTWATCH. UNMATCHED ENDURANCE.",
          subheadline: "Theo doi suc khoe, ket noi moi ngay va pin ben bi trong mot thiet ke manh me.",
          ctaText: "Mua ngay",
          ctaUrl: "#order",
          ctaColor: "#65a30d",
          bgColor: "#020617",
          bgImage: "",
          textAlign: "left",
          minHeight: 500,
          overlayOpacity: 0.4,
        },
      },
      {
        type: "image",
        label: "Anh hero san pham",
        props: {
          src: LANDING_ASSETS[3].url,
          alt: "Smartwatch product",
          caption: "Thay anh san pham tai Inspector hoac tab Assets.",
          width: "large",
          borderRadius: 20,
          showCaption: false,
          objectFit: "cover",
        },
      },
      {
        type: "feature_card",
        label: "Performance card",
        props: {
          icon: "01",
          iconColor: "#22d3ee",
          iconBg: "#082f49",
          title: "Chrome X1 Processor",
          description: "Xu ly nhanh, thao tac muot va toi uu nang luong cho cac tac vu hang ngay.",
          bgColor: "#f8fafc",
          borderColor: "#bae6fd",
          borderRadius: 18,
        },
      },
      {
        type: "feature_card",
        label: "Health tracking card",
        props: {
          icon: "02",
          iconColor: "#ef4444",
          iconBg: "#fee2e2",
          title: "Advanced Biometrics",
          description: "Theo doi nhip tim, van dong va cac chi so suc khoe quan trong tren co tay.",
          bgColor: "#ffffff",
          borderColor: "#fecaca",
          borderRadius: 18,
        },
      },
      {
        type: "feature_card",
        label: "Battery card",
        props: {
          icon: "24h",
          iconColor: "#65a30d",
          iconBg: "#ecfccb",
          title: "24-hour battery life",
          description: "San sang dong hanh ca ngay voi che do tiet kiem pin thong minh.",
          bgColor: "#ffffff",
          borderColor: "#d9f99d",
          borderRadius: 18,
        },
      },
      {
        type: "countdown",
        label: "Countdown uu dai smartwatch",
        props: {
          targetDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          title: "Uu dai mo ban ket thuc sau",
          expiredText: "Uu dai da ket thuc",
          bgColor: "#0f172a",
          accentColor: "#65a30d",
        },
      },
      {
        type: "form_capture",
        label: "Form dat hang smartwatch",
        props: {
          title: "Nhan uu dai mo ban",
          subtitle: "Nhap thong tin de nhan tu van va ma uu dai.",
          fields: [
            { id: "name", label: "Ho va ten", type: "text", required: true },
            { id: "phone", label: "So dien thoai", type: "phone", required: true },
          ],
          submitLabel: "Nhan uu dai",
          submitColor: "#65a30d",
          bgColor: "#ffffff",
          borderRadius: 16,
        },
      },
    ],
  },
  {
    id: "webinar-lead",
    name: "Webinar Lead",
    description: "Dang ky su kien, thong tin dien gia va CTA.",
    category: "page",
    blocks: [
      {
        type: "hero",
        label: "Hero - Webinar",
        props: {
          headline: "Webinar tang truong doanh thu",
          subheadline: "Hoc cach xay dung landing page, funnel va tracking de toi uu chuyen doi.",
          ctaText: "Dang ky mien phi",
          ctaUrl: "#form",
          ctaColor: "#7c3aed",
          bgColor: "#1e1b4b",
          bgImage: "",
          textAlign: "left",
          minHeight: 520,
          overlayOpacity: 0.45,
        },
      },
      {
        type: "text",
        label: "Noi dung gioi thieu",
        props: {
          content: "Buoi chia se phu hop cho founder, marketer va doi ngu ban hang dang muon tang ti le chuyen doi tu traffic hien co.",
          fontSize: 18,
          color: "#334155",
          textAlign: "center",
          lineHeight: 1.8,
          paddingX: 48,
          paddingY: 32,
        },
      },
      {
        type: "form_capture",
        label: "Form dang ky webinar",
        props: {
          title: "Giu cho tham du",
          subtitle: "Nhap thong tin de nhan link tham gia va tai lieu sau chuong trinh.",
          fields: [
            { id: "name", label: "Ho va ten", type: "text", required: true },
            { id: "email", label: "Email cong viec", type: "email", required: true },
          ],
          submitLabel: "Nhan link tham gia",
          submitColor: "#7c3aed",
          bgColor: "#ffffff",
          borderRadius: 14,
        },
      },
    ],
  },
  {
    id: "testimonial-strip",
    name: "Social Proof",
    description: "Nhan xet khach hang va bang chung tin cay.",
    category: "section",
    blocks: [
      {
        type: "testimonial",
        label: "Nhan xet khach hang",
        props: {
          quote: "Trang landing moi giup doi ngu cua chung toi tao chien dich nhanh hon va do luong ro rang hon.",
          authorName: "Nguyen Minh Anh",
          authorRole: "Growth Manager",
          authorAvatar: "",
          rating: 5,
          bgColor: "#f8fafc",
          textColor: "#0f172a",
          showRating: true,
        },
      },
      {
        type: "button",
        label: "CTA sau nhan xet",
        props: {
          label: "Bat dau ngay",
          url: "#form",
          style: "filled",
          color: "#65a30d",
          textColor: "#ffffff",
          size: "lg",
          fullWidth: false,
          borderRadius: 999,
          align: "center",
          icon: "",
        },
      },
    ],
  },
  {
    id: "hero-slide-show",
    name: "Hero Slide Show",
    description: "Khoi carousel anh lon giong mau slide trong builder LadiPage.",
    category: "section",
    blocks: [
      {
        type: "carousel",
        label: "Hero image slider",
        props: {
          images: [
            "/images/carousel/carousel-01.png",
            "/images/carousel/carousel-02.png",
            "/images/carousel/carousel-03.png",
            "/images/carousel/carousel-04.png",
          ],
          autoplay: true,
          interval: 3500,
          showIndicators: true,
          showArrows: true,
          height: 420,
        },
      },
      {
        type: "button",
        label: "CTA cho slider",
        props: {
          label: "Kham pha ngay",
          url: "#form",
          style: "filled",
          color: "#65a30d",
          textColor: "#ffffff",
          size: "lg",
          fullWidth: false,
          borderRadius: 999,
          align: "center",
          icon: "",
        },
      },
    ],
  },
  {
    id: "ladi-product-grid",
    name: "Product Grid",
    description: "Mau ban hang gom gallery, danh sach san pham va CTA.",
    category: "page",
    blocks: [
      {
        type: "hero",
        label: "Hero - Flash Sale",
        props: {
          headline: "Bo suu tap moi dang mo ban",
          subheadline: "Trung bay san pham, uu dai va loi ich trong mot trang co the sua truc tiep.",
          ctaText: "Xem uu dai",
          ctaUrl: "#products",
          ctaColor: "#ef4444",
          bgColor: "#111827",
          bgImage: "/images/product/smartwatch_product.png",
          textAlign: "left",
          minHeight: 520,
          overlayOpacity: 0.52,
        },
      },
      {
        type: "product_card",
        label: "Product grid",
        props: {
          title: "San pham noi bat",
          description: "Danh sach san pham mau",
          price: "690.000d",
          oldPrice: "990.000d",
          image: "/images/product/product-01.jpg",
          badge: "SALE",
          ctaText: "MUA NGAY",
          bgColor: "#f8fafc",
          borderColor: "#e5e7eb",
          borderRadius: 16,
          columns: 3,
          items: [
            {
              id: "watch",
              title: "Smartwatch S9",
              description: "Theo doi suc khoe, pin ben, thiet ke hien dai.",
              price: "1.290.000d",
              oldPrice: "1.890.000d",
              image: "/images/product/smartwatch_product.png",
              badge: "-32%",
            },
            {
              id: "skin",
              title: "Serum Glow",
              description: "Cham soc da, tang do am va do sang tu nhien.",
              price: "490.000d",
              oldPrice: "690.000d",
              image: "/images/product/skincare_product.png",
              badge: "HOT",
            },
            {
              id: "tea",
              title: "Organic Tea",
              description: "Tra thao moc huu co cho routine hang ngay.",
              price: "220.000d",
              oldPrice: "320.000d",
              image: "/images/product/green_tea_product.png",
              badge: "NEW",
            },
          ],
        },
      },
      {
        type: "form_capture",
        label: "Form chot don",
        props: {
          title: "Nhan ma uu dai",
          subtitle: "De lai thong tin de duoc tu van va nhan voucher hom nay.",
          fields: [
            { id: "name", label: "Ho va ten", type: "text", required: true },
            { id: "phone", label: "So dien thoai", type: "phone", required: true },
          ],
          submitLabel: "Nhan voucher",
          submitColor: "#ef4444",
          bgColor: "#ffffff",
          borderRadius: 16,
        },
      },
    ],
  },
  {
    id: "course-slide-funnel",
    name: "Course Funnel",
    description: "Mau e-learning co hero, slide noi dung, lich hoc va form dang ky.",
    category: "page",
    blocks: [
      {
        type: "hero",
        label: "Hero - Course",
        props: {
          headline: "Khoa hoc Marketing thuc chien",
          subheadline: "Bien Facebook leads thanh hoc vien voi landing page, voucher va automation.",
          ctaText: "Dang ky giu cho",
          ctaUrl: "#register",
          ctaColor: "#2563eb",
          bgColor: "#0f172a",
          bgImage: "/images/carousel/carousel-02.png",
          textAlign: "center",
          minHeight: 520,
          overlayOpacity: 0.58,
        },
      },
      {
        type: "tabs",
        label: "Noi dung khoa hoc",
        props: {
          tabs: [
            { id: "module-1", label: "Module 1", content: "Xay landing page, cau truc offer va form thu lead." },
            { id: "module-2", label: "Module 2", content: "Cai dat Facebook Ads, voucher va automation cham soc." },
            { id: "module-3", label: "Module 3", content: "Do luong conversion, toi uu campaign va bao cao." },
          ],
          activeTabId: "module-1",
          style: "pills",
          accentColor: "#2563eb",
        },
      },
      {
        type: "carousel",
        label: "Slide bai hoc",
        props: {
          images: [
            "/images/carousel/carousel-01.png",
            "/images/carousel/carousel-03.png",
            "/images/carousel/carousel-04.png",
          ],
          autoplay: false,
          interval: 4000,
          showIndicators: true,
          showArrows: true,
          height: 360,
        },
      },
      {
        type: "form_capture",
        label: "Form dang ky hoc vien",
        props: {
          title: "Nhan lich khai giang",
          subtitle: "Nhap thong tin de nhan tu van lo trinh va uu dai hoc phi.",
          fields: [
            { id: "name", label: "Ho va ten", type: "text", required: true },
            { id: "phone", label: "So dien thoai", type: "phone", required: true },
            { id: "email", label: "Email", type: "email", required: false },
          ],
          submitLabel: "Nhan lich hoc",
          submitColor: "#2563eb",
          bgColor: "#ffffff",
          borderRadius: 16,
        },
      },
    ],
  },
  {
    id: "gallery-showcase",
    name: "Gallery Showcase",
    description: "Mau thu vien anh dung cho slide san pham, su kien hoac portfolio.",
    category: "section",
    blocks: [
      {
        type: "gallery",
        label: "Anh mau dang grid",
        props: {
          images: [
            "/images/grid-image/image-01.png",
            "/images/grid-image/image-02.png",
            "/images/grid-image/image-03.png",
            "/images/grid-image/image-04.png",
            "/images/grid-image/image-05.png",
            "/images/grid-image/image-06.png",
          ],
          columns: 3,
          gap: 14,
          borderRadius: 14,
          aspectRatio: "4/3",
        },
      },
    ],
  },
  {
    id: "builder-product-kit",
    name: "Builder Product Kit",
    description: "Menu, hero, grid san pham, FAQ va form chot don lay cam hung tu LadiPage Builder.",
    category: "page",
    blocks: [
      {
        type: "menu",
        label: "Menu bán hàng",
        props: {
          logoText: "Lumi Shop",
          logoUrl: "#",
          items: [
            { label: "Sản phẩm", url: "#products" },
            { label: "Ưu đãi", url: "#offer" },
            { label: "Đánh giá", url: "#reviews" },
            { label: "Đặt hàng", url: "#order" },
          ],
          bgColor: "#ffffff",
          textColor: "#111827",
        },
      },
      {
        type: "hero",
        label: "Hero sản phẩm",
        props: {
          headline: "Ra mắt bộ sản phẩm bán chạy mùa này",
          subheadline: "Kết hợp ảnh sản phẩm, ưu đãi, bằng chứng xã hội và form đặt hàng trong một landing page gọn.",
          ctaText: "Nhận ưu đãi",
          ctaUrl: "#order",
          ctaColor: "#ef4444",
          bgColor: "#0f172a",
          bgImage: "/images/product/skincare_product.png",
          textAlign: "left",
          minHeight: 560,
          overlayOpacity: 0.5,
        },
      },
      {
        type: "product_card",
        label: "Lưới sản phẩm",
        props: {
          title: "Combo bán chạy",
          description: "Các sản phẩm được chọn cho chiến dịch",
          price: "690.000d",
          oldPrice: "990.000d",
          image: "/images/product/product-01.jpg",
          badge: "SALE",
          ctaText: "THÊM VÀO GIỎ",
          bgColor: "#f8fafc",
          borderColor: "#e5e7eb",
          borderRadius: 16,
          columns: 3,
          items: [
            {
              id: "skin",
              title: "Serum Glow",
              description: "Dưỡng sáng và phục hồi da.",
              price: "490.000d",
              oldPrice: "690.000d",
              image: "/images/product/skincare_product.png",
              badge: "HOT",
            },
            {
              id: "watch",
              title: "Smartwatch Pro",
              description: "Theo dõi sức khỏe và vận động.",
              price: "1.290.000d",
              oldPrice: "1.890.000d",
              image: "/images/product/smartwatch_product.png",
              badge: "-32%",
            },
            {
              id: "tea",
              title: "Organic Tea",
              description: "Trà thảo mộc cho routine mỗi ngày.",
              price: "220.000d",
              oldPrice: "320.000d",
              image: "/images/product/green_tea_product.png",
              badge: "NEW",
            },
          ],
        },
      },
      {
        type: "accordion",
        label: "FAQ mua hàng",
        props: {
          items: [
            { id: "ship", question: "Bao lâu nhận hàng?", answer: "Đơn nội thành thường được giao trong 24-48h sau khi xác nhận." },
            { id: "pay", question: "Có thanh toán khi nhận hàng không?", answer: "Có. Bạn có thể chọn COD hoặc chuyển khoản khi tư vấn viên xác nhận đơn." },
            { id: "return", question: "Có đổi trả không?", answer: "Hỗ trợ đổi trả theo chính sách trong 7 ngày nếu sản phẩm còn nguyên điều kiện." },
          ],
          allowMultiple: false,
          accentColor: "#ef4444",
        },
      },
      {
        type: "form_capture",
        label: "Form checkout nhanh",
        props: {
          title: "Giữ ưu đãi hôm nay",
          subtitle: "Nhập thông tin, đội ngũ sẽ gọi xác nhận đơn và mã giảm giá.",
          fields: [
            { id: "name", label: "Họ và tên", type: "text", required: true },
            { id: "phone", label: "Số điện thoại", type: "phone", required: true },
            { id: "email", label: "Email", type: "email", required: false },
          ],
          submitLabel: "Gửi thông tin",
          submitColor: "#ef4444",
          bgColor: "#ffffff",
          borderRadius: 16,
        },
      },
    ],
  },
  {
    id: "builder-ui-elements",
    name: "Builder UI Elements",
    description: "Tap hop block UI hay dung: menu, tabs, bang, survey, collection.",
    category: "section",
    blocks: [
      {
        type: "tabs",
        label: "Tabs thông tin",
        props: {
          tabs: [
            { id: "benefit", label: "Lợi ích", content: "Tóm tắt nhanh giá trị chính để khách hàng nắm được trong vài giây." },
            { id: "proof", label: "Bằng chứng", content: "Thêm review, số liệu, chứng nhận hoặc case study để tăng niềm tin." },
            { id: "offer", label: "Ưu đãi", content: "Nêu rõ quà tặng, giới hạn thời gian và bước tiếp theo." },
          ],
          activeTabId: "benefit",
          style: "pills",
          accentColor: "#7c3aed",
        },
      },
      {
        type: "collection_list",
        label: "Collection lợi ích",
        props: {
          items: [
            { id: "fast", title: "Dựng nhanh", desc: "Ghép block có sẵn, chỉnh text và ảnh trực tiếp.", icon: "01" },
            { id: "measure", title: "Đo lường", desc: "Gắn form, pixel và sự kiện theo mục tiêu chiến dịch.", icon: "02" },
            { id: "scale", title: "Nhân bản", desc: "Tạo nhiều biến thể offer cho từng nhóm khách hàng.", icon: "03" },
          ],
          columns: 3,
          layout: "grid",
          bgColor: "#111827",
        },
      },
      {
        type: "table",
        label: "Bảng so sánh",
        props: {
          headers: ["Gói", "Phù hợp", "CTA"],
          rows: [
            ["Starter", "Test offer nhanh", "Đăng ký"],
            ["Growth", "Chạy ads hằng ngày", "Nhận tư vấn"],
            ["Scale", "Đội marketing nhiều chiến dịch", "Liên hệ"],
          ],
          bgColor: "#ffffff",
          borderColor: "#e5e7eb",
        },
      },
      {
        type: "survey",
        label: "Survey nhu cầu",
        props: {
          question: "Bạn muốn tối ưu phần nào trước?",
          options: ["Landing page", "Form lead", "Quảng cáo", "Automation"],
          accentColor: "#7c3aed",
          submitLabel: "Gửi lựa chọn",
        },
      },
    ],
  },
];

function hasBlock(template: LandingTemplatePreset, type: EditorBlock["type"]) {
  return template.blocks.some((block) => block.type === type);
}

function conversionSectionsFor(template: LandingTemplatePreset): Omit<EditorBlock, "id">[] {
  if (template.category !== "page") return [];

  const value = `${template.id} ${template.name} ${template.description}`.toLowerCase();
  const accent = PRODUCT_ACCENT;
  const blocks: Omit<EditorBlock, "id">[] = [];
  const pushIfMissing = (type: EditorBlock["type"], block: Omit<EditorBlock, "id">) => {
    if (!hasBlock(template, type) && !blocks.some((item) => item.type === type)) blocks.push(block);
  };

  const menu = (logoText: string, items: { label: string; url: string }[]): Omit<EditorBlock, "id"> => ({
    type: "menu",
    label: "Navigation",
    props: {
      logoText,
      logoUrl: "#",
      items,
      bgColor: "#ffffff",
      textColor: "#0f172a",
    },
  });

  if (value.includes("wedding")) {
    pushIfMissing("menu", menu("Wedding Day", [
      { label: "Lich trinh", url: "#schedule" },
      { label: "Dia diem", url: "#venue" },
      { label: "RSVP", url: "#rsvp" },
    ]));
    pushIfMissing("gallery", {
      type: "gallery",
      label: "Wedding gallery",
      props: {
        images: [LANDING_ASSETS[1].url, "/images/grid-image/image-02.png", "/images/grid-image/image-05.png"],
        columns: 3,
        gap: 12,
        borderRadius: 16,
        aspectRatio: "4/3",
      },
    });
    pushIfMissing("accordion", {
      type: "accordion",
      label: "Thong tin khach moi",
      props: {
        items: [
          { id: "dress", question: "Trang phuc goi y la gi?", answer: "Khach moi co the chon trang phuc lich su, uu tien tone trung tinh." },
          { id: "time", question: "Nen co mat luc nao?", answer: "Nen co mat truoc gio khai tiec 20 phut de don tiep va chup anh." },
        ],
        allowMultiple: false,
        accentColor: accent,
      },
    });
    return blocks;
  }

  if (value.includes("beauty") || value.includes("spa") || value.includes("skincare")) {
    pushIfMissing("menu", menu("Glow Studio", [
      { label: "Lieu trinh", url: "#routine" },
      { label: "San pham", url: "#products" },
      { label: "Tu van", url: "#form" },
    ]));
    pushIfMissing("product_card", {
      type: "product_card",
      label: "Skincare product trio",
      props: {
        title: "Glow Serum",
        description: "Bo san pham cham soc da hang ngay.",
        price: "490.000d",
        oldPrice: "690.000d",
        image: LANDING_ASSETS[0].url,
        badge: "BEST",
        ctaText: "Chon bo nay",
        bgColor: "#ffffff",
        borderColor: PRODUCT_BORDER,
        borderRadius: 16,
        columns: 3,
        items: [
          { id: "cleanser", title: "Clean Gel", description: "Lam sach diu nhe.", price: "290.000d", oldPrice: "390.000d", image: LANDING_ASSETS[0].url, badge: "01" },
          { id: "serum", title: "Glow Serum", description: "Cap am va lam sang.", price: "490.000d", oldPrice: "690.000d", image: LANDING_ASSETS[0].url, badge: "02" },
          { id: "cream", title: "Day Cream", description: "Khoa am ban ngay.", price: "360.000d", oldPrice: "460.000d", image: LANDING_ASSETS[0].url, badge: "03" },
        ],
      },
    });
    pushIfMissing("chat_widget", {
      type: "chat_widget",
      label: "Skin consultation",
      props: {
        title: "Can soi routine?",
        greeting: "Chon tinh trang da, doi ngu se goi lai voi goi phu hop.",
        agentName: "Tu van da lieu",
        replyTime: "Phan hoi trong vai phut",
        primaryChannel: "Chat ngay",
        secondaryChannel: "Zalo",
        buttonLabel: "Nhan tu van",
        accentColor: accent,
        bgColor: "#ffffff",
        position: "right",
        showSurvey: true,
      },
    });
    pushIfMissing("accordion", {
      type: "accordion",
      label: "Skincare FAQ",
      props: {
        items: [
          { id: "skin", question: "Da nhay cam co dung duoc khong?", answer: "Co. Nen bat dau voi routine nhe va duoc tu van theo tinh trang da." },
          { id: "result", question: "Bao lau thay thay doi?", answer: "Thong thuong can 2-4 tuan de danh gia do phu hop cua routine." },
        ],
        allowMultiple: false,
        accentColor: accent,
      },
    });
    return blocks;
  }

  if (value.includes("course") || value.includes("webinar") || value.includes("e-learning")) {
    pushIfMissing("menu", menu("Growth Class", [
      { label: "Noi dung", url: "#curriculum" },
      { label: "Lich hoc", url: "#schedule" },
      { label: "Dang ky", url: "#register" },
    ]));
    pushIfMissing("table", {
      type: "table",
      label: "Course schedule",
      props: {
        headers: ["Buoi", "Chu de", "Ket qua"],
        rows: [
          ["01", "Offer va landing page", "Co cau truc trang ban duoc"],
          ["02", "Ads va tracking", "Doc duoc so lieu campaign"],
          ["03", "Automation", "Cham soc lead va hoc vien"],
        ],
        bgColor: "#ffffff",
        borderColor: PRODUCT_BORDER,
      },
    });
    pushIfMissing("survey", {
      type: "survey",
      label: "Learner survey",
      props: {
        question: "Ban dang muon cai thien phan nao?",
        options: ["Landing page", "Facebook Ads", "Voucher", "Automation"],
        accentColor: accent,
        submitLabel: "Gui lua chon",
      },
    });
    pushIfMissing("chat_widget", {
      type: "chat_widget",
      label: "Course advisor",
      props: {
        title: "Can lo trinh hoc?",
        greeting: "Chon muc tieu hien tai, co van se gui lich hoc phu hop.",
        agentName: "Co van khoa hoc",
        replyTime: "Phan hoi trong vai phut",
        primaryChannel: "Chat ngay",
        secondaryChannel: "Zalo",
        buttonLabel: "Nhan lo trinh",
        accentColor: accent,
        bgColor: "#ffffff",
        position: "left",
        showSurvey: true,
      },
    });
    return blocks;
  }

  if (value.includes("tea")) {
    pushIfMissing("menu", menu("Pure Leaf", [
      { label: "Blend", url: "#blend" },
      { label: "Brew", url: "#brew" },
      { label: "Dat hang", url: "#order" },
    ]));
    pushIfMissing("product_card", {
      type: "product_card",
      label: "Tea bundles",
      props: {
        title: "Daily Tea Bundle",
        description: "Combo tra thao moc cho routine hang ngay.",
        price: "220.000d",
        oldPrice: "320.000d",
        image: LANDING_ASSETS[2].url,
        badge: "PURE",
        ctaText: "Chon goi",
        bgColor: "#ffffff",
        borderColor: PRODUCT_BORDER,
        borderRadius: 16,
        columns: 2,
        items: [
          { id: "morning", title: "Morning Pack", description: "Vi thanh nhe.", price: "220.000d", oldPrice: "320.000d", image: LANDING_ASSETS[2].url, badge: "AM" },
          { id: "evening", title: "Evening Pack", description: "Vi diu cho buoi toi.", price: "240.000d", oldPrice: "340.000d", image: LANDING_ASSETS[2].url, badge: "PM" },
        ],
      },
    });
    pushIfMissing("testimonial", {
      type: "testimonial",
      label: "Tea review",
      props: {
        quote: "Vi tra de uong, dong goi dep va thong tin san pham ro rang.",
        authorName: "Khach hang da xac minh",
        authorRole: "Nguoi mua hang",
        authorAvatar: "",
        rating: 5,
        bgColor: "#f8fafc",
        textColor: "#0f172a",
        showRating: true,
      },
    });
    return blocks;
  }

  if (value.includes("smartwatch")) {
    pushIfMissing("menu", menu("Titan Watch", [
      { label: "Tinh nang", url: "#features" },
      { label: "Thong so", url: "#specs" },
      { label: "Dat hang", url: "#order" },
    ]));
    pushIfMissing("table", {
      type: "table",
      label: "Tech specs",
      props: {
        headers: ["Hang muc", "Gia tri", "Ghi chu"],
        rows: [
          ["Pin", "24h", "Su dung hon hop"],
          ["Ket noi", "LTE + GPS", "Theo doi van dong"],
          ["Than vo", "Titanium", "Nhe va ben"],
        ],
        bgColor: "#ffffff",
        borderColor: PRODUCT_BORDER,
      },
    });
    pushIfMissing("chat_widget", {
      type: "chat_widget",
      label: "Tech advisor",
      props: {
        title: "Can chon phien ban?",
        greeting: "Cho biet nhu cau tap luyen va ket noi, doi ngu se goi y phien ban phu hop.",
        agentName: "Tu van san pham",
        replyTime: "Phan hoi trong vai phut",
        primaryChannel: "Chat ngay",
        secondaryChannel: "Zalo",
        buttonLabel: "Nhan goi y",
        accentColor: accent,
        bgColor: "#ffffff",
        position: "right",
        showSurvey: true,
      },
    });
    return blocks;
  }

  if (value.includes("product grid") || value.includes("flash sale") || value.includes("product launch")) {
    pushIfMissing("menu", menu("Launch Kit", [
      { label: "San pham", url: "#products" },
      { label: "Uu dai", url: "#offer" },
      { label: "Dat hang", url: "#order" },
    ]));
    pushIfMissing("collection_list", {
      type: "collection_list",
      label: "Launch benefits",
      props: {
        items: [
          { id: "stock", title: "Hang co san", desc: "Ngan ton kho va thong tin uu dai ro rang.", icon: "01" },
          { id: "proof", title: "Bang chung", desc: "Hien review, hinh that va cam ket sau mua.", icon: "02" },
          { id: "order", title: "Chot don", desc: "Form ngan va CTA tap trung vao mot hanh dong.", icon: "03" },
        ],
        columns: 3,
        layout: "grid",
        bgColor: accent,
      },
    });
    pushIfMissing("funnel_popup", {
      type: "funnel_popup",
      label: "Launch popup",
      props: {
        title: "Nhan ma uu dai truoc khi roi trang",
        description: "Gui thong tin de nhan ma uu dai va lich tu van san pham.",
        ctaText: "Nhan uu dai",
        ctaUrl: "#form",
        trigger: "exit_intent",
        triggerValue: 60,
        frequency: "session",
        accentColor: accent,
        bgColor: "#ffffff",
        imageUrl: "",
        showBackdrop: true,
      },
    });
    return blocks;
  }

  pushIfMissing("menu", menu("LadiPage", [
    { label: "Loi ich", url: "#benefits" },
    { label: "Dang ky", url: "#form" },
  ]));
  pushIfMissing("chat_widget", {
    type: "chat_widget",
    label: "Support widget",
    props: {
      title: "Can tu van nhanh?",
      greeting: "Chon nhu cau cua ban, doi ngu se goi lai va gui uu dai phu hop.",
      agentName: "Tu van vien",
      replyTime: "Phan hoi trong vai phut",
      primaryChannel: "Chat ngay",
      secondaryChannel: "Zalo",
      buttonLabel: "Bat dau tu van",
      accentColor: accent,
      bgColor: "#ffffff",
      position: "right",
      showSurvey: true,
    },
  });
  return blocks;
}

export const LANDING_TEMPLATE_PRESETS: LandingTemplatePreset[] = BASE_LANDING_TEMPLATE_PRESETS.map((template) => {
  const conversionBlocks = conversionSectionsFor(template);

  return {
    ...template,
    blocks: [
      ...conversionBlocks.filter((block) => block.type === "menu").map(normalizeProductBlock),
      ...template.blocks.map(normalizeProductBlock),
      ...conversionBlocks.filter((block) => block.type !== "menu").map(normalizeProductBlock),
    ],
  };
});

export function instantiateTemplateBlocks(templateId: string): EditorBlock[] {
  const preset = LANDING_TEMPLATE_PRESETS.find((item) => item.id === templateId);
  if (!preset) return [];

  return preset.blocks.map((block) =>
    ensureOnlookBlockMeta({
      ...block,
      id: id(),
      props: { ...block.props },
    })
  );
}

export function resolveTemplatePresetId(input: { name: string; templateId?: string; id?: string }): string {
  if (input.templateId && LANDING_TEMPLATE_PRESETS.some((preset) => preset.id === input.templateId)) {
    return input.templateId;
  }

  const value = `${input.name} ${input.id ?? ""}`.toLowerCase();
  if (value.includes("112306") || value.includes("wedding") || value.includes("cuoi") || value.includes("cưới")) return "wedding-invite";
  if (value.includes("112308") || value.includes("smartwatch") || value.includes("dong ho") || value.includes("đồng hồ")) return "smartwatch-performance";
  if (value.includes("my pham") || value.includes("mỹ phẩm") || value.includes("spa") || value.includes("skin") || value.includes("cosmetic")) return "beauty-shop";
  if (value.includes("tra") || value.includes("trà") || value.includes("tea") || value.includes("thao moc") || value.includes("thảo mộc")) return "herb-tea";
  if (value.includes("dao tao") || value.includes("daotao") || value.includes("khoa hoc") || value.includes("khóa học") || value.includes("course")) return "webinar-lead";
  if (value.includes("review") || value.includes("proof") || value.includes("testimonial")) return "testimonial-strip";

  const pagePresets = LANDING_TEMPLATE_PRESETS.filter((preset) => preset.category === "page");
  const seed = [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return pagePresets[seed % pagePresets.length]?.id ?? "product-launch";
}
