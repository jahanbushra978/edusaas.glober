import React from 'react';
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, Award, ClipboardList } from "lucide-react";

export default function AcademicsPage() {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isAr = lang === "ar";
  const isBn = lang === "bn";

  const depts = [
    { 
      title: t.academicsSection.programs.noorani.title, 
      desc: t.academicsSection.programs.noorani.desc,
      icon: GraduationCap,
      color: "emerald"
    },
    { 
      title: t.academicsSection.programs.nazera.title, 
      desc: t.academicsSection.programs.nazera.desc,
      icon: BookOpen,
      color: "amber"
    },
    { 
      title: t.academicsSection.programs.hifz.title, 
      desc: t.academicsSection.programs.hifz.desc,
      icon: Award,
      color: "blue"
    },
    { 
      title: t.academicsSection.programs.shunani.title, 
      desc: t.academicsSection.programs.shunani.desc,
      icon: ClipboardList,
      color: "purple"
    },
    { 
      title: t.academicsSection.programs.kg.title, 
      desc: t.academicsSection.programs.kg.desc,
      icon: GraduationCap,
      color: "rose"
    },
    { 
      title: t.academicsSection.programs.kitab.title, 
      desc: t.academicsSection.programs.kitab.desc,
      icon: BookOpen,
      color: "orange"
    },
    { 
      title: isBn ? "ইংলিশ ভার্সন (রহমানিয়া ইনস্টিটিউট)" : isAr ? "النسخة الإنجليزية (معهد رحمانيا)" : "English Version (Rahmania Institute)",
      desc: isBn ? "ইংরেজি মাধ্যমের শিক্ষার সাথে দ্বীনি মূল্যবোধের সমন্বয়ে শিক্ষার্থীদের একটি শক্তিশালী ও নৈতিক ভিত্তি প্রদান করা হয়।" : isAr ? "منهج اللغة الإنجليزية مدمج مع القيم الإسلامية لبناء أساس أكاديمي وأخلاقي قوي." : "English version curriculum integrated with Islamic values to build a strong academic and moral foundation.",
      icon: Award,
      color: "indigo"
    },
    { 
      title: t.academicsSection.programs.general.title, 
      desc: t.academicsSection.programs.general.desc,
      icon: BookOpen,
      color: "teal"
    }
  ];

  return (
    <div className={`min-h-screen bg-slate-50 py-16 px-4 ${isAr ? 'direction-rtl' : ''}`}>
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <div className={`mb-12 ${isAr ? 'text-right' : ''}`}>
          <Link href="/" className={`inline-flex items-center gap-2 text-sm font-bold italic text-emerald-700 hover:text-emerald-800 transition-all ${isAr ? 'flex-row-reverse' : ''}`}>
            <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            {t.common.backHome}
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold mb-4 uppercase tracking-widest bg-emerald-50 border border-emerald-200 text-emerald-700">
            {isBn ? "একাডেমিক প্রোগ্রাম" : isAr ? "البرامج الأكاديمية" : "ACADEMIC PROGRAMS"}
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold italic text-slate-900 mb-6">
            {t.nav.academic}
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-3xl mx-auto italic leading-relaxed">
            {t.academicsSection.subtitle}
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px w-24 bg-emerald-100" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            <div className="h-px w-24 bg-emerald-100" />
          </div>
        </div>
        
        <div className="grid gap-12">
          {/* Departments List */}
          <div className="space-y-8">
            <h2 className={`text-2xl font-extrabold italic text-slate-900 mb-8 flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
              <BookOpen className="w-7 h-7 text-emerald-600" />
              {t.nav.departments}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {depts.map((d, idx) => {
                const Icon = d.icon;
                return (
                  <div key={idx} className={`group bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 ${isAr ? 'sm:flex-row-reverse text-center sm:text-right' : 'text-center sm:text-left'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                      d.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' :
                      d.color === 'amber' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' :
                      d.color === 'blue' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' :
                      d.color === 'purple' ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400' :
                      d.color === 'rose' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400' :
                      d.color === 'orange' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' :
                      d.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400' :
                      'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400'
                    }`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold italic text-slate-900 dark:text-slate-100 mb-2.5 group-hover:text-[#12715B] dark:group-hover:text-[#4adea0] transition-colors">{d.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm italic font-medium leading-relaxed">{d.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
