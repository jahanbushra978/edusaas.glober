import BranchGalleryPageClient from './BranchGalleryPageClient'

export const metadata = {
  title: 'শাখা গ্যালারি',
  description: 'রহমানিয়া ইনস্টিটিউটের বিভিন্ন শাখা ও ক্যাম্পাসের ছবি এবং অবকাঠামোগত সুযোগ-সুবিধাসমূহ দেখুন।',
  alternates: {
    canonical: '/branch-gallery',
  },
  openGraph: {
    title: 'শাখা গ্যালারি | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের বিভিন্ন শাখা ও ক্যাম্পাসের ছবি এবং অবকাঠামোগত সুযোগ-সুবিধাসমূহ দেখুন।',
    url: '/branch-gallery',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'শাখা গ্যালারি | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের বিভিন্ন শাখা ও ক্যাম্পাসের ছবি এবং অবকাঠামোগত সুযোগ-সুবিধাসমূহ দেখুন।',
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
      "name": "Branch Gallery",
      "item": "https://rahmaniainstitute.org/branch-gallery"
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
      <BranchGalleryPageClient />
    </>
  )
}
