-- SQL Migration: Enable Public Read Access (SELECT) for Public Site Tables in Supabase
-- Run this in Supabase SQL Editor to allow unauthenticated visitors (anon role) to view public pages

DO $$ 
DECLARE
  tbl text;
  public_tables text[] := ARRAY[
    'teachers',
    'notices',
    'events',
    'branches',
    'courses',
    'facilities',
    'faqs',
    'gallery',
    'gallery_categories',
    'gallery_items',
    'hero_slides',
    'navbar_items',
    'page_sections',
    'sponsors',
    'success_stories',
    'testimonials',
    'videos',
    'video_categories',
    'app_settings',
    'blogs',
    'contact_info'
  ];
BEGIN
  FOREACH tbl IN ARRAY public_tables LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Allow_Public_Select_%I" ON %I;', tbl, tbl);
      EXECUTE format('CREATE POLICY "Allow_Public_Select_%I" ON %I FOR SELECT TO anon, authenticated USING (true);', tbl, tbl);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not apply policy to table %: %', tbl, SQLERRM;
    END BEGIN;
  END LOOP;
END $$;
