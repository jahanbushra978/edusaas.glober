import './globals.css'
import Script from 'next/script'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTenantContext } from '@/lib/tenant/tenantContext'

import Providers from './providers'
import { inter, hindSiliguri, notoSansBengali, notoSansArabic, amiri, playfairDisplay, balooDa2 } from './fonts'

export const revalidate = 3600;

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#06382c',
};

export async function generateMetadata() {
  const tenant = await getTenantContext();

  // Strict Domain Resolution: Unknown domains receive strict 404
  if (tenant?.notFound || tenant?.isUnknownDomain) {
    return {
      title: '404 — Not Found',
      robots: { index: false, follow: false },
    };
  }

  const isRahmania = tenant?.org?.domain === 'rahmaniainstitute.org';

  if (isRahmania) {
    return {
      metadataBase: new URL('https://rahmaniainstitute.org'),
      title: {
        default: 'রহমানিয়া ইনস্টিটিউট | Rahmania Institute — দ্বীনি ও আধুনিক শিক্ষা প্রতিষ্ঠান',
        template: '%s | Rahmania Institute',
      },
      description: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট) — দ্বীনি ও জাগতিক শিক্ষার সমন্বয়ে গাজীপুরের একটি আধুনিক শিক্ষা প্রতিষ্ঠান। নূরানী, নাজেরা, হিফয, কিতাবখানা, কিন্ডারগার্টেন ও ইংলিশ ভার্সন বিভাগে পাঠদান। ভর্তি চলছে!',
      keywords: ['রহমানিয়া ইনস্টিটিউট', 'Rahmania Institute', 'হিফজ মাদ্রাসা', 'নূরানী', 'নাজেরা', 'হিফয', 'কিতাবখানা', 'কিন্ডারগার্টেন', 'ইংলিশ ভার্সন', 'গাজীপুর', 'Islamic school Gazipur'],
      openGraph: {
        title: 'রহমানিয়া ইনস্টিটিউট | Rahmania Institute',
        description: 'দ্বীনি ও জাগতিক শিক্ষার সমন্বয়ে গড়ে ওঠা আধুনিক শিক্ষা প্রতিষ্ঠান।',
        url: 'https://rahmaniainstitute.org',
        siteName: 'Rahmania Institute',
        type: 'website',
        locale: 'bn_BD',
        images: [
          {
            url: '/rahmania-logo-v2.png',
            width: 512,
            height: 512,
            alt: 'Rahmania Institute Logo',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'রহমানিয়া ইনস্টিটিউট | Rahmania Institute',
        description: 'দ্বীনি ও জাগতিক শিক্ষার সমন্বয়ে গড়ে ওঠা আধুনিক শিক্ষা প্রতিষ্ঠান।',
        images: ['/rahmania-logo-v2.png'],
      },
      icons: {
        icon: '/rahmania-logo-navbar.png',
        shortcut: '/rahmania-logo-navbar.png',
        apple: '/rahmania-logo-v2.png',
      },
      manifest: '/manifest.webmanifest',
      category: 'education',
      classification: 'School & Madrasa Education',
      creator: 'Rahmania Institute',
      publisher: 'Rahmania Institute',
    };
  }

  // Authoritative Edusaas Global Platform Metadata:
  return {
    metadataBase: new URL('https://edusaas.global'),
    title: {
      default: 'Edusaas — School, Madrasa & College Management Software | Education ERP',
      template: '%s | Edusaas',
    },
    description:
      'Edusaas is an all-in-one Education SaaS and ERP platform for schools, madrasas, colleges, and training institutes. Features real-time biometric attendance, automated grading & result processing, online admission, paperless fee accounting, and dynamic website builder.',
    keywords: [
      'School Management Software',
      'School ERP Software',
      'Education Management System',
      'Madrasa Management Software',
      'College Management Software',
      'Institute Management Software',
      'Student Management System',
      'Online Admission Management',
      'Student Attendance Management',
      'School Fee Management',
      'Examination Management System',
      'Multi-Branch School Management',
      'Education ERP Bangladesh',
      'Edusaas',
      'EduSaaS Global',
    ],
    openGraph: {
      title: 'Edusaas — School, Madrasa & College Management Software | Education ERP',
      description: 'Enterprise all-in-one cloud platform for schools, madrasas & colleges: biometric attendance, auto grading, paperless fees & custom websites.',
      type: 'website',
      locale: 'bn_BD',
      url: 'https://edusaas.global',
      siteName: 'Edusaas',
      images: [
        {
          url: '/edusaas-hero-bg-v2.jpg',
          width: 1200,
          height: 630,
          alt: 'Edusaas — Education Management SaaS & ERP Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Edusaas — Education Management SaaS & ERP Platform',
      description: 'All-in-one cloud platform for schools, madrasas & colleges: biometric attendance, auto grading, paperless fees & custom websites.',
      images: ['/edusaas-hero-bg-v2.jpg'],
      creator: '@EduSaaSGlobal',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.webmanifest',
    category: 'technology',
    classification: 'Education SaaS & School ERP Software',
    creator: 'Edusaas',
    publisher: 'Edusaas',
  };
}

export default async function RootLayout({ children }) {
  // Enforce Strict Tenant Resolution: Unknown domain -> strict 404
  const tenant = await getTenantContext();
  if (tenant?.notFound || tenant?.isUnknownDomain) {
    notFound();
  }

  // Read ri_lang cookie server-side so SSR and client first render
  // always use the same language — prevents React hydration error #418.
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('ri_lang')?.value;
  const initialLang = (langCookie === 'bn' || langCookie === 'en' || langCookie === 'ar') ? langCookie : 'bn';

  const isRahmaniaDomain = tenant?.org?.domain === 'rahmaniainstitute.org';

  return (
    <html lang={initialLang} suppressHydrationWarning data-scroll-behavior="smooth" className={`light ${inter.variable} ${hindSiliguri.variable} ${notoSansBengali.variable} ${notoSansArabic.variable} ${amiri.variable} ${playfairDisplay.variable} ${balooDa2.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Scheherazade+New:wght@400;700&family=Hind+Siliguri:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body suppressHydrationWarning className="light">
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <Providers initialLang={initialLang}>{children}</Providers>
        {isRahmaniaDomain ? (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  "@id": "https://rahmaniainstitute.org/#website",
                  "name": "Rahmania Institute",
                  "url": "https://rahmaniainstitute.org",
                }),
              }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "EducationalOrganization",
                  "@id": "https://rahmaniainstitute.org/#organization",
                  "name": "Rahmania Institute (রহমানিয়া ইনস্টিটিউট)",
                  "alternateName": ["রহমানিয়া ইনস্টিটিউট", "Rahmania Institute Gazipur"],
                  "url": "https://rahmaniainstitute.org",
                  "logo": "https://rahmaniainstitute.org/rahmania-logo-v2.png",
                  "image": "https://rahmaniainstitute.org/rahmania-logo-v2.png",
                  "description": "দ্বীনি ও জাগতিক শিক্ষার সমন্বয়ে গড়ে ওঠা গাজীপুরের একটি আধুনিক শিক্ষা প্রতিষ্ঠান। নূরানী, নাজেরা, হিফয, কিতাবখানা, কিন্ডারগার্টেন ও ইংলিশ ভার্সন বিভাগ।",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "গাজীপুর, ঢাকা",
                    "addressLocality": "Gazipur",
                    "addressRegion": "Dhaka",
                    "countryName": "Bangladesh",
                  },
                  "telephone": "+8801906898939",
                  "email": "rahmaniainstitute.org@gmail.com",
                  "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "শিক্ষা কার্যক্রম ও বিভাগসমূহ",
                    "itemListElement": [
                      { "@type": "Offer", "itemOffered": { "@type": "Course", "name": "নূরানী বিভাগ" } },
                      { "@type": "Offer", "itemOffered": { "@type": "Course", "name": "নাজেরা বিভাগ" } },
                      { "@type": "Offer", "itemOffered": { "@type": "Course", "name": "হিফযুল কুরআন" } },
                      { "@type": "Offer", "itemOffered": { "@type": "Course", "name": "কিতাবখানা (কিতাব বিভাগ)" } },
                      { "@type": "Offer", "itemOffered": { "@type": "Course", "name": "কিন্ডারগার্টেন" } },
                      { "@type": "Offer", "itemOffered": { "@type": "Course", "name": "ইংলিশ ভার্সন" } },
                    ],
                  },
                }),
              }}
            />
          </>
        ) : (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  "@id": "https://edusaas.global/#website",
                  "name": "Edusaas",
                  "alternateName": ["EduSaaS Global", "Edusaas Platform"],
                  "url": "https://edusaas.global",
                  "description": "Smart Education SaaS & School/Madrasa ERP Platform",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://edusaas.global/notices?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                }),
              }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "@id": "https://edusaas.global/#software",
                  "name": "Edusaas",
                  "operatingSystem": "All, Cloud Web Application",
                  "applicationCategory": "EducationalApplication, BusinessApplication",
                  "description": "Enterprise all-in-one Education SaaS & School/Madrasa ERP platform: real-time biometric attendance, automated result processing, paperless fee accounting, and dynamic website builder.",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "BDT",
                    "category": "Free Trial Available",
                  },
                  "author": {
                    "@type": "Organization",
                    "@id": "https://edusaas.global/#organization",
                    "name": "Edusaas",
                    "url": "https://edusaas.global",
                    "logo": "https://edusaas.global/favicon.png",
                    "email": "contact@edusaas.global",
                    "telephone": "+8801576600265",
                    "address": {
                      "@type": "PostalAddress",
                      "addressLocality": "Dhaka",
                      "addressCountry": "Bangladesh",
                    },
                  },
                }),
              }}
            />
          </>
        )}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
              if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (var i = 0; i < registrations.length; i++) {
                    registrations[i].unregister();
                  }
                });
              } else {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.warn('SW registration:', err);
                  });
                });
              }
            }
          `}
        </Script>
        <Analytics />
        <SpeedInsights />

      </body>
    </html>
  )
}
