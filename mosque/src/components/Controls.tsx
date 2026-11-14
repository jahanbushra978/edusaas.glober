"use client";
import { usePrefs, useT } from "./Providers";

export function Controls() {
  const { theme, setTheme, lang, setLang } = usePrefs();
  const { t } = useT();
  return (
    <div className="ctrl">
      <div className="seg" role="group" aria-label="Theme">
        {(["system", "light", "dark"] as const).map((v) => (
          <button key={v} className={theme === v ? "on" : ""} onClick={() => setTheme(v)}>
            {t(v === "dark" ? "night" : v)}
          </button>
        ))}
      </div>
      <div className="seg" role="group" aria-label="Language">
        <button className={lang === "bn" ? "on" : ""} onClick={() => setLang("bn")}>বাংলা</button>
        <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
      </div>
    </div>
  );
}
