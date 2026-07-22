import React, { useState } from "react";

import { appClient } from "@/api/appClient";

import { useQuery, useMutation } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { UserCheck, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

import Link from "next/link";
import { createPageUrl } from "@/utils";
import Logo from "@/components/home/Logo";
import TurnstileWidget from "@/shared/components/ui-custom/TurnstileWidget";





export default function TeacherLogin() {

  const [teacherId, setTeacherId] = useState("");

  const [password, setPassword] = useState("");

  const [showPass, setShowPass] = useState(false);

  const [error, setError] = useState("");

  const [turnstileToken, setTurnstileToken] = useState("");

  const turnstileRef = React.useRef(null);



  const { data: settings = [] } = useQuery({

    queryKey: ["app-settings-public"],

    queryFn: () => appClient.entities.AppSettings.list(),

  });

  const getSetting = (key) => (Array.isArray(settings) ? settings : []).find(s => s.key === key)?.value;

  const instNameEn = getSetting("institute_name_en") || "Rahmania Institute (রহমানিয়া ইনস্টিটিউট)";




  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!teacherId.trim() || !password.trim()) {
        throw new Error("Please enter your Teacher ID and Password.");
      }
      const result = await appClient.auth.portalLogin("teacher", teacherId.trim(), password, turnstileToken);
      if (!result.profile) {
        throw new Error("Teacher profile not found.");
      }
      return result.profile;
    },
    onSuccess: (teacher) => {
      window.location.href = createPageUrl("TeacherDashboard");
    },
    onError: (err) => {
      setError(err.message);
      setTurnstileToken("");
      turnstileRef.current?.reset();
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate();
  };






  return (

    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative"

      style={{ background: "linear-gradient(160deg,#030c14 0%,#071520 40%,#030c14 100%)" }}>



      <svg className="fixed inset-0 w-full h-full opacity-[0.04] pointer-events-none">

        <defs><pattern id="tp" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">

          <path d="M30 0L60 15V45L30 60L0 45V15Z" fill="none" stroke="#D4AF37" strokeWidth="0.6"/>

        </pattern></defs>

        <rect width="100%" height="100%" fill="url(#tp)"/>

      </svg>



      <div className="w-full max-w-md relative z-10">

        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center mb-5">

            <div className="relative">

              <div className="absolute inset-0 rounded-full blur-2xl opacity-30" style={{ background: "rgba(96,165,250,0.5)" }} />

              <div className="relative w-20 h-20 rounded-full p-1.5" style={{ background: "white", boxShadow: "0 0 0 2px rgba(96,165,250,0.35), 0 8px 30px rgba(0,0,0,0.4)" }}>

                <Logo className="w-full h-full rounded-full object-contain" />

              </div>

            </div>

          </div>

          <h1 className="text-2xl font-extrabold italic text-white mb-1">{instNameEn}</h1>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold italic mt-2"

            style={{ background: "rgba(96,165,250,0.10)", border: "1px solid rgba(96,165,250,0.35)", color: "#60a5fa" }}>

            <UserCheck className="h-3.5 w-3.5" /> Teacher Portal Login

          </div>

        </div>



        <div className="rounded-2xl overflow-hidden teacher-login-card" style={{ background: "rgba(5,12,22,0.92)", border: "1px solid rgba(30,80,160,0.30)", boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset" }}>

          <div className="px-6 py-4 flex items-center gap-3" style={{ background: "linear-gradient(135deg,#0a2040,#0d3060)", borderBottom: "1px solid rgba(30,80,160,0.25)" }}>

            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.30)" }}>

              <UserCheck className="h-4 w-4" style={{ color: "#60a5fa" }} />

            </div>

            <div>

              <p className="font-bold italic text-white text-sm">👨‍🏫 Teacher Login</p>

              <p className="text-white/50 text-xs italic">Enter your credentials to access your portal</p>

            </div>

          </div>



          <div className="p-7 space-y-5">

            <div>

              <label className="text-xs font-bold italic mb-2 block" style={{ color: "#60a5fa" }}>Teacher ID</label>

              <Input value={teacherId} onChange={e => { setTeacherId(e.target.value); setError(""); }}

                placeholder="e.g. T101"

                className="h-12 text-sm font-mono border-white/10 text-white placeholder:text-white/25 focus:border-blue-500 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}

                autoComplete="username" />

            </div>

            <div>

              <label className="text-xs font-bold italic mb-2 block" style={{ color: "#60a5fa" }}>Password</label>

              <div className="relative">

                <Input type={showPass ? "text" : "password"} value={password}

                  onChange={e => { setPassword(e.target.value); setError(""); }}

                  placeholder="Enter your password"

                  className="h-12 text-sm pr-11 border-white/10 text-white placeholder:text-white/25 focus:border-blue-500 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
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

            <Button onClick={handleLogin} disabled={loginMutation.isPending} className="w-full h-12 font-bold italic text-white text-sm gap-2 rounded-xl"

              style={{ background: "linear-gradient(135deg,#0a2d6e,#1a52b0)", boxShadow: "0 4px 20px rgba(30,80,200,0.35)" }}>

              {loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}

              {loginMutation.isPending ? "Signing in..." : "Sign In"}

            </Button>



            <p className="text-center text-xs italic text-white/30">

              Forgot your password? Contact the administrator.

            </p>

          </div>

        </div>



        <div className="text-center mt-6">

          <Link href={createPageUrl("Home")} className="text-xs italic text-white/30 hover:text-white/60 transition-colors">

            ← Back to Home

          </Link>

        </div>

      </div>

    </div>

  );

}

