'use client'

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { appClient } from "@/api/appClient"
import { useTenant } from "@/lib/tenant/ClientTenantContext"
import { SectionSkeleton } from "@/shared/components/progressive/ProgressiveSection"

const TenantAdminDashboard = dynamic(() => import("@/features/site/pages/AdminDashboard"), {
  loading: () => <SectionSkeleton minHeight={720} />,
  ssr: false,
})

const TenantAdminLogin = dynamic(() => import("@/features/tenant-admin/TenantAdminLogin"), {
  loading: () => <SectionSkeleton minHeight={520} />,
  ssr: false,
})

export default function AdminDashboardEntryPage() {
  const [state, setState] = useState("loading")
  const searchParams = useSearchParams()
  const router = useRouter()
  const { org, loading: orgLoading } = useTenant()

  const slug = searchParams?.get("slug")

  useEffect(() => {
    if (orgLoading) return
    if (!slug) {
      router.replace("/")
      return
    }
    setState("login")
  }, [slug, orgLoading, router])

  useEffect(() => {
    if (state !== "login" || !slug) return
    let active = true
    appClient.auth
      .me()
      .then((user) => {
        if (!active) return
        if (user.role === "admin" || user.role === "branch_admin" || user.role === "boarding_manager") {
          setState("dashboard")
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [state, slug])

  if (state === "loading" || orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (!org) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Organization Not Found</h1>
          <p className="text-slate-500 mt-2">Invalid or unknown school. Please check the URL.</p>
        </div>
      </div>
    )
  }

  return state === "dashboard" ? <TenantAdminDashboard org={org} /> : <TenantAdminLogin org={org} />
}
