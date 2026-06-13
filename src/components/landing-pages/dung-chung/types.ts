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

export type FormConfigItem = {
  id: string;
  name: string;
  linkedAccounts: number;
  type: "Google Forms" | "API" | "OTP";
  status: "ACTIVE" | "INACTIVE";
  updatedAt: string;
};

export type TagItem = {
  id: string;
  name: string;
  count: number;
  createdAt: string;
  status: "LOCKED" | "UNLOCKED";
  updatedAt: string;
};

