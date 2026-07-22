'use client'

import React, { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { appClient } from "@/api/appClient";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { Lock, Eye, EyeOff, AlertCircle, ShieldCheck, Loader2 } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPageUrl } from "@/utils";
import Logo from "@/components/home/Logo";
import TurnstileWidget from "@/shared/components/ui-custom/TurnstileWidget";

export default function AdminLogin() {

  const [adminId, setAdminId] = useState("");

  const [password, setPassword] = useState("");

  const [showPass, setShowPass] = useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [turnstileToken, setTurnstileToken] = useState("");

  const turnstileRef = React.useRef(null);

  const router = useRouter();

  useEffect(() => {
    appClient.auth.me().then((user) => {
      if (user.role === "admin" || user.role === "branch_admin" || user.role === "boarding_manager") {
        window.location.href = "/admin";
      }
    }).catch(() => {});
  }, [router]);



  const { data: settings = [] } = useQuery({

    queryKey: ["app-settings-public"],

    queryFn: () => appClient.entities.AppSettings.list(),

  });

  const getSetting = (key) => (Array.isArray(settings) ? settings : []).find(s => s.key === key)?.value;

  const instNameEn = getSetting("institute_name_en") || "Rahmania Institute (রহমানিয়া ইনস্টিটিউট)";




  const handleLogin = (e) => {

    e.preventDefault();

    setLoading(true);

    setTimeout(() => {

      appClient.auth.portalLogin("admin", adminId || "MAIN", password, turnstileToken)
        .then(() => {
          window.location.href = "/admin";
        })
        .catch((err) => {
          setError(err.message || "Incorrect password. Please try again.");
          setPassword("");
          setTurnstileToken("");
          turnstileRef.current?.reset();
        })
        .finally(() => {
          setLoading(false);
        });
    }, 200);

  };



  return (

    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-4 sm:py-6 relative"
      style={{ background: "linear-gradient(160deg,#0a0500 0%,#140a00 40%,#0a0500 100%)" }}>



      <svg className="fixed inset-0 w-full h-full opacity-[0.04] pointer-events-none">

        <defs><pattern id="ap" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">

          <path d="M30 0L60 15V45L30 60L0 45V15Z" fill="none" stroke="#D4AF37" strokeWidth="0.6"/>

        </pattern></defs>

        <rect width="100%" height="100%" fill="url(#ap)"/>

      </svg>



      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center mb-3">

            <div className="relative">

              <div className="absolute inset-0 rounded-full blur-2xl opacity-35" style={{ background: "rgba(212,175,55,0.5)" }} />

              <div className="relative w-20 h-20 rounded-full p-1.5" style={{ background: "white", boxShadow: "0 0 0 2px rgba(212,175,55,0.40), 0 8px 30px rgba(0,0,0,0.5)" }}>

                <Logo className="w-full h-full rounded-full object-contain" />

              </div>

            </div>

          </div>

          <h1 className="text-2xl font-extrabold italic text-white mb-1">{instNameEn}</h1>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold italic mt-2"

            style={{ background: "rgba(212,175,55,0.10)", border: "1px solid rgba(212,175,55,0.40)", color: "#D4AF37" }}>

            <ShieldCheck className="h-3.5 w-3.5" /> Admin Portal

          </div>

        </div>



        <div className="rounded-2xl overflow-hidden admin-login-card" style={{ background: "rgba(12,7,0,0.94)", border: "1px solid rgba(160,100,0,0.30)", boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02) inset" }}>

          <div className="px-6 py-4 flex items-center gap-3" style={{ background: "linear-gradient(135deg,#3d1500,#6b2500)", borderBottom: "1px solid rgba(160,80,0,0.25)" }}>

            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.30)" }}>

              <ShieldCheck className="h-4 w-4" style={{ color: "#D4AF37" }} />

            </div>

            <div>

              <p className="font-bold italic text-white text-sm">Admin Secure Access</p>

              <p className="text-white/45 text-xs italic">Authorized personnel only</p>

            </div>

          </div>



          <form onSubmit={handleLogin} className="p-5 sm:p-6 space-y-4">
            <div className="p-3 rounded-xl text-xs italic text-center"

              style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.20)", color: "#D4AF37" }}>

              Admin Portal — Restricted Access

            </div>



            <div className="mb-4">

              <label className="text-xs font-bold italic mb-2 block" style={{ color: "#fbbf24" }}>Admin ID</label>

              <Input type="text" value={adminId}

                onChange={e => { setAdminId(e.target.value); setError(""); }}

                placeholder="Admin ID (e.g. MAIN)"

                className="h-12 text-sm border-white/10 text-white placeholder:text-white/25 focus:border-yellow-500 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}

                autoFocus />

            </div>

            <div>

              <label className="text-xs font-bold italic mb-2 block" style={{ color: "#fbbf24" }}>Admin Password</label>

              <div className="relative">

                <Input type={showPass ? "text" : "password"} value={password}

                  onChange={e => { setPassword(e.target.value); setError(""); }}

                  placeholder="Enter admin password"

                  className="h-12 text-sm pr-11 border-white/10 text-white placeholder:text-white/25 focus:border-yellow-500 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}

                  autoComplete="current-password" />

                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"

                  onClick={() => setShowPass(!showPass)}>

                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}

                </button>

              </div>

            </div>



            {error && (

              <div className="flex items-start gap-2 p-3 rounded-xl text-xs italic"

                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)", color: "#f87171" }}>

                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /> {error}

              </div>

            )}

            <div className="flex justify-center">
              <TurnstileWidget ref={turnstileRef} onVerify={setTurnstileToken} onExpire={() => setTurnstileToken("")} />
            </div>

            <Button type="submit" disabled={loading} variant="gold" size="xl" className="w-full font-bold italic gap-2 btn-hover-lift">

              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}

              {loading ? "Verifying..." : "Enter Admin Panel"}

            </Button>

          </form>

        </div>



        <div className="text-center mt-4">
          <Link href={createPageUrl("Home")} className="text-xs italic text-white/30 hover:text-white/60 transition-colors">

            ← Back to Home

          </Link>

        </div>

      </div>

    </div>

  );

}
