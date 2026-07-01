import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Extension-Id"
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401, headers: corsHeaders });
    }

    const token = authHeader.substring(7);
    const supabaseUrl = process.env.SUPABASE_URL || "https://tkvfniirfbhyluktzixh.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseKey) {
      return NextResponse.json({ error: "Supabase publishable key is missing in environment variables." }, { status: 500, headers: corsHeaders });
    }

    const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${token}`
      }
    });

    if (!resp.ok) {
      const err = await resp.json();
      return NextResponse.json({ error: err.message || "Failed to fetch user session" }, { status: resp.status, headers: corsHeaders });
    }

    const user = await resp.json();
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        plan_slug: "autoflow-pro"
      }
    }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
