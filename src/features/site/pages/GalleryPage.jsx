import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { X, Image, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function GalleryPage() {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isBn = lang === "bn";
  const isAr = lang === "ar";
  const [active, setActive] = useState("all");
  const [activeSession, setActiveSession] = useState("all");
  const [lightbox, setLightbox] = useState(null);
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branch_id");

  const { data: dbCategories = [] } = useQuery({
    queryKey: ["gallery-categories-public"],
    queryFn: () => appClient.entities.GalleryCategory.list("sort_order", 100),
  });

  const categories = dbCategories.length > 0 ? dbCategories : [
    { id: 1, name_en: "Noorani", name_bn: "নূরানী", name_ar: "نوراني" },
    { id: 2, name_en: "Nazera", name_bn: "নাজেরা", name_ar: "ناظرة" },
    { id: 3, name_en: "Hifz", name_bn: "হিফয", name_ar: "تحفيظ" },
    { id: 4, name_en: "Hifz Shunani", name_bn: "হিফয শুনানি", name_ar: "تسميع تحفيظ" },
    { id: 5, name_en: "Kitab Khana", name_bn: "কিতাবখানা", name_ar: "كتاب خانة" },
    { id: 6, name_en: "Kindergarten", name_bn: "কিন্ডারগার্টেন", name_ar: "روضة الأطفال" },
    { id: 7, name_en: "General", name_bn: "সাধারণ", name_ar: "عام" },
    { id: 8, name_en: "English Version", name_bn: "ইংলিশ ভার্সন", name_ar: "النسخة الإنجليزية" }
  ];

  const DEPARTMENTS = [
    { key: "all", en: "All", bn: "সকল", ar: "الكل" },
    ...categories.map(c => ({
      key: c.name_en,
      en: c.name_en,
      bn: c.name_bn,
      ar: c.name_ar
    }))
  ];

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["gallery-all"],
    queryFn: () => appClient.entities.Gallery.list("-created_at", 500),
    select: d => d.filter(i => i.is_published !== false),
    staleTime: 15 * 60 * 1000,
  });

  // Base filter by branch if passed
  const branchFiltered = branchId
    ? items.filter(i => String(i.branch_id) === String(branchId))
    : items;

  // Category filtering with "English Version" tab exclusion rule
  const categoryFiltered = active === "all"
    ? branchFiltered.filter(i => {
        // Exclude English Version category from General All Section
        const categoryName = String(i.category || "").toLowerCase();
        return categoryName !== "english version" && categoryName !== "english-version";
      })
    : branchFiltered.filter(i => {
        const catName = String(i.category || "").toLowerCase();
        const activeName = active.toLowerCase();
        return catName === activeName || 
               (activeName === "general" && catName === "সাধারণ") ||
               (activeName === "সাধারণ" && catName === "general") ||
               (activeName === "english version" && catName === "ইংলিশ ভার্সন") ||
               (activeName === "english-version" && catName === "english version");
      });

  const finalFiltered = activeSession === "all"
    ? categoryFiltered
    : categoryFiltered.filter(i => String(i.class_id) === String(activeSession));

  const uniqueSessions = Array.from(new Set(branchFiltered.map(i => i.class_id).filter(Boolean)));

  const getCategoryLabel = (categoryName) => {
    if (!categoryName) return "";
    const cat = categories.find(c => 
      String(c.name_en).toLowerCase() === String(categoryName).toLowerCase() ||
      String(c.name_bn).toLowerCase() === String(categoryName).toLowerCase() ||
      String(c.name_ar).toLowerCase() === String(categoryName).toLowerCase()
    );
    if (cat) {
      return lang === "bn" ? cat.name_bn : lang === "ar" ? cat.name_ar : cat.name_en;
    }
    return categoryName;
  };

  return (
    <div className={`min-h-screen bg-white ${isAr ? 'direction-rtl' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Back */}
        <div className={isAr ? 'text-right' : ''}>
          <Link href="/"
            className={`inline-flex items-center gap-2 text-sm font-bold italic mb-8 transition-all duration-200 hover:text-emerald-700 ${isAr ? 'flex-row-reverse' : ''}`}
            style={{ color: "#006400" }}>
            <ArrowLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
            {t.common.backHome}
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold mb-4 uppercase tracking-widest bg-emerald-50 border border-emerald-200 text-emerald-700">
            {t.galleryPage.badge}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold italic text-slate-900 mb-3">
            {t.galleryPage.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto italic">
            {t.galleryPage.subtitle}
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-amber-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={`flex flex-wrap gap-2.5 justify-center mb-12 ${isAr ? 'flex-row-reverse' : ''}`}>
          {DEPARTMENTS.map(d => (
            <button
              key={d.key}
              onClick={() => setActive(d.key)}
              className="px-5 py-2 rounded-xl text-xs font-bold italic transition-all duration-300"
              style={{
                background: active === d.key ? "linear-gradient(135deg,#006400,#008050)" : "white",
                color: active === d.key ? "#fff" : "#475569",
                border: "1px solid",
                borderColor: active === d.key ? "transparent" : "#e2e8f0",
                boxShadow: active === d.key ? "0 4px 12px rgba(0,100,60,0.25)" : "none",
                transform: active === d.key ? "scale(1.05)" : "scale(1)",
              }}>
              {isBn ? d.bn : isAr ? d.ar : d.en}
            </button>
          ))}
        </div>
        
        {/* Session Filter */}
        {uniqueSessions.length > 0 && (
          <div className="flex justify-center mb-12">
            <select
              value={activeSession}
              onChange={(e) => setActiveSession(e.target.value)}
              className="px-4 py-2 border border-emerald-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
            >
              <option value="all">All Sessions / Classes</option>
              {uniqueSessions.map(sessionId => (
                <option key={sessionId} value={sessionId}>{sessionId === 'all' ? 'General' : `Class ${sessionId}`}</option>
              ))}
            </select>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-red-50 rounded-3xl border border-dashed border-red-200">
            <p className="text-red-500 italic font-medium">{t.common.error || "Failed to load gallery."}</p>
          </div>
        ) : finalFiltered.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <Image className="h-14 w-14 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 italic font-medium">{t.galleryPage.noPhotos}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {finalFiltered.map(item => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-md bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                style={{ aspectRatio: "1/1" }}
                onClick={() => setLightbox(item)}
              >
                <img src={item.image_url} loading="lazy" alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                
                {/* Overlays */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                  <span className={`inline-block w-fit px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-400 text-slate-900 mb-2 ${isAr ? 'mr-auto ml-0' : ''}`}>
                    {getCategoryLabel(item.category)}
                  </span>
                  <p className={`text-sm font-bold text-white italic truncate ${isAr ? 'text-right' : ''}`}>
                    {lang === "bn" ? (item.title_bn || item.title) : lang === "ar" ? (item.title_ar || item.title) : item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 backdrop-blur-md"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightbox(null)}>
          
          <button className="absolute top-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-all active:scale-90"
            onClick={() => setLightbox(null)}>
            <X className="h-6 w-6" />
          </button>
 
          <div onClick={e => e.stopPropagation()} className="max-w-4xl w-full flex flex-col gap-4">
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl">
              <img src={lightbox.image_url} loading="lazy" alt={lightbox.title}
                className="w-full h-auto max-h-[80vh] object-contain mx-auto" />
            </div>
            <div className="text-center px-4">
              <p className="text-xl font-bold italic text-white mb-1">
                {lang === "bn" ? (lightbox.title_bn || lightbox.title) : lang === "ar" ? (lightbox.title_ar || lightbox.title) : lightbox.title}
              </p>
              <p className="text-sm font-medium italic text-amber-500 uppercase tracking-widest">{getCategoryLabel(lightbox.category)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}