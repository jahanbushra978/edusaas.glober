import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createPageUrl } from "@/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { ChevronDown, Facebook, LogOut, Menu, UserCircle2, X, Youtube } from "lucide-react";
import { useVisitorAuth } from "@/lib/VisitorAuthContext";

export default function HeroNavBar() {
  const { lang, setLang } = useLanguage();
  const t = useTranslation(lang);
  const isBn = lang === "bn";
  const isAr = lang === "ar";
  const [openMenu, setOpenMenu] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [openVisitorMenu, setOpenVisitorMenu] = useState(false);
  const { visitorProfile, isVisitorAuthenticated, signOutVisitor } = useVisitorAuth();

  const { data: settings = [] } = useQuery({
    queryKey: ["app-settings-public"],
    queryFn: () => appClient.entities.AppSettings.list(),
  });

  const getSetting = (key) => (Array.isArray(settings) ? settings : []).find((item) => item.key === key)?.value;
  const instNameEn = getSetting("institute_name_en") || "Rahmania Institute (রহমানিয়া ইনস্টিটিউট)";
  const instNameBn = getSetting("institute_name_bn") || "রহমানিয়া ইনস্টিটিউট";
  const instNameAr = getSetting("institute_name_ar") || "معهد الرحمانية";
  const instName = isBn ? instNameBn : isAr ? instNameAr : instNameEn;
  const phone = getSetting("contact_phone") || "01906898939";
  const email = getSetting("email") || "rahmaniainstitute.org@gmail.com";

  const NAV_ITEMS = [
    { label: isBn ? "হোম" : isAr ? "الرئيسية" : "Home", to: "Home" },
    {
      label: isBn ? "নূর AI কুরআন শিক্ষা" : isAr ? "نور للقرآن" : "Nur AI Quran",
      children: [
        { label: isBn ? "🎯 এআই কোরআন শিক্ষা (Duolingo)" : "🎯 AI Quran Learning (Duolingo)", to: "/ai-quran-learning" },
        { label: isBn ? "🎙️ লাইভ ভয়েস ক্লাসরুম" : "🎙️ Live Voice Classroom", to: "/quran-tutor/live-class" },
        { label: isBn ? "📖 সম্পূর্ণ কুরআন" : "📖 Full Quran Reader", to: "/quran-tutor/studio?tab=reader" },
        { label: isBn ? "নূর AI শিক্ষক স্টুডিও" : "Nur AI Tutor Studio", to: "/quran-tutor" },
      ],
    },
    { label: isBn ? "আমাদের পরিচিতি" : isAr ? "من نحن" : "About Us", to: "about" },
    { label: isBn ? "লক্ষ্য ও উদ্দেশ্য" : isAr ? "رسالتنا ورؤيتنا" : "Mission & Vision", to: "mission" },
    { label: isBn ? "সাধারণ জিজ্ঞাসা" : isAr ? "الأسئلة الشائعة" : "FAQ", to: "faq" },
    { label: isBn ? "নিকটস্থ শাখা" : isAr ? "الفروع" : "Branches", to: "campus" },
    { label: isBn ? "পরীক্ষার ফলাফল" : isAr ? "نتائج الامتحانات" : "Exam Results", to: "results" },
    { label: isBn ? "ভর্তির তথ্য" : isAr ? "معلومات القبول" : "Admission Info", to: "admission" },
    { label: isBn ? "গ্যালারি" : isAr ? "معرض الصور" : "Gallery", to: "gallery" },
  ];

  const loginLabel = isBn ? "লগইন" : isAr ? "تسجيل الدخول" : "Login";
  const logoutLabel = isBn ? "লগআউট" : isAr ? "تسجيل الخروج" : "Logout";
  const visitorLabel = isBn ? "ভিজিটর" : isAr ? "زائر" : "Visitor";

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpenMenu(false);
    }
  };

  const toggleDropdown = (label) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleVisitorLogout = async () => {
    await signOutVisitor();
    setOpenVisitorMenu(false);
    setOpenMenu(false);
  };

  return (
    <div className="w-full font-serif" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <div className="hidden px-4 py-2.5 text-xs font-bold md:block" style={{ background: "#12715B", color: "white" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className={`flex items-center gap-6 ${isAr ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-1.5 ${isAr ? "flex-row-reverse" : ""}`}>
              <span style={{ color: "#FFD700" }}>Call Us:</span>
              <a href={`tel:${phone}`} className="font-sans transition-colors hover:text-yellow-300">{phone}</a>
            </div>
            <div className={`flex items-center gap-1.5 ${isAr ? "flex-row-reverse" : ""}`}>
              <span style={{ color: "#FFD700" }}>Email:</span>
              <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-yellow-300">{email}</a>
            </div>
          </div>
          <div className={`flex items-center gap-5 ${isAr ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
              {[
                { icon: Facebook, href: "https://www.facebook.com/RahmaniaInstituteHifzMadrasagazipur" },
                { icon: Youtube, href: "https://www.youtube.com/@RahmaniaInstitute1700" },
              ].map((social, index) => (
                <a key={index} href={social.href} target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 transition-all hover:bg-white/10">
                  <social.icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>

            <div className="flex gap-3 border-l border-white/20 pl-4">
              <button onClick={() => setLang("bn")} className={`transition-colors hover:text-yellow-300 ${lang === "bn" ? "text-yellow-400" : ""}`}>BN</button>
              <button onClick={() => setLang("en")} className={`transition-colors hover:text-yellow-300 ${lang === "en" ? "text-yellow-400" : ""}`}>EN</button>
              <button onClick={() => setLang("ar")} className={`transition-colors hover:text-yellow-300 ${lang === "ar" ? "text-yellow-400" : ""}`}>AR</button>
            </div>
          </div>
        </div>
      </div>

      <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className={`flex h-16 items-center justify-between lg:h-20 ${isAr ? "flex-row-reverse" : ""}`}>
            <button type="button" className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden" onClick={() => setOpenMenu(!openMenu)}>
              {openMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link href="/" className="flex items-center">
              <Image
                src="/rahmania-logo-navbar.png"
                width={240}
                height={56}
                priority
                className="h-10 w-auto object-contain lg:h-14"
                style={{ maxWidth: "240px", width: "auto", height: "auto" }}
                alt="Rahmania Institute"
              />
            </Link>

            <div className={`hidden items-center gap-2 lg:flex ${isAr ? "flex-row-reverse" : ""}`}>
              {NAV_ITEMS.map((item) => (
                <div key={item.label} className="group relative">
                  {item.children ? (
                    <button className={`relative flex items-center gap-1 px-4 py-2 text-[13px] font-extrabold text-slate-700 transition-all hover:text-[#12715B] group-hover:text-[#12715B] ${isAr ? "flex-row-reverse" : ""}`}>
                      {item.label}
                      <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 scale-x-0 bg-[#12715B] transition-transform duration-300 group-hover:scale-x-100" />
                    </button>
                  ) : (
                    <Link href={item.to ? createPageUrl(item.to) : "/"} className="group relative px-4 py-2 text-[13px] font-extrabold text-slate-700 transition-all hover:text-[#12715B]">
                      {item.label}
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 scale-x-0 bg-[#12715B] transition-transform duration-300 group-hover:scale-x-100" />
                    </Link>
                  )}

                  {item.children ? (
                    <div className={`absolute ${isAr ? "right-0" : "left-0"} top-full z-50 min-w-[200px] translate-y-3 pt-2 invisible opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100`}>
                      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white py-2 shadow-2xl">
                        {item.children.map((child, index) => (
                          <div key={index}>
                            {child.to ? (
                              <Link href={createPageUrl(child.to)} className={`block px-5 py-2.5 text-[13px] font-bold text-slate-600 transition-all hover:bg-emerald-50 hover:text-[#12715B] ${isAr ? "text-right" : ""}`}>
                                {child.label}
                              </Link>
                            ) : (
                              <button onClick={() => handleScroll(child.scroll)} className={`w-full px-5 py-2.5 text-left text-[13px] font-bold text-slate-600 transition-all hover:bg-emerald-50 hover:text-[#12715B] ${isAr ? "text-right" : ""}`}>
                                {child.label}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className={`hidden items-center gap-3 lg:flex ${isAr ? "flex-row-reverse" : ""}`}>
              {isVisitorAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenVisitorMenu((prev) => !prev)}
                    className={`flex items-center gap-2 rounded-lg border border-[#12715B]/15 px-4 py-2.5 text-sm font-extrabold text-[#12715B] transition-all hover:bg-emerald-50 ${isAr ? "flex-row-reverse" : ""}`}
                  >
                    {visitorProfile?.avatarUrl ? (
                      <Image src={visitorProfile.avatarUrl} alt={visitorProfile.displayName} width={32} height={32} className="h-8 w-8 rounded-full object-cover" unoptimized />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-[#12715B]">
                        {visitorProfile?.initials || "V"}
                      </span>
                    )}
                    <span className="max-w-[120px] truncate">{visitorProfile?.displayName || visitorLabel}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openVisitorMenu ? "rotate-180" : ""}`} />
                  </button>
                  {openVisitorMenu ? (
                    <div className={`absolute ${isAr ? "left-0" : "right-0"} top-full z-50 min-w-[220px] translate-y-3 pt-2`}>
                      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white py-2 shadow-2xl">
                        <div className="px-5 py-3">
                          <p className="truncate text-sm font-bold text-slate-800">{visitorProfile?.displayName}</p>
                          <p className="truncate text-xs text-slate-500">{visitorProfile?.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleVisitorLogout}
                          className={`flex w-full items-center gap-2 px-5 py-2.5 text-[13px] font-bold text-slate-600 transition-all hover:bg-emerald-50 hover:text-[#12715B] ${isAr ? "flex-row-reverse text-right" : ""}`}
                        >
                          <LogOut className="h-4 w-4" />
                          {logoutLabel}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <Link href="/login" className="rounded-lg border border-[#12715B]/15 px-5 py-2.5 text-sm font-extrabold text-[#12715B] transition-all hover:bg-emerald-50">
                  {loginLabel}
                </Link>
              )}

              <Link href="/admission-choice" className="rounded-lg bg-[#12715B] px-6 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-[#12715B]/20 transition-all hover:bg-[#0e5c4a] active:scale-95">
                {t.nav.preAdmission || "প্রি-এডমিশন"}
              </Link>
            </div>
          </div>
        </div>

        {openMenu ? (
          <div className="border-t border-slate-100 bg-white shadow-2xl lg:hidden">
            <div className="space-y-2 px-4 py-6">
              {NAV_ITEMS.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50 ${isAr ? "flex-row-reverse" : ""}`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openDropdowns[item.label] ? "rotate-180" : ""}`} />
                      </button>
                      {openDropdowns[item.label] ? (
                        <div className={`mb-2 mt-1 space-y-1 border-emerald-100 ${isAr ? "mr-4 border-r-2 pr-4" : "ml-4 border-l-2 pl-4"}`}>
                          {item.children.map((child, index) => (
                            <div key={index}>
                              {child.to ? (
                                <Link href={createPageUrl(child.to)} className={`block py-2.5 text-sm font-bold text-slate-500 ${isAr ? "text-right" : ""}`} onClick={() => setOpenMenu(false)}>
                                  {child.label}
                                </Link>
                              ) : (
                                <button onClick={() => { handleScroll(child.scroll); setOpenMenu(false); }} className={`w-full py-2.5 text-left text-sm font-bold text-slate-500 ${isAr ? "text-right" : ""}`}>
                                  {child.label}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <Link href={item.to ? createPageUrl(item.to) : "/"} className={`block rounded-xl px-4 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50 ${isAr ? "text-right" : ""}`} onClick={() => setOpenMenu(false)}>
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              <div className="grid grid-cols-1 gap-3 pt-6">
                <Link href="/admission-choice" className="flex items-center justify-center rounded-xl bg-[#12715B] py-3.5 text-xs font-extrabold text-white shadow-lg shadow-[#12715B]/20" onClick={() => setOpenMenu(false)}>
                  {t.nav.preAdmission || "প্রি-এডমিশন"}
                </Link>
                {isVisitorAuthenticated ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
                      {visitorProfile?.avatarUrl ? (
                        <Image src={visitorProfile.avatarUrl} alt={visitorProfile.displayName} width={40} height={40} className="h-10 w-10 rounded-full object-cover" unoptimized />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-[#12715B]">
                          {visitorProfile?.initials || "V"}
                        </span>
                      )}
                      <div className={`min-w-0 ${isAr ? "text-right" : ""}`}>
                        <p className="truncate text-sm font-bold text-slate-800">{visitorProfile?.displayName || visitorLabel}</p>
                        <p className="truncate text-xs text-slate-500">{visitorProfile?.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleVisitorLogout}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-emerald-50 hover:text-[#12715B]"
                    >
                      <LogOut className="h-4 w-4" />
                      {logoutLabel}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-3.5 text-xs font-extrabold text-[#12715B] shadow-sm transition-all hover:bg-emerald-50"
                    onClick={() => setOpenMenu(false)}
                  >
                    <UserCircle2 className="mr-2 h-4 w-4" />
                    {loginLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </nav>
    </div>
  );
}
