/**
 * Advanced Conversational AI Voice Agent Engine
 * Core technical modulation layer for prosody, barge-in, emotion, and audio quality.
 */

export const VOICE_PERSONAS = {
  male: [
    {
      id: "male_scholarly",
      nameBn: "উস্তাদ তারিক",
      nameEn: "Ustadh Tariq",
      gender: "male",
      descBn: "গম্ভীর, স্নেহশীল ও প্রজ্ঞাময় বাচনভঙ্গি",
      pitchModifier: 0.92,
      rateModifier: 0.92,
      lang: "bn-BD",
      preferredVoices: ["bn-BD", "bn-IN", "hi-IN", "ar-SA"]
    },
    {
      id: "male_energetic",
      nameBn: "উস্তাদ সালমান",
      nameEn: "Ustadh Salman",
      gender: "male",
      descBn: "স্পষ্ট, প্রাণবন্ত ও প্রাঞ্জল উপস্থাপনা",
      pitchModifier: 1.02,
      rateModifier: 1.0,
      lang: "bn-BD",
      preferredVoices: ["bn-BD", "bn-IN", "en-US"]
    },
    {
      id: "male_english",
      nameBn: "উস্তাদ ডেভিড (ইংরেজি)",
      nameEn: "Ustadh David (English)",
      gender: "male",
      descBn: "ইংরেজি ও ইসলামিক পরিভাষার আন্তর্জাতিক মান",
      pitchModifier: 0.95,
      rateModifier: 0.95,
      lang: "en-US",
      preferredVoices: ["en-US", "en-GB", "en-AU"]
    }
  ],
  female: [
    {
      id: "female_calm",
      nameBn: "উস্তাদা ফাতিমা",
      nameEn: "Ustadha Fatima",
      gender: "female",
      descBn: "শান্ত, মমতাময়ী ও ধৈর্যশীল পাঠদান",
      pitchModifier: 1.15,
      rateModifier: 0.90,
      lang: "bn-BD",
      preferredVoices: ["bn-BD", "bn-IN", "hi-IN"]
    },
    {
      id: "female_cheerful",
      nameBn: "উস্তাদা মারিয়াম",
      nameEn: "Ustadha Maryam",
      gender: "female",
      descBn: "উষ্ণ, উৎসাহব্যঞ্জক ও আনন্দদায়ক সুর",
      pitchModifier: 1.22,
      rateModifier: 1.02,
      lang: "bn-BD",
      preferredVoices: ["bn-BD", "bn-IN", "en-US"]
    },
    {
      id: "female_english",
      nameBn: "উস্তাদা সারাহ (ইংরেজি)",
      nameEn: "Ustadha Sarah (English)",
      gender: "female",
      descBn: "আন্তর্জাতিক ইংরেজি ও সহানুভূতিশীল কণ্ঠ",
      pitchModifier: 1.12,
      rateModifier: 0.95,
      lang: "en-US",
      preferredVoices: ["en-US", "en-GB", "en-CA"]
    }
  ]
};

export const EMOTIONS = [
  { id: "calm", labelBn: "শান্ত ও সংযত", labelEn: "Calm", pitchFactor: 0.95, rateFactor: 0.88, pauseMs: 350 },
  { id: "encouraging", labelBn: "উৎসাহব্যঞ্জক ও স্নেহশীল", labelEn: "Encouraging", pitchFactor: 1.06, rateFactor: 1.0, pauseMs: 250 },
  { id: "empathetic", labelBn: "সহানুভূতিশীল ও মমতাময়ী", labelEn: "Empathetic", pitchFactor: 0.92, rateFactor: 0.85, pauseMs: 400 },
  { id: "scholarly", labelBn: "জ্ঞানী ও কর্তৃত্বপূর্ণ", labelEn: "Scholarly", pitchFactor: 0.96, rateFactor: 0.92, pauseMs: 300 },
  { id: "cheerful", labelBn: "উচ্ছ্বসিত ও আনন্দিত", labelEn: "Cheerful", pitchFactor: 1.12, rateFactor: 1.05, pauseMs: 200 }
];

export const BACKCHANNELS_BN = ["হুম", "আচ্ছা", "জি", "শুনছি", "ঠিক আছে", "বলুন"];
export const BACKCHANNELS_EN = ["Mm-hmm", "I see", "Yes", "Go ahead", "Right"];

/**
 * Returns professional WebRTC/Audio constraints for crystal-clear voice I/O
 */
export function getOptimalAudioConstraints() {
  return {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
      sampleRate: 48000,
      latency: 0.02
    }
  };
}

/**
 * Sanitizes and cleans text for speech synthesis so TTS never pronounces "dash", "asterisk", or formatting characters.
 */
export function cleanTextForSpeech(text) {
  if (!text) return "";
  let cleaned = String(text);

  // 1. Remove Markdown links [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // 2. Remove Markdown bold/italic/code (**text** -> text, *text* -> text, `text` -> text, # header)
  cleaned = cleaned.replace(/[*_~`#]/g, "");

  // 3. Convert percentage symbol: "88%" -> "৮৮ শতাংশ"
  cleaned = cleaned.replace(/(\d+)\s*%/g, "$1 শতাংশ");

  // 4. Convert Arabic diacritic dash placeholders (-ً -ٍ -ٌ) into natural Bengali words
  cleaned = cleaned.replace(/-ً\s*-ٍ\s*-ٌ/g, "দুই যবর দুই যের দুই পেশ");
  cleaned = cleaned.replace(/-ً/g, "দুই যবর");
  cleaned = cleaned.replace(/-ٍ/g, "দুই যের");
  cleaned = cleaned.replace(/-ٌ/g, "দুই পেশ");

  // 5. Remove em dashes, en dashes, hyphens used as bullets or separators: "—", "–", "---", "--", "- "
  cleaned = cleaned.replace(/\s*[—–]\s*/g, ", ");
  cleaned = cleaned.replace(/^-+\s*/gm, "");
  cleaned = cleaned.replace(/\s+-\s+/g, ", ");
  cleaned = cleaned.replace(/---+/g, " ");

  // 6. Remove bullet point dots: "•", "▪", "▫", "★"
  cleaned = cleaned.replace(/[•▪▫★*]/g, "");

  // 7. Remove common emoji icons that TTS reads weirdly
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "");

  // 8. Remove parentheses containing Arabic text or diacritics like (سُوْرَةُ الْفَاتِحَةِ)
  // so Bengali TTS does not choke on Arabic ligatures
  cleaned = cleaned.replace(/\([\u0600-\u06FF\s]+\)/g, "");

  // 9. Remove parenthetical dashes like (-) or (- )
  cleaned = cleaned.replace(/\(\s*-\s*\)/g, "");

  // 10. Convert isolated Arabic letters to Bengali phonetics so Bengali TTS pronounces them properly
  const arLetterToBn = {
    "ا": "আলিফ", "ب": "বা", "ت": "তা", "ث": "ছা", "ج": "জীম",
    "ح": "হা", "خ": "খা", "د": "দাল", "ذ": "যাল", "ر": "রা",
    "ز": "ঝা", "س": "সীন", "ش": "শীন", "ص": "সোয়াদ", "ض": "দোয়াদ",
    "ط": "ত্বোয়া", "ظ": "যোয়া", "ع": "আইন", "غ": "গইন", "ف": "ফা",
    "ق": "ক্বাফ", "ك": "কাফ", "ل": "লাম", "م": "মীম", "ن": "নূন",
    "و": "ওয়াও", "ه": "হা", "ي": "ইয়া", "ء": "হামযাহ"
  };
  cleaned = cleaned.replace(/[\u0621-\u064A]/g, (ch) => arLetterToBn[ch] || "");

  // 11. Transliterate common English & Tajweed technical words to Bengali
  const termMap = [
    [/\bTajweed\b/gi, "তাজবীদ"],
    [/\bTilawat\b/gi, "তিলাওয়াত"],
    [/\bMakhraj\b/gi, "মাখরাজ"],
    [/\bAyah\b/gi, "আয়াত"],
    [/\bAyahs\b/gi, "আয়াতসমূহ"],
    [/\bSurah\b/gi, "সূরা"],
    [/\bJuz\b/gi, "পারা"],
    [/\bScore\b/gi, "স্কোর"],
    [/\bQari\b/gi, "ক্বারী"],
    [/\bHifz\b/gi, "হিফজ"],
    [/\bSabaq\b/gi, "সবক"],
    [/\bPassed\b/gi, "উত্তীর্ণ"],
    [/\bExcellent\b/gi, "চমৎকার"],
    [/\bModerate\b/gi, "মাঝারি"],
    [/\bLokma\b/gi, "লুকমা"],
  ];
  for (const [re, bn] of termMap) {
    cleaned = cleaned.replace(re, bn);
  }

  // 12. Strip robotic score readings from speech so the teacher sounds empathetic
  cleaned = cleaned.replace(/\(স্কোর[^)]*\)/gi, "");
  cleaned = cleaned.replace(/তাজবীদ\s*স্কোর\s*[:\s]*[০-৯\d]+\s*শতাংশ[।,.]*/gi, "");
  cleaned = cleaned.replace(/স্কোর\s*[:\s]*[০-৯\d]+\s*শতাংশ[।,.]*/gi, "");
  cleaned = cleaned.replace(/পরিলক্ষিত\s*হয়েছে/gi, "দেখা গেছে");
  cleaned = cleaned.replace(/পরিলক্ষিত\s*হয়/gi, "দেখা যায়");

  // 13. Convert English digits to Bengali digits
  const digitMap = { "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯" };
  cleaned = cleaned.replace(/\d/g, (d) => digitMap[d] || d);

  // 14. Convert mechanical "আয়াত ১" to natural "এক নম্বর আয়াত"
  cleaned = cleaned.replace(/\bআয়াত\s*([০-৯]+)/g, (m, n) => {
    const numWords = { "১": "এক", "২": "দুই", "৩": "তিন", "৪": "চার", "৫": "পাঁচ", "৬": "ছয়", "৭": "সাত", "৮": "আট", "৯": "নয়", "১০": "দশ" };
    return `${numWords[n] || n} নম্বর আয়াত`;
  });

  // 15. Strip colons, semicolons, brackets, parentheses so TTS never speaks "bracket", "colon", or punctuation
  cleaned = cleaned.replace(/[:;]/g, ", ");
  cleaned = cleaned.replace(/[()[\]{}<>"']/g, " ");

  // 16. Clean up extra punctuation, remaining non-speech symbols, and consecutive spaces
  cleaned = cleaned.replace(/,\s*,+/g, ", ");
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

/**
 * Voice Agent Engine Class
 * Controls speech synthesis, real-time barge-in, AudioContext gains, and emotional prosody.
 */
export class VoiceAgentEngine {
  constructor(config = {}) {
    this.gender = config.gender || "male";
    this.personaId = config.personaId || "male_scholarly";
    this.emotion = config.emotion || "encouraging";
    this.language = config.language || "bn-BD";
    this.baseSpeed = config.baseSpeed || 1.0;
    this.basePitch = config.basePitch || 1.0;
    this.bargeInEnabled = config.bargeInEnabled !== false;
    this.bargeInSensitivity = config.bargeInSensitivity || "medium"; // 'low' | 'medium' | 'high'
    this.backchannelsEnabled = config.backchannelsEnabled !== false;

    this.audioContext = null;
    this.gainNode = null;
    this.currentUtterance = null;
    this.currentAudio = null;
    this.isSpeaking = false;
    this.onStateChange = config.onStateChange || null;
  }

  getAudioContext() {
    if (typeof window === "undefined") return null;
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
      }
    }
    return this.audioContext;
  }

  getActivePersona() {
    const list = VOICE_PERSONAS[this.gender] || VOICE_PERSONAS.male;
    return list.find((p) => p.id === this.personaId) || list[0];
  }

  getActiveEmotion() {
    return EMOTIONS.find((e) => e.id === this.emotion) || EMOTIONS[1];
  }

  /**
   * Smooth Barge-In Interrupt: Stops active audio or synthesis immediately.
   */
  interrupt() {
    if (typeof window === "undefined") return;

    // 1. Stop high-quality Neural TTS audio element if active
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }

    // 2. AudioContext fade out
    if (this.gainNode && this.audioContext) {
      try {
        const now = this.audioContext.currentTime;
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.linearRampToValueAtTime(0.001, now + 0.08);
      } catch {}
    }

    // 3. SpeechSynthesis immediate cancellation
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    this.isSpeaking = false;
    if (this.onStateChange) this.onStateChange("idle");
  }

  /**
   * Calculate effective Pitch & Rate according to persona and emotional modulation
   */
  getProsodyValues() {
    const persona = this.getActivePersona();
    const emotion = this.getActiveEmotion();

    const rate = Math.min(1.6, Math.max(0.65, this.baseSpeed * persona.rateModifier * emotion.rateFactor));
    const pitch = Math.min(1.6, Math.max(0.65, this.basePitch * persona.pitchModifier * emotion.pitchFactor));

    return { rate, pitch, pauseMs: emotion.pauseMs };
  }


  /**
   * Applies acoustic EQ, chest resonance, and de-essing filters to an HTML5 Audio element
   */
  setupAudioDspPipeline(audio, gender, _personaId) {
    try {
      if (typeof window === "undefined") return null;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;

      if (!this.audioContext || this.audioContext.state === "closed") {
        this.audioContext = new AudioCtx();
      }
      const ctx = this.audioContext;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const source = ctx.createMediaElementSource(audio);

      // 1. Subtle Low-Shelf for natural acoustic warmth without muffled boominess
      const lowShelf = ctx.createBiquadFilter();
      lowShelf.type = "lowshelf";
      lowShelf.frequency.value = gender === "female" ? 240 : 180;
      lowShelf.gain.value = gender === "female" ? +0.5 : +2.2;

      // 2. Vocal Presence & Articulation Clarity (natural speech intelligibility)
      const clarityFilter = ctx.createBiquadFilter();
      clarityFilter.type = "peaking";
      clarityFilter.frequency.value = gender === "female" ? 3200 : 2800;
      clarityFilter.Q.value = 1.0;
      clarityFilter.gain.value = gender === "female" ? +1.0 : +1.5;

      // 3. Gentle De-esser High-Shelf (smoothes out harsh consonants naturally)
      const highShelf = ctx.createBiquadFilter();
      highShelf.type = "highshelf";
      highShelf.frequency.value = 6500;
      highShelf.gain.value = gender === "female" ? -1.0 : -1.8;

      // 4. Gentle Studio Dynamics Compressor (consistent vocal loudness without pumping)
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 10;
      compressor.ratio.value = 2.2;
      compressor.attack.value = 0.005;
      compressor.release.value = 0.18;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.value = 1.0;

      source.connect(lowShelf);
      lowShelf.connect(clarityFilter);
      clarityFilter.connect(highShelf);
      highShelf.connect(compressor);
      compressor.connect(masterGain);
      masterGain.connect(ctx.destination);

      return { source, masterGain };
    } catch (dspErr) {
      // In case cross-origin or already-connected, audio still plays directly
      console.warn("Web Audio DSP notice (playing direct):", dspErr?.message);
      return null;
    }
  }

  /**
   * Synthesize and speak text.
   * Prioritizes ultra-clear Neural Bengali Audio from /api/ai/tts with Acoustic DSP Shaping,
   * with seamless offline fallback to browser SpeechSynthesis.
   */
  speak(text, { onEnd, onError, onStart } = {}) {
    if (typeof window === "undefined") {
      if (onEnd) onEnd();
      return;
    }

    // Cancel prior playback
    this.interrupt();

    const spokenText = cleanTextForSpeech(text);
    if (!spokenText) {
      if (onEnd) onEnd();
      return;
    }

    const isEnglish = this.language?.startsWith("en");
    const langCode = isEnglish ? "en" : "bn";
    const isMale = this.gender === "male";
    const persona = this.getActivePersona();

    // 1. PRIMARY HIGH-QUALITY PATH: Neural TTS API (/api/ai/tts)
    try {
      const ttsUrl = `/api/ai/tts?text=${encodeURIComponent(spokenText)}&lang=${langCode}&gender=${this.gender}`;
      const audio = new Audio(ttsUrl);
      this.currentAudio = audio;

      // Always preserve pitch naturally to prevent metallic robotic aliasing and pitch-drag artifacts
      audio.preservesPitch = true;
      audio.mozPreservesPitch = true;
      audio.webkitPreservesPitch = true;

      // Natural conversational speech cadence:
      // Male Scholarly (উস্তাদ তারিক): 0.98x speed (calm, steady, natural pitch)
      // Male Energetic (উস্তাদ সালমান): 1.02x speed (dynamic, engaging)
      // Female (উস্তাদা ফাতিমা): 1.0x speed (crystal-clear, natural cadence)
      const effectiveRate = isMale
        ? (persona.id === "male_energetic" ? 1.02 : 0.98)
        : 1.0;

      audio.playbackRate = effectiveRate;

      // Apply studio acoustic DSP filter chain
      this.setupAudioDspPipeline(audio, this.gender, persona.id);

      audio.onplay = () => {
        this.isSpeaking = true;
        if (this.onStateChange) this.onStateChange("speaking");
        if (onStart) onStart();
      };

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudio = null;
        if (this.onStateChange) this.onStateChange("idle");
        if (onEnd) onEnd();
      };

      audio.onerror = (e) => {
        console.warn("Neural TTS audio playback encountered error, using fallback:", e);
        this.currentAudio = null;
        this.speakBrowserFallback(spokenText, { onEnd, onError, onStart });
      };

      audio.play().catch((playErr) => {
        console.warn("Autoplay was prevented or audio failed, using fallback:", playErr);
        this.currentAudio = null;
        this.speakBrowserFallback(spokenText, { onEnd, onError, onStart });
      });
    } catch (err) {
      console.warn("Failed to initiate neural TTS audio, using fallback:", err);
      this.speakBrowserFallback(spokenText, { onEnd, onError, onStart });
    }
  }

  /**
   * Fallback browser SpeechSynthesis for offline environments
   */
  speakBrowserFallback(spokenText, { onEnd, onError, onStart } = {}) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onEnd) onEnd();
      return;
    }

    const persona = this.getActivePersona();

    setTimeout(() => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      const utterance = new SpeechSynthesisUtterance(spokenText);
      const effectiveLang = this.language || persona.lang || "bn-BD";

      const availableVoices = window.speechSynthesis.getVoices() || [];
      let matchedVoice = null;

      if (availableVoices.length > 0) {
        if (this.gender === "male") {
          matchedVoice = availableVoices.find(
            (v) =>
              /pradeep|bashkar|david|ravi|hemant|salman|tariq|male|george/i.test(v.name) &&
              (v.lang.toLowerCase().startsWith("bn") || /hi-in|en-in|en-us/i.test(v.lang))
          ) || availableVoices.find((v) => /pradeep|bashkar|male/i.test(v.name))
            || availableVoices.find((v) => v.lang.toLowerCase().startsWith("bn"));
        } else {
          matchedVoice = availableVoices.find(
            (v) =>
              /nabanita|tanishaa|zira|kalpana|faria|fatima|female/i.test(v.name) &&
              (v.lang.toLowerCase().startsWith("bn") || /hi-in|en-in/i.test(v.lang))
          ) || availableVoices.find((v) => v.lang.toLowerCase().startsWith("bn"));
        }

        if (!matchedVoice) {
          matchedVoice = availableVoices.find((v) =>
            /hi-in|ur-pk|en-in/i.test(v.lang)
          );
        }

        if (!matchedVoice) {
          matchedVoice = availableVoices.find((v) => v.default) || availableVoices[0];
        }
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang;
      } else {
        utterance.lang = effectiveLang;
      }

      // If male, pitch 0.80 and rate 0.88 for deep human masculine timbre
      if (this.gender === "male") {
        utterance.pitch = 0.80;
        utterance.rate = 0.88;
      } else {
        utterance.pitch = 1.05;
        utterance.rate = 0.96;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (this.onStateChange) this.onStateChange("speaking");
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (this.onStateChange) this.onStateChange("idle");
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis error:", e?.error);
        this.isSpeaking = false;
        if (this.onStateChange) this.onStateChange("idle");
        if (onError) onError(e);
      };

      this.currentUtterance = utterance;
      try {
        window.speechSynthesis.resume();
      } catch {}
      window.speechSynthesis.speak(utterance);
    }, 35);
  }

  /**
   * Generates a subtle, pleasant audio tone using Web Audio API to confirm speech activation
   */
  playStartChime() {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = this.getAudioContext() || new AudioCtx();
      if (ctx.state === "suspended") ctx.resume().catch(() => {});

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {}
  }

  /**
   * Returns a natural backchannel word based on language
   */
  getRandomBackchannel() {
    const list = this.language.startsWith("en") ? BACKCHANNELS_EN : BACKCHANNELS_BN;
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  }
}

