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
      const { data: result, error } = await supabase
        .from("students")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, data: result });
    }

    return NextResponse.json({ ok: false, message: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "An internal error occurred" }, { status: 500 });
  }
}
