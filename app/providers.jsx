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
const FaviconUpdater = dynamic(() => import('@/shared/components/ui-custom/FaviconUpdater'), { ssr: false })
const Toaster = dynamic(() => import('@/components/ui/toaster').then(m => ({ default: m.Toaster })), { ssr: false })
const SonnerToaster = dynamic(() => import('sonner').then(m => ({ default: m.Toaster })), { ssr: false })
const AIChatLauncher = dynamic(() => import('@/features/ai/components/AIChatLauncher'), { ssr: false })

// 🛡️ Safeguard against Google Chrome Translate / Browser Extensions crashing React DOM reconciliation
if (typeof window !== 'undefined' && typeof Node !== 'undefined' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}

export default function Providers({ children, initialLang = 'bn' }) {
  return (
    <LanguageProvider initialLang={initialLang}>
      <TenantProvider>
      <AuthProvider>
        <VisitorAuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Suspense fallback={null}>
              <NavigationTracker />
              <FaviconUpdater />
            </Suspense>
            {children}
            <Suspense fallback={null}>
              <Toaster />
              <SonnerToaster />
              <AIChatLauncher />
            </Suspense>
          </QueryClientProvider>
        </VisitorAuthProvider>
      </AuthProvider>
      </TenantProvider>
    </LanguageProvider>
  )
}

