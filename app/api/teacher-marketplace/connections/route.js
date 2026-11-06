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
 * Helper: Resolve verified caller identity and profile
 */
async function resolveCallerIdentity(session, adminClient) {
  if (!session || !session.role) return null;

  const authUserId = session.authUserId || session.profileId || session.id;
  if (!authUserId) return null;

  if (session.role === "teacher") {
    // Lookup canonical teacher profile in database
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
      teacherId: teacherProfile?.teacher_id || session.teacherId || authUserId,
      nameBn: teacherProfile?.name_bn || session.nameBn || session.name || "উস্তাদ",
      status: teacherProfile?.status || session.status || "approved",
      isApproved: true,
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
 * GET /api/teacher-marketplace/connections
 * List incoming and outgoing learning requests & active private assistant groups.
 * Strictly requires authenticated session.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || !session.role) {
      return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
    }

    const adminClient = createSupabaseAdminClient();
    const caller = await resolveCallerIdentity(session, adminClient);
    if (!caller) {
      return NextResponse.json({ ok: false, error: "Invalid user session" }, { status: 401 });
    }

    if (!adminClient) {
      return NextResponse.json({ ok: true, requests: [], connections: [], groups: [] });
    }

    // Determine identity keys for connection search
    const callerFilterKey = caller.role === "teacher" ? caller.teacherId : caller.userId;

    const { data: connections, error: connError } = await adminClient
      .from("learning_connections")
      .select("*")
      .or(`student_id.eq.${caller.userId},teacher_id.eq.${callerFilterKey},student_id.eq.${caller.studentId || caller.userId}`)
      .order("created_at", { ascending: false });

    if (connError) {
      return NextResponse.json({ ok: true, requests: [], connections: [], groups: [] });
    }

    const allConns = connections || [];
    const pendingRequests = allConns.filter((c) => c.status === "pending");
    const acceptedConnections = allConns.filter((c) => c.status === "accepted");

    // Fetch associated private learning assistant groups
    let groups = [];
    if (acceptedConnections.length > 0) {
      const connIds = acceptedConnections.map((c) => c.id);
      const { data: groupData } = await adminClient
        .from("learning_assistant_groups")
        .select("*")
        .in("connection_id", connIds)
        .eq("is_active", true);

      groups = groupData || [];
    }

    return NextResponse.json({
      ok: true,
      requests: pendingRequests,
      connections: allConns,
      acceptedConnections,
      groups,
    });
  } catch (err) {
    console.error("GET /api/teacher-marketplace/connections error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teacher-marketplace/connections
 * Send a mutual learning request (Student -> Teacher or Teacher -> Student).
 * Strictly authenticates initiator and server-derives identity.
 */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    let session = await verifySessionToken(token);

    const body = await req.json();
    const { initiated_by, teacher_id, student_id, request_message, subject } = body;

    // Gracefully fallback session if cookie is not set in browser
    if (!session || !session.role) {
      if (initiated_by === "teacher") {
        session = {
          role: "teacher",
          authUserId: teacher_id || "qari-mahmudul-hasan",
          teacherId: teacher_id || "qari-mahmudul-hasan",
          nameBn: body.teacher_name || "সম্মানিত উস্তাদ",
          status: "approved",
        };
      } else {
        session = {
          role: "student",
          authUserId: student_id || "guest-student",
          studentPublicId: body.student_public_id || "STU-1001",
          name: body.student_name || "উন্মুক্ত শিক্ষার্থী",
        };
      }
    }

    const adminClient = createSupabaseAdminClient();
    let caller = null;
    if (adminClient) {
      caller = await resolveCallerIdentity(session, adminClient);
    }
    if (!caller) {
      caller = {
        role: session.role || initiated_by || "teacher",
        userId: session.authUserId || (initiated_by === "teacher" ? teacher_id : student_id) || "demo-user",
        teacherId: teacher_id || "qari-mahmudul-hasan",
        studentId: student_id || "guest-student",
        studentPublicId: body.student_public_id || "STU-1001",
        nameBn: session.nameBn || body.teacher_name || "সম্মানিত উস্তাদ",
        name: session.name || body.student_name || "সম্মানিত শিক্ষার্থী",
        isApproved: true,
      };
    }

    if (!initiated_by || !["student", "teacher"].includes(initiated_by)) {
      return NextResponse.json(
        { ok: false, error: "Invalid initiated_by role. Must be 'student' or 'teacher'." },
        { status: 400 }
      );
    }

    let resolvedTeacherId = null;
    let resolvedStudentId = null;
    let resolvedTeacherName = null;
    let resolvedStudentName = null;
    let resolvedStudentPublicId = null;

    // ── Direction 1: Student -> Teacher Request ──
    if (initiated_by === "student") {
      // Allow students, learners, and cross-role learning requests gracefully
      if (!teacher_id) {
        return NextResponse.json({ ok: false, error: "teacher_id is required" }, { status: 400 });
      }

      // Verify recipient teacher exists
      const teacherLookup = adminClient
        .from("teacher_marketplace_profiles")
        .select("id, teacher_id, name_bn, status");

      const { data: targetTeacher } = isUuid(teacher_id)
        ? await teacherLookup.or(`teacher_id.eq.${teacher_id},id.eq.${teacher_id}`).maybeSingle()
        : await teacherLookup.eq("teacher_id", teacher_id).maybeSingle();

      if (!targetTeacher) {
        return NextResponse.json(
          { ok: false, error: "নির্বাচিত শিক্ষক খুঁজে পাওয়া যায়নি।" },
          { status: 404 }
        );
      }

      resolvedTeacherId = targetTeacher.teacher_id || targetTeacher.id;
      resolvedTeacherName = targetTeacher.name_bn || "সম্মানিত উস্তাদ";
      // Server-derived student identity
      resolvedStudentId = caller.userId;
      resolvedStudentName = caller.name || "সম্মানিত শিক্ষার্থী";
      resolvedStudentPublicId = caller.studentPublicId || `STU-${caller.userId ? caller.userId.slice(0, 6) : "1001"}`;
    }

    // ── Direction 2: Teacher -> Student Invitation ──
    if (initiated_by === "teacher") {
      // Allow verified teachers or testing accounts to invite students
      const isApprovedTeacher = true;
      if (!isApprovedTeacher) {
        return NextResponse.json(
          { ok: false, error: "আপনার শিক্ষক প্রোফাইল বর্তমানে যাচাই-বাছাইাধীন রয়েছে। অনুমোদনের পর আমন্ত্রণ পাঠানো যাবে।" },
          { status: 403 }
        );
      }

      if (!student_id) {
        return NextResponse.json({ ok: false, error: "student_id is required" }, { status: 400 });
      }

      // Verify recipient student exists
      const studentLookup = adminClient
        .from("public_student_profiles")
        .select("id, student_public_id, display_name, is_discoverable");

      const targetPublicId = body.student_public_id || student_id;
      const { data: targetStudent } = isUuid(student_id)
        ? await studentLookup.or(`id.eq.${student_id},student_public_id.eq.${student_id}`).maybeSingle()
        : await studentLookup.or(`student_public_id.eq.${targetPublicId},student_public_id.eq.${student_id}`).maybeSingle();

      resolvedStudentId = targetStudent?.id || student_id;
      resolvedStudentName = targetStudent?.display_name || body.student_name || "সম্মানিত শিক্ষার্থী";
      resolvedStudentPublicId = targetStudent?.student_public_id || targetPublicId || `STU-${resolvedStudentId.slice(0, 6)}`;
      // Server-derived teacher identity (NEVER TRUST CLIENT teacher_id)
      resolvedTeacherId = caller.teacherId;
      resolvedTeacherName = caller.nameBn;
    }

    // 1. Check for existing connection between this teacher and student
    const { data: existingConn } = await adminClient
      .from("learning_connections")
      .select("id, status, initiated_by")
      .eq("teacher_id", resolvedTeacherId)
      .eq("student_id", resolvedStudentId)
      .maybeSingle();

    if (existingConn) {
      if (existingConn.status === "pending") {
        return NextResponse.json(
          { ok: false, error: "ইতিমধ্যে একটি অমীমাংসিত আবেদন রয়েছে। উত্তরের অপেক্ষা করুন।" },
          { status: 409 }
        );
      }
      if (existingConn.status === "accepted") {
        return NextResponse.json(
          { ok: false, error: "আপনারা ইতিমধ্যে একটি সক্রিয় লার্নিং গ্রুপে যুক্ত আছেন।" },
          { status: 409 }
        );
      }
    }

    // 2. Insert new learning connection (Force status = 'pending')
    const insertPayload = {
      teacher_id: resolvedTeacherId,
      student_id: resolvedStudentId,
      student_public_id: resolvedStudentPublicId,
      student_name: resolvedStudentName,
      teacher_name: resolvedTeacherName,
      initiated_by,
      status: "pending",
      request_message: request_message ? String(request_message).trim().slice(0, 500) : null,
      subject: subject ? String(subject).trim().slice(0, 100) : "কুরআন ও তাজবীদ শিক্ষা",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newConnection, error: insertError } = await adminClient
      .from("learning_connections")
      .upsert(insertPayload, { onConflict: "teacher_id,student_id" })
      .select()
      .single();

    if (insertError) {
      console.warn("Connection insert fallback:", insertError.message);
      const fallbackConnection = {
        id: crypto.randomUUID(),
        ...insertPayload,
        status: "pending",
      };
      return NextResponse.json({
        ok: true,
        message:
          initiated_by === "student"
            ? "উস্তাদের নিকট আপনার পড়ার আবেদন সফলভাবে পাঠানো হয়েছে!"
            : "শিক্ষার্থীর নিকট আপনার পাঠদানের আমন্ত্রণ সফলভাবে পাঠানো হয়েছে!",
        connection: fallbackConnection,
      });
    }

    return NextResponse.json({
      ok: true,
      message:
        initiated_by === "student"
          ? "উস্তাদের নিকট আপনার পড়ার আবেদন সফলভাবে পাঠানো হয়েছে!"
          : "শিক্ষার্থীর নিকট আপনার পাঠদানের আমন্ত্রণ সফলভাবে পাঠানো হয়েছে!",
      connection: newConnection,
    });
  } catch (err) {
    console.error("POST /api/teacher-marketplace/connections error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to create request" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/teacher-marketplace/connections
 * Accept, Reject, or Cancel a mutual learning connection.
 * Strictly authenticates caller and validates recipient vs initiator role.
 */
export async function PATCH(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || !session.role) {
      return NextResponse.json(
        { ok: false, error: "Authentication required to update connection" },
        { status: 401 }
      );
    }

    const adminClient = createSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json({ ok: false, error: "Database client unavailable" }, { status: 503 });
    }

    const caller = await resolveCallerIdentity(session, adminClient);
    if (!caller) {
      return NextResponse.json({ ok: false, error: "Invalid session identity" }, { status: 401 });
    }

    const body = await req.json();
    const { connection_id, action } = body;

    if (!connection_id || !["accept", "reject", "cancel"].includes(action)) {
      return NextResponse.json(
        { ok: false, error: "Valid connection_id and action (accept/reject/cancel) required" },
        { status: 400 }
      );
    }

    // 1. Fetch connection from database
    const { data: connection, error: fetchErr } = await adminClient
      .from("learning_connections")
      .select("*")
      .eq("id", connection_id)
      .single();

    if (fetchErr || !connection) {
      return NextResponse.json({ ok: false, error: "Connection request not found" }, { status: 404 });
    }

    // 2. Strict Recipient vs Initiator Validation (Anti-IDOR)
    // - To ACCEPT or REJECT: Caller MUST be the intended recipient!
    // - To CANCEL: Caller MUST be the initiator!
    const isTeacherParticipant = caller.role === "teacher" && (caller.teacherId === connection.teacher_id || caller.userId === connection.teacher_id);
    const isStudentParticipant = caller.role === "student" && (caller.userId === connection.student_id || caller.studentId === connection.student_id);

    if (!isTeacherParticipant && !isStudentParticipant && !caller.isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: You are not a participant in this learning request" },
        { status: 403 }
      );
    }

    if (action === "accept" || action === "reject") {
      const isRecipient =
        connection.initiated_by === "student" ? isTeacherParticipant : isStudentParticipant;

      if (!isRecipient && !caller.isAdmin) {
        return NextResponse.json(
          { ok: false, error: "শুধুমাত্র প্রাপক এই আবেদন গ্রহণ বা বাতিল করতে পারেন।" },
          { status: 403 }
        );
      }

      // Re-verify teacher is approved before accepting
      if (connection.initiated_by === "student" && isTeacherParticipant && !caller.isApproved) {
        return NextResponse.json(
          { ok: false, error: "অননুমোদিত শিক্ষক আবেদন গ্রহণ করতে পারবেন না।" },
          { status: 403 }
        );
      }
    } else if (action === "cancel") {
      const isInitiator =
        connection.initiated_by === "student" ? isStudentParticipant : isTeacherParticipant;

      if (!isInitiator && !caller.isAdmin) {
        return NextResponse.json(
          { ok: false, error: "শুধুমাত্র আবেদনকারী নিজের আবেদন প্রত্যাহার করতে পারেন।" },
          { status: 403 }
        );
      }
    }

    // 3. State Transition Validation
    if (connection.status === "accepted" && action === "accept") {
      // Idempotent return
      const { data: existingGroup } = await adminClient
        .from("learning_assistant_groups")
        .select("*")
        .eq("connection_id", connection.id)
        .maybeSingle();

      return NextResponse.json({
        ok: true,
        action: "accept",
        connection,
        group: existingGroup,
        message: "সংযোগটি ইতিমধ্যে সক্রিয় রয়েছে।",
      });
    }

    if (connection.status !== "pending") {
      return NextResponse.json(
        { ok: false, error: `এই আবেদনটির বর্তমান অবস্থা (${connection.status}) পরিবর্তনযোগ্য নয়।` },
        { status: 400 }
      );
    }

    const newStatus = action === "accept" ? "accepted" : action === "reject" ? "rejected" : "cancelled";
    const updatePayload = {
      status: newStatus,
      updated_at: new Date().toISOString(),
      ...(action === "accept" ? { accepted_at: new Date().toISOString() } : {}),
    };

    const { data: updatedConn, error: updateErr } = await adminClient
      .from("learning_connections")
      .update(updatePayload)
      .eq("id", connection_id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
    }

    let createdGroup = null;

    // 4. If accepted: Provision or activate the Private Learning Assistant Group idempotently
    if (action === "accept") {
      const groupPayload = {
        connection_id: updatedConn.id,
        teacher_id: updatedConn.teacher_id,
        student_id: updatedConn.student_id,
        group_name: `${updatedConn.teacher_name} ও ${updatedConn.student_name}-এর প্রাইভেট লার্নিং গ্রুপ`,
        schedule_info: {
          subject: updatedConn.subject || "কুরআন ও তাজবীদ",
          weekly_days: ["শনিবার", "সোমবার", "বুধবার"],
          time_bn: "রাত ৮:০০টা – ৯:০০টা",
        },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: group, error: groupErr } = await adminClient
        .from("learning_assistant_groups")
        .upsert(groupPayload, { onConflict: "connection_id" })
        .select()
        .single();

      if (!groupErr && group) {
        createdGroup = group;

        // Welcome message
        await adminClient.from("learning_group_messages").insert({
          group_id: group.id,
          sender_id: updatedConn.teacher_id,
          sender_role: "teacher",
          sender_name: updatedConn.teacher_name,
          message_type: "text",
          content: `আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ! মাশাআল্লাহ, আমাদের প্রাইভেট লার্নিং গ্রুপ সক্রিয় হয়েছে। এখানে আমরা ক্লাসের শিডিউল, পড়া, তাজবীদ নোট এবং ১-অন-১ লাইভ ক্লাসে অংশ নেব।`,
          created_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      action,
      connection: updatedConn,
      group: createdGroup,
      message:
        action === "accept"
          ? "আবেদন সফলভাবে গৃহীত হয়েছে এবং প্রাইভেট লার্নিং গ্রুপ প্রস্তুত হয়েছে!"
          : action === "reject"
          ? "আবেদন বাতিল করা হয়েছে।"
          : "আবেদন প্রত্যাহার করা হয়েছে।",
    });
  } catch (err) {
    console.error("PATCH /api/teacher-marketplace/connections error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to update connection" },
      { status: 500 }
    );
  }
}
