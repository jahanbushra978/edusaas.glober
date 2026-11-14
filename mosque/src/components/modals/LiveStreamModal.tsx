"use client";
import { useState } from "react";

export function LiveStreamModal({ onClose }: { onClose: () => void }) {
  const [stream, setStream] = useState<"makkah" | "madinah">("makkah");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🕋</span>
            <span>মক্কা ও মদিনা মুকাররমা সরাসরি লাইভ</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {/* Stream selector buttons */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <button
              onClick={() => setStream("makkah")}
              style={{
                flex: 1, padding: "10px", borderRadius: 12, border: 0,
                background: stream === "makkah" ? "var(--pri)" : "var(--bg)",
                color: stream === "makkah" ? "#fff" : "var(--text)",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6
              }}
            >
              <span>🕋</span>
              <span>মসজিদুল হারাম (মক্কা)</span>
            </button>
            <button
              onClick={() => setStream("madinah")}
              style={{
                flex: 1, padding: "10px", borderRadius: 12, border: 0,
                background: stream === "madinah" ? "var(--pri)" : "var(--bg)",
                color: stream === "madinah" ? "#fff" : "var(--text)",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6
              }}
            >
              <span>🕌</span>
              <span>মসজিদে নববী (মদিনা)</span>
            </button>
          </div>

          {/* Video Player Display Container */}
          <div style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: 16,
            overflow: "hidden",
            background: "#0c1410",
            marginBottom: 14,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
          }}>
            {stream === "makkah" ? (
              <iframe
                src="https://www.youtube-nocookie.com/embed/live_stream?channel=UC4h_f24Jp5A3C7s0gXy-nNA&autoplay=1&mute=1"
                title="Makkah Live Stream"
                style={{ width: "100%", height: "100%", border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <iframe
                src="https://www.youtube-nocookie.com/embed/live_stream?channel=UCj7XgXW3l6R9P3Fz4V8yAxg&autoplay=1&mute=1"
                title="Madinah Live Stream"
                style={{ width: "100%", height: "100%", border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}

            {/* Live Indicator Badge */}
            <div style={{
              position: "absolute", top: 12, left: 12,
              background: "#ef4444", color: "#fff",
              padding: "3px 10px", borderRadius: 999,
              fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
              display: "flex", alignItems: "center", gap: 5,
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
            }}>
              <span style={{ width: 6, height: 6, background: "#fff", borderRadius: "50%", display: "inline-block" }}></span>
              LIVE সরাসরি
            </div>
          </div>

          {/* Details & Virtues Card */}
          <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14 }}>
            {stream === "makkah" ? (
              <div>
                <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "var(--pri)" }}>
                  মসজিদুল হারাম ও পবিত্র কাবার মর্যাদা
                </h4>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "var(--text)" }}>
                  রাসূলুল্লাহ (সা.) বলেছেন: "মসজিদুল হারামে এক রাকাত সালাত আদায় করা অন্য যেকোনো মসজিদে এক লক্ষ রাকাত সালাত আদায়ের সমতুল্য সওয়াব।" — (মুসনাদে আহমাদ)
                </p>
              </div>
            ) : (
              <div>
                <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "var(--pri)" }}>
                  মসজিদে নববী ও রওজা মুবারকের মর্যাদা
                </h4>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "var(--text)" }}>
                  রাসূলুল্লাহ (সা.) বলেছেন: "আমার এই মসজিদে এক রাকাত সালাত আদায় করা মসজিদুল হারাম ছাড়া অন্য যেকোনো মসজিদে এক হাজার রাকাত সালাত আদায়ের চেয়েও উত্তম।" — (সহীহ বুখারী)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
