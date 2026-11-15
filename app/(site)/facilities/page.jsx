import { headers } from "next/headers";
import dynamic from 'next/dynamic';
import { SectionSkeleton } from '@/shared/components/progressive/ProgressiveSection';
import EdusaasFacilitiesView from "@/features/site/components/saas/EdusaasFacilitiesView";

const FacilitiesPageClient = dynamic(() => import('@/lib/FacilitiesPage'), {
  loading: () => <SectionSkeleton minHeight={560} />,
  ssr: true,
});

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
      title: 'আমাদের সুযোগ-সুবিধা | Facilities',
      description: 'রহমানিয়া ইনস্টিটিউটের হোস্টেল (বোর্ডিং), নিরাপদ জেনারেটর ব্যাকআপ, স্মার্ট ক্লাস, কুতুবখানা (লাইব্রেরি) সহ অন্যান্য সুযোগ-সুবিধা সম্পর্কে বিস্তারিত জানুন। Explore our modern facilities, classrooms, library, and boarding systems.',
      alternates: {
        canonical: 'https://rahmaniainstitute.org/facilities',
      },
      openGraph: {
        title: 'আমাদের সুযোগ-সুবিধা | Facilities | রহমানিয়া ইনস্টিটিউট',
        description: 'রহমানিয়া ইনস্টিটিউটের হোস্টেল (বোর্ডিং), নিরাপদ জেনারেটর ব্যাকআপ, স্মার্ট ক্লাস, কুতুবখানা (লাইব্রেরি) সহ অন্যান্য সুযোগ-সুবিধা সম্পর্কে বিস্তারিত জানুন।',
        url: 'https://rahmaniainstitute.org/facilities',
        type: 'website',
        locale: 'bn_BD',
        siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'আমাদের সুযোগ-সুবিধা | Facilities | রহমানিয়া ইনস্টিটিউট',
        description: 'রহমানিয়া ইনস্টিটিউটের হোস্টেল (বোর্ডিং), নিরাপদ জেনারেটর ব্যাকআপ, স্মার্ট ক্লাস, কুতুবখানা (লাইব্রেরি) সহ অন্যান্য সুযোগ-সুবিধা সম্পর্কে বিস্তারিত জানুন।',
      }
    };
  }

  return {
    title: 'সুযোগ-সুবিধা ও প্রযুক্তিগত সক্ষমতা | Edusaas — ক্লাউড ইআরপি প্ল্যাটফর্ম',
    description: 'EduSaaS ক্লাউড অবকাঠামো, ZKTeco বায়োমেট্রিক আইওটি গেটওয়ে, নূর এআই ভয়েস টিচিং ইঞ্জিন ও এন্টারপ্রাইজ জিরো-ট্রাস্ট নিরাপত্তা।',
    alternates: {
      canonical: 'https://edusaas.global/facilities',
    },
    openGraph: {
      title: 'সুযোগ-সুবিধা ও প্রযুক্তিগত সক্ষমতা | Edusaas',
      description: 'EduSaaS ক্লাউড অবকাঠামো ও প্রযুক্তিগত সক্ষমতা।',
      url: 'https://edusaas.global/facilities',
      type: 'website',
      locale: 'bn_BD',
      siteName: 'Edusaas',
      images: [{ url: '/edusaas-hero-bg-v2.jpg', width: 1200, height: 630, alt: 'Edusaas Capabilities' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'সুযোগ-সুবিধা ও প্রযুক্তিগত সক্ষমতা | Edusaas',
      description: 'EduSaaS ক্লাউড অবকাঠামো ও প্রযুক্তিগত সক্ষমতা।',
      images: ['/edusaas-hero-bg-v2.jpg'],
    }
  };
}

const rahmaniaBreadcrumbSchema = {
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
      "name": "Facilities",
      "item": "https://rahmaniainstitute.org/facilities"
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
      "name": "Facilities",
      "item": "https://edusaas.global/facilities"
    }
  ]
};

export default async function FacilitiesPage() {
  const isRahmania = await checkIsRahmania();

  if (isRahmania) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rahmaniaBreadcrumbSchema) }}
        />
        <FacilitiesPageClient />
      </>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(edusaasBreadcrumbSchema) }}
      />
      <EdusaasFacilitiesView />
    </>
  );
}
