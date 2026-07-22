import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SESSIONS = [
  { key: "নূরানী", en: "Noorani", ar: "نوراني" },
  { key: "নাজেরা", en: "Nazera", ar: "ناظرة" },
  { key: "হিফয", en: "Hifz", ar: "تحفيظ" },
  { key: "হিফয শুনানি", en: "Hifz Shunani", ar: "تسميع تحفيظ" },
  { key: "কিন্ডারগার্টেন", en: "Kindergarten", ar: "روضة الأطفال" },
  { key: "কিতাবখানা", en: "Kitab Khana", ar: "كتاب خانة" },
  { key: "English Version", en: "English Version", ar: "النسخة الإنجليزية" }
];

export default function AdmissionForm({ branchId }) {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isBn = lang === "bn";
  const isAr = lang === "ar";

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
      await appClient.entities.AdmissionApplication.create({ ...form, photo_url, status: "pending", ...(branchId ? { branch_id: branchId } : {}) });
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(t.admissionForm.fields.submitError || "Submission failed. Please try again.");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(160deg,#0e2e1f 0%,#144733 50%,#0e2e1f 100%)" }}>
        <div className="bg-white rounded-3xl p-10 text-center max-w-md w-full shadow-2xl">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-emerald-600" />
          <h2 className="text-2xl font-extrabold italic text-slate-800 mb-2">
            {t.admissionForm.successTitle}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {t.admissionForm.successDesc}
          </p>
          <Link href="/">
            <button className="px-8 py-3 rounded-xl font-bold italic text-white text-sm"
              style={{ background: "linear-gradient(135deg,#006400,#008050)" }}>
              {t.common.backHome}
            </button>
          </Link>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 block">{t.admissionForm.fields.nameBn}</label>
              <Input placeholder={t.admissionForm.fields.placeholderNameBn}
                className="rounded-xl h-11 border-slate-200 focus:border-emerald-500"
                value={form.full_name_bn} onChange={e => f("full_name_bn", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 block">{t.admissionForm.fields.nameEn}</label>
              <Input placeholder={t.admissionForm.fields.placeholderNameEn}
                className="rounded-xl h-11 border-slate-200 focus:border-emerald-500 font-sans"
                value={form.full_name_en} onChange={e => f("full_name_en", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 block">{t.admissionForm.fields.nameAr}</label>
              <Input placeholder={t.admissionForm.fields.placeholderNameAr}
                className="rounded-xl h-11 border-slate-200 focus:border-emerald-500"
                value={form.full_name_ar} onChange={e => f("full_name_ar", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 block">{t.admissionForm.fields.fatherName}</label>
              <Input placeholder={t.admissionForm.fields.placeholderFather}
                className="rounded-xl h-11 border-slate-200 focus:border-emerald-500"
                value={form.father_name} onChange={e => f("father_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 block">{t.admissionForm.fields.motherName}</label>
              <Input placeholder={t.admissionForm.fields.placeholderMother}
                className="rounded-xl h-11 border-slate-200 focus:border-emerald-500"
                value={form.mother_name} onChange={e => f("mother_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 block">{t.admissionForm.fields.dob}</label>
              <Input type="date" className="rounded-xl h-11 border-slate-200 font-sans"
                value={form.date_of_birth} onChange={e => f("date_of_birth", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 block">{t.admissionForm.fields.mobile}</label>
              <Input placeholder={t.admissionForm.fields.placeholderMobile}
                className="rounded-xl h-11 border-slate-200 focus:border-emerald-500 font-sans"
                value={form.mobile_number} onChange={e => f("mobile_number", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 block">{t.admissionForm.fields.dept}</label>
              <Input placeholder={t.admissionForm.fields.placeholderDept}
                className="rounded-xl h-11 border-slate-200 focus:border-emerald-500"
                value={form.desired_session} onChange={e => f("desired_session", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-900 block">{t.admissionForm.fields.address}</label>
            <Textarea placeholder={t.admissionForm.fields.placeholderAddress}
              className="rounded-xl border-slate-200 min-h-[100px]"
              value={form.address} onChange={e => f("address", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-900 block">{t.admissionForm.fields.prevEdu}</label>
            <Input placeholder={t.admissionForm.fields.placeholderPrevEdu}
              className="rounded-xl h-11 border-slate-200"
              value={form.previous_education} onChange={e => f("previous_education", e.target.value)} />
          </div>

          <button type="submit" disabled={submitting || uploading}
            className={`w-full h-14 rounded-2xl font-bold italic text-white text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-700/20 ${isAr ? 'flex-row-reverse' : ''}`}
            style={{ background: "linear-gradient(135deg,#006400,#008050)" }}>
            {(submitting || uploading) && <Loader2 className="h-5 w-5 animate-spin" />}
            {uploading ? t.admissionForm.uploading :
              submitting ? t.admissionForm.submitting :
              t.admissionForm.submitBtn}
          </button>
        </form>
      </div>
    </div>
  );
}