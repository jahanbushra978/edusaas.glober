"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Building2, ShieldCheck, Users, Zap, 
  ArrowRight, Globe, Server,
  Award, BookOpen, Fingerprint, Trophy, Monitor
} from "lucide-react";
import SaaSFooter from "./SaaSFooter";
import ContactMessageModal from "./ContactMessageModal";
import WebsiteOnboardingModal from "./WebsiteOnboardingModal";

export default function EdusaasAboutView() {
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [isWebsiteFormOpen, setIsWebsiteFormOpen] = useState(false);

  const pillars = [
    {
      icon: Fingerprint,
      title: "বায়োমেট্রিক হাজিরা ও রিয়েলটাইম SMS",
      desc: "ফেস রিকগনিশন ও ফিঙ্গারপ্রিন্ট ডিভাইসের মাধ্যমে শিক্ষার্থী ও শিক্ষকদের উপস্থিতি ক্লাউডে তাৎক্ষণিক সিঙ্ক হয় এবং অভিভাবকের মোবাইলে বাংলা SMS পৌঁছায়।",
      badge: "IoT Bridge",
    },
    {
      icon: Trophy,
      title: "স্বয়ংক্রিয় গ্রেডিং ও রেজাল্ট ইঞ্জিন",
      desc: "নম্বর এন্ট্রি করলেই মুহূর্তের মধ্যে জিপিএ, লেটার গ্রেড, সেকশনভিত্তিক মেরিট পজিশন, প্রিন্ট-রেডি মার্কশিট ও QR কোডসহ এডমিট কার্ড তৈরি হয়।",
      badge: "Auto Grading",
    },
    {
      icon: Monitor,
      title: "নো-কোড ডায়নামিক ওয়েবসাইট বিল্ডার",
      desc: "কোনো কোডিং ছাড়াই প্রতিষ্ঠানের নিজস্ব ডোমেইনে আধুনিক, এসইও-ফ্রেন্ডলি ওয়েবসাইট তৈরি। নোটিশ, গ্যালারি, শিক্ষক তালিকা ও ভর্তি ফরম সরাসরি পরিচালনা।",
      badge: "No-Code CMS",
    },
    {
      icon: BookOpen,
      title: "নূর এআই কুরআন শিক্ষক ও তাজবীদ অ্যানালাইজার",
      desc: "স্বত্বাধিকারী ভয়েস এআই ইঞ্জিনের মাধ্যমে সরাসরি মুখে মুখে কুরআন ও তাজবীদ শিক্ষা। বিশুদ্ধ মাখরাজ বিশ্লেষণ ও ডুওলিঙ্গো-স্টাইল ইন্টারঅ্যাক্টিভ পাঠশালা।",
      badge: "Proprietary AI",
    },
    {
      icon: ShieldCheck,
      title: "শিক্ষার্থী ফি ও নির্ভুল অ্যাকাউন্টিং",
      desc: "মাসিক ফি, বকেয়া তালিকা, বেতন রসিদ, অনলাইন পেমেন্ট (bKash/Nagad) এবং প্রতিষ্ঠানের আয়-ব্যয়ের সম্পূর্ণ স্বয়ংক্রিয় ব্যালেন্স শিট।",
      badge: "Financial ERP",
    },
    {
      icon: Server,
      title: "মাল্টি-টেন্যান্ট ক্লাউড আইসোলেশন ও নিরাপত্তা",
      desc: "এন্টারপ্রাইজ-গ্রেড PostgreSQL Row-Level Security (RLS) ও জিরো-ট্রাস্ট আর্কিটেকচার। প্রতিটি প্রতিষ্ঠানের ডাটা সম্পূর্ণ আলাদা ও সর্বোচ্চ সুরক্ষিত।",
      badge: "Zero Trust",
    },
  ];

  const stats = [
    { number: "১,২০০+", label: "নিবন্ধিত প্রতিষ্ঠান", desc: "স্কুল, কলেজ ও মাদ্রাসা", icon: Building2 },
    { number: "১,৫০,০০০+", label: "সক্রিয় শিক্ষার্থী", desc: "দৈনন্দিন সফটওয়্যার ব্যবহারকারী", icon: Users },
    { number: "১০০%", label: "ক্লাউড পরিচালিত", desc: "কোনো লোকাল সার্ভার প্রয়োজন নেই", icon: ShieldCheck },
    { number: "২৪/৭", label: "নিবেদিত সাপোর্ট", desc: "সার্বক্ষণিক টেকনিক্যাল সহায়তা", icon: Zap },
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
            <span className="text-emerald-800 dark:text-emerald-400">আমাদের সম্পর্কে</span>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />
            <Link
              href="/platform-console/organizations/new"
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#052E2B] to-emerald-700 text-[#D4AF37] hover:text-white border border-[#D4AF37]/30 transition-all shadow-xs"
            >
              ফ্রি রেজিস্ট্রেশন
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-8 bg-gradient-to-b from-white via-emerald-50/30 to-[#F8FAF8] dark:from-[#091a14] dark:via-[#07130e] dark:to-[#040e0a] border-b border-emerald-900/10 dark:border-emerald-800/30 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            আমাদের পরিচিতি ও রূপকল্প
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-serif leading-tight">
            বাংলাদেশের শিক্ষা ব্যবস্থাপনায় <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-[#D4AF37] bg-clip-text text-transparent">
              সবচেয়ে নির্ভরযোগ্য ক্লাউড ইআরপি প্ল্যাটফর্ম
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
            Edusaas (EduSaaS Global) হলো আধুনিক স্কুল, কলেজ, মাদ্রাসা ও শিক্ষা প্রতিষ্ঠানের জন্য ডিজাইন করা একটি সম্পূর্ণ অল-ইন-ওয়ান ক্লাউড অপারেটিং সিস্টেম। 
            কাগজের ফাইল ও খাতার ঝামেলা দূর করে বায়োমেট্রিক হাজিরা, অটো রেজাল্ট, ওয়েবসাইট বিল্ডার এবং এআই কোরআন শিক্ষাকে এক ছাদের নিচে এনেছি আমরা।
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsWebsiteFormOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#052E2B] via-emerald-800 to-teal-800 text-[#D4AF37] hover:text-white font-black text-xs sm:text-sm border border-[#D4AF37]/40 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <span>ফ্রি ডেমো রিকোয়েস্ট করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMsgModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs sm:text-sm transition-all"
            >
              মেসেজ পাঠান
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="py-12 bg-white dark:bg-[#081711] border-b border-emerald-900/10 dark:border-emerald-800/30 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-[#0c221a] p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-emerald-900/40 text-center space-y-1.5"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-serif">
                  {s.number}
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {s.label}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-5xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-[#091a14] p-8 rounded-3xl border border-slate-200 dark:border-emerald-900/40 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <Zap className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif">
              আমাদের লক্ষ্য (Mission)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              বাংলাদেশের প্রতিটি শিক্ষাপ্রতিষ্ঠান—ছোট গ্রামীণ মাদ্রাসা থেকে শুরু করে শহরের বড় ইংলিশ ভার্সন স্কুল পর্যন্ত—যাতে কোনো টেকনিক্যাল জটিলতা ছাড়াই আন্তর্জাতিক মানের ক্লাউড অটোমেশন ও ডিজিটাল ব্যবস্থাপনার সুবিধা ভোগ করতে পারে।
            </p>
          </div>

          <div className="bg-white dark:bg-[#091a14] p-8 rounded-3xl border border-slate-200 dark:border-emerald-900/40 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <Globe className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif">
              আমাদের রূপকল্প (Vision)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              একটি পেপারলেস, শতভাগ স্বচ্ছ ও স্বয়ংক্রিয় শিক্ষাব্যবস্থা গড়ে তোলা; যেখানে শিক্ষকগণ প্রশাসনিক হিসাব-নিকাশের ক্লান্তিকর বোঝা থেকে মুক্ত হয়ে শিক্ষার্থীদের চরিত্র গঠন ও মানসম্মত পাঠদানে পূর্ণ মনোযোগ দিতে পারবেন।
            </p>
          </div>
        </div>

        {/* ── PILLARS ── */}
        <div className="space-y-8 pt-4">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-4 py-1.5 rounded-full inline-block border border-emerald-200 dark:border-emerald-800">
              প্লাটফর্মের শক্তিশালী স্তম্ভসমূহ
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-serif">
              কেন এডুস্যাস আলাদা ও নির্ভরযোগ্য?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-[#091a14] p-6 rounded-3xl border border-slate-200 dark:border-emerald-900/40 shadow-xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#052E2B] to-emerald-700 text-white flex items-center justify-center border border-[#D4AF37]/30">
                      <Icon className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {p.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {p.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <SaaSFooter />

      {/* ── MODALS ── */}
      {isMsgModalOpen && <ContactMessageModal onClose={() => setIsMsgModalOpen(false)} />}
      {isWebsiteFormOpen && <WebsiteOnboardingModal onClose={() => setIsWebsiteFormOpen(false)} />}
    </div>
  );
}
