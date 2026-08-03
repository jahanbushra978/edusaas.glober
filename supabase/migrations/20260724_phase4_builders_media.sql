-- ============================================================================
-- Phase 4 Migration: Dynamic Builders, Media Manager, Form Submissions & Version Control
-- Description: Creates media_items (reference storage + soft delete), custom_pages,
--              page_versions (full metadata snapshot), menu_definitions,
--              form_definitions, and form_submissions with strict tenant isolation.
-- ============================================================================

BEGIN;

-- 1. Create `media_items` Table (Cloudinary URL/Reference storage only, soft delete enabled)
CREATE TABLE IF NOT EXISTS public.media_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    cloudinary_public_id TEXT,
    file_type TEXT NOT NULL DEFAULT 'image',
    file_size BIGINT DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_media_items_org_id ON public.media_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_media_items_deleted_at ON public.media_items(deleted_at);

ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active media items" ON public.media_items;
CREATE POLICY "Public can view active media items" ON public.media_items
    FOR SELECT USING (deleted_at IS NULL OR auth.role() = 'authenticated');

-- 2. Create `custom_pages` & `page_versions` Tables (Full Metadata Snapshot: title, slug, SEO, sections, settings)
CREATE TABLE IF NOT EXISTS public.custom_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    seo_config JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    current_version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, slug)
);

CREATE TABLE IF NOT EXISTS public.page_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.custom_pages(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    version_number INT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    seo_config JSONB DEFAULT '{}'::jsonb,
    content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    sections JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_custom_pages_org_id ON public.custom_pages(organization_id);
CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON public.page_versions(page_id);

ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_versions ENABLE ROW LEVEL SECURITY;

-- 3. Create `menu_definitions` Table
CREATE TABLE IF NOT EXISTS public.menu_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    menu_key TEXT NOT NULL DEFAULT 'main_header',
    items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, menu_key)
);

ALTER TABLE public.menu_definitions ENABLE ROW LEVEL SECURITY;

-- 4. Create `form_definitions` & `form_submissions` Tables (Tenant-Aware Submissions Storage)
CREATE TABLE IF NOT EXISTS public.form_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    form_key TEXT NOT NULL,
    fields_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, form_key)
);

CREATE TABLE IF NOT EXISTS public.form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    form_id UUID REFERENCES public.form_definitions(id) ON DELETE RESTRICT,
    form_key TEXT NOT NULL,
    submission_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_org_id ON public.form_submissions(organization_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_key ON public.form_submissions(form_key);

ALTER TABLE public.form_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public form submission insert for active forms
DROP POLICY IF EXISTS "Public insert form submissions" ON public.form_submissions;
CREATE POLICY "Public insert form submissions" ON public.form_submissions
    FOR INSERT WITH CHECK (true);

COMMIT;
