'use client'

import dynamic from 'next/dynamic'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { AuthProvider } from '@/lib/AuthContext'
import { LanguageProvider } from '@/lib/LanguageContext'
import { VisitorAuthProvider } from '@/lib/VisitorAuthContext'

const NavigationTracker = dynamic(() => import('@/lib/NavigationTracker'), { ssr: false })
const Toaster = dynamic(() => import('@/components/ui/toaster').then(m => ({ default: m.Toaster })), { ssr: false })
const SonnerToaster = dynamic(() => import('sonner').then(m => ({ default: m.Toaster })), { ssr: false })

/**
 * Providers wraps the entire app with global context providers.
 *
 * `initialLang` is passed from the Server Component (layout.jsx) after
 * reading the `ri_lang` cookie.  Forwarding it to LanguageProvider ensures
 * the first server render and first client render use the same language,
 * preventing React hydration error #418.
 */
export default function Providers({ children, initialLang = 'bn' }) {
  return (
    <LanguageProvider initialLang={initialLang}>
      <AuthProvider>
        <VisitorAuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <NavigationTracker />
            {children}
            <Toaster />
            <SonnerToaster />
          </QueryClientProvider>
        </VisitorAuthProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}
