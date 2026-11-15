import { headers } from "next/headers";
import FaqPageClient from './FaqPageClient';
import EdusaasFaqView from "@/features/site/components/saas/EdusaasFaqView";
import { appClient } from '@/api/appClient';

async function checkIsRahmania() {
  try {
    const reqHeaders = await headers();
    const host = (reqHeaders.get('host') || '').split(':')[0].toLowerCase().trim();
    return host === 'rahmaniainstitute.org' || host === 'www.rahmaniainstitute.org';
  } catch {
    return false;
  }
}

export async function generateMetadata() {
  const isRahmania = await checkIsRahmania();

  if (isRahmania) {
    return {
      title: 'সাধারণ জিজ্ঞাসা (FAQ) | Frequently Asked Questions',
      description: 'রহমানিয়া ইনস্টিটিউট সম্পর্কে সাধারণ জিজ্ঞাসা ও উত্তর - ভর্তি, ক্লাস, নিয়মাবলী ও অন্যান্য তথ্য। Get answers to frequently asked questions about admissions, classes, and other procedures.',
      alternates: {
        canonical: 'https://rahmaniainstitute.org/faq',
        languages: {
          'bn-BD': 'https://rahmaniainstitute.org/faq?lang=bn',
          'en-US': 'https://rahmaniainstitute.org/faq?lang=en',
          'ar-SA': 'https://rahmaniainstitute.org/faq?lang=ar',
          'x-default': 'https://rahmaniainstitute.org/faq',
        },
      },
      openGraph: {
        title: 'সাধারণ জিজ্ঞাসা (FAQ) | রহমানিয়া ইনস্টিটিউট',
        description: 'রহমানিয়া ইনস্টিটিউট সম্পর্কে সাধারণ জিজ্ঞাসা ও উত্তর - ভর্তি, ক্লাস, নিয়মাবলী ও অন্যান্য তথ্য।',
        url: 'https://rahmaniainstitute.org/faq',
        type: 'website',
        locale: 'bn_BD',
        siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'সাধারণ জিজ্ঞাসা (FAQ) | রহমানিয়া ইনস্টিটিউট',
        description: 'রহমানিয়া ইনস্টিটিউট সম্পর্কে সাধারণ জিজ্ঞাসা ও উত্তর - ভর্তি, ক্লাস, নিয়মাবলী ও অন্যান্য তথ্য।',
      }
    };
  }

  return {
    title: 'সাধারণ জিজ্ঞাসা (FAQ) | Edusaas — ক্লাউড শিক্ষা ইআরপি ও বায়োমেট্রিক সিস্টেম',
    description: 'EduSaaS সম্পর্কে সাধারণ জিজ্ঞাসা ও উত্তর — বায়োমেট্রিক ডিভাইস ইন্টিগ্রেশন, অটো রেজাল্ট, ওয়েবসাইট ডোমেইন, ফি অ্যাকাউন্টিং ও নূর এআই কুরআন শিক্ষক।',
    alternates: {
      canonical: 'https://edusaas.global/faq',
    },
    openGraph: {
      title: 'সাধারণ জিজ্ঞাসা (FAQ) | Edusaas',
      description: 'EduSaaS সম্পর্কে সাধারণ জিজ্ঞাসা ও উত্তর — স্কুল ও মাদ্রাসা ক্লাউড ম্যানেজমেন্ট।',
      url: 'https://edusaas.global/faq',
      type: 'website',
      locale: 'bn_BD',
      siteName: 'Edusaas',
      images: [{ url: '/edusaas-hero-bg-v2.jpg', width: 1200, height: 630, alt: 'Edusaas FAQ' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'সাধারণ জিজ্ঞাসা (FAQ) | Edusaas',
      description: 'EduSaaS সম্পর্কে সাধারণ জিজ্ঞাসা ও উত্তর — স্কুল ও মাদ্রাসা ক্লাউড ম্যানেজমেন্ট।',
      images: ['/edusaas-hero-bg-v2.jpg'],
    }
  };
}

const edusaasFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "EduSaaS কী এবং এটি কীভাবে আমাদের প্রতিষ্ঠানকে সাহায্য করে?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "EduSaaS হলো স্কুল, কলেজ, মাদ্রাসা ও শিক্ষাপ্রতিষ্ঠানের জন্য ক্লাউড-ভিত্তিক অল-ইন-ওয়ান শিক্ষা ব্যবস্থাপনা (ERP) সফটওয়্যার।"
      }
    },
    {
      "@type": "Question",
      "name": "কোন কোন বায়োমেট্রিক ডিভাইস EduSaaS-এর সাথে কাজ করে?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ZKTeco, Hikvision, Realand সহ সকল স্ট্যান্ডার্ড ফিঙ্গারপ্রিন্ট ও ফেস রিকগনিশন ডিভাইস রিয়েলটাইমে সিঙ্ক হয়।"
      }
    },
    {
      "@type": "Question",
      "name": "আমাদের প্রতিষ্ঠানের ডাটা কতটা নিরাপদ? অন্য প্রতিষ্ঠান কি দেখতে পারবে?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "সম্পূর্ণ নিরাপদ। EduSaaS এন্টারপ্রাইজ-গ্রেড PostgreSQL Row-Level Security (RLS) ও জিরো-ট্রাস্ট মাল্টি-টেন্যান্ট আইসোলেশন নীতিতে চলে।"
      }
    }
  ]
};

const edusaasBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://edusaas.global"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "FAQ",
      "item": "https://edusaas.global/faq"
    }
  ]
};

export default async function FaqPage() {
  const isRahmania = await checkIsRahmania();

  if (isRahmania) {
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
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(edusaasFaqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(edusaasBreadcrumbSchema) }}
      />
      <EdusaasFaqView />
    </>
  );
}
