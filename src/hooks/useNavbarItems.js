'use client'

import { useQuery } from '@tanstack/react-query'
import { appClient } from '@/api/appClient'
import { useLanguage } from '@/lib/LanguageContext'
import { useTranslation } from '@/lib/translations'
import { createPageUrl } from '@/utils'
import { Shield, UserCheck, GraduationCap } from 'lucide-react'

const FALLBACK_MENU = (t) => [
  { label: t.nav.home, to: "/" },
  {
    label: t.nav.about,
    subItems: [
      { label: t.nav.introduction, to: "/about" },
      { label: t.nav.mission, to: "/mission" },
      { label: "FAQ", to: "/faq" },
    ]
  },
  {
    label: t.nav.campus,
    subItems: [
      { label: t.nav.branches, to: "/campus" },
      { label: t.nav.facilities, to: "/facilities" },
    ]
  },
  {
    label: t.nav.academic,
    subItems: [
      { label: t.nav.departments, to: "/academics" },
      { label: t.nav.results, to: "/results" },
    ]
  },
  {
    label: t.nav.admission,
    subItems: [
      { label: t.nav.onlineForm, to: "/admission-form" },
      { label: t.nav.admissionInfo, to: "/admission" },
    ]
  },
  {
    label: t.nav.gallery,
    subItems: [
      { label: t.nav.photoGallery, to: "/gallery" },
      { label: t.nav.videoGallery, to: "/video-gallery" },
    ]
  },
  {
    label: "নূর AI শিক্ষক",
    to: "/quran-tutor",
    subItems: [
      { label: "🌸 নূর এআই শিক্ষক পাঠশালা", to: "/quran-tutor/teacher" },
      { label: "🎯 এআই কোরআন শিক্ষা (Duolingo)", to: "/ai-quran-learning" },
      { label: "🎙️ লাইভ ভয়েস ক্লাসরুম", to: "/quran-tutor/live-class" },
      { label: "📖 সম্পূর্ণ কুরআন", to: "/quran-tutor/studio?tab=reader" },
      { label: "🎛️ নূর লার্নিং স্টুডিও", to: "/quran-tutor/studio" },
    ]
  },
]

function resolveLabel(label, lang) {
  if (!label) return ''
  try {
    const parsed = JSON.parse(label)
    if (parsed && typeof parsed === 'object') {
      return parsed[lang] || parsed.en || parsed.bn || ''
    }
  } catch {}
  return label
}

function buildFromDb(items, lang) {
  return items
    .filter(item => item.is_active !== false)
    .map(item => {
      const label = resolveLabel(item.label, lang)
      if (item.is_dropdown && item.dropdown_items?.length > 0) {
        const activeChildren = item.dropdown_items.filter(
          sub => sub.is_active !== false
        )
        if (activeChildren.length === 0) return null
        return {
          label,
          to: item.route ? createPageUrl(item.route) : '/',
          subItems: activeChildren.map(sub => ({
            label: sub.label,
            to: sub.route ? createPageUrl(sub.route) : '/',
          })),
        }
      }
      return { label, to: item.route ? createPageUrl(item.route) : '/' }
    })
    .filter(Boolean)
}

function buildPanelItem(user) {
  const subItems = []
  if (user?.role === 'admin') {
    subItems.push({ label: 'Admin', to: '/admin', icon: Shield })
  }
  subItems.push({ label: 'Teacher', to: '/TeacherLogin', icon: UserCheck })
  subItems.push({ label: 'Student', to: '/StudentLogin', icon: GraduationCap })
  return { label: 'Panel', subItems }
}

export function useNavbarItems(user) {
  const { lang } = useLanguage()
  const t = useTranslation(lang)

  const { data: dbItems = [] } = useQuery({
    queryKey: ['navbar-items-public'],
    queryFn: () => appClient.entities.NavbarItem.list('sort_order', 100),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const baseItems =
    dbItems.length > 0 ? buildFromDb(dbItems, lang) : FALLBACK_MENU(t)

  const hasNur = baseItems.some(item => item.to === '/quran-tutor' || (typeof item.label === 'string' && item.label.includes('নূর')))
  const finalBase = hasNur ? baseItems : [...baseItems, { label: "নূর AI শিক্ষক", to: "/quran-tutor" }]

  return [...finalBase, buildPanelItem(user)]
}
