export interface WebsiteSection {
  id: string;
  pageId?: string;
  type: string;
  orderIndex?: number;
  props?: Record<string, unknown>;
  
  // Trường mở rộng tương thích với trình render hiện tại
  title?: string;
  subtitle?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
  items?: Array<{
    title?: string;
    description?: string;
    icon?: string;
    author?: string;
    role?: string;
    avatar?: string;
  }>;
  settings?: {
    backgroundColor?: string;
    textColor?: string;
  };
}

export interface WebsitePage {
  id: string;
  projectId?: string;
  slug?: string;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: "draft" | "published";
  path?: string; // Tương thích với routing
  sections: WebsiteSection[]; // Bắt buộc để tránh lỗi undefined trên Canvas
}

export interface WebsiteSchema {
  projectId?: string;
  pages: WebsitePage[];
  sections?: WebsiteSection[];
  
  // Tùy chọn giao diện mở rộng
  primaryColor?: string;
  fontFamily?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface WebsiteProject {
  id: string;
  organizationId?: string;
  user_id?: string; // Tương thích với Supabase owner check
  name: string;
  description?: string; // Tương thích với database
  domain?: string;
  type: "ai_generated" | "clone" | "import" | "seo_landing_page" | "ppc_landing_page";
  status: "draft" | "generating" | "ready" | "editing" | "published" | "failed" | "archived";
  thumbnailUrl?: string;
  previewUrl?: string;
  builderUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Tương thích với database migration & storage
  slug?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  job_status?: "pending" | "processing" | "completed" | "failed";
  job_progress?: number;
  job_error?: string;
  schema_data?: WebsiteSchema;
  source_type?: "scratch" | "ai_prompt" | "clone_url" | "import_zip";
  source_value?: string;
}

export interface WebsiteJob {
  id: string;
  projectId: string;
  type: "generate" | "clone" | "import" | "publish";
  status: "queued" | "processing" | "success" | "failed";
  progress?: number;
  error?: string;
}

export interface CreateAiWebsitePayload {
  prompt: string;
  type: "seo_landing_page" | "ppc_landing_page";
  websiteName: string;
  businessName: string;
  industry: string;
  location?: string;
  goal: "generate_leads" | "sell_product" | "booking" | "showcase" | "local_business" | string;
  targetAudience?: string;
  style: "modern" | "premium" | "minimal" | "bold" | "friendly" | string;
  pages: string[];
}

export interface CreateCloneWebsitePayload {
  projectName: string;
  sourceUrl: string;
  cloneMode: "visual_clone" | "seo_landing_page";
  targetKeyword?: string;
  location?: string;
  type: "seo_landing_page" | "ppc_landing_page";
}

export interface CreateImportWebsitePayload {
  projectName: string;
  file?: File;
  fileName: string;
  note?: string;
  type: "seo_landing_page" | "ppc_landing_page";
}

export interface CreatePpcLandingPagePayload {
  projectName: string;
  campaignSource: "google_ads" | "facebook_ads" | "tiktok_ads" | "manual" | string;
  platformId?: string;
  accountId?: string;
  campaignId?: string;
  targetKeyword?: string;
  landingPageGoal?: string;
  offer?: string;
  cta?: string;
  type: "ppc_landing_page";
}




