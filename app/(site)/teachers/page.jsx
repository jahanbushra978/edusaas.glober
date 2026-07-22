import TeachersPageClient from './TeachersPageClient'

export const metadata = {
  title: 'শিক্ষকমণ্ডলী',
  description: 'রহমানিয়া ইনস্টিটিউটের অভিজ্ঞ, দক্ষ ও স্নেহশীল শিক্ষকমণ্ডলী ও ওলামায়ে কেরামের তালিকা এবং পরিচিতি দেখুন।',
  alternates: {
    canonical: '/teachers',
    languages: {
      'bn-BD': '/teachers?lang=bn',
      'en-US': '/teachers?lang=en',
      'ar-SA': '/teachers?lang=ar',
      'x-default': '/teachers',
    },
  },
  openGraph: {
    title: 'শিক্ষকমণ্ডলী | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের অভিজ্ঞ, দক্ষ ও স্নেহশীল শিক্ষকমণ্ডলী ও ওলামায়ে কেরামের তালিকা এবং পরিচিতি দেখুন।',
    url: '/teachers',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'শিক্ষকমণ্ডলী | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের অভিজ্ঞ, দক্ষ ও স্নেহশীল শিক্ষকমণ্ডলী ও ওলামায়ে কেরামের তালিকা এবং পরিচিতি দেখুন।',
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
      "name": "Teachers",
      "item": "https://rahmaniainstitute.org/teachers"
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
      <TeachersPageClient />
    </>
  )
}
