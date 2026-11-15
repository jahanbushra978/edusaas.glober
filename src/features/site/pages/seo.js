/**
 * Technical SEO & Structured Data (JSON-LD) Helper Module
 * Generates dynamic SEO Title, Meta Description, Open Graph, Twitter Cards, 
 * Canonical URL, EducationalOrganization Schema, FAQPage Schema & Breadcrumbs.
 */

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://edusaas.global";

/**
 * Generate Next.js Dynamic Metadata Object for Pages
 */
export function generateSeoMetadata({
  title = "Edusaas - স্মার্ট স্কুল ও মাদরাসা ম্যানেজমেন্ট প্ল্যাটফর্ম | Education ERP",
  description = "বাংলাদেশের স্কুল, মাদরাসা ও কলেজের জন্য অনলাইন ভর্তি, নো-কোড ডায়নামিক ওয়েবসাইট, বায়োমেট্রিক হাজিরা, অটো রেজাল্ট শিট ও পেপারলেস ফি কালেকশনের অল-ইন-ওয়ান ক্লাউড ইআরপি প্ল্যাটফর্ম।",
  canonicalPath = "/",
  ogImage = `${BASE_URL}/edusaas-hero-bg-v2.jpg`,
  keywords = [
    "School Management Software",
    "School ERP Software",
    "Education Management System",
    "Madrasa Management Software",
    "মাদরাসা সফটওয়্যার",
    "স্কুল ম্যানেজমেন্ট সিস্টেম",
    "মাদ্রাসা রেজাল্ট শিট",
    "অনলাইন মাদরাসা ভর্তি",
    "মাদরাসা হিসাব সফটওয়্যার",
    "বায়োমেট্রিক হাজিরা",
    "Edusaas",
    "EduSaaS Global"
  ],
  author = "Edusaas"
} = {}) {
  const fullCanonicalUrl = `${BASE_URL}${canonicalPath}`;

  return {
    title: `${title} | Edusaas`,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: author }],
    creator: author,
    publisher: author,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: fullCanonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: fullCanonicalUrl,
      siteName: "Edusaas",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "bn_BD",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@EduSaaSGlobal",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * Edusaas SoftwareApplication JSON-LD Schema
 */
export function generateEdusaasSoftwareSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${BASE_URL}/#software`,
    "name": "Edusaas",
    "alternateName": ["EduSaaS Global", "Edusaas ERP", "Edusaas Platform"],
    "operatingSystem": "All, Cloud Web Application",
    "applicationCategory": "EducationalApplication, BusinessApplication",
    "description": "All-in-one Education SaaS & School/Madrasa ERP Software with real-time biometric attendance, automated grading, fee collection, and website builder.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BDT",
      "category": "Free Trial Available"
    },
    "author": {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      "name": "Edusaas",
      "url": BASE_URL,
      "logo": `${BASE_URL}/favicon.png`,
      "email": "contact@edusaas.global",
      "telephone": "+8801576600265",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Dhaka",
        "addressCountry": "Bangladesh"
      }
    }
  };
}

/**
 * EducationalOrganization JSON-LD Schema Generator for Madrasas & Schools
 */
export function generateEducationalOrgSchema({
  name = "রহমানিয়া ইনস্টিটিউট",
  alternateName = "Rahmania Institute",
  description = "দ্বীনি ও আধুনিক শিক্ষার সমন্বয়ে পরিচালিত শীতাতপ নিয়ন্ত্রিত আদর্শ শিক্ষা প্রতিষ্ঠান।",
  url = `${BASE_URL}/?view=school`,
  logo = `${BASE_URL}/rahmania-logo-v2.png`,
  telephone = "+8801906898939",
  email = "rahmaniainstitute.org@gmail.com",
  address = {
    streetAddress: "হাড়িনাল",
    addressLocality: "গাজীপুর সিটি",
    addressRegion: "ঢাকা",
    postalCode: "1700",
    addressCountry: "BD"
  }
} = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": name,
    "alternateName": alternateName,
    "url": url,
    "logo": logo,
    "image": logo,
    "description": description,
    "telephone": telephone,
    "email": email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address.streetAddress,
      "addressLocality": address.addressLocality,
      "addressRegion": address.addressRegion,
      "postalCode": address.postalCode,
      "addressCountry": address.addressCountry
    },
    "sameAs": [
      "https://facebook.com",
      "https://youtube.com"
    ]
  };
}

/**
 * FAQPage JSON-LD Schema Generator
 */
export function generateFaqSchema(faqList = []) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqList.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
}

/**
 * BreadcrumbList JSON-LD Schema Generator
 */
export function generateBreadcrumbSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`
    }))
  };
}
