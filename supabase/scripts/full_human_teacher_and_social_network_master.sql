-- ==============================================================================
-- 📖 RAHMANIA INSTITUTE — GLOBAL EDUCATION SOCIAL NETWORK & HUMAN TEACHER
-- CONSOLIDATED MASTER MIGRATION SCRIPT (20261103 — 20261113)
--
-- Target: Supabase PostgreSQL (SQL Editor)
-- Status: 100% Safe, Forward-Only, and Idempotent
--
-- INCLUDES EVERYTHING CREATED & HARDENED:
-- 1. Teacher Marketplace & Profiles (teacher_marketplace_profiles)
-- 2. Teacher Wallets & Immutable Ledgers (teacher_wallets, teacher_wallet_transactions)
-- 3. Live Calling & Group Rooms (teacher_group_rooms, live_room_participants)
-- 4. Bookings & Privacy-Safe Reviews (teacher_student_bookings, teacher_reviews, public_teacher_reviews)
-- 5. Social Network Feed (teacher_social_posts, teacher_social_reactions, teacher_social_comments,
--    teacher_social_comment_reactions, teacher_social_follows, teacher_social_saved_posts)
-- 6. Moderation Queue (teacher_social_reports)
-- 7. Global Public Student Profiles & Directory (public_student_profiles, public_student_directory)
-- 8. Mutual Connections & Private Learning Groups (learning_connections, learning_assistant_groups,
--    learning_group_messages, social_stories)
-- 9. Authoritative Functions with Guarded Cleanup (is_learning_group_participant)
-- 10. Complete Direct Write Lockdown & Parent-Post Visibility Policies
-- ==============================================================================

-- ==============================================================================
-- PART 1: TEACHER MARKETPLACE & FINANCIAL ARCHITECTURE
-- ==============================================================================

-- 1. Teacher Marketplace Profiles
CREATE TABLE IF NOT EXISTS public.teacher_marketplace_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT UNIQUE NOT NULL,
  user_id UUID,
  name_bn TEXT NOT NULL,
  name_en TEXT,
  title_bn TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  hourly_fee NUMERIC DEFAULT 350,
  monthly_fee NUMERIC DEFAULT 2500,
  experience_years INT DEFAULT 5,
  qualifications JSONB DEFAULT '[]'::jsonb,
  specialties JSONB DEFAULT '[]'::jsonb,
  schedule_text TEXT,
  bio TEXT,
  rating NUMERIC DEFAULT NULL,
  total_reviews INT DEFAULT 0,
  total_students INT DEFAULT 0,
  total_classes INT DEFAULT 0,
  is_online BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Teacher Wallets
CREATE TABLE IF NOT EXISTS public.teacher_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT UNIQUE NOT NULL,
  balance NUMERIC DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
  total_earned NUMERIC DEFAULT 0.00 NOT NULL,
  total_withdrawn NUMERIC DEFAULT 0.00 NOT NULL,
  currency TEXT DEFAULT 'BDT',
  is_withdrawal_held BOOLEAN DEFAULT false,
  hold_reason TEXT DEFAULT NULL,
  reconciliation_required BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Teacher Wallet Transactions (Immutable Transaction Ledger)
CREATE TABLE IF NOT EXISTS public.teacher_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT NOT NULL,
  student_id TEXT,
  student_name TEXT,
  amount_gross NUMERIC NOT NULL CHECK (amount_gross > 0),
  platform_commission_pct NUMERIC NOT NULL CHECK (platform_commission_pct >= 0 AND platform_commission_pct <= 100),
  platform_commission_amount NUMERIC NOT NULL CHECK (platform_commission_amount >= 0),
  amount_net NUMERIC NOT NULL CHECK (amount_net >= 0),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('hadia_payment', 'monthly_fee', 'withdrawal', 'refund', 'adjustment')),
  payment_gateway TEXT DEFAULT 'bkash' CHECK (payment_gateway IN ('bkash', 'nagad', 'manual')),
  merchant_account_id TEXT,
  gateway_ref TEXT,
  idempotency_key TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'pending_gateway_verification', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Teacher Group Live Rooms
CREATE TABLE IF NOT EXISTS public.teacher_group_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT UNIQUE NOT NULL,
  teacher_id TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  max_participants INT DEFAULT 15 CHECK (max_participants > 0 AND max_participants <= 50),
  current_participants INT DEFAULT 0 CHECK (current_participants >= 0),
  is_active BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT false,
  current_surah INT DEFAULT 1,
  current_ayah INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- 5. Live Room Participants
CREATE TABLE IF NOT EXISTS public.live_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  user_id UUID,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('teacher', 'student', 'guest')),
  is_muted BOOLEAN DEFAULT false,
  is_hand_raised BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ
);

-- 6. Teacher Reviews
CREATE TABLE IF NOT EXISTS public.teacher_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
  is_verified_transaction BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Teacher Student Bookings
CREATE TABLE IF NOT EXISTS public.teacher_student_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_phone TEXT,
  booking_type TEXT DEFAULT 'monthly' CHECK (booking_type IN ('single_session', 'monthly', 'quarterly')),
  preferred_time TEXT,
  notes TEXT,
  amount NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Teacher Payout Requests
CREATE TABLE IF NOT EXISTS public.teacher_payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 500),
  payout_method TEXT DEFAULT 'bkash' CHECK (payout_method IN ('bkash', 'nagad', 'bank')),
  account_number TEXT NOT NULL,
  account_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  processed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- PART 2: SOCIAL NETWORK FEED & CONTENT
-- ==============================================================================

-- 9. Social Posts
CREATE TABLE IF NOT EXISTS public.teacher_social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT NOT NULL,
  author_user_id UUID,
  author_role TEXT DEFAULT 'teacher' CHECK (author_role IN ('teacher', 'student')),
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'announcement', 'quran_recitation')),
  media_url TEXT,
  media_thumbnail TEXT,
  quran_surah_number INT,
  quran_ayah_number INT,
  quran_arabic_text TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  likes_count INT DEFAULT 0 CHECK (likes_count >= 0),
  comments_count INT DEFAULT 0 CHECK (comments_count >= 0),
  shares_count INT DEFAULT 0 CHECK (shares_count >= 0),
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'flagged', 'hidden')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist across historical schema variants
ALTER TABLE public.teacher_social_posts 
  ADD COLUMN IF NOT EXISTS author_role TEXT DEFAULT 'teacher' CHECK (author_role IN ('teacher', 'student')),
  ADD COLUMN IF NOT EXISTS content_text TEXT,
  ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS video_metadata JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reactions_summary JSONB DEFAULT '{"like":0,"love":0,"subhanallah":0,"mashaallah":0,"alhamdulillah":0}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- Allow students to be primary authors without strict teacher FK
ALTER TABLE public.teacher_social_posts ALTER COLUMN teacher_id DROP NOT NULL;

-- 10. Post Reactions
CREATE TABLE IF NOT EXISTS public.teacher_social_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.teacher_social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'subhanallah', 'mashaallah', 'alhamdulillah')),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_post_user_reaction UNIQUE (post_id, user_id)
);

-- 11. Post Comments
CREATE TABLE IF NOT EXISTS public.teacher_social_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.teacher_social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  comment_text TEXT NOT NULL,
  reactions_count INT DEFAULT 0 CHECK (reactions_count >= 0),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure reactions_count exists on comments
ALTER TABLE public.teacher_social_comments 
  ADD COLUMN IF NOT EXISTS reactions_count INT DEFAULT 0 CHECK (reactions_count >= 0);

-- 12. Comment Reactions
CREATE TABLE IF NOT EXISTS public.teacher_social_comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.teacher_social_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'subhanallah', 'mashaallah', 'alhamdulillah')),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_comment_user_reaction UNIQUE (comment_id, user_id)
);

-- 13. Follows
CREATE TABLE IF NOT EXISTS public.teacher_social_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  following_teacher_id TEXT NOT NULL,
  follower_user_id UUID NOT NULL,
  follower_name TEXT NOT NULL,
  follower_avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_teacher_follower UNIQUE (following_teacher_id, follower_user_id)
);

-- 14. Saved Posts
CREATE TABLE IF NOT EXISTS public.teacher_social_saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.teacher_social_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_user_saved_post UNIQUE (user_id, post_id)
);

-- 15. Social Reports (Strictly Private to Service Role)
CREATE TABLE IF NOT EXISTS public.teacher_social_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID,
  reporter_name TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'teacher', 'student')),
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('inappropriate', 'harassment', 'spam', 'misinformation', 'other')),
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- ==============================================================================
-- PART 3: GLOBAL EDUCATION NETWORK & PRIVATE ASSISTANT GROUPS
-- ==============================================================================

-- 16. Public Student Profiles
CREATE TABLE IF NOT EXISTS public.public_student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_public_id TEXT UNIQUE NOT NULL,
  user_id UUID UNIQUE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT,
  learning_interests JSONB DEFAULT '[]'::jsonb,
  followers_count INT DEFAULT 0 CHECK (followers_count >= 0),
  following_count INT DEFAULT 0 CHECK (following_count >= 0),
  is_discoverable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 17. Learning Connections (Mutual Student-Teacher Agreement)
CREATE TABLE IF NOT EXISTS public.learning_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_role TEXT NOT NULL CHECK (initiator_role IN ('student', 'teacher')),
  initiator_id TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  learning_goal TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'paused', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_learning_connection UNIQUE (teacher_id, student_id)
);

ALTER TABLE public.learning_connections 
  ADD COLUMN IF NOT EXISTS student_public_id TEXT,
  ADD COLUMN IF NOT EXISTS student_name TEXT,
  ADD COLUMN IF NOT EXISTS teacher_name TEXT,
  ADD COLUMN IF NOT EXISTS initiated_by TEXT DEFAULT 'student' CHECK (initiated_by IN ('student', 'teacher')),
  ADD COLUMN IF NOT EXISTS initiator_role TEXT DEFAULT 'student' CHECK (initiator_role IN ('student', 'teacher')),
  ADD COLUMN IF NOT EXISTS initiator_id TEXT,
  ADD COLUMN IF NOT EXISTS learning_goal TEXT,
  ADD COLUMN IF NOT EXISTS request_message TEXT,
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- Ensure uq_learning_connection exists idempotently on existing tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_learning_connection'
  ) THEN
    ALTER TABLE public.learning_connections
      ADD CONSTRAINT uq_learning_connection UNIQUE (teacher_id, student_id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 18. Learning Assistant Groups
CREATE TABLE IF NOT EXISTS public.learning_assistant_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID UNIQUE NOT NULL REFERENCES public.learning_connections(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  group_title TEXT NOT NULL,
  shared_notes TEXT,
  schedule_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.learning_assistant_groups 
  ADD COLUMN IF NOT EXISTS group_name TEXT,
  ADD COLUMN IF NOT EXISTS group_title TEXT,
  ADD COLUMN IF NOT EXISTS schedule_info JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS schedule_config JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS shared_notes TEXT;

-- 19. Learning Group Messages
CREATE TABLE IF NOT EXISTS public.learning_group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.learning_assistant_groups(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('student', 'teacher')),
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'quran_ayah', 'audio_voice', 'file', 'lesson_note', 'resource_link', 'audio')),
  content TEXT,
  message_text TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.learning_group_messages 
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS message_text TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}'::jsonb;

-- Ensure neither column blocks inserts due to strict NOT NULL from historical variants
ALTER TABLE public.learning_group_messages ALTER COLUMN content DROP NOT NULL;
ALTER TABLE public.learning_group_messages ALTER COLUMN message_text DROP NOT NULL;

-- 20. Social Stories (24-Hour Ephemeral Stories)
CREATE TABLE IF NOT EXISTS public.social_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('teacher', 'student')),
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- PART 4: INDEXES FOR PERFORMANCE & SEARCH
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_status ON public.teacher_marketplace_profiles(status);
CREATE INDEX IF NOT EXISTS idx_teacher_wallets_teacher_id ON public.teacher_wallets(teacher_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_teacher_id ON public.teacher_wallet_transactions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_idempotency ON public.teacher_wallet_transactions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_social_posts_teacher_status ON public.teacher_social_posts(teacher_id, status);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON public.teacher_social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_reactions_post ON public.teacher_social_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_post ON public.teacher_social_comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_comment_reactions ON public.teacher_social_comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_social_follows_teacher ON public.teacher_social_follows(following_teacher_id);
CREATE INDEX IF NOT EXISTS idx_social_follows_user ON public.teacher_social_follows(follower_user_id);
CREATE INDEX IF NOT EXISTS idx_public_students_discoverable ON public.public_student_profiles(is_discoverable);
CREATE INDEX IF NOT EXISTS idx_public_students_username ON public.public_student_profiles(username);
CREATE INDEX IF NOT EXISTS idx_connections_teacher ON public.learning_connections(teacher_id);
CREATE INDEX IF NOT EXISTS idx_connections_student ON public.learning_connections(student_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON public.learning_group_messages(group_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_stories_active ON public.social_stories(expires_at DESC);

-- ==============================================================================
-- PART 5: AUTHORITATIVE FUNCTIONS WITH GUARDED CLEANUP
-- ==============================================================================

-- Step 5.1: Safe Cleanup of Old Overloads
DO $$
BEGIN
  -- Explicitly drop dependent policies before removing old overload
  DROP POLICY IF EXISTS "Participants can view group messages" ON public.learning_group_messages;
  DROP POLICY IF EXISTS "Participants can post group messages" ON public.learning_group_messages;
  DROP POLICY IF EXISTS "Participants can view private assistant group" ON public.learning_assistant_groups;

  -- Only revoke/drop if old two-argument function exists in catalog
  IF to_regprocedure('public.is_learning_group_participant(uuid,uuid)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.is_learning_group_participant(UUID, UUID) FROM PUBLIC, anon, authenticated';
    EXECUTE 'DROP FUNCTION public.is_learning_group_participant(UUID, UUID) RESTRICT';
  END IF;

  -- Safe cleanup of old two-argument is_following_teacher(text,uuid)
  IF to_regprocedure('public.is_following_teacher(text,uuid)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.is_following_teacher(TEXT, UUID) FROM PUBLIC, anon, authenticated';
    EXECUTE 'DROP FUNCTION public.is_following_teacher(TEXT, UUID) RESTRICT';
  END IF;
END $$;

-- Step 5.2: Define Authoritative Single-Argument Group Participant Check
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
              SELECT tmp.id::text 
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

-- Step 5.3: Follower Helper Function (Hardened: Bounded strictly to auth.uid())
CREATE OR REPLACE FUNCTION public.is_following_teacher(p_teacher_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teacher_social_follows
    WHERE following_teacher_id = p_teacher_id
      AND follower_user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_following_teacher(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_following_teacher(TEXT) TO authenticated, service_role;

-- ==============================================================================
-- PART 6: SECURE VIEWS
-- ==============================================================================

-- 6.1 Public Student Directory View (Omits user_id and internal UUID completely)
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

-- 6.2 Privacy-Masked Public Reviews View
CREATE OR REPLACE VIEW public.public_teacher_reviews AS
SELECT 
  r.id,
  r.teacher_id,
  CASE 
    WHEN LENGTH(TRIM(r.student_name)) > 2 THEN 
      CONCAT(SUBSTRING(TRIM(r.student_name) FROM 1 FOR 1), '***', SUBSTRING(TRIM(r.student_name) FROM LENGTH(TRIM(r.student_name)) FOR 1))
    ELSE 'শিক্ষার্থী'
  END AS student_display_name,
  r.rating,
  CASE 
    WHEN r.moderation_status = 'approved' THEN
      regexp_replace(
        regexp_replace(
          COALESCE(r.comment, ''),
          '(\+?8801|01)[3-9][0-9]{8}',
          '[ফোন নম্বর গোপনীয়]',
          'g'
        ),
        '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
        '[ইমেইল গোপনীয়]',
        'g'
      )
    ELSE NULL
  END AS comment,
  r.moderation_status,
  r.is_verified_transaction,
  r.created_at
FROM public.teacher_reviews r
JOIN public.teacher_marketplace_profiles p ON (p.teacher_id = r.teacher_id OR p.id::text = r.teacher_id)
WHERE p.status = 'approved' 
  AND r.is_verified_transaction = true;

REVOKE ALL ON public.public_teacher_reviews FROM PUBLIC;
GRANT SELECT ON public.public_teacher_reviews TO anon, authenticated, service_role;

-- ==============================================================================
-- PART 7: ROW LEVEL SECURITY & DIRECT WRITE LOCKDOWN
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.teacher_marketplace_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_group_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_student_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_social_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_social_comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_social_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_social_saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_social_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_assistant_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_stories ENABLE ROW LEVEL SECURITY;

-- 7.1 Direct Write Revocation (Mutations mediated strictly via Next.js Server APIs)
REVOKE INSERT, UPDATE, DELETE ON public.teacher_marketplace_profiles FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_wallets FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_wallet_transactions FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_group_rooms FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.live_room_participants FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_reviews FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_student_bookings FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_payout_requests FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_posts FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_reactions FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_comments FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_comment_reactions FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_social_follows FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.public_student_profiles FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.learning_connections FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.learning_assistant_groups FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.learning_group_messages FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.social_stories FROM PUBLIC, anon, authenticated;

-- Reports: Revoke ALL direct client access (100% private moderation queue)
REVOKE ALL ON public.teacher_social_reports FROM PUBLIC, anon, authenticated;

-- Public Student Profiles raw table: Revoke public SELECT (use public_student_directory instead)
REVOKE SELECT ON public.public_student_profiles FROM PUBLIC, anon;

-- 7.2 Read Policies: Teacher Marketplace Profiles
DROP POLICY IF EXISTS "Public view approved teachers" ON public.teacher_marketplace_profiles;
CREATE POLICY "Public view approved teachers" ON public.teacher_marketplace_profiles
  FOR SELECT TO public
  USING (status = 'approved' OR user_id = auth.uid());

-- 7.3 Read Policies: Teacher Wallets & Transactions (Owner only)
DROP POLICY IF EXISTS "Teachers view own wallet" ON public.teacher_wallets;
CREATE POLICY "Teachers view own wallet" ON public.teacher_wallets
  FOR SELECT TO authenticated
  USING (
    teacher_id = auth.uid()::text
    OR teacher_id IN (
      SELECT tmp.teacher_id FROM public.teacher_marketplace_profiles tmp 
      WHERE tmp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Teachers view own transactions" ON public.teacher_wallet_transactions;
CREATE POLICY "Teachers view own transactions" ON public.teacher_wallet_transactions
  FOR SELECT TO authenticated
  USING (
    teacher_id = auth.uid()::text
    OR teacher_id IN (
      SELECT tmp.teacher_id FROM public.teacher_marketplace_profiles tmp 
      WHERE tmp.user_id = auth.uid()
    )
  );

-- 7.4 Read Policies: Live Rooms & Participants
DROP POLICY IF EXISTS "Public view active rooms" ON public.teacher_group_rooms;
CREATE POLICY "Public view active rooms" ON public.teacher_group_rooms
  FOR SELECT TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Participants view room members" ON public.live_room_participants;
CREATE POLICY "Participants view room members" ON public.live_room_participants
  FOR SELECT TO authenticated
  USING (left_at IS NULL);

-- 7.5 Read Policies: Social Posts (Public feed + Author + Followers-only check)
DROP POLICY IF EXISTS "Public view published posts" ON public.teacher_social_posts;
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.teacher_social_posts;
CREATE POLICY "Public view published posts" ON public.teacher_social_posts
  FOR SELECT TO public
  USING (
    (status = 'published' AND visibility = 'public')
    OR (author_user_id = auth.uid())
    OR (
      status = 'published' AND visibility = 'followers'
      AND EXISTS (
        SELECT 1 FROM public.teacher_social_follows f
        WHERE f.following_teacher_id = teacher_social_posts.teacher_id
          AND f.follower_user_id = auth.uid()
      )
    )
  );

-- 7.6 Read Policies: Social Engagement (Bounded strictly by parent post visibility)
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

-- 7.7 Read Policies: Follows & Saved Posts
DROP POLICY IF EXISTS "Public view follows" ON public.teacher_social_follows;
CREATE POLICY "Public view follows" ON public.teacher_social_follows
  FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS "User can manage own saved posts" ON public.teacher_social_saved_posts;
CREATE POLICY "User can manage own saved posts" ON public.teacher_social_saved_posts
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 7.8 Read Policies: Student Profiles (Own record only on raw table)
DROP POLICY IF EXISTS "Students can view their own profile record" ON public.public_student_profiles;
CREATE POLICY "Students can view their own profile record" ON public.public_student_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 7.9 Read Policies: Learning Connections
DROP POLICY IF EXISTS "Participants can view their learning connections" ON public.learning_connections;
CREATE POLICY "Participants can view their learning connections" ON public.learning_connections
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()::text
    OR student_id IN (
      SELECT psp.id::text FROM public.public_student_profiles psp WHERE psp.user_id = auth.uid()
    )
    OR student_id IN (
      SELECT psp.student_public_id FROM public.public_student_profiles psp WHERE psp.user_id = auth.uid()
    )
    OR teacher_id = auth.uid()::text
    OR teacher_id IN (
      SELECT tmp.id::text FROM public.teacher_marketplace_profiles tmp WHERE tmp.user_id = auth.uid()
    )
    OR teacher_id IN (
      SELECT tmp.teacher_id FROM public.teacher_marketplace_profiles tmp WHERE tmp.user_id = auth.uid()
    )
  );

-- 7.10 Read Policies: Learning Groups & Messages
DROP POLICY IF EXISTS "Participants can view private assistant group" ON public.learning_assistant_groups;
CREATE POLICY "Participants can view private assistant group" ON public.learning_assistant_groups
  FOR SELECT TO authenticated
  USING (
    public.is_learning_group_participant(id)
  );

DROP POLICY IF EXISTS "Participants can view group messages" ON public.learning_group_messages;
CREATE POLICY "Participants can view group messages" ON public.learning_group_messages
  FOR SELECT TO authenticated
  USING (
    public.is_learning_group_participant(group_id)
  );

-- 7.11 Read Policies: Social Stories (Active non-expired only)
DROP POLICY IF EXISTS "Active non-expired stories are visible to all users" ON public.social_stories;
CREATE POLICY "Active non-expired stories are visible to all users" ON public.social_stories
  FOR SELECT TO public
  USING (expires_at > now());

-- ==============================================================================
-- DONE! ALL TABLES, INDEXES, VIEWS, AND HARDENED POLICIES CONSOLIDATED.
-- ==============================================================================

