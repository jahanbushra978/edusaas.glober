"use client";

import React, { useRef, useState } from "react";
import { X, Download, Share2, Copy, Check, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const toBn = (num) => {
  const enToBnMap = { "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯" };
  return String(num).replace(/\d/g, (d) => enToBnMap[d] || d);
};

export default function AyahShareCardModal({
  isOpen,
  onClose,
  ayahData,
  surahNameBn,
  isDay = false,
}) {
  const cardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [includeMuhiuddin, setIncludeMuhiuddin] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("emerald"); // 'emerald' | 'gold' | 'midnight'

  if (!isOpen || !ayahData) return null;

  const THEMES = {
    emerald: {
      bg: "bg-gradient-to-b from-[#06241c] via-[#041a14] to-[#02100d]",
      border: "border-teal-500/60",
      accent: "text-amber-400",
      subAccent: "text-teal-300",
      text: "text-slate-100",
      badge: "bg-teal-950/80 border-teal-500/40 text-teal-200",
      arabic: "text-amber-300",
    },
    gold: {
      bg: "bg-gradient-to-b from-[#2a1b05] via-[#1a1102] to-[#0f0900]",
      border: "border-amber-500/70",
      accent: "text-amber-300",
      subAccent: "text-amber-200",
      text: "text-amber-50",
      badge: "bg-amber-950/80 border-amber-500/40 text-amber-200",
      arabic: "text-amber-200",
    },
    midnight: {
      bg: "bg-gradient-to-b from-[#0b1329] via-[#060b17] to-[#02040a]",
      border: "border-indigo-500/60",
      accent: "text-cyan-400",
      subAccent: "text-indigo-200",
      text: "text-slate-100",
      badge: "bg-indigo-950/80 border-indigo-500/40 text-indigo-200",
      arabic: "text-cyan-300",
    },
  };

  const themeStyle = THEMES[selectedTheme] || THEMES.emerald;

  // Export card as PNG using HTML5 Canvas
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    toast.info("ছবি প্রস্তুত হচ্ছে...");

    try {
      // Use dynamic canvas drawer to render the card faithfully
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const width = 1080;
      const height = 1350; // 4:5 Instagram / Social Media Aspect Ratio
      canvas.width = width;
      canvas.height = height;

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      if (selectedTheme === "gold") {
        grad.addColorStop(0, "#2a1b05");
        grad.addColorStop(0.5, "#1a1102");
        grad.addColorStop(1, "#0f0900");
      } else if (selectedTheme === "midnight") {
        grad.addColorStop(0, "#0b1329");
        grad.addColorStop(0.5, "#060b17");
        grad.addColorStop(1, "#02040a");
      } else {
        grad.addColorStop(0, "#06241c");
        grad.addColorStop(0.5, "#041a14");
        grad.addColorStop(1, "#02100d");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Ornamental Border
      ctx.strokeStyle = selectedTheme === "gold" ? "#f59e0b" : selectedTheme === "midnight" ? "#6366f1" : "#14b8a6";
      ctx.lineWidth = 6;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.strokeRect(55, 55, width - 110, height - 110);

      // Header: Bismillah
      ctx.textAlign = "center";
      ctx.fillStyle = selectedTheme === "gold" ? "#fbbf24" : selectedTheme === "midnight" ? "#38bdf8" : "#2dd4bf";
      ctx.font = "bold 38px 'Amiri', 'Scheherazade New', serif";
      ctx.fillText("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", width / 2, 120);

      // Surah & Ayah Badge
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(`সূরা ${surahNameBn} — আয়াত ${toBn(ayahData.ayahNumber)}`, width / 2, 180);

      // Divider line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(150, 210);
      ctx.lineTo(width - 150, 210);
      ctx.stroke();

      // Wrap and draw text helper
      const wrapText = (context, text, x, y, maxWidth, lineHeight, maxLines = 10) => {
        const words = text.split(" ");
        let line = "";
        let currentY = y;
        let lineCount = 0;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " ";
          const metrics = context.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            context.fillText(line.trim(), x, currentY);
            line = words[n] + " ";
            currentY += lineHeight;
            lineCount++;
            if (lineCount >= maxLines) break;
          } else {
            line = testLine;
          }
        }
        context.fillText(line.trim(), x, currentY);
        return currentY + lineHeight;
      };

      // Arabic Text
      ctx.fillStyle = selectedTheme === "gold" ? "#fef08a" : selectedTheme === "midnight" ? "#e0f2fe" : "#a7f3d0";
      ctx.font = "bold 44px 'Amiri', 'Scheherazade New', serif";
      ctx.direction = "rtl";
      let nextY = wrapText(ctx, ayahData.arabicText, width / 2, 300, width - 200, 70, 6);
      ctx.direction = "ltr";

      // Pronunciation
      if (ayahData.pronunciationBn) {
        nextY += 20;
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.font = "italic 26px sans-serif";
        nextY = wrapText(ctx, `উচ্চারণ: ${ayahData.pronunciationBn}`, width / 2, nextY, width - 220, 42, 3);
      }

      // Translation Header: Mufti Taqi Usmani
      nextY += 30;
      ctx.fillStyle = selectedTheme === "gold" ? "#f59e0b" : selectedTheme === "midnight" ? "#38bdf8" : "#34d399";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("— অনুবাদ (মুফতি তকী উসমানী) —", width / 2, nextY);
      nextY += 45;

      // Translation Text: Mufti Taqi Usmani
      ctx.fillStyle = "#ffffff";
      ctx.font = "30px sans-serif";
      nextY = wrapText(ctx, ayahData.taqiUsmaniBn, width / 2, nextY, width - 200, 50, 6);

      // Secondary Translation if enabled
      if (includeMuhiuddin && ayahData.muhiuddinKhanBn && ayahData.muhiuddinKhanBn !== ayahData.taqiUsmaniBn) {
        nextY += 20;
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText("— মাওলানা মুহিউদ্দীন খান —", width / 2, nextY);
        nextY += 38;
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "26px sans-serif";
        nextY = wrapText(ctx, ayahData.muhiuddinKhanBn, width / 2, nextY, width - 200, 44, 4);
      }

      // Footer Branding
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText("রহমানিয়া ইনস্টিটিউট • Edusaas Quran Studio", width / 2, height - 90);
      ctx.font = "20px sans-serif";
      ctx.fillText("বিশুদ্ধ কুরআন শিক্ষা ও হিফজ প্ল্যাটফর্ম", width / 2, height - 60);

      // Export to Image
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `Ayah_${ayahData.surahId}_${ayahData.ayahNumber}_rahmania.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success("ছবি সফলভাবে ডাউনলোড হয়েছে!");
    } catch (err) {
      console.error("Image export error:", err);
      toast.error("ছবি তৈরি করতে সমস্যা হয়েছে");
    } finally {
      setIsExporting(false);
    }
  };

  // Copy formatted Ayah text
  const handleCopyText = () => {
    const text = `« ${ayahData.arabicText} »\n\nউচ্চারণ: ${ayahData.pronunciationBn || ""}\n\nঅনুবাদ (মুফতি তকী উসমানী): ${ayahData.taqiUsmaniBn}\n${includeMuhiuddin && ayahData.muhiuddinKhanBn ? `\nঅনুবাদ (মাওলানা মুহিউদ্দীন খান): ${ayahData.muhiuddinKhanBn}\n` : ""}\n[সূরা ${surahNameBn} : আয়াত ${toBn(ayahData.ayahNumber)}]\n— রহমানিয়া ইনস্টিটিউট • Edusaas`;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("আয়াত টেক্সট কপি করা হয়েছে");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Web Share API
  const handleShare = async () => {
    const text = `« ${ayahData.arabicText} »\n\nঅনুবাদ: ${ayahData.taqiUsmaniBn}\n\n[সূরা ${surahNameBn} : আয়াত ${toBn(ayahData.ayahNumber)}]`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `সূরা ${surahNameBn} : আয়াত ${toBn(ayahData.ayahNumber)}`,
          text: text,
          url: typeof window !== "undefined" ? window.location.href : "",
        });
      } catch {}
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-xl max-h-[90vh] rounded-3xl border-2 shadow-2xl flex flex-col overflow-hidden relative ${
          isDay
            ? "bg-[#FAF7F2] border-amber-600/50 text-stone-900 shadow-amber-950/20"
            : "bg-[#061814] border-teal-500/50 text-slate-100 shadow-teal-950/60"
        }`}
      >
        {/* Header Bar */}
        <div
          className={`px-4 sm:px-6 py-3.5 border-b flex items-center justify-between gap-2 ${
            isDay ? "bg-amber-100/70 border-amber-300" : "bg-[#09221c] border-teal-900/60"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400 text-teal-400 flex items-center justify-center shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black truncate text-teal-300">
                ছবি হিসেবে শেয়ার করুন — আয়াত {toBn(ayahData.ayahNumber)}
              </h3>
              <p className="text-[11px] opacity-75 font-bold">ইসলামিক কার্ড জেনারেটর</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Options Bar */}
        <div className={`px-4 sm:px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 ${
          isDay ? "bg-stone-100 border-amber-200" : "bg-black/30 border-teal-900/40"
        }`}>
          {/* Theme selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold opacity-75">রঙিন থিম:</span>
            <button
              type="button"
              onClick={() => setSelectedTheme("emerald")}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                selectedTheme === "emerald" ? "bg-teal-600 text-white shadow-xs" : "bg-black/20 text-slate-300"
              }`}
            >
              পান্না সবুজ
            </button>
            <button
              type="button"
              onClick={() => setSelectedTheme("gold")}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                selectedTheme === "gold" ? "bg-amber-600 text-white shadow-xs" : "bg-black/20 text-slate-300"
              }`}
            >
              সোনালী
            </button>
            <button
              type="button"
              onClick={() => setSelectedTheme("midnight")}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                selectedTheme === "midnight" ? "bg-indigo-600 text-white shadow-xs" : "bg-black/20 text-slate-300"
              }`}
            >
              মিডনাইট
            </button>
          </div>

          {/* Toggle Muhiuddin Khan translation */}
          <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeMuhiuddin}
              onChange={(e) => setIncludeMuhiuddin(e.target.checked)}
              className="rounded accent-teal-600 cursor-pointer"
            />
            <span>মুহিউদ্দীন খানের অনুবাদসহ</span>
          </label>
        </div>

        {/* Live Card Preview Frame */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
          <div
            ref={cardRef}
            className={`w-full max-w-md rounded-3xl border-2 sm:border-4 ${themeStyle.border} ${themeStyle.bg} p-6 sm:p-8 text-center space-y-4 shadow-2xl relative select-text`}
          >
            {/* Islamic Floral Corner Accents */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-400/60 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-400/60 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-400/60 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-400/60 rounded-br-sm pointer-events-none" />

            {/* Bismillah */}
            <p className="font-hafizi-quran text-lg sm:text-xl font-bold text-amber-400 tracking-wider">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>

            {/* Surah & Ayah Pill */}
            <div className="flex items-center justify-center">
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${themeStyle.badge}`}>
                সূরা {surahNameBn} — আয়াত {toBn(ayahData.ayahNumber)}
              </span>
            </div>

            {/* Arabic Text */}
            <p
              className={`font-hafizi-quran text-2xl sm:text-3xl font-extrabold leading-[2.2] ${themeStyle.arabic}`}
              dir="rtl"
            >
              {ayahData.arabicText}
            </p>

            {/* Bengali Pronunciation */}
            {ayahData.pronunciationBn && (
              <p className="text-xs sm:text-sm font-semibold italic text-slate-300/85">
                উচ্চারণ: {ayahData.pronunciationBn}
              </p>
            )}

            {/* Default Translation: Mufti Taqi Usmani */}
            <div className="pt-2 border-t border-white/15 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                অনুবাদ: মুফতি তকী উসমানী
              </span>
              <p className={`text-sm sm:text-base font-bold leading-relaxed ${themeStyle.text}`}>
                {ayahData.taqiUsmaniBn}
              </p>
            </div>

            {/* Secondary Translation: Maulana Muhiuddin Khan */}
            {includeMuhiuddin && ayahData.muhiuddinKhanBn && (
              <div className="pt-2 border-t border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                  অনুবাদ: মাওলানা মুহিউদ্দীন খান
                </span>
                <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
                  {ayahData.muhiuddinKhanBn}
                </p>
              </div>
            )}

            {/* Footer Branding */}
            <div className="pt-4 border-t border-white/15 flex flex-col items-center justify-center text-[10px] sm:text-xs text-slate-400 font-bold">
              <span>রহমানিয়া ইনস্টিটিউট • Edusaas</span>
              <span className="text-[9px] opacity-75">বিশুদ্ধ কুরআন শিক্ষা ও হিফজ প্ল্যাটফর্ম</span>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div
          className={`p-3.5 sm:p-4 border-t flex flex-wrap items-center justify-between gap-2 ${
            isDay ? "bg-amber-100/50 border-amber-300" : "bg-[#09221c]/90 border-teal-900/60"
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                isDay
                  ? "bg-amber-200/70 hover:bg-amber-300 border-amber-400 text-stone-900"
                  : "bg-teal-950/70 hover:bg-teal-900 border-teal-500/40 text-teal-200"
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>টেক্সট কপি</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                isDay
                  ? "bg-amber-200/70 hover:bg-amber-300 border-amber-400 text-stone-900"
                  : "bg-teal-950/70 hover:bg-teal-900 border-teal-500/40 text-teal-200"
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>শেয়ার</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadImage}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? "প্রস্তুত হচ্ছে..." : "ছবি ডাউনলোড করুন"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
