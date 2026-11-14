"use client";
import { useState } from "react";

export function RozaModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"duas" | "nafl" | "rules">("duas");

  const NAFL_FASTS = [
    { title: "আইয়ামে বীজের রোযা", date: "প্রতি চান্দ্র মাসের ১৩, ১৪ ও ১৫ তারিখ", virtue: "রাসূলুল্লাহ (সা.) বলেছেন: প্রতি মাসে ৩ দিন রোযা রাখা সারা বছর রোযা রাখার সমতুল্য।" },
    { title: "সোম ও বৃহস্পতিবারের রোযা", date: "প্রতি সপ্তাহের সোম ও বৃহস্পতিবার", virtue: "এ দুই দিন মহান আল্লাহর দরবারে বান্দার আমলনামা পেশ করা হয়; নবীজী (সা.) রোযাদার অবস্থায় আমল পেশ পছন্দ করতেন।" },
    { title: "আরাফাতের দিনের রোযা", date: "৯ই যিলহজ্জ (হজের দিন)", virtue: "নবীজী (সা.) বলেছেন: আরাফাতের রোযা পূর্ববর্তী এক বছর ও পরবর্তী এক বছরের গুনাহের কাফফারা স্বরূপ।" },
    { title: "আশুরার রোযা", date: "১০ই মুহাররম (সাথে ৯ বা ১১ই মুহাররম)", virtue: "বিগত এক বছরের গুনাহ মাফ করে দেওয়া হয়।" }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🌙</span>
            <span>মাহে রমজান ও নফল রোযার দিনপঞ্জিকা ও দু'আ</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {/* Sehri & Iftar banner */}
          <div style={{ background: "linear-gradient(135deg, var(--pri), var(--pri-dark))", color: "#fff", borderRadius: 16, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ textAlign: "center", flex: 1, borderRight: "1px solid rgba(255,255,255,0.2)" }}>
                <div style={{ fontSize: 11, opacity: 0.85 }}>আজকের সাহরি শেষ</div>
                <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>০৪:৩০ AM</div>
              </div>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 11, opacity: 0.85 }}>আজকের ইফতার সময়</div>
                <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>০৫:৪০ PM</div>
              </div>
            </div>
          </div>

          {/* Top navigation tabs */}
          <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--bd)", paddingBottom: 10, marginBottom: 16 }}>
            <button
              onClick={() => setActiveTab("duas")}
              style={{
                border: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: activeTab === "duas" ? "var(--pri)" : "var(--bg)", color: activeTab === "duas" ? "#fff" : "var(--text)"
              }}
            >
              🤲 নিয়ত ও ইফতারের দো'আ
            </button>
            <button
              onClick={() => setActiveTab("nafl")}
              style={{
                border: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: activeTab === "nafl" ? "var(--pri)" : "var(--bg)", color: activeTab === "nafl" ? "#fff" : "var(--text)"
              }}
            >
              📅 সুন্নাত নফল রোযা
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              style={{
                border: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: activeTab === "rules" ? "var(--pri)" : "var(--bg)", color: activeTab === "rules" ? "#fff" : "var(--text)"
              }}
            >
              ⚠️ রোযা ভঙ্গের কারণ
            </button>
          </div>

          {activeTab === "duas" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Niyyat */}
              <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 16 }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "var(--pri)" }}>
                  রোযার নিয়ত (মনে সংকল্পই মূল):
                </h4>
                <div style={{ background: "var(--bg)", padding: 12, borderRadius: 10, fontSize: 16, fontFamily: "Amiri, serif", textAlign: "right", color: "var(--pri-dark)", lineHeight: 1.8, marginBottom: 6 }}>
                  نَوَيْتُ أَنْ أَصُومَ غَدًا مِنْ شَهْرِ رَمَضَانَ الْمُبَارَكِ فَرْضًا لَكَ يَا اللَّهُ فَتَقَبَّلْ مِنِّي
                </div>
                <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>
                  <b>বাংলা নিয়ত:</b> হে আল্লাহ! আমি আপনার সন্তুষ্টির উদ্দেশ্যে আগামীকাল পবিত্র রমজানের ফরজ রোযা রাখার নিয়ত করছি, আপনি আমার পক্ষ হতে তা কবুল করুন।
                </div>
              </div>

              {/* Iftar Dua */}
              <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 16 }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "var(--pri)" }}>
                  ইফতারের সহীহ সুন্নাত দো'আ:
                </h4>
                <div style={{ background: "var(--bg)", padding: 12, borderRadius: 10, fontSize: 16, fontFamily: "Amiri, serif", textAlign: "right", color: "var(--pri-dark)", lineHeight: 1.8, marginBottom: 6 }}>
                  ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                  <b>উচ্চারণ:</b> জাহাবায জামা'উ, ওয়াবতাল্লাতিল উরূকু, ওয়া সাবাতাল আজরু ইনশাআল্লাহ।
                </div>
                <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>
                  <b>অর্থ:</b> পিপাসা দূরীভূত হলো, শিরা-উপশিরা সিক্ত হলো এবং আল্লাহর ইচ্ছায় প্রতিদান নির্ধারিত হলো। — (আবু দাউদ: ২৩৫৭)
                </div>
              </div>
            </div>
          )}

          {activeTab === "nafl" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {NAFL_FASTS.map((f, i) => (
                <div key={i} style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--pri)" }}>{f.title}</span>
                    <span style={{ fontSize: 11, background: "var(--pri-soft)", color: "var(--pri-dark)", padding: "3px 8px", borderRadius: 999, fontWeight: 600 }}>
                      {f.date}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>{f.virtue}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "rules" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14 }}>
                <h4 style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "var(--bad)" }}>
                  যেসব কারণে রোযা ভঙ্গ হয়ে যায়:
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.6, color: "var(--text)" }}>
                  <li>ইচ্ছাকৃতভাবে পানাহার বা ধূমপান করলে।</li>
                  <li>স্ত্রী সহবাস বা এমন কাজে লিপ্ত হলে যা রোযার মূল উদ্দেশ্য নষ্ট করে।</li>
                  <li>ইচ্ছাকৃতভাবে মুখ ভরে বমি করলে।</li>
                  <li>শরীরে পুষ্টিদায়ক কোনো ইনজেকশন বা স্যালাইন গ্রহণ করলে।</li>
                </ul>
              </div>

              <div style={{ background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14 }}>
                <h4 style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "var(--pri)" }}>
                  যেসব কারণে রোযা নষ্ট হয় না:
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.6, color: "var(--text)" }}>
                  <li>ভুলবশত পানাহার করে ফেললে (মনে পড়ার সাথে সাথে খাওয়া বন্ধ করতে হবে)।</li>
                  <li>চোখে সুরমা বা ড্রপ দিলে।</li>
                  <li>রক্ত পরীক্ষা বা চিকিৎসার প্রয়োজনে শিরাপথে রক্ত দিলে বা ইনসুলিন নিলে।</li>
                  <li>গোসল করলে বা মাথায় পানি ঢাললে।</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
