'use client'

import dynamic from 'next/dynamic'

const LiveAttendancePage = dynamic(() => import('@/features/site/pages/LiveAttendancePage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#031A12] flex items-center justify-center text-emerald-400 font-bold">
      লোড হচ্ছে...
    </div>
  ),
})

export default LiveAttendancePage
