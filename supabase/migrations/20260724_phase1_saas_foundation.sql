-- ============================================================================
-- Phase 1 Migration: SaaS Multi-Tenant Database Foundation
-- Description: Creates organizations table, seeds Rahmania Institute, adds
--              organization_id + audit columns + INDEX + FOREIGN KEY (ON DELETE RESTRICT)
--              across all tenant tables with updated RLS policies.
-- ============================================================================

BEGIN;

-- 1. Create `organizations` Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    domain TEXT UNIQUE,
    subdomain TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    subscription_plan TEXT NOT NULL DEFAULT 'free',
    theme_config JSONB DEFAULT '{}'::jsonb,
    modules_config JSONB DEFAULT '{}'::jsonb,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 2. Seed Initial Organization: Rahmania Institute (Org #1)
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

-- 3. Function to safely migrate a tenant table
CREATE OR REPLACE FUNCTION public.migrate_tenant_table(target_table TEXT)
RETURNS VOID AS $$
BEGIN
    -- Step A: Add organization_id and audit columns as NULLABLE if they don't exist
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS organization_id UUID;', target_table);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS created_by UUID;', target_table);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS updated_by UUID;', target_table);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;', target_table);

    -- Step B: Populate existing null values with Rahmania Institute ID
    EXECUTE format('UPDATE public.%I SET organization_id = ''00000000-0000-0000-0000-000000000001'' WHERE organization_id IS NULL;', target_table);

    -- Step C: Alter column to NOT NULL
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN organization_id SET NOT NULL;', target_table);

    -- Step D: Add FOREIGN KEY with ON DELETE RESTRICT (Prevents accidental tenant data wipeouts)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = format('fk_%s_org_id', target_table)
    ) THEN
        EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT fk_%s_org_id FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE RESTRICT;', target_table, target_table);
    END IF;

    -- Step E: Create Index on organization_id for high performance
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_org_id ON public.%I(organization_id);', target_table, target_table);
END;
$$ LANGUAGE plpgsql;

-- Execute migration helper on key tenant tables if they exist
DO $$
DECLARE
    t TEXT;
    tenant_tables TEXT[] := ARRAY[
        'students', 'teachers', 'branches', 'student_fees', 'attendances', 
        'notices', 'events', 'gallery', 'blogs', 'faqs', 'testimonials', 
        'courses', 'expenses', 'daily_lessons', 'hadiya', 'teacher_hadiya',
        'boarding_daily_reports', 'exam_results', 'admission_applications'
    ];
BEGIN
    FOREACH t IN ARRAY tenant_tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            PERFORM public.migrate_tenant_table(t);
        END IF;
    END LOOP;
END $$;

-- 4. RLS Policy for `organizations` Table
DROP POLICY IF EXISTS "Public can view active organizations" ON public.organizations;
CREATE POLICY "Public can view active organizations" ON public.organizations
    FOR SELECT USING (status = 'active' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow insert organizations" ON public.organizations;
CREATE POLICY "Allow insert organizations" ON public.organizations
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update organizations" ON public.organizations;
CREATE POLICY "Allow update organizations" ON public.organizations
    FOR UPDATE USING (true);

COMMIT;
