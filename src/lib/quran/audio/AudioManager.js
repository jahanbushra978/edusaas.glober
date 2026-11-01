/**
 * Unified Universal Quran Audio Infrastructure - Audio Channel Manager & Synthesizer
 * Rahmania Institute / Nur AI Quran Learning Platform
 * 
 * Manages low-level audio channel playback, volume, rate, seeking, and synthesized
 * Web Audio API chimes with zero external file dependencies and instant response.
 */

import { AUDIO_CONFIG } from "./AudioConfig.js";
import { audioEvents, AUDIO_EVENTS } from "./AudioEvents.js";
import { audioCache } from "./AudioCache.js";

class AudioManager {
  constructor() {
    this.activeAudio = null;
    this.activeAssetId = null;
    this.activeSessionId = 0;
    this.volume = AUDIO_CONFIG.DEFAULT_VOLUME;
    this.playbackRate = AUDIO_CONFIG.DEFAULT_PLAYBACK_SPEED;
    this.isMuted = false;
    this.audioContext = null;
    this.timeUpdateCallback = null;
  }

  /**
   * Lazily retrieve or resume singleton Web Audio API context
   * @returns {AudioContext|null}
   */
  getAudioContext() {
    if (typeof window === "undefined") return null;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;

      if (!this.audioContext || this.audioContext.state === "closed") {
        this.audioContext = new AudioContextClass();
      }
      if (this.audioContext && this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }
      return this.audioContext;
    } catch {
      return null;
    }
  }

  /**
   * Stop active audio gracefully
   */
  stop() {
    this.activeSessionId += 1; // Invalidate any pending callbacks
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
        this.activeAudio.ontimeupdate = null;
        this.activeAudio.onended = null;
        this.activeAudio.onerror = null;
      } catch {}
      this.activeAudio = null;
    }
    const previousId = this.activeAssetId;
    this.activeAssetId = null;
    this.timeUpdateCallback = null;

    if (previousId) {
      audioEvents.emit(AUDIO_EVENTS.STOPPED, { assetId: previousId });
    }
  }

  /**
   * Pause current playback without resetting position
   */
  pause() {
    if (this.activeAudio && !this.activeAudio.paused) {
      try {
        this.activeAudio.pause();
        audioEvents.emit(AUDIO_EVENTS.PAUSED, {
          assetId: this.activeAssetId,
          currentTime: this.activeAudio.currentTime,
        });
      } catch {}
    }
  }

  /**
   * Resume paused playback
   */
  resume() {
    if (this.activeAudio && this.activeAudio.paused) {
      try {
        this.activeAudio.play().catch(() => {});
        audioEvents.emit(AUDIO_EVENTS.PLAYING, {
          assetId: this.activeAssetId,
          currentTime: this.activeAudio.currentTime,
        });
      } catch {}
    }
  }

  /**
   * Seek to target time in seconds
   * @param {number} timeSeconds
   */
  seek(timeSeconds) {
    if (this.activeAudio && !isNaN(timeSeconds)) {
      try {
        this.activeAudio.currentTime = Math.max(0, Math.min(timeSeconds, this.activeAudio.duration || timeSeconds));
      } catch {}
    }
  }

  /**
   * Set global volume (0.0 to 1.0)
   * @param {number} vol
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.activeAudio) {
      this.activeAudio.volume = this.isMuted ? 0 : this.volume;
    }
  }

  /**
   * Toggle or set mute
   * @param {boolean} [muted]
   */
  setMute(muted) {
    this.isMuted = muted !== undefined ? muted : !this.isMuted;
    if (this.activeAudio) {
      this.activeAudio.volume = this.isMuted ? 0 : this.volume;
    }
  }

  /**
   * Set playback speed rate (0.5x to 2.0x)
   * @param {number} rate
   */
  setPlaybackRate(rate) {
    this.playbackRate = Math.max(0.25, Math.min(3.0, rate));
    if (this.activeAudio) {
      try {
        this.activeAudio.playbackRate = this.playbackRate;
        this.activeAudio.defaultPlaybackRate = this.playbackRate;
      } catch {}
    }
  }

  /**
   * Play an audio track with retry fallback across candidate URLs
   * @param {string[]} candidateUrls - Ordered list of CDN/mirror URLs
   * @param {Object} [options]
   * @returns {Promise<HTMLAudioElement|null>}
   */
  playCandidateUrls(candidateUrls, options = {}) {
    if (typeof window === "undefined" || !candidateUrls || candidateUrls.length === 0) {
      if (options.onEnd) options.onEnd();
      return Promise.resolve(null);
    }

    // Enforce exclusive playback: stop existing sound
    this.stop();

    const sessionId = this.activeSessionId;
    const assetId = options.assetId || candidateUrls[0];
    this.activeAssetId = assetId;

    return new Promise((resolve) => {
      let candidateIndex = 0;

      const tryNextCandidate = () => {
        // If newer playback session was started, abort this attempt
        if (this.activeSessionId !== sessionId) {
          resolve(null);
          return;
        }

        if (candidateIndex >= candidateUrls.length) {
          audioEvents.emit(AUDIO_EVENTS.ERROR, {
            assetId,
            urls: candidateUrls,
            message: "All candidate audio URLs failed to load or play",
          });
          if (options.onError) options.onError(new Error("Audio load failed across all CDN candidates"));
          if (options.onEnd) options.onEnd();
          resolve(null);
          return;
        }

        const currentUrl = candidateUrls[candidateIndex];
        candidateIndex += 1;

        audioEvents.emit(AUDIO_EVENTS.LOADING, { assetId, url: currentUrl });

        try {
          const audio = audioCache.getOrCreate(currentUrl, {
            volume: this.isMuted ? 0 : (options.volume !== undefined ? options.volume : this.volume),
            rate: options.rate !== undefined ? options.rate : this.playbackRate,
          });

          if (!audio) {
            tryNextCandidate();
            return;
          }

          this.activeAudio = audio;

          // Time update tracking
          audio.ontimeupdate = () => {
            if (this.activeSessionId !== sessionId) return;
            const currentTime = audio.currentTime;
            const duration = audio.duration || 0;
            const percent = duration > 0 ? (currentTime / duration) * 100 : 0;
            if (options.onProgress) {
              options.onProgress({ currentTime, duration, percent });
            }
          };

          // Playback completion
          audio.onended = () => {
            if (this.activeSessionId !== sessionId) return;
            this.activeAudio = null;
            this.activeAssetId = null;
            audioEvents.emit(AUDIO_EVENTS.ENDED, { assetId, url: currentUrl });
            if (options.onEnd) options.onEnd();
          };

          // Error recovery
          audio.onerror = () => {
            if (this.activeSessionId !== sessionId) return;
            tryNextCandidate();
          };

          // Safe promise playback
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                if (this.activeSessionId !== sessionId) {
                  try { audio.pause(); } catch {}
                  return;
                }
                audioEvents.emit(AUDIO_EVENTS.PLAYING, { assetId, url: currentUrl });
                if (options.onStart) options.onStart();
                resolve(audio);
              })
              .catch((err) => {
                if (this.activeSessionId !== sessionId) return;
                if (err.name === "NotAllowedError") {
                  // Autoplay policy prevented playback
                  audioEvents.emit(AUDIO_EVENTS.ERROR, {
                    assetId,
                    url: currentUrl,
                    message: "Browser autoplay policy prevented audio playback without user gesture",
                  });
                  if (options.onError) options.onError(err);
                  resolve(null);
                } else {
                  tryNextCandidate();
                }
              });
          } else {
            resolve(audio);
          }
        } catch {
          tryNextCandidate();
        }
      };

      tryNextCandidate();
    });
  }

  /**
   * Synthesize Instant Web Audio API Chimes (0ms latency, zero files)
   * @param {"correct"|"wrong"|"tap"|"star"|"complete"} type
   */
  playSynthesizedChime(type = "correct") {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (type === "tap") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === "correct" || type === "success") {
        // Melodious Major Triad Ascending: C5 -> E5 -> G5
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);

          gain.gain.setValueAtTime(0, now + idx * 0.07);
          gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.07 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.28);

          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.3);
        });
      } else if (type === "wrong" || type === "error") {
        // Gentle descending buzzer
        const notes = [293.66, 277.18];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          gain.gain.setValueAtTime(0, now + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.28);
        });
      } else if (type === "star" || type === "pop") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "triangle";
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "complete" || type === "celebrate") {
        // Grand Ma Sha Allah Celebration Fanfare
        const chords = [
          { time: 0.0, freqs: [261.63, 329.63, 392.00] },
          { time: 0.12, freqs: [329.63, 392.00, 523.25] },
          { time: 0.24, freqs: [392.00, 523.25, 659.25] },
          { time: 0.36, freqs: [523.25, 659.25, 783.99, 1046.50] },
        ];
        chords.forEach((chord) => {
          chord.freqs.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + chord.time);

            gain.gain.setValueAtTime(0, now + chord.time);
            gain.gain.linearRampToValueAtTime(0.1, now + chord.time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + chord.time + 0.45);

            osc.start(now + chord.time);
            osc.stop(now + chord.time + 0.48);
          });
        });
      }
    } catch {}
  }
}

export const audioManager = new AudioManager();
export default audioManager;

