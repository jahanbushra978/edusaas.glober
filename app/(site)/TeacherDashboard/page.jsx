'use client'

import dynamic from 'next/dynamic'
import { SectionSkeleton } from '@/shared/components/progressive/ProgressiveSection'

const TeacherDashboard = dynamic(() => import('@/lib/TeacherDashboard'), {
  loading: () => <SectionSkeleton minHeight={640} />,
  ssr: false,
})

export default TeacherDashboard
