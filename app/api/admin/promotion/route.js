import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin.js";
import { cookies } from "next/headers";
import { verifySessionToken } from "../../../../src/lib/auth-session";
import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";
import { verifyCsrfOrigin, getClientIp } from "../../../../src/lib/security";
import { checkRateLimit } from "../../../../src/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  if (!session) return null;
  return session;
}

export async function POST(request) {
  if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }
  if (!checkRateLimit(`admin-promotion:${getClientIp(request)}`, { windowMs: 60000, max: 30 })) {
    return NextResponse.json({ ok: false, message: "Too many requests. Please slow down." }, { status: 429 });
  }

  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, data } = body;
    const supabase = createSupabaseAdminClient();

    if (action === "create_promotion") {
      const { data: result, error } = await supabase
        .from("promotions")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, data: result });
    }

    if (action === "update_promotion") {
      const { id, ...updates } = data;
      const { data: result, error } = await supabase
        .from("promotions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, data: result });
    }

    if (action === "create_promotion_student") {
      const { data: result, error } = await supabase
        .from("promotion_students")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, data: result });
    }

    if (action === "list_promotions") {
      const { data: result, error } = await supabase
        .from("promotions")
        .select("*")
        .order("created_date", { ascending: false })
        .limit(data?.limit || 500);

      if (error) throw error;
      return NextResponse.json({ ok: true, data: result || [] });
    }

    if (action === "list_promotion_students") {
      let query = supabase.from("promotion_students").select("*");
      if (data?.filters) {
        for (const [key, val] of Object.entries(data.filters)) {
          query = query.eq(key, val);
        }
      }
      query = query.order("id", { ascending: false }).limit(data?.limit || 1000);
      const { data: result, error } = await query;
      if (error) throw error;
      return NextResponse.json({ ok: true, data: result || [] });
    }

    if (action === "get_promotion") {
      const { data: result, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("id", data.id)
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, data: result });
    }

    if (action === "update_student") {
      const { id, ...updates } = data;
      // Filter out any non-existent columns to avoid schema cache errors
      const validStudentColumns = new Set([
        'roll_number', 'full_name_en', 'full_name_bn', 'date_of_birth',
        'father_name', 'mother_name', 'mobile_number', 'address',
        'admission_date', 'batch', 'session', 'admission_year', 'status',
        'notes', 'photo_url', 'custom_fields', 'password', 'hadiya_amount',
        'hadiya_note', 'assigned_teacher_id', 'total_pages_read',
        'full_name_ar', 'address_bn', 'address_ar', 'branch_id',
        'class_id', 'class_name', 'session_id', 'class_group_id', 'gender',
        'updated_date'
      ]);

      const safeUpdates = {};
      for (const [key, val] of Object.entries(updates)) {
        if (validStudentColumns.has(key)) {
          safeUpdates[key] = val;
        }
      }
      safeUpdates.updated_date = new Date().toISOString();

      const { data: result, error } = await supabase
        .from("students")
        .update(safeUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, data: result });
    }

    return NextResponse.json({ ok: false, message: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[admin-promotion-api] Error:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "An internal error occurred" },
      { status: 500 }
    );
  }
}

