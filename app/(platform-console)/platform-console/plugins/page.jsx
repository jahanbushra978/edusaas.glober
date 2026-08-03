'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Puzzle, Settings, CheckCircle2, AlertCircle } from "lucide-react";

const INITIAL_PLUGINS = [
  {
    id: "biometric-bridge",
    name: "Biometric Attendance Device Bridge",
    category: "Hardware & Attendance",
    version: "1.0.0",
    description: "ZKTeco / Digital biometric ডিভাইস সরাসরি স্কুলের ডাটাবেজের সাথে সিঙ্ক করার জন্য নো-কোড ব্রিজ।",
    enabled: true,
    configured: true,
  },
  {
    id: "online-admissions",
    name: "Online Admissions & Entrance Portal",
    category: "Student Onboarding",
    version: "1.2.0",
    description: "অনলাইন ভর্তি ফর্ম, ডকুমেন্ট আপলোড, এডমিট কার্ড ডাউনলোড ও এন্ট্রান্স পরীক্ষার ফল প্রকাশ।",
    enabled: true,
    configured: true,
  },
  {
    id: "sms-gateway",
    name: "Multi-Gateway Bulk SMS Engine",
    category: "Communication",
    version: "2.0.0",
    description: "Greenweb, Teletalk, SSL Wireless দিয়ে ছাত্র-ছাত্রী ও অভিভাবকদের কাছে স্বয়ংক্রিয় SMS নোটিফিকেশন।",
    enabled: false,
    configured: false,
  },
  {
    id: "fees-gateway",
    name: "bkash / Nagad Online Fees Portal",
    category: "Finance & Accounting",
    version: "1.5.0",
    description: "বিকাশ, নগদ ও রকেটের মাধ্যমে সরাসরি শিক্ষার্থীর মাসের ফি আদায় ও রশিদ তৈরি।",
    enabled: false,
    configured: false,
  },
];

export default function PluginMarketplacePage() {
  const [plugins, setPlugins] = useState(INITIAL_PLUGINS);
  const [configuringPlugin, setConfiguringPlugin] = useState(null);
  const [toast, setToast] = useState(null);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = (pluginId) => {
    setPlugins((prev) =>
      prev.map((p) => {
        if (p.id === pluginId) {
          const nextState = !p.enabled;
          showNotification(
            nextState
              ? `'${p.name}' সফলভাবে চালু করা হয়েছে!`
              : `'${p.name}' বন্ধ করা হয়েছে!`
          );
          return { ...p, enabled: nextState };
        }
        return p;
      })
    );
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-teal-800 text-white px-4 py-2.5 text-sm shadow-lg border border-teal-600 animate-in fade-in slide-in-from-bottom-2">
          🧩 {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Puzzle className="text-teal-600" /> Visual Plugin & Extension Marketplace
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          ১-ক্লিকে নতুন ফিচার ও ইন্টিগ্রেশন চালু বা বন্ধ করুন। থিম বা মূল সিস্টেমের উপর কোনো প্রভাব পড়বে না।
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {plugins.map((plugin) => (
          <Card key={plugin.id} className={`transition-all ${plugin.enabled ? "border-teal-200 bg-teal-50/10" : ""}`}>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="outline" className="text-[10px] mb-1">{plugin.category}</Badge>
                  <CardTitle className="text-base font-semibold">{plugin.name}</CardTitle>
                </div>
                <Switch checked={plugin.enabled} onCheckedChange={() => handleToggle(plugin.id)} />
              </div>
              <CardDescription className="text-xs mt-1.5">{plugin.description}</CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-2 flex items-center justify-between border-t border-slate-100 mt-3">
              <div className="flex items-center gap-2">
                {plugin.enabled ? (
                  <span className="text-[11px] text-teal-700 font-medium flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active & Running
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <AlertCircle size={12} /> Inactive
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setConfiguringPlugin(plugin)}
              >
                <Settings size={14} className="mr-1" /> Configure Settings
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plugin Settings Modal */}
      {configuringPlugin && (
        <Card className="border-teal-200 shadow-xl mt-6">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="text-teal-600" size={18} /> Configure: {configuringPlugin.name}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setConfiguringPlugin(null)}>বন্ধ করুন</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">API Key / Integration Endpoint</label>
              <input
                type="text"
                placeholder="e.g. sk_live_894389248239"
                className="h-9 w-full rounded border border-slate-200 px-3 text-xs bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Gateway Credentials / Secret</label>
              <input
                type="password"
                placeholder="••••••••••••••••"
                className="h-9 w-full rounded border border-slate-200 px-3 text-xs bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setConfiguringPlugin(null)}>বাতিল</Button>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-500" onClick={() => {
                showNotification("প্লাগইন কনফিগারেশন আপডেট করা হয়েছে!");
                setConfiguringPlugin(null);
              }}>
                Save Plugin Config
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
