"use client";
import { useState } from "react";

interface DuaItem {
  id: number;
  category: string;
  title: string;
  arabic: string;
  pronunciation: string;
  meaning: string;
  reference: string;
  benefit: string;
}

const DUAS_DATA: DuaItem[] = [
  {
    id: 1,
    category: "সকাল-সন্ধ্যা",
    title: "সাইয়্যিদুল ইস্তিগফার (শ্রেষ্ঠ ক্ষমা প্রার্থনা)",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ",
    pronunciation: "আল্লাহুম্মা আনতা রব্বী, লা ইলাহা ইল্লা আনতা, খলাক্বতানী ওয়া আনা আবদুকা, ওয়া আনা আলা আহদিকা ওয়া ওয়া'দিকা মাস্তাত্বা'তু, আ'ঊযু বিকা মিন শাররি মা ছনা'তু, আবূউ লাকা বিনি'মাতিকা আলাইয়্যা, ওয়া আবূউ বিযানবী, ফাগফির লী, ফাইন্নাহূ লা ইয়্যগফিরুয যুনূবা ইল্লা আনতা।",
    meaning: "হে আল্লাহ! আপনি আমার পালনকর্তা। আপনি ব্যতীত কোনো সত্য উপাস্য নেই। আপনি আমাকে সৃষ্টি করেছেন এবং আমি আপনার বান্দা। আমি আমার সাধ্যানুযায়ী আপনার প্রতিশ্রুতিতে অটল আছি। আমি আমার কৃতকর্মের অনিষ্ট থেকে আপনার আশ্রয় চাই। আমার প্রতি আপনার নেয়ামত স্বীকার করছি এবং আমার গুনাহও স্বীকার করছি। অতএব আমাকে ক্ষমা করুন, কারণ আপনি ছাড়া গুনাহ ক্ষমা করার কেউ নেই।",
    reference: "সহীহ বুখারী: ৬৩০৬",
    benefit: "যে ব্যক্তি সন্ধ্যায় বিশ্বাসসহ এটি পড়বে এবং ঐ রাতে মারা যাবে, সে জান্নাতবাসী হবে। আর যে সকালে পড়বে এবং ঐ দিনে মারা যাবে, সেও জান্নাতবাসী হবে।"
  },
  {
    id: 2,
    category: "ঘুম ও জাগরণ",
    title: "ঘুম থেকে জাগ্রত হওয়ার দো'আ",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    pronunciation: "আলহামদু লিল্লাহিল্লাযী আহইয়ানা বা'দা মা আমাতানা ওয়া ইলাইহিন নুশূর।",
    meaning: "সমস্ত প্রশংসা আল্লাহর জন্য, যিনি আমাদেরকে মৃত্যুর পর পুনরায় জীবিত করলেন এবং তাঁর দিকেই সবার পুনরুত্থান ঘটবে।",
    reference: "সহীহ বুখারী: ৬৩১২",
    benefit: "জীবনের নতুন দিন আল্লাহর শুকরিয়া দিয়ে শুরু করার সুন্নাত।"
  },
  {
    id: 3,
    category: "মসজিদ ও ঘর",
    title: "মসজিদে প্রবেশ করার দো'আ",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    pronunciation: "আল্লাহুম্মাফ তাহলী আবওয়াবা রহমাতিক।",
    meaning: "হে আল্লাহ! আমার জন্য আপনার রহমতের সকল দরজা খুলে দিন।",
    reference: "সহীহ মুসলিম: ৭১৩",
    benefit: "ডান পা দিয়ে মসজিদে প্রবেশের সময় দুরুদসহ এই দো'আ পাঠে রহমত বর্ষিত হয়।"
  },
  {
    id: 4,
    category: "মসজিদ ও ঘর",
    title: "ঘর থেকে বের হওয়ার দো'আ",
    arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ",
    pronunciation: "বিসমিল্লাহি তাওয়াক্কালতু আলাল্লাহ, লা হাওলা ওয়া লা কুওয়াতা ইল্লা বিল্লাহ।",
    meaning: "আল্লাহর নামে, আল্লাহর উপরই ভরসা করলাম। আল্লাহর সাহায্য ব্যতীত কোনো পাপ থেকে বাঁচার এবং সৎকাজ করার শক্তি নেই।",
    reference: "আবু দাউদ: ৫০৯৫",
    benefit: "শয়তান দূরে সরে যায় এবং ফেরেশতাগণ বলেন: তুমি সঠিক পথপ্রাপ্ত হলে এবং নিরাপদ রইলে।"
  },
  {
    id: 5,
    category: "বিপদ ও রোগমুক্তি",
    title: "দুশ্চিন্তা ও ঋণ মুক্তির দো'আ",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
    pronunciation: "আল্লাহুম্মা ইন্নী আ'ঊযু বিকা মিনাল হাম্মি ওয়াল হাযানি, ওয়াল আজযি ওয়াল কাসালি, ওয়াল বুখলি ওয়াল জুবনি, ওয়া দ্বলা'ইদ দাইনি ওয়া গলাবাতির রিজাল।",
    meaning: "হে আল্লাহ! আমি আপনার আশ্রয় চাই দুশ্চিন্তা ও দুঃখ-বেদনা হতে, অক্ষমতা ও অলসতা হতে, কৃপণতা ও কাপুরুষতা হতে এবং ঋণের বোঝা ও মানুষের পরাভব হতে।",
    reference: "সহীহ বুখারী: ২৮৯৩",
    benefit: "নবীজী (সা.) সকাল-সন্ধ্যায় দুশ্চিন্তা ও অভাব দূরীকরণে এই দো'আটি সর্বদা পড়তেন।"
  },
  {
    id: 6,
    category: "পিতা-মাতা",
    title: "পিতা-মাতার জন্য দো'আ",
    arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    pronunciation: "রব্বির হামহুমা কামা রব্বাইয়ানী সগীরা।",
    meaning: "হে আমার প্রতিপালক! তাঁদের (পিতা-মাতার) উভয়ের প্রতি রহম করুন, যেমন তাঁরা শৈশবে আমাকে স্নেহ-মমতায় লালন-পালন করেছিলেন।",
    reference: "সূরা আল-ইসরা: ২৪",
    benefit: "কুরআনে বর্ণিত পিতা-মাতার মাগফিরাতের সর্বোত্তম দো'আ।"
  }
];

export function DuaModal({ onClose }: { onClose: () => void }) {
  const [selectedCat, setSelectedCat] = useState<string>("সকল");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const categories = ["সকল", "সকাল-সন্ধ্যা", "ঘুম ও জাগরণ", "মসজিদ ও ঘর", "বিপদ ও রোগমুক্তি", "পিতা-মাতা"];

  const filtered = selectedCat === "সকল"
    ? DUAS_DATA
    : DUAS_DATA.filter((d) => d.category === selectedCat);

  const copyDua = (d: DuaItem) => {
    const text = `${d.title}\n\n${d.arabic}\n\nউচ্চারণ: ${d.pronunciation}\n\nঅর্থ: ${d.meaning}\n\nসূত্র: ${d.reference}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(d.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🤲</span>
            <span>হিসনুল মুসলিম — নিত্যদিনের মাসনুন দু'আ</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {/* Categories */}
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

          {/* Duas List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((d) => (
              <div key={d.id} style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 16, padding: 16, boxShadow: "var(--sh)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--pri)" }}>{d.title}</h4>
                  <button
                    onClick={() => copyDua(d)}
                    style={{
                      border: "1px solid var(--bd)",
                      background: "var(--bg)",
                      borderRadius: 8,
                      padding: "3px 8px",
                      fontSize: 11,
                      cursor: "pointer",
                      color: copiedId === d.id ? "var(--ok)" : "var(--muted)",
                      fontWeight: 600
                    }}
                  >
                    {copiedId === d.id ? "✓ কপি হয়েছে" : "📋 কপি"}
                  </button>
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
                  {d.arabic}
                </div>

                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  <b>উচ্চারণ:</b> {d.pronunciation}
                </div>

                <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, marginBottom: 8 }}>
                  <b>অর্থ:</b> {d.meaning}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed var(--bd)", paddingTop: 8, fontSize: 11, color: "var(--muted)" }}>
                  <span>📖 {d.reference}</span>
                  <span style={{ color: "var(--pri-dark)", fontWeight: 600 }}>💡 {d.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
