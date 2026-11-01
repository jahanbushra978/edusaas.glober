// Initial mock submissions representing real-world student submissions to the AI Tutor at Rahmania Institute
export const INITIAL_SUBMISSIONS = [
  {
    id: "sub-101",
    studentId: "std-01",
    studentName: "আব্দুল্লাহ আল-মামুন",
    rollNo: "H-12",
    batch: "হিফজ বিভাগ (ব্যাচ ক)",
    examType: "tajweed",
    examTitle: "সূরা আন-নাস (আয়াত ১-৬) তাজবীদ পরীক্ষা",
    submittedAt: "আজ, বেলা ১১:২০",
    audioDuration: "১ মিনিট ৪৫ সেকেন্ড",
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/114001.mp3",
    status: "pending", // pending | approved | rejected
    aiScore: {
      overall: 88.5,
      makhraj: 86,
      tajweed: 89,
      fluency: 92,
      lokma: 0,
      deviations: [
        { word: "مِنْ شَرِّ", rule: "ইখফা হাকিকী", issue: "গুন্নাহর পরিমাণ ১.৫ হরকত ছিল (২ হরকত কাম্য)", timestamp: "0:22" },
        { word: "الْوَسْوَاسِ", rule: "হরফের মাখরাজ", issue: "সীন হরফে সফীর (বাঁশির ন্যায় আওয়াজ) কিছুটা অস্পষ্ট", timestamp: "0:45" }
      ]
    },
    teacherOverride: null,
    teacherNotes: ""
  },
  {
    id: "sub-102",
    studentId: "std-02",
    studentName: "মুহাম্মদ সালমান ফারসী",
    rollNo: "H-05",
    batch: "হিফজ বিভাগ (ব্যাচ খ)",
    examType: "hifz",
    examTitle: "সূরা আল-মুলক (আয়াত ১-১০) হিফজ সাবক পরীক্ষা",
    submittedAt: "আজ, সকাল ৯:১৫",
    audioDuration: "৩ মিনিট ১০ সেকেন্ড",
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/067001.mp3",
    status: "pending",
    aiScore: {
      overall: 78.0,
      makhraj: 82,
      tajweed: 76,
      fluency: 76,
      lokma: 2,
      deviations: [
        { word: "فَارْجِعِ الْبَصَرَ", rule: "আয়াত ধারাবাহিকতা", issue: "আয়াত ৩ ও ৪ এর মাঝে ৩ সেকেন্ড অতিরিক্ত বিরতি (লোকমা-১)", timestamp: "1:15" },
        { word: "هَلْ تَرَىٰ مِن فُطُورٍ", rule: "ইখফা", issue: "ফা হরফে গুন্নাহ অসম্পূর্ণ ছিল", timestamp: "1:42" }
      ]
    },
    teacherOverride: null,
    teacherNotes: ""
  },
  {
    id: "sub-103",
    studentId: "std-03",
    studentName: "ফাতিমা বিনতে ইউসুফ",
    rollNo: "N-20",
    batch: "নাজেরা বিভাগ",
    examType: "reading",
    examTitle: "সূরা আর-রহমান (১ম রুকু) নাজেরা সাবলীলতা",
    submittedAt: "গতকাল, বিকাল ৪:৫০",
    audioDuration: "২ মিনিট ৩৫ সেকেন্ড",
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/055001.mp3",
    status: "approved",
    aiScore: {
      overall: 95.0,
      makhraj: 96,
      tajweed: 94,
      fluency: 95,
      lokma: 0,
      deviations: []
    },
    teacherOverride: {
      overall: 96.0,
      makhraj: 97,
      tajweed: 95,
      fluency: 96,
      remarks: "মাশাআল্লাহ! উচ্চারণ অত্যন্ত সাবলীল ও স্পষ্ট।"
    },
    teacherNotes: "অত্যন্ত চমৎকার তিলাওয়াত। পরবর্তী পারায় যাওয়ার অনুমতি দেওয়া হলো।"
  }
];

export default INITIAL_SUBMISSIONS;
