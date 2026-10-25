import { NextResponse } from "next/server";
import { verifyPlatformSession, recordPlatformAudit } from "@/lib/platform-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const session = await verifyPlatformSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data: orgs, error } = await admin
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, data: orgs || [] });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err?.message || "Failed to fetch organizations" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await verifyPlatformSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const ipAddress = getClientIp(request);

  try {
    const body = await request.json();
    const { name, slug, domain, subdomain, subscription_plan = "enterprise", modules_config, theme_config } = body || {};

    if (!name || !name.trim()) {
      return NextResponse.json({ ok: false, message: "Organization name is required." }, { status: 400 });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/%20|\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-");

    const admin = createSupabaseAdminClient();

    // Check slug collision
    const { data: existing } = await admin
      .from("organizations")
      .select("id")
      .eq("slug", cleanSlug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: false, message: "An organization with this slug already exists." }, { status: 409 });
    }

    const defaultModules = modules_config || {
      enabled: [
        "students",
        "teachers",
        "attendance",
        "exams",
        "fees",
        "notices",
        "gallery",
        "events",
        "applications",
        "ai_assistant",
      ],
    };

    const newOrgPayload = {
      name: name.trim(),
      slug: cleanSlug,
      domain: domain ? domain.trim().toLowerCase() : null,
      subdomain: subdomain ? subdomain.trim().toLowerCase() : cleanSlug,
      status: "active",
      subscription_plan,
      modules_config: defaultModules,
      theme_config: theme_config || { primaryColor: "#0f766e", secondaryColor: "#0d9488" },
    };

    const { data: createdOrg, error: createError } = await admin
      .from("organizations")
      .insert(newOrgPayload)
      .select()
      .single();

    if (createError) throw createError;

    // Initialize white_label_configs
    try {
      await admin.from("white_label_configs").insert({
        organization_id: createdOrg.id,
        browser_title: createdOrg.name,
        branding_json: { institutionName: createdOrg.name },
        theme_colors_json: { primary: "#0f766e", secondary: "#0d9488" },
      });
    } catch (e) {
      console.warn("Auto white label creation notice:", e?.message);
    }

    // Record Audit
    await recordPlatformAudit({
      actorEmail: session.email,
      action: "ORGANIZATION_CREATED",
      targetType: "ORGANIZATION",
      targetId: createdOrg.id,
      details: { name: createdOrg.name, slug: createdOrg.slug, plan: subscription_plan },
      ipAddress,
    });

    return NextResponse.json({ ok: true, data: createdOrg });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err?.message || "Failed to create organization" }, { status: 500 });
  }
}
