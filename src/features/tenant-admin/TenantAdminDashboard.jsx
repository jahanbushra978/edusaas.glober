'use client'

import React, { useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/AuthContext"
import { useQuery } from "@tanstack/react-query"
import { LogOut, School, Settings, Palette, Globe, Users, BookOpen, Bell, DollarSign, Image, LayoutDashboard, FileText, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const lazyPanel = (loader) => dynamic(loader, {
  loading: () => <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />,
  ssr: false,
})

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "teachers", label: "Teachers", icon: BookOpen },
  { id: "notices", label: "Notices", icon: Bell },
  { id: "fees", label: "Fees", icon: DollarSign },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "website", label: "Website Builder", icon: Globe },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "pages", label: "Page Builder", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
]

export default function TenantAdminDashboard({ org }) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuth()
  const router = useRouter()

  const { data: whiteLabel } = useQuery({
    queryKey: ["white-label", org?.id],
    queryFn: async () => {
      const { supabase } = await import("@/lib/supabase")
      const { data } = await supabase
        .from("white_label_configs")
        .select("*")
        .eq("organization_id", org.id)
        .maybeSingle()
      return data
    },
    enabled: !!org?.id,
  })

  const branding = whiteLabel?.branding_json || {}
  const themeColors = whiteLabel?.theme_colors_json || {}
  const primaryColor = themeColors?.primary || "#0f766e"
  const schoolName = branding?.institute_name || org?.name || "School"
  const logoUrl = branding?.logo_url || org?.logo_url || null

  const handleLogout = async () => {
    await logout(false)
    router.push(`/AdminDashboard?slug=${org.slug}`)
  }

  const WebsiteBuilderPanel = lazyPanel(() => import("@/features/tenant-admin/WebsiteBuilderPanel"))

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview org={org} schoolName={schoolName} logoUrl={logoUrl} primaryColor={primaryColor} />
      case "website":
        return <WebsiteBuilderPanel org={org} />
      case "branding":
        return <BrandingPanel org={org} whiteLabel={whiteLabel} />
      default:
        return (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <p>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} module coming soon</p>
          </div>
        )
    }
  }

  return (
    <div className="h-[100dvh] flex bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <aside className="w-64 shrink-0 bg-slate-900 text-slate-100 flex flex-col">
          <div className="px-4 py-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt={schoolName} className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: primaryColor }}>
                  {schoolName.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{schoolName}</p>
                <p className="text-[10px] text-slate-400">Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-teal-600/20 text-teal-300"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          <div className="px-3 py-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 text-xs text-slate-500">
              <School size={14} />
              <span className="truncate">{org?.slug}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Admin</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-medium capitalize">{activeTab}</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <School size={14} />
            <span>{schoolName}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

function DashboardOverview({ org, schoolName, logoUrl, primaryColor }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img src={logoUrl} alt={schoolName} className="h-16 w-16 rounded-xl object-cover border-2 border-white/30" />
          ) : (
            <div className="h-16 w-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl bg-white/20">
              {schoolName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{schoolName}</h1>
            <p className="text-sm opacity-80">Welcome to your school admin panel</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">Students</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-slate-800">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">Teachers</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-slate-800">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">Notices</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-slate-800">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">Branches</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-slate-800">--</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid sm:grid-cols-3 gap-3">
          <Button variant="outline" className="justify-start gap-2 h-auto py-3">
            <Users size={16} /> Add Student
          </Button>
          <Button variant="outline" className="justify-start gap-2 h-auto py-3">
            <Bell size={16} /> Post Notice
          </Button>
          <Button variant="outline" className="justify-start gap-2 h-auto py-3">
            <Globe size={16} /> Edit Website
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function BrandingPanel({ org, whiteLabel }) {
  const branding = whiteLabel?.branding_json || {}
  const themeColors = whiteLabel?.theme_colors_json || {}
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Branding Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Customize your school&apos;s name, logo, and colors</p>
      </div>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Current Branding</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">School Name</label>
              <p className="text-sm font-semibold text-slate-800">{branding?.institute_name || org?.name || "Not set"}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Primary Color</label>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: themeColors?.primary || "#0f766e" }} />
                <span className="text-sm text-slate-700">{themeColors?.primary || "#0f766e"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400">Use the Website Builder tab to customize your school website with sections.</p>
    </div>
  )
}
