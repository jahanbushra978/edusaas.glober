'use client'

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { base44 } from "@/api/base44Client";
import { Phone, Facebook, Youtube, LogIn, LogOut, Menu, X, ChevronDown, Globe } from "lucide-react";
import ThemeToggle from "@/components/ui-custom/ThemeToggle";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { pagesConfig } from "@/pages.config";
import { useNavbarItems } from "@/hooks/useNavbarItems";
import ProgressiveSection, { SectionSkeleton } from "@/shared/components/progressive/ProgressiveSection";

import Footer from "@/components/layout/Footer";

const LOGO_URL = "/rahmania-logo-v2.png";

function resolveCurrentPageName(pathname, explicitName) {
  if (explicitName) return explicitName;
  const { Pages, mainPage } = pagesConfig;
  const mainPageKey = mainPage ?? Object.keys(Pages)[0];
  const path = pathname || "/";
  if (path === "/" || path === "") return mainPageKey;
  if (path === "/login") return "AdminLogin";
  if (path === "/notices") return "AllNoticesPage";
  if (path.startsWith("/notice/")) return "NoticeDetailsPage";
  const seg = path.replace(/^\//, "").split("/")[0]?.split("?")[0] ?? "";
  const pageKeys = Object.keys(Pages);
  const matchedKey = pageKeys.find((k) => k.toLowerCase() === seg.toLowerCase());
  return matchedKey || seg || mainPageKey;
}

export default function Layout({ children, currentPageName: currentPageNameProp }) {
  const pathname = usePathname();
  const currentPageName = resolveCurrentPageName(pathname, currentPageNameProp);
  const isActive = (page) => {
    if (!page) return false;
    const clean = (p) => p.replace(/^\//, "").split("?")[0].toLowerCase();
    return clean(currentPageName) === clean(page);
  };
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const t = useTranslation(lang);
  const logoUrl = LOGO_URL;
  const instNameEn = "Rahmania Institute";

  const MENU_ITEMS = useNavbarItems(user);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    const validLang = (lang === "bn" || lang === "en" || lang === "ar") ? lang : "bn";
    document.documentElement.lang = validLang;
    document.documentElement.dir = validLang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const cleanPath = pathname?.toLowerCase() || "";
  const isPortalOrDashboard = 
    cleanPath === '/admin' || 
    cleanPath.startsWith('/admin/') || 
    cleanPath.includes('/login') || 
    cleanPath.includes('adminlogin') || 
    cleanPath.includes('studentlogin') || 
    cleanPath.includes('teacherlogin') || 
    cleanPath.includes('dashboard') || 
    cleanPath.includes('profile') || 
    cleanPath.includes('detail');

  const isLoginRoute = 
    cleanPath.includes('login') ||
    cleanPath.includes('adminlogin') ||
    cleanPath.includes('studentlogin') ||
    cleanPath.includes('teacherlogin');

  const isMainAdminDashboard = 
    cleanPath === '/admin' || 
    cleanPath === '/admin/student-fees' || 
    cleanPath === '/admindashboard';

  const isLoggedInAdmin = 
    user && 
    (user.role === 'admin' || 
     user.role === 'branch_admin' || 
     user.role === 'boarding_manager');

  useEffect(() => {
    const shouldLock = isLoggedInAdmin && isMainAdminDashboard && !isLoginRoute;
    if (shouldLock) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [cleanPath, isLoginRoute, isMainAdminDashboard, isLoggedInAdmin]);

  if (isPortalOrDashboard) {
    const useViewportConstraint = isLoggedInAdmin && isMainAdminDashboard && !isLoginRoute;
    return (
      <div className={`${useViewportConstraint ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'} bg-slate-50 dark:bg-[#080f0a] flex flex-col ${lang === 'bn' ? 'font-bn' : lang === 'ar' ? 'font-ar' : 'font-en'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <main className="flex-1 w-full relative z-0 flex flex-col">
          {children}
        </main>
      </div>
    );
  }


  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#080f0a] flex flex-col overflow-x-hidden ${lang === 'bn' ? 'font-bn' : lang === 'ar' ? 'font-ar' : 'font-en'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* ── HEADER WRAPPER ── */}
      <header className={`w-full left-0 right-0 z-50 sticky top-0 transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
        
        {/* ── TOP BAR ── */}
        <div className="bg-[#12715B] text-white py-2 px-3 sm:px-4 border-b border-green-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm font-medium gap-2 sm:gap-0">
            {/* Left: Contact */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <span className="text-yellow-400 font-bold whitespace-nowrap">{t.nav.call}:</span>
                <a href="tel:+8801906898939" className="hover:text-green-200 transition-colors truncate">+8801906898939</a>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-yellow-400 font-bold">{t.nav.email}:</span>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=rahmaniainstitute.org@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-200 transition-colors">rahmaniainstitute.org@gmail.com</a>
              </div>
            </div>

            {/* Right: Social & Login */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 min-w-0">
              <div className={`flex items-center gap-1 sm:gap-2 lg:gap-3 pr-2 sm:pr-4 ${lang === 'ar' ? 'border-l' : 'border-r'} border-green-600/50`}>
                <a href="https://www.facebook.com/RahmaniaInstituteHifzMadrasagazipur" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border border-green-400/50 flex items-center justify-center text-green-100 hover:bg-green-700 hover:opacity-80 transition-all duration-200 shrink-0" aria-label="Facebook"><Facebook className="w-3.5 h-3.5" /></a>
                <a href="https://wa.me/8801906898939" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border border-green-400/50 flex items-center justify-center text-green-100 hover:bg-green-700 hover:opacity-80 transition-all duration-200 shrink-0" aria-label="WhatsApp"><Phone className="w-3.5 h-3.5" /></a>
                <a href="https://www.youtube.com/@RahmaniaInstitute1700" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border border-green-400/50 flex items-center justify-center text-green-100 hover:bg-green-700 hover:opacity-80 transition-all duration-200 shrink-0" aria-label="YouTube"><Youtube className="w-3.5 h-3.5" /></a>
              </div>
              
              <ThemeToggle />

              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1 sm:gap-1.5 border border-green-400/50 hover:bg-green-700 hover:opacity-80 px-1.5 sm:px-2 lg:px-3 py-1.5 rounded transition-all duration-200 text-white font-medium shrink-0"
                  title="Select Language"
                  aria-label="Select Language"
                >
                  <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">
                    {lang === "bn" ? "বাংলা" : lang === "ar" ? "العربية" : "English"}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Language Dropdown Menu */}
                {langDropdownOpen && (
                  <div className={`${lang === 'ar' ? 'left-0' : 'right-0'} absolute top-full mt-1 bg-white dark:bg-[#0d1f17] border border-gray-200 dark:border-[#1a3d2e] rounded-lg shadow-xl z-50 overflow-hidden min-w-[120px]`}>
                    <button
                      onClick={() => { setLang("bn"); setLangDropdownOpen(false); }}
                      className={`w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 hover:shadow-sm transition-all duration-200 ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    >
                      বাংলা
                    </button>
                    <button
                      onClick={() => { setLang("en"); setLangDropdownOpen(false); }}
                      className={`w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 hover:shadow-sm transition-all duration-200 ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => { setLang("ar"); setLangDropdownOpen(false); }}
                      className={`w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 hover:shadow-sm transition-all duration-200 ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    >
                      العربية
                    </button>
                  </div>
                )}
              </div>
              
              {user ? (
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {user.role === "admin" && (
                    <Link href="/AdminDashboard" className="hover:text-yellow-400 transition-colors text-xs sm:text-sm truncate">{t.nav.admin}</Link>
                  )}
                  {user.role === "teacher" && (
                    <Link href="/TeacherDashboard" className="hover:text-yellow-400 transition-colors text-xs sm:text-sm truncate">{t.nav.teacher}</Link>
                  )}
                  <button onClick={() => base44.auth.logout()} className="flex items-center gap-1 sm:gap-1.5 border border-red-400/50 hover:bg-red-500/20 hover:opacity-80 px-1.5 sm:px-2 lg:px-3 py-1 rounded transition-all duration-200 text-white shrink-0" aria-label={t.nav.logout}>
                    <LogOut className="w-3 h-3" /> <span className="hidden sm:inline">{t.nav.logout}</span>
                  </button>
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-1 sm:gap-1.5 border border-green-400/50 hover:bg-green-700 hover:opacity-80 px-1.5 sm:px-2 lg:px-4 py-1.5 rounded transition-all duration-200 text-white relative z-10 pointer-events-auto touch-manipulation select-none shrink-0">
                  <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="text-xs sm:text-sm">{t.nav.login}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── MAIN NAVBAR ── */}
        <nav className="bg-white dark:bg-[#0d1f17] border-b border-gray-100 dark:border-[#1a3d2e] shadow-sm relative transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between">
            
            <Link href="/" className="flex items-center shrink-0 h-full py-1.5 active:opacity-80 transition-opacity">
              <Image
                src="/rahmania-logo-navbar.png"
                alt={instNameEn}
                width={240}
                height={56}
                className="h-9 sm:h-11 md:h-14 w-auto object-contain drop-shadow-md brightness-110 transition-transform duration-300 hover:scale-105 max-w-[160px] sm:max-w-[200px] md:max-w-[240px]"
                style={{ width: "auto" }}
                priority
              />
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#1a3d2e] text-gray-700 dark:text-gray-200 hover:bg-[#12715B] hover:text-white transition-all duration-200 active:scale-95"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Navigation Menu */}
            <ul className={`hidden lg:flex items-center h-full gap-1 ${lang === 'ar' ? 'mr-auto' : 'ml-auto'}`}>
              {MENU_ITEMS.map((item, idx) => (
                <li key={idx} className="h-full group relative flex items-center">
                  {item.subItems ? (
                    <>
                      <button className={`group/btn flex items-center gap-1.5 px-4 py-2.5 text-[15px] font-semibold rounded-lg transition-all duration-300 hover:bg-[#12715B] hover:text-white hover:shadow-md hover:shadow-[#12715B]/30 hover:scale-[1.02] hover:drop-shadow-[0_0_4px_rgba(34,197,94,0.3)] ${isActive(item.to) ? 'bg-[#12715B] text-white' : 'text-gray-900 dark:text-gray-200 hover:text-gray-950'}`}>
                        {item.label}
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover/btn:text-white transition-transform duration-300 group-hover:rotate-180" />
                      </button>
                      <div className={`absolute top-full ${lang === 'ar' ? 'right-0' : 'left-0'} w-56 bg-white dark:bg-[#111f18] border border-gray-100 dark:border-[#1a3d2e] shadow-xl rounded-xl opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50 overflow-hidden`}>
                        <ul className="py-1.5">
                          {item.subItems.map((sub, sIdx) => (
                            <li key={sIdx}>
                              <Link href={sub.to} className={`flex items-center gap-2.5 px-4 py-2.5 text-[14px] transition-all duration-200 hover:text-white hover:bg-[#12715B] hover:shadow-sm hover:drop-shadow-[0_0_4px_rgba(34,197,94,0.2)] ${isActive(sub.to) ? 'bg-[#12715B]/10 text-[#12715B] dark:bg-[#12715B]/20 dark:text-[#4adea0]' : 'text-gray-900 dark:text-gray-200 hover:text-white'}`}>
                                {sub.icon && <sub.icon className="w-4 h-4" />}
                                <span>{sub.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <Link href={item.to} className={`px-4 py-2.5 text-[15px] font-semibold rounded-lg transition-all duration-300 hover:bg-[#12715B] hover:text-white hover:shadow-md hover:shadow-[#12715B]/30 hover:scale-[1.02] hover:drop-shadow-[0_0_4px_rgba(34,197,94,0.3)] ${isActive(item.to) ? 'bg-[#12715B] text-white' : 'text-gray-900 dark:text-gray-200 hover:text-gray-950'}`}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}

              {/* Pre-Admission Button */}
              <li className={`${lang === 'ar' ? 'mr-3' : 'ml-3'} hidden lg:flex items-center`}>
                <Link href="/admission-choice" className="px-5 py-2.5 text-[14px] font-bold text-white bg-[#12715B] rounded-lg transition-all duration-300 hover:bg-[#0e5c4a] hover:shadow-lg hover:shadow-[#12715B]/30 hover:-translate-y-0.5">
                  {t.nav.preAdmission}
                </Link>
              </li>
            </ul>

          </div>

          {/* ── MOBILE MENU ── */}
          <div className={`lg:hidden absolute top-full left-0 w-full bg-white dark:bg-[#0d1f17] border-t border-gray-100 dark:border-[#1a3d2e] shadow-2xl transition-all duration-300 ease-in-out overflow-hidden z-[100] ${mobileMenuOpen ? 'max-h-[calc(100vh-72px)] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            <div className="overflow-y-auto max-h-[80vh] py-2 overscroll-contain touch-pan-y">
              <ul className="flex flex-col">
                {MENU_ITEMS.map((item, idx) => (
                  <li key={idx} className="border-b border-gray-100 dark:border-[#1a3d2e] last:border-0">
                    {item.subItems ? (
                      <div className="flex flex-col">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === idx ? null : idx)}
                          className={`flex items-center justify-between w-full px-5 py-4 text-[15px] font-bold text-gray-900 dark:text-gray-100 hover:bg-[#12715B] hover:text-white hover:shadow-sm transition-all duration-200 touch-manipulation ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                        >
                          <span>{item.label}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${activeDropdown === idx ? 'rotate-180 text-[#12715B]' : ''}`} />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 bg-gray-50 dark:bg-[#0a1812] ${activeDropdown === idx ? 'max-h-[400px]' : 'max-h-0'}`}>
                          <ul className="py-1">
                            {item.subItems.map((sub, sIdx) => (
                              <li key={sIdx}>
                                <Link href={sub.to} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-8 py-3 text-[14px] text-gray-800 dark:text-gray-200 hover:text-white hover:bg-[#12715B] hover:shadow-sm transition-all duration-200 touch-manipulation ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                                  {sub.icon && <sub.icon className="w-4 h-4" />}
                                  <span>{sub.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <Link href={item.to} onClick={() => setMobileMenuOpen(false)} className={`block px-5 py-4 text-[15px] font-bold text-gray-900 dark:text-gray-100 hover:bg-[#12715B] hover:text-white hover:shadow-sm transition-all duration-200 touch-manipulation ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}

                <li className="p-4">
                  <Link href="/admission-choice" onClick={() => setMobileMenuOpen(false)} className="w-full block text-center px-6 py-3 text-[15px] font-bold text-white bg-[#12715B] rounded-lg transition-all duration-200 hover:bg-[#0e5c4a] hover:shadow-md active:scale-[0.98] touch-manipulation">
                    {t.nav.preAdmission}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* ── PAGE CONTENT ── */}
      <main className="flex-1 w-full relative z-0">
        {children}
      </main>

      {/* ── FOOTER (lazy loaded) ── */}
      <ProgressiveSection minHeight={360}>
        <Footer user={user} />
      </ProgressiveSection>
    </div>
  );
}
