-- ============================================================================
-- Migration: 20261108_enable_student_social_posting.sql
-- Description: Universal Social Network Architecture: Supports both Approved
--              Human Teachers and Authenticated Global Public Students.
--              - Makes teacher_id nullable in teacher_social_posts.
--              - Adds author_role ('teacher', 'student', 'admin').
--              - Authorizes students and teachers to create, edit, and delete
--                their own posts with strict Anti-IDOR ownership checks.
-- ============================================================================

-- 1. Make teacher_id nullable to support Student and Admin authors
ALTER TABLE public.teacher_social_posts
  ALTER COLUMN teacher_id DROP NOT NULL;

-- 2. Add author_role column with strict check constraint
ALTER TABLE public.teacher_social_posts
  ADD COLUMN IF NOT EXISTS author_role TEXT NOT NULL DEFAULT 'teacher'
  CHECK (author_role IN ('teacher', 'student', 'admin'));

-- 3. Add student_id / author_user_id indexing
CREATE INDEX IF NOT EXISTS idx_teacher_social_posts_author_role
  ON public.teacher_social_posts (author_role);

CREATE INDEX IF NOT EXISTS idx_teacher_social_posts_author_user_id
  ON public.teacher_social_posts (author_user_id);

-- 4. Author Ownership & Least-Privilege RLS Policies
-- Authors (both student and teacher) can insert posts bound to their authenticated auth.uid()
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.teacher_social_posts;
CREATE POLICY "Authenticated users can create posts" ON public.teacher_social_posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_user_id);

-- Authors can update their own posts (Anti-IDOR)
DROP POLICY IF EXISTS "Authors can update own posts" ON public.teacher_social_posts;
CREATE POLICY "Authors can update own posts" ON public.teacher_social_posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = author_user_id)
  WITH CHECK (auth.uid() = author_user_id);

-- Authors can delete their own posts (Anti-IDOR)
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.teacher_social_posts;
CREATE POLICY "Authors can delete own posts" ON public.teacher_social_posts
  FOR DELETE TO authenticated
  USING (auth.uid() = author_user_id);

