import { supabase } from "@/lib/supabase";
import { EditorData, createDefaultPageSettings } from "../types";
import { migrateEditorData, CURRENT_EDITOR_SCHEMA_VERSION } from "./editor-migration";
import { LandingEditorSnapshot } from "./editor-export-html";

export interface LocalAutosaveBackup {
  pageId: string;
  schemaVersion: number;
  editorData: EditorData;
  savedAt: string;
  source: "local";
}

export function getLocalBackupKey(pageId: string): string {
  return `landing-editor-autosave:${pageId}`;
}

export async function loadLandingPage(pageId: string): Promise<EditorData | null> {
  // 1. Try to load from Supabase if configured
  let dbPage: any = null;
  let dbError: any = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("id", pageId)
        .single();
      if (error) {
        dbError = error;
      } else {
        dbPage = data;
      }
    } catch (err) {
      dbError = err;
    }
  }

  // 2. Read from localStorage backup
  let localBackup: LocalAutosaveBackup | null = null;
  try {
    const raw = localStorage.getItem(getLocalBackupKey(pageId));
    if (raw) {
      localBackup = JSON.parse(raw) as LocalAutosaveBackup;
    }
  } catch (err) {
    console.warn("Failed to read local storage backup:", err);
  }

  // 3. Process outcomes
  if (dbError) {
    console.warn("Supabase load failed, falling back to local storage:", dbError);
    if (localBackup) {
      return migrateEditorData(localBackup.editorData, pageId);
    }
    return null;
  }

  if (dbPage) {
    const dbData = migrateEditorData(dbPage.editor_data, pageId);
    
    // If local backup is newer than database, we warn or return it
    if (localBackup && localBackup.savedAt) {
      const localTime = new Date(localBackup.savedAt).getTime();
      const dbTime = new Date(dbPage.updated_at || dbPage.created_at).getTime();
      
      if (localTime > dbTime + 1000) {
        console.info("A newer local backup was found compared to the database version.");
        // We attach a temporary metadata flag so the UI can prompt the user to recover it
        (dbData as any).hasNewerLocalBackup = true;
        (dbData as any).localBackupData = localBackup.editorData;
      }
    }
    return dbData;
  }

  // Fallback to local if no db entry found (e.g. offline first use)
  if (localBackup) {
    return migrateEditorData(localBackup.editorData, pageId);
  }

  return null;
}

export async function saveLandingPage(pageId: string, editorData: EditorData): Promise<void> {
  const nowStr = new Date().toISOString();
  
  // 1. Always backup to localStorage
  const backup: LocalAutosaveBackup = {
    pageId,
    schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
    editorData,
    savedAt: nowStr,
    source: "local",
  };
  try {
    localStorage.setItem(getLocalBackupKey(pageId), JSON.stringify(backup));
  } catch (err) {
    console.warn("Failed to write local backup:", err);
  }

  // 2. Try to save to Supabase if configured
  if (supabase) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const updatePayload: any = {
        editor_data: editorData,
        updated_at: nowStr,
      };

      if (userId) {
        updatePayload.user_id = userId;
      }

      const { error } = await supabase
        .from("landing_pages")
        .update(updatePayload)
        .eq("id", pageId);

      if (error) {
        // If row doesn't exist, we can try to insert it
        if (error.code === "PGRST116" || error.message?.includes("0 rows")) {
          const insertPayload: any = {
            id: pageId,
            editor_data: editorData,
            name: editorData.pageName || "Untitled Page",
            slug: editorData.pageName?.toLowerCase().replace(/\s+/g, "-") || `page-${pageId}`,
            status: "draft",
            updated_at: nowStr,
            created_at: nowStr,
          };
          if (userId) {
            insertPayload.user_id = userId;
          }
          const { error: insertError } = await supabase
            .from("landing_pages")
            .insert([insertPayload]);
          
          if (insertError) throw insertError;
        } else {
          throw error;
        }
      }
    } catch (err) {
      console.error("Failed to save to Supabase, local backup remains intact:", err);
      throw err;
    }
  } else {
    console.warn("Supabase is not configured. Saved to LocalStorage only.");
  }
}

export async function createLandingPage(input: {
  id?: string;
  name: string;
  slug: string;
  editor_data?: any;
}): Promise<any> {
  const nowStr = new Date().toISOString();
  const pageId = input.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "page-" + Math.random().toString(36).substring(2, 11));

  const pageData: any = {
    id: pageId,
    name: input.name,
    slug: input.slug,
    status: "draft",
    editor_data: input.editor_data || {},
    created_at: nowStr,
    updated_at: nowStr,
  };

  if (supabase) {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user?.id) {
      pageData.user_id = userData.user.id;
    }
    const { data, error } = await supabase
      .from("landing_pages")
      .insert([pageData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Local storage fallback for creation
  const backup: LocalAutosaveBackup = {
    pageId,
    schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
    editorData: input.editor_data || {
      pageId,
      pageName: input.name,
      sections: [],
      pageSettings: {
        ...createDefaultPageSettings(input.name),
        seoDescription: "",
        bgColor: "#ffffff",
        fontFamily: "Inter, sans-serif",
        maxWidth: 1200,
      },
      schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
    },
    savedAt: nowStr,
    source: "local",
  };
  localStorage.setItem(getLocalBackupKey(pageId), JSON.stringify(backup));
  return pageData;
}

export async function publishLandingPage(pageId: string, html: string): Promise<void> {
  const nowStr = new Date().toISOString();

  if (supabase) {
    const { error } = await supabase
      .from("landing_pages")
      .update({
        published_html: html,
        status: "published",
        published_at: nowStr,
        updated_at: nowStr,
      })
      .eq("id", pageId);
    if (error) throw error;
  } else {
    console.warn("Supabase not configured, cannot publish page to remote DB.");
  }
}

export async function createLandingPageVersion(
  pageId: string,
  editorData: EditorData,
  versionName: string
): Promise<void> {
  if (supabase) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const payload: any = {
      page_id: pageId,
      editor_data: editorData,
      version_name: versionName,
    };
    if (userId) {
      payload.user_id = userId;
    }

    const { error } = await supabase
      .from("landing_page_versions")
      .insert([payload]);
    if (error) throw error;
  } else {
    // Local revision backup fallback
    const key = `landing-revisions:${pageId}`;
    let revisions: any[] = [];
    try {
      const raw = localStorage.getItem(key);
      if (raw) revisions = JSON.parse(raw);
    } catch {}
    revisions.unshift({
      id: Math.random().toString(36).substring(2, 9),
      page_id: pageId,
      editor_data: editorData,
      version_name: versionName,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(revisions.slice(0, 30)));
  }
}

export async function listLandingPageVersions(pageId: string): Promise<any[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("landing_page_versions")
      .select("*")
      .eq("page_id", pageId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  const key = `landing-revisions:${pageId}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function restoreLandingPageVersion(
  pageId: string,
  versionId: string,
  currentEditorData: EditorData
): Promise<EditorData> {
  // 1. Create a backup first
  await createLandingPageVersion(pageId, currentEditorData, "Before restore");

  // 2. Load the target version
  if (supabase) {
    const { data, error } = await supabase
      .from("landing_page_versions")
      .select("*")
      .eq("id", versionId)
      .single();
    if (error) throw error;
    return migrateEditorData(data.editor_data, pageId);
  }

  const key = `landing-revisions:${pageId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    const revisions = JSON.parse(raw) as any[];
    const rev = revisions.find((r) => r.id === versionId);
    if (rev) {
      return migrateEditorData(rev.editor_data, pageId);
    }
  }
  throw new Error("Version not found");
}
