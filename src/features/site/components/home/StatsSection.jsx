import React, { useMemo } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";

const DEFAULT_STATS = [
  { numEn: "200+", numBn: "২০০+", numAr: "+٢٠٠", labelEn: "Students Enrolled", labelBn: "ভর্তিকৃত শিক্ষার্থী", labelAr: "الطلاب المسجلين", icon: "🎓" },
  { numEn: "15+",  numBn: "১৫+",  numAr: "+١٥",  labelEn: "Qualified Teachers", labelBn: "যোগ্য শিক্ষক",       labelAr: "المعلمين المؤهلين", icon: "👨‍🏫" },
  { numEn: "6",    numBn: "৬",    numAr: "٦",    labelEn: "Departments",        labelBn: "বিভাগসমূহ",           labelAr: "الأقسام", icon: "📚" },
  { numEn: "2023", numBn: "২০২৩", numAr: "٢٠٢٣", labelEn: "Year Established",   labelBn: "প্রতিষ্ঠা সাল",       labelAr: "سنة التأسيس", icon: "🕌" },
];

export default function StatsSection() {
  const { lang } = useLanguage();
  const isBn = lang === "bn";
  const isAr = lang === "ar";

  const { data: sectionData } = useQuery({
    queryKey: ["page-section-stats"],
    queryFn: () => appClient.entities.PageSection.filter({ section_key: "stats" }),
    select: d => d[0],
  });

  const stats = useMemo(() => {
    if (sectionData?.items_json) {
      try { return JSON.parse(sectionData.items_json); } catch {}
    }
    return DEFAULT_STATS;
  }, [sectionData]);

  if (sectionData?.is_visible === false) return null;

  return (
    <section className="py-12" style={{ background: "linear-gradient(135deg,#006400 0%,#008050 50%,#005030 100%)" }}>
      <div className="max-w-5xl mx-auto px-4">
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-5 ${isAr ? 'direction-rtl' : ''}`}>
          {stats.map((s, i) => (
            <div key={i}
              className="text-center py-3 px-3 rounded-2xl cursor-default"
              style={{
                transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), background 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-6px) scale(1.06)";
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.15)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.boxShadow = "none";
              }}>
              <div className="text-3xl mb-1">{s.icon || "✨"}</div>
              <p className="text-3xl sm:text-4xl font-extrabold italic text-white"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
                {isBn ? (s.numBn || s.numEn) : isAr ? (s.numAr || s.numEn) : s.numEn}
              </p>
              <p className="text-xs text-white/65 italic mt-1 font-medium tracking-wide">
                {isBn ? (s.labelBn || s.labelEn) : isAr ? (s.labelAr || s.labelEn) : s.labelEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}