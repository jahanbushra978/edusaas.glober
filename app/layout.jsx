import './globals.css'
import Script from 'next/script'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { cookies } from 'next/headers'

import Providers from './providers'
import { inter, hindSiliguri, notoSansArabic, amiri } from './fonts'

export const revalidate = 3600;

export const metadata = {
  metadataBase: new URL('https://rahmaniainstitute.org'),
  title: {
    default: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট) — আধুনিক ও দ্বীনি শিক্ষার অনন্য সমন্বয়',
    template: '%s | Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
  },
  description:
    'Rahmania Institute (রহমানিয়া ইনস্টিটিউট) — দ্বীনি ও জাগতিক শিক্ষার সমন্বয়ে একটি আধুনিক শিক্ষা প্রতিষ্ঠান। এখানে নূরানী, নাজেরা, হিফয ও জেনারেল শিক্ষা বিভাগে অভিজ্ঞ শিক্ষকমণ্ডলী দ্বারা পাঠদান করা হয়।',
  keywords: [
    'Rahmania Institute', 'রহমানিয়া ইনস্টিটিউট', 'Jamiya Rahmania Gazipur',
    'মাদরাসা', 'গাজীপুর মাদরাসা', 'Gazipur Madrasa', 'Islamic School Bangladesh',
    'নূরানী বিভাগ', 'হিফয বিভাগ', 'নাজেরা বিভাগ', 'কিতাবখানা', 'জেনারেল শিক্ষা',
    'অনলাইন ভর্তি', 'দ্বীনি শিক্ষা', 'আদর্শ নৈতিক চরিত্র গঠন'
  ],
  openGraph: {
    title: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট) — আধুনিক ও দ্বীনি শিক্ষার অনন্য সমন্বয়',
    description: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট) — দ্বীনি ও জাগতিক শিক্ষার সমন্বয়ে একটি আধুনিক শিক্ষা প্রতিষ্ঠান।',
    type: 'website',
    locale: 'bn_BD',
    url: 'https://rahmaniainstitute.org',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
    images: [
      {
        url: '/rahmania-logo-v2.png',
        width: 800,
        height: 800,
        alt: 'রহমানিয়া ইনস্টিটিউট লোগো',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট) — আধুনিক ও দ্বীনি শিক্ষার অনন্য সমন্বয়',
    description: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট) — দ্বীনি ও জাগতিক শিক্ষার সমন্বয়ে একটি আধুনিক শিক্ষা প্রতিষ্ঠান।',
    images: ['/rahmania-logo-v2.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'verify-later',
  },
  category: 'education',
  classification: 'Educational Institution',
  creator: 'Rahmania Institute',
  publisher: 'Rahmania Institute',
  manifest: '/manifest.json',
  icons: {
    icon: '/rahmania-logo-v2.png',
    shortcut: '/rahmania-logo-v2.png',
    apple: '/rahmania-logo-v2.png',
  },
  other: {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    'og:locale:alternate': ['en_US', 'ar_SA'],
    'theme-color': '#006400',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=yes',
  },
}

export default async function RootLayout({ children }) {
  // Read ri_lang cookie server-side so SSR and client first render
  // always use the same language — prevents React hydration error #418.
  const cookieStore = await cookies()
  const langCookie = cookieStore.get('ri_lang')?.value
  const initialLang = (langCookie === 'bn' || langCookie === 'en' || langCookie === 'ar') ? langCookie : 'bn'

  return (
    <html lang={initialLang} suppressHydrationWarning data-scroll-behavior="smooth" className={`${inter.variable} ${hindSiliguri.variable} ${notoSansArabic.variable} ${amiri.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://rahmaniainstitute.org/#website",
              "name": "Rahmania Institute",
              "url": "https://rahmaniainstitute.org"
            })
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
                "countryName": "Bangladesh"
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
                  { "@type": "Offer", "itemOffered": { "@type": "Course", "name": "ইংলিশ ভার্সন" } }
                ]
              }
            })
          }}
        />
        <Analytics />
        <SpeedInsights />

      </body>
    </html>
  )
}
