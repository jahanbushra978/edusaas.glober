import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext({ lang: null, setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("bn");

  useEffect(() => {
    let activeLang = "bn";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryLang = params.get("lang");
      if (queryLang === "bn" || queryLang === "en" || queryLang === "ar") {
        localStorage.setItem("ri_lang", queryLang);
        activeLang = queryLang;
      } else {
        const saved = localStorage.getItem("ri_lang");
        if (saved === "bn" || saved === "en" || saved === "ar") {
          activeLang = saved;
        }
      }
    }
    setLangState(activeLang);
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
