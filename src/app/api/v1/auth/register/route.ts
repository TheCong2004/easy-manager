import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Extension-Id"
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    const supabaseUrl = process.env.SUPABASE_URL || "https://tkvfniirfbhyluktzixh.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseKey) {
      return NextResponse.json({ error: "Supabase publishable key is missing in environment variables." }, { status: 500, headers: corsHeaders });
    }

    const resp = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        options: {
          data: { name }
        }
      })
    });

    if (!resp.ok) {
      const err = await resp.json();
      return NextResponse.json({ error: err.message || "Registration failed" }, { status: resp.status, headers: corsHeaders });
    }

    const session = await resp.json();
    return NextResponse.json({
      token: session.access_token || "dummy-verification-token",
      user: {
        id: session.user?.id || "unconfirmed-id",
        email: email,
        plan_slug: "autoflow-pro"
      }
    }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
