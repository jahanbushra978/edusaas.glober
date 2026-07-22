import MissionPageClient from './MissionPageClient'

export const metadata = {
  title: 'লক্ষ্য ও উদ্দেশ্য',
  description: 'রহমানিয়া ইনস্টিটিউটের মিশন, ভিশন ও লক্ষ্যসমূহ - আধুনিক বিশ্বের চ্যালেঞ্জ মোকাবিলায় নৈতিকতা ও দ্বীনি শিক্ষার অপূর্ব সমন্বয় তৈরি করা।',
  alternates: {
    canonical: '/mission',
  },
  openGraph: {
    title: 'লক্ষ্য ও উদ্দেশ্য | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের মিশন, ভিশন ও লক্ষ্যসমূহ - আধুনিক বিশ্বের চ্যালেঞ্জ মোকাবিলায় নৈতিকতা ও দ্বীনি শিক্ষার অপূর্ব সমন্বয় তৈরি করা।',
    url: '/mission',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'লক্ষ্য ও উদ্দেশ্য | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের মিশন, ভিশন ও লক্ষ্যসমূহ - আধুনিক বিশ্বের চ্যালেঞ্জ মোকাবিলায় নৈতিকতা ও দ্বীনি শিক্ষার অপূর্ব সমন্বয় তৈরি করা।',
  }
}

const breadcrumbJson = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://rahmaniainstitute.org"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Mission & Vision",
      "item": "https://rahmaniainstitute.org/mission"
    }
  ]
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      <MissionPageClient />
    </>
  )
}
