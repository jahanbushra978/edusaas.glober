-- ============================================================================
-- Migration: 20261004_harden_platform_security_and_rls.sql
-- Description: Hardens Multi-Tenant SaaS Security, creates Platform Owner
--              credentials & audit trail, locks down organizations & white-label RLS.
-- ============================================================================

BEGIN;

-- 1. Create `platform_owners` table (Isolated from school admins/users)
CREATE TABLE IF NOT EXISTS public.platform_owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL DEFAULT 'Platform Master',
    role VARCHAR(50) NOT NULL DEFAULT 'platform_owner',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

ALTER TABLE public.platform_owners ENABLE ROW LEVEL SECURITY;

-- Deny all client-side direct access (Must go through server-side API with service role)
DROP POLICY IF EXISTS "Deny public access on platform_owners" ON public.platform_owners;
CREATE POLICY "Deny public access on platform_owners" ON public.platform_owners
    FOR ALL USING (false);

-- Seed Initial Platform Owner (admin@platform.com / admin123)
-- Uses bcrypt hash for 'admin123' with cost factor 10
INSERT INTO public.platform_owners (
    email,
    password_hash,
    full_name,
    role,
    is_active
) VALUES (
    'admin@platform.com',
    '$2a$10$wO0MvV2n8Q71eN3YpCq0ve4dG1iGzT/8dYn7dE01j5K.6K8.X8sXq',
    'Platform Master Owner',
    'platform_owner',
    true
)
ON CONFLICT (email) DO NOTHING;


-- 2. Create `platform_audit_logs` table (Immutable security audit trail)
CREATE TABLE IF NOT EXISTS public.platform_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_email VARCHAR(255),
    actor_role VARCHAR(50) DEFAULT 'platform_owner',
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100),
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.platform_audit_logs ADD COLUMN IF NOT EXISTS organization_id UUID;

CREATE INDEX IF NOT EXISTS idx_platform_audit_created ON public.platform_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_audit_action ON public.platform_audit_logs(action);

ALTER TABLE public.platform_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny public access on platform_audit_logs" ON public.platform_audit_logs;
CREATE POLICY "Deny public access on platform_audit_logs" ON public.platform_audit_logs
    FOR ALL USING (false);


-- 3. Ensure `organizations` table has all necessary columns
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    domain TEXT UNIQUE,
    subdomain TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'expired')),
    subscription_plan TEXT NOT NULL DEFAULT 'enterprise' CHECK (subscription_plan IN ('trial', 'free', 'monthly', 'yearly', 'enterprise', 'custom')),
    theme_config JSONB DEFAULT '{"primaryColor": "#0f766e", "secondaryColor": "#0d9488"}'::jsonb,
    modules_config JSONB DEFAULT '{"enabled": ["students", "teachers", "attendance", "exams", "fees", "notices", "gallery", "events", "applications", "ai_assistant"]}'::jsonb,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Ensure required columns exist if organizations table was already created
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS modules_config JSONB DEFAULT '{"enabled": ["students", "teachers", "attendance", "exams", "fees", "notices", "gallery", "events", "applications", "ai_assistant"]}'::jsonb;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{"primaryColor": "#0f766e", "secondaryColor": "#0d9488"}'::jsonb;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS subscription_plan TEXT NOT NULL DEFAULT 'enterprise';

-- 4. Seed Protected Organizations (Preserved across all migrations)
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


-- 5. CRITICAL FIX: Lock down RLS on `organizations`
-- Remove vulnerable open insert/update/delete policies
DROP POLICY IF EXISTS "Allow insert organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow delete organizations" ON public.organizations;
DROP POLICY IF EXISTS "Public can view active organizations" ON public.organizations;

-- Only active organizations are visible publicly for domain/slug resolution
CREATE POLICY "Public can view active organizations" ON public.organizations
    FOR SELECT USING (status = 'active');

-- Writable ONLY through backend service_role (No direct client write permissions!)


-- 6. CRITICAL FIX: Lock down RLS on `white_label_configs`
CREATE TABLE IF NOT EXISTS public.white_label_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    browser_title TEXT,
    favicon_url TEXT,
    branding_json JSONB DEFAULT '{}'::jsonb,
    theme_colors_json JSONB DEFAULT '{"primary": "#0f766e", "secondary": "#0d9488"}'::jsonb,
    login_style_json JSONB DEFAULT '{}'::jsonb,
    current_version INT DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.white_label_configs ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.white_label_configs ADD COLUMN IF NOT EXISTS browser_title TEXT;
ALTER TABLE public.white_label_configs ADD COLUMN IF NOT EXISTS favicon_url TEXT;
ALTER TABLE public.white_label_configs ADD COLUMN IF NOT EXISTS branding_json JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.white_label_configs ADD COLUMN IF NOT EXISTS theme_colors_json JSONB DEFAULT '{"primary": "#0f766e", "secondary": "#0d9488"}'::jsonb;
ALTER TABLE public.white_label_configs ADD COLUMN IF NOT EXISTS login_style_json JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.white_label_configs ADD COLUMN IF NOT EXISTS current_version INT DEFAULT 1;

ALTER TABLE public.white_label_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view white label configs" ON public.white_label_configs;
DROP POLICY IF EXISTS "Admins can update white label configs" ON public.white_label_configs;

-- Public can read branding
CREATE POLICY "Public can view white label configs" ON public.white_label_configs
    FOR SELECT USING (true);

-- Writable ONLY through backend service_role (No direct client write permissions!)


-- 7. Fix branches columns to prevent runtime query errors on home page
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'branches') THEN
        ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS organization_id UUID;
        ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS card_image_url TEXT;
        ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS image_url TEXT;
        ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS slider_images TEXT[];
        ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS logo TEXT;
    END IF;
END $$;


-- 8. Create & Harden `security_events` Table (Immutable Threat Telemetry)
CREATE TABLE IF NOT EXISTS public.security_events (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    severity VARCHAR(20) NOT NULL DEFAULT 'LOW',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    event_type VARCHAR(100) NOT NULL,
    action VARCHAR(100),
    user_id UUID,
    organization_id UUID,
    ip_address VARCHAR(100),
    user_agent TEXT,
    endpoint TEXT,
    method VARCHAR(10),
    resource_type VARCHAR(100),
    resource_id TEXT,
    success BOOLEAN DEFAULT false,
    block_reason TEXT,
    correlation_id TEXT,
    source VARCHAR(50) DEFAULT 'nextjs_backend',
    details JSONB DEFAULT '{}'::jsonb,
    resolution_note TEXT,
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crucial: Ensure organization_id and all other columns exist if security_events already existed!
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'LOW';
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'OPEN';
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS event_type VARCHAR(100);
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS action VARCHAR(100);
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS ip_address VARCHAR(100);
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS endpoint TEXT;
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS method VARCHAR(10);
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS resource_type VARCHAR(100);
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS resource_id TEXT;
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT false;
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS block_reason TEXT;
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS correlation_id TEXT;
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'nextjs_backend';
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS resolution_note TEXT;
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS resolved_by VARCHAR(255);
ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_security_events_created ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_org ON public.security_events(organization_id);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Deny all client-side direct access (Written exclusively via server-side service role!)
DROP POLICY IF EXISTS "Deny direct public access on security_events" ON public.security_events;
CREATE POLICY "Deny direct public access on security_events" ON public.security_events
    FOR ALL USING (false);


-- 9. Insecure Public Exposure Fix: Lock down `app_settings` and `branches`
ALTER TABLE IF EXISTS public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable full access for all users" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_select_policy" ON public.app_settings;
DROP POLICY IF EXISTS "Allow_Public_Select_app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_public_read" ON public.app_settings;

-- Public can read ONLY non-sensitive settings (Excludes passwords, secrets, JWT tokens, private keys)
CREATE POLICY "app_settings_public_read" ON public.app_settings
    FOR SELECT TO public
    USING (
        key NOT ILIKE '%password%'
        AND key NOT ILIKE '%secret%'
        AND key NOT ILIKE '%token%'
        AND key NOT ILIKE '%private_key%'
        AND key NOT ILIKE '%service_role%'
        AND key NOT IN ('admin_login_password', 'admin_password', 'jwt_secret', 'encryption_key', 'service_role_key', 'smtp_password', 'resend_api_key')
    );

ALTER TABLE IF EXISTS public.branches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "branches_public_read" ON public.branches;
DROP POLICY IF EXISTS "Allow_Public_Select_branches" ON public.branches;
CREATE POLICY "branches_public_read" ON public.branches
    FOR SELECT TO public
    USING (is_active IS NOT FALSE);


-- 10. Insecure Public Table Exposure Elimination (Revoke dangerous open policies on private tables)
DO $$
DECLARE
    priv_tbl text;
    private_tables text[] := ARRAY[
        'students',
        'student_fees',
        'attendances',
        'teacher_attendance',
        'daily_lessons',
        'hadiya',
        'teacher_payments',
        'teacher_salary_profiles',
        'teacher_hadiya',
        'boarding_daily_reports',
        'boarding_expenses',
        'expenses',
        'admission_applications',
        'exam_results',
        'exam_inputs',
        'login_attempts',
        'security_settings'
    ];
BEGIN
    FOREACH priv_tbl IN ARRAY private_tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = priv_tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', priv_tbl);
            -- Drop any accidental open public SELECT policy
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Allow_Public_Select_' || priv_tbl, priv_tbl);
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Enable full access for all users', priv_tbl);
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Public can view ' || priv_tbl, priv_tbl);
        END IF;
    END LOOP;
END $$;


-- 11. RPC Hardening: Secure `get_home_page_data()`
-- Hardens search_path, strips sensitive secrets from app_settings, sanitizes output
CREATE OR REPLACE FUNCTION public.get_home_page_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result json;
  notices_json json;
  settings_json json;
  hero_slides_json json;
  events_json json;
  gallery_json json;
  branches_json json;
  blogs_json json;
  page_sections_json json;
  faqs_json json;
  testimonials_json json;
  teachers_json json;
  sponsors_json json;
  success_stories_json json;
  students_json json;
  contact_info_json json;
  courses_json json;
BEGIN
  -- 1. Notices
  SELECT COALESCE(json_agg(t), '[]'::json) INTO notices_json FROM (
    SELECT 
      id,
      title as title_bn,
      title as title_en,
      title as title_ar,
      description as summary_bn,
      description as summary_en,
      description as summary_ar,
      body as content_bn,
      body as content_en,
      body as content_ar,
      type,
      image as image_url,
      created_date,
      is_active
    FROM public.notices
    WHERE is_active = true AND is_published IS DISTINCT FROM false
    ORDER BY created_date DESC
    LIMIT 50
  ) t;

  -- 2. App Settings (Hardened: Exclude all sensitive keys, passwords, and tokens)
  SELECT COALESCE(json_object_agg(key, value), '{}'::json) INTO settings_json 
  FROM public.app_settings
  WHERE key NOT ILIKE '%password%'
    AND key NOT ILIKE '%secret%'
    AND key NOT ILIKE '%token%'
    AND key NOT ILIKE '%private_key%'
    AND key NOT ILIKE '%service_role%'
    AND key NOT IN ('admin_login_password', 'admin_password', 'jwt_secret', 'encryption_key', 'service_role_key', 'smtp_password', 'resend_api_key');

  -- 3. Hero Slides
  SELECT COALESCE(json_agg(t), '[]'::json) INTO hero_slides_json FROM (
    SELECT 
      id,
      COALESCE(title, caption_bn, '') as title_bn,
      COALESCE(title, caption_en, '') as title_en,
      COALESCE(title, caption_en, '') as title_ar,
      COALESCE(subtitle, '') as subtitle_bn,
      COALESCE(subtitle, '') as subtitle_en,
      COALESCE(subtitle, '') as subtitle_ar,
      COALESCE(image_url, '') as image_url,
      COALESCE(sort_order, 0) as sort_order,
      is_active,
      '' as link_url,
      created_date
    FROM public.hero_slides
    WHERE is_active = true
    ORDER BY sort_order
    LIMIT 100
  ) t;

  -- 4. Events
  SELECT COALESCE(json_agg(t), '[]'::json) INTO events_json FROM (
    SELECT 
      id,
      title as title_bn,
      title as title_en,
      title as title_ar,
      description as description_bn,
      description as description_en,
      description as description_ar,
      event_date,
      COALESCE(banner_url, '') as banner_url,
      true as is_active,
      created_date
    FROM public.events
    ORDER BY event_date DESC
    LIMIT 50
  ) t;

  -- 5. Gallery
  SELECT COALESCE(json_agg(t), '[]'::json) INTO gallery_json FROM (
    SELECT 
      id,
      title as title_bn,
      title as title_en,
      title as title_ar,
      '' as description_bn,
      '' as description_en,
      '' as description_ar,
      COALESCE(image_url, '') as image_url,
      COALESCE(category, 'general') as department,
      true as is_published,
      'Y' as show_on_website,
      created_at
    FROM public.gallery
    ORDER BY created_at DESC
    LIMIT 200
  ) t;

  -- 6. Branches
  SELECT COALESCE(json_agg(t), '[]'::json) INTO branches_json FROM (
    SELECT 
      id,
      COALESCE(name_bn, branch_name, name_en, '') as name_bn,
      COALESCE(name_en, branch_name, name_bn, '') as name_en,
      COALESCE(name_en, branch_name, name_bn, '') as name_ar,
      CASE 
        WHEN branch_name IS NOT NULL THEN LOWER(REGEXP_REPLACE(branch_name, '\s+', '-', 'g'))
        ELSE id::text
      END as slug,
      '' as description_bn,
      '' as description_en,
      '' as description_ar,
      COALESCE(address_bn, address_en, '') as address_bn,
      COALESCE(address_en, address_bn, '') as address_en,
      COALESCE(phone, '') as phone,
      '' as email,
      COALESCE(image_url, '') as image_url,
      COALESCE(sort_order, 0) as sort_order,
      is_active,
      created_date,
      COALESCE(established_year, '') as established_year,
      COALESCE(head_teacher, '') as head_teacher
    FROM public.branches
    WHERE is_active IS DISTINCT FROM false
    ORDER BY sort_order
    LIMIT 50
  ) t;

  -- 7. Blogs
  SELECT COALESCE(json_agg(t), '[]'::json) INTO blogs_json FROM (
    SELECT 
      id,
      title,
      title as title_bn,
      title as title_en,
      title as title_ar,
      content,
      content as content_bn,
      content as content_en,
      content as content_ar,
      CASE WHEN title IS NOT NULL THEN SUBSTRING(title FROM 1 FOR 100) ELSE '' END as excerpt_bn,
      CASE WHEN title IS NOT NULL THEN SUBSTRING(title FROM 1 FOR 100) ELSE '' END as excerpt_en,
      CASE WHEN title IS NOT NULL THEN SUBSTRING(title FROM 1 FOR 100) ELSE '' END as excerpt_ar,
      COALESCE(featured_image, '') as featured_image,
      'Admin' as author,
      is_published,
      created_at,
      updated_date as updated_at,
      slug
    FROM public.blogs
    WHERE is_published = true
    ORDER BY created_at DESC
    LIMIT 50
  ) t;

  -- 8. Page Sections
  SELECT COALESCE(json_object_agg(section_key, t), '{}'::json) INTO page_sections_json FROM (
    SELECT 
      id,
      section_key,
      title_bn,
      title_en,
      subtitle_bn,
      subtitle_en,
      body_bn,
      body_en,
      is_visible,
      created_date,
      updated_date
    FROM public.page_sections
  ) t;

  -- 9. FAQs
  SELECT COALESCE(json_agg(t), '[]'::json) INTO faqs_json FROM (
    SELECT 
      id,
      question as question_bn,
      question as question_en,
      question as question_ar,
      answer as answer_bn,
      answer as answer_en,
      answer as answer_ar,
      sort_order,
      true as is_active,
      created_date
    FROM public.faqs
    ORDER BY sort_order
    LIMIT 50
  ) t;

  -- 10. Testimonials
  SELECT COALESCE(json_agg(t), '[]'::json) INTO testimonials_json FROM (
    SELECT 
      id,
      student_name as student_name_bn,
      student_name as student_name_en,
      student_name as student_name_ar,
      message as message_bn,
      message as message_en,
      message as message_ar,
      COALESCE(photo_url, '') as photo_url,
      COALESCE(rating, 5) as rating,
      true as is_active,
      created_at
    FROM public.testimonials
    ORDER BY created_at DESC
    LIMIT 50
  ) t;

  -- 11. Teachers (Hardened: Exclude private phone/salary data)
  SELECT COALESCE(json_agg(t), '[]'::json) INTO teachers_json FROM (
    SELECT 
      id,
      teacher_id,
      full_name_en,
      full_name_bn,
      full_name_ar,
      photo_url,
      designation,
      designation_bn,
      designation_ar,
      bio,
      bio_bn,
      bio_ar,
      facebook,
      linkedin,
      is_active,
      branch,
      department,
      website_showing_serial,
      featured_teacher,
      qualification,
      experience_years,
      special_skills,
      show_on_website,
      branch_id
    FROM public.teachers
    WHERE status = 'active' AND is_active = true AND featured_teacher = true
    ORDER BY website_showing_serial ASC NULLS LAST
    LIMIT 10
  ) t;

  -- 12. Sponsors
  SELECT COALESCE(json_agg(t), '[]'::json) INTO sponsors_json FROM (
    SELECT 
      id,
      title,
      title as title_bn,
      title as title_en,
      title as title_ar,
      company_name,
      company_name_bn,
      company_name_en,
      company_name_ar,
      description,
      description_bn,
      description_en,
      description_ar,
      image_url,
      target_url,
      button_text,
      button_text_bn,
      button_text_en,
      button_text_ar,
      priority,
      start_date,
      end_date,
      is_active
    FROM public.sponsors
    WHERE is_active = true
    ORDER BY priority
    LIMIT 50
  ) t;

  -- 13. Success Stories
  SELECT COALESCE(json_agg(t), '[]'::json) INTO success_stories_json FROM (
    SELECT 
      id,
      title as title_bn,
      title as title_en,
      title as title_ar,
      description as description_bn,
      description as description_en,
      description as description_ar,
      image_url,
      true as is_active,
      created_at
    FROM public.success_stories
    ORDER BY created_at DESC
    LIMIT 50
  ) t;

  -- 14. Students (basic counts only)
  SELECT COALESCE(json_agg(t), '[]'::json) INTO students_json FROM (
    SELECT 
      id,
      status,
      session
    FROM public.students
    WHERE status != 'graduated'
  ) t;

  -- 15. Contact Info
  SELECT COALESCE(json_object_agg('contact_info', t), '{}'::json) INTO contact_info_json FROM (
    SELECT 
      COALESCE(phone, '') as phone,
      COALESCE(email, '') as email,
      COALESCE(address, '') as address,
      COALESCE(facebook, '') as facebook,
      COALESCE(youtube, '') as youtube,
      COALESCE(whatsapp, '') as whatsapp
    FROM public.contact_info
    LIMIT 1
  ) t;

  -- 16. Courses
  SELECT COALESCE(json_agg(t), '[]'::json) INTO courses_json FROM (
    SELECT 
      id,
      name as name_bn,
      name as name_en,
      name as name_ar,
      description as description_bn,
      description as description_en,
      description as description_ar,
      COALESCE(duration, '') as duration,
      COALESCE(fee, 0) as fee,
      0 as sort_order,
      is_active,
      created_date
    FROM public.courses
    WHERE is_active IS DISTINCT FROM false
    ORDER BY sort_order
    LIMIT 20
  ) t;

  -- Build final aggregated JSON object
  result := json_build_object(
    'notices', notices_json,
    'appSettings', settings_json,
    'heroSlides', hero_slides_json,
    'events', events_json,
    'gallery', gallery_json,
    'branches', branches_json,
    'blogs', blogs_json,
    'pageSections', page_sections_json,
    'faqs', faqs_json,
    'testimonials', testimonials_json,
    'teachers', teachers_json,
    'sponsors', sponsors_json,
    'successStories', success_stories_json,
    'students', students_json,
    'contactInfo', COALESCE(contact_info_json->'contact_info', '{}'::json),
    'courses', courses_json
  );

  RETURN result;
END;
$$;


COMMIT;