'use client'

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileImage,
  GraduationCap,
  ImageIcon,
  Trophy,
  CheckCircle,
  Star,
  Library,
  Heart,
  Shield,
  Monitor,
  FileText,
  BarChart3,
  Languages,
  TreePine,
  Lightbulb,
  UserCheck,
  MessageCircle,
  Award,
  Compass,
  ScrollText,
  Landmark,
  PenTool,
  Mic,
  Search,
  Target,
  Sun,
  Moon,
} from "lucide-react";
import { appClient } from "@/api/appClient";
import { matchesDepartmentValue } from "@/lib/departmentData";
import { useVisitorAuth } from "@/lib/VisitorAuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";

const featureIconMap = [
  Star, BookOpen, GraduationCap, ClipboardList, Trophy, Bell,
  Library, Heart, Shield, Monitor, FileText, BarChart3,
  Languages, TreePine, Lightbulb, UserCheck, MessageCircle,
  Award, Compass, ScrollText, Landmark, PenTool, Mic, Search, Target,
];

function SectionCard({ icon: Icon, title, children, colors, id }) {
  return (
    <section
      id={id}
      className="rounded-[28px] bg-white/80 dark:bg-gray-800/80 p-6 md:p-8 backdrop-blur-sm border dark:border-gray-700/50"
      style={{
        borderColor: colors.border,
        boxShadow: `0 18px 48px -24px ${colors.glow}`,
      }}
    >
      <header className="mb-6 flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ background: colors.chip, color: colors.primary }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100 md:text-2xl">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function buildNoticeList(notices, department) {
  return notices.filter(
    (item) =>
      item.is_active &&
      (!item.department ||
        item.department === "সকল" ||
        matchesDepartmentValue(item.department, department)),
  );
}

function buildGalleryList(items, department) {
  return items.filter(
    (item) => item.is_published !== false && matchesDepartmentValue(item.category, department),
  );
}

function buildExamList(exams, department) {
  return exams.filter((item) => matchesDepartmentValue(item.session, department));
}

function buildInputList(inputs, department) {
  return inputs.filter(
    (item) => item.is_visible !== false && matchesDepartmentValue(item.session, department),
  );
}

const KaabaWatermark = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="80" width="120" height="100" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="55" y="95" width="90" height="70" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="100" y1="50" x2="100" y2="80" stroke="currentColor" strokeWidth="2" />
    <line x1="70" y1="65" x2="130" y2="65" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="100" cy="130" r="15" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M100 115 L108 130 L100 145 L92 130 Z" stroke="currentColor" strokeWidth="1" fill="none" />
    <rect x="45" y="82" width="110" height="2" rx="1" fill="currentColor" opacity="0.3" />
    <rect x="45" y="178" width="110" height="2" rx="1" fill="currentColor" opacity="0.3" />
  </svg>
);

export default function DepartmentLandingPage({ department }) {
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const { visitorProfile, isVisitorAuthenticated } = useVisitorAuth();
  const { lang } = useLanguage();
  const t = useTranslation(lang);

  const { data: notices = [] } = useQuery({
    queryKey: ["department-notices", department.slug],
    queryFn: () => appClient.entities.Notice.list("-created_date", 100),
    staleTime: 5 * 60 * 1000,
  });

  const { data: galleryItems = [] } = useQuery({
    queryKey: ["department-gallery", department.slug],
    queryFn: () => appClient.entities.Gallery.list("-created_date", 200),
    staleTime: 10 * 60 * 1000,
  });

  const { data: exams = [] } = useQuery({
    queryKey: ["department-exams", department.slug],
    queryFn: () => appClient.entities.Exam.list("-exam_date", 100),
    staleTime: 10 * 60 * 1000,
  });

  const { data: examInputs = [] } = useQuery({
    queryKey: ["department-exam-inputs", department.slug],
    queryFn: () => appClient.entities.ExamInput.list("-created_date", 100),
    staleTime: 10 * 60 * 1000,
  });

  const filteredNotices = useMemo(
    () => buildNoticeList(notices, department),
    [notices, department],
  );
  const filteredGallery = useMemo(
    () => buildGalleryList(galleryItems, department),
    [galleryItems, department],
  );
  const filteredExams = useMemo(() => buildExamList(exams, department), [exams, department]);
  const filteredExamInputs = useMemo(
    () => buildInputList(examInputs, department),
    [examInputs, department],
  );

  const activeExam = useMemo(() => {
    if (!filteredExams.length) return null;
    return filteredExams.find((item) => item.id === selectedExamId) || filteredExams[0];
  }, [filteredExams, selectedExamId]);

  const { data: results = [] } = useQuery({
    queryKey: ["department-results", activeExam?.id],
    queryFn: () => appClient.entities.ExamResult.filter({ exam_id: activeExam.id }, "-obtained_marks"),
    enabled: !!activeExam,
    staleTime: 5 * 60 * 1000,
  });

  // Architecture review fix: this page only ever displays the top 10
  // scorers (see `topResults` below), so we only need to resolve the
  // handful of student records referenced by the top of the already
  // marks-sorted `results` list — not the entire student roster. `results`
  // is sorted by -obtained_marks, so the first ~15 entries are guaranteed
  // to cover the eventual top-10-with-a-student-record slice.
  const topResultCandidateIds = useMemo(
    () => Array.from(new Set(results.slice(0, 15).map((r) => r.student_id).filter(Boolean))),
    [results]
  );

  const { data: topStudents = [] } = useQuery({
    queryKey: ["department-top-students", activeExam?.id, topResultCandidateIds.join(",")],
    queryFn: () => appClient.entities.Student.getByIds(
      topResultCandidateIds,
      "id,full_name_en,full_name_bn,photo_url,roll_number,batch,class_name"
    ),
    enabled: topResultCandidateIds.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  const studentMap = useMemo(
    () => Object.fromEntries(topStudents.map((student) => [student.id, student])),
    [topStudents],
  );

  const topResults = useMemo(
    () =>
      results
        .map((result) => ({ ...result, student: studentMap[result.student_id] }))
        .filter((item) => item.student)
        .slice(0, 10),
    [results, studentMap],
  );

  const quickLinks = [
    { href: "#overview", label: t.deptPage.overview, icon: GraduationCap },
    { href: "#notices", label: t.deptPage.notices, icon: Bell },
    { href: "#gallery", label: t.deptPage.gallery, icon: ImageIcon },
  ];

  // Language-aware content selection
  const getContent = (field, fallback) => {
    if (lang === 'bn' && department[field + 'Bn']) return department[field + 'Bn'];
    if (lang === 'en' && department[field + 'En']) return department[field + 'En'];
    if (lang === 'ar' && department[field + 'Ar']) return department[field + 'Ar'];
    return department[field] || fallback;
  };

  const pageTitle = getContent('title');
  const pageBadge = getContent('badge');
  const pageHeroAyatTranslation = getContent('heroAyatTranslation');
  const pageHeroReference = getContent('heroReference');
  const pageLongDescription = getContent('longDescription');
  const pageLongDescription2 = getContent('longDescription2');
  const pageSpecialFeatures = getContent('specialFeatures');

  const c = department.colors;
  const isAr = lang === "ar";

  return (
    <main className="min-h-screen pb-20 dark:bg-gray-900" style={{ background: c.surface }}>
      <div className="mx-auto max-w-6xl px-4 pt-6 md:px-5 md:pt-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5 animate-fade-up">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300 hover:gap-3"
            style={{ color: c.primary }}
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300" />
            {t.deptPage.backToHome}
          </Link>
        </nav>

        {/* ===== PREMIUM ISLAMIC HERO SECTION ===== */}
        <header
          className="relative overflow-hidden rounded-[32px] animate-fade-scale islamic-hero-pattern dark:border-gray-700/50"
          style={{
            background: `linear-gradient(135deg, ${c.surface}, #ffffff 55%, ${c.chip})`,
            border: `1px solid ${c.border}`,
            boxShadow: `0 28px 64px -34px ${c.glow}`,
          }}
        >
          {/* Decorative background elements */}
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl animate-float-slow"
            style={{ background: c.glow }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full blur-3xl opacity-50"
            style={{ background: c.glow }}
          />

          {/* Kaaba Watermark */}
          <div className="kaaba-watermark" style={{ color: c.primary }}>
            <KaabaWatermark />
          </div>

          <div className="relative px-6 pb-8 pt-8 md:px-10 md:pb-10 md:pt-10">
            {/* Badge */}
            <div className="flex justify-center mb-6 animate-fade-up">
              <div
                className="inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-[0.24em]"
                style={{ background: c.chip, color: c.chipText }}
              >
                <Award className="h-3.5 w-3.5" />
                {pageBadge}
              </div>
            </div>

            {/* Centered Hero Content — No Right Side Box */}
            <div className="flex flex-col items-center text-center animate-fade-up">
              {/* Arabic Ayat */}
              <div className="ayat-glass-card relative overflow-hidden rounded-2xl p-5 md:p-7 mb-5 w-full max-w-3xl transition-all duration-500 hover:shadow-xl hover:-translate-y-0.5"
                style={{
                  boxShadow: `0 20px 60px -20px ${c.glow}`,
                }}
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
                  style={{ background: "rgba(212, 175, 55, 0.12)" }}
                />
                <div className="relative">
                  <p
                    className="ayat-text-arabic text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed text-center transition-all duration-300 hover:scale-[1.01]"
                    style={{ color: c.secondary }}
                    dir="rtl"
                  >
                    {department.heroQuote}
                  </p>
                  {/* Gold divider */}
                  <div className="divider-gold my-4 max-w-xs mx-auto">
                    <div className="divider-gold-dot" />
                  </div>
                  {/* Translation */}
                  <div className="translation-card rounded-xl p-4 md:p-5 max-w-2xl mx-auto transition-all duration-300 hover:shadow-md">
                    <p
                      className="text-sm md:text-base font-medium leading-relaxed text-slate-700 dark:text-gray-300 text-center"
                      style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                    >
                      &ldquo;{pageHeroAyatTranslation}&rdquo;
                    </p>
                    <p
                      className="mt-2 text-xs font-semibold text-center transition-colors duration-300"
                      style={{ color: c.primary }}
                    >
                      — {pageHeroReference}
                    </p>
                  </div>
                </div>
              </div>

              {/* Title — No Subtitle/No "বিস্তারিত দেখুন" */}
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-100 md:text-4xl lg:text-5xl">
                {pageTitle}
              </h1>


            </div>
          </div>
        </header>

        {/* ===== QUICK NAVIGATION — No "বিস্তারিত দেখুন" text ===== */}
        <nav aria-label="Department quick navigation" className="mt-6 animate-fade-up animate-delay-200">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                className="group flex items-center justify-between rounded-2xl px-4 py-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800/60"
                style={{
                  background: "rgba(255,255,255,0.86)",
                  border: `1px solid ${c.border}`,
                  boxShadow: `0 14px 32px -28px ${c.glow}`,
                }}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                    style={{ background: c.chip, color: c.primary }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-gray-100">{label}</span>
                </span>
              </a>
            ))}
          </div>
        </nav>

        {/* ===== CONTENT SECTIONS ===== */}
        <div className="mt-8 grid gap-6">

          {/* --- বিভাগ পরিচিতি --- */}
          <SectionCard id="overview" icon={ClipboardList} title={t.deptPage.overview} colors={c}>
            <article className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                {pageLongDescription && (
                  <div className="space-y-4">
                    {pageLongDescription.split('\n').filter(Boolean).map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="text-sm leading-7 text-slate-600 dark:text-gray-300 md:text-base md:leading-8"
                      >
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>
                )}
                {pageLongDescription2 && (
                  <p className="text-sm leading-7 text-slate-600 dark:text-gray-300 md:text-base md:leading-8">
                    {pageLongDescription2}
                  </p>
                )}
              </div>

              {pageSpecialFeatures && pageSpecialFeatures.length > 0 && (
                <div
                  className="rounded-[26px] p-5 md:p-6 dark:bg-gray-800/60"
                  style={{
                    background: `linear-gradient(180deg, #ffffff, ${c.surface})`,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <div className="section-title-decorated">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100">{t.deptPage.ourFeatures}</h2>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {pageSpecialFeatures.map((feature, idx) => {
                      const IconComponent = featureIconMap[idx % featureIconMap.length];
                      return (
                        <li key={idx} className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-gray-300">
                          <span
                            className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
                            style={{ background: c.chip, color: c.primary }}
                          >
                            <IconComponent className="h-3.5 w-3.5" />
                          </span>
                          <span className="pt-0.5">{feature}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </article>
          </SectionCard>

          {/* --- English Version Program Details --- */}
          {department.slug === "english-version" && (
            <section
              className="relative overflow-hidden rounded-[32px] p-6 md:p-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border dark:border-gray-700/50"
              style={{
                borderColor: c.border,
                boxShadow: `0 18px 48px -24px ${c.glow}`,
              }}
            >
              {/* Decorative Elements */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl opacity-[0.08]"
                style={{ background: c.primary }}
              />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full blur-3xl opacity-[0.06]"
                style={{ background: c.secondary }}
              />

              <div className="relative space-y-10">
                {/* About Section */}
                <div className="text-center">
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-[0.24em] mb-4"
                    style={{ background: c.chip, color: c.chipText }}
                  >
                    <Award className="h-3.5 w-3.5" />
                    {t.englishVersionPage.headingAbout}
                  </div>
                  <p className="text-sm leading-7 text-slate-600 dark:text-gray-300 md:text-base md:leading-8 max-w-4xl mx-auto">
                    {t.englishVersionPage.aboutText}
                  </p>
                  <p className="mt-5 text-sm italic text-slate-500 dark:text-gray-400">
                    — {t.deptPage.ayahReminder || "May Almighty Allah accept our efforts and grant us success. Ameen."}
                  </p>
                </div>

                {/* Divider */}
                <div className="divider-gold max-w-xs mx-auto">
                  <div className="divider-gold-dot" />
                </div>

                {/* Values */}
                <div className="text-center">
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-[0.24em] mb-4"
                    style={{ background: c.chip, color: c.chipText }}
                  >
                    <Star className="h-3.5 w-3.5" />
                    {t.englishVersionPage.headingValues}
                  </div>
                  <p className="text-sm leading-7 text-slate-600 dark:text-gray-300 md:text-base md:leading-8 max-w-3xl mx-auto">
                    {t.englishVersionPage.valuesText}
                  </p>
                </div>

                {/* Vision & Mission Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div
                    className="rounded-[26px] p-6 md:p-8"
                    style={{
                      background: `linear-gradient(135deg, ${c.surface}, #ffffff)`,
                      border: `1px solid ${c.border}`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: c.chip, color: c.primary }}>
                        <Compass className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100">{t.englishVersionPage.headingVision}</h3>
                    </div>
                    <p className="text-sm leading-7 text-slate-600 dark:text-gray-300">{t.englishVersionPage.visionText}</p>
                    <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-gray-400">{t.englishVersionPage.visionDetail}</p>
                  </div>

                  <div
                    className="rounded-[26px] p-6 md:p-8"
                    style={{
                      background: `linear-gradient(135deg, ${c.surface}, #ffffff)`,
                      border: `1px solid ${c.border}`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: c.chip, color: c.primary }}>
                        <Target className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100">{t.englishVersionPage.headingMission}</h3>
                    </div>
                    <ul className="space-y-3">
                      {t.englishVersionPage.missionItems.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-gray-300">
                          <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: c.chip }}>
                            <CheckCircle className="h-3.5 w-3.5" style={{ color: c.primary }} />
                          </span>
                          <span className="pt-0.5">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Objectives */}
                <div
                  className="rounded-[26px] p-6 md:p-8"
                  style={{
                    background: `linear-gradient(135deg, ${c.surface}, #ffffff)`,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: c.chip, color: c.primary }}>
                      <Award className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100">{t.englishVersionPage.headingObjectives}</h3>
                  </div>
                  <p className="text-sm leading-7 text-slate-600 dark:text-gray-300 mb-5">{t.englishVersionPage.objectivesText}</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {t.englishVersionPage.objectivesItems.map((item, idx) => {
                      const IconObj = [Star, BookOpen, Heart, Compass, Shield, Lightbulb][idx % 6];
                      return (
                        <div key={idx}
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                          style={{ background: "#ffffff", border: `1px solid ${c.border}` }}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: c.chip, color: c.primary }}>
                            <IconObj className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Philosophy */}
                <div
                  className="rounded-[26px] p-6 md:p-8"
                  style={{
                    background: `linear-gradient(135deg, ${c.surface}, #ffffff)`,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: c.chip, color: c.primary }}>
                      <ScrollText className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100">{t.englishVersionPage.headingPhilosophy}</h3>
                  </div>
                  <p className="text-sm leading-7 text-slate-600 dark:text-gray-300">{t.englishVersionPage.philosophyText}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-gray-400">{t.englishVersionPage.philosophyDetail}</p>
                </div>

                {/* Facilities */}
                <div
                  className="rounded-[26px] p-6 md:p-8"
                  style={{
                    background: `linear-gradient(135deg, ${c.surface}, #ffffff)`,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: c.chip, color: c.primary }}>
                      <Library className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100">{t.englishVersionPage.headingFacilities}</h3>
                  </div>
                  <p className="text-sm leading-7 text-slate-600 dark:text-gray-300 mb-6">{t.englishVersionPage.facilitiesText}</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {t.englishVersionPage.facilitiesList.map((item, idx) => {
                      const IconFac = [Star, BookOpen, Heart, Shield, Monitor, Lightbulb, Compass, Sun, Moon, GraduationCap, Award, CheckCircle, TreePine][idx % 13];
                      return (
                        <div key={idx}
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                          style={{ background: "#ffffff", border: `1px solid ${c.border}` }}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: c.chip, color: c.primary }}>
                            <IconFac className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* --- বিভাগভিত্তিক নোটিশ --- */}
          <SectionCard id="notices" icon={Bell} title={t.deptPage.notices} colors={c}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500 dark:text-gray-400">
                {t.deptPage.noticesForDept}
              </p>
              <Link
                href="/notices"
                className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300 hover:gap-3"
                style={{ color: c.primary }}
              >
                {t.deptPage.allNotices}
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
            {filteredNotices.length === 0 ? (
              <div
                className="rounded-2xl px-5 py-10 text-center text-sm text-slate-500 dark:text-gray-400"
                style={{ background: c.surface, border: `1px dashed ${c.border}` }}
              >
                <Bell className="mx-auto mb-2 h-6 w-6 opacity-40" style={{ color: c.primary }} />
                {t.deptPage.noNotices}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredNotices.slice(0, 6).map((notice) => (
                  <Link
                    key={notice.id}
                    href={`/notices/${notice.id}`}
                    className="block rounded-[24px] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer group dark:bg-gray-800/50"
                    style={{ background: c.surface, border: `1px solid ${c.border}` }}
                  >
                    <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: c.chip, color: c.chipText }}
                    >
                      <Bell className="h-3 w-3" />
                      {notice.department || "সকল"}
                    </div>
                    <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-gray-100 group-hover:underline decoration-1 underline-offset-2" style={{ color: c.primary }}>{notice.title}</h2>
                    {notice.body ? (
                      <p className="mt-2 line-clamp-4 text-sm leading-7 text-slate-600 dark:text-gray-300">{notice.body}</p>
                    ) : null}
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold" style={{ color: c.primary }}>
                      {lang === 'bn' ? 'বিস্তারিত পড়ুন' : lang === 'ar' ? 'اقرأ المزيد' : 'Read more'}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>


          {/* --- বিভাগভিত্তিক গ্যালারি — No "বিস্তারিত দেখুন" --- */}
          <SectionCard id="gallery" icon={FileImage} title={t.deptPage.gallery} colors={c}>
            {filteredGallery.length === 0 ? (
              <div
                className="rounded-2xl px-5 py-10 text-center text-sm text-slate-500 dark:text-gray-400"
                style={{ background: c.surface, border: `1px dashed ${c.border}` }}
              >
                <ImageIcon className="mx-auto mb-2 h-6 w-6 opacity-40" style={{ color: c.primary }} />
                {t.deptPage.noGallery}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredGallery.slice(0, 12).map((item) => (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-[22px] bg-white dark:bg-gray-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    style={{
                      border: `1px solid ${c.border}`,
                      boxShadow: `0 16px 34px -26px ${c.glow}`,
                    }}
                  >
                    <button type="button" className="block w-full text-left" onClick={() => setSelectedImage(item)}>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                      <div className="px-4 py-4">
                        <h2 className="line-clamp-2 text-sm font-bold text-slate-800 dark:text-gray-100">{item.title}</h2>
                      </div>
                    </button>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>

          {/* --- CTA SECTION — No extra text, updated link --- */}
          <section
            className="relative overflow-hidden rounded-[30px] px-6 py-10 text-center md:px-10 md:py-14"
            style={{
              background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`,
              boxShadow: `0 24px 60px -30px ${c.glow}`,
            }}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl opacity-30"
              style={{ background: "rgba(255,255,255,0.2)" }}
            />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full blur-3xl opacity-20"
              style={{ background: "rgba(212,175,55,0.3)" }}
            />

            <div className="relative">
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                {t.deptPage.admissionHeading.replace("{dept}", department.shortLabel)}
              </h2>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/admission-choice"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                  style={{ color: c.primary }}
                >
                  {t.deptPage.admissionBtn}
                  <ChevronRight className="h-4 w-4 transition-all duration-300 group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#overview"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-6 py-3 text-sm font-bold text-white/95 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5"
                >
                  {t.deptPage.deptOverview}
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ===== IMAGE LIGHTBOX ===== */}
      {selectedImage ? (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="max-w-4xl overflow-hidden rounded-[28px] bg-white dark:bg-gray-800 animate-fade-scale"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-[52vh] w-[min(92vw,960px)]">
              <Image
                src={selectedImage.image_url}
                alt={selectedImage.title}
                fill
                className="object-contain"
                sizes="92vw"
              />
            </div>
            <div className="px-5 py-4">
              <p className="text-base font-bold text-slate-900 dark:text-gray-100">{selectedImage.title}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: c.primary }}>
                {selectedImage.department || department.shortLabel}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
