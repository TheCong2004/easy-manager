import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Extension-Id"
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json({
    success: true,
    entitlements: {
      agent_bot_enabled: { value: 1 },
      i2p_enabled: { value: 1 },
      prompt_assistant_enabled: { value: 1 },
      premium: { value: 1 }
    }
  }, { headers: corsHeaders });
}
