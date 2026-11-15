"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Building,
  Receipt,
  Coins,
  Users,
  Clock,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  Globe,
  Search,
  Briefcase,
  Compass,
  HelpCircle,
  CheckCircle2,
  Settings,
  DollarSign,
  Wallet,
  FileSpreadsheet,
  Utensils,
  ShoppingBag,
  Boxes,
  FileCheck,
  Landmark,
  Activity,
  FileText,
  Award,
  Moon,
  MessageSquare,
  Bot,
  Scroll,
  Heart,
  X,
  ArrowUpRight,
} from "lucide-react";

/**
 * PREMIUM MOSQUE ERP MODULE CENTER
 * 
 * Enterprise-grade SaaS application launcher for Mosque ERP & Islamic Super App.
 * Organized into 7 canonical categories:
 * 1. Administration & Mosque Management (প্রশাসন ও পরিচালনা)
 * 2. Financial ERP & Accounting (আর্থিক ইআরপি ও হিসাবরক্ষণ)
 * 3. Imam, Muazzin & Employee Management (ইমাম, মুয়াজ্জিন ও কর্মকর্তা-কর্মচারী)
 * 4. Prayer & Islamic Activities (নামাজ ও ইসলামিক কার্যক্রম)
 * 5. Maktab & Quran Education (মক্তব ও কুরআন শিক্ষা)
 * 6. Community Welfare & Social Services (সমাজকল্যাণ ও মানবিক সেবা)
 * 7. Website, SaaS & System Settings (ওয়েবসাইট, ক্লাউড ও সিস্টেম)
 */

export function MosqueModuleCenter({
  onOpenModal,
  onOpenQuranReader,
  onOpenTutor,
  onSelectTab,
  onOpenPublicSite,
  currentMosque,
  className = "",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all"); // "all" | category id

  // Definition of the 7 Canonical Categories with their Modules
  const CATEGORIES = useMemo(
    () => [
      {
        id: "admin",
        title: "প্রশাসন ও মসজিদ পরিচালনা",
        titleEn: "Administration & Mosque Management",
        desc: "পরিচালনা কমিটি, সাধারণ সদস্য, পূর্ণাঙ্গ অ্যাডমিন ৩৬০ ও প্রাতিষ্ঠানিক নিয়ন্ত্রণ।",
        icon: ShieldCheck,
        badgeColor: "emerald",
        modules: [
          {
            id: "admin-360",
            title: "অ্যাডমিন ৩৬০ কন্ট্রোল",
            subtitle: "কমিটি, সদস্য, চাঁদা ও সামগ্রিক নিয়ন্ত্রণ",
            icon: ShieldCheck,
            badge: "কন্ট্রোল",
            keywords: "admin, control, committee, পরিচালনা, অ্যাডমিন, কমিটি, ৩৬০",
            action: () => onOpenModal("admin-360"),
          },
          {
            id: "mosque-profile",
            title: "মসজিদ পরিচিতি ও কমিটি",
            subtitle: "খতিব, ইমাম, মুয়াজ্জিন ও কার্যনির্বাহী পরিষদ",
            icon: Building,
            keywords: "profile, committee, mosque, পরিচিতি, কমিটি, পরিষদ, মসজিদ",
            action: () => onOpenModal("admin"),
          },
          {
            id: "asset-inventory",
            title: "স্থায়ী সম্পদ ও ইনভেন্টরি",
            subtitle: "মাইক, এসি, কার্পেট ও মালামাল রেজিস্টার",
            icon: Boxes,
            badge: "রেজিস্টার",
            keywords: "asset, inventory, mic, ac, সম্পদ, মালামাল, ইনভেন্টরি, এসি, মাইক",
            action: () => onOpenModal("asset-inventory"),
          },
          {
            id: "member-roster",
            title: "সদস্য ও ভোটার তালিকা",
            subtitle: "সক্রিয় সাধারণ সদস্য ও আজীবন দাতাদের তালিকা",
            icon: Users,
            keywords: "members, users, voters, সদস্য, ভোটার, দাতা, পরিষদ",
            action: () => (onSelectTab ? onSelectTab("members") : onOpenModal("admin-360")),
          },
        ],
      },
      {
        id: "finance",
        title: "আর্থিক ইআরপি ও হিসাবরক্ষণ",
        titleEn: "Financial ERP & Accounting",
        desc: "১০টি সংরক্ষিত তহবিল, সদস্য চাঁদা, ৬-ধাপের ক্রয় ও হিসাব নিরীক্ষা।",
        icon: Landmark,
        badgeColor: "amber",
        modules: [
          {
            id: "funds",
            title: "১০টি সংরক্ষিত তহবিল",
            subtitle: "সাধারণ, নির্মাণ, বেতন, ওয়াকফ ও আপদকালীন স্থিতি",
            icon: Coins,
            badge: "১০টি ফান্ড",
            keywords: "funds, balance, money, তহবিল, ফান্ড, ব্যালেন্স, টাকা, ১০টি",
            action: () => onOpenModal("funds"),
          },
          {
            id: "master-dues",
            title: "মাসিক চাঁদা ও বকেয়া শিট",
            subtitle: "সদস্যভিত্তিক মাসিক অঙ্গীকার ও আদায় রেজিস্টার",
            icon: FileSpreadsheet,
            badge: "মাসিক শিট",
            keywords: "dues, pledge, collection, চাঁদা, বকেয়া, আদায়, অঙ্গীকার, মাসিক",
            action: () => onOpenModal("master-dues"),
          },
          {
            id: "purchase-procurement",
            title: "ক্রয় ও ৪-স্বাক্ষর ভাউচার",
            subtitle: "৬-ধাপের প্রকিউরমেন্ট ও অফিসিয়াল ক্রয় ভাউচার",
            icon: Receipt,
            badge: "৪-স্বাক্ষর",
            keywords: "procurement, purchase, voucher, ক্রয়, ভাউচার, প্রকিউরমেন্ট, রসিদ, কেনাকাটা",
            action: () => onOpenModal("purchase-procurement"),
          },
          {
            id: "expense-approval",
            title: "ব্যয় ও বিল অনুমোদন",
            subtitle: "দৈনিক খরচ রসিদ নিরীক্ষা ও ভাউচার পাস",
            icon: FileCheck,
            keywords: "expense, audit, approval, খরচ, বিল, অনুমোদন, ভাউচার, নিরীক্ষা",
            action: () => onOpenModal("expense-approval"),
          },
        ],
      },
      {
        id: "imam-staff",
        title: "ইমাম, মুয়াজ্জিন ও কর্মকর্তা-কর্মচারী",
        titleEn: "Imam, Muazzin & Employee Management",
        desc: "ইমাম সাহেবের দৈনিক খাবার রোস্টার, বেতন স্কেল ও কর্মচারী কল্যাণ।",
        icon: Briefcase,
        badgeColor: "emerald",
        modules: [
          {
            id: "imam-meal",
            title: "ইমামের খানা রোস্টার",
            subtitle: "পরিবারভিত্তিক খাবার রোটেশন ও বদলি দায়িত্ব",
            icon: Utensils,
            badge: "লাইভ রোস্টার",
            keywords: "meal, food, roster, খানা, খাবার, রোস্টার, ইমাম, মেহমানদারি",
            action: () => onOpenModal("imam-meal"),
          },
          {
            id: "employee-salary",
            title: "সম্মানী ও বেতন রেজিস্টার",
            subtitle: "খতীব, ইমাম ও স্টাফদের মাসিক পে-স্লিপ",
            icon: Wallet,
            badge: "পে-স্লিপ",
            keywords: "salary, payslip, staff, employee, বেতন, সম্মানী, পে-স্লিপ, কর্মচারী, ভাতা",
            action: () => onOpenModal("employee-salary"),
          },
          {
            id: "meal-hospitality",
            title: "মেহমানদারি ও বিকল্প মিল",
            subtitle: "অতিথি মেহমানদারি ও বিকল্প খাবার তহবিল",
            icon: ShoppingBag,
            keywords: "guest, hospitality, food, মেহমান, আপ্যায়ন, বিকল্প, খাবার",
            action: () => onOpenModal("meal-roster"),
          },
        ],
      },
      {
        id: "prayer-activities",
        title: "নামাজ ও ইসলামিক কার্যক্রম",
        titleEn: "Prayer & Islamic Activities",
        desc: "ওয়াক্ত ও জামা'আতের নির্ভুল সময়সূচি, কিবলা দিকদর্শন, তিলাওয়াত ও বয়ান ভাণ্ডার।",
        icon: Clock,
        badgeColor: "emerald",
        modules: [
          {
            id: "prayer-schedule",
            title: "নামাজের সময় ও জামা'আত",
            subtitle: "৫ ওয়াক্তের আযান ও জামা'আতের ডিজিটাল বোর্ড",
            icon: Clock,
            badge: "৫ ওয়াক্ত",
            keywords: "prayer, namaz, salat, jamaat, azan, নামাজ, ওয়াক্ত, জামাত, সময়সূচি, আযান",
            action: () => onOpenModal("prayer-edit"),
          },
          {
            id: "qibla-compass",
            title: "কিবলা দিকদর্শন কম্পাস",
            subtitle: "জিপিএস নির্ভুল পবিত্র কাবার দিকনির্ণয়",
            icon: Compass,
            keywords: "qibla, compass, direction, কিবলা, কম্পাস, দিক, কাবা",
            action: () => onOpenModal("qibla"),
          },
          {
            id: "tilawat-audio",
            title: "তিলাওয়াত ও অডিও কুরআন",
            subtitle: "বিশ্বখ্যাত ক্বারীদের বিশুদ্ধ কুরআন তিলাওয়াত",
            icon: BookOpen,
            badge: "অডিও",
            keywords: "tilawat, quran, audio, recitation, তিলাওয়াত, কুরআন, অডিও, তেলাওয়াত",
            action: () => (onOpenQuranReader ? onOpenQuranReader() : onOpenModal("kitab")),
          },
          {
            id: "bayan-khutbah",
            title: "জুমার খুতবা ও বয়ান",
            subtitle: "প্রখ্যাত উলামায়ে কেরামের দ্বীনি খুতবা ও বয়ান",
            icon: FileText,
            keywords: "bayan, khutbah, lecture, বয়ান, খুতবা, ওয়াজ, জুমা",
            action: () => onOpenModal("bayan"),
          },
          {
            id: "amal-tracker",
            title: "আমল ট্র্যাকার ও সালাত লগ",
            subtitle: "৫ ওয়াক্ত সালাত ও দৈনন্দিন নফল আমল মনিটরিং",
            icon: CheckCircle2,
            keywords: "tracker, amal, daily, salat, আমল, ট্র্যাকার, সালাত, সালাত লগ",
            action: () => onOpenModal("tracker"),
          },
          {
            id: "tasbeeh-counter",
            title: "ডিজিটাল তাসবীহ কাউন্টার",
            subtitle: "মাসনূন যিকির ও তাসবীহ গণনা যন্ত্র",
            icon: Award,
            keywords: "tasbeeh, dhikr, counter, তাসবীহ, যিকির, কাউন্টার, গণনা",
            action: () => onOpenModal("tasbeeh"),
          },
          {
            id: "dua-azkar",
            title: "মাসনূন দু'আ ও আযকার",
            subtitle: "হিসনুল মুসলিমের নির্ভরযোগ্য সহীহ দোয়াসমূহ",
            icon: Moon,
            keywords: "dua, azkar, hisnul muslim, দোয়া, দুআ, মুনাজাত, আযকার",
            action: () => onOpenModal("dua"),
          },
          {
            id: "jainamaz-guide",
            title: "জায়নামাজ ও সালাত গাইড",
            subtitle: "নামাজের ফরজ, ওয়াজিব ও বিশুদ্ধ মাসআলা",
            icon: Activity,
            keywords: "jainamaz, guide, rules, salat, জায়নামাজ, সালাত, নিয়মাবলী, মাসআলা",
            action: () => onOpenModal("jainamaz"),
          },
        ],
      },
      {
        id: "maktab-education",
        title: "মক্তব ও কুরআন শিক্ষা",
        titleEn: "Maktab & Quran Education",
        desc: "শিশু-কিশোর ও বয়স্কদের নূরানী মক্তব, হিফজ ও দ্বীনি কিতাবখানা।",
        icon: GraduationCap,
        badgeColor: "emerald",
        modules: [
          {
            id: "noorani-maktab",
            title: "নূরানী কুরআন মক্তব",
            subtitle: "শিক্ষার্থী হাজিরা, কায়দা ও সিলেবাস ট্র্যাকিং",
            icon: GraduationCap,
            badge: "মক্তব",
            keywords: "maktab, noorani, children, education, মক্তব, নূরানী, কায়দা, শিক্ষার্থী, শিক্ষা",
            action: () => onOpenModal("maktab"),
          },
          {
            id: "kitab-library",
            title: "ইসলামিক কিতাব ভাণ্ডার",
            subtitle: "তাফসীর, ফিকহ ও আকিদা বিষয়ক প্রামাণ্য কিতাব",
            icon: BookOpen,
            keywords: "kitab, books, tafseer, library, কিতাব, তাফসীর, গ্রন্থ, কিতাবখানা",
            action: () => onOpenModal("kitab"),
          },
          {
            id: "hadith-collection",
            title: "সহীহ নির্বাচিত হাদীস",
            subtitle: "বুখারী ও মুসলিম শরীফের নির্বাচিত সহীহ হাদিস",
            icon: Scroll,
            keywords: "hadith, bukhari, muslim, হাদিস, বুখারী, মুসলিম, সহীহ",
            action: () => onOpenModal("hadith"),
          },
          {
            id: "article-masala",
            title: "দ্বীনি প্রবন্ধ ও মাসআলা",
            subtitle: "সমকালীন জীবনঘনিষ্ঠ ফতোয়া ও সমাধান",
            icon: FileText,
            keywords: "article, masala, fatwa, প্রবন্ধ, মাসআলা, ফতোয়া, সমাধান",
            action: () => onOpenModal("article"),
          },
          {
            id: "islamic-quiz",
            title: "তালীমি ইসলামিক কুইজ",
            subtitle: "শিশু ও কিশোরদের ইসলামিক জ্ঞান প্রতিযোগিতা",
            icon: HelpCircle,
            keywords: "quiz, contest, competition, কুইজ, প্রতিযোগিতা, জ্ঞান",
            action: () => onOpenModal("quiz"),
          },
        ],
      },
      {
        id: "welfare-social",
        title: "সমাজকল্যাণ ও মানবিক সেবা",
        titleEn: "Community Welfare & Social Services",
        desc: "যাকাত ও ফিতরা ক্যালকুলেটর, মানবিক সহায়তা, বিয়ে ও হালাল জব।",
        icon: HeartHandshake,
        badgeColor: "emerald",
        modules: [
          {
            id: "welfare-zakat-fund",
            title: "যাকাত ও কল্যাণ তহবিল",
            subtitle: "চিকিৎসা, বিধবা ভাতা ও মানবিক আবেদন অডিট",
            icon: HeartHandshake,
            badge: "মানবিক সহায়তা",
            keywords: "welfare, zakat, assistance, সমাজকল্যাণ, যাকাত, চিকিৎসা, কাফন, বিধবা",
            action: () => onOpenModal("community-welfare"),
          },
          {
            id: "zakat-calculator",
            title: "যাকাত ও ফিতরা হিসাব",
            subtitle: "স্বর্ণ, রৌপ্য ও নগদ সম্পদের নিসাব ক্যালকুলেটর",
            icon: DollarSign,
            keywords: "zakat, fitra, calculator, nisab, যাকাত, ফিতরা, নিসাব, ক্যালকুলেটর",
            action: () => onOpenModal("zakat"),
          },
          {
            id: "sunnah-nikah",
            title: "সুন্নাহ বিবাহ ও পরামর্শ",
            subtitle: "যৌতুকমুক্ত সুন্নতি বিয়ে ও পারিবারিক কাউন্সেলিং",
            icon: Heart,
            keywords: "nikah, marriage, wedding, বিবাহ, বিয়ে, নিকাহ, যৌতুকমুক্ত",
            action: () => onOpenModal("nikah"),
          },
          {
            id: "halal-jobs",
            title: "হালাল কর্মসংস্থান ও চাকরি",
            subtitle: "স্থানীয় মুসলিমদের জন্য হালাল ক্যারিয়ার ও জব বোর্ড",
            icon: Briefcase,
            keywords: "job, career, employment, halal, চাকরি, কর্মসংস্থান, হালাল, জব",
            action: () => onOpenModal("job"),
          },
          {
            id: "helpdesk-support",
            title: "জরুরি হেল্পডেস্ক ও সাপোর্ট",
            subtitle: "ইমাম ও মসজিদ কমিটির প্রত্যক্ষ পরামর্শ সেবা",
            icon: MessageSquare,
            keywords: "support, helpdesk, contact, সাপোর্ট, হেল্পডেস্ক, সাহায্য, যোগাযোগ",
            action: () => onOpenModal("support"),
          },
        ],
      },
      {
        id: "website-saas",
        title: "ওয়েবসাইট, ক্লাউড ও সিস্টেম",
        titleEn: "Website, SaaS & System Settings",
        desc: "পাবলিক সাইট প্রিভিউ, কাস্টম ডোমেইন সংযোগ ও মাল্টি-টেন্যান্ট ক্লাউড।",
        icon: Globe,
        badgeColor: "emerald",
        modules: [
          {
            id: "public-portal",
            title: "পাবলিক ওয়েবসাইট পোর্টাল",
            subtitle: "মুসল্লি ও দর্শনার্থীদের জন্য উন্মুক্ত ওয়েব প্রিভিউ",
            icon: Globe,
            badge: "উন্মুক্ত",
            keywords: "website, public, portal, ওয়েবসাইট, পাবলিক, পোর্টাল, ভিজিটর",
            action: () => (onOpenPublicSite ? onOpenPublicSite() : onOpenModal("admin")),
          },
          {
            id: "custom-domain",
            title: "কাস্টম ডোমেইন সংযোগ",
            subtitle: "নিজস্ব ডোমেইন (masjid.org) ও SSL ইন্টিগ্রেশন",
            icon: Globe,
            badge: "কাস্টম DNS",
            keywords: "domain, dns, cname, ssl, ডোমেইন, কাস্টম, সি-নেম, এসএসএল",
            action: () => onOpenModal("custom-domain"),
          },
          {
            id: "mosque-discovery",
            title: "মসজিদ অনুসন্ধান ডিরেক্টরি",
            subtitle: "সারা দেশের মসজিদ তালিকা ও পাবলিক সাইট",
            icon: Search,
            keywords: "discovery, search, directory, খুঁজুন, ডিরেক্টরি, অনুসন্ধান, মসজিদ",
            action: () => onOpenModal("mosque-discovery"),
          },
          {
            id: "register-mosque",
            title: "আপনার মসজিদ যুক্ত করুন",
            subtitle: "নতুন মসজিদের জন্য তাৎক্ষণিক ডিজিটাল অনবোর্ডিং",
            icon: Building,
            badge: "অনবোর্ডিং",
            keywords: "register, add, onboarding, রেজিস্ট্রেশন, যুক্ত করুন, নতুন, মসজিদ",
            action: () => onOpenModal("register-mosque"),
          },
          {
            id: "super-admin-console",
            title: "SaaS প্ল্যাটফর্ম কনসোল",
            subtitle: "সেন্ট্রাল সুপার অ্যাডমিন ও সাবস্ক্রিপশন কন্ট্রোল",
            icon: Settings,
            badge: "সুপার অ্যাডমিন",
            keywords: "super admin, platform, console, প্ল্যাটফর্ম, কনসোল, সুপার অ্যাডমিন",
            action: () => onOpenModal("super-admin"),
          },
          {
            id: "nur-ai-advisor",
            title: "নূর এআই দ্বীনি উপদেষ্টা",
            subtitle: "ইসলামিক মাসআলা, তাজবীদ ও লাইভ এআই শিক্ষক",
            icon: Bot,
            badge: "নূর এআই",
            keywords: "ai, tutor, nur, nurai, এআই, নূর, উপদেষ্টা, শিক্ষক, তাজবীদ",
            action: () => (onOpenTutor ? onOpenTutor() : onOpenModal("support")),
          },
        ],
      },
    ],
    [onOpenModal, onOpenQuranReader, onOpenTutor, onSelectTab, onOpenPublicSite]
  );

  // Compute total modules count
  const totalModulesCount = useMemo(() => {
    return CATEGORIES.reduce((acc, cat) => acc + cat.modules.length, 0);
  }, [CATEGORIES]);

  // Filter categories and modules based on search query and category filter
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return CATEGORIES.map((cat) => {
      // If a specific category is selected, skip others
      if (selectedCategory !== "all" && cat.id !== selectedCategory) {
        return null;
      }

      // If search query is present, filter modules by title, subtitle or keywords
      if (q) {
        const matchingModules = cat.modules.filter((mod) => {
          const matchTitle = mod.title.toLowerCase().includes(q);
          const matchSubtitle = mod.subtitle.toLowerCase().includes(q);
          const matchKeywords = mod.keywords.toLowerCase().includes(q);
          return matchTitle || matchSubtitle || matchKeywords;
        });

        if (matchingModules.length === 0) return null;

        return {
          ...cat,
          modules: matchingModules,
        };
      }

      return cat;
    }).filter(Boolean);
  }, [CATEGORIES, searchQuery, selectedCategory]);

  // Total matching modules count
  const filteredCount = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.modules.length, 0);
  }, [filteredCategories]);

  return (
    <section className={`space-y-4 ${className}`} aria-label="মসজিদ ইআরপি ও সেবা মডিউল কেন্দ্র">
      {/* ── TOP HEADER & MODULE LAUNCHER BANNER ── */}
      <div className="bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-stone-100 dark:border-emerald-950/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-5 rounded-full bg-[#0D7A5F]"></span>
              <h2 className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100 tracking-tight">
                মসজিদ ইআরপি ও সেবা মডিউল কেন্দ্র
              </h2>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-[#0D7A5F] dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                {totalModulesCount}টি মডিউল
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              প্রশাসন, ফিন্যান্স, ইমাম রোস্টার, নামাজ ও সমাজকল্যাণের সমন্বিত ডিজিটাল প্ল্যাটফর্ম
            </p>
          </div>

          {/* Quick Counter / Info */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto text-[11px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-[#07130e] px-2.5 py-1.5 rounded-xl border border-stone-200/60 dark:border-emerald-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>৭টি ক্যাটাগরি · শতভাগ রিয়েলটাইম</span>
          </div>
        </div>

        {/* ── SEARCH BAR & CATEGORY PILLS ── */}
        <div className="mt-3.5 space-y-3">
          {/* Search Input Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="মডিউলের নাম দিয়ে খুঁজুন... যেমন: ইমাম, বেতন, যাকাত, ভাউচার, meal, salary, maktab"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-[#07130e] border border-stone-200/80 dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D7A5F]/20 focus:border-[#0D7A5F] transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600 transition cursor-pointer"
                title="সার্চ ক্লিয়ার করুন"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                selectedCategory === "all"
                  ? "bg-[#0D7A5F] text-white shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-[#07130e] dark:text-stone-300 dark:hover:bg-stone-800 border border-transparent dark:border-emerald-900/30"
              }`}
            >
              সকল ({totalModulesCount})
            </button>

            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-[#0D7A5F] text-white shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-[#07130e] dark:text-stone-300 dark:hover:bg-stone-800 border border-transparent dark:border-emerald-900/30"
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  <span>{cat.title}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    {cat.modules.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── EMPTY STATE WHEN SEARCH YIELDS NO RESULTS ── */}
      {filteredCategories.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 rounded-3xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              কোনো মডিউল পাওয়া যায়নি
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
              “{searchQuery}” শব্দের সাথে মিল রেখে কোনো মডিউল খুঁজে পাওয়া যায়নি। বানান পরীক্ষা করুন অথবা অন্য কোনো প্রাসঙ্গিক শব্দ দিয়ে চেষ্টা করুন।
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0D7A5F] text-white hover:bg-[#0b654e] transition cursor-pointer shadow-xs"
          >
            সার্চ রিসেট করুন
          </button>
        </div>
      )}

      {/* ── RENDER CATEGORIES AND REBUILT MODULE GRIDS ── */}
      {filteredCategories.map((category) => {
        const SectionIcon = category.icon;

        return (
          <div
            key={category.id}
            className="bg-white dark:bg-[#0c1612] border border-stone-200/90 dark:border-emerald-900/50 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5 transition-all"
          >
            {/* Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0D7A5F] dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-center shrink-0">
                  <SectionIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                      {category.title}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60">
                      {category.modules.length}টি
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                    {category.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-emerald-500/20 via-stone-200 to-transparent dark:from-emerald-800/30 dark:via-stone-800"></div>

            {/* 4-col Responsive Grid: Mobile 2 cols, Tablet 3 cols, Desktop 4 cols */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
              {category.modules.map((mod) => {
                const ModIcon = mod.icon;

                return (
                  <div
                    key={mod.id}
                    role="button"
                    tabIndex={0}
                    onClick={mod.action}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        mod.action();
                      }
                    }}
                    className="group bg-stone-50/70 dark:bg-[#07130e]/70 hover:bg-white dark:hover:bg-[#0c1612] border border-stone-200/80 dark:border-emerald-900/40 hover:border-[#0D7A5F]/70 dark:hover:border-emerald-500/70 rounded-2xl p-3 sm:p-3.5 cursor-pointer shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[114px] sm:min-h-[122px] relative overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-[#0D7A5F]/30"
                  >
                    {/* Top Row: Icon Container + Badge + Hover Arrow */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      {/* 44-48px Professional SVG Icon Container */}
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-[#0c1612] border border-stone-200/80 dark:border-emerald-800/50 flex items-center justify-center text-[#0D7A5F] dark:text-emerald-300 shadow-2xs group-hover:scale-105 group-hover:border-[#0D7A5F] group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 transition-all duration-200 shrink-0">
                        <ModIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                      </div>

                      {/* Right Tag/Badge or Arrow */}
                      <div className="flex items-center gap-1 shrink-0">
                        {mod.badge && (
                          <span className="text-[9.5px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-[#0D7A5F] dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                            {mod.badge}
                          </span>
                        )}
                        <ArrowUpRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 group-hover:text-[#0D7A5F] dark:group-hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0" />
                      </div>
                    </div>

                    {/* Bottom Content: Title & One-line Subtitle */}
                    <div className="space-y-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#0D7A5F] dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-1">
                        {mod.title}
                      </h4>
                      <p className="text-[10.5px] sm:text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">
                        {mod.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default MosqueModuleCenter;
