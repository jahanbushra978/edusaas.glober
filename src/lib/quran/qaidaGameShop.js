"use client";

// ── PERSISTENT SHOP & INVENTORY DATA FOR NOOR QAIDA GAMES ──

export const SHOP_NEEDLES = [
  {
    id: "finger",
    nameBn: "সাধারণ আঙুল",
    icon: "👆",
    price: 0,
    descBn: "স্বাভাবিক আঙুল ছোঁয়ালেই বুদ্বুদ ফুটবে",
    trailColor: "#10b981",
    sparkleType: "stars",
  },
  {
    id: "silver_needle",
    nameBn: "রূপালী সুই",
    icon: "🪡",
    price: 50,
    descBn: "তীক্ষ্ণ রূপালী সুচ, দ্রুত বুদ্বুদ ফুটবে",
    trailColor: "#94a3b8",
    sparkleType: "silver",
  },
  {
    id: "golden_pin",
    nameBn: "সোনার পিন",
    icon: "📍",
    price: 100,
    descBn: "উজ্জ্বল সোনার পিন, সোনালী আলোর ছটা",
    trailColor: "#f59e0b",
    sparkleType: "gold",
  },
  {
    id: "magic_wand",
    nameBn: "জাদুর রঙিন কাঠি",
    icon: "🪄",
    price: 200,
    descBn: "পরী ও জাদুর রঙিন কাঠি, রঙিন ফুলকি ছড়ায়",
    trailColor: "#ec4899",
    sparkleType: "magic",
  },
  {
    id: "laser_rod",
    nameBn: "লেজার ইলেকট্রিক রড",
    icon: "⚡",
    price: 350,
    descBn: "বিদ্যুৎ চমকানো নীল লেজার পয়েন্টার",
    trailColor: "#06b6d4",
    sparkleType: "lightning",
  },
  {
    id: "rocket_dart",
    nameBn: "স্পেস রকেট ডার্ট",
    icon: "🚀",
    price: 500,
    descBn: "মহাকাশ রকেট সুই, আলোর গতিতে বিস্ফোরণ",
    trailColor: "#8b5cf6",
    sparkleType: "cosmic",
  },
];

export const SHOP_BLADES = [
  {
    id: "wood_blade",
    nameBn: "সাধারণ নিনজা ব্লেড",
    icon: "🗡️",
    price: 0,
    descBn: "কাঠের হাতলওয়ালা সাধারণ ধারালো তলোয়ার",
    trailOuter: "rgba(250, 204, 21, 0.75)",
    trailInner: "#ffffff",
    glowColor: "#facc15",
  },
  {
    id: "steel_dagger",
    nameBn: "রুপার ড্যাগার",
    icon: "🔪",
    price: 80,
    descBn: "চকমকে ইস্পাতের দ্রুতগতির ধারালো চাকু",
    trailOuter: "rgba(148, 163, 184, 0.8)",
    trailInner: "#f8fafc",
    glowColor: "#cbd5e1",
  },
  {
    id: "golden_katana",
    nameBn: "সোনার রাজকীয় কাতানা",
    icon: "⚔️",
    price: 150,
    descBn: "বিশুদ্ধ সোনার তৈরি রাজকীয় জাপানি কাতানা",
    trailOuter: "rgba(245, 158, 11, 0.9)",
    trailInner: "#fef3c7",
    glowColor: "#f59e0b",
  },
  {
    id: "flame_blade",
    nameBn: "অগ্নি ড্রাগন সোর্ড",
    icon: "🔥",
    price: 300,
    descBn: "লেলিহান আগুনের শিখা ছড়ানো বিধ্বংসী তলোয়ার",
    trailOuter: "rgba(239, 68, 68, 0.95)",
    trailInner: "#fed7aa",
    glowColor: "#ea580c",
  },
  {
    id: "rainbow_saber",
    nameBn: "সাতরঙা রংধনু সাবার",
    icon: "🌈",
    price: 450,
    descBn: "সাতটি উজ্জ্বল রঙের লেজার রশ্মির কাটিং সাবার",
    trailOuter: "rgba(168, 85, 247, 0.9)",
    trailInner: "#a5f3fc",
    glowColor: "#d946ef",
  },
  {
    id: "divine_sword",
    nameBn: "নূরের পবিত্র তরবারি",
    icon: "🌟",
    price: 700,
    descBn: "স্বর্গীয় নূরের তীব্র জ্যোতি ও তারার আলোর ফলক",
    trailOuter: "rgba(56, 189, 248, 0.95)",
    trailInner: "#ffffff",
    glowColor: "#38bdf8",
  },
];

// Helper functions for coins & unlocked items
export function getStoredCoins() {
  if (typeof window === "undefined") return 150;
  try {
    const val = localStorage.getItem("noor_qaida_coins");
    return val ? parseInt(val, 10) : 150; // Start with 150 free coins for kids
  } catch {
    return 150;
  }
}

export function saveCoins(amount) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("noor_qaida_coins", amount.toString());
  } catch {}
}

export function getUnlockedNeedles() {
  if (typeof window === "undefined") return ["finger"];
  try {
    const val = localStorage.getItem("noor_qaida_unlocked_needles");
    return val ? JSON.parse(val) : ["finger"];
  } catch {
    return ["finger"];
  }
}

export function getEquippedNeedle() {
  if (typeof window === "undefined") return "finger";
  try {
    return localStorage.getItem("noor_qaida_equipped_needle") || "finger";
  } catch {
    return "finger";
  }
}

export function getUnlockedBlades() {
  if (typeof window === "undefined") return ["wood_blade"];
  try {
    const val = localStorage.getItem("noor_qaida_unlocked_blades");
    return val ? JSON.parse(val) : ["wood_blade"];
  } catch {
    return ["wood_blade"];
  }
}

export function getEquippedBlade() {
  if (typeof window === "undefined") return "wood_blade";
  try {
    return localStorage.getItem("noor_qaida_equipped_blade") || "wood_blade";
  } catch {
    return "wood_blade";
  }
}
