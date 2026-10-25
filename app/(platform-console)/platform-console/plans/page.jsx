"use client";

import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Check, X, Shield, Zap, Crown, Award, Plus,
  TrendingUp, Users, CheckCircle2,
  Sliders
} from "lucide-react";

const DEFAULT_PLANS = [
  {
    id: "free",
    name: "Free Starter Tier",
    badge: "Free Trial",
    priceMonthly: 0,
    priceYearly: 0,
    description: "প্রাথমিক বা ছোট মাদ্রাসার জন্য ট্রায়াল এবং মৌলিক একাডেমিক ম্যানেজমেন্ট।",
    icon: "Shield",
    color: "slate",
    maxStudents: 200,
    maxBranches: 1,
    storageGB: 2,
    monthlySms: 200,
    features: [
      { text: "২০০ জন শিক্ষার্থী নিবন্ধন", included: true },
      { text: "১টি কেন্দ্রীয় ক্যাম্পাস / ব্রাঞ্চ", included: true },
      { text: "বেসিক একাডেমিক ও ফি কালেকশন", included: true },
      { text: "ডিজিটাল আইডি কার্ড ও এডমিট কার্ড", included: true },
      { text: "বায়োমেট্রিক ডিভাইস ইন্টিগ্রেশন", included: false },
      { text: "কাস্টম ডোমেইন ও নিজস্ব ব্র্যান্ডিং", included: false },
      { text: "অটোমেটেড SMS নোটিফিকেশন ইঞ্জিন", included: false },
      { text: "২৪/৭ প্রায়োরিটি VIP সাপোর্ট", included: false },
    ],
    popular: false,
    activeSubscribers: 3,
  },
  {
    id: "standard",
    name: "Standard Academic Pro",
    badge: "Standard",
    priceMonthly: 2500,
    priceYearly: 24000,
    description: "মাঝারি সাইজের স্কুল ও কওমি/আলিয়া মাদ্রাসার সম্পূর্ণ অটোমেশন।",
    icon: "Zap",
    color: "blue",
    maxStudents: 1500,
    maxBranches: 3,
    storageGB: 15,
    monthlySms: 2500,
    features: [
      { text: "১,৫০০ জন শিক্ষার্থী ও স্টাফ", included: true },
      { text: "৩টি ব্রাঞ্চ / শাখা ব্যবস্থাপনা", included: true },
      { text: "পূর্ণাঙ্গ এক্সাম ও অটোমেটেড গ্রেডিং", included: true },
      { text: "বায়োমেট্রিক হাজিরা ও গেট নোটিশ", included: true },
      { text: "২,৫০০ ফ্রি মাসিক এসএমএস", included: true },
      { text: "অনলাইন ফি গেটওয়ে (bKash/Nagad)", included: true },
      { text: "কাস্টম ডোমেইন ও ফ্রি SSL", included: false },
      { text: "২৪/৭ ডেডিকেটেড ম্যানেজার সাপোর্ট", included: false },
    ],
    popular: false,
    activeSubscribers: 8,
  },
  {
    id: "premium",
    name: "Campus Business Suite",
    badge: "Most Popular",
    priceMonthly: 4999,
    priceYearly: 48000,
    description: "উন্নত শিক্ষা প্রতিষ্ঠান, একাধিক শাখা ও বড় মাদ্রাসার জন্য পূর্ণাঙ্গ সলিউশন।",
    icon: "Award",
    color: "teal",
    maxStudents: 5000,
    maxBranches: 10,
    storageGB: 50,
    monthlySms: 8000,
    features: [
      { text: "৫,০০০ জন শিক্ষার্থী ও আনলিমিটেড শিক্ষক", included: true },
      { text: "১০টি পর্যন্ত ব্রাঞ্চ সাপোর্ট", included: true },
      { text: "সকল প্রিমিয়াম থিম ও পেজ বিল্ডার", included: true },
      { text: "কাস্টম ডোমেইন ও অটোমেটিক Cloudflare SSL", included: true },
      { text: "৮,০০০ ফ্রি মাসিক এসএমএস বান্ডেল", included: true },
      { text: "ফি অটো-ইনভয়েস ও বিলম্ব ফি সিস্টেম", included: true },
      { text: "লাইভ জুম / গুগল মিট ক্লাস সাপোর্ট", included: true },
      { text: "প্রায়োরিটি ইমেইল ও হোয়াটসঅ্যাপ সাপোর্ট", included: true },
    ],
    popular: true,
    activeSubscribers: 14,
  },
  {
    id: "enterprise",
    name: "Enterprise Multi-Campus",
    badge: "Ultimate Power",
    priceMonthly: 9999,
    priceYearly: 96000,
    description: "বিভাগীয় চেইন স্কুল, ট্রাস্ট ও ৫০+ শাখা বিশিষ্ট বড় শিক্ষা নেটওয়ার্ক।",
    icon: "Crown",
    color: "amber",
    maxStudents: 99999,
    maxBranches: 100,
    storageGB: 500,
    monthlySms: 25000,
    features: [
      { text: "আনলিমিটেড শিক্ষার্থী ও ক্যাম্পাস নেটওয়ার্ক", included: true },
      { text: "১০০টি শাখা ও সেন্ট্রাল ড্যাশবোর্ড", included: true },
      { text: "কাস্টম হোয়াইট লেবেল পোর্টাল ও মোবাইল অ্যাপ", included: true },
      { text: "২৫,০০০ মাসিক এসএমএস ও কাস্টম সেন্ডার আইডি", included: true },
      { text: "ডেডিকেটেড ক্লাউড ডাটাবেজ ব্যাকআপ", included: true },
      { text: "সরাসরি ফোন ও অন-সাইট ট্রেইনিং সাপোর্ট", included: true },
      { text: "২৪/৭ ডেডিকেটেড প্ল্যাটফর্ম ইঞ্জিনিয়ার", included: true },
      { text: "কাস্টম SLA ও ৯৯.৯% আপটাইম গ্যারান্টি", included: true },
    ],
    popular: false,
    activeSubscribers: 4,
  },
];

export default function PlansManagementPage() {
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [billingCycle, setBillingCycle] = useState("monthly"); // monthly | yearly
  const [editingPlan, setEditingPlan] = useState(null);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Load persisted custom pricing/plans from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("edusaas_platform_plans");
      if (saved) {
        setPlans(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load local plans", e);
    }
  }, []);

  const savePlansToStorage = (updated) => {
    setPlans(updated);
    try {
      localStorage.setItem("edusaas_platform_plans", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save plans", e);
    }
    setToastMessage("প্ল্যান ও ক্যাপাসিটি সফলভাবে আপডেট করা হয়েছে!");
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleUpdatePlan = (e) => {
    e.preventDefault();
    if (!editingPlan) return;
    const updated = plans.map((p) => (p.id === editingPlan.id ? editingPlan : p));
    savePlansToStorage(updated);
    setEditingPlan(null);
  };

  const handleCreateCustom = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTier = {
      id: `custom_${Date.now()}`,
      name: formData.get("name") || "Custom Enterprise Plan",
      badge: "Custom Tier",
      priceMonthly: Number(formData.get("priceMonthly")) || 15000,
      priceYearly: Number(formData.get("priceMonthly")) * 10,
      description: formData.get("description") || "কাস্টম কমার্শিয়াল কন্ট্রাক্ট প্ল্যান",
      icon: "Crown",
      color: "violet",
      maxStudents: Number(formData.get("maxStudents")) || 20000,
      maxBranches: Number(formData.get("maxBranches")) || 50,
      storageGB: Number(formData.get("storageGB")) || 250,
      monthlySms: Number(formData.get("monthlySms")) || 20000,
      features: [
        { text: "কাস্টম শিক্ষার্থী ও শাখা লিমিটেশন", included: true },
        { text: "সম্পূর্ণ ডেডিকেটেড ক্লাউড ইনস্ট্যান্স", included: true },
        { text: "কাস্টম পেমেন্ট মেথড ও ইনভয়েস", included: true },
        { text: "ভিআইপি ২৪/৭ হটলাইন সাপোর্ট", included: true },
      ],
      popular: false,
      activeSubscribers: 1,
    };
    savePlansToStorage([...plans, newTier]);
    setIsCreatingCustom(false);
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case "Crown": return <Crown size={22} className="text-amber-500" />;
      case "Award": return <Award size={22} className="text-teal-500" />;
      case "Zap": return <Zap size={22} className="text-blue-500" />;
      default: return <Shield size={22} className="text-slate-500" />;
    }
  };

  // Calculations
  const totalSubscribers = plans.reduce((acc, p) => acc + (p.activeSubscribers || 0), 0);
  const totalMRR = plans.reduce((acc, p) => acc + (p.priceMonthly * (p.activeSubscribers || 0)), 0);
  const totalARR = totalMRR * 12;

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white border border-teal-500/40 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 size={18} className="text-teal-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Subscription Plans & Tiers</h1>
            <Badge className="bg-teal-100 text-teal-800 border-teal-200 text-xs font-bold">SaaS Master</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            প্রতিষ্ঠানসমূহের সাবস্ক্রিপশন প্যাকেজ, মাসিক ফি, শিক্ষার্থী কোটা ও ফিচার পারমিশন নিয়ন্ত্রণ করুন।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCreatingCustom(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-sm flex items-center gap-2"
          >
            <Plus size={16} />
            <span>নতুন কাস্টম প্ল্যান তৈরি করুন</span>
          </Button>
        </div>
      </div>

      {/* Revenue & Tier KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">মোট সক্রিয় টেন্যান্ট</span>
            <Users size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalSubscribers} টি</p>
          <p className="text-[11px] text-slate-400 mt-1">৪টি সক্রিয় প্ল্যানে মোট গ্রাহক</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">মাসিক রাজস্ব (MRR)</span>
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">৳{totalMRR.toLocaleString("en-US")}</p>
          <p className="text-[11px] text-slate-400 mt-1">চলতি মাসের প্রত্যাশিত আয়</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">বাৎসরিক রান-রেট (ARR)</span>
            <Crown size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">৳{totalARR.toLocaleString("en-US")}</p>
          <p className="text-[11px] text-slate-400 mt-1">বার্ষিক রাজস্ব সম্ভাবনা</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">সর্বোচ্চ বিক্রিত প্যাকেজ</span>
            <Award size={18} className="text-teal-600" />
          </div>
          <p className="text-base font-black text-teal-700 mt-2">Campus Business</p>
          <p className="text-[11px] text-slate-400 mt-1">১৪টি প্রতিষ্ঠান এই প্যাকেজে সক্রিয়</p>
        </div>
      </div>

      {/* Cycle Selector (Monthly vs Yearly) */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1 border border-slate-300/60 shadow-inner">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
              billingCycle === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            মাসিক বিলিং (Monthly)
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              billingCycle === "yearly"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>বার্ষিক বিলিং (Yearly)</span>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan) => {
          const isYearly = billingCycle === "yearly";
          const displayPrice = isYearly ? plan.priceYearly : plan.priceMonthly;

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl border transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-teal-600 shadow-lg ring-2 ring-teal-500/20 bg-gradient-to-b from-teal-50/20 to-white"
                  : "border-slate-200 shadow-sm bg-white"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-teal-600 hover:bg-teal-600 text-white text-[11px] font-black uppercase px-3 py-1 shadow-md tracking-wider">
                    ⭐ সর্বাধিক জনপ্রিয়
                  </Badge>
                </div>
              )}

              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
                    {getIcon(plan.icon)}
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold text-slate-600">
                    {plan.activeSubscribers} প্রতিষ্ঠান সক্রিয়
                  </Badge>
                </div>

                <CardTitle className="text-lg font-black text-slate-900">{plan.name}</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1 min-h-[34px] leading-relaxed">
                  {plan.description}
                </CardDescription>

                <div className="pt-4 pb-2 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      ৳{displayPrice.toLocaleString("en-US")}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      /{isYearly ? "বছর" : "মাস"}
                    </span>
                  </div>
                  {isYearly && plan.priceMonthly > 0 && (
                    <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                      (৳{Math.round(plan.priceYearly / 12).toLocaleString("en-US")} /মাস হিসেবে সাশ্রয়ী)
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-5 flex-1 flex flex-col justify-between">
                {/* Quota Highlights */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 font-medium">শিক্ষার্থী কোটা:</span>
                    <span className="font-bold">{plan.maxStudents > 50000 ? "আনলিমিটেড" : `${plan.maxStudents.toLocaleString("bn-BD")} জন`}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 font-medium">ব্রাঞ্চ বা ক্যাম্পাস:</span>
                    <span className="font-bold">{plan.maxBranches > 50 ? "আনলিমিটেড" : `${plan.maxBranches} টি`}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 font-medium">মাসিক ফ্রি SMS:</span>
                    <span className="font-bold">{plan.monthlySms.toLocaleString("bn-BD")} টি</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 font-medium">ক্লাউড স্টোরেজ:</span>
                    <span className="font-bold">{plan.storageGB} GB</span>
                  </div>
                </div>

                {/* Features list */}
                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">প্যাকেজের প্রধান সুবিধাসমূহ:</p>
                  <ul className="space-y-2 text-xs">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 leading-snug">
                        {f.included ? (
                          <Check size={14} className="text-teal-600 shrink-0 mt-0.5" />
                        ) : (
                          <X size={14} className="text-slate-300 shrink-0 mt-0.5" />
                        )}
                        <span className={f.included ? "text-slate-700 font-medium" : "text-slate-400 line-through text-[11px]"}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Edit Limits Trigger */}
                <div className="pt-2">
                  <Button
                    onClick={() => setEditingPlan(plan)}
                    variant="outline"
                    className="w-full text-xs font-bold rounded-xl border-slate-200 hover:bg-slate-100 flex items-center justify-center gap-1.5 h-9"
                  >
                    <Sliders size={13} className="text-slate-500" />
                    <span>প্যাকেজ রেট ও সীমা এডিট</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Capability Comparison Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-900">Tier Capability & Resource Matrix</h2>
          <p className="text-xs text-slate-500 mt-1">
            প্রতিটি প্ল্যানের বিস্তারিত রিসোর্স ও আর্কিটেকচারাল লিমিটেশন তুলনামূলক বিশ্লেষণ।
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="p-3.5 font-bold text-slate-900 rounded-l-xl">প্ল্যাটফর্ম ফিচার ও ক্ষমতা</th>
                {plans.map((p) => (
                  <th key={p.id} className="p-3.5 font-bold text-slate-900 text-center">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3.5 font-semibold text-slate-800">শিক্ষার্থী ডাটাবেজ ক্যাপাসিটি</td>
                {plans.map((p) => (
                  <td key={p.id} className="p-3.5 text-center font-mono font-bold text-slate-900">
                    {p.maxStudents > 50000 ? "আনলিমিটেড" : p.maxStudents.toLocaleString("bn-BD")}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-slate-800">শাখা ও ক্যাম্পাস বিস্তার</td>
                {plans.map((p) => (
                  <td key={p.id} className="p-3.5 text-center font-mono font-bold text-slate-900">
                    {p.maxBranches > 50 ? "আনলিমিটেড" : `${p.maxBranches} টি`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-slate-800">বায়োমেট্রিক ডিভাইস সংযোগ</td>
                {plans.map((p) => (
                  <td key={p.id} className="p-3.5 text-center">
                    {p.id === "free" ? (
                      <span className="text-slate-300 font-bold">—</span>
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-500 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-slate-800">কাস্টম ডোমেইন ও ফ্রি SSL</td>
                {plans.map((p) => (
                  <td key={p.id} className="p-3.5 text-center">
                    {p.id === "free" || p.id === "standard" ? (
                      <span className="text-slate-300 font-bold">—</span>
                    ) : (
                      <CheckCircle2 size={16} className="text-teal-600 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-slate-800">পেমেন্ট গেটওয়ে (bKash, Nagad)</td>
                {plans.map((p) => (
                  <td key={p.id} className="p-3.5 text-center">
                    {p.id === "free" ? (
                      <span className="text-slate-300 font-bold">—</span>
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-500 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-slate-800">সাপোর্ট চ্যানেল</td>
                <td className="p-3.5 text-center text-slate-500">ইমেইল অনলি</td>
                <td className="p-3.5 text-center text-slate-700 font-medium">টিকিট + চ্যাট</td>
                <td className="p-3.5 text-center text-teal-700 font-bold">হোয়াটসঅ্যাপ প্রায়োরিটি</td>
                <td className="p-3.5 text-center text-amber-700 font-black">২৪/৭ ডেডিকেটেড ফোন</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Plan Limits Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">প্ল্যান ক্যাপাসিটি ও প্রাইসিং আপডেট</h3>
                <p className="text-xs text-slate-400">{editingPlan.name}</p>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-600 font-bold">মাসিক ফি (টাকা)</Label>
                  <Input
                    type="number"
                    value={editingPlan.priceMonthly}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceMonthly: Number(e.target.value) })}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 font-bold">বার্ষিক ফি (টাকা)</Label>
                  <Input
                    type="number"
                    value={editingPlan.priceYearly}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceYearly: Number(e.target.value) })}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-600 font-bold">সর্বোচ্চ শিক্ষার্থী সংখ্যা</Label>
                  <Input
                    type="number"
                    value={editingPlan.maxStudents}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxStudents: Number(e.target.value) })}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 font-bold">সর্বোচ্চ ব্রাঞ্চ / শাখা</Label>
                  <Input
                    type="number"
                    value={editingPlan.maxBranches}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxBranches: Number(e.target.value) })}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-600 font-bold">মাসিক ফ্রি SMS কোটা</Label>
                  <Input
                    type="number"
                    value={editingPlan.monthlySms}
                    onChange={(e) => setEditingPlan({ ...editingPlan, monthlySms: Number(e.target.value) })}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 font-bold">ক্লাউড স্টোরেজ (GB)</Label>
                  <Input
                    type="number"
                    value={editingPlan.storageGB}
                    onChange={(e) => setEditingPlan({ ...editingPlan, storageGB: Number(e.target.value) })}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-600 font-bold">প্ল্যানের বিবরণ / সাবটাইটেল</Label>
                <Input
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingPlan(null)}
                  className="rounded-xl"
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                >
                  পরিবর্তন সংরক্ষণ করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Custom Tier Modal */}
      {isCreatingCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">নতুন বিশেষায়িত এন্টারপ্রাইজ প্ল্যান</h3>
                <p className="text-xs text-slate-400">নির্দিষ্ট বড় প্রতিষ্ঠান বা চেইনের জন্য কাস্টম চুক্তি</p>
              </div>
              <button
                onClick={() => setIsCreatingCustom(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-slate-600 font-bold">প্ল্যানের নাম (Tier Title)</Label>
                <Input name="name" required placeholder="যেমন: Cadet College Network Package" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-600 font-bold">মাসিক চুক্তির ফি (টাকা)</Label>
                <Input name="priceMonthly" type="number" required placeholder="15000" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-600 font-bold">শিক্ষার্থী ক্যাপাসিটি</Label>
                  <Input name="maxStudents" type="number" defaultValue="25000" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 font-bold">শাখা সংখ্যা</Label>
                  <Input name="maxBranches" type="number" defaultValue="50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-600 font-bold">মাসিক SMS কোটা</Label>
                  <Input name="monthlySms" type="number" defaultValue="20000" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 font-bold">ক্লাউড স্টোরেজ (GB)</Label>
                  <Input name="storageGB" type="number" defaultValue="200" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-600 font-bold">সংক্ষিপ্ত বিবরণ</Label>
                <Input name="description" placeholder="মাল্টি-ক্যাম্পাস ও কাস্টম ডেডিকেটেড সাপোর্ট চুক্তি" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreatingCustom(false)}
                  className="rounded-xl"
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                >
                  কাস্টম প্ল্যান যুক্ত করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
