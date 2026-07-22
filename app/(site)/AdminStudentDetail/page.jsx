'use client'

import dynamic from 'next/dynamic'
import { SectionSkeleton } from '@/shared/components/progressive/ProgressiveSection'

const AdminStudentDetail = dynamic(() => import('@/lib/AdminStudentDetail'), {
  loading: () => <SectionSkeleton minHeight={560} />,
  ssr: false,
})

export default AdminStudentDetail
