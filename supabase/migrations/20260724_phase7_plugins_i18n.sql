-- ============================================================================
-- Phase 7 Migration: Theme & Plugin Frameworks, i18n & Subscription Capabilities
-- Description: Creates registered_themes (min/max_platform_version compatibility),
--              tenant_active_themes (UNIQUE org, data preservation on deactivation),
--              theme_versions, installed_plugins, tenant_i18n_settings,
--              and subscription_capabilities.
-- ============================================================================

BEGIN;

-- 1. Create `registered_themes` & `tenant_active_themes` & `theme_versions` Tables
CREATE TABLE IF NOT EXISTS public.registered_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0.0',
    min_platform_version TEXT NOT NULL DEFAULT '2.0.0',
    max_platform_version TEXT,
    author TEXT DEFAULT 'SaaS Platform',
    manifest_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    screenshot_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tenant_active_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT UNIQUE,
    theme_key TEXT NOT NULL REFERENCES public.registered_themes(theme_key) ON DELETE RESTRICT,
    config_json JSONB DEFAULT '{}'::jsonb,
    current_version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.theme_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    theme_key TEXT NOT NULL,
    version_number INT NOT NULL,
    config_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, theme_key, version_number)
);

ALTER TABLE public.registered_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_active_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select registered themes" ON public.registered_themes;
CREATE POLICY "Public select registered themes" ON public.registered_themes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public select tenant active themes" ON public.tenant_active_themes;
CREATE POLICY "Public select tenant active themes" ON public.tenant_active_themes FOR SELECT USING (true);

-- Seed Default Themes with Platform Version Compatibility
INSERT INTO public.registered_themes (theme_key, name, version, min_platform_version, author, manifest_json) VALUES
('madrasa-classic', 'Classic Madrasa Theme', '1.0.0', '2.0.0', 'SaaS Platform', '{"compatibility": "2.0", "primary_color": "#0f766e"}'::jsonb),
('school-modern', 'Modern School Theme', '1.0.0', '2.0.0', 'SaaS Platform', '{"compatibility": "2.0", "primary_color": "#2563eb"}'::jsonb)
ON CONFLICT (theme_key) DO NOTHING;

-- 2. Create `installed_plugins` Table (Data Preserved on Deactivation)
CREATE TABLE IF NOT EXISTS public.installed_plugins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    plugin_id TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0.0',
    min_platform_version TEXT NOT NULL DEFAULT '2.0.0',
    max_platform_version TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'disabled')),
    settings_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, plugin_id)
);

ALTER TABLE public.installed_plugins ENABLE ROW LEVEL SECURITY;

-- 3. Create `tenant_i18n_settings` Table
CREATE TABLE IF NOT EXISTS public.tenant_i18n_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT UNIQUE,
    default_language TEXT NOT NULL DEFAULT 'bn' CHECK (default_language IN ('bn', 'en', 'ar')),
    currency_code TEXT NOT NULL DEFAULT 'BDT' CHECK (currency_code IN ('BDT', 'USD', 'SAR')),
    timezone TEXT NOT NULL DEFAULT 'Asia/Dhaka',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.tenant_i18n_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select tenant i18n settings" ON public.tenant_i18n_settings;
CREATE POLICY "Public select tenant i18n settings" ON public.tenant_i18n_settings FOR SELECT USING (true);

-- 4. Create `subscription_capabilities` Table
CREATE TABLE IF NOT EXISTS public.subscription_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_key TEXT NOT NULL UNIQUE CHECK (plan_key IN ('free', 'basic', 'premium', 'enterprise')),
    max_students INT DEFAULT 500,
    max_branches INT DEFAULT 1,
    storage_quota_mb INT DEFAULT 1024,
    allowed_themes_json JSONB DEFAULT '["madrasa-classic"]'::jsonb,
    allowed_plugins_json JSONB DEFAULT '["biometric-bridge", "online-admissions"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.subscription_capabilities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select subscription capabilities" ON public.subscription_capabilities;
CREATE POLICY "Public select subscription capabilities" ON public.subscription_capabilities FOR SELECT USING (true);

-- Seed Default Subscription Plan Limits
INSERT INTO public.subscription_capabilities (plan_key, max_students, max_branches, allowed_themes_json, allowed_plugins_json) VALUES
('free', 200, 1, '["madrasa-classic"]'::jsonb, '["biometric-bridge"]'::jsonb),
('premium', 5000, 10, '["madrasa-classic", "school-modern"]'::jsonb, '["biometric-bridge", "sms-gateway", "online-admissions"]'::jsonb),
('enterprise', 999999, 100, '["*"]'::jsonb, '["*"]'::jsonb)
ON CONFLICT (plan_key) DO NOTHING;

COMMIT;
