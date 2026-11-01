// Recitation Review Bridge: Connects Student Quran Recitation Assessment to Ustadhs at Rahmania Institute
// Bridges student learning practice directly with the Teacher AI Review Hub

const STORAGE_KEY = "rahmania_recitation_review_submissions";

export function getStoredSubmissions() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function submitRecitationForReview({
  studentName = "নূর শিক্ষার্থী",
  rollNo = "N-101",
  batch = "নূরানী কায়দা ও নাজেরা",
  examType = "tajweed",
  examTitle = "নূরানী কায়দা মাশক মূল্যায়ন",
  verseText = "",
  audioUrl = "",
  aiScore = 85,
  deviations = [],
}) {
  const newSubmission = {
    id: `sub-${Date.now()}`,
    studentId: `std-${Math.floor(1000 + Math.random() * 9000)}`,
    studentName,
    rollNo,
    batch,
    examType,
    examTitle,
    verseText,
    submittedAt: "এইমাত্র",
    audioDuration: "৪০ সেকেন্ড",
    audioUrl,
    status: "pending", // pending | approved | rejected
    aiScore: {
      overall: aiScore,
      makhraj: Math.min(100, Math.max(50, aiScore + Math.floor(Math.random() * 6 - 3))),
      tajweed: Math.min(100, Math.max(50, aiScore + Math.floor(Math.random() * 6 - 3))),
      fluency: Math.min(100, Math.max(50, aiScore + Math.floor(Math.random() * 6 - 3))),
      lokma: aiScore >= 80 ? 0 : 1,
      deviations: deviations.length > 0 ? deviations : [
        { word: verseText.slice(0, 15) || "পঠিত আয়াত", rule: "মাখরাজ ও গুন্নাহ", issue: "উস্তাদের চূড়ান্ত মূল্যায়নের অপেক্ষায়" }
      ],
    },
    teacherOverride: null,
    teacherNotes: "",
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getStoredSubmissions();
      const updated = [newSubmission, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  return newSubmission;
}

export function updateSubmissionStatus(id, updateData) {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredSubmissions();
    const updated = existing.map((sub) => (sub.id === id ? { ...sub, ...updateData } : sub));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export default {
  getStoredSubmissions,
  submitRecitationForReview,
  updateSubmissionStatus,
};

