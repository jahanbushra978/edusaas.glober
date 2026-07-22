'use client'

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { appClient } from "@/api/appClient";

export default function PortalLayout({ children }) {
  const { lang } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    appClient.auth.me()
      .then(user => {
        setIsAdmin(user && (user.role === "admin" || user.role === "branch_admin" || user.role === "boarding_manager"));
      })
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    if (isAdmin) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isAdmin]);

  return (
    <div className={`${isAdmin ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'} bg-slate-50 flex flex-col ${lang === 'bn' ? 'font-bn' : lang === 'ar' ? 'font-ar' : 'font-en'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <main className="flex-1 w-full relative z-0 flex flex-col">
        {children}
      </main>
    </div>
  );
}

