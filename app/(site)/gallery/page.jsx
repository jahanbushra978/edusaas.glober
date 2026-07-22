import GalleryPageClient from './GalleryPageClient'

export const metadata = {
  title: 'ফটো গ্যালারি',
  description: 'রহমানিয়া ইনস্টিটিউটের বিভিন্ন অনুষ্ঠান, ক্লাস কার্যক্রম, ক্যাম্পাস এবং শিক্ষা সফরের স্মরণীয় আলোকচিত্রসমূহ গ্যালারিতে দেখুন।',
  alternates: {
    canonical: '/gallery',
  },
  openGraph: {
    title: 'ফটো গ্যালারি | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের বিভিন্ন অনুষ্ঠান, ক্লাস কার্যক্রম, ক্যাম্পাস এবং শিক্ষা সফরের স্মরণীয় আলোকচিত্রসমূহ গ্যালারিতে দেখুন।',
    url: '/gallery',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
    images: [{ url: '/rahmania-logo-v2.png', width: 512, height: 512, alt: 'রহমানিয়া ইনস্টিটিউট' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ফটো গ্যালারি | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের বিভিন্ন অনুষ্ঠান, ক্লাস কার্যক্রম, ক্যাম্পাস এবং শিক্ষা সফরের স্মরণীয় আলোকচিত্রসমূহ গ্যালারিতে দেখুন।',
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
      "name": "Photo Gallery",
      "item": "https://rahmaniainstitute.org/gallery"
    }
  ]
}

const galleryPageJson = {
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "@id": "https://rahmaniainstitute.org/gallery#webpage",
  "url": "https://rahmaniainstitute.org/gallery",
  "name": "ফটো গ্যালারি | রহমানিয়া ইনস্টিটিউট",
  "description": "রহমানিয়া ইনস্টিটিউটের আলোকচিত্র সংগ্রহ",
  "inLanguage": "bn",
  "isPartOf": { "@id": "https://rahmaniainstitute.org/#website" }
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryPageJson) }}
      />
      <GalleryPageClient />
    </>
  )
}
