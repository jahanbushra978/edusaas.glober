import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Save, X, LayoutDashboard } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const SECTION_LABELS = {
  hero_slider:    { en: "Hero Slider",               bn: "হিরো স্লাইডার" },
  notice_board:   { en: "Notice Board",              bn: "নোটিশ বোর্ড" },
  about:          { en: "About / Introduction",       bn: "আমাদের পরিচিতি" },
  sponsors:       { en: "Sponsors Showcase",          bn: "স্পনসর" },
  academics:      { en: "Academics / Departments",    bn: "একাডেমিক বিভাগ" },
  why_us:         { en: "Why Us /特色",              bn: "কেন আমরা" },
  chairman_msg:   { en: "Chairman Message",           bn: "সভাপতির বাণী" },
  facilities:     { en: "Facilities",                bn: "সুবিধাসমূহ" },
  season_panels:  { en: "Season / Panels",           bn: "ঋতু/প্যানেল" },
  gallery:        { en: "Gallery / Departments",      bn: "গ্যালারি" },
  branches:       { en: "Branches",                  bn: "শাখাসমূহ" },
  teachers_intro: { en: "Meet Our Teachers",         bn: "শিক্ষকমণ্ডলী পরিচিতি" },
  admissions:     { en: "Admissions Section",        bn: "ভর্তি বিভাগ" },
  testimonials:   { en: "Testimonials",              bn: "প্রশংসাপত্র" },
  success_stories:{ en: "Success Stories",           bn: "সাফল্যের গল্প" },
  events:         { en: "Events & Seminars",         bn: "ইভেন্ট ও সেমিনার" },
  blogs:          { en: "Blogs / Articles",          bn: "ব্লগ ও আর্টিকেল" },
  faq:            { en: "FAQ Section",               bn: "FAQ বিভাগ" },
  portals:        { en: "Portal Login Cards",        bn: "পোর্টাল লগইন" },
  contact:        { en: "Contact Section",           bn: "যোগাযোগ" },
  footer:         { en: "Footer Information",        bn: "ফুটার তথ্য" },
};

function SectionEditor({ section, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title_en:    section.title_en    || "",
    title_bn:    section.title_bn    || "",
    title_ar:    section.title_ar    || "",
    subtitle_en: section.subtitle_en || "",
    subtitle_bn: section.subtitle_bn || "",
    subtitle_ar: section.subtitle_ar || "",
    body_en:     section.body_en     || "",
    body_bn:     section.body_bn     || "",
    body_ar:     section.body_ar     || "",
    items_json:  section.items_json  || "",
    is_visible:  section.is_visible !== false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (section.id) {
        await appClient.entities.PageSection.update(section.id, form);
      } else {
        await appClient.entities.PageSection.create({ ...form, section_key: section.section_key });
      }
      qc.invalidateQueries({ queryKey: [`page-section-${section.section_key}`] });
      onClose();
    } catch (error) {
      toast.error(error?.message || "Failed to save section");
      console.error("Section save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const label = SECTION_LABELS[section.section_key] || { en: section.section_key, bn: section.section_key };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-800">{label.en}</p>
            <p className="text-xs text-slate-400">{label.bn}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border">
            <Switch checked={form.is_visible} onCheckedChange={v => setForm(f => ({ ...f, is_visible: v }))} />
            <span className="text-sm font-medium">{form.is_visible ? "Visible on website" : "Hidden from website"}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Title (English)</label>
              <Input value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} placeholder="Section title in English" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Title (Bengali)</label>
              <Input value={form.title_bn} onChange={e => setForm(f => ({ ...f, title_bn: e.target.value }))} placeholder="বাংলায় শিরোনাম" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Title (Arabic)</label>
              <Input value={form.title_ar} onChange={e => setForm(f => ({ ...f, title_ar: e.target.value }))} placeholder="العنوان" dir="rtl" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Subtitle (English)</label>
              <Input value={form.subtitle_en} onChange={e => setForm(f => ({ ...f, subtitle_en: e.target.value }))} placeholder="Subtitle in English" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Subtitle (Bengali)</label>
              <Input value={form.subtitle_bn} onChange={e => setForm(f => ({ ...f, subtitle_bn: e.target.value }))} placeholder="বাংলায় সাবটাইটেল" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Subtitle (Arabic)</label>
              <Input value={form.subtitle_ar} onChange={e => setForm(f => ({ ...f, subtitle_ar: e.target.value }))} placeholder="عنوان فرعي" dir="rtl" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Body Text (English)</label>
              <Textarea rows={3} value={form.body_en} onChange={e => setForm(f => ({ ...f, body_en: e.target.value }))} placeholder="Body/description in English" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Body Text (Bengali)</label>
              <Textarea rows={3} value={form.body_bn} onChange={e => setForm(f => ({ ...f, body_bn: e.target.value }))} placeholder="বাংলায় বিবরণ" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Body Text (Arabic)</label>
              <Textarea rows={3} value={form.body_ar} onChange={e => setForm(f => ({ ...f, body_ar: e.target.value }))} placeholder="الوصف" dir="rtl" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Items JSON (advanced)</label>
            <Textarea rows={4} value={form.items_json} onChange={e => setForm(f => ({ ...f, items_json: e.target.value }))} placeholder='[{"titleEn":"...","titleBn":"...","descEn":"...","descBn":"...","icon":"📚"}]' className="font-mono text-xs" />
            <p className="text-[10px] text-slate-400 mt-1">Optional: JSON array to override default items in this section</p>
          </div>
        </div>
        <div className="p-5 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PageSectionManager() {
  const [editing, setEditing] = useState(null);

  const { data: allSections = [] } = useQuery({
    queryKey: ["all-page-sections"],
    queryFn: () => appClient.entities.PageSection.list(),
  });

  const sectionKeys = Object.keys(SECTION_LABELS);

  const getSectionData = (key) => allSections.find(s => s.section_key === key) || { section_key: key };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <LayoutDashboard className="h-5 w-5 text-primary" />
        <div>
          <h3 className="font-bold text-slate-800">Home Page Sections</h3>
          <p className="text-xs text-slate-500">Customize the content of each section on the public homepage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sectionKeys.map(key => {
          const data = getSectionData(key);
          const label = SECTION_LABELS[key];
          const isVisible = data.is_visible !== false;
          return (
            <Card key={key} className="border-primary/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">{label.en}</CardTitle>
                    <p className="text-xs text-slate-400">{label.bn}</p>
                  </div>
                  <Badge className={isVisible ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
                    {isVisible ? "Visible" : "Hidden"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1 mb-3">
                  {data.title_en && <p className="text-xs text-slate-600 font-medium truncate">{data.title_en}</p>}
                  {data.subtitle_en && <p className="text-xs text-slate-400 truncate">{data.subtitle_en}</p>}
                  {!data.title_en && <p className="text-xs text-slate-400 italic">Using default content</p>}
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setEditing(data)}>
                  <Pencil className="h-3 w-3" /> Edit Section
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editing && (
        <SectionEditor section={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}