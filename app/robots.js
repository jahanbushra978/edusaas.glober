import { headers } from 'next/headers';

/** @type {import('next').MetadataRoute.Robots} */
export default async function robots() {
  let base = 'https://edusaas.global';
  try {
    const reqHeaders = await headers();
    const host = (reqHeaders.get('host') || '').split(':')[0].toLowerCase().trim();
    if (host === 'rahmaniainstitute.org' || host === 'www.rahmaniainstitute.org') {
      base = 'https://rahmaniainstitute.org';
    } else if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      base = `https://${host}`;
    }
  } catch {}

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/facilities',
          '/faq',
          '/notices',
          '/notices/*',
          '/admission',
          '/quran-tutor',
          '/quran-tutor/live-class',
          '/api/public/',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/platform-console',
          '/platform-console/*',
          '/AdminDashboard',
          '/AdminStudentDetail',
          '/TeacherDashboard',
          '/StudentProfile',
          '/api/admin',
          '/api/admin/*',
          '/api/platform',
          '/api/platform/*',
          '/api/attendance/*',
          '/api/teacher-marketplace/social/posts/*',
        ],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Applebot', 'Google-Extended', 'Amazonbot'],
        allow: [
          '/',
          '/about',
          '/facilities',
          '/faq',
          '/notices',
          '/llms.txt',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/platform-console',
          '/platform-console/*',
          '/api/*',
          '/TeacherDashboard',
          '/StudentProfile',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
