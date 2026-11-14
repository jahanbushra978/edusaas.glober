"use client";
import { useState } from "react";

interface Rakats {
  waqt: string;
  sunnatMuakkadah: number;
  farz: number;
  sunnatGhair: number;
  nafl: number;
  witr: number;
  total: number;
}

const RAKAT_DATA: Rakats[] = [
  { waqt: "ফজর", sunnatMuakkadah: 2, farz: 2, sunnatGhair: 0, nafl: 0, witr: 0, total: 4 },
  { waqt: "যোহর", sunnatMuakkadah: 4, farz: 4, sunnatGhair: 0, nafl: 2, witr: 0, total: 12 },
  { waqt: "আসর", sunnatMuakkadah: 0, farz: 4, sunnatGhair: 4, nafl: 0, witr: 0, total: 8 },
  { waqt: "মাগরিব", sunnatMuakkadah: 2, farz: 3, sunnatGhair: 0, nafl: 2, witr: 0, total: 7 },
  { waqt: "এশা", sunnatMuakkadah: 2, farz: 4, sunnatGhair: 4, nafl: 2, witr: 3, total: 15 },
  { waqt: "জুমু'আ", sunnatMuakkadah: 4, farz: 2, sunnatGhair: 0, nafl: 4, witr: 0, total: 14 }
];

const NAMAZ_STEPS = [
  {
    step: "১. তাকবীরে তাহরীমা ও নিয়ত",
    desc: "কিবলামুখী হয়ে মনে মনে নামাজের নিয়ত করে উভয় হাত কান পর্যন্ত (মহিলাদের ক্ষেত্রে কাঁধ পর্যন্ত) উঠিয়ে 'আল্লাহু আকবার' বলে নাভির নিচে হাত বাঁধা।",
    arabic: "اللَّهُ أَكْبَرُ",
    bangla: "আল্লাহ সর্বশ্রেষ্ঠ।"
  },
  {
    step: "২. সানা পাঠ",
    desc: "হাত বাঁধার পর নিম্নোক্ত দো'আ (সানা) পাঠ করা সুন্নাহ:",
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلاَ إِلَهَ غَيْرُكَ",
    bangla: "হে আল্লাহ! আমি আপনার পবিত্রতা ঘোষণা করছি এবং আপনার প্রশংসা করছি। আপনার নাম বরকতময়, আপনার মাহাত্ম্য সর্বোচ্চ এবং আপনি ব্যতীত কোনো উপাস্য নেই।"
  },
  {
    step: "৩. রুকু ও রুকুর তাসবীহ",
    desc: "সূরা ফাতিহা ও অন্য সূরা মিলিয়ে 'আল্লাহু আকবার' বলে রুকুতে যাওয়া এবং পিঠ সোজা রেখে উভয় হাত দিয়ে হাঁটু শক্ত করে ধরা:",
    arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ (কমপক্ষে ৩ বার)",
    bangla: "আমার মহান প্রতিপালকের পবিত্রতা ঘোষণা করছি।"
  },
  {
    step: "৪. রুকু হতে সোজা হয়ে দাঁড়ানো (কাওমাহ)",
    desc: "রুকু থেকে ওঠার সময় ইমাম বা একাকী নামাজি বলবে:",
    arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ · رَبَّنَا وَلَكَ الْحَمْدُ",
    bangla: "যে আল্লাহর প্রশংসা করে, আল্লাহ তার কথা শোনেন। হে আমাদের রব! সমস্ত প্রশংসা একমাত্র আপনারই।"
  },
  {
    step: "৫. সিজদা ও সিজদার তাসবীহ",
    desc: "তাকবীর বলে দুই হাঁটু, দুই হাত, নাক ও কপাল মাটিতে রেখে অত্যন্ত বিনম্রতার সাথে সিজদা করা:",
    arabic: "سُبْحَانَ رَبِّيَ الأَعْلَى (কমপক্ষে ৩ বার)",
    bangla: "আমার সর্বোচ্চ প্রতিপালকের পবিত্রতা ঘোষণা করছি।"
  },
  {
    step: "৬. তাশাহহুদ (আত্তাহিয়্যাতু)",
    desc: "দ্বিতীয় ও শেষ রাকাতে বসা অবস্থায় পাঠ করা:",
    arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلاَمُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلاَمُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    bangla: "সকল মৌখিক, শারীরিক ও আর্থিক ইবাদত একমাত্র আল্লাহর জন্য। হে নবী! আপনার উপর আল্লাহর শান্তি, রহমত ও বরকত বর্ষিত হোক। আমাদের উপর এবং আল্লাহর নেক বান্দাদের উপর শান্তি বর্ষিত হোক। আমি সাক্ষ্য দিচ্ছি যে, আল্লাহ ছাড়া কোনো উপাস্য নেই এবং মুহাম্মদ (সা.) তাঁর বান্দা ও রাসূল।"
  },
  {
    step: "৭. দুরুদ শরীফ (ইবরাহীমী)",
    desc: "শেষ রাকাতে তাশাহহুদের পর পড়া:",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ...",
    bangla: "হে আল্লাহ! মুহাম্মদ (সা.) ও তাঁর পরিবারের উপর রহমত বর্ষণ করুন, যেমন আপনি ইবরাহীম (আ.) ও তাঁর পরিবারের উপর রহমত বর্ষণ করেছিলেন..."
  },
  {
    step: "৮. সালাম ফিরিয়ে নামাজ সমাপ্ত",
    desc: "ডান ও বাঁ কাঁধে দৃষ্টি ফিরিয়ে উভয় দিকে সালাম দেওয়া:",
    arabic: "السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
    bangla: "আপনাদের উপর আল্লাহর শান্তি ও রহমত বর্ষিত হোক।"
  }
];

export function JainamazModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"steps" | "rakats" | "rules">("steps");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🕌</span>
            <span>জায়নামাজ — পূর্ণাঙ্গ সচিত্র নামাজ শিক্ষা</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {/* Top navigation tabs */}
          <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--bd)", paddingBottom: 10, marginBottom: 16 }}>
            <button
              onClick={() => setActiveTab("steps")}
              style={{
                border: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: activeTab === "steps" ? "var(--pri)" : "var(--bg)", color: activeTab === "steps" ? "#fff" : "var(--text)"
              }}
            >
              📖 নামাজ আদায়ের নিয়ম
            </button>
            <button
              onClick={() => setActiveTab("rakats")}
              style={{
                border: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: activeTab === "rakats" ? "var(--pri)" : "var(--bg)", color: activeTab === "rakats" ? "#fff" : "var(--text)"
              }}
            >
              🔢 ৫ ওয়াক্তের রাকাত
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              style={{
                border: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: activeTab === "rules" ? "var(--pri)" : "var(--bg)", color: activeTab === "rules" ? "#fff" : "var(--text)"
              }}
            >
              ⚠️ জরুরি শর্ত ও সাহু সিজদা
            </button>
          </div>

          {activeTab === "steps" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {NAMAZ_STEPS.map((s, idx) => (
                <div key={idx} style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14, boxShadow: "var(--sh)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--pri)", marginBottom: 4 }}>
                    {s.step}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5, marginBottom: 8 }}>
                    {s.desc}
                  </div>
                  <div style={{ background: "var(--bg)", padding: 10, borderRadius: 8, fontSize: 16, fontFamily: "Amiri, serif", textAlign: "right", color: "var(--pri-dark)", lineHeight: 1.8, marginBottom: 6 }}>
                    {s.arabic}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>
                    <b>অর্থ:</b> {s.bangla}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "rakats" && (
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                ৫ ওয়াক্তের ফরজ, সুন্নত ও ওয়াজিব নামাজের রাকাতের পূর্ণাঙ্গ চার্ট:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {RAKAT_DATA.map((r, i) => (
                  <div key={i} style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--pri)" }}>{r.waqt}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        {r.sunnatMuakkadah > 0 && `সুন্নত ${r.sunnatMuakkadah} + `}
                        <b>ফরজ {r.farz}</b>
                        {r.sunnatGhair > 0 && ` + সুন্নত ${r.sunnatGhair}`}
                        {r.witr > 0 && ` + বিতর ${r.witr}`}
                        {r.nafl > 0 && ` + নফল ${r.nafl}`}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "var(--pri-dark)" }}>{r.total}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 2 }}>রাকাত</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "rules" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14 }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "var(--pri)" }}>
                  নামাজের ১৩টি ফরজ (শর্ত ও রুকন)
                </h4>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: "var(--text)" }}>
                  <b>নামাজের বাহিরে ৭ ফরজ (আহকাম):</b> শরীর পাক, কাপড় পাক, নামাজের জায়গা পাক, সতর ঢাকা, কিবলামুখী হওয়া, ওয়াক্তমত নামাজ পড়া, নিয়ত করা।<br />
                  <b>নামাজের ভেতরে ৬ ফরজ (আরকান):</b> তাকবীরে তাহরীমা, কিয়াম (দাঁড়ানো), কিরাত পড়া, রুকু করা, দুই সিজদা করা, শেষ বৈঠক।
                </div>
              </div>

              <div style={{ background: "var(--chip)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14 }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "var(--warn)" }}>
                  সাহু সিজদার নিয়ম (ওয়াজিব ছুটে গেলে)
                </h4>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: "var(--text)" }}>
                  নামাজের কোনো ওয়াজিব ভুলবশত ছুটে গেলে বা অতিরিক্ত কিছু হয়ে গেলে শেষ বৈঠকে শুধু তাশাহহুদ পড়ে ডান দিকে এক সালাম ফিরিয়ে আল্লাহু আকবার বলে দুটি অতিরিক্ত সিজদা করতে হয়। এরপর পুনরায় তাশাহহুদ, দুরুদ ও দো'আয়ে মাসূরা পড়ে উভয় দিকে সালাম ফিরিয়ে নামাজ শেষ করতে হয়।
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
