# 📖 Nur AI Quran Tutor — Master Software Requirements & Architecture Specification (v1.0 Frozen Baseline)

> **Document Status**: APPROVED & BASELINE FROZEN (v1.0)  
> **Classification**: Single Source of Truth (SSOT)  
> **Engineering Invariants**: Next.js 16 (App Router) + Supabase PostgreSQL (RLS) + Multi-Provider AI Adapters. Zero-Trust Security Gate. No Base44. No Sparkles Icons. Biometric Attendance Preserved. 100% Functional Controls.

---

## 📑 TABLE OF CONTENTS
1. [Executive Summary & Educational Philosophy](#1-executive-summary--educational-philosophy)
2. [Master Information Architecture (IA)](#2-master-information-architecture-ia)
3. [End-to-End User Flow Diagrams](#3-end-to-end-user-flow-diagrams)
4. [Screen-by-Screen UI/UX Specification](#4-screen-by-screen-uiux-specification)
5. [Complete Database ER Diagram & Relational Schemas](#5-complete-database-er-diagram--relational-schemas)
6. [API Contract Documentation](#6-api-contract-documentation)
7. [AI System Architecture & Multi-Agent Pedagogical Engine](#7-ai-system-architecture--multi-agent-pedagogical-engine)
8. [Zero-Trust Security & Multi-Tenant Isolation Architecture](#8-zero-trust-security--multi-tenant-isolation-architecture)
9. [12-Stage Phased Development Roadmap (M1–M12)](#9-12-stage-phased-development-roadmap-m1m12)
10. [Comprehensive Risk Analysis & Mitigation Matrix](#10-comprehensive-risk-analysis--mitigation-matrix)
11. [Technical Decision Document (TDD)](#11-technical-decision-document-tdd)

---

## 1. Executive Summary & Educational Philosophy

Nur AI Quran Tutor is a world-class, integrated AI Quran education platform embedded directly into the Rahmania ERP architecture. It operates not as an adversarial mistake-counter, but as a compassionate, patient, and authoritative Quranic scholar (Shaykh/Ustadh).

### Core Educational Loop: The Six-Stage Pedagogical Cycle
```
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE PEDAGOGICAL CYCLE                          │
│                                                                        │
│   [ 1. EXPLAIN ] ──────► Clarify the exact Tajweed / Makhraj rule      │
│         │                and why the student's articulation missed it. │
│         ▼                                                              │
│   [ 2. DEMONSTRATE ] ──► Play pristine recitation (slow-motion &       │
│         │                standard) with 3D/vector anatomical guidance. │
│         ▼                                                              │
│   [ 3. PRACTICE ] ─────► Student recites via voice recording;          │
│         │                audio stream ingested with zero latency.      │
│         ▼                                                              │
│   [ 4. EVALUATE ] ─────► Real-time phoneme & acoustic analysis detects │
│         │                Tajweed deviations, hesitation & omissions.   │
│         ▼                                                              │
│   [ 5. CORRECT ] ──────► If incorrect, provide a different heuristic,  │
│         │                simplified word drill, and targeted hint.     │
│         ▼                                                              │
│   [ 6. REPEAT ] ───────► Loop until the student achieves mastery (90%+ │
│                          confidence score) before advancing.           │
└────────────────────────────────────────────────────────────────────────┘
```

### The 14 Scope Expansions Integrated
1. **Real Teacher Persona**: Explains *why* an error occurred, provides differentiated feedback, and never reveals the full answer immediately.
2. **Interactive Voice Conversation**: Real-time natural speech conversation ("What is Ikhfa?", "Why is this Madd 4 Harakat?") with two-way voice streaming.
3. **Advanced Hifz Assistant**: Listens to memorization, detects forgotten Ayahs, skipped words, sequence anomalies, offers subtle hints, daily revision schedules, and spaced repetition.
4. **AI Learning Memory**: Tracks frequent letter errors, weak rules, weak Surahs, learning pace, and tailors all sessions dynamically.
5. **Dynamic Practice Generator**: Creates focused drill sessions targeted strictly at weak areas (e.g. 15-minute Ikhfa drill).
6. **AI Oral Examination**: Full oral evaluation for Reading, Tajweed, and Hifz with automatic rubric scoring, teacher override, and certified digital credentials.
7. **AI Quran Semantic Search**: Natural language querying for themes (e.g. "verses regarding Musa AS", "Sajdah verses", "all Makki Surahs with Ghunnah").
8. **Visual Tajweed Academy**: 17 Makhraj visual guides with tongue, lip, and airflow diagrams, slow-motion playback, and multi-Qari demonstrations.
9. **Institutional ERP Integration**: Multi-tenant academy operations (classes, teachers, students, attendance, exams, fees, reporting, branches).
10. **Predictive Progress Analytics**: ML estimation of Hifz completion dates, Tajweed mastery velocity, and early warning for struggling students.
11. **Offline Learning Mode**: PWA, local audio cache, IndexedDB state synchronization for low-connectivity environments.
12. **Teacher Review & Human-in-the-Loop**: Teachers can accept, edit, or reject AI assessments, driving model alignment.
13. **Explain → Demonstrate → Practice → Verify Loop**: Formalized as the central pedagogical invariant.
14. **Premium Islamic Aesthetics**: Dark forest emerald green (`#0f766e`, `#064e3b`), warm desert gold (`#d97706`), Amiri typography, zero sparkles icons.

---

## 2. Master Information Architecture (IA)

```
NUR AI QURAN TUTOR & ERP
│
├── 🌐 Public Portal (/quran-tutor)
│   ├── Interactive Hero & Voice Mic Demo
│   ├── 17 Makhraj Interactive Anatomy Showcase
│   ├── Live Pedagogical Loop Demonstration
│   ├── Oral Exam Showcase & Verification Portal
│   ├── Curriculum & Academy Pricing Tiers
│   └── Offline PWA Install Prompt
│
├── 🎙️ Student Learning Studio (/quran-tutor/studio)
│   ├── 📖 Quran Reader & Mushaf Interface (Uthmani Script)
│   │   ├── Word-by-Word Audio Synchronization
│   │   ├── Tajweed Color Highlighting (Dynamic Layer)
│   │   └── Ayah-level Practice Trigger
│   │
│   ├── 🤖 Nur Interactive Voice & Teaching Engine
│   │   ├── Real-Time Voice Conversation Stream
│   │   ├── 6-Stage Pedagogical Loop Session
│   │   ├── Makhraj Anatomical Visualizer Drawer
│   │   └── Adaptive Hint System (For Hifz Memorization)
│   │
│   ├── 🧠 Personalized Practice Center
│   │   ├── Targeted Drills (Generated from AI Learning Memory)
│   │   ├── Spaced Repetition Revision Queue (Anki-style SM-2)
│   │   └── Daily Sabaq, Sabqi, and Amukta Planner
│   │
│   ├── 📝 Oral Examination Chamber
│   │   ├── Live Audio Proctoring
│   │   ├── Multi-Dimension Rubric Scoring (Makhraj, Sifat, Madd, Fluency)
│   │   └── Instant Diagnostic Scorecard & Certificate Request
│   │
│   └── 📊 Student Progress & Predictive Analytics
│       ├── Mastery Radar Chart (17 Articulation Points)
│       ├── Estimated Hifz Completion Date Tracker
│       └── Weak Surah / Weak Ayah Heatmap
│
├── 👨‍🏫 Teacher Review & Oversight Portal (/TeacherDashboard)
│   ├── Pending AI Oral Exams Review Queue
│   ├── Override / Re-score Rubric Engine
│   ├── Student Memory Profile Inspector
│   └── Daily Lesson Entry (Sabaq, Sabqi, Amukta, Lokma Logging)
│
├── 🏛️ Institutional Academy Console (/admin)
│   ├── Student & Teacher Enrollment
│   ├── Class Rosters & Hifz Halaqah Groups
│   ├── Biometric & Manual Attendance Integration
│   └── Financials, Fees & Subscription Tiers
│
└── ⚙️ Platform Multi-Tenant Super Console (/platform-console)
    ├── Organization & Domain Provisioning
    ├── AI Provider Routing & Rate Limits (OpenRouter, Gemini, Anthropic)
    ├── Tenant RLS Isolation Enforcement
    └── Immutable Audit Logs & Security Anomaly Center
```

---

## 3. End-to-End User Flow Diagrams

### Flow A: Interactive Recitation with Pedagogical Loop
```
[Student starts Ayah] ──► [Records Audio Stream] ──► [Server Audio Ingest: /api/ai/nur-eval]
                                                              │
                                                              ▼
                                                   [Phoneme Alignment & Tajweed Engine]
                                                              │
                     ┌────────────────────────────────────────┴──────────────────────────┐
                     ▼ (Correct: Score >= 90%)                                           ▼ (Error Detected)
            [Praise & Gamification XP]                                   [Fetch Error Classification]
                     │                                                   • Rule: Ikhfa Meem Saakin
                     ▼                                                   • Phoneme Deviation: مْ + ب
            [Advance to Next Ayah]                                       • Makhraj Point: As-Shatiyaan (Lips)
                                                                                         │
                                                                                         ▼
                                                                 [STAGE 1: EXPLAIN]
                                                                 AI speaks: "You pressed your lips too firmly..."
                                                                                         │
                                                                                         ▼
                                                                 [STAGE 2: DEMONSTRATE]
                                                                 Plays Shaykh Alafasy snippet + triggers Lip Animation
                                                                                         │
                                                                                         ▼
                                                                 [STAGE 3: PRACTICE]
                                                                 Student taps Mic and recites the specific word
                                                                                         │
                                                                                         ▼
                                                                 [STAGE 4: EVALUATE]
                                                                 Re-evaluates specific phoneme window
                                                                                         │
                                                   ┌─────────────────────────────────────┴─────────────────┐
                                                   ▼ (Passed)                                              ▼ (Still Incorrect)
                                          [Mark Error Resolved in Memory]                          [STAGE 5: ALTERNATIVE HINT]
                                                   │                                               AI uses analogy: "Hold light
                                                   ▼                                               nasal hum for 2 Harakat..."
                                          [Resume Full Ayah]                                               │
                                                                                                           ▼
                                                                                                   [Repeat Loop max 3x]
```

### Flow B: Advanced Hifz Memorization & Hint Loop
```
[Student Recites From Memory] ──► [Audio Transcribed to Ayah Tokens]
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 ▼                              ▼                              ▼
          [Missing Word]                [Wrong Sequence]                [Hesitation > 4s]
                 │                              │                              │
                 ▼                              ▼                              ▼
      [STAGE 1 HINT: Soft Cue]       [STAGE 1 HINT: Pause]          [STAGE 1 HINT: Prompt First Letter]
      "Check the vowel on word 3"    "You jumped ahead 2 Ayahs"     "The next word starts with 'Wa-'"
                 │                              │                              │
                 └──────────────────────────────┼──────────────────────────────┘
                                                ▼
                                   [Student Retries Recitation]
                                                │
                         ┌──────────────────────┴──────────────────────┐
                         ▼ (Corrected)                                 ▼ (Failed 2nd attempt)
            [Increment Memory Stability]                    [Reveal Word & Log Lokma]
                         │                                             │
                         ▼                                             ▼
            [Spaced Repetition Updated]                     [Schedule for Daily Sabqi Review]
```

---

## 4. Screen-by-Screen UI/UX Specification

### S1: Studio Quran Reader & Mushaf Interface
* **Layout**: Split-pane or full-screen immersive view. Primary color `#064e3b` (Deep Forest) with warm parchment background `#FBFDFB` (Light) / `#0A130E` (Dark).
* **Typography**: Traditional Uthmani script (Amiri / KFGQPC Hafs) at minimum 28px font size with adjustable Harakat kerning.
* **Interactive Elements**:
  * Word-level tap: Popover showing root word, Tajweed rule, and isolated audio button.
  * Bottom Control Bar: Dual-channel audio wave visualizer, Mic Toggle (48px target), Pace Controller (0.75x, 1.0x, 1.25x), and Reciter Selector (Al-Husary, Alafasy, Al-Minshawi).
  * Mode Switcher: "Tilawah (Reading)" vs. "Hifz (Blind Memory)" vs. "Oral Examination".

### S2: Nur AI Interactive Voice Teacher Drawer
* **Dock Position**: Right sidebar on desktop (420px width), expandable bottom sheet on mobile.
* **Components**:
  * *Status Orb*: Pulsing emerald ring indicating AI State: `LISTENING` (Emerald wave), `ANALYZING` (Gold rotating orbit), `SPEAKING` (Audio bar equalizer).
  * *Dialogue Transcript*: Chat messages rendered in distinct speech bubbles. Arabic Quran snippets rendered in bold framed cards.
  * *Action Badges*: "Demonstrate Again", "Show Makhraj 3D", "Skip to Next Ayah".
  * *Zero Sparkles Compliance*: Semantic icons only (`Bot`, `Volume2`, `Mic`, `BookOpen`, `ShieldCheck`).

### S3: 17 Makhraj Visualizer Anatomy Panel
* **Visual Presentation**: Interactive SVG/Canvas vector diagram of sagittal head section showing vocal tract:
  1. Al-Jawf (Empty space in mouth and throat)
  2. Al-Halq (Throat: Deep, Middle, Closest)
  3. Al-Lisan (Tongue: 10 points for 18 letters)
  4. Ash-Shafatayn (The Lips: Fa, Ba, Meem, Waw)
  5. Al-Khayshum (Nasal cavity: Ghunnah)
* **Animation Specs**: Color-coded airflow paths (Blue: vocalized air; Amber: nasal resonance). Highlighted active articulators with animated contact points.

### S4: AI Oral Examination Chamber
* **Header**: Exam details (Surah range, Target Rubric: Tajweed + Fluency + Hifz Accuracy, Countdown Timer).
* **Live Feed**: Clean text display without Tajweed color codes (to test true student knowledge).
* **Scoring Matrix (Real-time & Post-Exam)**:
  * Makhraj Precision (0–100%)
  * Sifat Al-Huroof (0–100%)
  * Madd Rules Duration (Harakat counter)
  * Waqf & Ibtida (Proper stopping and starting)
  * Hifz Retention (Lokma / hesitation penalty)
* **Actions**: "Submit Exam for Teacher Verification", "Download Official PDF Transcript".

---

## 5. Complete Database ER Diagram & Relational Schemas

```
                       ┌──────────────────────┐
                       │    organizations     │
                       │  (Tenant Isolation)  │
                       └──────────┬───────────┘
                                  │ 1:N
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐
│     students     │    │     teachers     │    │      nur_curricula   │
│ (Tenant Scoped)  │    │ (Tenant Scoped)  │    │ (Levels & Syllabi)   │
└────────┬─────────┘    └────────┬─────────┘    └──────────┬───────────┘
         │ 1:N                   │                         │
         ├───────────────────────┼─────────────────────────┤
         ▼                       ▼                         ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐
│ nur_student_     │    │ nur_exam_        │    │ nur_practice_        │
│ memory_profiles  │    │ submissions      │    │ exercises            │
└────────┬─────────┘    └────────┬─────────┘    └──────────────────────┘
         │ 1:N                   │ 1:N
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│ nur_mistake_logs │    │ nur_exam_rubric_ │
│ (Error History)  │    │ scores           │
└──────────────────┘    └──────────────────┘
```

### PostgreSQL Schemas (Supabase DDL Specifications)

```sql
-- 1. Student AI Memory Profile
CREATE TABLE IF NOT EXISTS public.nur_student_memory_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    weak_letters TEXT[] DEFAULT '{}',
    weak_rules TEXT[] DEFAULT '{}',
    weak_surahs INT[] DEFAULT '{}',
    weak_makharij TEXT[] DEFAULT '{}',
    preferred_speed NUMERIC(3,2) DEFAULT 1.00,
    learning_style TEXT DEFAULT 'visual_audio',
    hifz_stability_score NUMERIC(5,2) DEFAULT 0.00,
    estimated_hifz_completion DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unq_nur_student_memory UNIQUE (organization_id, student_id)
);

-- 2. Mistake Audit Trail & Learning Logs
CREATE TABLE IF NOT EXISTS public.nur_mistake_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    surah_number INT NOT NULL,
    ayah_number INT NOT NULL,
    word_position INT,
    expected_phoneme TEXT,
    recited_phoneme TEXT,
    rule_category TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('lahn_jali', 'lahn_khafi', 'hesitation', 'omission')),
    repetitions_before_correct INT DEFAULT 1,
    resolved BOOLEAN DEFAULT false,
    session_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Dynamic Practice Drills Queue (Spaced Repetition)
CREATE TABLE IF NOT EXISTS public.nur_practice_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    exercise_type TEXT NOT NULL CHECK (exercise_type IN ('ikhfa_drill', 'qalqalah_drill', 'madd_timing', 'makhraj_isolation', 'hifz_gap_fill')),
    target_rule TEXT NOT NULL,
    target_ayahs JSONB NOT NULL,
    difficulty INT DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    repetitions_due INT DEFAULT 3,
    next_review_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mastery_level NUMERIC(4,2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'deferred')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Oral Examination Submissions & Teacher Reviews
CREATE TABLE IF NOT EXISTS public.nur_exam_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    exam_type TEXT NOT NULL CHECK (exam_type IN ('reading', 'tajweed', 'hifz', 'listening')),
    surah_start INT NOT NULL,
    ayah_start INT NOT NULL,
    surah_end INT NOT NULL,
    ayah_end INT NOT NULL,
    ai_overall_score NUMERIC(5,2) NOT NULL,
    ai_breakdown JSONB NOT NULL,
    recording_url TEXT,
    teacher_id UUID REFERENCES public.teachers(id),
    teacher_override_score NUMERIC(5,2),
    teacher_comments TEXT,
    teacher_status TEXT NOT NULL DEFAULT 'pending' CHECK (teacher_status IN ('pending', 'approved', 'rejected', 'modified')),
    certificate_issued BOOLEAN DEFAULT false,
    certificate_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);
```

---

## 6. API Contract Documentation

### 6.1 Audio Recitation Evaluation
* **Endpoint**: `POST /api/ai/nur/evaluate-recitation`
* **Access**: Authenticated Student Session (`student` or `admin` role)
* **Request Payload**:
  ```json
  {
    "surah": 1,
    "ayah": 1,
    "wordIndex": null,
    "audioBase64": "data:audio/webm;base64,...",
    "mode": "standard_learning",
    "expectedText": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "ok": true,
    "confidenceScore": 94.5,
    "passed": true,
    "status": "proficient",
    "phonemeAnalysis": [
      { "word": "بِسْمِ", "status": "perfect", "makhraj": "Ash-Shafatayn" },
      { "word": "الرَّحْمَٰنِ", "status": "perfect", "sifat": "Hams on Ha" },
      { "word": "الرَّحِيمِ", "status": "minor_hesitation", "maddHarakat": 4 }
    ],
    "feedbackVoiceScript": "মাশাআল্লাহ, আপনার তেলাওয়াত সুন্দর হয়েছে। 'আর-রাহিম'-এর শেষ মদ ৪ হরকত চমৎকার ছিল।",
    "pedagogicalNextStep": "advance_ayah"
  }
  ```

### 6.2 Real-Time Voice Conversation
* **Endpoint**: `POST /api/ai/nur/conversational-tutor`
* **Access**: Authenticated Session
* **Request Payload**:
  ```json
  {
    "transcript": "উস্তাদজি, ইকফার গুন্নাহ কত হরকত করতে হয়?",
    "surahContext": 113,
    "ayahContext": 2,
    "conversationHistory": []
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "ok": true,
    "answerText": "ইকফার গুন্নাহ পূর্ণ ২ হরকত পরিমাণ করতে হয়। এটি করার সময় জিহ্বা উপরের তালুতে স্পর্শ করবে না, বরং নাকের ভেতর থেকে মৃদু গুন্নাহর আওয়াজ হবে। যেমন: مِنْ شَرِّ।",
    "demonstrationAudioUrl": "https://everyayah.com/data/Alafasy_128kbps/113002.mp3",
    "makhrajHighlight": "Al-Khayshum",
    "suggestedDrill": "ikhfa_drill_113_2"
  }
  ```

### 6.3 Hifz Memorization Assistant & Hint Ingestion
* **Endpoint**: `POST /api/ai/nur/hifz-listener`
* **Access**: Authenticated Student Session
* **Request Payload**:
  ```json
  {
    "surah": 67,
    "currentAyah": 5,
    "recitedAudioChunk": "data:audio/webm;base64,...",
    "priorContextAyahs": [1, 2, 3, 4]
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "ok": true,
    "detectedAyah": 5,
    "sequenceStatus": "correct_order",
    "skippedWords": [],
    "hesitationSeconds": 0,
    "hintRequired": false,
    "hint": null,
    "nextExpectedWord": "وَلَقَدْ"
  }
  ```

### 6.4 Semantic Quran Natural Language Search
* **Endpoint**: `POST /api/ai/nur/semantic-search`
* **Access**: Public / Authenticated
* **Request Payload**:
  ```json
  {
    "query": "মুসা (আঃ) এর লাঠির অলৌকিক ঘটনা সম্পর্কিত সকল আয়াত দেখান",
    "filters": { "type": "thematic_search" }
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "ok": true,
    "matchesCount": 6,
    "results": [
      {
        "surah": 20,
        "ayah": 17,
        "arabic": "وَمَا تِلْكَ بِيَمِينِكَ يَا مُوسَىٰ",
        "bangla": "হে মূসা, তোমার ডান হাতে ওটা কি?",
        "contextExplanation": "আল্লাহ তা'আলা মূসা (আঃ) কে তাঁর লাঠি সম্পর্কে জিজ্ঞেস করেন।"
      },
      {
        "surah": 20,
        "ayah": 20,
        "arabic": "فَأَلْقَاهَا فَإِذَا هِيَ حَيَّةٌ تَسْعَىٰ",
        "bangla": "অতঃপর তিনি তা নিক্ষেপ করলেন, আর সাথে সাথে তা সর্প হয়ে ছুটতে লাগল।"
      }
    ]
  }
  ```

---

## 7. AI System Architecture & Multi-Agent Pedagogical Engine

### Architecture Overview
```
┌────────────────────────────────────────────────────────────────────────┐
│                   NUR MULTI-TIER AI ADAPTER FABRIC                    │
│                                                                        │
│  [ WebRTC / Audio Ingestion ]                                          │
│             │                                                          │
│             ▼                                                          │
│  [ Audio Preprocessor & VAD (Voice Activity Detector) ]                │
│             │                                                          │
│             ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    SPECIALIZED AI AGENT COHORTS                  │  │
│  │                                                                  │  │
│  │  1. Phonetic & Tajweed Acoustic Engine                           │  │
│  │     • Aligns audio to canonical Uthmani phonemes                 │  │
│  │     • Detects Lahn Jali (obvious) & Lahn Khafi (subtle) mistakes │  │
│  │                                                                  │  │
│  │  2. Hifz Memory & Sequence Auditor                               │  │
│  │     • Word-by-word token matching against Mus'haf database       │  │
│  │     • Spaced Repetition (Anki SM-2) stability scoring            │  │
│  │                                                                  │  │
│  │  3. Conversational Ustadh Agent (LLM Engine)                     │  │
│  │     • Multi-provider failover: Gemini 1.5 Pro / Claude 3.5 Sonnet│  │
│  │     • Islamic etiquette prompt & Pedagogical Loop Heuristics     │  │
│  │                                                                  │  │
│  │  4. Visual Tajweed Dispatcher                                    │  │
│  │     • Translates errors into 3D Makhraj coordinates & vector rigs│  │
│  └──────────────────────────────────────────────────────────────────┘  │
│             │                                                          │
│             ▼                                                          │
│  [ Synthesizer & Speech Out ] ──► Dual Output: Text & Human-Grade Voice │
└────────────────────────────────────────────────────────────────────────┘
```

### Deterministic Tajweed Grammar & Rules Engine
AI models are prone to hallucinating Tajweed rules without strict grounding. Therefore, the system utilizes an **Acoustic-Symbolic Hybrid Architecture**:
1. **Symbolic Layer**: Hardcoded rules repository (`src/lib/ai/teaching-rules.js` and `rules/tajweed-canon.json`) containing every Noon Saakin, Meem Saakin, Madd, Qalqalah, and Makhraj classification.
2. **Acoustic Layer**: Fast STT / Audio Embedding matching against reference Qari recordings (Mahmoud Khalil Al-Husary).
3. **Synthesis**: The LLM *only* formats the explanation and pedagogical tone; it never invents Tajweed rulings on its own.

---

## 8. Zero-Trust Security & Multi-Tenant Isolation Architecture

1. **Strict Server-Side Tenant Resolution**:
   - Client-supplied `organization_id` or `tenant_id` are strictly ignored.
   - Tenant context is extracted server-side using the verified session JWT and domain mapping.
2. **PostgreSQL Row Level Security (RLS)**:
   - Tables (`nur_student_memory_profiles`, `nur_mistake_logs`, `nur_exam_submissions`, `nur_practice_exercises`) have RLS enabled with `organization_id = (SELECT organization_id FROM auth_users_view WHERE id = auth.uid())`.
   - Anonymous access is completely denied (`USING (false)`).
3. **Data Pseudonymization for External LLMs**:
   - No student names, phone numbers, or institutional IDs are sent to OpenRouter / Anthropic / Google APIs.
   - Students are referenced via opaque session tokens (`STUDENT_SESSION_A79`).
4. **Biometric Attendance Invariant**:
   - The biometric bridge routes (`/api/attendance/device`, `/api/attendance/manage`) run independently and must never be blocked or altered by AI operations.
5. **Rate Limiting & Cost Protection**:
   - Token bucket rate limiter: Max 20 voice queries per student per hour on standard tier; unlimited on enterprise tier.
   - Provider fallback ladder: Primary (Gemini) → Secondary (OpenRouter) → Local Fallback (Rule Engine).

---

## 9. 12-Stage Phased Development Roadmap (M1–M12)

| Milestone | Scope & Deliverables | Verification Gates |
|---|---|---|
| **M1: Foundation & Core Infrastructure** | DB Schemas, RLS Policies, Audio API Scaffolding, IndexedDB Local Cache Architecture, Tenant Security Gates | Schema validation, zero typecheck/lint errors |
| **M2: Core Pedagogical Loop** | Explain → Demonstrate → Practice → Verify state machine, Audio Player, Evaluation endpoints | Complete loop cycle verified with synthetic & real audio |
| **M3: Real-Time Interactive Voice** | WebRTC/Streaming voice input, Arabic-Bangla STT/TTS pipeline, Ustadh Conversational Persona | Sub-800ms latency, natural speech responses |
| **M4: Visual Tajweed Academy** | 17 Makhraj interactive SVG vector diagrams, airflow animations, slow-motion Qari clips | 100% accuracy on all 17 articulation points |
| **M5: Advanced Hifz Assistant** | Blind memory reader, missed word detection, sequence check, subtle hint generator, daily Sabaq/Sabqi tracker | Correct identification of 10/10 synthetic memory skips |
| **M6: AI Learning Memory** | Student profile memory, error frequency matrix, adaptive difficulty calculation, speed preference | Profile updates persist across sessions |
| **M7: AI Practice Generator** | Dynamic drill generator, personalized exercise queue, Anki SM-2 spaced repetition integration | Exercises automatically target student's weakest rules |
| **M8: AI Oral Examination** | 4-mode oral exam suite (Reading, Tajweed, Hifz, Listening), multi-point rubric, certified scorecards | Rubric scoring matches human teacher within ±5% |
| **M9: Semantic Quran Search** | Natural language Quran search, thematic indexing, Sajdah/Makki/Madani queries | 100% precision on canonical Quran queries |
| **M10: Teacher Review Mode** | Teacher dashboard override queue, exam grading adjustment, comment system, model RL feedback loop | Teacher overrides update student memory records |
| **M11: AI Progress Prediction** | Velocity analyzer, estimated Hifz completion calendar, struggling student early-warning system | Predictive models generate deterministic milestones |
| **M12: Offline PWA & Production Launch** | Service worker, offline Quran & recitation cache, background sync, security audit, platform launch | PWA works offline; 0 lint/build errors |

---

## 10. Comprehensive Risk Analysis & Mitigation Matrix

| Risk ID | Description | Severity | Probability | Mitigation Strategy |
|---|---|---|---|---|
| **RSK-01** | AI Hallucination of Tajweed rules | High | Low | Hardcode Tajweed rules in deterministic symbolic database; AI only crafts pedagogical explanations. |
| **RSK-02** | Cross-Tenant Data Leakage | Critical | Very Low | Enforce Supabase RLS with tenant isolation. Server extracts tenant from session JWT; client inputs rejected. |
| **RSK-03** | Audio Processing Latency (> 2s) | Medium | Medium | Use lightweight client-side VAD, edge audio streaming, and pre-cached phoneme alignments. |
| **RSK-04** | Disruption of Biometric Attendance | Critical | Very Low | Biometric daemon runs on isolated micro-pathway; zero dependency on AI modules. |
| **RSK-05** | Offline-Online Sync Conflicts | Medium | Medium | Timestamp-based CRDTs in IndexedDB; server-wins strategy on conflict resolution. |
| **RSK-06** | Student Frustration from False Negatives | High | Low | Confidence score threshold set to 85% with grace margin; 3-attempt fallback before human teacher referral. |

---

## 11. Technical Decision Document (TDD)

* **Decision 1: Framework Choice**: Next.js 16 (App Router) with React Server Components for SEO and fast initial Mushaf load, combined with client components for interactive Web Audio.
* **Decision 2: State Management**: React Query for server cache + Zustand for local studio state (audio player, current Ayah, active visualizer coordinates).
* **Decision 3: Audio Format**: Opust/WebM container ingested at 16kHz mono, downsampled on client to conserve mobile bandwidth.
* **Decision 4: Database Layer**: Supabase PostgreSQL with native Row Level Security, indexing `organization_id`, `student_id`, and `created_at` for sub-50ms query times.
* **Decision 5: Icons & UI Standard**: Pure Tailwind CSS, Lucide icons (semantic only: `Bot`, `BookOpen`, `Volume2`, `Mic`, `ShieldCheck`), zero `Sparkles` icons, minimum 44px touch targets.
