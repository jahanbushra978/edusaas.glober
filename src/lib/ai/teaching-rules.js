/**
 * 📖 Rahmania NurAI — Dynamic Teaching Rules & Student Learning Memory Engine
 * 
 * Implements owner's pedagogical invariants:
 * 1. Realistic Teacher behavior (Salam, encourage, gentle correction, never discourage)
 * 2. Pedagogical Loop: Explain ➔ Demonstrate ➔ Practice ➔ Evaluate ➔ Correct ➔ Repeat
 * 3. Dynamic Teaching Rules (configurable thresholds for repeated mistakes)
 * 4. Learning Memory (tracking recurring weak Tajweed rules & Lokmas)
 */

export const DEFAULT_TEACHING_RULES = [
  {
    id: "attempt_1",
    attemptNumber: 1,
    action: "EXPLAIN_DIFFERENTLY",
    titleBn: "সহজ ভাষায় ভিন্নভাবে ব্যাখ্যা",
    descBn: "প্রথম ভুলে কোমল স্বরে ভুল চিহ্নিত করা এবং ভিন্ন উপমায় নিয়মটি পুনরায় বুঝিয়ে দেওয়া।",
    active: true,
  },
  {
    id: "attempt_2",
    attemptNumber: 2,
    action: "EXTRA_DEMONSTRATION",
    titleBn: "ধীর গতির অডিও ডেমো ও মাখরাজ টিপস",
    descBn: "দ্বিতীয় ভুলে ধীর গতিতে (0.75x) বিশুদ্ধ তিলাওয়াত শোনানো এবং জিহ্বা/মুখের অঙ্গভঙ্গি দেখানো।",
    active: true,
  },
  {
    id: "attempt_3",
    attemptNumber: 3,
    action: "TARGETED_DRILL",
    titleBn: "হরফভিত্তিক একক ড্রিল অনুশীলন",
    descBn: "তৃতীয় ভুলে পুরো আয়াতের পরিবর্তে কেবল ত্রুটিপূর্ণ হরফ বা শব্দটি আলাদা করে ড্রিল করানো।",
    active: true,
  },
  {
    id: "attempt_4",
    attemptNumber: 4,
    action: "ASSIGN_REVIEW",
    titleBn: "রিভিউ কিউ ও হোমওয়ার্কে সংযুক্তি",
    descBn: "চতুর্থ ভুলে ছাত্রের আজকের হোমওয়ার্কে এই আয়াতটি রিভিশন হিসেবে যুক্ত করা।",
    active: true,
  },
  {
    id: "attempt_5",
    attemptNumber: 5,
    action: "ALERT_TEACHER_PARENT",
    titleBn: "শিক্ষক ও অভিভাবককে নোটিফিকেশন",
    descBn: "ক্রমাগত ৫ বার ভুলে শিক্ষকের খাতায় (Daily Lesson) লুকমা ও নোটিশ হিসেবে পাঠানো।",
    active: true,
  },
];

const STORAGE_KEY_RULES = "nur_dynamic_teaching_rules_v1";
const STORAGE_KEY_MEMORY = "nur_learning_memory_v1";

/**
 * Retrieve dynamic teaching rules from storage or fallback to defaults
 */
export function getTeachingRules() {
  if (typeof window === "undefined") return DEFAULT_TEACHING_RULES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RULES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("Failed to load custom teaching rules, using defaults", err);
  }
  return DEFAULT_TEACHING_RULES;
}

/**
 * Save customized teaching rules
 */
export function saveTeachingRules(rules) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
  } catch (err) {
    console.error("Failed to save teaching rules", err);
  }
}

/**
 * Determine teacher reaction based on attempt count
 */
export function resolveTeacherReaction(attemptCount) {
  const rules = getTeachingRules();
  const rule = rules.find((r) => r.attemptNumber === attemptCount && r.active);
  if (rule) return rule;

  if (attemptCount >= 5) {
    return (
      rules.find((r) => r.action === "ALERT_TEACHER_PARENT") || {
        action: "ALERT_TEACHER_PARENT",
        titleBn: "শিক্ষক ও অভিভাবককে নোটিফিকেশন",
        descBn: "শিক্ষকের পরামর্শ অনুযায়ী অনুশীলন করুন।",
      }
    );
  }
  return {
    action: "EXPLAIN_DIFFERENTLY",
    titleBn: "পুনরায় মন দিয়ে শুনুন ও পড়ুন",
    descBn: "ধীরেসুস্থে প্রতিটি হরফের মাখরাজ বজায় রেখে তিলাওয়াত করুন।",
  };
}

/**
 * Get student learning memory
 */
export function getLearningMemory() {
  if (typeof window === "undefined") {
    return { weakRules: {}, weakLetters: {}, totalLokmas: 0, completedModules: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to read learning memory", err);
  }
  return { weakRules: {}, weakLetters: {}, totalLokmas: 0, completedModules: [] };
}

/**
 * Record mistakes to learning memory
 */
export function recordMistakeToMemory({ ruleId, letter, isLokma = false }) {
  if (typeof window === "undefined") return;
  try {
    const memory = getLearningMemory();
    if (ruleId) {
      memory.weakRules[ruleId] = (memory.weakRules[ruleId] || 0) + 1;
    }
    if (letter) {
      memory.weakLetters[letter] = (memory.weakLetters[letter] || 0) + 1;
    }
    if (isLokma) {
      memory.totalLokmas = (memory.totalLokmas || 0) + 1;
    }
    localStorage.setItem(STORAGE_KEY_MEMORY, JSON.stringify(memory));
  } catch (err) {
    console.error("Failed to update learning memory", err);
  }
}

/**
 * Mark a module as successfully mastered
 */
export function recordModuleCompletion(moduleId) {
  if (typeof window === "undefined") return;
  try {
    const memory = getLearningMemory();
    if (!memory.completedModules.includes(moduleId)) {
      memory.completedModules.push(moduleId);
    }
    localStorage.setItem(STORAGE_KEY_MEMORY, JSON.stringify(memory));
  } catch (err) {
    console.error("Failed to record module completion", err);
  }
}

/**
 * Clear learning memory
 */
export function clearLearningMemory() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY_MEMORY);
  } catch (err) {}
}
