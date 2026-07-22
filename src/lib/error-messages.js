// ============================================================
// Human-friendly error messages (Bengali + English)
// ============================================================

const messages = {
  // Device errors
  device_not_connected: {
    bn: "Device বর্তমানে সংযুক্ত নয়।",
    en: "Device is currently not connected.",
  },
  device_inactive: {
    bn: "Device টি নিষ্ক্রিয় রয়েছে।",
    en: "Device is inactive.",
  },
  device_unknown: {
    bn: "এই Device আমাদের সিস্টেমে নিবন্ধিত নয়।",
    en: "This device is not registered in our system.",
  },
  device_timeout: {
    bn: "Device-এর সাথে সংযোগ স্থাপনে সময় শেষ হয়েছে।",
    en: "Connection to device timed out.",
  },

  // Network errors
  network_offline: {
    bn: "ইন্টারনেট সংযোগ নেই। পরে আবার চেষ্টা করুন।",
    en: "No internet connection. Please try again later.",
  },
  server_unreachable: {
    bn: "সার্ভার বর্তমানে উপলব্ধ নয়।",
    en: "Server is currently unavailable.",
  },
  request_timeout: {
    bn: "অনুরোধটি সময়সীমা অতিক্রম করেছে।",
    en: "Request timed out.",
  },

  // Authentication errors
  unauthorized: {
    bn: "আপনার লগইন প্রয়োজন।",
    en: "You need to login first.",
  },
  forbidden: {
    bn: "এই কাজটি করার অনুমতি আপনার নেই।",
    en: "You don't have permission to perform this action.",
  },
  invalid_api_key: {
    bn: "ভুল API Key দেওয়া হয়েছে।",
    en: "Invalid API key provided.",
  },
  session_expired: {
    bn: "আপনার সেশনের মেয়াদ শেষ হয়েছে। পুনরায় লগইন করুন।",
    en: "Your session has expired. Please login again.",
  },

  // Attendance errors
  duplicate_attendance: {
    bn: "এই সময়ের জন্য উপস্থিতি ইতিমধ্যে নেওয়া হয়েছে।",
    en: "Attendance already recorded for this time.",
  },
  no_mapping: {
    bn: "এই Device PIN-এর জন্য কোনো ব্যবহারকারী পাওয়া যায়নি।",
    en: "No user found for this device PIN.",
  },
  batch_too_large: {
    bn: "একসাথে অনেকগুলো রেকর্ড পাঠানো হয়েছে। সর্বোচ্চ ৫০টি।",
    en: "Batch too large. Maximum 50 records at a time.",
  },

  // Database errors
  db_error: {
    bn: "ডাটাবেসে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।",
    en: "A database error occurred. Please try again later.",
  },
  db_duplicate: {
    bn: "এই তথ্যটি ইতিমধ্যে বিদ্যমান।",
    en: "This record already exists.",
  },

  // General errors
  internal_error: {
    bn: "একটি অপ্রত্যাশিত ত্রুটি হয়েছে। পরে আবার চেষ্টা করুন।",
    en: "An unexpected error occurred. Please try again later.",
  },
  invalid_input: {
    bn: "আপনার দেওয়া তথ্য সঠিক নয়।",
    en: "The provided information is not valid.",
  },
  missing_fields: {
    bn: "প্রয়োজনীয় তথ্য দেওয়া হয়নি।",
    en: "Required fields are missing.",
  },

  // Rate limiting
  rate_limited: {
    bn: "অনেক বেশি অনুরোধ পাঠানো হয়েছে। একটু অপেক্ষা করুন।",
    en: "Too many requests. Please wait a moment.",
  },

  // Bridge specific
  bridge_not_running: {
    bn: "Biometric Bridge চলছে না।",
    en: "Biometric Bridge is not running.",
  },
  bridge_queue_full: {
    bn: "অফলাইন Queue পূর্ণ। কিছু ডেটা সম্ভবত হারিয়ে যাবে।",
    en: "Offline queue is full. Some data may be lost.",
  },
};

export function getErrorMessage(key, lang = "bn") {
  const msg = messages[key];
  if (!msg) return messages.internal_error[lang];
  return msg[lang] || msg.en;
}

export default messages;
