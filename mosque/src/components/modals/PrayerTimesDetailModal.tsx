"use client";
import { useState } from "react";

interface PrayerSchedule {
  name: string;
  arabic: string;
  start: string;
  end: string;
  jamat: string;
  virtue: string;
}

const PRAYER_SCHEDULE: PrayerSchedule[] = [
  { name: "ফজর", arabic: "الفجر", start: "০৪:৪৫ AM", end: "০৫:৫৫ AM", jamat: "০৫:২০ AM", virtue: "যে ব্যক্তি ফজরের নামাজ আদায় করে সে আল্লাহর প্রত্যক্ষ নিরাপত্তায় থাকে।" },
  { name: "যোহর", arabic: "الظهر", start: "১১:৫৫ AM", end: "০৪:০৫ PM", jamat: "০১:১৫ PM", virtue: "দুপুরের পর আসমানের দরজা খুলে দেওয়া হয়, তাই এ সময় নেক আমল পছন্দনীয়।" },
  { name: "আসর", arabic: "العصر", start: "০৪:১০ PM", end: "০৫:৩৫ PM", jamat: "০৪:৪০ PM", virtue: "যে ব্যক্তি আসরের নামাজ ইচ্ছাকৃতভাবে ত্যাগ করে তার আমল বিনষ্ট হয়ে যায়।" },
  { name: "মাগরিব", arabic: "المغرب", start: "০৫:৪০ PM", end: "০৬:৫৫ PM", jamat: "০৫:৪৫ PM", virtue: "সূর্যাস্তের সাথে সাথেই বিলম্ব না করে মাগরিবের সালাত আদায় করা সুন্নাহ।" },
  { name: "এশা", arabic: "العشاء", start: "০৭:০০ PM", end: "১১:৩০ PM", jamat: "০৮:০০ PM", virtue: "ফজর ও এশার জামাতে উপস্থিত হওয়া মুনাফেকদের জন্য সবচেয়ে কঠিন ও মুমিনের মর্যাদা বৃদ্ধি করে।" }
];

const PROHIBITED_TIMES = [
  { time: "০৫:৫৫ AM — ০৬:১৫ AM", label: "সূর্যোদয়ের সময় (প্রায় ২০ মিনিট)", note: "কোনো প্রকার নামাজ বা সিজদা করা হারাম।" },
  { time: "১১:৪০ AM — ১১:৫৪ AM", label: "ঠিক দ্বিপ্রহরের সময় (সূর্য মাথার উপরে)", note: "যোহরের ওয়াক্ত শুরুর আগ পর্যন্ত নামাজ নিষিদ্ধ।" },
  { time: "০৫:২০ PM — ০৫:৪০ PM", label: "সূর্যাস্তের সময় (হলুদ বর্ণ ধারণ করলে)", note: "ঐ দিনের কাযা আসরের ফরজ ব্যতীত অন্য নামাজ নিষিদ্ধ।" }
];

const NAFL_TIMES = [
  { name: "তাহাজ্জুদ সমাপ্তি ও সাহরি", time: "০৪:৩০ AM", desc: "রাতের শেষ তৃতীয়াংশে দোয়া কবুলের সর্বোত্তম সময়।" },
  { name: "ইশরাক সালাত", time: "০৬:২৫ AM", desc: "সূর্যোদয়ের ২০ মিনিট পর আদায় করলে একটি কবুল হজ ও ওমরার সওয়াব।" },
  { name: "চাশত / সালাতুত দুহা", time: "০৯:৩০ AM", desc: "শরীরের প্রতিটি অঙ্গ ও জোড়ার সদাকাহ আদায় হয়ে যায়।" },
  { name: "ইফতার ও মাগরিব আহ্বান", time: "০৫:৪০ PM", desc: "রোজাদারের জন্য মহান আল্লাহর বিশেষ রহমতের সময়।" }
];

export function PrayerTimesDetailModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"fardh" | "prohibited" | "nafl">("fardh");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>⏱️</span>
            <span>৫ ওয়াক্ত নামাজের পূর্ণাঙ্গ সময়সূচি ও জামাত</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {/* Top navigation tabs */}
          <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--bd)", paddingBottom: 10, marginBottom: 16 }}>
            <button
              onClick={() => setActiveTab("fardh")}
              style={{
                border: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: activeTab === "fardh" ? "var(--pri)" : "var(--bg)", color: activeTab === "fardh" ? "#fff" : "var(--text)"
              }}
            >
              🕌 ৫ ওয়াক্ত ও জামাত
            </button>
            <button
              onClick={() => setActiveTab("prohibited")}
              style={{
                border: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: activeTab === "prohibited" ? "var(--pri)" : "var(--bg)", color: activeTab === "prohibited" ? "#fff" : "var(--text)"
              }}
            >
              ⛔ নিষিদ্ধ ৩টি সময়
            </button>
            <button
              onClick={() => setActiveTab("nafl")}
              style={{
                border: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: activeTab === "nafl" ? "var(--pri)" : "var(--bg)", color: activeTab === "nafl" ? "#fff" : "var(--text)"
              }}
            >
              ✨ নফল, তাহাজ্জুদ ও সাহরি
            </button>
          </div>

          {activeTab === "fardh" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PRAYER_SCHEDULE.map((p, idx) => (
                <div key={idx} style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: "14px", boxShadow: "var(--sh)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "var(--pri)" }}>{p.name}</span>
                      <span style={{ fontSize: 14, fontFamily: "Amiri, serif", color: "var(--muted)" }}>{p.arabic}</span>
                    </div>
                    <span style={{ background: "var(--pri)", color: "#fff", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                      জামাত: {p.jamat}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text)", marginBottom: 8, background: "var(--bg)", padding: "8px 12px", borderRadius: 8 }}>
                    <div>ওয়াক্ত শুরু: <b>{p.start}</b></div>
                    <div>ওয়াক্ত শেষ: <b>{p.end}</b></div>
                  </div>

                  <div style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic" }}>
                    💡 <b>ফজিলত:</b> {p.virtue}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "prohibited" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid #fca5a5", borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--bad)", marginBottom: 4 }}>
                  ⚠️ যেসব সময়ে সালাত আদায় করা সম্পূর্ণ নিষেধ
                </div>
                <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>
                  সহীহ হাদীসের নির্দেশনা মোতাবেক দিনের এই ৩টি নির্দিষ্ট সময়ে যেকোনো ধরণের ফরজ, ওয়াজিব বা নফল নামাজ আদায় করা ও সিজদায়ে তিলাওয়াত করা নিষিদ্ধ।
                </div>
              </div>

              {PROHIBITED_TIMES.map((pt, i) => (
                <div key={i} style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--bad)" }}>{pt.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>{pt.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{pt.note}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "nafl" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {NAFL_TIMES.map((n, i) => (
                <div key={i} style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--pri)" }}>{n.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--pri-dark)", background: "var(--pri-soft)", padding: "3px 8px", borderRadius: 999 }}>
                      {n.time}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{n.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
