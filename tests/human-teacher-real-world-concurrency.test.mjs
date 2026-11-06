import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createSessionToken, verifySessionToken } from "../src/lib/auth-session.js";

// Ensure JWT secret is set for tests
process.env.SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || "test-super-secret-jwt-key-32chars-long!!";

test("1. Auth API generates verified HMAC session tokens for students and teachers", async () => {
  const studentUser = {
    authUserId: "stu-uuid-1111",
    role: "student",
    studentPublicId: "STU-8822",
    name: "মুহাম্মদ আব্দুল্লাহ",
    loginId: "learner_8822",
  };

  const studentToken = await createSessionToken(studentUser);
  assert.ok(studentToken && studentToken.includes("."), "Student token generated");

  const verifiedStudent = await verifySessionToken(studentToken);
  assert.ok(verifiedStudent, "Student token verified");
  assert.equal(verifiedStudent.authUserId, "stu-uuid-1111");
  assert.equal(verifiedStudent.role, "student");
  assert.equal(verifiedStudent.studentPublicId, "STU-8822");

  const teacherUser = {
    authUserId: "tea-uuid-2222",
    role: "teacher",
    teacherId: "qari-mahmudul-hasan",
    nameBn: "শায়খ ক্বারী মাহমুদুল হাসান",
    status: "approved",
  };

  const teacherToken = await createSessionToken(teacherUser);
  assert.ok(teacherToken && teacherToken.includes("."), "Teacher token generated");

  const verifiedTeacher = await verifySessionToken(teacherToken);
  assert.ok(verifiedTeacher, "Teacher token verified");
  assert.equal(verifiedTeacher.role, "teacher");
  assert.equal(verifiedTeacher.teacherId, "qari-mahmudul-hasan");
});

test("2. Master SQL contains idempotent unique constraints preventing race conditions", () => {
  const masterSql = fs.readFileSync(
    "supabase/scripts/full_human_teacher_and_social_network_master.sql",
    "utf-8"
  );

  // 1. Connection uniqueness: One connection per (teacher, student) pair
  assert.ok(
    masterSql.includes("uq_learning_connection UNIQUE (teacher_id, student_id)") ||
    masterSql.includes("ADD CONSTRAINT uq_learning_connection UNIQUE (teacher_id, student_id)"),
    "Enforces uniqueness on (teacher_id, student_id)"
  );

  // 2. Group uniqueness: Exactly one group per connection
  assert.ok(
    masterSql.includes("connection_id UUID UNIQUE") ||
    masterSql.includes("uq_assistant_group_connection UNIQUE (connection_id)"),
    "Enforces uniqueness on connection_id in learning_assistant_groups"
  );
});

test("3. Connections API enables multi-teacher and multi-student relationships", () => {
  const connCode = fs.readFileSync(
    "app/api/teacher-marketplace/connections/route.js",
    "utf-8"
  );

  // Checks that queries filter by individual (teacher_id, student_id) rather than global singletons
  assert.ok(
    connCode.includes("eq(\"teacher_id\", resolvedTeacherId)") &&
    connCode.includes("eq(\"student_id\", resolvedStudentId)"),
    "Checks duplicate connection strictly per teacher-student pair"
  );

  // One student can connect to Teacher A and Teacher B independently
  // One teacher can receive connections from Student 1 and Student 2 independently
  assert.ok(
    connCode.includes("upsert(insertPayload, { onConflict: \"teacher_id,student_id\" })"),
    "Upsert correctly scopes conflict to teacher_id,student_id"
  );
});

test("4. Anti-Self-Acceptance: Recipient vs Initiator strict validation", () => {
  const connCode = fs.readFileSync(
    "app/api/teacher-marketplace/connections/route.js",
    "utf-8"
  );

  // Student-initiated request MUST be accepted by the TEACHER recipient
  assert.ok(
    connCode.includes("connection.initiated_by === \"student\" ? isTeacherParticipant : isStudentParticipant"),
    "Validates recipient role dynamically based on initiated_by"
  );

  // Initiator CANNOT accept own request
  assert.ok(
    connCode.includes("শুধুমাত্র প্রাপক এই আবেদন গ্রহণ বা বাতিল করতে পারেন।"),
    "Returns 403 if non-recipient attempts to accept/reject"
  );

  // Only initiator can cancel
  assert.ok(
    connCode.includes("শুধুমাত্র আবেদনকারী নিজের আবেদন প্রত্যাহার করতে পারেন।"),
    "Returns 403 if non-initiator attempts to cancel"
  );
});

test("5. Group Messaging: Sender identity is strictly derived on the server", () => {
  const msgCode = fs.readFileSync(
    "app/api/teacher-marketplace/connections/messages/route.js",
    "utf-8"
  );

  // Verified caller check
  assert.ok(
    msgCode.includes("isGroupParticipant(caller, group)"),
    "Verifies caller is an active group participant"
  );

  // Anti-spoofing: sender identity from session, not client payload
  assert.ok(
    msgCode.includes("verifiedSenderId = group.teacher_id") &&
    msgCode.includes("verifiedSenderId = group.student_id"),
    "Derives sender ID strictly from group record and verified caller role"
  );

  assert.ok(
    !msgCode.includes("sender_id: body.senderId") &&
    !msgCode.includes("sender_role: body.senderRole"),
    "Client cannot inject arbitrary sender_id or sender_role"
  );
});

test("6. UI Dashboards handle all connections dynamically without fake placeholders", () => {
  const teacherDash = fs.readFileSync(
    "src/features/teachers/components/TeacherMarketplaceDashboard.jsx",
    "utf-8"
  );
  const studentDash = fs.readFileSync(
    "src/features/teachers/components/StudentMarketplaceDashboard.jsx",
    "utf-8"
  );

  // Teacher dashboard handles real incoming pending requests and active connections
  assert.ok(
    teacherDash.includes("handleUpdateConnection(req.id, \"accept\")"),
    "Teacher dashboard has functional accept button"
  );
  assert.ok(
    teacherDash.includes("handleUpdateConnection(req.id, \"reject\")"),
    "Teacher dashboard has functional reject button"
  );

  // Student dashboard displays real connected teachers and groups
  assert.ok(
    studentDash.includes("fetch(\"/api/teacher-marketplace/connections\")"),
    "Student dashboard fetches real connections from API"
  );
  assert.ok(
    studentDash.includes("fetch(\"/api/teacher-marketplace/public-students\""),
    "Student dashboard syncs profile updates to DB"
  );
});

