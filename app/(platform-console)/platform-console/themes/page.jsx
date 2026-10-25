'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, CheckCircle2, RotateCcw, Sliders } from "lucide-react";

const INITIAL_THEMES = [
  {
    key: "madrasa-classic",
    name: "Classic Madrasa Theme",
    author: "Platform Engine",
    version: "1.0.0",
    minVersion: "2.0.0",
    description: "ঐতিহ্যবাহী মাদ্রাসা ও হিফজখানার জন্য উপযোগী গাঢ় সবুজ ও মার্জিত ইসলামিক ডিজাইন।",
    primaryColor: "#0f766e",
    secondaryColor: "#0d9488",
    active: true,
  },
  {
    key: "school-modern",
    name: "Modern School & College",
    author: "Platform Engine",
    version: "1.2.0",
    minVersion: "2.0.0",
    description: "আধুনিক স্কুল ও কলেজের জন্য ডায়নামিক ব্যানার, ভিডিও হেডার ও স্মার্ট কার্ড লেআউট।",
    primaryColor: "#2563eb",
    secondaryColor: "#3b82f6",
    active: false,
  },
  {
    key: "academy-minimal",
    name: "Minimalist Academy",
    author: "Platform Engine",
    version: "1.1.0",
    minVersion: "2.0.0",
    description: "ক্লিন স্পেসিং ও ডার্ক মোড সাপোর্টসহ একাডেমি ও টিউটরিয়াল সেন্টারের থিম।",
    primaryColor: "#4f46e5",
    secondaryColor: "#6366f1",
    active: false,
  },
  {
    key: "corporate-institute",
    name: "Enterprise Institute",
    author: "Platform Engine",
    version: "2.0.0",
    minVersion: "2.0.0",
    description: "মাল্টি-ব্রাঞ্চ বিশ্ববিদ্যালয় ও ইন্সটিটিউটের জন্য প্রিমিয়াম কর্পোরেট লেআউট।",
    primaryColor: "#0f172a",
    secondaryColor: "#334155",
    active: false,
  },
];

export default function ThemeMarketplacePage() {
  const [themes, setThemes] = useState(INITIAL_THEMES);
  const [customizingTheme, setCustomizingTheme] = useState(null);
  const [primaryColor, setPrimaryColor] = useState("#0f766e");
  const [fontFamily, setFontFamily] = useState("Hind Siliguri");
  const [toast, setToast] = useState(null);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleActivate = (themeKey) => {
    setThemes((prev) =>
      prev.map((t) => ({
        ...t,
        active: t.key === themeKey,
      }))
    );
    const active = themes.find((t) => t.key === themeKey);
    if (active) setPrimaryColor(active.primaryColor);
    showNotification("থিম সফলভাবে অ্যাক্টিভেট করা হয়েছে!");
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-teal-800 text-white px-4 py-2.5 text-sm shadow-lg border border-teal-600 animate-in fade-in slide-in-from-bottom-2">
          ✓ {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Palette className="text-teal-600" /> Visual Theme Marketplace & Customizer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            কোড ছাড়াই ১-ক্লিকে থিম ইনস্টল, একটিভেট, কালার কাস্টমাইজেশন ও ভার্সন রোলব্যাক করুন।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => showNotification("পূর্বের ভার্সন ১.০.০ এ রোলব্যাক করা হয়েছে")}>
            <RotateCcw size={16} className="mr-1.5" /> Rollback Theme
          </Button>
        </div>
      </div>

      {/* Theme Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {themes.map((theme) => (
          <Card key={theme.key} className={`relative flex flex-col justify-between overflow-hidden transition-all ${theme.active ? "ring-2 ring-teal-600 bg-teal-50/20" : "hover:border-slate-300"}`}>
            <div>
              {/* Fake Screenshot Preview */}
              <div
                className="h-32 w-full flex items-center justify-center text-white font-medium p-4 text-center"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <div>
                  <p className="text-base font-semibold">{theme.name}</p>
                  <p className="text-xs opacity-80 mt-1">v{theme.version} · Platform {theme.minVersion}+</p>
                </div>
              </div>

              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-semibold">{theme.name}</CardTitle>
                  {theme.active && (
                    <Badge className="bg-teal-600 text-white text-[10px]">
                      <CheckCircle2 size={12} className="mr-1 inline" /> Active
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {theme.description}
                </CardDescription>
              </CardHeader>
            </div>

            <CardContent className="p-4 pt-2 flex items-center justify-between border-t border-slate-100 mt-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setCustomizingTheme(theme)}
              >
                <Sliders size={14} className="mr-1" /> Customize
              </Button>

              {theme.active ? (
                <Button size="sm" variant="outline" className="text-xs border-teal-600 text-teal-700 bg-teal-50" disabled>
                  Active Theme
                </Button>
              ) : (
                <Button size="sm" className="bg-slate-900 text-xs hover:bg-slate-800" onClick={() => handleActivate(theme.key)}>
                  Activate
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Customize Drawer / Modal */}
      {customizingTheme && (
        <Card className="border-teal-200 bg-white shadow-xl mt-6">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="text-teal-600" size={18} /> Customize: {customizingTheme.name}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setCustomizingTheme(null)}>বন্ধ করুন</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 w-12 rounded cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 flex-1 rounded border border-slate-200 px-3 text-xs uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="h-9 w-full rounded border border-slate-200 px-3 text-xs bg-white"
                >
                  <option value="Hind Siliguri">Hind Siliguri (Bengali)</option>
                  <option value="Inter">Inter (Clean Modern)</option>
                  <option value="Amiri">Amiri (Arabic Traditional)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Header Layout Style</label>
                <select className="h-9 w-full rounded border border-slate-200 px-3 text-xs bg-white">
                  <option value="standard">Standard Navigation</option>
                  <option value="centered">Centered Logo Top</option>
                  <option value="minimal">Minimal Top Bar</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setCustomizingTheme(null)}>বাতিল</Button>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-500" onClick={() => {
                showNotification("থিম কাস্টমাইজেশন সংরক্ষিত হয়েছে!");
                setCustomizingTheme(null);
              }}>
                Save & Apply Live Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
