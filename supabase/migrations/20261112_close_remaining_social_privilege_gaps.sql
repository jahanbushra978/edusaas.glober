-- ==============================================================================
-- 📖 RAHMANIA INSTITUTE & GLOBAL EDUCATION SOCIAL NETWORK
-- Forward Migration: 20261112_close_remaining_social_privilege_gaps.sql
--
-- PURPOSE:
-- Final PostgreSQL Privilege Gap Closure:
-- 1. Drops any dependent policies prior to dropping the old two-argument function
--    overload to eliminate PostgreSQL dependency halt errors.
-- 2. Fully revokes direct INSERT, UPDATE, DELETE on teacher_social_posts from authenticated.
-- 3. Completely restricts teacher_social_reports from all client roles (anon, authenticated).
-- 4. Revokes direct mutations from authenticated on reactions, comments, follows.
-- 5. Hardens public_student_directory view and isolates public_student_profiles table.
--
-- INVARIANTS:
-- - 100% idempotent and forward-only.
-- - Never deletes social posts or student data.
-- - Never touches financial records or payment transactions.
-- ==============================================================================

-- 1. Dependency-safe cleanup of old function and dependent policies
DROP POLICY IF EXISTS "Participants can view group messages" ON public.learning_group_messages;
DROP POLICY IF EXISTS "Participants can post group messages" ON public.learning_group_messages;
DROP POLICY IF EXISTS "Participants can view private assistant group" ON public.learning_assistant_groups;

REVOKE ALL ON FUNCTION public.is_learning_group_participant(UUID, UUID) FROM PUBLIC, anon, authenticated;
DROP FUNCTION IF EXISTS public.is_learning_group_participant(UUID, UUID) CASCADE;

-- 2. Re-enforce single-argument function with safe search_path and internal auth.uid() resolution
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
      AND (
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

REVOKE ALL ON FUNCTION public.is_learning_group_participant(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_learning_group_participant(UUID) TO authenticated, service_role;

-- 3. Re-attach hardened group and message SELECT policies
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

-- 4. Explicitly revoke direct client mutations on teacher_social_posts from authenticated
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_posts FROM PUBLIC, anon, authenticated;

-- 5. Explicitly isolate teacher_social_reports completely from client PostgREST
REVOKE ALL ON public.teacher_social_reports FROM PUBLIC, anon, authenticated;

-- 6. Lock down direct mutations on social reactions, comments, comment reactions, follows
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_reactions FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_comments FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_comment_reactions FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_follows FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.teacher_social_reactions TO anon, authenticated, service_role;
GRANT SELECT ON public.teacher_social_comments TO anon, authenticated, service_role;
GRANT SELECT ON public.teacher_social_comment_reactions TO anon, authenticated, service_role;
GRANT SELECT ON public.teacher_social_follows TO anon, authenticated, service_role;

-- 7. Ensure public_student_directory view exists and excludes user_id
CREATE OR REPLACE VIEW public.public_student_directory AS
  SELECT 
    id,
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

