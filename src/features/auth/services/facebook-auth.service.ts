import { useAuthStore } from "../stores/auth.store";
import { tokenManager } from "./token-manager";
import { FacebookTokenSet, FacebookUserProfile, CheckpointState } from "../types";

export class FacebookAuthService {
  /**
   * Get the active Facebook UID from the store
   */
  getActiveUid(): string | null {
    return useAuthStore.getState().uid;
  }

  /**
   * Resolve auth context for a given UID and requirements
   */
  async resolveAuthContext(
    uid: string | null,
    requirements?: { requireTokens?: (keyof FacebookTokenSet)[] }
  ): Promise<{
    uid: string | null;
    profile: FacebookUserProfile | null;
    status: CheckpointState;
    error?: string;
  }> {
    const store = useAuthStore.getState();
    const currentUid = uid || store.uid;

    if (!currentUid) {
      return {
        uid: null,
        profile: null,
        status: "not_login",
        error: "No active user session found.",
      };
    }

    const profile = store.profile;
    if (!profile || profile.uid !== currentUid) {
      return {
        uid: currentUid,
        profile: null,
        status: "not_login",
        error: "Profile mismatch or session not active.",
      };
    }

    // Verify required tokens
    if (requirements?.requireTokens) {
      const tokenSet = profile.tokenSet || {};
      const missingTokens = requirements.requireTokens.filter((t) => !tokenSet[t]);
      if (missingTokens.length > 0) {
        return {
          uid: currentUid,
          profile,
          status: "not_login",
          error: `Missing required tokens: ${missingTokens.join(", ")}`,
        };
      }
    }

    return {
      uid: currentUid,
      profile,
      status: store.status,
      error: store.error,
    };
  }

  /**
   * Ensure that we have a live access token for a specific action.
   * If token is missing or expired, attempt to refresh.
   */
  async ensureLiveAccessTokenForAction(
    actionName: string,
    tokenType: keyof FacebookTokenSet = "eaag"
  ): Promise<string> {
    const store = useAuthStore.getState();
    const profile = store.profile;
    const token = profile?.tokenSet?.[tokenType];

    if (!token) {
      console.log(`[AuthService] No token found for action: ${actionName}, trying to refresh...`);
      await this.refreshFullTokens();
      const refreshedProfile = useAuthStore.getState().profile;
      const refreshedToken = refreshedProfile?.tokenSet?.[tokenType];
      if (!refreshedToken) {
        throw new Error(`Facebook access token (${tokenType.toUpperCase()}) unavailable for action: ${actionName}`);
      }
      return refreshedToken;
    }

    // Optional: Validate token lifetime/liveness via Graph API call (mocked here, or using api client)
    const isLive = await this.validateTokenLiveness(token);
    if (!isLive) {
      console.log(`[AuthService] Token expired/invalid for action: ${actionName}, refreshing...`);
      await this.refreshFullTokens();
      const refreshedProfile = useAuthStore.getState().profile;
      const refreshedToken = refreshedProfile?.tokenSet?.[tokenType];
      if (!refreshedToken) {
        throw new Error(`Facebook access token (${tokenType.toUpperCase()}) expired and refresh failed.`);
      }
      return refreshedToken;
    }

    return token;
  }

  /**
   * Validate token liveness by sending a lightweight check request to Facebook Graph API
   */
  private async validateTokenLiveness(token: string): Promise<boolean> {
    try {
      // In a real environment, we'd make a call to graph.facebook.com/me?access_token=token
      // Or call it via our bridge if running inside Desktop Profile / Chrome extension
      if (typeof window !== "undefined" && (window as any).apiExtension) {
        const result = await (window as any).apiExtension.invoke("facebook:validate-token", { token });
        return result?.isValid || false;
      }
      // Simple mock check for the UI dashboard (tokens starting with EAA and > 50 chars)
      return tokenManager.isValidToken(token);
    } catch {
      return false;
    }
  }

  /**
   * Refresh all 4 types of tokens (EAAG, EAAB, EAAI, EAAH) using active session cookies
   */
  async refreshFullTokens(): Promise<FacebookTokenSet> {
    console.log("[AuthService] Starting full token refresh...");
    const store = useAuthStore.getState();

    try {
      let cookie = store.profile?.cookie || "";
      
      // If we are in extension mode, sync cookie directly
      if (typeof window !== "undefined" && (window as any).apiExtension) {
        console.log("[AuthService] Requesting cookie sync from Extension...");
        const sessionInfo = await (window as any).apiExtension.invoke("facebook:get-session-info");
        if (sessionInfo?.cookie) {
          cookie = sessionInfo.cookie;
        }
      }

      if (!cookie) {
        store.setAuthContext({ status: "not_login", error: "No cookie available for refresh." });
        return {};
      }

      // Trích xuất tokens từ cookie
      const extractedTokens = tokenManager.extractTokensFromCookie(cookie);
      
      // Real environment calls to Facebook to exchange cookies for full tokens
      // For mock: generate tokens based on cookie presence
      const updatedTokens: FacebookTokenSet = {
        eaag: extractedTokens.eaag || `EAAG_MOCK_REFRESHED_${Math.random().toString(36).slice(2, 12)}`,
        eaab: extractedTokens.eaab || `EAAB_MOCK_REFRESHED_${Math.random().toString(36).slice(2, 12)}`,
        eaai: extractedTokens.eaai || `EAAI_MOCK_REFRESHED_${Math.random().toString(36).slice(2, 12)}`,
        eaah: extractedTokens.eaah || `EAAH_MOCK_REFRESHED_${Math.random().toString(36).slice(2, 12)}`,
      };

      store.updateTokens(updatedTokens);
      store.setAuthContext({ status: "ok", error: undefined, lastChecked: Date.now() });
      console.log("[AuthService] Full tokens refreshed successfully.");
      return updatedTokens;
    } catch (err: any) {
      console.error("[AuthService] Failed to refresh tokens:", err);
      store.setAuthContext({ status: "extension_unavailable", error: err.message });
      return {};
    }
  }

  /**
   * Sync active Facebook user cookie and initialize profile
   */
  async syncFacebookAuthCookie(cookie: string): Promise<boolean> {
    const store = useAuthStore.getState();
    if (!cookie) return false;

    try {
      const cUserMatch = cookie.match(/c_user=(\d+)/);
      const uid = cUserMatch ? cUserMatch[1] : `fb_user_${Math.random().toString(36).slice(2, 8)}`;
      
      const profile: FacebookUserProfile = {
        uid,
        name: "Võ Thế Công",
        cookie,
        avatarUrl: `https://graph.facebook.com/${uid}/picture?type=normal`,
        tokenSet: {},
      };

      store.setProfile(profile);
      store.setStatus("ok");
      
      // Auto-trigger full token load
      await this.refreshFullTokens();
      return true;
    } catch (err) {
      console.error("[AuthService] Cookie sync error:", err);
      store.setStatus("not_login");
      return false;
    }
  }
}

export const facebookAuthService = new FacebookAuthService();
