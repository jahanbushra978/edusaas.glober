import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

/** @type {import('next').MetadataRoute.Sitemap} */
export default async function sitemap() {
  let base = 'https://edusaas.global';
  let isRahmania = false;

  try {
    const reqHeaders = await headers();
    const host = (reqHeaders.get('host') || '').split(':')[0].toLowerCase().trim();
    if (host === 'rahmaniainstitute.org' || host === 'www.rahmaniainstitute.org') {
      base = 'https://rahmaniainstitute.org';
      isRahmania = true;
    } else if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      base = `https://${host}`;
    }
  } catch {}

  const now = new Date();

  // If visiting under the legitimate Rahmania Institute tenant domain:
  if (isRahmania) {
    const rahmaniaStaticRoutes = [
      { segment: '', priority: 1.0, changeFrequency: 'daily' },
      { segment: 'admission', priority: 0.9, changeFrequency: 'weekly' },
      { segment: 'admission-choice', priority: 0.9, changeFrequency: 'weekly' },
      { segment: 'admission-form', priority: 0.9, changeFrequency: 'weekly' },
      { segment: 'noorani-page', priority: 0.9, changeFrequency: 'weekly' },
      { segment: 'departments/noorani', priority: 0.9, changeFrequency: 'weekly' },
      { segment: 'departments/najera', priority: 0.9, changeFrequency: 'weekly' },
      { segment: 'departments/hifz', priority: 0.9, changeFrequency: 'weekly' },
      { segment: 'departments/hifz-shunani', priority: 0.9, changeFrequency: 'weekly' },
      { segment: 'departments/kindergarten', priority: 0.9, changeFrequency: 'weekly' },
      { segment: 'departments/madani-nessab', priority: 0.9, changeFrequency: 'weekly' },
      { segment: 'departments/english-version', priority: 0.9, changeFrequency: 'weekly' },
      { segment: 'teachers', priority: 0.8, changeFrequency: 'monthly' },
      { segment: 'about', priority: 0.8, changeFrequency: 'monthly' },
      { segment: 'mission', priority: 0.8, changeFrequency: 'monthly' },
      { segment: 'campus', priority: 0.8, changeFrequency: 'monthly' },
      { segment: 'academics', priority: 0.8, changeFrequency: 'monthly' },
      { segment: 'gallery', priority: 0.7, changeFrequency: 'weekly' },
      { segment: 'video-gallery', priority: 0.7, changeFrequency: 'weekly' },
      { segment: 'branch-gallery', priority: 0.7, changeFrequency: 'weekly' },
      { segment: 'notices', priority: 0.7, changeFrequency: 'weekly' },
      { segment: 'results', priority: 0.7, changeFrequency: 'weekly' },
      { segment: 'faq', priority: 0.6, changeFrequency: 'monthly' },
      { segment: 'facilities', priority: 0.6, changeFrequency: 'monthly' },
    ];

    const staticEntries = rahmaniaStaticRoutes.map(({ segment, priority, changeFrequency }) => ({
      url: segment === '' ? `${base}/` : `${base}/${segment}`,
      lastModified: now,
      changeFrequency,
      priority,
    }));

    const dynamicEntries = [];
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false },
        });

        // 1. Fetch active published notices for Rahmania
        const { data: notices } = await supabase
          .from('notices')
          .select('id, updated_date, created_date, is_active, is_published')
          .not('is_active', 'eq', false)
          .order('created_date', { ascending: false })
          .limit(200);

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

        // 2. Fetch active published blogs if table exists
        try {
          const { data: blogs } = await supabase
            .from('blogs')
            .select('id, slug, updated_date, created_date, is_published')
            .eq('is_published', true)
            .limit(100);

          if (blogs?.length) {
            dynamicEntries.push(
              ...blogs.map((b) => ({
                url: `${base}/blog/${b.slug || b.id}`,
                lastModified: new Date(b.updated_date || b.created_date || now),
                changeFrequency: 'weekly',
                priority: 0.7,
              }))
            );
          }
        } catch {}
      }
    } catch (err) {
      console.warn('[Sitemap Generator] Dynamic query warning:', err?.message);
    }

    return [...staticEntries, ...dynamicEntries];
  }

  // Authoritative Edusaas Global Platform Sitemap:
  // Strictly public, indexable content pages (no redirects, no logins, no internal console routes)
  const edusaasStaticRoutes = [
    { segment: '', priority: 1.0, changeFrequency: 'daily' },
    { segment: 'about', priority: 0.8, changeFrequency: 'monthly' },
    { segment: 'facilities', priority: 0.8, changeFrequency: 'monthly' },
    { segment: 'faq', priority: 0.8, changeFrequency: 'monthly' },
    { segment: 'quran-tutor', priority: 0.9, changeFrequency: 'daily' },
    { segment: 'quran-tutor/live-class', priority: 0.9, changeFrequency: 'weekly' },
    { segment: 'quran-tutor/studio', priority: 0.8, changeFrequency: 'weekly' },
    { segment: 'quran-tutor/learning', priority: 0.9, changeFrequency: 'weekly' },
    { segment: 'quran-tutor/teacher', priority: 0.9, changeFrequency: 'weekly' },
    { segment: 'quran-tutor/qaida', priority: 0.8, changeFrequency: 'weekly' },
    { segment: 'quran-tutor/kids', priority: 0.8, changeFrequency: 'weekly' },
    { segment: 'quran-tutor/games', priority: 0.8, changeFrequency: 'weekly' },
    { segment: 'quran-tutor/sifat', priority: 0.8, changeFrequency: 'weekly' },
    { segment: 'quran-tutor/tahfiz', priority: 0.8, changeFrequency: 'weekly' },
    { segment: 'ai-quran-learning', priority: 0.8, changeFrequency: 'weekly' },
  ];

  const staticEntries = edusaasStaticRoutes.map(({ segment, priority, changeFrequency }) => ({
    url: segment === '' ? `${base}/` : `${base}/${segment}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  return staticEntries;
}
