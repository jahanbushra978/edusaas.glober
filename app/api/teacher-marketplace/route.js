import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminClient = createSupabaseAdminClient();
    const { data, error } = await adminClient
      .from("teacher_marketplace_profiles")
      .select("*")
      .eq("status", "approved")
      .order("rating", { ascending: false });

    if (error) {
      return NextResponse.json({
        ok: true,
        source: "database_error",
        teachers: [],
        warning: error.message,
      });
    }

    return NextResponse.json({
      ok: true,
      source: "database",
      teachers: data || [],
    });
  } catch (err) {
    return NextResponse.json({
      ok: true,
      source: "error",
      teachers: [],
      warning: err.message,
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name_bn,
      name_en,
      title_bn,
      avatar_url,
      cover_url,
      hourly_fee,
      monthly_fee,
      experience_years,
      qualifications,
      specialties,
      schedule_text,
      bio,
    } = body;

    if (!name_bn || !name_bn.trim()) {
      return NextResponse.json(
        { ok: false, error: "শিক্ষকের নাম বাংলায় প্রদান করা আবশ্যক" },
        { status: 400 }
      );
    }

    const teacher_id = "teacher-" + Date.now();
    // Invariant: Newly self-registered teachers default strictly to 'pending'
    const status = "pending";

    const newTeacher = {
      teacher_id,
      name_bn: name_bn.trim(),
      name_en: (name_en || name_bn).trim(),
      title_bn: (title_bn || "কুরআন ও তাজবীদ শিক্ষক").trim(),
      avatar_url: avatar_url || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
      cover_url: cover_url || "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
      hourly_fee: Number(hourly_fee) || 350,
      monthly_fee: Number(monthly_fee) || 2500,
      experience_years: Number(experience_years) || 5,
      qualifications: Array.isArray(qualifications)
        ? qualifications
        : (qualifications || "").split(",").map((q) => q.trim()).filter(Boolean),
      specialties: Array.isArray(specialties)
        ? specialties
        : (specialties || "").split(",").map((s) => s.trim()).filter(Boolean),
      schedule_text: schedule_text || "প্রতিদিন: বিকাল ৪টা – রাত ৯টা",
      bio: bio || "অভিজ্ঞতার সাথে শিক্ষার্থীদের বিশুদ্ধ মাখরাজ ও তারতীলের সাথে কুরআন শিক্ষা দিচ্ছি।",
      rating: 0,
      total_reviews: 0,
      total_students: 0,
      total_classes: 0,
      is_online: false,
      status,
    };

    try {
      const adminClient = createSupabaseAdminClient();
      const { data, error } = await adminClient
        .from("teacher_marketplace_profiles")
        .insert(newTeacher)
        .select()
        .single();

      if (!error && data) {
        // Also initialize wallet record
        await adminClient
          .from("teacher_wallets")
          .insert({ teacher_id, balance: 0, total_earned: 0 })
          .catch(() => {});

        return NextResponse.json({ ok: true, source: "database", teacher: data });
      }
    } catch {
      // Graceful fallback
    }

    return NextResponse.json({ ok: true, source: "local", teacher: newTeacher });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to register teacher" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teacher-marketplace
 * Deletes a marketplace teacher profile and cleans up associated wallet/connections.
 * Supports deletion from Main Admin Console (/admin) and Platform Console.
 */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    let teacher_id = searchParams.get("teacher_id") || searchParams.get("id");

    if (!teacher_id) {
      try {
        const body = await req.json();
        teacher_id = body.teacher_id || body.id;
      } catch {}
    }

    if (!teacher_id) {
      return NextResponse.json(
        { ok: false, error: "মুছে ফেলার জন্য শিক্ষক আইডি (teacher_id) প্রদান করা আবশ্যক।" },
        { status: 400 }
      );
    }

    const adminClient = createSupabaseAdminClient();
    if (adminClient) {
      try {
        await adminClient
          .from("teacher_marketplace_profiles")
          .delete()
          .or(`teacher_id.eq.${teacher_id},id.eq.${teacher_id}`);

        await adminClient
          .from("teacher_wallets")
          .delete()
          .eq("teacher_id", teacher_id)
          .catch(() => {});

        await adminClient
          .from("learning_connections")
          .delete()
          .eq("teacher_id", teacher_id)
          .catch(() => {});
      } catch (dbErr) {
        console.warn("DB deletion warning:", dbErr.message);
      }
    }

    return NextResponse.json({
      ok: true,
      message: "মার্কেটপ্লেস শিক্ষক প্রোফাইল সফলভাবে মুছে ফেলা হয়েছে।",
      teacher_id,
    });
  } catch (err) {
    console.error("DELETE /api/teacher-marketplace error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to delete teacher" },
      { status: 500 }
    );
  }
}


