import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Bell } from 'lucide-react';
import { format } from "date-fns";
import { bn, arSA } from "date-fns/locale";
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";

// Fallback slides
const DEFAULT_IMAGES = [
  "/slids1.webp",
  "/slids2.webp",
  "/slids3.webp",
  "/slids4.webp",
];

export default function HeroSection({ notices: propNotices }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isAr = lang === "ar";
  const isBn = lang === "bn";
  const isEn = lang === "en";
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const { data: fetchedNotices = [] } = useQuery({
    queryKey: ["hero-notices-public"],
    queryFn: () => appClient.entities.Notice.list("-created_date", 50),
    enabled: !propNotices || propNotices.length === 0,
  });

  const notices = propNotices && propNotices.length > 0 ? propNotices : fetchedNotices;

  const pinned = useMemo(() => {
    return (notices || []).filter(n => n.pin_to_top);
  }, [notices]);

  const scrolling = useMemo(() => {
    const list = notices || [];
    if (pinned.length > 0) {
      const firstPinnedId = pinned[0].id;
      return list.filter(n => n.id !== firstPinnedId);
    }
    return list;
  }, [notices, pinned]);

  const maxVisibleItems = pinned.length > 0 ? 2 : 3;
  const shouldScroll = scrolling.length > maxVisibleItems;

  const { data: dbSlides = [] } = useQuery({
    queryKey: ["hero-slides-public"],
    queryFn: () => appClient.entities.HeroSlide.list("sort_order", 100),
  });

  const IMAGES = dbSlides.filter(s => s.is_active).length > 0
    ? dbSlides.filter(s => s.is_active).map(s => s.image_url)
    : DEFAULT_IMAGES;

  useEffect(() => {
    if (IMAGES.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [IMAGES.length]);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(0);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchEnd || touchEnd === 0) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % IMAGES.length);
    } else if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const getNoticeDisplayDate = (notice) => {
    return notice.publish_date || notice.created_date || notice.created_at;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (lang === 'bn') return format(date, "dd MMMM, yyyy", { locale: bn });
      if (lang === 'ar') return format(date, "dd MMMM, yyyy", { locale: arSA });
      return format(date, "MMMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const isNew = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = (now - date) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-[#f8fafc] py-8 sm:py-12 px-4 transition-colors duration-300 overflow-x-hidden font-serif">
      <div className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 ${isAr ? 'lg:flex lg:flex-row-reverse' : ''}`}>
        
        {/* Left Side: Premium Image Slider (col-span-8) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-8 lg:flex-1 relative h-[300px] sm:h-[400px] lg:h-[520px] w-full rounded-3xl overflow-hidden shadow-2xl group border-4 border-white"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {IMAGES.map((img, idx) => (
            <div 
              key={idx}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${currentSlide === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
            >
              <Image
                src={img}
                alt={`Slider ${idx + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 67vw"
                priority={idx === 0}
                loading={idx === 0 ? "eager" : "lazy"}
                className="object-cover"
                unoptimized={/^https?:\/\//.test(img)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
          ))}
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
            {IMAGES.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${currentSlide === idx ? 'bg-white w-10 shadow-lg' : 'bg-white/40 hover:bg-white/60 w-2'}`}
              />
            ))}
          </div>
          
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + IMAGES.length) % IMAGES.length)}
            className={`absolute ${isAr ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:bg-white hover:text-[#12715B] transition-all duration-300 hover:scale-110 z-20`}
          >
            <ChevronRight className={`w-6 h-6 ${isAr ? '' : 'rotate-180'}`} />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % IMAGES.length)}
            className={`absolute ${isAr ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:bg-white hover:text-[#12715B] transition-all duration-300 hover:scale-110 z-20`}
          >
            <ChevronRight className={`w-6 h-6 ${isAr ? 'rotate-180' : ''}`} />
          </button>
        </motion.div>

        {/* Right Side: Notices (Important Updates) */}
        <div
          className="lg:col-span-4 bg-white rounded-[32px] flex flex-col h-[450px] lg:h-[520px] overflow-hidden shadow-2xl border border-slate-100 animate-in slide-in-from-top duration-500 transition-all duration-300 hover:shadow-lg"
        >
          {/* Header */}
          <div className={`px-8 pt-8 pb-4 ${isAr ? 'text-right' : ''}`}>
            <motion.h2
              initial={{ opacity: 0, y: -14, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-2xl font-black tracking-tight text-[#1e293b] flex items-center gap-3"
            >
              <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#12715B]/10">
                <Bell className="w-5 h-5 text-[#12715B] animate-glow-pulse" />
              </span>
              {t.hero.importantUpdates}
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              style={{ transformOrigin: isAr ? "right" : "left" }}
              className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#12715B] via-[#D4AF37] to-[#12715B]/30"
            />
          </div>

          <div className="flex-1 overflow-hidden relative px-6">
            <style>{`
              @keyframes marquee-scroll-vertical {
                0% {
                  transform: translateY(0);
                }
                100% {
                  transform: translateY(-50%);
                }
              }
              .animate-marquee-vertical {
                animation: marquee-scroll-vertical 30s linear infinite;
              }
              .animate-marquee-vertical:hover {
                animation-play-state: paused;
              }
            `}</style>

            {/* 1. Static Pinned Notice at the top */}
            {pinned.length > 0 && (
              <div className="mb-3">
                <Link
                  href={`/notice/${pinned[0].id}`}
                  className={`block p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-300 group h-[96px] overflow-hidden ${isAr ? 'text-right' : 'text-left'} relative`}
                >
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-500 text-white text-[8px] font-black uppercase tracking-wider">
                    {lang === 'bn' ? 'পিনড' : isAr ? 'مثبت' : 'Pinned'}
                  </span>
                  <p className="text-xs text-slate-500 mb-1">
                    {formatDate(getNoticeDisplayDate(pinned[0]))}
                  </p>
                  <h4 className="text-sm md:text-base font-semibold leading-snug text-slate-800 group-hover:text-[#12715B] transition-colors line-clamp-2 break-words">
                    📌 {isBn ? (pinned[0].title_bn || pinned[0].title) : isAr ? (pinned[0].title_ar || pinned[0].title) : (pinned[0].title_en || pinned[0].title)}
                  </h4>
                </Link>
              </div>
            )}

            {/* 2. Scrolling Notices viewport */}
            {scrolling.length > 0 ? (
              <div 
                className="overflow-hidden relative"
                style={{ height: pinned.length > 0 ? '204px' : '312px' }}
              >
                <div className={shouldScroll ? "flex flex-col animate-marquee-vertical" : "flex flex-col gap-3"}>
                  {/* Group 1 */}
                  <div className="flex flex-col gap-3 pb-3">
                    {scrolling.map((notice, idx) => (
                      <Link
                        key={notice.id || idx}
                        href={`/notice/${notice.id}`}
                        className={`block p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-300 group h-[96px] overflow-hidden ${isAr ? 'text-right' : 'text-left'}`}
                      >
                        <p className="text-xs text-slate-500 mb-1">
                          {formatDate(getNoticeDisplayDate(notice))}
                        </p>
                        <h4 className="text-sm md:text-base font-semibold leading-snug text-slate-800 group-hover:text-[#12715B] transition-colors line-clamp-2 break-words">
                          {isBn ? (notice.title_bn || notice.title) : isAr ? (notice.title_ar || notice.title) : (notice.title_en || notice.title)}
                        </h4>
                      </Link>
                    ))}
                  </div>
                  {/* Group 2 (Duplicate for seamless infinite marquee scroll loop) */}
                  {shouldScroll && (
                    <div className="flex flex-col gap-3 pb-3" aria-hidden="true">
                      {scrolling.map((notice, idx) => (
                        <Link
                          key={`dup-${notice.id || idx}`}
                          href={`/notice/${notice.id}`}
                          className={`block p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-300 group h-[96px] overflow-hidden ${isAr ? 'text-right' : 'text-left'}`}
                        >
                          <p className="text-xs text-slate-500 mb-1">
                            {formatDate(getNoticeDisplayDate(notice))}
                          </p>
                          <h4 className="text-sm md:text-base font-semibold leading-snug text-slate-800 group-hover:text-[#12715B] transition-colors line-clamp-2 break-words">
                            {isBn ? (notice.title_bn || notice.title) : isAr ? (notice.title_ar || notice.title) : (notice.title_en || notice.title)}
                          </h4>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <Bell className="w-8 h-8 opacity-20" />
                {t.hero.noNotices}
              </div>
            )}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
          </div>

          {/* Footer */}
          <div className="p-6 text-center border-t border-slate-50">
            <Link
              href="/notices"
              className="inline-flex items-center gap-2 font-black text-sm text-[#12715B] hover:gap-3 transition-all duration-300 active:scale-95"
            >
              {t.hero.seeAllNotices}
              <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
