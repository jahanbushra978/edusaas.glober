import React from "react";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { GraduationCap,
  UserCheck, Lock, Facebook, Youtube, Quote,
} from "lucide-react";

// Home sub-sections
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import WhyUsSection from "@/components/home/WhyUsSection";
import FacilitiesSection from "@/components/home/FacilitiesSection";
import ContactSection from "@/components/home/ContactSection";
import SeasonPanels from "@/components/home/SeasonPanels";
import ResultsSection from "@/components/home/ResultsSection";
import DepartmentGallery from "@/components/home/DepartmentGallery";
import BranchesSection from "@/components/home/BranchesSection";
import AcademicsSection from "@/components/home/AcademicsSection";
import SponsorShowcase from "@/components/home/SponsorShowcase";
import TeachersSection from "@/components/home/TeachersSection";
import AdmissionsSection from "@/components/home/AdmissionsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import SuccessStoriesSection from "@/components/home/SuccessStoriesSection";
import EventsSection from "@/components/home/EventsSection";
import BlogsSection from "@/components/home/BlogsSection";
import FaqsSection from "@/components/home/FaqsSection";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";

const LOGO_URL = "/rahmania-logo-v2.png";
const ADDRESS_DEFAULT = "Harinal, Gazipur City, Dhaka, Bangladesh";

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/RahmaniaInstituteHifzMadrasagazipur", icon: Facebook },
  { label: "YouTube", href: "https://www.youtube.com/@RahmaniaInstitute1700", icon: Youtube },
];

const getPortals = (t) => [
  {
    key: "student", emojiBn: "📘", title: t.portals.studentTitle,
    headerGrad: "linear-gradient(135deg,#1a4a3a,#1e6b52)", accentColor: "#4ade80",
    icon: GraduationCap,
    features: t.portals.features.student,
    btnLabel: t.portals.studentLogin,
    btnNote: t.portals.studentNote,
    to: "/StudentLogin",
  },
  {
    key: "teacher", emojiBn: "👨‍🏫", title: t.portals.teacherTitle,
    headerGrad: "linear-gradient(135deg,#1a3a4a,#1e526b)", accentColor: "#60a5fa",
    icon: UserCheck,
    features: t.portals.features.teacher,
    btnLabel: t.portals.teacherLogin,
    btnNote: t.portals.teacherNote,
    to: "/TeacherLogin",
  },
  {
    key: "admin", emojiBn: "🔐", title: t.portals.adminTitle,
    headerGrad: "linear-gradient(135deg,#3a2a1a,#5c4020)", accentColor: "#fbbf24",
    icon: Lock,
    features: t.portals.features.admin,
    btnLabel: t.portals.adminLogin,
    btnNote: t.portals.adminNote,
    to: "/login",
  },
];

export default function Home() {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isBn = lang === "bn";
  const isAr = lang === "ar";

  const { data: notices = [] } = useQuery({
    queryKey: ["notices-public-home"],
    queryFn: () => appClient.entities.Notice.list("-created_date", 50),
    select: d => d.filter(n => n.is_active && n.show_on_homepage !== false && n.status !== "draft"),
    enabled: !!lang,
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["app-settings-public"],
    queryFn: () => appClient.entities.AppSettings.list(),
    enabled: !!lang,
  });

  const getSetting = key => (Array.isArray(settings) ? settings : []).find(s => s.key === key)?.value;
  const instNameEn = getSetting("institute_name_en") || "Rahmania Institute (রহমানিয়া ইনস্টিটিউট)";
  const instNameBn = getSetting("institute_name_bn") || "জামিয়া রহমানিয়া গাজীপুর";
  const instNameAr = getSetting("institute_name_ar") || "معهد الرحمانية";
  const instName   = isBn ? instNameBn : isAr ? instNameAr : instNameEn;

  const address    = getSetting("address") || (isBn ? "হরিণাল, গাজীপুর সিটি, ঢাকা, বাংলাদেশ" : isAr ? "هارينال، مدينة غازيبور، دكا، بنغلاديش" : ADDRESS_DEFAULT);
  const phone      = getSetting("contact_phone") || "01906898939";
  const email      = getSetting("email") || "rahmaniainstitute.org@gmail.com";

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ══ HERO SECTION ══ */}
      <HeroSection notices={notices} />

      {/* ══ ABOUT SECTION ══ */}
      <div className="animate-fade-up overflow-x-hidden"><AboutSection /></div>

      {/* ══ SPONSOR / FEATURED PARTNER SHOWCASE ══ */}
      <div className="overflow-x-hidden"><SponsorShowcase /></div>

      {/* ══ ACADEMICS ══ */}
      <div className="animate-fade-down overflow-x-hidden"><AcademicsSection /></div>

      {/* ══ WHY CHOOSE US ══ */}
      <div className="animate-zoom-in overflow-x-hidden"><WhyUsSection /></div>

      {/* ══ SUCCESS STORIES ══ */}
      <div className="animate-fade-up overflow-x-hidden"><SuccessStoriesSection /></div>

      {/* ══ CHAIRMAN'S MESSAGE SECTION ══ */}
      <section className="py-16 bg-slate-50 overflow-x-hidden animate-flip-up">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 md:p-12 text-center relative shadow-sm border border-slate-100 overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/5 -translate-x-12 -translate-y-12 rounded-full" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/5 translate-x-16 translate-y-16 rounded-full" />
            
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-50 border border-amber-100">
                <Quote className="w-7 h-7 text-amber-600" />
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold italic text-emerald-900 mb-8">{t.chairman.title}</h2>
            <blockquote className={`text-base md:text-xl leading-relaxed text-slate-700 mb-8 font-medium italic break-words ${isAr ? 'direction-rtl' : ''}`}>
              {t.chairman.quote}
            </blockquote>

            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-12 bg-slate-200" />
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div className="h-px w-12 bg-slate-200" />
            </div>

            <p className="text-lg font-bold text-emerald-900">— {t.chairman.name}</p>
            <p className="text-sm text-slate-500 italic mt-1">{instName}</p>
          </div>
        </div>
      </section>

      {/* ══ EVENTS ══ */}
      <div className="animate-fade-left overflow-x-hidden"><EventsSection /></div>

      {/* ══ FACILITIES ══ */}
      <div className="stagger-children overflow-x-hidden"><FacilitiesSection /></div>

      {/* ══ SEASON / DEPARTMENT PANELS ══ */}
      <div className="animate-reveal py-14 overflow-x-hidden" style={{ background: "linear-gradient(160deg,#0e2e1f 0%,#144733 50%,#0e2e1f 100%)" }}>
        <SeasonPanels />
      </div>

      {/* ══ EXAM RESULTS ══ */}
      <div id="results-section" className="py-14 bg-white scroll-mt-20 animate-fade-left overflow-x-hidden">
        <ResultsSection />
      </div>

      {/* ══ DEPARTMENT GALLERY ══ */}
      <div className="animate-zoom-out overflow-x-hidden"><DepartmentGallery /></div>

      {/* ══ BRANCHES ══ */}
      <div className="animate-reveal overflow-x-hidden"><BranchesSection /></div>

      {/* ══ TEACHERS ══ */}
      <div className="animate-fade-up overflow-x-hidden"><TeachersSection /></div>

      {/* ══ BLOGS ══ */}
      <div className="animate-fade-down overflow-x-hidden"><BlogsSection /></div>

      {/* ══ ADMISSIONS ══ */}
      <div className="animate-flip-up overflow-x-hidden"><AdmissionsSection /></div>

      {/* ══ TESTIMONIALS ══ */}
      <div className="animate-fade-up overflow-x-hidden"><TestimonialsSection /></div>

      {/* ══ FAQS ══ */}
      <div className="animate-fade-down overflow-x-hidden"><FaqsSection /></div>

      {/* ══ PORTAL LOGIN CARDS ══ */}
      <section className="py-14 overflow-x-hidden animate-fade-down" style={{ background: "linear-gradient(180deg,#f0f9f4 0%,#ffffff 100%)" }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3 uppercase tracking-widest"
              style={{ background: "rgba(0,100,60,0.08)", border: "1px solid rgba(0,100,60,0.2)", color: "#006400" }}>
              {t.portals.access}
            </div>
            <h2 className="text-2xl font-extrabold italic text-slate-800">{t.portals.title}</h2>
            <p className="text-sm text-slate-500 mt-1">{t.portals.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {getPortals(t).filter((panel) => panel.key !== "admin").map(panel => {
              const Icon = panel.icon;
              return (
                <Link
                  key={panel.key}
                  href={"/" + panel.to}
                  className="group rounded-2xl overflow-hidden flex flex-col bg-white border border-black/10 shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-xl active:scale-95"
                >
                  <div className={`px-5 py-4 flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`} style={{ background: panel.headerGrad }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 border border-white/30 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="font-bold italic text-white text-sm">{panel.title}</p>
                  </div>

                  <div className="p-5 flex flex-col flex-1 gap-4">
                    <div className="space-y-2.5">
                      {panel.features.map((f, i) => (
                        <div key={i} className={`flex items-center gap-2.5 text-xs text-slate-600 italic ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: panel.accentColor }} />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto">
                      <button className={`w-full h-11 font-bold italic text-white gap-2 rounded-xl flex items-center justify-center transition-all ${isAr ? 'flex-row-reverse' : ''}`}
                        style={{ background: panel.headerGrad }}>
                        <Icon className="h-4 w-4" /> <span>{panel.btnLabel}</span>
                      </button>
                      <p className="text-[10px] text-center text-slate-400 italic mt-1.5">{panel.btnNote}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <div className="animate-rotate-in overflow-x-hidden"><ContactSection /></div>
    </div>
  );
}
