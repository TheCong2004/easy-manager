import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

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

function getPublicSupabaseClient() {
  const url = resolveSupabaseUrl();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !url.startsWith("http") || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

interface Props {
  params: Promise<{ slug: string }>;
}

interface PublishedPage {
  id: string;
  name: string;
  slug: string;
  status: string;
  visibility: string;
  published_html: string | null;
  published_at: string | null;
}

async function getPublishedPage(slug: string): Promise<PublishedPage | null> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return null;

  // Chỉ lấy page đã published + visibility public
  // KHÔNG lấy editor_data để bảo mật dữ liệu nguồn
  const { data, error } = await supabase
    .from("landing_pages")
    .select("id, name, slug, status, visibility, published_html, published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("visibility", "public")
    .maybeSingle();

  if (error || !data) return null;
  return data as PublishedPage;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);

  if (!page) {
    return {
      title: "Trang không tồn tại",
      description: "Trang này không tìm thấy hoặc chưa được xuất bản.",
    };
  }

  return {
    title: page.name,
    description: `Xem trang ${page.name}`,
    openGraph: {
      title: page.name,
      type: "website",
    },
  };
}

export default async function PublicLandingPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);

  // Nếu không tìm thấy hoặc chưa published → 404
  if (!page || !page.published_html) {
    notFound();
  }

  // Render HTML của trang đã xuất bản dưới dạng raw HTML
  // Inject thẳng vào body, không có admin sidebar/header
  return (
    <div
      dangerouslySetInnerHTML={{ __html: page.published_html }}
      style={{ all: "initial", display: "block" } as React.CSSProperties}
    />
  );
}
