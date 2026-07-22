export const DEPARTMENT_SELECTION_OPTIONS = [
  "সকল",
  "নূরানী",
  "নাজেরা",
  "হিফয",
  "হিফয শুনানি",
  "কিতাবখানা",
  "মাদানী নেসাব",
  "কিন্ডারগার্টেন",
  "ইংলিশ ভার্সন",
];

export const STUDY_SESSION_OPTIONS = [
  "নূরানী",
  "নাজেরা",
  "হিফয",
  "হিফয শুনানি",
  "কিতাবখানা",
  "মাদানী নেসাব",
  "কিন্ডারগার্টেন",
  "ইংলিশ ভার্সন",
];

export const GALLERY_SELECTION_OPTIONS = [...DEPARTMENT_SELECTION_OPTIONS.filter(d => d !== "সকল"), "সাধারণ"];

const BASE_KEYWORDS = [
  "রহমানিয়া ইনস্টিটিউট",
  "Rahmania Institute (রহমানিয়া ইনস্টিটিউট)",
  "Noorani Education",
  "Islamic Institute Bangladesh",
  "Hifz Madrasa",
  "Najera Quran Learning",
  "Islamic Kindergarten",
  "Quran Education",
  "Bangladesh Madrasa",
  "Arabic Learning",
  "Islamic School",
  "تعليم القرآن",
  "معهد إسلامي",
];

export const DEPARTMENT_PAGES = [
  {
    slug: "noorani",
    route: "/departments/noorani",
    departmentKey: "নূরানী",
    aliases: ["নূরানী", "Noorani", "noorani", "نوراني"],
    shortLabel: "নূরানী",
    title: "নূরানী বিভাগ",
    subtitle: "বিস্তারিত দেখুন",
    titleEn: "Noorani Department",
    titleAr: "قسم نوراني",
    badge: "Noorani Education",
    badgeBn: "নূরানী শিক্ষা",
    badgeAr: "تعليم نوراني",
    heroQuote: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
    heroReference: "সুরা আলাক, আয়াত ১",
    heroAyatTranslation: "পড়ো তোমার প্রতিপালকের নামে যিনি সৃষ্টি করেছেন",
    longDescription: `শিশুদের কুরআন, আদব ও আধুনিক শিক্ষার সুন্দর সূচনা

রহমানিয়া ইনস্টিটিউটের নূরানী বিভাগে কোমলমতি শিশুদের জন্য গড়ে তোলা হয়েছে একটি আদর্শ ইসলামিক ও আধুনিক শিক্ষাব্যবস্থা, যেখানে দ্বীনি শিক্ষা, নৈতিকতা এবং প্রাথমিক একাডেমিক শিক্ষার সমন্বয়ে প্রতিটি শিশুকে ভবিষ্যতের জন্য যোগ্য ও আত্মবিশ্বাসী হিসেবে গড়ে তোলা হয়।

এখানে শিশুদের শুদ্ধ তিলাওয়াত, তাজবিদসহ কুরআন শিক্ষা, দৈনন্দিন দোয়া, সুন্নাহ, ইসলামী আদব-আখলাক এবং চরিত্র গঠনের উপর বিশেষ গুরুত্ব প্রদান করা হয়। একই সাথে বাংলা, English ও Arabic ভাষার প্রাথমিক দক্ষতা এমনভাবে শেখানো হয় যাতে শিক্ষার্থীরা ছোটবেলা থেকেই দ্বীনি ও দুনিয়াবি জ্ঞানের ভারসাম্যপূর্ণ ভিত্তি অর্জন করতে পারে।`,
    longDescription2: `আধুনিক স্মার্ট ডিজিটাল ক্লাসরুম, শিশু মনোবিজ্ঞানভিত্তিক পাঠদান, অভিজ্ঞ ও স্নেহশীল শিক্ষক এবং নিয়মিত মূল্যায়নের মাধ্যমে প্রতিটি শিক্ষার্থীর প্রতি নিবিড় যত্ন নেওয়া হয়। নিরাপদ, পরিচ্ছন্ন ও সম্পূর্ণ ইসলামিক পরিবেশ শিশুদের শেখাকে আনন্দময় ও কার্যকর করে তোলে।`,
    specialFeatures: [
      "তাজবিদসহ শুদ্ধ কুরআন শিক্ষা",
      "শিশুদের ইসলামী আদর্শ ও সুন্দর আখলাক গঠন",
      "বাংলা, English ও Arabic সমন্বিত পাঠদান",
      "স্মার্ট ডিজিটাল ও মাল্টিমিডিয়া ক্লাসরুম",
      "নিয়মিত হোমওয়ার্ক, মূল্যায়ন ও মনিটরিং",
      "অভিভাবকদের জন্য শিক্ষার্থীর অগ্রগতি রিপোর্ট",
      "শিশুদের মানসিক, নৈতিক ও আত্মিক বিকাশে গুরুত্ব",
      "সম্পূর্ণ নিরাপদ, পরিচ্ছন্ন ও ইসলামিক পরিবেশ",
    ],
    heroAyatTranslationEn: "Read in the name of your Lord who created",
    heroAyatTranslationAr: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
    heroReferenceEn: "Surah Al-Alaq, Verse 1",
    heroReferenceAr: "سورة العلق، الآية ١",
    longDescriptionEn: `A Beautiful Beginning of Quran, Etiquette & Modern Education

The Noorani department at Rahmania Institute (রহমানিয়া ইনস্টিটিউট) provides an ideal Islamic and modern education system for young children, combining religious education, morality, and basic academic learning to nurture each child into a confident and capable individual.

Children receive special emphasis on proper Quran recitation with Tajweed, daily duas, Sunnah, Islamic manners, and character building. At the same time, foundational skills in Bangla, English, and Arabic are taught in a way that helps students build a balanced foundation of both religious and worldly knowledge from an early age.`,
    longDescription2En: `Modern smart digital classrooms, child psychology-based teaching methods, experienced and caring teachers, and regular assessments ensure personalized attention for every student. A safe, clean, and fully Islamic environment makes learning enjoyable and effective for children.`,
    specialFeaturesEn: [
      "Pure Quran education with Tajweed",
      "Islamic values and moral character building",
      "Integrated Bangla, English & Arabic instruction",
      "Smart digital & multimedia classrooms",
      "Regular homework, assessment & monitoring",
      "Progress reports for parents",
      "Focus on mental, moral & spiritual development",
      "Fully safe, clean & Islamic environment",
    ],
    longDescriptionAr: `بداية جميلة للقرآن والآداب والتعليم الحديث

يقدم قسم نوراني في معهد الرحمانية نظامًا تعليميًا إسلاميًا وحديثًا مثاليًا للأطفال الصغار، يجمع بين التعليم الديني والأخلاقي والتعليم الأكاديمي الأساسي لتنشئة كل طفل ليكون واثقًا وقادرًا على مواجهة المستقبل.

يحظى الأطفال بتركيز خاص على تلاوة القرآن الصحيحة مع التجويد، والأدعية اليومية، والسنة، والآداب الإسلامية، وبناء الشخصية. في الوقت نفسه، يتم تدريس المهارات الأساسية في البنغالية والإنجليزية والعربية بطريقة تساعد الطلاب على بناء أساس متوازن من المعرفة الدينية والدنيوية منذ سن مبكرة.`,
    longDescription2Ar: `توفر الفصول الدراسية الذكية الحديثة، وطرق التدريس القائمة على علم نفس الطفل، والمعلمون ذوو الخبرة والمحبون، والتقييمات المنتظمة اهتمامًا شخصيًا لكل طالب. البيئة الآمنة والنظيفة والإسلامية بالكامل تجعل التعلم ممتعًا وفعالاً للأطفال.`,
    specialFeaturesAr: [
      "تعليم القرآن الخالص مع التجويد",
      "بناء القيم الإسلامية والأخلاق الحميدة",
      "تعليم متكامل بالبنغالية والإنجليزية والعربية",
      "فصول دراسية ذكية ووسائط متعددة",
      "واجبات منزلية وتقييم ومتابعة منتظمة",
      "تقارير تقدم لأولياء الأمور",
      "التركيز على النمو العقلي والأخلاقي والروحي",
      "بيئة آمنة ونظيفة وإسلامية بالكامل",
    ],
    description:
      "রহমানিয়া ইনস্টিটিউটের নূরানী বিভাগে কোমলমতি শিশুদের জন্য গড়ে তোলা হয়েছে একটি আধুনিক, ইসলামিক ও আদর্শভিত্তিক শিক্ষাব্যবস্থা। এখানে শিশুদেরকে শুদ্ধ তিলাওয়াত, তাজবিদ, ইসলামী আচার-আচরণ, দোয়া-সুন্নাহর পাশাপাশি বাংলা, English ও Arabic শিক্ষার সমন্বয়ে এমনভাবে গড়ে তোলা হয় যাতে তারা দ্বীনি ও দুনিয়াবি শিক্ষায় সমান দক্ষতা অর্জন করতে পারে। অভিজ্ঞ শিক্ষক, স্মার্ট মনিটরিং এবং ডিজিটাল ক্লাসরুমের মাধ্যমে প্রতিটি শিক্ষার্থীর প্রতি বিশেষ যত্ন নেওয়া হয়।",
    seoDescription:
      "রহমানিয়া ইনস্টিটিউটের নূরানী বিভাগে Noorani Education, Quran Education, Tajweed, Bangla-English-Arabic foundation ও Islamic School পরিবেশে শিশুদের আদর্শ ভিত্তি গড়ে তোলা হয়।",
    features: [
      "তাজবিদসহ শুদ্ধ কুরআন শিক্ষা",
      "ইসলামী আদর্শ ও আখলাক গঠন",
      "আধুনিক স্মার্ট ডিজিটাল ক্লাসরুম",
      "বাংলা, English ও Arabic সমন্বিত শিক্ষা",
      "স্মার্ট মনিটরিং ও অভিভাবক আপডেট সিস্টেম",
      "ছোটদের জন্য আনন্দময় ও নিরাপদ শিক্ষার পরিবেশ",
    ],
    audience: "শিশুদের প্রাথমিক কুরআন শিক্ষা",
    outcomes: [
      "সুন্দর মাখরাজ ও সহীহ তিলাওয়াতের ভিত্তি",
      "দৈনন্দিন দোয়া, আদব ও ইসলামিক চরিত্র গঠন",
      "বাংলা, English ও Arabic literacy support",
    ],
    stats: [
      { value: "100%", label: "তাজবিদভিত্তিক ফাউন্ডেশন" },
      { value: "3 ভাষা", label: "Bangla, English, Arabic support" },
      { value: "Smart", label: "Classroom monitoring" },
    ],
    keywords: [...BASE_KEYWORDS, "নূরানী", "Noorani Department", "তাজবিদ শিক্ষা"],
    colors: {
      primary: "#128C7E",
      secondary: "#1B5E20",
      surface: "#F3F7F5",
      glow: "rgba(18, 140, 126, 0.18)",
      border: "#D5E5DB",
      chip: "#E8F5E9",
      chipText: "#1B5E20",
    },
  },
  {
    slug: "najera",
    route: "/departments/najera",
    departmentKey: "নাজেরা",
    aliases: ["নাজেরা", "Nazera", "nazera", "ناظرة"],
    shortLabel: "নাজেরা",
    title: "নাজেরা বিভাগ",
    subtitle: "বিস্তারিত দেখুন",
    titleEn: "Najera Department",
    titleAr: "قسم ناظرة",
    badge: "Najera Quran Learning",
    badgeBn: "নাজেরা কুরআন শিক্ষা",
    badgeAr: "تعليم ناظرة",
    heroQuote: "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا",
    heroReference: "সুরা মুয্‌যাম্মিল, আয়াত ৪",
    heroAyatTranslation: "আর কুরআন আবৃত্তি করো ধীরে ধীরে স্পষ্টভাবে",
    longDescription: `সহীহ তিলাওয়াত ও সুন্দর কুরআন শিক্ষার নির্ভরযোগ্য প্রতিষ্ঠান

রহমানিয়া ইনস্টিটিউটের নাজেরা বিভাগে সহীহ তিলাওয়াত, শুদ্ধ মাখরাজ এবং তাজবিদের নিয়ম অনুসরণ করে কুরআন শিক্ষা প্রদান করা হয়। দক্ষ ক্বারী, অভিজ্ঞ শিক্ষক ও আধুনিক পাঠদান পদ্ধতির মাধ্যমে শিক্ষার্থীদের ধাপে ধাপে এমনভাবে প্রশিক্ষণ দেওয়া হয় যাতে তারা নির্ভুল, সাবলীল ও হৃদয়গ্রাহী তিলাওয়াতে পারদর্শী হয়ে উঠতে পারে।

শুধু কুরআন পড়ানোই নয়, বরং কুরআনের প্রতি ভালোবাসা সৃষ্টি, ইসলামী মূল্যবোধ গঠন এবং আমলভিত্তিক জীবন তৈরির দিকেও বিশেষ গুরুত্ব দেওয়া হয়। প্রতিটি শিক্ষার্থীর উচ্চারণ, মাখরাজ ও তিলাওয়াত ব্যক্তিগতভাবে পর্যবেক্ষণ করে ভুল সংশোধনের ব্যবস্থা রাখা হয়েছে।`,
    longDescription2: `ইসলামিক পরিবেশ, আধুনিক প্রযুক্তিনির্ভর পাঠদান ও নিয়মিত শুনানি শিক্ষার্থীদের কুরআন শিক্ষাকে আরও সহজ, সুন্দর ও ফলপ্রসূ করে তোলে।`,
    specialFeatures: [
      "সহীহ তিলাওয়াত ও তাজবিদ শিক্ষা",
      "শুদ্ধ মাখরাজ ও উচ্চারণ সংশোধন",
      "অভিজ্ঞ ক্বারী ও প্রশিক্ষিত শিক্ষক মন্ডলী",
      "Arabic, বাংলা ও English সমন্বিত পাঠদান",
      "স্মার্ট ডিজিটাল ক্লাসরুম সুবিধা",
      "ইসলামী দোয়া, সুন্নাহ ও আদব শিক্ষা",
      "নিয়মিত শুনানি ও তিলাওয়াত মূল্যায়ন",
      "প্রতিটি শিক্ষার্থীর জন্য ব্যক্তিগত মনিটরিং ব্যবস্থা",
    ],
    heroAyatTranslationEn: "And recite the Quran with measured recitation",
    heroAyatTranslationAr: "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا",
    heroReferenceEn: "Surah Al-Muzzammil, Verse 4",
    heroReferenceAr: "سورة المزمل، الآية ٤",
    longDescriptionEn: `The Reliable Institution for Correct Recitation & Beautiful Quran Learning

The Najera department at Rahmania Institute (রহমানিয়া ইনস্টিটিউট) provides Quran education following proper recitation, correct Makhraj, and Tajweed rules. Through skilled Qaris, experienced teachers, and modern teaching methods, students are trained step by step to become proficient in accurate, fluent, and heart-touching recitation.

Beyond just teaching Quran reading, special emphasis is placed on creating love for the Quran, building Islamic values, and developing an action-oriented life. Each student's pronunciation, Makhraj, and recitation are personally monitored to correct mistakes.`,
    longDescription2En: `An Islamic environment, technology-driven teaching, and regular listening sessions make Quran learning easier, more beautiful, and more productive for students.`,
    specialFeaturesEn: [
      "Correct recitation & Tajweed education",
      "Proper Makhraj & pronunciation correction",
      "Skilled Qari & trained teaching staff",
      "Integrated Arabic, Bangla & English instruction",
      "Smart digital classroom facilities",
      "Islamic duas, Sunnah & etiquette education",
      "Regular listening & recitation assessment",
      "Personal monitoring system for each student",
    ],
    longDescriptionAr: `المؤسسة الموثوقة للتلاوة الصحيحة وتعلم القرآن الجميل

يقدم قسم ناظرة في معهد الرحمانية تعليم القرآن وفقًا لقواعد التلاوة الصحيحة والمخارج والتجويد. من خلال قراء ماهرين ومعلمين ذوي خبرة وطرق تدريس حديثة، يتم تدريب الطلاب خطوة بخطوة ليصبحوا بارعين في التلاوة الدقيقة والطلقة والمؤثرة.

إلى جانب تعليم قراءة القرآن، يتم التركيز بشكل خاص على غرس حب القرآن وبناء القيم الإسلامية وتطوير حياة قائمة على العمل. يتم مراقبة نطق كل طالب ومخرجه وتلاوته شخصيًا لتصحيح الأخطاء.`,
    longDescription2Ar: `البيئة الإسلامية، والتدريس القائم على التكنولوجيا، وجلسات الاستماع المنتظمة تجعل تعلم القرآن أسهل وأجمل وأكثر إنتاجية للطلاب.`,
    specialFeaturesAr: [
      "تعليم التلاوة الصحيحة والتجويد",
      "تصحيح المخارج والنطق السليم",
      "قراء ماهرون وهيئة تدريس مدربة",
      "تعليم متكامل بالعربية والبنغالية والإنجليزية",
      "مرافق الفصول الذكية الرقمية",
      "تعليم الأدعية والسنة والآداب الإسلامية",
      "تقييم منتظم للاستماع والتلاوة",
      "نظام متابعة شخصي لكل طالب",
    ],
    description:
      "রহমানিয়া ইনস্টিটিউটের নাজেরা বিভাগে শিক্ষার্থীদের সহীহ তিলাওয়াত, মাখরাজ ও তাজবিদের মাধ্যমে শুদ্ধভাবে কুরআন তিলাওয়াত শেখানো হয়। অভিজ্ঞ ক্বারী ও প্রশিক্ষিত শিক্ষকদের তত্ত্বাবধানে প্রতিটি শিক্ষার্থীকে ধীরে ধীরে সাবলীল ও সুন্দর কুরআন পাঠে দক্ষ করে তোলা হয়। আধুনিক ডিজিটাল ক্লাসরুম, ইসলামী পরিবেশ এবং নিয়মিত অনুশীলনের মাধ্যমে শিক্ষার্থীদের মাঝে কুরআনের প্রতি ভালোবাসা সৃষ্টি করা হয়।",
    seoDescription:
      "Rahmania Institute (রহমানিয়া ইনস্টিটিউট)-এর নাজেরা বিভাগে Najera Quran Learning, Tajweed, Makhraj, Arabic Learning এবং Islamic Institute Bangladesh মানের সমন্বিত পাঠদান করা হয়।",
    features: [
      "সহীহ তিলাওয়াত ও তাজবিদ শিক্ষা",
      "শুদ্ধ মাখরাজ ও উচ্চারণ প্রশিক্ষণ",
      "আরবি, বাংলা ও English সমন্বিত পাঠদান",
      "আধুনিক ডিজিটাল ক্লাসরুম সুবিধা",
      "ইসলামী দোয়া, সুন্নাহ ও আখলাক শিক্ষা",
      "নিয়মিত তিলাওয়াত মূল্যায়ন ব্যবস্থা",
    ],
    audience: "সহীহ তিলাওয়াত ও সাবলীল কুরআন পাঠ",
    outcomes: [
      "মাখরাজভিত্তিক শুদ্ধ তিলাওয়াত",
      "সুন্নাহ, আদব ও দোয়ার চর্চা",
      "পরবর্তী হিফয স্তরের জন্য শক্ত ভিত্তি",
    ],
    stats: [
      { value: "Tajweed", label: "মাখরাজ ও তিলাওয়াত focus" },
      { value: "3 Track", label: "আরবি, বাংলা, ইংরেজি" },
      { value: "Daily", label: "সুন্নাহ ও দোয়া অনুশীলন" },
    ],
    keywords: [...BASE_KEYWORDS, "নাজেরা", "Najera Quran Learning", "সহীহ তিলাওয়াত"],
    colors: {
      primary: "#A36200",
      secondary: "#5A3500",
      surface: "#FFF9F0",
      glow: "rgba(163, 98, 0, 0.18)",
      border: "#F0DEC4",
      chip: "#FFF1DC",
      chipText: "#8B4E00",
    },
  },
  {
    slug: "hifz",
    route: "/departments/hifz",
    departmentKey: "হিফয",
    aliases: ["হিফয", "Hifz", "hifz", "تحفيظ"],
    shortLabel: "হিফয",
    title: "হিফয বিভাগ",
    subtitle: "বিস্তারিত দেখুন",
    titleEn: "Hifz Department",
    titleAr: "قسم التحفيظ",
    badge: "Hifz Madrasa",
    badgeBn: "হিফয মাদ্রাসা",
    badgeAr: "مدرسة تحفيظ",
    heroQuote: "بَلْ هُوَ آيَاتٌ بَيِّنَاتٌ فِي صُدُورِ الَّذِينَ أُوتُوا الْعِلْمَ",
    heroReference: "সুরা আনকাবূত, আয়াত ৪৯",
    heroAyatTranslation: "বরং তা সুস্পষ্ট নিদর্শন তাদের অন্তরে যাদেরকে জ্ঞান দান করা হয়েছে",
    longDescription: `আন্তর্জাতিক মানের হাফেজে কুরআন গড়ার বিশ্বস্ত ঠিকানা

রহমানিয়া ইনস্টিটিউটের হিফয বিভাগে আন্তর্জাতিক মানের প্রশিক্ষণ ও সুপরিকল্পিত ব্যবস্থাপনায় দক্ষ, আমলদার, সুন্নাহ অনুসারী ও আদর্শ হাফেজে কুরআন তৈরি করা হয়। নিয়মিত সাবক, আমুখতা, তাকরার, শুনানি ও পুনরাবৃত্তির মাধ্যমে শিক্ষার্থীদের হিফযকে মজবুত, নির্ভুল ও দীর্ঘস্থায়ী করা হয়।

প্রতিটি শিক্ষার্থীর মেধা, মনোযোগ ও সক্ষমতা অনুযায়ী আলাদা পরিকল্পনায় পাঠদান করা হয়, যাতে তারা দ্রুত ও সুন্দরভাবে কুরআন হিফয করতে পারে। পাশাপাশি তাজবিদ, আরবি ভাষা, ইসলামী আদব-আখলাক এবং সুন্নাহভিত্তিক জীবন গঠনের প্রতিও সমান গুরুত্ব প্রদান করা হয়।`,
    longDescription2: `শান্ত, নিরাপদ ও সম্পূর্ণ ইসলামিক পরিবেশে শিক্ষার্থীদের এমনভাবে গড়ে তোলা হয় যাতে তারা ভবিষ্যতে কুরআনের আলো সমাজে ছড়িয়ে দিতে সক্ষম হয়।`,
    specialFeatures: [
      "আন্তর্জাতিক মানের হিফয প্রশিক্ষণ ব্যবস্থা",
      "নিয়মিত সাবক, তাকরার ও শুনানি সিস্টেম",
      "দক্ষ হাফেজ ও অভিজ্ঞ কারী শিক্ষক",
      "হিফয মজবুত করার বিশেষ পরিকল্পনা",
      "আবাসিক ও নিরাপদ ইসলামিক পরিবেশ",
      "তাজবিদ ও Arabic ভাষা শিক্ষা",
      "ব্যক্তিগত অগ্রগতি পর্যবেক্ষণ ব্যবস্থা",
      "আমল, আখলাক ও সুন্নাহভিত্তিক জীবন গঠন",
    ],
    heroAyatTranslationEn: "Rather, it is clear verses in the hearts of those who have been given knowledge",
    heroAyatTranslationAr: "بَلْ هُوَ آيَاتٌ بَيِّنَاتٌ فِي صُدُورِ الَّذِينَ أُوتُوا الْعِلْمَ",
    heroReferenceEn: "Surah Al-Ankabut, Verse 49",
    heroReferenceAr: "سورة العنكبوت، الآية ٤٩",
    longDescriptionEn: `The Trusted Address for Producing Internationally Standard Huffaz

The Hifz department at Rahmania Institute (রহমানিয়া ইনস্টিটিউট) produces skilled, practicing, Sunnah-following Huffaz-e-Quran through international standard training and well-organized management. Through regular Sabq, Amukhta, Takrar, listening sessions, and revision, students' memorization is made strong, accurate, and long-lasting.

Each student is taught according to their ability, attention span, and capacity, enabling them to memorize the Quran quickly and beautifully. Alongside memorization, equal emphasis is placed on Tajweed, Arabic language, Islamic manners, and Sunnah-based life building.`,
    longDescription2En: `In a peaceful, safe, and fully Islamic environment, students are nurtured in such a way that they can spread the light of the Quran in society in the future.`,
    specialFeaturesEn: [
      "International standard Hifz training system",
      "Regular Sabq, Takrar & listening system",
      "Skilled Huffaz & experienced Qari teachers",
      "Special planning for strong memorization",
      "Residential & safe Islamic environment",
      "Tajweed & Arabic language education",
      "Personal progress monitoring system",
      "Character, practice & Sunnah-based life building",
    ],
    longDescriptionAr: `العنوان الموثوق لإنتاج حفظة القرآن على المستوى الدولي

ينتج قسم التحفيظ في معهد الرحمانية حفظة قرآن ماهرين وممارسين ومتبعين للسنة من خلال تدريب على المستوى الدولي وإدارة منظمة. من خلال السباق المنتظم والأمختة والتكرار وجلسات الاستماع والمراجعة، يصبح حفظ الطلاب قويًا ودقيقًا وطويل الأمد.

يتم تدريس كل طالب وفقًا لقدرته ومدى انتباهه وطاقته، مما يمكنهم من حفظ القرآن بسرعة وجمال. إلى جانب الحفظ، يتم التركيز بنفس القدر على التجويد واللغة العربية والآداب الإسلامية وبناء الحياة على أساس السنة.`,
    longDescription2Ar: `في بيئة هادئة وآمنة وإسلامية بالكامل، يتم تنشئة الطلاب بطريقة تمكنهم من نشر نور القرآن في المجتمع في المستقبل.`,
    specialFeaturesAr: [
      "نظام تدريب تحفيظ على المستوى الدولي",
      "نظام سباق وتكرار واستماع منتظم",
      "حفظة ماهرون ومعلمو قراء ذوو خبرة",
      "تخطيط خاص للحفظ القوي",
      "بيئة سكنية آمنة وإسلامية",
      "تعليم التجويد واللغة العربية",
      "نظام متابعة التقدم الشخصي",
      "بناء الشخصية والممارسة والحياة على أساس السنة",
    ],
    description:
      "রহমানিয়া ইনস্টিটিউটের হিফয বিভাগে আন্তর্জাতিক মানের প্রশিক্ষণের মাধ্যমে দক্ষ, আমলদার ও সুন্নাহ অনুসারী হাফেজে কুরআন তৈরি করা হয়। এখানে শিক্ষার্থীদের জন্য রয়েছে নিয়মিত সাবক, আমুখতা, শুনানি ও পুনরাবৃত্তির বিশেষ ব্যবস্থা। অভিজ্ঞ হাফেজ শিক্ষকগণের তত্ত্বাবধানে শিক্ষার্থীদের হিফয মজবুত করার পাশাপাশি আরবি ভাষা, তাজবিদ ও ইসলামী আদর্শ শিক্ষার প্রতিও গুরুত্ব দেওয়া হয়।",
    seoDescription:
      "Rahmania Institute (রহমানিয়া ইনস্টিটিউট)-এর হিফয বিভাগে Hifz Madrasa standard, অভিজ্ঞ হাফেজ শিক্ষক, আবাসিক সুবিধা, Arabic Learning এবং Quran Education-এর সমন্বয়ে দক্ষ হাফেজে কুরআন তৈরি করা হয়।",
    features: [
      "আন্তর্জাতিক মানের হিফয প্রশিক্ষণ",
      "অভিজ্ঞ হাফেজ ও কারী শিক্ষক",
      "নিয়মিত সাবক ও শুনানি সিস্টেম",
      "আবাসিক ও নিরাপদ পরিবেশ",
      "আরবি ভাষা ও তাজবিদ শিক্ষা",
      "হিফয মজবুত করার বিশেষ পরিকল্পনা",
    ],
    audience: "পূর্ণ কুরআন মুখস্থ ও ধারাবাহিক রিভিশন",
    outcomes: [
      "সাবক, আমোখতা ও শুনানির সমন্বিত ট্র্যাকিং",
      "আবাসিক ও নিয়মিত অধ্যয়ন পরিবেশ",
      "হিফযের সাথে আরবি ভাষাগত প্রস্তুতি",
    ],
    stats: [
      { value: "Full Hifz", label: "সংগঠিত হিফয রোডম্যাপ" },
      { value: "Residential", label: "আবাসিক সাপোর্ট" },
      { value: "Expert", label: "হাফেজ শিক্ষক তত্ত্বাবধান" },
    ],
    keywords: [...BASE_KEYWORDS, "হিফয", "Hifz Department", "হাফেজে কুরআন"],
    colors: {
      primary: "#0F5DB8",
      secondary: "#002D6B",
      surface: "#F4F8FF",
      glow: "rgba(15, 93, 184, 0.18)",
      border: "#D4E2F8",
      chip: "#E8F1FF",
      chipText: "#0F5DB8",
    },
  },
  {
    slug: "hifz-shunani",
    route: "/departments/hifz-shunani",
    departmentKey: "হিফয শুনানি",
    aliases: ["হিফয শুনানি", "Hifz Shunani", "hifz-shunani", "hifz shunani", "تسميع تحفيظ"],
    shortLabel: "হিফয শুনানি",
    title: "হিফয শুনানি বিভাগ",
    subtitle: "বিস্তারিত দেখুন",
    titleEn: "Hifz Shunani Department",
    titleAr: "قسم تسميع التحفيظ",
    badge: "Hifz Revision",
    badgeBn: "হিফয পুনরাবৃত্তি",
    badgeAr: "مراجعة التحفيظ",
    heroQuote: "إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ",
    heroReference: "সুরা হিজর, আয়াত ৯",
    heroAyatTranslation: "নিশ্চয়ই আমি কুরআন নাযিল করেছি এবং নিশ্চয়ই আমি এর সংরক্ষক",
    longDescription: `হিফয সংরক্ষণ ও নির্ভুল তিলাওয়াতের বিশেষ তত্ত্বাবধান

কুরআনের হিফযকে দীর্ঘস্থায়ী, নির্ভুল ও শক্তিশালী করার লক্ষ্যে রহমানিয়া ইনস্টিটিউটে রয়েছে বিশেষ হিফয শুনানি বিভাগ। এখানে শিক্ষার্থীদের নিয়মিত পুনরাবৃত্তি, শুনানি ও তাজবিদ পর্যবেক্ষণের মাধ্যমে হিফযকে আরও মজবুত ও নির্ভুল করা হয়।

অভিজ্ঞ শিক্ষকগণ প্রতিটি শিক্ষার্থীর ভুল আলাদাভাবে সংশোধন করেন এবং ব্যক্তিগত মনিটরিংয়ের মাধ্যমে তাদের তিলাওয়াতকে আরও সুন্দর, সাবলীল ও আত্মবিশ্বাসপূর্ণ করে তোলেন। নিয়মিত মূল্যায়ন ও পরিকল্পিত তাকরার শিক্ষার্থীদের হিফযকে স্থায়ীভাবে সংরক্ষণ করতে গুরুত্বপূর্ণ ভূমিকা পালন করে।`,
    longDescription2: ``,
    specialFeatures: [
      "শক্তিশালী ও সুশৃঙ্খল শুনানি ব্যবস্থা",
      "ভুল সংশোধন ও তাজবিদ পর্যবেক্ষণ",
      "ব্যক্তিগত হিফয ট্র্যাকিং ও মনিটরিং",
      "দৈনিক তাকরার ও পুনরাবৃত্তি সিস্টেম",
      "দক্ষ শিক্ষকদের সরাসরি তত্ত্বাবধান",
      "হিফয সংরক্ষণের বিশেষ পরিকল্পনা",
      "নির্ভুল তিলাওয়াত গঠনে বিশেষ গুরুত্ব",
      "শিক্ষার্থীদের আত্মবিশ্বাস বৃদ্ধির কার্যক্রম",
    ],
    heroAyatTranslationEn: "Indeed, it is We who sent down the Reminder and indeed, We will be its guardian",
    heroAyatTranslationAr: "إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ",
    heroReferenceEn: "Surah Al-Hijr, Verse 9",
    heroReferenceAr: "سورة الحجر، الآية ٩",
    longDescriptionEn: `Special Supervision for Hifz Preservation & Accurate Recitation

To make Quran memorization long-lasting, accurate, and strong, Rahmania Institute (রহমানিয়া ইনস্টিটিউট) has a dedicated Hifz Shunani (Listening) department. Here, through regular revision, listening sessions, and Tajweed monitoring, students' memorization is made more robust and precise.

Experienced teachers individually correct each student's mistakes and through personal monitoring, make their recitation more beautiful, fluent, and confident. Regular assessments and planned Takrar play a vital role in permanently preserving students' memorization.`,
    longDescription2En: ``,
    specialFeaturesEn: [
      "Strong & organized listening system",
      "Error correction & Tajweed monitoring",
      "Personal Hifz tracking & monitoring",
      "Daily Takrar & revision system",
      "Direct supervision by skilled teachers",
      "Special planning for Hifz preservation",
      "Special emphasis on accurate recitation",
      "Confidence building activities for students",
    ],
    longDescriptionAr: `إشراف خاص لحفظ الحفظ والتلاوة الدقيقة

لجعل حفظ القرآن طويل الأمد ودقيقًا وقويًا، يحتوي معهد الرحمانية على قسم تسميع تحفيظ مخصص. هنا، من خلال المراجعة المنتظمة وجلسات الاستماع ومراقبة التجويد، يصبح حفظ الطلاب أكثر قوة ودقة.

يقوم المعلمون ذوو الخبرة بتصحيح أخطاء كل طالب بشكل فردي ومن خلال المتابعة الشخصية، يجعلون تلاوتهم أكثر جمالاً وطلاقة وثقة. تلعب التقييمات المنتظمة والتكرار المخطط دورًا حيويًا في الحفاظ الدائم على حفظ الطلاب.`,
    longDescription2Ar: ``,
    specialFeaturesAr: [
      "نظام استماع قوي ومنظم",
      "تصحيح الأخطاء ومراقبة التجويد",
      "تتبع الحفظ الشخصي والمراقبة",
      "نظام تكرار ومراجعة يومي",
      "إشراف مباشر من معلمين ماهرين",
      "تخطيط خاص للحفاظ على الحفظ",
      "تركيز خاص على التلاوة الدقيقة",
      "أنشطة بناء الثقة للطلاب",
    ],
    description:
      "হিফয সংরক্ষণ, মজবুতকরণ ও ভুল সংশোধনের জন্য রহমানিয়া ইনস্টিটিউটে রয়েছে বিশেষ শুনানি বিভাগ। নিয়মিত পুনরাবৃত্তি, তাজবিদ পর্যবেক্ষণ এবং শিক্ষক কর্তৃক ব্যক্তিগত মনিটরিংয়ের মাধ্যমে শিক্ষার্থীদের হিফযকে আরও শক্তিশালী ও নির্ভুল করা হয়। প্রতিটি শিক্ষার্থীর অগ্রগতি আলাদাভাবে পর্যবেক্ষণ করে উন্নতির জন্য বিশেষ দিকনির্দেশনা প্রদান করা হয়।",
    seoDescription:
      "Rahmania Institute (রহমানিয়া ইনস্টিটিউট)-এর হিফয শুনানি বিভাগে Hifz revision, Tajweed monitoring, ভুল সংশোধন, Quran Education tracking এবং Islamic Institute Bangladesh মানের structured শুনানি ব্যবস্থা রয়েছে।",
    features: [
      "শক্তিশালী ও নিয়মিত শুনানি সিস্টেম",
      "ভুল সংশোধন ও তাজবিদ পর্যবেক্ষণ",
      "হিফয সংরক্ষণের বিশেষ পরিকল্পনা",
      "ব্যক্তিগত অগ্রগতি ট্র্যাকিং",
      "দৈনিক পুনরাবৃত্তি ও মূল্যায়ন",
      "দক্ষ শিক্ষকদের সরাসরি তত্ত্বাবধান",
    ],
    audience: "হিফয সংরক্ষণ, পুনরাবৃত্তি ও মানোন্নয়ন",
    outcomes: [
      "দৈনিক ও সাপ্তাহিক শুনানি সূচি",
      "ভুল সংশোধন ও Tajweed audit",
      "দীর্ঘমেয়াদি retention monitoring",
    ],
    stats: [
      { value: "Revision", label: "দৈনিক পুনরাবৃত্তি system" },
      { value: "Tracking", label: "হিফয retention monitoring" },
      { value: "Focused", label: "তাজবিদ ও ভুল সংশোধন" },
    ],
    keywords: [...BASE_KEYWORDS, "হিফয শুনানি", "Hifz Shunani", "Quran revision"],
    colors: {
      primary: "#7A2DB7",
      secondary: "#4D0070",
      surface: "#FAF5FF",
      glow: "rgba(122, 45, 183, 0.18)",
      border: "#E8D8F6",
      chip: "#F4EAFE",
      chipText: "#7A2DB7",
    },
  },
  {
    slug: "kindergarten",
    route: "/departments/kindergarten",
    departmentKey: "কিন্ডারগার্টেন",
    aliases: ["কিন্ডারগার্টেন", "কিন্ডার গার্ডেন", "Kindergarten", "kindergarten", "روضة الأطفال"],
    shortLabel: "কিন্ডারগার্টেন",
    title: "কিন্ডারগার্টেন বিভাগ",
    subtitle: "বিস্তারিত দেখুন",
    titleEn: "Islamic Kindergarten",
    titleAr: "قسم روضة الأطفال",
    badge: "Islamic Kindergarten",
    badgeBn: "ইসলামিক কিন্ডারগার্টেন",
    badgeAr: "روضة أطفال إسلامية",
    heroQuote: "رَبِّ زِدْنِي عِلْمًا",
    heroReference: "সুরা ত্বহা, আয়াত ১১৪",
    heroAyatTranslation: "হে আমার প্রতিপালক, আমার জ্ঞান বৃদ্ধি করে দিন",
    longDescription: `আধুনিক শিক্ষা, সৃজনশীলতা ও ইসলামিক মূল্যবোধের অপূর্ব সমন্বয়

রহমানিয়া ইনস্টিটিউটের কিন্ডারগার্টেন বিভাগে শিশুদের জন্য গড়ে তোলা হয়েছে একটি আনন্দময়, সৃজনশীল ও আধুনিক শিক্ষাব্যবস্থা, যেখানে ইসলামিক মূল্যবোধ ও সাধারণ শিক্ষার সমন্বয়ে প্রতিটি শিশুর মেধা, নৈতিকতা ও আত্মবিশ্বাস বিকাশে বিশেষ গুরুত্ব দেওয়া হয়।

খেলাধুলা, গল্পভিত্তিক শিক্ষা, সৃজনশীল কার্যক্রম, স্মার্ট ডিজিটাল ক্লাস ও শিশুবান্ধব পাঠদানের মাধ্যমে শিশুদের শেখানো হয় সহজ ও আনন্দদায়ক উপায়ে। বাংলা, English, গণিত ও ইসলামিক শিক্ষার পাশাপাশি শিশুদের শৃঙ্খলা, ভদ্রতা, আত্মবিশ্বাস ও সামাজিক আচরণ গড়ে তুলতেও বিশেষভাবে কাজ করা হয়।`,
    longDescription2: `একজন শিশুর ভবিষ্যৎ সুন্দরভাবে গড়ে তোলার জন্য প্রয়োজন ভালোবাসাপূর্ণ পরিবেশ, সঠিক দিকনির্দেশনা ও মানসম্মত শিক্ষা। রহমানিয়া ইনস্টিটিউটের কিন্ডারগার্টেন বিভাগ সেই লক্ষ্যেই কাজ করে যাচ্ছে।`,
    specialFeatures: [
      "আধুনিক স্মার্ট ক্লাসরুম সুবিধা",
      "ইসলামিক ও সাধারণ শিক্ষার সমন্বয়",
      "বাংলা, English ও গণিত শিক্ষা",
      "সৃজনশীল ও আনন্দময় পাঠদান পদ্ধতি",
      "নৈতিক ও মানসিক বিকাশে বিশেষ গুরুত্ব",
      "খেলাধুলা ও কার্যক্রমভিত্তিক শিক্ষা",
      "অভিজ্ঞ ও স্নেহশীল শিক্ষক মন্ডলী",
      "নিরাপদ, পরিচ্ছন্ন ও শিশুবান্ধব পরিবেশ",
    ],
    heroAyatTranslationEn: "My Lord, increase me in knowledge",
    heroAyatTranslationAr: "رَبِّ زِدْنِي عِلْمًا",
    heroReferenceEn: "Surah Taha, Verse 114",
    heroReferenceAr: "سورة طه، الآية ١١٤",
    longDescriptionEn: `A Beautiful Blend of Modern Education, Creativity & Islamic Values

The Kindergarten department at Rahmania Institute (রহমানিয়া ইনস্টিটিউট) provides a joyful, creative, and modern education system for children, where Islamic values and general education are combined to develop each child's intellect, morality, and confidence.

Through play, story-based learning, creative activities, smart digital classes, and child-friendly teaching, children learn in an easy and enjoyable way. Alongside Bangla, English, Math, and Islamic education, special attention is given to developing discipline, politeness, confidence, and social behavior in children.`,
    longDescription2En: `A child's beautiful future requires a loving environment, proper guidance, and quality education. Rahmania Institute (রহমানিয়া ইনস্টিটিউট)'s Kindergarten department is working towards this goal.`,
    specialFeaturesEn: [
      "Modern smart classroom facilities",
      "Integration of Islamic & general education",
      "Bangla, English & Mathematics education",
      "Creative & joyful teaching methods",
      "Special focus on moral & mental development",
      "Play & activity-based learning",
      "Experienced & caring teaching staff",
      "Safe, clean & child-friendly environment",
    ],
    longDescriptionAr: `مزيج جميل من التعليم الحديث والإبداع والقيم الإسلامية

يقدم قسم روضة الأطفال في معهد الرحمانية نظامًا تعليميًا مرحًا وإبداعيًا وحديثًا للأطفال، حيث يتم الجمع بين القيم الإسلامية والتعليم العام لتنمية ذكاء كل طفل وأخلاقه وثقته.

من خلال اللعب والتعلم القائم على القصص والأنشطة الإبداعية والفصول الذكية والتدريس الصديق للطفل، يتعلم الأطفال بطريقة سهلة وممتعة. إلى جانب تعليم البنغالية والإنجليزية والرياضيات والتعليم الإسلامي، يتم إيلاء اهتمام خاص لتنمية الانضباط والأدب والثقة والسلوك الاجتماعي لدى الأطفال.`,
    longDescription2Ar: `المستقبل الجميل للطفل يتطلب بيئة محبة وتوجيهًا صحيحًا وتعليمًا جيدًا. قسم روضة الأطفال في معهد الرحمانية يعمل لتحقيق هذا الهدف.`,
    specialFeaturesAr: [
      "مرافق الفصول الذكية الحديثة",
      "دمج التعليم الإسلامي والعام",
      "تعليم البنغالية والإنجليزية والرياضيات",
      "طرق تدريس إبداعية وممتعة",
      "تركيز خاص على التطور الأخلاقي والعقلي",
      "تعليم قائم على اللعب والأنشطة",
      "هيئة تدريس ذات خبرة ومحبة",
      "بيئة آمنة ونظيفة وصديقة للطفل",
    ],
    description:
      "রহমানিয়া ইনস্টিটিউটের কিন্ডারগার্টেন বিভাগে আধুনিক শিক্ষা ও ইসলামী মূল্যবোধের সমন্বয়ে শিশুদের জন্য গড়ে তোলা হয়েছে একটি স্মার্ট, আনন্দময় ও সৃজনশীল শিক্ষাব্যবস্থা। এখানে শিশুরা খেলাধুলা, সৃজনশীল কার্যক্রম এবং ডিজিটাল শিক্ষার মাধ্যমে সহজ ও আনন্দদায়ক উপায়ে বাংলা, English, গণিত ও ইসলামিক শিক্ষা অর্জন করে। কোমলমতি শিশুদের মানসিক বিকাশ, নৈতিক শিক্ষা ও আত্মবিশ্বাস গঠনে বিশেষ গুরুত্ব প্রদান করা হয়।",
    seoDescription:
      "Rahmania Institute (রহমানিয়া ইনস্টিটিউট)-এর Islamic Kindergarten-এ Bangla, English, Arabic Version, Smart Classroom, Activity Based Learning এবং VIP Campus Environment-এর মাধ্যমে শিশুদের balanced Islamic School experience দেওয়া হয়।",
    features: [
      "আধুনিক স্মার্ট ক্লাসরুম",
      "ইসলামিক ও সাধারণ শিক্ষার সমন্বয়",
      "বাংলা, English ও গণিত শিক্ষা",
      "সৃজনশীল ও আনন্দময় পাঠদান",
      "শিশুদের নৈতিক ও মানসিক বিকাশ",
      "অভিজ্ঞ ও যত্নশীল শিক্ষক মন্ডলী",
    ],
    audience: "শিশুদের আনন্দময় ও মূল্যবোধভিত্তিক শিক্ষা",
    outcomes: [
      "Activity-based foundational learning",
      "Islamic values + modern curriculum balance",
      "নিরাপদ, সুন্দর ও parent-friendly campus experience",
    ],
    stats: [
      { value: "3 Version", label: "Bangla, English, Arabic" },
      { value: "Smart", label: "Classroom & activities" },
      { value: "VIP", label: "Campus environment" },
    ],
    keywords: [...BASE_KEYWORDS, "কিন্ডারগার্টেন", "Islamic Kindergarten", "Activity Based Learning"],
    colors: {
      primary: "#8A7A00",
      secondary: "#3A3A00",
      surface: "#FFFDF3",
      glow: "rgba(138, 122, 0, 0.18)",
      border: "#EFE7B5",
      chip: "#FFF7D6",
      chipText: "#7A6900",
    },
  },
  {
    slug: "madani-nessab",
    route: "/departments/madani-nessab",
    departmentKey: "মাদানী নেসাব",
    aliases: ["মাদানী নেসাব", "কিতাবখানা", "Kitab Khana", "Kitabkhana", "kitab khana", "kitabkhana", "كتاب خانة"],
    shortLabel: "মাদানী নেসাব",
    title: "মাদানী নেসাব বিভাগ",
    subtitle: "ইলম, আদব ও আমলের পরিপূর্ণ সমন্বয়",
    titleEn: "Madani Nessab Department",
    titleAr: "قسم المدني نسب",
    badge: "Madani Nessab",
    badgeBn: "মাদানী নেসাব",
    badgeAr: "مدني نسب",
    heroQuote: "وَقُلْ رَبِّ زِدْنِي عِلْمًا",
    heroReference: "সুরা ত্বহা, আয়াত ১১৪",
    heroAyatTranslation: "এবং বলুন, হে আমার প্রতিপালক, আমার জ্ঞান বৃদ্ধি করে দিন",
    longDescription: `মাদানী নেসাবভিত্তিক যুগোপযোগী দ্বীনি শিক্ষার পূর্ণাঙ্গ ব্যবস্থা

রহমানিয়া ইনস্টিটিউটের কিতাব বিভাগে মাদানী নেসাব অনুযায়ী কুরআন, হাদীস, ফিকহ, তাফসীর, আকাইদ, আরবি সাহিত্য ও ইসলামী জ্ঞানের বিভিন্ন বিষয় অত্যন্ত দক্ষতা ও যত্নের সাথে পাঠদান করা হয়। এখানে শিক্ষার্থীদের শুধু কিতাব পড়ানো হয় না, বরং তাদেরকে একজন আদর্শ আলেম, দায়ী ও সুন্নাহ অনুসারী মানুষ হিসেবে গড়ে তোলার লক্ষ্যে শিক্ষা প্রদান করা হয়।

অভিজ্ঞ আলেম ও যোগ্য শিক্ষকদের তত্ত্বাবধানে শিক্ষার্থীদের আরবি ভাষা দক্ষতা, গবেষণামূলক চিন্তাভাবনা, বক্তব্য প্রদান, লেখালেখি এবং দ্বীনের সঠিক বুঝ অর্জনের জন্য বিশেষ প্রশিক্ষণ দেওয়া হয়। নিয়মিত দরস, আলোচনা, পরীক্ষা ও ব্যক্তিগত মনিটরিংয়ের মাধ্যমে প্রতিটি শিক্ষার্থীর শিক্ষাগত অগ্রগতি নিশ্চিত করা হয়।`,
    longDescription2: `আধুনিক সময়ের চাহিদা ও ইসলামী শিক্ষার গভীরতাকে সমন্বয় করে এমন একটি পরিবেশ তৈরি করা হয়েছে যেখানে শিক্ষার্থীরা দ্বীনি জ্ঞানের পাশাপাশি সুন্দর চরিত্র, নেতৃত্বগুণ ও সমাজসেবার মানসিকতা অর্জন করতে পারে।`,
    specialFeatures: [
      "মাদানী নেসাবভিত্তিক পূর্ণাঙ্গ শিক্ষা ব্যবস্থা",
      "কুরআন, হাদীস, ফিকহ ও তাফসীর শিক্ষা",
      "দক্ষ আলেম ও অভিজ্ঞ শিক্ষক মন্ডলী",
      "Arabic ভাষা ও ইসলামী সাহিত্য চর্চা",
      "ইসলামী আদব, আখলাক ও আমল গঠন",
      "নিয়মিত পরীক্ষা ও মূল্যায়ন ব্যবস্থা",
      "বক্তব্য, লেখালেখি ও গবেষণার প্রশিক্ষণ",
      "নিরাপদ, সুশৃঙ্খল ও ইসলামিক পরিবেশ",
      "যুগোপযোগী ও মানসম্মত দ্বীনি শিক্ষা ব্যবস্থা",
    ],
    heroAyatTranslationEn: "And say, my Lord, increase me in knowledge",
    heroAyatTranslationAr: "وَقُلْ رَبِّ زِدْنِي عِلْمًا",
    heroReferenceEn: "Surah Taha, Verse 114",
    heroReferenceAr: "سورة طه، الآية ١١٤",
    longDescriptionEn: `A Complete System of Contemporary Islamic Education Based on Madani Nessab

The Kitab (Madani Nessab) department at Rahmania Institute (রহমানিয়া ইনস্টিটিউট) provides comprehensive education in Quran, Hadith, Fiqh, Tafseer, Aqeedah, Arabic literature, and various Islamic sciences with great expertise and care. Students are not merely taught books; rather, they are nurtured to become ideal scholars, Da'ees, and Sunnah-following individuals.

Under the supervision of experienced scholars and qualified teachers, students receive special training in Arabic language proficiency, research-oriented thinking, public speaking, writing, and gaining correct understanding of the Deen. Regular lessons, discussions, examinations, and personal monitoring ensure each student's academic progress.`,
    longDescription2En: `An environment has been created that combines the demands of the modern era with the depth of Islamic education, where students can acquire not only religious knowledge but also beautiful character, leadership qualities, and a spirit of community service.`,
    specialFeaturesEn: [
      "Complete education system based on Madani Nessab",
      "Quran, Hadith, Fiqh & Tafseer education",
      "Skilled scholars & experienced teaching staff",
      "Arabic language & Islamic literature practice",
      "Islamic manners, character & practice building",
      "Regular examination & assessment system",
      "Training in speech, writing & research",
      "Safe, disciplined & Islamic environment",
      "Contemporary & standard Islamic education system",
    ],
    longDescriptionAr: `نظام كامل للتعليم الإسلامي المعاصر القائم على المدني نسب

يقدم قسم كتاب (مدني نسب) في معهد الرحمانية تعليمًا شاملاً في القرآن والحديث والفقه والتفسير والعقيدة والأدب العربي والعلوم الإسلامية المختلفة بخبرة وعناية كبيرتين. لا يتم تعليم الطلاب الكتب فحسب، بل يتم تنشئتهم ليصبحوا علماء مثاليين ودعاة وأتباعًا للسنة.

تحت إشراف علماء ذوي خبرة ومعلمين مؤهلين، يتلقى الطلاب تدريبًا خاصًا في إتقان اللغة العربية والتفكير البحثي والخطابة والكتابة وفهم الدين الصحيح. تضمن الدروس المنتظمة والمناقشات والامتحانات والمتابعة الشخصية التقدم الأكاديمي لكل طالب.`,
    longDescription2Ar: `تم إنشاء بيئة تجمع بين متطلبات العصر الحديث وعمق التعليم الإسلامي، حيث يمكن للطلاب اكتساب ليس فقط المعرفة الدينية ولكن أيضًا الشخصية الجميلة والصفات القيادية وروح خدمة المجتمع.`,
    specialFeaturesAr: [
      "نظام تعليمي كامل قائم على المدني نسب",
      "تعليم القرآن والحديث والفقه والتفسير",
      "علماء ماهرون وهيئة تدريس ذات خبرة",
      "ممارسة اللغة العربية والأدب الإسلامي",
      "بناء الآداب الإسلامية والأخلاق والعمل",
      "نظام امتحانات وتقييم منتظم",
      "تدريب على الخطابة والكتابة والبحث",
      "بيئة آمنة ومنضبطة وإسلامية",
      "نظام تعليم إسلامي معاصر وقياسي",
    ],
    description:
      "রহমানিয়া ইনস্টিটিউটের মাদানী নেসাব বিভাগে কুরআন, হাদীস, ফিকহ, আকাইদ, আরবি ভাষা ও ইসলামী আদর্শ শিক্ষার মাধ্যমে শিক্ষার্থীদেরকে একজন আদর্শ দ্বীনদার, সুন্নাহপ্রেমী ও আখলাকসম্পন্ন মানুষ হিসেবে গড়ে তোলা হয়। আধুনিক সময়ের প্রয়োজনীয় জ্ঞান ও প্রাচীন ইসলামী শিক্ষার সমন্বয়ে এমন একটি শিক্ষাব্যবস্থা গড়ে তোলা হয়েছে যেখানে একজন শিক্ষার্থী ইলমের পাশাপাশি আদব, চরিত্র, আমল ও দাওয়াতি মানসিকতায় সমৃদ্ধ হয়ে উঠতে পারে। অভিজ্ঞ আলেমে দ্বীন, সুন্দর পরিবেশ, নিয়মিত তালীম, তারবিয়াত ও ব্যক্তিগত মনিটরিংয়ের মাধ্যমে প্রতিটি শিক্ষার্থীর প্রতি বিশেষ যত্ন নেওয়া হয়।",
    seoDescription:
      "Rahmania Institute (রহমানিয়া ইনস্টিটিউট)-এর মাদানী নেসাব বিভাগে Quran, Hadith, Fiqh, Aqeedah, Arabic Language এবং Islamic আদর্শ শিক্ষার মাধ্যমে শিক্ষার্থীদের দ্বীনদার, সুন্নাহপ্রেমী ও আখলাকসম্পন্ন মানুষ হিসেবে গড়ে তোলা হয়।",
    features: [
      "কুরআন, হাদীস ও ফিকহভিত্তিক পূর্ণাঙ্গ শিক্ষা",
      "আরবি ভাষা ও ইসলামী সাহিত্য চর্চা",
      "সুন্নাহভিত্তিক জীবন গঠনের প্রশিক্ষণ",
      "অভিজ্ঞ আলেম ও মুহাদ্দিস শিক্ষকমণ্ডলী",
      "আদব, আখলাক ও আত্মশুদ্ধির বিশেষ তালীম",
      "আধুনিক ও ইসলামিক পরিবেশের সমন্বয়",
      "নিয়মিত তারবিয়াত ও ব্যক্তিগত মনিটরিং",
      "দ্বীনি নেতৃত্ব ও দাওয়াতি মানসিকতা গঠন",
    ],
    audience: "ইলম, আদব ও আমলের পরিপূর্ণ সমন্বয়",
    outcomes: [
      "কুরআন, হাদীস ও ফিকহে গভীর জ্ঞান",
      "সুন্নাহভিত্তিক চরিত্র ও আখলাক গঠন",
      "ইসলামী নেতৃত্ব ও দাওয়াতি দক্ষতা অর্জন",
    ],
    stats: [
      { value: "8 Track", label: "কুরআন, হাদীস, ফিকহ, আরবি ও অন্যান্য" },
      { value: "Scholarly", label: "অভিজ্ঞ আলেম ও মুহাদ্দিস" },
      { value: "Integrated", label: "ইলম, আদব ও আমলের সমন্বয়" },
    ],
    keywords: [...BASE_KEYWORDS, "মাদানী নেসাব", "কিতাবখানা", "Kitab Khana", "Madani Nessab", "ইসলামী শিক্ষা"],
    colors: {
      primary: "#1A5276",
      secondary: "#0E2C40",
      surface: "#F4F8FB",
      glow: "rgba(26, 82, 118, 0.18)",
      border: "#D0E0ED",
      chip: "#E6F0F7",
      chipText: "#1A5276",
    },
  },
  {
    slug: "english-version",
    route: "/departments/english-version",
    departmentKey: "English Version",
    aliases: ["English Version", "ইংরেজি ভার্সন", "ইংলিশ ভার্সন", "english version", "النسخة الإنجليزية"],
    shortLabel: "English Version",
    title: "ইংলিশ ভার্সন",
    subtitle: "বিস্তারিত দেখুন",
    titleEn: "English Version",
    titleAr: "النسخة الإنجليزية",
    badge: "English Version",
    badgeBn: "ইংলিশ ভার্সন",
    badgeAr: "النسخة الإنجليزية",
    heroQuote: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
    heroReference: "সুরা আলাক, আয়াত ১",
    heroAyatTranslation: "পড়ো তোমার প্রতিপালকের নামে যিনি সৃষ্টি করেছেন",
    heroAyatTranslationEn: "Read in the name of your Lord who created",
    heroAyatTranslationAr: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
    heroReferenceEn: "Surah Al-Alaq, Verse 1",
    heroReferenceAr: "سورة العلق، الآية ١",
    longDescription: "",
    longDescriptionEn: "",
    longDescriptionAr: "",
    description: "রহমানিয়া ইনস্টিটিউটের ইংলিশ ভার্সন বিভাগে আধুনিক শিক্ষা ও সাধারণ শিক্ষার সমন্বয়ে প্লেগ্রুপ থেকে পঞ্চম শ্রেণী পর্যন্ত শিশুদের জন্য বিশ্বমানের শিক্ষা ব্যবস্থা প্রদান করা হয়।",
    seoDescription: "Rahmania Institute (রহমানিয়া ইনস্টিটিউট)-এর English Version বিভাগে Playgroup to Class Five পর্যন্ত আধুনিক, নৈতিক ও দ্বীনি শিক্ষার এক অনন্য সমন্বয় প্রদান করা হয়।",
    features: [
      "প্লেগ্রুপ থেকে পঞ্চম শ্রেণী পর্যন্ত পাঠদান",
      "ইংলিশ ভার্সন ও হিফজুল কুরআন সমন্বয়",
      "আধুনিক, নৈতিক ও আলোকিত শিক্ষা কার্যক্রম",
      "তাজবিদসহ শুদ্ধ কুরআন শিক্ষা",
      "অভিজ্ঞ ও যত্নশীল শিক্ষক মণ্ডলী",
      "সম্পূর্ণ নিরাপদ ও মনোরম পরিবেশ",
    ],
    specialFeatures: [
      "প্লেগ্রুপ থেকে পঞ্চম শ্রেণী",
      "হিফজুল কুরআনের সাথে ইংলিশ ভার্সন",
      "আধুনিক, নৈতিক এবং আলোকিত শিক্ষা",
      "তাজবিদসহ শুদ্ধ কুরআন শিক্ষা",
      "ইসলামী আদর্শ ও আখলাক গঠন",
      "সম্পূর্ণ নিরাপদ, পরিচ্ছন্ন ও ইসলামিক পরিবেশ",
    ],
    specialFeaturesEn: [
      "Playgroup to Class Five",
      "English Version with Hifzul Quran",
      "Modern, moral and enlightened education",
      "Pure Quran education with Tajweed",
      "Islamic values and moral character building",
      "Fully safe, clean and Islamic environment",
    ],
    specialFeaturesAr: [
      "من مرحلة التمهيدي إلى الصف الخامس",
      "النسخة الإنجليزية مع تحفيظ القرآن الكريم",
      "تعليم حديث وأخلاقي ومتنور",
      "تعليم القرآن الخالص مع التجويد",
      "بناء القيم الإسلامية والأخلاق الحميدة",
      "بيئة آمنة ونظيفة وإسلامية بالكامل",
    ],
    audience: "কোমলমতি শিশুদের আধুনিক ও দ্বীনি শিক্ষা",
    outcomes: [
      "তাজবিদসহ কুরআন তিলাওয়াতের সুন্দর ভিত্তি",
      "ইংলিশ ও সাধারণ শিক্ষায় দারুণ দক্ষতা",
      "নৈতিকতা, আদব ও আদর্শ চরিত্র গঠন",
    ],
    stats: [
      { value: "Play-5", label: "শ্রেণী কার্যক্রম" },
      { value: "English", label: "Version curriculum" },
      { value: "Hifz", label: "হিফজুল কুরআন সুবিধা" },
    ],
    keywords: [...BASE_KEYWORDS, "English Version", "ইংরেজি ভার্সন", "Hifz with English Version"],
    colors: {
      primary: "#2563EB",
      secondary: "#1E40AF",
      surface: "#F8FAFC",
      glow: "rgba(37, 99, 235, 0.18)",
      border: "#E2E8F0",
      chip: "#DBEAFE",
      chipText: "#1E40AF",
    },
  },
];

export function getDepartmentBySlug(slug) {
  return DEPARTMENT_PAGES.find((item) => item.slug === slug) || null;
}

export function matchesDepartmentValue(value, department) {
  if (!department || value == null) return false;
  const valNormalized = String(value).trim().toLowerCase();
  return department.aliases.some(alias => String(alias).trim().toLowerCase() === valNormalized);
}
