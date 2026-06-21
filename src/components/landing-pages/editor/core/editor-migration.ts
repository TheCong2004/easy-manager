import {
  createDefaultPageSettings,
  EditorBlock,
  EditorData,
  ensureOnlookBlockMeta,
  BlockType,
  ElementFrame,
} from "../types";
import { LandingEditorSnapshot } from "./editor-export-html";

export const CURRENT_EDITOR_SCHEMA_VERSION = 2;

export type VersionedLandingEditorSnapshot = {
  schemaVersion?: number;
  data: any;
  actions?: any[];
  html?: string;
  updatedAt?: string;
};

export function migrateEditorSnapshot(
  snapshot: VersionedLandingEditorSnapshot,
  pageId: string
): LandingEditorSnapshot {
  const migratedData = migrateEditorData(snapshot.data, pageId);
  return {
    ...snapshot,
    data: migratedData,
    actions: snapshot.actions || [],
    html: snapshot.html || "",
    updatedAt: snapshot.updatedAt || new Date().toISOString(),
  };
}

export function migrateEditorData(data: any, pageId: string): EditorData {
  if (!data) {
    return {
      pageId,
      pageName: "Untitled Page",
      sections: [],
      pageSettings: createDefaultPageSettings("Untitled Page"),
      schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
    };
  }

  const pageName = data.pageName || "Untitled Page";
  const pageSettings = {
    ...createDefaultPageSettings(pageName),
    ...data.pageSettings,
  };

  // Idempotent check: if already schemaVersion 2 and sections is present, return normalized
  if (data.schemaVersion === 2 && Array.isArray(data.sections)) {
    const validatedSections = data.sections.map((section: any) => {
      const secMeta = ensureOnlookBlockMeta(section);
      secMeta.kind = "section";
      secMeta.parentId = null;
      if (!secMeta.children) secMeta.children = [];
      secMeta.children = secMeta.children.map((child: any, idx: number) => {
        const childMeta = ensureOnlookBlockMeta(child);
        childMeta.parentId = secMeta.id;
        if (!childMeta.frame) {
          childMeta.frame = getDefaultFrame(childMeta.type, idx);
        }
        return childMeta;
      });

      // Recalculate section minHeight/height dynamically
      if (secMeta.children.length > 0) {
        let maxBottom = 0;
        secMeta.children.forEach((c: any) => {
          if (c.frame) {
            maxBottom = Math.max(maxBottom, c.frame.y + c.frame.height);
          }
        });
        const currentMin = num(secMeta.props?.minHeight || secMeta.frame?.height, 500);
        const calculated = maxBottom + 80;
        if (secMeta.props) {
          secMeta.props.minHeight = Math.max(currentMin, calculated);
        }
        if (secMeta.frame) {
          secMeta.frame.height = Math.max(currentMin, calculated);
        }
      }
      return secMeta;
    });

    return {
      pageId: data.pageId || pageId,
      pageName,
      sections: validatedSections,
      pageSettings,
      schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
    };
  }

  // Legacy migration: convert flat blocks list into section-child structure
  const legacyBlocks = Array.isArray(data.blocks) ? data.blocks : [];
  const sections: EditorBlock[] = [];
  let defaultSection: EditorBlock | null = null;
  let elementIndex = 0;

  legacyBlocks.forEach((block: any) => {
    const b = ensureOnlookBlockMeta(block);
    const isSection =
      b.kind === "section" ||
      [
        "hero",
        "product_section",
        "form_section",
        "footer",
        "custom_section",
        "tea_landing",
        "smartwatch_landing",
        "menu",
      ].includes(b.type);

    if (isSection) {
      const sec: EditorBlock = {
        ...b,
        kind: "section",
        parentId: null,
        children: Array.isArray(b.children) ? b.children : [],
      };
      sections.push(sec);
    } else {
      // Root-level element, wrap inside a default section
      if (!defaultSection) {
        defaultSection = ensureOnlookBlockMeta({
          id: generateId(),
          type: "custom_section",
          kind: "section",
          parentId: null,
          label: "Section mặc định",
          props: {
            bgColor: "#ffffff",
            paddingX: 0,
            paddingY: 0,
            minHeight: 500,
          },
          frame: {
            x: 0,
            y: 0,
            width: 1280,
            height: 500,
            zIndex: 1,
            rotate: 0,
          },
          children: [],
        });
        sections.push(defaultSection);
      }

      const elem: EditorBlock = {
        ...b,
        parentId: defaultSection.id,
        frame: b.frame || getDefaultFrame(b.type, elementIndex++),
      };
      defaultSection.children!.push(elem);
    }
  });

  // Post-process sections
  sections.forEach((sec) => {
    if (!sec.children) sec.children = [];
    sec.children = sec.children.map((child: any, idx: number) => {
      const c = ensureOnlookBlockMeta(child);
      c.parentId = sec.id;
      if (!c.frame) {
        c.frame = getDefaultFrame(c.type, idx);
      }
      return c;
    });

    if (sec.children.length > 0) {
      let maxBottom = 0;
      sec.children.forEach((c) => {
        if (c.frame) {
          maxBottom = Math.max(maxBottom, c.frame.y + c.frame.height);
        }
      });
      const currentMin = num(sec.props?.minHeight || sec.frame?.height, 500);
      const calculated = maxBottom + 80;
      if (sec.props) {
        sec.props.minHeight = Math.max(currentMin, calculated);
      }
      if (sec.frame) {
        sec.frame.height = Math.max(currentMin, calculated);
      }
    }
  });

  return {
    pageId: data.pageId || pageId,
    pageName,
    sections,
    pageSettings,
    schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
  };
}

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "node-" + Math.random().toString(36).substring(2, 11);
}

function getDefaultFrame(type: BlockType, index: number): ElementFrame {
  let width = 200;
  let height = 100;

  if (type === "button") {
    width = 160;
    height = 44;
  } else if (type === "image") {
    width = 300;
    height = 200;
  } else if (type === "text") {
    width = 400;
    height = 80;
  } else if (type === "divider") {
    width = 600;
    height = 20;
  }

  return {
    x: 40,
    y: 100 + index * (height + 20),
    width,
    height,
    zIndex: index + 1,
    rotate: 0,
  };
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
