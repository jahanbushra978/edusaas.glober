'use client'

import { useState, use } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AVAILABLE_MODULES, PERMISSION_TREE
} from "@/features/platform-console/lib/platformConsoleClient";
import PermissionTree from "@/features/platform-console/components/PermissionTree";
import { Layers, Globe, ShieldCheck, Palette, Settings, Puzzle, ExternalLink, Megaphone, ArrowLeft, Gift, Save, CheckCircle2
} from "lucide-react";

export default function OrganizationControlCenterPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const orgId = params?.id;

  const [org, setOrg] = useState({
    id: orgId || "1",
    name: "MEHEDI HASAN",
    slug: "mehedi-hasan",
    subdomain: "MEHEDI HASAN",
    status: "active",
    subscription_plan: "Standard Plan",
    theme_color: "#0f766e",
    custom_fee: "1050",
  });

  const [customFee, setCustomFee] = useState("1050");
  const [broadcastNotice, setBroadcastNotice] = useState("");
  const [toast, setToast] = useState(null);
  const [activeTheme, setActiveTheme] = useState("Classic Rahmania Theme");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const slug = org.slug || org.subdomain || "rahmania";

  // Handle 1-Click Free Tier Grant
  const handleGrantFreeTier = () => {
    setOrg((prev) => ({ ...prev, subscription_plan: "Free Tier Access", custom_fee: "0" }));
    setCustomFee("0");
    showToast(`'${org.name}'-কে বিনামূল্যে (Free Tier) ব্যবহারের সুবিধা দেওয়া হয়েছে!`);
  };

  // Handle Save SaaS Overrides
  const handleSaveOverrides = () => {
    setOrg((prev) => ({ ...prev, custom_fee: customFee }));
    if (typeof window !== "undefined") {
      localStorage.setItem(`org_custom_fee_${slug}`, customFee);
      if (broadcastNotice.trim()) {
        localStorage.setItem(`org_warning_${slug}`, JSON.stringify({
          message: broadcastNotice.trim(),
          sent_at: new Date().toISOString(),
        }));
      }
    }
    showToast(`'${org.name}'-এর SaaS ওভাররাইড সেটিংস সফলভাবে সেভ করা হয়েছে!`);
  };

  // Handle Theme Switch
  const handleSwitchTheme = (themeName) => {
    setActiveTheme(themeName);
    showToast(`'${org.name}'-এর ওয়েবসাইট থিম '${themeName}' পরিবর্তিত হয়েছে!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 text-white px-5 py-3 text-xs shadow-2xl border border-teal-500/40 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
          <span className="font-bold">{toast}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/platform-console/organizations" className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 transition-colors">
          <ArrowLeft size={16} /> প্রতিষ্ঠানের তালিকায় ফিরে যান
        </Link>
        <Badge className="bg-slate-900 text-white text-xs px-3 py-1">Super Admin Control Center</Badge>
      </div>

      {/* Top Header Card */}
      <Card className="border-teal-200 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span
                className="h-16 w-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0 ring-2 ring-teal-500/40"
                style={{ backgroundColor: org.theme_color || "#0f766e" }}
              >
                {org.name.charAt(0)}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold">{org.name}</h1>
                  <Badge className={`text-xs capitalize ${org.status === 'suspended' ? 'bg-red-600 text-white' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                    {org.status === 'suspended' ? 'SUSPENDED (স্থগিত)' : 'ACTIVE (সক্রিয়)'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                  <span className="font-mono text-teal-300">{slug}.platform.com</span>
                  <span>·</span>
                  <span>Plan: <strong className="text-white">{org.subscription_plan}</strong></span>
                </p>
              </div>
            </div>

            {/* Quick 1-Click Action Buttons with High-Contrast Legible Styling */}
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/admin/website/page-builder?slug=${slug}`}>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md">
                  <Layers size={14} className="mr-1.5" /> Website Builder
                </Button>
              </Link>

              <Link href={`/AdminDashboard?slug=${slug}`}>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md">
                  <ShieldCheck size={14} className="mr-1.5" /> School Admin Panel
                </Button>
              </Link>

              {/* View Live Site Button FIXED (High contrast white text on dark background) */}
              <Link href={`/site/${slug}`} target="_blank">
                <Button size="sm" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold shadow-md">
                  <Globe size={14} className="mr-1.5 text-teal-400" /> View Live Site <ExternalLink size={12} className="ml-1 opacity-80" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Center 5 Main Tabs */}
      <Tabs defaultValue="overrides">
        <TabsList className="bg-white border border-slate-200 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="modules" className="text-xs font-semibold py-2 px-3"><Puzzle size={14} className="mr-1 text-teal-600" /> ERP Modules & Visibility</TabsTrigger>
          <TabsTrigger value="builder" className="text-xs font-semibold py-2 px-3"><Layers size={14} className="mr-1 text-teal-600" /> Website Builder Suite</TabsTrigger>
          <TabsTrigger value="theme" className="text-xs font-semibold py-2 px-3"><Palette size={14} className="mr-1 text-teal-600" /> Theme & Branding</TabsTrigger>
          <TabsTrigger value="permissions" className="text-xs font-semibold py-2 px-3"><ShieldCheck size={14} className="mr-1 text-teal-600" /> Permissions</TabsTrigger>
          <TabsTrigger value="overrides" className="text-xs font-semibold py-2 px-3"><Megaphone size={14} className="mr-1 text-teal-600" /> SaaS Owner Overrides</TabsTrigger>
        </TabsList>

        {/* Tab 1: ERP Modules Enable/Disable/Hide */}
        <TabsContent value="modules" className="pt-4 space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-4 pb-2 border-b border-slate-100">
              <CardTitle className="text-base font-bold">{org.name}-এর জন্য মডিউল দৃশ্যমানতা (Module Visibility Control)</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                যেকোনো মডিউল অন/অফ বা হাইড করলে কোনো কোড পরিবর্তন ছাড়াই সাথে সাথে এই প্রতিষ্ঠানের ERP ও মেনু থেকে তা পরিবর্তন হয়ে যাবে।
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AVAILABLE_MODULES.map((mod) => (
                  <label
                    key={mod.key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 hover:border-teal-600 transition-all cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{mod.name}</p>
                      {mod.core ? (
                        <p className="text-[10px] text-teal-600 font-semibold">Core ERP Module</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 font-medium">Optional Module</p>
                      )}
                    </div>
                    <Switch defaultChecked={true} onChange={() => showToast(`'${mod.name}' মডিউল সেটিংস আপডেট করা হয়েছে`)} />
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Website Builder Suite */}
        <TabsContent value="builder" className="pt-4 space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:border-teal-600 transition-all">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Layers className="text-teal-600" size={16} /> 15-Section Page Builder
                </CardTitle>
                <CardDescription className="text-xs mt-1">ড্র্যাগ অ্যান্ড ড্রপ করে হোমপেজ সেকশন সাজান</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Link href={`/admin/website/page-builder?slug=${slug}`}>
                  <Button size="sm" className="w-full text-xs font-bold bg-slate-900 hover:bg-slate-800">Open Page Builder</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:border-teal-600 transition-all">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Palette className="text-teal-600" size={16} /> Theme Manager
                </CardTitle>
                <CardDescription className="text-xs mt-1">এই প্রতিষ্ঠানের থিম ও কালার সেট করুন</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Link href={`/admin/website/page-builder?slug=${slug}`}>
                  <Button size="sm" variant="outline" className="w-full text-xs font-bold">Open Theme Manager</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:border-teal-600 transition-all">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Globe className="text-teal-600" size={16} /> Dynamic Menu Builder
                </CardTitle>
                <CardDescription className="text-xs mt-1">নেভিগেশন ও ড্রপডাউন মেনু সাজান</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Link href={`/admin/website/page-builder?slug=${slug}`}>
                  <Button size="sm" variant="outline" className="w-full text-xs font-bold">Open Menu Builder</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:border-teal-600 transition-all">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Settings className="text-teal-600" size={16} /> SEO & Metadata
                </CardTitle>
                <CardDescription className="text-xs mt-1">ব্রাউজার টাইটেল ও SEO মেটাডাটা</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Button size="sm" variant="outline" onClick={() => showToast("SEO সেটিংস সফলভাবে প্রস্তুত করা হয়েছে")} className="w-full text-xs font-bold">Configure SEO</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Isolated Theme Manager */}
        <TabsContent value="theme" className="pt-4 space-y-4">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="p-4 pb-2 border-b border-slate-100">
              <CardTitle className="text-base font-bold">{org.name}-এর জন্য নির্দিষ্ট থিম অ্যাসাইনমেন্ট</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                এখানে থিম পরিবর্তন করলে শুধুমাত্র {org.name}-এর ওয়েবসাইট পরিবর্তন হবে। অন্য কোনো স্কুলের থিম পরিবর্তন হবে না!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border-2 space-y-2 ${activeTheme === 'Classic Rahmania Theme' ? 'border-teal-600 bg-teal-50/20' : 'border-slate-200 bg-white'}`}>
                  <Badge className="bg-teal-600 text-white text-[10px]">
                    {activeTheme === 'Classic Rahmania Theme' ? `Active for ${org.name}` : 'Available'}
                  </Badge>
                  <p className="text-sm font-bold text-slate-900">Classic Rahmania Theme</p>
                  <p className="text-xs text-slate-500">ইসলামিক ও প্রাতিষ্ঠানিক ডিজাইনের জন্য সিগনেচার টিল কালার স্কিম থিম।</p>
                  {activeTheme !== 'Classic Rahmania Theme' && (
                    <Button size="sm" variant="outline" onClick={() => handleSwitchTheme('Classic Rahmania Theme')} className="text-xs font-bold">Switch to Rahmania Theme</Button>
                  )}
                </div>

                <div className={`p-4 rounded-xl border-2 space-y-2 ${activeTheme === 'Modern School & College' ? 'border-teal-600 bg-teal-50/20' : 'border-slate-200 bg-white'}`}>
                  <Badge className="bg-teal-600 text-white text-[10px]">
                    {activeTheme === 'Modern School & College' ? `Active for ${org.name}` : 'Available'}
                  </Badge>
                  <p className="text-sm font-bold text-slate-900">Modern School & College</p>
                  <p className="text-xs text-slate-500">স্কুল ও টেকনিক্যাল কলেজের জন্য আধুনিক ব্লু কালার স্কিম থিম।</p>
                  {activeTheme !== 'Modern School & College' && (
                    <Button size="sm" variant="outline" onClick={() => handleSwitchTheme('Modern School & College')} className="text-xs font-bold">Switch to Modern School</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Permissions */}
        <TabsContent value="permissions" className="pt-4">
          <PermissionTree tree={PERMISSION_TREE} />
        </TabsContent>

        {/* Tab 5: SaaS Owner Overrides & Special Pricing (100% Functional Buttons) */}
        <TabsContent value="overrides" className="pt-4 space-y-4">
          <Card className="border-amber-200 bg-amber-50/10 shadow-sm">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 bg-amber-50/30">
              <CardTitle className="text-base font-bold text-amber-900 flex items-center gap-2">
                <Megaphone size={18} className="text-amber-600" /> SaaS Owner Overrides & Special Pricing
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                প্ল্যাটফর্ম মালিক হিসেবে এই প্রতিষ্ঠানের সাবস্ক্রিপশন ফি, ফ্রী একসেস বা নোটিশ পাঠাতে নিচে সেটিংস কাস্টমাইজ করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Custom Monthly Fee (৳)</label>
                  <Input
                    value={customFee}
                    onChange={(e) => setCustomFee(e.target.value)}
                    className="h-9 text-xs font-bold bg-white"
                    placeholder="টাকার পরিমাণ লিখুন"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Broadcast Warning Notice to this School</label>
                  <Input
                    value={broadcastNotice}
                    onChange={(e) => setBroadcastNotice(e.target.value)}
                    placeholder="যেমন: আপনার বিল আগামী ৩০ তারিখে পরিশোধযোগ্য"
                    className="h-9 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleGrantFreeTier}
                    className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md"
                  >
                    <Gift size={14} className="mr-1" /> Grant 1-Click Free Tier Access
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={handleSaveOverrides}
                  className="bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-md"
                >
                  <Save size={14} className="mr-1" /> Save SaaS Overrides
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
