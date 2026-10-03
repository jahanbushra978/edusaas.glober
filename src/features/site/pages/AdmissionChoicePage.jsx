import React from "react";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";
import { createPageUrl } from "@/utils";
import { FileText, Globe } from "lucide-react";
import { toast } from "sonner";
import { printMadrasahAdmissionDirect } from "@/features/applications/utils/printMadrasahAdmissionForm";

export default function AdmissionChoicePage() {
  const { lang } = useLanguage();
  const isBn = lang === "bn";

  const { data: settings = [] } = useQuery({
    queryKey: ["app-settings-public"],
    queryFn: () => appClient.entities.AppSettings.list(),
  });

  const getSetting = key => (Array.isArray(settings) ? settings : []).find(s => s.key === key)?.value;
  const rawFormUrl = getSetting("admission_form_url");

  const handleDownload = async () => {
    if (rawFormUrl && rawFormUrl.trim().length > 0 && /^https?:\/\//i.test(rawFormUrl.trim())) {
      const downloadProxyUrl = `/api/public/download-pdf?url=${encodeURIComponent(rawFormUrl.trim())}`;
      try {
        toast.info(isBn ? "ভর্তি ফরম ফাইল চেক করা হচ্ছে..." : "Checking admission form file...");
        const res = await fetch(downloadProxyUrl);
        if (!res.ok) {
          throw new Error("File not found or restricted");
        }
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "admission-form.pdf";
        document.body.appendChild(a);
        a.click();
        if (a.parentNode) a.parentNode.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        toast.success(isBn ? "ভর্তি ফরম সফলভাবে ডাউনলোড হয়েছে!" : "Admission form downloaded successfully!");
      } catch (err) {
        printMadrasahAdmissionDirect({ admission: {}, settings });
        toast.info(isBn ? "অফিসিয়াল ভর্তি ফরম প্রিন্ট ভিউ ওপেন করা হয়েছে।" : "Official admission form print view opened.");
      }
    } else {
      printMadrasahAdmissionDirect({ admission: {}, settings });
      toast.info(isBn ? "অফিসিয়াল ভর্তি ফরম প্রিন্ট ভিউ ওপেন করা হয়েছে।" : "Official admission form print view opened.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#08140f] py-16 px-4 overflow-x-hidden">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-widest"
            style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)", color: "#b8860b" }}>
            {isBn ? "ভর্তি প্রক্রিয়া" : "Admission Process"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold italic text-slate-800 dark:text-gray-100 mb-3">
            {isBn ? "ভর্তির জন্য আবেদন করুন" : "Apply for Admission"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 max-w-lg mx-auto">
            {isBn ? "অনলাইনে আবেদন করুন অথবা আবেদন ফরম ডাউনলোড করে আবেদন করুন" : "Apply online or download the admission form to apply"}
          </p>
        </div>

        {/* Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Online Apply */}
          <Link href={createPageUrl("AdmissionForm")}>
            <div className="bg-white dark:bg-[#0d1f17] rounded-2xl p-8 text-center shadow-lg dark:shadow-[#000]/30 border border-gray-100 dark:border-[#1a3d2e] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#D4AF37,#c49a20)", boxShadow: "0 4px 16px rgba(212,175,55,0.35)" }}>
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-2 group-hover:text-[#D4AF37] transition-colors">
                {isBn ? "Online আবেদন করুন" : "Online Apply"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">
                {isBn ? "সরাসরি অনলাইনে আবেদন করুন" : "Apply directly online"}
              </p>
            </div>
          </Link>

          {/* Download Form */}
          <div onClick={handleDownload}
            className="bg-white dark:bg-[#0d1f17] rounded-2xl p-8 text-center shadow-lg dark:shadow-[#000]/30 border border-gray-100 dark:border-[#1a3d2e] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#006400,#008050)", boxShadow: "0 4px 16px rgba(0,100,60,0.35)" }}>
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-2 group-hover:text-[#006400] dark:group-hover:text-[#4adea0] transition-colors">
              {isBn ? "আবেদন ফরম Download করুন" : "Download Form"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              {isBn ? "ফরম দেখতে বা পেতে এখানে ক্লিক করুন" : "Click here to view or download form"}
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-10">
          <Link href={createPageUrl("Home")} className="text-sm text-slate-500 dark:text-gray-400 hover:text-[#12715B] dark:hover:text-[#4adea0] transition-colors">
            {isBn ? "← হোম পেজে ফিরে যান" : "← Back to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
