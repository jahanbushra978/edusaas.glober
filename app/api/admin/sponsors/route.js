import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin.js";
import { cookies } from "next/headers";
import { verifySessionToken } from "../../../../src/lib/auth-session";
import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";
import { verifyCsrfOrigin, getClientIp } from "../../../../src/lib/security";
import { checkRateLimit } from "../../../../src/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  if (!session || session.role !== "admin") return null;
  return session;
}

export async function POST(request) {
  if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }
  if (!checkRateLimit(`admin-sponsors:${getClientIp(request)}`, { windowMs: 60000, max: 60 })) {
    return NextResponse.json({ ok: false, message: "Too many requests. Please slow down." }, { status: 429 });
  }
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const body = await request.json().catch(() => ({}));
  const {
    title, title_bn, title_en, title_ar,
    company_name, company_name_bn, company_name_en, company_name_ar,
    description, description_bn, description_en, description_ar,
    image_url, target_url,
    button_text, button_text_bn, button_text_en, button_text_ar,
    priority, start_date, end_date, is_active
  } = body;

  if (!title && !title_bn && !title_en && !title_ar) {
    return NextResponse.json(
      { ok: false, message: "সponsors এর নাম / টাইটেল প্রয়োজন" },
      { status: 400 }
    );
  }

  const fallbackTitle = title || title_bn || title_en || title_ar;
  const fallbackCompanyName = company_name || company_name_bn || company_name_en || company_name_ar || null;
  const fallbackDescription = description || description_bn || description_en || description_ar || null;
  const fallbackButtonText = button_text || button_text_bn || button_text_en || button_text_ar || "বিস্তারিত দেখুন";

  const payload = {
    title: fallbackTitle,
    title_bn: title_bn || fallbackTitle || "",
    title_en: title_en || "",
    title_ar: title_ar || "",
    company_name: fallbackCompanyName,
    company_name_bn: company_name_bn || fallbackCompanyName || "",
    company_name_en: company_name_en || "",
    company_name_ar: company_name_ar || "",
    description: fallbackDescription,
    description_bn: description_bn || fallbackDescription || "",
    description_en: description_en || "",
    description_ar: description_ar || "",
    image_url: image_url || null,
    target_url: target_url || null,
    button_text: fallbackButtonText,
    button_text_bn: button_text_bn || fallbackButtonText || "বিস্তারিত দেখুন",
    button_text_en: button_text_en || "",
    button_text_ar: button_text_ar || "",
    priority: Number(priority) || 0,
    start_date: start_date ? new Date(start_date).toISOString() : null,
    end_date: end_date ? new Date(end_date).toISOString() : null,
    is_active: is_active !== undefined ? Boolean(is_active) : true,
    total_views: 0,
    total_clicks: 0,
  };

  try {
    const { data: inserted, error } = await supabaseAdmin
      .from("sponsors")
      .insert(payload)
      .select(
        "id, title, title_bn, title_en, title_ar, company_name, company_name_bn, company_name_en, company_name_ar, " +
        "description, description_bn, description_en, description_ar, image_url, target_url, button_text, button_text_bn, button_text_en, button_text_ar, " +
        "priority, start_date, end_date, is_active, total_views, total_clicks, created_at"
      )
      .single();

    if (error) {
      console.error("[Admin Sponsors] Insert error:", error);
      return NextResponse.json(
        { ok: false, message: "Sponsors create failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, message: "স্পনসর সফলভাবে যোগ করা হয়েছে!", data: inserted },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Admin Sponsors] Exception:", error);
    return NextResponse.json(
      { ok: false, message: "An internal error occurred while creating sponsor" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }
  if (!checkRateLimit(`admin-sponsors:${getClientIp(request)}`, { windowMs: 60000, max: 60 })) {
    return NextResponse.json({ ok: false, message: "Too many requests. Please slow down." }, { status: 429 });
  }
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const body = await request.json().catch(() => ({}));
  const {
    id,
    title, title_bn, title_en, title_ar,
    company_name, company_name_bn, company_name_en, company_name_ar,
    description, description_bn, description_en, description_ar,
    image_url, target_url,
    button_text, button_text_bn, button_text_en, button_text_ar,
    priority, start_date, end_date, is_active
  } = body;

  if (!id) {
    return NextResponse.json(
      { ok: false, message: "Sponsors id প্রয়োজন" },
      { status: 400 }
    );
  }

  const updatePayload = {};
  if (title !== undefined) updatePayload.title = title;
  if (title_bn !== undefined) updatePayload.title_bn = title_bn;
  if (title_en !== undefined) updatePayload.title_en = title_en;
  if (title_ar !== undefined) updatePayload.title_ar = title_ar;
  if (company_name !== undefined) updatePayload.company_name = company_name;
  if (company_name_bn !== undefined) updatePayload.company_name_bn = company_name_bn;
  if (company_name_en !== undefined) updatePayload.company_name_en = company_name_en;
  if (company_name_ar !== undefined) updatePayload.company_name_ar = company_name_ar;
  if (description !== undefined) updatePayload.description = description;
  if (description_bn !== undefined) updatePayload.description_bn = description_bn;
  if (description_en !== undefined) updatePayload.description_en = description_en;
  if (description_ar !== undefined) updatePayload.description_ar = description_ar;
  if (image_url !== undefined) updatePayload.image_url = image_url;
  if (target_url !== undefined) updatePayload.target_url = target_url;
  if (button_text !== undefined) updatePayload.button_text = button_text;
  if (button_text_bn !== undefined) updatePayload.button_text_bn = button_text_bn;
  if (button_text_en !== undefined) updatePayload.button_text_en = button_text_en;
  if (button_text_ar !== undefined) updatePayload.button_text_ar = button_text_ar;
  if (priority !== undefined) updatePayload.priority = Number(priority) || 0;
  if (start_date !== undefined) updatePayload.start_date = start_date ? new Date(start_date).toISOString() : null;
  if (end_date !== undefined) updatePayload.end_date = end_date ? new Date(end_date).toISOString() : null;
  if (is_active !== undefined) updatePayload.is_active = Boolean(is_active);

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json(
      { ok: false, message: "আপডেট করার জন্য কোনো ডেটা প্রদান করা হয়নি" },
      { status: 400 }
    );
  }

  try {
    updatePayload.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabaseAdmin
      .from("sponsors")
      .update(updatePayload)
      .eq("id", id)
      .select(
        "id, title, title_bn, title_en, title_ar, company_name, company_name_bn, company_name_en, company_name_ar, " +
        "description, description_bn, description_en, description_ar, image_url, target_url, button_text, button_text_bn, button_text_en, button_text_ar, " +
        "priority, start_date, end_date, is_active, total_views, total_clicks, created_at"
      )
      .single();

    if (error) {
      console.error("[Admin Sponsors] Update error:", error);
      return NextResponse.json(
        { ok: false, message: "Sponsors update failed" },
        { status: 500 }
      );
    }

    if (!updated) {
      return NextResponse.json(
        { ok: false, message: "Sponsors দেয়া হয়েছে" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, message: "স্পনসর আপডেট হয়েছে!", data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Admin Sponsors] Exception:", error);
    return NextResponse.json(
      { ok: false, message: "An internal error occurred while updating sponsor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }
  if (!checkRateLimit(`admin-sponsors:${getClientIp(request)}`, { windowMs: 60000, max: 60 })) {
    return NextResponse.json({ ok: false, message: "Too many requests. Please slow down." }, { status: 429 });
  }
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const body = await request.json().catch(() => ({}));
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { ok: false, message: "Sponsors id প্রয়োজন" },
      { status: 400 }
    );
  }

  try {
    const { data: deleted, error } = await supabaseAdmin
      .from("sponsors")
      .delete()
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      console.error("[Admin Sponsors] Delete error:", error);
      return NextResponse.json(
        { ok: false, message: "Sponsors delete failed" },
        { status: 500 }
      );
    }

    if (!deleted) {
      return NextResponse.json(
        { ok: false, message: "Sponsors দেয়া হয়েছে" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, message: "স্পনসর মুছে ফেলা হয়েছে" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Admin Sponsors] Exception:", error);
    return NextResponse.json(
      { ok: false, message: "An internal error occurred while deleting sponsor" },
      { status: 500 }
    );
  }
}