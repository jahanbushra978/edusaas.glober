'use client'

import dynamic from 'next/dynamic'
import { SectionSkeleton } from '@/shared/components/progressive/ProgressiveSection'

const TeacherProfile = dynamic(() => import('@/lib/TeacherProfile'), {
  loading: () => <SectionSkeleton minHeight={560} />,
  ssr: false,
})

export default TeacherProfile
