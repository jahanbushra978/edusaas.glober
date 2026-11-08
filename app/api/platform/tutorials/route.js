import { NextResponse } from "next/server";
import { verifyPlatformSession } from "@/lib/platform-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SETTING_KEY = "tutorial_guide_global_config";

// Default configuration
const DEFAULT_CONFIG = {
  globalEnabled: true,
  customVideos: {},
};

// Resilient in-process memory cache fallback
let memoryConfig = { ...DEFAULT_CONFIG };

export async function GET() {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("app_settings")
      .select("key, value")
      .eq("key", SETTING_KEY)
      .maybeSingle();

    if (!error && data?.value) {
      try {
        const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
        memoryConfig = {
          globalEnabled: parsed.globalEnabled !== false,
          customVideos: parsed.customVideos || {},
        };
      } catch {}
    }

    return NextResponse.json({
      ok: true,
      globalEnabled: memoryConfig.globalEnabled !== false,
      customVideos: memoryConfig.customVideos || {},
    });
  } catch (err) {
    return NextResponse.json({
      ok: true,
      globalEnabled: memoryConfig.globalEnabled !== false,
      customVideos: memoryConfig.customVideos || {},
    });
  }
}

export async function POST(request) {
  try {
    const session = await verifyPlatformSession(request);
    const body = await request.json();

    const admin = createSupabaseAdminClient();

    // Read existing
    const { data: existing } = await admin
      .from("app_settings")
      .select("key, value")
      .eq("key", SETTING_KEY)
      .maybeSingle();

    let current = { ...memoryConfig };
    if (existing?.value) {
      try {
        current = typeof existing.value === "string" ? JSON.parse(existing.value) : existing.value;
      } catch {}
    }

    if (typeof body.globalEnabled === "boolean") {
      current.globalEnabled = body.globalEnabled;
    }

    if (body.routeKey && typeof body.videoUrl === "string") {
      current.customVideos = {
        ...(current.customVideos || {}),
        [body.routeKey]: body.videoUrl.trim(),
      };
    } else if (body.customVideos && typeof body.customVideos === "object") {
      current.customVideos = {
        ...(current.customVideos || {}),
        ...body.customVideos,
      };
    }

    // Update in-memory fallback
    memoryConfig = { ...current };

    // Save to app_settings (Upsert)
    try {
      await admin.from("app_settings").upsert(
        {
          key: SETTING_KEY,
          value: JSON.stringify(current),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );
    } catch (upsertError) {
      console.warn("Could not save to app_settings:", upsertError.message);
    }

    return NextResponse.json({
      ok: true,
      globalEnabled: current.globalEnabled !== false,
      customVideos: current.customVideos || {},
      message: "Tutorial configuration updated successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err.message || "Failed to update tutorial settings" },
      { status: 500 }
    );
  }
}
