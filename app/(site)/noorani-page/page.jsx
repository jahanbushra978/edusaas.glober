import dynamic from 'next/dynamic'
import { SectionSkeleton } from '@/shared/components/progressive/ProgressiveSection'

const NooraniPageClient = dynamic(() => import('@/lib/NooraniPage'), {
  loading: () => <SectionSkeleton minHeight={560} />,
  ssr: true,
})

export const metadata = {
  title: 'নূরানী ও নাজেরা বিভাগ | Noorani & Nazera Department',
  description: 'রহমানিয়া ইনস্টিটিউটের নূরানী ও নাজেরা বিভাগের সিলেবাস, ক্লাসের সময়সূচী এবং দ্বীনি ও সাধারণ শিক্ষার সমন্বিত পাঠ্যক্রম সম্পর্কে জানুন। Explore our integrated curriculum for Noorani and Nazera departments.',
  alternates: {
    canonical: '/noorani-page',
  },
  openGraph: {
    title: 'নূরানী ও নাজেরা বিভাগ | Noorani & Nazera Department | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের নূরানী ও নাজেরা বিভাগের সিলেবাস, ক্লাসের সময়সূচী এবং দ্বীনি ও সাধারণ শিক্ষার সমন্বিত পাঠ্যক্রম সম্পর্কে জানুন।',
    url: '/noorani-page',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'নূরানী ও নাজেরা বিভাগ | Noorani & Nazera Department | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের নূরানী ও নাজেরা বিভাগের সিলেবাস, ক্লাসের সময়সূচী এবং দ্বীনি ও সাধারণ শিক্ষার সমন্বিত পাঠ্যক্রম সম্পর্কে জানুন।',
  }
}

export default function NooraniPage() {
  const breadcrumbSchema = {
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
        "name": "Noorani & Nazera Department",
        "item": "https://rahmaniainstitute.org/noorani-page"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <NooraniPageClient />
    </>
  )
}
