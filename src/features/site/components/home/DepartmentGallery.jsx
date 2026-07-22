import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { X, Image, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import Link from "next/link";
import { GALLERY_SELECTION_OPTIONS, matchesDepartmentValue, DEPARTMENT_PAGES } from "@/lib/departmentData";

export default function DepartmentGallery() {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isAr = lang === "ar";
  const [active, setActive] = useState("all");
  const [lightbox, setLightbox] = useState(null);

  const DEPARTMENTS = [
    { key: "all", label: lang === 'bn' ? "সকল" : lang === 'ar' ? "الكل" : "All" },
    ...GALLERY_SELECTION_OPTIONS
      .filter((department) => department !== "মাদানী নেসাব")
      .map((department) => ({
      key: department,
      label:
        department === "নূরানী" ? t.seasons.noorani :
        department === "নাজেরা" ? t.seasons.nazera :
        department === "হিফয" ? t.seasons.hifz :
        department === "হিফয শুনানি" ? t.seasons.hifzShunani :
        department === "কিতাবখানা" ? (lang === 'bn' ? "কিতাব বিভাগ" : t.seasons.kitabKhana) :
        department === "কিন্ডারগার্টেন" ? t.seasons.kindergarten :
        department === "ইংলিশ ভার্সন" ? t.seasons.englishVersion :
        department === "সাধারণ" ? (lang === 'bn' ? "সাধারণ" : lang === 'ar' ? "عام" : "General") :
        department,
    })),
  ];

  const { data: items = [] } = useQuery({
    queryKey: ["gallery-public"],
    queryFn: () => appClient.entities.Gallery.list("-created_at", 200),
    select: d => d.filter(i => i.is_published !== false && i.show_on_website !== "N"),
  });

  const filtered = active === "all"
    ? items
    : items.filter(i => {
        // Find the department in DEPARTMENT_PAGES to get all aliases
        const deptPage = DEPARTMENT_PAGES.find(p => p.departmentKey === active || p.aliases.includes(active));
        const aliases = deptPage ? deptPage.aliases : [active, active.replace(/\s+/g, " "), "কিন্ডার গার্ডেন", "Kindergarten"];
        return matchesDepartmentValue(i.category, { aliases });
      });

  return (
    <section className="py-14 bg-transparent">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold italic mb-3 tracking-tight text-[#0F766E]">
            {t.nav.gallery}
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#0F766E]/50" />
            <div className="w-2 h-2 rounded-full bg-[#0F766E]" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#0F766E]/50" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={`flex flex-wrap gap-2 justify-center mb-8 ${isAr ? 'flex-row-reverse' : ''}`}>
          {DEPARTMENTS.map(d => (
            <button
              key={d.key}
              onClick={() => setActive(d.key)}
              className="px-4 py-1.5 rounded-full text-xs font-bold italic transition-all duration-200"
              style={{
                background: active === d.key ? "linear-gradient(135deg,#0F766E,#0D9488)" : "rgba(15,118,110,0.07)",
                color: active === d.key ? "#fff" : "#0F766E",
                border: active === d.key ? "none" : "1px solid rgba(15,118,110,0.2)",
                boxShadow: active === d.key ? "0 4px 16px rgba(15,118,110,0.3)" : "none",
                transform: active === d.key ? "scale(1.05)" : "scale(1)",
              }}>
              {d.label}
            </button>
          ))}
        </div>

        {/* Preview Grid — 3 items only */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Image className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400 italic text-sm">
              {lang === 'bn' ? "এখনো কোনো ছবি যোগ করা হয়নি" : lang === 'ar' ? "لم يتم إضافة صور بعد" : "No photos added yet"}
            </p>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${isAr ? 'direction-rtl' : ''}`}>
              {filtered.slice(0, 3).map(item => (
                <div
                  key={item.id}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white border border-[#0F766E]/15 shadow-[0_4px_16px_rgba(15,118,110,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(15,118,110,0.15)]"
                  style={{
                    aspectRatio: "4/3",
                    willChange: "transform"
                  }}
                  onClick={() => setLightbox(item)}
                >
                  <img src={item.image_url} loading="lazy" alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-112" />
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(135deg,rgba(15,118,110,0.08) 0%,transparent 50%,rgba(15,118,110,0.80) 100%)" }} />
                  {/* Department badge */}
                  <div className={`absolute top-2.5 ${isAr ? 'right-2.5' : 'left-2.5'} px-2.5 py-0.5 rounded-full text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0`}
                    style={{ background: "rgba(15,118,110,0.92)", color: "#ffffff" }}>
                    {item.category === "Noorani" ? t.seasons.noorani :
                     item.category === "Nazera" ? t.seasons.nazera :
                     item.category === "Hifz" ? t.seasons.hifz :
                     item.category === "Hifz Shunani" ? t.seasons.hifzShunani :
                     item.category === "Kitab Khana" ? t.seasons.kitabKhana :
                     item.category === "Kindergarten" ? t.seasons.kindergarten :
                     item.category === "English Version" ? (lang === 'bn' ? "ইংলিশ ভার্সন" : lang === 'ar' ? "النسخة الإنجليزية" : "English Version") :
                     (lang === 'bn' ? "সাধারণ" : lang === 'ar' ? "عام" : "General")}
                  </div>
                  <p className={`absolute bottom-0 left-0 right-0 p-3 text-sm font-bold italic text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 truncate ${isAr ? 'text-right' : ''}`}>
                    {lang === "bn" ? (item.title_bn || item.title) : lang === "ar" ? (item.title_ar || item.title) : item.title}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/gallery">
                <button
                  className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full font-bold italic text-sm text-white transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,118,110,0.4)] shadow-[0_4px_16px_rgba(15,118,110,0.25)]"
                  style={{
                    background: "linear-gradient(135deg,#0F766E,#0D9488)",
                    willChange: "transform"
                  }}>
                  {lang === 'bn' ? "সব ছবি দেখুন" : lang === 'ar' ? "عرض الكل" : "See More"} <ArrowRight className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
                </button>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightbox(null)}>
          <button className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} w-10 h-10 rounded-full flex items-center justify-center text-white`}
            style={{ background: "rgba(255,255,255,0.15)" }}
            onClick={() => setLightbox(null)}>
            <X className="h-5 w-5" />
          </button>
          <div onClick={e => e.stopPropagation()} className="max-w-3xl w-full">
            <img src={lightbox.image_url} loading="lazy" alt={lightbox.title} className="w-full rounded-xl object-contain max-h-[80vh]" />
            <p className="text-center text-white font-bold italic mt-3">
              {lang === "bn" ? (lightbox.title_bn || lightbox.title) : lang === "ar" ? (lightbox.title_ar || lightbox.title) : lightbox.title}
            </p>
            <p className="text-center text-white/50 text-xs italic mt-1">{lightbox.department}</p>
          </div>
        </div>
      )}
    </section>
  );
}
