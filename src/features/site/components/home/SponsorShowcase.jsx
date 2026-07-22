"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";

// ─── Helpers ────────────────────────────────────────────────────────────────
const isScheduleActive = (sponsor) => {
  const now = new Date();
  if (sponsor.start_date && new Date(sponsor.start_date) > now) return false;
  if (sponsor.end_date   && new Date(sponsor.end_date)   < now) return false;
  return true;
};

// ─── Analytics Mutations ──────────────────────────────────────────────────
function useTrackView(id) {
  const tracked = useRef(new Set());
  const { mutate } = useMutation({
    mutationFn: async (sponsorId) => {
      const { data } = await appClient.entities.Sponsor.get(sponsorId);
      if (!data) return;
      await appClient.entities.Sponsor.update(sponsorId, {
        total_views: (data.total_views || 0) + 1,
      });
    },
  });
  return useCallback((sponsorId) => {
    if (!sponsorId || tracked.current.has(sponsorId)) return;
    tracked.current.add(sponsorId);
    mutate(sponsorId);
  }, [mutate]);
}

function useTrackClick() {
  const { mutate } = useMutation({
    mutationFn: async (sponsorId) => {
      const { data } = await appClient.entities.Sponsor.get(sponsorId);
      if (!data) return;
      await appClient.entities.Sponsor.update(sponsorId, {
        total_clicks: (data.total_clicks || 0) + 1,
      });
    },
  });
  return mutate;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SponsorShowcase({ sponsors: propSponsors }) {
  const { lang } = useLanguage();
  const isBn = lang === "bn";
  const isAr = lang === "ar";

  const { data: fetchedSponsors = [] } = useQuery({
    queryKey: ["sponsors-public"],
    queryFn: () => appClient.entities.Sponsor.list("priority", 50),
    select: (d) =>
      d
        .filter((s) => s.is_active && isScheduleActive(s))
        .sort((a, b) => (a.priority || 0) - (b.priority || 0)),
    staleTime: 5 * 60 * 1000,
    enabled: propSponsors === undefined,
    retry: 1,
  });

  const allSponsors = propSponsors || fetchedSponsors;

  const activeSponsors = allSponsors.map((s) => ({
    ...s,
    title: s["title_" + lang] || s.title || "",
    company_name: s["company_name_" + lang] || s.company_name || "",
    description: s["description_" + lang] || s.description || "",
    button_text: s["button_text_" + lang] || s.button_text || "",
  }));

  const sponsors = activeSponsors;

  const [current, setCurrent]       = useState(0);
  const [direction, setDirection]   = useState(1);
  const [dragging, setDragging]     = useState(false);
  const dragStartX                  = useRef(0);
  const autoRef                     = useRef(null);

  const trackView  = useTrackView();
  const trackClick = useTrackClick();

  // ── Auto-slide ────────────────────────────────────────────────────────────
  const resetAuto = useCallback(() => {
    clearInterval(autoRef.current);
    if (sponsors.length > 1) {
      autoRef.current = setInterval(() => {
        setDirection(1);
        setCurrent((c) => (c + 1) % sponsors.length);
      }, 5000);
    }
  }, [sponsors.length]);

  useEffect(() => {
    resetAuto();
    return () => clearInterval(autoRef.current);
  }, [resetAuto]);

  // ── Track views when slide changes ───────────────────────────────────────
  useEffect(() => {
    if (sponsors[current]?.id) {
      trackView(sponsors[current].id);
    }
  }, [current, allSponsors, trackView]);

  // ── Keyboard navigation ──────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft")  { prev(); resetAuto(); }
      if (e.key === "ArrowRight") { next(); resetAuto(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [sponsors.length, current, resetAuto]);

  if (sponsors.length === 0) return null;

  function prev() {
    setDirection(-1);
    setCurrent((c) => (c - 1 + sponsors.length) % sponsors.length);
  }
  
  function next() {
    setDirection(1);
    setCurrent((c) => (c + 1) % sponsors.length);
  }

  function goTo(i) {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
    resetAuto();
  }

  // ── Touch / Mouse swipe ────────────────────────────────────────────────
  const handleDragStart = (e) => {
    setDragging(true);
    dragStartX.current = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
  };
  const handleDragEnd = (e) => {
    if (!dragging) return;
    setDragging(false);
    const endX = e.type === "touchend" ? e.changedTouches[0].clientX : e.clientX;
    const diff  = dragStartX.current - endX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      resetAuto();
    }
  };

  if (!sponsors || sponsors.length === 0) {
    return null;
  }

  const slide = sponsors[current];

  const slideVariants = {
    enter:  (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center:              { x: 0, opacity: 1 },
    exit:   (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  const handleCTAClick = () => {
    if (slide.id) trackClick(slide.id);
    if (slide.target_url) {
      const url = slide.target_url.startsWith("http")
        ? slide.target_url
        : "https://" + slide.target_url;
      window.open(url, "_blank", "noopener noreferrer");
    }
  };

  return (
    <section
      className="py-16 md:py-24 px-4 overflow-hidden transition-all duration-300 bg-transparent"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl mx-auto">
        {/* ── Wrapper box ─────────────────────────────────────────────────── */}
        <div
          className="relative rounded-[28px] md:rounded-[30px] p-5 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)] border border-slate-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          style={{ willChange: "transform" }}
        >
          {/* ── Sponsored badge (top-left) ──────────────────────────────────── */}
          <div className="absolute top-4 left-4 z-30">
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider"
              style={{
                color: "#D4AF37",
                background: "rgba(0, 47, 28, 0.9)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                backdropFilter: "blur(4px)",
              }}
            >
              <Sparkles className="w-2.5 h-2.5" />
              {isBn ? "বিজ্ঞাপন" : "Sponsored"}
            </div>
          </div>

          {/* ── Slide Count pill ─────────────────────────────────────────── */}
          {sponsors.length > 1 && (
            <div className="absolute top-4 right-4 z-30">
              <div
                className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{
                  background: "rgba(0,0,0,0.35)",
                  color: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {current + 1} / {sponsors.length}
              </div>
            </div>
          )}

          {/* ── Carousel ──────────────────────────────────────────────────── */}
          <div
            className="relative overflow-hidden cursor-grab active:cursor-grabbing w-full min-h-[260px] md:min-h-[220px] md:aspect-[3.6/1] bg-[#00140a] rounded-[20px] md:rounded-[24px]"
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchEnd={handleDragEnd}
          >
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 flex flex-col md:flex-row overflow-hidden w-full h-full"
              >
                {(() => {
                  const hasImage = !!slide.image_url;
                  const hasText = !!(slide.title || slide.company_name || slide.button_text);

                  if (hasImage && !hasText) {
                    // ── Case 1: Image only (Full banner advertisement) ──
                    return (
                      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#00140a]">
                        <div 
                          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110 select-none pointer-events-none" 
                          style={{ backgroundImage: `url(${slide.image_url})` }}
                        />
                        <img
                          src={slide.image_url}
                          alt={slide.title || "Sponsor Banner"}
                          className="relative z-10 max-w-full max-h-full object-contain select-none"
                          draggable={false}
                        />
                        {/* Premium badge for overlay */}
                        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1">
                          <div
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] border border-[#D4AF37]/30 bg-[#002f1c]/90 backdrop-blur-sm shadow-md"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            {isBn ? "বিজ্ঞাপন" : "Sponsored"}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (!hasImage && hasText) {
                    // ── Case 2: Text only (Full text announcement card) ──
                    return (
                      <div className="w-full h-full bg-gradient-to-br from-[#023624] to-[#001f14] p-4 sm:p-6 flex flex-col justify-center items-center text-center">
                        {slide.company_name && (
                          <div className="inline-flex items-center gap-1 mb-1.5 px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/35">
                            <Building2 className="w-3 h-3" />
                            {slide.company_name}
                          </div>
                        )}
                        {slide.title && (
                          <h3 className="text-white font-extrabold text-sm sm:text-lg md:text-xl leading-snug mb-1">
                            {slide.title}
                          </h3>
                        )}
                        {slide.description && (
                          <p className="text-white/80 text-[10px] sm:text-xs max-w-xl line-clamp-2 mb-2">
                            {slide.description}
                          </p>
                        )}
                        {(slide.target_url || slide.button_text) && (
                          <button
                            onClick={handleCTAClick}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[9px] sm:text-xs transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                            style={{
                              background: "linear-gradient(135deg, #D4AF37 0%, #c9a227 100%)",
                              color: "#006241",
                              boxShadow: "0 3px 10px rgba(212,175,55,0.25)",
                            }}
                          >
                            {slide.button_text || (isBn ? "বিস্তারিত দেখুন" : "Learn More")}
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  }

                  // ── Case 3: Both Image & Text (Dual Column/Stack Layout) ──
                  return (
                    <>
                      {/* DESKTOP LAYOUT (>= 768px / md:) */}
                      <div className="hidden md:flex flex-row w-full h-full overflow-hidden">
                        {/* Column 1: Left Panel */}
                        <div
                          className="w-[240px] lg:w-[280px] shrink-0 h-full bg-gradient-to-b from-[#023c2a] to-[#001f14] p-4 flex flex-col justify-between relative z-10 text-left"
                        >
                          {/* Top Badge */}
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-[#D4AF37] border border-[#D4AF37]/30 bg-[#002f1c] self-start">
                            <Sparkles className="w-2.5 h-2.5" />
                            {isBn ? "বিজ্ঞাপন" : "Sponsored"}
                          </div>

                          {/* Middle Info */}
                          <div className="my-auto py-2 overflow-y-auto scrollbar-hide pr-1">
                            {slide.company_name && (
                              <p className="text-yellow-400/90 text-[10px] font-bold mb-0.5 uppercase tracking-wider flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {slide.company_name}
                              </p>
                            )}
                            {slide.title && (
                              <h3 className="text-white font-extrabold text-sm lg:text-base leading-tight drop-shadow-md mb-1">
                                {slide.title}
                              </h3>
                            )}
                            {slide.description && (
                              <p className="text-white/85 text-[10px] lg:text-[11px] leading-relaxed line-clamp-3">
                                {slide.description}
                              </p>
                            )}
                          </div>

                          {/* Bottom Button */}
                          {(slide.target_url || slide.button_text) && (
                            <button
                              onClick={handleCTAClick}
                              className="w-full h-9 lg:h-10 rounded-lg font-bold text-[10px] lg:text-xs flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                              style={{
                                background: "linear-gradient(135deg, #D4AF37 0%, #c9a227 100%)",
                                color: "#006241",
                                boxShadow: "0 3px 10px rgba(212,175,55,0.2)",
                              }}
                            >
                              {slide.button_text || (isBn ? "বিস্তারিত দেখুন" : "View Details")}
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Column 2: Center Image */}
                        <div className="flex-1 min-w-0 h-full relative z-10 flex items-center justify-center bg-[#00140a] p-3">
                          <img
                            src={slide.image_url}
                            alt={slide.title || "Sponsor Banner"}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-md border border-white/10 select-none"
                            draggable={false}
                          />
                        </div>

                        {/* Column 3: Right Blurred Background */}
                        <div className="w-[120px] lg:w-[160px] shrink-0 h-full relative bg-[#00140a] overflow-hidden">
                          <div 
                            className="absolute inset-0 bg-cover bg-center blur-[60px] opacity-35 scale-150 select-none pointer-events-none" 
                            style={{ backgroundImage: `url(${slide.image_url})` }}
                          />
                          <div className="absolute inset-0 bg-[#001f14]/40" />
                        </div>
                      </div>

                      {/* MOBILE LAYOUT (< 768px / md:) */}
                      <div className="md:hidden flex flex-row items-center w-full h-full p-3.5 bg-gradient-to-r from-[#023c2a] to-[#001f14] gap-3 relative overflow-hidden">
                        {/* Premium badge */}
                        <div className="absolute top-2 left-2 z-20">
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider text-[#D4AF37] border border-[#D4AF37]/35 bg-[#002f1c]/90 backdrop-blur-sm shadow-md">
                            <Sparkles className="w-2 h-2" />
                            {isBn ? "বিজ্ঞাপন" : "Sponsored"}
                          </div>
                        </div>

                        {/* Image Panel (Left) */}
                        <div className="w-28 h-28 xs:w-32 xs:h-32 shrink-0 relative bg-[#00140a]/40 flex items-center justify-center p-1.5 rounded-xl overflow-hidden border border-white/5">
                          <div 
                            className="absolute inset-0 bg-cover bg-center blur-lg opacity-25 scale-110 select-none pointer-events-none" 
                            style={{ backgroundImage: `url(${slide.image_url})` }}
                          />
                          <img
                            src={slide.image_url}
                            alt={slide.title || "Sponsor Banner"}
                            className="relative z-10 max-w-full max-h-full object-contain rounded-lg select-none"
                            draggable={false}
                          />
                        </div>

                        {/* Info Panel (Right) */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                          {slide.company_name && (
                            <p className="text-yellow-400 font-bold uppercase tracking-wide text-[9px] mb-0.5 break-words">
                              {slide.company_name}
                            </p>
                          )}
                          {slide.title && (
                            <h3 className="text-white font-bold text-sm leading-tight break-words">
                              {slide.title}
                            </h3>
                          )}
                          {slide.description && (
                            <p className="text-white/70 text-[10px] leading-snug mt-1 line-clamp-3 break-words">
                              {slide.description}
                            </p>
                          )}
                          
                          {/* Small Button */}
                          {(slide.target_url || slide.button_text) && (
                            <button
                              onClick={handleCTAClick}
                              className="mt-2 self-start h-7 px-3 rounded-lg font-bold text-[9px] flex items-center justify-center gap-1 transition-all duration-200 active:scale-95 shadow-md"
                              style={{
                                background: "linear-gradient(135deg, #D4AF37 0%, #c9a227 100%)",
                                color: "#006241",
                              }}
                            >
                              {slide.button_text || (isBn ? "বিস্তারিত" : "View")}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </AnimatePresence>

            {/* ── Prev / Next Buttons ──────────────────────────────────────── */}
            {sponsors.length > 1 && (
              <>
                <motion.button
                  onClick={() => { prev(); resetAuto(); }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Previous sponsor"
                  className="absolute left-3 top-1/2 z-10 hidden sm:flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition-all"
                  style={{
                    background: "rgba(0,0,0,0.38)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </motion.button>
                <motion.button
                  onClick={() => { next(); resetAuto(); }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Next sponsor"
                  className="absolute right-3 top-1/2 z-10 hidden sm:flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition-all"
                  style={{
                    background: "rgba(0,0,0,0.38)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </motion.button>
              </>
            )}

            {/* ── Gold progress bar ────────────────────────────────────────── */}
            <motion.div
              key={`bar-${current}`}
              className="absolute top-0 left-0 h-[3px] z-10"
              style={{ background: "linear-gradient(90deg, #D4AF37, #f5d878)" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
            />
          </div>

          {/* ── Dot indicators ──────────────────────────────────────────────── */}
          {sponsors.length > 1 && (
            <div className="flex items-center justify-between px-6 py-4">
              {/* Left: section label */}
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-5 rounded-full"
                  style={{ background: "linear-gradient(180deg, #D4AF37, #c9a227)" }}
                />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isBn ? "আমাদের পার্টনার" : "Our Partners"}
                </span>
              </div>

              {/* Right: dots */}
              <div className="flex items-center gap-2">
                {sponsors.map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => goTo(i)}
                    animate={{
                      width:      i === current ? 22 : 7,
                      background: i === current ? "#D4AF37" : "rgba(0,98,65,0.2)",
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-2 rounded-full"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

