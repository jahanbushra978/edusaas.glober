"use client";

import React from "react";
import {
  X,
  Building,
  ShieldCheck,
} from "lucide-react";
import { MosqueModuleCenter } from "../MosqueModuleCenter";

/**
 * Islamic Super App Modal (Redesigned Enterprise Launcher)
 * Hosts all 35 modules across 7 categories with live search, SVG Lucide icons,
 * 44-48px icon containers and zero emojis.
 */
export function SuperAppModal({
  onClose,
  onOpenModal,
  onOpenQuranReader,
  onOpenTutor,
  mosqueName = "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-[#FAF8F2] dark:bg-[#07130e] border border-stone-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#064E3B] to-[#0D7A5F] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide">
                  মসজিদ ইআরপি ও ইসলামিক সুপার অ্যাপ লঞ্চার
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  ৩৫টি সেবা
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                {mosqueName} · প্রশাসন, ফিন্যান্স, ইমাম রোস্টার, নামাজ ও সমাজকল্যাণ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-white"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <MosqueModuleCenter
            onOpenModal={(modalId) => {
              onClose();
              onOpenModal(modalId);
            }}
            onOpenQuranReader={() => {
              onClose();
              if (onOpenQuranReader) onOpenQuranReader();
            }}
            onOpenTutor={() => {
              onClose();
              if (onOpenTutor) onOpenTutor();
            }}
            onSelectTab={() => {
              onClose();
            }}
            onOpenPublicSite={() => {
              onClose();
              onOpenModal("admin");
            }}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-white dark:bg-[#0c1612] border-t border-stone-200 dark:border-emerald-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0D7A5F]" />
            <span>যেকোনো মডিউলে ক্লিক করলে সরাসরি সেই ফিচারটি ওপেন হবে</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0D7A5F] text-white font-bold text-xs hover:bg-[#0b654e] transition cursor-pointer shadow-xs"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuperAppModal;
