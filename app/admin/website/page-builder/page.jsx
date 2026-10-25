'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Layers, Trash2, ArrowUp, ArrowDown, Eye, Save, Users, LayoutTemplate, Image as ImageIcon, Bell, HelpCircle, PhoneCall,
  BookOpen, Calendar, Video as VideoIcon, BarChart2, MousePointerClick, PanelBottom, ExternalLink, Upload, CheckCircle2, Link as LinkIcon, PlusCircle, Code, Monitor, Menu as MenuIcon, RefreshCw, Wand2, Camera, Building2, X, Lock
} from "lucide-react";
import DynamicTenantSiteRenderer from "@/components/tenant-site/DynamicTenantSiteRenderer";

const SECTION_TEMPLATES = [
  { type: "hero", name: "1. Hero Banner Slider", icon: LayoutTemplate, defaultTitle: "স্বাগতম আমাদের প্রতিষ্ঠানে", defaultSubtitle: "একটি আধুনিক দ্বীনি ও প্রাতিষ্ঠানিক শিক্ষাঙ্গন" },
  { type: "about", name: "2. About Us Section", icon: Building2, defaultTitle: "আমাদের প্রতিষ্ঠান সম্পর্কে", defaultSubtitle: "মানসম্মত শিক্ষা ও চরিত্র গঠনের অঙ্গীকার" },
  { type: "teachers", name: "3. Teacher Profiles Grid", icon: Users, defaultTitle: "আমাদের সম্মানিত শিক্ষকবৃন্দ", defaultSubtitle: "অভিজ্ঞ ও নিবেদিতপ্রাণ শিক্ষকমণ্ডলী" },
  { type: "notices", name: "4. Notice Board", icon: Bell, defaultTitle: "জরুরী নোটিশ ও সংবাদ", defaultSubtitle: "সাম্প্রতিক নোটিশ ও নোটিফিকেশন" },
  { type: "gallery", name: "5. Photo & Video Gallery", icon: ImageIcon, defaultTitle: "ফটো ও ভিডিও গ্যালারী", defaultSubtitle: "ক্যাম্পাস জীবন ও ইভেন্টসমূহ" },
  { type: "courses", name: "6. Courses & Academics", icon: BookOpen, defaultTitle: "শিক্ষা কোর্স ও বিভাগসমূহ", defaultSubtitle: "আমাদের বিভিন্ন বিভাগ ও শিক্ষা কার্যক্রম" },
  { type: "events", name: "7. Upcoming Events", icon: Calendar, defaultTitle: "আসন্ন ইভেন্ট ও অনুষ্ঠান", defaultSubtitle: "আমাদের বার্ষিক ও সেমিনার কার্যক্রম" },
  { type: "faq", name: "8. FAQ Accordion", icon: HelpCircle, defaultTitle: "সাধারণ প্রশ্নাবলী (FAQ)", defaultSubtitle: "ভর্তি ও অন্যান্য তথ্যের নিয়মিত উত্তর" },
  { type: "contact", name: "9. Contact & Location Map", icon: PhoneCall, defaultTitle: "যোগাযোগ ও ঠিকানা", defaultSubtitle: "আমাদের সাথে যোগাযোগের তথ্য" },
  { type: "cta", name: "10. Call-To-Action Banner", icon: MousePointerClick, defaultTitle: "আজই ভর্তির জন্য আবেদন করুন", defaultSubtitle: "সীমিত আসনে ভর্তি চলছে" },
  { type: "video", name: "11. Video Player Section", icon: VideoIcon, defaultTitle: "ক্যাম্পাস ভিডিও পরিচিতি", defaultSubtitle: "আমাদের ক্যাম্পাস ও কার্যক্রমের ভিডিও" },
  { type: "counter", name: "12. Statistics Counter", icon: BarChart2, defaultTitle: "আমাদের সাফল্য ও অর্জন", defaultSubtitle: "১০০০+ শিক্ষার্থী · ৫০+ শিক্ষক · ১০০% সাফল্য" },
  { type: "footer", name: "13. Dynamic Website Footer", icon: PanelBottom, defaultTitle: "অফিসিয়াল ফুটার লিংকসমূহ", defaultSubtitle: "কপিরাইট ও সোশাল মিডিয়া লিংক" },
  { type: "code", name: "14. Custom HTML / CSS Code Block", icon: Code, defaultTitle: "কাস্টম HTML/CSS কোড সেকশন", defaultSubtitle: "নিজের ইচ্ছামতো HTML, CSS বা উইজেট ইমবেড কোড লিখুন" },
  { type: "branches", name: "15. Our Branches Network Grid", icon: Building2, defaultTitle: "আমাদের শাখাসমূহ (Our Branches)", defaultSubtitle: "এডমিন প্যানেল থেকে যুক্তকৃত সকল শাখা সরাসরি ওয়েবসাইটে প্রদর্শিত হবে" },
  { type: "login_portals", name: "16. Teacher, Student & Guardian Login Portals", icon: Lock, defaultTitle: "ডিজিটাল পোর্টাল লগইন (Portal Logins)", defaultSubtitle: "শিক্ষক, ছাত্র, অভিভাবক ও এডমিন প্যানেল প্রবেশদ্বার" },
];

export default function ElementorGradeWebsiteBuilderPage() {
  const [slug, setSlug] = useState("rahmania");
  const [schoolName, setSchoolName] = useState("Rahmania Institute");
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [viewMode, setViewMode] = useState("split");

  // Navbar & Theme Settings
  const [themeSettings, setThemeSettings] = useState({
    headerBg: "#0f172a",
    headerTextColor: "#ffffff",
    primaryThemeColor: "#0f766e",
    accentColor: "#f59e0b",
    logoUrl: "",
    primaryBtnText: "Online Admission",
    secondaryBtnText: "Portal Login",
    navMenuLinks: [
      { label: "Home", href: "#hero" },
      { label: "About Us", href: "#about" },
      { label: "Notices", href: "#notices" },
      { label: "Teachers", href: "#teachers" },
      { label: "Academics", href: "#courses" },
      { label: "Gallery", href: "#gallery" },
      { label: "Contact", href: "#contact" },
    ]
  });

  const [newMenuLabel, setNewMenuLabel] = useState("");
  const [newMenuHref, setNewMenuHref] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const activeSlug = params.get("slug") || params.get("tenant") || "rahmania";
      setSlug(activeSlug);

      const formatted = decodeURIComponent(activeSlug)
        .replace(/-/g, " ")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      setSchoolName(formatted || "School");
      document.title = `${formatted || "School"} - Website Builder`;

      // Load Saved Sections
      const savedSec = localStorage.getItem(`published_sections_${activeSlug}`);
      if (savedSec) {
        try {
          const parsed = JSON.parse(savedSec);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSections(parsed);
            setSelectedSectionId(parsed[0].id);
          } else {
            loadRahmaniaTemplate();
          }
        } catch (e) {
          console.error("Error loading sections:", e);
          loadRahmaniaTemplate();
        }
      } else {
        loadRahmaniaTemplate();
      }

      // Load Saved Theme
      const savedTheme = localStorage.getItem(`published_theme_${activeSlug}`);
      if (savedTheme) {
        try {
          const parsedTheme = JSON.parse(savedTheme);
          if (parsedTheme && typeof parsedTheme === "object") {
            setThemeSettings((prev) => ({ ...prev, ...parsedTheme }));
          }
        } catch (e) {
          console.error("Error loading theme:", e);
        }
      }
    }
  }, []);

  const loadRahmaniaTemplate = () => {
    const defaultSecs = [
      {
        id: "sec_hero_1",
        type: "hero",
        title: `স্বাগতম — ${schoolName || "আমাদের প্রতিষ্ঠানে"}`,
        subtitle: "একটি আধুনিক দ্বীনি ও প্রাতিষ্ঠানিক শিক্ষাঙ্গন",
        bg: "#020617",
        text_color: "#ffffff",
        align: "center",
        btn1_text: "অনলাইন ভর্তি আবেদন",
        btn1_link: "#admission",
        btn2_text: "নোটিশ বোর্ড",
        btn2_link: "#notices",
      },
      {
        id: "sec_about_2",
        type: "about",
        title: "আমাদের প্রতিষ্ঠান সম্পর্কে",
        subtitle: "মানসম্মত শিক্ষা ও চরিত্র গঠনের অঙ্গীকার নিয়ে পরিচালিত আমাদের শিক্ষা কার্যক্রম।",
        bg: "#ffffff",
        text_color: "#0f172a",
        align: "left",
      },
      {
        id: "sec_branches_3",
        type: "branches",
        title: "আমাদের শাখাসমূহ (Our Branches)",
        subtitle: "এডমিন প্যানেল থেকে যুক্তকৃত সকল শাখা সরাসরি প্রদর্শিত হবে",
        bg: "#f8fafc",
        text_color: "#0f172a",
        align: "center",
      }
    ];
    setSections(defaultSecs);
    setSelectedSectionId(defaultSecs[0].id);
  };

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const addSection = (template) => {
    const isCode = template?.type === "code";
    const newSec = {
      id: `sec_${Date.now()}`,
      type: template ? template.type : "custom",
      title: template ? template.defaultTitle : "নতুন কাস্টম সেকশন",
      subtitle: template ? template.defaultSubtitle : "এখানে আপনার সেকশনের বিস্তারিত বর্ণনা লিখুন",
      image_url: "",
      bg: "#ffffff",
      text_color: "#0f172a",
      align: "center",
      btn1_text: "",
      btn1_link: "",
      btn1_bg: "#0f766e",
      btn1_color: "#ffffff",
      btn2_text: "",
      btn2_link: "",
      btn2_bg: "#1e293b",
      btn2_color: "#ffffff",
      custom_code: isCode ? `<div style="padding: 24px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; text-align: center; color: #166534;">\n  <h3 style="font-size: 20px; font-weight: bold;">Custom Developer Block</h3>\n  <p style="font-size: 13px; margin-top: 6px;">এখানে আপনার কাস্টম HTML বা CSS কোড লিখুন</p>\n</div>` : "",
    };
    setSections((prev) => [...prev, newSec]);
    setSelectedSectionId(newSec.id);
    showNotification(`'${template ? template.name : "নতুন সেকশন"}' যুক্ত করা হয়েছে!`);
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
    if (selectedSectionId === id) {
      setSelectedSectionId(null);
    }
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSectionId) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      updateSelectedField("image_url", dataUrl);
      setUploading(false);
      showNotification("ছবি/ব্যানার সফলভাবে আপলোড সম্পন্ন হয়েছে!");
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setThemeSettings((prev) => ({ ...prev, logoUrl: dataUrl }));
      setLogoUploading(false);
      showNotification("লোগো সফলভাবে আপলোড করা হয়েছে!");
    };
    reader.readAsDataURL(file);
  };

  const addNavbarMenuItem = () => {
    if (!newMenuLabel.trim()) return;
    const newItem = { label: newMenuLabel.trim(), href: newMenuHref.trim() || "#" };
    setThemeSettings((prev) => ({
      ...prev,
      navMenuLinks: [...(prev.navMenuLinks || []), newItem],
    }));
    setNewMenuLabel("");
    setNewMenuHref("");
    showNotification(`'${newItem.label}' মেনুতে যুক্ত করা হয়েছে!`);
  };

  const removeNavbarMenuItem = (index) => {
    setThemeSettings((prev) => ({
      ...prev,
      navMenuLinks: (prev.navMenuLinks || []).filter((_, i) => i !== index),
    }));
  };

  const handlePublish = () => {
    if (typeof window !== "undefined") {
      const clean = slug.toLowerCase().replace(/%20|\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      localStorage.setItem(`published_sections_${slug}`, JSON.stringify(sections));
      localStorage.setItem(`published_sections_${clean}`, JSON.stringify(sections));
      localStorage.setItem(`published_theme_${slug}`, JSON.stringify(themeSettings));
      localStorage.setItem(`published_theme_${clean}`, JSON.stringify(themeSettings));
    }
    showNotification(`'${schoolName}'-এর ওয়েবসাইট লাইভ পাবলিশ করা হয়েছে!`);
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  const updateSelectedField = (field, value) => {
    setSections((prev) =>
      prev.map((s) => (s.id === selectedSectionId ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 text-white px-5 py-3 text-xs shadow-2xl border border-teal-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wand2 className="text-teal-600" size={22} /> {schoolName} — Live Website & Elementor Customizer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            লোগো আপলোড, স্লাইড/ব্যানার ফটো, টেক্সট, বাটন ও কাস্টম HTML কোড সরাসরি লাইভ এডিট করুন।
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-slate-700 border-slate-300 hover:bg-slate-50"
            onClick={loadRahmaniaTemplate}
          >
            <RefreshCw size={14} className="mr-1.5 text-teal-600" /> Default Starter Template
          </Button>

          <a href={`/site/${slug}`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="text-xs text-slate-700 border-slate-300">
              <Eye size={16} className="mr-1.5" /> View Live Site <ExternalLink size={12} className="ml-1" />
            </Button>
          </a>

          <Button size="sm" className="bg-teal-600 hover:bg-teal-500 text-white text-xs px-4 font-bold shadow-md" onClick={handlePublish}>
            <Save size={16} className="mr-1.5" /> Save & Publish Live Page
          </Button>
        </div>
      </div>

      {/* 2-COLUMN WORKSPACE: LEFT EDITOR & RIGHT LIVE PREVIEW CANVAS */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT WORKSPACE (5 COLS): LOGO UPLOAD + ACTIVE SECTIONS + SECTION EDITOR */}
        <div className="lg:col-span-5 space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto pr-1">
          
          {/* CARD 1: ALWAYS-VISIBLE INSTITUTION LOGO UPLOADER */}
          <Card className="border-teal-300 bg-teal-50/40 shadow-sm">
            <CardHeader className="p-3.5 border-b border-teal-100 bg-teal-100/40">
              <CardTitle className="text-xs font-bold uppercase text-teal-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Camera size={16} className="text-teal-700" /> Institution Logo Uploader (লোগো যুক্ত করার অপশন)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {themeSettings.logoUrl ? (
                <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-teal-200 shadow-sm">
                  <img src={themeSettings.logoUrl} alt="Institution Logo" className="h-12 w-12 object-cover rounded-xl border border-slate-200" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{schoolName} Logo</p>
                    <p className="text-[10px] text-teal-600 font-semibold">Active on Website Header</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-red-600 hover:bg-red-50 h-7 px-2 font-semibold"
                    onClick={() => setThemeSettings((p) => ({ ...p, logoUrl: "" }))}
                  >
                    <Trash2 size={12} className="mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-dashed border-teal-400 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-700">প্রতিষ্ঠানের নিজস্ব লোগো আপলোড করুন</p>
                  <label className="cursor-pointer inline-block">
                    <div className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all">
                      <Upload size={14} /> {logoUploading ? "Uploading Logo..." : "Upload Logo Image from PC"}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
              )}
            </CardContent>
          </Card>
          {/* CARD 2: DYNAMIC NAVBAR MENU BUILDER (উপরে ন্যাপবারে মেনু ও লিংক যোগ করার অপশন) */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                <MenuIcon size={15} className="text-teal-600" /> Header Navbar Menu Links (মেনুতে লিংক যোগ করার অপশন)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 space-y-3">
              {/* Existing Menu Items list with remove button */}
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {(themeSettings.navMenuLinks || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-xl text-xs font-semibold">
                    <span>{item.label}</span>
                    <button
                      type="button"
                      onClick={() => removeNavbarMenuItem(idx)}
                      className="text-slate-400 hover:text-red-600 transition-colors ml-1"
                      title="Remove Menu Item"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Menu Link Inputs */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 pt-2">
                <p className="text-[11px] font-bold text-slate-700">+ নতুন মেনু আইটেম বা লিংক যোগ করুন</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="মেনুর নাম (যেমন: ভর্তি)"
                    value={newMenuLabel}
                    onChange={(e) => setNewMenuLabel(e.target.value)}
                    className="h-8 text-xs bg-white border-slate-300"
                  />
                  <Input
                    placeholder="লিংক (যেমন: #admission)"
                    value={newMenuHref}
                    onChange={(e) => setNewMenuHref(e.target.value)}
                    className="h-8 text-xs bg-white border-slate-300"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={addNavbarMenuItem}
                  className="w-full h-8 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-sm"
                >
                  <PlusCircle size={14} className="mr-1.5" /> Add to Navbar Menu (মেনুতে যুক্ত করুন)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: ACTIVE SECTIONS LIST SELECTOR */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                <Layers size={15} className="text-teal-600" /> Active Sections Layout ({sections.length})
              </CardTitle>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-teal-700 font-bold hover:bg-teal-50" onClick={() => addSection(null)}>
                + Add Block
              </Button>
            </CardHeader>
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {sections.map((sec, idx) => (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedSectionId === sec.id
                        ? "bg-teal-600 text-white shadow-md ring-2 ring-teal-400/40"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    <span>{idx + 1}. {sec.title || sec.type}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CARD 3: ALWAYS-VISIBLE MAIN SECTION EDITOR */}
          {selectedSection ? (
            <Card className="border-teal-400 shadow-md bg-white">
              <CardHeader className="p-3.5 border-b border-slate-100 bg-slate-900 text-white rounded-t-xl flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase flex items-center gap-2 text-teal-400">
                  <Layers size={16} /> Editing Block: {selectedSection.type}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-white" onClick={() => moveSection(sections.findIndex(s=>s.id===selectedSection.id), -1)}>
                    <ArrowUp size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-white" onClick={() => moveSection(sections.findIndex(s=>s.id===selectedSection.id), 1)}>
                    <ArrowDown size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-900/50" onClick={() => deleteSection(selectedSection.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 space-y-5">
                {/* 1. SECTION TITLE & DESCRIPTION */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Heading Title (হেডিং লেখা)</label>
                    <Input
                      value={selectedSection.title || ""}
                      onChange={(e) => updateSelectedField("title", e.target.value)}
                      className="h-9 text-xs bg-white border-slate-300"
                      placeholder="হেডিং না চাইলে খালি রাখুন"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Subtitle / Description (বিস্তারিত বার্তা)</label>
                    <Textarea
                      value={selectedSection.subtitle || ""}
                      onChange={(e) => updateSelectedField("subtitle", e.target.value)}
                      className="text-xs bg-white min-h-[60px] border-slate-300"
                      placeholder="বর্ণনা না চাইলে খালি রাখুন"
                    />
                  </div>
                </div>

                {/* 2. PHOTO & SLIDE BANNER UPLOADER (ALWAYS VISIBLE) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ImageIcon size={16} className="text-teal-600" /> Slide / Banner Photo Uploader (ছবি যোগ করার জায়গা)
                  </label>

                  {selectedSection.image_url ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white p-2 space-y-2">
                      <img src={selectedSection.image_url} alt="Banner" className="w-full h-36 object-cover rounded-lg" />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-teal-700 font-bold flex items-center gap-1">
                          <CheckCircle2 size={13} /> Photo Active on Website
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-red-600 hover:bg-red-50 font-bold"
                          onClick={() => updateSelectedField("image_url", "")}
                        >
                          <Trash2 size={12} className="mr-1" /> Remove Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-dashed border-teal-400 text-center space-y-2">
                      <p className="text-xs text-slate-600">পিসি থেকে স্লাইড বা সেকশনের ছবি সিলেক্ট করুন</p>
                      <label className="cursor-pointer inline-block">
                        <div className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all">
                          <Upload size={14} /> {uploading ? "Uploading..." : "Upload Photo from PC"}
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageFileUpload} />
                      </label>
                    </div>
                  )}

                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] text-slate-500">or enter Image URL</label>
                    <Input
                      placeholder="https://example.com/banner.jpg"
                      value={selectedSection.image_url || ""}
                      onChange={(e) => updateSelectedField("image_url", e.target.value)}
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                </div>

                {/* 3. CUSTOM CODE EDITOR (ALWAYS VISIBLE TEXTAREA FOR CODE SECTIONS OR EXTRA CUSTOM CODE) */}
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Code size={16} /> Custom HTML / CSS Code Editor (কোড লেখার বক্স)
                  </label>
                  <Textarea
                    placeholder="<div style='padding:20px;'>আপনার কাস্টম HTML বা inline CSS কোড লিখুন...</div>"
                    value={selectedSection.custom_code || ""}
                    onChange={(e) => updateSelectedField("custom_code", e.target.value)}
                    className="font-mono text-xs bg-slate-950 text-teal-400 min-h-[120px] border-slate-800 focus:ring-teal-500"
                  />
                  <p className="text-[10px] text-slate-400">এখানে যেকোনো HTML, inline CSS বা iframe ইমবেড কোড লিখলে তা সরাসরি লাইভ ক্যানভাসে রান করবে।</p>
                </div>

                {/* 4. ACTION BUTTONS BUILDER */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <LinkIcon size={16} className="text-teal-600" /> Action Buttons (বাটন যোগ/সরাবার অপশন)
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Button 1 Text</label>
                      <Input
                        placeholder="Button 1 Text (e.g. ভর্তি)"
                        value={selectedSection.btn1_text || ""}
                        onChange={(e) => updateSelectedField("btn1_text", e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Button 1 URL</label>
                      <Input
                        placeholder="Link (e.g. #admission)"
                        value={selectedSection.btn1_link || ""}
                        onChange={(e) => updateSelectedField("btn1_link", e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Button 2 Text</label>
                      <Input
                        placeholder="Button 2 Text (e.g. নোটিশ)"
                        value={selectedSection.btn2_text || ""}
                        onChange={(e) => updateSelectedField("btn2_text", e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Button 2 URL</label>
                      <Input
                        placeholder="Link (e.g. #notices)"
                        value={selectedSection.btn2_link || ""}
                        onChange={(e) => updateSelectedField("btn2_link", e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. COLORS & ALIGNMENT */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Section Text Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={selectedSection.text_color || "#0f172a"}
                        onChange={(e) => updateSelectedField("text_color", e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded border border-slate-200"
                      />
                      <Input
                        value={selectedSection.text_color || "#0f172a"}
                        onChange={(e) => updateSelectedField("text_color", e.target.value)}
                        className="h-8 text-xs bg-white uppercase flex-1 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Section Background Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={selectedSection.bg || "#ffffff"}
                        onChange={(e) => updateSelectedField("bg", e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded border border-slate-200"
                      />
                      <Input
                        value={selectedSection.bg || "#ffffff"}
                        onChange={(e) => updateSelectedField("bg", e.target.value)}
                        className="h-8 text-xs bg-white uppercase flex-1 font-mono"
                      />
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          ) : null}

          {/* CARD 4: ADD NEW SECTION BLOCK PALETTE */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                <PlusCircle size={15} className="text-teal-600" /> Add New Section Block (১৪টি রেডি ব্লক)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {SECTION_TEMPLATES.map((tpl) => {
                  const IconComponent = typeof tpl.icon === "function" || typeof tpl.icon === "object" ? tpl.icon : Layers;
                  return (
                    <button
                      key={tpl.type}
                      onClick={() => addSection(tpl)}
                      className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-500 text-xs font-semibold text-slate-800 transition-all text-left truncate"
                    >
                      <IconComponent size={14} className="text-teal-600 shrink-0" />
                      <span className="truncate">{tpl.name}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT WORKSPACE (7 COLS): LIVE REAL-TIME PREVIEW CANVAS */}
        <div className="lg:col-span-7 space-y-3 sticky top-6">
          <div className="bg-slate-950 text-white p-3 rounded-2xl flex items-center justify-between shadow-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                <Monitor size={14} /> LIVE REAL-TIME PREVIEW CANVAS
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{slug}.platform.com</span>
          </div>

          {/* LIVE RENDERED PREVIEW CONTAINER */}
          <div className="rounded-2xl border-4 border-slate-800 overflow-hidden shadow-2xl bg-white max-h-[calc(100vh-180px)] overflow-y-auto ring-1 ring-slate-900/10">
            <DynamicTenantSiteRenderer
              slug={slug}
              orgName={schoolName}
              themeColor={themeSettings.primaryThemeColor}
              logoUrl={themeSettings.logoUrl}
              initialSections={sections}
              isPublished={true}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
