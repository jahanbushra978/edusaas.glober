"use client";
import { useState, useEffect } from "react";

interface DailyRecord {
  date: string;
  fajr: "jamat" | "alone" | "missed" | "none";
  dhuhr: "jamat" | "alone" | "missed" | "none";
  asr: "jamat" | "alone" | "missed" | "none";
  maghrib: "jamat" | "alone" | "missed" | "none";
  isha: "jamat" | "alone" | "missed" | "none";
  quranPages: number;
  morningAdhkar: boolean;
  eveningAdhkar: boolean;
  sadaqah: boolean;
  tahajjud: boolean;
}

export function AmalTrackerModal({ onClose }: { onClose: () => void }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [record, setRecord] = useState<DailyRecord>({
    date: todayStr,
    fajr: "none",
    dhuhr: "none",
    asr: "none",
    maghrib: "none",
    isha: "none",
    quranPages: 0,
    morningAdhkar: false,
    eveningAdhkar: false,
    sadaqah: false,
    tahajjud: false
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`amal_tracker_${todayStr}`);
      if (saved) {
        setRecord(JSON.parse(saved));
      }
    } catch {}
  }, [todayStr]);

  const updateRecord = (updates: Partial<DailyRecord>) => {
    setRecord((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(`amal_tracker_${todayStr}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Calculate score
  let totalPoints = 0;
  const prayers = [record.fajr, record.dhuhr, record.asr, record.maghrib, record.isha];
  prayers.forEach((p) => {
    if (p === "jamat") totalPoints += 15;
    else if (p === "alone") totalPoints += 10;
  });
  if (record.quranPages > 0) totalPoints += 10;
  if (record.morningAdhkar) totalPoints += 5;
  if (record.eveningAdhkar) totalPoints += 5;
  if (record.sadaqah) totalPoints += 5;
  if (record.tahajjud) totalPoints += 5;

  const scorePercent = Math.min(100, totalPoints);

  const prayersList: { key: keyof DailyRecord; label: string }[] = [
    { key: "fajr", label: "ফজর" },
    { key: "dhuhr", label: "যোহর" },
    { key: "asr", label: "আসর" },
    { key: "maghrib", label: "মাগরিব" },
    { key: "isha", label: "এশা" }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>📝</span>
            <span>দৈনিক আমল ও সালাত ট্র্যাকার</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {/* Daily Score Progress Banner */}
          <div style={{ background: "linear-gradient(135deg, var(--pri), var(--pri-dark))", color: "#fff", borderRadius: 16, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>আজকের তারিখ: {todayStr}</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>আপনার আজকের আমল স্কোর: {scorePercent}%</div>
              </div>
              <div style={{ fontSize: 28 }}>
                {scorePercent >= 80 ? "🌟" : scorePercent >= 50 ? "👍" : "🌱"}
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ height: 8, background: "rgba(255,255,255,0.25)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${scorePercent}%`, height: "100%", background: "#fff", borderRadius: 999, transition: "width 0.3s ease" }}></div>
            </div>
          </div>

          {/* 5 Prayers Grid */}
          <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "var(--pri)" }}>
              ৫ ওয়াক্ত সালাত চেকলিস্ট
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {prayersList.map(({ key, label }) => {
                const currentVal = record[key] as string;
                return (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)", padding: "8px 12px", borderRadius: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{label}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => updateRecord({ [key]: currentVal === "jamat" ? "none" : "jamat" })}
                        style={{
                          border: 0, padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                          background: currentVal === "jamat" ? "var(--pri)" : "var(--card)",
                          color: currentVal === "jamat" ? "#fff" : "var(--muted)",
                          borderWidth: 1, borderStyle: "solid", borderColor: currentVal === "jamat" ? "var(--pri)" : "var(--bd)"
                        }}
                      >
                        🕌 জামাতে
                      </button>
                      <button
                        onClick={() => updateRecord({ [key]: currentVal === "alone" ? "none" : "alone" })}
                        style={{
                          border: 0, padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                          background: currentVal === "alone" ? "var(--pri2)" : "var(--card)",
                          color: currentVal === "alone" ? "#fff" : "var(--muted)",
                          borderWidth: 1, borderStyle: "solid", borderColor: currentVal === "alone" ? "var(--pri2)" : "var(--bd)"
                        }}
                      >
                        👤 একাকী
                      </button>
                      <button
                        onClick={() => updateRecord({ [key]: currentVal === "missed" ? "none" : "missed" })}
                        style={{
                          border: 0, padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                          background: currentVal === "missed" ? "var(--bad)" : "var(--card)",
                          color: currentVal === "missed" ? "#fff" : "var(--muted)",
                          borderWidth: 1, borderStyle: "solid", borderColor: currentVal === "missed" ? "var(--bad)" : "var(--bd)"
                        }}
                      >
                        ✕ কাযা
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Other Daily Deeds */}
          <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14 }}>
            <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "var(--pri)" }}>
              অন্যান্য নেক আমল
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Quran Pages */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)", padding: "10px 12px", borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>📖 কুরআন তিলাওয়াত</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>আজ কত পৃষ্ঠা পড়া হলো?</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => updateRecord({ quranPages: Math.max(0, record.quranPages - 1) })} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--bd)", background: "var(--card)", cursor: "pointer" }}>-</button>
                  <span style={{ fontSize: 14, fontWeight: 800, minWidth: 24, textAlign: "center" }}>{record.quranPages}</span>
                  <button onClick={() => updateRecord({ quranPages: record.quranPages + 1 })} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--bd)", background: "var(--card)", cursor: "pointer" }}>+</button>
                </div>
              </div>

              {/* Checkboxes */}
              {[
                { key: "tahajjud", label: "🌙 শেষ রাতে তাহাজ্জুদ সালাত" },
                { key: "morningAdhkar", label: "☀️ সকালের মাসনুন যিকির" },
                { key: "eveningAdhkar", label: "🌅 সন্ধ্যার মাসনুন যিকির" },
                { key: "sadaqah", label: "🪙 দান বা সদাকাহ প্রদান" }
              ].map(({ key, label }) => {
                const checked = record[key as keyof DailyRecord] as boolean;
                return (
                  <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg)", padding: "10px 12px", borderRadius: 10, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => updateRecord({ [key]: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: "var(--pri)" }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 600, color: checked ? "var(--pri)" : "var(--text)" }}>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
