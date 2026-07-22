'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { GraduationCap, UserCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-bn">
      
      {/* Container */}
      <div className="w-full max-w-4xl flex flex-col items-center">
        
        {/* Logo */}
        <div className="mb-6">
          <Link href="/">
            <Image
              src="/rahmania-logo-v2.png"
              alt="Rahmania Institute Logo"
              width={120}
              height={120}
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
              priority
            />
          </Link>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#12715B] mb-2">
            লগইন করুন
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">
            শিক্ষার্থী ও শিক্ষক পোর্টালে প্রবেশ করুন
          </p>
        </div>

        {/* Cards Grid */}
        <div className="w-full max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Student Card */}
          <Link
            href="/StudentLogin"
            className="group flex flex-col items-center text-center p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_30px_rgba(18,113,91,0.15)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-blue-100">
              <GraduationCap className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-[#12715B] transition-colors">
              শিক্ষার্থী
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              শিক্ষার্থী পোর্টালে প্রবেশ করুন
            </p>
            <div className="w-full py-3 px-6 rounded-xl bg-[#12715B] text-white font-bold text-sm hover:bg-[#0e5c4a] transition-colors shadow-md">
              শিক্ষার্থী লগইন
            </div>
          </Link>

          {/* Teacher Card */}
          <Link
            href="/TeacherLogin"
            className="group flex flex-col items-center text-center p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_30px_rgba(18,113,91,0.15)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-emerald-100">
              <UserCheck className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-[#12715B] transition-colors">
              শিক্ষক
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              শিক্ষক পোর্টালে প্রবেশ করুন
            </p>
            <div className="w-full py-3 px-6 rounded-xl bg-[#12715B] text-white font-bold text-sm hover:bg-[#0e5c4a] transition-colors shadow-md">
              শিক্ষক লগইন
            </div>
          </Link>

        </div>

      </div>
    </div>
  );
}
