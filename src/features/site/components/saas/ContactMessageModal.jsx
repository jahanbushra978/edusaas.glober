"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";

export default function ContactMessageModal({ isOpen, onClose }) {
  const [msgFormData, setMsgFormData] = useState({ name: "", phone: "", institution: "", message: "" });
  const [isSubmittingMsg, setIsSubmittingMsg] = useState(false);
  const [msgStatus, setMsgStatus] = useState({ success: null, message: "" });

  const handleSendQuickMsg = async (e) => {
    e.preventDefault();
    if (!msgFormData.name || (!msgFormData.phone && !msgFormData.message)) {
      setMsgStatus({ success: false, message: "দয়া করে আপনার নাম, মোবাইল নম্বর এবং বার্তাটি লিখুন।" });
      return;
    }
    setIsSubmittingMsg(true);
    setMsgStatus({ success: null, message: "" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgFormData),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setMsgStatus({ success: true, message: data.message || "আপনার মেসেজটি সফলভাবে মূল SaaS ড্যাশবোর্ডে জমা হয়েছে!" });
        setMsgFormData({ name: "", phone: "", institution: "", message: "" });
      } else {
        setMsgStatus({ success: false, message: data.message || "বার্তা পাঠাতে ব্যর্থ হয়েছে।" });
      }
    } catch {
      setMsgStatus({ success: false, message: "সার্ভারে কানেক্ট হতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।" });
    } finally {
      setIsSubmittingMsg(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#072421] border border-emerald-600/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center text-slate-950 font-black mb-3 shadow-lg">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-serif text-white">
                এডমিনকে সরাসরি মেসেজ পাঠান
              </h3>
              <p className="text-xs text-emerald-200/70 mt-1">
                এখানে মেসেজ পাঠালে তা সরাসরি মূল SaaS এডমিন কনসোলে জমা হবে।
              </p>
            </div>

            <form onSubmit={handleSendQuickMsg} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">আপনার নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="আপনার পুরো নাম লিখুন"
                  value={msgFormData.name}
                  onChange={(e) => setMsgFormData({ ...msgFormData, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  required
                  placeholder="যেমন: 01576600265"
                  value={msgFormData.phone}
                  onChange={(e) => setMsgFormData({ ...msgFormData, phone: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">মাদ্রাসা / শিক্ষা প্রতিষ্ঠানের নাম (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="প্রতিষ্ঠানের নাম"
                  value={msgFormData.institution}
                  onChange={(e) => setMsgFormData({ ...msgFormData, institution: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">বার্তা বা প্রশ্ন *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="আপনার প্রশ্ন বা বার্তা লিখুন..."
                  value={msgFormData.message}
                  onChange={(e) => setMsgFormData({ ...msgFormData, message: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {msgStatus.message && (
                <div className={`p-3 rounded-xl text-xs font-bold ${msgStatus.success ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400" : "bg-red-500/20 text-red-300 border border-red-400"}`}>
                  {msgStatus.message}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingMsg}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-slate-950 font-black text-xs shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingMsg ? "পাঠানো হচ্ছে..." : "🚀 অটো SaaS সিংক করে পাঠান"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20"
                >
                  বন্ধ করুন
                </button>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-white/10 text-[11px] text-white/50 flex justify-between items-center">
              <span>📞 হটলাইন: <a href="tel:01576600265" className="text-[#D4AF37] font-mono underline">01576600265</a></span>
              <span>✉️ <a href="mailto:rahkibulislambd788@gmail.com" className="text-[#D4AF37] underline">rahkibulislambd788@gmail.com</a></span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
