import { createClient } from '@supabase/supabase-js';

/** @type {import('next').MetadataRoute.Sitemap} */
export default async function sitemap() {
  const base = 'https://rahmaniainstitute.org';
  const now = new Date();

  // Static core routes with granular priority and changeFrequency
  const staticRoutes = [
    // Homepage — highest priority, daily crawl
    { segment: '',                           priority: 1.0, changeFrequency: 'daily'   },

    // Admission & departments — high priority, weekly (content changes often)
    { segment: 'admission',                  priority: 0.9, changeFrequency: 'weekly'  },
    { segment: 'admission-choice',           priority: 0.9, changeFrequency: 'weekly'  },
    { segment: 'admission-form',             priority: 0.9, changeFrequency: 'weekly'  },
    { segment: 'noorani-page',               priority: 0.9, changeFrequency: 'weekly'  },
    { segment: 'departments/noorani',        priority: 0.9, changeFrequency: 'weekly'  },
    { segment: 'departments/najera',         priority: 0.9, changeFrequency: 'weekly'  },
    { segment: 'departments/hifz',           priority: 0.9, changeFrequency: 'weekly'  },
    { segment: 'departments/hifz-shunani',   priority: 0.9, changeFrequency: 'weekly'  },
    { segment: 'departments/kindergarten',   priority: 0.9, changeFrequency: 'weekly'  },
    { segment: 'departments/madani-nessab',  priority: 0.9, changeFrequency: 'weekly'  },
    { segment: 'departments/english-version',priority: 0.9, changeFrequency: 'weekly'  },

    // Teachers / About / Mission — informational, monthly updates
    { segment: 'teachers',                   priority: 0.8, changeFrequency: 'monthly' },
    { segment: 'about',                      priority: 0.8, changeFrequency: 'monthly' },
    { segment: 'mission',                    priority: 0.8, changeFrequency: 'monthly' },
    { segment: 'campus',                     priority: 0.8, changeFrequency: 'monthly' },
    { segment: 'academics',                  priority: 0.8, changeFrequency: 'monthly' },

    // Gallery / Notices / Results — updated regularly
    { segment: 'gallery',                    priority: 0.7, changeFrequency: 'weekly'  },
    { segment: 'video-gallery',              priority: 0.7, changeFrequency: 'weekly'  },
    { segment: 'branch-gallery',             priority: 0.7, changeFrequency: 'weekly'  },
    { segment: 'notices',                    priority: 0.7, changeFrequency: 'weekly'  },
    { segment: 'results',                    priority: 0.7, changeFrequency: 'weekly'  },

    // FAQ / Facilities — low churn, monthly
    { segment: 'faq',                        priority: 0.6, changeFrequency: 'monthly' },
    { segment: 'facilities',                 priority: 0.6, changeFrequency: 'monthly' },
  ];

  const staticEntries = staticRoutes.map(({ segment, priority, changeFrequency }) => ({
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

      // 3. Fetch published blogs
      const { data: blogs } = await supabase
        .from('blogs')
        .select('id, slug, updated_at, created_at, is_published')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(500);

      if (blogs?.length) {
        dynamicEntries.push(
          ...blogs.map((blog) => ({
            url: `${base}/blog/${blog.slug || blog.id}`,
            lastModified: new Date(blog.updated_at || blog.created_at || now),
            changeFrequency: 'weekly',
            priority: 0.7,
          }))
        );
      }
    }
  } catch (err) {
    console.warn('[Sitemap] Dynamic generation warning:', err?.message);
  }

  return [...staticEntries, ...dynamicEntries];
}
