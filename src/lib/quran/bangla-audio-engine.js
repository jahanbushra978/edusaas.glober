import React from "react";

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
  getAudioUrl(text) {
    const clean = this.cleanText(text);
    if (!clean) return "";
    return `/api/ai/tts?text=${encodeURIComponent(clean)}&lang=bn&gender=male&v=pradeep-male-v12`;
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

    // Stop whatever was playing previously
    this.stop();

    this.currentId = id;
    this.status = "loading";
    this.currentWords = clean.split(/\s+/).filter(Boolean);
    this.activeWordIndex = 0;
    this.notify();

    const audioUrl = this.getAudioUrl(clean);

    try {
      const audio = new Audio();
      audio.src = audioUrl;
      audio.volume = 1.0;
      audio.preservesPitch = true;
      audio.playbackRate = 1.0; // Natural, authentic human cadence
      this.audio = audio;

      audio.onplay = () => {
        if (this.currentId === id) {
          this.status = "playing";
          this.notify();
        }
      };

      audio.onplaying = () => {
        if (this.currentId === id && this.status !== "playing") {
          this.status = "playing";
          this.notify();
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
        const progress = Math.min(0.999, Math.max(0, currentTime / duration));
        this.progress = progress;

        if (this.currentWords && this.currentWords.length > 0) {
          const totalWords = this.currentWords.length;
          if (totalWords <= 1) {
            if (this.activeWordIndex !== 0) {
              this.activeWordIndex = 0;
              this.notify();
            }
          } else {
            // Proportional weighted pacing based on word syllable/character length
            const weights = this.currentWords.map((w, idx) => {
              const cleanLen = w.replace(/[।?!,;:\s"']/g, "").length || 2;
              return cleanLen + (idx === totalWords - 1 ? 1.5 : 0);
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
        console.warn("Bengali audio playback error:", e);
        if (this.currentId === id) {
          this.status = "error";
          this.activeWordIndex = -1;
          this.notify();
          setTimeout(() => {
            if (this.currentId === id) {
              this.status = "idle";
              this.currentId = null;
              this.audio = null;
              this.activeWordIndex = -1;
              this.notify();
            }
          }, 2000);
        }
      };

      await audio.play();
      if (this.currentId === id && this.status !== "playing") {
        this.status = "playing";
        this.notify();
      }
    } catch (err) {
      console.warn("Audio play call failed:", err);
      if (this.currentId === id) {
        this.status = "error";
        this.notify();
        setTimeout(() => {
          if (this.currentId === id) {
            this.status = "idle";
            this.currentId = null;
            this.audio = null;
            this.notify();
          }
        }, 1500);
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
    isPlayingId,
    isLoadingId,
    play,
    stop,
    toggle,
  };
}
