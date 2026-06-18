export const APP_INSTALLATION_STORAGE_KEY = "ladipage.installed-apps";
export const APP_INSTALLATION_EVENT = "ladipage:installed-apps-changed";

export function readInstalledAppIds(fallback: string[] = []) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(APP_INSTALLATION_STORAGE_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return fallback;
    }

    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return fallback;
  }
}

export function saveInstalledAppIds(ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  const uniqueIds = Array.from(new Set(ids));
  window.localStorage.setItem(APP_INSTALLATION_STORAGE_KEY, JSON.stringify(uniqueIds));
  window.dispatchEvent(new CustomEvent(APP_INSTALLATION_EVENT, { detail: uniqueIds }));
}
