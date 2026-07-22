import AdmissionPageClient from './AdmissionPageClient'

export const metadata = {
  title: 'ভর্তির তথ্য',
  description: 'রহমানিয়া ইনস্টিটিউটে ভর্তি সংক্রান্ত সকল তথ্য - ভর্তির যোগ্যতা, প্রয়োজনীয় কাগজপত্র, ফিস ও হাদিয়া এবং ভর্তি প্রক্রিয়ার নিয়মাবলি সম্পর্কে বিস্তারিত জানুন।',
  alternates: {
    canonical: '/admission',
    languages: {
      'bn-BD': '/admission?lang=bn',
      'en-US': '/admission?lang=en',
      'ar-SA': '/admission?lang=ar',
      'x-default': '/admission',
    },
  },
  openGraph: {
    title: 'ভর্তির তথ্য | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটে ভর্তি সংক্রান্ত সকল তথ্য - ভর্তির যোগ্যতা, প্রয়োজনীয় কাগজপত্র, ফিস ও হাদিয়া এবং ভর্তি প্রক্রিয়ার নিয়মাবলি সম্পর্কে বিস্তারিত জানুন।',
    url: '/admission',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
    images: [{ url: '/rahmania-logo-v2.png', width: 512, height: 512, alt: 'রহমানিয়া ইনস্টিটিউট' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ভর্তির তথ্য | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটে ভর্তি সংক্রান্ত সকল তথ্য - ভর্তির যোগ্যতা, প্রয়োজনীয় কাগজপত্র, ফিস ও হাদিয়া এবং ভর্তি প্রক্রিয়ার নিয়মাবলি সম্পর্কে বিস্তারিত জানুন।',
    images: [{ url: '/rahmania-logo-v2.png', width: 512, height: 512, alt: 'রহমানিয়া ইনস্টিটিউট' }],
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
      "name": "Admission Info",
      "item": "https://rahmaniainstitute.org/admission"
    }
  ]
}

const admissionPageJson = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://rahmaniainstitute.org/admission#webpage",
  "url": "https://rahmaniainstitute.org/admission",
  "name": "ভর্তির তথ্য | রহমানিয়া ইনস্টিটিউট",
  "description": "রহমানিয়া ইনস্টিটিউটে ভর্তি সংক্রান্ত সকল তথ্য",
  "inLanguage": "bn",
  "isPartOf": { "@id": "https://rahmaniainstitute.org/#website" },
  "potentialAction": {
    "@type": "RegisterAction",
    "target": "https://rahmaniainstitute.org/admission-form",
    "name": "ভর্তি ফর্ম পূরণ করুন"
  }
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(admissionPageJson) }}
      />
      <AdmissionPageClient />
    </>
  )
}
