-- ============================================================================
-- SCRIPT: supabase/scripts/diagnostic_schema_audit.sql
-- DESCRIPTION: Read-Only Comprehensive Diagnostic Audit for Human Teacher Schema
-- USAGE: Paste and execute in Supabase SQL Editor to determine database state.
-- ============================================================================

-- 1. Table Existence, Row Count, and RLS Status for All 6 Core Tables
SELECT 
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'teacher_marketplace_profiles',
    'teacher_wallets',
    'teacher_wallet_transactions',
    'teacher_live_rooms',
    'live_room_participants',
    'teacher_reviews'
  )
ORDER BY c.relname;

-- 2. Inspect Columns and Data Types Across All 6 Tables
SELECT 
  table_name, 
  column_name, 
  data_type, 
  column_default, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'teacher_marketplace_profiles',
    'teacher_wallets',
    'teacher_wallet_transactions',
    'teacher_live_rooms',
    'live_room_participants',
    'teacher_reviews'
  )
ORDER BY table_name, ordinal_position;

-- 3. Inspect Constraints & Foreign Keys
SELECT 
  conrelid::regclass AS table_name,
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
  AND conrelid::regclass::text IN (
    'teacher_marketplace_profiles',
    'teacher_wallets',
    'teacher_wallet_transactions',
    'teacher_live_rooms',
    'live_room_participants',
    'teacher_reviews'
  )
ORDER BY table_name, conname;

-- 4. Inspect Indexes (Verifying Permanent Gateway Constraint)
SELECT 
  tablename, 
  indexname, 
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'teacher_marketplace_profiles',
    'teacher_wallets',
    'teacher_wallet_transactions',
    'teacher_live_rooms',
    'live_room_participants',
    'teacher_reviews'
  )
ORDER BY tablename, indexname;

-- 5. Inspect RLS Policies
SELECT 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'teacher_marketplace_profiles',
    'teacher_wallets',
    'teacher_wallet_transactions',
    'teacher_live_rooms',
    'live_room_participants',
    'teacher_reviews'
  )
ORDER BY tablename, policyname;

-- 6. Inspect Functions and Security Privileges
SELECT 
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'INVOKER' END AS security_type,
  r.rolname AS grantee,
  has_function_privilege(r.rolname, p.oid, 'EXECUTE') AS has_execute
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
CROSS JOIN (VALUES ('anon'), ('authenticated'), ('service_role')) AS r(rolname)
WHERE n.nspname = 'public'
  AND p.proname IN (
    'process_teacher_hadia_payment',
    'settle_verified_teacher_hadia_payment',
    'prevent_live_room_participant_escalation',
    'preview_teacher_wallet_reconciliation'
  )
ORDER BY p.proname, r.rolname;

-- 7. Inspect Triggers on Sensitive Tables
SELECT 
  event_object_table AS table_name,
  trigger_name,
  event_manipulation AS event,
  action_timing AS timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('live_room_participants', 'teacher_wallets');

-- 8. Applied Migration History
SELECT * 
FROM supabase_migrations.schema_migrations 
ORDER BY version DESC 
LIMIT 10;

