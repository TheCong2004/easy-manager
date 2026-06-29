# Next-Gen LadiPage SaaS

Nền tảng xây dựng và quản lý landing page, xây dựng trên **Next.js App Router** và shell **TailAdmin**. Hệ thống gồm dashboard quản trị, Visual Editor kéo-thả, public runtime nhẹ cho SEO, và các module tích hợp (AI SEO, OfferKit, Education).

![Dashboard preview](./banner.png)

---

## Tính năng chính

| Module | Mô tả |
|--------|--------|
| **Landing Page Builder** | Visual Editor (React DnD) — kéo thả section/block, toolbar theo loại đối tượng, inspector, undo/redo, import HTML/ZIP |
| **Public Runtime** | Trang public `/p/[slug]` render `published_html` — không tải code editor |
| **Admin Dashboard** | Quản lý landing pages, templates, analytics (TailAdmin shell) |
| **AI SEO** | Quét, tối ưu và triển khai SEO cho landing page |
| **OfferKit** | Loyalty, voucher, campaign, referral |
| **Education** | Module LMS / EMS (tách route riêng) |

---

## Công nghệ

- **Next.js 16** · **React 19** · **TypeScript**
- **Tailwind CSS v4**
- **Supabase** — Auth, PostgreSQL, Storage
- **Zod** — validate API payload
- **Vitest** — unit test

---

## Kiến trúc Editor ↔ Backend

```
Admin / SDK                    Visual Editor                 Supabase
─────────────                  ─────────────                 ────────
openLandingBuilder()    →      /builder/[pageId]      →      landing_pages
POST /api/builder/session      ?session=...                  ├─ editor_data (JSON draft)
                               VisualEditor                  ├─ published_html
                               ├─ loadLandingPage()          ├─ status / visibility
                               ├─ saveDraft()                └─ slug
                               └─ handlePublish()
                                      │
                    ┌─────────────────┴─────────────────┐
                    │ Có ?session=                      │ Không session
                    ▼                                   ▼
         PATCH /api/builder/pages/[id]        PUT /api/landing-pages + JWT
         (header: x-builder-session)          + localStorage backup
                    │                                   │
                    └─────────────────┬─────────────────┘
                                      ▼
                            editor_data được lưu DB

Publish: render HTML client-side → ghi published_html → /p/[slug] serve HTML tĩnh
```

### Bảng dữ liệu landing page (thực tế trong code)

Bảng **`landing_pages`** (không phải `pages.draft_data` như tài liệu cũ):

| Cột | Vai trò |
|-----|---------|
| `editor_data` | JSON draft của Visual Editor (`sections`, `pageSettings`, `schemaVersion`…) |
| `published_html` | HTML đã render khi publish |
| `status` | `draft` / `published` |
| `visibility` | `private` / `public` |
| `slug` | URL public: `/p/{slug}` |

Đồng bộ phụ: bảng `website_pages` (canonical page registry), `landing_page_versions` (lịch sử phiên bản).

### Ranh giới Editor / Public Runtime

- **Editor** (`/builder/[pageId]`): tải đầy đủ canvas, toolbar, inspector, AI panel — chỉ dùng để soạn và lưu `editor_data`.
- **Public** (`/p/[slug]`): chỉ serve `published_html` khi `status=published` và `visibility=public` — không import dependency editor.

Chi tiết hướng dẫn agent: xem [`Agents.md`](./Agents.md).

---

## Cài đặt

### Yêu cầu

- **Node.js 20+** (tối thiểu 18)
- **pnpm** (khuyến nghị) hoặc npm

### Bước 1 — Clone & cài dependency

```bash
git clone <repo-url>
cd free-nextjs-admin-dashboard
pnpm install
```

### Bước 2 — Biến môi trường

Tạo file `.env.local` ở thư mục gốc:

```env
# Supabase (bắt buộc cho production; thiếu sẽ chạy localStorage-only)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Server-only — KHÔNG expose ra frontend
SUPABASE_SECRET_KEY=<service-role-key>

# Builder session (tùy chọn, khuyến nghị production)
BUILDER_SESSION_SECRET=<random-secret>

# Tùy chọn — module khác
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_OWNCAST_URL=
FLOWISE_API_URL=
GADS_API_URL=
```

> Không commit `.env.local`. `SUPABASE_SECRET_KEY` chỉ dùng trong API routes server-side.

### Bước 3 — Chạy dev

```bash
pnpm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

| Route | Mô tả |
|-------|--------|
| `/landing-pages` | Danh sách landing page (admin) |
| `/builder/[pageId]` | Visual Editor |
| `/landing-pages/editor/[pageId]` | Redirect → `/builder/[pageId]` |
| `/p/[slug]` | Trang public đã publish |
| `/templates/[slug]` | Xem trước template |

---

## Cấu trúc thư mục

```
src/
├── app/
│   ├── (admin)/          # Dashboard TailAdmin (landing-pages, offerkit, ai-seo…)
│   ├── (builder)/        # Shell editor full-screen
│   ├── api/
│   │   ├── builder/      # Session, save draft, publish, upload
│   │   └── landing-pages/# CRUD landing page (JWT)
│   └── p/[slug]/         # Public runtime
├── components/
│   └── landing-pages/
│       └── editor/       # VisualEditor, Canvas, toolbars, blocks
├── features/
│   ├── landing-builder/  # SDK mở builder, builder session
│   ├── landing-pages/    # Import HTML/ZIP
│   ├── landing-templates/
│   ├── ai-seo/
│   └── offerkit/
└── lib/
    └── supabase.ts       # Supabase client (browser)
```

### File quan trọng — luồng lưu/tải

| File | Vai trò |
|------|---------|
| `src/components/landing-pages/editor/VisualEditor.tsx` | Orchestrator: load, save, publish |
| `src/components/landing-pages/editor/core/editor-supabase-storage.ts` | `loadLandingPage`, `saveLandingPage`, `publishLandingPage` |
| `src/features/landing-builder/store/manual-save.ts` | `saveBuilderDraft` → `PATCH /api/builder/pages/[id]` |
| `src/features/landing-builder/sdk/open-builder.ts` | Tạo session & mở editor từ admin |
| `src/app/api/builder/pages/[pageId]/route.ts` | GET/PATCH draft qua builder session |
| `src/app/api/landing-pages/route.ts` | POST/PUT qua JWT user |

---

## API Builder (embed / SDK)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `POST` | `/api/builder/session` | Tạo token, trả `builderUrl` |
| `GET` | `/api/builder/pages/[pageId]` | Đọc draft (cần `x-builder-session`) |
| `PATCH` | `/api/builder/pages/[pageId]` | Lưu `editor_data` (cần `x-builder-session`) |
| `POST` | `/api/builder/publish` | Publish server-side (có sẵn, editor hiện publish qua client Supabase) |
| `POST` | `/api/builder/upload` | Upload asset |
| `POST` | `/api/builder/import-html` | Import HTML |

Mở editor từ code admin:

```ts
import { openLandingBuilder } from "@/features/landing-builder/sdk/open-builder";

await openLandingBuilder({ pageId: "<uuid>", mode: "same-tab" });
// → POST /api/builder/session → /builder/<pageId>?session=<token>
```

---

## Scripts

```bash
pnpm run dev              # Dev server (Turbopack)
pnpm run dev:webpack      # Dev server (Webpack)
pnpm run build            # Production build
pnpm run start            # Chạy build production
pnpm run lint             # ESLint
pnpm test                 # Vitest
npx tsc --noEmit          # Kiểm tra TypeScript

pnpm run seed:templates         # Seed landing page templates
pnpm run seed:builder-elements  # Seed builder element catalog
```

---

## Phát triển

### Quy trình kiểm tra trước khi merge

```powershell
npx tsc --noEmit
pnpm run lint
pnpm run build
```

### Nguyên tắc quan trọng

1. **Không expose** `SUPABASE_SECRET_KEY` hoặc OfferKit private keys ra client.
2. **Validate** mọi API input bằng Zod.
3. **Tách Editor / Runtime** — code trong `/p/[slug]` không được import thư viện editor.
4. **Schema `editor_data`** — thay đổi cấu trúc JSON cần cập nhật `editor-migration.ts` và `schemaVersion`.

### Tài liệu bổ sung

| File | Nội dung |
|------|----------|
| [`Agents.md`](./Agents.md) | Hướng dẫn cho coding agent |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Kiến trúc tổng quan (một phần còn tham chiếu Puck — xem README này là nguồn chính xác cho editor) |
| [`docs/DB_SCHEMA.md`](./docs/DB_SCHEMA.md) | Schema DB (đang cập nhật dần) |
| [`docs/PRODUCT_SPEC.md`](./docs/PRODUCT_SPEC.md) | Product spec |
| [`docs/OFFERKIT_INTEGRATION.md`](./docs/OFFERKIT_INTEGRATION.md) | Tích hợp OfferKit |

---

## Ghi chú về TailAdmin

Dự án fork từ [TailAdmin Next.js Free](https://github.com/TailAdmin/free-nextjs-admin-dashboard) làm shell dashboard. Phần Landing Page Builder, AI SEO, OfferKit và Education là phát triển riêng trên nền đó.

TailAdmin Free được phát hành theo [MIT License](https://opensource.org/licenses/MIT).