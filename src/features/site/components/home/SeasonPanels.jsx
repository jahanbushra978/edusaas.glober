import React from "react";
import Link from "next/link";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { ChevronRight, Users } from "lucide-react";

const getSeasons = (t) => {
  const baseTheme = {
    gradient: "linear-gradient(135deg,#004D2A,#006241)",
    glowColor: "rgba(212,175,55,0.35)",
    borderColor: "rgba(212,175,55,0.4)",
    badgeBg: "rgba(212,175,55,0.15)",
    badgeText: "#D4AF37",
  };

  return [
    {
      key: "নূরানী",
      label: t.noorani,
      emoji: "📗",
      route: "/departments/noorani",
      ...baseTheme,
      match: (session) => session === "নূরানী",
    },
    {
      key: "নাজেরা",
      label: t.nazera,
      emoji: "📙",
      route: "/departments/najera",
      ...baseTheme,
      match: (session) => session === "নাজেরা",
    },
    {
      key: "হিফয",
      label: t.hifz,
      emoji: "📘",
      route: "/departments/hifz",
      ...baseTheme,
      match: (session) => session === "হিফয",
    },
    {
      key: "হিফয শুনানি",
      label: t.hifzShunani,
      emoji: "🎧",
      route: "/departments/hifz-shunani",
      ...baseTheme,
      match: (session) => session === "হিফয শুনানি",
    },
    {
      key: "কিন্ডারগার্টেন",
      label: t.kindergarten,
      emoji: "🏫",
      route: "/departments/kindergarten",
      ...baseTheme,
      match: (session) => session === "কিন্ডারগার্টেন" || session === "কিন্ডার গার্ডেন",
    },
    {
      key: "কিতাবখানা",
      label: t.kitabKhana,
      emoji: "📚",
      route: "/departments/madani-nessab",
      ...baseTheme,
      match: (session) => session === "কিতাবখানা" || session === "মাদানী নেসাব",
    },
    {
      key: "English Version",
      label: t.englishVersion,
      emoji: "🇬🇧",
      image: "/english_version_illustration.png",
      route: "/departments/english-version",
      ...baseTheme,
      match: (session) => session === "English Version" || session === "ইংরেজি ভার্সন" || session === "ইংলিশ ভার্সন",
    },
  ];
};

function SeasonCard({ season, students, t, lang }) {
  const isAr = lang === "ar";
  const count = students.length;
  const active = students.filter((student) => student.status === "active").length;

  return (
    <Link
      href={season.route}
      className="group relative overflow-hidden rounded-2xl transition-all duration-500 ease-spring hover:-translate-y-[6px] hover:scale-[1.03]"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${season.borderColor}`,
        boxShadow: `0 20px 60px -38px ${season.glowColor}`,
        direction: isAr ? "rtl" : "ltr",
      }}
    >
      <div className="h-1.5 w-full" style={{ background: season.gradient }} />
      <div
        className={`absolute top-0 ${isAr ? "left-0" : "right-0"} h-32 w-32 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
        style={{
          background: `radial-gradient(circle, ${season.glowColor} 0%, transparent 70%)`,
          transform: isAr ? "translate(-40%, -40%)" : "translate(40%, -40%)",
        }}
      />

      <div className="p-5">
        <div className={`mb-4 flex items-start justify-between ${isAr ? "flex-row-reverse" : ""}`}>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-110"
            style={{ background: season.gradient, border: `1px solid ${season.borderColor}` }}
          >
            {season.image ? (
              <img src={season.image} loading="lazy" alt={season.label} className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl">{season.emoji}</span>
            )}
          </div>
          <div
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ background: season.badgeBg, color: season.badgeText }}
          >
            <Users className="h-3 w-3" />
            {count}
          </div>
        </div>

        <h3 className={`mb-1 text-lg font-bold text-white md:text-[1.35rem] ${isAr ? "text-right" : ""}`}>
          {season.label}
        </h3>
        <p className={`mb-4 text-sm font-semibold ${isAr ? "text-right" : ""}`} style={{ color: season.badgeText }}>
          
        </p>

        <div className="mb-4 flex gap-3">
          <div className="flex-1 rounded-lg p-2 text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
            <p className="text-lg font-bold leading-none text-white">{active}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">{t.active}</p>
          </div>
          <div className="flex-1 rounded-lg p-2 text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
            <p className="text-lg font-bold leading-none text-white">{count - active}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">{t.inactive}</p>
          </div>
        </div>

        <div
          className={`flex items-center justify-between rounded-lg px-3 py-2 ${isAr ? "flex-row-reverse" : ""}`}
          style={{ background: season.badgeBg }}
        >
          <span className="text-xs font-semibold" style={{ color: season.badgeText }}>
            {lang === "bn" ? "বিস্তারিত দেখুন" : lang === "ar" ? "عرض التفاصيل" : "View Details"}
          </span>
          <ChevronRight className={`h-3.5 w-3.5 ${isAr ? "rotate-180" : ""}`} style={{ color: season.badgeText }} />
        </div>
      </div>
    </Link>
  );
}

export default function SeasonPanels({ students: propStudents }) {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const trans = t.seasons;
  const isAr = lang === "ar";

  const { data: queryStudents = [], isLoading } = useQuery({
    queryKey: ["students-public-season"],
    queryFn: () => appClient.entities.Student.list(),
    select: (items) => items.filter((student) => student.status !== "graduated"),
    enabled: propStudents === undefined,
  });

  const students = propStudents || queryStudents;
  const seasons = getSeasons(trans);
  const getSeasonStudents = (season) => students.filter((student) => season.match(student.session || ""));

  return (
    <div className="mx-auto mb-12 max-w-5xl px-4">
      <div className="mb-7 text-center">
        <h2 className="text-xl font-bold text-white sm:text-2xl">{trans.title}</h2>
        <div className="mt-2 flex items-center justify-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-400/60" />
          <div className="h-1.5 w-1.5 rounded-full bg-yellow-400/70" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-yellow-400/60" />
        </div>
        <p className={`mt-2 text-sm text-slate-400 ${isAr ? "text-right" : ""}`}>
          {lang === "bn"
            ? "যেকোনো বিভাগ নির্বাচন বিস্তারিত দেখুন"
            : lang === "ar"
              ? "اختر أي قسم لعرض التفاصيل"
              : "Choose any department to explore details"}
        </p>
      </div>

      {isLoading ? (
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {seasons.map((season) => (
              <div key={season.key} className="h-52 animate-pulse rounded-2xl" style={{ background: "rgba(255,255,255,0.05)" }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {seasons.map((season) => (
            <SeasonCard
              key={season.key}
              season={season}
              students={getSeasonStudents(season)}
              t={trans}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  );
}

