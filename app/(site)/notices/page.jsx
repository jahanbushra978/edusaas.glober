import NoticesClient from './NoticesClient'

export const metadata = {
  title: 'নোটিশ ও আপডেটসমূহ',
  description: 'রহমানিয়া ইনস্টিটিউটের সকল নোটিশ, গুরুত্বপূর্ণ আপডেট, অনুষ্ঠান সূচি এবং ব্লগ পোস্টসমূহ এখানে দেখুন।',
  alternates: {
    canonical: '/notices',
  },
  openGraph: {
    title: 'নোটিশ ও আপডেটসমূহ | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের সকল নোটিশ, গুরুত্বপূর্ণ আপডেট, অনুষ্ঠান সূচি এবং ব্লগ পোস্টসমূহ এখানে দেখুন।',
    url: '/notices',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'নোটিশ ও আপডেটসমূহ | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউটের সকল নোটিশ, গুরুত্বপূর্ণ আপডেট, অনুষ্ঠান সূচি এবং ব্লগ পোস্টসমূহ এখানে দেখুন।',
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
      "name": "Notices",
      "item": "https://rahmaniainstitute.org/notices"
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
      <NoticesClient />
    </>
  )
}
