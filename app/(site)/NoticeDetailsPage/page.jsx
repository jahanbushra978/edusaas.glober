'use client'

import dynamic from 'next/dynamic'
import { SectionSkeleton } from '@/shared/components/progressive/ProgressiveSection'

const NoticeDetailsPage = dynamic(() => import('@/lib/NoticeDetailsPage'), {
  loading: () => <SectionSkeleton minHeight={560} />,
  ssr: true,
})

export default NoticeDetailsPage
