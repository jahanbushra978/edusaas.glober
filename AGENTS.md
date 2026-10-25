# 📖 AGENTS.md — Single Source of Truth (SSOT) & Architectural Invariants

> **Project**: Rahmania Institute & Enterprise Multi-Tenant Quranic SaaS Platform  
> **Status**: APPROVED & CURRENT SOURCE OF TRUTH  
> **Target Architecture**: Next.js 16 (App Router) + Supabase PostgreSQL (RLS) + Multi-Provider AI Adapters  
> **Absolute Invariant**: Base44 Is Strictly Prohibited. AI Teacher is 100% Integrated Inside "Nur".

---

## 1. Project Overview and Goals

**Rahmania Institute** is an enterprise-grade Multi-Tenant Educational SaaS & Quranic ERP platform.
The platform powers three unified pillars:

1. **Flagship Academy**: Rahmania Institute (Harinal, Gazipur City, Dhaka, Bangladesh) — hosting Hifzul Quran, Noorani, Najera, and Kitab departments, complete with residential boarding, live biometric attendance, student fee accounting, exams, and parent portals.
2. **Multi-Tenant SaaS Infrastructure**: Enables independent madrasas, schools, academies, and institutions to operate as isolated tenants with custom white-label domains, tailored branding, and dedicated ERP workflows on a shared, secure infrastructure.
3. **Nur AI Quran Companion & Teacher**: An integrated, voice-first Islamic conversational tutor and interactive teaching engine delivering real-time Tajweed analysis, Makhraj articulation visualization, Hifz tracking, and oral examinations.

---

## 2. Actual Technology Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Framework** | **Next.js 16** (App Router + React 18, React DOM 18) |
| **Language** | Modern JavaScript (ES Modules, JSX) + TypeScript definition checking (`tsc`) |
| **Database** | **Supabase PostgreSQL** with Row Level Security (RLS) and custom PL/pgSQL RPC functions |
| **Authentication** | Supabase Auth + Server-Side JWT Cookie Resolution + Scoped 5-Point Security Gate |
| **AI Layer** | Multi-Provider Adapters (`src/lib/ai/providers` supporting Gemini, OpenAI, OpenRouter, Anthropic) |
| **Local AI Engine** | Institutional Assistant (`src/lib/ai/local-assistant.js`) + Tajweed Canon (`src/lib/ai/tajweed-canon.js`) |
| **Voice & Audio** | Neural Bengali TTS Proxy (`/api/ai/tts`), Web Audio API (`AudioContext`, `AnalyserNode`), Web Speech Recognition |
| **Styling & UI** | Tailwind CSS 3.4, Radix UI Primitives, Lucide React (semantic icons only, zero sparkles), Framer Motion |
| **Media Storage** | Cloudinary CDN (`next-cloudinary`) with tenant-isolated directory paths |
| **Biometric IoT** | Biometric Hardware Bridge Daemon (`biometric-bridge/`) for live attendance machine integration |
| **Package Manager** | npm (`package.json`) |

---

## 3. Existing Backend Architecture

### 3.1 Absolute Ban on Base44
- **Base44 is strictly prohibited.** It is NOT part of this architecture and must never be installed, imported, migrated to, or introduced.
- Any legacy reference to Base44 in plans or notes is obsolete.
- The authentic backend consists exclusively of **Next.js 16 API Routes + Supabase PostgreSQL + Multi-Provider AI Adapters**.

### 3.2 Multi-Tenant Isolation & Zero Trust
- Every organization (Madrasa, School, Academy) is assigned a unique UUID in `organizations`.
- **Server-Side Tenant Resolution**: The tenant context is resolved strictly via verified session JWT or validated `Host` header domain mapping (`src/lib/tenant/tenantContext.js`). Any client-supplied `tenantId` in request bodies or query params is untrusted and ignored.
- **Default Policy**: DENY unless explicitly authorized. Cross-tenant access triggers an immediate `403 Forbidden` and logs a `CRITICAL` alert to `security_events`.

### 3.3 The Three Distinct Experiences
1. **Tenant Admin Portal (`/admin`)**: Scoped to the verified institution. Manages students, teachers, biometric attendance, fees, exams, and settings.
2. **Public Storefront / Portal (`/` or Custom Domain)**: White-labeled public website displaying notices, facilities, admissions, courses, and location maps.
3. **Platform Console (`/platform-console`)**: Reserved exclusively for Super Admins (`platform_owners`) to provision tenants, manage global subscriptions, and monitor threat telemetry.

---

## 4. Application Structure and Important Files

```text
├── app/                                 # Next.js 16 App Router
│   ├── (platform-console)/              # Super Admin SaaS Console
│   ├── (site)/                          # Public & Tenant Storefront routes
│   │   ├── quran-tutor/                 # Nur AI Quran Companion & Studio entry
│   │   └── site/[slug]/                 # Dynamic white-label tenant site renderer
│   ├── admin/                           # Tenant Admin ERP Portal
│   ├── api/                             # Authoritative API endpoints
│   │   ├── ai/                          # AI endpoints (/tts, /nur, /nur-eval, /chat)
│   │   ├── attendance/                  # Biometric attendance ingestion (/device)
│   │   └── platform/                    # Multi-tenant management & security
│   ├── globals.css                      # Global design system & Islamic color tokens
│   └── layout.jsx                       # Root layout with tenant resolution
├── biometric-bridge/                    # IoT attendance daemon for biometric machines
├── docs/                                # Architectural specifications & blueprints
├── public/                              # Static public assets and PWA service worker
├── src/                                 # Feature-sliced source code
│   ├── components/                      # Core layout and shared components
│   ├── features/                        # Domain feature modules
│   │   ├── admin/                       # Tenant admin management features
│   │   ├── ai/                          # Nur AI Engine (Tutor, Teacher, Makhraj, Hifz)
│   │   ├── platform-console/            # Super Admin console components
│   │   ├── quran/                       # Quran Reader, audio player, tajweed renderer
│   │   ├── site/                        # Storefront and dynamic pages
│   │   ├── students/                    # Student portal & reading suggestions
│   │   └── teachers/                    # Teacher AI review hub & gradebook
│   ├── hooks/                           # Custom React hooks
│   └── lib/                             # Core utilities and abstractions
│       ├── ai/                          # TTS, providers, local assistant, tajweed canon
│       ├── supabase/                    # Supabase browser & server clients
│       └── tenant/                      # Server-side tenant resolution logic
└── supabase/migrations/                 # Supabase PostgreSQL DDL, RLS policies, RPCs
```

### Critical Files
- `app/api/ai/tts/route.js`: High-fidelity neural Bengali speech synthesis with MP3 chunking and caching.
- `src/lib/ai/voice-agent-engine.js`: Voice playback controller with streaming audio, barge-in, and phonetic cleaning.
- `app/(site)/quran-tutor/live-class/page.jsx`: Dedicated, full-screen Live Voice Quran Classroom route.
- `src/features/site/pages/LiveVoiceClassroomPage.jsx`: Full-screen Islamic sanctuary page layout for hands-free voice recitation.
- `src/features/ai/components/LiveVoiceQuranClass.jsx`: Hands-free live voice recitation classroom with adaptive progression (supports full-page sanctuary mode and compact embedded mode).
- `src/features/ai/components/InteractiveVoiceTutor.jsx`: Unified conversational voice tutor interface.
- `src/features/ai/components/NurTeachingEngine.jsx`: Interactive teaching loop (Explain $\rightarrow$ Demonstrate $\rightarrow$ Practice $\rightarrow$ Evaluate $\rightarrow$ Correct $\rightarrow$ Repeat).
- `src/features/ai/components/MakhrajVisualizer.jsx`: 17 Makharij anatomical articulation visualizer.
- `src/lib/ai/tajweed-canon.js`: Authoritative Islamic Tajweed rules and phonetics knowledge base.
- `src/lib/tenant/tenantContext.js`: Multi-tenant zero-trust resolution gate.

---

## 5. Authentication and Authorization

### 5.1 Role Hierarchy
- **`platform_owner`**: Super Admin accessing `/platform-console`, authenticated via `platform_owners` table with bcrypt password hashing and HMAC-signed session cookies (`edu_platform_session`).
- **`admin` / `branch_admin`**: Tenant administrators scoped strictly to their `organization_id`.
- **`teacher`**: Academic staff accessing `/teacher` for daily lesson entries, Hifz logs, and attendance.
- **`student`**: Enrolled learners accessing `/student` for reading logs, fee receipts, and study tools.
- **`guest`**: Public visitors with read-only access to published public content.

### 5.2 The Mandatory 5-Point Security Gate
Every sensitive server action, API route, and AI mutation must answer:
1. **Who is the user?** (Authenticated session resolved from server-side JWT/cookie).
2. **Which organization?** (Resolved from authoritative database session).
3. **What role?** (`platform_owner`, `admin`, `teacher`, `student`).
4. **Authorized permission?** (`has_permission(module, action)`).
5. **Verified resource ownership?** (`resource.organization_id === session.organization_id`).

### 5.3 Immutable Audit Logging
- Telemetry logged to `platform_audit_logs`, `security_events`, and `ai_action_logs`.
- Tables are write-once and client-denied (`USING (false)`).
- **Zero Credential Logging**: Passwords, tokens, API keys, and payment data are NEVER logged.

---

## 6. Database and Data Models

### 6.1 Core Database Tables
- **Organizations & Multi-Tenancy**: `organizations`, `domain_mappings`, `white_label_configs`.
- **Institution Management**: `branches`, `app_settings`, `facilities`, `notices`, `hero_slides`, `blogs`.
- **Academic & Students**: `students`, `teachers`, `teacher_salary_profiles`, `admission_applications`.
- **Attendance & Biometrics**: `attendances`, `teacher_attendance`, `attendance_sync_logs`.
- **Quran & Hifz Operations**: `daily_lessons` (Sabaq, Sat Sabaq, Amukta, Lokma), `reading_logs`.
- **Financial Accounting**: `student_fees`, `expenses`, `hadiya`, `teacher_payments`.
- **Examinations**: `exams`, `exam_inputs`, `exam_results`.
- **Nur AI Engine**: `security_events`, `platform_audit_logs`, `ai_action_logs`.

### 6.2 Manual Supabase SQL Execution Rule
- The local CLI command `npx supabase db push` does NOT automatically push migrations to remote Supabase.
- **Whenever a new SQL migration or database function (RPC) is written, you MUST immediately notify the user with the SQL code and instruct them to run it manually in the Supabase SQL Editor.**

---

## 7. Existing AI Architecture

```text
               Client / Voice / Chat UI
                         │
                         ▼
             Next.js 16 AI Layer (/api/ai)
                         │
     ┌───────────────────┼───────────────────┐
     ▼                   ▼                   ▼
Local Assistant    Tajweed Canon     Central / BYOK LLM
(local-assistant) (tajweed-canon)    (providers adapter)
     │                   │                   │
     └───────────────────┴───────────────────┘
                         │
                         ▼
              Sanitizer & Safety Gate
```

- **Multi-Provider Adapter (`src/lib/ai/providers`)**: Handles Google Gemini, OpenAI, OpenRouter, and Anthropic. Supports user Bring-Your-Own-Key (BYOK) stored in browser `localStorage` as well as institutional central keys.
- **Resilient Fallback**: If external LLM APIs are unreachable, rate-limited, or misconfigured, the local engine seamlessly answers 100+ topics using `src/lib/ai/local-assistant.js` and `src/lib/ai/tajweed-canon.js`.
- **Tool Calling**: Server-side authorized tools (`src/lib/ai/tools`) for student searching, fee checks, and academic summaries.

---

## 8. Nur's Architecture and Capabilities

### 8.1 Single Unified Identity
- **❌ NOT a separate AI Teacher app**
- **❌ NOT a separate chatbot or detached product**
- **✅ AI Teacher is a core capability INSIDE Nur**
- Nur is the single, unified Quran learning companion across Rahmania Institute.
- Nur operates in two complementary modes:
  1. **Conversational Tutor Mode**: Answering Quranic questions, explaining Tajweed rules, giving student encouragement, responding to voice queries.
  2. **Interactive Teaching Mode**: Structured lessons, guided recitation, mistake detection, pronunciation correction, live demonstration, repetition, verification, and progress tracking.

### 8.2 The 6-Stage Pedagogical Loop
Nur implements the complete pedagogical teaching cycle:
```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE PEDAGOGICAL CYCLE                          │
│                                                                        │
│   [ 1. EXPLAIN ] ──────► Clarify the exact Tajweed / Makhraj rule      │
│         │                and why the student's articulation missed it. │
│         ▼                                                              │
│   [ 2. DEMONSTRATE ] ──► Play pristine recitation from authentic Qari  │
│         │                with vector/3D anatomical articulation guide. │
│         ▼                                                              │
│   [ 3. PRACTICE ] ─────► Student recites via hands-free mic;           │
│         │                waveform visualizer captures audio.           │
│         ▼                                                              │
│   [ 4. EVALUATE ] ─────► AI evaluator analyzes phonemes, Tajweed,     │
│         │                and word matching via /api/ai/nur-eval.       │
│         ▼                                                              │
│   [ 5. CORRECT ] ──────► Dynamic hints (Attempt 1, 2, 3) without       │
│         │                giving away the answer or infinite looping.   │
│         ▼                                                              │
│   [ 6. REPEAT ] ───────► Loop until student achieves passing score,    │
│                          then gracefully advance to next Ayah.         │
└────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Natural Neural Voice Engine (`/api/ai/tts`)
- Proxies Google Neural Bengali TTS with sentence chunking (under 170 characters) and MP3 buffer concatenation.
- High-fidelity human voice playback replacing browser robotic synthesizers.
- Integrated barge-in (interruption detection) and Web Audio gain ramp-down.
- Thorough text sanitizer converting percentages (e.g., "৮৮ শতাংশ") and cleaning formatting before speech synthesis.

### 8.5 Complete 30 Juz & 114 Surahs Mouth-to-Mouth Recitation Engine
- **Full Quran Coverage**: Unrestricted access to all 114 Surahs and 30 Juz via `ALL_SURAHS`, `JUZ_MAPPING`, and `getSurahData(surahNum)`.
- **Searchable Navigation Modal**: Live searching across Arabic, Bengali, English names, and Surah numbers; filtering by Juz 1-30, Makki, Madani, and Popular Surahs.
- **Persistent Reading & Memorization Resume**: Last read location (`surahNumber`, `ayahNumber`, `mode`) automatically preserved in `nurStorage` and `localStorage`, with one-click resume banner.

### 8.6 Tri-Modal Learning Architecture
1. **Learn Mode (পড়া ও মাশক)**: Deep Tajweed and articulation coaching. Qari recites $\rightarrow$ Ustad explains $\rightarrow$ Student practices $\rightarrow$ AI evaluates $\rightarrow$ tailored corrections.
2. **Memorize Mode (মুখস্থ ও হিফজ)**: Hifz memorization loop with "স্মৃতি পরীক্ষা" (Memory test with word hide/blur toggle), temporary peek preview, configurable loop repetitions (1x, 3x, 5x, 7x), and automatic Lokma slip detection.
3. **Revise Mode (মুরাযাআ / দাওর)**: Rapid passage revision across Ayahs with lightweight feedback to maximize revision speed and test retention.

### 8.7 Gated Voice Hand-Off & Echo Prevention
- **Echo-Free Hand-off**: While Nur or Qari speaks, student microphone capture is strictly muted/gated.
- **Safety Transition Buffer**: A 700ms `waiting_for_learner` state allows room audio reflections to decay before the microphone opens, preventing Nur from hearing its own voice.
- **State Machine**: `Speaking → Waiting for Learner → Listening → Analyzing → Giving Feedback`.
- **Honest Mistake Detection**: Recitations are evaluated rigorously without synthetic or inflated pass marks. Word-by-word status tags (correct, near, mistake, omitted) pinpoint exact pronunciation errors.

### 8.8 Duolingo-Style AI Quran Learning Engine (3-Star & Hearts Pedagogical Rules)
- **3-Star Performance Rating**:
  - **0 Mistakes**: ⭐⭐⭐ (3 Stars) — Perfect mastery.
  - **1 Mistake**: ⭐⭐ (2 Stars) — Good effort with minor slip.
  - **2+ Mistakes**: ⭐ (1 Star) — Completed with multiple attempts.
- **Strict Progression Invariant**:
  - No student can advance to Step N+1 without first completing Step N. Even with 1 Star (⭐), the student may advance, but uncompleted or skipped steps remain strictly locked.
- **Heart / Lives Mechanics**:
  - **Maximum Lives**: 5 Hearts (❤️).
  - **Mistake Deduction**: Giving an incorrect answer in an exercise or quiz immediately deducts 1 Life (`loseLife()`) with a heart lost sound effect.
  - **3-Star Reward**: Completing any lesson with a perfect 3-Star (⭐⭐⭐) score rewards the student with **+1 Heart (❤️)** (capped at 5).
  - **Passive 5-Hour Life Regeneration**: If lives drop below 5, 1 Heart automatically regenerates every 5 hours (`REGEN_INTERVAL_MS = 18,000,000 ms`), tracked via persistent timestamp.
- **Authentic Noorani Qaida Audio Engine**:
  - Huruf Mufradat letter audio strictly uses authentic Takhti 1 recordings (`Page1-1.m4a` to `Page1-29.m4a`) identical to `MakhrajVisualizer`.
- **Triumphant Ma Sha Allah Celebration**:
  - Completing any step triggers a joyful "مَا شَاءَ اللَّهُ (মাশাআল্লাহ!)" celebratory ribbon, animated sequential star popping with audio sparkle, and triumphant victory fanfare chords (`playMaShaAllahCelebration`) to maximize student engagement and enthusiasm.

### 8.9 Flawless & Authentic Qari Audio Standard (Zero Robotic TTS for Children's Quran Learning)
- **প্রতিটি উচ্চারণ ১০০% নিখুঁত, বিশুদ্ধ ও নির্ভুল হতে হবে**: প্রতিটি হরফ, হরকত, তানভীন ও যুক্তাক্ষরের অডিও খাঁটি মাখরাজ ও তাজবীদ অনুযায়ী সম্পূর্ণ ত্রুটিহীন হতে হবে।
- **রোবোটিক বা কৃত্রিম সিন্থেসাইজার সম্পূর্ণ নিষিদ্ধ**: শিশুদের কুরআন শিক্ষার ক্ষেত্রে কোনো ধরনের মেটালিক, রোবোটিক বা কৃত্রিম সিন্থেসাইজড ভয়েস দেওয়া যাবে না; যাতে শিশুরা বিভ্রান্ত না হয়ে শুরু থেকেই খাঁটি মানুষের মুখের বিশুদ্ধ উচ্চারণ শিখতে পারে।
- **খাঁটি ক্বারীর মিষ্টি সুরের সাথে সঙ্গতিপূর্ণ হওয়া আবশ্যক**: প্রতিটি পাঠের অডিও বিশ্বখ্যাত ক্বারী বা অভিজ্ঞ নূরানী কায়দা উস্তাদের মিষ্টি সুর, বিশুদ্ধ মাখরাজ ও স্পষ্ট উচ্চারণের সাথে হুবহু সামঞ্জস্যপূর্ণ হতে হবে।

---

## 9. Quran, Tajweed, Recitation, and Hifz Systems

- **Quran Reader (`src/features/quran/components/QuranReader.jsx`)**: Complete 114 Surahs, 30 Juz, Uthmani calligraphy, Bengali transliteration and translation.
- **Word-by-Word Breakdown**: Interactive modal detailing individual word grammar and Tajweed rules.
- **Qari Audio Registry (`src/lib/ai/qari-registry.js`)**: Authentic high-bitrate recitations from world-renowned Shuyookh:
  - Shaykh Mishary Rashid Alafasy
  - Shaykh Abdul Basit Abdul Samad
  - Shaykh Mahmoud Khalil Al-Husary
  - Shaykh Saad Al-Ghamdi
  - Shaykh Abdur-Rahman As-Sudais
  - Shaykh Muhammad Siddiq Al-Minshawi
- **Direct Ayah-to-Nur Bridge**: Clicking **[নূর শিক্ষক]** on any Ayah in the Quran Reader launches `NurTeachingEngine` focused directly on that verse.
- **Tajweed Canon (`src/lib/ai/tajweed-canon.js`)**: Comprehensive encoding of 17 articulation points (Makharij), Sifat Al-Huroof, Noon Saakin, Meem Saakin, Madd, and Qalqalah.
- **Interactive Anatomical Makhraj Visualizer (`src/features/ai/components/MakhrajVisualizer.jsx`)**:
  - Embedded directly inside Nur (drawer, lesson cards, and studio).
  - 5 Major Articulation Zones:
    1. **Al-Halq (Throat)**: Lowest (أ، هـ), Middle (ع، ح), Highest (غ، خ).
    2. **Al-Lisan (Tongue)**: Deepest back (ق، ك), Center (ج، ش، ي), Edges (ض), Tip (ل، ن، ر، ط، د، ت، ص، ز، س، ظ، ذ، ث).
    3. **Ash-Shafatan (Lips)**: Lower lip with upper teeth (ف), Both lips (م، ب، و).
    4. **Al-Khayshum (Nasal Passage)**: Mandatory 2-Harakat resonance for Ghunnah (نّ، مّ).
    5. **Al-Jawf (Oral Cavity)**: Open airflow for Madd letters (ا، و، ي).
  - Visual articulation point glow, airflow vectors, Bengali & English phonetic guidance.
- **Integration with Daily Hifz Tracking (`DailyLessonEntry.jsx`)**:
  - **Sabaq**: Today's new memorization page/Ayah.
  - **Sat Sabaq / Sabqi**: Recent 7 lessons revision.
  - **Amukta**: Cumulative older revision (minimum half to full Juz daily).
  - **Lokma**: Automatic count of teacher prompts and memory slips.
- **Advanced Hifz Assistant (`src/features/ai/components/AdvancedHifzAssistant.jsx`)**:
  - Real-time listening for memorization recitation.
  - Subtle prompt hints when student pauses or hesitates.
  - Sequence anomaly detection for skipped words or inverted Ayahs.

---

## 10. Mentor and Dashboard Functionality

- **Human-in-the-Loop Oversight (`TeacherAIReviewHub.jsx`)**:
  - Teachers inspect AI recitation evaluations, accuracy scores, and audio recordings.
  - Teachers possess override capability to approve, adjust, or mark recitations as needing re-examination.
- **Student Learning Dashboard (`StudentProfile.jsx`, `AIReadingSuggestions.jsx`)**:
  - Visual breakdown of memorization progress, daily attendance, and personalized Tajweed recommendations.
- **Institutional Analytics**:
  - Class-wide Tajweed deficiency heatmaps.
  - Automated detection of students falling behind on daily Amukta revision.

---

## 11. UI/UX Design System

- **Islamic Emerald & Warm Gold Theme**:
  - Deep rich dark background: `#07130e` / `#091a14`.
  - Emerald accents: `#0f766e` / `#059669`.
  - Warm desert gold: `#d97706` / `#f59e0b`.
- **Mobile-First Responsiveness**: Touch targets minimum **44px × 44px**. Waveforms and Quran text fluidly scale across viewports.
- **100% Functional Controls**: Every button, link, and toggle must execute real state or backend mutations. No mock or placeholder buttons.
- **Strict Prohibition of Sparkles**: Never use `Sparkles` icon from `lucide-react` or ✨ sparkle emojis anywhere. Use semantic icons: `Bot`, `Cpu`, `Zap`, `BookOpen`, `GraduationCap`, `Award`, `Volume2`.

---

## 12. Internationalization and RTL Rules

- **Supported Languages**: বাংলা (Bengali - Primary), English (Secondary), العربية (Arabic - Quran & Citations).
- **RTL Support**: Full right-to-left layout for Arabic Quranic verses using Amiri and Uthmani typography.
- **Dictionary Mapping**: Client-side dictionary in `src/lib/translations-data.js` and `translations.js`.
- **No Hardcoded UI Text**: All new user-facing strings must have corresponding translation keys or localized structures.

---

## 13. Security and Privacy Requirements

- **Zero-Tolerance Cross-Tenant Detection**: Any attempt to access data from another tenant triggers an immediate 403, automatic `CRITICAL` audit logging to `security_events`, and a high-priority alert.
- **Zero Credential Logging**: Never log passwords, tokens, API keys, or raw payment data.
- **Public vs. Private Tables**:
  - Public tables (`hero_slides`, `notices`, `branches`, `gallery`, `teachers`, `blogs`) maintain anonymous `SELECT` access.
  - Private tables (`student_fees`, `attendances`, `daily_lessons`, `hadiya`, `security_events`) strictly require authentication and organization isolation via Supabase RLS.
  - Never disable RLS.
- **Secrets Masking**: Sensitive keys in `app_settings` and `branches` must be masked before sending to the client.

---

## 14. Completed Features and Current Status

1. **High-Fidelity Neural Bengali Voice Engine**:
   - `/api/ai/tts` route with sentence chunking, MP3 concatenation, and caching.
   - Elimination of robotic browser TTS and distorted English phonetics.
2. **Nur Voice Ustad (`InteractiveVoiceTutor.jsx`)**:
   - Natural human Bengali audio responses for both guided lessons and open voice Q&A.
   - Non-repeating contextual feedback with 3-attempt progression (gentle tip $\rightarrow$ posture guide $\rightarrow$ graceful advance).
   - Silence handling preventing infinite failure loops.
   - Primary action button that properly completes recording and triggers evaluation.
3. **Nur Teaching Engine (`NurTeachingEngine.jsx`)**:
   - 6-step loop: Explain $\rightarrow$ Demonstrate $\rightarrow$ Practice $\rightarrow$ Evaluate $\rightarrow$ Correct $\rightarrow$ Repeat.
   - Support for custom Ayahs passed directly from the Quran Reader.
4. **Makhraj Visualizer (`MakhrajVisualizer.jsx`)**:
   - 17 articulation points with interactive 2D/3D anatomy and phonetic guidance.
5. **Advanced Hifz Assistant (`AdvancedHifzAssistant.jsx`)**:
   - Real-time listening, hint prompts, and Sabaq/Sat Sabaq/Amukta integration.
6. **AIPracticeGenerator & AIOralExamChamber**:
   - Weakness-focused drill generator and formal oral exam grading chamber.
7. **Complete Quran Reader (`QuranReader.jsx`)**:
   - 114 Surahs, multi-Qari audio player, word-by-word modal, and direct Nur teacher launch.
8. **Enterprise Multi-Tenant SaaS Isolation**:
   - Host domain mapping, white-label configurations, security telemetry, and 5-point gate.
9. **Biometric Attendance Integration**:
   - Live synchronization daemon and device ingestion endpoints operational.
10. **Dedicated Live Voice Quran Classroom (`/quran-tutor/live-class`)**:
    - Full-screen majestic Islamic sanctuary experience unconstrained by sidebars.
    - Dual-mode `LiveVoiceQuranClass` (full-page immersive sanctuary vs. responsive compact mode).
    - Extra-large golden Arabic typography (`font-amiri` text-6xl/7xl) with drop shadows and Harakat clarity.
    - Dynamic pulsing audio visualizer aura with live multi-bar frequency reactivity.
    - Web Audio acoustic chime synthesizers (`playChime("start")`, `playChime("success")`).
    - Hands-free keyboard control shortcuts (`Space` to record, `Enter` to evaluate, `Arrow` keys for Ayah navigation, `R` to repeat).
    - Shaykh recitation playback speed adjustments (`0.75x`, `1.0x`, `1.25x`).
    - Direct navigation hooks from AI Quran Tutor landing page, Studio, Nur banner, and global navigation menu.

---

## 15. Remaining Development Roadmap

### In Progress
- IndexedDB offline audio caching for continuous PWA recitation without internet access.
- Enhanced speech-to-text acoustic confidence calibration for young children's voices.

### Planned Features
- Multi-lingual spoken tutor personas in English and Urdu.
- Native mobile PWA packaging with background audio playback.
- Automated daily WhatsApp progress reports for parents.

---

## 16. Coding Conventions and Testing Requirements

### Verification Commands
```bash
# 1. Typecheck the repository (zero error tolerance)
npm run typecheck

# 2. Verify linting rules
npm run lint

# 3. Check git status
git status
```

### Pre-Deployment Regression Checklist
- [x] Base44 is completely absent from all active code.
- [x] Supabase authentication and RLS remain active.
- [x] Biometric attendance synchronization remains operational.
- [x] AI Teacher is fully integrated inside Nur, not split into an external app.
- [x] All UI controls are 100% functional with real state.
- [x] Zero sparkles icons or emojis used across all interfaces.
- [x] Typecheck passes with 0 errors.
- [x] Linter passes with 0 errors.

---

## 17. Instructions for Future AI Coding Agents

1. **Preserve the Existing Backend**: Never replace Supabase, Next.js 16 App Router, or introduce Base44. Any suggestion to use Base44 is strictly prohibited.
2. **AI Teacher Stays Inside Nur**: Never create a separate AI Teacher application or disconnected chatbot. All Quran learning intelligence lives inside Nur.
3. **Preserve Biometric Attendance**: The biometric daemon, device endpoints, and live attendance tracking are permanent invariants.
4. **Manual Supabase SQL Execution**: Never assume migrations execute remotely on their own. When creating new migrations or RPCs, explicitly provide the SQL code to the user to execute manually in the Supabase SQL Editor.
5. **No Sparkles Policy**: Never use `Sparkles` icon from `lucide-react` or ✨ sparkle emojis. Use semantic icons: `Bot`, `Cpu`, `Zap`, `BookOpen`, `GraduationCap`, `Award`, `Volume2`.
6. **100% Functional UI Controls**: Every button, link, and interactive element must execute real state or backend logic. Never build placeholder or mock buttons.
7. **Zero-Trust Multi-Tenancy**: Always resolve tenant context from verified server-side JWT or validated Host mapping. Never trust client-supplied tenant IDs.
8. **Verification Gate**: Before marking any task complete, always run `npm run typecheck` and `npm run lint` and verify that both exit with code 0.

---

*This document is the definitive operational baseline and Single Source of Truth (SSOT) for all developers and AI agents working on Rahmania Institute.*
