-- ============================================================
-- APPLICATION MANAGEMENT SYSTEM — Multi-Tenant Migration (V2.2)
-- Run this SQL in Supabase SQL Editor
-- ============================================================

-- Step 0: Ensure organizations table exists
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    domain TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    subscription_plan TEXT NOT NULL DEFAULT 'enterprise',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 0.1: Ensure existing core tables have organization_id column
ALTER TABLE IF EXISTS public.branches ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE IF EXISTS public.teachers ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE IF EXISTS public.exam_results ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Step 0.2: Clean up previous application tables to avoid schema mismatches
DROP TABLE IF EXISTS public.application_actions CASCADE;
DROP TABLE IF EXISTS public.application_notifications CASCADE;
DROP TABLE IF EXISTS public.application_permissions CASCADE;
DROP TABLE IF EXISTS public.application_workflow_rules CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;

-- 1. Applications Table (Main application records)
CREATE TABLE public.applications (
  id                    BIGSERIAL PRIMARY KEY,
  organization_id       UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_number    TEXT NOT NULL,
  type                  TEXT NOT NULL DEFAULT 'leave',
  applicant_type        TEXT NOT NULL DEFAULT 'student',
  applicant_id          BIGINT NOT NULL,
  applicant_name        TEXT,
  branch_id             BIGINT,
  from_date             DATE,
  to_date               DATE,
  days_count            INT DEFAULT 0,
  reason                TEXT,
  priority              TEXT DEFAULT 'normal',
  attachment_url        TEXT,
  custom_title          TEXT,
  status                TEXT DEFAULT 'submitted',
  current_reviewer_role TEXT,
  workflow_snapshot     JSONB DEFAULT '[]'::jsonb,
  is_editable           BOOLEAN DEFAULT true,
  submitted_at          TIMESTAMPTZ DEFAULT now(),
  resubmit_count        INT DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_app_status CHECK (status IN ('draft', 'submitted', 'under_review', 'recommended', 'approved', 'rejected', 'cancelled')),
  CONSTRAINT chk_app_type CHECK (type IN ('leave', 'certificate', 'id_card', 'fee_waiver', 'readmission', 'other')),
  CONSTRAINT chk_app_applicant_type CHECK (applicant_type IN ('student', 'teacher', 'staff')),
  CONSTRAINT chk_app_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  CONSTRAINT uq_app_org_number UNIQUE (organization_id, application_number)
);

-- 2. Application Actions (Audit trail / timeline)
CREATE TABLE public.application_actions (
  id              BIGSERIAL PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id  BIGINT NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  action_type     TEXT NOT NULL,
  actor_id        BIGINT,
  actor_role      TEXT,
  actor_name      TEXT,
  from_status     TEXT,
  to_status       TEXT,
  comment         TEXT,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 3. Application Workflow Rules (Dynamic approval pipelines)
CREATE TABLE public.application_workflow_rules (
  id                          BIGSERIAL PRIMARY KEY,
  organization_id             UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_type            TEXT NOT NULL DEFAULT '*',
  applicant_type              TEXT NOT NULL DEFAULT '*',
  steps                       JSONB NOT NULL DEFAULT '[]'::jsonb,
  allow_resubmit_after_reject BOOLEAN DEFAULT true,
  is_active                   BOOLEAN DEFAULT true,
  created_at                  TIMESTAMPTZ DEFAULT now(),
  updated_at                  TIMESTAMPTZ DEFAULT now()
);

-- 4. Application Notifications (In-app notifications)
CREATE TABLE public.application_notifications (
  id                  BIGSERIAL PRIMARY KEY,
  organization_id     UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id      BIGINT NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  application_number  TEXT,
  recipient_id        BIGINT,
  recipient_role      TEXT,
  event_type          TEXT NOT NULL,
  title               TEXT,
  message             TEXT,
  is_read             BOOLEAN DEFAULT false,
  read_at             TIMESTAMPTZ,
  branch_id           BIGINT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- 5. Application Permissions (Dynamic role-based permissions)
CREATE TABLE public.application_permissions (
  id                BIGSERIAL PRIMARY KEY,
  organization_id   UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  role              TEXT NOT NULL,
  application_type  TEXT NOT NULL DEFAULT '*',
  can_submit        BOOLEAN DEFAULT false,
  can_view_own      BOOLEAN DEFAULT true,
  can_view_branch   BOOLEAN DEFAULT false,
  can_view_all      BOOLEAN DEFAULT false,
  can_edit          BOOLEAN DEFAULT false,
  can_recommend     BOOLEAN DEFAULT false,
  can_approve       BOOLEAN DEFAULT false,
  can_reject        BOOLEAN DEFAULT false,
  can_cancel        BOOLEAN DEFAULT false,
  can_generate_pdf  BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, role, application_type)
);

-- ============================================================
-- INDEXES for Performance & Isolation
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_applications_org ON public.applications(organization_id);
CREATE INDEX IF NOT EXISTS idx_applications_branch ON public.applications(branch_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_type ON public.applications(type);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON public.applications(applicant_id, applicant_type);
CREATE INDEX IF NOT EXISTS idx_applications_number ON public.applications(application_number);

CREATE INDEX IF NOT EXISTS idx_app_actions_org ON public.application_actions(organization_id);
CREATE INDEX IF NOT EXISTS idx_app_actions_app ON public.application_actions(application_id);

CREATE INDEX IF NOT EXISTS idx_app_notifications_org ON public.application_notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_app_notifications_recipient ON public.application_notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_app_notifications_app ON public.application_notifications(application_id);

CREATE INDEX IF NOT EXISTS idx_app_permissions_role ON public.application_permissions(organization_id, role);
CREATE INDEX IF NOT EXISTS idx_app_workflow_rules_org ON public.application_workflow_rules(organization_id);

-- ============================================================
-- Auto-calculate days_count trigger
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_application_days()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.from_date IS NOT NULL AND NEW.to_date IS NOT NULL THEN
    NEW.days_count := (NEW.to_date - NEW.from_date) + 1;
  ELSE
    NEW.days_count := 0;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_application_days ON public.applications;
CREATE TRIGGER trg_application_days
  BEFORE INSERT OR UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION calculate_application_days();

-- ============================================================
-- RLS Policies (Row Level Security)
-- ============================================================
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_permissions ENABLE ROW LEVEL SECURITY;

-- Idempotent Policy Setup
DROP POLICY IF EXISTS "service_role_full_access_applications" ON public.applications;
DROP POLICY IF EXISTS "service_role_full_access_app_actions" ON public.application_actions;
DROP POLICY IF EXISTS "service_role_full_access_app_workflow" ON public.application_workflow_rules;
DROP POLICY IF EXISTS "service_role_full_access_app_notifications" ON public.application_notifications;
DROP POLICY IF EXISTS "service_role_full_access_app_permissions" ON public.application_permissions;

DROP POLICY IF EXISTS "authenticated_org_access_applications" ON public.applications;
DROP POLICY IF EXISTS "authenticated_org_access_app_actions" ON public.application_actions;
DROP POLICY IF EXISTS "authenticated_org_access_app_workflow" ON public.application_workflow_rules;
DROP POLICY IF EXISTS "authenticated_org_access_app_notifications" ON public.application_notifications;
DROP POLICY IF EXISTS "authenticated_org_access_app_permissions" ON public.application_permissions;

-- Service Role Policies (Full Bypass)
CREATE POLICY "service_role_full_access_applications" ON public.applications FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access_app_actions" ON public.application_actions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access_app_workflow" ON public.application_workflow_rules FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access_app_notifications" ON public.application_notifications FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access_app_permissions" ON public.application_permissions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated Users Policies (Tenant Isolated)
CREATE POLICY "authenticated_org_access_applications" ON public.applications FOR ALL TO authenticated
  USING (organization_id IS NULL OR organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id IS NULL OR organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "authenticated_org_access_app_actions" ON public.application_actions FOR ALL TO authenticated
  USING (organization_id IS NULL OR organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id IS NULL OR organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "authenticated_org_access_app_workflow" ON public.application_workflow_rules FOR ALL TO authenticated
  USING (organization_id IS NULL OR organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id IS NULL OR organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "authenticated_org_access_app_notifications" ON public.application_notifications FOR ALL TO authenticated
  USING (organization_id IS NULL OR organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id IS NULL OR organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "authenticated_org_access_app_permissions" ON public.application_permissions FOR ALL TO authenticated
  USING (organization_id IS NULL OR organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id IS NULL OR organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- ============================================================
-- RPC: Tenant-Isolated Performance Ranking (for RankingCenter.jsx)
-- ============================================================
DROP FUNCTION IF EXISTS public.get_entity_performance_ranking CASCADE;

CREATE OR REPLACE FUNCTION public.get_entity_performance_ranking(
  p_organization_id UUID DEFAULT NULL,
  p_ranking_type TEXT DEFAULT 'branch',
  p_branch_id BIGINT DEFAULT NULL,
  p_class_id BIGINT DEFAULT NULL,
  p_session TEXT DEFAULT NULL,
  p_exam_id BIGINT DEFAULT NULL,
  p_teacher_id BIGINT DEFAULT NULL,
  p_limit INT DEFAULT 200,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  entity_id BIGINT,
  entity_name TEXT,
  entity_type TEXT,
  student_count BIGINT,
  total_obtained NUMERIC,
  total_full NUMERIC,
  performance_pct NUMERIC,
  pass_pct NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_ranking_type = 'teacher' THEN
    RETURN QUERY
    SELECT
      t.id AS entity_id,
      COALESCE(t.full_name_en, t.full_name_bn, 'Teacher ' || t.id) AS entity_name,
      'teacher'::TEXT AS entity_type,
      COUNT(DISTINCT s.id)::BIGINT AS student_count,
      COALESCE(SUM(er.obtained_marks), 0)::NUMERIC AS total_obtained,
      COALESCE(SUM(er.full_marks), 0)::NUMERIC AS total_full,
      CASE WHEN SUM(er.full_marks) > 0
        THEN ROUND((SUM(er.obtained_marks)::NUMERIC / SUM(er.full_marks)::NUMERIC) * 100, 2)
        ELSE 0 END AS performance_pct,
      CASE WHEN COUNT(er.id) > 0
        THEN ROUND(
          (COUNT(CASE WHEN er.obtained_marks >= COALESCE(er.pass_marks, 0) THEN 1 END)::NUMERIC / COUNT(er.id)::NUMERIC) * 100, 2
        )
        ELSE 0 END AS pass_pct
    FROM public.teachers t
    LEFT JOIN public.students s ON s.assigned_teacher_id = t.id
      AND (p_branch_id IS NULL OR s.branch_id = p_branch_id)
      AND (p_class_id IS NULL OR s.class_id = p_class_id)
      AND (p_session IS NULL OR s.session = p_session)
    LEFT JOIN public.exam_results er ON er.student_id = s.id
      AND (p_exam_id IS NULL OR er.exam_id = p_exam_id)
    WHERE (p_organization_id IS NULL OR t.organization_id = p_organization_id)
      AND (p_teacher_id IS NULL OR t.id = p_teacher_id)
    GROUP BY t.id, t.full_name_en, t.full_name_bn
    HAVING COUNT(DISTINCT s.id) > 0
    ORDER BY performance_pct DESC
    LIMIT p_limit OFFSET p_offset;
  ELSE
    RETURN QUERY
    SELECT
      b.id AS entity_id,
      COALESCE(b.name_bn, b.name_en, 'Branch ' || b.id) AS entity_name,
      'branch'::TEXT AS entity_type,
      COUNT(DISTINCT s.id)::BIGINT AS student_count,
      COALESCE(SUM(er.obtained_marks), 0)::NUMERIC AS total_obtained,
      COALESCE(SUM(er.full_marks), 0)::NUMERIC AS total_full,
      CASE WHEN SUM(er.full_marks) > 0
        THEN ROUND((SUM(er.obtained_marks)::NUMERIC / SUM(er.full_marks)::NUMERIC) * 100, 2)
        ELSE 0 END AS performance_pct,
      CASE WHEN COUNT(er.id) > 0
        THEN ROUND(
          (COUNT(CASE WHEN er.obtained_marks >= COALESCE(er.pass_marks, 0) THEN 1 END)::NUMERIC / COUNT(er.id)::NUMERIC) * 100, 2
        )
        ELSE 0 END AS pass_pct
    FROM public.branches b
    LEFT JOIN public.students s ON s.branch_id = b.id
      AND (p_class_id IS NULL OR s.class_id = p_class_id)
      AND (p_session IS NULL OR s.session = p_session)
    LEFT JOIN public.exam_results er ON er.student_id = s.id
      AND (p_exam_id IS NULL OR er.exam_id = p_exam_id)
    WHERE (p_organization_id IS NULL OR b.organization_id = p_organization_id)
      AND (p_branch_id IS NULL OR b.id = p_branch_id)
    GROUP BY b.id, b.name_bn, b.name_en
    ORDER BY performance_pct DESC
    LIMIT p_limit OFFSET p_offset;
  END IF;
END;
$$;
