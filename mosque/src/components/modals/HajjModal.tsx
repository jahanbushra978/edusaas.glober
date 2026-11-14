"use client";
import { useState } from "react";

const UMRAH_STEPS = [
  {
    step: "১. ইহরাম ও নিয়ত",
    desc: "মিকাত অতিক্রমের পূর্বে গোসল করে সেলাইবিহীন দুটি সাদা কাপড় পরিধান করা (মহিলাদের ক্ষেত্রে সাধারণ শালীন পোশাক) এবং নিয়ত করে উচ্চস্বরে তালবিয়া পাঠ করা।",
    arabic: "لَبَّيْكَ اللَّهُمَّ عُمْرَةً",
    bangla: "হে আল্লাহ! উমরাহর উদ্দেশ্যে আমি আপনার দরবারে উপস্থিত।"
  },
  {
    step: "২. কা'বা শরীফ তাওয়াফ (৭ চক্কর)",
    desc: "হাজরে আসওয়াদ বরাবর দাঁড়িয়ে 'বিসমিল্লাহি আল্লাহু আকবার' বলে তাওয়াফ শুরু করা এবং কা'বা শরীফকে বাঁয়ে রেখে ৭ বার প্রদক্ষিণ করা। প্রথম ৩ চক্করে রমল (বীরদর্পে দ্রুত হাঁটা) সুন্নাত।",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    bangla: "হে আমাদের রব! আমাদের দুনিয়াতে কল্যাণ দিন এবং আখিরাতেও কল্যাণ দিন এবং আগুনের শাস্তি থেকে রক্ষা করুন।"
  },
  {
    step: "৩. সাফা ও মারওয়া সায়ী (৭ চক্কর)",
    desc: "সাফা পাহাড় থেকে শুরু করে মারওয়া পাহাড়ে গিয়ে শেষ করা (মোট ৭ চক্কর)। সবুজ বাতির মধ্যবর্তী স্থানে পুরুষদের দ্রুত গতিতে চলা সুন্নাত।",
    arabic: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ",
    bangla: "নিশ্চয়ই সাফা ও মারওয়া আল্লাহর নিদর্শনসমূহের অন্তর্ভুক্ত।"
  },
  {
    step: "৪. হলক বা কসর (চুল কাটা)",
    desc: "পুরুষদের ক্ষেত্রে পুরো মাথা মুণ্ডন করা (হলক) সর্বোত্তম অথবা সমস্ত চুল সমানভাবে ছোট করা (কসর)। নারীরা আঙুলের এক কর পরিমাণ চুলের অগ্রভাগ কাটবেন। এর মাধ্যমে উমরাহ সমাপ্ত হয়।",
    arabic: "اللَّهُمَّ اغْفِرْ لِلْمُحَلِّقِينَ وَالْمُقَصِّرِينَ",
    bangla: "হে আল্লাহ! মাথা মুণ্ডনকারী ও চুল খাটোকারীদের ক্ষমা করে দিন।"
  }
];

const HAJJ_DAYS = [
  { day: "৮ই যিলহজ্জ (ইয়াওমুত তারবিয়াহ)", loc: "মিনা প্রান্তর", desc: "ইহরাম বেঁধে মিনায় গমন। যোহর, আসর, মাগরিব, এশা ও পরের দিনের ফজর মিনায় আদায় এবং রাত্রিযাপন সুন্নাত।" },
  { day: "৯ই যিলহজ্জ (ইয়াওমু আরাফাহ - হজের মূল দিন)", loc: "আরাফাতের ময়দান ও মুযদালিফা", desc: "দুপুরে আরাফাতের ময়দানে অবস্থান (হজের প্রধান ফরজ)। সূর্যাস্তের পর মাগরিব না পড়ে মুযদালিফায় গমন এবং সেখানে মাগরিব-এশা একসাথে আদায় ও রাত্রিযাপন এবং কঙ্কর সংগ্রহ।" },
  { day: "১০ই যিলহজ্জ (ইয়াওমুন নাহর - ঈদের দিন)", loc: "মিনা ও মক্কা মুকাররমা", desc: "বড় জামারায় ৭টি কঙ্কর নিক্ষেপ, দমে শোকর (কুরবানী) দেওয়া, মাথা মুণ্ডন করা (ইহরাম মুক্ত হওয়া), এবং কাবা শরীফে গিয়ে তাওয়াফে জিয়ারত ও সায়ী আদায়।" },
  { day: "১১ ও ১২ই যিলহজ্জ (আইয়ামে তাশরীক)", loc: "মিনা জামারাত", desc: "প্রতিদিন দুপুরের পর ছোট, মধ্যম ও বড় তিনটি জামারায় ৭টি করে মোট ২১টি কঙ্কর নিক্ষেপ করা এবং তাওয়াফে বিদা (বিদায়ী তাওয়াফ) সম্পাদন।" }
];

export function HajjModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"umrah" | "hajj" | "talbiyah">("umrah");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🕋</span>
            <span>সহজ হজ্জ ও উমরাহ পূর্ণাঙ্গ নির্দেশিকা</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {/* Top navigation tabs */}
          <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--bd)", paddingBottom: 10, marginBottom: 16 }}>
            <button
              onClick={() => setActiveTab("umrah")}
              style={{
                border: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: activeTab === "umrah" ? "var(--pri)" : "var(--bg)", color: activeTab === "umrah" ? "#fff" : "var(--text)"
              }}
            >
              🕋 উমরাহর ৪ ধাপ
            </button>
            <button
              onClick={() => setActiveTab("hajj")}
              style={{
                border: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: activeTab === "hajj" ? "var(--pri)" : "var(--bg)", color: activeTab === "hajj" ? "#fff" : "var(--text)"
              }}
            >
              📅 হজ্জের ৫ দিনের কর্মসূচি
            </button>
            <button
              onClick={() => setActiveTab("talbiyah")}
              style={{
                border: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: activeTab === "talbiyah" ? "var(--pri)" : "var(--bg)", color: activeTab === "talbiyah" ? "#fff" : "var(--text)"
              }}
            >
              📜 তালবিয়া ও দো'আ
            </button>
          </div>

          {activeTab === "umrah" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {UMRAH_STEPS.map((s, idx) => (
                <div key={idx} style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14, boxShadow: "var(--sh)" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--pri)", marginBottom: 4 }}>
                    {s.step}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6, marginBottom: 8 }}>
                    {s.desc}
                  </div>
                  <div style={{ background: "var(--bg)", padding: 10, borderRadius: 8, fontSize: 16, fontFamily: "Amiri, serif", textAlign: "right", color: "var(--pri-dark)", lineHeight: 1.8, marginBottom: 4 }}>
                    {s.arabic}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic" }}>
                    <b>অর্থ:</b> {s.bangla}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "hajj" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {HAJJ_DAYS.map((h, i) => (
                <div key={i} style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14, boxShadow: "var(--sh)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "var(--pri)" }}>{h.day}</span>
                    <span style={{ fontSize: 11, background: "var(--pri-soft)", color: "var(--pri-dark)", padding: "3px 8px", borderRadius: 999, fontWeight: 700 }}>
                      📍 {h.loc}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6 }}>
                    {h.desc}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "talbiyah" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 16, padding: 18, textAlign: "center" }}>
                <h4 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "var(--pri)" }}>
                  হজ ও উমরাহর প্রধান শ্লোগান (তালবিয়া)
                </h4>
                <div style={{ background: "var(--bg)", padding: 16, borderRadius: 12, fontSize: 20, fontFamily: "Amiri, serif", color: "var(--pri-dark)", lineHeight: 2, marginBottom: 12 }}>
                  لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                  <b>উচ্চারণ:</b> লাব্বাইকা আল্লাহুম্মা লাব্বাইক, লাব্বাইকা লা শারীকা লাকা লাব্বাইক, ইন্নাল হামদা ওয়ান নিমাতা লাকা ওয়াল মুলক, লা শারীকা লাক।
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                  <b>অর্থ:</b> আমি হাজির, হে আল্লাহ আমি আপনার দরবারে হাজির! আমি হাজির, আপনার কোনো অংশীদার নেই, আমি হাজির! নিশ্চয়ই সমস্ত প্রশংসা, যাবতীয় নিয়ামত ও রাজত্ব একমাত্র আপনারই, আপনার কোনো অংশীদার নেই।
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
