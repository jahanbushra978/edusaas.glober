import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query'
import HomeClient from './page.client'
import { fetchHomePageData } from '../../src/lib/home-data.js'

export const metadata = {
  title: 'রহমানিয়া ইনস্টিটিউট | Rahmania Institute — গাজীপুরের দ্বীনি ও আধুনিক শিক্ষা প্রতিষ্ঠান',
  description: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট) — দ্বীনি ও জাগতিক শিক্ষার সমন্বয়ে গাজীপুরের একটি আধুনিক শিক্ষা প্রতিষ্ঠান। নূরানী, নাজেরা, হিফয, কিতাবখানা, কিন্ডারগার্টেন ও ইংলিশ ভার্সন বিভাগে পাঠদান। ভর্তি চলছে!',
  keywords: ['রহমানিয়া ইনস্টিটিউট', 'Rahmania Institute', 'হিফজ মাদ্রাসা', 'নূরানী', 'নাজেরা', 'হিফয', 'কিতাবখানা', 'কিন্ডারগার্টেন', 'ইংলিশ ভার্সন', 'গাজীপুর', 'Islamic school Gazipur', 'Bangladesh madrasa', 'হিফয শিক্ষা', 'কোরআন শিক্ষা'],
  robots: { index: true, follow: true },
  alternates: {
    canonical: '/',
    languages: {
      'bn-BD': '/?lang=bn',
      'en-US': '/?lang=en',
      'ar-SA': '/?lang=ar',
      'x-default': '/',
    },
  },
  openGraph: {
    title: 'রহমানিয়া ইনস্টিটিউট | Rahmania Institute',
    description: 'দ্বীনি ও জাগতিক শিক্ষার সমন্বয়ে গড়ে ওঠা আধুনিক শিক্ষা প্রতিষ্ঠান। নূরানী, নাজেরা, হিফয, কিতাবখানা ও ইংলিশ ভার্সন বিভাগ।',
    url: '/',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute',
    images: [{ url: '/rahmania-logo-v2.png', width: 512, height: 512, alt: 'Rahmania Institute Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'রহমানিয়া ইনস্টিটিউট | Rahmania Institute',
    description: 'দ্বীনি ও জাগতিক শিক্ষার সমন্বয়ে গড়ে ওঠা আধুনিক শিক্ষা প্রতিষ্ঠান।',
    images: ['/rahmania-logo-v2.png'],
  },
  other: {
    'geo.region': 'BD-33',
    'geo.placename': 'Gazipur',
    'geo.position': '23.999;90.422',
    'ICBM': '23.999, 90.422',
  },
}

export default async function Page() {
  const queryClient = new QueryClient()

  // Fetch home page data on the server.
  // Strategy (dual-path):
  //   1. Seed React Query's HydrationBoundary cache — used by React Query's
  //      useQuery() when it hydrates on the client (prevents a redundant
  //      client-side API call on first load).
  //   2. Pass `initialData` as a prop directly to HomeClient → Home →
  //      HomeDataProvider — this is the key fix for Google Bot.
  //      HomeDataProvider now accepts `initialData` and passes it to
  //      useQuery's `initialData` option, so the very first render on the
  //      server produces the full page HTML (no loading spinner).
  //
  // If the server fetch fails we simply don't seed either path and the
  // client falls back to its own /api/public/home fetch — behaviour
  // identical to before this change.
  let prefetchedData = null
  try {
    prefetchedData = await fetchHomePageData()
    queryClient.setQueryData(['home-page-data'], { ok: true, elapsed: 0, ...prefetchedData })
  } catch (e) {
    console.warn('[Homepage SSR] Failed to prefetch home data, falling back to client fetch:', e?.message)
  }

  // Build the initialData shape that HomeDataProvider / useQuery expects:
  // same structure as the /api/public/home JSON response.
  const initialData = prefetchedData
    ? { ok: true, elapsed: 0, ...prefetchedData }
    : null

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeClient initialData={initialData} />
    </HydrationBoundary>
  )
}
