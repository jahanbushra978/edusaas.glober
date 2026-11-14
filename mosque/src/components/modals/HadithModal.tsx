"use client";
import { useState } from "react";

interface HadithItem {
  id: number;
  category: string;
  source: string;
  hadithNo: string;
  narrator: string;
  arabic: string;
  bangla: string;
  benefit: string;
}

const HADITH_DATA: HadithItem[] = [
  {
    id: 1,
    category: "ঈমান ও তাওহীদ",
    source: "সহীহ বুখারী",
    hadithNo: "১৩",
    narrator: "আনাস (রা.) হতে বর্ণিত",
    arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    bangla: "তোমাদের কেউ ততক্ষণ পর্যন্ত প্রকৃত মুমিন হতে পারবে না, যতক্ষণ না সে তার ভাইয়ের জন্য তা-ই পছন্দ করে যা নিজের জন্য পছন্দ করে।",
    benefit: "পরোপকার, ভ্রাতৃত্ববোধ ও স্বার্থপরতা পরিহার করা ঈমানের পূর্ণতার অপরিহার্য শর্ত।"
  },
  {
    id: 2,
    category: "সালাত",
    source: "সহীহ মুসলিম",
    hadithNo: "২২৩",
    narrator: "আবু মালিক আল-আশআরী (রা.) হতে বর্ণিত",
    arabic: "وَالصَّلاَةُ نُورٌ، وَالصَّدَقَةُ بُرْهَانٌ، وَالصَّبْرُ ضِيَاءٌ",
    bangla: "সালাত হলো জ্যোতি, সদাকাহ হলো প্রমাণ, আর ধৈর্য হলো আলোকবর্তিকা।",
    benefit: "নিয়মিত সালাত মানুষের অন্তর, জীবন ও কবরে নূর বা আলো দান করে।"
  },
  {
    id: 3,
    category: "চরিত্র ও আখলাক",
    source: "জামে আত-তিরমিযী",
    hadithNo: "২০০৩",
    narrator: "আবু দারদা (রা.) হতে বর্ণিত",
    arabic: "مَا مِنْ شَيْءٍ أَثْقَلُ فِي مِيزَانِ الْمُؤْمِنِ يَوْمَ الْقِيَامَةِ مِنْ حُسْنِ الْخُلُقِ",
    bangla: "কিয়ামতের দিন মুমিনের পাল্লায় সুন্দর চরিত্রের চেয়ে বেশি ভারী আর কোনো আমল থাকবে না।",
    benefit: "সুন্দর ব্যবহার ও বিনম্র আচরণ সর্বাধিক নেক আমল হিসেবে পরিগণিত হয়।"
  },
  {
    id: 4,
    category: "দান ও সদাকাহ",
    source: "সহীহ মুসলিম",
    hadithNo: "২৫৮৮",
    narrator: "আবু হুরায়রা (রা.) হতে বর্ণিত",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلاَّ عِزًّا",
    bangla: "সদাকাহর দ্বারা কোনো সম্পদ হ্রাস পায় না, আর ক্ষমার দ্বারা আল্লাহ তাআলা বান্দার মর্যাদা কেবল বৃদ্ধিই করেন।",
    benefit: "আল্লাহর রাস্তায় ব্যয় সম্পদকে পবিত্র ও বরকতময় করে, কখনো কমায় না।"
  },
  {
    id: 5,
    category: "পিতা-মাতা",
    source: "সহীহ বুখারী",
    hadithNo: "৫৯৭১",
    narrator: "আবু হুরায়রা (রা.) হতে বর্ণিত",
    arabic: "جَاءَ رَجُلٌ إِلَى رَسُولِ اللَّهِ فَقَالَ: يَا رَسُولَ اللَّهِ، مَنْ أَحَقُّ النَّاسِ بِحُسْنِ صَحَابَتِي؟ قَالَ: أُمُّكَ، قَالَ: ثُمَّ مَنْ؟ قَالَ: أُمُّكَ، قَالَ: ثُمَّ مَنْ؟ قَالَ: أُمُّكَ، قَالَ: ثُمَّ مَنْ؟ قَالَ: ثُمَّ أَبُوكَ",
    bangla: "এক ব্যক্তি এসে জিজ্ঞাসা করলেন: হে আল্লাহর রাসূল! আমার সর্বোত্তম সেবার সবচেয়ে বড় হকদার কে? তিনি বললেন: তোমার মা। লোকটি বলল: তারপর কে? তিনি বললেন: তোমার মা। লোকটি বলল: তারপর কে? তিনি বললেন: তোমার মা। এরপর বললেন: তোমার বাবা।",
    benefit: "পিতা-মাতার বিশেষ করে মায়ের খেদমত জান্নাত লাভের প্রধান মাধ্যম।"
  },
  {
    id: 6,
    category: "তাওবা ও ক্ষমা",
    source: "ইবনে মাজাহ",
    hadithNo: "৪২৫০",
    narrator: "আবদুল্লাহ ইবনে মাসউদ (রা.) হতে বর্ণিত",
    arabic: "التَّائِبُ مِنَ الذَّنْبِ كَمَنْ لاَ ذَنْبَ لَهُ",
    bangla: "গুনাহ থেকে খাঁটি তাওবাকারী ব্যক্তি সেই ব্যক্তির মতো যার কোনো গুনাহ নেই।",
    benefit: "হতাশ না হয়ে দ্রুত অনুতপ্ত হয়ে ক্ষমা চাইলে আল্লাহ অতীত পাপরাশি মুছে দেন।"
  }
];

export function HadithModal({ onClose }: { onClose: () => void }) {
  const [selectedCat, setSelectedCat] = useState<string>("সকল");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const categories = ["সকল", "ঈমান ও তাওহীদ", "সালাত", "চরিত্র ও আখলাক", "দান ও সদাকাহ", "পিতা-মাতা", "তাওবা ও ক্ষমা"];

  const filtered = selectedCat === "সকল"
    ? HADITH_DATA
    : HADITH_DATA.filter((h) => h.category === selectedCat);

  const copyToClipboard = (item: HadithItem) => {
    const text = `${item.arabic}\n\n${item.bangla}\n\n— ${item.source} (${item.hadithNo})`;
    navigator.clipboard?.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>📜</span>
            <span>দৈনিক নির্বাচিত সহীহ হাদীস সংকলন</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {/* Category Filter */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  border: 0,
                  padding: "6px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  background: selectedCat === cat ? "var(--pri)" : "var(--bg)",
                  color: selectedCat === cat ? "#fff" : "var(--text)",
                  boxShadow: selectedCat === cat ? "0 4px 10px rgba(5,150,105,0.25)" : "none",
                  transition: "all 0.15s"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List of Hadiths */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--bd)",
                  borderRadius: 16,
                  padding: 16,
                  boxShadow: "var(--sh)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, background: "var(--pri-soft)", color: "var(--pri-dark)", padding: "3px 8px", borderRadius: 999, fontWeight: 700 }}>
                    {item.category}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      {item.source} · নং {item.hadithNo}
                    </span>
                    <button
                      onClick={() => copyToClipboard(item)}
                      style={{
                        border: "1px solid var(--bd)",
                        background: "var(--bg)",
                        borderRadius: 8,
                        padding: "3px 8px",
                        fontSize: 11,
                        cursor: "pointer",
                        color: copiedId === item.id ? "var(--ok)" : "var(--muted)",
                        fontWeight: 600
                      }}
                    >
                      {copiedId === item.id ? "✓ কপি হয়েছে" : "📋 কপি"}
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, fontStyle: "italic" }}>
                  {item.narrator}
                </div>

                <div style={{
                  background: "var(--bg)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontSize: 18,
                  fontFamily: "Amiri, serif",
                  textAlign: "right",
                  color: "var(--pri-dark)",
                  lineHeight: 1.8,
                  marginBottom: 10
                }}>
                  {item.arabic}
                </div>

                <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text)", fontWeight: 500, marginBottom: 8 }}>
                  <b>অর্থ:</b> {item.bangla}
                </div>

                <div style={{ fontSize: 12, color: "var(--muted)", background: "var(--chip)", padding: "8px 12px", borderRadius: 8 }}>
                  💡 <b>শিক্ষা:</b> {item.benefit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
