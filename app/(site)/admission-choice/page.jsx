import AdmissionChoicePageClient from './AdmissionChoicePageClient'

export const metadata = {
  title: 'প্রি-এডমিশন',
  description: 'রহমানিয়া ইনস্টিটিউটে অনলাইন প্রাক-ভর্তি আবেদন পোর্টাল। আপনার পছন্দের শাখা এবং কাঙ্ক্ষিত বিভাগ নির্বাচন করে ভর্তির আবেদন শুরু করুন।',
  alternates: {
    canonical: '/admission-choice',
  },
  openGraph: {
    title: 'প্রি-এডমিশন | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটে অনলাইন প্রাক-ভর্তি আবেদন পোর্টাল। আপনার পছন্দের শাখা এবং কাঙ্ক্ষিত বিভাগ নির্বাচন করে ভর্তির আবেদন শুরু করুন।',
    url: '/admission-choice',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'প্রি-এডমিশন | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটে অনলাইন প্রাক-ভর্তি আবেদন পোর্টাল। আপনার পছন্দের শাখা এবং কাঙ্ক্ষিত বিভাগ নির্বাচন করে ভর্তির আবেদন শুরু করুন।',
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
      "name": "Pre-Admission Choice",
      "item": "https://rahmaniainstitute.org/admission-choice"
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
      <AdmissionChoicePageClient />
    </>
  )
}
