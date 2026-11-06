-- ==============================================================================
-- 📖 RAHMANIA INSTITUTE & GLOBAL EDUCATION SOCIAL NETWORK
-- Forward Migration: 20261110_harden_global_education_social_security.sql
--
-- PURPOSE:
-- Fix RLS policy mismatches where teacher_id was compared directly to auth.uid()::text
-- instead of mapping via teacher_marketplace_profiles.user_id = auth.uid().
-- Similarly resolve student_id via public_student_profiles.user_id = auth.uid().
--
-- INVARIANTS:
-- - Safe forward migration. Never drops columns or disrupts existing tables.
-- - Strictly separates Global Public Students from institutional madrasa tenants.
-- - Idempotent (IF EXISTS / IF NOT EXISTS) for pristine execution in all environments.
-- ==============================================================================

-- 1. Performance Indexes & Constraints
CREATE UNIQUE INDEX IF NOT EXISTS uq_public_student_profiles_user_id
  ON public.public_student_profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_teacher_marketplace_profiles_user_id
  ON public.teacher_marketplace_profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_assistant_groups_composite
  ON public.learning_assistant_groups (id, teacher_id, student_id);

-- 2. Helper Security Function to check Group Participation
CREATE OR REPLACE FUNCTION public.is_learning_group_participant(p_group_id UUID, p_auth_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.learning_assistant_groups g
    WHERE g.id = p_group_id
      AND (
        -- Check Student Match
        g.student_id = p_auth_uid::text
        OR g.student_id IN (
          SELECT psp.id::text FROM public.public_student_profiles psp WHERE psp.user_id = p_auth_uid
        )
        OR g.student_id IN (
          SELECT psp.student_public_id FROM public.public_student_profiles psp WHERE psp.user_id = p_auth_uid
        )
        -- Check Teacher Match
        OR g.teacher_id = p_auth_uid::text
        OR g.teacher_id IN (
          SELECT tmp.id FROM public.teacher_marketplace_profiles tmp WHERE tmp.user_id = p_auth_uid
        )
        OR g.teacher_id IN (
          SELECT tmp.teacher_id FROM public.teacher_marketplace_profiles tmp WHERE tmp.user_id = p_auth_uid
        )
      )
  );
$$;

-- 3. Hardened RLS: learning_connections
DROP POLICY IF EXISTS "Participants can view their connections" ON public.learning_connections;
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

-- 4. Hardened RLS: learning_assistant_groups
DROP POLICY IF EXISTS "Participants can view private assistant group" ON public.learning_assistant_groups;
CREATE POLICY "Participants can view private assistant group" ON public.learning_assistant_groups
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()::text OR
    student_id IN (SELECT id::text FROM public.public_student_profiles WHERE user_id = auth.uid()) OR
    student_id IN (SELECT student_public_id FROM public.public_student_profiles WHERE user_id = auth.uid()) OR
    teacher_id = auth.uid()::text OR
    teacher_id IN (SELECT id FROM public.teacher_marketplace_profiles WHERE user_id = auth.uid()) OR
    teacher_id IN (SELECT teacher_id FROM public.teacher_marketplace_profiles WHERE user_id = auth.uid())
  );

-- 5. Hardened RLS: learning_group_messages
DROP POLICY IF EXISTS "Participants can view group messages" ON public.learning_group_messages;
CREATE POLICY "Participants can view group messages" ON public.learning_group_messages
  FOR SELECT TO authenticated
  USING (
    public.is_learning_group_participant(learning_group_messages.group_id, auth.uid())
  );

DROP POLICY IF EXISTS "Participants can post group messages" ON public.learning_group_messages;
CREATE POLICY "Participants can post group messages" ON public.learning_group_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_learning_group_participant(learning_group_messages.group_id, auth.uid())
  );

-- 6. Hardened RLS: social_stories
DROP POLICY IF EXISTS "Authenticated users can post stories" ON public.social_stories;
CREATE POLICY "Authenticated users can post stories" ON public.social_stories
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()::text OR
    author_id IN (SELECT id FROM public.teacher_marketplace_profiles WHERE user_id = auth.uid()) OR
    author_id IN (SELECT teacher_id FROM public.teacher_marketplace_profiles WHERE user_id = auth.uid()) OR
    author_id IN (SELECT id::text FROM public.public_student_profiles WHERE user_id = auth.uid()) OR
    author_id IN (SELECT student_public_id FROM public.public_student_profiles WHERE user_id = auth.uid())
  );

-- 7. Grant execution on security function
GRANT EXECUTE ON FUNCTION public.is_learning_group_participant(UUID, UUID) TO authenticated, service_role;

