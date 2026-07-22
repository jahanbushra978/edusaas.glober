import VideoGalleryPageClient from './VideoGalleryPageClient'

export const metadata = {
  title: 'ভিডিও গ্যালারি',
  description: 'রহমানিয়া ইনস্টিটিউটের বিভিন্ন গুরুত্বপূর্ণ কার্যক্রম, ক্বারী ও হাফেজদের তিলাওয়াত, বার্ষিক অনুষ্ঠান ও ডকুমেন্টারি ভিডিওসমূহ দেখুন।',
  alternates: {
    canonical: '/video-gallery',
  },
  openGraph: {
    title: 'ভিডিও গ্যালারি | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের বিভিন্ন গুরুত্বপূর্ণ কার্যক্রম, ক্বারী ও হাফেজদের তিলাওয়াত, বার্ষিক অনুষ্ঠান ও ডকুমেন্টারি ভিডিওসমূহ দেখুন।',
    url: '/video-gallery',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ভিডিও গ্যালারি | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের বিভিন্ন গুরুত্বপূর্ণ কার্যক্রম, ক্বারী ও হাফেজদের তিলাওয়াত, বার্ষিক অনুষ্ঠান ও ডকুমেন্টারি ভিডিওসমূহ দেখুন।',
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
      "name": "Video Gallery",
      "item": "https://rahmaniainstitute.org/video-gallery"
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
      <VideoGalleryPageClient />
    </>
  )
}
