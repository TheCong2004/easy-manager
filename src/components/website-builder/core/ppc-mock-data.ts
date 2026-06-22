export interface MockCampaign {
  id: string;
  name: string;
  keyword: string;
  goal: string;
  offer: string;
  cta: string;
}

export interface MockAccount {
  id: string;
  name: string;
  campaigns: MockCampaign[];
}

export interface MockPlatform {
  id: string;
  name: string;
  accounts: MockAccount[];
}

export const PPC_MOCK_DATA: Record<string, MockPlatform> = {
  google_ads: {
    id: "google_ads",
    name: "Google Ads",
    accounts: [
      {
        id: "g-act-1",
        name: "VinaGreen Corp (482-192-3847)",
        campaigns: [
          { id: "g-camp-1", name: "Sale Hè 2026 - Mua 1 Tặng 1", keyword: "máy lọc nước ion kiềm", goal: "sell_product", offer: "Giảm 15% kèm lõi lọc thay thế miễn phí", cta: "Mua ngay nhận ưu đãi" },
          { id: "g-camp-2", name: "Dịch vụ Bất động sản nghỉ dưỡng", keyword: "biệt thự biển phú quốc", goal: "generate_leads", offer: "Nhận thông tin bảng giá và chiết khấu 5%", cta: "Đăng ký tư vấn miễn phí" }
        ]
      },
      {
        id: "g-act-2",
        name: "EcoBeauty Spa (928-384-2938)",
        campaigns: [
          { id: "g-camp-3", name: "Gói trị liệu da cao cấp", keyword: "spa tri mun lung ha noi", goal: "booking", offer: "Tặng suất xông hơi đá muối trị giá 300k", cta: "Đặt lịch hẹn ngay" }
        ]
      }
    ]
  },
  facebook_ads: {
    id: "facebook_ads",
    name: "Facebook Ads",
    accounts: [
      {
        id: "fb-act-1",
        name: "Học viện Ngoại ngữ EduMax (BM)",
        campaigns: [
          { id: "fb-camp-1", name: "Khóa học IELTS cam kết đầu ra", keyword: "hoc ielts cap toc ha noi", goal: "generate_leads", offer: "Kiểm tra trình độ miễn phí và tặng học bổng 2 triệu", cta: "Đăng ký nhận học bổng" }
        ]
      }
    ]
  },
  tiktok_ads: {
    id: "tiktok_ads",
    name: "TikTok Ads",
    accounts: [
      {
        id: "tt-act-1",
        name: "Thời trang trẻ em KidStyle",
        campaigns: [
          { id: "tt-camp-1", name: "Bộ sưu tập thu đông mới", keyword: "quan ao tre em han quoc", goal: "sell_product", offer: "Miễn phí vận chuyển cho đơn hàng từ 350k", cta: "Mua ngay trên Shop" }
        ]
      }
    ]
  }
};
