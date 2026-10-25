import { NextResponse } from "next/server";
import { verifyPlatformSession, recordPlatformAudit } from "@/lib/platform-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const session = await verifyPlatformSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const admin = createSupabaseAdminClient();
    const { data: org, error } = await admin
      .from("organizations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !org) {
      return NextResponse.json({ ok: false, message: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: org });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err?.message || "Failed to fetch organization" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const session = await verifyPlatformSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ipAddress = getClientIp(request);

  try {
    const body = await request.json();
    const admin = createSupabaseAdminClient();

    // Prevent changing ID
    delete body.id;
    delete body.created_at;

    body.updated_at = new Date().toISOString();

    const { data: updatedOrg, error } = await admin
      .from("organizations")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await recordPlatformAudit({
      actorEmail: session.email,
      action: "ORGANIZATION_UPDATED",
      targetType: "ORGANIZATION",
      targetId: id,
      details: body,
      ipAddress,
    });

    return NextResponse.json({ ok: true, data: updatedOrg });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err?.message || "Failed to update organization" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await verifyPlatformSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ipAddress = getClientIp(request);

  // Protect Rahmania Flagship Tenant
  if (id === "00000000-0000-0000-0000-000000000001") {
    return NextResponse.json({ ok: false, message: "Rahmania Institute flagship organization cannot be deleted." }, { status: 403 });
  }

  try {
    const admin = createSupabaseAdminClient();

    // Soft delete / suspend instead of destructive foreign key cascade
    const { data: deletedOrg, error } = await admin
      .from("organizations")
      .update({ status: "inactive", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await recordPlatformAudit({
      actorEmail: session.email,
      action: "ORGANIZATION_DEACTIVATED",
      targetType: "ORGANIZATION",
      targetId: id,
      details: { previousStatus: "active" },
      ipAddress,
    });

    return NextResponse.json({ ok: true, data: deletedOrg, message: "Organization deactivated successfully." });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err?.message || "Failed to deactivate organization" }, { status: 500 });
  }
}
