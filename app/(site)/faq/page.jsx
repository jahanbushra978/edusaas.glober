import FaqPageClient from './FaqPageClient'
import { appClient } from '@/api/appClient'

export const metadata = {
  title: 'সাধারণ জিজ্ঞাসা (FAQ) | Frequently Asked Questions',
  description: 'রহমানিয়া ইনস্টিটিউট সম্পর্কে সাধারণ জিজ্ঞাসা ও উত্তর - ভর্তি, ক্লাস, নিয়মাবলী ও অন্যান্য তথ্য। Get answers to frequently asked questions about admissions, classes, and other procedures.',
  alternates: {
    canonical: '/faq',
    languages: {
      'bn-BD': '/faq?lang=bn',
      'en-US': '/faq?lang=en',
      'ar-SA': '/faq?lang=ar',
      'x-default': '/faq',
    },
  },
  openGraph: {
    title: 'সাধারণ জিজ্ঞাসা (FAQ) | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউট সম্পর্কে সাধারণ জিজ্ঞাসা ও উত্তর - ভর্তি, ক্লাস, নিয়মাবলী ও অন্যান্য তথ্য।',
    url: '/faq',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'সাধারণ জিজ্ঞাসা (FAQ) | রহমানিয়া ইনস্টিটিউট',
    description: 'রহমানিয়া ইনস্টিটিউট সম্পর্কে সাধারণ জিজ্ঞাসা ও উত্তর - ভর্তি, ক্লাস, নিয়মাবলী ও অন্যান্য তথ্য।',
  }
}

export default async function FaqPage() {
  let activeFaqs = [];
  try {
    const faqs = await appClient.entities.Faq.list("sort_order", 50);
    activeFaqs = faqs.filter(f => f.is_active !== false);
  } catch (err) {
    console.error("Error loading FAQs for structured schema:", err);
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": activeFaqs.map(f => ({
      "@type": "Question",
      "name": f.question_bn || f.question || "",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer_bn || f.answer || ""
      }
    }))
  };

  const breadcrumbSchema = {
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
        "name": "FAQ",
        "item": "https://rahmaniainstitute.org/faq"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FaqPageClient />
    </>
  )
}
