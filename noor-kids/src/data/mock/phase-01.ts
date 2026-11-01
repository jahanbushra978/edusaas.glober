export const PHASE_01_DEMO_LABEL = "ডেমো • শেখার জন্য যাচাইকৃত কনটেন্ট নয়";
export const PHASE_01_AUDIO_NOTICE =
  "ডেমো সাউন্ড—আরবি উচ্চারণ বা কুরআন তিলাওয়াত নয়।";

export const dragDropRound = {
  targetId: "letter-ta",
  targetLetter: "ت",
  options: [
    { id: "letter-ba", letter: "ب", name: "চিহ্ন এক", number: "০১" },
    { id: "letter-tha", letter: "ث", name: "চিহ্ন দুই", number: "০২" },
    { id: "letter-ta", letter: "ت", name: "চিহ্ন তিন", number: "০৩" },
  ],
} as const;

export const listenFindRound = {
  targetId: "pattern-two",
  options: [
    { id: "pattern-one", letter: "ب", name: "চিহ্ন এক", number: "০১", notes: [392, 523, 392] },
    { id: "pattern-two", letter: "ت", name: "চিহ্ন দুই", number: "০২", notes: [523, 659, 784] },
    { id: "pattern-three", letter: "ث", name: "চিহ্ন তিন", number: "০৩", notes: [659, 523, 392] },
  ],
} as const;
