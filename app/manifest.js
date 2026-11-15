import { headers } from 'next/headers';

/** @type {() => Promise<import('next').MetadataRoute.Manifest>} */
export default async function manifest() {
  let isRahmania = false;
  try {
    const reqHeaders = await headers();
    const host = (reqHeaders.get('host') || '').split(':')[0].toLowerCase().trim();
    if (host === 'rahmaniainstitute.org' || host === 'www.rahmaniainstitute.org') {
      isRahmania = true;
    }
  } catch {}

  if (isRahmania) {
    return {
      name: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
      short_name: 'Rahmania',
      description: 'দ্বীনি ও আধুনিক শিক্ষার সমন্বয়ে গাজীপুরের একটি আদর্শ শিক্ষাপ্রতিষ্ঠান',
      start_url: '/',
      display: 'standalone',
      background_color: '#071912',
      theme_color: '#12715B',
      orientation: 'portrait-primary',
      icons: [
        {
          src: '/rahmania-logo-navbar.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/rahmania-logo-v2.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    };
  }

  return {
    name: 'Edusaas — Smart Education SaaS & ERP Platform',
    short_name: 'Edusaas',
    description: 'School, Madrasa, Institute & College Management Cloud Operating System',
    start_url: '/',
    display: 'standalone',
    background_color: '#020e0c',
    theme_color: '#06382c',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
