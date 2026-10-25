"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, FileSpreadsheet, MessageSquare, GraduationCap, Globe, BookOpen
} from "lucide-react";

export default function SaaSHeroSection({ onOpenWebsiteForm, onOpenMsgModal }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#04140e] text-white">
      <div className="absolute inset-0 z-0">
        <Image
          src="/edusaas-hero-bg-v2.jpg"
          alt="EduSaaS Global — Smart School & Madrasa ERP Platform"
          fill
          priority
          className="object-cover object-center opacity-75"
          quality={90}
        />
        {/* Deep rich emerald and obsidian contrast overlays for crisp text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#03130d]/95 via-[#041912]/80 to-[#020d09]/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03130d]/60 via-transparent to-[#04140e]" />
        
        {/* Soft atmospheric Islamic gold and emerald auras */}
        <div className="absolute top-1/4 left-1/6 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none"
        />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* LEFT: Hero Content */}
          <div className="space-y-5 sm:space-y-6 text-center lg:text-left">
            {/* ── Eyebrow Pill ── */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-[#06382c]/90 border border-emerald-500/40 text-emerald-400 text-[10px] sm:text-xs font-mono font-bold px-3.5 sm:px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md"
            >
              <span>• EDUSAAS GLOBAL PLATFORM •</span>
            </motion.div>

            {/* ── Main Headline ── */}
            <div className="space-y-1">
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: "105%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[1.8rem] xs:text-[2.1rem] sm:text-[3.3rem] lg:text-[3.9rem] xl:text-[4.4rem] font-black text-white leading-[1.18] sm:leading-[1.12] tracking-tight font-bengali break-words"
                  style={{ fontFamily: "var(--font-hind-siliguri), 'Hind Siliguri', sans-serif" }}
                >
                  শিক্ষা প্রতিষ্ঠান
                </motion.h1>
              </div>

              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: "105%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[1.8rem] xs:text-[2.1rem] sm:text-[3.3rem] lg:text-[3.9rem] xl:text-[4.4rem] font-black text-white leading-[1.18] sm:leading-[1.12] tracking-tight font-bengali break-words"
                  style={{ fontFamily: "var(--font-hind-siliguri), 'Hind Siliguri', sans-serif" }}
                >
                  পরিচালনায় এখন
                </motion.h1>
              </div>

              <div className="overflow-hidden pt-1">
                <motion.div
                  initial={{ y: "105%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h1
                    className="text-[1.8rem] xs:text-[2.1rem] sm:text-[3.3rem] lg:text-[3.9rem] xl:text-[4.4rem] font-black leading-[1.18] sm:leading-[1.12] tracking-tight font-bengali break-words"
                    style={{ fontFamily: "var(--font-hind-siliguri), 'Hind Siliguri', sans-serif" }}
                  >
                    <span
                      style={{
                        background: "linear-gradient(135deg, #FFF176 0%, #D4AF37 35%, #F59E0B 65%, #FFF9C4 85%, #D4AF37 100%)",
                        backgroundSize: "250% auto",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        color: "transparent",
                        animation: "goldShimmer 5s linear infinite",
                        filter: "drop-shadow(0 2px 18px rgba(212,175,55,0.45))",
                        display: "inline-block",
                      }}
                    >
                      স্মার্ট ডিজিটাল সমাধান
                    </span>
                  </h1>
                </motion.div>
              </div>

              <style>{`
                @keyframes goldShimmer {
                  0%   { background-position: 250% center; }
                  100% { background-position: -250% center; }
                }
              `}</style>
            </div>

            {/* ── Subtitle ── */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.55 }}
              className="text-sm sm:text-base text-slate-300/90 leading-[1.8] sm:leading-[1.85] font-medium max-w-xl mx-auto lg:mx-0 px-2 sm:px-0"
            >
              হাজারো প্রতিষ্ঠান একটি ক্লাউড নেটওয়ার্কে যুক্ত — ওয়েবসাইট, বায়োমেট্রিক হাজিরা, অটো রেজাল্ট, ফি কালেকশন ও অভিভাবক SMS।
            </motion.p>

            {/* ── CTA Buttons ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-3.5 justify-center lg:justify-start px-4 sm:px-0"
            >
              <Link href="/platform-console/organizations/new" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto group relative px-7 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-2xl shadow-amber-900/40 hover:shadow-amber-500/50 hover:scale-[1.03] transition-all duration-300 flex items-center justify-center gap-2.5 overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative">🚀 বিনামূল্যে শুরু করুন</span>
                  <ArrowRight className="relative h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/quran-tutor" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-2xl bg-emerald-900/70 hover:bg-emerald-800/90 backdrop-blur-md border border-emerald-400/50 text-emerald-200 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg group">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <BookOpen className="h-4 w-4 text-[#D4AF37]" />
                  <span>নূর AI কুরআন শিক্ষক</span>
                  <ArrowRight className="h-4 w-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button
                onClick={onOpenWebsiteForm}
                className="w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-2xl bg-amber-500/15 backdrop-blur-md border border-amber-400/40 text-amber-200 font-bold text-sm hover:bg-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
              >
                <FileSpreadsheet className="h-4 w-4 text-[#D4AF37]" />
                <span>📄 তথ্য ফরম পূরণ করুন</span>
              </button>
              <button
                onClick={onOpenMsgModal}
                className="w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 text-emerald-200 font-bold text-sm hover:bg-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span>💬 মেসেজ পাঠান</span>
              </button>
            </motion.div>

            {/* ── Trust Strip ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-x-4 sm:gap-x-5 gap-y-2 text-[10px] sm:text-[11px] text-slate-400 font-semibold justify-center lg:justify-start pt-1"
            >
              {[
                { icon: "✅", text: "সেটআপ ফি শূন্য" },
                { icon: "⚡", text: "৫ মিনিটে চালু" },
                { icon: "🔒", text: "এনক্রিপ্টেড ডাটা" },
                { icon: "📱", text: "মোবাইল ফার্স্ট" },
              ].map((t) => (
                <span key={t.text} className="flex items-center gap-1">
                  <span>{t.icon}</span> <span className="text-slate-300">{t.text}</span>
                </span>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: Cloud Network Hub Orbit Visualizer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative flex items-center justify-center min-h-[300px] sm:min-h-[420px] lg:min-h-[480px] mt-6 lg:mt-0 scale-[0.66] xs:scale-[0.78] sm:scale-[0.88] lg:scale-100 origin-center max-w-full overflow-hidden"
          >
            {/* Top Right Institution Counter Badge */}
            <div className="absolute top-0 right-0 z-20 flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-full shadow-xl">
              <GraduationCap className="h-4 w-4" />
              <span>🎓 ১,২০০+ প্রতিষ্ঠান</span>
            </div>

            {/* Central Outer Orbit Circle Container */}
            <div className="relative w-[340px] xs:w-[400px] sm:w-[440px] h-[340px] xs:h-[400px] sm:h-[440px] flex items-center justify-center shrink-0">
              {/* RADIANT LIGHT BEAMS & ENERGY PULSE FROM INSIDE CENTRAL HUB CORE */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <motion.div
                  animate={{ scale: [0.6, 2.2], opacity: [0.45, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut" }}
                  className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-[#D4AF37]/25 via-emerald-400/20 to-transparent blur-2xl"
                />
                <motion.div
                  animate={{ scale: [0.8, 1.8], opacity: [0.35, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
                  className="absolute w-40 h-40 rounded-full bg-gradient-to-r from-amber-200/20 to-emerald-500/20 blur-xl"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                  className="absolute w-[420px] h-[420px] rounded-full opacity-25"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, rgba(212,175,55,0.2) 15deg, transparent 30deg, rgba(16,185,129,0.2) 45deg, transparent 60deg, rgba(255,232,124,0.22) 75deg, transparent 90deg, rgba(212,175,55,0.2) 105deg, transparent 120deg, rgba(16,185,129,0.2) 135deg, transparent 150deg, rgba(255,232,124,0.22) 165deg, transparent 180deg, rgba(212,175,55,0.2) 195deg, transparent 210deg, rgba(16,185,129,0.2) 225deg, transparent 240deg, rgba(255,232,124,0.22) 255deg, transparent 270deg, rgba(212,175,55,0.2) 285deg, transparent 300deg, rgba(16,185,129,0.2) 315deg, transparent 330deg, rgba(255,232,124,0.22) 345deg, transparent 360deg)",
                  }}
                />
              </div>

              {/* Connecting Lines SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 440 440">
                <line x1="220" y1="220" x2="220" y2="50" stroke="#D4AF37" strokeWidth="2" strokeDasharray="5 5" opacity="0.8" />
                <line x1="220" y1="220" x2="370" y2="120" stroke="#D4AF37" strokeWidth="2" strokeDasharray="5 5" opacity="0.8" />
                <line x1="220" y1="220" x2="400" y2="260" stroke="#D4AF37" strokeWidth="2" strokeDasharray="5 5" opacity="0.8" />
                <line x1="220" y1="220" x2="350" y2="380" stroke="#D4AF37" strokeWidth="2" strokeDasharray="5 5" opacity="0.8" />
                <line x1="220" y1="220" x2="90" y2="380" stroke="#D4AF37" strokeWidth="2" strokeDasharray="5 5" opacity="0.8" />
                <line x1="220" y1="220" x2="40" y2="260" stroke="#D4AF37" strokeWidth="2" strokeDasharray="5 5" opacity="0.8" />
                <line x1="220" y1="220" x2="80" y2="120" stroke="#D4AF37" strokeWidth="2" strokeDasharray="5 5" opacity="0.8" />
              </svg>

              {/* CENTRAL HUB CIRCLE */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-44 h-44 rounded-full bg-gradient-to-br from-[#095747] via-[#052E2B] to-[#021815] border-4 border-[#D4AF37] shadow-[0_0_80px_rgba(212,175,55,0.7),0_0_40px_rgba(16,185,129,0.6)] flex flex-col items-center justify-center text-center p-3 font-bengali"
                style={{ fontFamily: "var(--font-hind-siliguri), 'Hind Siliguri', sans-serif" }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-amber-600 border border-white/40 flex items-center justify-center mb-1 text-slate-950 shadow-lg">
                  <Globe className="h-5 w-5" />
                </div>
                <span className="font-black text-white text-base leading-none tracking-tight">EduSaaS</span>
                <span className="text-[11px] text-[#D4AF37] font-extrabold tracking-wider">.global</span>
                <span className="mt-2 text-[9px] font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-amber-400 px-2.5 py-0.5 rounded-full border border-white/30 flex items-center gap-1 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-950 animate-ping" />
                  ১,২০০+ যুক্ত
                </span>
              </motion.div>

              {/* ORBITING BRANCH NODES */}
              <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-2 left-[170px] z-10">
                <div className="bg-[#082a22]/90 border border-emerald-500/40 rounded-2xl p-2.5 shadow-xl text-center flex flex-col items-center min-w-[90px]">
                  <div className="w-8 h-8 rounded-xl bg-red-950/80 border border-red-500/30 flex items-center justify-center text-red-400 mb-1">
                    🏫
                  </div>
                  <span className="text-[9px] font-black text-white leading-tight">উত্তরা শাখা</span>
                  <span className="text-[8px] text-emerald-300 font-bold">১,২০০+ ছাত্র</span>
                </div>
              </motion.div>

              <motion.div animate={{ y: [4, -4, 4] }} transition={{ duration: 3.5, repeat: Infinity }} className="absolute top-[80px] right-2 z-10">
                <div className="bg-[#082a22]/90 border border-emerald-500/40 rounded-2xl p-2.5 shadow-xl text-center flex flex-col items-center min-w-[90px]">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 mb-1">
                    🏛️
                  </div>
                  <span className="text-[9px] font-black text-white leading-tight">মিরপুর শাখা</span>
                  <span className="text-[8px] text-amber-300 font-bold">৮৮০+ ছাত্র</span>
                </div>
              </motion.div>

              <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-[210px] -right-6 z-10">
                <div className="bg-[#082a22]/90 border border-emerald-500/40 rounded-2xl p-2.5 shadow-xl text-center flex flex-col items-center min-w-[90px]">
                  <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-600/40 flex items-center justify-center text-emerald-300 mb-1">
                    🎓
                  </div>
                  <span className="text-[9px] font-black text-white leading-tight">গাজীপুর শাখা</span>
                  <span className="text-[8px] text-emerald-300 font-bold">৭৫০+ ছাত্র</span>
                </div>
              </motion.div>

              <motion.div animate={{ y: [3, -3, 3] }} transition={{ duration: 3.2, repeat: Infinity }} className="absolute bottom-[20px] right-[40px] z-10">
                <div className="bg-[#082a22]/90 border border-emerald-500/40 rounded-2xl p-2.5 shadow-xl text-center flex flex-col items-center min-w-[90px]">
                  <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-500/30 flex items-center justify-center text-blue-300 mb-1">
                    🏢
                  </div>
                  <span className="text-[9px] font-black text-white leading-tight">চট্টগ্রাম শাখা</span>
                  <span className="text-[8px] text-blue-300 font-bold">৯২০+ ছাত্র</span>
                </div>
              </motion.div>

              <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 3.8, repeat: Infinity }} className="absolute bottom-[20px] left-[50px] z-10">
                <div className="bg-[#082a22]/90 border border-emerald-500/40 rounded-2xl p-2.5 shadow-xl text-center flex flex-col items-center min-w-[90px]">
                  <div className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-500/30 flex items-center justify-center text-teal-300 mb-1">
                    📚
                  </div>
                  <span className="text-[9px] font-black text-white leading-tight">নারায়ণগঞ্জ</span>
                  <span className="text-[8px] text-teal-300 font-bold">৬৫০+ ছাত্র</span>
                </div>
              </motion.div>

              <motion.div animate={{ y: [3, -3, 3] }} transition={{ duration: 3.4, repeat: Infinity }} className="absolute top-[210px] -left-6 z-10">
                <div className="bg-[#082a22]/90 border border-emerald-500/40 rounded-2xl p-2.5 shadow-xl text-center flex flex-col items-center min-w-[90px]">
                  <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-1">
                    🌟
                  </div>
                  <span className="text-[9px] font-black text-white leading-tight">সিলেট শাখা</span>
                  <span className="text-[8px] text-amber-300 font-bold">৫৮০+ ছাত্র</span>
                </div>
              </motion.div>

              <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 4.2, repeat: Infinity }} className="absolute top-[80px] left-2 z-10">
                <div className="bg-[#082a22]/90 border border-emerald-500/40 rounded-2xl p-2.5 shadow-xl text-center flex flex-col items-center min-w-[90px]">
                  <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-1">
                    🎓
                  </div>
                  <span className="text-[9px] font-black text-white leading-tight">আল-নূর একাডেমি</span>
                  <span className="text-[8px] text-emerald-300 font-bold">১,১০০+ ছাত্র</span>
                </div>
              </motion.div>

              {/* Bottom Left Connected Badge */}
              <div className="absolute -bottom-6 left-0 z-20 flex items-center gap-1.5 bg-[#03241c] border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>● সকল শাখা সংযুক্ত</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
