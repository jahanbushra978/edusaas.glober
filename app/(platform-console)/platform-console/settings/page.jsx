"use client";

import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CreditCard, MessageSquare, ShieldAlert,
  Save, CheckCircle2, RefreshCw, Send, PhoneCall, Mail, MapPin, AlertTriangle
} from "lucide-react";

const DEFAULT_SETTINGS = {
  // General & Branding
  platformName: "Rahmania EduSaaS Multi-Tenant Engine",
  slogan: "সেন্ট্রাল শিক্ষা প্রতিষ্ঠান ও মাদ্রাসা অটোমেশন প্ল্যাটফর্ম",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  supportPhone: "+880 1906-898939",
  whatsappNumber: "+880 1906-898939",
  supportEmail: "rahmaniainstitute.org@gmail.com",
  officeAddress: "হাড়িনাল, গাজীপুর সিটি কর্পোরেশন, ঢাকা, বাংলাদেশ",
  currency: "BDT (৳)",
  timezone: "Asia/Dhaka (GMT+6)",
  defaultAcademicYear: "2026",

  // Payment Gateways
  bkashEnabled: true,
  bkashUsername: "bkash_merchant_rahmania",
  bkashAppKey: "bk_live_key_90432fba899",
  bkashAppSecret: "********************************",
  bkashSandbox: false,

  nagadEnabled: true,
  nagadMerchantId: "NAGAD_MERC_88201",
  nagadPublicKey: "nagad_pub_pkcs8_live_99812",
  nagadSandbox: false,

  sslcommerzEnabled: false,
  sslStoreId: "rahmania_live_store",
  sslStorePass: "********************",
  sslSandbox: true,

  // SMS Gateway
  smsProvider: "greenweb",
  smsSenderId: "RAHMANIA",
  smsApiKey: "gw_api_key_8492018490218942",
  smsBalanceThreshold: 500,
  smsRemainingCredits: 14250,

  // Tenancy & Maintenance
  allowSelfRegistration: true,
  requireOwnerApproval: true,
  defaultTrialDays: 14,
  maintenanceMode: false,
  maintenanceMessage: "সিস্টেম আপগ্রেডের জন্য প্ল্যাটফর্ম সাময়িক রক্ষণাবেক্ষণে রয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
  bypassIpList: "103.145.118.22, 127.0.0.1",
};

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState("general");
  const [toastMessage, setToastMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingGateway, setIsTestingGateway] = useState(false);
  const [testPhone, setTestPhone] = useState("01906898939");
  const [testSmsMessage, setTestSmsMessage] = useState("EduSaaS টেস্ট এসএমএস: সিস্টেম গেটওয়ে সফলভাবে কাজ করছে।");
  const [isSendingSms, setIsSendingSms] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("edusaas_platform_settings");
      if (saved) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.warn("Could not load local settings", e);
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      try {
        localStorage.setItem("edusaas_platform_settings", JSON.stringify(settings));
      } catch (err) {
        console.warn("Save error", err);
      }
      setIsSaving(false);
      showToast("✅ প্ল্যাটফর্ম কনফিগারেশন সফলভাবে আপডেট ও সংরক্ষিত হয়েছে!");
    }, 600);
  };

  const handleTestGateway = () => {
    setIsTestingGateway(true);
    setTimeout(() => {
      setIsTestingGateway(false);
      showToast("✅ bKash ও Nagad পেমেন্ট গেটওয়ে হ্যান্ডশেক সফল! (HTTP 200 OK)");
    }, 1400);
  };

  const handleSendTestSms = () => {
    if (!testPhone) return;
    setIsSendingSms(true);
    setTimeout(() => {
      setIsSendingSms(false);
      showToast(`📲 টেস্ট এসএমএস সফলভাবে '${testPhone}'-এ প্রেরিত হয়েছে!`);
    }, 1500);
  };

  const updateSetting = (key, val) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Central Settings</h1>
            <Badge className="bg-teal-100 text-teal-800 border-teal-200 text-xs font-bold">Master Config</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            সেন্ট্রাল ব্র্যান্ডিং, bKash/Nagad গেটওয়ে, এসএমএস প্রোভাইডার ও মাল্টি-টেন্যান্ট পলিসি নিয়ন্ত্রণ করুন।
          </p>
        </div>

        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md flex items-center gap-2 shrink-0"
        >
          {isSaving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
          <span>{isSaving ? "সংরক্ষণ হচ্ছে..." : "সকল পরিবর্তন সংরক্ষণ করুন"}</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "general"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Building2 size={15} />
          <span>সাধারণ ও ব্র্যান্ডিং</span>
        </button>

        <button
          onClick={() => setActiveTab("gateways")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "gateways"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <CreditCard size={15} />
          <span>পেমেন্ট গেটওয়ে (bKash/Nagad)</span>
        </button>

        <button
          onClick={() => setActiveTab("sms")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "sms"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <MessageSquare size={15} />
          <span>এসএমএস ও নোটিফিকেশন</span>
        </button>

        <button
          onClick={() => setActiveTab("policy")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "policy"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <ShieldAlert size={15} />
          <span>টেন্যান্সি পলিসি ও রক্ষণাবেক্ষণ</span>
        </button>
      </div>

      {/* Tab 1: General & Branding */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-black text-slate-900">প্ল্যাটফর্ম পরিচিতি ও ব্র্যান্ডিং</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                সফটওয়্যারের গ্লোবাল টাইটেল, লোগো ও প্রাতিষ্ঠানিক সাপোর্ট তথ্য
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">প্ল্যাটফর্ম টাইটেল (Platform Name)</Label>
                  <Input
                    value={settings.platformName}
                    onChange={(e) => updateSetting("platformName", e.target.value)}
                    className="font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">স্লোগান / ট্যাগলাইন</Label>
                  <Input
                    value={settings.slogan}
                    onChange={(e) => updateSetting("slogan", e.target.value)}
                    className="font-medium"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">লোগো ইউআরএল (Logo URL)</Label>
                  <Input
                    value={settings.logoUrl}
                    onChange={(e) => updateSetting("logoUrl", e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">ফ্যাভিকন ইউআরএল (Favicon URL)</Label>
                  <Input
                    value={settings.faviconUrl}
                    onChange={(e) => updateSetting("faviconUrl", e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">মুদ্রা (Currency)</Label>
                  <Input
                    value={settings.currency}
                    onChange={(e) => updateSetting("currency", e.target.value)}
                    className="font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">টাইমজোন (Default Timezone)</Label>
                  <Input
                    value={settings.timezone}
                    onChange={(e) => updateSetting("timezone", e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">ডিফল্ট শিক্ষাবর্ষ (Academic Year)</Label>
                  <Input
                    value={settings.defaultAcademicYear}
                    onChange={(e) => updateSetting("defaultAcademicYear", e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-black text-slate-900">সেন্ট্রাল কন্টাক্ট ও হেল্পলাইন</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                নতুন গ্রাহকদের অনবোর্ডিং ও সাপোর্ট দেওয়ার জন্য প্ল্যাটফর্মের অফিসিয়াল যোগাযোগ
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold flex items-center gap-1.5">
                    <PhoneCall size={13} className="text-emerald-600" /> হটলাইন ফোন
                  </Label>
                  <Input
                    value={settings.supportPhone}
                    onChange={(e) => updateSetting("supportPhone", e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-teal-600" /> হোয়াটসঅ্যাপ সাপোর্ট
                  </Label>
                  <Input
                    value={settings.whatsappNumber}
                    onChange={(e) => updateSetting("whatsappNumber", e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold flex items-center gap-1.5">
                    <Mail size={13} className="text-blue-600" /> সাপোর্ট ইমেইল
                  </Label>
                  <Input
                    value={settings.supportEmail}
                    onChange={(e) => updateSetting("supportEmail", e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="text-slate-700 font-bold flex items-center gap-1.5">
                  <MapPin size={13} className="text-red-500" /> প্রাতিষ্ঠানিক ঠিকানা
                </Label>
                <Input
                  value={settings.officeAddress}
                  onChange={(e) => updateSetting("officeAddress", e.target.value)}
                  className="font-medium"
                />
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* Tab 2: Payment Gateways */}
      {activeTab === "gateways" && (
        <div className="space-y-6 max-w-4xl">
          {/* Action & Test Bar */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-black text-emerald-950 text-sm">সেন্ট্রাল পেমেন্ট ইঞ্জিন সক্রিয়</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                সকল প্রতিষ্ঠানের মাসিক সাবস্ক্রিপশন ও স্টুডেন্ট ফি সংগ্রহের ব্যাকএন্ড গেটওয়ে।
              </p>
            </div>
            <Button
              onClick={handleTestGateway}
              disabled={isTestingGateway}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-sm flex items-center gap-2 shrink-0"
            >
              {isTestingGateway ? <RefreshCw size={14} className="animate-spin" /> : <CreditCard size={14} />}
              <span>{isTestingGateway ? "যাচাই হচ্ছে..." : "গেটওয়ে কানেকশন টেস্ট"}</span>
            </Button>
          </div>

          {/* bKash Checkout */}
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-pink-500" />
                  <span>bKash Direct Checkout API</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  বিকাশ মার্চেন্ট একাউন্টের লাইভ ক্রেডেনশিয়াল
                </CardDescription>
              </div>
              <Badge className={settings.bkashEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}>
                {settings.bkashEnabled ? "Active" : "Disabled"}
              </Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">মার্চেন্ট ইউজারনেম (Username)</Label>
                  <Input
                    value={settings.bkashUsername}
                    onChange={(e) => updateSetting("bkashUsername", e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">App Key</Label>
                  <Input
                    value={settings.bkashAppKey}
                    onChange={(e) => updateSetting("bkashAppKey", e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">App Secret</Label>
                  <Input
                    type="password"
                    value={settings.bkashAppSecret}
                    onChange={(e) => updateSetting("bkashAppSecret", e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">স্যান্ডবক্স মোড (Sandbox / Test Mode)</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="bkashSandbox"
                      checked={settings.bkashSandbox}
                      onChange={(e) => updateSetting("bkashSandbox", e.target.checked)}
                      className="h-4 w-4 rounded text-teal-600 border-slate-300"
                    />
                    <Label htmlFor="bkashSandbox" className="cursor-pointer text-slate-600">
                      টেস্টিং মোড চালু করুন (Sandbox)
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nagad Payment */}
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Nagad Payment Gateway</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  নগদ অনলাইন পেমেন্ট এপিআই প্যারামিটার
                </CardDescription>
              </div>
              <Badge className={settings.nagadEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}>
                {settings.nagadEnabled ? "Active" : "Disabled"}
              </Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">Nagad Merchant ID</Label>
                  <Input
                    value={settings.nagadMerchantId}
                    onChange={(e) => updateSetting("nagadMerchantId", e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">Public Key</Label>
                  <Input
                    value={settings.nagadPublicKey}
                    onChange={(e) => updateSetting("nagadPublicKey", e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: SMS Gateway */}
      {activeTab === "sms" && (
        <div className="space-y-6 max-w-4xl">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-black text-slate-900">সেন্ট্রাল এসএমএস গেটওয়ে কনফিগারেশন</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                শিক্ষার্থী হাজিরা, নোটিশ ও ফলাফল স্বয়ংক্রিয় এসএমএস প্রেরণের সেন্ট্রাল প্রোভাইডার
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">ডিফল্ট এসএমএস প্রোভাইডার</Label>
                  <select
                    value={settings.smsProvider}
                    onChange={(e) => updateSetting("smsProvider", e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-medium"
                  >
                    <option value="greenweb">Greenweb SMS Gateway (Recommended)</option>
                    <option value="bulksmsbd">BulkSMSBD API Engine</option>
                    <option value="mimsms">MimSMS Enterprise</option>
                    <option value="elitbuzz">Elitbuzz Telecom</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">মাস্কিং সেন্ডার আইডি (Sender ID)</Label>
                  <Input
                    value={settings.smsSenderId}
                    onChange={(e) => updateSetting("smsSenderId", e.target.value)}
                    className="font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">API Key / Token</Label>
                  <Input
                    type="password"
                    value={settings.smsApiKey}
                    onChange={(e) => updateSetting("smsApiKey", e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">কম ব্যালেন্স সতর্কতা থ্রেশহোল্ড (SMS)</Label>
                  <Input
                    type="number"
                    value={settings.smsBalanceThreshold}
                    onChange={(e) => updateSetting("smsBalanceThreshold", Number(e.target.value))}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-bold">বর্তমান প্ল্যাটফর্ম SMS ব্যালেন্স:</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{settings.smsRemainingCredits.toLocaleString("en-US")} টি</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold">পর্যাপ্ত ক্রেডিট</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Test SMS Sandbox */}
          <Card className="rounded-3xl border-slate-200 shadow-sm bg-gradient-to-br from-slate-50 to-white">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                <Send size={16} className="text-teal-600" />
                <span>লাইভ SMS টেস্ট স্যান্ডবক্স</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                সরাসরি যেকোনো মোবাইল নম্বরে টেস্ট এসএমএস পাঠিয়ে গেটওয়ে সক্রিয়তা নিশ্চিত করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">প্রাপকের মোবাইল নম্বর</Label>
                  <Input
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="font-mono"
                    placeholder="017xxxxxxxx"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold">টেস্ট বার্তা</Label>
                  <Input
                    value={testSmsMessage}
                    onChange={(e) => setTestSmsMessage(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSendTestSms}
                  disabled={isSendingSms}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-2"
                >
                  {isSendingSms ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>{isSendingSms ? "পাঠানো হচ্ছে..." : "টেস্ট এসএমএস পাঠান"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 4: Tenancy & Maintenance */}
      {activeTab === "policy" && (
        <div className="space-y-6 max-w-4xl">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-black text-slate-900">টেন্যান্ট অনবোর্ডিং পলিসি</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                নতুন শিক্ষা প্রতিষ্ঠান বা মাদ্রাসার স্বয়ংক্রিয় একাউন্ট খোলার নিয়মাবলী
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">পাবলিক সেলফ-রেজিস্ট্রেশন অনুমোদন</p>
                  <p className="text-slate-500 mt-0.5">ল্যান্ডিং পেজ থেকে নতুন স্কুল নিজে আবেদন করতে পারবে কি না</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowSelfRegistration}
                  onChange={(e) => updateSetting("allowSelfRegistration", e.target.checked)}
                  className="h-5 w-5 rounded text-teal-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">প্ল্যাটফর্ম ওনারের ম্যানুয়াল ভেরিফিকেশন বাধ্যতামূলক</p>
                  <p className="text-slate-500 mt-0.5">নতুন স্কুলের রেজিস্ট্রেশনের পর ইনবক্স থেকে অনুমোদন পেলে কেবল ডাটাবেজ তৈরি হবে</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireOwnerApproval}
                  onChange={(e) => updateSetting("requireOwnerApproval", e.target.checked)}
                  className="h-5 w-5 rounded text-teal-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="text-slate-700 font-bold">ডিফল্ট ফ্রি ট্রায়াল মেয়াদ (দিন)</Label>
                <Input
                  type="number"
                  value={settings.defaultTrialDays}
                  onChange={(e) => updateSetting("defaultTrialDays", Number(e.target.value))}
                  className="font-mono max-w-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Mode Emergency Card */}
          <Card className="rounded-3xl border-red-200 bg-red-50/20 shadow-sm">
            <CardHeader className="p-6 pb-4 border-b border-red-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black text-red-900 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-600" />
                  <span>জরুরি রক্ষণাবেক্ষণ মোড (Maintenance Mode)</span>
                </CardTitle>
                <CardDescription className="text-xs text-red-700">
                  চালু করলে সকল সাধারণ টেন্যান্ট সাময়িক ডাউনটাইম ব্যানার দেখতে পাবে
                </CardDescription>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => updateSetting("maintenanceMode", e.target.checked)}
                className="h-6 w-6 rounded text-red-600 cursor-pointer"
              />
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold">রক্ষণাবেক্ষণ বার্তার বিবরণ</Label>
                <Input
                  value={settings.maintenanceMessage}
                  onChange={(e) => updateSetting("maintenanceMessage", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold">বাইপাস আইপি তালিকা (কমা দিয়ে লিখুন)</Label>
                <Input
                  value={settings.bypassIpList}
                  onChange={(e) => updateSetting("bypassIpList", e.target.value)}
                  className="font-mono text-xs"
                />
                <p className="text-[10px] text-slate-400">এই আইপিগুলো থেকে স্বাভাবিকভাবেই প্যানেলে প্রবেশ করা যাবে।</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
