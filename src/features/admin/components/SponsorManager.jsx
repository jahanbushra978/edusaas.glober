"use client";
import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus, Pencil, Trash2, Loader2, ExternalLink, Tag, Building2,
  Eye, MousePointerClick, TrendingUp, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";
import { format } from "date-fns";

// ─── Default form state ───────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: "",
  title_bn: "",
  title_en: "",
  title_ar: "",
  company_name: "",
  company_name_bn: "",
  company_name_en: "",
  company_name_ar: "",
  description: "",
  description_bn: "",
  description_en: "",
  description_ar: "",
  image_url: "",
  target_url: "",
  button_text: "বিস্তারিত দেখুন",
  button_text_bn: "বিস্তারিত দেখুন",
  button_text_en: "Learn More",
  button_text_ar: "عرض التفاصيل",
  priority: 0,
  start_date: "",
  end_date: "",
  is_active: true,
};

// ─── SponsorForm dialog ───────────────────────────────────────────────────────
function SponsorForm({ sponsor, onSave, onCancel }) {
  const [form, setForm] = useState(
    sponsor
      ? {
          ...EMPTY_FORM,
          ...sponsor,
          title_bn: sponsor.title_bn || sponsor.title || "",
          title_en: sponsor.title_en || "",
          title_ar: sponsor.title_ar || "",
          company_name_bn: sponsor.company_name_bn || sponsor.company_name || "",
          company_name_en: sponsor.company_name_en || "",
          company_name_ar: sponsor.company_name_ar || "",
          description_bn: sponsor.description_bn || sponsor.description || "",
          description_en: sponsor.description_en || "",
          description_ar: sponsor.description_ar || "",
          button_text_bn: sponsor.button_text_bn || sponsor.button_text || "বিস্তারিত দেখুন",
          button_text_en: sponsor.button_text_en || "",
          button_text_ar: sponsor.button_text_ar || "",
          start_date: sponsor.start_date
            ? format(new Date(sponsor.start_date), "yyyy-MM-dd")
            : "",
          end_date: sponsor.end_date
            ? format(new Date(sponsor.end_date), "yyyy-MM-dd")
            : "",
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title_bn.trim() && !form.title_en.trim() && !form.title_ar.trim()) {
      toast.error("স্পনসরের নাম / টাইটেল দেওয়া প্রয়োজন");
      return;
    }
    setSaving(true);
    try {
      const fallbackTitle = form.title_bn || form.title_en || form.title_ar;
      const fallbackCompanyName = form.company_name_bn || form.company_name_en || form.company_name_ar;
      const fallbackDescription = form.description_bn || form.description_en || form.description_ar;
      const fallbackButtonText = form.button_text_bn || form.button_text_en || form.button_text_ar || "বিস্তারিত দেখুন";

      const payload = {
        ...form,
        title: fallbackTitle,
        company_name: fallbackCompanyName,
        description: fallbackDescription,
        button_text: fallbackButtonText,
        priority: Number(form.priority) || 0,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
        end_date:   form.end_date   ? new Date(form.end_date).toISOString()   : null,
      };
      await onSave(payload);
    } catch (err) {
      toast.error(err?.message || "সংরক্ষণ করতে সমস্যা হয়েছে");
      console.error({
        message: err?.message,
        stack: err?.stack,
        response: err?.response,
        data: err?.data,
        error: err
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-2">
      
      {/* Title Inputs */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-[#052E2B] uppercase tracking-wide">
          স্পনসরের নাম / টাইটেল *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">বাংলা *</span>
            <Input
              value={form.title_bn}
              onChange={(e) => f("title_bn", e.target.value)}
              placeholder="উদা: ইসলামী ব্যাংক"
              className="h-10 rounded-xl border-[#006241]/20 focus:border-[#006241]"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">English</span>
            <Input
              value={form.title_en}
              onChange={(e) => f("title_en", e.target.value)}
              placeholder="e.g. Islami Bank"
              className="h-10 rounded-xl border-[#006241]/20 focus:border-[#006241]"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">Arabic</span>
            <Input
              value={form.title_ar}
              onChange={(e) => f("title_ar", e.target.value)}
              placeholder="مثال: البنك الإسلامي"
              className="h-10 rounded-xl border-[#006241]/20 focus:border-[#006241]"
            />
          </div>
        </div>
      </div>

      {/* Company Name Inputs */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-[#052E2B] uppercase tracking-wide">
          কোম্পানির নাম (ঐচ্ছিক)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">বাংলা</span>
            <Input
              value={form.company_name_bn}
              onChange={(e) => f("company_name_bn", e.target.value)}
              placeholder="যেমন: এডুকেশন পার্টনার"
              className="h-10 rounded-xl border-[#006241]/20 focus:border-[#006241]"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">English</span>
            <Input
              value={form.company_name_en}
              onChange={(e) => f("company_name_en", e.target.value)}
              placeholder="e.g. Education Partner"
              className="h-10 rounded-xl border-[#006241]/20 focus:border-[#006241]"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">Arabic</span>
            <Input
              value={form.company_name_ar}
              onChange={(e) => f("company_name_ar", e.target.value)}
              placeholder="مثال: شريك التعليم"
              className="h-10 rounded-xl border-[#006241]/20 focus:border-[#006241]"
            />
          </div>
        </div>
      </div>

      {/* Description Inputs */}
      <div className="space-y-4 pt-1">
        <label className="text-xs font-bold text-[#052E2B] uppercase tracking-wide">
          সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)
        </label>
        <div className="space-y-2">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">বাংলা</span>
            <Textarea
              value={form.description_bn}
              onChange={(e) => f("description_bn", e.target.value)}
              placeholder="যেমন: শিক্ষা উন্নয়নে আমাদের সহযোগী..."
              rows={2}
              className="rounded-xl border-[#006241]/20 focus:border-[#006241] resize-none"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">English</span>
            <Textarea
              value={form.description_en}
              onChange={(e) => f("description_en", e.target.value)}
              placeholder="e.g. Supporting educational growth..."
              rows={2}
              className="rounded-xl border-[#006241]/20 focus:border-[#006241] resize-none"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">Arabic</span>
            <Textarea
              value={form.description_ar}
              onChange={(e) => f("description_ar", e.target.value)}
              placeholder="مثال: دعم التعليم وتطوير المعهد..."
              rows={2}
              className="rounded-xl border-[#006241]/20 focus:border-[#006241] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Banner Image */}
      <ImageUpload
        value={form.image_url}
        onChange={(url) => f("image_url", url)}
        label="ব্যানার ইমেজ"
      />

      {/* Target URL */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#052E2B] uppercase tracking-wide">
          ওয়েবসাইট লিংক (ঐচ্ছিক)
        </label>
        <Input
          value={form.target_url}
          onChange={(e) => f("target_url", e.target.value)}
          placeholder="https://example.com"
          className="h-11 rounded-xl border-[#006241]/20 focus:border-[#006241]"
        />
      </div>

      {/* Button Text Inputs */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-[#052E2B] uppercase tracking-wide">
          বাটনের লেখা
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">বাংলা</span>
            <Input
              value={form.button_text_bn}
              onChange={(e) => f("button_text_bn", e.target.value)}
              placeholder="উদা: বিস্তারিত দেখুন"
              className="h-10 rounded-xl border-[#006241]/20 focus:border-[#006241]"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">English</span>
            <Input
              value={form.button_text_en}
              onChange={(e) => f("button_text_en", e.target.value)}
              placeholder="e.g. Learn More"
              className="h-10 rounded-xl border-[#006241]/20 focus:border-[#006241]"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">Arabic</span>
            <Input
              value={form.button_text_ar}
              onChange={(e) => f("button_text_ar", e.target.value)}
              placeholder="مثال: عرض التفاصيل"
              className="h-10 rounded-xl border-[#006241]/20 focus:border-[#006241]"
            />
          </div>
        </div>
      </div>

      {/* Scheduling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#052E2B] uppercase tracking-wide flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" />
            শুরুর তারিখ (ঐচ্ছিক)
          </label>
          <Input
            type="date"
            value={form.start_date}
            onChange={(e) => f("start_date", e.target.value)}
            className="h-11 rounded-xl border-[#006241]/20 focus:border-[#006241]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#052E2B] uppercase tracking-wide flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-red-500" />
            শেষের তারিখ (ঐচ্ছিক)
          </label>
          <Input
            type="date"
            value={form.end_date}
            onChange={(e) => f("end_date", e.target.value)}
            className="h-11 rounded-xl border-[#006241]/20 focus:border-[#006241]"
          />
        </div>
      </div>

      {/* Priority & Active */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1.5 flex-1 min-w-[120px]">
          <label className="text-xs font-bold text-[#052E2B] uppercase tracking-wide">
            প্রায়রিটি নম্বর (কম = আগে)
          </label>
          <Input
            type="number"
            value={form.priority}
            onChange={(e) => f("priority", e.target.value)}
            min={0}
            placeholder="0"
            className="h-11 rounded-xl border-[#006241]/20 focus:border-[#006241]"
          />
        </div>
        <div className="flex items-center gap-3 pt-4">
          <Switch
            checked={form.is_active}
            onCheckedChange={(v) => f("is_active", v)}
            className="data-[state=checked]:bg-[#006241]"
          />
          <span className="text-sm font-semibold text-slate-700">
            {form.is_active ? "সक्रिय" : "নিষ্ক্রিয়"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-11 rounded-xl"
          disabled={saving}
        >
          বাতিল
        </Button>
        <Button
          type="submit"
          className="flex-1 h-11 rounded-xl"
          style={{
            background: "linear-gradient(135deg, #006241, #004D35)",
            color: "#fff",
          }}
          disabled={saving}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? "সংরক্ষণ হচ্ছে..." : (sponsor ? "আপডেট করুন" : "সংরক্ষণ করুন")}
        </Button>
      </div>
    </form>
  );
}



// ─── CTR badge ────────────────────────────────────────────────────────────────
function CTRBadge({ views, clicks }) {
  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";
  const good = parseFloat(ctr) >= 2;
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
        good ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {ctr}% CTR
    </span>
  );
}

// ─── Main Manager Component ───────────────────────────────────────────────────
export default function SponsorManager() {
  const [showForm, setShowForm]     = useState(false);
  const [editing,  setEditing]      = useState(null);
  const queryClient                 = useQueryClient();

  const { data: sponsors = [], isLoading } = useQuery({
    queryKey: ["admin-sponsors"],
    queryFn: () => appClient.entities.Sponsor.list("priority", 100),
  });

  const createMut = useMutation({
    mutationFn: (data) => appClient.entities.Sponsor.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["sponsors-public"] });
      toast.success("স্পনসর সফলভাবে যোগ করা হয়েছে!");
      setShowForm(false);
      setEditing(null);
    },
    onError: (err) => toast.error(err?.message || "যোগ করতে সমস্যা হয়েছে"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => appClient.entities.Sponsor.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["sponsors-public"] });
      toast.success("স্পনসর আপডেট হয়েছে!");
      setShowForm(false);
      setEditing(null);
    },
    onError: (err) => toast.error(err?.message || "আপডেট করতে সমস্যা হয়েছে"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => appClient.entities.Sponsor.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["sponsors-public"] });
      toast.success("স্পনসর মুছে ফেলা হয়েছে");
    },
    onError: (err) => toast.error(err?.message || "মুছতে সমস্যা হয়েছে"),
  });

  const handleSave = async (formData) => {
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, data: formData });
    } else {
      await createMut.mutateAsync(formData);
    }
  };

  const handleDelete = (sponsor) => {
    if (!confirm(`"${sponsor.title}" মুছে ফেলবেন?`)) return;
    deleteMut.mutate(sponsor.id);
  };

  const handleToggleActive = (sponsor) => {
    updateMut.mutate({
      id: sponsor.id,
      data: { is_active: !sponsor.is_active },
    });
  };

  const isScheduleActive = (s) => {
    const now = new Date();
    if (s.start_date && new Date(s.start_date) > now) return false;
    if (s.end_date   && new Date(s.end_date)   < now) return false;
    return true;
  };

  const totalViews  = sponsors.reduce((a, s) => a + (s.total_views  || 0), 0);
  const totalClicks = sponsors.reduce((a, s) => a + (s.total_clicks || 0), 0);

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#052E2B] flex items-center gap-2">
            <Tag className="h-5 w-5 text-[#D4AF37]" />
            Sponsor Management
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Homepage-এ sponsor ব্যানার পরিচালনা করুন
          </p>
        </div>
        <Button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="gap-2 rounded-xl h-10 font-bold"
          style={{
            background: "linear-gradient(135deg, #006241, #004D35)",
            color: "#fff",
          }}
        >
          <Plus className="h-4 w-4" /> নতুন স্পনসর যোগ করুন
        </Button>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "মোট স্পনসর", value: sponsors.length, icon: Building2,         color: "#006241" },
          { label: "সক্রিয়",      value: sponsors.filter((s) => s.is_active && isScheduleActive(s)).length, icon: Tag, color: "#D4AF37" },
          { label: "মোট ভিউ",    value: totalViews,  icon: Eye,                  color: "#1a56db" },
          { label: "মোট ক্লিক",  value: totalClicks, icon: MousePointerClick,     color: "#0e9f6e" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white border border-gray-100 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${stat.color}15` }}
            >
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── List ──────────────────────────────────────────────────────────── */}
      <Card className="rounded-[20px] border-gray-100 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-50 p-5">
          <CardTitle className="text-base font-bold text-[#052E2B]">
            সকল স্পনসর ({sponsors.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-14">
              <Loader2 className="h-7 w-7 animate-spin text-[#006241]" />
            </div>
          ) : sponsors.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Tag className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">কোনো স্পনসর নেই।</p>
              <p className="text-sm mt-1">উপরের বাটন থেকে নতুন স্পনসর যোগ করুন।</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {sponsors.map((sponsor) => {
                const active = sponsor.is_active && isScheduleActive(sponsor);
                const expired = sponsor.end_date && new Date(sponsor.end_date) < new Date();
                return (
                  <div
                    key={sponsor.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Banner preview */}
                    <div className="w-20 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200 shadow-sm">
                      {sponsor.image_url ? (
                        <img
                          src={sponsor.image_url} loading="lazy"
                          alt={sponsor.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, #006241, #004D35)" }}
                        >
                          <Building2 className="h-5 w-5 text-white/40" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-bold text-slate-800 text-sm truncate">
                          {sponsor.title}
                        </p>
                        <Badge
                          className={`text-[10px] px-2 py-0 rounded-full font-bold border-0 ${
                            active
                              ? "bg-emerald-50 text-emerald-700"
                              : expired
                              ? "bg-red-50 text-red-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {active ? "সক্রিয়" : expired ? "মেয়াদোত্তীর্ণ" : "নিষ্ক্রিয়"}
                        </Badge>
                      </div>
                      {sponsor.company_name && (
                        <p className="text-xs text-slate-500 truncate">
                          {sponsor.company_name}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {sponsor.total_views || 0}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3" /> {sponsor.total_clicks || 0}
                        </span>
                        <CTRBadge views={sponsor.total_views || 0} clicks={sponsor.total_clicks || 0} />
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> Priority: {sponsor.priority || 0}
                        </span>
                      </div>
                    </div>

                    {/* Date range */}
                    <div className="hidden md:block text-xs text-slate-400 text-right flex-shrink-0">
                      {sponsor.start_date && (
                        <p className="flex items-center gap-1 justify-end">
                          <Calendar className="h-3 w-3 text-emerald-500" />
                          {format(new Date(sponsor.start_date), "dd MMM yy")}
                        </p>
                      )}
                      {sponsor.end_date && (
                        <p className="flex items-center gap-1 justify-end mt-0.5">
                          <Calendar className="h-3 w-3 text-red-400" />
                          {format(new Date(sponsor.end_date), "dd MMM yy")}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Switch
                        checked={sponsor.is_active}
                        onCheckedChange={() => handleToggleActive(sponsor)}
                        className="data-[state=checked]:bg-[#006241] scale-90"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-[#006241]/5 text-[#006241]"
                        onClick={() => { setEditing(sponsor); setShowForm(true); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {sponsor.target_url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-blue-50 text-blue-500"
                          onClick={() =>
                            window.open(
                              sponsor.target_url.startsWith("http")
                                ? sponsor.target_url
                                : "https://" + sponsor.target_url,
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-red-50 text-red-500"
                        onClick={() => handleDelete(sponsor)}
                        disabled={deleteMut.isPending}
                      >
                        {deleteMut.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Form Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) { setShowForm(false); setEditing(null); } }}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#052E2B] flex items-center gap-2">
              <Tag className="h-5 w-5 text-[#D4AF37]" />
              {editing ? "স্পনসর সম্পাদনা করুন" : "নতুন স্পনসর যোগ করুন"}
            </DialogTitle>
          </DialogHeader>
          <SponsorForm
            sponsor={editing}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
