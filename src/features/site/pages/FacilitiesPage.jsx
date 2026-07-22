'use client';

import React from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { Home, Zap, School, Droplet, Trophy, Building, Utensils, Shield, TreePine, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const FACILITIES_LIST = [
  { icon: Home, key: "f1", color: "#9933cc" },
  { icon: Zap, key: "f2", color: "#f59e0b" },
  { icon: School, key: "f3", color: "#3b82f6" },
  { icon: Droplet, key: "f4", color: "#06b6d4" },
  { icon: Trophy, key: "f5", color: "#f59e0b" },
  { icon: Building, key: "f6", color: "#8b5cf6" },
  { icon: Utensils, key: "f7", color: "#ef4444" },
  { icon: Shield, key: "f8", color: "#06b6d4" },
  { icon: TreePine, key: "f9", color: "#22c55e" },
];

export default function FacilitiesPage() {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isAr = lang === "ar";

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Banner */}
      <section className="relative py-20 overflow-hidden" style={{ background: "linear-gradient(135deg,#0e2e1f 0%,#144733 50%,#0e2e1f 100%)" }}>
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full">
            <defs>
              <pattern id="facilities-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 0L60 15V45L30 60L0 45V15Z" fill="none" stroke="#D4AF37" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#facilities-pattern)" />
          </svg>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className={`inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors mb-6 text-sm font-bold italic ${isAr ? 'flex-row-reverse' : ''}`}>
              <ArrowLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
              {lang === 'bn' ? 'হোম পেজে ফিরে যান' : lang === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home'}
            </Link>
          </motion.div>
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-5xl font-black italic text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t.facilitiesPage.title}
          </motion.h1>
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-yellow-400/60" />
            <div className="w-2 h-2 rounded-full" style={{ background: "#D4AF37" }} />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-yellow-400/60" />
          </motion.div>
          <motion.p
            className="text-white/70 text-sm sm:text-base max-w-2xl mx-auto italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t.facilitiesPage.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-16 md:py-24" style={{ background: "linear-gradient(180deg,#f8fdf9 0%,#ffffff 100%)" }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FACILITIES_LIST.map((f, i) => {
              const Icon = f.icon;
              const titleKey = `${f.key}Title`;
              const descKey = `${f.key}Desc`;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
                  className="group rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className={`flex items-start gap-5 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: `${f.color}10`, border: `1.5px solid ${f.color}30` }}
                    >
                      <Icon className="h-7 w-7 transition-all duration-500" style={{ color: f.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold italic text-slate-800 text-base sm:text-lg mb-3 group-hover:text-[#006400] transition-colors duration-300">
                        {t.facilitiesPage[titleKey]}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {t.facilitiesPage[descKey]}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16" style={{ background: "linear-gradient(160deg,#0e2e1f 0%,#144733 50%,#0e2e1f 100%)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            className="text-2xl sm:text-3xl font-extrabold italic text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t.facilitiesPage.ctaTitle}
          </motion.h2>
          <motion.p
            className="text-white/60 text-sm sm:text-base mb-8 max-w-xl mx-auto italic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t.facilitiesPage.ctaSubtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Link
              href="/admission-choice"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold italic text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#D4AF37,#b8960a)" }}
            >
              {lang === 'bn' ? 'এখনই ভর্তি হোন' : lang === 'ar' ? 'سجل الآن' : 'Apply Now'}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
