"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, UserCheck, Lock, Quote } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";
import { HomeDataProvider, useHomeData } from "@/lib/HomeDataContext";

import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";

import AboutSection from "@/components/home/AboutSection";
import SponsorShowcase from "@/components/home/SponsorShowcase";
import WhyUsSection from "@/components/home/WhyUsSection";
import FacilitiesSection from "@/components/home/FacilitiesSection";
import SeasonPanels from "@/components/home/SeasonPanels";
import DepartmentGallery from "@/components/home/DepartmentGallery";
import BranchesSection from "@/components/home/BranchesSection";
import TeachersSection from "@/components/home/TeachersSection";
import AdmissionsSection from "@/components/home/AdmissionsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import SuccessStoriesSection from "@/components/home/SuccessStoriesSection";
import EventsSection from "@/components/home/EventsSection";
import BlogsSection from "@/components/home/BlogsSection";
import ContactSection from "@/components/home/ContactSection";

// NOTE: this used to animate x:-80 / x:80 (slide in from left/right).
// Sideways motion forces the browser to repaint horizontally on every scroll
// tick and needed `overflow-x-hidden` hacks to hide the spill-over — a big
// source of the janky/"stuck" scroll feeling. Everything below only animates
// opacity + y + scale, which the GPU composites cheaply, so scrolling stays
// smooth while the reveal still looks lively.

// A distinct, soft background tint per section so each block of the homepage
// reads as its own separated "card" — matches the brand's green/gold palette
// but keeps every other box visually different.
const boxColors = [
  "#FFFFFF", // hero — stays plain, it already has its own design
  "#F1F8F4", // soft mint
  "#FFFCF2", // warm ivory
  "#F0F7FA", // pale sky
  "#FBF3F5", // soft blush
  "#F0F6F1", // sage
  "#FDF7EA", // champagne gold
  "#EFF7F6", // pale teal
  "#FAF6EF", // warm sand
];

const getPortals = (t) => [
  {
    key: "student", emojiBn: "📘", title: t.portals.studentTitle,
    headerGrad: "linear-gradient(135deg,#1a4a3a,#1e6b52)", accentColor: "#4ade80",
    icon: GraduationCap,
    features: t.portals.features.student,
    btnLabel: t.portals.studentLogin,
    btnNote: t.portals.studentNote,
    to: "StudentLogin",
  },
  {
    key: "teacher", emojiBn: "👨‍🏫", title: t.portals.teacherTitle,
    headerGrad: "linear-gradient(135deg,#1a3a4a,#1e526b)", accentColor: "#60a5fa",
    icon: UserCheck,
    features: t.portals.features.teacher,
    btnLabel: t.portals.teacherLogin,
    btnNote: t.portals.teacherNote,
    to: "TeacherLogin",
  },
  {
    key: "admin", emojiBn: "🔐", title: t.portals.adminTitle,
    headerGrad: "linear-gradient(135deg,#3a2a1a,#5c4020)", accentColor: "#fbbf24",
    icon: Lock,
    features: t.portals.features.admin,
    btnLabel: t.portals.adminLogin,
    btnNote: t.portals.adminNote,
    to: "AdminLogin",
  },
];

function AnimatedSection({ children, idx = 0, className = "", plain = false, bg }) {
  const boxColor = bg || boxColors[idx % boxColors.length];

  // The hero (idx 0) and any section explicitly marked `plain` keep their own
  // full-bleed design and skip the boxed-card treatment.
  if (plain || idx === 0) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`w-full ${className}`}
      style={{ backgroundColor: boxColor }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {children}
      </div>
    </div>
  );
}

function HomeContent() {
  const { lang, setLang } = useLanguage();
  const t = useTranslation(lang);
  const isBn = lang === "bn";
  const isAr = lang === "ar";
  const { data: homeData, isLoading } = useHomeData();

  // Only show a full-page spinner on the very first client-only render when
  // no SSR data is available at all (e.g. network error on the server).
  // When initialData is seeded from the Server Component, isLoading is
  // false on the first render — Google Bot sees the full page HTML.
  if (isLoading && !homeData) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;

  const settings = homeData?.appSettings || {};
  const pageSections = homeData?.pageSections || {};
  const isVisible = (key) => {
    const section = pageSections[key];
    if (!section) return true;
    return section.is_visible !== false;
  };

  const instNameEn = settings.institute_name_en || "Rahmania Institute (রহমানিয়া ইনস্টিটিউট)";
  const instNameBn = settings.institute_name_bn || "রহমানিয়া ইনস্টিটিউট";
  const instNameAr = settings.institute_name_ar || "معهد الرحمانية";
  const instName   = lang === "bn" ? instNameBn : lang === "ar" ? instNameAr : instNameEn;

  const instDesc = lang === "ar"
    ? "معهد الرحمانية هو مؤسسة تعليمية إسلامية راسخة تقدم التعليم من خلال دمج القيم الإسلامية مع التعليم الحديث."
    : lang === "bn"
    ? "দ্বীনি ও জাগতিক শিক্ষার সমন্বয়ে গড়ে ওঠা আধুনিক শিক্ষা প্রতিষ্ঠান। নূরানী, নাজেরা, হিফয, কিতাবখানা ও ইংলিশ ভার্সন বিভাগে পাঠদান।"
    : "Rahmania Institute is an established Islamic educational institution integrating Islamic values with modern academic education.";

  const instSlogan = lang === "ar" ? "علم · أخلاق · تقوى" : lang === "bn" ? "ইলম · আখলাক · তাকওয়া" : "Ilm · Akhlaq · Taqwa";

  const streetAddress = lang === "ar" ? "هارينال" : lang === "bn" ? "হাড়িনাল" : "Harinal";
  const addressLocality = lang === "ar" ? "مدينة غازيبور" : lang === "bn" ? "গাজীপুর সিটি" : "Gazipur City";
  const addressRegion = lang === "ar" ? "دكا" : lang === "bn" ? "ঢাকা" : "Dhaka";
  const addressCountry = lang === "ar" ? "بنغلاديش" : lang === "bn" ? "Bangladesh" : "Bangladesh";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": "https://rahmaniainstitute.org/#organization",
        "name": instName,
        "alternateName": ["Jamia Rahmania Gazipur", "জামিয়া রহমানিয়া গাজীপুর", "معهد الرحمانية"],
        "url": "https://rahmaniainstitute.org",
        "logo": "https://rahmaniainstitute.org/rahmania-logo-v2.png",
        "image": "https://rahmaniainstitute.org/rahmania-logo-v2.png",
        "description": instDesc,
        "slogan": instSlogan,
        "foundingDate": "2016",
        "founder": {
          "@type": "Person",
          "name": "Rafiqullah Khan"
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": settings.contact_phone || "+8801906898939",
            "contactType": "customer service",
            "areaServed": "BD",
            "availableLanguage": ["Bengali", "English", "Arabic"]
          },
          {
            "@type": "ContactPoint",
            "telephone": settings.contact_phone || "+8801906898939",
            "contactType": "admissions",
            "areaServed": "BD",
            "availableLanguage": ["Bengali", "English", "Arabic"]
          }
        ],
        "address": {
          "@type": "PostalAddress",
          "streetAddress": settings.address || streetAddress,
          "addressLocality": addressLocality,
          "addressRegion": addressRegion,
          "addressCountry": addressCountry,
          "postalCode": "1700"
        },
        "email": settings.email || "rahmaniainstitute.org@gmail.com",
        "sameAs": [
          "https://www.facebook.com/RahmaniaInstituteHifzMadrasagazipur",
          "https://www.youtube.com/@RahmaniaInstitute1700"
        ],
        "knowsLanguage": ["bn", "en", "ar"],
        "teaches": [
          { "@type": "EducationalOccupationalProgram", "name": lang === "ar" ? "نوراني" : lang === "bn" ? "নূরানী" : "Noorani" },
          { "@type": "EducationalOccupationalProgram", "name": lang === "ar" ? "ناظرة" : lang === "bn" ? "নাজেরা" : "Nazera" },
          { "@type": "EducationalOccupationalProgram", "name": lang === "ar" ? "حفظ" : lang === "bn" ? "হিফয" : "Hifz" },
          { "@type": "EducationalOccupationalProgram", "name": lang === "ar" ? "كتابخانة" : lang === "bn" ? "কিতাবখানা" : "Kitabkhana" },
          { "@type": "EducationalOccupationalProgram", "name": lang === "ar" ? "النسخة الإنجليزية" : lang === "bn" ? "ইংলিশ ভার্সন" : "English Version" },
          { "@type": "EducationalOccupationalProgram", "name": lang === "ar" ? "روضة الأطفال" : lang === "bn" ? "কিন্ডারগার্টেন" : "Kindergarten" }
        ]
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://rahmaniainstitute.org/#localbusiness",
        "name": instName,
        "image": "https://rahmaniainstitute.org/rahmania-logo-v2.png",
        "telephone": settings.contact_phone || "+8801906898939",
        "email": settings.email || "rahmaniainstitute.org@gmail.com",
        "url": "https://rahmaniainstitute.org",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": settings.address || streetAddress,
          "addressLocality": addressLocality,
          "addressRegion": addressRegion,
          "addressCountry": addressCountry
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "23.9922",
          "longitude": "90.4125"
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Saturday",
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday"
          ],
          "opens": "07:00",
          "closes": "18:00"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://rahmaniainstitute.org/#website",
        "url": "https://rahmaniainstitute.org",
        "name": instName,
        "inLanguage": ["bn", "en", "ar"],
        "description": instDesc
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": lang === "ar" ? "الرئيسية" : lang === "bn" ? "হোম" : "Home", "item": "https://rahmaniainstitute.org" },
          { "@type": "ListItem", "position": 2, "name": lang === "ar" ? "الإشعارات" : lang === "bn" ? "নোটিশ" : "Notices", "item": "https://rahmaniainstitute.org/notices" },
          { "@type": "ListItem", "position": 3, "name": lang === "ar" ? "المعلمون" : lang === "bn" ? "শিক্ষক" : "Teachers", "item": "https://rahmaniainstitute.org/teachers" },
          { "@type": "ListItem", "position": 4, "name": lang === "ar" ? "القبول" : lang === "bn" ? "ভর্তি" : "Admission", "item": "https://rahmaniainstitute.org/admission" }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {isVisible('hero_slider') && <AnimatedSection idx={0}>
        <HeroSection notices={homeData?.notices} />
      </AnimatedSection>}


      {isVisible('about') && <AnimatedSection idx={1} bg="#F8FAFC">
        <AboutSection />
      </AnimatedSection>}

      {isVisible('sponsors') && <AnimatedSection idx={2} bg="#FFFFFF">
        <SponsorShowcase sponsors={homeData?.sponsors} />
      </AnimatedSection>}


      {isVisible('why_us') && <AnimatedSection idx={4} bg="#ECFDF5">
        <WhyUsSection />
      </AnimatedSection>}

      {isVisible('chairman_msg') && <AnimatedSection idx={5}>
        <section className="py-14 md:py-16 overflow-x-hidden" style={{ background: "linear-gradient(180deg, #f8fbf9 0%, #ffffff 100%)" }}>
          <div className="max-w-4xl mx-auto px-4">
            <div
              className="bg-white rounded-2xl p-6 md:p-10 text-center relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              style={{
                boxShadow: "0 4px 20px rgba(0,100,60,0.08), 0 0 0 1px rgba(212,175,55,0.15)",
                border: "1.5px solid rgba(212,175,55,0.1)"
              }}
            >
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 rounded-tl-2xl" style={{ borderColor: "rgba(212,175,55,0.2)" }} />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 rounded-br-2xl" style={{ borderColor: "rgba(212,175,55,0.2)" }} />
              <div className="flex justify-center mb-5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110"
                  style={{ background: "rgba(212,175,55,0.1)" }}>
                  <Quote className="w-6 h-6" style={{ color: "#D4AF37" }} />
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold italic mb-6 transition-colors duration-300" style={{ color: "#006400" }}>
                {t.chairman.title}
              </h2>
              <blockquote className="text-base md:text-lg leading-relaxed text-slate-700 mb-6 font-medium italic">
                {t.chairman.quote}
              </blockquote>
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="h-px w-12" style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.4), transparent)" }} />
                <div className="w-2 h-2 rounded-full" style={{ background: "#D4AF37" }} />
                <div className="h-px w-12" style={{ background: "linear-gradient(to left, transparent, rgba(212,175,55,0.4), transparent)" }} />
              </div>
              <p className="text-sm font-medium text-slate-600 italic mb-1" style={{ color: "#006400" }}>
                — {t.chairman.name}
              </p>
              <p className="text-xs text-slate-500 italic">{instName}</p>
            </div>
          </div>
        </section>
      </AnimatedSection>}

      {isVisible('facilities') && <AnimatedSection idx={6} bg="#EFF6FF">
        <FacilitiesSection />
      </AnimatedSection>}

      {isVisible('season_panels') && <AnimatedSection idx={7} plain={true}>
        <div style={{ background: "linear-gradient(160deg,#0e2e1f 0%,#144733 50%,#0e2e1f 100%)" }} className="py-14">
          <SeasonPanels students={homeData?.students} />
        </div>
      </AnimatedSection>}

      {isVisible('gallery') && <AnimatedSection idx={8} bg="#F0FDFA">
        <DepartmentGallery />
      </AnimatedSection>}

      <AnimatedSection idx={9} bg="#F5F3FF">
        <TeachersSection teachers={homeData?.teachers} sectionData={homeData?.pageSections?.teachers_intro} />
      </AnimatedSection>


      {isVisible('branches') && <AnimatedSection idx={11} bg="#EFF6FF">
        <BranchesSection branches={homeData?.branches} />
      </AnimatedSection>}

      {isVisible('testimonials') && <AnimatedSection idx={12} bg="#F8FAFC">
        <TestimonialsSection testimonials={homeData?.testimonials} />
      </AnimatedSection>}

      {isVisible('success_stories') && <AnimatedSection idx={13} bg="#FFFFFF">
        <SuccessStoriesSection stories={homeData?.successStories} />
      </AnimatedSection>}

      {isVisible('blogs') && <AnimatedSection idx={14} bg="#FFF8FA">
        <BlogsSection blogs={homeData?.blogs} />
      </AnimatedSection>}

      {isVisible('events') && <AnimatedSection idx={15} bg="#F8F9FF">
        <EventsSection events={homeData?.events} />
      </AnimatedSection>}


      <AnimatedSection idx={16} plain={true}>
        <AdmissionsSection sectionData={homeData?.pageSections?.admissions} contactPhone={homeData?.appSettings?.contact_phone} />
      </AnimatedSection>

      {isVisible('portals') && <AnimatedSection idx={17}>
        <section className="py-14 overflow-x-hidden" style={{ background: "linear-gradient(180deg,#f0f9f4 0%,#ffffff 100%)" }}>
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-extrabold italic mb-3 tracking-tight text-[#006400]">
                {t.portals.access}
              </h2>
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-20 bg-gradient-to-r from-transparent to-yellow-400/60" />
                <div className="w-2 h-2 rounded-full" style={{ background: "#D4AF37" }} />
                <div className="h-px w-20 bg-gradient-to-l from-transparent to-yellow-400/60" />
              </div>
              <p className="text-sm text-slate-500 mt-3 italic">{t.portals.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto justify-center">
              {getPortals(t).filter((panel) => panel.key !== "admin").map((panel, pIdx) => {
                const Icon = panel.icon;
                return (
                  <div key={panel.key} className="w-full flex">
                    <Link href={"/" + panel.to}
                      className="group w-full rounded-[24px] overflow-hidden flex flex-col cursor-pointer bg-white border-[1.5px] border-black/[0.06] shadow-[0_8px_30px_rgba(0,60,40,0.06)] hover:shadow-[0_30px_70px_rgba(0,60,40,0.18)] hover:-translate-y-1.5 hover:scale-[1.015] transition-all duration-300 active:scale-[0.98] touch-manipulation"
                      style={{ background: "rgba(255,255,255,0.99)" }}>
                      <div className="px-5 py-4 flex items-center gap-3" style={{ background: panel.headerGrad }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:rotate-[8deg] group-hover:scale-[1.1]"
                          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", transition: "all 0.3s" }}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold italic text-white text-sm sm:text-base truncate">{panel.emojiBn} {panel.title}</p>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1 gap-4 bg-gradient-to-b from-white to-slate-50/50">
                        <div className="space-y-3">
                          {panel.features.map((f, i) => (
                            <div key={i} className={`flex items-center gap-3 text-xs text-slate-600 font-semibold italic ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                              <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ background: panel.accentColor }} />
                              <span className="truncate">{f}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-auto">
                          <button
                            className={`w-full h-11 font-extrabold italic text-white gap-2 text-sm rounded-xl flex items-center justify-center transition-all shadow-md group-hover:shadow-lg active:scale-[0.98] touch-manipulation ${isAr ? 'flex-row-reverse' : ''}`}
                            style={{ background: panel.headerGrad, boxShadow: `0 4px 15px ${panel.accentColor}25` }}>
                            <Icon className="h-4 w-4 shrink-0" /> <span className="truncate">{panel.btnLabel}</span>
                          </button>
                          <p className="text-[10px] sm:text-[11px] text-center text-slate-400 font-semibold italic mt-2 truncate">{panel.btnNote}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </AnimatedSection>}

      {isVisible('contact') && <AnimatedSection idx={17} plain={true}>
        <ContactSection />
      </AnimatedSection>}
    </div>
  );
}

/**
 * Home receives `initialData` from the Server Component (page.jsx → HomeClient).
 * Passing it into HomeDataProvider ensures useQuery's initialData is set, so
 * the first server render produces full HTML content — no spinner for bots.
 */
export default function Home({ initialData }) {
  return (
    <HomeDataProvider initialData={initialData}>
      <HomeContent />
    </HomeDataProvider>
  );
}
