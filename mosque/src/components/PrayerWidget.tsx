"use client";
import { useState, useEffect } from "react";
import { PrayerTime, PrayerTimeEditModal } from "./PrayerTimeEditModal";

const DEFAULT_SCHEDULE: PrayerTime[] = [
  { id: "fajr", name: "ফজর", start: "০৪:৪৫ AM", jamaat: "০৫:১৫ AM", startMins: 285, endMins: 354 },
  { id: "dhuhr", name: "যোহর", start: "১১:৫৮ AM", jamaat: "০১:১৫ PM", startMins: 718, endMins: 965 },
  { id: "asr", name: "আসর", start: "০৪:০৫ PM", jamaat: "০৪:৪৫ PM", startMins: 965, endMins: 1058 },
  { id: "maghrib", name: "মাগরিব", start: "০৫:৩৮ PM", jamaat: "০৫:৪৫ PM", startMins: 1058, endMins: 1130 },
  { id: "isha", name: "এশা", start: "০৬:৫০ PM", jamaat: "০৮:০০ PM", startMins: 1130, endMins: 1440 },
];

export function PrayerWidget() {
  const [schedule, setSchedule] = useState<PrayerTime[]>(DEFAULT_SCHEDULE);
  const [currentPrayer, setCurrentPrayer] = useState(DEFAULT_SCHEDULE[4]!);
  const [nextJamaat, setNextJamaat] = useState("এশা জামাত: ০৮:০০ PM");
  const [countdown, setCountdown] = useState("");
  const [showFullSchedule, setShowFullSchedule] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load custom schedule from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mosque_prayer_schedule");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 5) {
          setSchedule(parsed);
        }
      }
    } catch {
      // fallback to default
    }
  }, []);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();

      // Find active prayer
      const active = schedule.find((p) => currentMins >= p.startMins && currentMins < p.endMins) || schedule[4]!;
      setCurrentPrayer(active);

      // Next prayer & countdown
      let next = schedule.find((p) => p.startMins > currentMins) || schedule[0]!;
      let diff = next.startMins - currentMins;
      if (diff < 0) diff += 1440;
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      setCountdown(`${hours > 0 ? `${hours} ঘণ্টা ` : ""}${mins} মিনিট বাকি`);
      setNextJamaat(`${next.name} শুরু: ${next.start}`);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 60000);
    return () => clearInterval(interval);
  }, [schedule]);

  const handleSaveSchedule = (updated: PrayerTime[]) => {
    setSchedule(updated);
    try {
      localStorage.setItem("mosque_prayer_schedule", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetSchedule = () => {
    setSchedule(DEFAULT_SCHEDULE);
    try {
      localStorage.removeItem("mosque_prayer_schedule");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Hijri & Bangla Seasonal Date Card */}
      <div className="hijri-banner-card">
        <div className="hijri-title">
          <span>৩০ রবিউল, ১ জুমাদাল উলা ১৪৪৮ হি. ইয়াওমুছ ছুলাছা</span>
          <span>🌙</span>
        </div>
        <div className="bangla-subtitle">
          সোমবার, ২৭ আশ্বিন ১৪৩৩ বঙ্গাব্দ, শরৎকাল · সূর্যোদয় ০৫:৫৪ AM · সূর্যাস্ত ০৫:৩৮ PM
        </div>
      </div>

      {/* Prayer Arc & Status Widget */}
      <div className="prayer-card">
        <div className="prayer-arc-view">
          <div>
            <span style={{ color: "var(--muted)" }}>☀️ আসর</span>
            <span style={{ marginLeft: 6 }}>০৪:০৫ মি.</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 16 }}>🌙</span>
            <div style={{ fontSize: 12, color: "var(--pri)", fontWeight: 700 }}>{currentPrayer.name} ওয়াক্ত</div>
          </div>
          <div>
            <span style={{ color: "var(--muted)" }}>তাহাজ্জুদ শেষ</span>
            <span style={{ marginLeft: 6 }}>০৪:৩৪ মি. ✔️</span>
          </div>
        </div>

        {/* Current running prayer details */}
        <div className="prayer-status-row">
          <div className="prayer-name">{currentPrayer.name} ওয়াক্ত</div>
          <div
            className="prayer-time"
            onClick={() => setShowEditModal(true)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            title="জামাত সময় পরিবর্তন করতে ক্লিক করুন"
          >
            <span>{currentPrayer.start} – জামাত: <b>{currentPrayer.jamaat}</b></span>
            <span style={{ fontSize: 11, color: "var(--pri)", textDecoration: "underline" }}>✏️ পরিবর্তন</span>
          </div>
        </div>

        {/* Footer with pulsating live indicator */}
        <div className="prayer-footer">
          <div className="status-pill">
            <span className="status-dot"></span>
            <span>চলমান</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{countdown ? `পরবর্তী ওয়াক্ত: ${countdown}` : nextJamaat}</div>
        </div>

        {/* 5-Waqt Full Daily Prayer & Jamaat Schedule Board */}
        <div style={{ marginTop: 14, borderTop: "1px solid var(--bd)", paddingTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>🕌 ৫ ওয়াক্তের শুরু ও জামাতের সময়সূচি:</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                onClick={() => setShowEditModal(true)}
                style={{
                  background: "var(--pri-light)",
                  border: "1px solid var(--pri)",
                  color: "var(--pri-dark)",
                  borderRadius: 999,
                  padding: "3px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>✏️</span>
                <span>জামাত সময় পরিবর্তন</span>
              </button>
              <button
                onClick={() => setShowFullSchedule(!showFullSchedule)}
                style={{ background: "none", border: 0, fontSize: 11, color: "var(--pri)", fontWeight: 700, cursor: "pointer" }}
              >
                {showFullSchedule ? "সংক্ষেপ ▴" : "বিস্তারিত ▾"}
              </button>
            </div>
          </div>

          {showFullSchedule && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {schedule.map((p) => {
                const isActive = p.id === currentPrayer.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setShowEditModal(true)}
                    style={{
                      background: isActive ? "var(--pri-light)" : "var(--bg)",
                      border: isActive ? "1.5px solid var(--pri)" : "1px solid var(--bd)",
                      borderRadius: 12,
                      padding: "8px 4px",
                      textAlign: "center",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                    title="সময়সূচি পরিবর্তন করতে ক্লিক করুন"
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? "var(--pri-dark)" : "var(--text)" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                      শুরু: {p.start.replace(" AM", "").replace(" PM", "")}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: isActive ? "var(--pri)" : "var(--ok)", marginTop: 2 }}>
                      জামাত: {p.jamaat.replace(" AM", "").replace(" PM", "")}
                    </div>
                    {isActive && (
                      <span style={{ display: "inline-block", fontSize: 9, background: "var(--pri)", color: "#fff", padding: "1px 5px", borderRadius: 99, marginTop: 4, fontWeight: 700 }}>
                        চলমান
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <PrayerTimeEditModal
          schedule={schedule}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveSchedule}
          onReset={handleResetSchedule}
        />
      )}
    </>
  );
}
