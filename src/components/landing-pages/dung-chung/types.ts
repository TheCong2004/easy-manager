export type LandingPageItem = {
  id: string;
  name: string;
  status: "PUBLISHED" | "UNPUBLISHED";
  updatedAt: string;
  views: number;
  conversions: number;
  revenue: number;
};

export type TemplateItem = {
  id: string;
  name: string;
  image: string;
  category: "all" | "ecommerce" | "service" | "others";
  isPro: boolean;
  views: number;
  likes: number;
  scrollDist: string;
};
