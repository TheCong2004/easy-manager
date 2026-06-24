import type { AppItem } from "../types";

export const initialApps: AppItem[] = [
  {
    id: "1",
    name: "Website Builder",
    description: "Giúp người dùng dễ dàng tạo ra trang web chuyên nghiệp và hiệu quả cho doanh nghiệp.",
    iconName: "website",
    status: "INSTALLED",
    category: "sales",
    price: "Đã cài đặt",
    downloads: "10.847",
    isPinned: true,
  },
  {
    id: "2",
    name: "Ecom Store",
    description: "Tạo nhanh trang thanh toán và bán hàng trực tuyến cho sản phẩm, dịch vụ, khoá học.",
    iconName: "store",
    status: "INSTALLED",
    category: "sales",
    price: "Đã cài đặt",
    downloads: "6.873",
    isPinned: true,
  },
  {
    id: "5",
    name: "Dynamic",
    description: "Các chiến dịch để nhắm đến từng phân khúc khách hàng phù hợp cho mục đích của bạn.",
    iconName: "dynamic",
    status: "INSTALLED",
    category: "marketing",
    price: "Đã cài đặt",
    downloads: "2.295",
    isPinned: true,
  },
  {
    id: "6",
    name: "E-Learning",
    description: "Số hoá kiến thức thành khoá học online — đào tạo nội bộ hoặc bán khoá học kiếm tiền.",
    iconName: "elearning",
    status: "INSTALLED",
    category: "sales",
    price: "Đã cài đặt",
    downloads: "4.218",
    isPinned: true,
  },
  {
    id: "10",
    name: "Facebook Ads",
    description: "Công cụ quản lý chiến dịch quảng cáo Facebook, tối ưu hóa ngân sách và đo lường báo cáo hiệu quả thời gian thực.",
    iconName: "fbads",
    status: "INSTALLED",
    category: "marketing",
    price: "Đã cài đặt",
    downloads: "1.520",
    isPinned: true,
  },
  {
    id: "14",
    name: "CloudPhone",
    description: "Cửa hàng thuê cloud phone, quản lý thiết bị và điều khiển đồng bộ nhiều máy theo nhóm cho automation.",
    iconName: "cloudphone",
    status: "INSTALLED",
    category: "marketing",
    price: "Đã cài đặt",
    downloads: "2.048",
    isPinned: true,
  },
  {
    id: "15",
    name: "OfferKit",
    description: "Ứng dụng quản lý ưu đãi, mã giảm giá, voucher, referral và loyalty cho chiến dịch Marketing và E-Learning.",
    iconName: "offerkit",
    status: "INSTALLED",
    category: "marketing",
    price: "Đã cài đặt",
    downloads: "1.786",
    isPinned: true,
  },
  {
    id: "22",
    name: "Reports",
    description: "Trình tạo báo cáo SEO tùy chỉnh, tích hợp số liệu Google Search Console và tự động gửi PDF định kỳ.",
    iconName: "reports",
    status: "INSTALLED",
    category: "marketing",
    price: "Đã cài đặt",
    downloads: "1.740",
    isPinned: true,
  }
];

export const appDetailContent: Record<string, {
  provider: string;
  price: string;
  features: string[];
  benefits: { title: string; items: string[] }[];
  integrations: string[];
}> = {
  "1": {
    provider: "LadiPage",
    price: "Miễn phí",
    features: ["Thiết kế kéo thả", "Kho giao diện có sẵn", "Tối ưu mobile", "Xuất bản tên miền riêng", "Form thu lead", "Theo dõi chuyển đổi"],
    benefits: [
      { title: "Tạo website nhanh", items: ["Không cần lập trình", "Phù hợp landing page, website giới thiệu và bán hàng"] },
      { title: "Tối ưu chuyển đổi", items: ["Kết nối form, pixel và công cụ đo lường", "Dễ thử nghiệm nhiều phiên bản nội dung"] },
      { title: "Quản lý tập trung", items: ["Theo dõi trang, tên miền và biểu mẫu trong một nơi", "Dễ bàn giao cho đội vận hành"] },
      { title: "Mở rộng linh hoạt", items: ["Kết nối bán hàng, automation và quảng cáo", "Phù hợp nhiều chiến dịch marketing"] },
    ],
    integrations: ["LadiSales", "Facebook Pixel", "Google Analytics", "Automation"],
  },
  "2": {
    provider: "LadiPage",
    price: "Từ 600.000 đ/năm",
    features: ["Quản lý đơn hàng", "Tích hợp cổng thanh toán", "Quản lý khách hàng", "Báo cáo doanh thu", "Cửa hàng & trang thanh toán", "Tự động xác thực đơn hàng", "Tùy chỉnh khuyến mại", "Kết nối đơn vị vận chuyển"],
    benefits: [
      { title: "Chuyển đổi số đơn giản", items: ["Tạo trang thanh toán cho bất kỳ sản phẩm, dịch vụ nào", "Mua bán online đơn giản cho cả doanh nghiệp và khách hàng"] },
      { title: "Thiết kế trang thanh toán linh hoạt", items: ["Không cần lập trình, tạo trang trong tích tắc", "Tích hợp lên website, landing page chỉ với 1 click"] },
      { title: "Đa dạng thanh toán & vận chuyển", items: ["Nhiều phương thức thanh toán phổ biến", "Kết nối đơn vị vận chuyển uy tín, tính phí tự động", "Mã ưu đãi từ đối tác thanh toán, vận chuyển"] },
      { title: "Phu hợp mọi lĩnh vực kinh doanh", items: ["Hàng hoá, dịch vụ và cả sản phẩm số", "Trỏ tên miền riêng, miễn phí hosting"] },
    ],
    integrations: ["LadiSales", "VNPAY", "Giao Hàng Nhanh", "Facebook Pixel"],
  },
  "5": {
    provider: "LadiPage",
    price: "Miễn phí",
    features: ["Phân nhóm khách hàng", "Nội dung động", "Kịch bản cá nhân hóa", "Theo dõi hành vi", "Gắn điều kiện hiển thị", "Tối ưu chiến dịch"],
    benefits: [
      { title: "Cá nhân hóa trải nghiệm", items: ["Hiển thị nội dung theo từng nhóm khách", "Tăng mức độ phù hợp của thông điệp"] },
      { title: "Tối ưu quảng cáo", items: ["Đồng bộ dữ liệu với chiến dịch marketing", "Dễ kiểm thử nhiều nhóm mục tiêu"] },
      { title: "Tăng chuyển đổi", items: ["Điều chỉnh ưu đãi theo hành vi", "Giảm nội dung thừa với từng khách"] },
      { title: "Phù hợp automation", items: ["Kết hợp form, tag và luồng chăm sóc", "Tự động hóa các bước phân loại"] },
    ],
    integrations: ["Automation", "Facebook Ads", "Website Builder", "LadiSales"],
  },
  "6": {
    provider: "LadiPage",
    price: "Miễn phí",
    features: ["Đào tạo trực tuyến", "Tạo bài giảng video", "Thiết kế trắc nghiệm", "Cấp chứng chỉ hoàn thành", "Bán khóa học", "Báo cáo tiến trình học viên"],
    benefits: [
      { title: "Số hóa tri thức dễ dàng", items: ["Giao diện kéo thả dễ dùng, không cần code", "Đưa bài giảng lên cloud nhanh chóng"] }
    ],
    integrations: ["LadiSales", "OfferKit", "Automation"],
  },
  "10": {
    provider: "LadiPage",
    price: "Đã cài đặt",
    features: ["Đồng bộ tài khoản QC", "Quản lý chiến dịch", "Tối ưu ngân sách tự động", "Báo cáo real-time"],
    benefits: [
      { title: "Tối ưu hóa chi phí quảng cáo", items: ["Phát hiện nhanh nhóm quảng cáo kém hiệu quả", "Tự động phân bổ ngân sách sang nhóm tốt"] }
    ],
    integrations: ["Facebook API", "Website Builder"],
  },
  "14": {
    provider: "LadiPage",
    price: "Đã cài đặt",
    features: ["Thuê thiết bị Cloud Phone", "Đồng bộ điều khiển nhóm", "Quản lý kịch bản tự động", "Remote màn hình"],
    benefits: [
      { title: "Tự động hóa quy trình nuôi account", items: ["Đồng bộ hành vi trên hàng trăm thiết bị ảo", "Quản lý kịch bản kéo thả thuận tiện"] }
    ],
    integrations: ["LadiPage System", "Automation Builder"],
  },
  "15": {
    provider: "LadiPage",
    price: "Da cai dat",
    features: ["Quan ly chien dich uu dai", "Phat hanh voucher va ma giam gia", "Referral va loyalty", "API key cho tich hop", "Bao cao hieu qua", "Tu dong hoa quy tac ap dung"],
    benefits: [
      { title: "Tang chuyen doi chien dich", items: ["Tao uu dai rieng cho tung nhom khach hang", "Dong bo voi Facebook Ads va landing page"] },
      { title: "Phu hop E-Learning", items: ["Cap ma truy cap khoa hoc", "Gan thuong cho hoc vien hoan thanh moc hoc tap"] },
      { title: "Van hanh nhu app con", items: ["Mo truc tiep tu kho dung", "Chay rieng trong OfferKit dashboard"] },
      { title: "Mo rong tich hop", items: ["Ket noi CRM, LMS, automation va webhook", "Quan ly API key cho doi ky thuat"] },
    ],
    integrations: ["Facebook Ads", "E-Learning", "Automation", "CRM"],
  },
  "22": {
    provider: "SearchAtlas",
    price: "Miễn phí",
    features: ["Tạo báo cáo SEO tùy biến", "Kết nối Google Search Console", "Tự động xuất PDF", "Gửi email định kỳ theo lịch"],
    benefits: [
      { title: "Báo cáo chuyên nghiệp", items: ["Tạo mẫu báo cáo thương hiệu riêng trong 1 phút", "Tự động gửi cập nhật định kỳ cho khách hàng/quản lý"] }
    ],
    integrations: ["Google Search Console", "Google Analytics", "Email Server"]
  }
};
