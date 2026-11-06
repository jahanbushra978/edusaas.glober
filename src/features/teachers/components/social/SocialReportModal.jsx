import React, { useState } from "react";
import { X, Flag, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const REPORT_REASONS = [
  "অনুপযুক্ত বা অনৈসলামিক বিষয়বস্তু",
  "ভুল বা বিভ্রান্তিকর কুরআন/হাদিস উদ্ধৃতি",
  "স্প্যাম বা অপ্রাসঙ্গিক বিজ্ঞাপন",
  "অশালীন ভাষা বা ব্যক্তিগত আক্রমণ",
  "কপিরাইট বা অন্যের কন্টেন্ট চুরি",
  "অন্যান্য আপত্তিকর আচরণ",
];

export default function SocialReportModal({ targetType, targetId, onClose }) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/teacher-marketplace/social/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          reason,
          details: details.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "রিপোর্ট জমা দিতে ব্যর্থ হয়েছে।");
      }

      toast.success(data.message || "রিপোর্ট জমা নেওয়া হয়েছে। একাডেমি টিম এটি যাচাই করবে।");
      onClose();
    } catch (err) {
      toast.error(err.message || "রিপোর্ট দাখিলে ত্রুটি ঘটেছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-600" />
            <span>আপত্তি বা অভিযোগ দাখিল করুন</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-slate-600 dark:text-stone-300 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              আপনার অভিযোগটি একাডেমি পরিচালনা কমিটির কাছে সরাসরি পৌঁছাবে। কুরআন শিক্ষার পবিত্রতা রক্ষায় সঠিক কারণ নির্বাচন করুন।
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-stone-300">
              অভিযোগের মূল কারণ নির্বাচন করুন:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-stone-300">
              অতিরিক্ত বিবরণ (ঐচ্ছিক):
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="সুনির্দিষ্ট রেফারেন্স বা সমস্যার বিবরণ লিখুন..."
              rows={3}
              className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 resize-none font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md shadow-red-600/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "জমা হচ্ছে..." : "রিপোর্ট জমা দিন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

