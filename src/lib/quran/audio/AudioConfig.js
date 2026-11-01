/**
 * Unified Universal Quran Audio Infrastructure - Configuration
 * Rahmania Institute / Nur AI Quran Learning Platform
 * 
 * Global constants, CDN origins, cache boundaries, and default playback settings.
 */

export const AUDIO_CONFIG = {
  // CDN Endpoints for Authentic Recitations
  NOORANI_PRIMARY_CDN: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter01/Page1-",
  NOORANI_FALLBACK_CDN: "https://raw.githubusercontent.com/nooresahar/noorani/master/sounds/chapter01/Page1-",
  ARABIC_STUDIO_CDN: "https://cdn.jsdelivr.net/gh/adnan/Arabic-Alphabet@master/sounds/",
  EVERYAYAH_CDN_BASE: "https://everyayah.com/data/",
  QURAN_CDN_BASE: "https://audio.qurancdn.com/",

  // Cache & Resource Boundaries (protects mobile memory & ERP performance)
  MAX_IN_MEMORY_AUDIO_INSTANCES: 250,
  MAX_PRELOAD_ITEMS: 8,
  PRELOAD_CONCURRENCY_LIMIT: 2,
  AUDIO_LOAD_TIMEOUT_MS: 12000,
  MAX_FETCH_RETRIES: 2,

  // Playback Policies
  POLICY_EXCLUSIVE: "exclusive", // Stop any active playback immediately
  POLICY_QUEUED: "queued",       // Play sequentially in queue
  POLICY_CONCURRENT: "concurrent", // Controlled concurrent playback (e.g. sound effects)

  // Default audio settings
  DEFAULT_VOLUME: 1.0,
  DEFAULT_PLAYBACK_SPEED: 1.0,
  DEFAULT_SHAYKH_ID: "husary_muallim",

  // Storage Keys
  STORAGE_KEY_ACTIVE_SHAYKH: "rahmania_nur_active_shaykh_v1",
  STORAGE_KEY_AUDIO_VOLUME: "rahmania_nur_audio_volume_v1",
  STORAGE_KEY_PLAYBACK_SPEED: "rahmania_nur_audio_speed_v1",
};

export default AUDIO_CONFIG;

