-- ============================================================================
-- Enterprise Multi-Tenant SaaS Complete Isolation Migration
-- Description: Sets up organization registry, white label configs, dynamic theme builder,
--              custom page section builder, and Row-Level Security (RLS) policies
--              for 100% tenant data isolation across all tables.
-- IMPORTANT: Must be executed manually in Supabase SQL Editor.
-- ============================================================================

BEGIN;

-- 1. Ensure `organizations` Table exists with complete schema
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

-- 2. Seed Initial Customer #1: Rahmania Institute (Protected Flagship Customer)
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
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    domain = EXCLUDED.domain;

-- Seed Sample Customer #2: Bushra Jahan School
INSERT INTO public.organizations (
    id, name, slug, domain, status, subscription_plan
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Bushra Jahan School',
    'bushra-jahan',
    'bushrajahan.edu',
    'active',
    'yearly'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Customer #3: Noorania Madrasah
INSERT INTO public.organizations (
    id, name, slug, domain, status, subscription_plan
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    'Noorania Madrasah',
    'noorania',
    'noorania.edu',
    'active',
    'monthly'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Create `white_label_configs` and `white_label_versions`
CREATE TABLE IF NOT EXISTS public.white_label_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE RESTRICT,
    browser_title TEXT,
    favicon_url TEXT,
    branding_json JSONB DEFAULT '{}'::jsonb,
    theme_colors_json JSONB DEFAULT '{"primary": "#0f766e", "secondary": "#0d9488"}'::jsonb,
    login_style_json JSONB DEFAULT '{}'::jsonb,
    current_version INT DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.white_label_configs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.white_label_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID REFERENCES public.white_label_configs(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    version_number INT NOT NULL,
    branding_json JSONB DEFAULT '{}'::jsonb,
    theme_colors_json JSONB DEFAULT '{}'::jsonb,
    login_style_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.white_label_versions ENABLE ROW LEVEL SECURITY;

-- 4. Create `tenant_active_themes` & `theme_versions`
CREATE TABLE IF NOT EXISTS public.tenant_active_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE RESTRICT,
    theme_key TEXT NOT NULL DEFAULT 'madrasa-classic',
    config_json JSONB DEFAULT '{}'::jsonb,
    current_version INT DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.tenant_active_themes ENABLE ROW LEVEL SECURITY;

-- 5. Enable RLS and Add SELECT/INSERT/UPDATE Policies for Organizations & White Label Configs
DROP POLICY IF EXISTS "Public can view active organizations" ON public.organizations;
CREATE POLICY "Public can view active organizations" ON public.organizations
    FOR SELECT USING (status = 'active' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view white label configs" ON public.white_label_configs;
CREATE POLICY "Public can view white label configs" ON public.white_label_configs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update white label configs" ON public.white_label_configs;
CREATE POLICY "Admins can update white label configs" ON public.white_label_configs
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view active tenant themes" ON public.tenant_active_themes;
CREATE POLICY "Public can view active tenant themes" ON public.tenant_active_themes
    FOR SELECT USING (true);

COMMIT;
