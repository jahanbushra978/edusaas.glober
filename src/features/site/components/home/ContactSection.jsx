import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock, Loader2, CheckCircle } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { appClient } from "@/api/appClient";

export default function ContactSection() {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const trans = t.contactSection;
  const isAr = lang === "ar";
  const [form, setForm] = useState({ name: "", contact: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setSending(true);
    try {
      await appClient.entities.ContactMessage.create({
        name: form.name.trim(),
        email: form.contact.trim(),
        subject: form.subject.trim(),
        message: form.contact.trim() + "\n\n" + form.message.trim(),
        is_read: false,
      });
      setSent(true);
      setForm({ name: "", contact: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact-section" className="py-16 scroll-mt-20 overflow-x-hidden relative" style={{ background: "#052E16" }}>
      {/* Subtle pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]" style={{ position: "absolute" }}>
        <defs>
          <pattern id="ctpat" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M30 0L60 15V45L30 60L0 45V15Z" fill="none" stroke="#22C55E" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ctpat)" />
      </svg>

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold italic text-white mb-4 tracking-tight">
            {lang === 'bn' ? 'যোগাযোগ করুন ' : lang === 'ar' ? 'اتصل بـ ' : 'Contact '}
            <span style={{ color: "#22C55E" }}>{lang === 'bn' ? 'রহমানিয়া ইনস্টিটিউট' : lang === 'ar' ? 'معهد الرحمانية' : 'Rahmania Institute'}</span>
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-green-400/40" />
            <div className="w-2 h-2 rounded-full" style={{ background: "#22C55E" }} />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-green-400/40" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info cards */}
          <div className="space-y-4 lg:col-span-1">
            {[
              {
                icon: Phone, label: trans.callUs, value: "01906898939",
                sub: trans.officeDays + ": " + trans.officeTime,
                href: "tel:01906898939", color: "#4ade80",
              },
              {
                icon: Mail, label: trans.emailUs, value: "rahmaniainstitute.org@gmail.com",
                sub: lang === 'bn' ? "আমরা ২৪ ঘণ্টার মধ্যে উত্তর দিই" : lang === 'ar' ? "نرد خلال ٢٤ ساعة" : "We reply within 24 hours",
                href: "https://mail.google.com/mail/?view=cm&fs=1&to=rahmaniainstitute.org@gmail.com", target: "_blank", rel: "noopener noreferrer", color: "#60a5fa",
              },
              {
                icon: MapPin, label: trans.location, value: trans.harinal,
                sub: trans.dhaka,
                href: "#", color: "#f59e0b",
              },
              {
                icon: Clock, label: trans.hours, value: trans.officeDays,
                sub: trans.officeTime,
                href: null, color: "#22C55E",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className={`rounded-2xl p-4 flex items-center gap-4 transition-all hover:shadow-lg group ${isAr ? 'flex-row-reverse text-right' : ''}`}
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(10px)" }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${item.color}22`, border: `1.5px solid ${item.color}44` }}>
                    <Icon className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/40 italic uppercase tracking-wide truncate">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} target={item.target} rel={item.rel} className="text-sm font-bold italic text-white hover:text-green-300 transition-colors block truncate">{item.value}</a>
                    ) : (
                      <p className="text-sm font-bold italic text-white truncate">{item.value}</p>
                    )}
                    <p className="text-xs text-white/40 mt-0.5 truncate">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message form */}
          <form onSubmit={handleSubmit} className={`lg:col-span-2 rounded-2xl p-6 ${isAr ? 'text-right' : ''}`}
            style={{ background: "linear-gradient(135deg, #041f0f, #031c0e)", border: "1px solid rgba(34, 197, 94, 0.25)" }}>
            <h3 className="font-bold italic text-white text-base mb-4">{trans.sendMessage}</h3>
            {sent ? (
              <div className="flex items-center justify-center gap-3 py-8 text-green-400">
                <CheckCircle className="h-6 w-6" />
                <span className="font-bold italic">{lang === 'bn' ? 'বার্তা পাঠানো হয়েছে!' : lang === 'ar' ? 'تم إرسال الرسالة!' : 'Message sent!'}</span>
              </div>
            ) : (
              <>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 ${isAr ? 'direction-rtl' : ''}`}>
                  <input placeholder={trans.namePlaceholder} value={form.name} onChange={handleChange("name")}
                    className={`w-full px-4 py-2.5 rounded-xl text-base outline-none italic transition-all focus:ring-2 focus:ring-green-400/50 touch-manipulation bg-transparent border border-white/20 text-white placeholder-white/40 ${isAr ? 'text-right' : ''}`}
                    required />
                  <input placeholder={trans.contactPlaceholder} value={form.contact} onChange={handleChange("contact")}
                    className={`w-full px-4 py-2.5 rounded-xl text-base outline-none italic transition-all focus:ring-2 focus:ring-green-400/50 touch-manipulation bg-transparent border border-white/20 text-white placeholder-white/40 ${isAr ? 'text-right' : ''}`} />
                </div>
                <input placeholder={trans.subjectPlaceholder} value={form.subject} onChange={handleChange("subject")}
                  className={`w-full px-4 py-2.5 rounded-xl text-base outline-none italic mb-4 transition-all focus:ring-2 focus:ring-green-400/50 touch-manipulation bg-transparent border border-white/20 text-white placeholder-white/40 ${isAr ? 'text-right' : ''}`} />
                <textarea rows={4} placeholder={trans.messagePlaceholder} value={form.message} onChange={handleChange("message")}
                  className={`w-full px-4 py-2.5 rounded-xl text-base outline-none italic resize-none mb-4 transition-all focus:ring-2 focus:ring-green-400/50 touch-manipulation bg-transparent border border-white/20 text-white placeholder-white/40 ${isAr ? 'text-right' : ''}`}
                  required />
                <button type="submit" disabled={sending}
                  className="w-full py-3 rounded-xl font-bold italic text-white text-sm transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95 touch-manipulation disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#22C55E,#16a34a)" }}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {sending ? (lang === 'bn' ? 'পাঠানো হচ্ছে...' : lang === 'ar' ? 'جارٍ الإرسال...' : 'Sending...') : trans.sendBtn}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

