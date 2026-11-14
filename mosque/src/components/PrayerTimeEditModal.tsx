"use client";
import { useState } from "react";

export type PrayerTime = {
  id: string;
  name: string;
  start: string;
  jamaat: string;
  startMins: number;
  endMins: number;
};

interface PrayerTimeEditModalProps {
  schedule: PrayerTime[];
  onClose: () => void;
  onSave: (updated: PrayerTime[]) => void;
  onReset: () => void;
}

export function PrayerTimeEditModal({ schedule, onClose, onSave, onReset }: PrayerTimeEditModalProps) {
  const [times, setTimes] = useState<PrayerTime[]>(() => JSON.parse(JSON.stringify(schedule)));
  const [jummahTime, setJummahTime] = useState(() => {
    return typeof window !== "undefined" ? localStorage.getItem("mosque_jummah_jamaat") || "০১:৩০ PM" : "০১:৩০ PM";
  });

  const handleChange = (id: string, field: "start" | "jamaat", value: string) => {
    setTimes((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

function parseTimeToMinutes(timeStr: string, waqtId?: string): number | null {
  if (!timeStr) return null;
  const bnToEn: Record<string, string> = { "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9" };
  const normalized = timeStr.replace(/[০-৯]/g, (d) => bnToEn[d] || d).trim();
  const match = normalized.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);
  if (!match) return null;
  const hStr = match[1] ?? "0";
  const mStr = match[2] ?? "0";
  let hours = parseInt(hStr, 10);
  const mins = parseInt(mStr, 10);
  const modifier = match[3]?.toUpperCase();
  if (modifier === "PM" && hours < 12) hours += 12;
  else if (modifier === "AM" && hours === 12) hours = 0;
  else if (!modifier) {
    if ((waqtId === "asr" || waqtId === "maghrib" || waqtId === "isha") && hours < 12) {
      hours += 12;
    } else if (waqtId === "dhuhr" && hours >= 1 && hours < 12) {
      hours += 12;
    }
  }
  return hours * 60 + mins;
}

  const handleSave = () => {
    const updated = times.map((t, idx, arr) => {
      const parsedStart = parseTimeToMinutes(t.start, t.id);
      const startMins = parsedStart !== null ? parsedStart : t.startMins;
      const nextItem = arr[(idx + 1) % arr.length];
      const parsedNext = nextItem ? parseTimeToMinutes(nextItem.start, nextItem.id) : null;
      const endMins = parsedNext !== null ? (parsedNext < startMins ? parsedNext + 1440 : parsedNext) : t.endMins;
      return { ...t, startMins, endMins };
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("mosque_jummah_jamaat", jummahTime);
    }
    onSave(updated);
    onClose();
  };

  const handleReset = () => {
    if (confirm("আপনি কি সময়সূচি রিসেট করে ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("mosque_jummah_jamaat");
      }
      onReset();
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🕌</span>
            <span>জামাত ও নামাজের সময়সূচি পরিবর্তন</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div style={{ background: "var(--pri-soft)", border: "1px solid var(--pri)", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "var(--pri-dark)" }}>
            💡 <b>পরামর্শ:</b> আপনার মসজিদের নিজস্ব সময়সূচি অনুযায়ী যেকোনো ওয়াক্তের জামাত বা শুরুর সময় পরিবর্তন করুন। এটি সাথে সাথে ড্যাশবোর্ডে আপডেট হবে।
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {times.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--bd)",
                  borderRadius: 12,
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div style={{ minWidth: 65, fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
                  {p.name}
                </div>

                <div style={{ display: "flex", gap: 8, flex: 1 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 2 }}>ওয়াক্ত শুরু</label>
                    <input
                      type="text"
                      value={p.start}
                      onChange={(e) => handleChange(p.id, "start", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid var(--bd)",
                        background: "var(--card)",
                        color: "var(--text)",
                      }}
                      placeholder="যেমন: ০৪:৪৫ AM"
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: "var(--ok)", fontWeight: 700, display: "block", marginBottom: 2 }}>
                      জামাতের সময় ⭐
                    </label>
                    <input
                      type="text"
                      value={p.jamaat}
                      onChange={(e) => handleChange(p.id, "jamaat", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        fontSize: 12,
                        fontWeight: 700,
                        borderRadius: 8,
                        border: "1.5px solid var(--ok)",
                        background: "var(--card)",
                        color: "var(--text)",
                      }}
                      placeholder="যেমন: ০৫:১৫ AM"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Special Jummah Jamaat */}
            <div
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1px dashed var(--ok)",
                borderRadius: 12,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ minWidth: 65, fontWeight: 700, fontSize: 15, color: "var(--ok)" }}>
                জুমুআ
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: "var(--ok)", fontWeight: 700, display: "block", marginBottom: 2 }}>
                  জুমার খুতবা ও জামাত
                </label>
                <input
                  type="text"
                  value={jummahTime}
                  onChange={(e) => setJummahTime(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 8,
                    border: "1px solid var(--ok)",
                    background: "var(--card)",
                    color: "var(--text)",
                  }}
                  placeholder="যেমন: ০১:৩০ PM"
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, borderTop: "1px solid var(--bd)", paddingTop: 12 }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: "transparent",
                border: "1px solid var(--bd)",
                color: "var(--muted)",
                padding: "8px 14px",
                borderRadius: 10,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ↺ ডিফল্ট সময়
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--bd)",
                  color: "var(--text)",
                  padding: "8px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  background: "var(--pri)",
                  border: 0,
                  color: "#fff",
                  padding: "8px 18px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
              >
                ✓ সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
