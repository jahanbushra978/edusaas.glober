import React, { useMemo } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { Phone, Mail, ClipboardList } from "lucide-react";
import Link from "next/link";
import { createPageUrl } from "@/utils";

const DEFAULT_STEPS_EN = [
  "Visit the institute or call our admission office",
  "Fill in the admission form with required information",
  "Submit necessary documents (birth certificate, photos)",
  "Attend a short placement assessment",
  "Confirm admission and pay initial fees",
];

const DEFAULT_STEPS_BN = [
  "ইনস্টিটিউটে সরাসরি আসুন অথবা আমাদের ভর্তি অফিসে কল করুন",
  "প্রয়োজনীয় তথ্য দিয়ে ভর্তির ফর্ম পূরণ করুন",
  "প্রয়োজনীয় কাগজপত্র জমা দিন (জন্ম সনদ, ছবি)",
  "একটি সংক্ষিপ্ত মূল্যায়ন পরীক্ষায় অংশগ্রহণ করুন",
  "ভর্তি নিশ্চিত করুন এবং প্রাথমিক ফি প্রদান করুন",
];

const DEFAULT_STEPS_AR = [
  "قم بزيارة المعهد أو اتصل بمكتب القبول لدينا",
  "املأ نموذج القبول بالمعلومات المطلوبة",
  "تقديم المستندات اللازمة (شهادة الميلاد، الصور)",
  "حضور تقييم قصير لتحديد المستوى",
  "تأكيد القبول ودفع الرسوم الأولية",
];

const PHONE_DEFAULT = "01906898939";
const EMAIL_DEFAULT = "rahmaniainstitute.org@gmail.com";

export default function AdmissionsSection({ sectionData: propSectionData, contactPhone: propContactPhone }) {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isBn = lang === "bn";
  const isAr = lang === "ar";

  const { data: fetchedSectionData } = useQuery({
    queryKey: ["page-section-admissions"],
    queryFn: () => appClient.entities.PageSection.filter({ section_key: "admissions" }),
    select: d => d[0],
    enabled: propSectionData === undefined,
  });

  const sectionData = propSectionData || fetchedSectionData;

  const { data: settings = [] } = useQuery({
    queryKey: ["app-settings-public"],
    queryFn: () => appClient.entities.AppSettings.list(),
    enabled: propContactPhone === undefined,
  });

  const getSetting = key => (Array.isArray(settings) ? settings : []).find(s => s.key === key)?.value;
  const phone = propContactPhone || getSetting("contact_phone") || PHONE_DEFAULT;

  const titleEn = sectionData?.title_en || "Admissions Open";
  const titleBn = sectionData?.title_bn || "ভর্তি চলছে";
  const titleAr = sectionData?.title_ar || "القبول مفتوح";

  const subtitleEn = sectionData?.subtitle_en || "Join Rahmania Institute — enrol now for the new academic session";
  const subtitleBn = sectionData?.subtitle_bn || "রহমানিয়া ইনস্টিটিউটে যোগ দিন — নতুন শিক্ষাবর্ষে এখনই ভর্তি হন";
  const subtitleAr = sectionData?.subtitle_ar || "انضم إلى معهد الرحمانية — سجل الآن للفصل الدراسي الجديد";

  const bodyEn = sectionData?.body_en || "We welcome students of all ages and backgrounds. Our structured admission process ensures every child is placed in the right programme suited to their level.";
  const bodyBn = sectionData?.body_bn || "আমরা সকল বয়স ও পটভূমির শিক্ষার্থীদের স্বাগত জানাই। আমাদের সুশৃঙ্খল ভর্তি প্রক্রিয়া নিশ্চিত করে যে প্রতিটি শিশু তার স্তর অনুযায়ী সঠিক প্রোগ্রামে ভর্তি হতে পারে।";
  const bodyAr = sectionData?.body_ar || "نرحب بالطلاب من جميع الأعمار والخلفيات. تضمن عملية القبول المنظمة لدينا وضع كل طفل في البرنامج المناسب لمستواه.";

  const currentTitle = isBn ? titleBn : isAr ? titleAr : titleEn;
  const currentSubtitle = isBn ? subtitleBn : isAr ? subtitleAr : subtitleEn;
  const currentBody = isBn ? bodyBn : isAr ? bodyAr : bodyEn;

  const steps = useMemo(() => {
    if (sectionData?.items_json) {
      try {
        const items = JSON.parse(sectionData.items_json);
        return items.map(s => isBn ? (s.bn || s) : isAr ? (s.ar || s.en || s) : (s.en || s));
      } catch {}
    }
    return isBn ? DEFAULT_STEPS_BN : isAr ? DEFAULT_STEPS_AR : DEFAULT_STEPS_EN;
  }, [sectionData, isBn, isAr]);

  if (sectionData?.is_visible === false) return null;

  return (
    <section id="admissions-section" className="py-16 scroll-mt-24 overflow-x-hidden transition-all duration-300" style={{ background: "#064E3B" }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-start ${isAr ? 'direction-rtl' : ''}`}>
          {/* Left: Info */}
          <div className={isAr ? 'text-right' : ''}>
            <h2 className="text-3xl sm:text-4xl font-extrabold italic text-[#F7E8B5] mb-4 tracking-tight">
              {isBn ? "ভর্তি বিজ্ঞপ্তি" : isAr ? "إعلان القبول" : "Admissions Announcement"}
            </h2>
            <p className="text-sm text-white/80 mb-5 leading-relaxed">{currentSubtitle}</p>
            <p className="text-sm text-white/70 leading-relaxed mb-6">{currentBody}</p>

            {/* Online Form CTA */}
            <Link href={createPageUrl("AdmissionChoicePage")}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold italic text-sm text-emerald-950 mb-4 w-fit ${isAr ? 'flex-row-reverse' : ''}`}
              style={{
                background: "linear-gradient(135deg,#15803D,#F7E8B5)",
                boxShadow: "0 4px 16px rgba(251,191,36,0.35)",
                transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-3px) scale(1.03)";
                e.currentTarget.style.boxShadow = "0 14px 36px rgba(251,191,36,0.55)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(251,191,36,0.35)";
              }}>
              <ClipboardList className="h-4 w-4" />
              {isBn ? "অনলাইনে আবেদন করুন" : isAr ? "قدم الآن عبر الإنترنت" : "Apply Online Now"}
            </Link>

            {/* Contact CTA */}
            <div className={`flex flex-col sm:flex-row gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <a href={`tel:${phone}`}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold italic text-sm text-white ${isAr ? 'flex-row-reverse' : ''}`}
                style={{
                  background: "linear-gradient(135deg,#008050,#006400)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                  transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-3px) scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.35)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
                }}>
                <Phone className="h-4 w-4" />
                {isBn ? "ফোন করুন" : isAr ? "اتصل الآن" : "Call Now"}: {phone}
              </a>
              <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL_DEFAULT}`} target="_blank" rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold italic text-sm text-white ${isAr ? 'flex-row-reverse' : ''}`}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1.5px solid rgba(255,255,255,0.2)",
                  transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-3px) scale(1.03)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                  e.currentTarget.style.boxShadow = "none";
                }}>
                <Mail className="h-4 w-4" />
                {isBn ? "ইমেইল করুন" : isAr ? "أرسل بريداً" : "Email Us"}
              </a>
            </div>
          </div>

          {/* Right: Steps */}
          <div className={`rounded-3xl p-6 md:p-8 transition-all duration-300 shadow-xl border border-black/5 bg-white ${isAr ? 'text-right' : ''}`}
            style={{ direction: isAr ? 'rtl' : 'ltr' }}>
            <h3 className="font-extrabold italic text-slate-800 mb-5 text-base">
              {isBn ? "ভর্তির ধাপসমূহ" : isAr ? "خطوات القبول" : "Admission Steps"}
            </h3>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i}
                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-250 cursor-default ${isAr ? 'flex-row-reverse' : ''}`}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(6,78,59,0.05)"; e.currentTarget.style.transform = isAr ? "translateX(-4px)" : "translateX(4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateX(0)"; }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs text-white mt-0.5"
                    style={{ background: "linear-gradient(135deg,#064E3B,#10B981)", boxShadow: "0 2px 8px rgba(6,78,59,0.25)" }}>
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
            {/* Divider */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-xs italic text-slate-400 text-center">
                {isBn ? "আরও তথ্যের জন্য সরাসরি যোগাযোগ করুন" : isAr ? "اتصل بنا مباشرة لمزيد من المعلومات" : "Contact us directly for more information"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

