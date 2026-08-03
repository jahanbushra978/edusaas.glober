import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(`public-onboarding:${ip}`, { windowMs: 60000, max: 5 })) {
      return NextResponse.json(
        { ok: false, message: "অতিরিক্ত ফরম জমা দেওয়া হয়েছে। অনুগ্রহ করে ১ মিনিট পর চেষ্টা করুন।" },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      name,
      division,
      district,
      upazila,
      address,
      photoUrl,
      establishedYear,
      mapLink,
      founder,
      foundingPrincipal,
      foundingSecretary,
      foundingTeachers,
      foundingStats,
      alumniInfo,
      socialImpact,
      gloriousHistory,
      futurePlan,
      boardAffiliation,
      accountsFundInfo,
      currentPrincipal,
      currentPrincipalPhone,
      currentSecretary,
      currentTeachersList,
      totalStudents,
      dawraStudents,
      hostelStudents,
      seoTitle,
      seoDescription,
      seoKeywords,
      submitterName,
      submitterPhone,
      submitterEmail,
    } = body;

    if (!name || (!submitterPhone && !submitterName)) {
      return NextResponse.json(
        { ok: false, message: "দয়া করে প্রতিষ্ঠানের নাম এবং আপনার নাম ও মোবাইল নম্বর সঠিকভাবে প্রদান করুন।" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const slug = String(name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || `inst-${Date.now()}`;

    const onboardingPayload = {
      name_bn: name,
      name_en: name,
      slug: slug,
      address: address || `${upazila || ""}, ${district || ""}`,
      city: district || "ঢাকা",
      map_link: mapLink || null,
      photo_url: photoUrl || null,
      type: "দ্বীনি ও আধুনিক শিক্ষা",
      student_count: totalStudents ? Number(totalStudents) : 0,
      approval_status: "pending_approval", // Pending admin approval
      metadata: {
        division,
        district,
        upazila,
        establishedYear,
        founder,
        foundingPrincipal,
        foundingSecretary,
        foundingTeachers,
        foundingStats,
        alumniInfo,
        socialImpact,
        gloriousHistory,
        futurePlan,
        boardAffiliation,
        accountsFundInfo,
        currentPrincipal,
        currentPrincipalPhone,
        currentSecretary,
        currentTeachersList,
        totalStudents,
        dawraStudents,
        hostelStudents,
        seoTitle: seoTitle || `${name} — অফিসিয়াল ওয়েবসাইট`,
        seoDescription: seoDescription || `${name} এর অনলাইন পোর্টাল ও ভর্তি সংক্রান্ত তথ্য।`,
        seoKeywords: seoKeywords || `${name}, মাদরাসা ওয়েবসাইট, ভর্তি`,
        submitterName,
        submitterPhone,
        submitterEmail,
        submittedAt: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    };

    // Store in branches or contact_messages
    const { data, error } = await supabaseAdmin
      .from("branches")
      .insert(onboardingPayload)
      .select()
      .single();

    if (error) {
      console.error("[POST /api/onboarding-requests] Supabase error:", error);
      // Fallback: save to contact_messages table as structured submission
      const fallbackPayload = {
        name: submitterName || name,
        phone: submitterPhone || "01576600265",
        email: submitterEmail || "onboarding@edusaas.global",
        message: `[অনলাইন ওয়েবসাইট রিকোয়েস্ট: ${name}] ${JSON.stringify(onboardingPayload)}`,
        created_date: new Date().toISOString(),
      };
      await supabaseAdmin.from("contact_messages").insert(fallbackPayload);
    }

    return NextResponse.json({
      ok: true,
      message: "আপনার প্রতিষ্ঠানের তথ্য সফলভাবে জমা হয়েছে! আমাদের এডমিন প্যানেল থেকে রিভিউ ও এপ্রুভ করলেই আপনার ওয়েবসাইটটি লাইভ হয়ে যাবে।",
      data: data || onboardingPayload,
    });
  } catch (err) {
    console.error("[POST /api/onboarding-requests] Exception:", err);
    return NextResponse.json(
      { ok: false, message: "সার্ভার এরর। অনুগ্রহ করে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("branches")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, data: data || [] });
  } catch (err) {
    console.error("[GET /api/onboarding-requests] Error:", err);
    return NextResponse.json({ ok: false, data: [] }, { status: 500 });
  }
}
