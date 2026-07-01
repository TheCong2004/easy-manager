"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OAuthSuccessPage() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "connected" | "no_session">("loading");
  const [scannedKey, setScannedKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      let rawSession = null;
      let foundKey = null;

      // Scan all localStorage keys for Supabase session keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes("auth-token") || key.includes("supabase.auth"))) {
          rawSession = localStorage.getItem(key);
          foundKey = key;
          break;
        }
      }
      
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        const accessToken = parsed?.access_token || parsed?.currentSession?.access_token;
        if (accessToken) {
          setToken(accessToken);
          setScannedKey(foundKey);
          setStatus("connected");
          
          // Post message to the extension oauth-bridge.js
          window.postMessage({
            source: "tobyflow-oauth-success",
            token: accessToken
          }, window.location.origin);
          
          console.log("[TobyFlow Success] Token found under key:", foundKey);
        } else {
          setStatus("no_session");
        }
      } else {
        setStatus("no_session");
      }
    } catch (e) {
      console.error("[TobyFlow Success] Failed to parse Supabase session", e);
      setStatus("no_session");
    }
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#0c0d12",
      color: "#ffffff",
      fontFamily: "sans-serif"
    }}>
      {token && (
        <meta name="tobyflow-auth-token" content={token} />
      )}
      
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "32px",
        textAlign: "center",
        maxWidth: "400px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
      }}>
        {status === "loading" && (
          <div>
            <h1 style={{ fontSize: "20px", marginBottom: "16px", color: "#a1a1aa" }}>Connecting...</h1>
            <p style={{ fontSize: "14px", color: "#71717a" }}>Checking your local session credentials...</p>
          </div>
        )}

        {status === "connected" && (
          <div>
            <h1 style={{ fontSize: "24px", marginBottom: "16px", color: "#10b981" }}>✓ Successfully Connected!</h1>
            <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: "1.6" }}>
              Your extension is now successfully linked to your local dev backend.
            </p>
            <div style={{
              marginTop: "24px",
              display: "inline-block",
              padding: "8px 16px",
              borderRadius: "8px",
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              fontSize: "12px",
              fontWeight: "bold"
            }}>
              Gói cước: PRO / PREMIUM
            </div>
            {scannedKey && (
              <div style={{ fontSize: "10px", color: "#52525b", marginTop: "16px" }}>
                Session Key: {scannedKey}
              </div>
            )}
          </div>
        )}

        {status === "no_session" && (
          <div>
            <h1 style={{ fontSize: "24px", marginBottom: "16px", color: "#ef4444" }}>⚠️ No Active Session Found</h1>
            <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: "1.6", marginBottom: "24px" }}>
              We could not find an active Supabase login session in your browser. Please log in to your account first.
            </p>
            <Link 
              href="/signin?redirect_to=/auth/google/success"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                background: "#4f46e5",
                color: "#ffffff",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "bold",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#4338ca"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#4f46e5"}
            >
              Go to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
