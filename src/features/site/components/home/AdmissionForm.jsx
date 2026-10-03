import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, CheckCircle2, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { printMadrasahAdmissionDirect } from "@/features/applications/utils/printMadrasahAdmissionForm";

export default function AdmissionForm({ branchId }) {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isAr = lang === "ar";

  const { data: settings = {} } = useQuery({
    queryKey: ["app-settings-admission-form"],
    queryFn: async () => {
      const list = await appClient.entities.AppSettings.listAll().catch(() => []);
      return list[0] || {};
    },
    staleTime: 300000,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches-admission-form"],
    queryFn: () => appClient.entities.Branch.listAll().catch(() => []),
    staleTime: 300000,
  });

  const currentBranch = branches.find(b => String(b.id) === String(branchId)) || branches[0] || null;

  const [form, setForm] = useState({
    full_name_bn: "",
    full_name_en: "",
    full_name_ar: "",
    date_of_birth: "",
    father_name: "",
    mother_name: "",
    mobile_number: "",
    address: "",
    desired_session: "",
    previous_education: "",
    photo_url: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name_en) {
      toast.error(t.admissionForm.fields.requiredError);
      return;
    }
    setSubmitting(true);
    let photo_url = "";
    if (photoFile) {
      setUploading(true);
      try {
        const res = await appClient.integrations.Core.UploadFile({ file: photoFile });
        photo_url = res.file_url;
      } catch (err) {
        console.error("Photo upload error:", err);
      }
      setUploading(false);
    }
    try {
      const payload = {
        ...form,
        photo_url,
        ...(branchId ? { branch_id: branchId } : {}),
      };
      const res = await fetch("/api/public/admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "Submission failed");
      }
      setSubmittedData({ ...payload, id: data?.data?.id || data?.id });
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(t.admissionForm.fields.submitError || "Submission failed. Please try again.");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{ background: "linear-gradient(160deg,#0e2e1f 0%,#144733 50%,#0e2e1f 100%)" }}>
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center max-w-lg w-full shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
              {t.admissionForm.successTitle || "ভর্তির আবেদন সফল হয়েছে!"}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.admissionForm.successDesc || "আপনার আবেদনটি সফলভাবে সিস্টেমে দাখিল হয়েছে। নিচের বাটন থেকে আবেদন ফরমটি প্রিন্ট করে মাদরাসা অফিসে জমা দিন।"}
            </p>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 flex-wrap gap-1">
              <span>শিক্ষার্থী: {submittedData?.full_name_bn || submittedData?.full_name_en}</span>
              <span>বিভাগ: {submittedData?.desired_session || "—"}</span>
            </div>
            <p className="text-xs text-emerald-700">
              📌 <strong>নির্দেশনা:</strong> ফরমটি প্রিন্ট করে প্রয়োজনীয় সনদের ফটোকপি ও ২ কপি পাসপোর্ট সাইজ ছবিসহ মাদরাসা অফিসে জমা দিন।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => printMadrasahAdmissionDirect({
                admission: submittedData,
                settings,
                branch: currentBranch,
              })}
              className="w-full flex-1 py-3 px-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 bg-[#004D3A] hover:bg-[#003829] transition-all"
            >
              <Printer className="h-4 w-4" />
              🖨️ ভর্তি আবেদন ফরম প্রিন্ট করুন
            </button>
            <Link href="/" className="w-full sm:w-auto">
              <button className="w-full py-3 px-5 rounded-xl font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-sm transition-all">
                {t.common.backHome}
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-10 px-4 bg-slate-50 ${isAr ? 'direction-rtl' : ''}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className={`mb-8 ${isAr ? 'text-right' : ''}`}>
          <Link href="/" className={`inline-flex items-center gap-1.5 text-sm italic text-slate-500 hover:text-emerald-700 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
            <ArrowLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
            {t.common.backHome}
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3 uppercase tracking-widest bg-emerald-50 border border-emerald-200 text-emerald-700">
              {t.admissionForm.badge}
            </div>
            <h1 className="text-3xl font-extrabold italic text-slate-900">
              {t.admissionForm.title}
            </h1>
            <p className="text-sm text-slate-500 mt-2 italic">
              {t.admissionForm.subtitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}
          className={`rounded-3xl p-8 sm:p-10 space-y-6 shadow-xl border border-slate-100 bg-white ${isAr ? 'text-right' : ''}`}>

          {/* Photo upload */}
          <div className="flex flex-col items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-50 flex items-center justify-center bg-slate-50 shadow-inner">
              {photoPreview
                ? <img src={photoPreview} loading="lazy" alt="Preview" className="w-full h-full object-cover" />
                : <Upload className="h-10 w-10 text-slate-300" />}
            </div>
            <label className="cursor-pointer px-5 py-2.5 rounded-xl text-xs font-bold italic bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md">
              {t.admissionForm.uploadPhoto}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold italic text-slate-700 mb-1.5 block">
                {t.admissionForm.fields.nameBn}
              </label>
              <Input
                value={form.full_name_bn}
                onChange={e => f("full_name_bn", e.target.value)}
                placeholder="যেমন: মুহাম্মদ আবদুল্লাহ"
                className="rounded-xl border-slate-200 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold italic text-slate-700 mb-1.5 block">
                {t.admissionForm.fields.nameEn} <span className="text-red-500">*</span>
              </label>
              <Input
                required
                value={form.full_name_en}
                onChange={e => f("full_name_en", e.target.value)}
                placeholder="e.g. Muhammad Abdullah"
                className="rounded-xl border-slate-200 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold italic text-slate-700 mb-1.5 block">
              {t.admissionForm.fields.nameAr}
            </label>
            <Input
              value={form.full_name_ar}
              onChange={e => f("full_name_ar", e.target.value)}
              placeholder="مثال: محمد عبد الله"
              dir="rtl"
              className="rounded-xl border-slate-200 focus:border-emerald-500"
            />
          </div>

          {/* DOB & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold italic text-slate-700 mb-1.5 block">
                {t.admissionForm.fields.dob}
              </label>
              <Input
                type="date"
                value={form.date_of_birth}
                onChange={e => f("date_of_birth", e.target.value)}
                className="rounded-xl border-slate-200 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold italic text-slate-700 mb-1.5 block">
                {t.admissionForm.fields.mobile} <span className="text-red-500">*</span>
              </label>
              <Input
                required
                type="tel"
                value={form.mobile_number}
                onChange={e => f("mobile_number", e.target.value)}
                placeholder="01XXXXXXXXX"
                className="rounded-xl border-slate-200 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Parents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold italic text-slate-700 mb-1.5 block">
                {t.admissionForm.fields.fatherName}
              </label>
              <Input
                value={form.father_name}
                onChange={e => f("father_name", e.target.value)}
                className="rounded-xl border-slate-200 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold italic text-slate-700 mb-1.5 block">
                {t.admissionForm.fields.motherName}
              </label>
              <Input
                value={form.mother_name}
                onChange={e => f("mother_name", e.target.value)}
                className="rounded-xl border-slate-200 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Session & Prev Edu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold italic text-slate-700 mb-1.5 block">
                {t.admissionForm.fields.desiredSession}
              </label>
              <Input
                value={form.desired_session}
                onChange={e => f("desired_session", e.target.value)}
                placeholder="যেমন: হিফজুল কুরআন / কিতাব বিভাগ"
                className="rounded-xl border-slate-200 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold italic text-slate-700 mb-1.5 block">
                {t.admissionForm.fields.previousEducation}
              </label>
              <Input
                value={form.previous_education}
                onChange={e => f("previous_education", e.target.value)}
                placeholder="যেমন: নাজেরা সমাপ্ত"
                className="rounded-xl border-slate-200 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-bold italic text-slate-700 mb-1.5 block">
              {t.admissionForm.fields.address}
            </label>
            <Textarea
              rows={3}
              value={form.address}
              onChange={e => f("address", e.target.value)}
              placeholder="গ্রাম/রোড, ডাকঘর, থানা, জেলা..."
              className="rounded-xl border-slate-200 focus:border-emerald-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full py-4 rounded-2xl font-black italic text-white text-base shadow-xl flex items-center justify-center gap-2 hover:opacity-95 transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#006400,#008050)" }}
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t.admissionForm.submitting}
              </>
            ) : (
              t.admissionForm.submit
            )}
          </button>
        </form>
      </div>
    </div>
  );
}