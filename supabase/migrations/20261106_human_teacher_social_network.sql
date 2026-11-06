-- ============================================================================
-- Migration: 20261106_human_teacher_social_network.sql
-- Description: Facebook-Style Social Profiles, Feed, Media Processing,
--              7 Reactions, Threaded Comments, Follow System, Saved Posts & Moderation
-- ============================================================================

-- 1. Extend Teacher Marketplace Profiles with Social Attributes
ALTER TABLE public.teacher_marketplace_profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '["বাংলা", "العربية"]'::jsonb,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS followers_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS posts_count INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_teacher_marketplace_username 
  ON public.teacher_marketplace_profiles (username);

-- 2. Teacher Social Posts Table
CREATE TABLE IF NOT EXISTS public.teacher_social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT NOT NULL REFERENCES public.teacher_marketplace_profiles(teacher_id) ON DELETE CASCADE,
  author_user_id UUID,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  content_text TEXT,
  post_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'photo', 'multi_photo', 'video', 'clip'
  media_urls JSONB DEFAULT '[]'::jsonb, -- Array of { url, type, thumbnail, width, height, duration, size_bytes }
  video_metadata JSONB DEFAULT NULL, -- { duration, resolution, thumbnail, processing_status: 'ready'|'processing'|'failed', cdn_url, hls_url }
  visibility TEXT NOT NULL DEFAULT 'public', -- 'public', 'followers', 'private'
  likes_count INT DEFAULT 0,
  reactions_summary JSONB DEFAULT '{"like":0,"love":0,"care":0,"haha":0,"wow":0,"sad":0,"insightful":0}'::jsonb,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  original_post_id UUID REFERENCES public.teacher_social_posts(id) ON DELETE SET NULL,
  original_post_data JSONB DEFAULT NULL, -- Snapshot of original post for repost display without join overhead
  is_pinned BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published', -- 'published', 'archived', 'hidden'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_social_posts_teacher_created 
  ON public.teacher_social_posts (teacher_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teacher_social_posts_type 
  ON public.teacher_social_posts (post_type);
CREATE INDEX IF NOT EXISTS idx_teacher_social_posts_visibility 
  ON public.teacher_social_posts (visibility);

-- 3. Teacher Social Reactions Table (7 Facebook-Style Reactions)
CREATE TABLE IF NOT EXISTS public.teacher_social_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.teacher_social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'student', -- 'student', 'teacher', 'admin'
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  reaction_type TEXT NOT NULL, -- 'like', 'love', 'care', 'haha', 'wow', 'sad', 'insightful'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (post_id, user_id),
  CONSTRAINT valid_reaction_type CHECK (
    reaction_type IN ('like', 'love', 'care', 'haha', 'wow', 'sad', 'insightful')
  )
);

CREATE INDEX IF NOT EXISTS idx_social_reactions_post_type 
  ON public.teacher_social_reactions (post_id, reaction_type);
CREATE INDEX IF NOT EXISTS idx_social_reactions_user 
  ON public.teacher_social_reactions (user_id);

-- 4. Teacher Social Comments & Threaded Replies
CREATE TABLE IF NOT EXISTS public.teacher_social_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.teacher_social_posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.teacher_social_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'student',
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  comment_text TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'hidden', 'flagged'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_comments_post_created 
  ON public.teacher_social_comments (post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_social_comments_parent 
  ON public.teacher_social_comments (parent_comment_id);

-- 5. Teacher Social Follow System
CREATE TABLE IF NOT EXISTS public.teacher_social_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_user_id UUID NOT NULL,
  follower_role TEXT NOT NULL DEFAULT 'student',
  follower_name TEXT NOT NULL,
  follower_avatar TEXT,
  following_teacher_id TEXT NOT NULL REFERENCES public.teacher_marketplace_profiles(teacher_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (follower_user_id, following_teacher_id),
  CONSTRAINT no_self_follow CHECK (follower_user_id::text <> following_teacher_id)
);

CREATE INDEX IF NOT EXISTS idx_social_follows_following 
  ON public.teacher_social_follows (following_teacher_id);
CREATE INDEX IF NOT EXISTS idx_social_follows_follower 
  ON public.teacher_social_follows (follower_user_id);

-- 6. Teacher Social Saved Posts (Private to User)
CREATE TABLE IF NOT EXISTS public.teacher_social_saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.teacher_social_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_social_saved_user 
  ON public.teacher_social_saved_posts (user_id, created_at DESC);

-- 7. Moderation Reports Table
CREATE TABLE IF NOT EXISTS public.teacher_social_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID NOT NULL,
  target_type TEXT NOT NULL, -- 'post', 'comment', 'teacher_profile'
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'dismissed', 'action_taken'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_reports_target 
  ON public.teacher_social_reports (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_social_reports_status 
  ON public.teacher_social_reports (status);

-- ============================================================================
-- Atomic Stored Procedures & Counters
-- ============================================================================

-- Function: Toggle or Change Post Reaction Atomically
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
  v_total_likes INT;
  v_action TEXT;
BEGIN
  -- Validate reaction type
  IF p_reaction_type NOT IN ('like', 'love', 'care', 'haha', 'wow', 'sad', 'insightful') THEN
    RAISE EXCEPTION 'Invalid reaction type: %', p_reaction_type;
  END IF;

  -- Lock post row for consistent counter update
  SELECT * INTO v_post FROM public.teacher_social_posts WHERE id = p_post_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found: %', p_post_id;
  END IF;

  v_reactions := COALESCE(v_post.reactions_summary, '{"like":0,"love":0,"care":0,"haha":0,"wow":0,"sad":0,"insightful":0}'::jsonb);

  -- Check existing reaction from this user
  SELECT * INTO v_existing FROM public.teacher_social_reactions 
  WHERE post_id = p_post_id AND user_id = p_user_id;

  IF FOUND THEN
    v_old_type := v_existing.reaction_type;
    IF v_old_type = p_reaction_type THEN
      -- Same reaction clicked again -> REMOVE reaction (Unlike)
      DELETE FROM public.teacher_social_reactions WHERE id = v_existing.id;
      v_reactions := jsonb_set(
        v_reactions, 
        ARRAY[v_old_type], 
        to_jsonb(GREATEST(0, COALESCE((v_reactions->>v_old_type)::INT, 1) - 1))
      );
      v_action := 'removed';
    ELSE
      -- Different reaction clicked -> CHANGE reaction
      UPDATE public.teacher_social_reactions 
      SET reaction_type = p_reaction_type,
          user_name = COALESCE(p_user_name, user_name),
          user_avatar = COALESCE(p_user_avatar, user_avatar),
          user_role = COALESCE(p_user_role, user_role)
      WHERE id = v_existing.id;

      -- Decrement old type, increment new type
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

  -- Calculate total likes from all 7 reaction keys
  v_total_likes := 
    COALESCE((v_reactions->>'like')::INT, 0) +
    COALESCE((v_reactions->>'love')::INT, 0) +
    COALESCE((v_reactions->>'care')::INT, 0) +
    COALESCE((v_reactions->>'haha')::INT, 0) +
    COALESCE((v_reactions->>'wow')::INT, 0) +
    COALESCE((v_reactions->>'sad')::INT, 0) +
    COALESCE((v_reactions->>'insightful')::INT, 0);

  -- Update post counters
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

-- Function: Toggle Teacher Follow Atomically
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

  -- Update teacher profile counters
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

-- Function: Toggle Save Post Atomically
CREATE OR REPLACE FUNCTION public.toggle_save_post(
  p_user_id UUID,
  p_post_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing RECORD;
  v_is_saved BOOLEAN;
BEGIN
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

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================
ALTER TABLE public.teacher_social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_social_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_social_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_social_saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_social_reports ENABLE ROW LEVEL SECURITY;

-- Posts Policies:
-- 1. Public read for published public posts
DROP POLICY IF EXISTS "Public can view published posts" ON public.teacher_social_posts;
CREATE POLICY "Public can view published posts" ON public.teacher_social_posts
  FOR SELECT USING (visibility = 'public' AND status = 'published');

-- 2. Authors can view all their own posts
DROP POLICY IF EXISTS "Authors can view own posts" ON public.teacher_social_posts;
CREATE POLICY "Authors can view own posts" ON public.teacher_social_posts
  FOR SELECT TO authenticated
  USING (auth.uid() = author_user_id);

-- 3. Followers can view followers-only posts
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

-- Reactions Policies:
DROP POLICY IF EXISTS "Public view reactions" ON public.teacher_social_reactions;
CREATE POLICY "Public view reactions" ON public.teacher_social_reactions
  FOR SELECT TO public
  USING (true);

-- Comments Policies:
DROP POLICY IF EXISTS "Public view active comments" ON public.teacher_social_comments;
CREATE POLICY "Public view active comments" ON public.teacher_social_comments
  FOR SELECT TO public
  USING (status = 'active');

-- Follows Policies:
DROP POLICY IF EXISTS "Public view follows" ON public.teacher_social_follows;
CREATE POLICY "Public view follows" ON public.teacher_social_follows
  FOR SELECT TO public
  USING (true);

-- Saved Posts Policies (Strict Privacy: User can only see their own saved posts):
DROP POLICY IF EXISTS "User can view own saved posts" ON public.teacher_social_saved_posts;
CREATE POLICY "User can view own saved posts" ON public.teacher_social_saved_posts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Reports Policies:
DROP POLICY IF EXISTS "Users can submit reports" ON public.teacher_social_reports;
CREATE POLICY "Users can submit reports" ON public.teacher_social_reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_user_id);

