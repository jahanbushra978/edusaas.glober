import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-identity";
import { verifySessionToken } from "@/lib/auth-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isUuid = (val) =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

/**
 * Server-side helper to verify authenticated session and resolve caller profile.
 */
async function resolveCallerIdentity(session, adminClient) {
  if (!session || !session.role) return null;

  const authUserId = session.authUserId || session.profileId || session.id;
  if (!authUserId) return null;

  if (session.role === "teacher") {
    let teacherProfile = null;
    if (adminClient) {
      const q = adminClient
        .from("teacher_marketplace_profiles")
        .select("id, teacher_id, name_bn, status, user_id");

      const { data } = isUuid(authUserId)
        ? await q.or(`user_id.eq.${authUserId},teacher_id.eq.${authUserId},id.eq.${authUserId}`).maybeSingle()
        : await q.eq("teacher_id", authUserId).maybeSingle();

      teacherProfile = data;
    }
    return {
      role: "teacher",
      userId: authUserId,
      teacherId: teacherProfile?.teacher_id || teacherProfile?.id || session.teacherId || authUserId,
      teacherProfileId: teacherProfile?.id || authUserId,
      nameBn: teacherProfile?.name_bn || session.nameBn || session.name || "উস্তাদ",
      status: teacherProfile?.status || "approved",
      isApproved: (teacherProfile?.status || "approved") === "approved",
    };
  }

  if (session.role === "student") {
    let studentProfile = null;
    if (adminClient) {
      const q = adminClient
        .from("public_student_profiles")
        .select("id, student_public_id, display_name, username, user_id");

      const { data } = isUuid(authUserId)
        ? await q.or(`user_id.eq.${authUserId},id.eq.${authUserId}`).maybeSingle()
        : await q.eq("student_public_id", authUserId).maybeSingle();

      studentProfile = data;
    }
    return {
      role: "student",
      userId: authUserId,
      studentId: studentProfile?.id || authUserId,
      studentPublicId: studentProfile?.student_public_id || session.studentPublicId || `STU-${authUserId.slice(0, 6)}`,
      name: studentProfile?.display_name || session.full_name_bn || session.name || "শিক্ষার্থী",
    };
  }

  if (session.role === "platform_owner" || session.role === "admin") {
    return {
      role: "admin",
      userId: authUserId,
      name: session.name || "অ্যাডমিন",
      isAdmin: true,
    };
  }

  return null;
}

/**
 * Checks whether the verified caller is an authorized participant of the group.
 */
function isGroupParticipant(caller, group) {
  if (!caller || !group) return false;
  if (caller.isAdmin) return true;

  if (caller.role === "teacher") {
    return (
      group.teacher_id === caller.userId ||
      group.teacher_id === caller.teacherId ||
      group.teacher_id === caller.teacherProfileId
    );
  }

  if (caller.role === "student") {
    return (
      group.student_id === caller.userId ||
      group.student_id === caller.studentId ||
      group.student_id === caller.studentPublicId
    );
  }

  return false;
}

/**
 * GET /api/teacher-marketplace/connections/messages?groupId=...
 * Fetch private group chat messages, resources, and lesson notes.
 * Strictly requires authenticated session and verified group membership.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json({ ok: false, error: "groupId is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || !session.role) {
      return NextResponse.json(
        { ok: false, error: "Authentication required to access private group messages" },
        { status: 401 }
      );
    }

    const adminClient = createSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json({ ok: true, messages: [] });
    }

    const caller = await resolveCallerIdentity(session, adminClient);
    if (!caller) {
      return NextResponse.json({ ok: false, error: "Invalid user session identity" }, { status: 401 });
    }

    // 1. Verify group exists
    const { data: group, error: groupErr } = await adminClient
      .from("learning_assistant_groups")
      .select("*")
      .eq("id", groupId)
      .maybeSingle();

    if (groupErr || !group) {
      return NextResponse.json({ ok: false, error: "Learning group not found" }, { status: 404 });
    }

    // 2. Strict membership check (Anti-IDOR)
    if (!isGroupParticipant(caller, group)) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: You are not a member of this private learning group" },
        { status: 403 }
      );
    }

    // 3. Fetch messages in chronological order
    const { data: messages, error: msgErr } = await adminClient
      .from("learning_group_messages")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (msgErr) {
      return NextResponse.json({ ok: true, messages: [] });
    }

    const normalizedMessages = (messages || []).map((m) => {
      const text = m.content || m.message_text || "";
      const meta = (typeof m.metadata === "object" && m.metadata !== null && Object.keys(m.metadata).length > 0)
        ? m.metadata
        : (typeof m.payload === "object" && m.payload !== null) ? m.payload : {};
      return {
        ...m,
        content: text,
        message_text: text,
        metadata: meta,
        payload: meta,
      };
    });

    return NextResponse.json({
      ok: true,
      group,
      messages: normalizedMessages,
    });
  } catch (err) {
    console.error("GET group messages error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/teacher-marketplace/connections/messages
 * Post a new private message, resource link, or lesson note in the group.
 * Strictly derives sender identity from verified session (no client spoofing).
 */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || !session.role) {
      return NextResponse.json(
        { ok: false, error: "Authentication required to post in private groups" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { groupId, content, messageType = "text", metadata = {} } = body;

    if (!groupId) {
      return NextResponse.json({ ok: false, error: "groupId is required" }, { status: 400 });
    }

    const cleanContent = typeof content === "string" ? content.trim() : "";
    if (!cleanContent) {
      return NextResponse.json({ ok: false, error: "Message content cannot be empty" }, { status: 400 });
    }

    if (cleanContent.length > 2000) {
      return NextResponse.json({ ok: false, error: "Message content cannot exceed 2000 characters" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json({ ok: false, error: "Database client unavailable" }, { status: 503 });
    }

    const caller = await resolveCallerIdentity(session, adminClient);
    if (!caller) {
      return NextResponse.json({ ok: false, error: "Invalid user session identity" }, { status: 401 });
    }

    // 1. Verify group exists
    const { data: group } = await adminClient
      .from("learning_assistant_groups")
      .select("id, teacher_id, student_id, is_active")
      .eq("id", groupId)
      .maybeSingle();

    if (!group) {
      return NextResponse.json({ ok: false, error: "Group not found" }, { status: 404 });
    }

    // 2. Strict membership check (Anti-IDOR)
    if (!isGroupParticipant(caller, group)) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: You cannot post to this private group" },
        { status: 403 }
      );
    }

    // 3. Server-derived sender identity (Never trust client body)
    let verifiedSenderId = caller.userId;
    let verifiedSenderRole = caller.role;
    let verifiedSenderName = caller.name || "অংশগ্রহণকারী";

    if (caller.role === "teacher") {
      verifiedSenderId = group.teacher_id;
      verifiedSenderRole = "teacher";
      verifiedSenderName = caller.nameBn || caller.name || "উস্তাদ";
    } else if (caller.role === "student") {
      verifiedSenderId = group.student_id;
      verifiedSenderRole = "student";
      verifiedSenderName = caller.name || "শিক্ষার্থী";
    }

    const allowedTypes = ["text", "resource_link", "lesson_note", "quran_reference", "audio"];
    const sanitizedType = allowedTypes.includes(messageType) ? messageType : "text";

    const insertPayload = {
      group_id: groupId,
      sender_id: verifiedSenderId,
      sender_role: verifiedSenderRole,
      sender_name: verifiedSenderName,
      message_type: sanitizedType,
      content: cleanContent,
      message_text: cleanContent,
      metadata: typeof metadata === "object" && metadata !== null ? metadata : {},
      payload: typeof metadata === "object" && metadata !== null ? metadata : {},
      created_at: new Date().toISOString(),
    };

    const { data: newMsg, error: insertErr } = await adminClient
      .from("learning_group_messages")
      .insert(insertPayload)
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: newMsg });
  } catch (err) {
    console.error("POST group message error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
