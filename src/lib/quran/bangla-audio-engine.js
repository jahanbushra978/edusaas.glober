import React from "react";

/**
 * Voice Engine Profiles
 * ইঞ্জিন ২ (প্রাকৃতিক মানবিক স্টুডিও কণ্ঠ — ElevenLabs v3) ডিফল্ট হিসেবে সেট করা হয়েছে
 */
export const ELEVENLABS_STUDIO_VOICES = {
  brian: {
    id: "brian",
    voiceId: "nPczCjzI2devNBz1zQrb",
    name: "উস্তাদ ভয়েস ১ (Brian — গভীর ও শান্ত)",
    shortName: "গভীর ও শান্ত",
  },
  bill: {
    id: "bill",
    voiceId: "pqHfZKP75CvOlQylNhV4",
    name: "উস্তাদ ভয়েস ২ (Bill — অভিজ্ঞ ও স্থির)",
    shortName: "অভিজ্ঞ ও স্থির",
  },
  george: {
    id: "george",
    voiceId: "JBFqnCBsd6RMkjVDRZzb",
    name: "উস্তাদ ভয়েস ৩ (George — স্পষ্ট ও মধুর)",
    shortName: "স্পষ্ট ও মধুর",
  },
  daniel: {
    id: "daniel",
    voiceId: "onwK4e9ZLuTAKqWW03F9",
    name: "উস্তাদ ভয়েস ৪ (Daniel — ধীর ও হৃদয়স্পর্শী)",
    shortName: "ধীর ও হৃদয়স্পর্শী",
  },
};

export const BANGLA_VOICE_ENGINES = {
  "engine-2": {
    id: "engine-2",
    code: "engine-2",
    name: "ইঞ্জিন ২: প্রাকৃতিক মানবিক স্টুডিও কণ্ঠ (ElevenLabs v3)",
    shortName: "প্রাকৃতিক স্টুডিও কণ্ঠ (v3)",
    description: "রোবোটিকতামুক্ত স্বাভাবিক মানবিক ও হৃদয়স্পর্শী বাংলা ভয়েস",
    pitch: "0Hz",
    rate: "-3%",
    isDefault: true,
  },
  "engine-1": {
    id: "engine-1",
    code: "engine-1",
    name: "ইঞ্জিন ১: প্রদীপ স্টুডিও (ফ্রি)",
    shortName: "প্রদীপ স্টুডিও (ফ্রি)",
    description: "রোবোটিকতামুক্ত এনালগ স্টুডিও মাস্টার্ড বাংলা কণ্ঠ (সীমাহীন ও সম্পূর্ণ ফ্রি)",
    pitch: "default",
    rate: "default",
    isDefault: false,
  },
};

export const EL_VOICE_STORAGE_KEY = "rahmania_bangla_el_voice";

/**
 * Universal Bengali Quran Translation Audio Engine
 * (সার্বজনীন বাংলা অনুবাদ অডিও ইঞ্জিন)
 *
 * Provides high-fidelity, natural neural Bengali speech for any Quran translation.
 * Uses a singleton audio player to prevent audio clashing across the application.
 */

class UniversalBanglaAudioEngine {
  constructor() {
    this.audio = null;
    this.currentId = null;
    this.status = "idle"; // 'idle' | 'loading' | 'playing' | 'paused' | 'error'
    this.listeners = new Set();
    this.audioCache = new Map();
    this.currentWords = [];
    this.activeWordIndex = -1;
    this.currentTime = 0;
    this.duration = 0;
    this.progress = 0;

    if (typeof window !== "undefined") {
      // Listen for global Quran Arabic audio playback to stop Bengali playback gracefully
      window.addEventListener("rahmania-arabic-audio-start", () => {
        this.stop();
      });
    }
  }

  /**
   * Get currently active voice engine (Default: 'engine-2' ElevenLabs v3 Studio)
   */
  getActiveEngine() {
    if (typeof window === "undefined") return "engine-2";
    try {
      return localStorage.getItem("rahmania_bangla_voice_engine") || "engine-2";
    } catch {
      return "engine-2";
    }
  }

  /**
   * Switch the active voice engine globally
   */
  setActiveEngine(engineId) {
    if (typeof window === "undefined") return;
    try {
      const validId = engineId === "engine-1" ? "engine-1" : "engine-2";
      localStorage.setItem("rahmania_bangla_voice_engine", validId);
      if (this.status === "playing" || this.status === "loading") {
        this.stop();
      }
      this.notify();
      window.dispatchEvent(
        new CustomEvent("rahmania-bangla-engine-changed", { detail: { engine: validId } })
      );
    } catch (e) {
      console.warn("Could not save active engine:", e);
    }
  }

  /**
   * Clean Bengali translation text for natural, pristine speech synthesis
   */
  cleanText(rawText) {
    if (!rawText) return "";
    let t = String(rawText);

    // Strip bracketed footnote references like [১], (১), [1], etc.
    t = t.replace(/\[\s*[\d০-৯]+\s*\]/g, "");
    t = t.replace(/\(\s*[\d০-৯]+\s*\)/g, "");

    // Strip Markdown or HTML tags
    t = t.replace(/<[^>]+>/g, "");
    t = t.replace(/[*_~`#]/g, "");

    // Convert English digits to Bengali digits
    const enToBn = { "0":"০","1":"১","2":"২","3":"৩","4":"৪","5":"৫","6":"৬","7":"৭","8":"৮","9":"৯" };
    t = t.replace(/\d/g, (d) => enToBn[d] || d);

    // Remove redundant whitespace
    t = t.replace(/\s+/g, " ").trim();
    return t;
  }

  /**
   * Get direct neural audio URL for Bengali text
   */
  getActiveElVoice() {
    if (typeof window === "undefined") return "brian";
    try {
      const saved = localStorage.getItem(EL_VOICE_STORAGE_KEY);
      if (saved && ELEVENLABS_STUDIO_VOICES[saved]) return saved;
    } catch {}
    return "brian";
  }

  setActiveElVoice(voiceKey) {
    if (!ELEVENLABS_STUDIO_VOICES[voiceKey]) return;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(EL_VOICE_STORAGE_KEY, voiceKey);
      }
    } catch {}
    this.notify();
  }

  getAudioUrl(text, engineOverride = null, elVoiceOverride = null) {
    const clean = this.cleanText(text);
    if (!clean) return "";
    const activeEngine = engineOverride || this.getActiveEngine();
    const activeElVoice = elVoiceOverride || this.getActiveElVoice();
    return `/api/ai/tts?text=${encodeURIComponent(clean)}&lang=bn&gender=male&engine=${encodeURIComponent(activeEngine)}&elVoice=${encodeURIComponent(activeElVoice)}&v=studio-v14`;
  }

  /**
   * Subscribe to playback status updates
   */
  subscribe(callback) {
    this.listeners.add(callback);
    // Send immediate initial state
    callback({
      currentId: this.currentId,
      status: this.status,
      isPlaying: this.status === "playing",
      isLoading: this.status === "loading",
      activeWordIndex: this.activeWordIndex,
      progress: this.progress,
      currentTime: this.currentTime,
      duration: this.duration,
      activeEngine: this.getActiveEngine(),
      activeElVoice: this.getActiveElVoice(),
    });

    return () => {
      this.listeners.delete(callback);
    };
  }

  notify() {
    const state = {
      currentId: this.currentId,
      status: this.status,
      isPlaying: this.status === "playing",
      isLoading: this.status === "loading",
      activeWordIndex: this.activeWordIndex,
      progress: this.progress,
      currentTime: this.currentTime,
      duration: this.duration,
      activeEngine: this.getActiveEngine(),
      activeElVoice: this.getActiveElVoice(),
    };
    this.listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (err) {
        console.error("Audio engine listener error:", err);
      }
    });
  }

  /**
   * Stop any active Bengali audio playback
   */
  stop() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.ontimeupdate = null;
        this.audio.onplay = null;
        this.audio.onended = null;
        this.audio.onerror = null;
      } catch (e) {
        console.warn("Audio pause error:", e);
      }
      this.audio = null;
    }
    this.currentId = null;
    this.status = "idle";
    this.activeWordIndex = -1;
    this.currentTime = 0;
    this.duration = 0;
    this.progress = 0;
    this.currentWords = [];
    this.notify();
  }

  /**
   * Browser Native Speech Synthesis Fallback (Web Speech API)
   * Ensures uninterrupted audio even when network or server is offline/unavailable.
   */
  playBrowserSpeechFallback(cleanText, id) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      this.status = "error";
      this.notify();
      setTimeout(() => {
        if (this.currentId === id) this.stop();
      }, 1500);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "bn-BD";
      utterance.rate = 0.92;

      utterance.onstart = () => {
        if (this.currentId === id) {
          this.status = "playing";
          this.notify();
        }
      };

      utterance.onboundary = (event) => {
        if (this.currentId !== id || !this.currentWords || this.currentWords.length === 0) return;
        const charIndex = event.charIndex || 0;
        let runningChars = 0;
        for (let i = 0; i < this.currentWords.length; i++) {
          runningChars += (this.currentWords[i].length + 1);
          if (charIndex < runningChars || i === this.currentWords.length - 1) {
            if (this.activeWordIndex !== i) {
              this.activeWordIndex = i;
              this.notify();
            }
            break;
          }
        }
      };

      utterance.onend = () => {
        if (this.currentId === id) {
          this.stop();
        }
      };

      utterance.onerror = () => {
        if (this.currentId === id) {
          this.stop();
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.stop();
    }
  }

  /**
   * Play Bengali audio for translation text with unique identifier
   */
  async play(text, id) {
    if (typeof window === "undefined") return;

    const clean = this.cleanText(text);
    if (!clean) return;

    // Split text into words for real-time word-by-word tracking
    this.currentWords = clean.split(/\s+/).filter(Boolean);
    this.activeWordIndex = 0;
    this.currentTime = 0;
    this.duration = 0;
    this.progress = 0;

    // Notify other players (like Arabic recitation) to stop so they don't clash
    window.dispatchEvent(new CustomEvent("rahmania-bangla-audio-start", { detail: { id } }));

    // If already playing this ID, stop it (toggle behavior)
    if (this.currentId === id && this.status === "playing") {
      this.stop();
      return;
    }

    // Stop previous audio playback cleanly
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.ontimeupdate = null;
        this.audio.onplay = null;
        this.audio.onplaying = null;
        this.audio.oncanplay = null;
        this.audio.onended = null;
        this.audio.onerror = null;
      } catch (e) {}
      this.audio = null;
    }

    this.currentId = id;
    this.status = "loading";
    this.notify();

    const audioUrl = this.getAudioUrl(clean);

    try {
      const audio = new Audio();
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      audio.volume = 1.0;
      audio.preservesPitch = true;
      audio.playbackRate = 1.0; // Natural, authentic human cadence
      audio.src = audioUrl;
      this.audio = audio;

      audio.onplay = () => {
        if (this.currentId === id) {
          this.status = "playing";
          this.notify();
        }
      };

      audio.onplaying = () => {
        if (this.currentId === id) {
          this.status = "playing";
          this.notify();
        }
      };

      audio.oncanplay = () => {
        if (this.currentId === id && this.status === "loading") {
          audio.play().catch(() => {});
        }
      };

      // Real-time word-by-word tracking synchronized with speech pacing
      audio.ontimeupdate = () => {
        if (!this.audio || this.currentId !== id) return;
        const { currentTime, duration } = this.audio;
        if (!duration || isNaN(duration) || duration <= 0) return;

        if (this.status !== "playing") {
          this.status = "playing";
        }

        this.currentTime = currentTime;
        this.duration = duration;

        if (this.currentWords && this.currentWords.length > 0) {
          const totalWords = this.currentWords.length;
          if (totalWords <= 1) {
            if (this.activeWordIndex !== 0) {
              this.activeWordIndex = 0;
              this.notify();
            }
          } else {
            // Compensate for TTS lead-in silence (0.25s) and trailing silence (0.45s)
            // বাংলা TTS কণ্ঠস্বর শুরু হওয়ার পরে হাইলাইট জ্বলবে, আগে নয়
            const leadIn = 0.25;
            const trailSilence = 0.45;
            const effectiveTime = Math.max(0, currentTime - leadIn);
            const effectiveDuration = Math.max(0.1, duration - leadIn - trailSilence);
            const progress = Math.min(0.999, Math.max(0, effectiveTime / effectiveDuration));
            this.progress = progress;

            // Acoustically weighted pacing based on syllables, character length and punctuation pauses
            const weights = this.currentWords.map((w, idx) => {
              const cleanW = w.replace(/[।?!,;:\s"'()\[\]]/g, "");
              let wt = Math.max(1.8, cleanW.length * 1.05);

              // Pause bonus for commas (TTS pauses ~350ms)
              if (/[,،]/.test(w)) {
                wt += 3.2;
              }
              // Pause bonus for sentence-terminating danda or exclamation (TTS pauses ~550ms)
              if (/[।?!]/.test(w)) {
                wt += 5.2;
              }
              // Last word ending cadence
              if (idx === totalWords - 1) {
                wt += 2.0;
              }

              return wt;
            });
            const totalWeight = weights.reduce((sum, wt) => sum + wt, 0);

            let accumulated = 0;
            let computedIndex = 0;
            for (let i = 0; i < totalWords; i++) {
              accumulated += weights[i] / totalWeight;
              if (progress < accumulated || i === totalWords - 1) {
                computedIndex = i;
                break;
              }
            }
            if (this.activeWordIndex !== computedIndex) {
              this.activeWordIndex = computedIndex;
              this.notify();
            }
          }
        }
      };

      audio.onended = () => {
        if (this.currentId === id) {
          this.status = "idle";
          this.currentId = null;
          this.audio = null;
          this.activeWordIndex = -1;
          this.currentTime = 0;
          this.duration = 0;
          this.progress = 0;
          this.currentWords = [];
          this.notify();
        }
      };

      audio.onerror = (e) => {
        console.warn("Bengali server audio error, switching to browser speech synthesis:", e);
        if (this.currentId === id) {
          this.playBrowserSpeechFallback(clean, id);
        }
      };

      // Call play() immediately within the synchronous click event gesture
      audio.load();
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (this.currentId === id) {
              this.status = "playing";
              this.notify();
            }
          })
          .catch((err) => {
            if (err.name === "AbortError") return;
            console.warn("Audio play rejected, awaiting buffer stream:", err);
          });
      }
    } catch (err) {
      console.warn("Audio play call failed, switching to browser speech synthesis:", err);
      if (this.currentId === id) {
        this.playBrowserSpeechFallback(clean, id);
      }
    }
  }

  /**
   * Toggle playback for a translation
   */
  toggle(text, id) {
    if (this.currentId === id && (this.status === "playing" || this.status === "loading")) {
      this.stop();
    } else {
      this.play(text, id);
    }
  }

  isPlaying(id) {
    return this.currentId === id && this.status === "playing";
  }

  isLoading(id) {
    return this.currentId === id && this.status === "loading";
  }
}

// Global Singleton Instance
export const banglaAudioEngine =
  typeof window !== "undefined"
    ? (window.__rahmaniaBanglaAudioEngine =
        window.__rahmaniaBanglaAudioEngine || new UniversalBanglaAudioEngine())
    : new UniversalBanglaAudioEngine();

/**
 * Custom React Hook for easily using the Bengali Translation Audio Engine anywhere
 */
export function useBanglaAudioEngine() {
  const [state, setState] = React.useState(() => ({
    currentId: typeof window !== "undefined" ? banglaAudioEngine.currentId : null,
    status: typeof window !== "undefined" ? banglaAudioEngine.status : "idle",
    isPlaying: typeof window !== "undefined" ? banglaAudioEngine.status === "playing" : false,
    isLoading: typeof window !== "undefined" ? banglaAudioEngine.status === "loading" : false,
    activeWordIndex: typeof window !== "undefined" ? (banglaAudioEngine.activeWordIndex ?? -1) : -1,
    progress: typeof window !== "undefined" ? (banglaAudioEngine.progress ?? 0) : 0,
    currentTime: typeof window !== "undefined" ? (banglaAudioEngine.currentTime ?? 0) : 0,
    duration: typeof window !== "undefined" ? (banglaAudioEngine.duration ?? 0) : 0,
    activeEngine: typeof window !== "undefined" ? banglaAudioEngine.getActiveEngine() : "engine-2",
    activeElVoice: typeof window !== "undefined" ? banglaAudioEngine.getActiveElVoice() : "brian",
  }));

  React.useEffect(() => {
    return banglaAudioEngine.subscribe(setState);
  }, []);

  const play = React.useCallback((text, id) => {
    banglaAudioEngine.play(text, id);
  }, []);

  const stop = React.useCallback(() => {
    banglaAudioEngine.stop();
  }, []);

  const toggle = React.useCallback((text, id) => {
    banglaAudioEngine.toggle(text, id);
  }, []);

  const setActiveEngine = React.useCallback((engineId) => {
    banglaAudioEngine.setActiveEngine(engineId);
  }, []);

  const setActiveElVoice = React.useCallback((voiceKey) => {
    banglaAudioEngine.setActiveElVoice(voiceKey);
  }, []);

  const isPlayingId = React.useCallback((id) => {
    return state.currentId === id && state.status === "playing";
  }, [state.currentId, state.status]);

  const isLoadingId = React.useCallback((id) => {
    return state.currentId === id && state.status === "loading";
  }, [state.currentId, state.status]);

  return {
    currentId: state.currentId,
    status: state.status,
    isPlaying: state.isPlaying,
    isLoading: state.isLoading,
    activeWordIndex: state.activeWordIndex ?? -1,
    progress: state.progress ?? 0,
    currentTime: state.currentTime ?? 0,
    duration: state.duration ?? 0,
    activeEngine: state.activeEngine || "engine-2",
    activeElVoice: state.activeElVoice || "brian",
    engines: BANGLA_VOICE_ENGINES,
    elVoices: ELEVENLABS_STUDIO_VOICES,
    isPlayingId,
    isLoadingId,
    play,
    stop,
    toggle,
    setActiveEngine,
    setActiveElVoice,
  };
}
