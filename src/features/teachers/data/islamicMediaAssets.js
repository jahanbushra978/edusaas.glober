/**
 * Islamic Media Assets & Visual Standards
 * Curated high-resolution, dignified, and authentic Islamic imagery
 * replacing inappropriate Western stock photos and non-Islamic art.
 */

export const ISLAMIC_COVERS = {
  // Masjid al-Haram (The Sacred Mosque & Holy Kaaba, Makkah)
  kaaba_makkah: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
  // Al-Masjid an-Nabawi (The Prophet's Mosque Green Dome & Minarets, Madinah)
  nabawi_medina: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
  // Grand Holy Quran with Golden Rehal & Islamic Illumination
  noble_quran_rehal: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80",
  // Grand Islamic Archways & Spiritual Sanctuary
  grand_mosque_arches: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80",
  // Intricate Islamic Geometric Arabesque Tile Art & Sanctuary
  geometric_arabesque: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
  // Illuminated Mosque Minaret at Twilight
  mosque_twilight: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
  // Default authentic Quran cover
  quran_mushaf: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
  medina: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
  makkah: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
  calligraphy: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80",
};

export const ISLAMIC_AVATARS = {
  // Dignified Islamic male scholars / Qaris / Ustad
  qari_mahmudul: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80", // Dignified elder scholar
  qari_ahmadullah: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80", // Dignified scholar portrait
  qari_zubair: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80", // Modest young Qari
  male_student_default: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=400&q=80", // Dignified young student
  studentBoy: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=400&q=80",

  // Modest, veiled Islamic female scholars & students (Full Dignified Hijab / Abaya)
  ustaza_sumayyah: "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=400&q=80", // Modest hijab
  fatema_zohra: "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=400&q=80", // Modest hijab student
  maryam_siddiqua: "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=400&q=80", // Modest hijab student
  female_student_default: "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=400&q=80",
  studentGirl: "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=400&q=80",
};

/**
 * Returns an appropriate, authentic Islamic cover photo URL
 */
export function getIslamicCover(type = "quran_mushaf") {
  return ISLAMIC_COVERS[type] || ISLAMIC_COVERS.noble_quran_rehal;
}

/**
 * Returns an appropriate, authentic Islamic avatar URL
 */
export function getIslamicAvatar(genderOrRole = "male", identifier = "") {
  if (genderOrRole === "female" || identifier.includes("female") || identifier.includes("fatema") || identifier.includes("maryam") || identifier.includes("sumayyah") || identifier.includes("khadija") || identifier.includes("sayma")) {
    return ISLAMIC_AVATARS.ustaza_sumayyah;
  }
  if (identifier.includes("mahmud")) return ISLAMIC_AVATARS.qari_mahmudul;
  if (identifier.includes("ahmad")) return ISLAMIC_AVATARS.qari_ahmadullah;
  if (identifier.includes("zubair")) return ISLAMIC_AVATARS.qari_zubair;
  return ISLAMIC_AVATARS.male_student_default;
}

