"use client";

import React, { useState } from "react";
import {
  X,
  Building2,
  CheckCircle2,
  Clock,
  Landmark,
  User,
  Phone,
  Lock,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { saveMosqueOnboardingRequest } from "../../services/mosqueStorage";

export function MosqueRegistrationModal({
  onClose,
  onMosqueRegistered,
  onOpenDiscovery,
}) {
  // Form Fields
  const [mosqueName, setMosqueName] = useState("");
  const [mosqueNameEn, setMosqueNameEn] = useState("");
  const [district, setDistrict] = useState("ঢাকা");
  const [upazila, setUpazila] = useState("মিরপুর");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [estYear, setEstYear] = useState("২০১৮");
  const [floorsCount, setFloorsCount] = useState("৩");
  const [musalliCapacity, setMusalliCapacity] = useState("১০০০");
  const [mapLink, setMapLink] = useState("");

  // Khatib / Pesh Imam Info
  const [imamName, setImamName] = useState("");
  const [imamPhone, setImamPhone] = useState("");

  // Administrator / Submitter Info
  const [adminName, setAdminName] = useState("");
  const [adminRole, setAdminRole] = useState("সভাপতি");
  const [adminMobile, setAdminMobile] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");

  // Facilities
  const AVAILABLE_FACILITIES = [
    "শীতাতপ নিয়ন্ত্রিত (AC)",
    "জেনারেটর ব্যাকআপ",
    "সিসিটিভি সিকিউরিটি",
    "নূরানী শিশু মক্তব",
    "আধুনিক ওজুখানা ও গিজার",
    "ইমাম খানা রোস্টার",
    "ইসলামিক লাইব্রেরি",
    "লাশ সংরক্ষণ / ফ্রিজার ভ্যান",
  ];
  const [selectedFacilities, setSelectedFacilities] = useState([
    "শীতাতপ নিয়ন্ত্রিত (AC)",
    "নূরানী শিশু মক্তব",
    "আধুনিক ওজুখানা ও গিজার",
  ]);

  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);

  const toggleFacility = (facility) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mosqueName.trim() || !adminName.trim() || !adminMobile.trim() || !password.trim()) {
      toast.error("অনুগ্রহ করে মসজিদের নাম, আবেদনকারীর নাম, মোবাইল ও পাসওয়ার্ড পূরণ করুন");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const payload = {
        name: mosqueName.trim(),
        name_bn: mosqueName.trim(),
        name_en: mosqueNameEn.trim() || mosqueName.trim(),
        district,
        upazila,
        address: address.trim() || `${upazila}, ${district}`,
        phone: phone.trim() || adminMobile.trim(),
        email: email.trim() || adminEmail.trim() || "info@mosque.org",
        establishedYear: estYear,
        floorsCount: Number(floorsCount) || 2,
        musalliCapacity: Number(musalliCapacity) || 500,
        mapLink: mapLink.trim() || null,
        imamName: imamName.trim() || "মাওলানা পেশ ইমাম",
        imamPhone: imamPhone.trim() || "০১৯XX-XXXXXX",
        submitterName: adminName.trim(),
        submitterRole: adminRole,
        submitterPhone: adminMobile.trim(),
        submitterEmail: adminEmail.trim(),
        password: password.trim(),
        facilities: selectedFacilities,
        notes: notes.trim() || "অনলাইন মসজিদ আবেদন",
      };

      const result = saveMosqueOnboardingRequest(payload);
      setIsSubmitting(false);

      if (result.ok) {
        setSubmittedResult(result);
        toast.success(`মাশাআল্লাহ! "${payload.name}"-এর আবেদন সফলভাবে গৃহীত হয়েছে!`);
        if (onMosqueRegistered) onMosqueRegistered(result.data);
      } else {
        toast.error("আবেদন সংরক্ষণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    }, 600);
  };

  const handleCopyTracking = () => {
    if (!submittedResult?.trackingId) return;
    navigator.clipboard.writeText(submittedResult.trackingId);
    setCopiedTrackingId(true);
    toast.success("ট্র্যাকিং আইডি কপি হয়েছে!");
    setTimeout(() => setCopiedTrackingId(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-900 to-[#07251c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl shrink-0">
              🕌
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                আপনার মসজিদ যুক্ত করুন (Mosque Onboarding)
              </h2>
              <p className="text-xs text-emerald-100">
                তথ্য পূরণ করুন ➔ এডমিন রিভিউ ও অনুমোদন ➔ নিজস্ব লাইভ ওয়েবসাইট ও ইআরপি
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── SUCCESS SCREEN AFTER SUBMISSION ── */}
        {submittedResult ? (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-center flex-1 flex flex-col justify-center items-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5 max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
                <Clock className="w-3.5 h-3.5" />
                <span>প্রশাসনিক পর্যালোচনার অপেক্ষায় (Pending Approval)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
                আলহামদুলিল্লাহ! আপনার আবেদন সফল হয়েছে
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                <strong className="text-emerald-700 dark:text-emerald-400">"{submittedResult.data?.name}"</strong> এর তথ্য আমাদের সিস্টেমে জমা হয়েছে। এডমিন কর্তৃক রিভিউ ও অনুমোদন (Approval) সম্পন্ন হলেই মসজিদটি স্বয়ংক্রিয়ভাবে লাইভ হয়ে যাবে।
              </p>
            </div>

            {/* Tracking ID Box */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/60 w-full max-w-md space-y-2">
              <div className="text-[11px] text-stone-500 font-bold">আপনার আবেদন ট্র্যাকিং নম্বর (Application ID):</div>
              <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#0f1d17] p-2.5 rounded-xl border border-stone-200 dark:border-emerald-800 font-mono text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-400">
                <span>{submittedResult.trackingId}</span>
                <button
                  onClick={handleCopyTracking}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sans font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                >
                  {copiedTrackingId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTrackingId ? "কপি হয়েছে" : "কপি"}</span>
                </button>
              </div>
              <p className="text-[10px] text-stone-400 text-left">
                * অনুমোদন শেষে আপনি আপনার মোবাইল নম্বর <b>({submittedResult.data?.submitterPhone})</b> ও পাসওয়ার্ড দিয়ে সরাসরি এডমিন প্যানেলে লগইন করে হিসাব, ফান্ড ও নোটিশ পরিচালনা করতে পারবেন।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md pt-2">
              {onOpenDiscovery && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDiscovery();
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition"
                >
                  লাইভ মসজিদসমূহ দেখুন
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md transition"
              >
                সম্পন্ন করুন
              </button>
            </div>
          </div>
        ) : (
          /* ── APPLICATION FORM ── */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            {/* Guidance Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <b>অনবোর্ডিং নিয়মাবলী:</b> ফরম পূরণ করে সাবমিট করার পর আমাদের এডমিন টিম তথ্য পর্যালোচনা করে অনুমোদন দেবেন। অনুমোদিত হওয়ার সাথে সাথে মসজিদের ফ্রি পাবলিক সাইট, ১০টি ফান্ড, ইমাম খানা রোস্টার এবং মেম্বার পোর্টাল প্রস্তুত হবে।
              </div>
            </div>

            {/* SECTION 1: MOSQUE BASIC INFO */}
            <div className="space-y-2.5 bg-stone-50/70 dark:bg-[#07130e]/60 p-3.5 rounded-2xl border border-stone-200/80 dark:border-emerald-900/40">
              <b className="text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-xs">
                <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                <span>১. মসজিদের সাধারণ তথ্যাবলী:</span>
              </b>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                  মসজিদের পূর্ণ নাম (বাংলায়) <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বাইতুল ফালাহ জামে মসজিদ ও কমপ্লেক্স"
                  value={mosqueName}
                  onChange={(e) => setMosqueName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                    মসজিদের নাম (ইংরেজি):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Baitul Falah Jame Masjid"
                    value={mosqueNameEn}
                    onChange={(e) => setMosqueNameEn(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                    প্রতিষ্ঠার সাল:
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ১৯৯৫"
                    value={estYear}
                    onChange={(e) => setEstYear(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                    জেলা <span className="text-red-500">*</span>:
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 font-medium"
                  >
                    <option value="ঢাকা">ঢাকা</option>
                    <option value="গাজীপুর">গাজীপুর</option>
                    <option value="নারায়ণগঞ্জ">নারায়ণগঞ্জ</option>
                    <option value="কুমিল্লা">কুমিল্লা</option>
                    <option value="সিলেট">সিলেট</option>
                    <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                    <option value="রাজশাহী">রাজশাহী</option>
                    <option value="বগুড়া">বগুড়া</option>
                    <option value="খুলনা">খুলনা</option>
                    <option value="ময়মনসিংহ">ময়মনসিংহ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                    উপজেলা / থানা <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: মিরপুর / সদর"
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                  পূর্ণ ঠিকানা / এলাকা:
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ব্লক-সি, রোড নং ৪, ওয়ার্ড নং ০২"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                    তলা সংখ্যা:
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ৩"
                    value={floorsCount}
                    onChange={(e) => setFloorsCount(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                    মুসল্লি ধারণক্ষমতা:
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ১০০০"
                    value={musalliCapacity}
                    onChange={(e) => setMusalliCapacity(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                  />
                </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                    মসজিদ অফিসের ফোন:
                  </label>
                  <input
                    type="text"
                    placeholder="০১৭১১-XXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                    মসজিদ ইমেইল (ঐচ্ছিক):
                  </label>
                  <input
                    type="email"
                    placeholder="info@mosque.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                  গুগল ম্যাপ লিঙ্ক (Google Maps Link):
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={mapLink}
                  onChange={(e) => setMapLink(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 font-mono text-[11px]"
                />
              </div>
            </div>

            {/* SECTION 2: KHATIB & IMAM INFO */}
            <div className="space-y-2.5 bg-stone-50/70 dark:bg-[#07130e]/60 p-3.5 rounded-2xl border border-stone-200/80 dark:border-emerald-900/40">
              <b className="text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-xs">
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>২. খতীব ও পেশ ইমামের তথ্য:</span>
              </b>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                    পেশ ইমাম / খতীবের নাম:
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: মাওলানা হাফিজুর রহমান"
                    value={imamName}
                    onChange={(e) => setImamName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                    ইমামের মোবাইল নম্বর:
                  </label>
                  <input
                    type="text"
                    placeholder="০১৯১১-XXXXXX"
                    value={imamPhone}
                    onChange={(e) => setImamPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: FACILITIES */}
            <div className="space-y-2 bg-stone-50/70 dark:bg-[#07130e]/60 p-3.5 rounded-2xl border border-stone-200/80 dark:border-emerald-900/40">
              <b className="text-stone-900 dark:text-stone-100 block text-xs">
                ৩. মসজিদের সুযোগ-সুবিধা ও সার্ভিসসমূহ (টিক চিহ্ন দিন):
              </b>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {AVAILABLE_FACILITIES.map((fac) => {
                  const isChecked = selectedFacilities.includes(fac);
                  return (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => toggleFacility(fac)}
                      className={`p-2 rounded-xl text-[11px] font-bold text-left transition border flex items-center gap-1.5 cursor-pointer ${
                        isChecked
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-2xs"
                          : "bg-white dark:bg-[#0f1d17] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-emerald-800"
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] shrink-0 ${
                        isChecked ? "bg-white text-emerald-800" : "border border-stone-300 dark:border-stone-600"
                      }`}>
                        {isChecked && "✓"}
                      </span>
                      <span className="truncate">{fac}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: APPLICANT / PRESIDENT ADMIN ACCOUNT */}
            <div className="space-y-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
              <b className="text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5 text-xs">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>৪. আবেদনকারী ও প্রধান প্রশাসক (Admin Login Account):</span>
              </b>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                এই মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে অনুমোদন শেষে আপনি আপনার মসজিদের এডমিন প্যানেলে লগইন করবেন।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                    আবেদনকারীর নাম <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: হাজী মো. আব্দুল্লাহ"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                    কমিটিতে পদবি:
                  </label>
                  <select
                    value={adminRole}
                    onChange={(e) => setAdminRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 font-medium"
                  >
                    <option value="সভাপতি">সভাপতি (President)</option>
                    <option value="সাধারণ সম্পাদক">সাধারণ সম্পাদক (General Secretary)</option>
                    <option value="কোষাধ্যক্ষ">কোষাধ্যক্ষ (Treasurer)</option>
                    <option value="উপদেষ্টা">উপদেষ্টা (Advisor)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                    মোবাইল নম্বর (এডমিন লগইন আইডি) <span className="text-red-500">*</span>:
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="০১৭১১-২২৩৩৪৪"
                      value={adminMobile}
                      onChange={(e) => setAdminMobile(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                    পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) <span className="text-red-500">*</span>:
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                    এডমিন ইমেইল (ঐচ্ছিক):
                  </label>
                  <input
                    type="email"
                    placeholder="admin@mosque.org"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                বিশেষ কোনো নোট বা অনুরোধ থাকলে লিখুন:
              </label>
              <textarea
                rows={2}
                placeholder="যেমন: আমাদের মসজিদে অবিলম্বে ডিজিটাল অনুদান ও জুমার হিসাব ব্যবস্থা চালু প্রয়োজন..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
              />
            </div>

            {/* Submit Bar */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-emerald-900/60 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer hover:bg-stone-200"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 transition"
              >
                <span>{isSubmitting ? "আবেদন জমা হচ্ছে..." : "মসজিদ নিবন্ধনের আবেদন জমা দিন ➔"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
