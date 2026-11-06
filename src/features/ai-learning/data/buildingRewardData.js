/**
 * Data-Driven Building Reward Progression System
 * Rahmania Institute / Nur AI Quran Learning Platform
 * 
 * Each educational game has its own progressive building journey:
 * 1. Vehicle Building Journey (Super Noor Car) - Drag & Drop (14 Levels)
 * 2. Playground Adventure (Kids Fun Park) - Balloon Pop (6 Levels)
 * 3. Dream House Journey (Noor Cottage) - Memory Match (7 Levels)
 * 4. Space Rocket Journey (Noor Rocket) - Sound Detective (5 Levels)
 * 5. Fruit Garden of Deeds (Amal Garden) - Dot Count (5 Levels)
 * 6. Noor City & Mosque (Islamic Village) - Harakat Master (9 Levels)
 * 7. Castle of Knowledge (Ilm Palace) - Trace Letter (6 Groups)
 */

export const BUILDING_JOURNEYS = {
  "drag-drop-letter": {
    id: "drag-drop-letter",
    themeId: "super-car",
    titleBn: "সুপার নূর কার নির্মাণ যাত্রা",
    titleEn: "Super Noor Car Construction",
    descriptionBn: "প্রতিটি স্তর সম্পন্ন করে একটি করে যন্ত্রাংশ জোড়া লাগাও এবং তোমার সম্পূর্ণ নূর কার তৈরি করো!",
    finalCelebrationTitle: "আলহামদুলিল্লাহ! তোমার সুপার নূর কার প্রস্তুত!",
    icon: "🚗",
    totalMilestones: 14,
    components: [
      { level: 1, id: "chassis", nameBn: "মজবুত স্টিল ফ্রেম ও বেস", icon: "🛠️", percent: 7, descBn: "গাড়ির শক্তিশালী কাঠামো তৈরি হলো!" },
      { level: 2, id: "rear-wheels", nameBn: "পাওয়ার গ্রিপ পেছনের চাকা", icon: "🛞", percent: 14, descBn: "পেছনের দুটি শক্ত চাকা লাগানো হলো!" },
      { level: 3, id: "front-wheels", nameBn: "স্মার্ট টার্নিং সামনের চাকা", icon: "🛞", percent: 21, descBn: "সামনের চাকা যুক্ত হয়ে গাড়ি দাঁড়ালো!" },
      { level: 4, id: "engine", nameBn: "সুপার টার্বো ইঞ্জিন", icon: "⚙️", percent: 28, descBn: "শক্তিশালী ইঞ্জিন গর্জে উঠল!" },
      { level: 5, id: "body-shell", nameBn: "অ্যারোডাইনামিক নীল বডি", icon: "🚘", percent: 35, descBn: "চকচকে বডি কাঠামো বসে গেল!" },
      { level: 6, id: "doors", nameBn: "ডুয়াল উইং সাইড ডোর", icon: "🚪", percent: 42, descBn: "দুই পাশের চমৎকার দরজা যুক্ত হলো!" },
      { level: 7, id: "windshield", nameBn: "স্বচ্ছ ক্রিস্টাল উইন্ডশীল্ড", icon: "🪟", percent: 50, descBn: "সামনের কাঁচ লাগানো সম্পন্ন!" },
      { level: 8, id: "headlights", nameBn: "উজ্জ্বল এলইডি নূর হেডলাইট", icon: "💡", percent: 57, descBn: "রাতের আঁধারে আলো ছড়াবে এই বাতি!" },
      { level: 9, id: "steering", nameBn: "স্পোর্টস স্টিয়ারিং ও ড্যাশবোর্ড", icon: "🎮", percent: 64, descBn: "চালকের কেবিন ও মিটার প্রস্তুত!" },
      { level: 10, id: "seats", nameBn: "আরামদায়ক লেদার সিট", icon: "💺", percent: 71, descBn: "বসার আরামদায়ক আসন বসে গেল!" },
      { level: 11, id: "spoiler", nameBn: "রেসিং স্পয়লার ও উইং", icon: "🏎️", percent: 78, descBn: "বাতাস কেটে দ্রুত চলার ডানা তৈরি!" },
      { level: 12, id: "decals", nameBn: "স্বর্ণালী ডিক্যাল ও নূর ব্যাজ", icon: "✨", percent: 85, descBn: "গাড়িতে যুক্ত হলো রাজকীয় নূর ডিক্যাল!" },
      { level: 13, id: "golden-rims", nameBn: "স্বর্ণালী লাক্সারি অ্যালয় রিম", icon: "🟡", percent: 92, descBn: "চাকায় যুক্ত হলো সোনার জমকালো রিম!" },
      { level: 14, id: "noor-crown", nameBn: "নূর গোল্ডেন তারা মুকুট", icon: "👑", percent: 100, descBn: "পূর্ণাঙ্গ সুপার নূর কারের রাজকীয় মুকুট!" },
    ],
  },

  "balloon-pop": {
    id: "balloon-pop",
    themeId: "play-park",
    titleBn: "শিশুদের আনন্দ পার্ক নির্মাণ",
    titleEn: "Kids Fun Park Construction",
    descriptionBn: "হরকত বেলুন ফুটিয়ে আনন্দ পার্কের দোলনা, স্লাইড ও ফোয়ারা আনলক করো!",
    finalCelebrationTitle: "মাশাআল্লাহ! আনন্দ পার্ক পুরোপুরি তৈরি!",
    icon: "🎡",
    totalMilestones: 3,
    components: [
      { level: 1, id: "lawn", nameBn: "সবুজ ঘাসের মাঠ ও ফুলের বেড়া", icon: "🌷", percent: 33, descBn: "পার্কের ভিত্তিভূমি সবুজ হয়ে উঠল!" },
      { level: 2, id: "swing", nameBn: "রঙিন আনন্দের দোলনা", icon: "🎠", percent: 66, descBn: "বাতাসে দোলার চমৎকার দোলনা যুক্ত হলো!" },
      { level: 3, id: "ferris-wheel", nameBn: "বিশাল ঘূর্ণি নাগরদোলা ও আলোর ঝর্ণা", icon: "🎡", percent: 100, descBn: "পূর্ণাঙ্গ আনন্দ পার্ক চালু হয়ে গেল!" },
    ],
  },

  "letter-match": {
    id: "letter-match",
    themeId: "dream-house",
    titleBn: "নূর কুটির (স্বপ্নের বাড়ি) নির্মাণ",
    titleEn: "Noor Cottage Construction",
    descriptionBn: "হরফ স্মৃতি পরীক্ষায় জয়ী হয়ে স্বপ্নের সুন্দর বাড়ি তৈরি করো!",
    finalCelebrationTitle: "আলহামদুলিল্লাহ! তোমার সুন্দর নূর কুটির তৈরি!",
    icon: "🏡",
    totalMilestones: 7,
    components: [
      { level: 1, id: "foundation", nameBn: "মজবুত পাথুরে ভিত্তি ও মেঝে", icon: "🧱", percent: 14, descBn: "বাড়ির শক্ত ভিত্তি স্থাপন হলো!" },
      { level: 2, id: "walls", nameBn: "প্যাস্টেল রঙের দেয়াল", icon: "🏠", percent: 28, descBn: "চারপাশের দেয়াল দাঁড়িয়ে গেল!" },
      { level: 3, id: "main-door", nameBn: "কাঠের অলঙ্কৃত প্রধান দরজা", icon: "🚪", percent: 42, descBn: "স্বাগত জানানোর প্রবেশদ্বার তৈরি!" },
      { level: 4, id: "windows", nameBn: "রঙিন কাঁচের ইসলামিক মেহরাব জানালা", icon: "🪟", percent: 57, descBn: "ঘরে প্রবেশ করল সূর্যের নরম আলো!" },
      { level: 5, id: "roof", nameBn: "লাল টালির ছাদ ও চিমনি", icon: "🛖", percent: 71, descBn: "বৃষ্টি-রোদ থেকে রক্ষার সুন্দর ছাদ!" },
      { level: 6, id: "garden", nameBn: "সম্মুখের বাগান ও ফোয়ারা", icon: "⛲", percent: 85, descBn: "বাড়ির সামনে পানির সুমধুর ফোয়ারা!" },
      { level: 7, id: "lanterns", nameBn: "রাতের সোনালী লণ্ঠন ও তারা", icon: "🏮", percent: 100, descBn: "পূর্ণাঙ্গ নূর কুটির আলোয় উদ্ভাসিত!" },
    ],
  },

  "sound-detective": {
    id: "sound-detective",
    themeId: "space-rocket",
    titleBn: "মহাকাশ নূর রকেট নির্মাণ",
    titleEn: "Noor Space Rocket Construction",
    descriptionBn: "আওয়াজ শনাক্ত করে মহাকাশ অভিযানের জন্য সুপার রকেট প্রস্তুত করো!",
    finalCelebrationTitle: "মাশাআল্লাহ! মহাকাশ রকেট উৎক্ষেপণের জন্য প্রস্তুত!",
    icon: "🚀",
    totalMilestones: 7,
    components: [
      { level: 1, id: "thruster", nameBn: "পাওয়ার থ্রাস্টার বুস্টার", icon: "🔥", percent: 14, descBn: "রকেটের অগ্নিনির্বাপক ইঞ্জিন প্রস্তুত!" },
      { level: 2, id: "fuel-tank", nameBn: "প্রধান জ্বালানি ট্যাংক ও বডি", icon: "⛽", percent: 28, descBn: "রকেটের মূল শরীর দাঁড়িয়ে গেল!" },
      { level: 3, id: "cabin", nameBn: "নভোচারী নূরু কেবিন ও স্কাই উইন্ডো", icon: "🧑‍🚀", percent: 42, descBn: "নভোচারীর কমান্ড কেবিন স্থাপন হলো!" },
      { level: 4, id: "fins", nameBn: "অ্যারো উইং ও নেভিগেশন স্টেবিলাইজার", icon: "🚀", percent: 57, descBn: "রকেটের স্থিতিশীল উড্ডয়ন উইং যুক্ত হলো!" },
      { level: 5, id: "capsule", nameBn: "নূর নক্ষত্র ক্যাপসুল ও সোলার উইংস", icon: "🛸", percent: 71, descBn: "সোলার উইংসের মাধ্যমে শক্তি উৎপাদন শুরু হলো!" },
      { level: 6, id: "satellite-radar", nameBn: "ডিপ-স্পেস অ্যান্টেনা ও রাডার", icon: "📡", percent: 85, descBn: "মহাকাশ সংকেত গ্রহণ ও প্রেরণের রাডার যুক্ত হলো!" },
      { level: 7, id: "galaxy-core", nameBn: "নূর নক্ষত্র ড্রাইভ ও গ্যালাক্সি কোর", icon: "🌌", percent: 100, descBn: "সম্পূর্ণ মহাকাশ রকেট দূর গ্যালাক্সি পাড়ি দেওয়ার জন্য প্রস্তুত!" },
    ],
  },

  "dot-count": {
    id: "dot-count",
    themeId: "fruit-garden",
    titleBn: "ফলবতী আমল বাগান নির্মাণ",
    titleEn: "Amal Fruit Garden Construction",
    descriptionBn: "নুকতা সঠিকভাবে গুনে জান্নাতের বাগানে খেজুর, ডালিম ও ঝর্ণা লাগাও!",
    finalCelebrationTitle: "সুবহানাল্লাহ! তোমার আমল বাগান ফলে-ফুলে সুশোভিত!",
    icon: "🌴",
    totalMilestones: 6,
    components: [
      { level: 1, id: "soil", nameBn: "উর্বর মাটি ও কাঠের বেড়া", icon: "🌱", percent: 16, descBn: "বাগানের নরম উর্বর মাটি প্রস্তুত!" },
      { level: 2, id: "palms", nameBn: "মিষ্টি আজওয়া খেজুরের চারা", icon: "🌴", percent: 33, descBn: "খেজুর গাছের সুন্দর সারি মাথা তুলল!" },
      { level: 3, id: "pomegranates", nameBn: "রঙিন ডালিম ও জলপাই গাছ", icon: "🍎", percent: 50, descBn: "মিষ্টি ফলের সুবাস ছড়িয়ে পড়ল!" },
      { level: 4, id: "stream", nameBn: "স্বচ্ছ কুলকুল পানির নহর", icon: "🌊", percent: 66, descBn: "গাছপালায় বইতে লাগল মিষ্টি পানির ধারা!" },
      { level: 5, id: "birds", nameBn: "পাখির কিচিরমিচির ও মধুর চাক", icon: "🐝", percent: 83, descBn: "পাখির কলতানে আমল বাগান সুবাসে ভরে উঠল!" },
      { level: 6, id: "paradise-gate", nameBn: "জান্নাতুল ফেরদৌসের সুবাসিত রাজতোরণ", icon: "🚪", percent: 100, descBn: "পূর্ণাঙ্গ আমল বাগান সুবাসিত রাজতোরণে শোভিত!" },
    ],
  },

  "harakat-master": {
    id: "harakat-master",
    themeId: "noor-village",
    titleBn: "নূর নগরী ও জামে মসজিদ নির্মাণ",
    titleEn: "Noor City & Grand Mosque Construction",
    descriptionBn: "হরকত ও তানভীনের নির্ভুল পাঠে গড়ে তোলো শান্তির নূর নগরী!",
    finalCelebrationTitle: "আলহামদুলিল্লাহ! নূর নগরী ও জামে মসজিদ নির্মিত!",
    icon: "🕌",
    totalMilestones: 9,
    components: [
      { level: 1, id: "mosque-base", nameBn: "মসজিদের মার্বেল চত্বর", icon: "🏛️", percent: 11, descBn: "পবিত্র চত্বরের ভিত্তি স্থাপন!" },
      { level: 2, id: "walls", nameBn: "সাদা খিলানযুক্ত দেয়াল", icon: "🧱", percent: 22, descBn: "মসজিদের দেয়াল গড়ে উঠল!" },
      { level: 3, id: "main-dome", nameBn: "বিশাল স্বর্ণালী কেন্দ্রীয় গম্বুজ", icon: "🕌", percent: 33, descBn: "আকাশছোঁয়া গম্বুজ স্থাপিত হলো!" },
      { level: 4, id: "minaret-1", nameBn: "প্রথম সুউচ্চ মিনার", icon: "🗼", percent: 44, descBn: "আজানের জন্য প্রথম মিনার প্রস্তুত!" },
      { level: 5, id: "minaret-2", nameBn: "দ্বিতীয় রাজকীয় মিনার", icon: "🗼", percent: 55, descBn: "উভয় মিনার মসজিদে রূপ ছড়ালো!" },
      { level: 6, id: "maktab", nameBn: "নূরানী কুরআন পাঠশালা (মক্তব)", icon: "📖", percent: 66, descBn: "ছোটদের কুরআন পড়ার সুন্দর মক্তব!" },
      { level: 7, id: "fountain", nameBn: "অজুখানা ও পদ্মপুকুর ঝর্ণা", icon: "⛲", percent: 77, descBn: "পবিত্র ওযুর নির্মল পানির চত্বর!" },
      { level: 8, id: "bazaar", nameBn: "শান্তির আলোকময় পথ ও চেরাগ", icon: "🏮", percent: 88, descBn: "নগরীর পথঘাটে জ্বলে উঠল আলো!" },
      { level: 9, id: "crescent", nameBn: "গম্বুজে উজ্জ্বল হেলালী চাঁদ", icon: "🌙", percent: 100, descBn: "পূর্ণাঙ্গ নূর নগরী প্রতিষ্ঠিত হলো!" },
    ],
  },

  "trace-letter": {
    id: "trace-letter",
    themeId: "ilm-castle",
    titleBn: "ইলম প্রাসাদ (জ্ঞাননগরী) নির্মাণ",
    titleEn: "Castle of Knowledge Construction",
    descriptionBn: "আঙুল ঘুরিয়ে নিখুঁত হরফ আঁকো এবং জ্ঞানের রাজপ্রাসাদ গড়ে তোলো!",
    finalCelebrationTitle: "মাশাআল্লাহ! জ্ঞানপ্রাসাদ মহিমান্বিতভাবে সম্পন্ন!",
    icon: "🏰",
    totalMilestones: 4,
    components: [
      { level: 1, id: "gate", nameBn: "জ্ঞানের তোরণ ও তোরণদ্বার", icon: "⛩️", percent: 25, descBn: "জ্ঞানপ্রাসাদের প্রথম ফটক উন্মুক্ত!" },
      { level: 2, id: "pillars", nameBn: "মার্বেল পাথরের খিলান স্তম্ভ", icon: "🏛️", percent: 50, descBn: "প্রাসাদের শক্ত স্তম্ভ দাঁড়িয়ে গেল!" },
      { level: 3, id: "library", nameBn: "গ্রন্থাগার ও স্বর্ণখচিত রিহাল", icon: "📚", percent: 75, descBn: "জ্ঞানভাণ্ডারের আলমারি সুসজ্জিত হলো!" },
      { level: 4, id: "crown-dome", nameBn: "প্রজ্ঞার শীর্ষ মুকুট গম্বুজ", icon: "👑", percent: 100, descBn: "সম্পূর্ণ ইলম প্রাসাদ গৌরবে মাথা তুলল!" },
    ],
  },
};

/**
 * Returns the building journey configuration for a given game ID
 */
export function getBuildingJourney(gameId) {
  return BUILDING_JOURNEYS[gameId] || BUILDING_JOURNEYS["drag-drop-letter"];
}

export default BUILDING_JOURNEYS;

