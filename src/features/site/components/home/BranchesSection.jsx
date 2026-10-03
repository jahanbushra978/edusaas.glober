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
    isBn ? (b.name_bn || b.branch_name || b.name_en || b.name_ar) : isAr ? (b.name_ar || b.name_bn || b.name_en || b.branch_name) : (b.name_en || b.branch_name || b.name_bn || b.name_ar);

  const localizedAddress = (b) =>
    isBn ? (b.address_bn || b.address_en || b.address_ar) : isAr ? (b.address_ar || b.address_en || b.address_bn) : (b.address_en || b.address_bn || b.address_ar);

  const { data: fetchedBranches = [] } = useQuery({
    queryKey: ["branches-public"],
    queryFn: () => appClient.entities.Branch.list("sort_order", 50),
    select: d => d.filter(b => b.is_active !== false),
    enabled: propBranches === undefined,
  });

  const rawBranches = propBranches !== undefined
    ? propBranches.filter(b => b.is_active !== false)
    : fetchedBranches;

  // Deduplicate by ID to guarantee fresh, unique branch items
  const branches = Array.from(new Map(rawBranches.map(b => [b.id || b.slug || b.name_bn, b])).values());

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {branches.map((b) => {
            const validSlug = b.slug && b.slug !== "-" ? b.slug : b.id;
            const coverImage = b.card_image_url || b.image_url || (Array.isArray(b.slider_images) && b.slider_images.length > 0 ? b.slider_images[0] : "") || b.logo || "";
            return (
              <Link 
                href={`/branch/${encodeURIComponent(validSlug)}`} 
                key={b.id} 
                className="flex flex-col h-full group cursor-pointer"
              >
                <div 
                  className={`rounded-2xl sm:rounded-3xl overflow-hidden border border-emerald-500/20 shadow-[0_4px_16px_rgba(0,100,60,0.06)] bg-[#ecfdf5] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-emerald-400/40 flex flex-col h-full w-full justify-between ${isAr ? 'text-right' : ''}`}
                >
                  {/* Branch Cover Image: Fixed aspect container for 100% equal alignment */}
                  <div className="w-full h-44 sm:h-48 overflow-hidden relative bg-slate-100 dark:bg-emerald-950/20 shrink-0">
                    {coverImage ? (
                      <>
                        <img
                          src={coverImage}
                          alt={localizedName(b)}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-950/10">
                        <Building2 className="h-12 w-12 text-[#052E16]/30" />
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div className="flex-1 flex flex-col">
                      {/* Logo + Name Header with min-height for uniform alignment */}
                      <div className={`flex items-start gap-3.5 mb-4 min-h-[3.75rem] sm:min-h-[4.25rem] ${isAr ? 'flex-row-reverse' : ''}`}>
                        <div 
                          className="w-12 h-12 rounded-xl bg-white border border-emerald-100 shadow-xs flex items-center justify-center p-1.5 shrink-0 overflow-hidden mt-0.5"
                        >
                          {b.logo ? (
                            <img src={b.logo} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <Building2 className="h-6 w-6 text-[#052E16]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[#052E16] text-base leading-snug break-words" dir={isAr ? "rtl" : "auto"}>
                            {localizedName(b)}
                          </p>
                          {b.established_year && (
                            <p className="text-xs text-[#052E16]/75 font-medium mt-1">
                              {isBn ? `Est. ${b.established_year}` : isAr ? `تأسس عام: ${b.established_year}` : `Est. ${b.established_year}`}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Details List */}
                      <div className="space-y-2.5 mt-auto pt-2 border-t border-emerald-500/10">
                        {localizedAddress(b) && (
                          <div className={`flex items-start gap-2.5 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#052E16]" />
                            <span className="text-xs text-[#052E16]/85 font-medium leading-relaxed break-words" dir={isAr ? "rtl" : "auto"}>
                              {localizedAddress(b)}
                            </span>
                          </div>
                        )}
                        {b.phone && (
                          <div className={`flex items-center gap-2.5 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                            <Phone className="h-4 w-4 shrink-0 text-[#052E16]" />
                            <span className="text-xs text-[#052E16]/85 font-medium break-all">{b.phone}</span>
                          </div>
                        )}
                        {b.head_teacher && (
                          <div className={`flex items-start gap-2.5 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                            <User className="h-4 w-4 shrink-0 mt-0.5 text-[#052E16]" />
                            <span className="text-xs text-[#052E16]/85 font-medium leading-relaxed break-words">
                              {isBn ? `Head: ${b.head_teacher}` : isAr ? `مدير الفرع: ${b.head_teacher}` : `Head: ${b.head_teacher}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Pill Button - strictly anchored to card bottom */}
                    <div className="mt-5 pt-1 shrink-0">
                      <div 
                        className={`w-full py-2.5 px-4 rounded-xl bg-[#e5efe0] group-hover:bg-[#d8e8d2] text-[#1b4332] font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-xs ${isAr ? 'flex-row-reverse' : ''}`}
                      >
                        <span>{isBn ? 'View Details' : isAr ? 'عرض التفاصيل' : 'View Details'}</span>
                        <ChevronRight className={`h-4 w-4 text-[#1b4332] transition-transform duration-300 group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                      </div>
                    </div>
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
