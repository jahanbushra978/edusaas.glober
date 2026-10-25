import { NextResponse } from "next/server";
import { verifyPlatformSession, recordPlatformAudit } from "@/lib/platform-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const SYSTEM_MODULES = [
  { key: "students", name: "Student Management", category: "Core Academic" },
  { key: "teachers", name: "Teacher Management", category: "Core Academic" },
  { key: "attendance", name: "Attendance System", category: "Operations" },
  { key: "exams", name: "Exams & Results", category: "Core Academic" },
  { key: "fees", name: "Fees & Hadiya Engine", category: "Finance" },
  { key: "boarding", name: "Boarding & Hostel", category: "Operations" },
  { key: "notices", name: "Notice Board", category: "Communication" },
  { key: "gallery", name: "Media Gallery", category: "Public Site" },
  { key: "events", name: "Events & Calendar", category: "Communication" },
  { key: "applications", name: "Online Admission & Dorkhasto", category: "Admissions" },
  { key: "ai_assistant", name: "AI Assistant & Fee Automation", category: "Smart Tools" },
  { key: "biometric", name: "Biometric Device Integration", category: "Hardware" },
];

export async function GET(request) {
  const session = await verifyPlatformSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");

  try {
    const admin = createSupabaseAdminClient();

    if (organizationId) {
      const { data: org, error } = await admin
        .from("organizations")
        .select("id, name, slug, modules_config")
        .eq("id", organizationId)
        .single();

      if (error || !org) {
        return NextResponse.json({ ok: false, message: "Organization not found" }, { status: 404 });
      }

      const enabled = org.modules_config?.enabled || [];
      return NextResponse.json({
        ok: true,
        catalog: SYSTEM_MODULES,
        organization: org,
        enabledModules: enabled,
      });
    }

    // Return global catalog
    return NextResponse.json({
      ok: true,
      catalog: SYSTEM_MODULES,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err?.message || "Failed to fetch modules" }, { status: 500 });
  }
}

export async function PATCH(request) {
  const session = await verifyPlatformSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const ipAddress = getClientIp(request);

  try {
    const body = await request.json();
    const { organizationId, moduleKey, enabled } = body || {};

    if (!organizationId || !moduleKey) {
      return NextResponse.json({ ok: false, message: "organizationId and moduleKey are required." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: org, error: fetchErr } = await admin
      .from("organizations")
      .select("id, name, modules_config")
      .eq("id", organizationId)
      .single();

    if (fetchErr || !org) {
      return NextResponse.json({ ok: false, message: "Organization not found" }, { status: 404 });
    }

    let currentEnabled = Array.isArray(org.modules_config?.enabled) ? [...org.modules_config.enabled] : [];

    if (enabled) {
      if (!currentEnabled.includes(moduleKey)) {
        currentEnabled.push(moduleKey);
      }
    } else {
      currentEnabled = currentEnabled.filter((k) => k !== moduleKey);
    }

    const updatedConfig = {
      ...(org.modules_config || {}),
      enabled: currentEnabled,
    };

    const { data: updatedOrg, error: updateErr } = await admin
      .from("organizations")
      .update({ modules_config: updatedConfig, updated_at: new Date().toISOString() })
      .eq("id", organizationId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    await recordPlatformAudit({
      actorEmail: session.email,
      action: enabled ? "MODULE_ENABLED" : "MODULE_DISABLED",
      targetType: "MODULE",
      targetId: `${organizationId}:${moduleKey}`,
      details: { organizationName: org.name, moduleKey, enabled },
      ipAddress,
    });

    return NextResponse.json({ ok: true, data: updatedOrg, enabledModules: currentEnabled });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err?.message || "Failed to update module" }, { status: 500 });
  }
}
