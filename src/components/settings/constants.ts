import type { FacebookTokenValues, TokenFieldConfig } from "./types";

export const THEME_STORAGE_KEY = "settings_theme_mode";

export const TOKEN_STORAGE_KEYS: Record<keyof FacebookTokenValues, string> = {
  eaag: "settings_token_eaag",
  eaab: "settings_token_eaab",
  eaai: "settings_token_eaai",
  eaah: "settings_token_eaah",
  cookie: "settings_token_cookie",
};

export const TOKEN_FIELDS: TokenFieldConfig[] = [
  { key: "eaag", label: "TOKEN EAAG", placeholder: "Tự động lấy từ cookie/bridge..." },
  { key: "eaab", label: "TOKEN EAAB", placeholder: "Tự động lấy từ cookie/bridge..." },
  { key: "eaai", label: "TOKEN EAAI", placeholder: "Tự động lấy từ cookie/bridge..." },
  { key: "eaah", label: "TOKEN EAAH", placeholder: "Tự động lấy từ cookie/bridge..." },
  { key: "cookie", label: "COOKIE", placeholder: "Tự động đồng bộ từ phiên Facebook..." },
];

export const EMPTY_TOKEN_VALUES: FacebookTokenValues = {
  eaag: "",
  eaab: "",
  eaai: "",
  eaah: "",
  cookie: "",
};

export const HIDDEN_TOKEN_FIELDS: Record<keyof FacebookTokenValues, boolean> = {
  eaag: false,
  eaab: false,
  eaai: false,
  eaah: false,
  cookie: false,
};
