'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { SectionSkeleton } from '@/shared/components/progressive/ProgressiveSection'

const FaqsSection = dynamic(() => import('@/components/home/FaqsSection'), {
  loading: () => <SectionSkeleton minHeight={400} />,
  ssr: false,
})

export default function FaqPageClient() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const isBn = lang === 'bn'

  const homeLabel = isBn ? 'হোম' : isAr ? 'الرئيسية' : 'Home'
  const pageLabel = isBn ? 'সাধারণ জিজ্ঞাসা' : isAr ? 'الأسئلة الشائعة' : 'FAQ'

  return (
    <>
      <div className="bg-slate-100/50 border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs sm:text-sm text-slate-500" dir={isAr ? 'rtl' : 'ltr'}>
          <Link href="/" className="hover:text-[#12715B] transition-colors font-medium">{homeLabel}</Link>
          <span className="text-slate-300">/</span>
          <span className="text-[#12715B] font-semibold">{pageLabel}</span>
        </div>
      </div>
      <FaqsSection />
    </>
  )
}
