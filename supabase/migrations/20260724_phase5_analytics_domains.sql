-- ============================================================================
-- Phase 5 Migration: Multi-Domain Mapping, Event Analytics & Deep White Labeling
-- Description: Creates domain_mappings (UNIQUE domain_name, single primary partial INDEX, DNS verification_token),
--              platform_analytics_events & platform_analytics_daily (raw & aggregated stores),
--              white_label_configs & white_label_versions (versioned branding with rollback support).
-- ============================================================================

BEGIN;

-- 1. Create `domain_mappings` Table (With DNS ownership token & Partial Unique Index for Single Primary Domain)
CREATE TABLE IF NOT EXISTS public.domain_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    domain_name TEXT NOT NULL UNIQUE,
    domain_type TEXT NOT NULL DEFAULT 'secondary' CHECK (domain_type IN ('primary', 'secondary', 'staging')),
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'expired')),
    verification_token TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    ssl_status TEXT NOT NULL DEFAULT 'pending',
    is_active_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_domain_mappings_org_id ON public.domain_mappings(organization_id);
CREATE INDEX IF NOT EXISTS idx_domain_mappings_domain_name ON public.domain_mappings(domain_name);

-- Database Partial UNIQUE Index: Ensures strictly ONE active primary domain per organization
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_primary_domain 
    ON public.domain_mappings(organization_id) 
    WHERE (is_active_primary = true);

ALTER TABLE public.domain_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select domain mappings" ON public.domain_mappings;
CREATE POLICY "Allow select domain mappings" ON public.domain_mappings
    FOR SELECT USING (true);

-- 2. Create `platform_analytics_events` & `platform_analytics_daily` Tables
CREATE TABLE IF NOT EXISTS public.platform_analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    event_name TEXT NOT NULL,
    event_category TEXT NOT NULL DEFAULT 'general',
    user_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_org_id ON public.platform_analytics_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.platform_analytics_events(created_at DESC);

ALTER TABLE public.platform_analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert analytics events" ON public.platform_analytics_events;
CREATE POLICY "Allow insert analytics events" ON public.platform_analytics_events
    FOR INSERT WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.platform_analytics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, metric_date, metric_name)
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_org_date ON public.platform_analytics_daily(organization_id, metric_date);

ALTER TABLE public.platform_analytics_daily ENABLE ROW LEVEL SECURITY;

-- 3. Create `white_label_configs` & `white_label_versions` Tables (Versioned Branding & Rollback Support)
CREATE TABLE IF NOT EXISTS public.white_label_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT UNIQUE,
    browser_title TEXT,
    favicon_url TEXT,
    current_version INT DEFAULT 1,
    branding_json JSONB DEFAULT '{}'::jsonb,
    theme_colors_json JSONB DEFAULT '{}'::jsonb,
    login_style_json JSONB DEFAULT '{}'::jsonb,
    email_branding_json JSONB DEFAULT '{}'::jsonb,
    sms_branding_json JSONB DEFAULT '{}'::jsonb,
    seo_metadata_json JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.white_label_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID NOT NULL REFERENCES public.white_label_configs(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    version_number INT NOT NULL,
    branding_json JSONB DEFAULT '{}'::jsonb,
    theme_colors_json JSONB DEFAULT '{}'::jsonb,
    login_style_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, version_number)
);

ALTER TABLE public.white_label_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.white_label_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select white label configs" ON public.white_label_configs;
CREATE POLICY "Public select white label configs" ON public.white_label_configs
    FOR SELECT USING (true);

COMMIT;
