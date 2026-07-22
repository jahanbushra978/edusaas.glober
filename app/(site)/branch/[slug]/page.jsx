import dynamic from 'next/dynamic'
import { appClient } from '@/api/appClient'
import { SectionSkeleton } from '@/shared/components/progressive/ProgressiveSection'

const BranchPageClient = dynamic(() => import('@/lib/BranchPage'), {
  loading: () => <SectionSkeleton minHeight={640} />,
  ssr: true,
})

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let title = 'শাখার বিবরণ';
  let description = 'রহমানিয়া ইনস্টিটিউটের শাখা ও ক্যাম্পাসের বিস্তারিত তথ্য জানুন।';

  try {
    const res = await appClient.entities.Branch.filter({ slug });
    const branch = res?.[0];
    if (branch) {
      const name = branch.name_bn || branch.branch_name || branch.name_en || '';
      title = `${name} | রহমানিয়া ইনস্টিটিউট`;
      description = `রহমানিয়া ইনস্টিটিউটের ${name} শাখার ভর্তি কার্যক্রম, সুযোগ-সুবিধা ও অবস্থান সম্পর্কে জানুন। ঠিকানা: ${branch.address_bn || branch.address || branch.address_en || ''}`;
    }
  } catch (err) {
    console.error("Error generating branch metadata:", err);
  }

  return {
    title,
    description,
    alternates: {
      canonical: `/branch/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/branch/${slug}`,
      type: 'website',
      locale: 'bn_BD',
      siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  };
}

export default async function BranchPage({ params }) {
  const { slug } = await params;
  let branchName = 'Branch';
  let branchAddress = '';
  let branchLogo = 'https://rahmaniainstitute.org/rahmania-logo-v2.png';
  let branchPhone = '+8801906898939';

  try {
    const res = await appClient.entities.Branch.filter({ slug });
    const branch = res?.[0];
    if (branch) {
      branchName = branch.name_bn || branch.branch_name || branch.name_en || 'Branch';
      branchAddress = branch.address_bn || branch.address || branch.address_en || '';
      if (branch.logo) branchLogo = branch.logo;
      if (branch.phone) branchPhone = branch.phone;
    }
  } catch (err) {
    console.error("Error generating branch schema:", err);
  }

  const schoolSchema = {
    "@context": "https://schema.org",
    "@type": "School",
    "@id": `https://rahmaniainstitute.org/branch/${slug}#school`,
    "name": branchName,
    "url": `https://rahmaniainstitute.org/branch/${slug}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": branchAddress || "Bangladesh",
      "addressCountry": "Bangladesh"
    },
    "telephone": branchPhone,
    "image": branchLogo
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
        "name": branchName,
        "item": `https://rahmaniainstitute.org/branch/${slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BranchPageClient />
    </>
  );
}
