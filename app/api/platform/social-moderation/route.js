import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-identity";
import { verifySessionToken } from "@/lib/auth-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/platform/social-moderation
 * Fetch moderation reports (Platform Admin / Owner Only)
 */
export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    const isPlatformAdmin = session?.isPlatformOwner || session?.role === "admin" || session?.role === "platform_owner";
    if (!isPlatformAdmin) {
      return NextResponse.json(
        { ok: false, error: "অননুমোদিত: শুধুমাত্র প্ল্যাটফর্ম অ্যাডমিনের এই সেকশনে প্রবেশাধিকার রয়েছে।" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending"; // 'pending' | 'resolved' | 'dismissed' | 'all'
    const targetType = searchParams.get("target_type"); // 'post' | 'comment' | 'teacher_profile'

    const adminClient = createSupabaseAdminClient();
    let query = adminClient
      .from("teacher_social_reports")
      .select("id, reporter_user_id, target_type, target_id, reason, details, status, moderated_by, moderated_at, moderation_notes, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (targetType) {
      query = query.eq("target_type", targetType);
    }

    const { data: reports, error } = await query;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const reportList = reports || [];

    // Enrich reports with target content preview for moderator context
    const enrichedReports = await Promise.all(
      reportList.map(async (rep) => {
        let targetSummary = "তথ্য পাওয়া যায়নি";
        let targetTeacherId = null;

        if (rep.target_type === "post") {
          const { data: p } = await adminClient
            .from("teacher_social_posts")
            .select("id, author_name, content_text, status, teacher_id")
            .eq("id", rep.target_id)
            .maybeSingle();

          if (p) {
            targetSummary = `পোস্ট (${p.author_name}): "${p.content_text?.slice(0, 80) || "ছবি/ভিডিও"}" [স্ট্যাটাস: ${p.status}]`;
            targetTeacherId = p.teacher_id;
          }
        } else if (rep.target_type === "comment") {
          const { data: c } = await adminClient
            .from("teacher_social_comments")
            .select("id, user_name, comment_text, status")
            .eq("id", rep.target_id)
            .maybeSingle();

          if (c) {
            targetSummary = `মন্তব্য (${c.user_name}): "${c.comment_text?.slice(0, 80)}" [স্ট্যাটাস: ${c.status}]`;
          }
        } else if (rep.target_type === "teacher_profile") {
          const { data: t } = await adminClient
            .from("teacher_marketplace_profiles")
            .select("id, teacher_id, name_bn, status")
            .or(`id.eq.${rep.target_id},teacher_id.eq.${rep.target_id}`)
            .maybeSingle();

          if (t) {
            targetSummary = `শিক্ষক প্রোফাইল: ${t.name_bn} [স্ট্যাটাস: ${t.status}]`;
            targetTeacherId = t.teacher_id;
          }
        }

        return {
          ...rep,
          target_summary: targetSummary,
          target_teacher_id: targetTeacherId,
          // Privacy rule: Mask reporter internal UUID for display
          reporter_display: `শিক্ষার্থী (${rep.reporter_user_id?.slice(0, 8)}...)`,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      reports: enrichedReports,
      count: enrichedReports.length,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/platform/social-moderation
 * Moderate a report: dismiss, hide_content, or restore_content
 */
export async function PATCH(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    const isPlatformAdmin = session?.isPlatformOwner || session?.role === "admin" || session?.role === "platform_owner";
    if (!isPlatformAdmin) {
      return NextResponse.json(
        { ok: false, error: "অননুমোদিত: শুধুমাত্র প্ল্যাটফর্ম অ্যাডমিন মডারেশন সিদ্ধান্ত নিতে পারেন।" },
        { status: 403 }
      );
    }

    const moderatorId = session.authUserId || session.profileId || session.id;
    const moderatorName = session.name || session.full_name_bn || "প্ল্যাটফর্ম অ্যাডমিন";

    const body = await req.json().catch(() => ({}));
    const { report_id, action, notes } = body;

    if (!report_id || !action || !["dismiss", "hide_content", "restore_content"].includes(action)) {
      return NextResponse.json(
        { ok: false, error: "সঠিক report_id এবং action ('dismiss', 'hide_content', 'restore_content') প্রদান করুন।" },
        { status: 400 }
      );
    }

    const adminClient = createSupabaseAdminClient();

    // Fetch report
    const { data: report, error: fetchError } = await adminClient
      .from("teacher_social_reports")
      .select("*")
      .eq("id", report_id)
      .maybeSingle();

    if (fetchError || !report) {
      return NextResponse.json({ ok: false, error: "রিপোর্টটি পাওয়া যায়নি।" }, { status: 404 });
    }

    // Invariant: Teachers must not moderate reports against their own account
    if (session.teacher_id && report.target_type === "teacher_profile" && report.target_id === session.teacher_id) {
      return NextResponse.json(
        { ok: false, error: "নিরাপত্তা নীতি: শিক্ষকগণ নিজেদের বিরুদ্ধে উত্থাপিত রিপোর্ট মডারেট করতে পারবেন না।" },
        { status: 403 }
      );
    }

    let newReportStatus = "reviewed";

    if (action === "dismiss") {
      newReportStatus = "dismissed";
    } else if (action === "hide_content") {
      newReportStatus = "resolved_violation";

      // Hide reported post or comment
      if (report.target_type === "post") {
        await adminClient
          .from("teacher_social_posts")
          .update({ status: "hidden", updated_at: new Date().toISOString() })
          .eq("id", report.target_id);
      } else if (report.target_type === "comment") {
        await adminClient
          .from("teacher_social_comments")
          .update({ status: "hidden", updated_at: new Date().toISOString() })
          .eq("id", report.target_id);
      }
    } else if (action === "restore_content") {
      newReportStatus = "restored";

      if (report.target_type === "post") {
        await adminClient
          .from("teacher_social_posts")
          .update({ status: "published", updated_at: new Date().toISOString() })
          .eq("id", report.target_id);
      } else if (report.target_type === "comment") {
        await adminClient
          .from("teacher_social_comments")
          .update({ status: "active", updated_at: new Date().toISOString() })
          .eq("id", report.target_id);
      }
    }

    // Update report resolution metadata
    const { error: updateError } = await adminClient
      .from("teacher_social_reports")
      .update({
        status: newReportStatus,
        moderated_by: moderatorId,
        moderation_notes: `${action}: ${notes || "মডারেটরের চূড়ান্ত সিদ্ধান্ত"} (বাই: ${moderatorName})`,
        moderated_at: new Date().toISOString(),
      })
      .eq("id", report_id);

    if (updateError) {
      return NextResponse.json({ ok: false, error: "মডারেশন সংরক্ষণ ব্যর্থ।" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: action === "dismiss" ? "রিপোর্টটি সফলভাবে খারিজ করা হয়েছে।" : "কনটেন্ট সফলভাবে মডারেট করা হয়েছে।",
      status: newReportStatus,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

