'use client'

import { useState, useEffect } from "react";
import WelcomeSetupScreen from "./WelcomeSetupScreen";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Globe, Image as ImageIcon, PhoneCall, Calendar, ShieldCheck, Mail, MapPin, ArrowRight, CheckCircle2, Menu as MenuIcon, X, GraduationCap, Users, UserCheck, Building2, ChevronDown, Send
} from "lucide-react";
import Link from "next/link";
import { appClient } from "@/api/appClient";

export default function DynamicTenantSiteRenderer({
  slug,
  orgName,
  orgId,
  themeColor = "#0f766e",
  logoUrl = null,
  whiteLabel = null,
  initialSections = [],
  isPublished = false,
}) {
  const [publishedSections, setPublishedSections] = useState(initialSections);
  const [activeThemeColor, setActiveThemeColor] = useState(themeColor);
  const [headerBg, setHeaderBg] = useState("#0f172a");
  const [customLogoUrl, setCustomLogoUrl] = useState(logoUrl);
  const [primaryBtnText, setPrimaryBtnText] = useState("Online Admission");
  const [secondaryBtnText, setSecondaryBtnText] = useState("Portal Login");
  const [customNavLinks, setCustomNavLinks] = useState([
    { label: "Home", href: "#hero" },
    { label: "About Us", href: "#about" },
    { label: "Notices", href: "#notices" },
    { label: "Branches", href: "#branches" },
    { label: "Teachers", href: "#teachers" },
    { label: "Gallery", href: "#gallery" },
    { label: "Events", href: "#events" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [branchesList, setBranchesList] = useState([]);
  const [noticesList, setNoticesList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [galleryList, setGalleryList] = useState([]);
  const [faqsList, setFaqsList] = useState([]);

  // Contact / Admission Form State
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const branding = whiteLabel?.branding_json || {};
  const formattedSlugName = slug ? decodeURIComponent(slug).replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "";
  const displayName = branding?.institutionName || branding?.institute_name || orgName || formattedSlugName || "School";

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (displayName) {
        document.title = `${displayName} — Official Website`;
      }
      if (slug) {
        const clean = slug.toLowerCase().replace(/%20|\s+/g, "-").replace(/[^a-z0-9-]/g, "");

        // Load Saved Page Sections
        const savedSec = localStorage.getItem(`published_sections_${slug}`) || localStorage.getItem(`published_sections_${clean}`);
        if (savedSec) {
          try {
            const parsed = JSON.parse(savedSec);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setPublishedSections(parsed);
            }
          } catch (e) {
            console.error("Error loading sections:", e);
          }
        } else if (publishedSections.length === 0) {
          // Initialize with Rahmania Flagship Clean Default Template
          setPublishedSections([
            {
              id: "sec_hero_default",
              type: "hero",
              title: `স্বাগতম ${displayName}-এ`,
              subtitle: "একটি আধুনিক দ্বীনি ও প্রাতিষ্ঠানিক শিক্ষাঙ্গন",
              bg: "#020617",
              btn1_text: "অনলাইনে ভর্তি আবেদন ➔",
              btn1_link: "#contact",
              btn2_text: "নোটিশ বোর্ড",
              btn2_link: "#notices",
            },
            {
              id: "sec_about_default",
              type: "about",
              title: "আমাদের প্রতিষ্ঠান সম্পর্কে",
              subtitle: "মানসম্মত শিক্ষা, নৈতিক চরিত্র গঠন ও দ্বীনি শিক্ষার অঙ্গীকার।",
              bg: "#ffffff",
            },
            {
              id: "sec_branches_default",
              type: "branches",
              title: "আমাদের শাখাসমূহ (Our Branches)",
              subtitle: "এডমিন প্যানেল থেকে যুক্তকৃত সকল শাখা সরাসরি প্রদর্শিত হবে",
              bg: "#f8fafc",
            },
            {
              id: "sec_portals_default",
              type: "login_portals",
              title: "ডিজিটাল পোর্টাল লগইন (Portal Logins)",
              subtitle: "শিক্ষক, শিক্ষার্থী, অভিভাবক ও এডমিন প্যানেলে প্রবেশের ডিজিটাল মাধ্যম",
              bg: "#0f172a",
            },
          ]);
        }

        // Load Saved Theme & Logo
        const savedTheme = localStorage.getItem(`published_theme_${slug}`) || localStorage.getItem(`published_theme_${clean}`);
        if (savedTheme) {
          try {
            const themeObj = JSON.parse(savedTheme);
            if (themeObj.headerBg) setHeaderBg(themeObj.headerBg);
            if (themeObj.primaryThemeColor) setActiveThemeColor(themeObj.primaryThemeColor);
            if (themeObj.logoUrl) setCustomLogoUrl(themeObj.logoUrl);
            if (themeObj.primaryBtnText) setPrimaryBtnText(themeObj.primaryBtnText);
            if (themeObj.secondaryBtnText) setSecondaryBtnText(themeObj.secondaryBtnText);
            if (Array.isArray(themeObj.navMenuLinks) && themeObj.navMenuLinks.length > 0) {
              setCustomNavLinks(themeObj.navMenuLinks);
            }
          } catch (e) {
            console.error("Error loading theme:", e);
          }
        }

        // Load Saved Branches from cache
        const savedBranches = localStorage.getItem(`branches_${slug}`) || localStorage.getItem(`branches_${clean}`);
        if (savedBranches) {
          try {
            const parsedB = JSON.parse(savedBranches);
            if (Array.isArray(parsedB) && parsedB.length > 0) {
              setBranchesList(parsedB);
            }
          } catch (e) {}
        }
      }

      // Fetch ALL live ERP data modules directly from database
      appClient?.entities?.Branch?.list?.().then((res) => { if (Array.isArray(res) && res.length > 0) setBranchesList(res); }).catch(() => {});
      appClient?.entities?.Notice?.list?.("-created_date", 10).then((res) => { if (Array.isArray(res) && res.length > 0) setNoticesList(res); }).catch(() => {});
      appClient?.entities?.Teacher?.list?.("-created_date", 12).then((res) => { if (Array.isArray(res) && res.length > 0) setTeachersList(res); }).catch(() => {});
      appClient?.entities?.Event?.list?.("-created_date", 8).then((res) => { if (Array.isArray(res) && res.length > 0) setEventsList(res); }).catch(() => {});
      appClient?.entities?.Gallery?.list?.("-created_date", 12).then((res) => { if (Array.isArray(res) && res.length > 0) setGalleryList(res); }).catch(() => {});
      appClient?.entities?.Faq?.list?.("-created_date", 10).then((res) => { if (Array.isArray(res) && res.length > 0) setFaqsList(res); }).catch(() => {});
    }
  }, [slug, displayName]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;
    setContactSubmitting(true);
    try {
      await appClient.entities.ContactMessage.create({
        name: contactName,
        phone: contactPhone,
        message: contactMessage,
        subject: "Website Inquiry / Admission Request",
      });
      setContactSuccess(true);
      setContactName("");
      setContactPhone("");
      setContactMessage("");
    } catch (err) {
      console.error("Failed to send contact message:", err);
    } finally {
      setContactSubmitting(false);
    }
  };

  const hasContent = publishedSections.length > 0 || isPublished;

  if (!hasContent) {
    return <WelcomeSetupScreen orgName={displayName} slug={slug} />;
  }

  const activeLogo = customLogoUrl || logoUrl;

  const getAlignClass = (align) => {
    if (align === "left") return "text-left items-start justify-start";
    if (align === "right") return "text-right items-end justify-end";
    return "text-center items-center justify-center";
  };

  const hasBranchesSection = publishedSections.some((s) => s.type === "branches");

  const renderBranchesSectionContent = (sec = {}) => (
    <section id="branches" key={sec.id || "branches_auto"} className="py-20 px-6 bg-slate-50 border-t border-b border-slate-200" style={{ backgroundColor: sec.bg || "#f8fafc" }}>
      <div className="max-w-6xl mx-auto space-y-10">
        <div className={`flex flex-col items-center justify-center text-center space-y-3`}>
          <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-50">Branch Network</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900">{sec.title || "আমাদের শাখাসমূহ (Our Branches)"}</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">{sec.subtitle || "প্রতিষ্ঠানের এডমিন প্যানেল থেকে যুক্তকৃত সকল শাখার বিস্তারিত বিবরণী"}</p>
        </div>

        {branchesList.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {branchesList.map((branch, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-md hover:shadow-xl transition-all space-y-4 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl text-white font-bold text-lg flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform" style={{ backgroundColor: activeThemeColor }}>
                      <Building2 size={22} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{branch.name_bn || branch.name_en || branch.branch_name || branch.name || `শাখা ${idx + 1}`}</h3>
                      <p className="text-[11px] text-teal-600 font-semibold">{branch.code || `Branch #${idx + 1}`}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    {(branch.address || branch.location) && (
                      <p className="flex items-center gap-2"><MapPin size={14} className="text-teal-600 shrink-0" /> {branch.address || branch.location}</p>
                    )}
                    {(branch.phone || branch.contact_number) && (
                      <p className="flex items-center gap-2"><PhoneCall size={14} className="text-teal-600 shrink-0" /> {branch.phone || branch.contact_number}</p>
                    )}
                    {branch.email && <p className="flex items-center gap-2"><Mail size={14} className="text-teal-600 shrink-0" /> {branch.email}</p>}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <Link href={`/site/${slug}/branch/${branch.id || idx + 1}`}>
                    <button className="w-full h-9 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-600 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm">
                      শাখার বিবরণী ও তথ্য দেখুন <ArrowRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center rounded-2xl bg-white border border-dashed border-slate-300 text-slate-500 text-xs space-y-2">
            <Building2 size={36} className="mx-auto text-teal-600 opacity-60" />
            <p className="font-bold text-slate-700">বর্তমানে কোনো শাখা যোগ করা নেই</p>
            <p className="text-[11px] text-slate-400">এডমিন প্যানেলের <b>Branches</b> অপশন থেকে নতুন শাখা যুক্ত করলে সাথে সাথে এই ড্রাইনামিক কার্ড গ্রিডে প্রর্দশিত হবে।</p>
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-white">
      {/* Dynamic Header & Navigation Menu Bar */}
      <header className="text-white sticky top-0 z-50 shadow-2xl border-b border-slate-800/50 transition-colors" style={{ backgroundColor: headerBg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              {activeLogo ? (
                <img src={activeLogo} alt={displayName} className="h-11 w-11 rounded-xl object-cover ring-2 ring-teal-500/40" />
              ) : (
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-md"
                  style={{ backgroundColor: activeThemeColor }}
                >
                  {displayName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">{displayName}</h1>
                <p className="text-[11px] text-teal-400 font-medium mt-1">{slug}.platform.com</p>
              </div>
            </div>

            {/* Desktop Navigation Links (Dynamic Items) */}
            <nav className="hidden lg:flex items-center gap-6">
              {customNavLinks.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  className="text-xs font-medium text-slate-200 hover:text-white transition-colors py-1"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Right Action Buttons with Custom Labels */}
            <div className="hidden sm:flex items-center gap-2.5">
              <Link href={`/AdminDashboard?slug=${slug}`}>
                <button
                  className="h-9 px-4 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-md hover:brightness-110"
                  style={{ backgroundColor: activeThemeColor }}
                >
                  <ShieldCheck size={14} /> {secondaryBtnText}
                </button>
              </Link>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700"
              >
                {mobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 px-4 pt-3 pb-6 space-y-3" style={{ backgroundColor: headerBg }}>
            <div className="flex flex-col space-y-1">
              {customNavLinks.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link href={`/AdminDashboard?slug=${slug}`} onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full h-10 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5" style={{ backgroundColor: activeThemeColor }}>
                  <ShieldCheck size={14} /> {secondaryBtnText}
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Sections Content */}
      <main className="divide-y divide-slate-200/80">
        {publishedSections.map((sec) => {
          const content = sec.content_json || {};
          const alignClass = getAlignClass(sec.align);
          const textColor = sec.text_color || "#0f172a";

          switch (sec.section_type || sec.type) {
            case "code":
              return (
                <section key={sec.id} className="py-12 px-6" style={{ backgroundColor: sec.bg || "#ffffff" }}>
                  <div className="max-w-6xl mx-auto">
                    {sec.custom_code ? (
                      <div dangerouslySetInnerHTML={{ __html: sec.custom_code }} />
                    ) : null}
                  </div>
                </section>
              );

            case "login_portals":
              return (
                <section id="portals" key={sec.id} className="py-20 px-6 bg-slate-900 text-white" style={{ backgroundColor: sec.bg || "#0f172a" }}>
                  <div className="max-w-6xl mx-auto space-y-10">
                    <div className={`flex flex-col ${alignClass} space-y-2`}>
                      <Badge className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs px-3 py-1">Digital Access</Badge>
                      <h2 className="text-3xl font-extrabold text-white">{sec.title || "ডিজিটাল পোর্টাল লগইন (Portal Logins)"}</h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-xl">{sec.subtitle || "শিক্ষক, শিক্ষার্থী, অভিভাবক ও এডমিন প্যানেলে প্রবেশের ডিজিটাল মাধ্যম"}</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Teacher Portal Card */}
                      <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-teal-500 transition-all space-y-4 text-center group">
                        <div className="h-14 w-14 mx-auto rounded-2xl bg-teal-600/20 text-teal-400 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform">
                          <Users size={26} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">শিক্ষক পোর্টাল</h3>
                          <p className="text-xs text-slate-400 mt-1">ক্লাস রুটিন, উপস্থিতি ও মার্কস এন্ট্রি</p>
                        </div>
                        <Link href={`/admin?slug=${slug}&role=teacher`}>
                          <button className="w-full h-10 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition-all shadow-md mt-2">
                            শিক্ষক লগইন ➔
                          </button>
                        </Link>
                      </div>

                      {/* Student Portal Card */}
                      <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-teal-500 transition-all space-y-4 text-center group">
                        <div className="h-14 w-14 mx-auto rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform">
                          <GraduationCap size={26} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">ছাত্র/ছাত্রী পোর্টাল</h3>
                          <p className="text-xs text-slate-400 mt-1">ফলাফল, পড়ার অগ্রগতি ও ফিস হিসাব</p>
                        </div>
                        <Link href={`/admin?slug=${slug}&role=student`}>
                          <button className="w-full h-10 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md mt-2">
                            ছাত্র লগইন ➔
                          </button>
                        </Link>
                      </div>

                      {/* Guardian Portal Card */}
                      <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-teal-500 transition-all space-y-4 text-center group">
                        <div className="h-14 w-14 mx-auto rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform">
                          <UserCheck size={26} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">অভিভাবক পোর্টাল</h3>
                          <p className="text-xs text-slate-400 mt-1">সন্তানের ডেইলি পড়া, উপস্থিতি ও নোটিশ</p>
                        </div>
                        <Link href={`/admin?slug=${slug}&role=guardian`}>
                          <button className="w-full h-10 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-all shadow-md mt-2">
                            অভিভাবক লগইন ➔
                          </button>
                        </Link>
                      </div>

                      {/* Admin Suite Card */}
                      <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-teal-500 transition-all space-y-4 text-center group">
                        <div className="h-14 w-14 mx-auto rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform">
                          <ShieldCheck size={26} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">এডমিন প্যানেল</h3>
                          <p className="text-xs text-slate-400 mt-1">প্রতিষ্ঠানের সম্পূর্ণ ম্যানেজমেন্ট কন্ট্রোল</p>
                        </div>
                        <Link href={`/admin?slug=${slug}&role=admin`}>
                          <button className="w-full h-10 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md mt-2">
                            এডমিন ড্যাশবোর্ড ➔
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              );

            case "branches":
              return renderBranchesSectionContent(sec);

            case "notices":
              return (
                <section id="notices" key={sec.id} className="py-20 px-6 bg-slate-50" style={{ backgroundColor: sec.bg || "#f8fafc" }}>
                  <div className="max-w-5xl mx-auto space-y-8">
                    <div className={`flex flex-col ${alignClass} space-y-2`}>
                      <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-50">Notice Board</Badge>
                      <h2 className="text-3xl font-extrabold" style={{ color: textColor }}>{sec.title || "জরুরী নোটিশ ও সংবাদ"}</h2>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-xl">{sec.subtitle || "সাম্প্রতিক নোটিশ ও প্রকাশনাসমূহ"}</p>
                    </div>

                    {noticesList.length > 0 ? (
                      <div className="space-y-3">
                        {noticesList.map((not, idx) => (
                          <div key={idx} className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0">
                                <Bell size={18} />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-slate-900">{not.title || not.headline}</h3>
                                <p className="text-[11px] text-slate-400">{not.date || not.created_date ? new Date(not.date || not.created_date).toLocaleDateString("bn-BD") : "সাম্প্রতিক"}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl shrink-0">বিস্তারিত দেখুন</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
                        <Bell size={28} className="mx-auto text-teal-600 opacity-60" />
                        <p className="font-bold">বর্তমানে কোনো নোটিশ প্রকাশিত হয়নি</p>
                        <p className="text-[11px] text-slate-400">এডমিন প্যানেলে নোটিশ পোস্ট করলেই সরাসরি এই নোটিশ বোর্ডে রিয়েল-টাইমে শো করবে।</p>
                      </div>
                    )}
                  </div>
                </section>
              );

            case "teachers":
              return (
                <section id="teachers" key={sec.id} className="py-20 px-6 bg-white" style={{ backgroundColor: sec.bg || "#ffffff" }}>
                  <div className="max-w-6xl mx-auto space-y-10">
                    <div className={`flex flex-col ${alignClass} space-y-2`}>
                      <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-50">Faculty Members</Badge>
                      <h2 className="text-3xl font-extrabold" style={{ color: textColor }}>{sec.title || "আমাদের সম্মানিত শিক্ষকবৃন্দ"}</h2>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-xl">{sec.subtitle || "অভিজ্ঞ ও নিবেদিতপ্রাণ শিক্ষকমণ্ডলী"}</p>
                    </div>

                    {teachersList.length > 0 ? (
                      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {teachersList.map((teacher, idx) => (
                          <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-3 hover:shadow-lg transition-all">
                            <div className="h-20 w-20 mx-auto rounded-2xl overflow-hidden bg-teal-100 flex items-center justify-center font-bold text-xl text-teal-800 shadow-inner">
                              {teacher.photo_url ? (
                                <img src={teacher.photo_url} alt={teacher.name_bn} className="w-full h-full object-cover" />
                              ) : (
                                (teacher.name_bn || teacher.name_en || "T").charAt(0)
                              )}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">{teacher.name_bn || teacher.name_en || teacher.full_name_en}</h3>
                              <p className="text-[11px] text-teal-600 font-semibold">{teacher.designation || teacher.role_title || "শিক্ষক"}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{teacher.qualification || "সম্মানিত শিক্ষক"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
                        <Users size={28} className="mx-auto text-teal-600 opacity-60" />
                        <p className="font-bold">শিক্ষক তালিকা লোড হচ্ছে</p>
                      </div>
                    )}
                  </div>
                </section>
              );

            case "gallery":
              return (
                <section id="gallery" key={sec.id} className="py-20 px-6 bg-slate-900 text-white" style={{ backgroundColor: sec.bg || "#0f172a" }}>
                  <div className="max-w-6xl mx-auto space-y-10">
                    <div className={`flex flex-col ${alignClass} space-y-2`}>
                      <Badge className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs px-3 py-1">Campus Life</Badge>
                      <h2 className="text-3xl font-extrabold text-white">{sec.title || "ফটো ও ভিডিও গ্যালারী"}</h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-xl">{sec.subtitle || "ক্যাম্পাস জীবন, বার্ষিক অনুষ্ঠান ও অর্জনসমূহ"}</p>
                    </div>

                    {galleryList.length > 0 ? (
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                        {galleryList.map((item, idx) => (
                          <div key={idx} className="group relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-lg">
                            <img src={item.image_url || item.url || "/placeholder-gallery.jpg"} alt={item.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
                              <h4 className="text-xs font-bold text-white">{item.title || "ক্যাম্পাস ইভেন্ট"}</h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 text-center rounded-2xl bg-slate-800/60 border border-slate-700 text-slate-400 text-xs space-y-2">
                        <ImageIcon size={32} className="mx-auto text-teal-400 opacity-60" />
                        <p className="font-bold text-slate-200">ক্যাম্পাস ফটো গ্যালারি</p>
                        <p className="text-[11px]">এডমিন প্যানেলের <b>Gallery Manager</b> থেকে ফটো যুক্ত করলেই সাইটে প্রর্দশিত হবে।</p>
                      </div>
                    )}
                  </div>
                </section>
              );

            case "events":
              return (
                <section id="events" key={sec.id} className="py-20 px-6 bg-slate-50" style={{ backgroundColor: sec.bg || "#f8fafc" }}>
                  <div className="max-w-5xl mx-auto space-y-8">
                    <div className={`flex flex-col ${alignClass} space-y-2`}>
                      <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-50">Upcoming Events</Badge>
                      <h2 className="text-3xl font-extrabold text-slate-900">{sec.title || "আসন্ন ইভেন্ট ও অনুষ্ঠান"}</h2>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-xl">{sec.subtitle || "আমাদের প্রতিষ্ঠানের বার্ষিক ও সেমিনার কার্যক্রম"}</p>
                    </div>

                    {eventsList.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-5">
                        {eventsList.map((event, idx) => (
                          <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center shrink-0">
                                <Calendar size={20} />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-slate-900">{event.title}</h3>
                                <p className="text-[11px] text-teal-600 font-semibold">{event.date || "শীঘ্রই আসছে"}</p>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2">{event.description || event.subtitle}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
                        <Calendar size={28} className="mx-auto text-teal-600 opacity-60" />
                        <p className="font-bold">আসন্ন ইভেন্টসমূহ</p>
                        <p className="text-[11px] text-slate-400">এডমিন প্যানেলে ইভেন্ট পোস্ট করা মাত্রই এই লিস্টে অটো শো করবে।</p>
                      </div>
                    )}
                  </div>
                </section>
              );

            case "faq":
              return (
                <section id="faq" key={sec.id} className="py-20 px-6 bg-white" style={{ backgroundColor: sec.bg || "#ffffff" }}>
                  <div className="max-w-4xl mx-auto space-y-8">
                    <div className={`flex flex-col ${alignClass} space-y-2`}>
                      <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-50">FAQ Helpdesk</Badge>
                      <h2 className="text-3xl font-extrabold text-slate-900">{sec.title || "সাধারণ প্রশ্নাবলী (FAQ)"}</h2>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-xl">{sec.subtitle || "ভর্তি, ক্লাস ও কারিকুলাম সম্পর্কিত নিয়মিত উত্তর"}</p>
                    </div>

                    <div className="space-y-4">
                      {(faqsList.length > 0 ? faqsList : [
                        { question: "কীভাবে ভর্তি আবেদন করবো?", answer: "অনলাইন ভর্তি আবেদন বাটনে ক্লিক করে ফরম পুরণ করে সরাসরি আবেদন পাঠানো যাবে।" },
                        { question: "ক্লাস রুটিন ও পরীক্ষার সময়সূচী কোথায় পাবো?", answer: "ওয়েবসাইটের নোটিশ বোর্ড এবং শিক্ষার্থী প্যানেল থেকে রুটিন ডাউনলোড করা যাবে।" },
                        { question: "শাখা পরিবর্তন বা ট্রান্সফার করা যাবে কি?", answer: "হ্যাঁ, এডমিন প্যানেলের অনুমতি সাপেক্ষে এক শাখা থেকে অন্য শাখায় স্থানান্তর করা সম্ভব।" }
                      ]).map((faq, idx) => (
                        <div key={idx} className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                            <span>{faq.question || faq.title}</span>
                            <ChevronDown size={16} className="text-teal-600 shrink-0" />
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-200/60">{faq.answer || faq.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case "contact":
              return (
                <section id="contact" key={sec.id} className="py-20 px-6 bg-slate-900 text-white" style={{ backgroundColor: sec.bg || "#0f172a" }}>
                  <div className="max-w-6xl mx-auto space-y-10">
                    <div className={`flex flex-col ${alignClass} space-y-2`}>
                      <Badge className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs px-3 py-1">Direct Contact</Badge>
                      <h2 className="text-3xl font-extrabold text-white">{sec.title || "যোগাযোগ ও সরাসরি অনুসন্ধান"}</h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-xl">{sec.subtitle || "আমাদের সাথে সরাসরি যোগাযোগ করুন বা তথ্য জানতে আবেদন পাঠান"}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Left: Contact Info & Map */}
                      <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-6">
                        <h3 className="text-base font-bold text-white border-b border-slate-700 pb-3 flex items-center gap-2">
                          <MapPin size={18} className="text-teal-400" /> প্রতিষ্ঠানের ঠিকানা ও যোগাযোগ
                        </h3>
                        <div className="space-y-4 text-xs text-slate-300">
                          <p className="flex items-start gap-3"><MapPin size={16} className="text-teal-400 shrink-0 mt-0.5" /> <span>ঢাকা ও আঞ্চলিক ক্যাম্পাস, বাংলাদেশ</span></p>
                          <p className="flex items-center gap-3"><PhoneCall size={16} className="text-teal-400 shrink-0" /> <span>+880 1700-000000 / +880 1800-000000</span></p>
                          <p className="flex items-center gap-3"><Mail size={16} className="text-teal-400 shrink-0" /> <span>info@{slug}.platform.com</span></p>
                        </div>
                      </div>

                      {/* Right: Instant Contact / Admission Form */}
                      <form onSubmit={handleContactSubmit} className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Send size={18} className="text-teal-400" /> সরাসরি মেসেজ বা তথ্য জানুন
                        </h3>

                        {contactSuccess && (
                          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 size={16} /> আপনার আবেদন এডমিন প্যানেলে সফলভাবে পাঠানো হয়েছে!
                          </div>
                        )}

                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="text-slate-300 font-bold block mb-1">আপনার নাম (Your Name)</label>
                            <Input
                              required
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              placeholder="আপনার নাম লিখুন"
                              className="bg-slate-900 border-slate-700 text-white h-10 text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-slate-300 font-bold block mb-1">ফোন নম্বর (Mobile Number)</label>
                            <Input
                              required
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              placeholder="01700000000"
                              className="bg-slate-900 border-slate-700 text-white h-10 text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-slate-300 font-bold block mb-1">বার্তা বা প্রশ্ন (Message / Inquiry)</label>
                            <Textarea
                              rows={3}
                              value={contactMessage}
                              onChange={(e) => setContactMessage(e.target.value)}
                              placeholder="আপনার প্রশ্ন বা ভর্তির বিস্তারিত জানতে লিখুন..."
                              className="bg-slate-900 border-slate-700 text-white text-xs"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={contactSubmitting}
                            className="w-full h-10 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
                          >
                            {contactSubmitting ? "পাঠানো হচ্ছে..." : "এডমিনকে মেসেজ পাঠান ➔"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </section>
              );

            case "hero":
              return (
                <section id="hero" key={sec.id} className="py-24 px-6 text-white bg-slate-950 relative overflow-hidden" style={{ backgroundColor: sec.bg || "#020617" }}>
                  {sec.image_url ? (
                    <div className="absolute inset-0 z-0 opacity-40">
                      <img src={sec.image_url} alt={sec.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
                    </div>
                  ) : (
                    <div
                      className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
                      style={{ backgroundColor: activeThemeColor }}
                    />
                  )}

                  <div className={`max-w-4xl mx-auto space-y-6 relative z-10 flex flex-col ${alignClass}`}>
                    <Badge className="px-3.5 py-1 text-xs text-white border-none shadow-md inline-flex items-center gap-1.5" style={{ backgroundColor: activeThemeColor }}>
                      <Globe size={12} /> Official Institution Website
                    </Badge>

                    {sec.title && (
                      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-md" style={{ color: sec.text_color || "#ffffff" }}>
                        {sec.title}
                      </h1>
                    )}

                    {sec.subtitle && (
                      <p className="text-sm sm:text-lg max-w-2xl leading-relaxed" style={{ color: sec.text_color ? `${sec.text_color}cc` : "#cbd5e1" }}>
                        {sec.subtitle}
                      </p>
                    )}

                    {/* Dynamic Hero Action Buttons (Render ONLY if configured) */}
                    {(sec.btn1_text || sec.btn2_text || primaryBtnText) && (
                      <div className={`flex flex-wrap items-center gap-3 pt-4 ${alignClass}`}>
                        {sec.btn1_text && (
                          <a href={sec.btn1_link || "#admission"}>
                            <button
                              className="px-6 py-3.5 rounded-xl text-xs font-bold text-white shadow-xl transition-all flex items-center gap-2 hover:brightness-110"
                              style={{ backgroundColor: sec.btn1_bg || activeThemeColor, color: sec.btn1_color || "#ffffff" }}
                            >
                              <GraduationCap size={16} /> {sec.btn1_text} <ArrowRight size={14} />
                            </button>
                          </a>
                        )}
                        {sec.btn2_text && (
                          <a href={sec.btn2_link || "#notices"}>
                            <button
                              className="px-6 py-3.5 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-slate-800 border border-slate-700 transition-all flex items-center gap-2 shadow-md"
                              style={{ backgroundColor: sec.btn2_bg || "#1e293b", color: sec.btn2_color || "#ffffff" }}
                            >
                              {sec.btn2_text}
                            </button>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              );

            default:
              return (
                <section key={sec.id} className="py-16 px-6 transition-colors" style={{ backgroundColor: sec.bg || "#ffffff" }}>
                  <div className={`max-w-5xl mx-auto flex flex-col space-y-4 ${alignClass}`}>
                    <Badge variant="outline" className="text-xs uppercase text-teal-700 border-teal-200 bg-teal-50">{sec.section_type || sec.type}</Badge>
                    
                    {sec.title && (
                      <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight" style={{ color: textColor }}>
                        {sec.title}
                      </h2>
                    )}
                    
                    {sec.subtitle && (
                      <p className="text-xs sm:text-base max-w-2xl leading-relaxed" style={{ color: `${textColor}cc` }}>
                        {sec.subtitle}
                      </p>
                    )}

                    {sec.image_url && (
                      <div className="pt-2 max-w-3xl w-full">
                        <img src={sec.image_url} alt={sec.title} className="w-full h-auto max-h-96 object-cover rounded-2xl shadow-md border border-slate-200" />
                      </div>
                    )}

                    {/* Custom HTML/CSS Code Renderer */}
                    {sec.custom_code && (
                      <div className="w-full pt-2" dangerouslySetInnerHTML={{ __html: sec.custom_code }} />
                    )}

                    {/* Custom Action Buttons */}
                    {(sec.btn1_text || sec.btn2_text) && (
                      <div className={`flex flex-wrap items-center gap-3 pt-3 ${alignClass}`}>
                        {sec.btn1_text && (
                          <a href={sec.btn1_link || "#"}>
                            <button
                              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:brightness-110"
                              style={{ backgroundColor: sec.btn1_bg || activeThemeColor, color: sec.btn1_color || "#ffffff" }}
                            >
                              {sec.btn1_text}
                            </button>
                          </a>
                        )}
                        {sec.btn2_text && (
                          <a href={sec.btn2_link || "#"}>
                            <button
                              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all shadow-sm"
                              style={{ backgroundColor: sec.btn2_bg || "#f1f5f9", color: sec.btn2_color || "#0f172a" }}
                            >
                              {sec.btn2_text}
                            </button>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              );
          }
        })}

        {/* ALWAYS AUTOMATICALLY RENDER BRANCHES SECTION IF SCHOOL HAS CREATED BRANCHES AND IT'S NOT ALREADY RENDERED ABOVE */}
        {!hasBranchesSection && branchesList.length > 0 && renderBranchesSectionContent()}
      </main>

      {/* Dynamic Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 px-6 text-center text-xs border-t border-slate-900">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} {displayName}. All rights reserved.</p>
          <p className="text-teal-400 font-medium">Powered by Educational Multi-Tenant SaaS Platform</p>
        </div>
      </footer>
    </div>
  );
}
