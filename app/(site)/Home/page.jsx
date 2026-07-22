'use client'

import dynamic from 'next/dynamic'
import { SectionSkeleton } from '@/shared/components/progressive/ProgressiveSection'

const Home = dynamic(() => import('@/lib/Home'), {
  loading: () => <SectionSkeleton minHeight={640} />,
  ssr: true,
})

export default Home
