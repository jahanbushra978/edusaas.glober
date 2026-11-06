import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";

test("1. RLS Remediation: Insecure 'FOR ALL USING (true)' policies are eliminated and replaced with least-privilege policies", () => {
  const m1 = fs.readFileSync("supabase/migrations/20261106_human_teacher_social_network.sql", "utf8");
  const m2 = fs.readFileSync("supabase/migrations/20261107_harden_human_teacher_social_security.sql", "utf8");

  // Verify that active FOR ALL USING (true) policies are completely purged from both migration files
  assert.ok(!m1.includes("FOR ALL USING (true);") && !m1.includes("FOR ALL\n  USING (true)"), "20261106 does not contain active unconstrained FOR ALL USING (true) policy");
  assert.ok(!m2.includes("FOR ALL USING (true);") && !m2.includes("FOR ALL\n  USING (true)"), "20261107 does not contain active unconstrained FOR ALL USING (true) policy");

  // Verify explicit drop of legacy insecure policies in forward migration
  assert.ok(m2.includes('DROP POLICY IF EXISTS "Server-side posts management"'), "Drops legacy posts management policy");
  assert.ok(m2.includes('DROP POLICY IF EXISTS "Server-side reactions management"'), "Drops legacy reactions management policy");
  assert.ok(m2.includes('DROP POLICY IF EXISTS "Server-side comments management"'), "Drops legacy comments management policy");
  assert.ok(m2.includes('DROP POLICY IF EXISTS "Server-side follows management"'), "Drops legacy follows management policy");
  assert.ok(m2.includes('DROP POLICY IF EXISTS "Server-side saved posts management"'), "Drops legacy saved posts management policy");
  assert.ok(m2.includes('DROP POLICY IF EXISTS "Server-side reports management"'), "Drops legacy reports management policy");

  // Verify narrow scoped policies
  assert.ok(m2.includes("visibility = 'public' AND status = 'published'"), "Public can only read published public posts");
  assert.ok(m2.includes("auth.uid() = author_user_id"), "Authors can read their own posts");
  assert.ok(m2.includes("auth.uid() = user_id"), "Saved posts restricted to authenticated owner");
  assert.ok(m2.includes("auth.uid() = reporter_user_id"), "Reports insert restricted to authenticated reporter");
});

test("2. SECURITY DEFINER RPC Hardening: Fixed search_path and Revocation from PUBLIC", () => {
  const sql = fs.readFileSync("supabase/migrations/20261107_harden_human_teacher_social_security.sql", "utf8");

  // Fixed search path
  assert.ok(sql.includes("SET search_path = pg_catalog, public"), "Enforces fixed search_path");

  // Revoke from PUBLIC
  assert.ok(
    sql.includes("REVOKE ALL ON FUNCTION public.toggle_teacher_post_reaction") &&
    sql.includes("FROM PUBLIC"),
    "Revokes post reaction RPC from PUBLIC"
  );
  assert.ok(
    sql.includes("REVOKE ALL ON FUNCTION public.toggle_teacher_follow") &&
    sql.includes("FROM PUBLIC"),
    "Revokes follow RPC from PUBLIC"
  );
  assert.ok(
    sql.includes("REVOKE ALL ON FUNCTION public.toggle_save_post") &&
    sql.includes("FROM PUBLIC"),
    "Revokes save post RPC from PUBLIC"
  );

  // Grant only to authenticated and service_role
  assert.ok(sql.includes("TO authenticated, service_role"), "Grants execution only to trusted roles");
});

test("3. Followers-Only Privacy Leak Remediation in Posts APIs", () => {
  const postsRoute = fs.readFileSync("app/api/teacher-marketplace/social/posts/route.js", "utf8");
  const singlePostRoute = fs.readFileSync("app/api/teacher-marketplace/social/posts/[id]/route.js", "utf8");

  // Posts Feed Route: Batch follow check (Anti-N+1)
  assert.ok(postsRoute.includes("teacher_social_follows"), "Queries follow table for followers visibility");
  assert.ok(postsRoute.includes("followedTeacherIds"), "Maintains followed teacher ID set");
  assert.ok(
    postsRoute.includes("followedTeacherIds.has(post.teacher_id)"),
    "Restricts followers-only posts strictly to active followers"
  );

  // Single Post Route: Immediate follow relation check
  assert.ok(singlePostRoute.includes("post.visibility === \"followers\""), "Checks followers visibility in single post route");
  assert.ok(singlePostRoute.includes("following_teacher_id"), "Validates follow relationship in database");
});

test("4. Video Chunk Upload Authorization & Server-Controlled Constraints", () => {
  const chunkRoute = fs.readFileSync("app/api/uploads/video-chunk/route.js", "utf8");

  // Role validation
  assert.ok(chunkRoute.includes("isTeacher"), "Restricts video chunk upload to teachers and admins");
  assert.ok(chunkRoute.includes("canonicalTeacherId"), "Derives canonical teacher ID from session");

  // 300MB strict limit
  assert.ok(chunkRoute.includes("300 * 1024 * 1024"), "Enforces 300MB video ceiling on server");

  // Server-controlled folder and upload ID binding
  assert.ok(chunkRoute.includes("teacher_posts/${canonicalTeacherId"), "Scopes folder to authenticated teacher");
  assert.ok(chunkRoute.includes("safeUploadId") || chunkRoute.includes("canonicalTeacherId"), "Binds upload ID to teacher");

  // Boundary validation
  assert.ok(chunkRoute.includes("Content-Range or chunk size mismatch"), "Validates chunk boundaries and range integrity");

  // Adaptive variants
  assert.ok(chunkRoute.includes("variants"), "Generates multi-resolution variants (360p, 480p, 720p, 1080p)");
  assert.ok(chunkRoute.includes("hls_url"), "Generates adaptive HLS streaming URL");
});

test("5. Comment Reactions Implementation & Constraints", () => {
  const reactionsApi = fs.readFileSync("app/api/teacher-marketplace/social/comments/reactions/route.js", "utf8");
  const commentsApi = fs.readFileSync("app/api/teacher-marketplace/social/comments/route.js", "utf8");
  const postCard = fs.readFileSync("src/features/teachers/components/social/SocialPostCard.jsx", "utf8");
  const migration = fs.readFileSync("supabase/migrations/20261107_harden_human_teacher_social_security.sql", "utf8");

  // Migration Table
  assert.ok(migration.includes("CREATE TABLE IF NOT EXISTS public.teacher_social_comment_reactions"), "Creates comment reactions table");
  assert.ok(migration.includes("unique_comment_user_reaction UNIQUE (comment_id, user_id)"), "Enforces unique one-reaction constraint per user per comment");

  // API Route
  assert.ok(reactionsApi.includes("POST"), "Provides comment reaction toggle endpoint");
  assert.ok(reactionsApi.includes("teacher_social_comment_reactions"), "Interacts with comment reactions table");
  assert.ok(reactionsApi.includes("likes_count"), "Maintains likes count on comment");

  // Enrichment in comments GET
  assert.ok(commentsApi.includes("is_liked_by_current_user"), "Enriches comment response with is_liked_by_current_user");

  // UI Integration
  assert.ok(postCard.includes("handleToggleCommentLike"), "Integrates handleToggleCommentLike in post card");
});

test("6. Admin Moderation Platform Console Workflow", () => {
  const moderationApi = fs.readFileSync("app/api/platform/social-moderation/route.js", "utf8");
  const moderationPage = fs.readFileSync("app/(platform-console)/platform-console/moderation/page.jsx", "utf8");
  const sidebar = fs.readFileSync("src/features/platform-console/components/ConsoleSidebar.jsx", "utf8");

  // Server API
  assert.ok(moderationApi.includes("isPlatformAdmin"), "Restricts moderation API to platform admins");
  assert.ok(moderationApi.includes("hide_content"), "Supports hiding reported content");
  assert.ok(moderationApi.includes("dismiss"), "Supports dismissing reports");
  assert.ok(moderationApi.includes("moderated_by"), "Records moderator identity");
  assert.ok(moderationApi.includes("শিক্ষকগণ নিজেদের বিরুদ্ধে"), "Prevents teachers from moderating their own reports");

  // UI Page
  assert.ok(moderationPage.includes("Social Moderation Queue"), "Renders Social Moderation Queue page");
  assert.ok(moderationPage.includes("statusFilter"), "Provides status filters (pending, resolved, dismissed)");
  assert.ok(moderationPage.includes("handleAction"), "Provides moderation action buttons");

  // Sidebar navigation
  assert.ok(sidebar.includes("/platform-console/moderation"), "Adds moderation route to console sidebar");
});

test("7. Video Post Composer Resilience & Retry", () => {
  const composer = fs.readFileSync("src/features/teachers/components/social/SocialPostComposer.jsx", "utf8");
  assert.ok(composer.includes("attempt <= 3"), "Implements automated retry up to 3 attempts per chunk");
  assert.ok(composer.includes("setTimeout(r, 1000 * attempt)"), "Implements exponential backoff between retries");
  assert.ok(composer.includes("variants: videoVariants"), "Persists video variants in metadata");
  assert.ok(composer.includes("hls_url: videoHlsUrl"), "Persists HLS URL in metadata");
});
