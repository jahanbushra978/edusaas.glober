import AdmissionFormClient from './AdmissionFormClient'

export const metadata = {
  title: 'অনলাইন ভর্তি ফরম',
  description: 'রহমানিয়া ইনস্টিটিউটের অনলাইন ভর্তি আবেদন ফরম। প্রয়োজনীয় তথ্য প্রদান করে ঘরে বসেই সহজে ভর্তির আবেদন সম্পন্ন করুন।',
  alternates: {
    canonical: '/admission-form',
  },
  openGraph: {
    title: 'অনলাইন ভর্তি ফরম | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের অনলাইন ভর্তি আবেদন ফরম। প্রয়োজনীয় তথ্য প্রদান করে ঘরে বসেই সহজে ভর্তির আবেদন সম্পন্ন করুন।',
    url: '/admission-form',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'অনলাইন ভর্তি ফরম | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের অনলাইন ভর্তি আবেদন ফরম। প্রয়োজনীয় তথ্য প্রদান করে ঘরে বসেই সহজে ভর্তির আবেদন সম্পন্ন করুন।',
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
      "name": "Admission Form",
      "item": "https://rahmaniainstitute.org/admission-form"
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
      <AdmissionFormClient />
    </>
  )
}
