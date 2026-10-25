"use client";

import React, { useState } from "react";
import {
  X,
  Volume2,
  Sliders,
  Mic,
  ShieldCheck,
  RotateCcw,
  Play,
  Square,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import {
  VOICE_PERSONAS,
  EMOTIONS,
  VoiceAgentEngine
} from "@/lib/ai/voice-agent-engine";

export default function VoiceAgentSettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) {
  const [gender, setGender] = useState(config?.gender || "male");
  const [personaId, setPersonaId] = useState(config?.personaId || "male_scholarly");
  const [emotion, setEmotion] = useState(config?.emotion || "encouraging");
  const [language, setLanguage] = useState(config?.language || "bn-BD");
  const [baseSpeed, setBaseSpeed] = useState(config?.baseSpeed || 1.0);
  const [basePitch, setBasePitch] = useState(config?.basePitch || 1.0);
  const [bargeInEnabled, setBargeInEnabled] = useState(config?.bargeInEnabled !== false);
  const [bargeInSensitivity, setBargeInSensitivity] = useState(config?.bargeInSensitivity || "medium");
  const [backchannelsEnabled, setBackchannelsEnabled] = useState(config?.backchannelsEnabled !== false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  if (!isOpen) return null;

  const currentPersonas = VOICE_PERSONAS[gender] || VOICE_PERSONAS.male;

  const handleGenderChange = (newGender) => {
    setGender(newGender);
    const firstPersona = VOICE_PERSONAS[newGender]?.[0];
    if (firstPersona) setPersonaId(firstPersona.id);
  };

  const handlePreviewVoice = () => {
    if (isPlayingPreview) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingPreview(false);
      return;
    }

    const testEngine = new VoiceAgentEngine({
      gender,
      personaId,
      emotion,
      language,
      baseSpeed,
      basePitch
    });

    const sampleText =
      language === "bn-BD"
        ? "আসসালামু আলাইকুম। আমি নূর এআই ভয়েস শিক্ষক। আপনার তাজবীদ ও হিফজ অনুশীলনে আমি সদা প্রস্তুত।"
        : "Peace be upon you. I am your AI Quran voice tutor, ready to guide your Tajweed and memorization.";

    setIsPlayingPreview(true);
    testEngine.speak(sampleText, {
      onEnd: () => setIsPlayingPreview(false),
      onError: () => setIsPlayingPreview(false)
    });
  };

  const handleSave = () => {
    const updated = {
      gender,
      personaId,
      emotion,
      language,
      baseSpeed,
      basePitch,
      bargeInEnabled,
      bargeInSensitivity,
      backchannelsEnabled
    };
    if (onSaveConfig) onSaveConfig(updated);
    toast.success("মাশাআল্লাহ! ভয়েস সেটিংস সফলভাবে সংরক্ষিত হয়েছে।");
    onClose();
  };

  const handleReset = () => {
    setGender("male");
    setPersonaId("male_scholarly");
    setEmotion("encouraging");
    setLanguage("bn-BD");
    setBaseSpeed(1.0);
    setBasePitch(1.0);
    setBargeInEnabled(true);
    setBargeInSensitivity("medium");
    setBackchannelsEnabled(true);
    toast.info("ডিফল্ট সেটিংসে ফিরিয়ে নেওয়া হয়েছে।");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#091a14] border border-emerald-800/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-900/80 flex items-center justify-between bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>অ্যাডভান্সড ভয়েস ও প্রসোডি সেটিংস</span>
                <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/60 font-mono">
                  Real-Time AI Voice
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                কণ্ঠস্বর, গতি, পিচ, আবেগ ও রিয়েল-টাইম ইন্টারাপশন (Barge-In) নিয়ন্ত্রণ করুন।
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-emerald-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          
          {/* Section 1: Voice Gender & Persona */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
              ১. কণ্ঠ নির্বাচন (পুরুষ / নারী ভয়েস)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleGenderChange("male")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  gender === "male"
                    ? "bg-emerald-950 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500/40"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>পুরুষ কণ্ঠ (Male)</span>
                  {gender === "male" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">গম্ভীর, ওস্তাদ সুলভ বাচনভঙ্গি</div>
              </button>

              <button
                type="button"
                onClick={() => handleGenderChange("female")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  gender === "female"
                    ? "bg-emerald-950 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500/40"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>নারী কণ্ঠ (Female)</span>
                  {gender === "female" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">শান্ত, মমতাময়ী ও ধৈর্যশীল শিক্ষিকা</div>
              </button>
            </div>

            {/* Persona Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {currentPersonas.map((persona) => (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => setPersonaId(persona.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    personaId === persona.id
                      ? "bg-emerald-900/60 border-emerald-400/80 text-white"
                      : "bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="font-bold text-xs truncate">{persona.nameBn}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{persona.descBn}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Emotion & Expression */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
              ২. আবেগী অভিব্যক্তি (Emotion Expression)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EMOTIONS.map((em) => (
                <button
                  key={em.id}
                  type="button"
                  onClick={() => setEmotion(em.id)}
                  className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                    emotion === em.id
                      ? "bg-teal-950 border-teal-500 text-teal-200 shadow-sm"
                      : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {em.labelBn}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Speech Prosody Sliders (Rate & Pitch) */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
              ৩. গতি ও স্বরের উচ্চতা (Speed & Pitch Modulation)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 bg-black/30 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">কথা বলার গতি (Speed):</span>
                  <span className="text-emerald-400 font-bold">{baseSpeed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.4"
                  step="0.05"
                  value={baseSpeed}
                  onChange={(e) => setBaseSpeed(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>ধীর (0.75x)</span>
                  <span>স্বাভাবিক (1.0x)</span>
                  <span>দ্রুত (1.4x)</span>
                </div>
              </div>

              <div className="space-y-1.5 bg-black/30 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">কণ্ঠস্বরের উচ্চতা (Pitch):</span>
                  <span className="text-teal-400 font-bold">{basePitch.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={basePitch}
                  onChange={(e) => setBasePitch(Number(e.target.value))}
                  className="w-full accent-teal-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>গম্ভীর (0.8x)</span>
                  <span>স্বাভাবিক (1.0x)</span>
                  <span>তীক্ষ্ণ (1.3x)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Real-Time Barge-In & Backchannels */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
              ৪. রিয়েল-টাইম ইন্টারাপশন ও কথোপকথন সংকেত
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Barge-In Toggle */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-amber-400" />
                    <span>কথার মাঝখানে থামানো (Barge-In)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={bargeInEnabled}
                    onChange={(e) => setBargeInEnabled(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  AI কথা বলার সময় আপনি কথা শুরু করলেই AI তাৎক্ষণিক থেমে গিয়ে নতুন কথা শুনবে।
                </p>
                {bargeInEnabled && (
                  <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                    <span className="text-slate-400">সংবেদনশীলতা:</span>
                    {["low", "medium", "high"].map((sens) => (
                      <button
                        key={sens}
                        type="button"
                        onClick={() => setBargeInSensitivity(sens)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          bargeInSensitivity === sens
                            ? "bg-amber-800 text-amber-100"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {sens === "low" ? "কম" : sens === "medium" ? "মধ্যম" : "উচ্চ"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Backchannel Responses */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>স্বাভাবিক প্রতিক্রিয়া (Backchannels)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={backchannelsEnabled}
                    onChange={(e) => setBackchannelsEnabled(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  যথাযথ স্থানে স্বাভাবিক ছোট প্রতিক্রিয়া (যেমন: &ldquo;হুম&rdquo;, &ldquo;আচ্ছা&rdquo;, &ldquo;জি&rdquo;) প্রদান করবে।
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Audio Quality Indicators */}
          <div className="p-3 rounded-xl bg-black/40 border border-emerald-950 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>নয়েজ সাপ্রেশন, ইকো ক্যানসেলেশন ও অটো গেইন কন্ট্রোল সক্রিয়</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">ভাষা:</span>
              <button
                type="button"
                onClick={() => setLanguage("bn-BD")}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${language === "bn-BD" ? "bg-emerald-800 text-white" : "bg-slate-800 text-slate-400"}`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en-US")}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${language === "en-US" ? "bg-emerald-800 text-white" : "bg-slate-800 text-slate-400"}`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-emerald-950/40 border-t border-emerald-900/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePreviewVoice}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                isPlayingPreview
                  ? "bg-rose-900 border-rose-700 text-rose-200"
                  : "bg-emerald-950 border-emerald-700 text-emerald-200 hover:bg-emerald-900"
              }`}
            >
              {isPlayingPreview ? (
                <>
                  <Square className="w-3.5 h-3.5" />
                  <span>থামান</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>ভয়েস শুনুন</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset to default"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-700/30 transition-all"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
