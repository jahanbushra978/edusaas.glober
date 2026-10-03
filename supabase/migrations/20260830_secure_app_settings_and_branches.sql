-- ==============================================================================
-- Security Migration: Restrict public access to sensitive settings and passwords
-- Date: 2026-08-30
-- Description:
--   1. Ensures RLS is enabled on public.app_settings and public.branches
--   2. Prevents public/anon from viewing admin_login_password, jwt_secret, or any password/secret keys
--   3. Secures branches table from unauthorized mutations
-- ==============================================================================

-- 1. Secure app_settings table
ALTER TABLE IF EXISTS public.app_settings ENABLE ROW LEVEL SECURITY;

-- Drop legacy open policies if present
DROP POLICY IF EXISTS "Enable full access for all users" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_select_policy" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_public_read" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_admin_all" ON public.app_settings;

-- Public/Anon can read ONLY non-sensitive settings (excluding passwords, secrets, private keys)
CREATE POLICY "app_settings_public_read" ON public.app_settings
FOR SELECT
TO public
USING (
  key NOT IN ('admin_login_password', 'admin_password', 'jwt_secret', 'encryption_key', 'service_role_key', 'smtp_password', 'resend_api_key')
  AND key NOT ILIKE '%password%'
  AND key NOT ILIKE '%secret%'
  AND key NOT ILIKE '%private_key%'
);

-- Authenticated Admin/Superadmin full access to app_settings
CREATE POLICY "app_settings_admin_all" ON public.app_settings
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'role') IN ('admin', 'superadmin', 'super_admin')
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'super_admin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin', 'super_admin')
)
WITH CHECK (
  (auth.jwt() ->> 'role') IN ('admin', 'superadmin', 'super_admin')
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'super_admin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin', 'super_admin')
);

-- 2. Ensure branches RLS is enabled
ALTER TABLE IF EXISTS public.branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "branches_public_read" ON public.branches;
DROP POLICY IF EXISTS "branches_admin_all" ON public.branches;

-- Public can view active branches
CREATE POLICY "branches_public_read" ON public.branches
FOR SELECT
TO public
USING (is_active IS NOT FALSE);

-- Admin can manage branches
CREATE POLICY "branches_admin_all" ON public.branches
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'role') IN ('admin', 'superadmin', 'super_admin')
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'super_admin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin', 'super_admin')
)
WITH CHECK (
  (auth.jwt() ->> 'role') IN ('admin', 'superadmin', 'super_admin')
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'super_admin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin', 'super_admin')
);
