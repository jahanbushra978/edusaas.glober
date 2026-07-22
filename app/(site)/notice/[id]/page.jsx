import NoticeDetailsClient from './NoticeDetailsClient'
import { appClient } from '@/api/appClient'

export async function generateMetadata({ params }) {
  const { id } = await params;
  let title = 'নোটিশ ও খবর';
  let description = 'রহমানিয়া ইনস্টিটিউটের নোটিশ ও আপডেটসমূহের বিস্তারিত বিবরণ দেখুন।';

  try {
    const notice = await appClient.entities.Notice.get(id);
    if (notice && notice.is_active && notice.status !== 'draft') {
      title = notice.title;
      if (notice.description) {
        description = notice.description.replace(/[#*`_~]/g, '').substring(0, 150) + '...';
      }
    }
  } catch (err) {
    console.error("Error generating dynamic notice metadata:", err);
  }

  return {
    title,
    description,
    alternates: {
      canonical: `/notice/${id}`,
    },
    openGraph: {
      title: `${title} | রহমানিয়া ইনস্টিটিউট`,
      description,
      url: `/notice/${id}`,
      type: 'article',
      locale: 'bn_BD',
      siteName: 'Rahmania Institute (রহমানিয়া ইনস্টিটিউট)',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | রহমানিয়া ইনস্টিটিউট`,
      description,
    }
  }
}

export default async function Page({ params }) {
  const { id } = await params;
  
  let noticeTitle = 'Notice';
  let noticeDescription = '';
  let noticePubDate = new Date().toISOString();

  try {
    const notice = await appClient.entities.Notice.get(id);
    if (notice && notice.is_active && notice.status !== 'draft') {
      noticeTitle = notice.title;
      if (notice.description) {
        noticeDescription = notice.description.replace(/[#*`_~]/g, '').substring(0, 150) + '...';
      }
      if (notice.publish_date || notice.created_at) {
        noticePubDate = notice.publish_date || notice.created_at;
      }
    }
  } catch (err) {
    console.error("Error fetching notice for structured data:", err);
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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `Notice Details`,
        "item": `https://rahmaniainstitute.org/notice/${id}`
      }
    ]
  };

  const articleJson = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": noticeTitle,
    "description": noticeDescription || noticeTitle,
    "datePublished": noticePubDate,
    "author": {
      "@type": "Organization",
      "name": "Rahmania Institute",
      "url": "https://rahmaniainstitute.org"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Rahmania Institute",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rahmaniainstitute.org/rahmania-logo-v2.png"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJson) }}
      />
      <NoticeDetailsClient />
    </>
  )
}
