'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Layers, Plus, Trash2, ArrowUp, ArrowDown, Eye, Save, Users, LayoutTemplate, Image, Bell, HelpCircle, PhoneCall
} from "lucide-react";

const SECTION_TEMPLATES = [
  { type: "hero", name: "Hero Banner Slider", icon: LayoutTemplate, defaultTitle: "রহমানিয়া মডেল ইনস্টিটিউট", defaultSubtitle: "একটি আধুনিক দ্বীনি ও প্রাতিষ্ঠানিক শিক্ষাঙ্গন" },
  { type: "notices", name: "Notice Board", icon: Bell, defaultTitle: "জরুরী নোটিশ ও সংবাদ", defaultSubtitle: "সাম্প্রতিক নোটিশ ও নোটিফিকেশন" },
  { type: "teachers", name: "Teacher Profiles", icon: Users, defaultTitle: "আমাদের সম্মানিত শিক্ষকবৃন্দ", defaultSubtitle: "অভিজ্ঞ শিক্ষকমণ্ডলীর তালিকা" },
  { type: "gallery", name: "Photo & Video Gallery", icon: Image, defaultTitle: "ফটো ও ভিডিও গ্যালারী", defaultSubtitle: "ক্যাম্পাস জীবন ও সাম্প্রতিক ইভেন্টসমূহ" },
  { type: "faq", name: "FAQ Accordion", icon: HelpCircle, defaultTitle: "সাধারণ প্রশ্নাবলী (FAQ)", defaultSubtitle: "ভর্তি ও অন্যান্য তথ্যের নিয়মিত উত্তর" },
  { type: "contact", name: "Contact & Location", icon: PhoneCall, defaultTitle: "যোগাযোগ ও ঠিকানা", defaultSubtitle: "আমাদের সাথে যোগাযোগের ঠিকানা" },
];

export default function VisualPageBuilderPage() {
  const [sections, setSections] = useState([
    { id: "s1", type: "hero", title: "রহমানিয়া মডেল ইনস্টিটিউট", subtitle: "একটি আধুনিক দ্বীনি ও প্রাতিষ্ঠানিক শিক্ষাঙ্গন", bg: "#0f766e" },
    { id: "s2", type: "notices", title: "জরুরী নোটিশ ও সংবাদ", subtitle: "সাম্প্রতিক নোটিশ ও নোটিফিকেশন", bg: "#f8fafc" },
  ]);

  const [selectedSectionId, setSelectedSectionId] = useState("s1");
  const [toast, setToast] = useState(null);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addSection = (template) => {
    const newSec = {
      id: `sec_${Date.now()}`,
      type: template.type,
      title: template.defaultTitle,
      subtitle: template.defaultSubtitle,
      bg: "#ffffff",
    };
    setSections((prev) => [...prev, newSec]);
    setSelectedSectionId(newSec.id);
    showNotification(`'${template.name}' সেকশন যুক্ত করা হয়েছে!`);
  };

  const moveSection = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setSections(updated);
  };

  const deleteSection = (id) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (selectedSectionId === id && sections.length > 1) {
      setSelectedSectionId(sections[0].id);
    }
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  const updateSelectedField = (field, value) => {
    setSections((prev) =>
      prev.map((s) => (s.id === selectedSectionId ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-teal-800 text-white px-4 py-2.5 text-sm shadow-lg border border-teal-600 animate-in fade-in slide-in-from-bottom-2">
          ⚡ {toast}
        </div>
      )}

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Layers className="text-teal-600" /> Visual No-Code Page & Section Builder
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ড্র্যাগ অ্যান্ড ড্রপ ও কাস্টম সেকশন যুক্ত করে কোড ছাড়াই যেকোনো পেজ ডিজাইন করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => showNotification("লাইভ প্রিভিউ উইন্ডো ওপেন হয়েছে")}>
            <Eye size={16} className="mr-1.5" /> Live Preview
          </Button>
          <Button size="sm" className="bg-teal-600 hover:bg-teal-500" onClick={() => showNotification("পেজ ডিজাইন সফলভাবে পাবলিশ করা হয়েছে!")}>
            <Save size={16} className="mr-1.5" /> Publish Live Page
          </Button>
        </div>
      </div>

      {/* 3-Column Builder Workspace */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Section Templates Library */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Sections</h3>
          <div className="space-y-2">
            {SECTION_TEMPLATES.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <button
                  key={tpl.type}
                  onClick={() => addSection(tpl)}
                  className="w-full text-left flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-teal-600 hover:bg-teal-50/20 transition-all text-xs font-medium text-slate-800 group"
                >
                  <span className="flex items-center gap-2">
                    <Icon size={16} className="text-teal-600" /> {tpl.name}
                  </span>
                  <Plus size={14} className="text-slate-400 group-hover:text-teal-600" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle Column: Active Canvas Ordering */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Page Layout ({sections.length} Sections)</h3>
          <div className="space-y-3">
            {sections.map((sec, index) => (
              <div
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedSectionId === sec.id
                    ? "border-teal-600 bg-teal-50/30 ring-1 ring-teal-600 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] capitalize">{sec.type}</Badge>
                    <span className="text-xs font-semibold text-slate-800 truncate max-w-[180px]">{sec.title}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500" onClick={(e) => { e.stopPropagation(); moveSection(index, -1); }}>
                      <ArrowUp size={12} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500" onClick={(e) => { e.stopPropagation(); moveSection(index, 1); }}>
                      <ArrowDown size={12} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); deleteSection(sec.id); }}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{sec.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Section Inspector */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Section Inspector</h3>
          {selectedSection ? (
            <Card className="border-teal-200 shadow-sm">
              <CardHeader className="p-4 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold capitalize">Settings: {selectedSection.type}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Section Title</label>
                  <Input
                    value={selectedSection.title}
                    onChange={(e) => updateSelectedField("title", e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Subtitle / Description</label>
                  <Textarea
                    value={selectedSection.subtitle}
                    onChange={(e) => updateSelectedField("subtitle", e.target.value)}
                    className="text-xs bg-white min-h-[60px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedSection.bg || "#ffffff"}
                      onChange={(e) => updateSelectedField("bg", e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded border border-slate-200"
                    />
                    <Input
                      value={selectedSection.bg || "#ffffff"}
                      onChange={(e) => updateSelectedField("bg", e.target.value)}
                      className="h-8 text-xs bg-white uppercase flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 rounded-lg border border-dashed border-slate-200">
              কোনো সেকশন সিলেক্ট করা নেই
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
