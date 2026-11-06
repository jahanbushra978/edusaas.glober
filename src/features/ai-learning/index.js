export { default as LearningPathMap } from "./components/LearningPathMap";
export { default as DuolingoNode } from "./components/DuolingoNode";
export { default as InteractiveBlackboard } from "./components/InteractiveBlackboard";
export { default as LessonExperienceModal } from "./components/LessonExperienceModal";
export { default as QuranRecitationAssessment } from "./components/QuranRecitationAssessment";
export { default as LearningStatsBar } from "./components/LearningStatsBar";
export { default as ReviewMistakesModal } from "./components/ReviewMistakesModal";
export { default as PathCategorySelector } from "./components/PathCategorySelector";
export { default as NuruCompanion } from "./components/NuruCompanion";
export { default as DailyQuestsModal } from "./components/DailyQuestsModal";
export { default as LeagueLeaderboardModal } from "./components/LeagueLeaderboardModal";
export { default as ParentCelebrationCard } from "./components/ParentCelebrationCard";
export { default as QuranGamesHub } from "./components/QuranGamesHub";
export { default as QuranThematicSearch } from "./components/QuranThematicSearch";
export { default as QuraniAmalPlatform } from "./components/amal/QuraniAmalPlatform";
export { default as BeginnerLearningJourney, BEGINNER_PILOT_LESSONS } from "./components/beginner/BeginnerLearningJourney";

// Tajweed & Sifat Modules
export { default as TajweedLearningPlatform } from "./components/tajweed/TajweedLearningPlatform";
export { default as TajweedLearningView } from "./components/tajweed/TajweedLearningView";
export { default as SifatLearningModule } from "./components/sifat/SifatLearningModule";

// Kids Mode Components & Hooks
export { default as KidsHome } from "./components/kids/KidsHome";
export { default as BigChoiceButton } from "./components/kids/BigChoiceButton";
export { default as ParentGate } from "./components/kids/ParentGate";
export { default as NuruMascot } from "./components/kids/NuruMascot";
export { default as KidsLesson } from "./components/kids/KidsLesson";
export { default as StarJar } from "./components/kids/StarJar";

// Interactive Educational Mini-Games
export { default as MemoryMatchGame } from "./components/games/MemoryMatchGame";
export { default as SoundDetectiveGame } from "./components/games/SoundDetectiveGame";
export { default as DotCountGame } from "./components/games/DotCountGame";
export { default as TraceLetterGame } from "./components/games/TraceLetterGame";
export { default as HarakatGame } from "./components/games/HarakatGame";
export { default as DragDropLetterGame } from "./components/games/DragDropLetterGame";

export { useKidsMode } from "./hooks/useKidsMode";
export { useLearningLanguage } from "./hooks/useLearningLanguage";
export { useLearningProgress } from "./hooks/useLearningProgress";

export { playVoicePrompt, stopVoicePrompt, VOICE_PROMPTS_SCRIPTS } from "./lib/voicePrompts";

export {
  KIDS_ARABIC_LETTERS,
  KIDS_HARAKAT_DATA,
  KIDS_BADGES,
  KIDS_MURAKKABAT_DATA,
  KIDS_HARAKAT_DRILL_DATA,
  KIDS_TANWEEN_DATA,
  KIDS_JAZM_QALQALAH_DATA,
  KIDS_SURAHS_DATA,
  KIDS_CURRICULUM_STAGES,
} from "./data/kidsGameData";

export { NOORANI_QAIDA_MODULES } from "./data/nooraniQaidaCurriculum";
export { TAJWEED_CURRICULUM } from "./data/tajweedLearningCurriculum";
export { LEARNING_TRANSLATIONS } from "./data/translations";
export { fireCelebrationConfetti } from "./lib/confetti";
