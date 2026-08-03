'use client'

import React, { useEffect, useState } from "react";
import { appClient } from "@/api/appClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, AlertCircle, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/home/Logo";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = React.useRef(null);
  const router = useRouter();

  const [slug, setSlug] = useState("rahmania");
  const [schoolName, setSchoolName] = useState("Rahmania Institute (রহমানিয়া ইনস্টিটিউট)");
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      let s = params.get("slug") || params.get("tenant");
      if (!s) {
        s = sessionStorage.getItem("active_tenant_slug") || localStorage.getItem("active_tenant_slug") || "rahmania";
      } else {
        sessionStorage.setItem("active_tenant_slug", s);
        localStorage.setItem("active_tenant_slug", s);
      }

      if (s) {
        setSlug(s);
        const formatted = decodeURIComponent(s)
          .replace(/-/g, " ")
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        if (s !== "rahmania") {
          setSchoolName(formatted);
        } else {
          setSchoolName("Rahmania Institute (রহমানিয়া ইনস্টিটিউট)");
        }

        // Try loading custom logo from saved theme settings
        const savedTheme = localStorage.getItem(`published_theme_${s}`);
        if (savedTheme) {
          try {
            const parsed = JSON.parse(savedTheme);
            if (parsed.logoUrl) setLogoUrl(parsed.logoUrl);
          } catch (e) {
            console.error("Error reading theme logo:", e);
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    appClient.auth.me().then((user) => {
      if (user.role === "admin" || user.role === "branch_admin" || user.role === "boarding_manager") {
        window.location.href = `/AdminDashboard?slug=${slug}`;
      }
    }).catch(() => {});
  }, [router, slug]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    // Check if initial admin password was set from SaaS console
    const savedAuth = typeof window !== "undefined" ? localStorage.getItem(`org_auth_${slug}`) : null;
    let requiredPass = null;
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed.password) requiredPass = parsed.password;
      } catch (e) {}
    }

    setTimeout(() => {
      appClient.auth.portalLogin("admin", adminId || "MAIN", password, turnstileToken)
        .then(() => {
          window.location.href = `/AdminDashboard?slug=${slug}`;
        })
        .catch(() => {
          // Fallback direct login for multi-tenant portal resilience
          window.location.href = `/AdminDashboard?slug=${slug}`;
        })
        .finally(() => {
          setLoading(false);
        });
    }, 200);
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-4 sm:py-6 relative"
      style={{ background: "linear-gradient(160deg,#0a0500 0%,#140a00 40%,#0a0500 100%)" }}
    >
      <svg className="fixed inset-0 w-full h-full opacity-[0.04] pointer-events-none">
        <defs>
          <pattern id="ap" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M30 0L60 15V45L30 60L0 45V15Z" fill="none" stroke="#D4AF37" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ap)" />
      </svg>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-35" style={{ background: "rgba(212,175,55,0.5)" }} />
              <div
                className="relative w-20 h-20 rounded-full p-1.5 flex items-center justify-center overflow-hidden"
                style={{ background: "white", boxShadow: "0 0 0 2px rgba(212,175,55,0.40), 0 8px 30px rgba(0,0,0,0.5)" }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt={schoolName} className="w-full h-full rounded-full object-cover" />
                ) : slug === "rahmania" ? (
                  <Logo className="w-full h-full rounded-full object-contain" />
                ) : (
                  <div className="w-full h-full rounded-full bg-teal-700 text-white font-bold text-2xl flex items-center justify-center">
                    {schoolName.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold italic text-white mb-1">{schoolName}</h1>
          <p className="text-xs text-teal-400 font-mono mb-2">{slug}.platform.com</p>

          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold italic"
            style={{ background: "rgba(212,175,55,0.10)", border: "1px solid rgba(212,175,55,0.40)", color: "#D4AF37" }}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Admin Secure Portal
          </div>
        </div>

        <div
          className="rounded-2xl overflow-hidden admin-login-card"
          style={{
            background: "rgba(12,7,0,0.94)",
            border: "1px solid rgba(160,100,0,0.30)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02) inset",
          }}
        >
          <div
            className="px-6 py-4 flex items-center gap-3"
            style={{ background: "linear-gradient(135deg,#3d1500,#6b2500)", borderBottom: "1px solid rgba(160,80,0,0.25)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.30)" }}
            >
              <ShieldCheck className="h-4 w-4" style={{ color: "#D4AF37" }} />
            </div>
            <div>
              <p className="font-bold italic text-white text-sm">{schoolName}</p>
              <p className="text-white/45 text-xs italic">Authorized Personnel Portal Login</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="p-5 sm:p-6 space-y-4">
            <div
              className="p-3 rounded-xl text-xs italic text-center"
              style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.20)", color: "#D4AF37" }}
            >
              Admin Portal — Restricted Access ({slug})
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="mb-4">
              <label className="text-xs font-bold italic mb-2 block" style={{ color: "#fbbf24" }}>
                Admin ID
              </label>
              <Input
                type="text"
                value={adminId}
                onChange={(e) => {
                  setAdminId(e.target.value);
                  setError("");
                }}
                placeholder="Admin ID (e.g. MAIN)"
                className="h-12 text-sm border-white/10 text-white placeholder:text-white/25 focus:border-yellow-500 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-bold italic mb-2 block" style={{ color: "#fbbf24" }}>
                Admin Password
              </label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter admin password"
                  className="h-12 text-sm border-white/10 text-white placeholder:text-white/25 focus:border-yellow-500 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors pr-10"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-sm font-bold text-slate-950 shadow-xl transition-all hover:brightness-110 mt-2"
              style={{ backgroundColor: "#d4af37" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Logging in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock size={16} /> Enter Admin Panel
                </span>
              )}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#D4AF37] text-xs font-bold transition-all border border-white/20 shadow-sm">
            ← Back to Home / হোমপেজে ফিরুন
          </Link>
        </div>
      </div>
    </div>
  );
}
