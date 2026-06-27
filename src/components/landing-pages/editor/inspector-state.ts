import { EditorBlock, getNodeKind } from "./types";

export type InspectorMode = "page" | "section" | "element";

export const INSPECTOR_OPEN_STORAGE_KEY = "landing-builder:inspector-open";

export function readInspectorOpenPreference(): boolean {
  if (typeof window === "undefined") return true;
  const stored = window.localStorage.getItem(INSPECTOR_OPEN_STORAGE_KEY);
  if (stored === null) return true;
  return stored === "true";
}

export function persistInspectorOpenPreference(isOpen: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INSPECTOR_OPEN_STORAGE_KEY, String(isOpen));
}

export function resolveInspectorMode(block: EditorBlock | null): InspectorMode {
  if (!block) return "page";
  const kind = getNodeKind(block.type, block.kind);
  if (kind === "section") return "section";
  return "element";
}