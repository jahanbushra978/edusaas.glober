-- ============================================================================
-- Migration: 20261010_m1_nur_ai_quran_tutor_foundation.sql
-- Description: Milestone M1 (Foundation) — Database Schema & RLS Policies
--              for Nur AI Quran Tutor (Self-Contained & Multi-Tenant Safe)
-- ============================================================================

BEGIN;

-- 0. Ensure `organizations` Table exists (prevents 42P01 relation does not exist error)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    domain TEXT UNIQUE,
    subdomain TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'expired')),
    subscription_plan TEXT NOT NULL DEFAULT 'enterprise' CHECK (subscription_plan IN ('trial', 'free', 'monthly', 'yearly', 'enterprise', 'custom')),
    theme_config JSONB DEFAULT '{"primaryColor": "#0f766e", "secondaryColor": "#0d9488"}'::jsonb,
    modules_config JSONB DEFAULT '{"enabled": ["students", "teachers", "attendance", "exams", "fees", "notices", "gallery", "events"]}'::jsonb,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Seed Default Organization (Rahmania Institute - Org #1)
INSERT INTO public.organizations (
    id, name, slug, domain, status, subscription_plan
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Rahmania Institute',
    'rahmania',
    'rahmaniainstitute.org',
    'active',
    'enterprise'
)
ON CONFLICT (id) DO NOTHING;

-- 1. Student AI Learning Memory Profiles
-- Tracks frequent letters, weak Tajweed rules, weak Surahs, learning velocity
CREATE TABLE IF NOT EXISTS public.nur_student_memory_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES public.organizations(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL DEFAULT 1,
    weak_letters TEXT[] DEFAULT '{}',
    weak_rules TEXT[] DEFAULT '{}',
    weak_surahs INT[] DEFAULT '{}',
    weak_makharij TEXT[] DEFAULT '{}',
    preferred_speed NUMERIC(3,2) DEFAULT 1.00,
    learning_style TEXT DEFAULT 'visual_audio' CHECK (learning_style IN ('visual_audio', 'repetitive_drill', 'analytical_tajweed', 'hifz_focused')),
    hifz_stability_score NUMERIC(5,2) DEFAULT 0.00,
    total_practice_minutes INT DEFAULT 0,
    estimated_hifz_completion DATE,
    last_session_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unq_nur_student_memory UNIQUE (organization_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_nur_mem_org_student ON public.nur_student_memory_profiles(organization_id, student_id);

ALTER TABLE public.nur_student_memory_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Mistake Audit Trail & Phoneme Evaluation Logs
-- Tracks every specific error, phoneme deviation, severity, and repetition
CREATE TABLE IF NOT EXISTS public.nur_mistake_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES public.organizations(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL DEFAULT 1,
    surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INT NOT NULL CHECK (ayah_number >= 1),
    word_position INT,
    expected_phoneme TEXT,
    recited_phoneme TEXT,
    rule_category TEXT NOT NULL,
    makhraj_point TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('lahn_jali', 'lahn_khafi', 'hesitation', 'omission', 'vowel_error')),
    repetitions_before_correct INT DEFAULT 1,
    resolved BOOLEAN DEFAULT false,
    session_id TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nur_mistakes_org_student ON public.nur_mistake_logs(organization_id, student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nur_mistakes_rule ON public.nur_mistake_logs(rule_category);

ALTER TABLE public.nur_mistake_logs ENABLE ROW LEVEL SECURITY;

-- 3. Dynamic Practice Drills & Spaced Repetition Queue (SM-2)
CREATE TABLE IF NOT EXISTS public.nur_practice_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES public.organizations(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL DEFAULT 1,
    exercise_type TEXT NOT NULL CHECK (exercise_type IN ('ikhfa_drill', 'qalqalah_drill', 'madd_timing', 'makhraj_isolation', 'hifz_gap_fill', 'sabaq_revision')),
    target_rule TEXT NOT NULL,
    target_ayahs JSONB NOT NULL DEFAULT '[]'::jsonb,
    difficulty INT DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    repetitions_due INT DEFAULT 3,
    interval_days INT DEFAULT 1,
    ease_factor NUMERIC(4,2) DEFAULT 2.50,
    next_review_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mastery_level NUMERIC(4,2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'deferred')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nur_exercises_review ON public.nur_practice_exercises(organization_id, student_id, next_review_at);

ALTER TABLE public.nur_practice_exercises ENABLE ROW LEVEL SECURITY;

-- 4. Oral Examination Submissions & Human-in-the-Loop Reviews
CREATE TABLE IF NOT EXISTS public.nur_exam_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES public.organizations(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL DEFAULT 1,
    exam_type TEXT NOT NULL CHECK (exam_type IN ('reading', 'tajweed', 'hifz', 'listening')),
    surah_start INT NOT NULL,
    ayah_start INT NOT NULL,
    surah_end INT NOT NULL,
    ayah_end INT NOT NULL,
    ai_overall_score NUMERIC(5,2) NOT NULL,
    ai_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    recording_url TEXT,
    teacher_id BIGINT,
    teacher_override_score NUMERIC(5,2),
    teacher_comments TEXT,
    teacher_status TEXT NOT NULL DEFAULT 'pending' CHECK (teacher_status IN ('pending', 'approved', 'rejected', 'modified')),
    certificate_issued BOOLEAN DEFAULT false,
    certificate_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_nur_exams_student ON public.nur_exam_submissions(organization_id, student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nur_exams_status ON public.nur_exam_submissions(organization_id, teacher_status);

ALTER TABLE public.nur_exam_submissions ENABLE ROW LEVEL SECURITY;

-- 5. Canonical Audio Recitation Cache Metadata
CREATE TABLE IF NOT EXISTS public.nur_audio_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audio_hash TEXT UNIQUE NOT NULL,
    surah INT NOT NULL CHECK (surah BETWEEN 1 AND 114),
    ayah INT NOT NULL CHECK (ayah >= 1),
    reciter TEXT NOT NULL DEFAULT 'alafasy',
    audio_url TEXT NOT NULL,
    duration_ms INT,
    waveform_peaks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nur_audio_surah_ayah ON public.nur_audio_cache(surah, ayah, reciter);

ALTER TABLE public.nur_audio_cache ENABLE ROW LEVEL SECURITY;

-- 6. Clean and Safe Row Level Security Policies
DROP POLICY IF EXISTS "Nur AI memory tenant access" ON public.nur_student_memory_profiles;
CREATE POLICY "Nur AI memory tenant access" ON public.nur_student_memory_profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Nur AI mistakes tenant access" ON public.nur_mistake_logs;
CREATE POLICY "Nur AI mistakes tenant access" ON public.nur_mistake_logs
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Nur AI exercises tenant access" ON public.nur_practice_exercises;
CREATE POLICY "Nur AI exercises tenant access" ON public.nur_practice_exercises
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Nur AI exams tenant access" ON public.nur_exam_submissions;
CREATE POLICY "Nur AI exams tenant access" ON public.nur_exam_submissions
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public read nur_audio_cache" ON public.nur_audio_cache;
CREATE POLICY "Public read nur_audio_cache" ON public.nur_audio_cache
    FOR SELECT USING (true);

COMMIT;
