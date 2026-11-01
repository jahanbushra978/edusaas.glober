/**
 * Unified Universal Quran Audio Infrastructure - Type Definitions
 * Rahmania Institute / Nur AI Quran Learning Platform
 */

/**
 * @typedef {"letter" | "harakat" | "tanween" | "sukoon" | "shaddah" | "word" | "ayah" | "surah" | "chime"} AudioContentType
 */

/**
 * @typedef {"exclusive" | "queued" | "concurrent"} PlaybackPolicy
 */

/**
 * @typedef {Object} AudioAssetMetadata
 * @property {string} id - Canonical asset identifier
 * @property {AudioContentType} contentType - Category of educational audio
 * @property {string} text - Arabic text representation
 * @property {string} [translationBn] - Bengali meaning or pronunciation guide
 * @property {string[]} urls - Prioritized candidate URLs (primary CDN, mirror, fallback)
 * @property {string} [qariId] - Shaykh/Qari identifier if applicable
 * @property {number} [duration] - Estimated duration in seconds
 */

/**
 * @typedef {Object} AudioPlayOptions
 * @property {PlaybackPolicy} [policy="exclusive"] - Playback policy
 * @property {number} [rate=1.0] - Playback speed multiplier (0.5 to 2.0)
 * @property {number} [volume=1.0] - Volume level (0.0 to 1.0)
 * @property {Function} [onStart] - Callback when playback begins
 * @property {Function} [onProgress] - Callback on time update ({ currentTime, duration, percent })
 * @property {Function} [onEnd] - Callback when playback finishes normally
 * @property {Function} [onError] - Callback if audio fails to load or play
 */

/**
 * @typedef {Object} ShaykhProfile
 * @property {string} id
 * @property {string} nameBn
 * @property {string} nameEn
 * @property {string} shortNameBn
 * @property {string} displayTitleBn
 * @property {string} roleBn
 * @property {string} countryBn
 * @property {string} flagEmoji
 * @property {string} styleBn
 * @property {string} cdnDir
 * @property {string} badge
 * @property {string} accentColor
 * @property {string} activeColor
 */

export const AUDIO_CONTENT_TYPES = {
  LETTER: "letter",
  HARAKAT: "harakat",
  TANWEEN: "tanween",
  SUKOON: "sukoon",
  SHADDAH: "shaddah",
  WORD: "word",
  AYAH: "ayah",
  SURAH: "surah",
  CHIME: "chime",
};

