"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Star, GraduationCap, UserCheck, Lock, HelpCircle,
  ChevronDown, ChevronUp, FileSpreadsheet, ArrowRight, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SaaSFaqSection({
  reviews = [],
  faqs = [],
  onOpenWebsiteForm,
  onOpenMsgModal,
}) {
  const [activeFaq, setActiveFaq] = useState(null);

  return (
    <>
      {/* ══ CUSTOMER REVIEWS ══ */}
      <section id="reviews" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full inline-block">
            রিয়েল রিভিউ
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#052E2B] mt-4 font-serif">
            মুহতামিম ও শিক্ষকদের অভিজ্ঞতা
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {reviews.map((rev, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#052E2B] via-emerald-600 to-[#D4AF37]" />
              <div className="flex items-center gap-0.5 mb-4 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium mb-6 italic">
                "{rev.comment}"
              </p>
              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#052E2B] to-emerald-700 text-white flex items-center justify-center font-black text-sm border-2 border-[#D4AF37]">
                  {rev.name[0]}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{rev.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {rev.role}, {rev.institution}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ PORTALS SECTION ══ */}
      <section id="portals" className="py-16 bg-slate-50 border-y border-slate-200/60 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full inline-block">
              লাইভ ডেমো
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#052E2B] mt-4 font-serif">
              সরাসরি পোর্টালে প্রবেশ করুন
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "শিক্ষার্থী ও অভিভাবক",
                desc: "রেজাল্ট, হাজিরা, ফি রসিদ ও অগ্রগতি ট্র্যাকার",
                href: "/StudentLogin",
                color: "from-emerald-600 to-teal-700",
                btn: "স্টুডেন্ট পোর্টাল →",
              },
              {
                icon: UserCheck,
                title: "শিক্ষক ও স্টাফ প্যানেল",
                desc: "হাজিরা, নাম্বার এন্ট্রি ও দৈনিক ট্র্যাকার",
                href: "/TeacherLogin",
                color: "from-blue-600 to-indigo-700",
                btn: "টিচার পোর্টাল →",
              },
              {
                icon: Lock,
                title: "অ্যাডমিন ও পরিচালনা",
                desc: "ভর্তি, ফি, ওয়েবসাইট ও সম্পূর্ণ ERP",
                href: "/AdminLogin",
                color: "from-[#052E2B] to-emerald-900",
                btn: "অ্যাডমিন প্যানেল →",
              },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all"
                >
                  <div
                    className={`w-13 h-13 p-3.5 rounded-2xl bg-gradient-to-br ${p.color} text-white shadow-md inline-flex mb-4`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 mb-2">{p.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-5">{p.desc}</p>
                  <Link href={p.href}>
                    <button
                      className={`w-full py-3 rounded-xl bg-gradient-to-r ${p.color} text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-md`}
                    >
                      {p.btn}
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-[#052E2B] bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full inline-block">
            প্রশ্নোত্তর
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#052E2B] mt-4 font-serif">
            সচরাচর জিজ্ঞাসিত প্রশ্ন
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl border transition-all ${
                  isOpen ? "border-[#052E2B]/30 shadow-md" : "border-slate-200 shadow-sm"
                } overflow-hidden`}
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                >
                  <span className="flex items-center gap-3 font-bold text-sm text-slate-900">
                    <HelpCircle
                      className={`h-4.5 w-4.5 shrink-0 ${
                        isOpen ? "text-[#052E2B]" : "text-[#D4AF37]"
                      }`}
                    />
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-[#052E2B] shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 px-6 py-4 bg-emerald-50/50 text-sm text-slate-600 font-medium leading-relaxed"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══ FINAL CTA BANNER ══ */}
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#052E2B] via-[#031d1b] to-emerald-950" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

          <div className="relative z-10 px-8 sm:px-14 py-14 text-center">
            <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] bg-white/8 border border-[#D4AF37]/30 px-4 py-1.5 rounded-full inline-block mb-5">
              আজই শুরু করুন
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white font-serif leading-tight mb-4">
              আপনার প্রতিষ্ঠানের জন্য আজই<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-amber-300 to-yellow-400">
                Website ও ERP চালু করুন
              </span>
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/80 font-medium max-w-2xl mx-auto leading-relaxed mb-8">
              কোনো ক্রেডিট কার্ড বা টেকনিক্যাল জ্ঞান ছাড়াই আজই ৩ মিনিটে আপনার প্রতিষ্ঠানের জন্য আধুনিক ক্লাউড প্ল্যাটফর্ম চালু করুন।
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={onOpenWebsiteForm}
                className="px-10 py-4.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-2xl shadow-amber-900/40 hover:scale-105 transition-all flex items-center gap-2.5 border border-amber-300"
              >
                <FileSpreadsheet className="h-5 w-5 text-slate-950" />
                <span>অনলাইন তথ্য ফরম পূরণ করুন</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={onOpenMsgModal}
                className="px-8 py-4.5 rounded-2xl bg-white/8 border border-white/20 text-white font-bold text-sm hover:bg-white/15 transition-all flex items-center gap-2 backdrop-blur-md"
              >
                <MessageSquare className="h-4 w-4 text-[#D4AF37]" />
                <span>মেসেজ লিখুন</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
