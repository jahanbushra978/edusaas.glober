import React from "react";

import Link from "next/link";

import { createPageUrl } from "@/utils";



export default function AdmissionBanner() {

  return (

    <section className="py-12 overflow-x-hidden">

      <div className="max-w-6xl mx-auto px-4">

        <div className="relative rounded-3xl overflow-hidden px-8 py-12 text-center"

          style={{

            background: "linear-gradient(135deg,#006400 0%,#008050 50%,#006400 100%)",

            boxShadow: "0 20px 60px rgba(0,100,60,0.35)",

          }}>

          {/* Pattern overlay */}

          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05]">

            <defs>

              <pattern id="admpat" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">

                <path d="M25 0L50 12.5V37.5L25 50L0 37.5V12.5Z" fill="none" stroke="#D4AF37" strokeWidth="0.6"/>

              </pattern>

            </defs>

            <rect width="100%" height="100%" fill="url(#admpat)" />

          </svg>

          {/* Gold glow */}

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 pointer-events-none"

            style={{ background: "radial-gradient(ellipse,rgba(212,175,55,0.15) 0%,transparent 70%)" }} />



          <div className="relative">

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"

              style={{ background: "rgba(212,175,55,0.18)", border: "1px solid rgba(212,175,55,0.45)", color: "#D4AF37" }}>

              📋 Admission Open — 2026

            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold italic text-white mb-3">

              Begin Your Journey with Rahmania Institute

            </h2>

            <p className="text-white/70 text-sm max-w-xl mx-auto mb-6 leading-relaxed">

              Enrol your child in a nurturing Islamic environment that combines authentic Quranic education with modern academics. Limited seats available — apply now.

            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">

              <Link href={createPageUrl("AdmissionChoicePage")}>

                <button className="px-8 py-3 rounded-xl font-bold italic text-sm transition-all hover:shadow-xl hover:-translate-y-0.5"

                  style={{ background: "linear-gradient(135deg,#D4AF37,#b8960a)", color: "#1a0c00" }}>

                  Apply for Admission

                </button>

              </Link>

              <a href="#contact">

                <button className="px-8 py-3 rounded-xl font-bold italic text-sm text-white border border-white/30 hover:bg-white/10 transition-all">

                  Contact for Info

                </button>

              </a>

            </div>

          </div>

        </div>

      </div>

    </section>

  );

}