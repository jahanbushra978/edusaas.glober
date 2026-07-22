import React, { useState, useEffect } from "react";
import Image from "next/image";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

const FALLBACK_SLIDES = [
  { image_url: "/slids1.webp", caption_en: "Building the Scholars of Tomorrow", caption_bn: "আগামীর আলেম গড়ে তোলা" },
  { image_url: "/slids2.webp", caption_en: "Quranic Education with Modern Excellence", caption_bn: "আধুনিক পদ্ধতিতে কুরআনি শিক্ষা" },
  { image_url: "/slids3.webp", caption_en: "Ilm · Akhlaq · Taqwa", caption_bn: "ইলম · আখলাক · তাকওয়া" },
];

export default function HeroSlider() {
  const { lang } = useLanguage();
  const isBn = lang === "bn";
  const [current, setCurrent] = useState(0);

  const { data: dbSlides = [] } = useQuery({
    queryKey: ["hero-slides"],
    queryFn: () => appClient.entities.HeroSlide.list("sort_order", 20),
    select: d => d.filter(s => s.is_active !== false),
  });

  const slides = dbSlides.length > 0 ? dbSlides : FALLBACK_SLIDES;

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  const [direction, setDirection] = useState(1);

  const prev = () => { setDirection(-1); setCurrent(c => (c - 1 + slides.length) % slides.length); };
  const next = () => { setDirection(1); setCurrent(c => (c + 1) % slides.length); };
  const goTo = (i) => { setDirection(i > current ? 1 : -1); setCurrent(i); };

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div className="relative h-[280px] w-full overflow-hidden rounded-[24px] shadow-[0_18px_50px_rgba(15,23,42,0.18)] ring-1 ring-black/5 sm:h-[340px] lg:h-[390px]">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0">
          <Image
            src={slides[current].image_url}
            alt={slides[current].caption_en || slides[current].caption_bn || "Rahmania Institute"}
            fill
            sizes="100vw"
            priority={current === 0}
            className="object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(0,30,15,0.72) 0%, rgba(0,60,35,0.24) 42%, rgba(0,0,0,0.16) 100%)" }} />
          <motion.div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7 sm:right-7"
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25, duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-2">
              <motion.span className="w-8 h-0.5 rounded-full inline-block" style={{ background: "#D4AF37" }}
                initial={{ width: 0 }} animate={{ width: 32 }} transition={{ delay: 0.4, duration: 0.4 }} />
              <span className="text-[11px] text-yellow-300 font-semibold uppercase tracking-widest opacity-80">
                {isBn ? "রহমানিয়া ইনস্টিটিউট" : "Rahmania Institute"}
              </span>
            </div>
            <p className="max-w-2xl text-white font-extrabold italic text-xl leading-tight drop-shadow-lg sm:text-3xl" dir={lang === "ar" ? "rtl" : "ltr"}>
              {lang === "bn" ? (slides[current].title_bn || slides[current].title || slides[current].caption_bn) : 
               lang === "ar" ? (slides[current].title_ar || slides[current].title || slides[current].caption_en) : 
               (slides[current].title || slides[current].caption_en)}
            </p>
            <p className="max-w-xl text-white/80 font-medium mt-1 text-sm sm:text-lg" dir={lang === "ar" ? "rtl" : "ltr"}>
              {lang === "bn" ? (slides[current].subtitle_bn || slides[current].subtitle || slides[current].caption_bn) : 
               lang === "ar" ? (slides[current].subtitle_ar || slides[current].subtitle || slides[current].caption_en) : 
               (slides[current].subtitle || slides[current].caption_bn)}
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <motion.button onClick={prev} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full sm:flex"
        style={{ background: "rgba(0,0,0,0.38)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(4px)" }}>
        <ChevronLeft className="h-5 w-5 text-white" />
      </motion.button>
      <motion.button onClick={next} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full sm:flex"
        style={{ background: "rgba(0,0,0,0.38)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(4px)" }}>
        <ChevronRight className="h-5 w-5 text-white" />
      </motion.button>

      <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <motion.button key={i} onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            animate={{ width: i === current ? 22 : 7, background: i === current ? "#D4AF37" : "rgba(255,255,255,0.45)" }}
            transition={{ duration: 0.3 }}
            className="h-1.5 rounded-full" />
        ))}
      </div>

      <motion.div className="absolute top-0 left-0 h-0.5 z-10"
        style={{ background: "linear-gradient(90deg,#D4AF37,#f5d878)" }}
        key={`bar-${current}`}
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 4.5, ease: "linear" }} />
    </div>
  );
}

