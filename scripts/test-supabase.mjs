import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load env.local
const envContent = fs.readFileSync(".env.local", "utf8");
const envVars = Object.fromEntries(
  envContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const jwtKey = envVars.SUPABASE_URL; // The JWT key
let supabaseUrl = jwtKey;

if (supabaseUrl && !supabaseUrl.startsWith("http")) {
  if (supabaseUrl.startsWith("eyJ")) {
    const parts = supabaseUrl.split(".");
    if (parts[1]) {
      const decoded = Buffer.from(parts[1], "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (payload && payload.ref) {
        supabaseUrl = `https://${payload.ref}.supabase.co`;
      }
    }
  }
}

console.log("Supabase URL resolved to:", supabaseUrl);
console.log("Initializing Supabase client with resolved URL and JWT key...");

const supabase = createClient(supabaseUrl, jwtKey);

async function runTest() {
  try {
    console.log("Exposed Tables Query (via Rest OpenAPI)...");
    const endpoint = `${supabaseUrl}/rest/v1/`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: jwtKey,
        Authorization: `Bearer ${jwtKey}`,
      },
    });
    if (!response.ok) {
      console.error("Fetch failed:", response.status, await response.text());
    } else {
      const spec = await response.json();
      console.log("Success! Exposed Tables/Paths:", Object.keys(spec.paths));
    }

    console.log("Querying 'landing_pages'...");
    const { data, error } = await supabase
      .from("landing_pages")
      .select("id, name");
    
    if (error) {
      console.error("Query error:", error);
    } else {
      console.log("Query success! Found pages:", data);
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTest();
