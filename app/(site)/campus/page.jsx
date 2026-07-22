import CampusPageClient from './CampusPageClient'

export const metadata = {
  title: 'আমাদের ক্যাম্পাস',
  description: 'রহমানিয়া ইনস্টিটিউটের মনোরম ও নিরাপদ ক্যাম্পাস পরিবেশ, স্মার্ট ক্লাসরুম, লাইব্রেরি এবং অন্যান্য সুযোগ-সুবিধা সম্পর্কে বিস্তারিত জানুন।',
  alternates: {
    canonical: '/campus',
  },
  openGraph: {
    title: 'আমাদের ক্যাম্পাস | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের মনোরম ও নিরাপদ ক্যাম্পাস পরিবেশ, স্মার্ট ক্লাসরুম, লাইব্রেরি এবং অন্যান্য সুযোগ-সুবিধা সম্পর্কে বিস্তারিত জানুন।',
    url: '/campus',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'আমাদের ক্যাম্পাস | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের মনোরম ও নিরাপদ ক্যাম্পাস পরিবেশ, স্মার্ট ক্লাসরুম, লাইব্রেরি এবং অন্যান্য সুযোগ-সুবিধা সম্পর্কে বিস্তারিত জানুন।',
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
      "name": "Campus",
      "item": "https://rahmaniainstitute.org/campus"
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
      <CampusPageClient />
    </>
  )
}
