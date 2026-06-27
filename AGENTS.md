# Hướng dẫn dành cho Coding Agent (AGENTS.md)

Chào mừng bạn đến với repo của hệ thống Next-Gen LadiPage SaaS. Đây là tài liệu hướng dẫn về nguyên tắc lập trình, phong cách viết code, kiến trúc hệ thống và quy trình phát triển cho các tác vụ lập trình tự động.

---

## 1. Nguyên tắc lập trình cốt lõi

- **Không copy-paste code cũ**: Không sao chép trực tiếp code của LadiPage, LadiChat, hoặc FunnelX cũ. Chỉ sử dụng logic hoặc mô tả tính năng cũ làm tài liệu tham khảo thiết kế hệ thống mới.
- **Phân tách Editor và Public Runtime**:
  - Trình soạn thảo (Puck Editor / Visual Editor) chỉ dùng để cấu hình kéo thả và lưu dữ liệu.
  - Runtime SDK chạy ở các trang public `/p/[slug]` phải nhẹ, tối ưu SEO, không tải các thư viện cồng kềnh của Editor.
- **Bảo mật và Phân quyền**:
  - Tất cả các API backend phải validate dữ liệu đầu vào bằng `zod` hoặc thư viện tương đương.
  - Tuyệt đối không expose Supabase `service_role` key hoặc OfferKit API private keys ra phía frontend.
- **Kiểu dữ liệu (Type Safety)**: Viết code TypeScript nghiêm ngặt, luôn kiểm tra kiểu và định nghĩa giao diện rõ ràng.

---

## 2. Công nghệ chủ đạo

1. **Dashboard & Giao diện quản lý**: Next.js App Router kết hợp TailAdmin.
2. **Trình soạn thảo Landing Page**: Puck Editor (hoặc React-DnD Custom Editor hiện tại).
3. **Database & Backend Services**: Supabase (Database, Auth, Storage).
4. **Hệ thống ưu đãi/ Loyalty**: OfferKit.
5. **Runtime Client SDK**: Lightweight Vanilla JavaScript hoặc React components tối giản cho tracking, form, popup, chat.

---

## 3. Các lệnh Build & Test nhanh

Chạy kiểm tra tĩnh trước khi hoàn thành tác vụ:
```powershell
# Kiểm tra lỗi biên dịch TypeScript
npx tsc --noEmit

# Chạy dev server cục bộ
pnpm run dev

# Định dạng code
npm run lint
```

---

## 4. Quy trình làm việc đề xuất cho Agent

Khi nhận được một yêu cầu phát triển lớn, hãy thực hiện theo quy trình sau:
1. Đọc kỹ các tài liệu thiết kế trong thư mục `docs/`.
2. Tạo hoặc sửa đổi các component nhỏ, cô lập. Không gen cả hệ thống một lần.
3. Chạy `npx tsc --noEmit` để đảm bảo code biên dịch thành công.
4. Ghi nhận nhật ký thay đổi trong `walkthrough.md`.
5. Tạo commit chi tiết bằng tiếng Việt và push lên git.

---

## 5. ECC + Codex workflow

- Khi làm frontend Next.js, ưu tiên các skill repo-local: `$frontend-patterns`, `$react-patterns`, `$react-testing`, `$nextjs-turbopack`.
- Khi sửa logic quan trọng, dùng `$tdd-workflow` trước khi implement và `$verification-loop` trước khi kết thúc.
- Khi review bảo mật hoặc API/backend, dùng `$security-review`; validate dữ liệu đầu vào bằng `zod` và không expose secret ra frontend.
- Với Landing Page Editor, luôn giữ ranh giới Editor và Public Runtime: code public `/p/[slug]` không được import dependency nặng hoặc editor-only.
- Với task lớn, dùng multi-agent Codex: `explorer` để đọc code trước, `docs_researcher` để kiểm chứng tài liệu khi cần, và `reviewer` để kiểm tra sau khi implement.
- MCP project-local trong `.codex/config.toml` gồm `context7` cho tài liệu framework và `playwright` cho kiểm thử UI/browser.
- **Quy tắc Git/Branch**: TUYỆT ĐỐI KHÔNG tạo thêm bất kỳ nhánh (branch) mới nào cho các tác vụ tiếp theo. Mọi commit và chỉnh sửa phải được thực hiện trực tiếp trên nhánh `main` và push lên remote main.

