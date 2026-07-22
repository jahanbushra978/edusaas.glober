import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "../../../src/lib/auth-identity";
import { verifySessionToken } from "../../../src/lib/auth-session";
import { createSupabaseAdminClient } from "../../../src/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getFeatureForEntityType(entityType) {
  switch (entityType) {
    case "student":
      return "students";
    case "teacher":
      return "teachers";
    case "notice":
      return "notices";
    case "branch":
      return "branches";
    case "event":
      return "events";
    case "course":
      return "academic-structure";
    case "admission":
      return "reserve";
    case "exam":
      return "exams";
    case "fee":
      return "fees";
    case "expense":
      return "fees";
    default:
      return null;
  }
}

export async function GET(request) {
  try {
    // 1. Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401, headers: { "Cache-Control": "no-store, private" } }
      );
    }

    const { role, branch_id: userBranchId, allowed_features: allowedFeatures } = session;

    // 2. Parse search query params
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "all";

    if (!query) {
      return NextResponse.json({ ok: true, results: [] }, { headers: { "Cache-Control": "no-store, private" } });
    }

    // 3. Connect to database
    const supabaseAdmin = createSupabaseAdminClient();

    // 4. Build search query
    let dbQuery = supabaseAdmin
      .from("global_search_index")
      .select("*");

    // Search term matching using ILIKE (sanitized)
    const sanitized = query.replace(/[%_]/g, '').toLowerCase().slice(0, 100);
    if (!sanitized) {
      return NextResponse.json({ ok: true, results: [] }, { headers: { "Cache-Control": "no-store, private" } });
    }
    const searchPattern = `%${sanitized}%`;
    dbQuery = dbQuery.or(`title.ilike.${searchPattern},keywords.ilike.${searchPattern}`);

    // Category filtering
    if (category !== "all") {
      dbQuery = dbQuery.eq("entity_type", category);
    }

    // Branch Isolation:
    // If not super admin, restrict to user's branch or global items (branch_id is null)
    if (role !== "admin") {
      if (userBranchId) {
        dbQuery = dbQuery.or(`branch_id.eq.${Number(userBranchId)},branch_id.is.null`);
      } else {
        // If user is a branch admin but somehow branch_id is null, restrict to global only
        dbQuery = dbQuery.is("branch_id", null);
      }
    }

    // Run query (limit to 50 items for free-tier performance)
    const { data: rawResults, error } = await dbQuery.limit(50);

    if (error) {
      console.error("[Search API Error]", error);
      throw error;
    }

    // 5. Post-query Permission Filtering (Backend validation)
    // Only return results the user is allowed to see based on allowed_features
    let allowedList = allowedFeatures;
    if (role !== "admin" && !Array.isArray(allowedList)) {
      allowedList = role === "boarding_manager"
        ? ["boarding"]
        : ["students", "teachers", "student-attendance", "teacher-attendance", "daily-lesson-tracker", "exams"];
    }

    const filteredResults = (rawResults || []).filter((item) => {
      const requiredFeature = getFeatureForEntityType(item.entity_type);
      if (!requiredFeature) return true; // Modules/navigation tabs or other public items
      if (role === "admin") return true;

      // Special boarding feature check
      if (item.entity_type === "expense" && item.title.toLowerCase().includes("boarding")) {
        return allowedList.includes("boarding");
      }

      return allowedList.includes(requiredFeature);
    });

    // 6. Highlight matches
    const results = filteredResults.map((item) => {
      // Find index of match to return clean highlighted segments
      const titleLower = item.title.toLowerCase();
      const qLower = query.toLowerCase();
      const matchIdx = titleLower.indexOf(qLower);

      return {
        ...item,
        matchIndex: matchIdx,
        matchLength: query.length
      };
    });

    return NextResponse.json({
      ok: true,
      results
    }, { headers: { "Cache-Control": "no-store, private" } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { ok: false, message: `Search failed: ${msg}` },
      { status: 500, headers: { "Cache-Control": "no-store, private" } }
    );
  }
}
