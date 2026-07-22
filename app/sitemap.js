import { createClient } from '@supabase/supabase-js';

/** @type {import('next').MetadataRoute.Sitemap} */
export default async function sitemap() {
  const base = 'https://rahmaniainstitute.org';
  const now = new Date();

  // Static core routes
  const staticSegments = [
    '',
    'about',
    'mission',
    'campus',
    'academics',
    'admission',
    'admission-choice',
    'admission-form',
    'gallery',
    'video-gallery',
    'teachers',
    'results',
    'facilities',
    'notices',
    'faq',
    'departments/noorani',
    'departments/najera',
    'departments/hifz',
    'departments/hifz-shunani',
    'departments/kindergarten',
    'departments/madani-nessab',
    'departments/english-version',
  ];

  const staticEntries = staticSegments.map((segment) => ({
    url: segment === '' ? `${base}/` : `${base}/${segment}`,
    lastModified: now,
    changeFrequency: segment === '' ? 'daily' : 'weekly',
    priority: segment === '' ? 1.0 : 0.8,
  }));

  const dynamicEntries = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });

      // 1. Fetch active published notices
      const { data: notices } = await supabase
        .from('notices')
        .select('id, updated_date, created_date, is_active, is_published')
        .not('is_active', 'eq', false)
        .order('created_date', { ascending: false })
        .limit(500);

      if (notices?.length) {
        dynamicEntries.push(
          ...notices.map((n) => ({
            url: `${base}/notice/${n.id}`,
            lastModified: new Date(n.updated_date || n.created_date || now),
            changeFrequency: 'weekly',
            priority: 0.7,
          }))
        );
      }

      // 2. Fetch active branches
      const { data: branches } = await supabase
        .from('branches')
        .select('id, slug, updated_date, created_date, is_active')
        .not('is_active', 'eq', false)
        .order('sort_order');

      if (branches?.length) {
        dynamicEntries.push(
          ...branches.map((b) => ({
            url: `${base}/branch/${b.slug || b.id}`,
            lastModified: new Date(b.updated_date || b.created_date || now),
            changeFrequency: 'weekly',
            priority: 0.8,
          }))
        );
      }
    }
  } catch (err) {
    console.warn('[Sitemap] Dynamic generation warning:', err?.message);
  }

  return [...staticEntries, ...dynamicEntries];
}
