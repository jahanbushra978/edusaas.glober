import AboutPageClient from './AboutPageClient'

export const metadata = {
  title: 'আমাদের সম্পর্কে',
  description: 'রহমানিয়া ইনস্টিটিউট সম্পর্কে জানুন - আধুনিক ও দ্বীনি শিক্ষার সমন্বয়ে একটি আদর্শ শিক্ষাপ্রতিষ্ঠান। এখানে ক্যারেক্টার বিল্ডিং, নৈতিক চরিত্র গঠন এবং গুণগত মানসম্মত শিক্ষা প্রদান করা হয়।',
  alternates: {
    canonical: '/about',
    languages: {
      'bn-BD': '/about?lang=bn',
      'en-US': '/about?lang=en',
      'ar-SA': '/about?lang=ar',
      'x-default': '/about',
    },
  },
  openGraph: {
    title: 'আমাদের সম্পর্কে | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউট সম্পর্কে জানুন - আধুনিক ও দ্বীনি শিক্ষার সমন্বয়ে একটি আদর্শ শিক্ষাপ্রতিষ্ঠান। এখানে ক্যারেক্টার বিল্ডিং, নৈতিক চরিত্র গঠন এবং গুণগত মানসম্মত শিক্ষা প্রদান করা হয়।',
    url: '/about',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'আমাদের সম্পর্কে | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউট সম্পর্কে জানুন - আধুনিক ও দ্বীনি শিক্ষার সমন্বয়ে একটি আদর্শ শিক্ষাপ্রতিষ্ঠান। এখানে ক্যারেক্টার বিল্ডিং, নৈতিক চরিত্র গঠন এবং গুণগত মানসম্মত শিক্ষা প্রদান করা হয়।',
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
      "name": "About Us",
      "item": "https://rahmaniainstitute.org/about"
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
      <AboutPageClient />
    </>
  )
}
