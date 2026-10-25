/**
 * Quran Data Service with High-Speed Offline Caching,
 * Local Fallbacks for Essential Surahs, and Multi-Qari Audio Integration.
 */

import { getQariAudioUrl } from "@/lib/ai/qari-registry";
import { ALL_SURAHS } from "./quran-meta";

// Curated Local Fallback Dataset for instant offline rendering of popular and essential Surahs
const LOCAL_FALLBACK_SURAHS = {
  1: {
    number: 1,
    name: "سُورَةُ الفَاتِحَةِ",
    englishName: "Al-Faatiha",
    bengaliName: "আল-ফাতিহা",
    numberOfAyahs: 7,
    ayahs: [
      {
        numberInSurah: 1,
        text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        bengali: "শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু।",
        english: "Bismillaahir-Rahmaanir-Raheem",
        juz: 1,
        page: 1,
        words: [
          { ar: "بِسْمِ", bn: "নামে", en: "In (the) name", tajweed: "ইসমুল্লাহ" },
          { ar: "ٱللَّهِ", bn: "আল্লাহর", en: "of Allah", tajweed: "লামে জালালাহ" },
          { ar: "ٱلرَّحْمَٰنِ", bn: "পরম করুণাময়", en: "(the) Most Gracious", tajweed: "খাড়া যবর" },
          { ar: "ٱلرَّحِيمِ", bn: "অতি দয়ালু", en: "(the) Most Merciful", tajweed: "মাদে আরিজ" }
        ]
      },
      {
        numberInSurah: 2,
        text: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
        bengali: "যাবতীয় প্রশংসা শুধুমাত্র আল্লাহ তাআলার যিনি সমগ্র সৃষ্টির পালনকর্তা।",
        english: "Alhamdu lillaahi Rabbil-'aalameen",
        juz: 1,
        page: 1,
        words: [
          { ar: "ٱلْحَمْدُ", bn: "যাবতীয় প্রশংসা", en: "All praise", tajweed: "ইযহার" },
          { ar: "لِلَّهِ", bn: "আল্লাহর জন্য", en: "(is) for Allah", tajweed: "তারকীক" },
          { ar: "رَبِّ", bn: "যিনি রব / পালনকর্তা", en: "Lord", tajweed: "তাশদীদ" },
          { ar: "ٱلْعَٰلَمِينَ", bn: "সমগ্র জাহানের", en: "(of the) worlds", tajweed: "মাদে আরিজ" }
        ]
      },
      {
        numberInSurah: 3,
        text: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        bengali: "যিনি পরম করুণাময় ও অসীম দয়ালু।",
        english: "Ar-Rahmaanir-Raheem",
        juz: 1,
        page: 1,
        words: [
          { ar: "ٱلرَّحْمَٰنِ", bn: "পরম করুণাময়", en: "The Most Gracious", tajweed: "খাড়া যবর" },
          { ar: "ٱلرَّحِيمِ", bn: "অতি দয়ালু", en: "the Most Merciful", tajweed: "মাদে আরিজ" }
        ]
      },
      {
        numberInSurah: 4,
        text: "مَٰلِكِ يَوْمِ ٱلدِّينِ",
        bengali: "যিনি বিচার দিবসের একমাত্র মালিক ও অধিপতি।",
        english: "Maaliki Yawmid-Deen",
        juz: 1,
        page: 1,
        words: [
          { ar: "مَٰلِكِ", bn: "মালিক / অধিপতি", en: "Master", tajweed: "খাড়া যবর" },
          { ar: "يَوْمِ", bn: "দিবসের", en: "(of the) Day", tajweed: "লীন হরফ" },
          { ar: "ٱلدِّينِ", bn: "প্রতিদান / বিচারের", en: "(of) Judgment", tajweed: "মাদে আরিজ" }
        ]
      },
      {
        numberInSurah: 5,
        text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        bengali: "আমরা শুধুমাত্র আপনারই ইবাদত করি এবং শুধুমাত্র আপনারই সাহায্য প্রার্থনা করি।",
        english: "Iyyaaka na'budu wa lyyaaka nasta'een",
        juz: 1,
        page: 1,
        words: [
          { ar: "إِيَّاكَ", bn: "আপনারই", en: "You alone", tajweed: "তাশদীদ" },
          { ar: "نَعْبُدُ", bn: "আমরা ইবাদত করি", en: "we worship", tajweed: "আইন মাখরাজ" },
          { ar: "وَإِيَّاكَ", bn: "এবং আপনারই", en: "and You alone", tajweed: "তাশদীদ" },
          { ar: "نَسْتَعِينُ", bn: "আমরা সাহায্য চাই", en: "we ask for help", tajweed: "মাদে আরিজ" }
        ]
      },
      {
        numberInSurah: 6,
        text: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
        bengali: "আমাদেরকে সরল-সঠিক পথ প্রদর্শন করুন।",
        english: "Ihdinas-Siraatal-Mustaqeem",
        juz: 1,
        page: 1,
        words: [
          { ar: "ٱهْدِنَا", bn: "আমাদের পথ দেখান", en: "Guide us", tajweed: "হামযাতুল ওয়াসল" },
          { ar: "ٱلصِّرَٰطَ", bn: "সোজা পথের", en: "(to) the path", tajweed: "সোয়াদ তাফখীম" },
          { ar: "ٱلْمُسْتَقِيمَ", bn: "যা সরল-সঠিক", en: "the straight", tajweed: "মাদে আরিজ" }
        ]
      },
      {
        numberInSurah: 7,
        text: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
        bengali: "সেসব লোকের পথ যাদের আপনি অনুগ্রহ দান করেছেন, তাদের পথ নয় যারা ক্রোধের শিকার এবং যারা পথভ্রষ্ট।",
        english: "Siraatal-lazeena an'amta 'alayhim ghayril-maghdoobi 'alayhim wa lad-daalleen",
        juz: 1,
        page: 1,
        words: [
          { ar: "صِرَٰطَ", bn: "পথ", en: "(The) path", tajweed: "সোয়াদ" },
          { ar: "ٱلَّذِينَ", bn: "যাদের", en: "(of) those", tajweed: "যাল হরফ" },
          { ar: "أَنْعَمْتَ", bn: "অনুগ্রহ করেছেন", en: "You bestowed favor", tajweed: "ইযহার হালকী" },
          { ar: "عَلَيْهِمْ", bn: "তাদের উপর", en: "upon them", tajweed: "মীম সাকিন ইযহার" },
          { ar: "غَيْرِ", bn: "নয়", en: "not", tajweed: "গাইন মাখরাজ" },
          { ar: "ٱلْمَغْضُوبِ", bn: "ক্রোধপ্রাপ্তদের", en: "(of) those who earned wrath", tajweed: "দোয়াদ" },
          { ar: "عَلَيْهِمْ", bn: "তাদের উপর", en: "upon them", tajweed: "ইযহার" },
          { ar: "وَلَا", bn: "এবং নয়", en: "and not", tajweed: "মাদে তবাই" },
          { ar: "ٱلضَّآلِّينَ", bn: "পথভ্রষ্টদের", en: "(of) those who go astray", tajweed: "মাদে লাযিম কালমী মুসাক্কাল (৬ হরকত)" }
        ]
      }
    ]
  },
  112: {
    number: 112,
    name: "سُورَةُ الإِخْلَاصِ",
    englishName: "Al-Ikhlaas",
    bengaliName: "আল-ইখলাস",
    numberOfAyahs: 4,
    ayahs: [
      {
        numberInSurah: 1,
        text: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
        bengali: "বলুন, তিনি আল্লাহ, এক-অদ্বিতীয়।",
        english: "Qul Huwal-laahu Ahad",
        juz: 30,
        page: 604,
        words: [
          { ar: "قُلْ", bn: "বলুন", en: "Say", tajweed: "ক্বাফ তাফখীম" },
          { ar: "هُوَ", bn: "তিনি", en: "He", tajweed: "হা মাখরাজ" },
          { ar: "ٱللَّهُ", bn: "আল্লাহ", en: "Allah", tajweed: "লাম তাফখীম" },
          { ar: "أَحَدٌ", bn: "এক-অদ্বিতীয়", en: "the One", tajweed: "কলকলাহ কুবরা (দাল)" }
        ]
      },
      {
        numberInSurah: 2,
        text: "ٱللَّهُ ٱلصَّمَدُ",
        bengali: "আল্লাহ কারও মুখাপেক্ষী নন, সকলেই তাঁর মুখাপেক্ষী।",
        english: "Allaahus-Samad",
        juz: 30,
        page: 604,
        words: [
          { ar: "ٱللَّهُ", bn: "আল্লাহ", en: "Allah", tajweed: "তারকীক/তাফখীম" },
          { ar: "ٱلصَّمَدُ", bn: "অমুখাপেক্ষী", en: "the Eternal Refuge", tajweed: "কলকলাহ (দাল)" }
        ]
      },
      {
        numberInSurah: 3,
        text: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        bengali: "তাঁর কোনো সন্তান নেই এবং তিনিও কারও সন্তান নন।",
        english: "Lam yalid wa lam yoolad",
        juz: 30,
        page: 604,
        words: [
          { ar: "لَمْ", bn: "না", en: "Not", tajweed: "মীম সাকিন" },
          { ar: "يَلِدْ", bn: "তিনি জন্ম দিয়েছেন", en: "He begets", tajweed: "কলকলাহ (দাল)" },
          { ar: "وَلَمْ", bn: "এবং না", en: "and not", tajweed: "ইযহার" },
          { ar: "يُولَدْ", bn: "তিনি জন্ম নিয়েছেন", en: "He was begotten", tajweed: "কলকলাহ সুগরা (দাল)" }
        ]
      },
      {
        numberInSurah: 4,
        text: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
        bengali: "এবং তাঁর সমকক্ষ বা সমতুল্য কেউই নেই।",
        english: "Wa lam yakul-lahoo kufuwan ahad",
        juz: 30,
        page: 604,
        words: [
          { ar: "وَلَمْ", bn: "এবং নেই", en: "And not", tajweed: "ইযহার" },
          { ar: "يَكُن", bn: "হয়েছে", en: "is", tajweed: "ইদগামে বেলা গুন্নাহ (নূন সাকিন ও লাম)" },
          { ar: "لَّهُۥ", bn: "তাঁর", en: "for Him", tajweed: "মাদে সিলাহ" },
          { ar: "كُفُوًا", bn: "সমকক্ষ", en: "equivalent", tajweed: "ফা হরফ" },
          { ar: "أَحَدٌۢ", bn: "কেউ", en: "anyone", tajweed: "কলকলাহ কুবরা (দাল)" }
        ]
      }
    ]
  },
  113: {
    number: 113,
    name: "سُورَةُ الفَلَقِ",
    englishName: "Al-Falaq",
    bengaliName: "আল-ফালাক",
    numberOfAyahs: 5,
    ayahs: [
      {
        numberInSurah: 1,
        text: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ",
        bengali: "বলুন, আমি আশ্রয় প্রার্থনা করছি ঊষার পালনকর্তার,",
        english: "Qul a'oozu bi Rabbil-falaq",
        juz: 30,
        page: 604
      },
      {
        numberInSurah: 2,
        text: "مِن شَرِّ مَا خَلَقَ",
        bengali: "তিনি যা সৃষ্টি করেছেন তার অনিষ্ট হতে,",
        english: "Min sharri maa khalaq",
        juz: 30,
        page: 604
      },
      {
        numberInSurah: 3,
        text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
        bengali: "এবং রাতের অন্ধকারের অনিষ্ট হতে যখন তা সমাগত হয়,",
        english: "Wa min sharri ghaasiqin izaa waqab",
        juz: 30,
        page: 604
      },
      {
        numberInSurah: 4,
        text: "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِي ٱلْعُقَدِ",
        bengali: "এবং গ্রন্থিতে ফুৎকারকারিণী জাদুকরদের অনিষ্ট হতে,",
        english: "Wa min sharrin-naffaasaati fil 'uqad",
        juz: 30,
        page: 604
      },
      {
        numberInSurah: 5,
        text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
        bengali: "এবং হিংসুকের অনিষ্ট হতে যখন সে হিংসা করে।",
        english: "Wa min sharri haasidin izaa hasad",
        juz: 30,
        page: 604
      }
    ]
  },
  114: {
    number: 114,
    name: "سُورَةُ النَّاسِ",
    englishName: "An-Naas",
    bengaliName: "আন-নাস",
    numberOfAyahs: 6,
    ayahs: [
      {
        numberInSurah: 1,
        text: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
        bengali: "বলুন, আমি আশ্রয় প্রার্থনা করছি মানুষের পালনকর্তার,",
        english: "Qul a'oozu bi Rabbin-naas",
        juz: 30,
        page: 604
      },
      {
        numberInSurah: 2,
        text: "مَلِكِ ٱلنَّاسِ",
        bengali: "মানুষের অধিপতির,",
        english: "Malikin-naas",
        juz: 30,
        page: 604
      },
      {
        numberInSurah: 3,
        text: "إِلَٰهِ ٱلنَّاسِ",
        bengali: "মানুষের একমাত্র উপাস্যের,",
        english: "Ilaahin-naas",
        juz: 30,
        page: 604
      },
      {
        numberInSurah: 4,
        text: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ",
        bengali: "আত্মগোপনকারী কুমন্ত্রণাদাতার অনিষ্ট হতে,",
        english: "Min sharril waswaasil khannaas",
        juz: 30,
        page: 604
      },
      {
        numberInSurah: 5,
        text: "ٱلَّذِي يُوَسْوِسُ فِي صُدُورِ ٱلنَّاسِ",
        bengali: "যে মানুষের অন্তরে কুমন্ত্রণা দেয়,",
        english: "Allazee yuwaswisu fee sudoorin-naas",
        juz: 30,
        page: 604
      },
      {
        numberInSurah: 6,
        text: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
        bengali: "জিনদের মধ্য থেকে এবং মানুষের মধ্য থেকে।",
        english: "Minal jinnati wannaas",
        juz: 30,
        page: 604
      }
    ]
  },
  108: {
    number: 108,
    name: "سُورَةُ الكَوْثَرِ",
    englishName: "Al-Kawthar",
    bengaliName: "আল-কাউসার",
    numberOfAyahs: 3,
    ayahs: [
      {
        numberInSurah: 1,
        text: "إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ",
        bengali: "নিশ্চয় আমি আপনাকে কাউসার (অনন্ত কল্যাণ ও প্রাচুর্য) দান করেছি।",
        english: "Innaaa a'tainaakal Kawsar",
        juz: 30,
        page: 602
      },
      {
        numberInSurah: 2,
        text: "فَصَلِّ لِرَبِّكَ وَٱنْحَرْ",
        bengali: "অতএব আপনার পালনকর্তার উদ্দেশ্যে নামায আদায় করুন এবং কোরবানী করুন।",
        english: "Fa salli li Rabbika wanhar",
        juz: 30,
        page: 602
      },
      {
        numberInSurah: 3,
        text: "إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ",
        bengali: "নিশ্চয় আপনার শত্রুই নির্বংশ ও লেজকাটা।",
        english: "Inna shaani'aka huwal abtar",
        juz: 30,
        page: 602
      }
    ]
  },
  103: {
    number: 103,
    name: "سُورَةُ العَصْرِ",
    englishName: "Al-'Asr",
    bengaliName: "আল-আসর",
    numberOfAyahs: 3,
    ayahs: [
      {
        numberInSurah: 1,
        text: "وَٱلْعَصْرِ",
        bengali: "কালের শপথ,",
        english: "Wal 'asr",
        juz: 30,
        page: 601
      },
      {
        numberInSurah: 2,
        text: "إِنَّ ٱلْإِنسَٰنَ لَفِي خُسْرٍ",
        bengali: "নিশ্চয় মানুষ চরম ক্ষতির মধ্যে নিমজ্জিত,",
        english: "Innal insaana lafee khusr",
        juz: 30,
        page: 601
      },
      {
        numberInSurah: 3,
        text: "إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ",
        bengali: "তারা ব্যতীত যারা ঈমান এনেছে, সৎকাজ করেছে এবং পরস্পরকে সত্যের উপদেশ ও ধৈর্যের উপদেশ দিয়েছে।",
        english: "Illal-lazeena aamanoo wa 'amilus-saalihaati wa tawaasaw bilhaqqi wa tawaasaw bissabr",
        juz: 30,
        page: 601
      }
    ]
  }
};

/**
 * Fetch Surah data with Multi-tier caching:
 * 1. Local memory / offline curated bundle (Instant)
 * 2. Client localStorage cache (Instant)
 * 3. AlQuran Cloud CDN (Uthmani Arabic + Bengali Muhiuddin Khan + English Sahih/Transliteration)
 */
export async function getSurahData(surahNumber) {
  const surahNum = parseInt(surahNumber, 10);
  const meta = ALL_SURAHS.find((s) => s.id === surahNum) || ALL_SURAHS[0];

  // 1. Check browser localStorage
  if (typeof window !== "undefined") {
    try {
      const cacheKey = `rahmania_quran_surah_v1_${surahNum}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.ayahs?.length > 0) {
          return { ...meta, ...parsed };
        }
      }
    } catch {}
  }

  // 2. Check local fallback
  if (LOCAL_FALLBACK_SURAHS[surahNum]) {
    const fallback = LOCAL_FALLBACK_SURAHS[surahNum];
    return {
      ...meta,
      ...fallback
    };
  }

  // 3. Fetch from CDN with network timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-uthmani,bn.bengali,en.transliteration`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.data && Array.isArray(data.data) && data.data.length >= 2) {
        const arEdition = data.data[0];
        const bnEdition = data.data[1];
        const enEdition = data.data[2] || { ayahs: [] };

        const ayahs = arEdition.ayahs.map((a, i) => {
          const bnAyah = bnEdition.ayahs?.[i]?.text || "";
          const enAyah = enEdition.ayahs?.[i]?.text || "";
          return {
            numberInSurah: a.numberInSurah,
            text: a.text,
            bengali: bnAyah,
            english: enAyah,
            juz: a.juz,
            page: a.page,
            hizbQuarter: a.hizbQuarter,
            sajda: a.sajda || false
          };
        });

        const formatted = {
          number: surahNum,
          name: arEdition.name,
          englishName: arEdition.englishName,
          bengaliName: meta.nameBn,
          numberOfAyahs: meta.versesCount,
          ayahs
        };

        // Cache in localStorage for offline access
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              `rahmania_quran_surah_v1_${surahNum}`,
              JSON.stringify(formatted)
            );
          } catch {}
        }

        return { ...meta, ...formatted };
      }
    }
  } catch (err) {
    console.warn("CDN Quran fetch error, using synthetic fallback:", err);
  }

  // Fallback synthetic data if offline and not in curated bundle
  const syntheticAyahs = Array.from({ length: meta.versesCount }, (_, idx) => {
    const ayahNo = idx + 1;
    return {
      numberInSurah: ayahNo,
      text: `${meta.nameAr} - الآية ${ayahNo}`,
      bengali: `${meta.nameBn} - আয়াত নং ${ayahNo}`,
      english: `${meta.nameEn} - Verse ${ayahNo}`,
      juz: meta.juz,
      page: meta.page
    };
  });

  return {
    ...meta,
    number: surahNum,
    name: meta.nameAr,
    englishName: meta.nameEn,
    bengaliName: meta.nameBn,
    numberOfAyahs: meta.versesCount,
    ayahs: syntheticAyahs
  };
}

/**
 * Returns audio recitation URL for an Ayah using EveryAyah CDN.
 */
export function getAyahAudioUrl(qariId, surahNumber, ayahNumber) {
  return getQariAudioUrl(qariId, surahNumber, ayahNumber);
}
