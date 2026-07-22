'use client'

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin, Facebook, Youtube, ChevronRight, Globe } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { useTranslation } from "@/lib/translations"
const LOGO_URL = "/rahmania-logo-v2.png"

export default function Footer({ user: userProp }) {
  const { lang } = useLanguage()
  const t = useTranslation(lang)
  const instNameEn = "Rahmania Institute"
  const user = userProp

  return (
    <footer className="border-t border-white/[0.08]" style={{ background: "#0c0e0d" }}>
      <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-8 border-b border-white/10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className={`flex flex-col sm:flex-row gap-5 mb-5 ${lang === "ar" ? "sm:flex-row-reverse" : ""}`}>
              <div className="relative shrink-0 mx-auto sm:mx-0">
                <div
                  className="relative flex h-16 w-16 md:h-[4.5rem] md:w-[4.5rem] items-center justify-center rounded-full bg-white p-1 border-2 border-[#D4AF37] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:scale-105"
                >
                  <div className="h-full w-full rounded-full overflow-hidden flex items-center justify-center bg-white">
                    <Image src={LOGO_URL} alt={instNameEn} width={100} height={100} className="h-full w-auto max-h-full object-contain rounded-full" />
                  </div>
                </div>
              </div>
              <div className={`min-w-0 flex-1 text-center sm:text-left ${lang === "ar" ? "sm:text-right" : ""}`}>
                <p className="font-extrabold italic text-white text-sm md:text-base leading-tight tracking-tight">{lang === "bn" ? t.contactSection.title : lang === "ar" ? t.contactSection.title : instNameEn}</p>
                <p className="text-[11px] md:text-xs italic mt-1" style={{ color: "rgba(212,175,55,0.9)" }}>{t.footer.tagline}</p>
              </div>
            </div>
            <p className={`text-xs text-white/70 italic leading-relaxed ${lang === "ar" ? "text-right" : "text-left"}`}>
              {t.footer.mission}
            </p>
          </div>
          <div>
            <p className="font-bold italic text-sm mb-4" style={{ color: "#D4AF37" }}>{lang === "bn" ? "দ্রুত লিঙ্ক" : t.footer.quickLinks}</p>
            <div className="space-y-2">
              <Link href="/StudentLogin" className={`flex items-center gap-1.5 text-xs italic text-white/70 hover:text-white/90 transition-colors duration-200 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                <ChevronRight className={`h-3 w-3 shrink-0 text-[#D4AF37] ${lang === "ar" ? "rotate-180" : ""}`} />
                {t.portals.studentTitle}
              </Link>
              <Link href="/TeacherLogin" className={`flex items-center gap-1.5 text-xs italic text-white/70 hover:text-white/90 transition-colors duration-200 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                <ChevronRight className={`h-3 w-3 shrink-0 text-[#D4AF37] ${lang === "ar" ? "rotate-180" : ""}`} />
                {t.portals.teacherTitle}
              </Link>
              {user?.role === "admin" && (
                <Link href="/admin" className={`flex items-center gap-1.5 text-xs italic text-white/70 hover:text-white/90 transition-colors duration-200 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                  <ChevronRight className={`h-3 w-3 shrink-0 text-[#D4AF37] ${lang === "ar" ? "rotate-180" : ""}`} />
                  {lang === "bn" ? "অ্যাডমিন ড্যাশবোর্ড" : lang === "en" ? "Admin Dashboard" : t.portals.adminTitle}
                </Link>
              )}
            </div>
          </div>
          <div>
            <p className="font-bold italic text-sm mb-4" style={{ color: "#D4AF37" }}>{t.footer.social}</p>
            <div className="flex gap-3">
              <a href="https://rahmaniainstitute.org" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent border border-[#D4AF37]/60 hover:border-[#D4AF37] hover:scale-110 transition-all duration-200" aria-label="Website">
                <Globe className="h-4 w-4 text-[#D4AF37]" />
              </a>
              <a href="https://www.facebook.com/RahmaniaInstituteHifzMadrasagazipur" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent border border-[#D4AF37]/60 hover:border-[#D4AF37] hover:scale-110 transition-all duration-200" aria-label="Facebook">
                <Facebook className="h-4 w-4 text-[#D4AF37]" />
              </a>
              <a href="https://www.youtube.com/@RahmaniaInstitute1700" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent border border-[#D4AF37]/60 hover:border-[#D4AF37] hover:scale-110 transition-all duration-200" aria-label="YouTube">
                <Youtube className="h-4 w-4 text-[#D4AF37]" />
              </a>
            </div>
          </div>
          <div>
            <p className="font-bold italic text-sm mb-4" style={{ color: "#D4AF37" }}>{t.footer.contact}</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-white/70 text-xs italic"><Phone className="h-4 w-4 shrink-0" style={{ color: "#D4AF37" }} /> +8801906898939</div>
              <div className="flex items-center gap-2 text-white/70 text-xs italic"><Mail className="h-4 w-4 shrink-0" style={{ color: "#D4AF37" }} /> rahmaniainstitute.org@gmail.com</div>
              <div className="flex items-start gap-2 text-white/70 text-xs italic"><MapPin className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#D4AF37" }} />{lang === "bn" ? "হাড়িনাল, গাজীপুর সিটি, ঢাকা, বাংলাদেশ" : `${t.contactSection.harinal}, ${t.contactSection.dhaka}`}</div>
            </div>
          </div>
        </div>
        <div className="py-8 border-b border-white/10 text-center px-2">
          <p className="text-sm md:text-base font-medium italic leading-relaxed break-words" style={{ color: "#D4AF37" }}>
            {t.footer.quote.trim().replace(/^"+|"+$/g, "").trim()}
          </p>
          <p className="text-xs text-white/55 mt-3 italic">— {lang === "bn" ? t.contactSection.title : lang === "ar" ? t.contactSection.title : instNameEn}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-center sm:text-left">
          <p className="text-white/50 text-[10px] md:text-[11px] italic">
            © 2026 {lang === "bn" ? t.contactSection.title : lang === "ar" ? t.contactSection.title : instNameEn}. {t.common.copyright}
          </p>
          <p className="text-[10px] md:text-[11px] italic flex flex-wrap items-center justify-center sm:justify-end gap-x-1 gap-y-0.5">
            <span className="text-white/50 not-italic">{lang === "bn" ? "Created by" : t.common.createdBy}</span>
            <span className="font-medium not-italic" style={{ color: "#D4AF37" }}>Rakibul Islam</span>
            <span className="font-medium not-italic" style={{ color: "#D4AF37" }}>— 01576600265</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
