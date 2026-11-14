"use client";
import { useState, useEffect } from "react";

export function QiblaModal({ onClose }: { onClose: () => void }) {
  const [heading, setHeading] = useState<number>(0);
  const [deviceSupported, setDeviceSupported] = useState<boolean>(false);
  const qiblaAngle = 268; // Dhaka, Bangladesh to Ka'bah angle in degrees

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setDeviceSupported(true);
        // iOS or absolute heading handling
        const compassHeading = (e as any).webkitCompassHeading ?? (360 - e.alpha);
        setHeading(Math.round(compassHeading));
      }
    };

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
    };
  }, []);

  const relativeRotation = (qiblaAngle - heading + 360) % 360;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🧭</span>
            <span>কিবলা দিকদর্শন কম্পাস (পবিত্র কা'বা)</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ textAlign: "center", maxHeight: "78vh", overflowY: "auto" }}>
          <div style={{ background: "var(--bg)", borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>বর্তমান অবস্থান: বাংলাদেশ (ঢাকা)</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--pri)", margin: "4px 0" }}>
              কিবলার কোণ: ২৬৮° পশ্চিম (WNW)
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              পবিত্র মক্কা মুকাররমা দূরত্ব: প্রায় ৪,৮২০ কিলোমিটার
            </div>
          </div>

          {/* Graphical Compass Dial */}
          <div style={{ position: "relative", width: 230, height: 230, margin: "0 auto 20px" }}>
            {/* Outer ring */}
            <div style={{
              width: "100%", height: "100%", borderRadius: "50%",
              border: "6px solid var(--bd)",
              background: "var(--card)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              position: "relative",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {/* Cardinal directions */}
              <span style={{ position: "absolute", top: 8, fontSize: 13, fontWeight: 800, color: "#ef4444" }}>N (উত্তর)</span>
              <span style={{ position: "absolute", bottom: 8, fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>S (দক্ষিণ)</span>
              <span style={{ position: "absolute", left: 10, fontSize: 12, fontWeight: 800, color: "var(--pri)" }}>W (পশ্চিম)</span>
              <span style={{ position: "absolute", right: 10, fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>E (পূর্ব)</span>

              {/* Rotating Needle / Arrow pointing to Ka'bah */}
              <div style={{
                position: "absolute",
                width: 140,
                height: 140,
                transition: "transform 0.2s ease-out",
                transform: `rotate(${deviceSupported ? relativeRotation : 268}deg)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start"
              }}>
                <div style={{
                  width: 0,
                  height: 0,
                  borderLeft: "12px solid transparent",
                  borderRight: "12px solid transparent",
                  borderBottom: "45px solid var(--pri)",
                  filter: "drop-shadow(0 2px 6px rgba(5,150,105,0.5))"
                }} />
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "var(--pri)",
                  marginTop: -10,
                  border: "3px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: "#fff"
                }}>
                  🕋
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: deviceSupported ? "var(--ok)" : "var(--muted)", fontWeight: 600, marginBottom: 14 }}>
            {deviceSupported ? `✓ মোবাইল সেন্সর সক্রিয় (ডিগ্রি: ${heading}°)` : "📍 স্থির রেফারেন্স: পশ্চিম হতে সামান্য উত্তর দিকে ২৬৮° কোণে মুখ করুন"}
          </div>

          {/* Fiqh rulings about Qibla */}
          <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14, textAlign: "left" }}>
            <h4 style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "var(--pri)" }}>
              কিবলা সম্পর্কিত জরুরি শরয়ী বিধান:
            </h4>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.6, color: "var(--text)" }}>
              <li>নামাজ শুদ্ধ হওয়ার জন্য কিবলামুখী হওয়া অন্যতম মৌলিক শর্ত (ফরজ)।</li>
              <li>সফর অবস্থায় বা অচেনা স্থানে কিবলা নিশ্চিত না হলে চিন্তা-ভাবনা করে যেদিকে প্রবল ধারণা হয় সেদিকে ফিরে নামাজ আদায় করা যায়।</li>
              <li>চলন্ত নৌযান বা বিমানে থাকলে তাকবীরে তাহরীমার সময় কিবলামুখী হওয়ার চেষ্টা করতে হবে।</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
