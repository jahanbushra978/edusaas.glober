"use client";

import React, { useState } from "react";
import {
  X,
} from "lucide-react";
import { toast } from "sonner";

export function MosqueRegistrationModal({
  onClose,
  onMosqueRegistered,
}) {
  const [mosqueName, setMosqueName] = useState("");
  const [district, setDistrict] = useState("গাজীপুর");
  const [upazila, setUpazila] = useState("সদর");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [estYear, setEstYear] = useState("১৯৯৫");
  const [adminName, setAdminName] = useState("");
  const [adminMobile, setAdminMobile] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mosqueName.trim() || !adminName.trim() || !adminMobile.trim() || !password.trim()) {
      toast.error("অনুগ্রহ করে মসজিদের নাম, অ্যাডমিনের নাম, মোবাইল ও পাসওয়ার্ড দিন");
      return;
    }

    setIsSubmitting(true);
    const newId = `MAS-2026-000${Math.floor(Math.random() * 900 + 100)}`;
    const slug = mosqueName
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-") || `mosque-${Date.now()}`;

    setTimeout(() => {
      setIsSubmitting(false);
      const newTenant = {
        id: newId,
        name: mosqueName.trim(),
        slug: slug,
        district: district,
        address: `${address || upazila}, ${district}`,
        phone: phone || adminMobile,
        email: email || "info@mosque.org",
        established: estYear,
        adminName: adminName.trim(),
        adminMobile: adminMobile.trim(),
        membersCount: 1,
        logoLetter: mosqueName.trim()[0] || "ম",
      };

      if (onMosqueRegistered) onMosqueRegistered(newTenant);
      toast.success(`মাশাআল্লাহ! "${newTenant.name}" সফলভাবে নিবন্ধিত হয়েছে! আপনার ইউনিক মসজিদ আইডি: ${newId}`);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-900 to-[#07251c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl">
              🕌
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                আপনার মসজিদ যুক্ত করুন (Onboarding)
              </h2>
              <p className="text-xs text-emerald-100">
                স্বতন্ত্র মাল্টি-টেন্যান্ট মসজিদ SaaS প্ল্যাটফর্মে আজই যুক্ত হোন
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

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-900 dark:text-emerald-200">
            নিবন্ধন সম্পন্ন হওয়ার পর আপনার মসজিদের জন্য একটি ফ্রি পাবলিক ওয়েবসাইট, মেম্বার পোর্টাল ও ১০টি আলাদা ফান্ড স্বয়ংক্রিয়ভাবে তৈরি হবে।
          </div>

          <div className="space-y-2">
            <b className="text-stone-900 dark:text-stone-100 block">১. মসজিদের সাধারণ তথ্যাবলী:</b>
            <div>
              <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                মসজিদের পুরো নাম:
              </label>
              <input
                type="text"
                placeholder="যেমন: বাইতুল ফালাহ জামে মসজিদ"
                value={mosqueName}
                onChange={(e) => setMosqueName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                  জেলা:
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                >
                  <option value="গাজীপুর">গাজীপুর</option>
                  <option value="ঢাকা">ঢাকা</option>
                  <option value="নারায়ণগঞ্জ">নারায়ণগঞ্জ</option>
                  <option value="কুমিল্লা">কুমিল্লা</option>
                  <option value="সিলেট">সিলেট</option>
                  <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                  উপজেলা / থানা:
                </label>
                <input
                  type="text"
                  placeholder="যেমন: সদর / উত্তরা"
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
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
                placeholder="যেমন: হারিনাল বাজার রোড, ওয়ার্ড নং ২৬"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                  মসজিদ অফিসের ফোন:
                </label>
                <input
                  type="text"
                  placeholder="০১৭১১-XXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
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
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-emerald-900/60">
            <b className="text-stone-900 dark:text-stone-100 block">২. প্রধান প্রশাসক / অ্যাডমিন অ্যাকাউন্ট:</b>

            <div>
              <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                প্রশাসকের নাম (সভাপতি / সেক্রেটারি):
              </label>
              <input
                type="text"
                placeholder="যেমন: হাজী মো. আব্দুল্লাহ"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                  অ্যাডমিন মোবাইল (লগইন আইডি):
                </label>
                <input
                  type="text"
                  placeholder="০১৭১১-২২৩৩৪৪"
                  value={adminMobile}
                  onChange={(e) => setAdminMobile(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-bold mb-1">
                  পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর):
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-emerald-900/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 font-bold text-xs"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span>{isSubmitting ? "টেন্যান্ট তৈরি হচ্ছে..." : "মসজিদ নিবন্ধন সম্পন্ন করুন ➔"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
