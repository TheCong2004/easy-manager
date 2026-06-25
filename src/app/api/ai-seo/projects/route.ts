import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../mockDb";
import { shouldFallbackToMock, jsonError } from "../apiUtils";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = request.headers.get("x-org-id") || searchParams.get("orgId") || "org-1";
    const type = searchParams.get("type");
    const fallbackEnabled = shouldFallbackToMock();

    // Parent project list selection for wizard step 1
    if (type === "parent") {
      if (!supabase) {
        if (fallbackEnabled) {
          return NextResponse.json(mockDb.getProjects(orgId));
        }
        return jsonError(new Error("Supabase client not configured"), "Supabase not configured");
      }
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });

      if (error) {
        if (fallbackEnabled) {
          console.warn("Supabase fetch projects error, using mockDb:", error);
          return NextResponse.json(mockDb.getProjects(orgId));
        }
        return jsonError(error, "Failed to retrieve parent projects");
      }
      return NextResponse.json(data);
    }

    // Default: Return detailed AI SEO Automation project cards
    if (!supabase) {
      if (fallbackEnabled) {
        return NextResponse.json(mockDb.getAiSeoProjects(orgId));
      }
      return jsonError(new Error("Supabase client not configured"), "Supabase not configured");
    }

    const { data: parentProjects, error: parentError } = await supabase
      .from("projects")
      .select("id")
      .eq("organization_id", orgId);

    if (parentError) {
      if (fallbackEnabled) {
        return NextResponse.json(mockDb.getAiSeoProjects(orgId));
      }
      return jsonError(parentError, "Failed to retrieve parent projects");
    }

    if (!parentProjects || parentProjects.length === 0) {
      // No parent projects means empty list in real DB
      return NextResponse.json([]);
    }

    const projectIds = parentProjects.map(p => p.id);

    const { data, error } = await supabase
      .from("ai_seo_projects")
      .select(`
        *,
        scores:ai_seo_project_scores(*),
        integrations:ai_seo_project_integrations(*),
        installations:ai_seo_project_installations(*)
      `)
      .in("project_id", projectIds);

    if (error) {
      if (fallbackEnabled) {
        console.warn("Supabase fetch ai_seo_projects error, using mockDb:", error);
        return NextResponse.json(mockDb.getAiSeoProjects(orgId));
      }
      return jsonError(error, "Failed to retrieve AI SEO projects");
    }

    // Map database snake_case rows into SearchAtlas camelCase parameters
    const mappedData = (data || []).map(item => {
      const score = item.scores?.[0] || {};
      const integration = item.integrations?.[0] || {};
      const installation = item.installations?.[0] || {};

      return {
        id: item.id,
        uuid: item.uuid,
        projectId: item.project_id,
        hostname: item.hostname,
        siteAudit: item.site_audit,
        readyForProcessing: item.ready_for_processing,
        isFirstProcessing: item.is_first_processing,
        taskStatus: item.task_status,
        pixelTagState: item.pixel_tag_state || installation.status || 'not_installed',
        isFrozen: item.is_frozen,
        isFavorite: item.is_favorite,
        isEngaged: item.is_engaged,
        atRiskOfWipe: item.at_risk_of_wipe,
        daysUntilWipe: item.days_until_wipe,
        wipeScheduledAt: item.wipe_scheduled_at,
        lastAnalysis: item.last_analysis,
        nextAnalysisAt: item.next_analysis_at,
        timeSavedTotal: item.time_saved_total,
        createdAt: item.created_at,
        connectedData: {
          isGscConnected: integration.is_gsc_connected || false,
          isGbpConnected: integration.is_gbp_connected || false,
          gscDetails: integration.gsc_details || {},
          gbpDetailsV2: integration.gbp_details_v2 || {}
        },
        afterSummary: {
          healthyPages: score.healthy_pages || 0,
          totalPages: score.total_pages || 0
        },
        holisticScores: {
          technicalsScore: score.technicals_score || 0,
          uxScore: score.ux_score || 0,
          authorityScore: score.authority_score || 0,
          contentScore: score.content_score || 0
        },
        aiGradeOverall: score.ai_grade_overall || 0
      };
    });

    return NextResponse.json(mappedData);
  } catch (err: any) {
    console.error("GET projects error:", err);
    if (shouldFallbackToMock()) {
      return NextResponse.json(mockDb.getAiSeoProjects("org-1"));
    }
    return jsonError(err, "Internal Server Error");
  }
}

export async function POST(request: NextRequest) {
  try {
    const orgId = request.headers.get("x-org-id") || "org-1";
    const body = await request.json();
    const { name, hostname } = body;
    const fallbackEnabled = shouldFallbackToMock();

    // Normal parent project creation (name only)
    if (name && !hostname) {
      if (!supabase) {
        if (fallbackEnabled) {
          const proj = mockDb.createProject(orgId, name);
          return NextResponse.json(proj);
        }
        return jsonError(new Error("Supabase client not configured"), "Supabase not configured");
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({ organization_id: orgId, name })
        .select()
        .single();

      if (error) {
        if (fallbackEnabled) {
          console.warn("Supabase insert project error, using mockDb:", error);
          return NextResponse.json(mockDb.createProject(orgId, name));
        }
        return jsonError(error, "Failed to create parent project");
      }

      return NextResponse.json(data);
    }

    // AI SEO project creation (hostname details)
    if (!hostname) {
      return NextResponse.json({ error: "Missing parameter: hostname" }, { status: 400 });
    }

    if (!supabase) {
      if (fallbackEnabled) {
        const proj = mockDb.createAiSeoProject(orgId, hostname, name || `Dự án ${hostname}`);
        return NextResponse.json(proj);
      }
      return jsonError(new Error("Supabase client not configured"), "Supabase not configured");
    }

    // Create parent project container
    const { data: parentProject, error: parentError } = await supabase
      .from("projects")
      .insert({ organization_id: orgId, name: name || `Dự án ${hostname}` })
      .select()
      .single();

    if (parentError || !parentProject) {
      throw parentError || new Error(`Failed to create parent project`);
    }

    // Create detailed AI SEO card
    const { data: aiSeoProject, error: aiSeoProjectError } = await supabase
      .from("ai_seo_projects")
      .insert({
        project_id: parentProject.id,
        hostname
      })
      .select()
      .single();

    if (aiSeoProjectError || !aiSeoProject) {
      throw aiSeoProjectError || new Error(`Failed to create ai seo project`);
    }

    // Add empty scores record
    await supabase
      .from("ai_seo_project_scores")
      .insert({ ai_seo_project_id: aiSeoProject.id });

    // Add empty integrations record
    await supabase
      .from("ai_seo_project_integrations")
      .insert({ ai_seo_project_id: aiSeoProject.id });

    // Add empty installations record
    await supabase
      .from("ai_seo_project_installations")
      .insert({
        ai_seo_project_id: aiSeoProject.id,
        installation_type: "custom_script",
        script_tag: `<script async src="https://api.otto-seo.com/sdk/${aiSeoProject.id}.js"></script>`,
        status: "not_installed"
      });

    return NextResponse.json(aiSeoProject);
  } catch (err: any) {
    console.error("POST projects error:", err);
    return jsonError(err, "Internal Server Error");
  }
}
