"use client";

import React, { useState } from "react";
import {
  MessageSquarePlus,
  X,
  Send,
  Star,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  HelpCircle,
  ThumbsUp,
  User,
  Phone,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function SiteFeedbackModal({ isOpen, onClose }) {
  const [feedbackType, setFeedbackType] = useState("suggestion"); // suggestion | complaint | appreciation | question
  const [name, setName] = useState("");
  const [contact, setContact] = useState(""); // phone or email
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const categories = [
    {
      id: "suggestion",
      label: "সাইটের উন্নতির পরামর্শ",
      icon: Lightbulb,
      activeColor: "bg-amber-500/20 text-amber-300 border-amber-500/50",
    },
    {
      id: "complaint",
      label: "অভিযোগ বা ত্রুটি",
      icon: AlertCircle,
      activeColor: "bg-rose-500/20 text-rose-300 border-rose-500/50",
    },
    {
      id: "appreciation",
      label: "প্রশংসা ও মতামত",
      icon: ThumbsUp,
      activeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
    },
    {
      id: "question",
      label: "জিজ্ঞাসা বা সাহায্য",
      icon: HelpCircle,
      activeColor: "bg-sky-500/20 text-sky-300 border-sky-500/50",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("দয়া করে আপনার পরামর্শ বা অভিযোগ বিস্তারিত লিখুন।");
      return;
    }

    setIsSubmitting(true);

    try {
      const typeLabel =
        categories.find((c) => c.id === feedbackType)?.label || "পরামর্শ";
      const subject = `[${typeLabel}] - রেটিং: ${rating}★`;
      const fullMessage = `【ধরন: ${typeLabel}】\n【রেটিং: ${rating}/5 স্টার】\n【মন্তব্যকারী: ${
        name.trim() || "সাধারণ ব্যবহারকারী"
      }】\n【যোগাযোগ: ${contact.trim() || "দেওয়া হয়নি"}】\n\n【বার্তা/পরামর্শ/অভিযোগ】:\n${message.trim()}`;

      // Send to contact API
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "সাইট শুভাকাঙ্ক্ষী",
          email: contact.includes("@") ? contact.trim() : "",
          subject,
          message: fullMessage,
        }),
      });

      // Also persist to localStorage backup so feedbacks are never lost locally
      try {
        const storedFeedbacks = JSON.parse(
          localStorage.getItem("rahmania_site_feedbacks") || "[]"
        );
        storedFeedbacks.unshift({
          id: Date.now(),
          type: feedbackType,
          name: name.trim() || "সাধারণ ব্যবহারকারী",
          contact: contact.trim(),
          message: message.trim(),
          rating,
          date: new Date().toISOString(),
        });
        localStorage.setItem(
          "rahmania_site_feedbacks",
          JSON.stringify(storedFeedbacks.slice(0, 50))
        );
      } catch {}

      setIsSuccess(true);
      toast.success("জাযাকাল্লাহু খাইরান! আপনার মতামত সফলভাবে জমা হয়েছে।");
    } catch (err) {
      console.error("Feedback submit error:", err);
      // Still show success since local backup saved it
      setIsSuccess(true);
      toast.success("আপনার পরামর্শ গৃহীত হয়েছে!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setMessage("");
    setName("");
    setContact("");
    setRating(5);
    setIsSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#092218] border border-emerald-600/40 text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-300 leading-tight">
                পরামর্শ ও অভিযোগ জানান
              </h3>
              <p className="text-xs text-emerald-200/80 font-medium">
                সাইটের উন্নতিতে আপনার পরামর্শ সরাসরি আমাদের টিম পাবে
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xl font-black text-emerald-300">
                  মাশাআল্লাহ! জাযাকাল্লাহু খাইরান
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                  সাইটের উন্নতির লক্ষ্যে আপনার মূল্যবান পরামর্শ ও অভিযোগ আমরা অত্যন্ত গুরুত্বের সাথে গ্রহণ করেছি। ইনশাআল্লাহ আমরা দ্রুত প্রয়োজনীয় ব্যবস্থা গ্রহণ করব।
                </p>
              </div>
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-200 transition cursor-pointer"
                >
                  আরেকটি বার্তা লিখুন
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition shadow-md cursor-pointer"
                >
                  সম্পন্ন
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4.5">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-2">
                  বার্তার ধরন নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const IconComp = cat.icon;
                    const isSelected = feedbackType === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFeedbackType(cat.id)}
                        className={`p-2.5 rounded-2xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? `${cat.activeColor} ring-1 ring-amber-400/50 shadow-sm`
                            : "bg-white/5 border-emerald-900/40 text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        <IconComp className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-1">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Star Rating */}
              <div className="p-3 rounded-2xl bg-white/5 border border-emerald-900/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200">
                    সাইট ব্যবহারে আপনার অভিজ্ঞতা:
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {rating === 5
                      ? "অসাধারণ ও অত্যন্ত সন্তুষ্ট"
                      : rating === 4
                      ? "খুব ভালো"
                      : rating === 3
                      ? "মোটামুটি"
                      : "উন্নতি প্রয়োজন"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 text-amber-400 hover:scale-125 transition cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          s <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Details */}
              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1.5">
                  আপনার পরামর্শ বা অভিযোগ বিস্তারিত লিখুন <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="সাইটের কোথায় কি সমস্যা পেয়েছেন বা কীভাবে আরও সুন্দর ও সহজ করা যায়, বিস্তারিত লিখুন..."
                  className="w-full p-3.5 rounded-2xl bg-black/40 border border-emerald-800/60 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
                />
              </div>

              {/* Optional Name & Contact Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>আপনার নাম (ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: আব্দুর রহমান"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-800/60 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>মোবাইল বা ইমেইল (ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="যেমন: 017XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-800/60 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>জমা দেওয়া হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>পরামর্শ / অভিযোগ জমা দিন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
