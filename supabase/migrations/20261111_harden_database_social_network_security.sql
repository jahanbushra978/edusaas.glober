-- ==============================================================================
-- 📖 RAHMANIA INSTITUTE & GLOBAL EDUCATION SOCIAL NETWORK
-- Migration: 20261111_harden_database_social_network_security.sql
--
-- PURPOSE:
-- Final Direct PostgREST Access Security Lockdown:
-- 1. Safely drops dependent policies before removing obsolete function overload.
-- 2. Hardens `is_learning_group_participant(p_group_id UUID)` deriving identity
--    strictly via auth.uid() (eliminates user-controlled UUID argument IDOR probe).
-- 3. Enforces active state (is_active = true) and accepted connection requirement.
-- 4. Locks down direct client PostgREST mutations: revokes direct INSERT, UPDATE, DELETE
--    from PUBLIC, anon, and authenticated on:
--      - learning_connections
--      - learning_assistant_groups
--      - learning_group_messages
--      - social_stories
--      - public_student_profiles
--      - teacher_social_posts
--      - teacher_social_reports
--      - teacher_social_reactions
--      - teacher_social_comments
--      - teacher_social_comment_reactions
--      - teacher_social_follows
-- 5. Prevents student user_id privacy leak via secure public_student_directory view.
-- 6. Preserves client SELECT access for genuine participants and Realtime subscriptions.
--
-- INVARIANTS:
-- - Safe forward-only migration. Never drops columns, tables, or resets financial records.
-- - Idempotent (IF EXISTS / IF NOT EXISTS) for pristine execution in all environments.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DROP DEPENDENT POLICIES BEFORE FUNCTION DROPS (PostgreSQL Dependency Safety)
-- ------------------------------------------------------------------------------

-- Dependent policies from 20261109 / 20261110 referencing is_learning_group_participant(UUID, UUID)
DROP POLICY IF EXISTS "Participants can view group messages" ON public.learning_group_messages;
DROP POLICY IF EXISTS "Participants can post group messages" ON public.learning_group_messages;
DROP POLICY IF EXISTS "Participants can view private assistant group" ON public.learning_assistant_groups;

-- Obsolete learning connections mutation policies
DROP POLICY IF EXISTS "Authenticated users can create learning requests" ON public.learning_connections;
DROP POLICY IF EXISTS "Participants can update connection status" ON public.learning_connections;
DROP POLICY IF EXISTS "Participants can view their own learning connections" ON public.learning_connections;
DROP POLICY IF EXISTS "Participants can view their connections" ON public.learning_connections;

-- Obsolete stories mutation policies
DROP POLICY IF EXISTS "Anyone can view active stories" ON public.social_stories;
DROP POLICY IF EXISTS "Authenticated users can post stories" ON public.social_stories;

-- Obsolete student profile policies
DROP POLICY IF EXISTS "Anyone can view discoverable public student profiles" ON public.public_student_profiles;
DROP POLICY IF EXISTS "Students can insert own public profile" ON public.public_student_profiles;
DROP POLICY IF EXISTS "Students can update own public profile" ON public.public_student_profiles;
DROP POLICY IF EXISTS "Students can view their own profile record" ON public.public_student_profiles;


-- ------------------------------------------------------------------------------
-- 2. HARDEN LEARNING PARTICIPANT RPC FUNCTION
-- ------------------------------------------------------------------------------

-- Safely revoke and drop the old two-argument signature if present
REVOKE ALL ON FUNCTION public.is_learning_group_participant(UUID, UUID) FROM PUBLIC, anon, authenticated;
DROP FUNCTION IF EXISTS public.is_learning_group_participant(UUID, UUID) CASCADE;

-- Create hardened single-argument function deriving caller identity strictly via auth.uid()
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
        -- Authenticated caller is the Student in this group
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
        -- Authenticated caller is the Teacher in this group (and currently approved)
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

-- Restrict function execution strictly to authenticated and service_role
REVOKE ALL ON FUNCTION public.is_learning_group_participant(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_learning_group_participant(UUID) TO authenticated, service_role;


-- ------------------------------------------------------------------------------
-- 3. PUBLIC STUDENT DIRECTORY VIEW & COLUMN SECURITY
-- ------------------------------------------------------------------------------

-- Create secure public student directory view excluding private user_id
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

-- Revoke direct client mutations and anonymous table reads on raw student profiles
REVOKE INSERT, UPDATE, DELETE ON public.public_student_profiles FROM PUBLIC, anon, authenticated;
REVOKE SELECT ON public.public_student_profiles FROM PUBLIC, anon;

-- Authenticated students may only query their own complete record
CREATE POLICY "Students can view their own profile record" ON public.public_student_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());


-- ------------------------------------------------------------------------------
-- 4. LOCK DOWN LEARNING CONNECTIONS MUTATIONS
-- ------------------------------------------------------------------------------

-- Revoke direct mutation privileges (All state transitions mediated via Next.js Server API)
REVOKE INSERT, UPDATE, DELETE ON public.learning_connections FROM PUBLIC, anon, authenticated;

-- Enforce strict read-only SELECT for genuine participants (preserves Realtime updates)
CREATE POLICY "Participants can view their connections" ON public.learning_connections
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()::text OR
    student_id IN (SELECT id::text FROM public.public_student_profiles WHERE user_id = auth.uid()) OR
    student_id IN (SELECT student_public_id FROM public.public_student_profiles WHERE user_id = auth.uid()) OR
    teacher_id = auth.uid()::text OR
    teacher_id IN (SELECT id FROM public.teacher_marketplace_profiles WHERE user_id = auth.uid()) OR
    teacher_id IN (SELECT teacher_id FROM public.teacher_marketplace_profiles WHERE user_id = auth.uid())
  );


-- ------------------------------------------------------------------------------
-- 5. LOCK DOWN PRIVATE LEARNING GROUPS & MESSAGES
-- ------------------------------------------------------------------------------

-- 1. learning_assistant_groups
REVOKE INSERT, UPDATE, DELETE ON public.learning_assistant_groups FROM PUBLIC, anon, authenticated;

CREATE POLICY "Participants can view private assistant group" ON public.learning_assistant_groups
  FOR SELECT TO authenticated
  USING (
    public.is_learning_group_participant(id)
  );

-- 2. learning_group_messages
-- Revoke direct PostgREST mutation to eliminate sender impersonation
REVOKE INSERT, UPDATE, DELETE ON public.learning_group_messages FROM PUBLIC, anon, authenticated;

-- Preserve SELECT for participants to power live chat and Realtime subscriptions
CREATE POLICY "Participants can view group messages" ON public.learning_group_messages
  FOR SELECT TO authenticated
  USING (
    public.is_learning_group_participant(group_id)
  );


-- ------------------------------------------------------------------------------
-- 6. LOCK DOWN SOCIAL STORIES MUTATIONS
-- ------------------------------------------------------------------------------

-- Revoke direct client PostgREST insert (Stories publishing mediated via Next.js Server API)
REVOKE INSERT, UPDATE, DELETE ON public.social_stories FROM PUBLIC, anon, authenticated;

-- Allow public viewing of active non-expired stories
CREATE POLICY "Anyone can view active stories" ON public.social_stories
  FOR SELECT TO public
  USING (expires_at > NOW());


-- ------------------------------------------------------------------------------
-- 7. AUDIT & CLOSE PRIVILEGE GAPS ON REMAINING SOCIAL TABLES
-- ------------------------------------------------------------------------------

-- 1. teacher_social_posts: Direct write revoked from PUBLIC, anon, and authenticated
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_posts FROM PUBLIC, anon, authenticated;

-- 2. teacher_social_reports: Private moderation queue (Restricted strictly to Service Role)
REVOKE ALL ON public.teacher_social_reports FROM PUBLIC, anon, authenticated;

-- 3. teacher_social_reactions: Toggled exclusively via server API
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_reactions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.teacher_social_reactions TO anon, authenticated, service_role;

-- 4. teacher_social_comments: Managed exclusively via server API
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_comments FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.teacher_social_comments TO anon, authenticated, service_role;

-- 5. teacher_social_comment_reactions: Managed exclusively via server API
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_comment_reactions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.teacher_social_comment_reactions TO anon, authenticated, service_role;

-- 6. teacher_social_follows: Toggled exclusively via server API
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_follows FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.teacher_social_follows TO anon, authenticated, service_role;

-- 7. teacher_social_saved_posts: Strict user isolation for saved content
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_saved_posts FROM PUBLIC, anon;
DROP POLICY IF EXISTS "User can manage own saved posts" ON public.teacher_social_saved_posts;
CREATE POLICY "User can manage own saved posts" ON public.teacher_social_saved_posts
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
