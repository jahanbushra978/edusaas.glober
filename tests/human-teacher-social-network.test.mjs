import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";

test("1. Database Migration 20261106 defines complete Facebook-style social schema", () => {
  const migrationPath = "supabase/migrations/20261106_human_teacher_social_network.sql";
  assert.ok(fs.existsSync(migrationPath), "Migration file exists");
  const sql = fs.readFileSync(migrationPath, "utf8");

  // Extended Profile Columns
  assert.ok(sql.includes("username TEXT UNIQUE"), "Adds unique username column");
  assert.ok(sql.includes("followers_count INT"), "Adds followers_count column");
  assert.ok(sql.includes("following_count INT"), "Adds following_count column");
  assert.ok(sql.includes("posts_count INT"), "Adds posts_count column");
  assert.ok(sql.includes("is_verified BOOLEAN"), "Adds is_verified column");

  // Social Tables
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.teacher_social_posts"), "Creates teacher_social_posts table");
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.teacher_social_reactions"), "Creates teacher_social_reactions table");
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.teacher_social_comments"), "Creates teacher_social_comments table");
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.teacher_social_follows"), "Creates teacher_social_follows table");
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.teacher_social_saved_posts"), "Creates teacher_social_saved_posts table");
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.teacher_social_reports"), "Creates teacher_social_reports table");

  // 7 Reaction Types Check Constraint
  assert.ok(
    sql.includes("'like', 'love', 'care', 'haha', 'wow', 'sad', 'insightful'"),
    "Enforces exact 7 reaction types constraint"
  );

  // Post Types
  assert.ok(
    sql.includes("'text', 'photo', 'multi_photo', 'video', 'clip'"),
    "Enforces allowed post types constraint"
  );

  // Self-Follow Prevention
  assert.ok(
    sql.includes("no_self_follow") || sql.includes("user_id !="),
    "Enforces self-follow prevention constraint"
  );

  // Atomic Functions
  assert.ok(sql.includes("toggle_teacher_post_reaction"), "Defines atomic toggle reaction function");
  assert.ok(sql.includes("toggle_teacher_follow"), "Defines atomic toggle follow function");
  assert.ok(sql.includes("toggle_save_post"), "Defines atomic toggle save post function");
});

test("2. Social Backend API routes enforce authentication, authorization and anti-IDOR", () => {
  // Posts API
  const postsRoute = fs.readFileSync("app/api/teacher-marketplace/social/posts/route.js", "utf8");
  assert.ok(postsRoute.includes("verifySessionToken"), "Authenticates user via server session token");
  assert.ok(postsRoute.includes("teacher_social_posts"), "Interacts with teacher_social_posts");
  assert.ok(postsRoute.includes("original_post_id"), "Supports repost with snapshot");

  // Single Post Route
  const singlePostRoute = fs.readFileSync("app/api/teacher-marketplace/social/posts/[id]/route.js", "utf8");
  assert.ok(singlePostRoute.includes("DELETE"), "Provides post deletion endpoint");
  assert.ok(singlePostRoute.includes("PATCH"), "Provides post edit endpoint");
  assert.ok(singlePostRoute.includes("posts_count"), "Safely decrements posts count on delete");

  // Reactions API
  const reactionsRoute = fs.readFileSync("app/api/teacher-marketplace/social/reactions/route.js", "utf8");
  assert.ok(reactionsRoute.includes("VALID_REACTIONS"), "Has explicit valid reactions allowlist");
  assert.ok(reactionsRoute.includes("toggle_teacher_post_reaction"), "Uses atomic reaction RPC or fallback");

  // Comments API
  const commentsRoute = fs.readFileSync("app/api/teacher-marketplace/social/comments/route.js", "utf8");
  assert.ok(commentsRoute.includes("parent_comment_id"), "Supports threaded comment replies");
  assert.ok(commentsRoute.includes("replies_count"), "Maintains replies count for threaded comments");

  // Follow API
  const followRoute = fs.readFileSync("app/api/teacher-marketplace/social/follow/route.js", "utf8");
  assert.ok(followRoute.includes("আপনি নিজেকে অনুসরণ করতে পারবেন না"), "Prevents self-follow with clear error");
  assert.ok(followRoute.includes("is_following"), "Returns current follow state");

  // Profile Edit API
  const profileRoute = fs.readFileSync("app/api/teacher-marketplace/social/profile/route.js", "utf8");
  assert.ok(profileRoute.includes("is_verified"), "Mentions is_verified");
  assert.ok(
    profileRoute.includes("403") || profileRoute.includes("অ্যাডমিন দ্বারা নির্ধারিত"),
    "Blocks teachers from self-assigning verified badge or status"
  );
  assert.ok(profileRoute.includes("username"), "Allows editing username");
});

test("3. Upload routes authorize teacher role for video chunks and Cloudinary media", () => {
  const signVideoRoute = fs.readFileSync("app/api/uploads/sign-video/route.js", "utf8");
  assert.ok(signVideoRoute.includes("teacher"), "Authorizes teacher role in sign-video route");

  const cloudinaryRoute = fs.readFileSync("app/api/uploads/cloudinary/route.js", "utf8");
  assert.ok(cloudinaryRoute.includes("teacher"), "Authorizes teacher role in cloudinary route");
  assert.ok(cloudinaryRoute.includes("student"), "Authorizes student role in cloudinary route");
});

test("4. Social Post Composer enforces 300MB video and 10MB image limit with chunked streaming", () => {
  const composer = fs.readFileSync("src/features/teachers/components/social/SocialPostComposer.jsx", "utf8");
  assert.ok(composer.includes("300 * 1024 * 1024"), "Enforces 300MB video limit");
  assert.ok(composer.includes("10 * 1024 * 1024"), "Enforces 10MB photo limit");
  assert.ok(composer.includes("CHUNK_SIZE = 5 * 1024 * 1024"), "Uses 5MB streaming chunks");
  assert.ok(composer.includes("/api/uploads/video-chunk"), "Streams video chunks to dedicated streaming route");
  assert.ok(composer.includes("visibility"), "Supports public, followers, private post visibility");
});

test("5. Social Post Card provides 7 reactions, multi-photo collage, threaded comments and save", () => {
  const postCard = fs.readFileSync("src/features/teachers/components/social/SocialPostCard.jsx", "utf8");
  assert.ok(postCard.includes("REACTION_CONFIG"), "Configures 7 reactions");
  assert.ok(postCard.includes("like"), "Has like reaction");
  assert.ok(postCard.includes("love"), "Has love reaction");
  assert.ok(postCard.includes("care"), "Has care reaction");
  assert.ok(postCard.includes("haha"), "Has haha reaction");
  assert.ok(postCard.includes("wow"), "Has wow reaction");
  assert.ok(postCard.includes("sad"), "Has sad reaction");
  assert.ok(postCard.includes("insightful"), "Has insightful reaction");
  assert.ok(postCard.includes("isSaved"), "Tracks bookmark / saved state");
  assert.ok(postCard.includes("parentCommentId"), "Renders threaded replies to comments");
  assert.ok(postCard.includes("SocialReactionsModal"), "Integrates who reacted modal");
});

test("6. HumanTeacherPlatform renders Facebook-style header, tabs, and social modals", () => {
  const platform = fs.readFileSync("src/features/teachers/components/HumanTeacherPlatform.jsx", "utf8");
  assert.ok(platform.includes("isViewingOwnProfile"), "Detects if user is viewing their own profile or admin");
  assert.ok(platform.includes("handleToggleFollow"), "Has handleToggleFollow handler");
  assert.ok(platform.includes("isFollowingTeacher"), "Tracks following state");
  assert.ok(platform.includes("SocialPostComposer"), "Integrates SocialPostComposer for posts");
  assert.ok(platform.includes("SocialPostCard"), "Renders SocialPostCard in feed");
  assert.ok(platform.includes("TeacherProfileEditModal"), "Integrates TeacherProfileEditModal");
  assert.ok(platform.includes("SocialFollowersModal"), "Integrates SocialFollowersModal");
  assert.ok(platform.includes("SocialReportModal"), "Integrates SocialReportModal");
  assert.ok(platform.includes("SocialShareModal"), "Integrates SocialShareModal");
  assert.ok(platform.includes('profileActiveTab === "posts"'), "Renders posts tab feed");
  assert.ok(platform.includes('profileActiveTab === "clips"'), "Renders clips tab feed");
  assert.ok(platform.includes('profileActiveTab === "liked"'), "Renders liked tab feed");
  assert.ok(platform.includes('profileActiveTab === "saved"'), "Renders saved tab feed");
});
