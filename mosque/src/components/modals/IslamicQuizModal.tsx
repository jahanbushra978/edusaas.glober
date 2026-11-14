"use client";
import { useState } from "react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "পবিত্র কুরআনে সর্বমোট কতটি সূরা রয়েছে?",
    options: ["১১২টি", "১১৪টি", "১১৬টি", "১২০টি"],
    correctIdx: 1,
    explanation: "কুরআনুল কারীমে সর্বমোট ১১৪টি সূরা রয়েছে; যার মধ্যে ৮৬টি মাক্কী এবং ২৮টি মাদানী সূরা।"
  },
  {
    id: 2,
    question: "কুরআনের কোন সূরাটিকে 'কুরআনের হৃদয়' (ক্বলবুল কুরআন) বলা হয়?",
    options: ["সূরা আর-রহমান", "সূরা আল-মুলক", "সূরা ইয়াসীন", "সূরা আল-ওয়াকিয়াহ"],
    correctIdx: 2,
    explanation: "রাসূলুল্লাহ (সা.) বলেছেন, 'প্রত্যেক বস্তুরই একটি হৃদয় থাকে, আর কুরআনের হৃদয় হলো সূরা ইয়াসীন' (তিরমিযী)।"
  },
  {
    id: 3,
    question: "সর্বপ্রথম কোন সাহাবী পুরুষদের মধ্যে ইসলাম গ্রহণ করেন?",
    options: ["উমর ইবনুল খাত্তাব (রা.)", "আবু বকর সিদ্দিক (রা.)", "উসমান ইবনে আফফান (রা.)", "আলী ইবনে আবি তালিব (রা.)"],
    correctIdx: 1,
    explanation: "প্রাপ্তবয়স্ক স্বাধীন পুরুষদের মধ্যে প্রথম ইসলাম গ্রহণ করেন হযরত আবু বকর সিদ্দিক (রা.)।"
  },
  {
    id: 4,
    question: "ইসলামের সবচেয়ে দীর্ঘতম আয়াত কোনটি এবং কোন সূরায় অবস্থিত?",
    options: ["আয়াতুল কুরসী (সূরা বাক্বারা)", "আয়াতুদ দাইয়ন / ঋণের আয়াত (সূরা বাক্বারা ২৮২)", "সূরা তওবার শেষ আয়াত", "সূরা আন-নূরের আয়াত ৩৫"],
    correctIdx: 1,
    explanation: "সূরা আল-বাক্বারার ২৮২ নম্বর আয়াত (আয়াতুদ দাইয়ন) কুরআনের সর্ববৃহৎ আয়াত, যা বাণিজ্যিক ঋণ সংক্রান্ত বিধানে অবতীর্ণ।"
  },
  {
    id: 5,
    question: "কোন নবীকে 'খলীলুল্লাহ' (আল্লাহর বন্ধু) উপাধিতে ভূষিত করা হয়েছে?",
    options: ["হযরত মূসা (আ.)", "হযরত ঈসা (আ.)", "হযরত ইবরাহীম (আ.)", "হযরত নূহ (আ.)"],
    correctIdx: 2,
    explanation: "মহান আল্লাহ তাআলা কুরআনে ঘোষণা করেছেন: 'আর আল্লাহ ইবরাহীমকে অন্তরঙ্গ বন্ধুরূপে গ্রহণ করেছেন' (সূরা আন-নিসা: ১২৫)।"
  }
];

export function IslamicQuizModal({ onClose }: { onClose: () => void }) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const q = QUIZ_QUESTIONS[currentIdx]!;

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === q.correctIdx) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx((c) => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>💡</span>
            <span>তালীমে কুইজ — ইসলামিক জ্ঞান পরীক্ষা</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {!quizFinished ? (
            <div>
              {/* Progress and score header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--pri)" }}>
                  প্রশ্ন: {currentIdx + 1} / {QUIZ_QUESTIONS.length}
                </span>
                <span style={{ fontSize: 12, background: "var(--pri-soft)", color: "var(--pri-dark)", padding: "3px 10px", borderRadius: 999, fontWeight: 700 }}>
                  বর্তমান স্কোর: {score}
                </span>
              </div>

              {/* Question Box */}
              <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 16, padding: 18, marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text)", lineHeight: 1.5 }}>
                  {q.question}
                </h3>
              </div>

              {/* 4 Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {q.options.map((opt, i) => {
                  let btnBg = "var(--bg)";
                  let btnBorder = "var(--bd)";
                  let btnColor = "var(--text)";

                  if (isAnswered) {
                    if (i === q.correctIdx) {
                      btnBg = "rgba(16, 185, 129, 0.15)";
                      btnBorder = "var(--ok)";
                      btnColor = "var(--ok)";
                    } else if (selectedOption === i) {
                      btnBg = "rgba(239, 68, 68, 0.15)";
                      btnBorder = "var(--bad)";
                      btnColor = "var(--bad)";
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: 12,
                        border: `1.5px solid ${btnBorder}`,
                        background: btnBg,
                        color: btnColor,
                        fontSize: 14,
                        fontWeight: 600,
                        textAlign: "left",
                        cursor: isAnswered ? "default" : "pointer",
                        transition: "all 0.15s",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <span>{opt}</span>
                      {isAnswered && i === q.correctIdx && <span>✓ সঠিক</span>}
                      {isAnswered && selectedOption === i && i !== q.correctIdx && <span>✕ ভুল</span>}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after answering */}
              {isAnswered && (
                <div style={{ background: "var(--chip)", border: "1px solid var(--bd)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--pri-dark)", marginBottom: 4 }}>
                    💡 ব্যাখ্যা ও তথ্য:
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>
                    {q.explanation}
                  </div>
                </div>
              )}

              {/* Next Button */}
              {isAnswered && (
                <button
                  onClick={handleNext}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 12,
                    background: "var(--pri)",
                    color: "#fff",
                    border: 0,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(5,150,105,0.3)"
                  }}
                >
                  {currentIdx + 1 === QUIZ_QUESTIONS.length ? "ফলাফল দেখুন" : "পরবর্তী প্রশ্ন ➔"}
                </button>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>
                {score >= 4 ? "🏆" : score >= 3 ? "🎉" : "📚"}
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "var(--pri)" }}>
                মাশাআল্লাহ! কুইজ সমাপ্ত!
              </h3>
              <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 20px" }}>
                আপনার অর্জিত মোট নম্বর: <b>{score}</b> / {QUIZ_QUESTIONS.length}
              </p>

              <div style={{ background: "var(--bg)", borderRadius: 14, padding: 16, marginBottom: 20, textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pri)", marginBottom: 4 }}>
                  পরামর্শ ও মন্তব্য:
                </div>
                <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6 }}>
                  {score === 5 ? "অসাধারণ! আপনার ইসলামিক সাধারণ জ্ঞানের দখল অত্যন্ত প্রশংসনীয়।" :
                   score >= 3 ? "খুব ভালো! নিয়মিত কুরআন ও সহীহ হাদীস অধ্যয়নে জ্ঞান আরও সমৃদ্ধ হবে।" :
                   "জ্ঞান অর্জনে সচেষ্ট থাকুন। ইলম অন্বেষণ করা প্রত্যেক মুসলমানের জন্য ফরজ।"}
                </div>
              </div>

              <button
                onClick={handleRestart}
                style={{
                  padding: "12px 24px",
                  borderRadius: 999,
                  background: "var(--pri)",
                  color: "#fff",
                  border: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                🔄 পুনরায় খেলুন
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
