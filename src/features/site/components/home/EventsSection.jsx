import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { Calendar, Clock, MapPin, User, ExternalLink, X, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";

export default function EventsSection({ events: propEvents }) {
  const { lang } = useLanguage();
  const isBn = lang === "bn";
  const isAr = lang === "ar";

  const [selectedEvent, setSelectedEvent] = useState(null);

  const { data: queryEvents = [], isLoading } = useQuery({
    queryKey: ["events-public"],
    queryFn: () => appClient.entities.Event.list("-event_date", 100),
    enabled: propEvents === undefined,
  });

  const events = propEvents || queryEvents;

  // Filter out invalid/empty events - keep it broad so no items are lost
  const activeEvents = events.filter(
    (e) => e.is_active !== false && (e.title || e.title_bn || e.title_en || e.title_ar || e.description || e.description_bn || e.description_en || e.description_ar)
  );

  const today = new Date();
  
  // Sort all events by date descending (most recent first)
  const sortedEvents = [...activeEvents].sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(lang === "bn" ? "bn-BD" : lang === "ar" ? "ar-EG" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatTime = (dateStr, manualTime) => {
    if (manualTime) return manualTime;
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString(lang === "bn" ? "bn-BD" : lang === "ar" ? "ar-EG" : "en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return "";
    }
  };

  const getLocalizedValue = (obj, field) => {
    if (!obj) return "";
    return obj[`${field}_${lang}`] || obj[field] || "";
  };

  // Skeleton view
  if (isLoading && activeEvents.length === 0) {
    return (
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-white via-emerald-50/15 to-white">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="h-6 w-32 bg-slate-100 rounded-full mx-auto animate-pulse" />
            <div className="h-10 w-64 bg-slate-200 rounded-lg mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (activeEvents.length === 0) {
    return null;
  }

  return (
    <section 
      className="py-16 md:py-24 px-4 transition-all duration-300 bg-transparent" 
      dir={isAr ? "rtl" : "ltr"}
      id="events-section"
    >
      <div className="max-w-6xl mx-auto font-sans">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3 uppercase tracking-widest bg-[#006241]/10 text-[#006241] border border-[#006241]/20 shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-[#006241]" />
            {isBn ? "আসন্ন ও বিগত ইভেন্টসমূহ" : isAr ? "الفعاليات والندوات" : "Events & Seminars"}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold italic text-[#006241] mb-3 leading-tight tracking-tight">
            {isBn ? "আমাদের মাদ্রাসার ইভেন্ট গ্যালারি" : isAr ? "فعاليات المعهد ونشاطاته" : "Madrasah Activities & Events"}
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#D4AF37]/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#D4AF37]/50" />
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {sortedEvents.slice(0, 6).map((e, idx) => {
            const title = getLocalizedValue(e, "title");
            const description = getLocalizedValue(e, "description");
            const shortDesc = description ? (description.slice(0, 100) + (description.length > 100 ? "..." : "")) : "";
            const eventTimeStr = formatTime(e.event_date, e.event_time);
            const location = e.location || (isBn ? "মাদরাসা ক্যাম্পাস" : isAr ? "حرم المعهد" : "Madrasah Campus");
            const organizer = e.organizer || (isBn ? "কর্তৃপক্ষ" : isAr ? "إدارة المعهد" : "Institute Admin");

            return (
              <div
                key={e.id || idx}
                className="bg-white rounded-3xl overflow-hidden border border-[#D4AF37]/15 shadow-[0_4px_16px_rgba(180,83,9,0.04)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(180,83,9,0.12)] hover:border-amber-200 group"
              >
                <div>
                  {/* Banner Image & Date Badge */}
                  <div className="relative h-48 bg-slate-50 overflow-hidden flex items-center justify-center border-b border-slate-100">
                    {e.banner_url ? (
                      <img src={e.banner_url} loading="lazy" alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-50/50 to-amber-100/30 flex items-center justify-center">
                        <Calendar className="h-16 w-16 text-amber-300 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                      </div>
                    )}
                    
                    {/* Date Badge Overlay */}
                    {e.event_date && (
                      <div className={`absolute top-4 ${isAr ? "left-4" : "right-4"} bg-[#006241] text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-md border border-[#D4AF37]/40 transition-all duration-300 group-hover:scale-105 group-hover:bg-[#004f34]`}>
                        {formatDate(e.event_date)}
                      </div>
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="p-6 space-y-3.5">
                    <h4 className="font-extrabold text-base text-[#052E2B] line-clamp-2 leading-snug group-hover:text-[#006241]">
                      {title}
                    </h4>
                    {shortDesc && (
                      <p className="text-xs md:text-sm text-slate-500 leading-relaxed line-clamp-3">
                        {shortDesc}
                      </p>
                    )}

                    {/* Detail list */}
                    <div className="space-y-2 pt-2 border-t border-slate-50 text-xs text-slate-500">
                      {eventTimeStr && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-[#D4AF37]" />
                          <span>{eventTimeStr}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
                        <span className="line-clamp-1">{location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="px-6 pb-6 pt-2 flex gap-3">
                  <button
                    onClick={() => setSelectedEvent(e)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 text-center transition-all"
                  >
                    {isBn ? "বিস্তারিত" : isAr ? "التفاصيل" : "Details"}
                  </button>

                  {e.event_date && new Date(e.event_date) >= today && e.registration_link && (
                    <a
                      href={e.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#006241] text-white hover:bg-[#004f34] text-center flex items-center justify-center gap-1 shadow-sm transition-all"
                    >
                      <span>{isBn ? "রেজিস্ট্রেশন" : isAr ? "تسجيل" : "Register"}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => { if (!open) setSelectedEvent(null); }}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-0 border-0 shadow-2xl bg-white">
          {selectedEvent && (() => {
            const title = getLocalizedValue(selectedEvent, "title");
            const description = getLocalizedValue(selectedEvent, "description");
            const eventTimeStr = formatTime(selectedEvent.event_date, selectedEvent.event_time);
            const location = selectedEvent.location || (isBn ? "মাদরাসা ক্যাম্পাস" : isAr ? "حرم المعهد" : "Madrasah Campus");
            const organizer = selectedEvent.organizer || (isBn ? "রাহমানিয়া ইনস্টিটিউট কর্তৃপক্ষ" : isAr ? "إدارة المعهد" : "Rahmania Institute Admin");
            const gallery = selectedEvent.event_gallery || [];
            const isUpcoming = new Date(selectedEvent.event_date) >= today;

            return (
              <div>
                <DialogTitle className="sr-only">{title}</DialogTitle>
                {/* Image Banner */}
                <div className="relative h-64 md:h-80 bg-slate-100 border-b">
                  {selectedEvent.banner_url ? (
                    <img src={selectedEvent.banner_url} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100/50 flex items-center justify-center">
                      <Calendar className="h-24 w-24 text-[#D4AF37]/35" />
                    </div>
                  )}
                  {/* Close button Overlay */}
                  <DialogClose className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-sm transition-colors border border-white/20">
                    <X className="h-4 w-4" />
                  </DialogClose>
                  
                  {/* Bottom title gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                      isUpcoming ? "bg-emerald-600 text-white" : "bg-slate-600 text-white"
                    }`}>
                      {isUpcoming 
                        ? (isBn ? "আসন্ন ইভেন্ট" : isAr ? "فعالية قادمة" : "Upcoming Event")
                        : (isBn ? "বিগত ইভেন্ট" : isAr ? "فعالية سابقة" : "Past Event")}
                    </span>
                    <h3 className="text-xl md:text-2xl font-extrabold leading-tight">
                      {title}
                    </h3>
                  </div>
                </div>

                {/* Event Parameters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50 border-b text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4.5 w-4.5 text-[#D4AF37] flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date</p>
                      <p className="text-slate-800 font-semibold">{formatDate(selectedEvent.event_date)}</p>
                    </div>
                  </div>
                  {eventTimeStr && (
                    <div className="flex items-center gap-2.5">
                      <Clock className="h-4.5 w-4.5 text-[#D4AF37] flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Time</p>
                        <p className="text-slate-800 font-semibold">{eventTimeStr}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4.5 w-4.5 text-[#D4AF37] flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location</p>
                      <p className="text-slate-800 font-semibold line-clamp-1">{location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <User className="h-4.5 w-4.5 text-[#D4AF37] flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Organizer</p>
                      <p className="text-slate-800 font-semibold line-clamp-1">{organizer}</p>
                    </div>
                  </div>
                </div>

                {/* Description Body */}
                <div className="p-6 md:p-8 space-y-6">
                  {description && (
                    <div className="space-y-4">
                      <h5 className="font-extrabold text-sm text-[#052E2B] uppercase tracking-wider border-l-4 border-[#D4AF37] pl-3">
                        {isBn ? "বিস্তারিত বিবরণ" : isAr ? "تفاصيل الفعالية" : "Event Description"}
                      </h5>
                      <p className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-serif">
                        {description}
                      </p>
                    </div>
                  )}

                  {/* Optional registration section inside dialog */}
                  {isUpcoming && selectedEvent.registration_link && (
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between flex-wrap gap-4 mt-6">
                      <div className="space-y-0.5">
                        <h6 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wide">
                          {isBn ? "অনলাইন রেজিস্ট্রেশন চলছে" : isAr ? "التسجيل عبر الإنترنت مفتوح" : "Online Registration Open"}
                        </h6>
                        <p className="text-[10px] text-slate-500">
                          {isBn ? "আসন সংখ্যা সীমিত, আজই আপনার নাম নিবন্ধন করুন।" : isAr ? "المقاعد محدودة، سجل اسمك اليوم." : "Seats are limited, reserve your slot today."}
                        </p>
                      </div>
                      <a
                        href={selectedEvent.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 inline-flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <span>{isBn ? "নিবন্ধন করুন" : isAr ? "سجل الآن" : "Register Now"}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}

                  {/* Event Gallery */}
                  {gallery && gallery.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h5 className="font-extrabold text-sm text-[#052E2B] uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon className="h-4.5 w-4.5 text-[#D4AF37]" />
                        {isBn ? "ইভেন্ট ফটো গ্যালারি" : isAr ? "معرض صور الفعالية" : "Event Photo Gallery"}
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {gallery.map((imgUrl, i) => (
                          <div key={i} className="aspect-video bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                            <img src={imgUrl} alt={`Gallery ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </section>
  );
}
