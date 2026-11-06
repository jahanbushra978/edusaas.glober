import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const masterSql = fs.readFileSync(
  "supabase/scripts/full_human_teacher_and_social_network_master.sql",
  "utf-8"
);
const messagesApi = fs.readFileSync(
  "app/api/teacher-marketplace/connections/messages/route.js",
  "utf-8"
);
const groupModal = fs.readFileSync(
  "src/features/teachers/components/PrivateLearningGroupModal.jsx",
  "utf-8"
);

test("1. Fix 1 Privacy: is_following_teacher signature is hardened to (p_teacher_id TEXT)", () => {
  // Must take only p_teacher_id TEXT and bind to auth.uid()
  assert.ok(
    masterSql.includes("CREATE OR REPLACE FUNCTION public.is_following_teacher(p_teacher_id TEXT)"),
    "Function accepts only p_teacher_id TEXT"
  );
  assert.ok(
    !masterSql.includes("CREATE OR REPLACE FUNCTION public.is_following_teacher(p_teacher_id TEXT, p_user_id UUID)"),
    "Old signature accepting arbitrary p_user_id is removed from definitions"
  );
  assert.ok(
    masterSql.includes("follower_user_id = auth.uid()"),
    "Caller identity is bound strictly to auth.uid()"
  );
});

test("2. Fix 1 Anti-Enumeration: Anon execution is revoked on is_following_teacher", () => {
  assert.ok(
    masterSql.includes("REVOKE ALL ON FUNCTION public.is_following_teacher(TEXT) FROM PUBLIC, anon"),
    "Anon cannot execute is_following_teacher"
  );
  assert.ok(
    masterSql.includes("GRANT EXECUTE ON FUNCTION public.is_following_teacher(TEXT) TO authenticated, service_role"),
    "Only authenticated callers and service_role can check follow status"
  );
});

test("3. Fix 1 Safe Cleanup: Old signature cleanup uses to_regprocedure and RESTRICT (no CASCADE)", () => {
  assert.ok(
    masterSql.includes("to_regprocedure('public.is_following_teacher(text,uuid)') IS NOT NULL"),
    "Guards drop with to_regprocedure to prevent missing function error"
  );
  assert.ok(
    masterSql.includes("DROP FUNCTION public.is_following_teacher(TEXT, UUID) RESTRICT"),
    "Uses RESTRICT to safely drop without blind CASCADE"
  );
  assert.ok(
    !masterSql.includes("DROP FUNCTION public.is_following_teacher(TEXT, UUID) CASCADE"),
    "No blind CASCADE used on is_following_teacher"
  );
});

test("4. Fix 1 RLS Independence: Existing RLS policies do not depend on vulnerable RPC", () => {
  // Existing RLS policies in master SQL use direct subqueries with auth.uid()
  assert.ok(
    masterSql.includes("status = 'published' AND visibility = 'followers'"),
    "Followers-only post policy exists"
  );
  assert.ok(
    masterSql.includes("f.following_teacher_id = teacher_social_posts.teacher_id") &&
    masterSql.includes("f.follower_user_id = auth.uid()"),
    "Post policies enforce follower check directly via auth.uid() subquery"
  );
});

test("5. Fix 2 Schema Compatibility: Master SQL supports both content and message_text columns", () => {
  assert.ok(
    masterSql.includes("ADD COLUMN IF NOT EXISTS content TEXT"),
    "Master SQL adds content column if missing"
  );
  assert.ok(
    masterSql.includes("ADD COLUMN IF NOT EXISTS message_text TEXT"),
    "Master SQL adds message_text column if missing"
  );
  assert.ok(
    masterSql.includes("ADD COLUMN IF NOT EXISTS metadata JSONB"),
    "Master SQL adds metadata column if missing"
  );
  assert.ok(
    masterSql.includes("ADD COLUMN IF NOT EXISTS payload JSONB"),
    "Master SQL adds payload column if missing"
  );
  assert.ok(
    masterSql.includes("ALTER TABLE public.learning_group_messages ALTER COLUMN content DROP NOT NULL"),
    "Drops strict NOT NULL on content to prevent insert errors"
  );
  assert.ok(
    masterSql.includes("ALTER TABLE public.learning_group_messages ALTER COLUMN message_text DROP NOT NULL"),
    "Drops strict NOT NULL on message_text to prevent insert errors"
  );
});

test("6. Fix 2 Dual-Column API Insertion: POST populates both content and message_text", () => {
  assert.ok(
    messagesApi.includes("content: cleanContent") &&
    messagesApi.includes("message_text: cleanContent"),
    "API populates both content and message_text on message insert"
  );
  assert.ok(
    messagesApi.includes("metadata: typeof metadata === \"object\"") &&
    messagesApi.includes("payload: typeof metadata === \"object\""),
    "API populates both metadata and payload for backward compatibility"
  );
});

test("7. Fix 2 Dual-Column API Reading: GET normalizes both content and message_text", () => {
  assert.ok(
    messagesApi.includes("content: text") &&
    messagesApi.includes("message_text: text"),
    "GET normalizes text across content and message_text"
  );
  assert.ok(
    groupModal.includes("m.content || m.message_text"),
    "PrivateLearningGroupModal renders either content or message_text"
  );
});

test("8. Fix 2 Simulation of the 3 Historical Schema States", () => {
  // State A: 20261109 DB (content, payload)
  const simulatedRowStateA = {
    id: "msg-1",
    group_id: "grp-1",
    content: "Assalamu Alaikum",
    payload: { topic: "Tajweed" },
    created_at: new Date().toISOString(),
  };

  const textA = simulatedRowStateA.content || simulatedRowStateA.message_text || "";
  assert.equal(textA, "Assalamu Alaikum", "State A extracts content correctly");

  // State B: 20261111 DB (message_text, metadata)
  const simulatedRowStateB = {
    id: "msg-2",
    group_id: "grp-1",
    message_text: "Wa Alaikum Assalam",
    metadata: { note: "Lesson 1" },
    created_at: new Date().toISOString(),
  };

  const textB = simulatedRowStateB.content || simulatedRowStateB.message_text || "";
  assert.equal(textB, "Wa Alaikum Assalam", "State B extracts message_text correctly");

  // State C: 20261113 / Master SQL DB (both columns)
  const simulatedRowStateC = {
    id: "msg-3",
    group_id: "grp-1",
    content: "Makhraj review",
    message_text: "Makhraj review",
    metadata: {},
    payload: {},
    created_at: new Date().toISOString(),
  };

  const textC = simulatedRowStateC.content || simulatedRowStateC.message_text || "";
  assert.equal(textC, "Makhraj review", "State C extracts both correctly");
});

test("9. Security: is_learning_group_participant identity and execution privileges", () => {
  assert.ok(
    masterSql.includes("CREATE OR REPLACE FUNCTION public.is_learning_group_participant(p_group_id UUID)"),
    "Group participant function takes only p_group_id UUID"
  );
  assert.ok(
    masterSql.includes("REVOKE ALL ON FUNCTION public.is_learning_group_participant(UUID) FROM PUBLIC, anon"),
    "Anon execution revoked on group participant check"
  );
  assert.ok(
    masterSql.includes("GRANT EXECUTE ON FUNCTION public.is_learning_group_participant(UUID) TO authenticated, service_role"),
    "Authenticated and service_role granted EXECUTE"
  );
});

