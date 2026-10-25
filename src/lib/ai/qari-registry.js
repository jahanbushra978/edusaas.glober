/**
 * Canonical Shaykhs (Qaris) Registry & EveryAyah Audio Resolver
 * 
 * Provides authentic, high-quality Quranic audio recitations from 6 world-renowned
 * Shaykhs for Tajweed instruction, student practice, and pedagogical demonstrations.
 */

export const SHAYKH_REGISTRY = [
  {
    id: "husary_muallim",
    nameBn: "শায়খ মাহমুদ খলিল আল-হুসারী (মুআল্লিম)",
    nameEn: "Mahmoud Khalil Al-Husary (Muallim)",
    shortNameBn: "শায়খ আল-হুসারী",
    displayTitleBn: "আল-হুসারী",
    roleBn: "তাজবীদ শিক্ষক (মুআল্লিম)",
    countryBn: "মিশর",
    flagEmoji: "🇪🇬",
    styleBn: "মুআল্লিম (তাজবীদ ও মাখরাজ শিক্ষার সোনালী মানদণ্ড)",
    cdnDir: "Husary_Muallim_128kbps",
    badge: "তাজবীদ শিক্ষক",
    accentColor: "border-amber-500/80 text-amber-300 bg-amber-950/60",
    activeColor: "ring-amber-400 bg-amber-950/90 border-amber-400",
  },
  {
    id: "alafasy",
    nameBn: "শায়খ মিশারী রাশিদ আল-আফাসী",
    nameEn: "Mishary Rashid Alafasy",
    shortNameBn: "শায়খ আল-আফাসী",
    displayTitleBn: "আল-আফাসী",
    roleBn: "জনপ্রিয় মুরাত্তাল",
    countryBn: "কুয়েত",
    flagEmoji: "🇰🇼",
    styleBn: "মুরাত্তাল (সুললিত, হৃদয়গ্রাহী ও পরিষ্কার সুর)",
    cdnDir: "Alafasy_128kbps",
    badge: "জনপ্রিয় মুরাত্তাল",
    accentColor: "border-emerald-500/80 text-emerald-300 bg-emerald-950/60",
    activeColor: "ring-emerald-400 bg-emerald-950/90 border-emerald-400",
  },
  {
    id: "abdul_basit",
    nameBn: "শায়খ আব্দুল বাসিত আব্দুস সামাদ",
    nameEn: "Abdul Basit Abdus Samad",
    shortNameBn: "শায়খ আব্দুল বাসিত",
    displayTitleBn: "আব্দুল বাসিত",
    roleBn: "ক্লাসিক্যাল মাস্টার",
    countryBn: "মিশর",
    flagEmoji: "🇪🇬",
    styleBn: "মুরাত্তাল (ঐতিহ্যবাহী বিশ্বখ্যাত মাস্টার ক্লাস)",
    cdnDir: "Abdul_Basit_Murattal_192kbps",
    badge: "ক্লাসিক্যাল মাস্টার",
    accentColor: "border-blue-500/80 text-blue-300 bg-blue-950/60",
    activeColor: "ring-blue-400 bg-blue-950/90 border-blue-400",
  },
  {
    id: "minshawy_teacher",
    nameBn: "শায়খ মুহাম্মাদ সিদ্দিক আল-মিনশাবী (মুআল্লিম)",
    nameEn: "Mohamed Siddiq Al-Minshawi (Teacher)",
    shortNameBn: "শায়খ আল-মিনশাবী",
    displayTitleBn: "আল-মিনশাবী",
    roleBn: "আধ্যাত্মিক মুআল্লিম",
    countryBn: "মিশর",
    flagEmoji: "🇪🇬",
    styleBn: "মুআল্লিম (গভীর আধ্যাত্মিক ও শিক্ষামূলক পঠন)",
    cdnDir: "Minshawy_Teacher_128kbps",
    badge: "মুআল্লিম ডেমো",
    accentColor: "border-purple-500/80 text-purple-300 bg-purple-950/60",
    activeColor: "ring-purple-400 bg-purple-950/90 border-purple-400",
  },
  {
    id: "sudais",
    nameBn: "শায়খ আব্দুর রহমান আস-সুদাইস",
    nameEn: "Abdur-Rahman As-Sudais",
    shortNameBn: "শায়খ আস-সুদাইস",
    displayTitleBn: "আস-সুদাইস",
    roleBn: "ইমাম, হারামাইন",
    countryBn: "মক্কা মুকাররমা",
    flagEmoji: "🇸🇦",
    styleBn: "ইমাম, মসজিদুল হারাম (রাজকীয় ও সুমধুর)",
    cdnDir: "Abdurrahmaan_As-Sudais_192kbps",
    badge: "ইমাম, হারামাইন",
    accentColor: "border-rose-500/80 text-rose-300 bg-rose-950/60",
    activeColor: "ring-rose-400 bg-rose-950/90 border-rose-400",
  },
  {
    id: "ghamadi",
    nameBn: "শায়খ সা'দ আল-গামিদী",
    nameEn: "Saad Al-Ghamdi",
    shortNameBn: "শায়খ আল-গামিদী",
    displayTitleBn: "আল-গামিদী",
    roleBn: "মসৃণ মুরাত্তাল",
    countryBn: "সৌদি আরব",
    flagEmoji: "🇸🇦",
    styleBn: "মুরাত্তাল (শান্ত, পরিমিত ও মসৃণ উচ্চারণ)",
    cdnDir: "Ghamadi_40kbps",
    badge: "মসৃণ পাঠ",
    accentColor: "border-teal-500/80 text-teal-300 bg-teal-950/60",
    activeColor: "ring-teal-400 bg-teal-950/90 border-teal-400",
  },
];

export const DEFAULT_SHAYKH_ID = "husary_muallim";
const STORAGE_KEY_ACTIVE_SHAYKH = "rahmania_nur_active_shaykh_v1";

/**
 * Persistently retrieves user's preferred Shaykh ID
 */
export function getActiveShaykhId() {
  if (typeof window === "undefined") return DEFAULT_SHAYKH_ID;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_SHAYKH);
    if (saved && SHAYKH_REGISTRY.some((q) => q.id === saved)) {
      return saved;
    }
  } catch {}
  return DEFAULT_SHAYKH_ID;
}

/**
 * Persistently saves user's preferred Shaykh ID
 */
export function setActiveShaykhId(id) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_SHAYKH, id);
    window.dispatchEvent(new CustomEvent("rahmania:shaykh_changed", { detail: { shaykhId: id } }));
  } catch {}
}

/**
 * Resolves EveryAyah CDN audio URL for a given Shaykh, Surah and Ayah.
 */
export function getQariAudioUrl(qariId, surahNumber, ayahNumber) {
  const qari = SHAYKH_REGISTRY.find((q) => q.id === qariId) || SHAYKH_REGISTRY[0];
  const s = String(surahNumber).padStart(3, "0");
  const a = String(ayahNumber).padStart(3, "0");
  return `https://everyayah.com/data/${qari.cdnDir}/${s}${a}.mp3`;
}

/**
 * Given an existing EveryAyah URL, replace the CDN directory with the target Qari's directory.
 */
export function switchAudioUrlQari(originalUrl, targetQariId) {
  const targetQari = SHAYKH_REGISTRY.find((q) => q.id === targetQariId) || SHAYKH_REGISTRY[0];
  if (!originalUrl) return "";

  const match = originalUrl.match(/everyayah\.com\/data\/([^/]+)\/(\d{6})\.mp3/i);
  if (match) {
    const filename = match[2];
    return `https://everyayah.com/data/${targetQari.cdnDir}/${filename}.mp3`;
  }

  return originalUrl;
}

// Backward-compatible canonical aliases
export const QARI_REGISTRY = SHAYKH_REGISTRY;
export const getStoredQariPreference = getActiveShaykhId;
export const setStoredQariPreference = setActiveShaykhId;
