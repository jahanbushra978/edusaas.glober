/**
 * Canonical Beginner Lesson Data: Alif (ا), Baa (ب), Taa (ت) & Thaa (ث)
 * Rahmania Institute / Nur AI Quran Learning Platform
 * 
 * Strictly derived from Noorani Qaida Takhti 1 (Huroof Mufradat) & classical Maktab pedagogy.
 * Every lesson adheres to the 10-stage pedagogical cycle:
 * INTRODUCE → DEMONSTRATE → LISTEN → PRACTICE → PLAY → ASSESS → CORRECT → REPEAT → REWARD → PROGRESS.
 * 
 * AUDIO INTEGRITY & VERIFICATION STATUS:
 * - Asset Source: Noorani Qaida Takhti 1 Studio Track (nooresahar/noorani/chapter01)
 * - File Availability: Verified (HTTP 200 OK via CDN HEAD request)
 * - Browser Playback: Verified (AudioContext & HTMLAudioElement playback-start event)
 * - Human Listening: PENDING (Multi-device listening audit scheduled)
 * - Qualified Qari Approval: PENDING (Certified institutional Qari sign-off scheduled)
 * - Prohibition: Zero browser robotic SpeechSynthesis; no cross-substitution of letter audio.
 */

export const BEGINNER_PILOT_LESSONS = [
  {
    id: "lesson_alif",
    lessonNumber: 1,
    letter: "ا",
    nameBn: "আলিফ",
    nameAr: "أَلِف",
    audioUrl: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter01/Page1-1.m4a",
    audioTrackNumber: 1,
    
    // Multi-tier Audio Verification Status
    audioStatus: {
      source: "Noorani Qaida Takhti 1 Studio Track",
      fileAvailability: "HTTP 200 OK Verified",
      browserPlayback: "Verified",
      humanListening: "Pending",
      qualifiedQariApproval: "Pending",
    },

    makhrajNumber: 1,
    makhrajZoneBn: "হরফের নাম ও মাখরাজ পরিচয়",
    makhrajDescriptionBn:
      "নূরানী কায়দার ১ম তখতীতে আলাদা হরফ হিসেবে একে তার নাম ধরে 'আলিফ' পড়তে হয় (টানা ছাড়া স্বাভাবিক উচ্চারণ)। খালি আলিফ নিজে নিঃশব্দ থাকে; যখন কোনো হরফে যবরের পর খালি আলিফ আসে (যেমন: بَا - 'বাআ'), তখন তা মৌখিক গহ্বর (আল-জাওফ) হইতে ১ আলিফ (২ হরকত) টেনে দীর্ঘস্বর (মাদ্দ) হিসেবে উচ্চারিত হয়।",
    letterVisualMetaphor: "সোজা দাঁড়িয়ে থাকা একটি লাঠির মতো (নুকতাহীন)",
    dotsCount: 0,
    dotsPosition: "none",
    dotsDescriptionBn: "আলিফের ওপরে বা নিচে কোনো নুকতা থাকে না (নুকতাহীন হরফ)।",
    
    // Explicit 3-part pedagogical distinction: Name vs Hamzah vs Madd Alif
    letterNameExplanationBn: "এই হরফটির নাম হলো 'আলিফ' (أَلِف)। নূরানী কায়দার প্রথম তখতীতে একে কোনো টানাটানি ছাড়া স্বাভাবিকভাবে 'আলিফ' পড়তে হয়।",
    hamzahDistinctionBn: "খালি আলিফের নিজস্ব কোনো ব্যঞ্জনধ্বনি নেই। সোজা রেখার ওপর বা নিচে যখনই যবর, যের, পেশ বা জযম থাকে (أ / إ / أْ), তখন তাজবীদ ও আরবী ব্যাকরণ অনুযায়ী তা আসলে 'হামযাহ' (ء)।",
    maddExplanationBn: "খালি আলিফ যখন কোনো যবরযুক্ত হরফের পরে আসে (যেমন: بَا - 'বাআ'), তখন তা ১ আলিফ (২ হরকত) টেনে পড়ার দীর্ঘস্বর (মাদ্দ) হিসেবে কাজ করে। তখন এর উচ্চারণস্থল হয় মৌখিক গহ্বর (আল-জাওফ)।",
    childExplanationBn:
      "আলিফ হলো পবিত্র কুরআনের সর্বপ্রথম হরফ! এটি দেখতে একদম সোজা একটি লাঠির মতো দাঁড়িয়ে থাকে। এর গায়ে কোনো নুকতা থাকে না। নূরানী কায়দায় একে মিষ্টি করে এর নাম ধরে 'আলিফ' পড়তে হয়।",
    
    playDiscoveryPrompt: "সোজা দাঁড়িয়ে থাকা নুকতাহীন 'আলিফ' (ا) হরফটি ছুঁয়ে দাও!",
    distractorOptions: ["ب", "ت", "ج"],
    
    // 2 Essential Objectives with Randomized Variants for Each
    assessmentObjectives: [
      {
        id: "alif_obj_audio",
        type: "audio_match",
        objectiveTitleBn: "শ্রবণভিত্তিক হরফ সনাক্তকরণ (Auditory Recognition)",
        variants: [
          {
            id: "alif_q1_var_a",
            questionBn: "ক্বারী সাহেবের তিলাওয়াত শুনে সঠিক হরফটিতে স্পর্শ করো:",
            expectedLetter: "ا",
            options: ["ا", "ب", "ج"],
            hintBn: "মনোযোগ দিয়ে শোনো! ক্বারী সাহেব বলছেন 'আলিফ' — যা দেখতে সোজা লাঠির মতো এবং কোনো নুকতা নেই।",
          },
          {
            id: "alif_q1_var_b",
            questionBn: "মনোযোগ দিয়ে আওয়াজটি শোনো, ক্বারী সাহেব কোন হরফটি তিলাওয়াত করেছেন?",
            expectedLetter: "ا",
            options: ["ب", "ا", "ن"],
            hintBn: "আওয়াজটি খেয়াল করো: 'আলিফ'। এটি সম্পূর্ণ নুকতাহীন সোজা হরফ।",
          },
          {
            id: "alif_q1_var_c",
            questionBn: "নিচের হরফগুলোর মধ্য থেকে ক্বারীর মুখে উচ্চারিত 'আলিফ' হরফটি বাছাই করো:",
            expectedLetter: "ا",
            options: ["ت", "ج", "ا"],
            hintBn: "ক্বারী সাহেব 'আলিফ' পড়েছেন। আলিফ দেখতে একটি সোজা খাড়া রেখার মতো।",
          },
        ],
      },
      {
        id: "alif_obj_feature",
        type: "feature_match",
        objectiveTitleBn: "হরফের রূপ ও নুকতাহীন বৈশিষ্ট্য সনাক্তকরণ (Feature Recognition)",
        variants: [
          {
            id: "alif_q2_var_a",
            questionBn: "কোন হরফটিতে কোনো নুকতা নেই এবং দেখতে সম্পূর্ণ সোজা লাঠির মতো দাঁড়িয়ে থাকে?",
            expectedLetter: "ا",
            options: ["ا", "ب", "ن"],
            hintBn: "আলিফের গায়ে কোনো নুকতা থাকে না। 'বা'-এর নিচে ১টি এবং 'নূন'-এর পেটে ১টি নুকতা থাকে।",
          },
          {
            id: "alif_q2_var_b",
            questionBn: "নিচের কোনটি সম্পূর্ণ নুকতাহীন (০ নুকতা) আলিফ হরফ?",
            expectedLetter: "ا",
            options: ["ت", "ا", "ب"],
            hintBn: "আলিফ হলো সম্পূর্ণ নুকতাহীন হরফ; কোনো ফোঁটা বা নুকতা এর ওপরে বা নিচে থাকে না।",
          },
          {
            id: "alif_q2_var_c",
            questionBn: "আরবি বর্ণমালার সর্বপ্রথম সোজা দাঁড়িয়ে থাকা হরফ কোনটি?",
            expectedLetter: "ا",
            options: ["ج", "ب", "ا"],
            hintBn: "আরবি বর্ণমালার প্রথম হরফ হলো আলিফ (ا), যা কোনো বাঁকা অংশ বা নুকতা ছাড়াই সোজা দাঁড়িয়ে থাকে।",
          },
        ],
      },
    ],

    // Default assessment active questions (backwards-compatible with tests)
    assessment: [
      {
        id: "alif_q1_audio",
        type: "audio_match",
        objectiveTitleBn: "শ্রবণভিত্তিক হরফ সনাক্তকরণ (Auditory Recognition)",
        questionBn: "ক্বারী সাহেবের তিলাওয়াত শুনে সঠিক হরফটিতে স্পর্শ করো:",
        expectedLetter: "ا",
        options: ["ا", "ب", "ج"],
        hintBn: "মনোযোগ দিয়ে শোনো! ক্বারী সাহেব বলছেন 'আলিফ' — যা দেখতে সোজা লাঠির মতো এবং কোনো নুকতা নেই।",
      },
      {
        id: "alif_q2_feature",
        type: "feature_match",
        objectiveTitleBn: "হরফের রূপ ও নুকতাহীন বৈশিষ্ট্য সনাক্তকরণ (Feature Recognition)",
        questionBn: "কোন হরফটিতে কোনো নুকতা নেই এবং দেখতে সম্পূর্ণ সোজা লাঠির মতো দাঁড়িয়ে থাকে?",
        expectedLetter: "ا",
        options: ["ا", "ب", "ن"],
        hintBn: "আলিফের গায়ে কোনো নুকতা থাকে না। 'বা'-এর নিচে ১টি এবং 'নূন'-এর পেটে ১টি নুকতা থাকে।",
      },
    ],
  },
  {
    id: "lesson_baa",
    lessonNumber: 2,
    letter: "ب",
    nameBn: "বা",
    nameAr: "بَاء",
    audioUrl: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter01/Page1-2.m4a",
    audioTrackNumber: 2,

    // Multi-tier Audio Verification Status
    audioStatus: {
      source: "Noorani Qaida Takhti 1 Studio Track",
      fileAvailability: "HTTP 200 OK Verified",
      browserPlayback: "Verified",
      humanListening: "Pending",
      qualifiedQariApproval: "Pending",
    },

    makhrajNumber: 16,
    makhrajZoneBn: "আশ-শাফাতান (দুই ঠোঁটের ভিজা অংশ)",
    makhrajDescriptionBn:
      "দুই ঠোঁটের ভেতরের ভিজা অংশ পরস্পরের সাথে সুন্দরভাবে মিলিয়ে আলতো ধাক্কায় স্পষ্ট 'বা' উচ্চারিত হয়।",
    letterVisualMetaphor: "ভাসমান একটি সুন্দর নৌকা, যার নিচে ১টি গোল নুকতা",
    dotsCount: 1,
    dotsPosition: "bottom",
    dotsDescriptionBn: "বা হরফের নিচে ঠিক ১টি গোল নুকতা থাকে (১ নুকতাযুক্ত হরফ)।",
    
    // Explicit distinction: Name vs Makhraj pronunciation
    letterNameExplanationBn: "এই হরফটির নাম হলো 'বা' (بَاء)।",
    maddExplanationBn: "বা-এর সাথে খালি আলিফ যুক্ত হলে তা ১ আলিফ টেনে 'বাআ' (بَا) পড়তে হয়।",
    hamzahDistinctionBn: "বা একটি স্বাতন্ত্র্যসূচক ঠোঁটের হরফ, যা দুই ঠোঁটের ভেতরের ভিজা অংশ থেকে উচ্চারিত হয়।",
    childExplanationBn:
      "বা হলো আরবি হরফের দ্বিতীয় হরফ! এটি দেখতে একটি সুন্দর মিষ্টি নৌকার মতো, আর নৌকার ঠিক নিচে বসে আছে ১টি গোল নুকতা! দুই ঠোঁটের ভেতরের ভিজা অংশ আলতোভাবে মিলিয়ে সুন্দর করে 'বা' পড়তে হয়।",
    
    playDiscoveryPrompt: "নৌকার মতো দেখতে আর নিচে ১টি নুকতাওয়ালা 'বা' (ب) হরফটি ছুঁয়ে দাও!",
    distractorOptions: ["ا", "ت", "ث"],
    
    // 2 Essential Objectives with Randomized Variants for Each
    assessmentObjectives: [
      {
        id: "baa_obj_audio",
        type: "audio_match",
        objectiveTitleBn: "শ্রবণভিত্তিক হরফ সনাক্তকরণ (Auditory Recognition)",
        variants: [
          {
            id: "baa_q1_var_a",
            questionBn: "ক্বারী সাহেবের তিলাওয়াত শুনে সঠিক হরফটি বাছাই করো:",
            expectedLetter: "ب",
            options: ["ت", "ب", "ا"],
            hintBn: "ক্বারী সাহেব স্পষ্ট করে বলছেন 'বা'। এর নিচে ঠিক ১টি গোল নুকতা থাকে!",
          },
          {
            id: "baa_q1_var_b",
            questionBn: "মনোযোগ দিয়ে আওয়াজটি শোনো, ক্বারী সাহেব কোন হরফটি তিলাওয়াত করেছেন?",
            expectedLetter: "ب",
            options: ["ث", "ب", "ا"],
            hintBn: "আওয়াজটি শুনো: দুই ঠোঁট মিলিয়ে পড়া হয়েছে 'বা'। নৌকার মতো হরফের নিচে ১টি নুকতা।",
          },
          {
            id: "baa_q1_var_c",
            questionBn: "নিচের হরফগুলো থেকে ক্বারীর মুখে উচ্চারিত 'বা' (ب) হরফটিতে স্পর্শ করো:",
            expectedLetter: "ب",
            options: ["ব", "তা", "না"].map(x => x === "ব" ? "ب" : x === "তা" ? "ت" : "ن"),
            hintBn: "ক্বারী সাহেব 'বা' পড়েছেন। 'তা'-এর ওপরে ২টি নুকতা থাকে, কিন্তু 'বা'-এর নিচে ১টি নুকতা।",
          },
        ],
      },
      {
        id: "baa_obj_feature",
        type: "feature_match",
        objectiveTitleBn: "নুকতার অবস্থান সনাক্তকরণ (Dot Placement Recognition)",
        variants: [
          {
            id: "baa_q2_var_a",
            questionBn: "কোন হরফটির নিচে ঠিক ১টি গোল নুকতা থাকে?",
            expectedLetter: "ب",
            options: ["ب", "ت", "ا"],
            hintBn: "'বা'-এর নিচে ১টি নুকতা। 'তা'-এর ওপরে ২টি নুকতা থাকে এবং আলিফে কোনো নুকতা থাকে না।",
          },
          {
            id: "baa_q2_var_b",
            questionBn: "কিশতি বা নৌকার মতো দেখতে কোন হরফটির নিচে ১টি ফোঁটা (নুকতা) রয়েছে?",
            expectedLetter: "ب",
            options: ["ن", "ب", "ث"],
            hintBn: "নৌকার ঠিক নিচে ১টি নুকতা থাকলে তা হয় 'বা' (ب)। 'নূন'-এর পেটের ভেতর নুকতা থাকে।",
          },
          {
            id: "baa_q2_var_c",
            questionBn: "নিচের কোন হরফটি দুই ঠোঁট মিলিয়ে ১টি নিচের নুকতাসহ পড়তে হয়?",
            expectedLetter: "ب",
            options: ["ا", "ب", "ت"],
            hintBn: "দুই ঠোঁট মিলিয়ে নিচে ১ নুকতাওয়ালা হরফটি হলো 'বা' (ب)।",
          },
        ],
      },
    ],

    // Default assessment active questions (backwards-compatible with tests)
    assessment: [
      {
        id: "baa_q1_audio",
        type: "audio_match",
        objectiveTitleBn: "শ্রবণভিত্তিক হরফ সনাক্তকরণ (Auditory Recognition)",
        questionBn: "ক্বারী সাহেবের তিলাওয়াত শুনে সঠিক হরফটি বাছাই করো:",
        expectedLetter: "ب",
        options: ["ت", "ب", "ا"],
        hintBn: "ক্বারী সাহেব স্পষ্ট করে বলছেন 'বা'। এর নিচে ঠিক ১টি গোল নুকতা থাকে!",
      },
      {
        id: "baa_q2_feature",
        type: "feature_match",
        objectiveTitleBn: "নুকতার অবস্থান সনাক্তকরণ (Dot Placement Recognition)",
        questionBn: "কোন হরফটির নিচে ঠিক ১টি গোল নুকতা থাকে?",
        expectedLetter: "ب",
        options: ["ب", "ت", "ا"],
        hintBn: "'বা'-এর নিচে ১টি নুকতা। 'তা'-এর ওপরে ২টি নুকতা থাকে এবং আলিফে কোনো নুকতা থাকে না।",
      },
    ],
  },
  {
    id: "lesson_taa",
    lessonNumber: 3,
    letter: "ت",
    nameBn: "তা",
    nameAr: "تَاء",
    audioUrl: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter01/Page1-3.m4a",
    audioTrackNumber: 3,

    // Multi-tier Audio Verification Status
    audioStatus: {
      source: "Noorani Qaida Takhti 1 Studio Track",
      fileAvailability: "HTTP 200 OK Verified",
      browserPlayback: "Verified",
      humanListening: "Pending",
      qualifiedQariApproval: "Pending",
    },

    makhrajNumber: 12,
    makhrajZoneBn: "আল-লিসান (জিহ্বার আগা ও ওপরের দাঁতের গোড়া)",
    makhrajDescriptionBn:
      "জিহ্বার আগা সামনের ওপরের দুই দাঁতের গোড়ার সাথে শক্তভাবে লাগিয়ে বাতাস আটকে রেখে 'তা' উচ্চারিত হয়। জযম বা সাকিন অবস্থায় শব্দ আটকে যাওয়ার পর মৃদু বাতাসের হালকা ফিসফিসানি (হাম্স) বের হয়। এতে কোনো কলকলাহ নেই।",
    letterVisualMetaphor: "ভাসমান কিশতি বা নৌকা, যার ওপরে ঠিক ২টি গোল নুকতা (চোখের মতো)",
    dotsCount: 2,
    dotsPosition: "top",
    dotsDescriptionBn: "তা হরফের পেটের ওপরে ঠিক ২টি গোল নুকতা থাকে (ওপরে ২ নুকতাযুক্ত হরফ)।",

    letterNameExplanationBn: "এই হরফটির নাম হলো 'তা' (تَاء)। নূরানী কায়দার ১ম তখতীতে একে স্বাভাবিক স্বরে 'তা' পড়তে হয়।",
    maddExplanationBn: "তা-এর সাথে খালি আলিফ যুক্ত হলে তা ১ আলিফ টেনে 'তাআ' (تَا) পড়তে হয়।",
    hamzahDistinctionBn:
      "তা একটি পাতলা হরফ (ইস্তিফাল ও ইনফিতাহ)। এটিকে তোয়া (ط) এর মতো মোটা (তাফখীম) করা যাবে না এবং বা (ب) বা ছা (ث) এর সাথে নুকতার পার্থক্য খেয়াল রাখতে হবে। এতে কোনো কলকলাহ নেই।",
    sifatSummaryBn: "হাম্স (হালকা শ্বাস), শিদ্দাহ (আওয়াজ আটকে যাওয়া), ইস্তিফাল ও ইনফিতাহ (পাতলা হরফ) এবং ইসমাত। এতে কলকলাহ নেই।",
    childExplanationBn:
      "তা দেখতে বা-এর মতোই একটি সুন্দর কিশতি বা নৌকা! তবে এর নুকতা নিচে নয়, নৌকার ওপরে ঠিক ২টি গোল চোখ বা নুকতা বসে আছে! জিহ্বার আগা ওপরের দাঁতের গোড়ায় লাগিয়ে মিষ্টি করে পাতলা স্বরে 'তা' পড়তে হয়।",

    playDiscoveryPrompt: "নৌকার মতো দেখতে আর ওপরে ২টি নুকতাওয়ালা 'তা' (ت) হরফটি ছুঁয়ে দাও!",
    distractorOptions: ["ب", "ث", "ط"],

    assessmentObjectives: [
      {
        id: "taa_obj_audio",
        type: "audio_match",
        objectiveTitleBn: "শ্রবণভিত্তিক হরফ সনাক্তকরণ (Auditory Recognition)",
        variants: [
          {
            id: "taa_q1_var_a",
            questionBn: "ক্বারী সাহেবের মুখে 'তা' তিলাওয়াত শুনে সঠিক হরফটিতে স্পর্শ করো:",
            expectedLetter: "ت",
            options: ["ب", "ت", "ث"],
            hintBn: "ক্বারী সাহেব পড়েছেন 'তা'। এর ওপরে ঠিক ২টি গোল নুকতা থাকে। বা-এর নিচে ১টি এবং ছা-এর ওপরে ৩টি নুকতা থাকে।",
          },
          {
            id: "taa_q1_var_b",
            questionBn: "মনোযোগ দিয়ে আওয়াজটি শোনো, ক্বারী সাহেব কোন হরফটি তিলাওয়াত করেছেন?",
            expectedLetter: "ت",
            options: ["ط", "ت", "ا"],
            hintBn: "আওয়াজটি খেয়াল করো: দাঁতের গোড়ায় লাগিয়ে পাতলা স্বরে পড়া হয়েছে 'তা'। তোয়া (ط) হলো মোটা হরফ।",
          },
          {
            id: "taa_q1_var_c",
            questionBn: "নিচের হরফগুলো থেকে ক্বারীর মুখে উচ্চারিত 'তা' (ت) হরফটি বাছাই করো:",
            expectedLetter: "ت",
            options: ["ت", "ب", "ن"],
            hintBn: "ক্বারী সাহেব 'তা' পড়েছেন। নৌকার পেটের ওপর ২টি নুকতা দেখে চিনে নাও।",
          },
        ],
      },
      {
        id: "taa_obj_feature",
        type: "feature_match",
        objectiveTitleBn: "নুকতার সংখ্যা ও অবস্থান সনাক্তকরণ (Feature Recognition)",
        variants: [
          {
            id: "taa_q2_var_a",
            questionBn: "নৌকার মতো দেখতে কোন হরফটির ওপরে ঠিক ২টি গোল নুকতা থাকে?",
            expectedLetter: "ت",
            options: ["ت", "ب", "ث"],
            hintBn: "'তা'-এর ওপরে ২টি নুকতা। 'বা'-এর নিচে ১টি এবং 'ছা'-এর ওপরে ৩টি নুকতা থাকে।",
          },
          {
            id: "taa_q2_var_b",
            questionBn: "নিচের কোন হরফটিতে ওপরে ২টি চোখ বা নুকতা রয়েছে?",
            expectedLetter: "ت",
            options: ["ا", "ت", "ب"],
            hintBn: "হরফটির ওপরে ২টি নুকতা থাকলে তা হয় 'তা' (ت)। আলিফে কোনো নুকতা থাকে না।",
          },
          {
            id: "taa_q2_var_c",
            questionBn: "জিহ্বার আগা ওপরের দাঁতের গোড়ায় লাগিয়ে পড়া ২-নুকতাওয়ালা পাতলা হরফ কোনটি?",
            expectedLetter: "ت",
            options: ["ط", "ب", "ت"],
            hintBn: "ওপরের দাঁতের গোড়ায় স্পর্শ করে ওপরে ২ নুকতাযুক্ত হরফটি হলো 'তা' (ت)। তোয়া (ط) নুকতাহীন মোটা হরফ।",
          },
        ],
      },
    ],

    assessment: [
      {
        id: "taa_q1_audio",
        type: "audio_match",
        objectiveTitleBn: "শ্রবণভিত্তিক হরফ সনাক্তকরণ (Auditory Recognition)",
        questionBn: "ক্বারী সাহেবের মুখে 'তা' তিলাওয়াত শুনে সঠিক হরফটিতে স্পর্শ করো:",
        expectedLetter: "ت",
        options: ["ب", "ت", "ث"],
        hintBn: "ক্বারী সাহেব পড়েছেন 'তা'। এর ওপরে ঠিক ২টি গোল নুকতা থাকে।",
      },
      {
        id: "taa_q2_feature",
        type: "feature_match",
        objectiveTitleBn: "নুকতার সংখ্যা ও অবস্থান সনাক্তকরণ (Feature Recognition)",
        questionBn: "নৌকার মতো দেখতে কোন হরফটির ওপরে ঠিক ২টি গোল নুকতা থাকে?",
        expectedLetter: "ت",
        options: ["ت", "ب", "ث"],
        hintBn: "'তা'-এর ওপরে ২টি নুকতা থাকে।",
      },
    ],
  },
  {
    id: "lesson_thaa",
    lessonNumber: 4,
    letter: "ث",
    nameBn: "ছা",
    nameAr: "ثَاء",
    audioUrl: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter01/Page1-4.m4a",
    audioTrackNumber: 4,

    // Multi-tier Audio Verification Status
    audioStatus: {
      source: "Noorani Qaida Takhti 1 Studio Track",
      fileAvailability: "HTTP 200 OK Verified",
      browserPlayback: "Verified",
      humanListening: "Pending",
      qualifiedQariApproval: "Pending",
    },

    makhrajNumber: 14,
    makhrajZoneBn: "আল-লিসান (জিহ্বার আগা ও ওপরের দাঁতের আগা)",
    makhrajDescriptionBn:
      "জিহ্বার আগা সামনের ওপরের দুই দাঁতের আগা বা ধারের সাথে আলতো নরমভাবে লাগিয়ে বাতাস ছেড়ে দিয়ে 'ছা' উচ্চারিত হয়। এটি কোনো শিসধ্বনিযুক্ত (সাফীর) হরফ নয় এবং এতে কোনো কলকলাহ নেই।",
    letterVisualMetaphor: "ভাসমান কিশতি বা নৌকা, যার ওপরে ত্রিভুজাকারে সাজানো ৩টি গোল নুকতা",
    dotsCount: 3,
    dotsPosition: "top",
    dotsDescriptionBn: "ছা হরফের পেটের ওপরে ত্রিভুজাকারে ঠিক ৩টি গোল নুকতা থাকে (ওপরে ৩ নুকতাযুক্ত হরফ)।",

    letterNameExplanationBn: "এই হরফটির নাম হলো 'ছা' (ثَاء)। নূরানী কায়দায় একে নরম সুরে পড়তে হয়।",
    maddExplanationBn: "ছা-এর সাথে খালি আলিফ যুক্ত হলে তা ১ আলিফ টেনে 'ছাআ' (ثَا) পড়তে হয়।",
    hamzahDistinctionBn:
      "ছা উচ্চারণে জিহ্বার আগা সামনের দাঁতের আগায় আলতো ছুঁয়ে নরম ধ্বনি দিতে হয় (ইংরেজি 'thin' শব্দের মতো)। বাংলা ছ বা স এর সাথে এটি পুরোপুরি এক নয়; ছা কোনো সাফীর (শিসধ্বনিযুক্ত) হরফ নয় এবং এতে কোনো কলকলাহ নেই।",
    sifatSummaryBn: "হাম্স (শ্বাসের প্রবাহ), রাখাওয়া (আওয়াজের প্রবাহ), ইস্তিফাল ও ইনফিতাহ (পাতলা হরফ) এবং ইসমাত। এটি সাফীর (শিসধ্বনি) হরফ নয় এবং এতে কলকলাহ নেই।",
    childExplanationBn:
      "ছা হলো কুরআনের সবচেয়ে নরম হরফ! নৌকার ওপরে পিরামিডের মতো সুন্দর ৩টি গোল নুকতা থাকে। ইংরেজি 'thin' শব্দের শুরুর মতো করে জিহ্বার আগা ওপরের দাঁতের আগায় আলতো ছুঁইয়ে নরম সুরে মিষ্টি করে 'ছা' পড়তে হয়। মনে রাখবে—সীন (س)-এর মতো কোনো শিসধ্বনি দেওয়া যাবে না!",

    playDiscoveryPrompt: "নৌকার মতো দেখতে আর ওপরে ৩টি নুকতাওয়ালা নরম হরফ 'ছা' (ث) ছুঁয়ে দাও!",
    distractorOptions: ["ت", "س", "ب"],

    assessmentObjectives: [
      {
        id: "thaa_obj_audio",
        type: "audio_match",
        objectiveTitleBn: "শ্রবণভিত্তিক হরফ সনাক্তকরণ (Auditory Recognition)",
        variants: [
          {
            id: "thaa_q1_var_a",
            questionBn: "ক্বারী সাহেবের তিলাওয়াত শুনে নরম হরফ 'ছা' (Thaa) বাছাই করো:",
            expectedLetter: "ث",
            options: ["ت", "ث", "ب"],
            hintBn: "ক্বারী সাহেব নরম সুরে পড়েছেন 'ছা' (ইংরেজি thin-এর মতো)। এর ওপরে ৩টি গোল নুকতা থাকে!",
          },
          {
            id: "thaa_q1_var_b",
            questionBn: "মনোযোগ দিয়ে শোনো, শিসধ্বনি ছাড়া নরমভাবে কোন হরফটি পড়া হয়েছে?",
            expectedLetter: "ث",
            options: ["س", "ث", "ت"],
            hintBn: "আওয়াজটি খেয়াল করো: শিসধ্বনি ছাড়া নরম হরফ হলো 'ছা' (ث)। সীন (س) হরফে তীব্র শিসধ্বনি থাকে।",
          },
          {
            id: "thaa_q1_var_c",
            questionBn: "নিচের হরফগুলো থেকে ক্বারীর মুখে উচ্চারিত 'ছা' (ث) হরফটিতে স্পর্শ করো:",
            expectedLetter: "ث",
            options: ["ث", "ب", "ا"],
            hintBn: "ক্বারী সাহেব 'ছা' পড়েছেন। নৌকার ওপরে পিরামিডের মতো ৩টি নুকতা থাকে।",
          },
        ],
      },
      {
        id: "thaa_obj_feature",
        type: "feature_match",
        objectiveTitleBn: "নুকতার সংখ্যা ও নরম উচ্চারণ সনাক্তকরণ (Feature Recognition)",
        variants: [
          {
            id: "thaa_q2_var_a",
            questionBn: "কোন হরফটির ওপরে ঠিক ৩টি গোল নুকতা ত্রিভুজাকারে সাজানো থাকে?",
            expectedLetter: "ث",
            options: ["ث", "ت", "ب"],
            hintBn: "'ছা'-এর ওপরে ৩টি নুকতা থাকে। 'তা'-এর ওপরে ২টি এবং 'বা'-এর নিচে ১টি নুকতা।",
          },
          {
            id: "thaa_q2_var_b",
            questionBn: "দাঁতের আগায় জিহ্বা লাগিয়ে পড়া ৩-নুকতাওয়ালা নরম হরফ কোনটি?",
            expectedLetter: "ث",
            options: ["ت", "ث", "ن"],
            hintBn: "ওপরের দাঁতের আগায় জিহ্বা লাগিয়ে ৩টি নুকতাসহ পড়া হয় 'ছা' (ث)।",
          },
          {
            id: "thaa_q2_var_c",
            questionBn: "নিচের কোনটি ইংরেজি 'thin' শব্দের মতো নরম করে পড়া ৩ নুকতার হরফ?",
            expectedLetter: "ث",
            options: ["ب", "ت", "ث"],
            hintBn: "ইংরেজি 'thin' ধ্বনির মতো ৩ নুকতাওয়ালা নরম হরফটি হলো 'ছা' (ث)।",
          },
        ],
      },
    ],

    assessment: [
      {
        id: "thaa_q1_audio",
        type: "audio_match",
        objectiveTitleBn: "শ্রবণভিত্তিক হরফ সনাক্তকরণ (Auditory Recognition)",
        questionBn: "ক্বারী সাহেবের তিলাওয়াত শুনে নরম হরফ 'ছা' (Thaa) বাছাই করো:",
        expectedLetter: "ث",
        options: ["ت", "ث", "ب"],
        hintBn: "ক্বারী সাহেব নরম সুরে পড়েছেন 'ছা'। এর ওপরে ৩টি গোল নুকতা থাকে।",
      },
      {
        id: "thaa_q2_feature",
        type: "feature_match",
        objectiveTitleBn: "নুকতার সংখ্যা ও নরম উচ্চারণ সনাক্তকরণ (Feature Recognition)",
        questionBn: "কোন হরফটির ওপরে ঠিক ৩টি গোল নুকতা ত্রিভুজাকারে সাজানো থাকে?",
        expectedLetter: "ث",
        options: ["ث", "ت", "ب"],
        hintBn: "'ছা'-এর ওপরে ৩টি নুকতা থাকে।",
      },
    ],
  },
];

export const STAGE_STEPS = [
  { id: "INTRODUCE", label: "১. পরিচয়", title: "হরফের পরিচয়" },
  { id: "DEMONSTRATE", label: "২. মাখরাজ", title: "বিশুদ্ধ মাখরাজ" },
  { id: "LISTEN", label: "৩. শুনি", title: "ক্বারীর তিলাওয়াত" },
  { id: "PRACTICE", label: "৪. মাশক", title: "শুনো ও মুখে পড়ো" },
  { id: "PLAY", label: "৫. খেলি", title: "খেলার ছলে চেনা" },
  { id: "ASSESS", label: "৬. পরীক্ষা", title: "যাচাই ও মূল্যায়ন" },
  { id: "CORRECT", label: "৭. সংশোধন", title: "ভুল সংশোধন" },
  { id: "REPEAT", label: "৮. মাশক", title: "পুনরাবৃত্তি" },
  { id: "REWARD", label: "৯. মাশাআল্লাহ", title: "তারকার পুরস্কার" },
  { id: "PROGRESS", label: "১০. অগ্রগতি", title: "পরবর্তী পাঠ আনলক" },
];
