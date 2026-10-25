import React from "react";
import Link from "next/link";
import { Building2, PhoneCall, Mail, MapPin } from "lucide-react";

export default function SaaSFooter() {
  return (
    <footer id="contact" className="bg-[#020e0c] text-slate-400 pt-16 pb-8 border-t border-slate-800 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
        <div className="space-y-5 lg:col-span-2">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#052E2B] to-emerald-700 flex items-center justify-center border border-[#D4AF37]/30">
              <Building2 className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="font-black text-white text-base font-serif">EduSaaS<span className="text-[#D4AF37]">.global</span></span>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Smart Education Platform</p>
            </div>
          </Link>
          <p className="text-xs leading-relaxed max-w-sm">
            বাংলাদেশের স্কুল ও মাদরাসার জন্য #১ ক্লাউড এডটেক প্ল্যাটফর্ম। প্রতিটি প্রতিষ্ঠানের নিজস্ব ডাইনামিক ওয়েবসাইট, বায়োমেট্রিক হাজিরা ও অটো রেজাল্ট ইঞ্জিন।
          </p>
          <div className="flex gap-3">
            <a
              href="https://wa.me/8801576600265"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-[#D4AF37] hover:text-slate-950 flex items-center justify-center transition-colors text-slate-400"
            >
              <PhoneCall className="h-4 w-4" />
            </a>
            <a
              href="mailto:rahkibulislambd788@gmail.com"
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-[#D4AF37] hover:text-slate-950 flex items-center justify-center transition-colors text-slate-400"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-black text-white mb-4 text-xs uppercase tracking-wider border-b border-slate-800 pb-2">দ্রুত লিঙ্ক</h4>
          <ul className="space-y-2.5 text-xs">
            {[["#why", "কেন EduSaaS?"], ["#features", "ফিচারসমূহ"], ["#schools", "নিবন্ধিত প্রতিষ্ঠান"], ["#reviews", "রিভিউ"], ["#faq", "FAQ"]].map(([href, label]) => (
              <li key={href}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white mb-4 text-xs uppercase tracking-wider border-b border-slate-800 pb-2">রিসোর্স</h4>
          <ul className="space-y-2.5 text-xs">
            {[["/platform-console/organizations/new", "ফ্রি রেজিস্ট্রেশন"], ["/StudentLogin", "শিক্ষার্থী পোর্টাল"], ["/TeacherLogin", "শিক্ষক পোর্টাল"], ["/AdminLogin", "অ্যাডমিন প্যানেল"], ["/notices", "নোটিশ ও ব্লগ"]].map(([href, label]) => (
              <li key={href}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white mb-4 text-xs uppercase tracking-wider border-b border-slate-800 pb-2">সাপোর্ট ও যোগাযোগ</h4>
          <ul className="space-y-3 text-xs">
            <li className="flex items-center gap-2.5"><PhoneCall className="h-4 w-4 text-[#D4AF37] shrink-0" /><a href="tel:01576600265" className="hover:text-white font-mono">01576600265</a></li>
            <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 text-[#D4AF37] shrink-0" /><a href="mailto:rahkibulislambd788@gmail.com" className="hover:text-white truncate">rahkibulislambd788@gmail.com</a></li>
            <li className="flex items-center gap-2.5"><MapPin className="h-4 w-4 text-[#D4AF37] shrink-0" /><span>ঢাকা, বাংলাদেশ</span></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600">
        <span>© {new Date().getFullYear()} EduSaaS Global. All rights reserved. Built with ❤️ in Bangladesh.</span>
        <div className="flex gap-5">
          <Link href="/about" className="hover:text-slate-300 transition-colors">প্রাইভেসি পলিসি</Link>
          <Link href="/about" className="hover:text-slate-300 transition-colors">শর্তাবলী</Link>
          <Link href="/faq" className="hover:text-slate-300 transition-colors">হেল্প সেন্টার</Link>
        </div>
      </div>
    </footer>
  );
}
