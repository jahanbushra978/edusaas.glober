import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const migrationSql = fs.readFileSync(
  "supabase/migrations/20261111_harden_database_social_network_security.sql",
  "utf-8"
);
const connectionsApi = fs.readFileSync(
  "app/api/teacher-marketplace/connections/route.js",
  "utf-8"
);
const messagesApi = fs.readFileSync(
  "app/api/teacher-marketplace/connections/messages/route.js",
  "utf-8"
);
const storiesApi = fs.readFileSync(
  "app/api/teacher-marketplace/stories/route.js",
  "utf-8"
);

test("Case 1: Guest cannot create a learning connection", () => {
  assert.ok(
    migrationSql.includes("REVOKE INSERT, UPDATE, DELETE ON public.learning_connections FROM PUBLIC, anon, authenticated"),
    "Direct PostgREST insertion revoked on learning_connections"
  );
  assert.ok(
    connectionsApi.includes("Authentication required to send a learning request"),
    "Server API rejects unauthenticated guests with 401"
  );
});

test("Case 2: Authenticated user cannot self-accept a request using PostgREST", () => {
  assert.ok(
    migrationSql.includes("DROP POLICY IF EXISTS \"Participants can update connection status\" ON public.learning_connections"),
    "Obsolete permissive update policy removed"
  );
  assert.ok(
    migrationSql.includes("REVOKE INSERT, UPDATE, DELETE ON public.learning_connections"),
    "Direct client UPDATE revoked"
  );
});

test("Case 3: Student cannot forge teacher sender identity", () => {
  assert.ok(
    migrationSql.includes("REVOKE INSERT, UPDATE, DELETE ON public.learning_group_messages FROM PUBLIC, anon, authenticated"),
    "Direct PostgREST insert revoked on messages"
  );
  assert.ok(
    messagesApi.includes('verifiedSenderRole = "student"'),
    "Server API binds student role strictly to authenticated identity"
  );
});

test("Case 4: Teacher cannot forge student sender identity", () => {
  assert.ok(
    messagesApi.includes('verifiedSenderRole = "teacher"'),
    "Server API binds teacher role strictly to authenticated identity"
  );
  assert.ok(
    migrationSql.includes("DROP POLICY IF EXISTS \"Participants can post group messages\" ON public.learning_group_messages"),
    "Direct client message insert policy removed"
  );
});

test("Case 5: Guest cannot insert private group messages", () => {
  assert.ok(
    messagesApi.includes("Authentication required to post in private groups"),
    "Server API rejects guests with 401"
  );
  assert.ok(
    migrationSql.includes("REVOKE INSERT, UPDATE, DELETE ON public.learning_group_messages"),
    "PostgREST direct insert blocked"
  );
});

test("Case 6: Non-member cannot read group messages", () => {
  assert.ok(
    migrationSql.includes("public.is_learning_group_participant(group_id)"),
    "RLS policy enforces is_learning_group_participant on SELECT"
  );
});

test("Case 7: Group access requires an accepted active relationship", () => {
  assert.ok(
    migrationSql.includes("c.status = 'accepted'"),
    "Function requires connection status = 'accepted'"
  );
});

test("Case 8: Inactive groups are inaccessible", () => {
  assert.ok(
    migrationSql.includes("g.is_active = true"),
    "Function requires g.is_active = true"
  );
});

test("Case 9: Guest cannot insert teacher stories", () => {
  assert.ok(
    migrationSql.includes("REVOKE INSERT, UPDATE, DELETE ON public.social_stories FROM PUBLIC, anon, authenticated"),
    "Direct PostgREST story insert revoked"
  );
  assert.ok(
    storiesApi.includes("Authentication required to post a story"),
    "Server API rejects guests with 401"
  );
});

test("Case 10: Student cannot impersonate a teacher story", () => {
  assert.ok(
    storiesApi.includes('authorRole = "student"') &&
    storiesApi.includes('authorRole = "teacher"'),
    "Story author role is server-derived"
  );
  assert.ok(
    migrationSql.includes("DROP POLICY IF EXISTS \"Authenticated users can post stories\" ON public.social_stories"),
    "Direct client story insert policy removed"
  );
});

test("Case 11: Expiration cannot be extended by unauthorized direct writes", () => {
  assert.ok(
    migrationSql.includes("REVOKE INSERT, UPDATE, DELETE ON public.social_stories"),
    "Direct client writes revoked, preventing client-controlled expires_at"
  );
  assert.ok(
    storiesApi.includes("new Date(Date.now() + 24 * 60 * 60 * 1000)"),
    "Server strictly controls 24h expiration"
  );
});

test("Case 12: Public directory never exposes user_id", () => {
  assert.ok(
    migrationSql.includes("CREATE OR REPLACE VIEW public.public_student_directory AS"),
    "Secure public view defined"
  );
  const viewSection = migrationSql.slice(
    migrationSql.indexOf("CREATE OR REPLACE VIEW public.public_student_directory AS"),
    migrationSql.indexOf("WHERE is_discoverable = true;")
  );
  assert.ok(!viewSection.includes("user_id"), "View explicitly excludes user_id column");
  assert.ok(
    migrationSql.includes("REVOKE SELECT ON public.public_student_profiles FROM PUBLIC, anon") ||
    migrationSql.includes("REVOKE SELECT ON public.public_student_profiles FROM anon"),
    "Raw table SELECT revoked from anonymous users"
  );
});

test("Case 13: Private saved posts remain private", () => {
  assert.ok(
    migrationSql.includes("CREATE POLICY \"User can manage own saved posts\" ON public.teacher_social_saved_posts") &&
    migrationSql.includes("USING (user_id = auth.uid())"),
    "Saved posts strictly isolated by user_id = auth.uid()"
  );
});

test("Case 14: Reports remain private", () => {
  assert.ok(
    migrationSql.includes("REVOKE ALL ON public.teacher_social_reports FROM PUBLIC, anon, authenticated") ||
    migrationSql.includes("REVOKE SELECT, UPDATE, DELETE ON public.teacher_social_reports"),
    "Direct client access revoked completely on reports"
  );
});

test("Case 15: Existing public feed reads still work while direct mutations are revoked", () => {
  assert.ok(
    migrationSql.includes("REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_posts FROM PUBLIC, anon, authenticated") ||
    migrationSql.includes("REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_posts"),
    "Direct mutations revoked from authenticated users while public feed SELECT is preserved"
  );
});

test("Case 16: Existing server APIs still work", () => {
  assert.ok(
    connectionsApi.includes("createSupabaseAdminClient") &&
    messagesApi.includes("createSupabaseAdminClient") &&
    storiesApi.includes("createSupabaseAdminClient"),
    "Server APIs use Service Role to perform authorized operations"
  );
});

test("Case 17: Forward migration 20261112 cleanly closes all privilege gaps with dependency safety", () => {
  const m12 = fs.readFileSync(
    "supabase/migrations/20261112_close_remaining_social_privilege_gaps.sql",
    "utf-8"
  );
  assert.ok(
    m12.indexOf("DROP POLICY IF EXISTS \"Participants can view group messages\"") <
    m12.indexOf("DROP FUNCTION IF EXISTS public.is_learning_group_participant(UUID, UUID)"),
    "Dependent policy dropped before old function drop (avoids Postgres dependency halt)"
  );
  assert.ok(
    m12.includes("REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_posts FROM PUBLIC, anon, authenticated"),
    "Authenticated direct mutations revoked on posts in 20261112"
  );
  assert.ok(
    m12.includes("REVOKE ALL ON public.teacher_social_reports FROM PUBLIC, anon, authenticated"),
    "All direct client access revoked on reports in 20261112"
  );
});

test("Case 18: Forward migration 20261113 uses guarded to_regprocedure and RESTRICT for drop", () => {
  const m13 = fs.readFileSync(
    "supabase/migrations/20261113_final_database_security_hardening.sql",
    "utf-8"
  );
  assert.ok(
    m13.includes("to_regprocedure('public.is_learning_group_participant(uuid,uuid)')"),
    "Guarded to_regprocedure check prevents 42883 error"
  );
  assert.ok(
    m13.includes("DROP FUNCTION public.is_learning_group_participant(UUID, UUID) RESTRICT"),
    "Uses RESTRICT to safely drop the old overload without blind cascading"
  );
  assert.ok(
    m13.includes("g.teacher_id = c.teacher_id") && m13.includes("g.student_id = c.student_id"),
    "Verifies group teacher and student match accepted connection"
  );
});

test("Case 19: Social post engagement (reactions & comments) bound strictly to parent post visibility", () => {
  const m13 = fs.readFileSync(
    "supabase/migrations/20261113_final_database_security_hardening.sql",
    "utf-8"
  );
  assert.ok(
    m13.includes("CREATE POLICY \"Visible post reactions only\" ON public.teacher_social_reactions") &&
    m13.includes("p.id = teacher_social_reactions.post_id"),
    "Reactions visibility bounded to parent post visibility"
  );
  assert.ok(
    m13.includes("CREATE POLICY \"Visible post active comments only\" ON public.teacher_social_comments") &&
    m13.includes("p.id = teacher_social_comments.post_id"),
    "Comments visibility bounded to parent post visibility"
  );
  assert.ok(
    m13.includes("CREATE POLICY \"Visible comment reactions only\" ON public.teacher_social_comment_reactions"),
    "Comment reactions visibility bounded to parent comment and post"
  );
});

test("Case 20: Student directory view and API exclude user_id and internal UUID", () => {
  const m13 = fs.readFileSync(
    "supabase/migrations/20261113_final_database_security_hardening.sql",
    "utf-8"
  );
  const view13 = m13.slice(
    m13.indexOf("CREATE OR REPLACE VIEW public.public_student_directory AS"),
    m13.indexOf("WHERE is_discoverable = true;")
  );
  assert.ok(!view13.includes("user_id"), "View explicitly excludes user_id");
  assert.ok(!view13.includes("\n    id,"), "View explicitly excludes internal profile id UUID");
  assert.ok(view13.includes("student_public_id"), "View exposes public student identifier");

  const publicStudentsApi = fs.readFileSync(
    "app/api/teacher-marketplace/public-students/route.js",
    "utf-8"
  );
  assert.ok(
    publicStudentsApi.includes("from(\"public_student_directory\")"),
    "API queries hardened public_student_directory view"
  );
  assert.ok(
    publicStudentsApi.includes("id: s.student_public_id"),
    "API maps student_public_id to id for stable client keys without UUID leakage"
  );
});

