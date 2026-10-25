/**
 * 📖 Structured Tajweed Curriculum Data
 * Covering Makharij, Sifat, Noon/Meem Sakinah, Madd, Ghunnah, Qalqalah, and Waqf.
 */

export const TAJWEED_CURRICULUM = [
  {
    id: "tajweed-makharij",
    title: { bn: "১. ১৭টি মাখরাজ (Makharij al-Huruf)", en: "1. 17 Makharij Points", ar: "١. مخارج الحروف السبعة عشر" },
    desc: {
      bn: "মুখের ৫টি প্রধান অঙ্গের ১৭টি নির্দিষ্ট মাখরাজ থেকে ২৮টি হরফের সঠিক উৎপত্তি।",
      en: "The 17 specific articulation points distributed across the 5 major oral zones.",
      ar: "المخارج السبعة عشر الموزعة على المواضع الخمسة الرئيسية.",
    },
    zones: [
      { id: "halq", nameBn: "হলক্ব (কণ্ঠনালী)", letters: "ء هـ ع ح غ خ" },
      { id: "lisan", nameBn: "লিসান (জিহ্বা)", letters: "ق ك ج ش ي ض ل ن ر ط د ت ص ز س ظ ذ ث" },
      { id: "shafatan", nameBn: "শাফাতাইন (উভয় ওষ্ঠ)", letters: "ف م ب و" },
      { id: "khayshum", nameBn: "খাইশুম (নাসিকামূল)", letters: "نّ مّ (গুন্নাহ)" },
      { id: "jawf", nameBn: "জাওফ (মুখের খালি জায়গা)", letters: "ا و ي (মাদ্দ)" },
    ],
  },
  {
    id: "tajweed-noon-saakin",
    title: { bn: "২. নূন সাকিন ও তানভীনের ৪ নিয়ম", en: "2. Rules of Noon Saakin & Tanween", ar: "٢. أحكام النون الساكنة والتنوين" },
    desc: {
      bn: "ইযহার (স্পষ্ট), ইদগাম (মিলিয়ে), ইক্বলাব (মীমে রূপান্তর) ও ইখফা (লুকিয়ে গুন্নাহ)।",
      en: "Izhar, Idgham, Iqlab, and Ikhfa with authentic reciter examples.",
      ar: "الإظهار، الإدغام، الإقلاب، والإخفاء مع أمثلة صوتية محققة.",
    },
    rules: [
      { id: "izhar", nameBn: "ইযহার (Izhar)", letters: "ء هـ ع ح غ خ", count: 6, exampleAr: "مَنْ ءَامَنَ", audio: "https://everyayah.com/data/Alafasy_128kbps/002062.mp3" },
      { id: "idgham", nameBn: "ইদগাম (Idgham)", letters: "ي ر م ل و ن", count: 6, exampleAr: "مَن يَقُولُ", audio: "https://everyayah.com/data/Alafasy_128kbps/002008.mp3" },
      { id: "iqlab", nameBn: "ইক্বলাব (Iqlab)", letters: "ب", count: 1, exampleAr: "مِن بَعْدِ", audio: "https://everyayah.com/data/Alafasy_128kbps/002027.mp3" },
      { id: "ikhfa", nameBn: "ইখফা (Ikhfa)", letters: "ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك", count: 15, exampleAr: "مِن قَبْلِكَ", audio: "https://everyayah.com/data/Alafasy_128kbps/002004.mp3" },
    ],
  },
  {
    id: "tajweed-meem-saakin",
    title: { bn: "৩. মীম সাকিনের ৩ নিয়ম", en: "3. Rules of Meem Saakin", ar: "٣. أحكام الميم الساكنة" },
    desc: {
      bn: "ইখফায়ে শাফাবী (বা আসলে), ইদগামে শাফাবী (মীম আসলে), ইযহারে শাফাবী (বাকি হরফ)।",
      en: "Ikhfa Shafawi (before Ba), Idgham Shafawi (before Meem), Izhar Shafawi (remaining).",
      ar: "الإخفاء الشفوي، الإدغام الشفوي، والإظهار الشفوي.",
    },
    rules: [
      { id: "ikhfa_shafawi", nameBn: "ইখফায়ে শাফাবী", letters: "ب", exampleAr: "تَرْمِيهِم بِحِجَارَةٍ", audio: "https://everyayah.com/data/Alafasy_128kbps/105004.mp3" },
      { id: "idgham_shafawi", nameBn: "ইদগামে শাফাবী", letters: "م", exampleAr: "لَهُم مَّا يَشَاءُونَ", audio: "https://everyayah.com/data/Alafasy_128kbps/050035.mp3" },
      { id: "izhar_shafawi", nameBn: "ইযহারে শাফাবী", letters: "২৬টি হরফ", exampleAr: "أَلَمْ تَرَ", audio: "https://everyayah.com/data/Alafasy_128kbps/105001.mp3" },
    ],
  },
  {
    id: "tajweed-madd",
    title: { bn: "৪. মাদ্দ ও দীর্ঘ স্বরের প্রকারভেদ", en: "4. Types of Madd", ar: "٤. أقسام المدود ومقاديرها" },
    desc: {
      bn: "মাদ্দে আসলী (১ আলিফ), মাদ্দে মুত্তাসিল (৪ আলিফ), মাদ্দে মুনফাসিল ও মাদ্দে লাযিম (৪ আলিফ)।",
      en: "Madd Asli (1 Alif), Madd Muttasil (4 Alif), Munfasil, and Madd Lazim (4 Alif).",
      ar: "المد الأصلي، والمد المتصل، والمد المنفصل، والمد اللازم والبدل والعارض.",
    },
    rules: [
      { id: "madd_asli", nameBn: "মাদ্দে আসলী", counts: "১ আলিফ (২ হরকত)", exampleAr: "قَالَ", audio: "https://everyayah.com/data/Alafasy_128kbps/002030.mp3" },
      { id: "madd_muttasil", nameBn: "মাদ্দে মুত্তাসিল", counts: "৪ আলিফ", exampleAr: "جَاءَ", audio: "https://everyayah.com/data/Alafasy_128kbps/110001.mp3" },
      { id: "madd_lazim", nameBn: "মাদ্দে লাযিম", counts: "৪ আলিফ ভারী", exampleAr: "الضَّالِّينَ", audio: "https://everyayah.com/data/Alafasy_128kbps/001007.mp3" },
    ],
  },
  {
    id: "tajweed-qalqalah",
    title: { bn: "৫. কলকলাহ (প্রতিধ্বনি)", en: "5. Qalqalah Echo", ar: "٥. أحكام القلقلة" },
    desc: {
      bn: "ক্বাফ, ত্বোয়া, বা, জীম, দাল (قُطْبُ جَدٍّ) সাকিন অবস্থায় সুন্দর প্রতিধ্বনি সৃষ্টি।",
      en: "Qutb Jad letters (ق ط ب ج د) produce a sharp, echoing bounce when resting.",
      ar: "قلقلة حروف (قطب جد) حال سكونها ووقفها.",
    },
    rules: [
      { id: "qalqalah_sughra", nameBn: "কলকলাহে সুগরা (শব্দের মাঝে)", exampleAr: "يَقْطَعُونَ", audio: "https://everyayah.com/data/Alafasy_128kbps/002027.mp3" },
      { id: "qalqalah_kubra", nameBn: "কলকলাহে কুবরা (শব্দের শেষে ওয়াক্ফে)", exampleAr: "الْفَلَقِ", audio: "https://everyayah.com/data/Alafasy_128kbps/113001.mp3" },
    ],
  },
];
