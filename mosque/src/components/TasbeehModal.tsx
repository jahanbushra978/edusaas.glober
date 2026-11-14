"use client";
import { useState } from "react";

const ADHKAR = [
  { ar: "سُبْحَانَ اللَّهِ", bn: "সুবহানাল্লাহ (আল্লাহ মহাপবিত্র)", target: 33 },
  { ar: "الْحَمْدُ لِلَّهِ", bn: "আলহামদুলিল্লাহ (সকল প্রশংসা আল্লাহর)", target: 33 },
  { ar: "اللَّهُ أَكْبَرُ", bn: "আল্লাহু আকবার (আল্লাহ সর্বশ্রেষ্ঠ)", target: 34 },
  { ar: "أَسْتَغْفِرُ اللَّهَ", bn: "আস্তাগফিরুল্লাহ (আমি আল্লাহর ক্ষমা চাই)", target: 100 },
  { ar: "لَا إِلٰهَ إِلَّا اللَّهُ", bn: "লা ইলাহা ইল্লাল্লাহ", target: 100 },
];

export function TasbeehModal({ onClose }: { onClose: () => void }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const dhikr = ADHKAR[selectedIdx] ?? ADHKAR[0]!;

  const handleIncrement = () => {
    const next = count + 1;
    setCount(next);
    setTotalCount(totalCount + 1);
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(25);
    }
    if (next >= dhikr.target) {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([40, 50, 40]);
      }
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>📿</span>
            <span>ডিজিটাল তাসবীহ গণক</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ textAlign: "center" }}>
          {/* Adhkar Picker */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, marginBottom: 16 }}>
            {ADHKAR.map((a, i) => (
              <button
                key={i}
                onClick={() => { setSelectedIdx(i); setCount(0); }}
                style={{
                  border: 0, padding: "6px 14px", borderRadius: 999, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                  background: selectedIdx === i ? "var(--pri)" : "var(--bg)",
                  color: selectedIdx === i ? "#fff" : "var(--text)", fontWeight: 600,
                }}
              >
                {a.bn.split(" ")[0]} ({a.target})
              </button>
            ))}
          </div>

          <div style={{ fontSize: 28, fontFamily: "Amiri, serif", margin: "10px 0 4px", color: "var(--pri)" }}>
            {dhikr.ar}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
            {dhikr.bn} · লক্ষ্য: {dhikr.target} বার
          </div>

          {/* Large Circular Tap Counter */}
          <div style={{ position: "relative", width: 180, height: 180, margin: "0 auto 20px" }}>
            <button
              onClick={handleIncrement}
              style={{
                width: "100%", height: "100%", borderRadius: "50%",
                background: "linear-gradient(135deg, var(--pri), var(--pri-dark))",
                border: "6px solid var(--pri-light)", color: "#fff",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: "0 10px 30px rgba(5,150,105,0.35)", transition: "transform 0.1s",
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div style={{ fontSize: 48, fontWeight: 800 }}>{count}</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>চাপুন</div>
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button onClick={handleReset} style={{ border: "1px solid var(--bd)", background: "var(--bg)", padding: "8px 16px", borderRadius: 999, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
              🔄 রিসেট
            </button>
            <div style={{ padding: "8px 16px", fontSize: 13, color: "var(--muted)" }}>
              মোট পাঠ: <b>{totalCount}</b> বার
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
