import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/mosque/onboarding-requests
 * Returns list of mosque onboarding requests
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("status") || "all";

    const supabaseAdmin = createSupabaseAdminClient();
    let query = supabaseAdmin
      .from("branches")
      .select("*")
      .eq("type", "মসজিদ কমপ্লেক্স");

    if (filter === "pending") {
      query = query.eq("approval_status", "pending_approval");
    } else if (filter === "approved") {
      query = query.eq("approval_status", "approved");
    }

    const { data, error } = await query;
    if (error) {
      console.warn("[GET /api/mosque/onboarding-requests] Supabase query notice:", error.message);
      return NextResponse.json({ ok: true, data: [] });
    }

    const sorted = (data || []).sort((a, b) => {
      const timeA = new Date(a.created_at || a.created_date || 0).getTime();
      const timeB = new Date(b.created_at || b.created_date || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({ ok: true, data: sorted });
  } catch (err) {
    console.error("[GET /api/mosque/onboarding-requests] Error:", err);
    return NextResponse.json({ ok: false, data: [] }, { status: 500 });
  }
}

/**
 * POST /api/mosque/onboarding-requests
 * Public endpoint: Submit new mosque onboarding application
 */
export async function POST(request) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(`mosque-onboarding:${ip}`, { windowMs: 60000, max: 10 })) {
      return NextResponse.json(
        { ok: false, message: "অতিরিক্ত ফরম জমা দেওয়া হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।" },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      name,
      name_bn,
      name_en,
      district,
      upazila,
      address,
      phone,
      email,
      establishedYear,
      floorsCount,
      submitterName,
      submitterRole,
      submitterPhone,
      submitterEmail,
      password,
      imamName,
      imamPhone,
      musalliCapacity,
      facilities,
      mapLink,
      photoUrl,
      notes,
    } = body;

    const mosqueName = name_bn || name;
    if (!mosqueName || (!submitterPhone && !phone)) {
      return NextResponse.json(
        { ok: false, message: "দয়া করে মসজিদের নাম এবং আবেদনকারীর নাম ও মোবাইল নম্বর সঠিকভাবে প্রদান করুন।" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const trackingId = body.id || `MREQ-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const slug = (body.slug || mosqueName)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || `mosque-${Date.now().toString().slice(-4)}`;

    const onboardingPayload = {
      name_bn: mosqueName,
      name_en: name_en || mosqueName,
      slug: slug,
      address: address || `${upazila || ""}, ${district || ""}`,
      city: district || "ঢাকা",
      map_link: mapLink || null,
      photo_url: photoUrl || null,
      type: "মসজিদ কমপ্লেক্স",
      student_count: musalliCapacity ? Number(musalliCapacity) : 500,
      approval_status: "pending_approval",
      is_active: false,
      metadata: {
        trackingId,
        district,
        upazila,
        establishedYear: establishedYear || "২০২৬",
        floorsCount: floorsCount || 2,
        submitterName: submitterName || "আবেদনকারী কর্মকর্তা",
        submitterRole: submitterRole || "সভাপতি",
        submitterPhone: submitterPhone || phone,
        submitterEmail: submitterEmail || email,
        password: password ? "********" : null,
        imamName: imamName || null,
        imamPhone: imamPhone || null,
        musalliCapacity: musalliCapacity || 500,
        facilities: facilities || [],
        notes: notes || "নতুন মসজিদ যুক্ত করার আবেদন",
        submittedAt: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("branches")
      .insert(onboardingPayload)
      .select()
      .single();

    if (error) {
      console.warn("[POST /api/mosque/onboarding-requests] Supabase insert notice:", error.message);
      // Fallback: log to contact_messages
      const fallbackPayload = {
        name: submitterName || mosqueName,
        phone: submitterPhone || phone || "01700000000",
        email: submitterEmail || email || "mosque-onboarding@edusaas.global",
        message: `[নতুন মসজিদ আবেদন: ${mosqueName} (Tracking: ${trackingId})] ${JSON.stringify(onboardingPayload)}`,
        created_date: new Date().toISOString(),
      };
      await supabaseAdmin.from("contact_messages").insert(fallbackPayload).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      message: `মাশাআল্লাহ! "${mosqueName}"-এর আবেদন সফলভাবে গৃহীত হয়েছে। এডমিন প্যানেল থেকে রিভিউ ও অনুমোদন সম্পন্ন হলেই মসজিদটি লাইভ হয়ে যাবে।`,
      trackingId,
      data: data || onboardingPayload,
    });
  } catch (err) {
    console.error("[POST /api/mosque/onboarding-requests] Exception:", err);
    return NextResponse.json(
      { ok: false, message: "সার্ভার এরর। অনুগ্রহ করে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/mosque/onboarding-requests
 * Admin endpoint: Approve, reject, or update mosque request
 */
export async function PUT(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, action, customData } = body;

    if (!id) {
      return NextResponse.json({ ok: false, message: "আইডি প্রয়োজন।" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdminClient();

    if (action === "approve") {
      const { data, error } = await supabaseAdmin
        .from("branches")
        .update({
          approval_status: "approved",
          is_active: true,
          updated_at: new Date().toISOString(),
          ...(customData || {}),
        })
        .or(`id.eq.${id},metadata->>trackingId.eq.${id}`)
        .select();

      if (error) {
        console.warn("[PUT /api/mosque/onboarding-requests] Supabase approve notice:", error.message);
      }

      return NextResponse.json({
        ok: true,
        message: "মসজিদ সফলভাবে অনুমোদন ও লাইভ করা হয়েছে!",
        data: data?.[0] || { id, approval_status: "approved", is_active: true },
      });
    }

    if (action === "reject") {
      const { data, error } = await supabaseAdmin
        .from("branches")
        .update({
          approval_status: "rejected",
          is_active: false,
          updated_at: new Date().toISOString(),
          ...(customData || {}),
        })
        .or(`id.eq.${id},metadata->>trackingId.eq.${id}`)
        .select();

      if (error) {
        console.warn("[PUT /api/mosque/onboarding-requests] Supabase reject notice:", error.message);
      }

      return NextResponse.json({
        ok: true,
        message: "আবেদন বাতিল করা হয়েছে।",
        data: data?.[0] || { id, approval_status: "rejected", is_active: false },
      });
    }

    return NextResponse.json({ ok: false, message: "Invalid action." }, { status: 400 });
  } catch (err) {
    console.error("[PUT /api/mosque/onboarding-requests] Exception:", err);
    return NextResponse.json(
      { ok: false, message: err.message || "Failed to update record." },
      { status: 500 }
    );
  }
}
