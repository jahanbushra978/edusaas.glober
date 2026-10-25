"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, RotateCcw, Eraser, PenTool } from "lucide-react";
import { useLearningLanguage } from "../hooks/useLearningLanguage";
import { playArabicSound } from "../lib/arabicSoundPlayer";

const ARABIC_ALPHABET = [
  { ar: "ا", nameBn: "আলিফ", nameEn: "Alif", forms: { isolated: "ا", initial: "ا", medial: "ـا", final: "ـا" } },
  { ar: "ب", nameBn: "বা", nameEn: "Ba", forms: { isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب" } },
  { ar: "ت", nameBn: "তা", nameEn: "Ta", forms: { isolated: "ت", initial: "تـ", medial: "ـتـ", final: "ـت" } },
  { ar: "ث", nameBn: "ছা", nameEn: "Tha", forms: { isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث" } },
  { ar: "ج", nameBn: "জীম", nameEn: "Jeem", forms: { isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج" } },
  { ar: "ح", nameBn: "হা", nameEn: "Haa", forms: { isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح" } },
  { ar: "خ", nameBn: "খা", nameEn: "Kha", forms: { isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ" } },
  { ar: "د", nameBn: "দাল", nameEn: "Dal", forms: { isolated: "د", initial: "د", medial: "ـد", final: "ـد" } },
  { ar: "ذ", nameBn: "যাল", nameEn: "Dhal", forms: { isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ" } },
  { ar: "ر", nameBn: "রা", nameEn: "Ra", forms: { isolated: "ر", initial: "ر", medial: "ـر", final: "ـر" } },
  { ar: "ز", nameBn: "যা", nameEn: "Zay", forms: { isolated: "ز", initial: "ز", medial: "ـز", final: "ـز" } },
  { ar: "س", nameBn: "সীন", nameEn: "Seen", forms: { isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـس" } },
  { ar: "ش", nameBn: "শীন", nameEn: "Sheen", forms: { isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش" } },
  { ar: "ص", nameBn: "ছোয়াদ", nameEn: "Saad", forms: { isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص" } },
  { ar: "ض", nameBn: "দোয়াদ", nameEn: "Daad", forms: { isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض" } },
  { ar: "ط", nameBn: "ত্বোয়া", nameEn: "Taa", forms: { isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط" } },
  { ar: "ظ", nameBn: "যোয়া", nameEn: "Dhaa", forms: { isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ" } },
  { ar: "ع", nameBn: "আইন", nameEn: "Ayn", forms: { isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع" } },
  { ar: "غ", nameBn: "গইন", nameEn: "Ghayn", forms: { isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ" } },
  { ar: "ف", nameBn: "ফা", nameEn: "Fa", forms: { isolated: "ف", initial: "فـ", medial: "ـفـ", final: "ـف" } },
  { ar: "ق", nameBn: "ক্বাফ", nameEn: "Qaaf", forms: { isolated: "ق", initial: "قـ", medial: "ـقـ", final: "ـق" } },
  { ar: "ك", nameBn: "কাফ", nameEn: "Kaaf", forms: { isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك" } },
  { ar: "ل", nameBn: "লাম", nameEn: "Laam", forms: { isolated: "ل", initial: "لـ", medial: "ـلـ", final: "ـل" } },
  { ar: "م", nameBn: "মীম", nameEn: "Meem", forms: { isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم" } },
  { ar: "ن", nameBn: "নূন", nameEn: "Noon", forms: { isolated: "ن", initial: "نـ", medial: "ـنـ", final: "ـن" } },
  { ar: "و", nameBn: "ওয়াও", nameEn: "Waw", forms: { isolated: "و", initial: "و", medial: "ـو", final: "ـو" } },
  { ar: "هـ", nameBn: "হা", nameEn: "Haa", forms: { isolated: "هـ", initial: "هـ", medial: "ـهـ", final: "ـه" } },
  { ar: "ء", nameBn: "হামযাহ", nameEn: "Hamzah", forms: { isolated: "ء", initial: "ء", medial: "ء", final: "ء" } },
  { ar: "ي", nameBn: "ইয়া", nameEn: "Yaa", forms: { isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي" } },
];

const HARAKAT_LIST = [
  { id: "none", symbol: "", labelBn: "মূল রূপ", labelEn: "Base", labelAr: "الأصل" },
  { id: "fathah", symbol: "\u064E", labelBn: "যবর (Fathah)", labelEn: "Fathah (a)", labelAr: "الفتحة" },
  { id: "kasrah", symbol: "\u0650", labelBn: "যের (Kasrah)", labelEn: "Kasrah (i)", labelAr: "الكسرة" },
  { id: "dammah", symbol: "\u064F", labelBn: "পেশ (Dammah)", labelEn: "Dammah (u)", labelAr: "الضمة" },
  { id: "sukoon", symbol: "\u0652", labelBn: "জযম (Sukoon)", labelEn: "Sukoon (o)", labelAr: "السكون" },
];

const HARAKAT_PRONUNCIATION_MAP = {
  "ا": { fathah: "আ", kasrah: "ই", dammah: "উ", sukoon: "আহ্" },
  "ب": { fathah: "বা", kasrah: "বি", dammah: "বু", sukoon: "আব্ (ক্বলক্বলাহ)" },
  "ت": { fathah: "তা", kasrah: "তি", dammah: "তু", sukoon: "আৎ" },
  "ث": { fathah: "ছা (নরম)", kasrah: "ছি", dammah: "ছু", sukoon: "আছ্" },
  "ج": { fathah: "জা", kasrah: "জি", dammah: "জু", sukoon: "আজ্ (ক্বলক্বলাহ)" },
  "ح": { fathah: "হা (হলকী)", kasrah: "হি", dammah: "হু", sukoon: "আহ্" },
  "خ": { fathah: "খা (মোটা)", kasrah: "খি", dammah: "খু", sukoon: "আখ্" },
  "د": { fathah: "দা", kasrah: "দি", dammah: "দু", sukoon: "আদ্ (ক্বলক্বলাহ)" },
  "ذ": { fathah: "যা (নরম)", kasrah: "যি", dammah: "যু", sukoon: "আয্" },
  "ر": { fathah: "রা (মোটা)", kasrah: "রি", dammah: "রু (মোটা)", sukoon: "আর্" },
  "ز": { fathah: "যা (শিস)", kasrah: "যি", dammah: "যু", sukoon: "আয্" },
  "س": { fathah: "সা (শিস)", kasrah: "সি", dammah: "সু", sukoon: "আস্" },
  "ش": { fathah: "শা", kasrah: "শি", dammah: "শু", sukoon: "আশ্" },
  "ص": { fathah: "সোয়া (মোটা)", kasrah: "সি", dammah: "সু", sukoon: "আছ্" },
  "ض": { fathah: "দোয়া (ভারী)", kasrah: "দি", dammah: "দু", sukoon: "আদ্" },
  "ط": { fathah: "তোয়া (মোটা)", kasrah: "ত্বি", dammah: "ত্বু", sukoon: "আত্ব্ (ক্বলক্বলাহ)" },
  "ظ": { fathah: "জোয়া (মোটা)", kasrah: "যি", dammah: "যু", sukoon: "আজ্" },
  "ع": { fathah: "আ' (হলকী)", kasrah: "ই'", dammah: "উ'", sukoon: "আ'আ্" },
  "غ": { fathah: "গা (মোটা)", kasrah: "গি", dammah: "গু", sukoon: "আগ্" },
  "ف": { fathah: "ফা", kasrah: "ফি", dammah: "ফু", sukoon: "আফ্" },
  "ق": { fathah: "ক্বা (ভারী)", kasrah: "ক্বি", dammah: "ক্বু", sukoon: "আক্ব্ (ক্বলক্বলাহ)" },
  "ك": { fathah: "কা", kasrah: "কি", dammah: "কু", sukoon: "আক্" },
  "ل": { fathah: "লা", kasrah: "লি", dammah: "লু", sukoon: "আল্" },
  "م": { fathah: "মা", kasrah: "মি", dammah: "মু", sukoon: "আম্" },
  "ن": { fathah: "না", kasrah: "নি", dammah: "নু", sukoon: "আন্" },
  "و": { fathah: "ওয়া", kasrah: "ওয়ি", dammah: "উ", sukoon: "আও" },
  "هـ": { fathah: "হা", kasrah: "হি", dammah: "হু", sukoon: "আহ্" },
  "ء": { fathah: "আ", kasrah: "ই", dammah: "উ", sukoon: "আহ্" },
  "ي": { fathah: "ইয়া", kasrah: "য়ি", dammah: "য়ু", sukoon: "আই" },
};

export default function InteractiveBlackboard({ onCompleteExercise: _onCompleteExercise }) {
  const { t, isRTL: _isRTL, dir, lang } = useLearningLanguage();

  const [selectedLetter, setSelectedLetter] = useState(ARABIC_ALPHABET[1]); // Default 'Ba'
  const [selectedForm, setSelectedForm] = useState("isolated"); // 'isolated' | 'initial' | 'medial' | 'final'
  const [selectedHarakat, setSelectedHarakat] = useState("none");
  const [tool, setTool] = useState("pen"); // 'pen' | 'eraser'
  const [penColor, setPenColor] = useState("#f59e0b"); // Gold amber chalk
  const [penWidth, _setPenWidth] = useState(6);
  const [showGuide, setShowGuide] = useState(true);

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  // Get current active Arabic character with harakat
  const activeChar = (selectedLetter.forms[selectedForm] || selectedLetter.ar) +
    (HARAKAT_LIST.find((h) => h.id === selectedHarakat)?.symbol || "");

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  // Clear Canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Drawing event handlers
  const startDrawing = (e) => {
    isDrawingRef.current = true;
    const pos = getPos(e);
    lastPointRef.current = pos;
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "#06130d" : penColor;
    ctx.lineWidth = tool === "eraser" ? 24 : penWidth;
    ctx.stroke();

    lastPointRef.current = pos;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  // Get canonical Arabic token for audio playback (without positional tatweel)
  const getAudioToken = useCallback((letterAr, harakatId) => {
    let char = letterAr;
    if (harakatId === "fathah") char += "َ";
    else if (harakatId === "kasrah") char += "ِ";
    else if (harakatId === "dammah") char += "ُ";
    else if (harakatId === "sukoon") char += "ْ";
    return char;
  }, []);

  // Play authentic studio/neural Arabic pronunciation
  const playPronunciation = useCallback(() => {
    try {
      const charToSpeak = getAudioToken(selectedLetter.ar, selectedHarakat);
      playArabicSound(charToSpeak);
    } catch {}
  }, [getAudioToken, selectedHarakat, selectedLetter]);

  return (
    <div dir={dir} className="w-full flex flex-col space-y-6">
      {/* ── TOP HEADER & CONTROLS ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-[#091a14] border border-emerald-900/60 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-lg font-amiri">
            {activeChar}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{t.blackboard}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300">
                {lang === "en" ? selectedLetter.nameEn : selectedLetter.nameBn}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {lang === "ar"
                ? "تدرب على رسم الحرف وأشكاله المختلفة باللمس أو القلم"
                : "হরফের পূর্ণরূপ ও যুক্তরূপ নিজের হাতে লিখে মাশক করুন"}
            </p>
          </div>
        </div>

        {/* Pronunciation & Audio */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={playPronunciation}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-slate-950" />
            <span>{t.listenAudio}</span>
          </button>
        </div>
      </div>

      {/* ── MAIN BLACKBOARD CANVAS STAGE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: THE BLACKBOARD (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div className="relative rounded-3xl bg-[#05140d] border-4 border-emerald-950 shadow-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center select-none">
            {/* Wooden Slate Texture / Frame Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a2318] via-[#05140d] to-[#020906] pointer-events-none" />

            {/* Tracing Guide Watermark Overlay */}
            {showGuide && (
              <div
                dir="rtl"
                className="absolute inset-0 flex items-center justify-center pointer-events-none font-amiri text-[120px] sm:text-[180px] md:text-[220px] font-bold text-emerald-400/15 transition-all select-none"
              >
                {activeChar}
              </div>
            )}

            {/* Blackboard Interactive Tracing Canvas */}
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
            />

            {/* Canvas Bottom Toolstrip */}
            <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between p-2 rounded-2xl bg-black/60 backdrop-blur-md border border-emerald-900/60">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTool("pen")}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    tool === "pen"
                      ? "bg-amber-500 text-slate-950 shadow font-bold"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{t.pen}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTool("eraser")}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    tool === "eraser"
                      ? "bg-amber-500 text-slate-950 shadow font-bold"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>{t.eraser}</span>
                </button>

                {/* Color Choices */}
                {tool === "pen" && (
                  <div className="flex items-center gap-1 ml-2 border-l border-emerald-900/60 pl-2">
                    {["#f59e0b", "#10b981", "#ffffff", "#38bdf8"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setPenColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer ${
                          penColor === c ? "border-white scale-110 shadow" : "border-transparent"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    showGuide
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                      : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}
                >
                  {showGuide ? "ট্রেসিং অন" : "ট্রেসিং অফ"}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.clear}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Letter Forms Selection Tabs (মুফরাদ, শুরু, মাঝ, শেষ) */}
          <div className="p-4 rounded-3xl bg-[#091a14] border border-emerald-900/60 shadow-xl flex flex-col space-y-3">
            <span className="text-xs font-bold text-slate-300">
              {lang === "ar" ? "أشكال الحرف في الكلمة:" : lang === "en" ? "4 Forms of the Letter:" : "শব্দে হরফের ৪টি রূপ:"}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "isolated", label: t.letters.isolated, form: selectedLetter.forms.isolated },
                { id: "initial", label: t.letters.initial, form: selectedLetter.forms.initial },
                { id: "medial", label: t.letters.medial, form: selectedLetter.forms.medial },
                { id: "final", label: t.letters.final, form: selectedLetter.forms.final },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setSelectedForm(f.id);
                    handleClear();
                  }}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                    selectedForm === f.id
                      ? "bg-emerald-950 border-emerald-500 text-emerald-200 shadow-md ring-1 ring-emerald-400"
                      : "bg-[#05140d] border-emerald-950 text-slate-300 hover:border-emerald-800"
                  }`}
                >
                  <span className="font-amiri text-2xl font-bold">{f.form}</span>
                  <span className="text-[11px] font-medium text-slate-400">{f.label}</span>
                </button>
              ))}
            </div>

            {/* Harakat Overlay Selection */}
            <div className="pt-2 border-t border-emerald-900/40 flex flex-col space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400 mr-1">{t.harakat}</span>
                {HARAKAT_LIST.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      setSelectedHarakat(h.id);
                      handleClear();
                      const charToSpeak = getAudioToken(selectedLetter.ar, h.id);
                      playArabicSound(charToSpeak);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      selectedHarakat === h.id
                        ? "bg-amber-950 border-amber-500 text-amber-200 font-bold shadow-sm ring-1 ring-amber-400"
                        : "bg-[#05140d] border-emerald-950 text-slate-300 hover:border-emerald-700"
                    }`}
                  >
                    {lang === "ar" ? h.labelAr : lang === "en" ? h.labelEn : h.labelBn}
                  </button>
                ))}
              </div>

              {/* Active Sound Pronunciation Indicator */}
              <div className="w-full pt-1.5 flex items-center justify-between text-xs border-t border-emerald-900/30">
                <span className="text-slate-400 font-medium">
                  {lang === "ar" ? "النطق الصحيح:" : lang === "en" ? "Correct Pronunciation:" : "বিশুদ্ধ উচ্চারণ গাইড:"}
                </span>
                <span className="font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30 font-amiri text-sm flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>
                    {selectedHarakat === "none"
                      ? (lang === "en" ? selectedLetter.nameEn : selectedLetter.nameBn)
                      : (HARAKAT_PRONUNCIATION_MAP[selectedLetter.ar]?.[selectedHarakat] || activeChar)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 28 ARABIC ALPHABET SELECTOR (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          <div className="p-4 rounded-3xl bg-[#091a14] border border-emerald-900/60 shadow-xl flex flex-col space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center justify-between border-b border-emerald-900/40 pb-2">
              <span>{t.selectLetterForPractice}</span>
              <span className="text-emerald-400 text-[11px]">{t.lettersCount29}</span>
            </h3>

            {/* Grid of 29 Arabic Letters */}
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2 max-h-[380px] overflow-y-auto pr-1">
              {ARABIC_ALPHABET.map((item) => (
                <button
                  key={item.ar}
                  type="button"
                  onClick={() => {
                    setSelectedLetter(item);
                    handleClear();
                    const charToSpeak = getAudioToken(item.ar, selectedHarakat);
                    playArabicSound(charToSpeak);
                  }}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                    selectedLetter.ar === item.ar
                      ? "bg-gradient-to-b from-amber-500 to-amber-600 border-amber-300 text-slate-950 font-black shadow-lg shadow-amber-900/40 scale-105"
                      : "bg-[#05140d] border-emerald-950/80 text-slate-200 hover:border-emerald-600 hover:bg-emerald-950"
                  }`}
                >
                  <span className="font-amiri text-2xl font-bold">{item.ar}</span>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      selectedLetter.ar === item.ar ? "text-slate-900 font-bold" : "text-slate-400"
                    }`}
                  >
                    {lang === "en" ? item.nameEn : lang === "ar" ? item.ar : item.nameBn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
