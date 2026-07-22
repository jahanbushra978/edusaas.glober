import AcademicsPageClient from './AcademicsPageClient'

export const metadata = {
  title: 'শিক্ষা কার্যক্রম',
  description: 'রহমানিয়া ইনস্টিটিউটের একাডেমিক ও দ্বীনি শিক্ষা কার্যক্রম - নূরানী, নাজেরা, হিফয, হিফয শুনানি, কিতাবখানা, এবং ইংরেজি ভার্সন বিভাগের বিস্তারিত কোর্স ও কারিকুলাম সমূহ জানুন।',
  alternates: {
    canonical: '/academics',
    languages: {
      'bn-BD': '/academics?lang=bn',
      'en-US': '/academics?lang=en',
      'ar-SA': '/academics?lang=ar',
      'x-default': '/academics',
    },
  },
  openGraph: {
    title: 'শিক্ষা কার্যক্রম | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের একাডেমিক ও দ্বীনি শিক্ষা কার্যক্রম - নূরানী, নাজেরা, হিফয, হিফয শুনানি, কিতাবখানা, এবং ইংরেজি ভার্সন বিভাগের বিস্তারিত কোর্স ও কারিকুলাম সমূহ জানুন।',
    url: '/academics',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'শিক্ষা কার্যক্রম | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের একাডেমিক ও দ্বীনি শিক্ষা কার্যক্রম - নূরানী, নাজেরা, হিফয, হিফয শুনানি, কিতাবখানা, এবং ইংরেজি ভার্সন বিভাগের বিস্তারিত কোর্স ও কারিকুলাম সমূহ জানুন।',
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
      "name": "Academics",
      "item": "https://rahmaniainstitute.org/academics"
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
      <AcademicsPageClient />
    </>
  )
}
