import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { DEPARTMENT_PAGES, getDepartmentBySlug } from "@/lib/departmentData";

export const revalidate = 3600;
export const dynamicParams = false;

function PageSkeleton() {
  return <div className="min-h-[640px] animate-pulse bg-slate-50" />;
}

const DepartmentLandingPage = dynamic(() => import("@/lib/DepartmentLandingPage"), {
  loading: () => <PageSkeleton />,
});

export function generateStaticParams() {
  return DEPARTMENT_PAGES.map((department) => ({ slug: department.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const department = getDepartmentBySlug(slug);

  if (!department) {
    return {};
  }

  const canonical = department.route;
  const title = `${department.title} | রহমানিয়া ইনস্টিটিউট`;
  const description = department.seoDescription;

  return {
    title,
    description,
    keywords: department.keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      locale: "bn_BD",
      siteName: "Rahmania Institute",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function DepartmentPage({ params }) {
  const { slug } = await params;
  const department = getDepartmentBySlug(slug);

  if (!department) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: department.titleEn,
    description: department.seoDescription,
    provider: {
      "@type": "EducationalOrganization",
      name: "Rahmania Institute",
      url: "https://rahmaniainstitute.org",
    },
    educationalCredentialAwarded: department.title,
    inLanguage: ["bn", "en", "ar"],
    url: `https://rahmaniainstitute.org${department.route}`,
    keywords: department.keywords.join(", "),
  };

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
        "name": "Academics",
        "item": "https://rahmaniainstitute.org/academics"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": department.title,
        "item": `https://rahmaniainstitute.org${department.route}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      <DepartmentLandingPage department={department} />
    </>
  );
}
