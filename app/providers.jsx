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

export default function Providers({ children }) {
  return (
    <LanguageProvider>
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
