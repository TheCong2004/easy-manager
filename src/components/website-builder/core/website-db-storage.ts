import { supabase } from "@/lib/supabase";

import {
  WebsiteSection,
  WebsitePage,
  WebsiteSchema,
  WebsiteProject,
  WebsiteJob
} from "@/types/website-builder";

const LOCAL_STORAGE_KEY = "website_builder_projects";

// Mock templates mapping
const DEFAULT_SECTIONS: WebsiteSection[] = [
  {
    id: "header-1",
    type: "header",
    title: "EcoTech Solution",
    items: [
      { title: "Trang chủ", description: "/" },
      { title: "Tính năng", description: "#features" },
      { title: "Đánh giá", description: "#testimonials" },
      { title: "Liên hệ", description: "#contact" }
    ]
  },
  {
    id: "hero-1",
    type: "hero",
    title: "Kiến tạo tương lai xanh cho Doanh nghiệp",
    subtitle: "Giải pháp công nghệ sinh thái thông minh giúp tối ưu hóa chi phí vận hành và nâng cao vị thế thương hiệu của bạn.",
    content: "Khám phá các gói dịch vụ đa dạng từ chúng tôi để bắt đầu chuyển đổi số xanh ngay hôm nay.",
    buttonText: "Bắt đầu ngay",
    buttonLink: "#contact",
    settings: {
      backgroundColor: "#10B981",
      textColor: "#FFFFFF"
    }
  },
  {
    id: "features-1",
    type: "features",
    title: "Tính năng nổi bật",
    subtitle: "Tại sao hàng ngàn doanh nghiệp tin tưởng EcoTech?",
    items: [
      {
        title: "Tối ưu năng lượng",
        description: "Hệ thống tự động điều phối và giảm thiểu hao phí điện năng lên đến 35%.",
        icon: "zap"
      },
      {
        title: "Báo cáo thông minh",
        description: "Dashboard đo lường vết các-bon và đề xuất giải pháp xanh hóa tự động.",
        icon: "activity"
      },
      {
        title: "Tự động hóa hoàn toàn",
        description: "Kết nối dễ dàng với các thiết bị IoT hiện có chỉ trong vài phút thiết lập.",
        icon: "cpu"
      }
    ]
  },
  {
    id: "testimonials-1",
    type: "testimonials",
    title: "Khách hàng nói gì về chúng tôi",
    subtitle: "Chia sẻ thực tế từ các đối tác đã ứng dụng EcoTech thành công.",
    items: [
      {
        author: "Nguyễn Văn A",
        role: "CEO Vinagreen",
        description: "Nhờ EcoTech, chúng tôi đã giảm được 40% lượng rác thải văn phòng và tiết kiệm hàng trăm triệu tiền điện mỗi tháng.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      },
      {
        author: "Trần Thị B",
        role: "Giám đốc Vận hành TechCo",
        description: "Giao diện cấu hình trực quan, đội ngũ hỗ trợ nhiệt tình. Giải pháp tuyệt vời cho xu hướng ESG hiện nay.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
      }
    ]
  },
  {
    id: "contact-1",
    type: "contact",
    title: "Liên hệ tư vấn miễn phí",
    subtitle: "Hãy để lại thông tin, đội ngũ chuyên gia của chúng tôi sẽ liên hệ lại trong vòng 15 phút.",
    buttonText: "Gửi yêu cầu"
  },
  {
    id: "footer-1",
    type: "footer",
    title: "© 2026 EcoTech Solution. Bảo lưu mọi quyền.",
    subtitle: "Điều khoản dịch vụ | Chính sách bảo mật"
  }
];

export const DEFAULT_SCHEMA: WebsiteSchema = {
  pages: [
    {
      id: "home",
      title: "Trang chủ",
      path: "/",
      sections: DEFAULT_SECTIONS
    }
  ],
  primaryColor: "#10B981",
  fontFamily: "Inter",
  seoTitle: "EcoTech Solution - Công nghệ xanh cho tương lai",
  seoDescription: "Giải pháp công nghệ sinh thái thông minh giúp tối ưu hóa chi phí vận hành doanh nghiệp."
};

/** Lấy JWT access token của người dùng hiện tại */
async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? null;
  } catch {
    return null;
  }
}

/** Đọc các project từ LocalStorage */
function getLocalProjects(): WebsiteProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse local website projects:", err);
    return [];
  }
}

/** Lưu các project vào LocalStorage */
function saveLocalProjects(projects: WebsiteProject[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error("Failed to save local website projects:", err);
  }
}

/** Lấy danh sách website projects */
export async function listWebsiteProjects(): Promise<WebsiteProject[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("website_projects")
        .select("*")
        .order("updated_at", { ascending: false });

      if (!error && data) {
        return data as WebsiteProject[];
      }
      console.warn("Supabase fetch websites error, falling back to LocalStorage:", error);
    } catch (err) {
      console.warn("Supabase connection failed, falling back to LocalStorage:", err);
    }
  }

  return getLocalProjects();
}

/** Lấy chi tiết website project theo ID */
export async function getWebsiteProject(id: string): Promise<WebsiteProject | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("website_projects")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        return data as WebsiteProject;
      }
    } catch (err) {
      console.warn("Supabase fetch website detail failed, using LocalStorage:", err);
    }
  }

  const locals = getLocalProjects();
  return locals.find(p => p.id === id) || null;
}

/** Tạo mới website project */
export async function createWebsiteProject(
  projectData: Partial<WebsiteProject>
): Promise<WebsiteProject> {
  const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
  
  const newProject: WebsiteProject = {
    id: newId,
    name: projectData.name || "Website mới",
    description: projectData.description || "",
    type: projectData.type || "seo_landing_page",
    status: projectData.status || "draft",
    source_type: projectData.source_type || "scratch",
    source_value: projectData.source_value || "",
    job_status: projectData.job_status || "completed",
    job_progress: projectData.job_progress ?? 100,
    schema_data: projectData.schema_data || JSON.parse(JSON.stringify(DEFAULT_SCHEMA)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const token = await getAccessToken();
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData?.user) {
        newProject.user_id = userData.user.id;
        const { data, error } = await supabase
          .from("website_projects")
          .insert({
            ...newProject,
            id: undefined // để Supabase sinh UUID hoặc gửi luôn nếu được cấu hình
          })
          .select()
          .single();

        if (!error && data) {
          // Trả về dữ liệu được Supabase tạo ra
          return data as WebsiteProject;
        }
        console.warn("Supabase insert website project error:", error);
      }
    } catch (err) {
      console.warn("Supabase create project failed, fallback to LocalStorage:", err);
    }
  }

  // Fallback LocalStorage
  const locals = getLocalProjects();
  locals.unshift(newProject);
  saveLocalProjects(locals);
  return newProject;
}

/** Cập nhật website project */
export async function updateWebsiteProject(
  id: string,
  projectData: Partial<WebsiteProject>
): Promise<WebsiteProject | null> {
  const updatedData = {
    ...projectData,
    updatedAt: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("website_projects")
        .update(updatedData)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return data as WebsiteProject;
      }
      console.warn("Supabase update website project error:", error);
    } catch (err) {
      console.warn("Supabase update project failed, fallback to LocalStorage:", err);
    }
  }

  // Fallback LocalStorage
  const locals = getLocalProjects();
  const idx = locals.findIndex(p => p.id === id);
  if (idx !== -1) {
    const updatedProject = {
      ...locals[idx],
      ...updatedData,
      schema_data: {
        ...locals[idx].schema_data,
        ...(projectData.schema_data || {})
      }
    } as WebsiteProject;
    locals[idx] = updatedProject;
    saveLocalProjects(locals);
    return updatedProject;
  }
  return null;
}

/** Xóa website project */
export async function deleteWebsiteProject(id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from("website_projects")
        .delete()
        .eq("id", id);

      if (!error) return true;
      console.warn("Supabase delete project error:", error);
    } catch (err) {
      console.warn("Supabase delete failed, fallback to LocalStorage:", err);
    }
  }

  const locals = getLocalProjects();
  const filtered = locals.filter(p => p.id !== id);
  saveLocalProjects(filtered);
  return true;
}

/** Xuất bản Website */
export async function publishWebsite(id: string, slug: string): Promise<WebsiteProject | null> {
  return updateWebsiteProject(id, {
    status: "published",
    slug: slug,
    published_at: new Date().toISOString()
  });
}

/** Hủy xuất bản Website */
export async function unpublishWebsite(id: string): Promise<WebsiteProject | null> {
  return updateWebsiteProject(id, {
    status: "draft",
    slug: undefined,
    published_at: undefined
  });
}



function generateMockSectionsForPage(
  pageName: string,
  metadata: {
    websiteName: string;
    businessName: string;
    industry: string;
    location?: string;
    goal: string;
    style: string;
  }
): WebsiteSection[] {
  const { websiteName, businessName, industry, location, goal, style } = metadata;
  const sections: WebsiteSection[] = [];

  // 1. Header Section
  sections.push({
    id: `${pageName.toLowerCase()}-header`,
    type: "header",
    title: businessName || websiteName,
    items: [
      { title: "Trang chủ", description: "/" },
      { title: "Về chúng tôi", description: "/about" },
      { title: "Dịch vụ", description: "/services" },
      { title: "Liên hệ", description: "/contact" },
      { title: "FAQ", description: "/faq" }
    ]
  });

  // 2. Hero Section
  const primaryBgColor =
    style === "modern"
      ? "#3B82F6"
      : style === "premium"
      ? "#1F2937"
      : style === "bold"
      ? "#EC4899"
      : style === "friendly"
      ? "#10B981"
      : "#F3F4F6";

  const textOnPrimary = style === "minimal" ? "#1F2937" : "#FFFFFF";

  if (pageName === "Home") {
    sections.push({
      id: "home-hero",
      type: "hero",
      title: `Chào mừng bạn đến với ${businessName || websiteName}`,
      subtitle: `Giải pháp đột phá cho doanh nghiệp trong lĩnh vực ${industry}. Chúng tôi giúp bạn đạt được mục tiêu ${goal.replace('_', ' ')}.`,
      content: location ? `Hoạt động chính tại khu vực: ${location}` : "Hỗ trợ khách hàng trên toàn quốc và quốc tế.",
      buttonText: "Khám phá ngay",
      buttonLink: "/services",
      settings: {
        backgroundColor: primaryBgColor,
        textColor: textOnPrimary
      }
    });
  } else if (pageName === "About") {
    sections.push({
      id: "about-hero",
      type: "hero",
      title: `Về chúng tôi - ${businessName || websiteName}`,
      subtitle: `Sứ mệnh của chúng tôi là mang lại giá trị cao nhất trong ngành ${industry}.`,
      content: `Được thành lập với mục tiêu hỗ trợ khách hàng tối ưu hóa quy trình kinh doanh. ${location ? `Trụ sở chính đặt tại ${location}.` : ""}`,
      buttonText: "Liên hệ hợp tác",
      buttonLink: "/contact",
      settings: {
        backgroundColor: "#F3F4F6",
        textColor: "#1F2937"
      }
    });
  } else if (pageName === "Services") {
    sections.push({
      id: "services-hero",
      type: "hero",
      title: `Dịch vụ chuyên nghiệp`,
      subtitle: `Chúng tôi cung cấp các gói giải pháp tối ưu cho mục tiêu ${goal.replace('_', ' ')}.`,
      content: `Dịch vụ chất lượng cao được thiết kế riêng cho thị trường ${industry}.`,
      buttonText: "Xem dịch vụ",
      buttonLink: "#services-list",
      settings: {
        backgroundColor: "#F9FAFB",
        textColor: "#1F2937"
      }
    });
  } else if (pageName === "Contact") {
    sections.push({
      id: "contact-hero",
      type: "hero",
      title: `Liên hệ với ${businessName || websiteName}`,
      subtitle: `Đặt câu hỏi hoặc gửi yêu cầu tư vấn cho chúng tôi. Đội ngũ chuyên gia sẽ hỗ trợ bạn 24/7.`,
      content: location ? `Địa chỉ văn phòng: ${location}` : "Hỗ trợ trực tuyến trên toàn quốc.",
      buttonText: "Gửi tin nhắn",
      buttonLink: "#contact-form",
      settings: {
        backgroundColor: "#1F2937",
        textColor: "#FFFFFF"
      }
    });
  } else if (pageName === "FAQ") {
    sections.push({
      id: "faq-hero",
      type: "hero",
      title: `Câu hỏi thường gặp`,
      subtitle: `Giải đáp các thắc mắc phổ biến nhất của khách hàng về dịch vụ ${industry} của chúng tôi.`,
      content: "Nếu bạn không tìm thấy câu trả lời mong muốn, vui lòng liên hệ trực tiếp.",
      buttonText: "Hỏi chuyên gia",
      buttonLink: "/contact",
      settings: {
        backgroundColor: "#F3F4F6",
        textColor: "#1F2937"
      }
    });
  }

  // 3. Body Section
  if (pageName === "Home") {
    sections.push({
      id: "home-features",
      type: "features",
      title: "Tính năng & Lợi ích vượt trội",
      subtitle: `Giải pháp được tối ưu hóa cho phong cách thiết kế ${style}`,
      items: [
        { title: "Hiệu năng cực đỉnh", description: "Tốc độ tải trang siêu tốc giúp giữ chân khách hàng.", icon: "zap" },
        { title: "Bảo mật tuyệt đối", description: "Dữ liệu khách hàng được mã hóa an toàn trên cloud.", icon: "shield" },
        { title: "Hỗ trợ tận tâm", description: "Đội ngũ chuyên gia luôn sẵn sàng giải đáp thắc mắc 24/7.", icon: "phone" }
      ]
    });
    sections.push({
      id: "home-testimonials",
      type: "testimonials",
      title: "Đánh giá từ khách hàng",
      subtitle: "Khách hàng nói gì sau khi sử dụng giải pháp của chúng tôi",
      items: [
        { author: "Trần Minh Hoàng", role: "Manager tại TechGreen", description: "Giải pháp vô cùng hiệu quả, giúp chúng tôi tăng trưởng 40% doanh thu trong quý đầu tiên.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
        { author: "Lê Thị Lan Anh", role: "Founder Spa & Cosmetic", description: "Giao diện tinh tế, thân thiện, khách hàng phản hồi rất tốt. Cảm ơn sự hỗ trợ nhiệt tình của đội ngũ.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" }
      ]
    });
  } else if (pageName === "About") {
    sections.push({
      id: "about-values",
      type: "features",
      title: "Giá trị cốt lõi của chúng tôi",
      subtitle: "Những nguyên tắc dẫn đường cho mọi hoạt động",
      items: [
        { title: "Khách hàng là trọng tâm", description: "Mọi giải pháp đều xuất phát từ nhu cầu thực tế của khách hàng." },
        { title: "Không ngừng đổi mới", description: "Luôn cập nhật và ứng dụng các công nghệ tiên phong." },
        { title: "Chính trực & Minh bạch", description: "Xây dựng niềm tin vững chắc qua sự rõ ràng và trung thực." }
      ]
    });
  } else if (pageName === "Services") {
    sections.push({
      id: "services-list",
      type: "features",
      title: "Danh mục giải pháp chi tiết",
      subtitle: "Đáp ứng đầy đủ mọi nhu cầu vận hành doanh nghiệp của bạn",
      items: [
        { title: "Tư vấn chiến lược", description: "Giúp doanh nghiệp định hình lộ trình phát triển tối ưu." },
        { title: "Triển khai hệ thống", description: "Cài đặt và cấu hình phần mềm đồng bộ, nhanh chóng." },
        { title: "Đào tạo & Chuyển giao", description: "Hướng dẫn chi tiết để nhân sự làm chủ công nghệ hiệu quả." }
      ]
    });
  } else if (pageName === "Contact") {
    sections.push({
      id: "contact-form-section",
      type: "contact",
      title: "Gửi lời nhắn cho chúng tôi",
      subtitle: "Vui lòng điền vào form bên dưới, chúng tôi sẽ phản hồi sớm nhất có thể.",
      buttonText: "Gửi thông tin liên hệ"
    });
  } else if (pageName === "FAQ") {
    sections.push({
      id: "faq-list",
      type: "features",
      title: "Các câu hỏi thường gặp",
      subtitle: "Tìm câu trả lời nhanh chóng cho các thắc mắc của bạn",
      items: [
        { title: "Làm thế nào để bắt đầu?", description: "Bạn chỉ cần chọn dịch vụ mong muốn và gửi thông tin liên hệ, chúng tôi sẽ hỗ trợ các bước tiếp theo." },
        { title: "Chi phí dịch vụ được tính thế nào?", description: "Chi phí được tối ưu dựa trên nhu cầu thực tế và quy mô doanh nghiệp của bạn." },
        { title: "Có chính sách hoàn tiền không?", description: "Chúng tôi cam kết chất lượng dịch vụ và có chính sách hỗ trợ hoàn trả nếu dịch vụ không đúng cam kết." }
      ]
    });
  }

  // 4. Footer Section
  sections.push({
    id: `${pageName.toLowerCase()}-footer`,
    type: "footer",
    title: `© 2026 ${businessName || websiteName}. Thiết kế bởi AI Builder.`,
    subtitle: "Điều khoản dịch vụ | Chính sách bảo mật"
  });

  return sections;
}

/** Giả lập chạy ngầm (simulation) cho các Job (AI, Clone, ZIP Import) */
export function triggerJobSimulation(
  id: string,
  sourceType: 'ai_prompt' | 'clone_url' | 'import_zip',
  sourceValue: string,
  onProgress?: (progress: number, status: string) => void,
  metadata?: {
    websiteName: string;
    businessName: string;
    industry: string;
    location?: string;
    goal: string;
    style: string;
    pages: string[];
  }
) {
  let progress = 0;
  let statusText = "Khởi động tác vụ...";
  
  const getStatusText = (prog: number) => {
    if (sourceType === 'ai_prompt') {
      if (prog < 20) return "Đang phân tích ý tưởng website và ngành nghề...";
      if (prog < 40) return "Đang khởi tạo các trang và cấu trúc schema...";
      if (prog < 60) return "Đang viết nội dung mô tả sản phẩm/dịch vụ...";
      if (prog < 80) return "Đang cấu hình kiểu dáng, font chữ và màu chủ đạo...";
      return "Đang tối ưu giao diện trên thiết bị di động...";
    } else if (sourceType === 'clone_url') {
      if (prog < 25) return `Đang kết nối tới ${sourceValue}...`;
      if (prog < 55) return "Đang phân tích cấu trúc DOM và tài nguyên...";
      if (prog < 85) return "Đang chuyển đổi cấu trúc sang JSON Schema...";
      return "Đang tối ưu hóa hình ảnh và asset...";
    } else {
      if (prog < 25) return "Đang giải nén file lưu trữ...";
      if (prog < 55) return "Đang quét các file HTML và CSS...";
      if (prog < 85) return "Đang biên dịch thành các sections tương thích...";
      return "Đang định hình giao diện trên canvas...";
    }
  };

  const interval = setInterval(async () => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      const currentProject = await getWebsiteProject(id);
      let customizedSchema: WebsiteSchema;

      if (sourceType === 'ai_prompt' && metadata) {
        const pagesData: WebsitePage[] = metadata.pages.map(pageName => ({
          id: pageName.toLowerCase(),
          title: pageName,
          slug: pageName === "Home" ? "" : pageName.toLowerCase(),
          path: pageName === "Home" ? "/" : `/${pageName.toLowerCase()}`,
          sections: generateMockSectionsForPage(pageName, metadata)
        }));

        customizedSchema = {
          pages: pagesData,
          primaryColor:
            metadata.style === "modern"
              ? "#3B82F6"
              : metadata.style === "premium"
              ? "#1F2937"
              : metadata.style === "bold"
              ? "#EC4899"
              : metadata.style === "friendly"
              ? "#10B981"
              : "#10B981",
          fontFamily: "Inter",
          seoTitle: `${metadata.websiteName} - ${metadata.industry}`,
          seoDescription: `Website giới thiệu về ${metadata.businessName} trong lĩnh vực ${metadata.industry}.`
        };
      } else {
        // Fallback or clone/import default schema customization
        customizedSchema = currentProject?.schema_data || JSON.parse(JSON.stringify(DEFAULT_SCHEMA));
        if (sourceType === 'ai_prompt') {
          customizedSchema.seoTitle = `${sourceValue.substring(0, 40)}...`;
          customizedSchema.pages[0].sections[1].title = `Giải pháp thông minh cho ${sourceValue.split(' ').slice(0, 3).join(' ')}`;
          customizedSchema.primaryColor = "#3B82F6";
        } else if (sourceType === 'clone_url') {
          const domain = sourceValue.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
          customizedSchema.seoTitle = `Bản sao của ${domain}`;
          customizedSchema.pages[0].sections[0].title = `Chào mừng tới ${domain}`;
          customizedSchema.primaryColor = "#8B5CF6";
        } else {
          customizedSchema.seoTitle = "Website đã nhập từ ZIP";
          customizedSchema.primaryColor = "#F59E0B";
        }
      }

      await updateWebsiteProject(id, {
        job_status: "completed",
        job_progress: 100,
        status: "ready", // Đánh dấu là đã tạo xong
        schema_data: customizedSchema
      });
      
      if (onProgress) onProgress(100, "Hoàn thành!");
    } else {
      statusText = getStatusText(progress);
      await updateWebsiteProject(id, {
        job_status: "processing",
        job_progress: progress,
        job_error: statusText
      });
      
      if (onProgress) onProgress(progress, statusText);
    }
  }, 1200);
}

export type {
  WebsiteSection,
  WebsitePage,
  WebsiteSchema,
  WebsiteProject,
  WebsiteJob
};
