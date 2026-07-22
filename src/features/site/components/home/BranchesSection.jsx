import React from "react";
import Link from "next/link";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, User, Building2, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";

export default function BranchesSection({ branches: propBranches }) {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isAr = lang === "ar";
  const isBn = lang === "bn";
  
  const localizedName = (b) =>
    isBn ? (b.name_bn || b.name_en || b.name_ar) : isAr ? (b.name_ar || b.name_en || b.name_bn) : (b.name_en || b.name_bn || b.name_ar);

  const localizedAddress = (b) =>
    isBn ? (b.address_bn || b.address_en || b.address_ar) : isAr ? (b.address_ar || b.address_en || b.address_bn) : (b.address_en || b.address_bn || b.address_ar);

  const { data: fetchedBranches = [] } = useQuery({
    queryKey: ["branches-public"],
    queryFn: () => appClient.entities.Branch.list("sort_order", 50),
    select: d => d.filter(b => b.is_active !== false),
    enabled: propBranches === undefined,
  });

  const branches = propBranches !== undefined
    ? propBranches.filter(b => b.is_active !== false)
    : fetchedBranches;

  if (branches.length === 0) return null;

  return (
    <section id="branches-section" className="py-14 scroll-mt-24 bg-transparent">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3 uppercase tracking-widest bg-[#ECFDF5] text-[#006241] border border-[#ECFDF5] shadow-sm">
            {t.branches.badge}
          </div>
          <h2 className="text-2xl font-extrabold text-[#1E6B52]">
            {t.branches.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {branches.map((b) => {
            const validSlug = b.slug && b.slug !== "-" ? b.slug : b.id;
            return (
              <Link href={`/branch/${encodeURIComponent(validSlug)}`} key={b.id} className="block group cursor-pointer">
                <div className={`rounded-2xl p-5 border border-emerald-500/20 shadow-[0_4px_16px_rgba(0,100,60,0.06)] bg-[#ecfdf5] transition-all duration-500 ease-spring hover:-translate-y-[6px] hover:scale-[1.03] hover:border-[#619769]/40 hover:shadow-[0_20px_60px_-38px_rgba(0,100,60,0.45)] hover:bg-[#d1fae5] ${isAr ? 'text-right' : ''}`}
                  style={{ willChange: "transform" }}
                >
                <div className={`flex items-center gap-3 mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(5,46,22,0.08)", border: "1px solid rgba(5,46,22,0.15)" }}>
                    <Building2 className="h-5 w-5 text-[#052E16]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#052E16] text-sm break-words" dir={isAr ? "rtl" : "auto"}>
                      {localizedName(b)}
                    </p>
                    {b.established_year && (
                      <p className="text-xs text-[#052E16]/75">
                        {isBn ? `প্রতিষ্ঠা: ${b.established_year}` : isAr ? `تأسس عام: ${b.established_year}` : `Est. ${b.established_year}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {localizedAddress(b) && (
                    <div className={`flex items-start gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-[#052E16]" />
                      <span className="text-xs text-[#052E16]/85 font-medium" dir={isAr ? "rtl" : "auto"}>
                        {localizedAddress(b)}
                      </span>
                    </div>
                  )}
                  {b.phone && (
                    <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <Phone className="h-3.5 w-3.5 flex-shrink-0 text-[#052E16]" />
                      <span className="text-xs text-[#052E16]/85 font-medium hover:text-[#052E16] transition-colors">{b.phone}</span>
                    </div>
                  )}
                  {b.head_teacher && (
                    <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <User className="h-3.5 w-3.5 flex-shrink-0 text-[#052E16]" />
                      <span className="text-xs text-[#052E16]/85 font-medium">
                        {isBn ? `প্রধান শিক্ষক: ${b.head_teacher}` : isAr ? `مدير الفرع: ${b.head_teacher}` : `Head: ${b.head_teacher}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className={`mt-5 flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${isAr ? "flex-row-reverse" : ""}`}
                  style={{ background: "rgba(212,175,55,0.15)" }}
                >
                  <span className="text-xs font-semibold" style={{ color: "#1E6B52" }}>
                    {isBn ? "বিস্তারিত দেখুন" : isAr ? "عرض التفاصيل" : "View Details"}
                  </span>
                  <ChevronRight className={`h-4 w-4 text-[#6C8664] ${isAr ? "rotate-180" : ""}`} />
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
