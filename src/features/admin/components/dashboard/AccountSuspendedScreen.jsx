"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

export default function AccountSuspendedScreen({ schoolName }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-red-500/40 text-center space-y-4 shadow-2xl">
        <div className="h-16 w-16 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-500/30">
          <AlertCircle size={36} />
        </div>
        <h2 className="text-2xl font-bold text-white">অ্যাাকাউন্ট সাময়িকভাবে স্থগিত (Suspended)</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          বিলিং পরিশোধ বকেয়া বা প্ল্যাটফর্ম নীতিমালার কারণে <b>{schoolName}</b>-এর ড্যাশবোর্ড একসেস সাময়িকভাবে স্থগিত রাখা হয়েছে।
        </p>
        <div className="pt-2">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700"
            type="button"
          >
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      </div>
    </div>
  );
}
