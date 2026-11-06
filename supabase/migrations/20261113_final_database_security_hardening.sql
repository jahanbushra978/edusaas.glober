-- ==============================================================================
-- 📖 RAHMANIA INSTITUTE & GLOBAL EDUCATION SOCIAL NETWORK
-- Forward Migration: 20261113_final_database_security_hardening.sql
--
-- PURPOSE:
-- Final Targeted PostgreSQL Database Security Hardening:
-- 1. Safely drops dependent policies first, then drops old function overload using RESTRICT
--    (avoids unintended cascade drops while preventing dependency halt errors).
-- 2. Hardens `is_learning_group_participant(p_group_id UUID)`:
--    - Derives identity strictly via auth.uid() internally.
--    - Enforces g.is_active = true and c.status = 'accepted'.
--    - Verifies g.teacher_id = c.teacher_id and g.student_id = c.student_id.
--    - Verifies teacher status is currently 'approved'.
-- 3. Closes Post Visibility & Engagement Leak on reactions and comments:
--    - Replaces open USING (true) on teacher_social_reactions and teacher_social_comments
--      with parent-post visibility validation (private and followers-only engagement
--      cannot be scraped directly via PostgREST).
-- 4. Complete direct write lockdown:
--    - Revokes direct INSERT, UPDATE, DELETE on teacher_social_posts from authenticated.
--    - Revokes ALL client access on teacher_social_reports (100% private to Service Role).
--    - Revokes direct mutations on reactions, comments, comment reactions, follows.
-- 5. Secure public_student_directory view:
--    - Excludes user_id and private authentication credentials.
--    - Restricts raw public_student_profiles SELECT to own record (user_id = auth.uid()).
--
-- INVARIANTS:
-- - 100% forward-only and idempotent.
-- - Never deletes social posts or student records.
-- - Never touches financial records or wallet ledgers.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SAFE DEPENDENCY-ORDERED FUNCTION REMOVAL (RESTRICT)
-- ------------------------------------------------------------------------------

-- Step 1.1: Guarded cleanup of old function and dependent policies
-- If migration 20261112 already dropped the function, REVOKE won't fail with ERROR 42883.
DO $$
BEGIN
  -- Explicitly drop dependent RLS policies referencing the old two-argument signature
  DROP POLICY IF EXISTS "Participants can view group messages" ON public.learning_group_messages;
  DROP POLICY IF EXISTS "Participants can post group messages" ON public.learning_group_messages;
  DROP POLICY IF EXISTS "Participants can view private assistant group" ON public.learning_assistant_groups;

  -- Guarded revoke and drop: only executed if the old function signature still exists in catalog
  IF to_regprocedure('public.is_learning_group_participant(uuid,uuid)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.is_learning_group_participant(UUID, UUID) FROM PUBLIC, anon, authenticated';
    EXECUTE 'DROP FUNCTION public.is_learning_group_participant(UUID, UUID) RESTRICT';
  END IF;
END $$;

-- Step 1.4: Define the authoritative single-argument function
CREATE OR REPLACE FUNCTION public.is_learning_group_participant(p_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.learning_assistant_groups g
    JOIN public.learning_connections c ON c.id = g.connection_id
    WHERE g.id = p_group_id
      AND g.is_active = true
      AND c.status = 'accepted'
      AND g.teacher_id = c.teacher_id
      AND g.student_id = c.student_id
      AND (
        -- Authenticated caller is the Student in this group and connection
        (
          g.student_id = auth.uid()::text
          OR g.student_id IN (
            SELECT psp.id::text 
            FROM public.public_student_profiles psp 
            WHERE psp.user_id = auth.uid()
          )
          OR g.student_id IN (
            SELECT psp.student_public_id 
            FROM public.public_student_profiles psp 
            WHERE psp.user_id = auth.uid()
          )
        )
        -- Authenticated caller is the Teacher in this group and connection (and approved)
        OR (
          (
            g.teacher_id = auth.uid()::text
            OR g.teacher_id IN (
              SELECT tmp.id 
              FROM public.teacher_marketplace_profiles tmp 
              WHERE tmp.user_id = auth.uid() 
                AND tmp.status = 'approved'
            )
            OR g.teacher_id IN (
              SELECT tmp.teacher_id 
              FROM public.teacher_marketplace_profiles tmp 
              WHERE tmp.user_id = auth.uid() 
                AND tmp.status = 'approved'
            )
          )
        )
      )
  );
$$;

-- Step 1.5: Restrict execution strictly to authenticated and service_role
REVOKE ALL ON FUNCTION public.is_learning_group_participant(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_learning_group_participant(UUID) TO authenticated, service_role;

-- Step 1.6: Re-attach hardened group and message SELECT policies
CREATE POLICY "Participants can view private assistant group" ON public.learning_assistant_groups
  FOR SELECT TO authenticated
  USING (
    public.is_learning_group_participant(id)
  );

CREATE POLICY "Participants can view group messages" ON public.learning_group_messages
  FOR SELECT TO authenticated
  USING (
    public.is_learning_group_participant(group_id)
  );


-- ------------------------------------------------------------------------------
-- 2. SOCIAL POST VISIBILITY & ENGAGEMENT PRIVACY LEAK CLOSURE
-- ------------------------------------------------------------------------------

-- A) Reactions: Engagement visible ONLY if parent post is visible to caller
DROP POLICY IF EXISTS "Public view reactions" ON public.teacher_social_reactions;
DROP POLICY IF EXISTS "Visible post reactions only" ON public.teacher_social_reactions;

CREATE POLICY "Visible post reactions only" ON public.teacher_social_reactions
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_social_posts p
      WHERE p.id = teacher_social_reactions.post_id
        AND (
          (p.status = 'published' AND p.visibility = 'public')
          OR (p.author_user_id = auth.uid())
          OR (
            p.status = 'published' AND p.visibility = 'followers'
            AND EXISTS (
              SELECT 1 FROM public.teacher_social_follows f
              WHERE f.following_teacher_id = p.teacher_id
                AND f.follower_user_id = auth.uid()
            )
          )
        )
    )
  );

-- B) Comments: Visible ONLY if status = 'active' AND parent post is visible to caller
DROP POLICY IF EXISTS "Public view active comments" ON public.teacher_social_comments;
DROP POLICY IF EXISTS "Visible post active comments only" ON public.teacher_social_comments;

CREATE POLICY "Visible post active comments only" ON public.teacher_social_comments
  FOR SELECT TO public
  USING (
    status = 'active'
    AND EXISTS (
      SELECT 1 FROM public.teacher_social_posts p
      WHERE p.id = teacher_social_comments.post_id
        AND (
          (p.status = 'published' AND p.visibility = 'public')
          OR (p.author_user_id = auth.uid())
          OR (
            p.status = 'published' AND p.visibility = 'followers'
            AND EXISTS (
              SELECT 1 FROM public.teacher_social_follows f
              WHERE f.following_teacher_id = p.teacher_id
                AND f.follower_user_id = auth.uid()
            )
          )
        )
    )
  );

-- C) Comment Reactions: Visible ONLY if parent comment and post are visible
DROP POLICY IF EXISTS "Public view comment reactions" ON public.teacher_social_comment_reactions;
DROP POLICY IF EXISTS "Visible comment reactions only" ON public.teacher_social_comment_reactions;

CREATE POLICY "Visible comment reactions only" ON public.teacher_social_comment_reactions
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_social_comments c
      JOIN public.teacher_social_posts p ON p.id = c.post_id
      WHERE c.id = teacher_social_comment_reactions.comment_id
        AND c.status = 'active'
        AND (
          (p.status = 'published' AND p.visibility = 'public')
          OR (p.author_user_id = auth.uid())
          OR (
            p.status = 'published' AND p.visibility = 'followers'
            AND EXISTS (
              SELECT 1 FROM public.teacher_social_follows f
              WHERE f.following_teacher_id = p.teacher_id
                AND f.follower_user_id = auth.uid()
            )
          )
        )
    )
  );


-- ------------------------------------------------------------------------------
-- 3. COMPLETE DIRECT WRITE LOCKDOWN ON ALL SOCIAL TABLES
-- ------------------------------------------------------------------------------

-- Teacher Posts: Revoke direct writes from PUBLIC, anon, and authenticated
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_posts FROM PUBLIC, anon, authenticated;

-- Reports: Revoke ALL direct client access (100% private moderation queue)
REVOKE ALL ON public.teacher_social_reports FROM PUBLIC, anon, authenticated;

-- Engagement mutations: Mediated exclusively via Next.js Server APIs
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_reactions FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_comments FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_comment_reactions FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_follows FROM PUBLIC, anon, authenticated;

-- Learning connections & groups direct mutations: Revoked from all client roles
REVOKE INSERT, UPDATE, DELETE ON public.learning_connections FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.learning_assistant_groups FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.learning_group_messages FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.social_stories FROM PUBLIC, anon, authenticated;


-- ------------------------------------------------------------------------------
-- 4. PUBLIC STUDENT DIRECTORY VIEW & COLUMN PRIVACY
-- ------------------------------------------------------------------------------

-- Ensure public directory view exists and strictly omits user_id and internal profile id UUID
CREATE OR REPLACE VIEW public.public_student_directory AS
  SELECT 
    student_public_id,
    username,
    display_name,
    avatar_url,
    cover_url,
    bio,
    learning_interests,
    followers_count,
    following_count,
    is_discoverable,
    created_at
  FROM public.public_student_profiles
  WHERE is_discoverable = true;

REVOKE ALL ON public.public_student_directory FROM PUBLIC;
GRANT SELECT ON public.public_student_directory TO anon, authenticated, service_role;

-- Revoke direct mutations and anonymous SELECT on raw table
REVOKE INSERT, UPDATE, DELETE ON public.public_student_profiles FROM PUBLIC, anon, authenticated;
REVOKE SELECT ON public.public_student_profiles FROM PUBLIC, anon;

DROP POLICY IF EXISTS "Students can view their own profile record" ON public.public_student_profiles;
CREATE POLICY "Students can view their own profile record" ON public.public_student_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

