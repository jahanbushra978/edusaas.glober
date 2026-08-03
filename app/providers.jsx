'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { AuthProvider } from '@/lib/AuthContext'
import { LanguageProvider } from '@/lib/LanguageContext'
import { VisitorAuthProvider } from '@/lib/VisitorAuthContext'
import { TenantProvider } from '@/lib/tenant/ClientTenantContext'

const NavigationTracker = dynamic(() => import('@/lib/NavigationTracker'), { ssr: false })
const Toaster = dynamic(() => import('@/components/ui/toaster').then(m => ({ default: m.Toaster })), { ssr: false })
const SonnerToaster = dynamic(() => import('sonner').then(m => ({ default: m.Toaster })), { ssr: false })

export default function Providers({ children, initialLang = 'bn' }) {
  return (
    <LanguageProvider initialLang={initialLang}>
      <TenantProvider>
      <AuthProvider>
        <VisitorAuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Suspense fallback={null}>
              <NavigationTracker />
            </Suspense>
            {children}
            <Suspense fallback={null}>
              <Toaster />
              <SonnerToaster />
            </Suspense>
          </QueryClientProvider>
        </VisitorAuthProvider>
      </AuthProvider>
      </TenantProvider>
    </LanguageProvider>
  )
}
