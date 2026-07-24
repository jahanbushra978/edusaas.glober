'use client'

import { lazy, Suspense } from 'react'
import Layout from '../Layout.jsx'
import { useAuth } from '@/lib/AuthContext'

const UserNotRegisteredError = lazy(() => import('@/shared/components/ui-custom/UserNotRegisteredError'))

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
  </div>
)

export default function AuthenticatedChrome({ children }) {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth()

  if (isLoadingPublicSettings || isLoadingAuth) {
    return <PageLoader />
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return (
        <Suspense fallback={<PageLoader />}>
          <UserNotRegisteredError />
        </Suspense>
      )
    }
    if (authError.type === 'auth_required') {
      navigateToLogin()
      return null
    }
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Layout>{children}</Layout>
    </Suspense>
  )
}
