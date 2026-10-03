"use client";
import React, { useState, useEffect } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { APPLICATION_TYPES_LIST } from "@/lib/permissions-definitions";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Paperclip, AlertTriangle, Send, Save, Eye } from "lucide-react";
import { toast } from "sonner";
import PrintableApplicationModal from "./PrintableApplicationModal";

export default function ApplicationForm({
  applicant,        // { id, name, type: 'teacher'|'student', branch_id }
  existingApp,      // for edit mode
  onSubmit,         // async fn(data, saveAsDraft)
  onCancel,
  loading = false,
}) {
  const isEdit = !!existingApp;
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const { data: appSettings = {} } = useQuery({
    queryKey: ["app-settings-form"],
    queryFn: async () => {
      const list = await appClient.entities.AppSettings.listAll().catch(() => []);
      return list[0] || {};
    },
    staleTime: 300000,
  });

  const { data: allBranches = [] } = useQuery({
    queryKey: ["branches-list-form"],
    queryFn: () => appClient.entities.Branch.listAll().catch(() => []),
    staleTime: 300000,
  });

  const [form, setForm] = useState({
    type:          existingApp?.type          || "",
    from_date:     existingApp?.from_date     || "",
    to_date:       existingApp?.to_date       || "",
    reason:        existingApp?.reason        || "",
    priority:      existingApp?.priority      || "normal",
    attachment_url: existingApp?.attachment_url || "",
    custom_title:   existingApp?.custom_title   || "",
  });

  const [uploading, setUploading] = useState(false);
  const [daysCount, setDaysCount] = useState(0);

  // Auto-calculate days
  useEffect(() => {
    if (form.from_date && form.to_date) {
      try {
        const diff = differenceInCalendarDays(parseISO(form.to_date), parseISO(form.from_date)) + 1;
        setDaysCount(Math.max(0, diff));
      } catch { setDaysCount(0); }
    } else {
      setDaysCount(0);
    }
  }, [form.from_date, form.to_date]);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    setUploading(true);
    try {
      const result = await appClient.integrations.Core.UploadFile({
        file,
        folder: "applications",
        label: `app-attachment-${applicant.id}`,
      });
      update("attachment_url", result.url || result.secure_url || "");
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (saveAsDraft = false) => {
    if (!form.type)   return toast.error("আবেদনের ধরন নির্বাচন করুন");
    if (!form.reason.trim()) return toast.error("কারণ লিখুন");

    // Date validation for date-based types
    const dateRequiredTypes = ["leave", "home_leave", "late_entry", "early_leave", "hostel_permission", "exam_permission"];
    if (dateRequiredTypes.includes(form.type) && (!form.from_date || !form.to_date)) {
      return toast.error("তারিখ উল্লেখ করুন");
    }

    await onSubmit(form, saveAsDraft);
  };

  // Which types need date fields
  const needsDates = ["leave", "home_leave", "late_entry", "early_leave", "hostel_permission", "exam_permission"].includes(form.type);

  return (
    <div className="space-y-5">

      {/* Application Type */}
      <div>
        <Label className="text-xs font-bold text-slate-700 mb-1.5 block">
          আবেদনের ধরন (Application Type) <span className="text-red-500">*</span>
        </Label>
        <Select value={form.type} onValueChange={v => update("type", v)}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="আবেদনের ধরন বেছে নিন..." />
          </SelectTrigger>
          <SelectContent>
            {APPLICATION_TYPES_LIST.map(t => (
              <SelectItem key={t.value} value={t.value}>
                {t.label.bn} <span className="text-slate-400 text-xs ml-1">({t.label.en})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Title if Type is Other */}
      {form.type === "other" && (
        <div>
          <Label className="text-xs font-bold text-slate-700 mb-1.5 block">
            আবেদনের বিষয় / শিরোনাম (Subject Title) <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="উদাহরণ: বৃত্তি আবেদন, বিশেষ সুবিধা, বাসস্থান পরিবর্তন..."
            value={form.custom_title || ""}
            onChange={e => update("custom_title", e.target.value)}
            className="h-10 text-sm"
          />
        </div>
      )}

      {/* Date fields — only for relevant types */}
      {needsDates && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs font-bold text-slate-700 mb-1.5 block">From Date</Label>
            <Input type="date" value={form.from_date} onChange={e => update("from_date", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-700 mb-1.5 block">To Date</Label>
            <Input
              type="date"
              value={form.to_date}
              min={form.from_date}
              onChange={e => update("to_date", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-700 mb-1.5 block">মোট দিন</Label>
            <div className="h-10 flex items-center px-3 rounded-md border bg-slate-50 text-slate-700 font-bold text-sm">
              {daysCount > 0 ? `${daysCount} দিন` : "—"}
            </div>
          </div>
        </div>
      )}

      {/* Priority */}
      <div>
        <Label className="text-xs font-bold text-slate-700 mb-1.5 block">Priority</Label>
        <div className="flex gap-3">
          {[
            { value: "normal", label: "সাধারণ (Normal)", color: "border-slate-300 text-slate-600" },
            { value: "urgent", label: "🚨 জরুরি (Urgent)", color: "border-red-400 text-red-600 bg-red-50" },
          ].map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => update("priority", p.value)}
              className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all
                ${form.priority === p.value ? `${p.color} ring-2 ring-offset-1 ring-current` : "border-slate-200 text-slate-400"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reason */}
      <div>
        <Label className="text-xs font-bold text-slate-700 mb-1.5 block">
          কারণ (Reason) <span className="text-red-500">*</span>
        </Label>
        <Textarea
          value={form.reason}
          onChange={e => update("reason", e.target.value)}
          placeholder="আবেদনের বিস্তারিত কারণ লিখুন..."
          rows={4}
          className="resize-none text-sm"
        />
        <p className="text-[10px] text-slate-400 mt-1">{form.reason.length} characters</p>
      </div>

      {/* Attachment */}
      <div>
        <Label className="text-xs font-bold text-slate-700 mb-1.5 block flex items-center gap-1.5">
          <Paperclip size={13} /> সংযুক্তি (Attachment) <span className="text-slate-400 font-normal">(Optional)</span>
        </Label>
        {form.attachment_url ? (
          <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Paperclip size={14} className="text-emerald-600" />
            <span className="text-xs text-emerald-700 font-medium truncate flex-1">File attached</span>
            <button
              type="button"
              onClick={() => update("attachment_url", "")}
              className="text-[10px] text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all">
            {uploading ? (
              <Loader2 size={16} className="animate-spin text-slate-400" />
            ) : (
              <Paperclip size={16} className="text-slate-400" />
            )}
            <span className="text-sm text-slate-500">{uploading ? "Uploading..." : "Click to attach a file (PDF, image, max 5MB)"}</span>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        )}
      </div>

      {/* Applicant info reminder */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
        <AlertTriangle size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700">
          আবেদনকারী: <strong>{applicant.name}</strong> | শাখা: Branch #{applicant.branch_id}
          {isEdit && (
            <span className="ml-2 text-orange-600 font-semibold">(Edit Mode)</span>
          )}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2.5 pt-2 border-t flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={loading || uploading}
        >
          বাতিল
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (!form.type) return toast.error("আবেদনের ধরন বেছে নিন");
            setShowPreviewModal(true);
          }}
          className="flex items-center gap-1.5 border-emerald-600 text-emerald-800 hover:bg-emerald-50 text-xs font-bold"
        >
          <Eye size={14} className="text-emerald-600" />
          দরখাস্ত প্রিভিউ
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSubmit(true)}
          disabled={loading || uploading}
          className="flex items-center gap-1.5 text-xs"
        >
          <Save size={14} />
          খসড়া সংরক্ষণ
        </Button>
        <Button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={loading || uploading}
          className="flex-1 bg-[#004D3A] hover:bg-[#003829] text-white flex items-center justify-center gap-1.5 font-bold"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {isEdit ? "আপডেট করুন" : "আবেদন দাখিল করুন"}
        </Button>
      </div>

      {/* Printable Preview Modal */}
      <PrintableApplicationModal
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        application={{
          id: existingApp?.id || 0,
          application_number: existingApp?.application_number || "APP-DRAFT-PREVIEW",
          type: form.type || "leave",
          custom_title: form.custom_title,
          applicant_type: applicant.type || "student",
          applicant_id: applicant.id,
          applicant_name: applicant.name,
          branch_id: applicant.branch_id,
          from_date: form.from_date,
          to_date: form.to_date,
          days_count: daysCount,
          reason: form.reason || "আবেদনের বিবরণ...",
          priority: form.priority,
          status: existingApp?.status || "draft",
          submitted_at: existingApp?.submitted_at || new Date().toISOString(),
        }}
        settings={appSettings}
        branch={allBranches.find(b => String(b.id) === String(applicant.branch_id))}
        applicantDetails={applicant}
        timeline={[]}
      />
    </div>
  );
}
