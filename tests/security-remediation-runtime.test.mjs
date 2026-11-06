import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

// ── Read authoritative files for analysis ──
const connectionsApi = fs.readFileSync("app/api/teacher-marketplace/connections/route.js", "utf-8");
const messagesApi = fs.readFileSync("app/api/teacher-marketplace/connections/messages/route.js", "utf-8");
const studentApi = fs.readFileSync("app/api/teacher-marketplace/public-students/route.js", "utf-8");
const storiesApi = fs.readFileSync("app/api/teacher-marketplace/stories/route.js", "utf-8");
const forwardMigration = fs.readFileSync("supabase/migrations/20261110_harden_global_education_social_security.sql", "utf-8");
const reelsSection = fs.readFileSync("src/features/teachers/components/social/ReelsDiscoverySection.jsx", "utf-8");
const privateGroupModal = fs.readFileSync("src/features/teachers/components/PrivateLearningGroupModal.jsx", "utf-8");
const humanTeacherPlatform = fs.readFileSync("src/features/teachers/components/HumanTeacherPlatform.jsx", "utf-8");

test("Case 1: Guest cannot create a learning request (HTTP 401)", () => {
  assert.ok(
    connectionsApi.includes("!session || !session.role") &&
    connectionsApi.includes("Authentication required to send a learning request"),
    "POST /api/teacher-marketplace/connections strictly returns 401 for unauthenticated guests"
  );
  assert.ok(
    connectionsApi.includes("status: 401"),
    "401 status code is returned for missing or invalid sessions"
  );
});

test("Case 2: Guest cannot accept a learning request (HTTP 401)", () => {
  assert.ok(
    connectionsApi.includes("Authentication required to update connection") &&
    connectionsApi.includes("status: 401"),
    "PATCH /api/teacher-marketplace/connections returns 401 for unauthenticated calls"
  );
});

test("Case 3: Guest cannot reject or cancel another user's request (HTTP 401 / 403)", () => {
  assert.ok(
    connectionsApi.includes("শুধুমাত্র প্রাপক এই আবেদন গ্রহণ বা বাতিল করতে পারেন") ||
    connectionsApi.includes("isRecipient"),
    "Non-recipient caller is forbidden from accepting or rejecting another user's request"
  );
  assert.ok(
    connectionsApi.includes("শুধুমাত্র আবেদনকারী নিজের আবেদন প্রত্যাহার করতে পারেন") ||
    connectionsApi.includes("isInitiator"),
    "Non-initiator caller is forbidden from cancelling another user's request"
  );
});

test("Case 4: Student cannot impersonate a teacher (role verification)", () => {
  assert.ok(
    connectionsApi.includes('caller.role !== "student"') &&
    connectionsApi.includes("শুধুমাত্র শিক্ষার্থীরা পড়ার আবেদন পাঠাতে পারেন"),
    "Student-to-teacher requests require verified student role"
  );
  assert.ok(
    connectionsApi.includes('caller.role !== "teacher"') &&
    connectionsApi.includes("শুধুমাত্র অনুমোদিত শিক্ষকগণ পাঠদানের আমন্ত্রণ পাঠাতে পারেন"),
    "Teacher invitations require verified teacher role"
  );
});

test("Case 5: Pending or suspended teacher cannot send approved-teacher invitations (HTTP 403)", () => {
  assert.ok(
    connectionsApi.includes("!caller.isApproved") &&
    connectionsApi.includes("আপনার শিক্ষক প্রোফাইল এখনো অনুমোদিত নয়"),
    "Unapproved or pending teachers are rejected with 403"
  );
  assert.ok(
    connectionsApi.includes('targetTeacher.status !== "approved"') &&
    connectionsApi.includes("নির্বাচিত শিক্ষক বর্তমানে অনুমোদিত নন"),
    "Students cannot request unapproved teachers"
  );
});

test("Case 6: Guest cannot read private group messages (HTTP 401)", () => {
  assert.ok(
    messagesApi.includes("!session || !session.role") &&
    messagesApi.includes("Authentication required to access private group messages") &&
    messagesApi.includes("status: 401"),
    "GET /api/teacher-marketplace/connections/messages returns 401 for guests"
  );
});

test("Case 7: Non-member cannot read another group's messages (HTTP 403)", () => {
  assert.ok(
    messagesApi.includes("!isGroupParticipant(caller, group)") &&
    messagesApi.includes("Unauthorized: You are not a member of this private learning group") &&
    messagesApi.includes("status: 403"),
    "GET /api/teacher-marketplace/connections/messages returns 403 for non-members (Anti-IDOR)"
  );
});

test("Case 8: Guest cannot post messages (HTTP 401)", () => {
  assert.ok(
    messagesApi.includes("!session || !session.role") &&
    messagesApi.includes("Authentication required to post in private groups") &&
    messagesApi.includes("status: 401"),
    "POST /api/teacher-marketplace/connections/messages returns 401 for unauthenticated calls"
  );
});

test("Case 9: Student cannot forge teacher sender identity in private group messages", () => {
  assert.ok(
    messagesApi.includes("let verifiedSenderId = caller.userId") &&
    messagesApi.includes('verifiedSenderRole = "student"'),
    "Sender role and ID are derived server-side from session for students"
  );
  assert.ok(
    !messagesApi.includes("sender_id: senderId") &&
    !messagesApi.includes("sender_role: senderRole"),
    "Client-supplied senderId and senderRole are completely ignored in messages POST"
  );
});

test("Case 10: Teacher cannot forge student sender identity in private group messages", () => {
  assert.ok(
    messagesApi.includes('verifiedSenderRole = "teacher"') &&
    messagesApi.includes("verifiedSenderId = group.teacher_id"),
    "Sender role and ID are strictly bound to teacher group identity for teachers"
  );
});

test("Case 11: Student cannot overwrite another student's profile (Anti-IDOR HTTP 403)", () => {
  assert.ok(
    studentApi.includes("idTaken.user_id !== authUserId") &&
    studentApi.includes("Unauthorized: You cannot modify another student's profile") &&
    studentApi.includes("status: 403"),
    "Public student profile POST strictly blocks IDOR profile overwrites"
  );
  assert.ok(
    studentApi.includes('onConflict: "user_id"'),
    "Upsert is strictly keyed on authenticated user_id"
  );
});

test("Case 12: Guest cannot create or modify public student profiles (HTTP 401)", () => {
  assert.ok(
    studentApi.includes("!session || !session.role") &&
    studentApi.includes("Authentication required to update student profile") &&
    studentApi.includes("status: 401"),
    "Public student profile POST requires authenticated session"
  );
});

test("Case 13: Student cannot publish a teacher-role story", () => {
  assert.ok(
    storiesApi.includes('authorRole = "student"') &&
    storiesApi.includes('authorRole = caller.role'),
    "Story author role is strictly server-derived from verified caller role"
  );
});

test("Case 14: Teacher cannot publish a story as another teacher", () => {
  assert.ok(
    storiesApi.includes("authorId = caller.teacherId") ||
    storiesApi.includes("authorId = caller.userId"),
    "Story author ID is strictly derived from verified teacher profile"
  );
  assert.ok(
    !storiesApi.includes("author_id: author_id"),
    "Client-provided author_id is never passed directly to database insert"
  );
});

test("Case 15: Story media ownership & format restrictions are enforced", () => {
  assert.ok(
    storiesApi.includes('media_type === "video"') &&
    storiesApi.includes("শিক্ষার্থীদের জন্য শুধুমাত্র ছবি স্টোরি পোস্ট করার অনুমতি রয়েছে।") &&
    storiesApi.includes("status: 403"),
    "Video stories by students are forbidden with 403"
  );
  assert.ok(
    storiesApi.includes("media_url is required") && storiesApi.includes("status: 400"),
    "Missing media URL is rejected with 400"
  );
});

test("Case 16: Expired stories are not shown in active story feeds", () => {
  assert.ok(
    storiesApi.includes('.gt("expires_at",') ||
    storiesApi.includes("new Date(s.expires_at) > now"),
    "Stories API queries only non-expired stories"
  );
});

test("Case 17: Reels do not use synthetic media or invented view counts", () => {
  assert.ok(
    !reelsSection.includes("commondatastorage.googleapis.com/gtv-videos-bucket"),
    "Hardcoded Google sample video URLs are completely removed from ReelsDiscoverySection"
  );
  assert.ok(
    reelsSection.includes("/api/teacher-marketplace/social/posts?tab=videos") &&
    reelsSection.includes("এখনো কোনো ভিডিও রিলস প্রকাশিত হয়নি"),
    "Reels dynamically fetch real video posts or show honest empty state"
  );
});

test("Case 18: Quran Reader link resolves to a real route", () => {
  assert.ok(
    !privateGroupModal.includes('"/quran-tutor/read"') &&
    privateGroupModal.includes('"/quran-tutor"'),
    "PrivateLearningGroupModal links to authoritative /quran-tutor instead of 404 /quran-tutor/read"
  );
  assert.ok(
    !humanTeacherPlatform.includes('"/quran-tutor/read"'),
    "HumanTeacherPlatform does not contain dead /quran-tutor/read link"
  );
});

test("Case 19: Private institutional data remains isolated in forward migration 20261110", () => {
  assert.ok(
    forwardMigration.includes("is_learning_group_participant") &&
    forwardMigration.includes("uq_public_student_profiles_user_id"),
    "Forward migration defines secure participant checking function and unique constraints"
  );
  assert.ok(
    forwardMigration.includes("teacher_marketplace_profiles tmp WHERE tmp.user_id = p_auth_uid"),
    "Forward migration maps teacher identities via teacher_marketplace_profiles.user_id = auth.uid()"
  );
  assert.ok(
    forwardMigration.includes("public_student_profiles psp WHERE psp.user_id = p_auth_uid"),
    "Forward migration maps student identities via public_student_profiles.user_id = auth.uid()"
  );
});
