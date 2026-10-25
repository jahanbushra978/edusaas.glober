# Rahmania Institute | Engineering & Architecture Guide

**Authoritative project guide** for the Rahmania ERP, multi-tenant SaaS platform, biometric attendance, Nur AI, commerce, and accounting.

## দ্রুত শুরু (Quick Start)

যেকোনো কাজ শুরুর আগে এই নির্দেশনাগুলো অনুসরণ করুন:

1. **কাজের পরিধি বুঝুন** — ব্যবহারকারী কী চান, কোন portal/module/file জড়িত, এবং প্রত্যাশিত ফল কী তা নির্ধারণ করুন।
2. **এই গাইড ও কাছের implementation পড়ুন** — প্রাসঙ্গিক invariant, API, database schema, test, এবং বিদ্যমান pattern খুঁজে নিন।
3. **নিরাপত্তা যাচাই করুন** — authentication, tenant/branch scope, role/permission, resource ownership, এবং client input যাচাই করুন।
4. **ছোট পরিবর্তন করুন** — বিদ্যমান architecture পুনর্ব্যবহার করুন; duplicate implementation বা সম্পর্কহীন cleanup এড়িয়ে চলুন।
5. **প্রাসঙ্গিকভাবে verify করুন** — পরিবর্তিত অংশের targeted test আগে চালান; এরপর প্রযোজ্য typecheck, lint, build, security, এবং portal regression check চালান।
6. **শেষে জানান** — কী বদলেছে, কী পরীক্ষা হয়েছে, কী বাকি, এবং SQL manual apply করতে হবে কি না স্পষ্ট করুন।

> **দ্বন্দ্ব হলে:** security, tenant isolation, data integrity, এবং biometric invariants আগে মানুন। কোনো অনুরোধ এসব ভাঙতে বললে কোড পরিবর্তনের আগে conflict ব্যাখ্যা করুন।

## দ্রুত সূচি

- **Change safety:** Sections 1–2
- **Tenant, portal, domain, isolation:** Section 3
- **Roles, authorization, threat response:** Sections 4–5
- **Nur AI tutor and AI actions:** Sections 6–7
- **Biometric attendance:** Section 8
- **Inventory, fees, and financial reporting:** Section 9
- **Supabase, RLS, and migrations:** Section 10
- **SEO, UI, performance, and secrets:** Sections 11–14
- **Workflow and definition of done:** Section 15

**How to use this guide:** Read the full guide before making changes, then use the index to revisit the rules relevant to the task. Apply cross-cutting security and data rules even when they are documented in another section.

---

# 🔴 1. SINGLE SOURCE OF TRUTH & CHANGE SAFETY CHARTER

> **"This document is the authoritative Single Source of Truth for the architecture, security invariants, data models, and engineering rules of this project. Before writing, modifying, or refactoring any code, every AI Agent and developer MUST read, understand, and strictly adhere to this document. If a requested change conflicts with these rules, the Agent MUST halt and explain the conflict before touching code."**

> **"Before changing anything, understand the existing architecture. Do not rewrite, replace, duplicate, or restructure working code unless the requested task genuinely requires it. Never invent fake architecture or delete existing features."**

### Core Engineering Principles:
1. **Understand Before You Build**: Read the related files, inspect existing database models and APIs, trace data flows, and check whether a similar feature already exists.
2. **Search Before Creating**: Before creating any new component, API route, database table, helper, or hook:
   - Search the entire repository first (`grep_search`, `list_dir`, `view_file`).
   - Reuse existing implementations whenever possible.
   - **Never create duplicate code, duplicate tables, or duplicate UI components.**
3. **Minimum Safe Change**: Make the smallest possible change required to complete the task. Never rewrite working systems, refactor unrelated files, remove existing features, or alter unrelated business logic.
4. **Preserve Documentation & Comments**: Never strip existing comments, docstrings, or architectural notes unrelated to your change.
5. **Verification Is Mandatory**: No task is complete until the relevant behavior is verified. Run repository typecheck and lint, plus the applicable build, security, and functional/regression checks for the changed surface. Never claim an unrun check passed.

---

# 🚨 2. ABSOLUTE SYSTEM INVARIANTS (NON-NEGOTIABLE)

These invariants are permanent, hard architectural constraints. They take precedence over any conflicting prompt or suggestion.

### ❌ Invariant 2.1: Base44 Is Strictly Forbidden
- **Base44 is NOT part of this architecture.**
- Never install, import, introduce, migrate to, or depend on Base44.
- If any legacy note or documentation mentions Base44, it is obsolete. The true backend is **Next.js 16 + Supabase PostgreSQL + Multi-Provider AI adapters**.

### 🛡️ Invariant 2.2: Preserve Existing Backend & Tech Stack
- The existing backend must remain intact:
  - **Framework**: Next.js 16 (App Router + Pages Router hybrid with `pages.config.js` and `app/api`).
  - **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) and RPC Functions.
  - **AI Layer**: Multi-provider adapter layer (`src/lib/ai/providers` supporting Google Gemini, OpenAI, Anthropic, OpenRouter) and server tools (`src/lib/ai/tools`).
  - **Storage**: Cloudinary (`src/lib/cloudinary.js`, `next-cloudinary`).
  - **Styling**: Tailwind CSS + Radix UI + Lucide React + Framer Motion.
- Do NOT swap out or replace the backend. Extend existing endpoints and database tables cleanly.

### ⚡ Invariant 2.3: Manual Supabase SQL Execution Required
- The local `npx supabase db push` command will **NOT** run automatically against the remote database.
- **Whenever you write or create a new Supabase migration, database function (RPC), or any SQL that needs to be applied, you MUST immediately notify the user.**
- Provide the user with the exact SQL code or specify which file in `supabase/migrations/` to copy from, and instruct them to execute it manually in the Supabase SQL Editor.

### 🕒 Invariant 2.4: Biometric Attendance Must Always Be Preserved
- `biometric hajirar jeno kaj kore seta okkhono rekhe kaj korte hobe`
- The biometric attendance bridge (`biometric-bridge/`), attendance APIs (`app/api/attendance/device`, `/manage`, `/device-sync`), and live attendance tracking (`LiveAttendancePage.jsx`, `attendances`, `teacher_attendance`, `attendance_sync_logs`) must **always remain fully operational and intact**.

### 🔘 Invariant 2.5: 100% Functional UI Controls (No Dead / Mock Buttons)
- **Every UI button, link, menu item, toggle, dropdown, upload control, search, filter, or action MUST be 100% functional.**
- Never create UI-only mock buttons or decorative placeholder actions.
- Add Product/Student must genuinely persist to DB; Delete must genuinely delete with authorization; Search must execute real DB queries; Language toggle must dynamically translate the UI.
- Never build a UI button and leave the backend functionality "for later".
- Adhere to the workflow: `Requirement → Existing Code Audit → Backend/Security → Database → UI → Functional Verification`.

### 🚫 Invariant 2.6: Strict Prohibition — No Sparkles / Magic Star Icons
- **Never use `Sparkles` icon (from `lucide-react`) or magic star / ✨ sparkle icons or emojis anywhere in the UI (Platform Admin, Tenant Admin, or Storefront/Public).**
- Instead of `Sparkles`, use clear, professional, semantic business and educational icons:
  - For AI features: use `Bot`, `Cpu`, or `Zap`
  - For Quran & Learning: use `BookOpen`, `GraduationCap`, `Award`, `Volume2`, `Mic`
  - For Offers/Promotions/Discounts: use `Tag`, `Percent`, `Flame`, or `BadgePercent`
  - For Upgrades/Plans: use `Zap`, `Crown`, or `TrendingUp`
  - For CMS / Landing / Home: use `Layers`, `Globe`, or `Layout`
  - For SEO: use `Search`, `Globe`, or `BarChart2`
  - For Badges / Status: use standard text badges or semantic indicators
  - For Settings / Operations: use `Settings`, `ShieldCheck`, `CheckCircle2`

### 📐 Invariant 2.7: File Size & Modularity
- No source file may exceed **1,100 lines**.
- The standard target is **300–400 lines**, strictly keeping modular files below **500 lines**.
- Do not intentionally approach the maximum limit. Prefer small, focused, reusable modules with a single responsibility.

---

# 🏢 3. MULTI-TENANT ARCHITECTURE & THREE DISTINCT EXPERIENCES

The platform is an **Enterprise Multi-Tenant SaaS Platform**. It is not a single-school system. Multiple independent organizations (Madrasas, Schools, Academies, E-Commerce Shops, Businesses) operate as separate tenants on the same infrastructure.

```text
                                SaaS PLATFORM ROOT
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
  MERCHANT / SCHOOL ADMIN        STOREFRONT / PUBLIC PORTAL         PLATFORM IT ADMIN
(/admin or /store/[slug]/admin)   (/store/[slug] or Custom Domain)    (/platform-console)
• Business/Madrasa Control       • 100% White-Labeled Storefront    • Super Admin Control
• Scoped Students/Products       • Custom Domain Dynamic SEO        • Organization Provisioning
• Scoped Biometric Attendance    • Public Notice / Catalog / Cart   • Security Command Center
• Scoped Accounting & AI         • Location Map & Contact Section   • Direct Cloudinary Manager
• Scoped Theme / Bilingual i18n  • High-Speed Tenant-Safe Cache     • Platform Audit Logs
```

### 3.1 The Three Distinct Experiences
1. **Tenant / Merchant Admin (`/admin` or `/store/[slug]/admin`)**:
   - Used by school administrators, madrasa principals, or merchant store owners and authorized staff.
   - Core Modules: Students/Products, Teachers/Staff, Attendance & Biometrics, Orders/Fees, Accounting, Inventory, Marketing, SEO, Settings.
   - Database-driven Custom Theme (Logo, Favicon, Primary Color, Sidebar Color, Light/Dark Mode).
   - Bilingual i18n (`বাংলা | English | العربية`) in header.
   - **NEVER exposes IT Admin links, other merchants/schools, or tenant switchers.**
2. **Storefront / Public Portal (`/` or `/store/[slug]` or Custom Domain)**:
   - The public-facing site for parents, students, or retail customers.
   - Configuration-driven sections without separate hardcoded codebases for each tenant.
   - 100% White-labeled on custom domains (`rahmaniainstitute.org`, `electromartbd.com`).
   - Displays tenant-isolated location map, contact details, public notices, and catalogs.
3. **Platform IT Admin (`/platform-console` / `/platform`)**:
   - Private control system reserved exclusively for platform owners (`platform_owners`).
   - Controls tenant organizations, subscriptions, domain verification, and Super Admin module flags.
   - Houses the Central Security Intelligence Command Center and Direct Cloudinary Media Manager.
   - Merchants/Schools must NEVER see, access, or know of the Platform IT Admin.

### 3.2 Organization Data Models
- **`organizations` table**: Holds tenant identity (`id`, `name`, `slug`, `domain`, `subdomain`, `status`, `subscription_plan`, `theme_config`, `modules_config`).
  - Flagship Tenant ID: `'00000000-0000-0000-0000-000000000001'` (Rahmania Institute).
- **`domain_mappings` / `store_domains` table**: Multi-domain mapping with SSL lifecycle, custom domain verification, and primary domain flags.
- **`white_label_configs` table**: Tenant-specific branding, browser titles, logos, favicon, and theme colors.

### 3.3 Strict Tenant Isolation Security Boundary
- **Tenant isolation MUST be enforced at the server and database layer, NEVER only through frontend filtering.**
- A `tenantId` or `organizationId` supplied directly by the client MUST NEVER be trusted.
- The tenant context MUST be resolved server-side from:
  1. The authenticated session JWT (`authContext.user.organization_id`), OR
  2. The validated custom-domain mapping resolved by `getTenantContext()` via `next/headers` `host`.
- **Default Policy: DENY unless explicitly authorized.**
- Tenant A must never read, modify, delete, or reference Tenant B's:
  - students, teachers, classes, and exams
  - products, variants, orders, and customer lists
  - attendance and biometric logs
  - fees, salaries, hadiya, inventory, and expenses
  - notices, blogs, gallery items, and Cloudinary media uploads
  - private AI conversation logs and action records
  - configuration, domain mappings, and administrative settings

### 3.4 Dynamic Domain Resolution & White-Labeling
Incoming hostnames (`Host` header) are dynamically resolved to identify the active tenant:

```text
Incoming Request (electromartbd.com or rahmaniainstitute.org)
      ↓
Host Resolver / Middleware (src/lib/tenant/tenantContext.js)
      ↓
Domain Lookup (domain_mappings / organizations)
      ↓
Active Verified Tenant Context (organization_id, modules, theme)
      ↓
White-Labeled Storefront + Custom Domain SEO & Dynamic Sitemap
```

1. **White-Label Requirement**: Visitors see ONLY the active tenant's branding. No SaaS platform branding, tenant switchers, or internal IDs.
2. **Dynamic Sitemap**: `https://<custom-domain>/sitemap.xml` contains ONLY that tenant's indexable canonical URLs.
3. **Host-Aware Robots**: `https://<custom-domain>/robots.txt` points search engines directly to `https://<custom-domain>/sitemap.xml`.
4. **Canonical URL Strategy**: Canonical tags on custom domains output `https://<custom-domain>/...` (never platform subdomains).
5. **Domain Uniqueness**: The same custom domain can never be assigned to two different tenants.
6. **Fallback**: If no custom domain matches, the system safely falls back to the flagship default tenant (`DEFAULT_TENANT_ID`).

### 3.5 Tenant Storefront Map & Location System
- Every tenant has configurable business/campus address, Google Maps location URL, Latitude/Longitude, map embed code, and service area.
- The Storefront contact section dynamically renders that tenant's interactive location map.
- **Tenant Isolation**: Tenant A's map/location must NEVER be displayed on Tenant B's storefront.

### 3.6 Cloudinary Media Upload Engine & Tenant Isolation
- Direct Cloudinary image/video upload from Platform IT Admin (`/platform-console`) and Tenant Admin (`/admin`).
- Real-time upload progress, preview, success/error handling with automatic secure URL/resource ID DB saving (no manual URL pasting).
- **Cloudinary Media Tenant Isolation**: Media files are organized into tenant-scoped folders (`tenants/{organization_id}/...`). Tenant A cannot view, edit, or delete Tenant B's media.
- Delete/replace operations require server-side authorization.

### 3.7 Tenant-Safe Caching & Performance
- All caching, CDN, Next.js cache (`revalidateTag`, `unstable_cache`), server cache, and domain-based rendering mechanisms must be strictly tenant-aware.
- **Never allow cached data from Tenant A to be served to Tenant B.**
- All major tenant-owned tables must use appropriate indexes, composite indexes (`organization_id`, `created_at`), server-side pagination, and efficient queries. Never load entire large tables into memory.

### 3.8 The 5 Mandatory Tenant Isolation Test Gates
Before shipping any tenant-related feature, verify all 5 test scenarios:
- **Scenario A (Cross-Tenant Access)**: Tenant A user attempts to fetch or modify Tenant B data via API or direct query → **DENIED (403 Forbidden / Empty result via RLS)**.
- **Scenario B (Admin Panel Isolation)**: Tenant A administrator attempts to access Tenant B admin route → **DENIED**.
- **Scenario C (Privilege Escalation)**: Tenant user attempts to access Super Admin platform console (`/platform-console`) → **DENIED**.
- **Scenario D (Unauthenticated Intrusion)**: Guest visitor attempts to access private tenant data (fees, salaries, attendance) → **DENIED**.
- **Scenario E (Client Tampering)**: User modifies `organization_id` or `branch_id` in the JSON payload or URL query → **DENIED (Server strictly uses verified session identity)**.

---

# 👑 4. ADMINISTRATIVE HIERARCHY & THE 5-POINT SECURITY GATE

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   PLATFORM LEVEL: SUPER ADMIN                          │
│  Route: /platform-console | Table: platform_owners | Cookie: edu_...   │
│  Capabilities: Organizations, Plans, Modules, Health, Threat Center    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              ORGANIZATION LEVEL: TENANT / SCHOOL ADMIN                 │
│  Route: /admin | Scoped to verified organization_id                    │
│  Capabilities: Students/Products, Staff, Fees, Attendance, CMS         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               OPERATIONAL LEVEL: ROLE-SPECIFIC PORTALS                 │
│  • Teacher Portal (/teacher): Daily lessons, Hifz entry, attendance    │
│  • Student Portal (/student): Profile, reading logs, fee receipts     │
│  • Staff / Accountant: Billing, salary profiles, expense vouchers      │
│  • Public Visitor (/): Homepage, notices, admissions, courses, store   │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Platform Super Admin (`/platform-console`)
- Responsible for managing the overall SaaS platform.
- Authenticated via `platform_owners` table with bcrypt password hashing and HMAC-signed session cookies (`PLATFORM_SESSION_COOKIE = "edu_platform_session"`).
- Super Admin operations require explicit audit logging. Never create hidden backdoors.

### 4.2 Tenant / Organization Admin (`/admin`)
- Scoped strictly to verified `organization_id`.
- Tenant administrators cannot see other tenants or access the platform-console.

### 4.3 Operational Roles
- **Teacher**: Scoped to assigned branch, class, and subjects.
- **Student**: Scoped exclusively to their own student record (`student_id`).
- **Staff / Accountant**: Scoped to billing, inventory, and expense ledgers.
- **Public Visitor**: Read-only access to published public website data.

### 4.4 The Mandatory 5-Point Security Gate
Every sensitive server action, API route, and AI tool execution must verify:
1. **Who is the user?** (Authenticated session resolved from server-side JWT/cookie).
2. **Which organization/tenant does the user belong to?** (Resolved from authoritative DB record).
3. **What role does the user possess?** (`platform_owner`, `admin`, `teacher`, `student`, `staff`).
4. **Does that role have permission for this action?** (`has_permission(module, action)`).
5. **Is the target resource actually owned by that tenant?** (`resource.organization_id === session.organization_id`).

If any check fails, immediately abort with `403 Forbidden` and log a security event.

### 4.5 Sensitive Endpoint Protection & Rate Limiting
Apply strict rate limiting (`rate-limiter.js`) and validation to sensitive endpoints:
- Authentication & Login (`/api/auth/login`, `/api/platform/auth`)
- OTP & Password Reset
- Public Checkout & Admissions
- Cloudinary Uploads & File Management
- Domain Verification & DNS Lookups
- Administrative & Financial Mutation APIs

---

# 🛡️ 5. ENTERPRISE SECURITY CENTER & ATTACK DETECTION ARCHITECTURE

The platform implements a centralized, multi-tenant aware **Security Intelligence & Threat Detection Engine**. Every layer of the stack (Cloudflare, Next.js Middleware, Authentication, Tenant Isolation, API actions, Checkout, Media uploads) continuously streams telemetry into a structured `security_events` system.

### 5.1 Dedicated `security_events` Engine & Zero Credential Logging
All security telemetry is recorded in the `security_events` table:
- Captured attributes: `timestamp`, `severity`, `status`, `user_id`, `organization_id`, `ip_address`, `user_agent`, `endpoint`, `method`, `resource_type`, `resource_id`, `action`, `success`, `block_reason`, `correlation_id`, `source`, `resolution_note`, `resolved_by`, `resolved_at`.
- **Absolute Credential Safety**: Passwords, plaintext hashes, session tokens, JWTs, API keys, database secrets, or credit card info MUST NEVER be logged.

### 5.2 Strict 4-Tier Severity Model
Every detected anomaly is classified into a 4-tier severity model:
- **CRITICAL**: Confirmed cross-tenant access attempts (`CROSS_TENANT_ACCESS_ATTEMPT`), privilege escalation, SQL injection probing, admin account takeover indicators.
- **HIGH**: Brute-force lockouts (`ACCOUNT_LOCKED`, `LOGIN_BLOCKED`), repeated unauthorized API probing, checkout abuse, media upload flood.
- **MEDIUM**: Rate-limit triggers (`RATE_LIMIT_TRIGGERED`), repeated 401/403 errors, suspicious request velocity.
- **LOW**: Single isolated `LOGIN_FAILED`, routine blocked benign queries.

### 5.3 Multi-Signal Contextual Risk Scoring
Risk evaluation must never rely solely on a static IP (to avoid penalizing legitimate users behind shared corporate NATs, mobile carrier CGNAT, or campus Wi-Fi). Risk is calculated across:
$$\text{Threat Score} = f(\text{Account Context}, \text{IP Reputation}, \text{Device/User-Agent Signal}, \text{Action Velocity}, \text{Event Severity})$$

### 5.4 Centralized Security Intelligence Command Center (`/platform-console` → Security)
Platform Super Admin possesses a dedicated Security Command Center:
- **Active Threat Overview**: Real-time counters for Open Critical & High threats, Blocked IPs, Locked Accounts, and 24h attack trend.
- **Filterable Event Telemetry**: Searchable by severity, event type, status (`OPEN`, `INVESTIGATING`, `RESOLVED`), organization, user, and date range.
- **Deep Investigation Modal**: Inspects exact attacker IP, target endpoint, attempted action, block reason, and historical attack patterns.
- **Edge Posture**: Displays WAF and edge protection metrics.

### 5.5 Zero-Tolerance Cross-Tenant Detection
Any attempt by a user authenticated under Tenant A to read, mutate, delete, export, or access data belonging to Tenant B triggers:
1. Immediate request abortion (`403 Forbidden`).
2. Automatic `CROSS_TENANT_ACCESS_ATTEMPT` logging with `CRITICAL` severity.
3. High-priority platform security alert.

### 5.6 Platform Admin Security Response Tools
From the Security Center, authorized platform administrators can execute server-side verified response actions:
- `lockAccountAction(userId)` / `unlockAccountAction(userId)`
- `revokeUserSessionsAction(userId)`
- `resolveSecurityEventAction(eventId, resolutionNote)`
All response actions require Super Admin re-authorization and generate immutable audit entries.

### 5.7 The Four Security Clarifications (Mandatory Enforcement)
These four security clarifications are permanently locked into the system architecture:
1. **Clarification 1 (Zero-Trust Server-Side Tenant Resolution)**:
   - Tenant context MUST be derived strictly on the server from the verified session JWT (`authContext.user.organization_id`) or validated `Host` domain mapping via `getTenantContext()`.
   - Any client-supplied `tenantId`, `organization_id`, or `branch_id` in request headers, URL queries, or JSON payloads is untrusted and ignored.
2. **Clarification 2 (Public Table Exposure Elimination & Secret Masking)**:
   - Public tables (`hero_slides`, `notices`, `events`, `gallery`, `courses`, `blogs`) permit anonymous SELECT only for published/active rows.
   - Sensitive tables (`students`, `student_fees`, `attendances`, `teacher_attendance`, `daily_lessons`, `hadiya`, `expenses`, `boarding_daily_reports`, `security_events`) strictly require authenticated tenant/branch RBAC.
   - Tables containing in-row secrets (`app_settings`, `branches`) must strictly filter out passwords, JWT secrets, and API keys from public SELECT policies and public RPC functions (`get_home_page_data`).
3. **Clarification 3 (Unknown Domain 404 Fallback)**:
   - When a request arrives with an unrecognized domain (not localhost, not default flagship domains, and not found in active `organizations`), the server MUST return a strict 404 fallback (Not Found) rather than silently serving or leaking default tenant data.
4. **Clarification 4 (Immutable Audit Logging & Service-Role Isolation)**:
   - Audit logging tables (`platform_audit_logs`, `security_events`, `ai_action_logs`) are strictly write-once and tamper-proof.
   - Client-side direct access is denied (`FOR ALL USING (false)`). Writes occur solely via server-side service role.
   - Zero credential logging: passwords, plaintext tokens, secret keys, and raw credit/payment info are NEVER logged.

---

# 🤖 6. NurAI QURAN TUTOR — INTEGRATED AI TEACHER SPECIFICATION

> **Master Specification Baseline**: All 14 expanded capabilities, information architecture, ER diagrams, API contracts, and M1–M12 development milestones are strictly defined and frozen in [`docs/AI_QURAN_TUTOR_MASTER_SPECIFICATION_V1.0.md`](file:///e:/aa/rahmanialust/docs/AI_QURAN_TUTOR_MASTER_SPECIFICATION_V1.0.md). This document serves as the permanent Single Source of Truth (SSOT).

## 6.1 Single Product Identity
- **❌ NOT a separate AI Teacher app**
- **❌ NOT a separate AI Teacher product or dashboard**
- **❌ NOT a detached chatbot**
- **✅ AI Teacher is a core capability integrated INSIDE "Nur"**
- Nur is the single, unified Quran learning companion across Rahmania Institute and tenant madrasas.
- Nur operates in two complementary modes within one interface:
  1. **Conversational Tutor**: Answering Quranic questions, explaining Tajweed rules, offering student encouragement, responding to voice inquiries.
  2. **Interactive Teaching Engine**: Structured lessons, guided recitation practice, mistake detection, pronunciation correction, live demonstration, repetition, verification, and progress tracking.

```text
                                  ┌──────────────────────────────┐
                                  │             Nur              │
                                  │ (Unified Quran AI Companion) │
                                  └──────────────┬───────────────┘
                                                 │
                 ┌───────────────────────────────┴───────────────────────────────┐
                 ▼                                                               ▼
     Conversational Tutor Mode                                        Interactive Teaching Mode
  • Islamic & Quranic Q&A                                          • Structured Lesson Modules
  • General Tajweed Guidance                                       • Guided Recitation Practice
  • Student Encouragement & Advice                                 • Mistake Detection & Highlighting
  • Voice-Based Inquiries                                          • Articulation & Makhraj Visualizer
                                                                   • Audio Demonstration
                                                                   • Repetition & Adaptive Verification
```

## 6.2 Internal Teaching Engine Architecture
```text
Nur (AI Quran Companion)
│
├── Conversation Controller (Dialogues, Q&A, System Prompts)
│
├── Teaching Engine
│   ├── 1. Explain     (Rule context, why mistake happened, how to correct)
│   ├── 2. Demonstrate (Audio sample, visual highlight, articulation guide)
│   ├── 3. Practice    (Microphone recording, waveform, live audio capture)
│   ├── 4. Evaluate    (Phonetic matching, Tajweed rule verification)
│   ├── 5. Correct     (Targeted correction guidance)
│   └── 6. Repeat      (Adaptive loop until mastery)
│
├── Tajweed Analysis Engine
│   ├── Ghunnah, Ikhfa, Idgham, Qalqalah, Madd, Iqlab detection
│   └── Rules mapping & severity classification
│
├── Pronunciation & Articulation Engine
│   └── Letter phonetics, heavy/light letters (Tafkheem/Tarqeeq)
│
├── Makhraj Visualizer (Interactive Anatomical Articulation Points)
│   ├── Halq (Throat - أ، هـ، ع، ح، غ، خ)
│   ├── Lisan (Tongue - ق، ك، ج، ش، ي، ض، ل، ن، ر، ط، د، ت، ص، ز، س، ظ، ذ، ث)
│   ├── Shafatan (Lips - م، ب، و، ف)
│   ├── Khayshum (Nasal Cavity - Ghunnah)
│   └── Jawf (Empty Space of Mouth/Throat - Madd letters)
│
├── Adaptive Learning Engine
│   ├── Weakness history & repeated mistake tracking
│   ├── Difficulty scaling & customized repetition
│   └── Integration with Hifz & Daily Lesson logs
│
└── Voice & Audio Processing
    ├── Audio recording & streaming
    ├── Speech-to-text / recitation transcription
    └── Audio demonstration playback
```

## 6.3 Pedagogical Loop: Explain → Demonstrate → Practice → Evaluate → Correct → Repeat
```text
  Student Recitation / Lesson Trigger
                  │
                  ▼
┌───────────────────────────────────┐
│            1. EXPLAIN             │ ──► Nur explains what the rule is and where the issue lies
└─────────────────┬─────────────────┘     (e.g., "এখানে ইকফা (Ikhfa) হবে। নূন সাকিনের পর তা (ت) এসেছে।")
                  │
                  ▼
┌───────────────────────────────────┐
│          2. DEMONSTRATE           │ ──► Nur plays authentic audio & highlights Makhraj Visualizer
└─────────────────┬─────────────────┘     (visual articulation point + clear audio pronunciation)
                  │
                  ▼
┌───────────────────────────────────┐
│            3. PRACTICE            │ ──► Nur invites student: "এখন তুমি পড়ে শোনাও।"
└─────────────────┬─────────────────┘     (activates microphone, recording UI & audio waveform)
                  │
                  ▼
┌───────────────────────────────────┐
│            4. EVALUATE            │ ──► Nur checks pronunciation accuracy and rule compliance
└─────────────────┬─────────────────┘
                  │
            ┌─────┴─────┐
         Correct?    Needs Work?
            │             │
            ▼             ▼
┌──────────────────┐ ┌──────────────────┐
│  Advance to Next │ │    5. CORRECT    │ ──► Pinpoints exact sound adjustment
│      Lesson      │ └────────┬─────────┘
└──────────────────┘          │
                              ▼
                     ┌──────────────────┐
                     │    6. REPEAT     │ ──► Guided repetition until mastered
                     └──────────────────┘
```

## 6.4 Interactive Makhraj Visualizer (Inside Nur)
- **NOT an external app**: Rendered directly within Nur's lesson and practice cards.
- **Anatomical Visuals**: Clean, modern vector illustration of the speech organs:
  - **Al-Halq (Throat)**: Lowest (أ، هـ), Middle (ع، ح), Highest (غ، خ).
  - **Al-Lisan (Tongue)**: Deepest back (ق، ك), Middle (ج، ش، ي), Edges (ض), Tip & teeth (ل، ن، ر، ط، د، ت، ص، ز، س، ظ، ذ، ث).
  - **Ash-Shafatan (Lips)**: Inside lower lip with teeth (ف), Both lips closed/rounded (م، ب، و).
  - **Al-Khayshum (Nasal Passage)**: Pure resonance for Ghunnah (نّ، مّ).
  - **Al-Jawf (Oral Cavity)**: Open airflow for Madd letters (ا، و، ي).
- **Interactive States**: Highlights active articulation point with glowing emerald/gold accents, displaying Bengali & English phonetic guides.

## 6.5 Deep Connection to Academic & Hifz Tracking
Nur connects directly with the existing Hifz tracker in `src/features/teachers/components/DailyLessonEntry.jsx`:
- **Sabaq (সবক)**: Daily new memorization lesson (Para, Page).
- **Sat Sabaq (সাত সবক)**: Recent revisions.
- **Amukta (আমুক্তা)**: Past memorization revision.
- **Weekly Sobina (সবীনা)**: Complete cycle review.
- **Lokma (লুকমা)**: Number of pauses/prompts required.
- **Calculation Results**: `total_mistakes`, `quality_score`.
Nur leverages these records to adapt practice sessions, focusing on Surahs and Ayahs where the student has recorded lokmas or mistakes.

---

# 🤖 7. ENTERPRISE AI ASSISTANT & AUTOMATION ENGINE

The platform incorporates an integrated, production-ready **Private AI Assistant / Store Employee** for every tenant. The AI is **NOT a simple chatbot**; it is an autonomous action, analytics, content, and automation agent operating strictly within server-side security boundaries.

### 7.1 AI Assistant Role Boundary
The AI is a digital assistant, **not an administrator**. It cannot grant itself permissions, bypass authentication, access raw database credentials, read environment secrets, or access cross-tenant data.

### 7.2 Three-Layer Action Authorization
Every action request by the AI must pass three mandatory security checks before execution:
$$\text{Action Decision} = \text{Layer 1: User RBAC} \land \text{Layer 2: Tenant Preference} \land \text{Layer 3: Platform Policy}$$
- **Layer 1 (User RBAC)**: Verifies the authenticated staff member's permissions (`roleHasPermission(user.role, requiredPermission)`).
- **Layer 2 (Tenant Preference)**: Evaluates whether the tenant configured Direct Execution or Mandatory Approval for this action type.
- **Layer 3 (Platform Policy)**: High-risk actions (payouts, domain modifications, payment credentials, tenant deletion, bulk destructive operations) **ALWAYS** require explicit re-authentication / owner confirmation regardless of Layer 2.

### 7.3 Immutable Approval Payload & Anti-Tampering
When the AI prepares an action (e.g. `prepare_create_product` or `prepare_update_fee`), the system generates an **Immutable Approval Token / Cryptographic Hash** of the exact payload:
- When the tenant administrator reviews and clicks `[Approve & Execute]`, the server validates the hash against the submitted execution payload.
- If any price, stock, fee, or parameter was altered silently, execution is **ABORTED** and a fresh preview/approval cycle is triggered.

### 7.4 Absolute Tenant Scoping
- The AI context and all tool executions derive the `organization_id` **exclusively from the verified session JWT**.
- Any `tenantId` or `organization_id` supplied in user prompts or LLM tool arguments is strictly ignored.
- Database queries executed by tools are always scoped: `.eq('organization_id', session.organization_id)`.

### 7.5 BYOK & Dynamic Configurable Model Registry
- Supports multiple providers: Google Gemini, OpenAI, Anthropic, OpenRouter.
- **Models must NEVER be hardcoded**: The system provides recommended defaults, supports live model fetching per provider, and allows the tenant to specify custom model strings (e.g. `openrouter/anthropic/claude-3.5-sonnet`, `gemini-1.5-pro`).
- API keys are stored with AES-256-GCM encryption and masked on the UI (`••••••••••••abcd`). Keys are never sent to the browser or logged in plaintext.

### 7.6 Automation Engine (Event Hooks + Scheduled Worker Architecture)
Automation rule execution operates through two decoupled engines:
1. **Event-Driven Lifecycle Hooks (Real-Time)**:
   - Low inventory / unpaid fee threshold triggers notification hook.
   - Attendance punch triggers late-arrival / absence alert hook.
2. **Scheduled Worker (Cron / Background Runner)**:
   - Secured endpoint `/api/cron/ai-automations` with `CRON_SECRET` for time-based triggers (e.g. Daily 9 PM Attendance & Financial Summary, 30-day Inactive Student/Customer Follow-up).
   - Sensitive automation actions generate pending approval cards instead of executing silently.

### 7.7 Truthful Analytics & Zero Hallucination
- Analytical queries (Sales, Fees, Attendance, Expenses) query real database tables via aggregated PostgreSQL queries/RPCs.
- Net profit calculations strictly follow: $\text{Net Profit} = \text{Revenue} - \text{COGS/Expenses}$.
- If financial data is missing, the AI explicitly explains the data requirement rather than guessing or fabricating numbers.

### 7.8 Immutable Action & Usage Audit Logging
- Every tool execution records an audit entry in `ai_action_logs`: `organization_id, user_id, tool_name, action_type, risk_level, approval_required, status, timestamp`.
- Every LLM request logs token usage and estimated cost in `ai_usage_logs` to enforce monthly token limits.

### 7.9 Failure Handling & Safe Retries
- If a multi-step task encounters a failed step, the AI does not simulate fake success.
- The AI asks only essential missing parameters and avoids unnecessary interrogations.
- Failed actions do not create duplicate records upon retry.

---

# 🕒 8. BIOMETRIC ATTENDANCE ENGINE & HARDWARE BRIDGE SPECIFICATION

The biometric attendance system is a **protected critical system**. It powers real-world attendance for teachers, students, and staff across physical campuses.

```text
┌───────────────────────────────┐
│     ZKTeco K40 Device         │ (Physical biometric hardware on campus)
└──────────────┬────────────────┘
               │ (TCP port 4370)
               ▼
┌───────────────────────────────┐
│   Biometric Bridge Daemon     │ (Node.js service in biometric-bridge/bridge.js)
└──────────────┬────────────────┘
               │ (HTTP POST with x-api-key header)
               ▼
┌───────────────────────────────┐
│ Next.js Attendance Endpoints  │
│  • /api/attendance/device     │ (Punches batch insertion)
│  • /api/attendance/manage     │ (Device heartbeat & config)
│  • /api/attendance/device-sync│ (Sync logs & status)
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│   Supabase Database Tables    │
│  • attendances (student logs) │
│  • teacher_attendance         │
│  • attendance_sync_logs       │
└───────────────────────────────┘
```

### Biometric Invariants:
1. **Never alter API contracts**: `/api/attendance/device` and `/api/attendance/manage` must retain their expected payload schemas and header validations (`x-api-key`).
2. **Batch write queue**: Attendance punches must be buffered and batched to prevent database exhaustion during peak punch-in times (`src/lib/attendance.js`).
3. **Calculation logic preserved**: Late threshold (`09:30:00`), working hours calculation (`calcWorkingHours`), and sync log queue must not be modified without explicit operational requirements.
4. **Zero-regression testing**: Any attendance-related change must be tested against `biometric-bridge/tests/` to verify that device sync continues working.

---

# 📊 9. REAL-WORLD INVENTORY, COSTING, SALES, FEES & PROFIT ACCOUNTING ENGINE

The platform operates an authoritative, real-world commerce and institutional accounting engine. Financial metrics are computed exclusively on the server from authoritative database records.

### 9.1 Dual Pricing Architecture (Cost Price vs Market Price vs Selling/Fee Price)
- **Purchase / Procurement Cost (`cost_price`)**: Actual procurement unit cost from suppliers or lesson delivery cost.
- **Market Price (`market_price`)**: Current reference market/MSRP price in Bangladesh.
- **Selling Price / Fee (`price` / `fee_amount`)**: The active retail price or tuition fee.
Market price and selling price are strictly decoupled; administrators may price above or below market value.

### 9.2 Weighted Average Costing (WAC) & Stock-In Ledger
When new inventory is introduced via Purchase Invoices or Stock In, the system automatically updates the Weighted Average Cost:
$$\text{New WAC} = \frac{(\text{Current Stock} \times \text{Current WAC}) + (\text{Purchased Qty} \times \text{Purchase Cost})}{\text{Current Stock} + \text{Purchased Qty}}$$
- **Sale Immutability Rule**: Sales DO NOT alter the product's WAC. Sales simply consume stock at the current cost basis.

### 9.3 Immutable Historical Sales & Fee Snapshots
Every completed `order_item` or `student_fee_receipt` stores an immutable financial snapshot at the exact second of payment/checkout:
- `unit_cost`: Cost price snapshot at sale time.
- `unit_price`: Selling price / fee snapshot at sale time.
- `quantity`: Units purchased / months billed.
- `line_revenue = unit_price * quantity`
- `line_cogs = unit_cost * quantity`
- `line_profit = line_revenue - line_cogs`
- `profit_margin = (line_profit / line_revenue) * 100`
**Subsequent changes to a product's current cost or fee schedule NEVER alter historical sales, past COGS, or past financial reports.**

### 9.4 Authoritative Server-Side Realized Price & Discount Calculation
- Client-supplied `cost`, `cogs`, `profit`, or `discounted_price` are strictly discarded.
- Server validates and computes:
$$\text{Realized Unit Price} = \text{Selling Price} - \text{Discount (Percentage / Fixed / Waiver)}$$
$$\text{Unit Profit} = \text{Realized Unit Price} - \text{Unit Cost}$$
$$\text{Gross Profit} = \sum (\text{Unit Profit} \times \text{Quantity})$$

### 9.5 Strict Metric Separation (Revenue vs COGS vs Gross Profit vs Net Profit)
Financial reports present distinct, verifiable accounting tiers:
$$\text{Revenue} = \sum \text{Delivered Orders / Collected Fees}$$
$$\text{COGS (Cost of Goods Sold)} = \sum (\text{Historical Unit Cost} \times \text{Quantity})$$
$$\text{Gross Profit} = \text{Revenue} - \text{COGS}$$
$$\text{Operating Expenses} = \sum \text{Tenant Expenses (Rent, Salary, Utilities, Maintenance, etc.)}$$
$$\text{Net Profit} = \text{Gross Profit} - \text{Operating Expenses}$$

### 9.6 Cash Collected vs Revenue vs Customer/Student Due (Receivable)
- **Revenue**: Total delivered/completed billing volume.
- **Cash Collected**: Actual cash/MFS/bank payments received.
- **Due (Receivable)**: Unpaid balance tracked in `customer_due_ledger` or `student_fees` (where `payment_status = 'pending' | 'partial'`).
Revenue and Cash Flow are never conflated.

### 9.7 Real-Time Dynamic Stock / Asset Valuation
Merchants and administrators can instantly inspect current warehouse/asset value:
$$\text{Stock Asset Value} = \sum_{\text{all active items}} (\text{Remaining Stock} \times \text{Current WAC})$$

### 9.8 Return & Refund Accounting
- **Full / Partial Returns**: Stock is restored (if undamaged), COGS is reversed proportionally, and refund amount is recorded.
- **Non-Destructive**: Orders and fee receipts are never deleted; adjustments are recorded via dedicated return/ledger records.

### 9.9 Dynamic Timezone-Safe Date Range Reporting
The Accounting Dashboard (`/admin/accounting`) provides authoritative financial aggregation across:
- `Today` (midnight to present)
- `Yesterday` (yesterday 00:00 to 23:59:59)
- `Last 7 Days`
- `Last 30 Days`
- `This Month`
- `Custom Date Range` (`startDate` to `endDate`)

### 9.10 Item/Course-Level Profitability Breakdown
Every item itemizes:
$$\text{Units Sold / Students Enrolled} \mid \text{Gross Revenue} \mid \text{COGS} \mid \text{Gross Profit} \mid \text{Profit Margin \%} \mid \text{Remaining Stock}$$
Sortable by Highest Profit, Highest Margin, Highest Volume, and Highest Revenue.

### 9.11 Role-Based Financial Masking & Storefront Protection
- Staff roles lacking `accounting.view` or `financial.cost_view` permissions receive `null` for `cost_price`, `cogs`, `profit`, and supplier costs.
- Public customer APIs and storefront pages NEVER receive or leak internal `cost_price` or `profit` data.

### 9.12 Concurrency-Safe Financial & Stock Mutations
- Atomic database updates and idempotency keys prevent overselling, race conditions, or duplicate fee collections under high concurrency.
- Database transactions are kept short and optimized without external network/API calls inside transaction blocks.

### 9.13 Comprehensive Audit Trail for Financial Actions
All financial mutations record structured audit logs:
`PURCHASE_CREATED`, `STOCK_RESTOCK_IN`, `INVENTORY_ADJUST`, `PRICE_OVERRIDE`, `DISCOUNT_OVERRIDE`, `POS_SALE`, `FEE_COLLECTION`, `ORDER_REFUND`, `EXPENSE_CREATED`, `DUE_PAYMENT_COLLECTED`.

---

# 🔒 10. DATABASE ARCHITECTURE, SUPABASE SECURITY & RLS MASTER MATRIX

## 10.1 Public vs Private Tables Master Matrix

Security means: **"Public content is accessible to all. Private data is strictly protected for authenticated and authorized users."**

### 🟢 PUBLIC Tables (Anonymous SELECT Allowed)
These tables power the public website and storefront. They MUST permit anonymous SELECT access:

| Table | Purpose | SELECT Policy Pattern |
|---|---|---|
| `hero_slides` | Hero Slider | `USING (true)` or `USING (is_active = true)` |
| `notices` | Public Notice Board | `USING (true)` |
| `branches` | Campus Branches | `USING (true)` or `USING (is_active IS DISTINCT FROM false)` |
| `gallery` | Photo Albums | `USING (true)` |
| `gallery_items`| Album Photos | `USING (true)` |
| `videos` | Video Gallery | `USING (true)` |
| `teachers` | Public Faculty List | `USING (...) OR (auth.role() = 'anon')` (name, designation, photo) |
| `students` | Basic Student Count | `USING (...) OR (auth.role() = 'anon')` (count/status only) |
| `blogs` | Articles & News | `USING (is_published = true) OR has_permission('blogs','view')` |
| `faqs` | FAQs | `USING (is_active IS DISTINCT FROM false) OR has_permission('faqs','view')` |
| `testimonials` | Testimonials | `USING (is_active IS DISTINCT FROM false) OR has_permission('testimonials','view')` |
| `courses` | Academic Courses / Store Items | `USING (is_active IS DISTINCT FROM false) OR has_permission('courses','view')` |
| `success_stories`| Success Stories | `USING (is_active IS DISTINCT FROM false) OR has_permission('success_stories','view')` |
| `events` | Events & Seminars | `USING (is_active IS DISTINCT FROM false) OR has_permission('events','view')` |
| `sponsors` | Sponsors & Donors | `USING (is_active = true) OR has_permission('sponsors','view')` |
| `page_sections` | About / Mission | `USING (true)` or `USING (is_visible IS DISTINCT FROM false)` |
| `app_settings` | Branding & Logo | `USING (true)` |
| `contact_info` | Contact Details & Map | `USING (true)` |
| `navbar_items` | Navigation Menu | `USING (true)` or `USING (is_active IS DISTINCT FROM false)` |
| `contact_messages` | Contact Submissions | INSERT: `WITH CHECK (true)` |

*Note: INSERT/UPDATE/DELETE on public tables is strictly restricted to authorized admins via `has_permission()`.*

---

### 🔴 PRIVATE Tables (Strict Authentication & Tenant/Branch Isolation Required)
These tables contain sensitive student, teacher, academic, customer, or financial records. They must **NEVER** allow anonymous SELECT access:

| Table | Data Type | SELECT Security Policy |
|---|---|---|
| `student_fees` | Student Fee Ledgers | `has_permission('fees', 'view') AND check_branch_isolation(branch_id)` |
| `attendances` | Student Attendance | `has_permission('student-attendance', 'view') AND check_branch_isolation(branch_id)` |
| `teacher_attendance`| Teacher Attendance | `has_permission('teacher-attendance', 'view') AND check_branch_isolation(branch_id)` |
| `daily_lessons` | Daily Lessons & Hifz | `has_permission('daily-lesson-tracker', 'view') AND check_branch_isolation(branch_id)` |
| `hadiya` | Hadiya / Donations | `has_permission('hadiya', 'view') AND check_branch_isolation(branch_id)` |
| `teacher_payments` | Teacher Payments | `has_permission('hadiya', 'view') AND check_branch_isolation(branch_id)` |
| `teacher_hadiya` | Teacher Hadiya | `has_permission('hadiya', 'view') AND check_branch_isolation(branch_id)` |
| `teacher_salary_profiles` | Salary Profiles | `has_permission('hadiya', 'view') AND check_branch_isolation(branch_id)` |
| `boarding_daily_reports` | Boarding Meals/Logs | `has_permission('boarding', 'view') AND check_branch_isolation(branch_id)` |
| `boarding_expenses` | Boarding Expenses | `has_permission('boarding', 'view') AND check_branch_isolation(branch_id)` |
| `exam_results` | Student Marks | `has_permission('results', 'view') AND check_branch_isolation(branch_id)` |
| `exam_inputs` | Exam Marksheets | `has_permission('exams', 'view') AND check_branch_isolation(branch_id)` |
| `admission_applications`| Admission Records | `has_permission('reserve', 'view') AND check_branch_isolation(branch_id)` |
| `expenses` | Institution Expenses| `has_permission('expenses', 'view') AND check_branch_isolation(branch_id)` |
| `security_events` | Security Telemetry | `platform_owner` / Tenant Admin scoped |
| `ai_action_logs` | AI Execution Audit | Scoped strictly to `organization_id` |

---

## 10.2 Homepage RPC: `get_home_page_data()`
- Homepage data is fetched via the `get_home_page_data()` PostgreSQL RPC function.
- Because it is configured as `SECURITY DEFINER`, it bypasses client RLS to safely assemble public homepage sections in a single round-trip.
- Any modification to `get_home_page_data()` must maintain `SECURITY DEFINER` and only return published, active data.

## 10.3 Database Migration & Change Safety Rules
- **No casual DROP TABLE or DROP COLUMN**: Database tables and columns hold live production records.
- **Additive Migrations Only**: Create backward-compatible additions (new columns with default values, new tables).
- **Manual Execution Requirement**: Every migration must be saved in `supabase/migrations/` and the user instructed to run it in the Supabase SQL Editor.

---

# 🌐 11. ADVANCED SEO, AEO, GEO & AI DISCOVERABILITY MASTER RULES

The platform must be engineered for maximum legitimate discoverability across Google Search, Bing, Google Discover, AI Answer Engines (Perplexity, ChatGPT, Gemini, Copilot), Local Maps, and Voice Search.

> **Objective: Make every legitimate page, course, product, store, category, location, and piece of useful content: Crawlable → Understandable → Indexable → Relevant → Trustworthy → Searchable → Citeable.**

### 11.1 Every Page Must Have a Search Purpose
Every indexable page must answer a real search intent. Before indexing a page, determine:
`Primary Entity` | `Search Intent` | `Primary Keyword` | `User Questions` | `Relevant Courses/Products` | `Location` | `Structured Data`

### 11.2 Page-Level Dynamic SEO Engine
SEO metadata must be generated dynamically for every eligible public page:
- `Title` (under 60 chars) & `Meta Description` (under 160 chars)
- `Canonical URL` (strictly normalized)
- `Robots` directives
- `Open Graph` & `Twitter/X` cards
- `H1` (exactly one per page with semantic hierarchy)
- `BreadcrumbList` JSON-LD schema
- `Image Alt Text` & optimized dimensions

### 11.3 Product-Level & Course-Level SEO
Every product or course must be independently optimized with unique Name, Slug, SEO Title, Description, Image Alt Text, Canonical URL, Schema markup (`Product`, `Course`, `Offer`), SKU/Code, Availability, Price/Fee, and Breadcrumbs.

### 11.4 Duplicate Content Protection
Prevent duplicate or near-duplicate pages caused by query parameters, variants, pagination, sorting, filters, trailing slashes, or Platform URL vs Custom Domain URL:
- Platform URL: `https://platform.domain/store/electromart/products/item-1`
- Custom Domain: `https://electromartbd.com/products/item-1`
- **Rule**: When a tenant has an active custom domain, the custom-domain URL is the authoritative canonical URL.
- Tenant A's canonical URLs, sitemaps, and metadata must never affect Tenant B.
- All canonical URLs must be generated dynamically from verified tenant/domain context. Never hardcode a domain.

### 11.5 Custom Domain Homepage Indexing
Every active tenant with a verified custom domain must have an independently indexable storefront homepage that:
- Renders only that tenant's content.
- Has tenant-specific title, meta description, and canonical URL.
- Emits proper `EducationalOrganization`, `LocalBusiness`, or `WebSite` JSON-LD.
- Points robots to that tenant's sitemap (`/sitemap.xml`).
- Administrative portals (`/admin`, `/platform-console`, `/teacher`, `/student`) MUST contain `robots: { index: false, follow: false }`.

---

# 🎨 12. UI/UX, DESIGN SYSTEM & MULTILINGUAL i18n RULES

1. **Aesthetic Standards**:
   - Primary: Islamic emerald green (`#0f766e` / `#0d9488`), subtle warm gold accents (`#d97706`).
   - Clean, elegant, soft rounded cards (`rounded-xl`), modern typography (Inter / Outfit / Amiri).
   - Glassmorphism, subtle micro-interactions, responsive data tables.
2. **Mobile-First Responsiveness**:
   - Touch targets must be at least **44px × 44px**.
   - Waveforms, microphones, and Arabic Quran texts must resize seamlessly on mobile devices.
3. **100% Functional Controls (Zero Mock Buttons)**:
   - Every UI button, link, switch, toggle, and dropdown must execute real backend mutations or state changes.
   - Forms must submit to real endpoints and provide toast notifications (`sonner`).
4. **Strict Prohibition of Sparkles / Magic Stars**:
   - Never use `Sparkles` icon from `lucide-react` or ✨ sparkle emojis.
   - Use semantic icons (`Bot`, `Cpu`, `Zap`, `BookOpen`, `ShieldCheck`).
5. **Multilingual i18n & RTL Standards**:
   - **বাংলা (Bengali)**: Primary institutional language.
   - **English**: Secondary administrative and technical language.
   - **العربية (Arabic)**: Quranic script, Tajweed terminologies, Islamic citations.
   - Arabic text must render in RTL layout with proper typography (e.g. Amiri, KFGQPC Uthman Taha Naskh).
   - All user-facing strings must map through `src/lib/translations-data.js` and `translations.js`.

---

# ⚡ 13. PERFORMANCE, CACHING & FREE PLAN GOVERNANCE

1. **Never use `SELECT *`**: Fetch only the specific columns needed by the view.
2. **Server-Side Pagination & Limits**: Always append `.range(from, to)` or `.limit(n)` on queries.
3. **Caching Strategy**:
   - Public pages: Next.js Data Cache / ISR with 60-minute revalidation target.
   - Private portals: React Query with sensible `staleTime` (5–10 minutes).
   - Sensitive user-specific data (fee records, current session): Never cache.
4. **Asset Optimization**:
   - Serve images via Cloudinary transformations (`q_auto,f_auto,w_xxx`).
   - Lazy load heavy bundles (PDF renderer, audio waveforms, charts) using `next/dynamic`.

---

# 🔑 14. ENVIRONMENT VARIABLES & SECRETS MANAGEMENT

1. **Server-Only Secrets (NEVER expose to client)**:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PLATFORM_OWNER_SECRET` / `PLATFORM_OWNER_PASSWORD`
   - `OPENROUTER_API_KEY` / `GEMINI_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `CRON_SECRET`
2. **Client-Safe Public Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

---


# 🚀 15. DEVELOPMENT WORKFLOW & DEFINITION OF DONE (DoD)

### 15.1 Use This Workflow For Every Task
Follow these steps in order. Apply the relevant architecture gates; do not implement unrelated modules just because they appear in this guide.

1. **Define the task** — Identify the requested outcome, affected user/portal, expected behavior, and acceptance criteria.
2. **Inspect before editing** — Read the relevant implementation, callers, tests, schema, and repository instructions. Search for an existing pattern before creating anything.
3. **Map the risk** — Decide whether the change touches authentication, tenant/branch scope, permissions, personal/financial data, SQL, AI actions, public exposure, or biometric attendance. Apply every matching invariant and security gate.
4. **Implement the smallest complete change** — Reuse existing APIs, components, utilities, and business logic. Include real persistence, authorization, loading/error/empty states, and user feedback where applicable.
5. **Verify the changed surface** — Run the most focused test first, then the required repository checks below. Run tenant-isolation gates for tenant changes and biometric bridge tests for attendance changes.
6. **Report accurately** — Summarize the change, checks and their results, known gaps, and any SQL the user must apply manually.

### 15.2 Required Verification
Before declaring a code change complete, run typecheck and lint, inspect `git status`, and run focused functional tests for the changed behavior. Also run a production build when the change affects build/configuration or before a release. If a required check cannot run, state why; do not imply it passed.

```bash
# 1. Typecheck the repository
npm run typecheck

# 2. Verify linting
npm run lint

# 3. Check git status for unintended file edits
git status
```

### 15.3 Regression Checklist
Run the checks that match the changed surface. For broad, shared, security-sensitive, or release changes, run the full relevant portal regression suite. A biometric change always requires the biometric bridge tests; a tenant-isolation change always requires the tenant-isolation gates in Section 3.8.

- [ ] **Public Website**: Hero slider, notices, branches, teachers, facilities, gallery, admission form load properly without errors.
- [ ] **Admin Portal**: Authentication, student/product management, teacher management, notice management, branding settings function correctly.
- [ ] **Teacher Portal**: Daily lesson entry (including Hifz form: Sabaq, Sat Sabaq, Amukta, Lokma calculations) works flawlessly.
- [ ] **Student Portal**: Profile, reading logs, attendance records, AI suggestions render without errors.
- [ ] **Biometric Attendance**: Biometric bridge routes (`/api/attendance/device`, `/manage`), device synchronization, and live attendance remain fully operational.
- [ ] **Nur AI Quran Companion**: Unified chat, voice interaction, pedagogical loop (Explain → Demonstrate → Practice → Evaluate → Correct → Repeat), and Makhraj Visualizer execute cleanly.
- [ ] **No Dead Controls**: Every button, dropdown, and input is connected to real state and backend operations.
- [ ] **No Sparkles**: No `Sparkles` icon or sparkle emojis used in any interface.
- [ ] **Database Notification**: If any new SQL/RPC was written, user is provided the exact SQL to execute in Supabase SQL Editor.

### 15.4 Definition of Done (DoD)
A task is **DONE** only when:
1. The requested behavior is implemented and verified against its acceptance criteria.
2. Existing behavior in the affected area has no known regression.
3. Applicable tenant isolation, security, authorization, and RLS rules are respected and tested.
4. `npm run typecheck` and `npm run lint` pass for code changes; any unavailable or failing check is disclosed.
5. Required focused tests pass; build and broader regression checks are completed when applicable to the change or release.
6. The implementation follows existing patterns and remains modular.
7. The final report states what changed, what was verified, and whether manual SQL execution is required.