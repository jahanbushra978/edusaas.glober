"use client";
import { useState } from "react";

interface AllahName {
  id: number;
  arabic: string;
  bangla: string;
  meaning: string;
  significance: string;
}

const ALLAH_NAMES: AllahName[] = [
  { id: 1, arabic: "الرَّحْمَنُ", bangla: "আর-রহমান", meaning: "পরম দয়ালু", significance: "যিনি সমগ্র সৃষ্টির ওপর সীমাহীন অনুগ্রহ বর্ষণকারী।" },
  { id: 2, arabic: "الرَّحِيمُ", bangla: "আর-রহীম", meaning: "অতিশয় মেহেরবান", significance: "মুমিনদের জন্য আখিরাতে বিশেষ রহমতকারী।" },
  { id: 3, arabic: "الْمَلِكُ", bangla: "আল-মালিক", meaning: "সার্বভৌম ক্ষমতার অধিকারী", significance: "সমগ্র আসমান ও জমিনের একমাত্র অধিপতি ও প্রকৃত বাদশাহ।" },
  { id: 4, arabic: "الْقُدُّوسُ", bangla: "আল-কুদ্দুস", meaning: "মহাপবিত্র ও নিষ্কলুষ", significance: "সমস্ত দোষ-ত্রুটি ও দুর্বলতা থেকে মুক্ত।" },
  { id: 5, arabic: "السَّلاَمُ", bangla: "আস-সালাম", meaning: "শান্তিদাতা ও নিরাপত্তাদায়ক", significance: "যাঁর পক্ষ হতে সকল শান্তি অবতীর্ণ হয়।" },
  { id: 6, arabic: "الْمُؤْمِنُ", bangla: "আল-মু'মিন", meaning: "ঈমান ও নিরাপত্তা দানকারী", significance: "যিনি বান্দাকে ভয়-ভীতি হতে নিরাপত্তা দান করেন।" },
  { id: 7, arabic: "الْمُهَيْمِنُ", bangla: "আল-মুহাইমিন", meaning: "রক্ষক ও প্রত্যক্ষদর্শী", significance: "যিনি সকল কিছুর সার্বিক তত্ত্বাবধায়ক ও সংরক্ষক।" },
  { id: 8, arabic: "الْعَزِيزُ", bangla: "আল-আযীয", meaning: "পরাক্রমশালী ও অপরাজেয়", significance: "যাঁর ক্ষমতার সামনে সমস্ত শক্তি পদানত।" },
  { id: 9, arabic: "الْجَبَّارُ", bangla: "আল-জাব্বার", meaning: "মহাপ্রতাপশালী ও সংস্কারক", significance: "যাঁর ইচ্ছার বিরুদ্ধে কারও কোনো প্রতিরোধ চলে না।" },
  { id: 10, arabic: "الْمُتَكَبِّرُ", bangla: "আল-মুতাকাব্বির", meaning: "সর্বশ্রেষ্ঠ গৌরবান্বিত", significance: "সমস্ত অহংকার ও মহত্ত্ব একমাত্র যাঁরই শোভা পায়।" },
  { id: 11, arabic: "الْخَالِقُ", bangla: "আল-খালিক", meaning: "একক সৃষ্টিকর্তা", significance: "যিনি শূন্য হতে সমগ্র সৃষ্টি অস্তিত্বে এনেছেন।" },
  { id: 12, arabic: "الْبَارِئُ", bangla: "আল-বারি", meaning: "নিখুঁত কারিগর", significance: "যিনি সৃষ্টির প্রতিটি অংশে সুষম আকার ও ভারসাম্য দান করেছেন।" },
  { id: 13, arabic: "الْمُصَوِّرُ", bangla: "আল-মুসাওয়ির", meaning: "রূপদানকারী ও রূপকার", significance: "যিনি প্রতিটি বস্তুকে অনন্য রূপ ও গঠন দান করেছেন।" },
  { id: 14, arabic: "الْغَفَّارُ", bangla: "আল-গাফফার", meaning: "মহাক্ষমাশীল", significance: "যিনি বারবার গুনাহ সত্ত্বেও বান্দাকে ক্ষমা করে দেন।" },
  { id: 15, arabic: "الْقَهَّارُ", bangla: "আল-কাহ্হার", meaning: "সর্বজয়ী ও কঠোর নিয়ন্ত্রক", significance: "যাঁর অধীনতা স্বীকারে সমগ্র বিশ্ব বাধ্য।" },
  { id: 16, arabic: "الْوَهَّابُ", bangla: "আল-ওয়াহ্হাব", meaning: "বিনা প্রতিদানে দানকারী", significance: "যিনি বিনিময় ছাড়া অফুরন্ত নেয়ামত বিলিয়ে দেন।" },
  { id: 17, arabic: "الرَّزَّاقُ", bangla: "আর-রাযযাক", meaning: "রিজিকদাতা ও জীবিকা প্রদানকারী", significance: "যিনি প্রতিটি ক্ষুদ্রাতিক্ষুদ্র প্রাণীর খাদ্যের ব্যবস্থা করেন।" },
  { id: 18, arabic: "الْفَتَّاحُ", bangla: "আল-ফাত্তাহ", meaning: "বিজয়দাতা ও উন্মোচনকারী", significance: "যিনি রহমত ও বন্ধ ভাগ্যের দুয়ার খুলে দেন।" },
  { id: 19, arabic: "الْعَلِيمُ", bangla: "আল-আলীম", meaning: "সর্বজ্ঞানী ও সর্বজ্ঞ", significance: "অদৃশ্য ও দৃশ্যমান সমস্ত কিছুর পূর্ণ জ্ঞান যাঁর নিকট স্পষ্ট।" },
  { id: 20, arabic: "الْقَابِضُ", bangla: "আল-কাবিদ", meaning: "সংকোচনকারী", significance: "যিনি পরীক্ষার জন্য রিজিক ও রুহ সংকুচিত করেন।" }
];

export function NamesOfAllahModal({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState("");

  const filtered = ALLAH_NAMES.filter(
    (n) =>
      n.bangla.toLowerCase().includes(search.toLowerCase()) ||
      n.meaning.toLowerCase().includes(search.toLowerCase()) ||
      n.arabic.includes(search)
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>✨</span>
            <span>আসমাউল হুসনা — আল্লাহর ৯৯টি পবিত্র নাম</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {/* Search bar */}
          <input
            type="text"
            placeholder="পবিত্র নাম বা অর্থ লিখে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ width: "100%", marginBottom: 14 }}
          />

          <div style={{ background: "var(--pri-soft)", border: "1px solid var(--pri)", borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "var(--pri-dark)", marginBottom: 14 }}>
            📖 <b>হাদীস শরীফ:</b> "নিশ্চয়ই আল্লাহর ৯৯টি নাম রয়েছে; যে ব্যক্তি এগুলো মুখস্থ করবে এবং হৃদয়ঙ্গম করে আমল করবে, সে জান্নাতে প্রবেশ করবে।" — (সহীহ বুখারী)
          </div>

          {/* Grid of Names */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {filtered.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--bd)",
                  borderRadius: 14,
                  padding: 12,
                  boxShadow: "var(--sh)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, background: "var(--bg)", color: "var(--muted)", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {item.id}
                    </span>
                    <span style={{ fontSize: 18, fontFamily: "Amiri, serif", color: "var(--pri-dark)", fontWeight: 700 }}>
                      {item.arabic}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--pri)" }}>
                    {item.bangla}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>
                    অর্থ: {item.meaning}
                  </div>
                </div>

                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, borderTop: "1px dashed var(--bd)", paddingTop: 4 }}>
                  {item.significance}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
