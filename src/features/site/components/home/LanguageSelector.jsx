import React from "react";
import { useLanguage } from "@/lib/LanguageContext";
import Logo from "@/components/home/Logo";

export default function LanguageSelector() {
  const { setLang } = useLanguage();

  return (
    <div className="fixed inset-0 z-[999999] overflow-y-auto overscroll-contain"
      style={{ background: "linear-gradient(160deg,#0a1f14 0%,#0e2e1f 40%,#071509 100%)" }}>
      <svg className="fixed inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.05 }}>
        <defs>
          <pattern id="lgPat" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M40 0L80 20V60L40 80L0 60V20Z" fill="none" stroke="#D4AF37" strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lgPat)"/>
      </svg>

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse,rgba(212,175,55,0.12) 0%,transparent 70%)" }} />

      <div className="min-h-full flex items-center justify-center py-8 sm:py-12 px-4">
        <div className="flex flex-col items-center text-center w-full max-w-md sm:max-w-2xl">
          <div className="mb-5 sm:mb-6 relative">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-30" style={{ background: "rgba(212,175,55,0.5)" }} />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl p-1.5"
              style={{ background: "rgba(255,255,255,0.97)", boxShadow: "0 0 0 3px rgba(212,175,55,0.4), 0 8px 40px rgba(0,0,0,0.4)" }}>
              <Logo className="w-full h-full rounded-xl object-contain" />
            </div>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold italic text-white mb-1 leading-snug">Rahmania Institute (রহমানিয়া ইনস্টিটিউট)</h1>
          <p className="text-sm sm:text-base font-bold mb-1" style={{ color: "#D4AF37" }}>রহমানিয়া ইনস্টিটিউট</p>
          <p className="text-xs sm:text-sm font-bold mb-1 text-white/80" style={{ fontFamily: 'Noto Sans Arabic' }}>معهد الرحمانية</p>
          <p className="text-[10px] sm:text-xs text-white/40 italic mb-5 sm:mb-8 tracking-widest uppercase">Ilm · Akhlaq · Taqwa</p>

          <div className="mb-5 sm:mb-6 px-4 sm:px-5 py-2 sm:py-3 rounded-2xl w-full" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,175,55,0.2)" }}>
            <p className="text-sm sm:text-base font-bold text-white mb-0.5">ভাষা নির্বাচন করুন</p>
            <p className="text-xs sm:text-sm text-white/50 italic mb-1">Select Language</p>
            <p className="text-xs sm:text-sm text-white/50" style={{ fontFamily: 'Noto Sans Arabic' }}>اختر اللغة</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
            <button
              onClick={() => setLang("bn")}
              className="group relative px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-extrabold transition-all duration-300 overflow-hidden text-white bg-gradient-to-br from-[#006400] to-[#008050] border-2 border-[rgba(212,175,55,0.4)] shadow-lg hover:translate-y-[-4px] hover:scale-[1.04] active:scale-[0.98] touch-manipulation"
            >
              <span className="text-xl sm:text-2xl block mb-0.5">বাংলা</span>
              <span className="text-[10px] sm:text-xs text-white/60 font-normal italic">Bengali</span>
            </button>

            <button
              onClick={() => setLang("en")}
              className="group px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-extrabold transition-all duration-300 text-white bg-[rgba(255,255,255,0.08)] border-2 border-[rgba(212,175,55,0.35)] shadow-lg hover:translate-y-[-4px] hover:scale-[1.04] hover:bg-[rgba(212,175,55,0.15)] active:scale-[0.98] touch-manipulation"
            >
              <span className="text-xl sm:text-2xl block mb-0.5">English</span>
              <span className="text-[10px] sm:text-xs text-white/60 font-normal italic">ইংরেজি</span>
            </button>

            <button
              onClick={() => setLang("ar")}
              className="group px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-extrabold transition-all duration-300 text-white bg-[rgba(255,255,255,0.08)] border-2 border-[rgba(0,180,100,0.35)] shadow-lg hover:translate-y-[-4px] hover:scale-[1.04] hover:bg-[rgba(0,180,100,0.15)] active:scale-[0.98] touch-manipulation"
            >
              <span className="text-xl sm:text-2xl block mb-0.5" style={{ fontFamily: 'Noto Sans Arabic' }}>العربية</span>
              <span className="text-[10px] sm:text-xs text-white/60 font-normal italic">Arabic</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}