"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Zap, UserCheck, BookOpen, Users, Globe, CheckCircle2,
  CheckCircle, AlertCircle, Send, X
} from "lucide-react";

export default function WebsiteOnboardingModal({ isOpen, onClose }) {
  const [websiteFormData, setWebsiteFormData] = useState({
    division: "",
    district: "",
    upazila: "",
    name: "",
    photoUrl: "",
    address: "",
    establishedYear: "",
    mapLink: "",
    founder: "",
    foundingPrincipal: "",
    foundingSecretary: "",
    foundingTeachers: "",
    foundingStats: "",
    alumniInfo: "",
    socialImpact: "",
    gloriousHistory: "",
    futurePlan: "",
    boardAffiliation: "",
    accountsFundInfo: "",
    currentPrincipal: "",
    currentPrincipalPhone: "",
    currentSecretary: "",
    currentTeachersList: "",
    totalStudents: "",
    dawraStudents: "",
    hostelStudents: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    submitterName: "",
    submitterPhone: "",
    submitterEmail: "",
  });

  const [isSubmittingWebsiteForm, setIsSubmittingWebsiteForm] = useState(false);
  const [websiteFormStatus, setWebsiteFormStatus] = useState({ success: null, message: "" });

  const handleWebsiteFormSubmit = async (e) => {
    e.preventDefault();
    if (!websiteFormData.name || !websiteFormData.submitterName || !websiteFormData.submitterPhone) {
      setWebsiteFormStatus({
        success: false,
        message: "দয়া করে প্রতিষ্ঠানের নাম এবং আপনার নাম ও মোবাইল নম্বর সঠিকভাবে প্রদান করুন।"
      });
      return;
    }
    setIsSubmittingWebsiteForm(true);
    setWebsiteFormStatus({ success: null, message: "" });

    try {
      const res = await fetch("/api/onboarding-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(websiteFormData),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setWebsiteFormStatus({ success: true, message: data.message });
      } else {
        setWebsiteFormStatus({
          success: false,
          message: data.message || "ফরম জমা হতে ব্যর্থ হয়েছে।"
        });
      }
    } catch {
      setWebsiteFormStatus({
        success: false,
        message: "সার্ভার এরর। অনুগ্রহ করে আবার চেষ্টা করুন।"
      });
    } finally {
      setIsSubmittingWebsiteForm(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-10 shadow-2xl text-slate-800 my-auto border border-slate-200 max-h-[92vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center border-b pb-5 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-2">
                <Zap className="h-3.5 w-3.5 text-amber-600" />
                <span>EduSaaS Global — অটো ওয়েবসাইট জেনারেটর</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#052E2B] font-serif uppercase tracking-tight">
                তথ্য ফরম (মাদরাসা ও স্কুল অনলাইন তৈরি)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
                নিচের ফরমটি সঠিক তথ্য দিয়ে পূরণ করে জমা দিন। এডমিন প্যানেল থেকে এপ্রুভ হলেই আপনার লাইভ ওয়েবসাইটটি তৈরি হয়ে যাবে।
              </p>
            </div>

            <form onSubmit={handleWebsiteFormSubmit} className="space-y-8 text-xs font-sans">
              {/* SECTION 1: Location & General Info */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <h3 className="text-sm font-black text-[#052E2B] border-b pb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span>১. সাধারণ ও অবস্থান সংক্রান্ত তথ্য</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">বিভাগ <span className="text-red-500">★</span></label>
                    <select
                      required
                      value={websiteFormData.division}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, division: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    >
                      <option value="">Select Division</option>
                      {["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">জেলা <span className="text-red-500">★</span></label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: গাজীপুর"
                      value={websiteFormData.district}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, district: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">উপজেলা/থানা <span className="text-red-500">★</span></label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: সদর"
                      value={websiteFormData.upazila}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, upazila: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠানের নাম <span className="text-red-500">★</span></label>
                    <input
                      type="text"
                      required
                      placeholder="প্রতিষ্ঠানের পুরো নাম"
                      value={websiteFormData.name}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, name: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠানের ঠিকানা <span className="text-red-500">★</span></label>
                    <input
                      type="text"
                      required
                      placeholder="গ্রাম/রোড, পোস্ট অফিস"
                      value={websiteFormData.address}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, address: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠা কাল <span className="text-red-500">★</span></label>
                    <input
                      type="text"
                      required
                      placeholder=" যেমন: ১৯৯৫ ইং"
                      value={websiteFormData.establishedYear}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, establishedYear: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠানের ছবি / লোগো (URL / Link)</label>
                    <input
                      type="text"
                      placeholder="ছবি বা লোগোর গুগল ড্রাইভ / ইমেজ লিঙ্ক"
                      value={websiteFormData.photoUrl}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, photoUrl: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">গুগল ম্যাপস অবস্থান লিঙ্ক (Google Maps Link) 🗺️</label>
                    <input
                      type="url"
                      placeholder="https://maps.google.com/..."
                      value={websiteFormData.mapLink}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, mapLink: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white font-mono text-slate-600 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Founders & Early History */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <h3 className="text-sm font-black text-[#052E2B] border-b pb-2 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  <span>২. প্রতিষ্ঠাতা ও দায়িত্বশীলবর্গ</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠাতা <span className="text-red-500">★</span></label>
                    <input
                      type="text"
                      required
                      placeholder="প্রতিষ্ঠাতার নাম"
                      value={websiteFormData.founder}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, founder: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠাকালিন মুহতামিম <span className="text-red-500">★</span></label>
                    <input
                      type="text"
                      required
                      placeholder="প্রতিষ্ঠাকালিন মুহতামিম"
                      value={websiteFormData.foundingPrincipal}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, foundingPrincipal: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠাকালিন শিক্ষাসচিব <span className="text-red-500">★</span></label>
                    <input
                      type="text"
                      required
                      placeholder="প্রতিষ্ঠাকালিন শিক্ষাসচিব"
                      value={websiteFormData.foundingSecretary}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, foundingSecretary: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠাকালিন শিক্ষকবৃন্দ <span className="text-red-500">★</span></label>
                    <textarea
                      required
                      rows={2}
                      placeholder="প্রতিষ্ঠাকালিন শিক্ষকবৃন্দের তালিকা..."
                      value={websiteFormData.foundingTeachers}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, foundingTeachers: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠাকালিন জামাত সংখ্যা, বর্তমান সমাপনী জামাত / উদ্বোধনী সন <span className="text-red-500">★</span></label>
                    <textarea
                      required
                      rows={2}
                      placeholder="বিবরণ লিখুন..."
                      value={websiteFormData.foundingStats}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, foundingStats: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Detailed History & Impact */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <h3 className="text-sm font-black text-[#052E2B] border-b pb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <span>৩. ইতিহাস, অর্জন ও সামাজিক অবদান</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">প্রাক্তন কৃতি শিক্ষার্থীদের নাম ও বর্তমান অবস্থান</label>
                    <textarea
                      rows={2}
                      placeholder="কৃতি শিক্ষার্থীদের বিবরণ..."
                      value={websiteFormData.alumniInfo}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, alumniInfo: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">অত্র অঞ্চলে নিরক্ষরতা দূরীকরণ ও সামাজিক অবদান</label>
                    <textarea
                      rows={2}
                      placeholder="সামাজিক ও সাংস্কৃতিক পরিবর্তনের অবদান..."
                      value={websiteFormData.socialImpact}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, socialImpact: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মাদরাসার স্বর্ণোজ্জ্বল ইতিহাস</label>
                    <textarea
                      rows={2}
                      placeholder="ইতিহাস লিখুন..."
                      value={websiteFormData.gloriousHistory}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, gloriousHistory: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মাদরাসার বর্তমান অবস্থা ও আগামী পরিকল্পনা</label>
                    <textarea
                      rows={2}
                      placeholder="আগামী পরিকল্পনা..."
                      value={websiteFormData.futurePlan}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, futurePlan: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মাদরাসাটি কোন বোর্ডের অধীনে</label>
                    <input
                      type="text"
                      placeholder="যেমন: বেফাকুল মাদারিসিল আরাবিয়া"
                      value={websiteFormData.boardAffiliation}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, boardAffiliation: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মাদরাসার হিসাব ব্যবস্থা / ফান্ড</label>
                    <input
                      type="text"
                      placeholder="হিসাব ব্যবস্থা বা ফান্ডের বিবরণ"
                      value={websiteFormData.accountsFundInfo}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, accountsFundInfo: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Present Committee & Student Metrics */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <h3 className="text-sm font-black text-[#052E2B] border-b pb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span>৪. বর্তমান পরিচালনা পর্ষদ ও শিক্ষার্থী সংখ্যা</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">বর্তমান মুহতামিম / প্রধান শিক্ষক</label>
                    <input
                      type="text"
                      placeholder="নাম লিখুন"
                      value={websiteFormData.currentPrincipal}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, currentPrincipal: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">বর্তমান মুহতামিমের মোবাইল নম্বর</label>
                    <input
                      type="tel"
                      placeholder="+88017XXXXXXXX"
                      value={websiteFormData.currentPrincipalPhone}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, currentPrincipalPhone: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">বর্তমান শিক্ষাসচিব</label>
                    <input
                      type="text"
                      placeholder="নাম লিখুন"
                      value={websiteFormData.currentSecretary}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, currentSecretary: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">বর্তমান শিক্ষকবৃন্দের তালিকা</label>
                  <textarea
                    rows={2}
                    placeholder="বর্তমান সকল শিক্ষকদের তালিকা..."
                    value={websiteFormData.currentTeachersList}
                    onChange={(e) => setWebsiteFormData({ ...websiteFormData, currentTeachersList: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="pt-2">
                  <p className="font-bold text-slate-800 mb-2">চলমান ছাত্র সংখ্যা:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">মোট ছাত্র সংখ্যা</label>
                      <input
                        type="number"
                        placeholder="যেমন: ৮৫০"
                        value={websiteFormData.totalStudents}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, totalStudents: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">দাওরায়ে হাদীস / সমাপনী জামাত</label>
                      <input
                        type="text"
                        placeholder="যেমন: ১২০ জন"
                        value={websiteFormData.dawraStudents}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, dawraStudents: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">ছাত্রাবাসে অবস্থানরত ছাত্র</label>
                      <input
                        type="text"
                        placeholder="যেমন: ৪৫০ জন"
                        value={websiteFormData.hostelStudents}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, hostelStudents: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: SEO Configuration */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <h3 className="text-sm font-black text-[#052E2B] border-b pb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-600" />
                  <span>৫. SEO কাস্টমাইজেশন (Search Engine Optimization) 🔍</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">গুগল মেটা টাইটেল (SEO Title)</label>
                    <input
                      type="text"
                      placeholder="যেমন: জামিয়া ইসলামিয়া | আদর্শ দ্বীনি শিক্ষাপ্রতিষ্ঠান"
                      value={websiteFormData.seoTitle}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, seoTitle: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">কীওয়ার্ডস (SEO Keywords)</label>
                    <input
                      type="text"
                      placeholder="মাদরাসা, রেজাল্ট শিট, অনলাইন ভর্তি"
                      value={websiteFormData.seoKeywords}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, seoKeywords: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">গুগল মেটা ডেসক্রিপশন (SEO Description)</label>
                  <textarea
                    rows={2}
                    placeholder="গুগলে সার্চ করলে আপনার প্রতিষ্ঠান সম্পর্কে কী ডেসক্রিপশন দেখাবে..."
                    value={websiteFormData.seoDescription}
                    onChange={(e) => setWebsiteFormData({ ...websiteFormData, seoDescription: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* SECTION 6: Submitter Info */}
              <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200 space-y-4">
                <h3 className="text-sm font-black text-[#052E2B] border-b border-emerald-200 pb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>৬. তথ্য দানকারীর তথ্য</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">আপনার নাম <span className="text-red-500">★</span></label>
                    <input
                      type="text"
                      required
                      placeholder="আপনার নাম"
                      value={websiteFormData.submitterName}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, submitterName: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মোবাইল <span className="text-red-500">★</span></label>
                    <input
                      type="tel"
                      required
                      placeholder="01576600265"
                      value={websiteFormData.submitterPhone}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, submitterPhone: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ইমেইল</label>
                    <input
                      type="email"
                      placeholder="ইমেইল অ্যাড্রেস"
                      value={websiteFormData.submitterEmail}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, submitterEmail: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Status Message */}
              {websiteFormStatus.message && (
                <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${websiteFormStatus.success ? "bg-emerald-100 border border-emerald-300 text-emerald-800" : "bg-red-100 border border-red-300 text-red-800"}`}>
                  {websiteFormStatus.success ? <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />}
                  <span>{websiteFormStatus.message}</span>
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmittingWebsiteForm}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#052E2B] via-emerald-800 to-teal-900 text-white font-black text-sm shadow-xl hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingWebsiteForm ? (
                    <span>জমা নেওয়া হচ্ছে...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-[#D4AF37]" />
                      <span>ফরম সাবমিট করুন (এডমিন এপ্রুভালে লাইভ হবে)</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  বন্ধ করুন
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
