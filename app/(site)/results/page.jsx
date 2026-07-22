import ResultsPageClient from './ResultsPageClient'

export const metadata = {
  title: 'পরীক্ষার ফলাফল',
  description: 'রহমানিয়া ইনস্টিটিউটের সকল সেমিস্টারের পরীক্ষার ফলাফল ও শিক্ষার্থীদের অগ্রগতি রিপোর্ট এখানে রোল ও আইডি দিয়ে সহজেই অনলাইন থেকে জানুন।',
  alternates: {
    canonical: '/results',
  },
  openGraph: {
    title: 'পরীক্ষার ফলাফল | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের সকল সেমিস্টারের পরীক্ষার ফলাফল ও শিক্ষার্থীদের অগ্রগতি রিপোর্ট এখানে রোল ও আইডি দিয়ে সহজেই অনলাইন থেকে জানুন।',
    url: '/results',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'পরীক্ষার ফলাফল | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের সকল সেমিস্টারের পরীক্ষার ফলাফল ও শিক্ষার্থীদের অগ্রগতি রিপোর্ট এখানে রোল ও আইডি দিয়ে সহজেই অনলাইন থেকে জানুন।',
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
      "name": "Exam Results",
      "item": "https://rahmaniainstitute.org/results"
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
      <ResultsPageClient />
    </>
  )
}
