import React from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";

export default function AboutSection() {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isBn = lang === "bn";
  const isAr = lang === "ar";

  return (
    <section id="about-section" className="py-14 sm:py-20 md:py-24 scroll-mt-20 overflow-x-hidden bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="flex flex-col items-center">
          {/* Main Header */}
          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 text-[#15803D] dark:text-[#4adea0] tracking-tight leading-tight max-w-3xl mx-auto ${
            isBn ? "font-bengali" : isAr ? "font-arabic" : ""
          }`}>
            {t.aboutSection.h1}
          </h2>

          {/* Elegant Center Divider */}
          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
            <div className="h-0.5 w-16 sm:w-24 bg-gradient-to-r from-transparent to-[#15803D]" />
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#15803D] shadow-sm" />
            <div className="h-0.5 w-16 sm:w-24 bg-gradient-to-l from-transparent to-[#15803D]" />
          </div>

          {/* Paragraph content — Non-italic, straight, balanced and readable */}
          <div className={`max-w-3xl mx-auto text-slate-700 dark:text-slate-200 text-base sm:text-lg md:text-[19px] leading-relaxed sm:leading-8 md:leading-9 font-normal ${
            isBn ? "font-bengali" : isAr ? "font-arabic" : ""
          }`}>
            <p className="text-center sm:text-justify sm:[text-align-last:center]">
              {t.aboutSection.newContent}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
