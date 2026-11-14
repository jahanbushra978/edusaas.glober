"use client";
import { useState, useRef, useEffect } from "react";
import { PARAS_DATA, SURAHS_DATA } from "@/lib/quranData";

const QARIS = [
  { id: "afs", name: "মিশারী রাশিদ আল-আফাসী (Mishary Alafasy)", server: "https://server8.mp3quran.net/afs" },
  { id: "basit", name: "আব্দুল বাসিত আব্দুস সামাদ (Abdul Basit)", server: "https://server7.mp3quran.net/basit" },
  { id: "sds", name: "আব্দুর রহমান আস-সুদাইস (As-Sudais)", server: "https://server11.mp3quran.net/sds" },
  { id: "gmd", name: "সাদ আল-গামদী (Saad Al-Ghamdi)", server: "https://server7.mp3quran.net/s_gmd" },
  { id: "husr", name: "মাহমুদ খলিল আল-হুসারী (Al-Husary)", server: "https://server13.mp3quran.net/husr" },
];

export function QuranReaderModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"page" | "juz" | "surah">("page");
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [pageNo, setPageNo] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [imgLoading, setImgLoading] = useState(true);
  const [selectedQari, setSelectedQari] = useState(QARIS[0]!);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [ayahs, setAyahs] = useState<string[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSurah = SURAHS_DATA.find((s) => s.no === selectedSurah) || SURAHS_DATA[0]!;

  // Fetch ayahs dynamically when in Surah view
  useEffect(() => {
    if (mode === "surah") {
      setLoadingAyahs(true);
      fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/quran-uthmani`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.data?.ayahs) {
            setAyahs(data.data.ayahs.map((a: { text: string }) => a.text));
          }
        })
        .catch(() => {
          setAyahs(["بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ"]);
        })
        .finally(() => setLoadingAyahs(false));
    }
  }, [selectedSurah, mode]);

  const getAudioUrl = (surahNo: number) => {
    const sStr = String(surahNo).padStart(3, "0");
    return `${selectedQari.server}/${sStr}.mp3`;
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(getAudioUrl(selectedSurah));
      audioRef.current = audio;
      audio.play().catch((e) => console.log(e));
      setIsPlaying(true);
      audio.ontimeupdate = () => {
        if (audio.duration) setAudioProgress((audio.currentTime / audio.duration) * 100);
      };
      audio.onended = () => {
        setIsPlaying(false);
        setAudioProgress(0);
      };
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const handlePageJump = () => {
    const p = parseInt(pageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= 604) {
      setPageNo(p);
      setImgLoading(true);
    } else {
      setPageInput(String(pageNo));
    }
  };

  const changePage = (newP: number) => {
    const valid = Math.max(1, Math.min(604, newP));
    setPageNo(valid);
    setPageInput(String(valid));
    setImgLoading(true);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650 }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span>📖</span>
            <span>আল-কুরআনুল কারীম (হাফেজি ও সূরা ভিউ)</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* View Switcher: Hafezi Page / Para / Surah */}
        <div style={{ display: "flex", gap: 6, padding: "8px 16px", background: "var(--bg)", borderBottom: "1px solid var(--bd)" }}>
          <button
            onClick={() => setMode("page")}
            style={{
              padding: "6px 14px", borderRadius: 999, border: 0, fontSize: 12, fontWeight: 700, cursor: "pointer",
              background: mode === "page" ? "var(--pri)" : "var(--card)",
              color: mode === "page" ? "#fff" : "var(--muted)",
            }}
          >
            হাফেজি পৃষ্ঠা (১-৬০৪)
          </button>
          <button
            onClick={() => setMode("juz")}
            style={{
              padding: "6px 14px", borderRadius: 999, border: 0, fontSize: 12, fontWeight: 700, cursor: "pointer",
              background: mode === "juz" ? "var(--pri)" : "var(--card)",
              color: mode === "juz" ? "#fff" : "var(--muted)",
            }}
          >
            পারা (১-৩০)
          </button>
          <button
            onClick={() => setMode("surah")}
            style={{
              padding: "6px 14px", borderRadius: 999, border: 0, fontSize: 12, fontWeight: 700, cursor: "pointer",
              background: mode === "surah" ? "var(--pri)" : "var(--card)",
              color: mode === "surah" ? "#fff" : "var(--muted)",
            }}
          >
            সূরা ভিত্তিক
          </button>
        </div>

        {/* Qari Selector & Audio Player Bar */}
        <div style={{ padding: "8px 16px", background: "var(--card)", borderBottom: "1px solid var(--bd)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <select
              value={selectedQari.id}
              onChange={(e) => {
                const q = QARIS.find((x) => x.id === e.target.value) || QARIS[0]!;
                setSelectedQari(q);
                if (isPlaying && audioRef.current) audioRef.current.pause();
                setIsPlaying(false);
              }}
              style={{ flex: 1, padding: "5px 8px", borderRadius: 8, border: "1px solid var(--bd)", fontSize: 12 }}
            >
              {QARIS.map((q) => (
                <option key={q.id} value={q.id}>{q.name}</option>
              ))}
            </select>
            <button
              onClick={togglePlay}
              style={{
                background: isPlaying ? "var(--bad)" : "var(--pri)",
                color: "#fff", border: 0, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {isPlaying ? "⏸️ থামুন" : `▶️ তিলাওয়াত শুনুন`}
            </button>
          </div>
          {isPlaying && (
            <div style={{ background: "var(--bd)", borderRadius: 99, height: 4, overflow: "hidden", marginTop: 4 }}>
              <div style={{ background: "var(--pri)", width: `${audioProgress}%`, height: "100%", transition: "width 0.3s" }} />
            </div>
          )}
        </div>

        {/* Modal Body depending on Mode */}
        <div className="modal-body" style={{ maxHeight: "65vh", overflowY: "auto", padding: "12px 16px" }}>
          {/* Mode 1: Real Hafezi 15-line Quran Page View */}
          {mode === "page" && (
            <div>
              {/* Navigation & Jump Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                <button
                  onClick={() => changePage(pageNo - 1)}
                  disabled={pageNo <= 1}
                  className="btn alt"
                  style={{ padding: "6px 12px", fontSize: 13, borderRadius: 8 }}
                >
                  ◀ পূর্ববর্তী
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>হাফেজি পৃষ্ঠা:</span>
                  <input
                    type="number"
                    min={1}
                    max={604}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePageJump()}
                    style={{ width: 60, textAlign: "center", padding: "4px 6px", borderRadius: 8, border: "1px solid var(--bd)", fontWeight: 700 }}
                  />
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>/ ৬০৪</span>
                  <button onClick={handlePageJump} className="btn" style={{ padding: "4px 10px", fontSize: 12, borderRadius: 8 }}>
                    যান
                  </button>
                </div>

                <button
                  onClick={() => changePage(pageNo + 1)}
                  disabled={pageNo >= 604}
                  className="btn alt"
                  style={{ padding: "6px 12px", fontSize: 13, borderRadius: 8 }}
                >
                  পরবর্তী ▶
                </button>
              </div>

              {/* Hafezi 15 Lines Scanned Mushaf Image Container */}
              <div
                style={{
                  border: "2px solid #059669",
                  borderRadius: 14,
                  background: "#fffdf8",
                  padding: "8px",
                  textAlign: "center",
                  minHeight: 380,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                }}
              >
                {imgLoading && (
                  <div style={{ position: "absolute", top: "45%", color: "var(--pri)", fontSize: 13, fontWeight: 600 }}>
                    ⏳ পৃষ্ঠা {pageNo} লোড হচ্ছে...
                  </div>
                )}
                <img
                  key={pageNo}
                  src={`https://cdn.jsdelivr.net/gh/naeemdev/quran-images@master/${pageNo}.png`}
                  alt={`হাফেজি কুরআন পৃষ্ঠা ${pageNo}`}
                  onLoad={() => setImgLoading(false)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes("raw.githubusercontent.com")) {
                      target.src = `https://raw.githubusercontent.com/naeemdev/quran-images/master/${pageNo}.png`;
                    } else {
                      setImgLoading(false);
                    }
                  }}
                  style={{
                    maxHeight: "56vh",
                    maxWidth: "100%",
                    objectFit: "contain",
                    display: imgLoading ? "none" : "block",
                    margin: "0 auto",
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
          )}

          {/* Mode 2: 30 Paras Index */}
          {mode === "juz" && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>৩০ পারা সরাসরি সূচিপত্র (ক্লিক করে সরাসরি ওই পারায় যান):</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {PARAS_DATA.map((p) => (
                  <button
                    key={p.juz}
                    onClick={() => {
                      changePage(p.startPage);
                      setMode("page");
                    }}
                    style={{
                      border: "1px solid var(--bd)", borderRadius: 12, padding: "10px 8px", background: "var(--card)",
                      textAlign: "center", cursor: "pointer", fontWeight: 600, fontSize: 12,
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ color: "var(--pri-dark)", fontWeight: 700 }}>পারা {p.juz}</div>
                    <div style={{ fontSize: 12, color: "var(--text)", margin: "2px 0" }}>{p.name}</div>
                    <small style={{ color: "var(--muted)", fontSize: 10 }}>পৃষ্ঠা {p.startPage}</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode 3: Surah View with Full Text */}
          {mode === "surah" && (
            <div>
              <label className="field" style={{ marginBottom: 12 }}>
                <span>সূরা নির্বাচন করুন:</span>
                <select
                  value={selectedSurah}
                  onChange={(e) => {
                    setSelectedSurah(Number(e.target.value));
                    if (isPlaying && audioRef.current) audioRef.current.pause();
                    setIsPlaying(false);
                  }}
                  className="input-field"
                >
                  {SURAHS_DATA.map((s) => (
                    <option key={s.no} value={s.no}>
                      {s.no}. {s.name} ({s.english} · {s.place} · {s.ayahs} আয়াত)
                    </option>
                  ))}
                </select>
              </label>

              {/* Surah Banner & Button to jump to Hafezi page */}
              <div style={{ background: "var(--pri-light)", border: "1.5px solid var(--pri)", borderRadius: 16, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--pri-dark)" }}>{currentSurah.name} ({currentSurah.english})</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    পারা: {currentSurah.juz} · পৃষ্ঠা: {currentSurah.page} · আয়াত: {currentSurah.ayahs} · {currentSurah.place}
                  </div>
                </div>
                <button
                  onClick={() => {
                    changePage(currentSurah.page);
                    setMode("page");
                  }}
                  style={{ background: "var(--pri)", color: "#fff", border: 0, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  📖 হাফেজি পৃষ্ঠায় দেখুন
                </button>
              </div>

              {/* Surah Arabic Ayahs */}
              {loadingAyahs ? (
                <div style={{ textAlign: "center", padding: 30, color: "var(--muted)" }}>সূরা লোড হচ্ছে...</div>
              ) : (
                <div style={{ lineHeight: 2.3, fontSize: 20, direction: "rtl", textAlign: "right", fontFamily: "Traditional Arabic, Scheherazade, serif", padding: "10px 4px", color: "var(--text)" }}>
                  {ayahs.map((ayahText, idx) => (
                    <span key={idx}>
                      {ayahText} ﴿{idx + 1}﴾{" "}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
