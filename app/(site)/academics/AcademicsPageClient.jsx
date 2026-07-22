'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { SectionSkeleton } from '@/shared/components/progressive/ProgressiveSection'

const AcademicsPage = dynamic(() => import('@/lib/AcademicsPage'), {
  loading: () => <SectionSkeleton minHeight={560} />,
  ssr: true,
})

export default function AcademicsPageClient() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const isBn = lang === 'bn'

  const homeLabel = isBn ? 'হোম' : isAr ? 'الرئيسية' : 'Home'
  const pageLabel = isBn ? 'শিক্ষা কার্যক্রম' : isAr ? 'الأكاديمية' : 'Academics'

  return (
    <>
      <div className="bg-slate-100/50 dark:bg-[#070d0a] border-b border-slate-200/50 dark:border-green-950/20">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400" dir={isAr ? 'rtl' : 'ltr'}>
          <Link href="/" className="hover:text-[#12715B] dark:hover:text-green-400 transition-colors font-medium">{homeLabel}</Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-[#12715B] dark:text-green-400 font-semibold">{pageLabel}</span>
        </div>
      </div>
      <AcademicsPage />
    </>
  )
}
