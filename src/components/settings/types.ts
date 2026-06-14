import type { FacebookTokenSet } from "@/features/auth/types";

export type ThemePreference = "system" | "light" | "dark";
export type TokenKey = keyof FacebookTokenSet;

export type FacebookTokenValues = Record<TokenKey | "cookie", string>;
export type VisibleTokenFields = Record<keyof FacebookTokenValues, boolean>;

export type TokenFieldConfig = {
  key: keyof FacebookTokenValues;
  label: string;
  placeholder: string;
};

export type RefreshTokenResult = {
  ok?: boolean;
  state?: string;
  data?: {
    accessToken?: string;
    accessToken2?: string;
    accessToken4?: string;
    accessToken5?: string;
    EAAG?: string;
    EAAB?: string;
    EAAI?: string;
    EAAH?: string;
  };
};

declare global {
  interface Window {
    ViaFacebookAuthGuard?: {
      refreshAllTokensDirect?: () => Promise<RefreshTokenResult>;
      refreshFullTokens?: (options?: Record<string, unknown>) => Promise<RefreshTokenResult>;
      syncFacebookAuthCookie?: () => Promise<unknown>;
    };
  }
}
