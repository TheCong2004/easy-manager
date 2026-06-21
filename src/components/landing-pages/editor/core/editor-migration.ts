import { createDefaultPageSettings, EditorBlock, EditorData, ensureOnlookBlockMeta } from "../types";
import { LandingEditorSnapshot } from "./editor-export-html";

export const CURRENT_EDITOR_SCHEMA_VERSION = 1;

export type VersionedLandingEditorSnapshot = LandingEditorSnapshot & {
  schemaVersion?: number;
};

export function migrateEditorSnapshot(snapshot: VersionedLandingEditorSnapshot): VersionedLandingEditorSnapshot {
  return {
    ...snapshot,
    schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
    data: migrateEditorData(snapshot.data),
  };
}

export function migrateEditorData(data: EditorData): EditorData {
  return {
    ...data,
    pageSettings: {
      ...createDefaultPageSettings(data.pageName),
      ...data.pageSettings,
    },
    blocks: migrateBlocks(data.blocks),
  };
}

function migrateBlocks(blocks: EditorBlock[]): EditorBlock[] {
  return blocks.map((block) => {
    const migrated = ensureOnlookBlockMeta({
      ...block,
      props: sanitizeProps(block.props),
    });

    if (migrated.type !== "columns") return migrated;

    const columnProps = migrated.props as Record<string, unknown>;
    const columns = typeof columnProps.columns === "number" ? columnProps.columns : 2;
    const children: unknown[] = Array.isArray(columnProps.children)
      ? columnProps.children
      : Array.from({ length: columns }, () => []);

    return {
      ...migrated,
      props: {
        ...migrated.props,
        children: children.map((column) => Array.isArray(column) ? migrateBlocks(column as EditorBlock[]) : []),
      },
    };
  });
}

function sanitizeProps(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}
