"use client";
import { useState } from "react";

export function NikahModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"pillars" | "mahr" | "etiquette">("pillars");

  // Mohre Fatemi estimate based on approx 500 dirham (~131.25 tola silver ~ 1,75,000 BDT)
  const MOHRE_FATEMI = 175000;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>💍</span>
            <span>সুন্নতি বিবাহ ও পারিবারিক নির্দেশিকা</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {/* Top navigation tabs */}
          <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--bd)", paddingBottom: 10, marginBottom: 16 }}>
            <button
              onClick={() => setActiveTab("pillars")}
              style={{
                border: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: activeTab === "pillars" ? "var(--pri)" : "var(--bg)", color: activeTab === "pillars" ? "#fff" : "var(--text)"
              }}
            >
              📜 বিয়ের ৪ শর্ত
            </button>
            <button
              onClick={() => setActiveTab("mahr")}
              style={{
                border: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: activeTab === "mahr" ? "var(--pri)" : "var(--bg)", color: activeTab === "mahr" ? "#fff" : "var(--text)"
              }}
            >
              💰 মোহরানা ও মোহরে ফাতেমী
            </button>
            <button
              onClick={() => setActiveTab("etiquette")}
              style={{
                border: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: activeTab === "etiquette" ? "var(--pri)" : "var(--bg)", color: activeTab === "etiquette" ? "#fff" : "var(--text)"
              }}
            >
              🌿 সুন্নতি বরকত
            </button>
          </div>

          {activeTab === "pillars" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { title: "১. ইজাব ও কবুল (প্রস্তাব ও সম্মতি)", desc: "একই মজলিসে স্পষ্ট শব্দে বিবাহ প্রস্তাব দেওয়া এবং তা কবুল করা। পাত্র ও পাত্রী উভয়ের স্পষ্ট সম্মতি আবশ্যক।" },
                { title: "২. ওয়ালী বা অভিভাবকের উপস্থিতি", desc: "কন্যার বৈধ অভিভাবক (পিতা বা তার অবর্তমানে শরীয়ত নির্ধারিত অভিভাবক)-এর অনুমোদন ও অভিভাবকত্ব।" },
                { title: "৩. দুজন প্রাপ্তবয়স্ক ন্যায়পরায়ণ সাক্ষী", desc: "কমপক্ষে দুজন ন্যায়পরায়ণ পুরুষ সাক্ষী অথবা একজন পুরুষ ও দুজন নারী সাক্ষীর উপস্থিতিতে বিয়ে অনুষ্ঠিত হতে হবে।" },
                { title: "৪. মোহরানা নির্ধারণ (ফরজ)", desc: "স্ত্রীর জন্য অবশ্যপ্রদেয় আর্থিক সম্মান ও অধিকার। মোহর নির্ধারণ ব্যতিরেকে বিয়ে শুদ্ধ হয় না।" }
              ].map((p, i) => (
                <div key={i} style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--pri)", marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "mahr" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "var(--pri-soft)", border: "1px solid var(--pri)", borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 12, color: "var(--pri-dark)", fontWeight: 700 }}>আদর্শ মোহরে ফাতেমীর বর্তমান প্রাক্কলন:</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--pri)", margin: "4px 0" }}>
                  ৳{MOHRE_FATEMI.toLocaleString("bn-BD")}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  ৫০০ দিরহাম রৌপ্য (প্রায় ১৩১.২৫ তোলা রূপা) যা রাসূলুল্লাহ (সা.) স্বীয় কন্যা ফাতেমা (রা.)-এর বিয়েতে ধার্য করেছিলেন।
                </div>
              </div>

              <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14 }}>
                <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "var(--pri)" }}>জরুরি শরয়ী সতর্কতা:</h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.6, color: "var(--text)" }}>
                  <li>মোহরানা কোনো নামমাত্র ঋণ বা লোকদেখানো অংক নয়; তা স্ত্রীর প্রকৃত মালিকানা এবং নগদ পরিশোধ করা উত্তম।</li>
                  <li>যৌতুক গ্রহণ সম্পূর্ণ হারাম ও কবিরা গুনাহ। কোনো অজুহাতে কনের পরিবারের ওপর আর্থিক বোঝা চাপানো নিষিদ্ধ।</li>
                  <li>স্বামীর সাধ্যের অতিরিক্ত অংক কেবল সামাজিক অহমিকার জন্য নির্ধারণ করা অনুচিত।</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "etiquette" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14 }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "var(--pri)" }}>
                  সর্বাধিক বরকতময় বিবাহের বৈশিষ্ট্য:
                </h4>
                <div style={{ fontSize: 13, fontStyle: "italic", color: "var(--pri-dark)", background: "var(--bg)", padding: 10, borderRadius: 10, marginBottom: 10 }}>
                  "যে বিয়েতে খরচের বাহুল্য ও অপচয় সবচেয়ে কম, সে বিয়েই আল্লাহর কাছে সবচেয়ে বেশি বরকতময়।" — (বায়হাকী)
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.6, color: "var(--text)" }}>
                  <li>মসজিদে বিয়ে সম্পাদন করা সুন্নাত ও মুস্তাহাব।</li>
                  <li>বিয়ে সম্পন্ন হওয়ার পর সাধ্যানুযায়ী ওয়ালিমা (ভোজ) আয়োজন করা সুন্নাত।</li>
                  <li>গান-বাজনা, আতশবাজি, অপচয় ও বেগানা নারী-পুরুষের অবাধ মেলামেশা থেকে বিবাহ মজলিস সম্পূর্ণ পবিত্র রাখা আবশ্যক।</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
