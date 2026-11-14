"use client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { DICT, Key, Lang } from "@/lib/i18n";

export type Theme = "system" | "light" | "dark";
type Ctx = { lang: Lang; setLang: (l: Lang) => void; theme: Theme; setTheme: (t: Theme) => void };
const C = createContext<Ctx | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    try {
      const l = localStorage.getItem("lang");
      const t = localStorage.getItem("theme");
      if (l === "bn" || l === "en") setLangState(l);
      if (t === "light" || t === "dark" || t === "system") setThemeState(t);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l;
    try { localStorage.setItem("lang", l); } catch { /* ignore */ }
  }, []);
  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (t === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch { /* ignore */ }
  }, []);

  return <C.Provider value={{ lang, setLang, theme, setTheme }}>{children}</C.Provider>;
}

export function usePrefs() {
  const c = useContext(C);
  if (!c) throw new Error("Providers missing");
  return c;
}

export function useT() {
  const { lang } = usePrefs();
  return { lang, t: (k: Key) => DICT[lang][k] ?? k, err: (code: string) => (DICT[lang] as Record<string, string>)[code] ?? DICT[lang].error };
}
