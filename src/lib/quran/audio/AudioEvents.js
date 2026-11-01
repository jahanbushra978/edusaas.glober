/**
 * Unified Universal Quran Audio Infrastructure - Event Bus
 * Rahmania Institute / Nur AI Quran Learning Platform
 * 
 * Provides type-safe, decoupled pub/sub events for audio playback coordination,
 * UI reactivity, and telemetry without tight component coupling.
 */

export const AUDIO_EVENTS = {
  LOADING: "audio:loading",
  PLAYING: "audio:playing",
  PAUSED: "audio:paused",
  ENDED: "audio:ended",
  STOPPED: "audio:stopped",
  ERROR: "audio:error",
  CACHE_HIT: "audio:cache-hit",
  CACHE_MISS: "audio:cache-miss",
  ASSET_MISSING: "audio:asset-missing",
  SHAYKH_CHANGED: "audio:shaykh-changed",
  QUEUE_ADVANCED: "audio:queue-advanced",
  QUEUE_COMPLETED: "audio:queue-completed",
};

class AudioEventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to a specific audio event
   * @param {string} eventName
   * @param {Function} handler
   * @returns {Function} Unsubscribe function
   */
  on(eventName, handler) {
    if (typeof handler !== "function") return () => {};

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(handler);

    return () => {
      const set = this.listeners.get(eventName);
      if (set) {
        set.delete(handler);
        if (set.size === 0) {
          this.listeners.delete(eventName);
        }
      }
    };
  }

  /**
   * Subscribe to all audio events (for state monitors & debuggers)
   * @param {Function} handler
   * @returns {Function} Unsubscribe function
   */
  subscribeAll(handler) {
    return this.on("*", handler);
  }

  /**
   * Emit an audio event with payload
   * @param {string} eventName
   * @param {Object} payload
   */
  emit(eventName, payload = {}) {
    const timestamp = Date.now();
    const eventData = { ...payload, event: eventName, timestamp };

    // Notify specific listeners
    const specific = this.listeners.get(eventName);
    if (specific) {
      specific.forEach((fn) => {
        try {
          fn(eventData);
        } catch (err) {
          console.warn(`[AudioEvents] Error in handler for "${eventName}":`, err);
        }
      });
    }

    // Notify wildcard listeners
    const wildcard = this.listeners.get("*");
    if (wildcard) {
      wildcard.forEach((fn) => {
        try {
          fn(eventData);
        } catch (err) {
          console.warn("[AudioEvents] Error in wildcard handler:", err);
        }
      });
    }

    // Also dispatch browser CustomEvent if in browser context
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(
          new CustomEvent(`rahmania:${eventName}`, { detail: eventData })
        );
      } catch {}
    }
  }

  /**
   * Clear all active listeners
   */
  removeAllListeners() {
    this.listeners.clear();
  }
}

export const audioEvents = new AudioEventEmitter();
export default audioEvents;

