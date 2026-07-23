'use client';

import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext({ lang: null, setLang: () => {} });

/**
 * LanguageProvider
 *
 * Accepts an `initialLang` prop from the Server Component (layout.jsx reads
 * the `ri_lang` cookie and passes it here).  Using the server-supplied value
 * as the initial useState value guarantees that the first server render and
 * the first client render use the exact same language — eliminating React
 * hydration error #418 caused by language-dependent text mismatches.
 *
 * After mount, the useEffect syncs with localStorage / URL params as before.
 * When the user changes language, we also write a cookie so the server can
 * read it on the next request and pre-render in the correct language.
 */
export function LanguageProvider({ children, initialLang = "bn" }) {
  // Initialized from the server-provided cookie value — matches server render.
  const [lang, setLangState] = useState(initialLang);

  useEffect(() => {
    let activeLang = initialLang;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryLang = params.get("lang");
      if (queryLang === "bn" || queryLang === "en" || queryLang === "ar") {
        // URL param takes priority — persist to both cookie and localStorage
        document.cookie = `ri_lang=${queryLang}; path=/; max-age=31536000; SameSite=Strict`;
        localStorage.setItem("ri_lang", queryLang);
        activeLang = queryLang;
      } else {
        const saved = localStorage.getItem("ri_lang");
        if (saved === "bn" || saved === "en" || saved === "ar") {
          activeLang = saved;
        }
      }
    }
    // Only trigger a re-render if the language actually differs from the
    // server-supplied value (avoids an unnecessary re-render for most users).
    if (activeLang !== lang) {
      setLangState(activeLang);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined" && lang) {
      // Dynamic update of <html> attributes for correct rendering direction (RTL/LTR)
      const htmlEl = document.documentElement;
      if (htmlEl) {
        htmlEl.setAttribute("lang", lang);
        if (lang === "ar") {
          htmlEl.setAttribute("dir", "rtl");
        } else {
          htmlEl.setAttribute("dir", "ltr");
        }
      }

      const path = window.location.pathname;
      const isHome = path === "/";
      const isAbout = path.includes("/about");
      const isAcademics = path.includes("/academics");
      const isAdmission = path.includes("/admission");
      const isTeachers = path.includes("/teachers");
      const isFaq = path.includes("/faq");

      let title = "";
      let desc = "";

      if (isHome) {
        if (lang === "ar") {
          title = "معهد الرحمانية | Jamia Rahmania Gazipur — معهد يدمج بين التعليم الديني والحديث";
          desc = "معهد الرحمانية هو مدرسة إسلامية حديثة في غازيبور تقدم مناهج النوراني والحفظ والناظرة والنسخة الإنجليزية. القبول مستمر!";
        } else if (lang === "en") {
          title = "Rahmania Institute | Jamia Rahmania Gazipur — Modern & Islamic Education";
          desc = "Rahmania Institute is a modern Islamic school in Gazipur offering Hifz, Noorani, Nazera, and English Version curriculum. Admission ongoing!";
        }
      } else if (isAbout) {
        if (lang === "ar") {
          title = "من نحن | معهد الرحمانية";
          desc = "تعرف على معهد الرحمانية - مؤسسة تعليمية بارزة تجمع بين التعليم الحديث والإسلامي.";
        } else if (lang === "en") {
          title = "About Us | Rahmania Institute";
          desc = "Learn about Rahmania Institute - a premier educational institution integrating modern and Islamic education.";
        }
      } else if (isAcademics) {
        if (lang === "ar") {
          title = "البرامج الأكاديمية | معهد الرحمانية";
          desc = "البرامج الأكاديمية والتعليمية بمعهد الرحمانية - قسم النوراني والحفظ والناظرة والنسخة الإنجليزية.";
        } else if (lang === "en") {
          title = "Academics | Rahmania Institute";
          desc = "Academic and educational programs at Rahmania Institute - Hifz, Noorani, Nazera, and English Version departments.";
        }
      } else if (isAdmission) {
        if (lang === "ar") {
          title = "معلومات القبول | معهد الرحمانية";
          desc = "معلومات وإجراءات القبول والتسجيل بمعهد الرحمانية - الرسوم والشروط والأوراق المطلوبة.";
        } else if (lang === "en") {
          title = "Admissions | Rahmania Institute";
          desc = "Admission procedures, requirements, fees, and guidelines for joining Rahmania Institute.";
        }
      } else if (isTeachers) {
        if (lang === "ar") {
          title = "هيئة التدريس | معهد الرحمانية";
          desc = "قائمة بأعضاء هيئة التدريس والعلماء الأفاضل بمعهد الرحمانية.";
        } else if (lang === "en") {
          title = "Teachers | Rahmania Institute";
          desc = "List of experienced teachers and respected scholars at Rahmania Institute.";
        }
      } else if (isFaq) {
        if (lang === "ar") {
          title = "الأسئلة الشائعة | معهد الرحمانية";
          desc = "الأسئلة الأكثر شيوعاً والأجوبة عليها بخصوص القبول والدراسة بمعهد الرحمانية.";
        } else if (lang === "en") {
          title = "FAQ | Rahmania Institute";
          desc = "Frequently asked questions and answers about admissions, classes, and guidelines at Rahmania Institute.";
        }
      }

      if (title) {
        document.title = title;
      }
      if (desc) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", desc);
      }
    }
  }, [lang]);

  const setLang = (l) => {
    if (l === "bn" || l === "en" || l === "ar") {
      localStorage.setItem("ri_lang", l);
      // Write cookie so server can read it on the next request and pre-render
      // in the correct language — this eliminates the hydration mismatch.
      document.cookie = `ri_lang=${l}; path=/; max-age=31536000; SameSite=Strict`;
      setLangState(l);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
