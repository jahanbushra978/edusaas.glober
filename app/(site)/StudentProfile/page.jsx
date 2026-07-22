'use client'

import dynamic from 'next/dynamic'
import { SectionSkeleton } from '@/shared/components/progressive/ProgressiveSection'

const StudentProfile = dynamic(() => import('@/lib/StudentProfile'), {
  loading: () => <SectionSkeleton minHeight={560} />,
  ssr: false,
})

export default StudentProfile
