"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ArrowRight, MapPin, ExternalLink
} from "lucide-react";

export default function SaaSFeaturesSection({
  whyChooseUs = [],
  featureTabs = {},
  activeTab = "exam",
  setActiveTab,
  features = [],
  showcaseSchools = [],
  onOpenWebsiteForm,
}) {
  return (
    <>
      {/* ══ WHY CHOOSE US SECTION ══ */}
      <section id="why" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-[#052E2B] bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full inline-block">
            কেন EduSaaS বেছে নেবেন?
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#052E2B] mt-4 font-serif">
            কেন একটি মাদরাসা এই Platform ব্যবহার করবে?
          </h2>
          <p className="text-sm text-slate-500 mt-3 max-w-2xl mx-auto font-medium">
            হাজার মাদরাসার অভিজ্ঞতা থেকে তৈরি, বাংলাদেশের শিক্ষাপ্রতিষ্ঠানের জন্য বিশেষভাবে ডিজাইন করা।
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyChooseUs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -5, scale: 1.01 }}
                className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex gap-5 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#052E2B] to-emerald-700 text-[#D4AF37] flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
                    <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══ INTERACTIVE FEATURES TAB SECTION ══ */}
      <section id="features" className="py-20 bg-gradient-to-b from-[#052E2B] to-[#031d1b] text-white px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] bg-white/8 border border-[#D4AF37]/30 px-4 py-1.5 rounded-full inline-block">
              অল-ইন-ওয়ান সমাধান
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-4 font-serif">একটি প্ল্যাটফর্মে সবকিছু</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {Object.entries(featureTabs).map(([key, tab]) => {
              const Icon = tab.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === key
                      ? "bg-gradient-to-r from-[#D4AF37] to-amber-500 text-slate-950 shadow-lg scale-105"
                      : "bg-white/8 text-white/70 hover:bg-white/15 border border-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {Object.entries(featureTabs).map(([key, tab]) => {
              if (key !== activeTab) return null;
              const Icon = tab.icon;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
                >
                  <div>
                    <div className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-br ${tab.color} shadow-xl mb-5`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black font-serif mb-4">{tab.title}</h3>
                    <p className="text-sm text-emerald-100/80 leading-relaxed font-medium mb-6">{tab.desc}</p>
                    <div className="space-y-3">
                      {tab.points.map((p, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/6 border border-white/10 rounded-xl px-4 py-3">
                          <CheckCircle2 className="h-4 w-4 text-[#D4AF37] shrink-0" />
                          <span className="text-sm font-semibold text-white/90">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/6 border border-white/10 rounded-3xl p-8 text-center">
                    <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${tab.color} flex items-center justify-center mx-auto shadow-2xl mb-4`}>
                      <Icon className="h-12 w-12 text-white" />
                    </div>
                    <p className="text-lg font-black text-white mb-2 font-serif">{tab.label} মডিউল</p>
                    <p className="text-xs text-white/50">সম্পূর্ণ ডিজিটাল ও অটোমেটেড</p>
                    <button
                      onClick={onOpenWebsiteForm}
                      className={`mt-6 px-7 py-3 rounded-xl bg-gradient-to-r ${tab.color} text-white font-bold text-xs shadow-lg hover:scale-105 transition-all`}
                    >
                      তথ্য ফরম পূরণ করুন →
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-16">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-all group">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-[11px] font-bold text-white/90 leading-tight">{f.title}</p>
                  <p className="text-[9px] text-white/40 mt-1">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ ONBOARDED SCHOOLS ══ */}
      <section id="schools" className="py-20 px-4 sm:px-8 bg-slate-50 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#052E2B] bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-full inline-block">
                সক্রিয় নেটওয়ার্ক
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#052E2B] mt-3 font-serif">
                প্ল্যাটফর্মে যুক্ত সেরা প্রতিষ্ঠানসমূহ
              </h2>
            </div>
            <Link href="/platform-console/organizations">
              <button className="text-xs font-black text-[#052E2B] bg-white border border-slate-200 hover:border-[#052E2B] shadow-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all hover:shadow">
                সকল প্রতিষ্ঠান দেখুন <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {showcaseSchools.map((s, idx) => (
              <motion.div key={idx} whileHover={{ y: -4 }} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
                    {s.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono bg-slate-50 px-2.5 py-1 rounded-lg border">
                    {s.students}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#052E2B] to-emerald-700 flex items-center justify-center text-[#D4AF37] mb-4 font-black text-lg font-serif shadow-md">
                  {s.name[0]}
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1">{s.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {s.location}
                </p>
                <div className="bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 font-medium border border-slate-100 mb-4">
                  {s.type}
                </div>
                <Link href="/?view=school" className="text-xs font-bold text-[#052E2B] flex items-center gap-1 hover:underline">
                  <span>লাইভ সাইট দেখুন</span> <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
