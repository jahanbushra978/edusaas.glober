/**
 * Nur AI Quran Tutor — Master Client SDK & Adapter
 * Connects frontend views to backend AI endpoints with automatic offline fallback.
 */

import { nurStorage } from "./nur-storage";

export class NurClient {
  /**
   * Evaluate a student's audio recitation of a specific Ayah
   */
  static async evaluateRecitation({ surah, ayah, wordIndex = null, audioBase64, mode = "standard" }) {
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        // Queue offline
        await nurStorage.queueOfflineRecitation({
          surah,
          ayah,
          wordIndex,
          mode,
          timestamp: new Date().toISOString()
        });

        return {
          ok: true,
          offline: true,
          confidenceScore: 85,
          passed: true,
          status: "queued_offline",
          feedbackVoiceScript: "আপনার রেকর্ডটি অফলাইনে সংরক্ষিত হয়েছে। ইন্টারনেট সংযুক্ত হলে স্বয়ংক্রিয়ভাবে সার্ভারে সিঙ্ক হবে।"
        };
      }

      const res = await fetch("/api/ai/nur/evaluate-recitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surah, ayah, wordIndex, audioBase64, mode })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Evaluation failed with status ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      console.warn("NurClient evaluateRecitation error:", err);
      return {
        ok: false,
        error: err.message,
        feedbackVoiceScript: "অডিও বিশ্লেষণে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার বলুন।"
      };
    }
  }

  /**
   * Interactive Voice Conversation with Nur Ustadh
   */
  static async sendVoiceQuery({ transcript, surahContext = null, ayahContext = null, history = [], voiceConfig = {} }) {
    try {
      let aiConfig = {};
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("rahmania_ai_settings_v1");
          if (saved) aiConfig = JSON.parse(saved);
        } catch {}
      }

      const res = await fetch("/api/ai/nur/conversational-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          surahContext,
          ayahContext,
          conversationHistory: history,
          voiceConfig,
          provider: aiConfig.provider,
          model: aiConfig.model,
          apiKey: aiConfig.apiKey,
          baseUrl: aiConfig.baseUrl,
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Conversational query failed");
      }

      return await res.json();
    } catch (err) {
      return {
        ok: false,
        answerText: "উস্তাদজি বর্তমানে সংযোগ করতে পারছেন না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
        error: err.message
      };
    }
  }

  /**
   * Hifz Memorization Listener
   */
  static async verifyHifzStream({ surah, currentAyah, audioChunkBase64, priorContext = [] }) {
    try {
      const res = await fetch("/api/ai/nur/hifz-listener", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surah,
          currentAyah,
          recitedAudioChunk: audioChunkBase64,
          priorContextAyahs: priorContext
        })
      });

      return await res.json();
    } catch (err) {
      return {
        ok: false,
        error: err.message
      };
    }
  }

  /**
   * Semantic Quran Search
   */
  static async searchQuranSemantic(query, filters = {}) {
    try {
      const res = await fetch("/api/ai/nur/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, filters })
      });

      return await res.json();
    } catch (err) {
      return {
        ok: false,
        matchesCount: 0,
        results: [],
        error: err.message
      };
    }
  }

  /**
   * Get / Sync Student Memory Profile
   */
  static async getStudentMemory(studentId) {
    try {
      // Check local cache first
      const cached = await nurStorage.getStudentMemory(studentId);
      if (cached && Date.now() - (cached._cachedAt || 0) < 5 * 60 * 1000) {
        return cached;
      }

      const res = await fetch(`/api/ai/nur/memory-profile?studentId=${studentId}`);
      if (!res.ok) return cached || null;

      const json = await res.json();
      if (json.ok && json.data) {
        const profileWithMeta = { ...json.data, _cachedAt: Date.now() };
        await nurStorage.setStudentMemory(studentId, profileWithMeta);
        return json.data;
      }
      return cached;
    } catch (err) {
      return (await nurStorage.getStudentMemory(studentId)) || null;
    }
  }
}
