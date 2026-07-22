import dynamic from 'next/dynamic'
import { SectionSkeleton } from '@/shared/components/progressive/ProgressiveSection'

const FacilitiesPageClient = dynamic(() => import('@/lib/FacilitiesPage'), {
  loading: () => <SectionSkeleton minHeight={560} />,
  ssr: true,
})

export const metadata = {
  title: 'আমাদের সুযোগ-সুবিধা | Facilities',
  description: 'রহমানিয়া ইনস্টিটিউটের হোস্টেল (বোর্ডিং), নিরাপদ জেনারেটর ব্যাকআপ, স্মার্ট ক্লাস, কুতুবখানা (লাইব্রেরি) সহ অন্যান্য সুযোগ-সুবিধা সম্পর্কে বিস্তারিত জানুন। Explore our modern facilities, classrooms, library, and boarding systems.',
  alternates: {
    canonical: '/facilities',
  },
  openGraph: {
    title: 'আমাদের সুযোগ-সুবিধা | Facilities | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের হোস্টেল (বোর্ডিং), নিরাপদ জেনারেটর ব্যাকআপ, স্মার্ট ক্লাস, কুতুবখানা (লাইব্রেরি) সহ অন্যান্য সুযোগ-সুবিধা সম্পর্কে বিস্তারিত জানুন।',
    url: '/facilities',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'আমাদের সুযোগ-সুবিধা | Facilities | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের হোস্টেল (বোর্ডিং), নিরাপদ জেনারেটর ব্যাকআপ, স্মার্ট ক্লাস, কুতুবখানা (লাইব্রেরি) সহ অন্যান্য সুযোগ-সুবিধা সম্পর্কে বিস্তারিত জানুন।',
  }
}

export default function FacilitiesPage() {
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
        "name": "Facilities",
        "item": "https://rahmaniainstitute.org/facilities"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FacilitiesPageClient />
    </>
  )
}
