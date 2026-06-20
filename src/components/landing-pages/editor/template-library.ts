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

export const LANDING_TEMPLATE_PRESETS: LandingTemplatePreset[] = [
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
];

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
