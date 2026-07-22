'use client'

import dynamic from 'next/dynamic'

const PageNotFound = dynamic(() => import('@/lib/PageNotFound'), {
  loading: () => <div className="min-h-screen animate-pulse bg-slate-50" />,
  ssr: false,
})

export default PageNotFound
