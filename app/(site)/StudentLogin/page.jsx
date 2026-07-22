'use client'

import dynamic from 'next/dynamic'
import { SectionSkeleton } from '@/shared/components/progressive/ProgressiveSection'

const StudentLogin = dynamic(() => import('@/lib/StudentLogin'), {
  loading: () => <SectionSkeleton minHeight={520} />,
  ssr: false,
})

export default StudentLogin
