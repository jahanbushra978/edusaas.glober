# Agent Guidelines & System Invariants

## Database and Supabase
- **Manual SQL Execution Required**: If you ever write or create a new Supabase migration, database function (RPC), or any SQL that needs to be applied to the database, you MUST immediately notify the user. The local `npx supabase db push` command will not work automatically. You must provide the user with the SQL code or tell them which migration file to copy from, and instruct them to run it manually in the Supabase SQL Editor.

## Absolute Architectural Rules
- **Base44 Is Strictly Prohibited**: Base44 is NOT part of this architecture. Never install, import, or introduce Base44. The true backend is Next.js 16 + Supabase PostgreSQL + Multi-provider AI adapters (`src/lib/ai/providers`).
- **Preserve Existing Backend**: Always reuse and cleanly extend the existing Supabase database, authentication, and Next.js API endpoints. Never rewrite or replace working systems.
- **Enterprise Multi-Tenant SaaS & Strict Tenant Isolation**:
  - The platform hosts multiple organizations (Madrasas, Schools, Businesses).
  - Tenant isolation MUST be enforced on the server/database layer (Supabase RLS & authenticated session resolution). Never trust client-supplied tenant IDs.
  - Default: DENY unless explicitly authorized. Tenant A must never access Tenant B's data.
- **Admin Hierarchy & 5-Point Security Gate**:
  - Super Admin (`/platform-console`, `platform_owners`) is platform-level.
  - Tenant Admin (`/admin`, `organizations`) is scoped strictly to their own organization.
  - Every sensitive operation must answer: (1) Who is the user? (2) Which tenant? (3) What role? (4) Authorized permission? (5) Verified tenant ownership?
- **NurAI Quran Tutor — Integrated AI Teacher Inside Nur**:
  - Master Specification v1.0 Frozen Baseline in [`docs/AI_QURAN_TUTOR_MASTER_SPECIFICATION_V1.0.md`](file:///e:/aa/rahmanialust/docs/AI_QURAN_TUTOR_MASTER_SPECIFICATION_V1.0.md).
  - AI Teacher is NOT a separate app, NOT a separate bot, and NOT a separate product.
  - All teaching intelligence lives INSIDE "Nur" (Conversational Tutor + Interactive Teaching Mode + Dedicated Live Voice Classroom at `/quran-tutor/live-class`).
  - Implements the pedagogical loop: Explain → Demonstrate → Practice → Evaluate → Correct → Repeat.
  - Dedicated Live Voice Quran Classroom provides an unconstrained, full-screen Islamic sanctuary with 114 Surahs, 30 Juz, Tri-modal learning (Learn, Memorize with word-hiding memory test, Revise), grand Arabic typography, audio visualizer aura, and echo-free gated voice hand-off.
  - Makhraj Visualizer (throat, tongue, lips, mouth articulation points) is integrated directly inside Nur.
  - Deeply connects with existing Hifz tracking (`DailyLessonEntry.jsx`: Sabaq, Sat Sabaq, Amukta, Lokma), Student Profile, and Quran Reader.
  - **Duolingo-Style AI Quran Learning (3-Star & Hearts System)**:
    - 3-Star Rating: 0 mistakes = ⭐⭐⭐ (3 stars), 1 mistake = ⭐⭐ (2 stars), 2+ mistakes = ⭐ (1 star).
    - Strict progression: Step N+1 cannot be opened unless Step N is completed (even with 1 star, progression is granted, but skipping uncompleted steps is strictly blocked).
    - Lives/Hearts: Max 5. Mistakes deduct 1 Life (`loseLife()`). Achieving 3 stars rewards +1 Heart (`gainLife()`). 1 Heart regenerates every 5 hours passively (`REGEN_INTERVAL_MS = 18,000,000 ms`).
    - Authentic Huruf Mufradat: Takhti 1 audio (`Page1-1.m4a` to `Page1-29.m4a`) from `nooresahar/noorani` matching `MakhrajVisualizer` exactly.
    - Celebration: "ما شاء الله! (মাশাআল্লাহ!)" triumphant victory fanfare (`playMaShaAllahCelebration()`) and animated star pops on passing a step.
- **Flawless & Authentic Qari Audio Standard (Zero Robotic TTS for Children's Quran Learning)**:
  - প্রতিটি উচ্চারণ শতভাগ সঠিক, নিখুঁত এবং সম্পূর্ণ নির্ভুল হতে হবে।
  - কোনো ধরনের রোবোটিক, মেটালিক বা কৃত্রিম সিন্থেসাইজার সাউন্ড বাজানো যাবে না, যাতে শিশুরা বিভ্রান্ত না হয়ে খাঁটি মাখরাজ ও সুর শিখতে পারে।
  - সমস্ত হরফ, হরকত ও পাঠের অডিও খাঁটি ও প্রখ্যাত ক্বারীর সুর ও উচ্চারণের সাথে সামঞ্জস্যপূর্ণ এবং স্পষ্ট হতে হবে।
- **Preserve Biometric Attendance**:
  - `biometric hajirar jeno kaj kore seta okkhono rekhe kaj korte hobe`.
  - The biometric bridge daemon, attendance APIs, and live attendance tracking must remain fully operational.
- **100% Functional UI Controls (No Fake Buttons)**:
  - Every UI button, link, toggle, menu item, or action must be 100% functional with real state and backend handling. Never build UI placeholder buttons.
- **Strict Prohibition — No Sparkles / Magic Star Icons**:
  - Never use `Sparkles` icon from `lucide-react` or ✨ sparkle emojis. Use semantic icons: `Bot`, `Cpu`, `Zap`, `BookOpen`, `GraduationCap`, `Award`, `Volume2`.
- **Public Website & RLS Protection**:
  - Public tables (`hero_slides`, `notices`, `branches`, `gallery`, `teachers`, `blogs`, etc.) must maintain anonymous SELECT access.
  - Private tables (`student_fees`, `attendances`, `daily_lessons`, `hadiya`, etc.) must strictly require authentication and tenant/branch isolation.
  - Never disable RLS.
- **Enterprise Security Center & Zero-Tolerance Cross-Tenant Detection**:
  - All anomalies logged to `security_events` with 4-tier severity (CRITICAL, HIGH, MEDIUM, LOW).
  - Cross-tenant access triggers immediate 403, automatic CRITICAL audit logging, and high-priority alert.
  - Zero credential logging: never log passwords, tokens, API keys, or raw payment data.
- **Commerce & Financial Accounting Invariants**:
  - Strict metric separation: $\text{Revenue} \neq \text{Cash Collected} \neq \text{Gross Profit} \neq \text{Net Profit}$.
  - Weighted Average Costing (WAC) for inventory; sales consume stock at current cost basis without modifying WAC.
  - Order items and fee receipts record immutable historical cost, price, and margin snapshots.
- **The Four Security Clarifications (Mandatory Enforcement)**:
  - (1) *Server-Side Tenant Resolution*: Verified session JWT or validated Host domain mapping only; client tenant IDs untrusted.
  - (2) *Insecure Public Table Exposure Elimination*: Public tables read-only for published content; private tables strictly RBAC protected; secrets in `app_settings`/`branches` masked.
  - (3) *Unknown Domain 404 Fallback*: Unrecognized hostnames MUST return 404 fallback rather than leaking default tenant data.
  - (4) *Immutable Audit Logs*: `platform_audit_logs` & `security_events` are write-once, client-denied (`USING (false)`), service-role written with zero credential logging.

*For complete architectural specifications, data flows, and code rules, refer to [AGENTS.md](file:///E:/aa/rahmanialust/AGENTS.md) in the workspace root.*
