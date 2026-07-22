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

  // Prefetch home page data on the server and seed the React Query cache.
  // HydrationBoundary dehydrates this and passes it to the browser's
  // QueryClient, so the client's useQuery(['home-page-data']) finds data
  // immediately — no extra API call, no loading flash for real users.
  //
  // Note: We intentionally do NOT pass initialData as a prop to HomeClient.
  // Doing so caused React hydration error #418 because HomeContent renders
  // language-dependent text (via LanguageContext which reads localStorage in
  // useEffect). The server always renders in 'bn' (default), but the client's
  // first render could use a different stored language — text mismatch.
  // Instead, HomeContent uses a `mounted` guard: before mount it renders a
  // neutral spinner (same on server and client), after mount it renders full
  // content in the correct language. HydrationBoundary ensures the data is
  // already in cache when that happens, so there is no visible loading flash.
  try {
    const data = await fetchHomePageData()
    queryClient.setQueryData(['home-page-data'], { ok: true, elapsed: 0, ...data })
  } catch (e) {
    console.warn('[Homepage SSR] Failed to prefetch home data, falling back to client fetch:', e?.message)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeClient />
    </HydrationBoundary>
  )
}
