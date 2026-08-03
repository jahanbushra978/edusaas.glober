'use client'

import React, { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { appClient } from "@/api/appClient"

export default function TenantAdminLogin({ org }) {
  const [adminId, setAdminId] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    appClient.auth.me().then((user) => {
      if (user.role === "admin" || user.role === "branch_admin" || user.role === "boarding_manager") {
        window.location.href = `/AdminDashboard?slug=${org.slug}`
      }
    }).catch(() => {})
  }, [router, org.slug])

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    appClient.auth.portalLogin("admin", adminId || "MAIN", password, "")
      .then(() => {
        window.location.href = `/AdminDashboard?slug=${org.slug}`
      })
      .catch((err) => {
        setError(err.message || "Incorrect password. Please try again.")
        setPassword("")
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const orgInitial = org?.name?.charAt(0)?.toUpperCase() || "S"

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-4 sm:py-6 relative"
      style={{ background: "linear-gradient(160deg,#0a0500 0%,#140a00 40%,#0a0500 100%)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-20 w-20 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-lg mb-4">
            {org?.logo_url ? (
              <img src={org.logo_url} alt={org.name} className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              orgInitial
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">{org?.name || "School"}</h1>
          <p className="text-sm text-slate-400 mt-1">Admin Panel Login</p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 space-y-4 border border-slate-800">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Admin ID</label>
            <Input
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="MAIN"
              className="bg-slate-800 border-slate-700 text-white h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-slate-800 border-slate-700 text-white h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 bg-teal-600 hover:bg-teal-500 text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  )
}
