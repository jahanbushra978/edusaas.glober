"use client";

import React, { useState } from "react";
import {
  X,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export function CustomDomainModal({
  onClose,
  mosqueName = "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
  currentSlug = "baitun-noor",
}) {
  const [domain, setDomain] = useState("baitunnoormasjid.org");
  const [inputDomain, setInputDomain] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [domainStatus, setDomainStatus] = useState("ACTIVE"); // "ACTIVE" | "PENDING_DNS" | "NOT_CONFIGURED"

  const defaultPlatformUrl = `https://platform-domain.com/masjid/${currentSlug}`;

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    toast.success(`"${text}" কপি করা হয়েছে`);
  };

  const handleVerifyDns = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setDomainStatus("ACTIVE");
      toast.success("DNS ভেরিফিকেশন সফল! SSL সার্টিফিকেট সক্রিয় রয়েছে।");
    }, 1200);
  };

  const handleConnectNewDomain = (e) => {
    e.preventDefault();
    if (!inputDomain.trim()) return;
    const clean = inputDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    setDomain(clean);
    setDomainStatus("PENDING_DNS");
    setInputDomain("");
    toast.info(`ডোমেন "${clean}" যুক্ত করা হয়েছে। নিচের CNAME রেকর্ড সেট করে ভেরিফাই করুন।`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-900 to-[#07251c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl">
              🌐
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                কাস্টম ডোমেইন সংযোগ (Custom Domain)
              </h2>
              <p className="text-xs text-emerald-100">
                {mosqueName} · আপনার নিজস্ব ডোমেইন দিয়ে ব্র্যান্ডিং ওয়েবসাইট
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

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Method A: Default Platform URL */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-950/60 space-y-1.5">
            <span className="text-stone-500 font-bold">পদ্ধতি ১: ফ্রি ডিফল্ট SaaS প্ল্যাটফর্ম URL:</span>
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/50">
              <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold truncate">
                {defaultPlatformUrl}
              </span>
              <button
                onClick={() => handleCopy(defaultPlatformUrl)}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Copy className="w-3 h-3" />
                <span>কপি</span>
              </button>
            </div>
          </div>

          {/* Method B: Custom Domain */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#0f1d17] border border-emerald-300 dark:border-emerald-800/80 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-sm">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>পদ্ধতি ২: সংযুক্ত কাস্টম ডোমেইন:</span>
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  domainStatus === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {domainStatus === "ACTIVE" ? "সক্রিয় ও ভেরিফাইড" : "DNS অপেক্ষমাণ"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
              <div>
                <a
                  href={`https://${domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-black text-emerald-800 dark:text-emerald-300 font-mono flex items-center gap-1 hover:underline"
                >
                  <span>https://{domain}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  SSL সার্টিফিকেট: <b>Let's Encrypt সক্রিয় (HTTPS সুরক্ষিত)</b>
                </p>
              </div>

              <button
                onClick={handleVerifyDns}
                disabled={isVerifying}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
                <span>পুনরায় যাচাই</span>
              </button>
            </div>

            {/* DNS Instructions */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-emerald-950/60">
              <b className="text-stone-800 dark:text-stone-200">DNS কনফিগারেশন নির্দেশিকা:</b>
              <p className="text-stone-500 text-[11px]">
                আপনার ডোমেইন প্রোভাইডারের (Namecheap, GoDaddy, ইত্যাদি) DNS সেটিংসে গিয়ে নিচের CNAME রেকর্ডটি যুক্ত করুন:
              </p>

              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/60 font-mono text-[11px]">
                <div>
                  <span className="text-[10px] text-stone-400 block">Type</span>
                  <b>CNAME</b>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Host</span>
                  <b>@ / www</b>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Points to</span>
                  <b>cname.edusaas.live</b>
                </div>
              </div>
            </div>

            {/* Connect another domain form */}
            <form onSubmit={handleConnectNewDomain} className="space-y-2 pt-2 border-t border-stone-100 dark:border-emerald-950/60">
              <label className="block font-bold text-stone-700 dark:text-stone-300">
                নতুন কাস্টম ডোমেইন পরিবর্তন করুন:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="যেমন: mymosque.org"
                  value={inputDomain}
                  onChange={(e) => setInputDomain(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-stone-300 dark:border-emerald-700 bg-stone-50 dark:bg-[#07130e] text-stone-900 dark:text-stone-100 font-mono"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  সংযুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
