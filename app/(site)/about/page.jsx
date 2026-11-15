import { headers } from "next/headers";
import AboutPageClient from './AboutPageClient';
import EdusaasAboutView from "@/features/site/components/saas/EdusaasAboutView";

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
      title: 'আমাদের সম্পর্কে',
      description: 'রহমানিয়া ইনস্টিটিউট সম্পর্কে জানুন - আধুনিক ও দ্বীনি শিক্ষার সমন্বয়ে একটি আদর্শ শিক্ষাপ্রতিষ্ঠান। এখানে ক্যারেক্টার বিল্ডিং, নৈতিক চরিত্র গঠন এবং গুণগত মানসম্মত শিক্ষা প্রদান করা হয়।',
      alternates: {
        canonical: 'https://rahmaniainstitute.org/about',
        languages: {
          'bn-BD': 'https://rahmaniainstitute.org/about?lang=bn',
          'en-US': 'https://rahmaniainstitute.org/about?lang=en',
          'ar-SA': 'https://rahmaniainstitute.org/about?lang=ar',
          'x-default': 'https://rahmaniainstitute.org/about',
        },
      },
      openGraph: {
        title: 'আমাদের সম্পর্কে | রহমানিয়া ইনস্টিটিউট',
        description: 'রহমানিয়া ইনস্টিটিউট সম্পর্কে জানুন - আধুনিক ও দ্বীনি শিক্ষার সমন্বয়ে একটি আদর্শ শিক্ষাপ্রতিষ্ঠান।',
        url: 'https://rahmaniainstitute.org/about',
        type: 'website',
        locale: 'bn_BD',
        siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
        images: [{ url: '/rahmania-logo-v2.png', width: 512, height: 512, alt: 'রহমানিয়া ইনস্টিটিউট' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'আমাদের সম্পর্কে | রহমানিয়া ইনস্টিটিউট',
        description: 'রহমানিয়া ইনস্টিটিউট সম্পর্কে জানুন - আধুনিক ও দ্বীনি শিক্ষার সমন্বয়ে একটি আদর্শ শিক্ষাপ্রতিষ্ঠান।',
        images: [{ url: '/rahmania-logo-v2.png', width: 512, height: 512, alt: 'রহমানিয়া ইনস্টিটিউট' }],
      }
    };
  }

  return {
    title: 'আমাদের সম্পর্কে | Edusaas — স্মার্ট এডুকেশন ক্লাউড ইআরপি ও ম্যানেজমেন্ট প্ল্যাটফর্ম',
    description: 'Edusaas (EduSaaS Global) সম্পর্কে জানুন — স্কুল, মাদ্রাসা ও কলেজের জন্য ক্লাউড ইআরপি, বায়োমেট্রিক হাজিরা, অটো রেজাল্ট ও এআই কোরআন শিক্ষা প্ল্যাটফর্ম।',
    alternates: {
      canonical: 'https://edusaas.global/about',
    },
    openGraph: {
      title: 'আমাদের সম্পর্কে | Edusaas — স্মার্ট এডুকেশন ক্লাউড ইআরপি',
      description: 'স্কুল, কলেজ ও মাদ্রাসার জন্য অল-ইন-ওয়ান ক্লাউড অপারেটিং সিস্টেম।',
      url: 'https://edusaas.global/about',
      type: 'website',
      locale: 'bn_BD',
      siteName: 'Edusaas',
      images: [{ url: '/edusaas-hero-bg-v2.jpg', width: 1200, height: 630, alt: 'Edusaas Platform' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'আমাদের সম্পর্কে | Edusaas',
      description: 'স্কুল, কলেজ ও মাদ্রাসার জন্য অল-ইন-ওয়ান ক্লাউড অপারেটিং সিস্টেম।',
      images: ['/edusaas-hero-bg-v2.jpg'],
    }
  };
}

const rahmaniaBreadcrumbJson = {
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
      "name": "About Us",
      "item": "https://rahmaniainstitute.org/about"
    }
  ]
};

const rahmaniaAboutPageJson = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": "https://rahmaniainstitute.org/about#webpage",
  "url": "https://rahmaniainstitute.org/about",
  "name": "আমাদের সম্পর্কে | রহমানিয়া ইনস্টিটিউট",
  "description": "রহমানিয়া ইনস্টিটিউট সম্পর্কে জানুন - আধুনিক ও দ্বীনি শিক্ষার সমন্বয়ে একটি আদর্শ শিক্ষাপ্রতিষ্ঠান।",
  "inLanguage": "bn",
  "isPartOf": { "@id": "https://rahmaniainstitute.org/#website" },
  "about": { "@id": "https://rahmaniainstitute.org/#organization" }
};

const edusaasBreadcrumbJson = {
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
      "name": "About Us",
      "item": "https://edusaas.global/about"
    }
  ]
};

const edusaasAboutPageJson = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": "https://edusaas.global/about#webpage",
  "url": "https://edusaas.global/about",
  "name": "আমাদের সম্পর্কে | Edusaas — স্মার্ট এডুকেশন ক্লাউড ইআরপি ও ম্যানেজমেন্ট প্ল্যাটফর্ম",
  "description": "Edusaas সম্পর্কে জানুন — স্কুল, মাদ্রাসা ও কলেজের জন্য ক্লাউড ইআরপি, বায়োমেট্রিক হাজিরা, অটো রেজাল্ট ও এআই কোরআন শিক্ষা প্ল্যাটফর্ম।",
  "inLanguage": "bn",
  "isPartOf": { "@id": "https://edusaas.global/#website" },
  "about": { "@id": "https://edusaas.global/#organization" }
};

export default async function Page() {
  const isRahmania = await checkIsRahmania();

  if (isRahmania) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rahmaniaBreadcrumbJson) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rahmaniaAboutPageJson) }}
        />
        <AboutPageClient />
      </>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(edusaasBreadcrumbJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(edusaasAboutPageJson) }}
      />
      <EdusaasAboutView />
    </>
  );
}
