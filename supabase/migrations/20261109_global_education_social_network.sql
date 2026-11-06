-- ============================================================================
-- Migration: 20261109_global_education_social_network.sql
-- Description: Facebook-Style Global Islamic Education Social Network
--              - Three Main Panels: Home, Teacher Panel, Student Panel
--              - Discoverable Global Public Students (strictly separate from institutional ERP)
--              - Two-Way Mutual Learning Requests & Connections
--              - Private Learning Assistant Groups (Dedicated Workspaces)
--              - Private Group Messages, Lesson Notes & Study Resources
--              - 24-Hour Expiring Stories (Server-Side Timestamps)
-- ============================================================================

-- 1. Public Student Profiles (Strictly Isolated Global Public Network Accounts)
CREATE TABLE IF NOT EXISTS public.public_student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  student_public_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT,
  learning_interests TEXT[] DEFAULT '{}'::text[],
  is_discoverable BOOLEAN NOT NULL DEFAULT true,
  followers_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_student_profiles_public_id
  ON public.public_student_profiles (student_public_id);
CREATE INDEX IF NOT EXISTS idx_public_student_profiles_username
  ON public.public_student_profiles (username);
CREATE INDEX IF NOT EXISTS idx_public_student_profiles_discoverable
  ON public.public_student_profiles (is_discoverable);

-- 2. Mutual Learning Connections (Student-to-Teacher and Teacher-to-Student Requests)
CREATE TABLE IF NOT EXISTS public.learning_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_public_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  initiated_by TEXT NOT NULL CHECK (initiated_by IN ('student', 'teacher')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  request_message TEXT,
  subject TEXT,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_learning_connection_teacher_student UNIQUE (teacher_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_connections_teacher_id
  ON public.learning_connections (teacher_id);
CREATE INDEX IF NOT EXISTS idx_learning_connections_student_id
  ON public.learning_connections (student_id);
CREATE INDEX IF NOT EXISTS idx_learning_connections_status
  ON public.learning_connections (status);

-- 3. Private Learning Assistant Groups (Dedicated Private Workspace on Acceptance)
CREATE TABLE IF NOT EXISTS public.learning_assistant_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES public.learning_connections(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  group_name TEXT NOT NULL,
  schedule_info JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_assistant_group_connection UNIQUE (connection_id)
);

CREATE INDEX IF NOT EXISTS idx_assistant_groups_teacher
  ON public.learning_assistant_groups (teacher_id);
CREATE INDEX IF NOT EXISTS idx_assistant_groups_student
  ON public.learning_assistant_groups (student_id);

-- 4. Private Group Messages & Lesson Notes
CREATE TABLE IF NOT EXISTS public.learning_group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.learning_assistant_groups(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('teacher', 'student')),
  sender_name TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'resource_link', 'lesson_note', 'quran_reference', 'audio')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_messages_group_id
  ON public.learning_group_messages (group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at
  ON public.learning_group_messages (created_at ASC);

-- 5. Stories (24-Hour Expiring Stories with Server-Side Timestamps)
CREATE TABLE IF NOT EXISTS public.social_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('teacher', 'student')),
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + interval '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_social_stories_expires_at
  ON public.social_stories (expires_at);

-- 6. Row Level Security (RLS) Enablement
ALTER TABLE public.public_student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_assistant_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_stories ENABLE ROW LEVEL SECURITY;

-- 7. Policies: Public Student Profiles
-- Public can view discoverable student profiles
DROP POLICY IF EXISTS "Anyone can view discoverable public student profiles" ON public.public_student_profiles;
CREATE POLICY "Anyone can view discoverable public student profiles" ON public.public_student_profiles
  FOR SELECT TO public
  USING (is_discoverable = true);

-- Students can insert and update their own profile
DROP POLICY IF EXISTS "Students can insert own public profile" ON public.public_student_profiles;
CREATE POLICY "Students can insert own public profile" ON public.public_student_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Students can update own public profile" ON public.public_student_profiles;
CREATE POLICY "Students can update own public profile" ON public.public_student_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Policies: Mutual Learning Connections
-- Participants can view their own connections
DROP POLICY IF EXISTS "Participants can view their own learning connections" ON public.learning_connections;
CREATE POLICY "Participants can view their own learning connections" ON public.learning_connections
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()::text OR
    teacher_id = auth.uid()::text
  );

-- Authenticated users can insert a new connection request
DROP POLICY IF EXISTS "Authenticated users can create learning requests" ON public.learning_connections;
CREATE POLICY "Authenticated users can create learning requests" ON public.learning_connections
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()::text OR
    teacher_id = auth.uid()::text
  );

-- Recipients can update status (accept/reject) or initiators can cancel
DROP POLICY IF EXISTS "Participants can update connection status" ON public.learning_connections;
CREATE POLICY "Participants can update connection status" ON public.learning_connections
  FOR UPDATE TO authenticated
  USING (
    student_id = auth.uid()::text OR
    teacher_id = auth.uid()::text
  );

-- 9. Policies: Private Learning Assistant Groups
-- Only group participants can view the private group
DROP POLICY IF EXISTS "Participants can view private assistant group" ON public.learning_assistant_groups;
CREATE POLICY "Participants can view private assistant group" ON public.learning_assistant_groups
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()::text OR
    teacher_id = auth.uid()::text
  );

-- 10. Policies: Private Group Messages
-- Only participants of the group can view messages
DROP POLICY IF EXISTS "Participants can view group messages" ON public.learning_group_messages;
CREATE POLICY "Participants can view group messages" ON public.learning_group_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_assistant_groups g
      WHERE g.id = learning_group_messages.group_id
        AND (g.student_id = auth.uid()::text OR g.teacher_id = auth.uid()::text)
    )
  );

-- Only participants can post messages to the group
DROP POLICY IF EXISTS "Participants can post group messages" ON public.learning_group_messages;
CREATE POLICY "Participants can post group messages" ON public.learning_group_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.learning_assistant_groups g
      WHERE g.id = learning_group_messages.group_id
        AND (g.student_id = auth.uid()::text OR g.teacher_id = auth.uid()::text)
    )
  );

-- 11. Policies: Social Stories
-- Anyone can view unexpired stories
DROP POLICY IF EXISTS "Anyone can view active stories" ON public.social_stories;
CREATE POLICY "Anyone can view active stories" ON public.social_stories
  FOR SELECT TO public
  USING (expires_at > NOW());

-- Authenticated users can insert stories
DROP POLICY IF EXISTS "Authenticated users can post stories" ON public.social_stories;
CREATE POLICY "Authenticated users can post stories" ON public.social_stories
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid()::text);

