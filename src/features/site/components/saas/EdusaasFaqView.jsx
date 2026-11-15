"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Building2, HelpCircle, ChevronDown, ChevronUp, 
  PhoneCall, Mail
} from "lucide-react";
import SaaSFooter from "./SaaSFooter";
import ContactMessageModal from "./ContactMessageModal";
import WebsiteOnboardingModal from "./WebsiteOnboardingModal";

export default function EdusaasFaqView() {
  const [activeFaq, setActiveFaq] = useState(0);
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [isWebsiteFormOpen, setIsWebsiteFormOpen] = useState(false);

  const faqs = [
    {
      category: "সাধারণ ও অনবোর্ডিং",
      q: "EduSaaS কী এবং এটি কীভাবে আমাদের প্রতিষ্ঠানকে সাহায্য করে?",
      a: "EduSaaS হলো স্কুল, কলেজ, মাদ্রাসা ও শিক্ষাপ্রতিষ্ঠানের জন্য ক্লাউড-ভিত্তিক অল-ইন-ওয়ান শিক্ষা ব্যবস্থাপনা (ERP) সফটওয়্যার। এটি বায়োমেট্রিক হাজিরা, রেজাল্ট প্রসেসিং, শিক্ষার্থী ভর্তি, মাসিক ফি ব্যবস্থাপনা ও প্রতিষ্ঠানের ডাইনামিক ওয়েবসাইট পরিচালনাকে সম্পূর্ণ অটোমেট করে দেয়।"
    },
    {
      category: "বায়োমেট্রিক ও হাজিরা",
      q: "কোন কোন বায়োমেট্রিক ডিভাইস EduSaaS-এর সাথে কাজ করে?",
      a: "বাজারের শীর্ষস্থানীয় ZKTeco, Hikvision, Realand সহ সকল স্ট্যান্ডার্ড ফিঙ্গারপ্রিন্ট ও ফেস রিকগনিশন ডিভাইস EduSaaS-এর বিল্ট-ইন আইওটি ব্রিজ ডেমন (IoT Bridge) এর মাধ্যমে সরাসরি ক্লাউডে রিয়েলটাইম সিঙ্ক হয়।"
    },
    {
      category: "বায়োমেট্রিক ও হাজিরা",
      q: "শিক্ষার্থী বায়োমেট্রিক দিলে অভিভাবক কীভাবে জানতে পারেন?",
      a: "ডিভাইসে পাঞ্চ হওয়ার সাথে সাথে মাত্র ৩ সেকেন্ডের মধ্যে ক্লাউড গেটওয়ে থেকে অভিভাবকের নিবন্ধিত মোবাইল নম্বরে বাংলায় কাস্টমাইজড উপস্থিতি SMS পৌঁছে যায়।"
    },
    {
      category: "রেজাল্ট ও মূল্যায়ন",
      q: "স্বয়ংক্রিয় রেজাল্ট ও গ্রেডিং ইঞ্জিন কীভাবে কাজ করে?",
      a: "শিক্ষকগণ কেবল প্রাপ্ত নম্বর এন্ট্রি করবেন। সফটওয়্যার স্বয়ংক্রিয়ভাবে জিপিএ, লেটার গ্রেড, পজিশন, ক্লাস ও সেকশন মেরিট তালিকা এবং প্রিন্ট-রেডি সিকিউর QR কোডযুক্ত মার্কশিট ও প্রশংসাপত্র প্রস্তুত করে দেয়।"
    },
    {
      category: "ফি ও অ্যাকাউন্টিং",
      q: "শিক্ষার্থীদের ফি আদায় ও বকেয়া হিসাব কীভাবে রাখা যায়?",
      a: "মাসিক বেতন, পরীক্ষা ফি, সেশন চার্জ ইত্যাদির ভাউচার স্বয়ংক্রিয়ভাবে তৈরি হয়। অভিভাবকগণ bKash/Nagad বা ব্যাংকের মাধ্যমে ফি পরিশোধ করতে পারেন এবং পেমেন্ট সম্পন্ন হলে সাথে সাথে ডিজিটাল রসিদ ও SMS পৌঁছায়।"
    },
    {
      category: "নিরাপত্তা ও ডাটা গোপনীয়তা",
      q: "আমাদের প্রতিষ্ঠানের ডাটা কতটা নিরাপদ? অন্য প্রতিষ্ঠান কি দেখতে পারবে?",
      a: "সম্পূর্ণ নিরাপদ। EduSaaS এন্টারপ্রাইজ-গ্রেড PostgreSQL Row-Level Security (RLS) ও জিরো-ট্রাস্ট মাল্টি-টেন্যান্ট আইসোলেশন নীতিতে চলে। প্রতিটি প্রতিষ্ঠানের ডাটা অন্য প্রতিষ্ঠান থেকে কঠোরভাবে সুরক্ষিত ও আলাদা রাখা হয়।"
    },
    {
      category: "নূর এআই কুরআন শিক্ষক",
      q: "নূর এআই (Nur AI) কুরআন শিক্ষক কী এবং এটি কীভাবে কাজ করে?",
      a: "নূর এআই হলো EduSaaS প্ল্যাটফর্মের নিজস্ব উদ্ভাবিত ভয়েস-ফার্স্ট ইসলামিক টিচিং ইঞ্জিন। এটি শিশুর মুখের সরাসরি তিলাওয়াত শুনে খাঁটি মাখরাজ ও তাজবীদ নিয়ম অনুযায়ী রিয়েল-টাইমে ভুল শনাক্ত করে এবং উস্তাদের মতো বিশুদ্ধ উচ্চারণ শিখিয়ে দেয়।"
    },
    {
      category: "ওয়েবসাইট ও ডোমেইন",
      q: "আমাদের প্রতিষ্ঠানের নিজস্ব ডোমেইনে (.edu.bd বা .com) কি ওয়েবসাইট চালানো যাবে?",
      a: "হ্যাঁ, সম্পূর্ণ যাবে। EduSaaS-এর নো-কোড সিএমএস-এর মাধ্যমে আপনি মাত্র কয়েক ক্লিকে নিজস্ব কাস্টম ডোমেইন যুক্ত করতে পারবেন। নোটিশ, গ্যালারি, শিক্ষক তালিকা ও ভর্তি ফরম সরাসরি নিজস্ব ডোমেইনে প্রদর্শিত হবে।"
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
            <span className="text-emerald-800 dark:text-emerald-400">সাধারণ জিজ্ঞাসা (FAQ)</span>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 bg-gradient-to-b from-white via-emerald-50/20 to-[#F8FAF8] dark:from-[#091a14] dark:to-[#07130e] border-b border-emerald-900/10 dark:border-emerald-800/30 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
            প্রশ্ন ও উত্তর
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-serif">
            সাধারণ জিজ্ঞাসা (Frequently Asked Questions)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            EduSaaS প্ল্যাটফর্ম, বায়োমেট্রিক হাজিরা, অটো রেজাল্ট, নিরাপত্তা ও অনবোর্ডিং সম্পর্কিত সাধারণ প্রশ্নাবলীর উত্তর জেনে নিন।
          </p>
        </div>
      </section>

      {/* ── FAQS ACCORDION ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto py-12 px-4 sm:px-8 space-y-4">
        {faqs.map((f, idx) => {
          const isOpen = activeFaq === idx;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#091a14] rounded-2xl border border-slate-200 dark:border-emerald-900/40 shadow-xs overflow-hidden transition-all"
            >
              <button
                onClick={() => setActiveFaq(isOpen ? null : idx)}
                className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-emerald-950/20"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                    {f.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white pt-1">
                    {f.q}
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-1">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-6 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 font-medium">
                  {f.a}
                </div>
              )}
            </div>
          );
        })}

        {/* ── STILL HAVE QUESTIONS ── */}
        <div className="mt-12 bg-gradient-to-br from-[#052E2B] to-emerald-800 rounded-3xl p-8 text-white text-center space-y-4 border border-[#D4AF37]/30 shadow-lg">
          <h3 className="text-lg sm:text-xl font-black font-serif text-[#D4AF37]">
            আপনার কি আরও কোনো প্রশ্ন রয়েছে?
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto">
            আমাদের অভিজ্ঞ কাস্টমার সাপোর্ট টিম আপনার প্রতিষ্ঠানের যাবতীয় প্রশ্নের উত্তর দিতে সার্বক্ষণিক প্রস্তুত।
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="https://wa.me/8801576600265"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপে কথা বলুন</span>
            </a>
            <button
              onClick={() => setIsMsgModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>মেসেজ পাঠান</span>
            </button>
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
