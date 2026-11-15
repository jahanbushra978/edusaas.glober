"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Building2, Server, ShieldCheck, Cpu, 
  Fingerprint, Smartphone, Database, 
  ArrowRight, Award, Cloud
} from "lucide-react";
import SaaSFooter from "./SaaSFooter";
import ContactMessageModal from "./ContactMessageModal";
import WebsiteOnboardingModal from "./WebsiteOnboardingModal";

export default function EdusaasFacilitiesView() {
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [isWebsiteFormOpen, setIsWebsiteFormOpen] = useState(false);

  const capabilities = [
    {
      icon: Cloud,
      title: "আধুনিক ক্লাউড নির্ভর আর্কিটেকচার",
      desc: "Next.js 16 App Router ও Supabase পরিচালিত ক্লাউড আর্কিটেকচার। সার্ভার-সাইড রেন্ডারিং এবং অপ্টিমাইজড ডেটাবেস ক্যাশিংয়ের মাধ্যমে যেকোনো ডিভাইসে দ্রুততম পেজ লোড নিশ্চিত করে।",
      tags: ["Next.js 16", "Cloud Architecture", "SSR & CDN"],
    },
    {
      icon: ShieldCheck,
      title: "জিরো-ট্রাস্ট মাল্টি-টেন্যান্ট আইসোলেশন",
      desc: "প্রতিটি প্রতিষ্ঠানের জন্য আলাদা ভার্চুয়াল ডেটাবেস স্পেস। Row-Level Security (RLS) ও ক্রিপ্টোগ্রাফিক সেশন ভ্যালিডেশনের মাধ্যমে ক্রস-টেন্যান্ট তথ্য ফাঁস শতভাগ অসম্ভব।",
      tags: ["Row-Level Security", "Tenant Isolation", "Audit Logs"],
    },
    {
      icon: Fingerprint,
      title: "হার্ডওয়্যার আইওটি বায়োমেট্রিক গেটওয়ে",
      desc: "ZKTeco, Realand ও Hikvision ডিভাইসের সাথে সরাসরি কানেক্টেড Biometric Bridge Daemon। লোকাল ল্যান থেকে ক্লাউড সার্ভারে মাত্র ৩ সেকেন্ডে উপস্থিতি সিঙ্ক।",
      tags: ["IoT Daemon", "Realtime Sync", "Auto SMS"],
    },
    {
      icon: Cpu,
      title: "ভয়েস-ফার্স্ট এআই কুরআন টিচিং ইঞ্জিন",
      desc: "স্বত্বাধিকারী 'নূর' এআই সিস্টেম—যা খাঁটি বাংলা নিউরাল ভয়েস সিন্থেসিস ও সরাসরি মুখের তিলাওয়াত শুনে মাখরাজ ও তাজবীদের ১৭টি মাকাম নিখুঁতভাবে সংশোধন করে।",
      tags: ["Neural TTS", "Speech Recognition", "17 Makharij"],
    },
    {
      icon: Smartphone,
      title: "প্রগ্রেসিভ ওয়েব অ্যাপ (PWA) ও অফলাইন রেডি",
      desc: "মোবাইল, ট্যাবলেট বা পিসিতে অ্যাপের মতো এক ক্লিকে ইনস্টলযোগ্য। দুর্বল ইন্টারনেটেও নির্বিঘ্নে শিক্ষক ও অভিভাবকদের পোর্টাল ব্যবহারের সুবিধা।",
      tags: ["PWA Installable", "Offline Cache", "Responsive"],
    },
    {
      icon: Database,
      title: "এন্টারপ্রাইজ ডেটা আইসোলেশন ও অডিট লগ",
      desc: "প্রতিটি প্রতিষ্ঠানের সংবেদনশীল তথ্যের জন্য কঠোর ডেটাবেস অ্যাক্সেস নিয়ন্ত্রণ। প্ল্যাটফর্ম অডিট লগ ও সিকিউরিটি ইভেন্ট ট্র্যাকিংয়ের মাধ্যমে প্রতিষ্ঠানের ডেটা থাকে সুসংহত।",
      tags: ["Data Isolation", "Audit Logs", "RLS Security"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF8] dark:bg-[#07130e] text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      {/* ── TOP HEADER / BREADCRUMB ── */}
      <header className="border-b border-emerald-900/10 dark:border-emerald-800/40 bg-white/95 dark:bg-[#091a14]/95 backdrop-blur-md px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#052E2B] to-emerald-700 flex items-center justify-center border border-[#D4AF37]/40 shadow-sm">
              <Building2 className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="font-black text-slate-900 dark:text-white text-base font-serif">
                EduSaaS<span className="text-[#D4AF37]">.global</span>
              </span>
              <p className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider">
                Smart Education Platform
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4 text-xs font-bold">
            <Link href="/" className="text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
              হোম
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-emerald-800 dark:text-emerald-400">সুযোগ-সুবিধা ও প্রযুক্তি</span>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 bg-gradient-to-b from-white via-emerald-50/20 to-[#F8FAF8] dark:from-[#091a14] dark:to-[#07130e] border-b border-emerald-900/10 dark:border-emerald-800/30 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
            <Server className="w-4 h-4 text-[#D4AF37]" />
            ক্লাউড সক্ষমতা ও প্রযুক্তিগত অবকাঠামো
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-serif">
            বিশ্বমানের শিক্ষা প্রযুক্তি ও অবকাঠামো সুবিধা
          </h1>
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-2xl mx-auto">
            EduSaaS শুধুমাত্র একটি সফটওয়্যার নয়; এটি শিক্ষা প্রতিষ্ঠান পরিচালনার জন্য সবচেয়ে আধুনিক, নিরাপদ ও দ্রুতগতির ডিজিটাল ক্লাউড অবকাঠামো।
          </p>
        </div>
      </section>

      {/* ── CAPABILITIES GRID ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto py-16 px-4 sm:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {capabilities.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#091a14] p-7 rounded-3xl border border-slate-200 dark:border-emerald-900/40 shadow-xs hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#052E2B] to-emerald-700 text-white flex items-center justify-center border border-[#D4AF37]/30 shadow-sm">
                    <Icon className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {c.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {c.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5">
                  {c.tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── CTA BANNER ── */}
        <div className="bg-gradient-to-br from-[#052E2B] via-emerald-900 to-[#031d1b] rounded-3xl p-8 sm:p-12 text-white text-center space-y-5 border border-[#D4AF37]/30 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-[#D4AF37] border border-[#D4AF37]/40">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#D4AF37]">
            আপনার প্রতিষ্ঠানে এই আধুনিক সুবিধাগুলো যুক্ত করতে চান?
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto leading-relaxed">
            কোনো ইন্সটলেশন ফি ছাড়াই আজই যুক্ত হোন EduSaaS প্ল্যাটফর্মে। আমাদের টেকনিক্যাল টিম মাত্র ১ দিনের মধ্যে আপনার পুরো সিস্টেম সেটআপ করে দেবে।
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsWebsiteFormOpen(true)}
              className="px-6 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#c29d2f] text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>অনবোর্ডিং শুরু করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/platform-console/organizations/new"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all"
            >
              সরাসরি রেজিস্ট্রেশন
            </Link>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <SaaSFooter />

      {/* ── MODALS ── */}
      {isMsgModalOpen && <ContactMessageModal onClose={() => setIsMsgModalOpen(false)} />}
      {isWebsiteFormOpen && <WebsiteOnboardingModal onClose={() => setIsWebsiteFormOpen(false)} />}
    </div>
  );
}
