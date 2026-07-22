import React from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";

export default function AboutSection() {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isAr = lang === "ar";

  return (
    <section id="about-section" className="py-16 md:py-24 scroll-mt-20 overflow-x-hidden bg-transparent">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex flex-col items-center gap-10">
          <div className="w-full">
            {/* Main Header */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black italic mb-6 text-[#15803D] dark:text-[#4adea0] leading-tight tracking-tight max-w-3xl mx-auto">
              {t.aboutSection.h1}
            </h2>

            {/* Elegant Header Divider */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="h-0.5 w-20 bg-gradient-to-r from-transparent to-[#15803D]" />
              <div className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
              <div className="h-0.5 w-20 bg-gradient-to-l from-transparent to-[#15803D]" />
            </div>

            {/* New paragraph content */}
            <div className="text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
              <p className="text-center font-medium italic">{t.aboutSection.newContent}</p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

