/**
 * Unified Universal Quran Audio Infrastructure - Sequential Playback Queue
 * Rahmania Institute / Nur AI Quran Learning Platform
 * 
 * Manages ordered sequence playback for lessons, word-by-word Tajweed, and Ayah playlists
 * with pause, resume, auto-advance, delay pacing, and instant cancellation.
 */

import { audioEvents, AUDIO_EVENTS } from "./AudioEvents.js";
import { audioManager } from "./AudioManager.js";

class AudioQueue {
  constructor() {
    this.queue = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.timer = null;
    this.delayBetweenTracksMs = 200;
  }

  /**
   * Enqueue a sequence of audio items and begin playback
   * @param {Array<{ urls: string[], assetId?: string, label?: string }>} items
   * @param {Object} [options]
   */
  start(items, options = {}) {
    this.stop();
    if (!items || items.length === 0) return;

    this.queue = [...items];
    this.currentIndex = 0;
    this.isPlaying = true;
    this.delayBetweenTracksMs = options.delayMs !== undefined ? options.delayMs : 200;
    this.options = options;

    this.playCurrentItem();
  }

  /**
   * Play item at current queue index
   */
  playCurrentItem() {
    if (!this.isPlaying || this.currentIndex >= this.queue.length) {
      this.isPlaying = false;
      audioEvents.emit(AUDIO_EVENTS.QUEUE_COMPLETED, { totalItems: this.queue.length });
      if (this.options?.onComplete) this.options.onComplete();
      return;
    }

    const item = this.queue[this.currentIndex];
    audioEvents.emit(AUDIO_EVENTS.QUEUE_ADVANCED, {
      index: this.currentIndex,
      total: this.queue.length,
      item,
    });

    if (this.options?.onItemStart) {
      this.options.onItemStart(item, this.currentIndex);
    }

    const candidateUrls = Array.isArray(item.urls) ? item.urls : [item.urls || item.url];

    audioManager.playCandidateUrls(candidateUrls, {
      assetId: item.assetId,
      rate: this.options?.rate,
      volume: this.options?.volume,
      onEnd: () => {
        if (!this.isPlaying) return;
        this.currentIndex += 1;
        this.timer = setTimeout(() => {
          this.playCurrentItem();
        }, this.delayBetweenTracksMs);
      },
      onError: () => {
        if (!this.isPlaying) return;
        // Skip failed track and continue queue
        this.currentIndex += 1;
        this.timer = setTimeout(() => {
          this.playCurrentItem();
        }, 50);
      },
    });
  }

  /**
   * Stop the queue and cancel any scheduled transitions
   */
  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.queue = [];
    this.currentIndex = -1;
    audioManager.stop();
  }

  /**
   * Pause the active queue track
   */
  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    audioManager.pause();
  }

  /**
   * Resume the active queue track
   */
  resume() {
    if (!this.isPlaying && this.currentIndex >= 0 && this.currentIndex < this.queue.length) {
      this.isPlaying = true;
      audioManager.resume();
    }
  }

  /**
   * Skip to next item in queue
   */
  next() {
    if (this.timer) clearTimeout(this.timer);
    this.currentIndex += 1;
    this.playCurrentItem();
  }

  /**
   * Return to previous item in queue
   */
  previous() {
    if (this.timer) clearTimeout(this.timer);
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    this.playCurrentItem();
  }
}

export const audioQueue = new AudioQueue();
export default audioQueue;

