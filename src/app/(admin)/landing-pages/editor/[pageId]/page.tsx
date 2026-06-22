import { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { LandingEditorPageClient } from "@/components/landing-pages/editor/LandingEditorPageClient";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidPageId(pageId: unknown): pageId is string {
  return typeof pageId === "string" && UUID_PATTERN.test(pageId);
}

function resolveSupabaseUrl() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!url || url.startsWith("http")) return url;
  if (!url.startsWith("eyJ")) return url;
  try {
    const [, payload] = url.split(".");
    if (!payload) return url;
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { ref?: string };
    return decoded.ref ? `https://${decoded.ref}.supabase.co` : url;
  } catch {
    return url;
  }
}

/**
 * Tạo Supabase client với cookie session để kiểm tra auth server-side.
 * Trả về null nếu cấu hình thiếu.
 */
async function createServerSupabaseClient() {
  const url = resolveSupabaseUrl();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !url.startsWith("http") || !anonKey) return null;

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        Cookie: allCookies.map((c) => `${c.name}=${c.value}`).join("; "),
      },
    },
  });
}

interface Props {
  params: Promise<{ pageId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pageId } = await params;
  return {
    title: isValidPageId(pageId) ? `Editor | ${pageId}` : "Editor",
  };
}

export default async function LandingEditorPage({ params }: Props) {
  const { pageId } = await params;

  // 1. Validate pageId format
  if (!isValidPageId(pageId)) {
    redirect("/landing-pages");
  }

  // 2. Kiểm tra auth server-side
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Nếu chưa đăng nhập → redirect signin
    if (authError || !user) {
      redirect(`/signin?redirect=/landing-pages/editor/${pageId}`);
    }

    // 3. Kiểm tra ownership của page
    const { data: page, error: pageError } = await supabase
      .from("landing_pages")
      .select("id, user_id")
      .eq("id", pageId)
      .maybeSingle();

    // Nếu có lỗi DB → redirect về danh sách
    if (pageError) {
      redirect("/landing-pages");
    }

    // Nếu page tồn tại nhưng không phải của user → 403
    if (page && page.user_id && page.user_id !== user.id) {
      // Render trang lỗi 403
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
            <p className="text-gray-500 text-sm mb-6">
              Trang này thuộc về tài khoản khác. Bạn không thể chỉnh sửa trang của người khác.
            </p>
            <a
              href="/landing-pages"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition"
            >
              ← Quay lại danh sách trang
            </a>
          </div>
        </div>
      );
    }

    // Nếu page không tồn tại trong DB → redirect (page không tồn tại)
    if (!page && pageError === null) {
      // Page chưa được lưu vào DB (chỉ có local) → cho phép editor chạy
      // (trường hợp tạo page mới lần đầu)
    }
  }

  return <LandingEditorPageClient pageId={pageId} />;
}
