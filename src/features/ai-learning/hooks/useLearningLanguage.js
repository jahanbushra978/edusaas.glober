"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { LEARNING_TRANSLATIONS } from "../data/translations";

export function useLearningLanguage() {
  const [lang, setLangState] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("noor_learning_lang") || "bn";
      } catch {
        return "bn";
      }
    }
    return "bn";
  });

  useEffect(() => {
    const handleLangChange = (e) => {
      if (e?.detail?.lang) {
        setLangState(e.detail.lang);
      }
    };
    window.addEventListener("noor:lang_changed", handleLangChange);
    return () => window.removeEventListener("noor:lang_changed", handleLangChange);
  }, []);

  const setLanguage = useCallback((newLang) => {
    if (!["bn", "en", "ar"].includes(newLang)) return;
    setLangState(newLang);
    try {
      localStorage.setItem("noor_learning_lang", newLang);
      window.dispatchEvent(new CustomEvent("noor:lang_changed", { detail: { lang: newLang } }));
    } catch {}
  }, []);

  const isRTL = lang === "ar";
  const dir = isRTL ? "rtl" : "ltr";
  const t = useMemo(() => LEARNING_TRANSLATIONS[lang] || LEARNING_TRANSLATIONS.bn, [lang]);

  return {
    lang,
    setLanguage,
    t,
    isRTL,
    dir,
  };
}
