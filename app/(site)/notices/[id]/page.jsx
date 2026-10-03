'use client'

import dynamic from 'next/dynamic'
import { SectionSkeleton } from '@/shared/components/progressive/ProgressiveSection'

const NoticeDetailsPage = dynamic(() => import('@/features/site/pages/NoticeDetailsPage'), {
  loading: () => <SectionSkeleton minHeight={560} />,
  ssr: false,
})

export default NoticeDetailsPage
