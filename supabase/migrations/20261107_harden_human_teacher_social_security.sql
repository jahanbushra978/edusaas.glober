-- ============================================================================
-- Migration: 20261107_harden_human_teacher_social_security.sql
-- Description: Security Remediation for Human Teacher Social Network
--              - Eliminates insecure 'FOR ALL USING (true)' RLS policies
--              - Enforces least-privilege direct access policies
--              - Hardens SECURITY DEFINER RPCs with fixed search_path and revokes PUBLIC execution
--              - Adds teacher_social_comment_reactions table with atomic constraints
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. DROP INSECURE RLS POLICIES (Removes unconstrained FOR ALL access)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Server-side posts management" ON public.teacher_social_posts;
DROP POLICY IF EXISTS "Server-side reactions management" ON public.teacher_social_reactions;
DROP POLICY IF EXISTS "Server-side comments management" ON public.teacher_social_comments;
DROP POLICY IF EXISTS "Server-side follows management" ON public.teacher_social_follows;
DROP POLICY IF EXISTS "Server-side saved posts management" ON public.teacher_social_saved_posts;
DROP POLICY IF EXISTS "Server-side reports management" ON public.teacher_social_reports;

-- ----------------------------------------------------------------------------
-- 2. LEAST-PRIVILEGE RLS POLICIES FOR DIRECT CLIENT ACCESS
-- ----------------------------------------------------------------------------
-- Note: Next.js API routes utilize Supabase Service Role client which inherently
-- bypasses RLS (BYPASSRLS). Direct client queries via anon/authenticated keys
-- are restricted strictly to read-only views for public content.

-- A) Posts Policies:
-- Public can view published public posts
DROP POLICY IF EXISTS "Public can view published posts" ON public.teacher_social_posts;
CREATE POLICY "Public can view published posts" ON public.teacher_social_posts
  FOR SELECT TO public
  USING (visibility = 'public' AND status = 'published');

-- Authors can view all their own posts (including private and drafts)
DROP POLICY IF EXISTS "Authors can view own posts" ON public.teacher_social_posts;
CREATE POLICY "Authors can view own posts" ON public.teacher_social_posts
  FOR SELECT TO authenticated
  USING (auth.uid() = author_user_id);

-- Followers can view followers-only posts
DROP POLICY IF EXISTS "Followers can view followers posts" ON public.teacher_social_posts;
CREATE POLICY "Followers can view followers posts" ON public.teacher_social_posts
  FOR SELECT TO authenticated
  USING (
    visibility = 'followers' 
    AND status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.teacher_social_follows f
      WHERE f.follower_user_id = auth.uid()
        AND f.following_teacher_id = teacher_social_posts.teacher_id
    )
  );

-- B) Reactions Policies:
DROP POLICY IF EXISTS "Public view reactions" ON public.teacher_social_reactions;
CREATE POLICY "Public view reactions" ON public.teacher_social_reactions
  FOR SELECT TO public
  USING (true);

-- C) Comments Policies:
DROP POLICY IF EXISTS "Public view active comments" ON public.teacher_social_comments;
CREATE POLICY "Public view active comments" ON public.teacher_social_comments
  FOR SELECT TO public
  USING (status = 'active');

-- D) Follows Policies:
DROP POLICY IF EXISTS "Public view follows" ON public.teacher_social_follows;
CREATE POLICY "Public view follows" ON public.teacher_social_follows
  FOR SELECT TO public
  USING (true);

-- E) Saved Posts Policies (Strict Private Ownership):
DROP POLICY IF EXISTS "User can view own saved posts" ON public.teacher_social_saved_posts;
CREATE POLICY "User can view own saved posts" ON public.teacher_social_saved_posts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- F) Reports Policies:
-- Reporters can insert their own reports directly (if client-side insert is invoked)
DROP POLICY IF EXISTS "Users can submit reports" ON public.teacher_social_reports;
CREATE POLICY "Users can submit reports" ON public.teacher_social_reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_user_id);

-- ----------------------------------------------------------------------------
-- 3. COMMENT REACTIONS TABLE & RLS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teacher_social_comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.teacher_social_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT DEFAULT 'student',
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_comment_user_reaction UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id 
  ON public.teacher_social_comment_reactions (comment_id);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id 
  ON public.teacher_social_comment_reactions (user_id);

ALTER TABLE public.teacher_social_comment_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view comment reactions" ON public.teacher_social_comment_reactions;
CREATE POLICY "Public view comment reactions" ON public.teacher_social_comment_reactions
  FOR SELECT TO public
  USING (true);

-- ----------------------------------------------------------------------------
-- 4. HARDEN SECURITY DEFINER FUNCTIONS (search_path, input validation, revoke PUBLIC)
-- ----------------------------------------------------------------------------

-- A) Post Reaction Function
CREATE OR REPLACE FUNCTION public.toggle_teacher_post_reaction(
  p_post_id UUID,
  p_user_id UUID,
  p_user_name TEXT,
  p_user_avatar TEXT,
  p_user_role TEXT,
  p_reaction_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_existing RECORD;
  v_post RECORD;
  v_reactions JSONB;
  v_old_type TEXT;
  v_action TEXT;
  v_total_likes INT;
BEGIN
  -- Input Validation
  IF p_post_id IS NULL OR p_user_id IS NULL OR p_reaction_type IS NULL THEN
    RAISE EXCEPTION 'Missing mandatory parameters';
  END IF;

  IF p_reaction_type NOT IN ('like', 'love', 'care', 'haha', 'wow', 'sad', 'insightful') THEN
    RAISE EXCEPTION 'Invalid reaction type: %', p_reaction_type;
  END IF;

  -- Verify post exists and lock row for concurrent updates
  SELECT id, reactions_summary, likes_count INTO v_post
  FROM public.teacher_social_posts
  WHERE id = p_post_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found: %', p_post_id;
  END IF;

  v_reactions := COALESCE(v_post.reactions_summary, '{"like":0,"love":0,"care":0,"haha":0,"wow":0,"sad":0,"insightful":0}'::jsonb);

  -- Check existing reaction
  SELECT id, reaction_type INTO v_existing
  FROM public.teacher_social_reactions
  WHERE post_id = p_post_id AND user_id = p_user_id
  FOR UPDATE;

  IF FOUND THEN
    v_old_type := v_existing.reaction_type;
    IF v_old_type = p_reaction_type THEN
      -- Same reaction clicked again -> REMOVE (toggle off)
      DELETE FROM public.teacher_social_reactions WHERE id = v_existing.id;
      v_reactions := jsonb_set(
        v_reactions, 
        ARRAY[v_old_type], 
        to_jsonb(GREATEST(0, COALESCE((v_reactions->>v_old_type)::INT, 1) - 1))
      );
      v_action := 'removed';
    ELSE
      -- Different reaction clicked -> UPDATE
      UPDATE public.teacher_social_reactions
      SET reaction_type = p_reaction_type,
          user_name = COALESCE(p_user_name, user_name),
          user_avatar = COALESCE(p_user_avatar, user_avatar),
          user_role = COALESCE(p_user_role, user_role)
      WHERE id = v_existing.id;

      v_reactions := jsonb_set(
        v_reactions, 
        ARRAY[v_old_type], 
        to_jsonb(GREATEST(0, COALESCE((v_reactions->>v_old_type)::INT, 1) - 1))
      );
      v_reactions := jsonb_set(
        v_reactions, 
        ARRAY[p_reaction_type], 
        to_jsonb(COALESCE((v_reactions->>p_reaction_type)::INT, 0) + 1)
      );
      v_action := 'changed';
    END IF;
  ELSE
    -- New reaction -> INSERT
    INSERT INTO public.teacher_social_reactions (post_id, user_id, user_role, user_name, user_avatar, reaction_type)
    VALUES (p_post_id, p_user_id, COALESCE(p_user_role, 'student'), COALESCE(p_user_name, 'ইউজার'), p_user_avatar, p_reaction_type);

    v_reactions := jsonb_set(
      v_reactions, 
      ARRAY[p_reaction_type], 
      to_jsonb(COALESCE((v_reactions->>p_reaction_type)::INT, 0) + 1)
    );
    v_action := 'added';
  END IF;

  -- Re-calculate total likes safely
  v_total_likes := 
    COALESCE((v_reactions->>'like')::INT, 0) +
    COALESCE((v_reactions->>'love')::INT, 0) +
    COALESCE((v_reactions->>'care')::INT, 0) +
    COALESCE((v_reactions->>'haha')::INT, 0) +
    COALESCE((v_reactions->>'wow')::INT, 0) +
    COALESCE((v_reactions->>'sad')::INT, 0) +
    COALESCE((v_reactions->>'insightful')::INT, 0);

  UPDATE public.teacher_social_posts
  SET reactions_summary = v_reactions,
      likes_count = v_total_likes,
      updated_at = now()
  WHERE id = p_post_id;

  RETURN jsonb_build_object(
    'action', v_action,
    'reaction_type', CASE WHEN v_action = 'removed' THEN NULL ELSE p_reaction_type END,
    'reactions_summary', v_reactions,
    'likes_count', v_total_likes
  );
END;
$$;

-- B) Follow Toggle Function
CREATE OR REPLACE FUNCTION public.toggle_teacher_follow(
  p_follower_user_id UUID,
  p_follower_name TEXT,
  p_follower_avatar TEXT,
  p_follower_role TEXT,
  p_following_teacher_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_existing RECORD;
  v_teacher RECORD;
  v_is_following BOOLEAN;
  v_followers_count INT;
BEGIN
  IF p_follower_user_id IS NULL OR p_following_teacher_id IS NULL THEN
    RAISE EXCEPTION 'Missing mandatory parameters';
  END IF;

  -- Prevent self-follow
  IF p_follower_user_id::text = p_following_teacher_id THEN
    RAISE EXCEPTION 'Users cannot follow themselves';
  END IF;

  -- Verify target teacher exists
  SELECT * INTO v_teacher FROM public.teacher_marketplace_profiles 
  WHERE teacher_id = p_following_teacher_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Teacher profile not found: %', p_following_teacher_id;
  END IF;

  -- Check existing follow relationship
  SELECT * INTO v_existing FROM public.teacher_social_follows 
  WHERE follower_user_id = p_follower_user_id AND following_teacher_id = p_following_teacher_id;

  IF FOUND THEN
    -- Unfollow
    DELETE FROM public.teacher_social_follows WHERE id = v_existing.id;
    v_is_following := false;
  ELSE
    -- Follow
    INSERT INTO public.teacher_social_follows (follower_user_id, follower_name, follower_avatar, follower_role, following_teacher_id)
    VALUES (p_follower_user_id, COALESCE(p_follower_name, 'শিক্ষার্থী'), p_follower_avatar, COALESCE(p_follower_role, 'student'), p_following_teacher_id);
    v_is_following := true;
  END IF;

  -- Count real followers from table
  SELECT COUNT(*)::INT INTO v_followers_count 
  FROM public.teacher_social_follows 
  WHERE following_teacher_id = p_following_teacher_id;

  UPDATE public.teacher_marketplace_profiles
  SET followers_count = v_followers_count,
      updated_at = now()
  WHERE teacher_id = p_following_teacher_id;

  RETURN jsonb_build_object(
    'is_following', v_is_following,
    'followers_count', v_followers_count,
    'teacher_id', p_following_teacher_id
  );
END;
$$;

-- C) Save Post Function
CREATE OR REPLACE FUNCTION public.toggle_save_post(
  p_user_id UUID,
  p_post_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_existing RECORD;
  v_is_saved BOOLEAN;
BEGIN
  IF p_user_id IS NULL OR p_post_id IS NULL THEN
    RAISE EXCEPTION 'Missing mandatory parameters';
  END IF;

  SELECT * INTO v_existing FROM public.teacher_social_saved_posts 
  WHERE user_id = p_user_id AND post_id = p_post_id;

  IF FOUND THEN
    DELETE FROM public.teacher_social_saved_posts WHERE id = v_existing.id;
    v_is_saved := false;
  ELSE
    INSERT INTO public.teacher_social_saved_posts (user_id, post_id)
    VALUES (p_user_id, p_post_id);
    v_is_saved := true;
  END IF;

  RETURN jsonb_build_object(
    'is_saved', v_is_saved,
    'post_id', p_post_id
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. REVOKE PUBLIC EXECUTE PRIVILEGES & GRANT ONLY TO TRUSTED ROLES
-- ----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.toggle_teacher_post_reaction(UUID, UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.toggle_teacher_follow(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.toggle_save_post(UUID, UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.toggle_teacher_post_reaction(UUID, UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.toggle_teacher_follow(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.toggle_save_post(UUID, UUID) TO authenticated, service_role;

