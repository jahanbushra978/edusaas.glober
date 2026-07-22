'use client'

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { bn, arSA } from "date-fns/locale";
import { ArrowLeft, Calendar, User, Tag, Loader2, ArrowRight } from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize-html';

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
  // Custom categories
  if (langKey === 'bn') {
    return category + " নোটিশ";
  }
  if (langKey === 'ar') {
    return "إشعار " + category;
  }
  return category + " Notices";
};

export default function NoticeDetailsPage() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isAr = lang === "ar";
  const isBn = lang === "bn";

  const { data: notice, isLoading: loading } = useQuery({
    queryKey: ["notice-detail", id],
    queryFn: () => appClient.entities.Notice.get(id),
    staleTime: 10 * 60 * 1000,
    enabled: !!id,
  });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium italic">{t.notices.loading}</p>
        </div>
      </div>
    );
  }

  // Security: Check if notice is active and not a draft
  if (!notice || !notice.is_active || notice.status === 'draft') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
            <Tag className="w-10 h-10 text-slate-300" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-6">{t.notices.noNoticeFound || "Notice not found"}</h1>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold italic shadow-lg shadow-emerald-700/20 hover:bg-emerald-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            {t.common.backHome}
          </Link>
        </div>
      </div>
    );
  }

  const displayDate = notice.publish_date || notice.created_date || notice.created_at;
  const category = notice.category || 'General';

  return (
    <div className={`min-h-screen bg-slate-50 py-12 px-4 ${isAr ? 'direction-rtl' : ''}`}>
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <div className={`flex items-center justify-between mb-10 ${isAr ? 'flex-row-reverse' : ''}`}>
          <Link 
            href="/"
            className={`inline-flex items-center gap-2 text-slate-500 font-bold italic hover:text-emerald-700 transition-all ${isAr ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            {t.common.backHome}
          </Link>
          <Link 
            href="/notices"
            className="text-emerald-700 hover:text-emerald-800 transition-all font-bold italic border-b-2 border-emerald-700/20 pb-0.5"
          >
            {t.notices.allNotices}
          </Link>
        </div>

        {/* Notice Content */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          {/* Header Gradient */}
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-10 sm:p-14">
            <div className={`flex flex-col gap-6 ${isAr ? 'text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {getCategoryLabel(category, lang)}
                </span>
                <div className={`flex items-center gap-2 text-white/60 text-xs font-bold italic ${isAr ? 'flex-row-reverse' : ''}`}>
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(displayDate)}</span>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold italic leading-tight">
                {isBn ? (notice.title_bn || notice.title) : isAr ? (notice.title_ar || notice.title) : (notice.title_en || notice.title)}
              </h1>
              {notice.notice_number && (
                <div className="text-sm font-bold text-amber-400">
                  {lang === 'bn' ? 'নোটিশ নম্বর' : isAr ? 'رقم الإشعار' : 'Notice Number'}: #{notice.notice_number}
                </div>
              )}
            </div>
          </div>

          {/* Image */}
          {notice.image && (
            <div className="w-full h-[300px] sm:h-[450px] overflow-hidden border-b border-slate-100">
              <img 
                src={notice.image} loading="lazy" 
                alt="Notice"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Body */}
          <div className="p-10 sm:p-14">
            <div className={`prose prose-lg max-w-none ${isAr ? 'text-right' : ''}`}>
              <div 
                className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base sm:text-lg italic font-medium"
                dangerouslySetInnerHTML={{ 
                  __html: sanitizeHtml(
                    (isBn ? (notice.body_bn || notice.body) : isAr ? (notice.body_ar || notice.body) : (notice.body_en || notice.body))
                      ?.replace(/\n/g, '<br />') || ''
                  )
                }}
              />
            </div>
          </div>

          {/* Attachment / Download section */}
          {(notice.attachment_url || notice.file_url) && (
            <div className="border-t border-slate-100 p-10 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                </svg>
                {lang === 'bn' ? 'সংযুক্তি / ফাইল ডাউনলোড করুন' : isAr ? 'تحميل المرفقات / الملفات' : 'Download Attachments / Files'}
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs uppercase">
                    {(notice.attachment_name || notice.attachment_url || notice.file_url || 'PDF').split('.').pop() || 'PDF'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate max-w-[250px] sm:max-w-[400px]">
                      {notice.attachment_name || 'Notice_Document.pdf'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {lang === 'bn' ? 'অফিসিয়াল নোটিশ ফাইল' : isAr ? 'ملف إشعار رسمي' : 'Official Notice File'}
                    </p>
                  </div>
                </div>
                <a 
                  href={notice.attachment_url || notice.file_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold italic shadow-lg shadow-emerald-700/20 hover:bg-emerald-700 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  {lang === 'bn' ? 'ডাউনলোড' : isAr ? 'تحميل' : 'Download'}
                </a>
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="border-t border-slate-100 p-10 bg-slate-50">
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 text-slate-500 font-bold italic text-sm ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <User className="w-5 h-5" />
                </div>
                <span>{t.notices.publishedBy}: <span className="text-slate-900">{notice.author || 'Admin'}</span></span>
              </div>
              <div className="text-xs font-bold italic text-slate-400 uppercase tracking-widest">
                {lang === 'bn' ? 'আপডেট' : isAr ? 'محدث' : 'Updated'}: {formatDate(notice.updated_date || notice.created_date || notice.created_at)}
              </div>
            </div>
          </div>
        </div>

        {/* More Notices CTA */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="h-px w-full bg-slate-200" />
          <Link 
            href="/notices"
            className={`inline-flex items-center gap-3 bg-emerald-700 text-white px-10 py-4 rounded-2xl font-bold italic shadow-xl shadow-emerald-800/20 hover:bg-emerald-800 hover:-translate-y-1 transition-all ${isAr ? 'flex-row-reverse' : ''}`}
          >
            {t.common.moreNotices}
            {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </Link>
        </div>
      </div>
    </div>
  );
}
