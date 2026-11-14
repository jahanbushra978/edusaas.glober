"use client";

import React, { useState } from "react";
import {
  Building2,
  Clock,
  Calendar,
  Heart,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Users,
  Coins,
  Receipt,
  FileText,
  Search,
  ExternalLink,
  LogIn,
  CheckCircle2,
  Globe,
  Share2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export function PublicMosqueWebsite({
  mosque,
  schedule,
  currentPrayer,
  countdown,
  nextJamaatText,
  onOpenLogin,
  onOpenDiscovery,
  onOpenCustomDomain,
  onOpenDonate,
  onOpenMaktab,
}) {
  const [activeTab, setActiveTab] = useState("home"); // "home" | "prayer" | "about" | "committee" | "donate" | "notices" | "contact"
  const [donateAmount, setDonateAmount] = useState(1000);
  const [selectedFund, setSelectedFund] = useState("সাধারণ পরিচালন ফান্ড");
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donationReceipt, setDonationReceipt] = useState(null);

  const handleOnlineDonate = (e) => {
    e.preventDefault();
    if (!donateAmount || donateAmount <= 0) {
      toast.error("সঠিক অনুদানের পরিমাণ দিন");
      return;
    }

    const rcpt = {
      receiptNo: `RCPT-ONL-${Date.now().toString().slice(-5)}`,
      donor: isAnonymous ? "গোপন দাতা (Anonymous)" : (donorName.trim() || "শ্রদ্ধেয় মুসল্লি"),
      phone: donorPhone.trim() || "০১৭XX-XXXXXX",
      amount: Number(donateAmount),
      fund: selectedFund,
      date: "আজকের তারিখ",
      method: "বিকাশ / নগদ অনলাইন গেটওয়ে",
    };

    setDonationReceipt(rcpt);
    toast.success("মাশাআল্লাহ! অনুদানটি সফলভাবে গৃহীত হয়েছে এবং ডিজিটাল রসিদ প্রস্তুত।");
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#07130e] text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Centered Container for Mobile-First & Desktop */}
      <div className="max-w-xl mx-auto px-3 sm:px-4 pb-24 pt-2">
        {/* Public Top Navbar */}
        <header className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs mb-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                {mosque?.logoLetter || "বা"}
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 truncate">
                  {mosque?.name || "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স"}
                </h1>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{mosque?.address || "হাড়িনাল, গাজীপুর"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onOpenDiscovery}
                className="p-2 rounded-full border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#07130e] text-stone-700 dark:text-stone-300 hover:border-emerald-500 transition cursor-pointer"
                title="মসজিদ পরিবর্তন বা অনুসন্ধান"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenLogin}
                className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>সদস্য লগইন</span>
              </button>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none pt-1 border-t border-stone-100 dark:border-emerald-950/60 text-xs">
            {[
              { key: "home", label: "হোম" },
              { key: "prayer", label: "নামাজের সময়" },
              { key: "about", label: "পরিচিতি" },
              { key: "committee", label: "কমিটি ও উলামা" },
              { key: "donate", label: "অনলাইন দান" },
              { key: "notices", label: "ঘোষণা" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-emerald-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* ── TAB 1: PUBLIC HOMEPAGE ── */}
        {activeTab === "home" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Islamic Hero Section */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#094838] via-[#0f6850] to-[#128a6a] text-white shadow-xl relative overflow-hidden space-y-3">
              <div className="absolute right-0 top-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between text-xs text-emerald-200">
                <span>🕌 আল্লাহর ঘর পরিচালনা ও সামাজিক কল্যাণ</span>
                <span className="font-mono bg-white/15 px-2 py-0.5 rounded-full text-[10px]">
                  প্রতিষ্ঠা: {mosque?.established || "১৯৯৮"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                {mosque?.name || "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স"}
              </h2>

              <p className="text-xs text-emerald-100 leading-relaxed">
                পবিত্র কুরআন ও সুন্নাহর আলোয় আলোকিত একটি আদর্শ মসজিদ ও দ্বীনি সমাজ বিনির্মাণের লক্ষ্যে পরিচালিত হচ্ছে।
              </p>

              <div className="flex gap-2 pt-2 border-t border-white/20">
                <button
                  onClick={() => setActiveTab("donate")}
                  className="flex-1 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-stone-900 font-black text-xs flex items-center justify-center gap-1 cursor-pointer shadow-md"
                >
                  <Coins className="w-4 h-4" />
                  <span>মসজিদে দান করুন</span>
                </button>
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>সদস্য পোর্টাল</span>
                </button>
              </div>
            </div>

            {/* Prayer Waqt Arc Card */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                    {currentPrayer?.name || "আসর"} ওয়াক্ত চলমান
                  </span>
                  <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 mt-0.5">
                    {nextJamaatText}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-600 font-mono">
                    {countdown}
                  </span>
                  <p className="text-[10px] text-stone-400">পরবর্তী জামা'আত</p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-1 pt-2 border-t border-stone-100 dark:border-emerald-950/60 text-center">
                {schedule?.map((p) => (
                  <div
                    key={p.id}
                    className={`p-2 rounded-2xl ${
                      currentPrayer?.id === p.id
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500"
                        : "bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-950/40"
                    }`}
                  >
                    <div className="text-xs font-black">{p.name}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">{p.start.replace(" AM", "").replace(" PM", "")}</div>
                    <div className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">{p.jamaat.replace(" AM", "").replace(" PM", "")}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Services Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div
                onClick={() => setActiveTab("prayer")}
                className="p-3 rounded-2xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50 shadow-2xs text-center cursor-pointer hover:border-emerald-500"
              >
                <Clock className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <b className="block">নামাজের সময়</b>
                <span className="text-[10px] text-stone-400">আজান ও জামাত</span>
              </div>

              <div
                onClick={() => {
                  if (onOpenMaktab) onOpenMaktab();
                  else toast.info("মক্তব ও কুরআন শিক্ষা বিভাগ");
                }}
                className="p-3 rounded-2xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50 shadow-2xs text-center cursor-pointer hover:border-emerald-500"
              >
                <BookOpen className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <b className="block">নূরানী মক্তব</b>
                <span className="text-[10px] text-stone-400">শিশু ও বয়স্ক শিক্ষা</span>
              </div>

              <div
                onClick={() => setActiveTab("notices")}
                className="p-3 rounded-2xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/50 shadow-2xs text-center cursor-pointer hover:border-emerald-500"
              >
                <FileText className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <b className="block">ঘোষণা ও নোটিশ</b>
                <span className="text-[10px] text-stone-400">জুমার খুতবা ও মাহফিল</span>
              </div>
            </div>

            {/* Latest Public Notice */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">📢 আগামী জুমার বিশেষ খুতবা</span>
                <span className="text-[10px] text-stone-400">২০ নভেম্বর ২০২৬</span>
              </div>
              <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                বিষয়: হালাল উপার্জনের গুরুত্ব, সুদ ও অন্যায় ভক্ষণের ভয়াবহ পরিণতি
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                আলোচক: পেশ ইমাম ও খতীব মাওলানা মাহমুদ হাসান। সকল মুসল্লি ভাইদের দুপুর ১২:৩০ ঘটিকার মধ্যে মসজিদে উপস্থিত হওয়ার বিনীত অনুরোধ করা হচ্ছে।
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 2: PRAYER TIMETABLE & HIJRI CALENDAR ── */}
        {activeTab === "prayer" && (
          <div className="space-y-3 animate-in fade-in duration-200 text-xs">
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-stone-900 dark:text-stone-100">
                দৈনিক ৫ ওয়াক্ত ও জুমার আজান এবং জামা'আতের সময়সূচি
              </h3>
              <p className="text-[11px] text-stone-500">
                মসজিদ পরিচালনা কমিটি কর্তৃক নির্ধারিত স্থায়ী ও চলতি জামাত সময়
              </p>

              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-emerald-950/60">
                {[
                  { name: "ফজর (Fajr)", azan: "০৪:৪৫ AM", jamaat: "০৫:১৫ AM" },
                  { name: "যোহর (Dhuhr)", azan: "১১:৫৮ AM", jamaat: "০১:১৫ PM" },
                  { name: "আসর (Asr)", azan: "০৪:০৫ PM", jamaat: "০৪:৪৫ PM" },
                  { name: "মাগরিব (Maghrib)", azan: "০৫:৩৮ PM", jamaat: "০৫:৪৫ PM" },
                  { name: "এশা (Isha)", azan: "০৬:৫০ PM", jamaat: "০৮:০০ PM" },
                  { name: "জুমু'আ (Jumu'ah)", azan: "১২:৪০ PM", jamaat: "০১:১৫ PM" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-950/60 flex items-center justify-between"
                  >
                    <div>
                      <b className="text-sm font-black text-stone-900 dark:text-stone-100">{item.name}</b>
                      <span className="text-[10px] text-stone-400 block">আজান: {item.azan}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black font-mono text-emerald-700 dark:text-emerald-400">
                        জামা'আত: {item.jamaat}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: ABOUT MOSQUE ── */}
        {activeTab === "about" && (
          <div className="space-y-3 animate-in fade-in duration-200 text-xs">
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-stone-900 dark:text-stone-100">
                মসজিদের ইতিহাস ও পরিচিতি
              </h3>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                {mosque?.name || "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স"} ১৯৯৮ সালে স্থানীয় পরহেযগার মুসল্লি ও বিশিষ্ট সমাজসেবকদের উদ্যোগে প্রতিষ্ঠিত হয়। বর্তমানে এটি একটি দ্বিতল আধুনিক মসজিদ ভবন যেখানে একসাথে প্রায় ১,২০০ মুসল্লি জামাআতে সালাত আদায় করতে পারেন।
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 dark:border-emerald-950/60">
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#0f1d17]">
                  <span className="text-[10px] text-stone-400">ধারণক্ষমতা</span>
                  <div className="font-bold text-stone-900 dark:text-stone-100">১,২০০+ মুসল্লি</div>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#0f1d17]">
                  <span className="text-[10px] text-stone-400">মহিলাদের জন্য নামাজ</span>
                  <div className="font-bold text-emerald-700">পৃথক ও সুরক্ষিত ব্যবস্থা</div>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#0f1d17]">
                  <span className="text-[10px] text-stone-400">অজুখানা</span>
                  <div className="font-bold text-stone-900 dark:text-stone-100">৫০ জন একসাথে অজু</div>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#0f1d17]">
                  <span className="text-[10px] text-stone-400">জেনারেটর ও আইপিএস</span>
                  <div className="font-bold text-emerald-700">২৪ ঘণ্টা বিদ্যুৎ ব্যাকআপ</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: COMMITTEE & ULEMA ── */}
        {activeTab === "committee" && (
          <div className="space-y-3 animate-in fade-in duration-200 text-xs">
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-stone-900 dark:text-stone-100">
                সম্মানিত ইমাম, খতীব ও পরিচালনা পরিষদ
              </h3>

              <div className="space-y-2">
                {[
                  { name: "হাজী মুহাম্মদ আব্দুল্লাহ", role: "মুতাওয়াল্লী ও সভাপতি", phone: "০১৭১১-২২৩৩৪৪" },
                  { name: "মাওলানা মাহমুদ হাসান", role: "পেশ ইমাম ও খতীব", phone: "০১৯১১-৪৪৫৫৬৬" },
                  { name: "হাজী রফিকুল ইসলাম", role: "সহ-সভাপতি", phone: "০১৮১৯-১১২২৩৩" },
                  { name: "জনাব শাহিনুর রহমান", role: "সাধারণ সম্পাদক ও কোষাধ্যক্ষ", phone: "০১৭২১-৯৯৮৮৭৭" },
                  { name: "হাফেজ ক্বারী বিলাল হোসেন", role: "মুয়াজ্জিন ও সহকারী শিক্ষক", phone: "০১৮২২-৩৩৪৪৫৫" },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-950/60 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-stone-100">{c.name}</h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">{c.role}</p>
                    </div>
                    <a
                      href={`tel:${c.phone}`}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{c.phone}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: ONLINE DONATION & TRANSPARENCY ── */}
        {activeTab === "donate" && (
          <div className="space-y-3 animate-in fade-in duration-200 text-xs">
            <form
              onSubmit={handleOnlineDonate}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs space-y-3"
            >
              <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>মসজিদ ফান্ডে দান করুন (স্বচ্ছ ও তাত্ক্ষণিক রসিদ)</span>
              </h3>
              <p className="text-[11px] text-stone-500">
                “যে ব্যক্তি আল্লাহর সন্তুষ্টির জন্য একটি মসজিদ নির্মাণ করে, আল্লাহ তার জন্য জান্নাতে একটি ঘর নির্মাণ করবেন।” (সহীহ বুখারী)
              </p>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  ফান্ড নির্বাচন করুন:
                </label>
                <select
                  value={selectedFund}
                  onChange={(e) => setSelectedFund(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17]"
                >
                  <option value="সাধারণ পরিচালন ফান্ড">সাধারণ পরিচালন ফান্ড (দৈনন্দিন খরচ ও বিদ্যুৎ)</option>
                  <option value="নির্মাণ ও সংস্কার ফান্ড">নির্মাণ ও সংস্কার ফান্ড (দ্বিতীয় তলার কাজ)</option>
                  <option value="ইমাম-মুয়াজ্জিন হাদিয়া">ইমাম-মুয়াজ্জিন হাদিয়া ও সম্মানী ফান্ড</option>
                  <option value="যাকাত ও সাহায্য ফান্ড">যাকাত ও গরীব-অসহায় সহায়তা ফান্ড</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  অনুদানের পরিমাণ (টাকা):
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[500, 1000, 2000, 5000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setDonateAmount(amt)}
                      className={`py-1.5 rounded-xl font-mono font-bold text-xs ${
                        donateAmount === amt
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-100 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-950"
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17] font-mono font-bold"
                  placeholder="অন্য যেকোনো অঙ্ক..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    আপনার নাম:
                  </label>
                  <input
                    type="text"
                    placeholder="নাম লিখুন"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    disabled={isAnonymous}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17] disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    মোবাইল নম্বর:
                  </label>
                  <input
                    type="text"
                    placeholder="০১৭১১-XXXXXX"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="anon"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
                <label htmlFor="anon" className="text-stone-600 dark:text-stone-400 cursor-pointer">
                  নাম প্রকাশ না করে গোপন দান হিসেবে রাখুন (Anonymous Donor)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-md"
              >
                বিকাশ / নগদ / ব্যাংকের মাধ্যমে দান সম্পন্ন করুন ➔
              </button>
            </form>

            {/* Donation Receipt Modal */}
            {donationReceipt && (
              <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 space-y-2 animate-in fade-in">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-emerald-900 dark:text-emerald-200">
                    তাত্ক্ষণিক দান রসিদ জেনারেট হয়েছে:
                  </h4>
                  <button
                    onClick={() => setDonationReceipt(null)}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1 text-[11px] text-stone-700 dark:text-stone-300">
                  <div className="flex justify-between">
                    <span>রসিদ নং:</span>
                    <b className="font-mono">{donationReceipt.receiptNo}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>দাতার নাম:</span>
                    <b>{donationReceipt.donor}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>ফান্ড:</span>
                    <b>{donationReceipt.fund}</b>
                  </div>
                  <div className="flex justify-between items-baseline pt-1 border-t border-emerald-200 dark:border-emerald-800">
                    <span>অনুদানের পরিমাণ:</span>
                    <b className="text-base font-black font-mono text-emerald-800 dark:text-emerald-300">
                      ৳{donationReceipt.amount.toLocaleString("bn-BD")}
                    </b>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 6: NOTICES & ANNOUNCEMENTS ── */}
        {activeTab === "notices" && (
          <div className="space-y-3 animate-in fade-in duration-200 text-xs">
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/60 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-stone-900 dark:text-stone-100">
                মসজিদের নোটিশ বোর্ড ও জরুরি ঘোষণা
              </h3>

              <div className="space-y-2.5">
                {[
                  { title: "জুমার নামাজের খুতবা ও সময়সূচি", date: "১৩ নভেম্বর ২০২৬", author: "পেশ ইমাম", desc: "আগামী জুমায় বিষয়ভিত্তিক আলোচনা ও বয়ান পেশ করা হবে।" },
                  { title: "নূরানী মক্তবের বার্ষিক পরীক্ষা ও নতুন সেশন ভর্তি", date: "১০ নভেম্বর ২০২৬", author: "মক্তব পরিচালনা কমিটি", desc: "৫ বছর বা তদূর্ধ্ব বয়সী শিশুদের ভর্তি কার্যক্রম চলমান।" },
                  { title: "দ্বিতীয় তলার ছাদ ঢালাইয়ের বিশেষ ইনফাক আবেদন", date: "০৫ নভেম্বর ২০২৬", author: "নির্মাণ উপ-কমিটি", desc: "মসজিদ সম্প্রসারণ কাজে মুক্তহস্তে সদকায়ে জারিয়া হিসেবে দান করার আহ্বান।" },
                ].map((n, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-950/60 space-y-1"
                  >
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>{n.author}</span>
                      <span>{n.date}</span>
                    </div>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs">{n.title}</h4>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
