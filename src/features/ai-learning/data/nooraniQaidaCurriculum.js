/**
 * 📚 Complete 5-Level · 35-Lesson Quran Learning Curriculum
 * Inspired by Mawlana Muhammad Jamal Uddin (Panvision TV) — "কুরআন শেখার সহজ উপায়"
 * Structured for Maktab pedagogy: Duolingo-style progression with authentic Qari voice.
 * Fully localized in Bengali (Primary), English, and Arabic.
 */

export const NOORANI_QAIDA_MODULES = [
  // ─────────────────────────────────────────────────────────────
  // 🟢 LEVEL 1: হরফ ও মাখরাজ ফাউন্ডেশন (5 Lessons)
  // ─────────────────────────────────────────────────────────────
  {
    id: "module-1",
    levelId: 1,
    moduleNumber: 1,
    title: {
      bn: "১. হরফ ও মাখরাজ ফাউন্ডেশন",
      en: "Level 1: Alphabet & Makhraj Foundation",
      ar: "المستوى الأول: أساسيات الحروف والمخارج",
    },
    desc: {
      bn: "আরবির ২৯টি হরফ, নুকতাহীন ও নুকতাযুক্ত হরফ চেনার কৌশল ও ১৭টি মাখরাজের বিশুদ্ধ ভিত্তি।",
      en: "Master the 29 Arabic letters, dot recognition, and the 17 articulation points.",
      ar: "التعرف على الحروف الـ٢٩ ومواضع النقاط والمخارج السبعة عشر بدقة.",
    },
    lessons: [
      {
        id: "l1-1",
        title: { bn: "নুকতাহীন হরফসমূহ (১ম অংশ)", en: "Dotless Letters (Part 1)", ar: "الحروف غير المنقوطة" },
        arabicItems: ["ا", "ح", "د", "ر", "س", "ص", "ط"],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/001001.mp3",
        explanation: {
          bn: "আলিফ খালি থাকে। হা (হলকের মধ্যখান), দাল, র, সিন (শীষ ধ্বনি), সোয়াদ (ভারী শীষ), তোয়া (ভারী)। এই হরফগুলোতে কোনো নুকতা থাকে না।",
          en: "Alif is empty. Haa, Dal, Raa, Seen, Saad, and Twa have no dots.",
          ar: "الألف والحاء والدال والراء والسين والصاد والطاء حروف خالية من النقاط.",
        },
        quiz: {
          question: {
            bn: "নিচের কোন হরফটিতে কোনো নুকতা নেই?",
            en: "Which letter has no dots?",
            ar: "أي حرف من الحروف التالية بدون نقاط؟",
          },
          options: ["ح", "ج", "خ", "ب"],
          correctIndex: 0,
        },
      },
      {
        id: "l1-2",
        title: { bn: "নুকতাযুক্ত হরফ ও অবস্থান কৌশল", en: "Dotted Letters & Dot Positions", ar: "الحروف المنقوطة ومواضع النقط" },
        arabicItems: ["ب", "ت", "ث", "ج", "خ", "ذ", "ز"],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/001001.mp3",
        explanation: {
          bn: "বা-এর নিচে ১ নুকতা, তা-এর ওপরে ২ নুকতা, সা-এর ওপরে ৩ নুকতা (নরম হরফ)। জীমের পেটে ১ নুকতা, খা-এর ওপরে ১ নুকতা। নুকতার সংখ্যা ও অবস্থানই হরফ চেনার মূল রহস্য।",
          en: "Baa has 1 dot below, Taa has 2 dots above, Thaa has 3 dots above (soft). Jeem has 1 dot inside, Khaa has 1 dot above.",
          ar: "الباء نقطة تحتها، والتاء نقطتان فوقها، والثاء ثلاث نقط فوقها، والجيم نقطة في بطنها، والخاء نقطة فوقها.",
        },
        quiz: {
          question: {
            bn: "কোন হরফের ওপরে তিনটি নুকতা থাকে এবং জিহ্বার আগা দিয়ে নরমভাবে পড়তে হয়?",
            en: "Which letter has 3 dots above and is pronounced softly with the tongue tip?",
            ar: "أي حرف فوقه ثلاث نقاط ويخرج برقة من طرف اللسان؟",
          },
          options: ["ث", "ت", "ب", "ش"],
          correctIndex: 0,
        },
      },
      {
        id: "l1-3",
        title: { bn: "৫টি প্রধান মাখরাজ এলাকা ও ১৭ মাখরাজ", en: "5 Articulation Zones & 17 Makharij", ar: "المخارج الخمسة الرئيسية" },
        arabicItems: ["ء", "ع", "غ", "ق", "ض", "ط", "ف", "م"],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/001002.mp3",
        explanation: {
          bn: "মুখের ৫টি প্রধান অঞ্চল: ১. আল-জাওফ (মুখের খালি স্থান), ২. আল-হলক্ব (কণ্ঠনালী), ৩. আল-লিসান (জিহ্বা), ৪. আশ-শাফাতাইন (দুই ঠোঁট), ৫. আল-খাইশুম (নাসিকামূল)। এই ৫ অঞ্চল থেকে ১৭টি মাখরাজ নির্ধারিত।",
          en: "5 major zones: 1. Al-Jawf, 2. Al-Halq (Throat), 3. Al-Lisan (Tongue), 4. Ash-Shafatayn (Lips), 5. Al-Khayshum (Nasal cavity).",
          ar: "المخارج العامة خمسة: الجوف، الحلق، اللسان، الشفتان، والخيشوم، وتتفرع منها ١٧ مخرجاً خاصاً.",
        },
        quiz: {
          question: {
            bn: "কণ্ঠনালী (আল-হলক্ব) থেকে মোট কয়টি হরফ উচ্চারিত হয়?",
            en: "How many letters emerge from the throat (Al-Halq)?",
            ar: "كم عدد حروف الحلق؟",
          },
          options: [
            { bn: "৬টি (ء هـ ع ح غ خ)", en: "6 letters", ar: "٦ حروف" },
            { bn: "৪টি", en: "4 letters", ar: "٤ حروف" },
            { bn: "৫টি", en: "5 letters", ar: "٥ حروف" },
            { bn: "৩টি", en: "3 letters", ar: "٣ حروف" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l1-4",
        title: { bn: "সদৃশ হরফের তুলনামূলক ড্রিল", en: "Similar-Sounding Letters Drill", ar: "التمييز بين الحروف المتشابهة" },
        arabicItems: ["ت", "ط", "س", "ث", "ص", "د", "ض", "ك", "ق"],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/001001.mp3",
        explanation: {
          bn: "ت (তা - চিকন) বনাম ط (তোয়া - ভারী ও মোটা)। س (সিন - শীষ) বনাম ث (ছা - নরম) বনাম ص (সোয়াদ - শিষসহ মোটা)। د (দাল) বনাম ض (দোয়াদ)। ك (কাফ) বনাম ق (ক্বাফ)।",
          en: "Compare thin letters vs bold letters: Taa vs Twa, Seen vs Thaa vs Saad, Dal vs Daad, Kaaf vs Qaaf.",
          ar: "مقارنة الحروف المرققة والمفخمة: التاء والطاء، السين والثاء والصاد، الدال والضاد، الكاف والقاف.",
        },
        quiz: {
          question: {
            bn: "জিহ্বার গোড়া ওপরের নরম তালুর সাথে লাগিয়ে ভারী ও মোটা আওয়াজে কোনটি পড়তে হয়?",
            en: "Which heavy letter is articulated with the back of the tongue raised to the soft palate?",
            ar: "أي حرف مفخم يخرج من أقصى اللسان مع الحنك اللحمي؟",
          },
          options: ["ق (ক্বাফ)", "ك (কাফ)", "ت (তা)", "د (দাল)"],
          correctIndex: 0,
        },
      },
      {
        id: "l1-5",
        title: { bn: "লেভেল ১ সমাপনী মূল্যায়ন পরীক্ষা", en: "Level 1 Mastery Test", ar: "اختبار إتقان المستوى الأول" },
        arabicItems: ["ث", "ح", "خ", "ص", "ض", "ط", "ظ", "ع", "غ", "ق"],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/001001.mp3",
        explanation: {
          bn: "মাশাআল্লাহ! আপনি লেভেল ১ সমাপ্তির দ্বারপ্রান্তে। আরবির ২৯টি হরফ ও ১৭টি মাখরাজের সমন্বিত পরীক্ষা দিয়ে পরবর্তী লেভেল আনলক করুন।",
          en: "Mastery test of Level 1: identify all 29 letters and their correct articulation points.",
          ar: "اختبار شامل للمستوى الأول: التحقق من إتقان الحروف والمخارج السبعة عشر.",
        },
        quiz: {
          question: {
            bn: "জিহ্বার গোড়ার কিনারা ওপরের মাড়ির দাঁতের সাথে লাগিয়ে উচ্চারিত অনন্য আরবি হরফ কোনটি?",
            en: "Which unique Arabic letter is produced by the tongue edge touching the upper molars?",
            ar: "أي حرف يخرج من حافة اللسان مع ما يجاورها من الأضراس العليا؟",
          },
          options: ["ض (দোয়াদ)", "ص (সোয়াদ)", "د (দাল)", "ظ (জোয়া)"],
          correctIndex: 0,
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 🟡 LEVEL 2: মোরাক্কাব, হরকত ও তানভীন (7 Lessons)
  // ─────────────────────────────────────────────────────────────
  {
    id: "module-2",
    levelId: 2,
    moduleNumber: 2,
    title: {
      bn: "২. মোরাক্কাব, হরকত ও তানভীন",
      en: "Level 2: Positional Forms, Harakat & Tanween",
      ar: "المستوى الثاني: الحروف المركبة والحركات والتنوين",
    },
    desc: {
      bn: "হরফের যুক্তরূপ (শুরু, মধ্য, শেষ), যবর, যের, পেশের দ্রুত পাঠ ও তানভীনের লুকায়িত নূন ধ্বনি।",
      en: "Master letter joining shapes, short vowels without stretching, and Tanween nunation.",
      ar: "تعلم أشكال الحروف في أول الكلمة ووسطها وآخرها، والحركات القصيرة، والتنوين.",
    },
    lessons: [
      {
        id: "l2-1",
        title: { bn: "হরফের বিভিন্ন রূপ (শুরু, মধ্য, শেষ)", en: "Positional Forms of Letters", ar: "أشكال الحروف حسب موقعها" },
        arabicItems: ["بـ", "ـبـ", "ـب", "نـ", "ـنـ", "ـن"],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/001001.mp3",
        explanation: {
          bn: "আরবি হরফ শব্দের শুরুতে এক হাতে বামে যুক্ত হয়, শব্দের মাঝে দুই দিকে হাত বাড়ায়, এবং শব্দের শেষে তার পূর্ণ রূপ বজায় রাখে।",
          en: "Letters have Initial (left connecting), Medial (both sides connecting), and Final forms.",
          ar: "الحروف تتصل في أول الكلمة ووسطها وآخرها بأشكال مميزة مع الحفاظ على النقاط.",
        },
        quiz: {
          question: {
            bn: "শব্দের শুরুতে হরফ সাধারণত কোন দিকে হাত বাড়িয়ে পরবর্তী অক্ষরের সাথে যুক্ত হয়?",
            en: "In what direction does an initial letter connect to the next letter?",
            ar: "في أي جهة يتصل الحرف في بداية الكلمة بالحرف الذي يليه؟",
          },
          options: [
            { bn: "বামের দিকে", en: "To the left", ar: "إلى اليسار" },
            { bn: "ডানের দিকে", en: "To the right", ar: "إلى اليمين" },
            { bn: "উভয় দিকে", en: "Both sides", ar: "من الجهتين" },
            { bn: "কোথাও যুক্ত হয় না", en: "Does not connect", ar: "لا يتصل" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l2-2",
        title: { bn: "মোরাক্কাব (যুক্তাক্ষর) পাঠ মাশক", en: "Murakkabat Joining Practice", ar: "تدريبات الحروف المركبة" },
        arabicItems: ["لا", "با", "جا", "بل", "تح"],
        audioSample: "/sounds/noorani/qari_lam_alif.m4a?v=15",
        explanation: {
          bn: "দুই বা ততোধিক হরফ একসঙ্গে মিলে মোরাক্কাব গঠিত হয়। যেমন: লাম ও আলিফ মিলে 'লা', বা ও আলিফ মিলে 'বা'। হরফের মাথা ও নুকতা দেখে চিনতে হবে।",
          en: "Murakkabat are joined letter combinations. Identify each letter by its head and dot count.",
          ar: "المركبات تركيب حرفين أو أكثر، وتُميَّز برؤوس الحروف ومواضع النقاط.",
        },
        quiz: {
          question: {
            bn: "لام (লাম) এবং ألف (আলিফ) যুক্ত হয়ে কোন যুক্তরূপ গঠন করে?",
            en: "What combined shape do Laam and Alif form?",
            ar: "ما هو الشكل الناتج عن دمج اللام مع الألف؟",
          },
          options: ["لا", "ال", "لـ", "ـل"],
          correctIndex: 0,
        },
      },
      {
        id: "l2-3",
        title: { bn: "যবর (Fathah) — আ-কার স্বল্প স্বরধ্বনি", en: "Fathah: Short 'a' Vowel", ar: "الفتحة وصوتها القصير" },
        arabicItems: ["بَ", "تَ", "ثَ", "جَ"],
        audioSample: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Takhti4.m4a",
        explanation: {
          bn: "হরফের ওপরে এক তীর্যক দাগকে যবর বলে। যবর একটি স্বল্প স্বরধ্বনি (Short Vowel) যা 'আ' ধ্বনি দেয়। যবরের উচ্চারণ তাড়াতাড়ি পড়তে হয়, কোনো মাদ্দ নেই, একচুলও টানা যাবে না।",
          en: "Fathah is a diagonal stroke above a letter producing a short 'a' sound. Recite quickly without any stretching.",
          ar: "الفتحة خط مائل فوق الحرف، صوتها قصير سريع دون مد أو تمطيط.",
        },
        quiz: {
          question: {
            bn: "হরকতের উচ্চারণ কেমন করে পড়তে হয়?",
            en: "How should Harakat short vowels be recited?",
            ar: "كيف يُقرأ صوت الحركات؟",
          },
          options: [
            { bn: "তাড়াতাড়ি না টেনে", en: "Quickly without stretching", ar: "سريعاً بدون مد" },
            { bn: "১ আলিফ টেনে", en: "Stretched 1 Alif", ar: "ممدوداً ألفاً" },
            { bn: "নাক দিয়ে গুন্নাহ করে", en: "With Ghunnah", ar: "بغنة" },
            { bn: "থামিয়ে ও সাকিন করে", en: "With Sukoon", ar: "بالوقف" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l2-4",
        title: { bn: "যের (Kasrah) — ই-কার স্বল্প স্বরধ্বনি", en: "Kasrah: Short 'i' Vowel", ar: "الكسرة وصوتها القصير" },
        arabicItems: ["بِ", "تِ", "ثِ", "جِ"],
        audioSample: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Takhti4.m4a",
        explanation: {
          bn: "হরফের নিচে এক দাগ যের (ই-কার ধ্বনি)। যেমন: বা যের বি, তা যের তি, ছা যের ছি, জীম যের জি। একচুলও টানা যাবে না, দ্রুত ও পরিষ্কার উচ্চারণ করতে হবে।",
          en: "Kasrah sits below the letter ('i' sound). Recite briskly without extending the vowel.",
          ar: "الكسرة خط مائل تحت الحرف بصوت الياء القصيرة الخفيفة دون تمطيط.",
        },
        quiz: {
          question: {
            bn: "হরফের নিচে এক দাগ থাকলে তাকে কী বলে এবং কীভাবে পড়তে হয়?",
            en: "What is a stroke below a letter called and how is it read?",
            ar: "ماذا يسمى الخط المائل تحت الحرف وكيف يقرأ؟",
          },
          options: [
            { bn: "যের (ই-কার ধ্বনি, তাড়াতাড়ি না টেনে)", en: "Kasrah (short 'i', no stretch)", ar: "كسرة (بسرعة ودون مد)" },
            { bn: "যবর", en: "Fathah", ar: "فتحة" },
            { bn: "পেশ", en: "Dammah", ar: "ضمة" },
            { bn: "জযম", en: "Jazm", ar: "جزم" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l2-5",
        title: { bn: "পেশ (Dammah) — উ-কার স্বল্প স্বরধ্বনি", en: "Dammah: Short 'u' Vowel", ar: "الضمة وصوتها القصير" },
        arabicItems: ["بُ", "تُ", "ثُ", "جُ"],
        audioSample: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Takhti4.m4a",
        explanation: {
          bn: "হরফের ওপরে ছোট ওয়াওয়ের মতো চিহ্ন পেশ (উ-কার ধ্বনি)। যেমন: বা পেশ বু, তা পেশ তু, ছা পেশ ছু, জীম পেশ জু। দুই ঠোঁট গোল করে দ্রুত পড়তে হয়।",
          en: "Dammah is shaped like a small Waw above a letter ('u' sound). Round the lips and recite promptly without elongation.",
          ar: "الضمة واو صغيرة فوق الحرف، تُنطق بضم الشفتين صوتاً قصيراً دون تمطيط.",
        },
        quiz: {
          question: {
            bn: "পেশ (Dammah) উচ্চারণের সময় ঠোঁটের অবস্থা কেমন হয়?",
            en: "What is the lip position during Dammah articulation?",
            ar: "كيف يكون وضع الشفتين عند نطق الضمة؟",
          },
          options: [
            { bn: "দুই ঠোঁট গোল হয়ে সামনে বাড়ে", en: "Lips rounded forward", ar: "ضم الشفتين إلى الأمام" },
            { bn: "ঠোঁট চ্যাপ্টা থাকে", en: "Lips flat", ar: "انفراج الشفتين" },
            { bn: "জিহ্বা বের হয়", en: "Tongue extended", ar: "خروج اللسان" },
            { bn: "নাক বন্ধ থাকে", en: "Nose pinched", ar: "إغلاق الأنف" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l2-6",
        title: { bn: "হরকতের ৩-অক্ষরী শব্দ রিডিং মাশক", en: "3-Letter Short Vowel Words Drill", ar: "قراءة كلمات ثلاثية بالحركات" },
        arabicItems: ["كَتَبَ", "خَلَقَ", "جَعَلَ"],
        audioSample: "https://audio.qurancdn.com/wbw/005_021_006.mp3",
        explanation: {
          bn: "كَتَبَ (কা-তা-বা = কাতাবা), خَلَقَ (খ-লা-ক্বা = খলাক্বা), جَعَلَ (জা-আ-লা = জা'আলা)। খেয়াল করুন: এখানে কোনো মাদ্দ নেই, প্রতিটি স্বল্প স্বরধ্বনি দ্রুত সমান ছন্দে পড়তে হবে।",
          en: "Read continuous 3-letter words: Kataba, Khalaqa, Ja'ala. Keep all three short vowels equal and crisp without stretching.",
          ar: "قراءة الكلمات الثلاثية: كَتَبَ، خَلَقَ، جَعَلَ. مع مراعاة وزن زمني متساوٍ للحركات دون تمطيط.",
        },
        quiz: {
          question: {
            bn: "كَتَبَ শব্দটিতে কোন হরকতের প্রয়োগ রয়েছে এবং কীভাবে পড়তে হবে?",
            en: "What vowels are in 'كَتَبَ' and how should it be recited?",
            ar: "ما حركات كلمة 'كَتَبَ' وكيف تقرأ؟",
          },
          options: [
            { bn: "৩টি যবর, না টেনে দ্রুত সম-ছন্দে", en: "3 Fathahs, briskly with equal rhythm", ar: "٣ فتحات بالتساوي وبدون مد" },
            { bn: "১ আলিফ টেনে", en: "Stretched 1 Alif", ar: "ممدوداً" },
            { bn: "গুন্নাহ করে", en: "With Ghunnah", ar: "بغنة" },
            { bn: "থামিয়ে", en: "Stopped", ar: "بالسكون" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l2-7",
        title: { bn: "তানভীন — দুই যবর, দুই যের, দুই পেশ", en: "Tanween: Double Vowels Nunation", ar: "التنوين: فتحتان وكسرتان وضمتان" },
        arabicItems: ["بً", "بٍ", "بٌ", "تً", "تٍ", "تٌ"],
        audioSample: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter05/Takhti5.m4a",
        explanation: {
          bn: "দুই যবর (বান্), দুই যের (বিন্), দুই পেশ (বুন)। তানভীনের মূল রহস্য হলো এর উচ্চারণের ভেতর একটি নূন সাকিন (نْ) ধ্বনি লুকিয়ে থাকে।",
          en: "Double vowels: Ban, Bin, Bun. In speech, Tanween produces an inherent resting Noon sound (Nunation).",
          ar: "التنوين نون ساكنة تلحق آخر الأسماء لفظاً لا خطاً: بَن، بِن، بُن.",
        },
        quiz: {
          question: {
            bn: "তানভীন (দুই যবর, দুই যের, দুই পেশ)-এর ভেতর কোন হরফের আওয়াজ লুকিয়ে থাকে?",
            en: "Which letter's silent sound is embedded inside Tanween?",
            ar: "صوت أي حرف كامن في نطق التنوين؟",
          },
          options: [
            { bn: "নূন সাকিন (نْ)", en: "Noon Saakin (نْ)", ar: "النون الساكنة" },
            { bn: "মীম সাকিন", en: "Meem Saakin", ar: "الميم الساكنة" },
            { bn: "আলিফ", en: "Alif", ar: "الألف" },
            { bn: "ওয়াও", en: "Waw", ar: "الواو" },
          ],
          correctIndex: 0,
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 🔵 LEVEL 3: জযম, ক্বলক্বলাহ ও তাশদীদ (7 Lessons)
  // ─────────────────────────────────────────────────────────────
  {
    id: "module-3",
    levelId: 3,
    moduleNumber: 3,
    title: {
      bn: "৩. জযম, ক্বলক্বলাহ ও তাশদীদ",
      en: "Level 3: Sukoon, Qalqalah & Tashdeed",
      ar: "المستوى الثالث: السكون والقلقلة والتشديد",
    },
    desc: {
      bn: "সাকিন মিলন, ক্বলক্বলাহর ৫ হরফ, মীম সাকিন, ওয়াজিব গুন্নাহ ও তাশদীদের নিখুঁত নিয়মাবলী।",
      en: "Master resting Sukoon, 5 bouncing Qalqalah letters, Meem Saakin, Wajib Ghunnah, and doubled Tashdeed.",
      ar: "أحكام السكون وحروف القلقلة الخمسة وأحكام الميم الساكنة والغنة الواجبة والشدة.",
    },
    lessons: [
      {
        id: "l3-1",
        title: { bn: "জযম বা সাকিন মিলন মাশক", en: "Sukoon / Jazm Word Joining", ar: "أحكام السكون والجزم" },
        arabicItems: ["أَتْ", "أَثْ", "أَحْ", "أَخْ"],
        audioSample: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-4.m4a",
        explanation: {
          bn: "জযম বা সাকিনযুক্ত হরফ একা একা পড়া যায় না; পূর্বের হরকতের সাথে মিলিয়ে স্থিরভাবে পড়তে হয়। যেমন: হামযাহ-তা যবর 'আত্'।",
          en: "A letter with Sukoon (Jazm) cannot start a sound; it joins the preceding vowel. E.g.: At, Ath, Ah, Akh.",
          ar: "الحرف الساكن لا يُنطق بمفرده، بل يُنطق موصولاً بالحرف المتحرك قبله.",
        },
        quiz: {
          question: {
            bn: "সাকিন (জযম) যুক্ত হরফ কীভাবে উচ্চারিত হয়?",
            en: "How is a letter with Sukoon pronounced?",
            ar: "كيف يُنطق الحرف الساكن؟",
          },
          options: [
            { bn: "পূর্বের হরকতের সাথে মিলিয়ে স্থিরভাবে", en: "Connected to the preceding vowel", ar: "موصولاً بالحركة قبله" },
            { bn: "একা একা পড়া যায়", en: "Can be read alone", ar: "منفرداً" },
            { bn: "টেনে ৩ আলিফ", en: "Stretched 3 Alifs", ar: "ممدوداً" },
            { bn: "পড়া নিষেধ", en: "Cannot be read", ar: "ممنوع القراءة" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l3-2",
        title: { bn: "ক্বলক্বলাহর ৫টি হরফ (ق ط ب ج د)", en: "The 5 Qalqalah Letters (Echo/Bounce)", ar: "حروف القلقلة الخمسة (قطب جد)" },
        arabicItems: ["أَبْ", "أَجْ", "أَدْ", "أَطْ", "أَقْ"],
        audioSample: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-1.m4a",
        explanation: {
          bn: "ক্বাফ, ত্বোয়া, বা, জীম, দাল (قطب جد) — এই ৫ হরফে সাকিন হলে মাখরাজে ধাক্কা লেগে প্রতিধ্বনি (Echo / Rebound) সৃষ্টি হয়। যেমন: أَبْ (আব্) উচ্চারণে ঠোঁট খুলে সুন্দর রিবাউন্ড হবে।",
          en: "When the 5 Qalqalah letters (ق ط ب ج د) have Sukoon, they rebound with an echoing bounce. E.g.: Ab, Aj, Ad, At, Aq.",
          ar: "حروف القلقلة خمسة يجمعها (قطب جد)، تُنطق باهتزاز ورنين وارتداد عند السكون.",
        },
        quiz: {
          question: {
            bn: "ক্বলক্বলাহর হরফ কয়টি এবং কী কী?",
            en: "How many Qalqalah letters are there and what are they?",
            ar: "كم عدد حروف القلقلة وما هي؟",
          },
          options: [
            { bn: "৫টি (ق، ط، ب، ج، د)", en: "5 letters (ق ط ب ج د)", ar: "٥ حروف (قطب جد)" },
            { bn: "৩টি", en: "3 letters", ar: "٣ حروف" },
            { bn: "৬টি", en: "6 letters", ar: "٦ حروف" },
            { bn: "৭টি", en: "7 letters", ar: "٧ حروف" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l3-3",
        title: { bn: "মীম সাকিনের ৩টি নিয়ম", en: "3 Rules of Meem Saakin", ar: "أحكام الميم الساكنة الثلاثة" },
        arabicItems: ["تَرْمِيهِم بِحِجَارَةٍ", "لَهُم مَّا", "هُمْ فِيهَا"],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/105004.mp3",
        explanation: {
          bn: "মীম সাকিনের ৩ নিয়ম: ১. ইখফায়ে শাফাবী (বায়ের পূর্বে আসলে গুন্নাহসহ গোপন), ২. ইদগামে শাফাবী (মীমে মীম মিলিয়ে গুন্নাহ), ৩. ইযহারে শাফাবী (অন্য সকল হরফে স্পষ্ট পড়া)।",
          en: "Meem Saakin rules: 1. Ikhfa Shafawi (before Baa), 2. Idgham Shafawi (before Meem), 3. Izhar Shafawi (before all other letters).",
          ar: "أحكام الميم الساكنة: الإخفاء الشفوي عند الباء، والإدغام الشفوي عند الميم، والإظهار الشفوي عند باقي الحروف.",
        },
        quiz: {
          question: {
            bn: "মীম সাকিনের পর 'ب' (বা) আসলে কোন নিয়মে গুন্নাহ করতে হয়?",
            en: "Which rule applies when Meem Saakin is followed by Baa (ب)?",
            ar: "ما حكم الميم الساكنة إذا جاء بعدها حرف الباء؟",
          },
          options: [
            { bn: "ইখফায়ে শাফাবী (নরম গুন্নাহ)", en: "Ikhfa Shafawi (soft Ghunnah)", ar: "إخفاء شفوي بغنة" },
            { bn: "ইযহার (স্পষ্ট পড়া)", en: "Izhar", ar: "إظهار" },
            { bn: "ইক্বলাব", en: "Iqlab", ar: "إقلاب" },
            { bn: "ক্বলক্বলাহ", en: "Qalqalah", ar: "قلقلة" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l3-4",
        title: { bn: "তাশদীদ পাঠ মাশক", en: "Tashdeed Doubling Drill", ar: "تدريبات الشدة والتشديد" },
        arabicItems: ["أَبَّ", "قُلْ", "رَبِّ"],
        audioSample: "/sounds/noorani/abba.mp3?v=4",
        explanation: {
          bn: "তাশদীদযুক্ত হরফ দুইবার উচ্চারিত হয় — প্রথমবার সাকিন হিসেবে পূর্বের হরকতের সাথে, দ্বিতীয়বার নিজের হরকত অনুযায়ী। যেমন: রব্বি (رَبْ-بِ)।",
          en: "A letter with Tashdeed is pronounced twice: first silent with the preceding vowel, then with its own vowel. E.g.: Rab-bi.",
          ar: "الحرف المشدد حرفان مدغمان: أولهما ساكن بالوصل وثانيهما متحرك.",
        },
        quiz: {
          question: {
            bn: "তাশদীদযুক্ত হরফ মোট কয়বার উচ্চারিত হয়?",
            en: "How many times is a letter with Tashdeed recited?",
            ar: "كم مرة يُنطق الحرف المشدد؟",
          },
          options: [
            { bn: "২ বার (প্রথমবার সাকিন, দ্বিতীয়বার হরকত)", en: "2 times (Sukoon + Vowel)", ar: "مرتان (ساكن فمتحرك)" },
            { bn: "১ বার", en: "1 time", ar: "مرة واحدة" },
            { bn: "৩ বার", en: "3 times", ar: "٣ مرات" },
            { bn: "৪ বার", en: "4 times", ar: "٤ مرات" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l3-5",
        title: { bn: "ওয়াজিব গুন্নাহ — নূন ও মীমে তাশদীদ", en: "Wajib Ghunnah: Noon & Meem Tashdeed", ar: "الغنة الواجبة في النون والميم" },
        arabicItems: ["إِنَّ", "ثُمَّ", "عَمَّ"],
        audioSample: "https://audio.qurancdn.com/wbw/002_006_001.mp3",
        explanation: {
          bn: "নূন ও মীমের ওপর তাশদীদ থাকলে (نّ / مّ) নাকের বাঁশিতে (আল-খাইশুম) ১ আলিফ পরিমাণ সময় ধরে মিষ্টি সুর দিয়ে গুন্নাহ করা ওয়াজিব (বাধ্যতামূলক)। যেমন: إِنَّ (ইন্-না), ثُمَّ (সুম্-মা)।",
          en: "When Noon or Meem has Tashdeed (نّ / مّ), holding nasal Ghunnah for 1 Alif count is mandatory (Wajib).",
          ar: "النون والميم المشددتان حكمهما الغنة الواجبة بمقدار حركتين من الخيشوم.",
        },
        quiz: {
          question: {
            bn: "নূন ও মীমের ওপর তাশদীদ থাকলে কী করা ওয়াজিব?",
            en: "What is mandatory when Noon or Meem has Tashdeed?",
            ar: "ما الحكم الواجب عند تشديد النون والميم؟",
          },
          options: [
            { bn: "১ আলিফ পরিমাণ ওয়াজিব গুন্নাহ করা", en: "Mandatory 1-Alif nasal Ghunnah", ar: "غنة واجبة بمقدار حركتين" },
            { bn: "তাড়াতাড়ি পড়া", en: "Read quickly", ar: "قراءة سريعة" },
            { bn: "থামিয়ে দেওয়া", en: "Stop completely", ar: "الوقف التام" },
            { bn: "কলকলাহ করা", en: "Qalqalah", ar: "قلقلة" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l3-6",
        title: { bn: "লাম ও রার পুর (মোটা) ও বারিক (চিকন) নিয়ম", en: "Rules of Laam & Raa (Thick vs Thin)", ar: "أحكام اللام والراء تفخيماً وترقيقاً" },
        arabicItems: ["اللَّهِ", "بِاللَّهِ", "رَبِّ", "رِزْقًا"],
        audioSample: "https://audio.qurancdn.com/wbw/001_001_002.mp3",
        explanation: {
          bn: "আল্লাহ শব্দের লামের পূর্বে যবর বা পেশ থাকলে লাম মোটা (পুর) হয়, যের থাকলে চিকন (বারিক) হয়। তেমনি রা-এর ওপর যবর বা পেশ থাকলে মোটা, নিচে যের থাকলে চিকন করে পড়তে হয়।",
          en: "The Laam in 'Allah' is heavy if preceded by Fathah/Dammah, and thin if preceded by Kasrah. Raa is heavy with Fathah/Dammah, thin with Kasrah.",
          ar: "تفخم لام لفظ الجلالة بعد الفتح والضم وترقق بعد الكسر. والراء تفخم مع الفتح والضم وترقق مع الكسر.",
        },
        quiz: {
          question: {
            bn: "আল্লাহ শব্দের পূর্বে যের থাকলে (যেমন: بِاللَّهِ) লাম কেমন করে পড়তে হয়?",
            en: "How is the Laam in 'Billah' recited when preceded by Kasrah?",
            ar: "كيف تُقرأ لام لفظ الجلالة المسبوقة بكسرة مثل (بِاللَّهِ)؟",
          },
          options: [
            { bn: "চিকন (বারিক) করে", en: "Thin (Muraqqaq)", ar: "ترقيق اللام" },
            { bn: "মোটা (পুর) করে", en: "Thick (Mufakhkham)", ar: "تفخيم اللام" },
            { bn: "গুন্নাহ করে", en: "With Ghunnah", ar: "بغنة" },
            { bn: "টানা নিষেধ", en: "Do not stretch", ar: "ممنوع المد" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l3-7",
        title: { bn: "লেভেল ৩ সমাপনী মূল্যায়ন পরীক্ষা", en: "Level 3 Mastery Test", ar: "اختبار إتقان المستوى الثالث" },
        arabicItems: ["أَبْ", "إِنَّ", "ثُمَّ", "أَطْ", "اللَّهِ"],
        audioSample: "https://audio.qurancdn.com/wbw/002_006_001.mp3",
        explanation: {
          bn: "সাকিন, ক্বলক্বলাহ, মীম সাকিন, ওয়াজিব গুন্নাহ ও তাশদীদের সমন্বিত মূল্যায়ন পরীক্ষা। প্রতিটি হরফের হক আদায় করে বিশুদ্ধ তিলাওয়াত করুন।",
          en: "Comprehensive assessment of Level 3 covering Sukoon, Qalqalah, Tashdeed, and Wajib Ghunnah.",
          ar: "اختبار شامل للمستوى الثالث يجمع السكون والقلقلة والميم الساكنة والشدة.",
        },
        quiz: {
          question: {
            bn: "إِنَّ শব্দটিতে কোন তাজবীদ নিয়ম প্রযোজ্য?",
            en: "Which Tajweed rule applies to the word 'إِنَّ'?",
            ar: "ما الحكم التجويدي المطبق في كلمة 'إِنَّ'؟",
          },
          options: [
            { bn: "ওয়াজিব গুন্নাহ (১ আলিফ)", en: "Wajib Ghunnah (1 Alif)", ar: "غنة واجبة بمقدار حركتين" },
            { bn: "ক্বলক্বলাহ", en: "Qalqalah", ar: "قلقلة" },
            { bn: "ইযহার", en: "Izhar", ar: "إظهار" },
            { bn: "মাদ্দে লাযিম", en: "Madd Lazim", ar: "مد لازم" },
          ],
          correctIndex: 0,
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 🟣 LEVEL 4: মাদ্দ ও পূর্ণাঙ্গ তাজবীদ (8 Lessons)
  // ─────────────────────────────────────────────────────────────
  {
    id: "module-4",
    levelId: 4,
    moduleNumber: 4,
    title: {
      bn: "৪. মাদ্দ ও পূর্ণাঙ্গ তাজবীদ",
      en: "Level 4: Madd & Comprehensive Tajweed",
      ar: "المستوى الرابع: أحكام المدود والتجويد المتقن",
    },
    desc: {
      bn: "১, ৩ ও ৪ আলিফ মাদ্দ, লীন এবং নূন সাকিন ও তানভীনের ৪টি নিয়ম (ইযহার, ইদগাম, ইক্বলাব, ইখফা)।",
      en: "1, 3 & 4 Alif elongation, Leen letters, and the 4 Noon Saakin & Tanween rules.",
      ar: "أحكام المد الطبيعي والفرعي وحروف اللين وأحكام النون الساكنة والتنوين الأربعة.",
    },
    lessons: [
      {
        id: "l4-1",
        title: { bn: "১ আলিফ মাদ্দের ৩টি হরফ (মাদ্দে আসলী)", en: "Madd Asli: 3 Elongation Letters", ar: "حروف المد الثلاثة (المد الطبيعي)" },
        arabicItems: ["بَا", "بُو", "بِي"],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/106001.mp3",
        explanation: {
          bn: "মাদ্দের হরফ ৩টি: ১. যবরের পর খালি আলিফ (বা-আলিফ 'বা'), ২. পেশের পর সাকিন ওয়াও (বা-ওয়াও 'বু'), ৩. যেরের পর সাকিন ইয়া (বা-ইয়া 'বি')। এই তিন অবস্থায় স্বাভাবিকভাবে ১ আলিফ টানতে হয়।",
          en: "Madd Asli elongates the vowel sound by 1 Alif (2 counts): Alif after Fathah, Waw after Dammah, Ya after Kasrah.",
          ar: "حروف المد ثلاثة: الألف الساكنة بعد فتح، والواو الساكنة بعد ضم، والياء الساكنة بعد كسر، وتُمد بمقدار حركتين.",
        },
        quiz: {
          question: {
            bn: "মাদ্দে আসলীতে কত আলিফ পরিমাণ টানতে হয়?",
            en: "How many counts/Alifs is Madd Asli elongated?",
            ar: "كم مقدار المد الطبيعي؟",
          },
          options: [
            { bn: "১ আলিফ (২ হরকত)", en: "1 Alif (2 counts)", ar: "ألف واحدة (حركتان)" },
            { bn: "৩ আলিফ", en: "3 Alifs", ar: "٣ ألوف" },
            { bn: "৪ আলিফ", en: "4 Alifs", ar: "٤ ألوف" },
            { bn: "টানা নিষেধ", en: "Do not stretch", ar: "ممنوع المد" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l4-2",
        title: { bn: "খাড়া যবর, খাড়া যের, উল্টা পেশ", en: "Substituted Madd Signs (Standing Vowels)", ar: "الحركات القائمة: الفتحة والكسرة القائمتان والضمة المقلوبة" },
        arabicItems: ["مٰ", "بٖ", "لٗ"],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/001004.mp3",
        explanation: {
          bn: "খাড়া যবর, খাড়া যের ও উল্টা পেশ হলো ১ আলিফ মাদ্দের বিকল্প চিহ্ন। এগুলোতেও ঠিক ১ আলিফ পরিমাণ টেনে পড়তে হয়।",
          en: "Standing Fathah, Standing Kasrah, and Inverted Dammah represent Madd Asli and are elongated by 1 Alif.",
          ar: "الفتحة القائمة والكسرة القائمة والضمة المقلوبة تُمد بمقدار حركتين كالمد الطبيعي تماماً.",
        },
        quiz: {
          question: {
            bn: "খাড়া যবর বা খাড়া যের থাকলে কতটুকু টানতে হয়?",
            en: "How much is a letter with standing Fathah or standing Kasrah elongated?",
            ar: "كم يُمَدّ الحرف الذي عليه فتحة قائمة أو كسرة قائمة؟",
          },
          options: [
            { bn: "১ আলিফ (২ হরকত)", en: "1 Alif (2 counts)", ar: "ألف واحدة (حركتان)" },
            { bn: "৩ আলিফ", en: "3 Alifs", ar: "٣ ألوف" },
            { bn: "৪ আলিফ", en: "4 Alifs", ar: "٤ ألوف" },
            { bn: "না টেনে দ্রুত", en: "Quickly without stretch", ar: "سريعاً بدون مد" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l4-3",
        title: { bn: "লীন-এর হরফ — নরম সুরে পড়া", en: "Huroof Al-Leen: Soft Dipthongs", ar: "حرفا اللين (الواو والياء الساكنتان بعد فتح)" },
        arabicItems: ["خَوْفٍ", "بَيْتٍ", "الْبَيْتِ"],
        audioSample: "https://audio.qurancdn.com/wbw/106_004_007.mp3",
        explanation: {
          bn: "যবরের পর সাকিন ওয়াও (و্) এবং যবরের পর সাকিন ইয়া (ي্) আসলে তাকে লীন বলে। এগুলোকে নরম সুরে দ্রুত স্বাভাবিক গতিতে পড়তে হয়। যেমন: খাওফ্, বাইত্।",
          en: "Leen letters: Waw or Ya with Sukoon preceded by Fathah. Recited softly without harshness or excessive stretch.",
          ar: "حرفا اللين هما الواو والياء الساكنتان المفتوح ما قبلهما، ويُنطقان برفق وسلاسة.",
        },
        quiz: {
          question: {
            bn: "লীন-এর হরফ কয়টি এবং কী কী?",
            en: "How many Leen letters are there and what are they?",
            ar: "كم عدد حروفي اللين وما هما؟",
          },
          options: [
            { bn: "২টি (যবরের পর ওয়াও সাকিন ও ইয়া সাকিন)", en: "2 letters (Waw and Ya with Sukoon after Fathah)", ar: "حرفان: الواو والياء الساكنتان بعد فتح" },
            { bn: "৩টি", en: "3 letters", ar: "٣ حروف" },
            { bn: "১টি", en: "1 letter", ar: "حرف واحد" },
            { bn: "৫টি", en: "5 letters", ar: "٥ حروف" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l4-4",
        title: { bn: "বড় মাদ্দ — ৩ ও ৪ আলিফ মাদ্দ", en: "Major Madd: 3 & 4 Alif Elongation", ar: "المدود الكبرى: المد المتصل والمنفصل واللازم" },
        arabicItems: ["جَاءَ", "بِمَا أُنزِلَ", "الضَّالِّينَ"],
        audioSample: "https://audio.qurancdn.com/wbw/110_001_002.mp3",
        explanation: {
          bn: "মাদ্দের হরফের পর একই শব্দে হামযাহ আসলে মাদ্দে মুত্তাসিল (৪ আলিফ)। পৃথক শব্দে হামযাহ আসলে মাদ্দে মুনফাসিল (৩ আলিফ)। মাদ্দের পর তাশদীদ আসলে মাদ্দে লাযিম (৪ আলিফ লম্বা)।",
          en: "Madd Muttasil (4 Alifs): Hamzah in same word. Madd Munfasil (3 Alifs): Hamzah in next word. Madd Lazim (4 Alifs): followed by Tashdeed/Sukoon.",
          ar: "المد المتصل (٤ حركات)، والمد المنفصل (٣-٤ حركات)، والمد اللازم (٦ حركات) عند وجود الشدة أو السكون الأصلي.",
        },
        quiz: {
          question: {
            bn: "মাদ্দের হরফের পর তাশদীদ আসলে (যেমন: الضَّالِّينَ) কত আলিফ টানতে হয়?",
            en: "How many Alifs is Madd Lazim elongated when followed by Tashdeed (e.g. Ad-Daalleen)?",
            ar: "كم يُمَدّ المد اللازم الكلمي المثقل في كلمة (الضَّالِّينَ)؟",
          },
          options: [
            { bn: "৪ আলিফ (৬ হরকত)", en: "4 Alifs (6 counts)", ar: "٤ ألوف (٦ حركات)" },
            { bn: "১ আলিফ", en: "1 Alif", ar: "ألف واحدة" },
            { bn: "২ আলিফ", en: "2 Alifs", ar: "ألفان" },
            { bn: "টানা নিষেধ", en: "Do not stretch", ar: "ممنوع المد" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l4-5",
        title: { bn: "নূন সাকিন ও তানভীন: ইযহার ও ইক্বলাব", en: "Noon Saakin Rules: Izhar & Iqlab", ar: "أحكام النون الساكنة: الإظهار الحلقي والإقلاب" },
        arabicItems: ["مَنْ آمَنَ", "مِن بَعْدِ", "عَذَابٌ أَلِيمٌ"],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/098004.mp3",
        explanation: {
          bn: "ইযহার: নূন সাকিন বা তানভীনের পর কণ্ঠনালীর ৬ হরফ (ء هـ ع ح غ خ) আসলে গুন্নাহ ছাড়া স্পষ্ট পড়তে হয় (যেমন: مَنْ آمَنَ, عَذَابٌ أَلِيمٌ)। ইক্বলাব: এর পর 'বা' (ب) আসলে নূনকে ছোট মীম (م) বানিয়ে ১ আলিফ গুন্নাহ করে পড়তে হয় (যেমন: مِن بَعْدِ)।",
          en: "Izhar: Recite clearly without Ghunnah before the 6 throat letters (e.g. Man Aamana, 'Azabun Aleem). Iqlab: Convert Noon into Meem with 1-Alif Ghunnah before Baa (e.g. Mim Ba'di).",
          ar: "الإظهار الحلقي عند حروف الحلق الستة بدون غنة (مثل: مَنْ آمَنَ، عَذَابٌ أَلِيمٌ)، والإقلاب قلب النون ميماً مخفاة بغنة عند حرف الباء (مثل: مِن بَعْدِ).",
        },
        quiz: {
          question: {
            bn: "নূন সাকিনের পর 'ب' (বা) আসলে কোন নিয়মে নূনটি মীমে রূপান্তরিত হয়?",
            en: "Which rule converts Noon into Meem when followed by Baa (ب)?",
            ar: "ما الحكم الذي يقلب النون الساكنة ميماً عند ملاقاتها لحرف الباء؟",
          },
          options: [
            { bn: "ইক্বলাব (الإقلاب)", en: "Iqlab", ar: "الإقلاب" },
            { bn: "ইযহার", en: "Izhar", ar: "الإظهار" },
            { bn: "ইদগাম", en: "Idgham", ar: "الإدغام" },
            { bn: "ইখফা", en: "Ikhfa", ar: "الإخفاء" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l4-6",
        title: { bn: "নূন সাকিন ও তানভীন: ইদগাম (ইয়ারমালূন)", en: "Noon Saakin Rules: Idgham (Yarmaloon)", ar: "الإدغام بغنة وبغير غنة (يرملون)" },
        arabicItems: ["مَن يَقُولُ", "مِن رَّبِّهِمْ"],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/002008.mp3",
        explanation: {
          bn: "ইয়ারমালূন (ي ر م ل و ن) এর ৬ হরফ। ي ن م و আসলে গুন্নাহসহ মিলিয়ে (ইদগামে বাগুন্নাহ), এবং ل ও ر আসলে গুন্নাহ ছাড়া মিলিয়ে (ইদগামে বেলাগুন্নাহ) পড়তে হয়।",
          en: "Idgham letters: Yarmaloon. With Ghunnah (ي ن م و), without Ghunnah (ل and ر).",
          ar: "حروف الإدغام ستة يجمعها (يرملون): بغنة في (ينمو)، وبغير غنة في (اللام والراء).",
        },
        quiz: {
          question: {
            bn: "নূন সাকিনের পর 'ر' (রা) বা 'ل' (লাম) আসলে গুন্নাহ করার বিধান কী?",
            en: "What is the rule when Noon Saakin is followed by Raa (ر) or Laam (ل)?",
            ar: "ما حكم إدغام النون الساكنة في اللام والراء؟",
          },
          options: [
            { bn: "গুন্নাহ ছাড়া মিলিয়ে পড়তে হয় (বেলাগুন্নাহ)", en: "Merge without Ghunnah", ar: "إدغام بغير غنة (كامل)" },
            { bn: "গুন্নাহ করতে হয়", en: "Merge with Ghunnah", ar: "إدغام بغنة" },
            { bn: "স্পষ্ট পড়তে হয়", en: "Recite clearly", ar: "إظহার" },
            { bn: "পড়া নিষেধ", en: "Prohibited", ar: "ممنوع" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l4-7",
        title: { bn: "নূন সাকিন ও তানভীন: ইখফা (১৫ হরফ)", en: "Noon Saakin Rules: Ikhfa (15 Letters)", ar: "الإخفاء الحقيقي في خمسة عشر حرفاً" },
        arabicItems: ["مِن قَبْلُ", "أَنتُمْ", "مِن دُونِ"],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/109003.mp3",
        explanation: {
          bn: "ইযহার, ইদগাম ও ইক্বলাবের হরফ বাদ দিয়ে বাকি ১৫ হরফে নূন সাকিন বা তানভীনের আওয়াজ নাকের বাঁশিতে লুকিয়ে ১ আলিফ সময় নিয়ে কোমল গুন্নাহ করতে হয়।",
          en: "Ikhfa: Conceal the Noon sound into the nasal passage with a soft 1-Alif Ghunnah before the remaining 15 letters.",
          ar: "الإخفاء الحقيقي نطق النون الساكنة بحالة بين الإظهار والإدغام مع بقاء الغنة في ١٥ حرفاً.",
        },
        quiz: {
          question: {
            bn: "নূন সাকিন ও তানভীনের ইখফার হরফ মোট কয়টি?",
            en: "How many letters of Ikhfa are there?",
            ar: "كم عدد حروف الإخفاء الحقيقي؟",
          },
          options: [
            { bn: "১৫টি", en: "15 letters", ar: "١٥ حرفاً" },
            { bn: "৬টি", en: "6 letters", ar: "٦ حروف" },
            { bn: "৪টি", en: "4 letters", ar: "٤ حروف" },
            { bn: "১টি", en: "1 letter", ar: "حرف واحد" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l4-8",
        title: { bn: "লেভেল ৪ সমাপনী তাজবীদ পরীক্ষা", en: "Level 4 Mastery Test", ar: "اختبار إتقان المستوى الرابع" },
        arabicItems: ["مَن يَقُولُ", "مِن بَعْدِ", "جَاءَ", "مِن قَبْلُ", "الضَّالِّينَ"],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/001007.mp3",
        explanation: {
          bn: "মাশাআল্লাহ! আপনি পূর্ণাঙ্গ তাজবীদ ও মাদ্দের নিয়ম সমাপ্ত করেছেন। সমন্বিত সমাপনী পরীক্ষা সম্পন্ন করে সরাসরি কুরআন তিলাওয়াতের লেভেলে প্রবেশ করুন।",
          en: "Mastery test of Level 4 covering Madd and all 4 Noon Saakin & Tanween rules.",
          ar: "اختبار شامل للمستوى الرابع يتحقق من إتقان المدود وأحكام النون والتنوين كاملة.",
        },
        quiz: {
          question: {
            bn: "নূন সাকিনের ৪টি নিয়মের নাম কী কী?",
            en: "What are the names of the 4 Noon Saakin rules?",
            ar: "ما هي أحكام النون الساكنة والتنوين الأربعة؟",
          },
          options: [
            { bn: "ইযহার, ইদগাম, ইক্বলাব, ইখফা", en: "Izhar, Idgham, Iqlab, Ikhfa", ar: "الإظهار والإدغام والإقلاب والإخفاء" },
            { bn: "ক্বলক্বলাহ ও মাদ্দ", en: "Qalqalah and Madd", ar: "قلقلة ومد" },
            { bn: "যবর, যের ও পেশ", en: "Short vowels", ar: "حركات قصيرة" },
            { bn: "ওয়াক্ফ ও ইবতিদা", en: "Stopping & starting", ar: "وقف وابتداء" },
          ],
          correctIndex: 0,
        },
      },
    ],
  },

  // 👑 LEVEL 5: সরাসরি কুরআন পাঠ, ওয়াক্ফ ও সূরা মাশক (8 Lessons)
  // ─────────────────────────────────────────────────────────────
  {
    id: "module-5",
    levelId: 5,
    moduleNumber: 5,
    title: {
      bn: "৫. সরাসরি কুরআন পাঠ, ওয়াক্ফ ও সূরা মাশক",
      en: "Level 5: Quran Reading, Waqf & Surah Mastery",
      ar: "المستوى الخامس: تلاوة القرآن والوقف ومرد السور",
    },
    desc: {
      bn: "আয়াতের শেষে থামার কায়দা (ওয়াক্ফ), সূরা আল-ফাতিহা, সূরা আল-ইখলাস, আল-ফালাক্ব, আন্-নাস ও আয়াতুল কুরসী।",
      en: "Rules of stopping (Waqf), recitation of Surah Al-Fatiha, short Surahs, and Ayatul Kursi.",
      ar: "أحكام الوقف والابتداء وتلاوة سورة الفاتحة والإخلاص والفلق والناس وآية الكرسي.",
    },
    lessons: [
      {
        id: "l5-1",
        title: { bn: "ওয়াক্ফ ও ইবতিদার নিয়মাবলী", en: "Rules of Waqf (Stopping) & Starting", ar: "أحكام الوقف والابتداء في القرآن" },
        arabicItems: ["الْعَالَمِينَ", "مُسْتَقِيمٍ", "أَحَدٌ", "رَحِيمٌ"],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/001002.mp3",
        explanation: {
          bn: "আয়াতের শেষে থামার কায়দা: শেষ অক্ষরের হরকত সাকিন হয়ে যায় (যেমন: আল-আলামীনা -> আল-আলামীন)। দুই যবর থাকলে ১ আলিফ মাদ্দ হয়। গোল তা (ة) হে (ه্) হয়ে যায়।",
          en: "Rules of stopping: vowels become Sukoon at verse ends, double Fathah becomes 1 Alif Madd, Ta Marbuta (ة) becomes Haa (ه).",
          ar: "عند الوقف يُسكَّن الحرف الأخير، والتنوين المنصوب يُبدل ألفاً مدية، والتاء المربوطة تُنطق هاءً ساكنة.",
        },
        quiz: {
          question: {
            bn: "আয়াতের শেষে দুই যের বা দুই পেশ থাকলে ওয়াক্ফ (থামার) সময় কী করতে হয়?",
            en: "What happens when stopping on double Kasrah or double Dammah?",
            ar: "ماذا نفعل عند الوقف على كلمة آخرها تنوين بالكسر أو الضم؟",
          },
          options: [
            { bn: "শেষ হরফকে সাকিন (জযম) করতে হয়", en: "Make the final letter silent (Sukoon)", ar: "تسكين الحرف الأخير" },
            { bn: "দুই পেশ পড়তে হয়", en: "Read double Dammah", ar: "قراءة التنوين" },
            { bn: "১ আলিফ টানতে হয়", en: "Stretch 1 Alif", ar: "مد ألف" },
            { bn: "পড়া বন্ধ করা যায় না", en: "Cannot stop", ar: "لا يجوز الوقف" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l5-2",
        title: { bn: "সূরা আল-ফাতিহা — অংশ ১ (আয়াত ১-৪)", en: "Surah Al-Fatiha Part 1 (Verses 1-4)", ar: "سورة الفاتحة (الجزء الأول: الآيات ١-٤)" },
        arabicItems: [
          "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
          "الرَّحْمَٰنِ الرَّحِيمِ",
          "مَالِكِ يَوْمِ الدِّينِ",
        ],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/001001.mp3",
        explanation: {
          bn: "উম্মুল কুরআন — প্রতি শব্দে সঠিক মাখরাজ (হা, আইন), লামের বারিক উচ্চারণ ও ওয়াক্ফের কায়দা অনুসরণ করে ক্বারীর সাথে তিলাওয়াত করুন।",
          en: "Recite the opening 4 verses of Surah Al-Fatiha with pristine articulation and proper Waqf stopping.",
          ar: "تلاوة الآيات الأربع الأولى من أم الكتاب بمراعاة مخارج الحروف والترقيق والوقف الصحيح.",
        },
        quiz: {
          question: {
            bn: "সূরা আল-ফাতিহার দ্বিতীয় আয়াত কোনটি?",
            en: "Which verse is the second Ayah of Surah Al-Fatiha?",
            ar: "ما هي الآية الثانية من سورة الفاتحة؟",
          },
          options: [
            "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
            "بِسْمِ اللَّهِ",
            "الرَّحْمَٰنِ الرَّحِيمِ",
            "مَالِكِ يَوْمِ الدِّينِ",
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l5-3",
        title: { bn: "সূরা আল-ফাতিহা — অংশ ২ (আয়াত ৫-৭)", en: "Surah Al-Fatiha Part 2 (Verses 5-7)", ar: "سورة الفاتحة (الجزء الثاني: الآيات ٥-٧)" },
        arabicItems: [
          "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
          "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
          "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        ],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/001005.mp3",
        explanation: {
          bn: "দোয়া ও মোনাজাত: إِيَّاكَ-তে তাশদীদ শক্ত রাখা, الضَّالِّينَ-তে ৪ আলিফ মাদ্দে লাযিম ও লামে তাশদীদ দেওয়া।",
          en: "Complete Surah Al-Fatiha: maintain firm Tashdeed on Iyyaka, and 4-Alif Madd Lazim on Ad-Daalleen.",
          ar: "إكمال سورة الفاتحة مع مراعاة تشديد الياء في إياك، والمد اللازم ٦ حركات في الضالين.",
        },
        quiz: {
          question: {
            bn: "وَلَا الضَّالِّينَ শব্দটিতে মাদ্দ কত আলিফ টানতে হয়?",
            en: "How many Alifs is the Madd in 'Ad-Daalleen' elongated?",
            ar: "كم مقدار المد اللازم في كلمة (الضالين)؟",
          },
          options: [
            { bn: "৪ আলিফ (৬ হরকত)", en: "4 Alifs (6 counts)", ar: "٤ ألوف (٦ حركات)" },
            { bn: "১ আলিফ", en: "1 Alif", ar: "ألف واحدة" },
            { bn: "২ আলিফ", en: "2 Alifs", ar: "ألفان" },
            { bn: "টানা নিষেধ", en: "Do not stretch", ar: "ممنوع المد" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l5-4",
        title: { bn: "সূরা আল-ইখলাস — তাওহীদের পাঠ", en: "Surah Al-Ikhlas: The Monotheism", ar: "سورة الإخلاص: عقيدة التوحيد" },
        arabicItems: [
          "قُلْ هُوَ اللَّهُ أَحَدٌ",
          "اللَّهُ الصَّمَدُ",
          "لَمْ يَلِدْ وَلَمْ يُولَدْ",
          "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
        ],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/112001.mp3",
        explanation: {
          bn: "তাওহীদের নির্যাস: প্রতি আয়াতের শেষে দাল (د)-এ সুন্দর ক্বলক্বলাহ ও ওয়াক্ফের চমৎকার প্রয়োগ করুন।",
          en: "Surah Al-Ikhlas: practice clear Qalqalah rebound on the final Dal (د) of every single verse.",
          ar: "سورة الإخلاص: تطبيق القلقلة الواضحة عند الوقف على حرف الدال في نهاية كل آية.",
        },
        quiz: {
          question: {
            bn: "সূরা আল-ইখলাসের প্রতিটি আয়াতের শেষ অক্ষরে কোন তাজবীদ গুণ প্রকাশ পায়?",
            en: "Which Tajweed characteristic shines at the end of every Ayah in Surah Al-Ikhlas?",
            ar: "ما هي الصفة التجويدية البارزة في نهاية كل آية من سورة الإخلاص؟",
          },
          options: [
            { bn: "দাল হরফে ক্বলক্বলাহ (ধাক্কা/প্রতিধ্বনি)", en: "Qalqalah bounce on Dal", ar: "قلقلة حرف الدال عند الوقف" },
            { bn: "ইখফা", en: "Ikhfa", ar: "إخفاء" },
            { bn: "ইদগাম", en: "Idgham", ar: "إدغام" },
            { bn: "মাদ্দে মুনফাসিল", en: "Madd Munfasil", ar: "مد منفصل" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l5-5",
        title: { bn: "সূরা আল-ফালাক্ব — অনিষ্ট থেকে আশ্রয়", en: "Surah Al-Falaq: Seeking Refuge", ar: "سورة الفلق: الاستعاذة من الشرور" },
        arabicItems: [
          "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
          "مِن شَرِّ مَا خَلَقَ",
          "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
          "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
          "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
        ],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/113001.mp3",
        explanation: {
          bn: "ক্বাফ (ق), বা (ب) ও দাল (د)-এর জোরদার ক্বলক্বলাহ এবং مِن شَرِّ-তে সুন্দর ইখফার গুন্নাহ মাশক করুন।",
          en: "Surah Al-Falaq: practice Qalqalah on Qaaf, Baa, and Dal, alongside gentle Ikhfa in 'min sharri'.",
          ar: "سورة الفلق: إتقان القلقلة في القاف والباء والدال، والإخفاء الحقيقي في (من شر).",
        },
        quiz: {
          question: {
            bn: "مِن شَرِّ শব্দটিতে নূন সাকিনের পর শিন (ش) আসায় কোন নিয়ম প্রযোজ্য?",
            en: "What rule applies in 'min sharri' where Noon Saakin meets Sheen (ش)?",
            ar: "ما حكم النون الساكنة عند حرف الشين في (مِن شَرِّ)؟",
          },
          options: [
            { bn: "ইখফা (গুন্নাহ করে লুকিয়ে পড়া)", en: "Ikhfa (nasal concealment)", ar: "إخفاء حقيقي بغنة" },
            { bn: "ইযহার", en: "Izhar", ar: "إظهار" },
            { bn: "ইক্বলাব", en: "Iqlab", ar: "إقلاب" },
            { bn: "ক্বলক্বলাহ", en: "Qalqalah", ar: "قلقلة" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l5-6",
        title: { bn: "সূরা আন্-নাস — শয়তানের প্ররোচনা থেকে পানাহ", en: "Surah An-Nas: Refuge from Whispers", ar: "سورة الناس: الاستعاذة من الوسواس" },
        arabicItems: [
          "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
          "مَلِكِ النَّاسِ",
          "إِلَٰهِ النَّاسِ",
          "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
          "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
          "مِنَ الْجِنَّةِ وَالنَّاسِ",
        ],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/114001.mp3",
        explanation: {
          bn: "النَّاسِ (আন্-নাস)-এ প্রতিবার মিষ্টি ১ আলিফ ওয়াজিব গুন্নাহ এবং শেষে সিন হরফে শিষ দিয়ে ওয়াক্ফ করুন।",
          en: "Surah An-Nas: master consistent Wajib Ghunnah on An-Naas and crisp sibilant Seen stopping.",
          ar: "سورة الناس: إتقان الغنة الواجبة في النون المشددة والصفير الصافي في حرف السين عند الوقف.",
        },
        quiz: {
          question: {
            bn: "النَّاسِ শব্দটিতে তাশদীদযুক্ত নূন থাকায় কী করা ওয়াজিব?",
            en: "What is mandatory on the doubled Noon in 'An-Naas'?",
            ar: "ما هو الحكم الواجب في النون المشددة في كلمة (الناس)؟",
          },
          options: [
            { bn: "১ আলিফ ওয়াজিব গুন্নাহ করা", en: "Mandatory 1-Alif Ghunnah", ar: "غنة واجبة بمقدار حركتين" },
            { bn: "কলকলাহ", en: "Qalqalah", ar: "قلقلة" },
            { bn: "টানা নিষেধ", en: "Do not stretch", ar: "ممنوع المد" },
            { bn: "ইযহার", en: "Izhar", ar: "إظهار" },
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l5-7",
        title: { bn: "আয়াতুল কুরসী — নির্বাচিত অংশ", en: "Ayatul Kursi: Master Passage", ar: "آية الكرسي: أعظم آيات القرآن" },
        arabicItems: [
          "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
          "لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
          "لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ",
        ],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/002255.mp3",
        explanation: {
          bn: "কুরআনের সর্বশ্রেষ্ঠ আয়াত: দীর্ঘ বাক্য সাবলীলভাবে পড়ার দক্ষতা এবং শ্বাস ও ওয়াক্ফের সমন্বয় সাধন করুন।",
          en: "Ayatul Kursi: build fluency in long, majestic Quranic phrases with proper breath control and Tajweed.",
          ar: "آية الكرسي: إتقان التلاوة المتواصلة للآيات الكبرى مع التحكم في النفس والوقف.",
        },
        quiz: {
          question: {
            bn: "আয়াতুল কুরসীর সূচনা কোন মহিমান্বিত বাক্য দিয়ে শুরু হয়েছে?",
            en: "Which magnificent sentence begins Ayatul Kursi?",
            ar: "بأي جملة جليلة تبدأ آية الكرسي؟",
          },
          options: [
            "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
            "قُلْ هُوَ اللَّهُ أَحَدٌ",
            "الْحَمْدُ لِلَّهِ",
            "إِنَّا أَعْطَيْنَاكَ",
          ],
          correctIndex: 0,
        },
      },
      {
        id: "l5-8",
        title: { bn: "কোর্স সমাপ্তির চূড়ান্ত পরীক্ষা ও প্রশংসাপত্র", en: "Graduation Final Exam & Certificate", ar: "الامتحان النهائي وشهادة إتمام الدورة" },
        arabicItems: [
          "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          "قُلْ هُوَ اللَّهُ أَحَدٌ",
          "اللَّهُ الصَّمَدُ",
          "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        ],
        audioSample: "https://everyayah.com/data/Alafasy_128kbps/001001.mp3",
        explanation: {
          bn: "মাশাআল্লাহ! আপনি সফলভাবে ৩৫টি পাঠের কুরআন শিক্ষা সফর সমাপ্ত করেছেন। সমাপনী পরীক্ষায় অংশ নিয়ে আপনার প্রশংসাপত্র অর্জন করুন।",
          en: "MashaAllah! You have completed all 35 lessons. Complete the graduation assessment to earn your digital Certificate of Completion.",
          ar: "ما شاء الله! لقد أتممت الدروس الـ٣٥ كاملة. أجرِ الاختبار النهائي لتحصل على شهادة إتمام الدورة.",
        },
        quiz: {
          question: {
            bn: "কুরআন তিলাওয়াতের ক্ষেত্রে সর্বপ্রথম কোন বিষয়ের প্রতি সর্বাধিক সতর্কতা রাখা আবশ্যক?",
            en: "What requires the highest vigilance during Quranic recitation?",
            ar: "ما هو الأمر الأكثر أهمية ووجوباً عند تلاوة القرآن الكريم؟",
          },
          options: [
            { bn: "সঠিক মাখরাজ ও তাজবীদের বিশুদ্ধ নিয়মাবলী রক্ষা করা", en: "Preserving correct Makharij and Tajweed rules", ar: "مراعاة المخارج الصحيحة وقواعد التجويد" },
            { bn: "অতি দ্রুত তিলাওয়াত করা", en: "Reciting very quickly", ar: "القراءة بسرعة بالغة" },
            { bn: "না বুঝে অতিরিক্ত টানা", en: "Unnecessary over-stretching", ar: "التمطيط الزائد" },
            { bn: "অক্ষর বাদ দেওয়া", en: "Omitting letters", ar: "إسقاط الحروف" },
          ],
          correctIndex: 0,
        },
      },
    ],
  },
];
