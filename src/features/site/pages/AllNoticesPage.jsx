import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { bn, arSA } from "date-fns/locale";
import { Calendar, ChevronRight, Search, Loader2, ArrowLeft } from 'lucide-react';

const categoryTranslations = {
  bn: {
    all: "সকল নোটিশ",
    academic: "একাডেমিক নোটিশ",
    admission: "ভর্তি নোটিশ",
    examination: "পরীক্ষা সংক্রান্ত নোটিশ",
    holiday: "ছুটির নোটিশ",
    general: "সাধারণ নোটিশ",
  },
  en: {
    all: "All Notices",
    academic: "Academic Notices",
    admission: "Admission Notices",
    examination: "Examination Notices",
    holiday: "Holiday Notices",
    general: "General Notices",
  },
  ar: {
    all: "جميع الإشعارات",
    academic: "الإشعارات الأكاديمية",
    admission: "إشعارات القبول",
    examination: "إشعارات الامتحانات",
    holiday: "إشعارات العطلات",
    general: "إشعارات عامة",
  }
};

const getCategoryLabel = (category, lang) => {
  const langKey = lang || 'en';
  const catKey = category.toLowerCase();
  if (categoryTranslations[langKey] && categoryTranslations[langKey][catKey]) {
    return categoryTranslations[langKey][catKey];
  }
  // Custom categories helper
  if (langKey === 'bn') {
    return category + " নোটিশ";
  }
  if (langKey === 'ar') {
    return "إشعار " + category;
  }
  return category + " Notices";
};

export default function AllNoticesPage() {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isAr = lang === "ar";
  const isBn = lang === "bn";
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: notices = [], isLoading: loading } = useQuery({
    queryKey: ["notices-public-all"],
    queryFn: () => appClient.entities.Notice.list("-created_date", 500),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.filter((n) => n.is_active && n.status !== "draft"),
  });

  const getNoticeDisplayDate = (notice) => {
    return notice.publish_date || notice.created_date || notice.created_at;
  };

  const defaultCategories = ['Academic', 'Admission', 'Examination', 'Holiday', 'General'];

  // Dynamically load category options from the DB notices list
  const dynamicCategories = useMemo(() => {
    const cats = notices.map(n => n.category).filter(Boolean);
    const normalizedCats = cats.map(c => {
      const standard = defaultCategories.find(dc => dc.toLowerCase() === c.toLowerCase());
      return standard || c;
    });
    const uniqueCats = [...new Set(normalizedCats)];
    return [...new Set([...defaultCategories, ...uniqueCats])];
  }, [notices]);

  // Client-side filtering & sorting newest-first by publish date
  const filteredNotices = useMemo(() => {
    let filtered = notices;

    // Category Filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(notice => {
        const cat = notice.category || 'General';
        return cat.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    // Search Term Filter (title, notice number, category)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(notice => {
        const title = isBn ? (notice.title_bn || notice.title) : isAr ? (notice.title_ar || notice.title) : (notice.title_en || notice.title);
        const body = isBn ? (notice.body_bn || notice.body) : isAr ? (notice.body_ar || notice.body) : (notice.body_en || notice.body);
        const num = notice.notice_number || '';
        const cat = notice.category || 'General';

        return title?.toLowerCase().includes(term) ||
               body?.toLowerCase().includes(term) ||
               num?.toLowerCase().includes(term) ||
               cat?.toLowerCase().includes(term);
      });
    }

    // Sort by Publish/Create Date Newest First
    return [...filtered].sort((a, b) => {
      const dateA = new Date(getNoticeDisplayDate(a));
      const dateB = new Date(getNoticeDisplayDate(b));
      return dateB.getTime() - dateA.getTime();
    });
  }, [notices, searchTerm, selectedCategory, lang, isBn, isAr]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isBn) return format(date, "dd MMMM, yyyy", { locale: bn });
      if (isAr) return format(date, "dd MMMM, yyyy", { locale: arSA });
      return format(date, "MMMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg,#0e2e1f 0%,#144733 50%,#0e2e1f 100%)" }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-white/70 font-medium italic">{t.notices.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-16 px-4 ${isAr ? 'direction-rtl' : ''}`} style={{ background: "linear-gradient(160deg,#0e2e1f 0%,#144733 50%,#0e2e1f 100%)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <div className={isAr ? 'text-right' : 'text-left'}>
          <Link href="/"
            className={`inline-flex items-center gap-2 text-sm font-bold italic mb-10 transition-all duration-300 hover:text-white ${isAr ? 'flex-row-reverse' : ''}`}
            style={{ color: "#4afa9a" }}>
            <ArrowLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
            {t.common.backHome}
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold mb-4 uppercase tracking-widest"
            style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.35)", color: "#D4AF37" }}>
            {lang === 'bn' ? 'রহমানিয়া নোটিশ বোর্ড' : isAr ? 'لوحة إعلانات الرحمانية' : 'Rahmania Notice Board'}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold italic text-white mb-4">
            {t.notices.allNotices}
          </h1>
          <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto italic leading-relaxed">
            {t.notices.subtitle}
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-yellow-400/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-yellow-400/30" />
          </div>
        </div>

        {/* Teacher Page Style Filtering System */}
        <div className="flex flex-wrap gap-3.5 justify-center mb-12 border-b border-white/10 pb-8 relative z-40">
          {/* All Notices Tab */}
          <button
            onClick={() => {
              setSelectedCategory('all');
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold italic transition-all duration-200 ${
              selectedCategory === 'all'
                ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 shadow-[0_4px_16px_rgba(245,158,11,0.3)] scale-105"
                : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {lang === "bn" ? "সকল নোটিশ" : lang === "ar" ? "جميع الإشعارات" : "All Notices"}
          </button>

          {/* Dynamic Category Tabs */}
          {dynamicCategories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            const label = getCategoryLabel(cat, lang);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold italic transition-all duration-200 ${
                  isSelected
                    ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 shadow-[0_4px_16px_rgba(245,158,11,0.3)] scale-105"
                    : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10 backdrop-blur-md">
          <div className="relative">
            <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-white/40 w-5 h-5`} />
            <input
              type="text"
              placeholder={t.notices.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isAr ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} py-4 bg-white/5 border border-white/10 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 text-white rounded-2xl text-sm font-medium italic transition-all placeholder:text-white/40`}
            />
          </div>
        </div>

        {/* Notices Grid */}
        {filteredNotices.length === 0 ? (
          <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm animate-fade-in">
            <Search className="h-16 w-16 mx-auto text-white/10 mb-4" />
            <p className="text-white/30 italic text-lg">{t.notices.noNoticesFound}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNotices.map((notice) => {
              const title = isBn ? (notice.title_bn || notice.title) : isAr ? (notice.title_ar || notice.title) : (notice.title_en || notice.title);
              const body = isBn ? (notice.body_bn || notice.body) : isAr ? (notice.body_ar || notice.body) : (notice.body_en || notice.body);
              const displayDate = getNoticeDisplayDate(notice);
              const category = notice.category || 'General';
              const hasAttachment = !!notice.attachment_url || !!notice.file_url;
              const attachmentUrl = notice.attachment_url || notice.file_url;

              return (
                <div 
                  key={notice.id} 
                  className="group relative rounded-3xl p-8 bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:border-amber-500/40 flex flex-col justify-between animate-fade-in"
                >
                  <div>
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-[100px] pointer-events-none" />

                    {/* Card Header Info */}
                    <div className={`flex items-center justify-between gap-3 mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {getCategoryLabel(category, lang)}
                      </span>
                      <div className={`flex items-center text-white/50 text-[10px] font-bold italic ${isAr ? 'flex-row-reverse' : ''}`}>
                        <Calendar className="w-3.5 h-3.5 mx-1 text-amber-400" />
                        {formatDate(displayDate)}
                      </div>
                    </div>

                    {/* Notice Number */}
                    {notice.notice_number && (
                      <div className={`text-[10px] text-emerald-400 font-bold mb-2 italic ${isAr ? 'text-right' : 'text-left'}`}>
                        #{notice.notice_number}
                      </div>
                    )}

                    {/* Notice Title */}
                    <h3 className={`text-xl font-bold text-white mb-4 line-clamp-2 group-hover:text-amber-400 transition-colors ${isAr ? 'text-right' : 'text-left'}`}>
                      {title}
                    </h3>

                    {/* Notice Description */}
                    <p className={`text-white/60 text-sm mb-6 line-clamp-3 italic leading-relaxed ${isAr ? 'text-right' : 'text-left'}`}>
                      {truncateText(body)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className={`mt-auto pt-4 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                    <Link 
                      href={`/notice/${notice.id}`}
                      className={`inline-flex items-center gap-2 text-amber-400 font-bold italic text-sm hover:text-amber-300 transition-all ${isAr ? 'flex-row-reverse' : ''}`}
                    >
                      {t.notices.readMore}
                      <ChevronRight className={`w-4 h-4 transition-transform ${isAr ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                    </Link>

                    {hasAttachment && (
                      <a 
                        href={attachmentUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white hover:bg-amber-500 hover:text-slate-900 text-xs font-bold italic transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        {lang === 'bn' ? 'ডাউনলোড' : isAr ? 'تحميل' : 'Download'}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Results Count */}
        {filteredNotices.length > 0 && (
          <div className="mt-12 text-center text-white/40 text-sm font-bold italic">
            {filteredNotices.length} {t.common.foundNotices}
          </div>
        )}
      </div>
    </div>
  );
}
