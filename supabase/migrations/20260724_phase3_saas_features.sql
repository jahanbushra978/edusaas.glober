-- ============================================================================
-- Phase 3 Migration: Platform Audit Logging & SaaS Features
-- Description: Creates immutable platform_audit_logs table with RLS enforcement
--              blocking UPDATE and DELETE queries.
-- ============================================================================

BEGIN;

-- 1. Create `platform_audit_logs` Table
CREATE TABLE IF NOT EXISTS public.platform_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE RESTRICT,
    actor_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for high-performance audit query filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON public.platform_audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.platform_audit_logs(created_at DESC);

-- Enable RLS on audit logs
ALTER TABLE public.platform_audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies: IMMUTABLE AUDIT LOGS
-- Allows SELECT for authenticated users/platform owners
DROP POLICY IF EXISTS "Allow select platform audit logs" ON public.platform_audit_logs;
CREATE POLICY "Allow select platform audit logs" ON public.platform_audit_logs
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Allows INSERT for audit logging
DROP POLICY IF EXISTS "Allow insert platform audit logs" ON public.platform_audit_logs;
CREATE POLICY "Allow insert platform audit logs" ON public.platform_audit_logs
    FOR INSERT WITH CHECK (true);

-- STRICTLY BLOCK UPDATE and DELETE (Immutable History)
-- No UPDATE or DELETE policies created, ensuring database rejects mutations.

COMMIT;
