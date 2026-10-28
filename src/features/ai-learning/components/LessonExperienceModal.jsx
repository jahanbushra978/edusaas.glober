"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Volume2,
  CheckCircle2,
  Award,
  ArrowRight,
  BookOpen,
  PenTool,
  Star,
  Heart,
  Mic,
  MicOff,
} from "lucide-react";
import { toast } from "sonner";
import { useLearningLanguage } from "../hooks/useLearningLanguage";
import { fireCelebrationConfetti } from "../lib/confetti";
import {
  playArabicSound,
  stopArabicAudio,
  preloadArabicSound,
  playCorrectChime,
  playWrongBuzzer,
  playTapSound,
  playStarPopSound,
  playHeartLostSound,
  playMaShaAllahCelebration,
} from "../lib/arabicSoundPlayer";

const MAKHRAJ_DIAGNOSTICS = {
  "ثَ": "মাখরাজ গাইড: 'ث' (ছা) নরম হরফ। জিহ্বার আগা সামনের ওপরের দুই দাঁতের আগার সাথে মিলিয়ে নরমভাবে পড়তে হবে (যেমন ইংরেজি 'think')। এটিকে শক্ত 'স' বা 'ছ' পড়া নিষেধ।",
  "تَ": "মাখরাজ গাইড: 'ت' (তা) জিহ্বার আগা সামনের ওপরের দুই দাঁতের গোড়ার সাথে লাগিয়ে স্পষ্ট ও পাতলা করে পড়তে হবে।",
  "جَ": "মাখরাজ গাইড: 'ج' (জীম) জিহ্বার মধ্যভাগ ওপরের শক্ত তালুর সাথে লাগিয়ে শক্তভাবে পড়তে হবে।",
  "بَ": "মাখরাজ গাইড: 'ب' (বা) দুই ঠোঁটের ভিজা অংশ মিলিয়ে স্পষ্ট করে পড়তে হবে।",
  "ث": "মাখরাজ গাইড: 'ث' (ছা) নরম হরফ। জিহ্বার আগা ওপরের দাঁতের আগার সাথে মিলিয়ে নরমভাবে আদায় করুন।",
  "ط": "মাখরাজ গাইড: 'ط' (তোয়া) মোটা ও ভারী হরফ, জিহ্বার গোড়া তালুর দিকে উঁচু হবে।",
  "ص": "মাখরাজ গাইড: 'ص' (সোয়াদ) মোটা ও ভারী হরফ, শিস ধ্বনিসহ আদায় করতে হয়।",
  "س": "মাখরাজ গাইড: 'س' (সিন) পাতলা ও শিসযুক্ত হরফ। জিহ্বার আগা নিচের দাঁতের গোড়ার সাথে স্পর্শ করে।",
  "ح": "মাখরাজ গাইড: 'ح' (হলকী হা) কণ্ঠনালীর মধ্যখান থেকে বের হওয়া নরম ও পরিষ্কার আওয়াজ।",
  "ه": "মাখরাজ গাইড: 'ه' (গোল হা) কণ্ঠনালীর শুরু (বুক) থেকে বের হওয়া হালকা আওয়াজ।",
  "هـ": "মাখরাজ গাইড: 'هـ' (গোল হা) কণ্ঠনালীর নিম্নাংশ থেকে হালকা আওয়াজে পড়তে হয়।",
  "ق": "মাখরাজ গাইড: 'ق' (ক্বাফ) জিহ্বার গোড়া ওপরের নরম তালুর সাথে মিলিয়ে ভারী হরফ।",
  "ك": "মাখরাজ গাইড: 'ك' (কাফ) জিহ্বার গোড়ার একটু সামনে থেকে পাতলা হরফ।",
  "ض": "মাখরাজ গাইড: 'ض' (দোয়াদ) জিহ্বার গোড়ার কিনারা ওপরের মাড়ির দাঁতের গোড়ার সাথে লাগিয়ে গভীর ও ভারীভাবে পড়তে হয়।",
  "ظ": "মাখরাজ গাইড: 'ظ' (জোয়া) জিহ্বার আগা ওপরের সামনের দাঁতের পেটের সাথে মিলিয়ে ভারীভাবে পড়তে হয়।",
  "ع": "মাখরাজ গাইড: 'ع' (আইন) কণ্ঠনালীর মধ্যখান থেকে খাঁটি ও চাপ দিয়ে বের করতে হয়।",
  "غ": "মাখরাজ গাইড: 'غ' (গাইন) কণ্ঠনালীর ওপরের অংশ (মুখের কাছাকাছি) থেকে ভারী আওয়াজে উচ্চারিত হয়।",
  "خ": "মাখরাজ গাইড: 'خ' (খা) কণ্ঠনালীর ওপরের অংশ থেকে খসখসে ভারী আওয়াজে পড়তে হয়।",
  "ذ": "মাখরাজ গাইড: 'ذ' (যাল) জিহ্বার আগা ওপরের দাঁতের আগার সাথে নরমভাবে স্পর্শ করবে।",
  "ز": "মাখরাজ গাইড: 'ز' (যা) তীক্ষ্ণ শিসযুক্ত ধ্বনি, জিহ্বার আগা সামনের দাঁতের কাছে রেখে।",
  "ش": "মাখরাজ গাইড: 'ش' (শীন) মুখের ভেতর আওয়াজ ও বাতাস ছড়িয়ে দিয়ে পড়তে হয়।",
  "ف": "মাখরাজ গাইড: 'ف' (ফা) ওপরের সামনের দুই দাঁতের পেট নিচের ঠোঁটের পেটের সাথে লাগিয়ে।",
  "م": "মাখরাজ গাইড: 'م' (মীম) দুই ঠোঁটের শুকনা অংশ মিলিয়ে এবং নাকের বাঁশি থেকে গুন্নাহ ধারণ করে।",
  "ن": "মাখরাজ গাইড: 'ن' (নূন) জিহ্বার আগা ওপরের তালুর সাথে লাগিয়ে, খাইশুম থেকে গুন্নাহসহ।",
  "ر": "মাখরাজ গাইড: 'ر' (রা) জিহ্বার আগার পিঠ ওপরের তালুর সাথে স্পর্শ করে মৃদু কাঁপুনিসহ।",
  "ل": "মাখরাজ গাইড: 'ل' (লাম) জিহ্বার সামনের কিনারা ওপরের দাঁতের মাড়ির সাথে লাগিয়ে স্বাভাবিক আলোয়।",
  "د": "মাখরাজ গাইড: 'د' (দাল) জিহ্বার আগা ওপরের দুই দাঁতের গোড়ার সাথে লাগিয়ে পাতলা করে।",
  "أَبْ": "তাজবীদ গাইড: বা (ب) হরফে সাকিন হওয়ায় এখানে ক্বলক্বলাহ (ধাক্কা বা প্রতিধ্বনি) সুস্পষ্ট হবে।",
  "أَجْ": "ক্বলক্বলাহ গাইড: জীম (ج) সাকিন হওয়ায় মাখরাজে ধাক্কা লেগে স্পষ্ট প্রতিধ্বনি (রিবাউন্ড) হবে।",
  "أَدْ": "ক্বলক্বলাহ গাইড: দাল (د) সাকিন হওয়ায় মাখরাজে সুন্দর প্রতিধ্বনি দিয়ে স্থির হবে।",
  "أَطْ": "ক্বলক্বলাহ গাইড: ত্বোয়া (ط) মোটা হরফ, সাকিন অবস্থায় শক্তিশালী ক্বলক্বলাহ ধাক্কা হবে।",
  "أَقْ": "ক্বলক্বলাহ গাইড: ক্বাফ (ق) মোটা হরফ, জিহ্বার গোড়া নরম তালুতে ধাক্কা লেগে প্রতিধ্বনি হবে।",
  "أَتْ": "সাকিন গাইড: তা (ت) সাকিন হওয়ায় পূর্বের হামযাহর সাথে মিলিয়ে 'আত্' স্থির আওয়াজে পড়তে হবে।",
  "أَثْ": "সাকিন গাইড: ছা (ث) নরম হরফ, সাকিন অবস্থায় নরম সুরে পূর্বের সাথে মিলিয়ে 'আছ্' পড়তে হবে।",
  "أَحْ": "সাকিন গাইড: হলকী হা (ح) কণ্ঠনালীর মধ্যখান থেকে পরিষ্কার হাওয়া দিয়ে 'আহ্' স্থির হবে।",
  "أَخْ": "সাকিন গাইড: খা (خ) কণ্ঠনালীর ওপরের অংশ থেকে খসখসে ভারী আওয়াজে 'আখ্' পড়তে হবে।",
  "تَرْمِيهِم بِحِجَارَةٍ": "মীম সাকিন গাইড: ইখফায়ে শাফাবী — মীম সাকিনের পর বা (ب) আসায় ঠোঁট নরম রেখে ১ আলিফ গুন্নাহসহ পড়ুন।",
  "لَهُم مَّا": "মীম সাকিন গাইড: ইদগামে শাফাবী — মীম সাকিনের পর মীম (م) আসায় মীমে মীম মিলিয়ে ১ আলিফ মিষ্টি গুন্নাহ করুন।",
  "هُمْ فِيهَا": "মীম সাকিন গাইড: ইযহারে শাফাবী — মীম সাকিনের পর ফা (ف) আসায় গুন্নাহ ছাড়া সম্পূর্ণ স্পষ্ট পড়ুন।",
  "أَبَّ": "তাশদীদ গাইড: বা-এ তাশদীদ থাকায় দুইবার উচ্চারিত হবে (আব্-বা), হরকত দ্বিগুণ স্পষ্ট হবে।",
  "قُلْ": "সাকিন গাইড: লাম সাকিন হওয়ায় ক্বাফের পেশের সাথে মিলিয়ে 'কুল্' স্থির ও স্পষ্ট পড়ুন।",
  "رَبِّ": "তাশদীদ গাইড: রা-এর যবরে মোটা (পুর) হবে এবং বা-এ তাশদীদ শক্তভাবে দ্বিগুণ হবে (রব্-বি)।",
  "إِنَّ": "তাজবীদ গাইড: নূনে তাশদীদ থাকায় নাকের বাঁশিতে ১ আলিফ পরিমাণ ওয়াজিব গুন্নাহ করতে হবে।",
  "ثُمَّ": "তাজবীদ গাইড: মীমে তাশদীদ থাকায় মিষ্টি সুরে ১ আলিফ পরিমাণ ওয়াজিব গুন্নাহ অপরিহার্য।",
  "عَمَّ": "ওয়াজিব গুন্নাহ: মীমে তাশদীদ থাকায় আল-খাইশুম থেকে ১ আলিফ ওয়াজিব গুন্নাহ করতে হবে।",
  "اللَّهِ": "আল্লাহর লাম গাইড: আল্লাহ শব্দের লামের পূর্বে যবর/পেশ থাকলে লাম মোটা (পুর) করে পড়তে হয়।",
  "بِاللَّهِ": "আল্লাহর লাম গাইড: আল্লাহ শব্দের লামের পূর্বে যের থাকায় লাম চিকন (বারিক) করে পড়তে হয়।",
  "رِزْقًا": "রা-এর বারিক গাইড: রা-এর নিচে যের থাকায় পাতলা (বারিক) করে পড়তে হবে।",
  "بَا": "মাদ্দ গাইড: ১ আলিফ মাদ্দ (মাদ্দে আসলী)। স্বাভাবিকভাবে ২ হরকত সমান টেনে পড়ুন।",
  "بُو": "মাদ্দ গাইড: পেশের পর ওয়াও সাকিন — ১ আলিফ মাদ্দ (মাদ্দে আসলী)। সুন্দরভাবে ২ হরকত টানুন।",
  "بِي": "মাদ্দ গাইড: যেরের পর ইয়া সাকিন — ১ আলিফ মাদ্দ (মাদ্দে আসলী)। ২ হরকত পরিমাণ টানুন।",
  "مٰ": "মাদ্দ গাইড: খাড়া যবর ১ আলিফ মাদ্দে আসলীর প্রতীক; ঠিক ১ আলিফ টেনে পড়ুন।",
  "بٖ": "মাদ্দ গাইড: খাড়া যের ১ আলিফ মাদ্দের প্রতীক; সুন্দরভাবে ১ আলিফ টানুন।",
  "لٗ": "মাদ্দ গাইড: উল্টা পেশ ১ আলিফ মাদ্দের প্রতীক; স্পষ্ট ১ আলিফ টেনে পড়ুন।",
  "خَوْفٍ": "লীন গাইড: যবরের পর ওয়াও সাকিন (লীন)। নরম সুরে স্বাভাবিক গতিতে পড়ুন।",
  "بَيْتٍ": "লীন গাইড: যবরের পর ইয়া সাকিন (লীন)। নরম আওয়াজে স্বাভাবিক গতিতে পড়ুন।",
  "الْبَيْتِ": "লীন গাইড: যবরের পর ইয়া সাকিন নরম সুরে লীন করে ওয়াক্ফের সাথে পড়ুন।",
  "جَاءَ": "মাদ্দ গাইড: মাদ্দে মুত্তাসিল (একই শব্দে মাদ্দের পর হামযাহ)। ৪ আলিফ লম্বা করে টানুন।",
  "بِمَا أُنزِلَ": "মাদ্দ গাইড: মাদ্দে মুনফাসিল (পৃথক শব্দে হামযাহ)। ৩ আলিফ টানুন ও নূনে ইখফা গুন্নাহ করুন।",
  "الضَّالِّينَ": "মাদ্দ গাইড: মাদ্দে লাযিম (মাদ্দের পর তাশদীদ)। পূর্ণ ৪ আলিফ (৬ হরকত) টেনে লামে তাশদীদ দিন।",
  "مَنْ آمَنَ": "ইযহার গাইড: নূন সাকিনের পর কণ্ঠনালীর হামযাহ আসায় কোনো গুন্নাহ ছাড়া স্পষ্ট পড়তে হবে।",
  "مِن بَعْدِ": "ইক্বলাব গাইড: নূন সাকিনের পর 'বা' আসায় নূনকে ছোট মীম বানিয়ে ১ আলিফ গুন্নাহ করে পড়ুন।",
  "عَذَابٌ أَلِيمٌ": "ইযহার গাইড: তানভীনের পর হামযাহ আসায় স্পষ্ট করে পড়তে হবে, কোনো গুন্নাহ ছাড়া।",
  "عَلِيمٌ حَكِيمٌ": "ইযহার গাইড: তানভীনের পর 'হা' আসায় সম্পূর্ণ স্পষ্ট করে পড়তে হবে, গুন্নাহ ছাড়া।",
  "مَن يَقُولُ": "ইদগাম গাইড: নূন সাকিনের পর 'ইয়া' আসায় নূনকে ইয়া-তে মিলিয়ে ১ আলিফ গুন্নাহসহ পড়ুন (বাগুন্নাহ)।",
  "مِن رَّبِّهِمْ": "ইদগাম গাইড: নূন সাকিনের পর 'রা' আসায় কোনো গুন্নাহ ছাড়া সরাসরি রাতে মিলিয়ে পড়ুন (বেলাগুন্নাহ)।",
  "مِن قَبْلُ": "ইখফা গাইড: নূন সাকিনের পর 'ক্বাফ' আসায় নাকের বাঁশিতে লুকিয়ে ১ আলিফ কোমল গুন্নাহ করুন।",
  "أَنتُمْ": "ইখফা গাইড: নূন সাকিনের পর 'তা' আসায় নূনের আওয়াজ লুকিয়ে ১ আলিফ কোমল গুন্নাহ করুন।",
  "مِن دُونِ": "ইখফা গাইড: নূন সাকিনের পর 'দাল' আসায় নাকের বাঁশিতে লুকিয়ে ১ আলিফ কোমল গুন্নাহ করুন।",
};

export default function LessonExperienceModal({
  lesson,
  onClose,
  onComplete,
  onOpenBlackboard,
  lives = 5,
  onLoseLife,
  onRecordMistake,
}) {
  const { lang, t, dir } = useLearningLanguage();

  // Step in lesson: 0: Explain, 1: Practice, 2: Quiz, 3: Completed Reward
  const [step, setStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [activePlayingIndex, setActivePlayingIndex] = useState(null);
  const [hasPracticed, setHasPracticed] = useState(false);

  // 🐢 0.75x Slow-Motion State
  const [isSlowMode, setIsSlowMode] = useState(false);

  // Student Recording & Self-Comparison State
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const userAudioPlayerRef = useRef(null);

  // Mistakes tracking for 3-Star Rating
  const [mistakeCount, setMistakeCount] = useState(0);
  const [starsRevealed, setStarsRevealed] = useState(0);

  const title = lesson.title[lang] || lesson.title.bn || lesson.title.en;
  const explanation =
    lesson.explanation[lang] || lesson.explanation.bn || lesson.explanation.en;
  const quiz = lesson.quiz;

  // Calculate stars earned: 0 mistakes = 3 stars, 1 mistake = 2 stars, 2+ mistakes = 1 star
  const earnedStars = mistakeCount === 0 ? 3 : mistakeCount === 1 ? 2 : 1;

  const [isVoiceTesting, setIsVoiceTesting] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [isPlayingQari, setIsPlayingQari] = useState(false);
  const [qariAudioRef, setQariAudioRef] = useState(null);

  // Preload audio for all lesson items on mount for zero-latency playback
  useEffect(() => {
    if (lesson?.arabicItems) {
      lesson.arabicItems.forEach((item) => {
        preloadArabicSound(item);
      });
    }
    return () => {
      stopArabicAudio();
    };
  }, [lesson]);

  // Clean stop for all audio playback
  const stopAllPlayback = () => {
    stopArabicAudio();
    if (qariAudioRef) {
      try {
        qariAudioRef.pause();
        qariAudioRef.currentTime = 0;
      } catch {}
      setQariAudioRef(null);
    }
    if (userAudioPlayerRef.current) {
      try {
        userAudioPlayerRef.current.pause();
        userAudioPlayerRef.current.currentTime = 0;
      } catch {}
      userAudioPlayerRef.current = null;
    }
    setIsPlayingDemo(false);
    setIsPlayingQari(false);
    setIsPlayingUserAudio(false);
    setActivePlayingIndex(null);
  };

  // Continuous audio demonstration with graceful pacing
  const playDemoAudio = () => {
    setHasPracticed(true);
    if (isPlayingDemo) {
      stopAllPlayback();
      return;
    }
    stopAllPlayback();
    setIsPlayingDemo(true);

    if (!lesson.arabicItems || lesson.arabicItems.length === 0) {
      setIsPlayingDemo(false);
      return;
    }

    let idx = 0;
    const playNext = () => {
      if (idx >= lesson.arabicItems.length) {
        setActivePlayingIndex(null);
        setIsPlayingDemo(false);
        return;
      }
      setActivePlayingIndex(idx);
      const item = lesson.arabicItems[idx];
      idx++;
      playArabicSound(
        item,
        () => {
          setTimeout(playNext, isSlowMode ? 900 : 600);
        },
        isSlowMode ? 0.75 : 1.0
      );
    };
    playNext();
  };

  // Play authentic master Qari recitation of the demonstration Ayah
  const playQariAudio = () => {
    setHasPracticed(true);
    if (isPlayingQari) {
      stopAllPlayback();
      return;
    }
    stopAllPlayback();
    if (lesson.audioSample) {
      try {
        const audio = new Audio(lesson.audioSample);
        audio.playbackRate = isSlowMode ? 0.75 : 1.0;
        audio.preservesPitch = true;
        setQariAudioRef(audio);
        setIsPlayingQari(true);
        audio.onended = () => {
          setIsPlayingQari(false);
          setQariAudioRef(null);
        };
        audio.onerror = () => {
          setIsPlayingQari(false);
          setQariAudioRef(null);
        };
        audio.play().catch(() => {
          setIsPlayingQari(false);
          setQariAudioRef(null);
        });
      } catch {
        setIsPlayingQari(false);
      }
    }
  };

  // Play student's recorded audio to compare with Qari
  const playUserRecording = () => {
    if (!recordedAudioUrl) return;
    stopAllPlayback();
    try {
      const audio = new Audio(recordedAudioUrl);
      userAudioPlayerRef.current = audio;
      setIsPlayingUserAudio(true);
      audio.onended = () => setIsPlayingUserAudio(false);
      audio.onerror = () => setIsPlayingUserAudio(false);
      audio.play().catch(() => setIsPlayingUserAudio(false));
    } catch {
      setIsPlayingUserAudio(false);
    }
  };

  // Live Microphone Voice Evaluation for Step 1
  const handleVoiceTest = (targetItem) => {
    if (typeof window === "undefined") return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      toast.error(lang === "en" ? "Microphone not supported on this browser" : "আপনার ব্রাউজারে মাইক্রোফোন সাপোর্ট নেই");
      return;
    }
    setIsVoiceTesting(true);
    setVoiceFeedback(null);

    // Also start MediaRecorder for student self-listen playback
    if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        try {
          const mr = new MediaRecorder(stream);
          mediaRecorderRef.current = mr;
          audioChunksRef.current = [];
          mr.ondataavailable = (ev) => {
            if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
          };
          mr.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            const url = URL.createObjectURL(blob);
            setRecordedAudioUrl(url);
            stream.getTracks().forEach((trk) => trk.stop());
          };
          mr.start();
        } catch {}
      }).catch(() => {});
    }

    const stopMediaRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
    };

    try {
      const rec = new SpeechRec();
      rec.lang = "ar-SA";
      rec.onresult = (e) => {
        stopMediaRecording();
        const text = e.results[0][0].transcript;
        setIsVoiceTesting(false);
        setHasPracticed(true);
        const cleanTarget = (targetItem || "").replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "").trim();
        const cleanSpoken = (text || "").replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "").trim();
        
        // Strict phonetic verification against target letter
        const isMatch = cleanTarget && (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken));
        if (isMatch) {
          setVoiceFeedback({
            success: true,
            text: lang === "en" ? "MashaAllah! Accurate pronunciation!" : lang === "ar" ? "ما شاء الله! نطق متقن!" : "মাশাআল্লাহ! উচ্চারণ বিশুদ্ধ!",
          });
          playCorrectChime();
        } else {
          const diagnosticHint = MAKHRAJ_DIAGNOSTICS[targetItem] || MAKHRAJ_DIAGNOSTICS[cleanTarget];
          setVoiceFeedback({
            success: false,
            text: lang === "en" ? "Pronunciation slip — listen back and try again" : "উচ্চারণে অস্পষ্টতা — নিজের রেকর্ডিং শুনে ক্বারীর সাথে মিলিয়ে নিন",
            diagnostic: diagnosticHint,
          });
          playWrongBuzzer();
          setMistakeCount((c) => c + 1);
          if (onLoseLife && lives > 0) onLoseLife();
          playHeartLostSound();
        }
      };
      rec.onerror = () => {
        stopMediaRecording();
        setIsVoiceTesting(false);
        setVoiceFeedback({
          success: false,
          text: lang === "en" ? "Audio unclear — please speak into mic" : "আওয়াজ অস্পষ্ট — মাইক্রোফোনে কাছে এসে বলুন",
        });
      };
      rec.start();
    } catch {
      stopMediaRecording();
      setIsVoiceTesting(false);
    }
  };

  const handleQuizSubmit = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    const correct = selectedOption === quiz.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      playCorrectChime();
      toast.success(t.correct);
    } else {
      // Mistake made: Deduct Life and penalize star
      setMistakeCount((c) => c + 1);
      if (onLoseLife) onLoseLife();
      playHeartLostSound();
      playWrongBuzzer();
      toast.error(lang === "en" ? "Incorrect! -1 Heart (❤️). Choose the correct letter." : "ভুল উত্তর! ১টি লাইফ (❤️) কমেছে। পুনরায় সঠিক হরফ বেছে নিন।");

      if (onRecordMistake) {
        onRecordMistake({
          id: `mistake-${lesson.id}-${Date.now()}`,
          lessonId: lesson.id,
          title,
          wrongOption: quiz.options[selectedOption],
          correctOption: quiz.options[quiz.correctIndex],
        });
      }
    }
  };

  // Celebration & Star Pop Animation on reaching Step 3
  useEffect(() => {
    if (step === 3) {
      playMaShaAllahCelebration();
      fireCelebrationConfetti();

      // Sequential Star Pop Animation
      setStarsRevealed(0);
      const timers = [];
      for (let i = 1; i <= earnedStars; i++) {
        timers.push(
          setTimeout(() => {
            setStarsRevealed(i);
            playStarPopSound(i);
          }, i * 350)
        );
      }
      return () => timers.forEach(clearTimeout);
    }
  }, [step, earnedStars]);

  const handleFinishLesson = () => {
    const score = earnedStars === 3 ? 100 : earnedStars === 2 ? 80 : 60;
    onComplete(lesson.id, score, earnedStars);
    onClose();
    toast.success(
      earnedStars === 3
        ? "মাশাআল্লাহ! ৩ স্টার সহ পাঠ সফলভাবে সম্পন্ন হয়েছে (+১৫ XP ও +১ ❤️ বোনাস)!"
        : `মাশাআল্লাহ! ${earnedStars} স্টার সহ পাঠ সম্পন্ন হয়েছে ও +১৫ XP যোগ হয়েছে!`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in select-none overflow-y-auto">
      <div
        dir={dir}
        className="bg-white dark:bg-[#0c241a] border-2 border-emerald-200 dark:border-emerald-700/80 rounded-3xl w-full max-w-xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden font-sans my-auto transition-all"
      >
        {/* ── HEADER (Onosaee Child Friendly Design) ── */}
        <div className="p-3.5 sm:p-4 border-b border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-[#071912] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">{title}</h3>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                {t.step} {step + 1} {t.of} 3
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* 🐢 0.75x Slow-Motion Qari Audio Toggle */}
            <button
              type="button"
              onClick={() => setIsSlowMode(!isSlowMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isSlowMode
                  ? "bg-amber-400 text-slate-950 border-amber-300 font-black shadow-xs"
                  : "bg-white dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/60 hover:bg-emerald-100"
              }`}
              title="ধীরগতিতে মাখরাজ শোনার জন্য 0.75x স্পিড"
            >
              <span className="text-sm">🐢</span>
              <span className="hidden sm:inline">{isSlowMode ? "০.৭৫x ধীর" : "১x ক্বারী"}</span>
            </button>

            {/* Real-time Hearts / Lives Counter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-600/60 text-rose-700 dark:text-rose-300 text-xs font-black shadow-xs">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
              <span>{lives}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                stopAllPlayback();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── PROGRESS BAR ── */}
        <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 shrink-0">
          <div
            style={{ width: `${((step + 1) / 3) * 100}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
          />
        </div>

        {/* ── BODY STAGES (Scrollable Content) ── */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-emerald-300 dark:scrollbar-thumb-emerald-800 scrollbar-track-transparent">
          {/* STEP 0: EXPLAIN & DEMONSTRATE */}
          {step === 0 && (
            <div className="space-y-5 flex flex-col items-center text-center my-auto">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {lesson.arabicItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      stopAllPlayback();
                      playArabicSound(item, null, isSlowMode ? 0.75 : 1.0);
                      setActivePlayingIndex(idx);
                    }}
                    className={`font-arabic text-4xl sm:text-5xl font-bold p-3.5 sm:p-4 rounded-3xl border-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                      activePlayingIndex === idx
                        ? "bg-amber-400 text-slate-950 border-amber-300 shadow-lg scale-105"
                        : "bg-emerald-50/80 dark:bg-[#03140d] text-emerald-950 dark:text-amber-300 border-emerald-200 dark:border-emerald-700/60 hover:border-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-950"
                    }`}
                    title={t.listenAudio}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 max-w-md text-left sm:text-center shadow-xs">
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{explanation}</p>
                <p className="text-[11px] text-emerald-800 dark:text-amber-400 mt-2 font-bold">{t.touchLetterTip}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={playDemoAudio}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 ${
                    isPlayingDemo
                      ? "bg-rose-500 text-white animate-pulse"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>
                    {isPlayingDemo
                      ? (lang === "en" ? "Stop Recitation" : lang === "ar" ? "إيقاف التلاوة" : "থামান (চলছে...)")
                      : `${t.demonstration} (${isSlowMode ? "০.৭৫x ধীর" : t.listenContinuous})`}
                  </span>
                </button>

                {lesson.audioSample && (
                  <button
                    type="button"
                    onClick={playQariAudio}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer active:scale-95 ${
                      isPlayingQari
                        ? "bg-emerald-600 text-white border-emerald-400 animate-pulse shadow-xs"
                        : "bg-white dark:bg-emerald-950/80 hover:bg-emerald-50 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-600/70"
                    }`}
                  >
                    <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {isPlayingQari
                        ? (lang === "en" ? "Playing Recitation..." : lang === "ar" ? "تشغيل التلاوة..." : "ক্বারীর তিলাওয়াত বাজছে...")
                        : (lang === "en" ? "Master Qari Recitation 📖" : lang === "ar" ? "تلاوة القارئ النموذجية 📖" : "ক্বারীর সম্পূর্ণ তিলাওয়াত শুনুন 📖")}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: INTERACTIVE PRACTICE */}
          {step === 1 && (
            <div className="space-y-4 flex flex-col items-center text-center my-auto">
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {t.touchLetterPractice}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-md">
                {lesson.arabicItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      stopAllPlayback();
                      playArabicSound(item, null, isSlowMode ? 0.75 : 1.0);
                      setActivePlayingIndex(idx);
                      setHasPracticed(true);
                    }}
                    className={`p-3.5 sm:p-4 rounded-3xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border-2 active:scale-95 shadow-xs ${
                      activePlayingIndex === idx
                        ? "bg-amber-400 border-amber-300 text-slate-950 scale-105 shadow-md font-black"
                        : "bg-emerald-50/80 dark:bg-[#03140d] border-emerald-200 dark:border-emerald-600/60 text-emerald-950 dark:text-amber-200 hover:border-emerald-400 hover:bg-emerald-100"
                    }`}
                  >
                    <span className="font-arabic text-4xl font-bold leading-tight">{item}</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold">
                      <Volume2 className="w-3 h-3" />
                      <span>{t.listenAudio}</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleVoiceTest(lesson.arabicItems[activePlayingIndex ?? 0] || lesson.arabicItems[0])}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer border active:scale-95 ${
                    isVoiceTesting
                      ? "bg-rose-600 text-white border-rose-400 animate-pulse"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500"
                  }`}
                >
                  {isVoiceTesting ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-100" />}
                  <span>
                    {isVoiceTesting
                      ? (lang === "en" ? "Listening & Recording..." : lang === "ar" ? "جاري الاستماع والتسجيل..." : "শুনছি ও রেকর্ড করছি...")
                      : (lang === "en" ? "Practice Aloud with Mic 🎙️" : lang === "ar" ? "تدرب بالصوت 🎙️" : "মাইকে মুখে পড়ুন ও মাশক করুন 🎙️")}
                  </span>
                </button>

                {recordedAudioUrl && (
                  <button
                    type="button"
                    onClick={playUserRecording}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer shadow-xs active:scale-95 ${
                      isPlayingUserAudio
                        ? "bg-indigo-600 text-white border-indigo-400 animate-pulse"
                        : "bg-indigo-50 dark:bg-indigo-950/90 hover:bg-indigo-100 text-indigo-900 dark:text-indigo-300 border-indigo-200 dark:border-indigo-600/70"
                    }`}
                  >
                    <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>{isPlayingUserAudio ? "আমার কণ্ঠ বাজছে..." : "আমার রেকর্ডিং শুনুন 🎧"}</span>
                  </button>
                )}

                {onOpenBlackboard && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBlackboard();
                    }}
                    className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-emerald-600 hover:bg-slate-200 text-slate-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>{t.writeOnBlackboard}</span>
                  </button>
                )}
              </div>

              {voiceFeedback && (
                <div
                  className={`w-full max-w-md px-3.5 py-2.5 rounded-2xl border text-xs font-bold animate-fade-in text-left space-y-1 ${
                    voiceFeedback.success
                      ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300"
                      : "bg-amber-50 dark:bg-amber-950/90 border-amber-300 dark:border-amber-500 text-amber-900 dark:text-amber-200"
                  }`}
                >
                  <p>{voiceFeedback.text}</p>
                  {voiceFeedback.diagnostic && (
                    <p className="text-[11px] font-normal text-amber-900 dark:text-amber-300/90 leading-relaxed border-t border-amber-200 dark:border-amber-800/40 pt-1 mt-1">
                      💡 {voiceFeedback.diagnostic}
                    </p>
                  )}
                </div>
              )}

              {/* Real-time Makhraj & Short Vowel Guidance Banner */}
              <div className="w-full max-w-md p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-left space-y-1">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold">
                  <Award className="w-3.5 h-3.5" />
                  <span>মাখরাজ ও স্বরধ্বনি গাইড</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {MAKHRAJ_DIAGNOSTICS[lesson.arabicItems[activePlayingIndex ?? 0]] ||
                    explanation ||
                    "ক্বারীর বিশুদ্ধ উচ্চারণ শুনে বারবার মাশক করুন।"}
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: QUIZ & ASSESSMENT */}
          {step === 2 && quiz && (
            <div className="space-y-4 flex flex-col justify-center my-auto">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 uppercase tracking-wider">
                  {t.quiz}
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {quiz.question[lang] || quiz.question.bn || quiz.question.en}
                </h4>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto w-full">
                {quiz.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const optLabel = typeof opt === "object" ? (opt[lang] || opt.bn || opt.en) : opt;
                  const isArabicWord = typeof optLabel === "string" && optLabel.length <= 8 && /[\u0600-\u06FF]/.test(optLabel);

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswerSubmitted && isCorrect}
                      onClick={() => {
                        setSelectedOption(idx);
                        setIsAnswerSubmitted(false);
                        playTapSound();
                        if (isArabicWord) {
                          playArabicSound(optLabel);
                        }
                      }}
                      className={`p-3.5 rounded-2xl text-center font-bold transition-all cursor-pointer border-2 active:scale-95 shadow-xs ${
                        isSelected
                          ? isAnswerSubmitted
                            ? isCorrect
                              ? "bg-emerald-600 border-emerald-500 text-white shadow-md font-extrabold"
                              : "bg-rose-600 border-rose-500 text-white shadow-md animate-shake font-extrabold"
                            : "bg-amber-400 border-amber-400 text-slate-950 shadow-xs font-black"
                          : "bg-slate-50 dark:bg-[#03140d] border-slate-200 dark:border-emerald-900 text-slate-800 dark:text-slate-200 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                      }`}
                    >
                      <span className={isArabicWord ? "font-arabic text-2xl font-bold" : "text-xs font-semibold"}>
                        {optLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quiz Submit button */}
              {(!isAnswerSubmitted || !isCorrect) ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleQuizSubmit}
                  className="w-full max-w-md mx-auto py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                >
                  {t.verifyAnswer}
                </button>
              ) : (
                <div className="text-center space-y-2.5 animate-fade-in max-w-md mx-auto w-full">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.correct}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>{t.viewResults}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: MA SHA ALLAH & 3-STAR CELEBRATION REWARD */}
          {step === 3 && (
            <div className="space-y-4 flex flex-col items-center text-center my-auto animate-fade-in">
              {/* Grand Arabic Calligraphy & Islamic Ribbon */}
              <div className="flex flex-col items-center">
                <span className="font-arabic text-4xl sm:text-5xl font-black text-amber-500 dark:text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                  {t.maShaAllah}
                </span>
                <span className="text-sm font-extrabold text-emerald-800 dark:text-emerald-400 tracking-wide mt-1">
                  {t.maShaAllahPassed}
                </span>
              </div>

              {/* 3 Animated Stars Popping In */}
              <div className="flex items-center gap-3 py-2">
                {[1, 2, 3].map((starIdx) => {
                  const isEarned = starIdx <= earnedStars;
                  const isVisible = starIdx <= starsRevealed;
                  return (
                    <div
                      key={starIdx}
                      className={`transition-all duration-300 transform ${
                        isVisible
                          ? "scale-100 opacity-100"
                          : "scale-50 opacity-20"
                      }`}
                    >
                      <Star
                        className={`w-10 h-10 sm:w-12 sm:h-12 ${
                          isEarned && isVisible
                            ? "text-amber-500 fill-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.9)] animate-bounce"
                            : "text-slate-300 dark:text-slate-700 fill-slate-200 dark:fill-slate-800"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Star Rating Badge & Heart Reward */}
              <div className="flex flex-col items-center space-y-1.5">
                <div className="px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/60 text-emerald-900 dark:text-emerald-300 font-extrabold text-xs shadow-xs">
                  {earnedStars === 3 ? t.threeStarsPerfect : earnedStars === 2 ? t.twoStarsGreat : t.oneStarCompleted}
                </div>

                {/* 3-Star Heart Reward Banner */}
                {earnedStars === 3 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/80 dark:to-amber-950/80 border border-rose-300 dark:border-rose-500/60 text-rose-800 dark:text-rose-300 text-xs font-bold shadow-xs animate-pulse">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{t.threeStarHeartBonus}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-bold">
                <span className="text-amber-600 dark:text-amber-300 flex items-center gap-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>{t.xpEarned}</span>
                </span>
                <span>•</span>
                <span className="text-emerald-700 dark:text-emerald-400">{t.nextLessonUnlocked}</span>
              </div>

              <button
                type="button"
                onClick={handleFinishLesson}
                className="w-full max-w-xs py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              >
                {t.continueLearning} ➔
              </button>
            </div>
          )}
        </div>

        {/* ── FOOTER CONTROLS ── */}
        {step < 3 && (
          <div className="p-3 sm:p-4 border-t border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-[#071912] flex items-center justify-between shrink-0 z-10">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => {
                stopAllPlayback();
                setStep((s) => Math.max(0, s - 1));
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {t.previous}
            </button>

            <button
              type="button"
              disabled={step === 2 && !isCorrect}
              onClick={() => {
                stopAllPlayback();
                if (step === 1 && !hasPracticed) {
                  toast.info(lang === "en" ? "Tip: Touch at least one letter to hear its sound" : "পরামর্শ: পড়ার নিয়ম বুঝতে অন্তত একটি হরফ স্পর্শ করুন");
                }
                if (step === 2) {
                  if (!isCorrect) {
                    toast.error(lang === "en" ? "Answer the quiz correctly to view results" : "ফলাফল দেখতে কুইজের সঠিক উত্তর দিন");
                    return;
                  }
                  setStep(3);
                } else {
                  setStep((s) => s + 1);
                }
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all ${
                step === 2 && !isCorrect
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white cursor-pointer active:scale-95"
              }`}
            >
              <span>{step === 2 ? t.viewResults : t.next}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
