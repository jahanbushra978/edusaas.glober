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
  ShieldCheck, ShieldAlert, Lock, Key, Globe, Plus, Trash2, CheckCircle2,
  Laptop, Smartphone, Ban, Sliders
} from "lucide-react";

const DEFAULT_FIREWALL_RULES = [
  {
    id: "fw_01",
    ip: "185.220.101.5",
    type: "block",
    reason: "ব্রুটফোর্স লগইন অ্যাটাক চেষ্টা (Failed admin attempts)",
    geo: "Russia (Tor Exit)",
    createdAt: "2026-10-02 18:22",
  },
  {
    id: "fw_02",
    ip: "103.145.118.22",
    type: "allow",
    reason: "হেড অফিস স্ট্যাটিক আইপি (Authorized Platform Owner)",
    geo: "Dhaka, Bangladesh",
    createdAt: "2026-09-15 10:00",
  },
  {
    id: "fw_03",
    ip: "45.154.255.89",
    type: "block",
    reason: "অস্বাভাবিক API ক্রলিং ও স্প্যাম রিকোয়েস্ট",
    geo: "Netherlands",
    createdAt: "2026-10-01 04:12",
  },
];

const DEFAULT_SESSIONS = [
  {
    id: "sess_curr",
    device: "Windows 11 PC",
    browser: "Google Chrome 128",
    ip: "103.145.118.22",
    location: "Dhaka, Bangladesh",
    lastActive: "এখনই সক্রিয় (বর্তমান সেশন)",
    isCurrent: true,
  },
  {
    id: "sess_02",
    device: "Samsung Galaxy S24 Ultra",
    browser: "Mobile Chrome",
    ip: "103.145.118.88",
    location: "Gazipur, Bangladesh",
    lastActive: "২ ঘন্টা আগে",
    isCurrent: false,
  },
];

export default function SecurityManagementPage() {
  const [firewallRules, setFirewallRules] = useState(DEFAULT_FIREWALL_RULES);
  const [sessions, setSessions] = useState(DEFAULT_SESSIONS);
  const [toastMessage, setToastMessage] = useState("");
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);

  // Security Toggles
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [bruteForceGuard, setBruteForceGuard] = useState(true);
  const [turnstileBotDefense, setTurnstileBotDefense] = useState(true);
  const [sqlSanitization, setSqlSanitization] = useState(true);
  const [rlsEnforced, setRlsEnforced] = useState(true);

  // Load from storage
  useEffect(() => {
    try {
      const savedFw = localStorage.getItem("edusaas_security_firewall");
      if (savedFw) setFirewallRules(JSON.parse(savedFw));
      const savedConfig = localStorage.getItem("edusaas_security_config");
      if (savedConfig) {
        const c = JSON.parse(savedConfig);
        setTwoFactorEnforced(c.twoFactorEnforced ?? true);
        setSessionTimeout(c.sessionTimeout ?? "60");
        setBruteForceGuard(c.bruteForceGuard ?? true);
        setTurnstileBotDefense(c.turnstileBotDefense ?? true);
      }
    } catch (e) {
      console.warn("Could not load security state", e);
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const saveFirewall = (rules) => {
    setFirewallRules(rules);
    try {
      localStorage.setItem("edusaas_security_firewall", JSON.stringify(rules));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const ip = (formData.get("ip") || "").trim();
    const type = formData.get("type") || "block";
    const reason = formData.get("reason") || "Manual security rule";

    if (!ip) return;

    const newRule = {
      id: `fw_${Date.now()}`,
      ip,
      type,
      reason,
      geo: "Custom Added",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    saveFirewall([newRule, ...firewallRules]);
    setIsAddRuleOpen(false);
    showToast(`ফায়ারওয়াল রুল যোগ করা হয়েছে: ${ip} (${type.toUpperCase()})`);
  };

  const handleDeleteRule = (id) => {
    const updated = firewallRules.filter((r) => r.id !== id);
    saveFirewall(updated);
    showToast("ফায়ারওয়াল রুলটি মুছে ফেলা হয়েছে।");
  };

  const handleTerminateOtherSessions = () => {
    setSessions(sessions.filter((s) => s.isCurrent));
    showToast("✅ অন্যান্য সকল ডিভাইসের সক্রিয় সেশন সফলভাবে লগআউট করা হয়েছে!");
  };

  const handleSavePolicies = () => {
    const config = {
      twoFactorEnforced,
      sessionTimeout,
      bruteForceGuard,
      turnstileBotDefense,
    };
    try {
      localStorage.setItem("edusaas_security_config", JSON.stringify(config));
    } catch (e) {
      console.warn(e);
    }
    showToast("✅ প্ল্যাটফর্ম সিকিউরিটি পলিসি সফলভাবে সংরক্ষিত হয়েছে!");
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Security & Firewall</h1>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-bold">Hardened Protection</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আইপি ব্লকলিস্ট, ব্রুট-ফোর্স প্রোটেকশন, Row-Level Security (RLS) ও সেশন একসেস কন্ট্রোল।
          </p>
        </div>

        <Button
          onClick={handleSavePolicies}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-sm flex items-center gap-2"
        >
          <Lock size={15} />
          <span>পলিসি সংরক্ষণ করুন</span>
        </Button>
      </div>

      {/* Security Health Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">সিকিউরিটি ইনডেক্স</span>
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">99.8%</p>
          <p className="text-[11px] text-slate-400 mt-1">জিরো-ট্রাস্ট সিকিউরিটি সক্রিয়</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">অবরুদ্ধ থ্রেট (24 ঘন্টা)</span>
            <Ban size={18} className="text-red-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">৩১২ টি</p>
          <p className="text-[11px] text-slate-400 mt-1">স্বয়ংক্রিয়ভাবে ব্লক করা হয়েছে</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ডাটাবেজ আইসোলেশন (RLS)</span>
            <Lock size={18} className="text-teal-600" />
          </div>
          <p className="text-base font-black text-teal-700 mt-2">২৪টি টেবিলে সক্রিয়</p>
          <p className="text-[11px] text-slate-400 mt-1">এক স্কুলের ডাটা অন্য স্কুলে অপ্রবেশ্য</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">এইচএমএসি টোকেন ভ্যালিডেশন</span>
            <Key size={18} className="text-blue-600" />
          </div>
          <p className="text-base font-black text-blue-700 mt-2">Cryptographic Signed</p>
          <p className="text-[11px] text-slate-400 mt-1">HttpOnly + SameSite গার্ড</p>
        </div>
      </div>

      {/* Security Policies Controls */}
      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardHeader className="p-6 pb-4 border-b border-slate-100">
          <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
            <Sliders size={18} className="text-teal-600" />
            <span>সেন্ট্রাল সিকিউরিটি পলিসি ও গার্ডস</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            প্ল্যাটফর্ম ও সকল শিক্ষা প্রতিষ্ঠানের জন্য প্রযোজ্য নিরাপত্তা নিয়মাবলী
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 divide-y divide-slate-100 text-xs">
          {/* Policy 1: 2FA */}
          <div className="py-4 flex items-center justify-between first:pt-0">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Key size={14} className="text-amber-500" />
                <span>সুপার অ্যাডমিনদের জন্য 2-ফ্যাক্টর অথেনটিকেশন (2FA) বাধ্যতামূলক</span>
              </p>
              <p className="text-slate-500">প্ল্যাটফর্ম ওনার ও প্রতিষ্ঠানের প্রধান অ্যাডমিনদের লগইনে OTP/2FA যাচাই হবে।</p>
            </div>
            <input
              type="checkbox"
              checked={twoFactorEnforced}
              onChange={(e) => setTwoFactorEnforced(e.target.checked)}
              className="h-5 w-5 rounded text-teal-600 cursor-pointer"
            />
          </div>

          {/* Policy 2: Inactivity Timeout */}
          <div className="py-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Lock size={14} className="text-blue-500" />
                <span>নিষ্ক্রিয় সেশন অটো-লগআউট টাইমআউট (Auto Logout)</span>
              </p>
              <p className="text-slate-500">অ্যাডমিন কম্পিউটার রেখে চলে গেলে নির্দিষ্ট সময় পর সেশন স্বয়ংক্রিয়ভাবে বন্ধ হবে।</p>
            </div>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-800 font-bold outline-none"
            >
              <option value="15">১৫ মিনিট</option>
              <option value="30">৩০ মিনিট</option>
              <option value="60">১ ঘন্টা (প্রস্তাবিত)</option>
              <option value="240">৪ ঘন্টা</option>
            </select>
          </div>

          {/* Policy 3: Brute Force Guard */}
          <div className="py-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-red-500" />
                <span>ব্রুট-ফোর্স লকআউট প্রোটেকশন (Brute-Force Guard)</span>
              </p>
              <p className="text-slate-500">পরপর ৫ বার ভুল পাসওয়ার্ড দিলে সংশ্লিষ্ট আইপি ১৫ মিনিটের জন্য স্বয়ংক্রিয়ভাবে ব্লক হবে।</p>
            </div>
            <input
              type="checkbox"
              checked={bruteForceGuard}
              onChange={(e) => setBruteForceGuard(e.target.checked)}
              className="h-5 w-5 rounded text-teal-600 cursor-pointer"
            />
          </div>

          {/* Policy 4: Turnstile Bot Defense */}
          <div className="py-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Globe size={14} className="text-teal-600" />
                <span>ক্লাউডফ্লেয়ার টার্নস্টাইল / বট শিল্ড</span>
              </p>
              <p className="text-slate-500">অনলাইন ভর্তি ও পাবলিক ফর্মগুলোতে অদৃশ্য ক্যাপচা দিয়ে বট রোধ করা হবে।</p>
            </div>
            <input
              type="checkbox"
              checked={turnstileBotDefense}
              onChange={(e) => setTurnstileBotDefense(e.target.checked)}
              className="h-5 w-5 rounded text-teal-600 cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {/* IP Firewall Access Rules */}
      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-black text-slate-900">আইপি অ্যাকসেস কন্ট্রোল ও ফায়ারওয়াল রুলস</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              নির্দিষ্ট ক্ষতিকারক আইপি ব্লক করুন অথবা নিরাপদ অফিসের আইপি হোয়াইটলিস্ট করুন
            </CardDescription>
          </div>

          <Button
            onClick={() => setIsAddRuleOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-2"
          >
            <Plus size={14} />
            <span>নতুন আইপি রুল যোগ করুন</span>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">আইপি অ্যাড্রেস</th>
                  <th className="p-4">রুল টাইপ</th>
                  <th className="p-4">কারণ ও বিবরণ</th>
                  <th className="p-4">অবস্থান (Geo)</th>
                  <th className="p-4">তারিখ</th>
                  <th className="p-4 text-right">মুছুন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {firewallRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {rule.ip}
                    </td>
                    <td className="p-4">
                      {rule.type === "block" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                          <Ban size={10} /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={10} /> Whitelisted
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-700 font-medium max-w-xs truncate">
                      {rule.reason}
                    </td>
                    <td className="p-4 text-slate-500">
                      {rule.geo}
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {rule.createdAt}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        onClick={() => handleDeleteRule(rule.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Active Administrative Sessions */}
      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-black text-slate-900">সক্রিয় অ্যাডমিন সেশনসমূহ</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              প্ল্যাটফর্ম ওনার একাউন্টে বর্তমানে লগইন থাকা ডিভাইসসমূহ
            </CardDescription>
          </div>

          <Button
            onClick={handleTerminateOtherSessions}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 font-bold text-xs h-9 px-4 rounded-xl"
          >
            অন্যান্য সব সেশন বন্ধ করুন
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-3">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                sess.isCurrent ? "bg-teal-50/40 border-teal-200" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  {sess.device.includes("PC") ? <Laptop size={20} /> : <Smartphone size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{sess.device}</span>
                    {sess.isCurrent && (
                      <Badge className="bg-teal-600 text-white text-[10px] font-bold">বর্তমান ডিভাইস</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {sess.browser} · IP: {sess.ip} · {sess.location}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-medium text-slate-500">{sess.lastActive}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add Rule Modal */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">নতুন আইপি ফায়ারওয়াল রুল</h3>
              <p className="text-xs text-slate-400">আইপি ব্লক বা অনুমোদিত তালিকায় যুক্ত করুন</p>
            </div>

            <form onSubmit={handleAddRule} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold">আইপি অ্যাড্রেস (IP Address)</Label>
                <Input name="ip" required placeholder="যেমন: 103.145.118.25" className="font-mono" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold">রুল টাইপ</Label>
                <select
                  name="type"
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-bold"
                >
                  <option value="block">🚫 Block (প্রবেশ বন্ধ করুন)</option>
                  <option value="allow">✅ Allow (হোয়াইটলিস্ট অনুমোদন)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold">কারণ বা বিবরণ</Label>
                <Input name="reason" required placeholder="যেমন: ক্ষতিকারক রিকোয়েস্ট চেষ্টা" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddRuleOpen(false)}
                  className="rounded-xl"
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                >
                  রুল যুক্ত করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
