export interface AppItem {
  id: string;
  name: string;
  description: string;
  iconName: "website" | "store" | "link" | "blog" | "dynamic" | "elearning" | "affiliate" | "popup" | "access" | "fbads" | "cloudphone" | "offerkit" | "home" | "seo" | "metrics" | "local" | "content" | "keywords" | "reports" | "authority";
  status: "INSTALLED" | "NOT_INSTALLED";
  category: "marketing" | "sales" | "conversion" | "content" | "upcoming";
  downloads?: string;
  price: string; // e.g. "Đã cài đặt", "Miễn phí", "Từ 2.400.000đ/năm"
  isPinned?: boolean;
  tags?: string[];
}
