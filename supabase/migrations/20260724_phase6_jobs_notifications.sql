-- ============================================================================
-- Phase 6 Migration: Idempotent Background Job Queue, Notification Logs & Import/Export
-- Description: Creates background_jobs (idempotency_key UNIQUE, progress, retry),
--              notification_logs (provider-agnostic channel logs),
--              import_export_tasks (dry-run preview mode & tenant scoping).
-- ============================================================================

BEGIN;

-- 1. Create `background_jobs` Table
CREATE TABLE IF NOT EXISTS public.background_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    idempotency_key TEXT UNIQUE,
    job_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    progress_percent INT DEFAULT 0,
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_background_jobs_org_id ON public.background_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_background_jobs_status ON public.background_jobs(status);

ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;

-- 2. Create `notification_logs` Table
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    provider_type TEXT NOT NULL DEFAULT 'default',
    channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'sms', 'whatsapp')),
    recipient TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'queued', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_org_id ON public.notification_logs(organization_id);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- 3. Create `import_export_tasks` Table
CREATE TABLE IF NOT EXISTS public.import_export_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    task_type TEXT NOT NULL CHECK (task_type IN ('import', 'export')),
    file_format TEXT NOT NULL DEFAULT 'csv',
    dry_run_summary JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft_preview' CHECK (status IN ('draft_preview', 'confirmed', 'completed', 'failed')),
    record_count INT DEFAULT 0,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_import_export_tasks_org_id ON public.import_export_tasks(organization_id);

ALTER TABLE public.import_export_tasks ENABLE ROW LEVEL SECURITY;

COMMIT;
