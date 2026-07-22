'use client'

import dynamic from 'next/dynamic'
import { SectionSkeleton } from '@/shared/components/progressive/ProgressiveSection'

const TeacherLogin = dynamic(() => import('@/lib/TeacherLogin'), {
  loading: () => <SectionSkeleton minHeight={520} />,
  ssr: false,
})

export default TeacherLogin
