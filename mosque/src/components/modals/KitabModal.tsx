"use client";
import { useState } from "react";

interface KitabItem {
  id: string;
  name: string;
  author: string;
  category: string;
  chaptersCount: number;
  description: string;
  featuredTopic: {
    title: string;
    arabic: string;
    bangla: string;
    explanation: string;
  };
}

const KITAB_LIST: KitabItem[] = [
  {
    id: "bukhari",
    name: "সহীহুল বুখারী",
    author: "ইমাম মুহাম্মদ ইবনে ইসমাইল আল-বুখারী (রহ.)",
    category: "হাদীস গ্রন্থ",
    chaptersCount: 97,
    description: "ইসলামের সবচেয়ে বিশুদ্ধ হাদীস গ্রন্থ। এতে রয়েছে ঈমান, সালাত, ইলম, লেনদেনসহ জীবনের সকল দিকের সহীহ দিকনির্দেশনা।",
    featuredTopic: {
      title: "কাজের ফলাফল নিয়তের উপর নির্ভরশীল (হাদীস ১)",
      arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
      bangla: "নিশ্চয়ই সমস্ত কাজের ফলাফল নিয়তের উপর নির্ভরশীল। আর প্রত্যেক ব্যক্তি যা নিয়ত করেছে কেবল তাই পাবে।",
      explanation: "যেকোনো ইবাদত কবুল হওয়ার পূর্বশর্ত হলো একমাত্র আল্লাহর সন্তুষ্টির উদ্দেশ্যে নিয়ত খালেস রাখা। লৌকিকতা বা মানুষের প্রশংসা লাভের ইচ্ছা থাকলে তা বরবাদ হয়ে যায়।"
    }
  },
  {
    id: "muslim",
    name: "সহীহ মুসলিম",
    author: "ইমাম মুসলিম ইবনুল হাজ্জাজ আন-নিশাপুরী (রহ.)",
    category: "হাদীস গ্রন্থ",
    chaptersCount: 56,
    description: "সিহাহ সিত্তার অন্যতম শ্রেষ্ঠ গ্রন্থ। বিষয়ভিত্তিক সংকলন ও সনদ বিন্যাসের দিক থেকে অতুলনীয়।",
    featuredTopic: {
      title: "দ্বীন হলো কল্যাণকামিতা (হাদীস ৫৫)",
      arabic: "الدِّينُ النَّصِيحَةُ : لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ",
      bangla: "দ্বীন হলো আন্তরিক কল্যাণকামিতা: আল্লাহর জন্য, তাঁর কিতাবের জন্য, তাঁর রাসূলের জন্য এবং মুসলিমদের শাসক ও সাধারণ জনগণের জন্য।",
      explanation: "ইসলাম শুধু আনুষ্ঠানিক ইবাদত নয়, বরং পরস্পরের প্রতি আন্তরিক নিষ্ঠা ও কল্যাণের অনুভূতিই হলো দ্বীনের মূল ভিত্তি।"
    }
  },
  {
    id: "riyad",
    name: "রিয়াযুছ স্বা-লিহীন",
    author: "ইমাম মুহিউদ্দীন ইয়াহইয়া আন-নববী (রহ.)",
    category: "আখলাক ও আত্মশুদ্ধি",
    chaptersCount: 372,
    description: "প্রতিদিনের জীবন গড়ার অমূল্য গ্রন্থ। তাওবা, ধৈর্য, শোকর, সততা ও সুন্দর আচরণের হাদীসমালা।",
    featuredTopic: {
      title: "তাওবার দরজা সর্বদা উন্মুক্ত (অধ্যায় ২)",
      arabic: "إِنَّ اللَّهَ يَبْسُطُ يَدَهُ بِاللَّيْلِ لِيَتُوبَ مُسِيءُ النَّهَارِ، وَيَبْسُطُ يَدَهُ بِالنَّهَارِ لِيَتُوبَ مُسِيءُ اللَّيْلِ",
      bangla: "নিশ্চয়ই আল্লাহ তাআলা রাতে তাঁর ক্ষমার হাত প্রসারিত করেন যেন দিনের গুনাহগার তাওবা করে, এবং দিনে হাত প্রসারিত করেন যেন রাতের গুনাহগার তাওবা করে।",
      explanation: "বান্দা যত বড় ভুলই করুক, মৃত্যুর পূর্বে খাঁটি মনে তওবা করলে আল্লাহ তাআলা ক্ষমা করে দেন।"
    }
  },
  {
    id: "ibnkathir",
    name: "তাফসীরে ইবনে কাসীর",
    author: "ইমাম হাফিজ ইমাদুদ্দীন ইবনে কাসীর (রহ.)",
    category: "কুরআন তাফসীর",
    chaptersCount: 114,
    description: "কুরআনের আয়াত দিয়ে কুরআন ও সহীহ হাদীসের আলোকে কুরআনের সর্বজনগ্রাহ্য ব্যাখ্যাগ্রন্থ।",
    featuredTopic: {
      title: "সূরা আল-ইখলাস এর অনন্য মাহাত্ম্য",
      arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ · اللَّهُ الصَّمَدُ",
      bangla: "বলুন, তিনিই আল্লাহ, একক-অদ্বিতীয়। আল্লাহ কারও মুখাপেক্ষী নন, সকলেই তাঁর মুখাপেক্ষী।",
      explanation: "ইমাম ইবনে কাসীর উল্লেখ করেন— এই সূরাটি সমগ্র তাওহীদ ও আল্লাহর জাত-সিফাতের পূর্ণাঙ্গ সারমর্ম ধারণ করে, যা কুরআনের এক-তৃতীয়াংশের সমতুল্য।"
    }
  },
  {
    id: "bulugh",
    name: "বুলূগুল মারাম মিন আদিল্লাতিল আহকাম",
    author: "ইমাম হাফিজ ইবনে হাজার আল-আসকালানী (রহ.)",
    category: "ফিকহী হাদীস",
    chaptersCount: 16,
    description: "দৈনন্দিন শরীয়ত ও ফিকহী মাসআলা-মাসায়েলের দলীলভিত্তিক নির্ভরযোগ্য হাদীস সংকলন।",
    featuredTopic: {
      title: "পবিত্রতা ঈমানের অর্ধেক",
      arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ",
      bangla: "পবিত্রতা অর্জনের অভ্যাস হলো ঈমানের অর্ধেক অঙ্গ।",
      explanation: "শারীরিক ও আত্মিক পবিত্রতা ব্যতীত কোনো ইবাদত পূর্ণতা পায় না। ওযুর প্রতিটি অঙ্গ উত্তমরূপে ধৌত করার মাধ্যমে গুনাহসমূহ ঝরে যায়।"
    }
  }
];

export function KitabModal({ onClose }: { onClose: () => void }) {
  const [selectedId, setSelectedId] = useState<string>("bukhari");
  const [search, setSearch] = useState("");

  const current = KITAB_LIST.find((k) => k.id === selectedId) || KITAB_LIST[0]!;

  const filtered = KITAB_LIST.filter(
    (k) =>
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.category.toLowerCase().includes(search.toLowerCase()) ||
      k.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>📚</span>
            <span>ইসলামিক কিতাব ও তাফসীর লাইব্রেরি</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {/* Search bar */}
          <input
            type="text"
            placeholder="কিতাবের নাম বা লেখক খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ width: "100%", marginBottom: 14 }}
          />

          {/* Book pills */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
            {filtered.map((book) => (
              <button
                key={book.id}
                onClick={() => setSelectedId(book.id)}
                style={{
                  border: 0,
                  padding: "8px 16px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  background: selectedId === book.id ? "var(--pri)" : "var(--bg)",
                  color: selectedId === book.id ? "#fff" : "var(--text)",
                  boxShadow: selectedId === book.id ? "0 4px 12px rgba(5,150,105,0.25)" : "none",
                  transition: "all 0.2s"
                }}
              >
                {book.name}
              </button>
            ))}
          </div>

          {/* Book Details Card */}
          <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 16, padding: 18, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--pri)" }}>{current.name}</h3>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{current.author}</div>
              </div>
              <span style={{ fontSize: 11, background: "var(--pri-soft)", color: "var(--pri-dark)", padding: "4px 10px", borderRadius: 999, fontWeight: 600 }}>
                {current.category}
              </span>
            </div>

            <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, margin: "10px 0 14px" }}>
              {current.description}
            </p>

            <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--muted)", borderTop: "1px dashed var(--bd)", paddingTop: 10 }}>
              <div>📖 মোট অধ্যায়: <b>{current.chaptersCount}টি</b></div>
              <div>✓ নির্ভরযোগ্য সহীহ অনুবাদ</div>
            </div>
          </div>

          {/* Featured Topic / Reading Snippet */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--pri)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              নির্বাচিত পাঠ ও ব্যাখ্যা
            </div>
            <h4 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>
              {current.featuredTopic.title}
            </h4>

            <div style={{
              background: "var(--card)",
              border: "1px solid var(--bd)",
              borderRadius: 12,
              padding: "16px",
              textAlign: "right",
              fontSize: 20,
              fontFamily: "Amiri, serif",
              color: "var(--pri-dark)",
              lineHeight: 1.8,
              marginBottom: 12
            }}>
              {current.featuredTopic.arabic}
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.6, marginBottom: 10 }}>
              <b>বঙ্গানুবাদ:</b> {current.featuredTopic.bangla}
            </div>

            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, background: "var(--card)", padding: 12, borderRadius: 10, borderLeft: "3px solid var(--pri)" }}>
              <b>শিক্ষণীয় ও তাফসীর:</b> {current.featuredTopic.explanation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
