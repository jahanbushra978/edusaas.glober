"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import ConsoleSidebar from "@/features/platform-console/components/ConsoleSidebar";
import ConsoleTopBar from "@/features/platform-console/components/ConsoleTopBar";
import { Loader2, Lock, ArrowLeft, PhoneCall, Mail, MessageSquare, MapPin, KeyRound } from "lucide-react";
import Link from "next/link";

/**
 * Platform Console Layout
 * Restricted route for Platform Owner only (Server-Verified Auth Boundary).
 * Independent of individual school or branch administrator credentials.
 */
export default function PlatformConsoleLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(null);
  const [owner, setOwner] = useState(null);

  const isLoginPage = pathname === "/platform-console/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthorized(true);
      return;
    }

    let isMounted = true;
    fetch("/api/platform/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data?.ok && data?.isPlatformOwner) {
          setOwner(data.owner);
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      })
      .catch(() => {
        if (isMounted) setAuthorized(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage]);

  // If rendering the login page itself, don't wrap with console layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 1. Loading state while verifying server session
  if (authorized === null) {
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Verifying Platform Owner Authorization...
        </p>
      </div>
    );
  }

  // 2. Restricted Access Card when not verified Platform Owner
  if (!authorized) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-slate-950 text-white p-4 sm:p-6">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="w-14 h-14 bg-amber-500/10 border border-[#D4AF37]/30 rounded-2xl flex items-center justify-center mx-auto text-[#D4AF37]">
            <Lock className="h-7 w-7" />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-black text-white font-serif">Platform Console Restricted</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              এই স্থানটি শুধুমাত্র সেন্ট্রাল প্ল্যাটফর্ম ওনারের জন্য সুরক্ষিত। সাধারণ স্কুল বা ব্রাঞ্চ অ্যাডমিনদের এখানে প্রবেশাধিকার নেই।
            </p>
          </div>

          {/* Contact Details Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider border-b border-slate-800 pb-2">
              যোগাযোগ ও সহায়তা তথ্য (Contact & Onboarding)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <a
                href="tel:+8801906898939"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/50 transition-all font-semibold"
              >
                <PhoneCall className="h-4 w-4 shrink-0 text-emerald-400" />
                <div className="min-w-0">
                  <span className="block text-[9px] text-slate-400 font-normal">হটলাইন কল</span>
                  <span className="font-mono text-xs">+880 1906-898939</span>
                </div>
              </a>

              <a
                href="https://wa.me/8801906898939"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-teal-950/40 border border-teal-800/40 text-teal-300 hover:bg-teal-900/50 transition-all font-semibold"
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-teal-400" />
                <div className="min-w-0">
                  <span className="block text-[9px] text-slate-400 font-normal">হোয়াটসঅ্যাপ (WhatsApp)</span>
                  <span className="font-mono text-xs">চ্যাট করুন</span>
                </div>
              </a>
            </div>

            <div className="space-y-1.5 pt-1 text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                <span className="truncate">rahmaniainstitute.org@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                <span>হাড়িনাল, গাজীপুর সিটি, ঢাকা</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <Link href="/platform-console/login" className="block w-full">
              <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:scale-[1.02] text-white font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2">
                <KeyRound className="h-4 w-4" />
                <span>প্ল্যাটফর্ম ওনার লগইন করুন</span>
              </button>
            </Link>
            <Link href="/" className="block w-full">
              <button className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>হোমপেজে ফিরে যান</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Render Platform Console when authorized as Platform Owner
  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      {/* Top Navigation Bar */}
      <ConsoleTopBar user={owner} />

      {/* Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <ConsoleSidebar currentUser={owner} />
        <main className="flex-1 overflow-y-auto w-full transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
