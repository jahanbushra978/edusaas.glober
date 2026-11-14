"use client";
import { useState } from "react";

interface BayanItem {
  id: string;
  title: string;
  speaker: string;
  duration: string;
  category: string;
  summary: string;
  highlights: string[];
}

const BAYAN_LIST: BayanItem[] = [
  {
    id: "bayan-1",
    title: "খাঁটি তাওবা ও অন্তরের পরিশুদ্ধি",
    speaker: "শায়খ আহমাদুল্লাহ",
    duration: "৩৫ মিনিট",
    category: "আত্মশুদ্ধি",
    summary: "অতীতের গুনাহ মোচনে অনুতপ্ত হয়ে অশ্রু ফেলে কিভাবে আল্লাহ তাআলার নৈকট্য ও ভালোবাসা অর্জন করা যায় সে সম্পর্কে হৃদয়গ্রাহী বয়ান।",
    highlights: ["তাওবার ৩টি অপরিহার্য শর্ত", "অতীতের ক্ষতিপূরণ ও বান্দার হক আদায়", "হতাশা দূর করে আশার আলো জ্বালানো"]
  },
  {
    id: "bayan-2",
    title: "কবরের প্রথম রাত ও আখিরাতের প্রস্তুতি",
    speaker: "মাওলানা মিজানুর রহমান আজহারী",
    duration: "৪২ মিনিট",
    category: "আখিরাত",
    summary: "মৃত্যুর মুখোমুখি হওয়ার মুহূর্ত, কবরের সওয়াল-জওয়াব এবং চিরস্থায়ী শান্তির ঠিকানা জান্নাত লাভের প্রস্তুতি।",
    highlights: ["মুনকার-নাকীরের তিনটি প্রশ্ন", "কবরের আজাব থেকে রক্ষার আমলসমূহ", "সুরক্ষিত মুমিনের অন্তিম দৃশ্য"]
  },
  {
    id: "bayan-3",
    title: "আদর্শ পরিবার গঠন ও সুসন্তান প্রতিপালন",
    speaker: "শায়খ আবদুল হাই মুহাম্মাদ সাইফুল্লাহ",
    duration: "২৮ মিনিট",
    category: "পারিবারিক জীবন",
    summary: "স্বামী-স্ত্রীর পারস্পারিক অধিকার, সন্তানদের দ্বীনি শিষ্টাচার শিক্ষা এবং সংসারে বরকত ধরে রাখার সুন্নাহসম্মত উপায়।",
    highlights: ["সন্তানের প্রথম পাঠশালা মা-বাবা", "ঘরে কুরআন তিলাওয়াত ও নামাজের পরিবেশ", "রাগ নিয়ন্ত্রণ ও সহনশীলতার গুরুত্ব"]
  },
  {
    id: "bayan-4",
    title: "কুরআনের সাথে সম্পর্ক ও জীবনের বরকত",
    speaker: "মুফতী মনসূরুল হক",
    duration: "৩০ মিনিট",
    category: "ইলম ও কুরআন",
    summary: "কুরআন নিয়মিত তিলাওয়াত, হিফজ ও অর্থ বুঝে আমল করার মাধ্যমে পার্থিব অশান্তি দূরীকরণ ও আত্মিক তৃপ্তি।",
    highlights: ["প্রতি হরফে ১০ নেকি লাভের মাহাত্ম্য", "কুরআন শাফায়াতকারী বন্ধু হিসেবে আসবে", "দৈনিক ৩০ মিনিট কুরআনের জন্য বরাদ্দের বরকত"]
  }
];

export function BayanModal({ onClose }: { onClose: () => void }) {
  const [activeBayanId, setActiveBayanId] = useState<string>("bayan-1");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(35);

  const current = BAYAN_LIST.find((b) => b.id === activeBayanId) || BAYAN_LIST[0]!;

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🎙️</span>
            <span>দ্বীনি বয়ান ও অডিও লেকচার লাইব্রেরি</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {/* Active Audio Player Widget */}
          <div style={{
            background: "linear-gradient(135deg, var(--pri), var(--pri-dark))",
            color: "#fff",
            borderRadius: 18,
            padding: "20px",
            marginBottom: 18,
            boxShadow: "0 10px 25px rgba(5,150,105,0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 999, fontWeight: 700 }}>
                {current.category}
              </span>
              <span style={{ fontSize: 12, opacity: 0.9 }}>⏱️ {current.duration}</span>
            </div>

            <h3 style={{ margin: "6px 0 2px", fontSize: 17, fontWeight: 800 }}>{current.title}</h3>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 16 }}>বক্তা: {current.speaker}</div>

            {/* Simulated Progress bar */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ height: 6, background: "rgba(255,255,255,0.3)", borderRadius: 999, overflow: "hidden", cursor: "pointer" }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  setProgress(Math.round((clickX / rect.width) * 100));
                }}
              >
                <div style={{ width: `${progress}%`, height: "100%", background: "#fff", borderRadius: 999 }}></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                <span>{Math.floor((progress * 35) / 100)}:২০</span>
                <span>{current.duration}</span>
              </div>
            </div>

            {/* Play controls */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
              <button
                onClick={() => setProgress(Math.max(0, progress - 10))}
                style={{ background: "none", border: 0, color: "#fff", fontSize: 18, cursor: "pointer" }}
                title="১০ সেকেন্ড পেছনে"
              >
                ⏪
              </button>
              <button
                onClick={togglePlay}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#fff",
                  color: "var(--pri)",
                  border: 0,
                  fontSize: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                }}
              >
                {isPlaying ? "⏸️" : "▶️"}
              </button>
              <button
                onClick={() => setProgress(Math.min(100, progress + 10))}
                style={{ background: "none", border: 0, color: "#fff", fontSize: 18, cursor: "pointer" }}
                title="১০ সেকেন্ড সামনে"
              >
                ⏩
              </button>
            </div>
          </div>

          {/* Bayan details */}
          <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14, marginBottom: 16 }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "var(--pri)" }}>বয়ানের মূল বিষয়বস্তু:</h4>
            <p style={{ margin: "0 0 10px", fontSize: 13, lineHeight: 1.6, color: "var(--text)" }}>
              {current.summary}
            </p>
            <div style={{ background: "var(--bg)", padding: 10, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>মূল শিক্ষণীয় দিকসমূহ:</div>
              {current.highlights.map((h, i) => (
                <div key={i} style={{ fontSize: 12, color: "var(--muted)", padding: "2px 0" }}>
                  ✓ {h}
                </div>
              ))}
            </div>
          </div>

          {/* Bayan selection playlist */}
          <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700 }}>অন্যান্য নির্বাচিত বয়ানমালা:</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BAYAN_LIST.map((b) => (
              <div
                key={b.id}
                onClick={() => { setActiveBayanId(b.id); setIsPlaying(true); setProgress(0); }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid",
                  borderColor: activeBayanId === b.id ? "var(--pri)" : "var(--bd)",
                  background: activeBayanId === b.id ? "var(--pri-soft)" : "var(--card)",
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: activeBayanId === b.id ? "var(--pri-dark)" : "var(--text)" }}>
                    {b.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    {b.speaker} · {b.duration}
                  </div>
                </div>
                <div style={{ fontSize: 18, color: "var(--pri)" }}>
                  {activeBayanId === b.id && isPlaying ? "🔊" : "▶️"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
