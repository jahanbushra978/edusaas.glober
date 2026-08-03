# 🏛️ Rahmania SaaS Platform — মাস্টার প্ল্যান
### Single Institute ERP থেকে Enterprise Educational SaaS Platform

> এই ডকুমেন্ট চারটা বড় অংশে ভাগ করা:
> **Part A — Vision & Goals** (কী বানাতে হবে) · **Part B — Architecture & Roadmap** (কীভাবে বানাতে হবে) · **Part C — Engineering Standards** (কী নিয়মে বানাতে হবে) · **Part D — Quality Gates** (কখন একটা Phase সত্যিই "শেষ" ধরা হবে)
> এই চারটা অংশ একসাথে থাকলে AI Agent এবং ভবিষ্যতের যেকোনো Developer — দুজনেই একই মান বজায় রেখে কাজ চালিয়ে যেতে পারবে।

---
---

# 🅰️ PART A — VISION & GOALS

## ১. মূল ভিশন (এক লাইনে)

> **Rahmania Institute ERP** আর একটামাত্র প্রতিষ্ঠানের সিস্টেম নয় — এটাকে এমন একটা **Multi-Tenant SaaS Platform**-এ রূপান্তর করা হচ্ছে, যেখানে একটা মাত্র কোডবেস দিয়ে হাজার হাজার School/Madrasa/College নিজের মতো করে চলতে পারবে — অথচ কেউ কারো ডেটা দেখতে পারবে না, এমনকি কেউ জানবেও না যে অন্য কোনো Organization আছে।

**Rahmania Institute** এখন থেকে শুধু **Organization #1 (প্রথম ক্লায়েন্ট)** — বিশেষ কিছু না। ওরা আজকে যা যা করতে পারে, ভবিষ্যতের যেকোনো নতুন Organization-ও ঠিক সেটাই করতে পারবে।

> 📝 **Reference Implementation Principle:**
> Rahmania Institute is the reference implementation and the first production organization. It follows the exact same architecture and capabilities as every other organization, unless the Platform Owner intentionally enables additional features for testing or a staged rollout. অর্থাৎ Rahmania কোনো বিশেষ সুবিধা পাবে না, তবে নতুন কোনো Feature সবার আগে Rahmania-তে Test/Staged-Rollout করার সিদ্ধান্ত Platform Owner সচেতনভাবে নিতে পারবেন।

## ২. চূড়ান্ত স্বপ্ন (Category-Defining Vision) 🌟

> মানুষ যখন কোনো Category-র নাম নেয়, তখন যেন একটা নামই মাথায় আসে —
>
> | Category | নাম মনে আসবে |
> |---|---|
> | Website | WordPress |
> | E-commerce | Shopify |
> | CRM | Salesforce |
> | ERP | SAP |
> | **Education** | **আমাদের Platform** |

এই লক্ষ্য মাথায় রেখেই প্রতিটা Architecture সিদ্ধান্ত নিতে হবে — শুধু Rahmania-র জন্য কাজ করলে চলবে না, পুরো Education Industry-র Standard হওয়ার মতো Generic, Scalable এবং Professional হতে হবে।

## ৩. সবচেয়ে গুরুত্বপূর্ণ নিয়ম (Golden Rules)

| # | নিয়ম |
|---|------|
| ১ | প্রজেক্ট নতুন করে বানানো যাবে না (rebuild না) |
| ২ | Existing কোনো Feature সরানো/ভাঙা যাবে না |
| ৩ | Rahmania-র বর্তমান Website, ERP, API, SEO — সব আগের মতোই কাজ করবে |
| ৪ | সব পরিবর্তন হবে **Additive & Backward Compatible** |
| ৫ | কাজ হবে ধাপে ধাপে (Incremental) |
| ৬ | প্রতিটা Phase শেষ হলে **থামতে হবে, কনফার্মেশনের অপেক্ষা করতে হবে** |
| ৭ | কনফার্মেশন ছাড়া পরের Phase-এ **কখনোই** এগোনো যাবে না |
| ৮ | প্রতিটা Phase পুরোপুরি টেস্ট করার পরই পরের ধাপে যাওয়া যাবে (দেখুন Part D — Quality Gates) |

## ৪. প্ল্যাটফর্মের দুইটা স্তর (Two Levels)

### 🔑 Level 1 — Platform Console (`/platform-console`)
- সর্বোচ্চ ক্ষমতাসম্পন্ন প্যানেল — **শুধু Platform Owner (আপনি)** এখানে ঢুকতে পারবেন।
- এটা কোনো সাধারণ Admin Panel না — এটা পুরো SaaS Ecosystem-এর **Control Center**।
- Route কখনো public-ভাবে expose করা যাবে না; Login system Organization-দের থেকে **সম্পূর্ণ আলাদা** (আলাদা Auth Flow)।

**এখান থেকে যা নিয়ন্ত্রণ করা যাবে:** Organizations · Users · Subscriptions/Plans · Domains · Hosting · Themes · Website Templates · ERP Modules · Feature Flags · Permissions · Integrations · Storage · Email/SMS · Payment Gateway · Backup · Audit Logs · Analytics · Security · System Settings

### 🏫 Level 2 — Organization ERP
- প্রতিটা Organization নিজের একটা সম্পূর্ণ স্বতন্ত্র ERP + Website পাবে (দেখতে ঠিক আজকের Rahmania ERP-এর মতো Professional)।
- একটা Organization কখনো টের পাবে না যে আরও Organization আছে।

## ৫. পারমিশন হায়ারার্কি (Enterprise Permission Engine)

```
Platform Owner → Organization Super Admin → Branch Admin → Principal
→ Teacher → Accountant → Librarian → Hostel Manager → Parents → Students
```

- কিছুই hardcode হবে না — সব permission **configurable**।
- Platform Owner ঠিক করবেন প্রতিটা Role কী পারমিশন পাবে; Organization Admin শুধু তার অনুমোদিত পারমিশনের মধ্যেই কাজ করতে পারবে; Branch Admin শুধু নিজের Branch-এর ইউজার ম্যানেজ করতে পারবে।

**Password Reset Chain:** Platform Owner → Org Super Admin → Branch Admin → Teacher/Staff → (নিজের পাসওয়ার্ড শুধু নিজেই বদলাতে পারবে)

## ৬. Final Architectural Principle (মূল দর্শন)

> **"Everything must be configurable, reusable, extensible, secure, scalable and future-proof. Nothing should require source code modification when it can be solved through configuration, builders, modules or platform settings."**

এই একটা বাক্যই পুরো Platform-এর প্রতিটা সিদ্ধান্তের কষ্টিপাথর। আগামী ১০-১৫ বছর নতুন Feature যোগ করার জন্য Core System বা Database বারবার পরিবর্তন করতে না হয় — সেভাবেই সবকিছু ডিজাইন হবে।

---
---

# 🅱️ PART B — ARCHITECTURE & ROADMAP

## ৭. Architectural Philosophy & Long-Term Engineering Strategy ⭐⭐⭐⭐⭐

> এই সেকশনটা অত্যন্ত গুরুত্বপূর্ণ — ভবিষ্যতে Architecture-সম্পর্কিত **যেকোনো সিদ্ধান্ত** নেওয়ার সময় এই নীতিগুলো অনুসরণ করতে হবে। লক্ষ্য শুরুতেই সবচেয়ে বড় Server বা সবচেয়ে জটিল Cloud Architecture বানানো না — লক্ষ্য হলো এমন একটা Enterprise-Grade Architecture, যেটা আগামী ১০-১৫ বছর নতুন Feature/Module/Builder/Organization/Technology যোগ হওয়ার পরও Core System বা Database বারবার বদলাতে না হয়।

### 🔑 মূল নীতি: Architecture ≠ Infrastructure

**Architecture** শুরু থেকেই Enterprise-Grade হতে হবে — আজ Rahmania একাই থাকুক না কেন, Architecture এমন হবে যেন ভবিষ্যতে ১০,০০০+ Organization একই Codebase ব্যবহার করতে পারে।

**Infrastructure** কিন্তু ধাপে ধাপে বড় হবে — শুরুতেই সেই স্কেলের Infrastructure দরকার নেই।

| শুরুতে (Simple & Low-Cost) | পরে, ব্যবহারকারী বাড়লে (Upgrade) |
|---|---|
| Free/Low-Cost Hosting | Server Upgrade |
| Free/Entry-Level Cloud Services | Database Upgrade |
| Shared Infrastructure | Cache Layer, CDN |
| Minimal Operational Cost | Background Workers, Load Balancer, Object Storage, Monitoring, Auto Scaling, High Availability |

> 🎯 **সবচেয়ে গুরুত্বপূর্ণ লক্ষ্য:** এই Infrastructure Upgrade-গুলোর জন্য যেন Core Application, Database Design, Business Logic বা Module Architecture **কখনোই পরিবর্তন** করতে না হয়।

### 🧭 প্রতিটা সিদ্ধান্তের আগে নিজেকে যে প্রশ্নগুলো করতে হবে

- এই Design কি আগামী ১০ বছর টিকে থাকবে?
- নতুন Organization যোগ করতে কি Code পরিবর্তন লাগবে?
- নতুন Module যোগ করতে কি Database Redesign লাগবে?
- নতুন Builder যোগ করতে কি Existing Feature ভেঙে যাবে?
- Infrastructure পরিবর্তন করলে কি Application Logic পরিবর্তন করতে হবে?
- ১০টা Organization থেকে ১০,০০০ Organization হলে কি একই Architecture কাজ করবে?
- Feature বাড়লেও System Maintain করা কি সহজ থাকবে?

> যদি কোনো সিদ্ধান্তের কারণে ভবিষ্যতে বড় ধরনের Refactoring, Database Redesign বা Code Rewrite লাগার সম্ভাবনা থাকে — তাহলে Coding শুরু করার আগেই আরও ভালো Architecture প্রস্তাব করতে হবে।

### 💡 Development Philosophy

- Build Once, Scale Forever.
- Strong Foundation Before Advanced Features.
- Simplicity Before Complexity.
- Configuration Before Hardcoding.
- Reusability Before Duplication.
- Evolution Instead of Rebuild.
- Low Infrastructure Cost, High Architectural Quality.
- Scale Infrastructure, Not Business Logic.
- Every new feature should fit into the existing architecture, not force the architecture to change.

### 🤖 AI সম্পর্কে একটা বিশেষ স্পষ্টীকরণ

**AI এখন Phase 1-এর অংশ না।** Core Platform অবশ্যই AI ছাড়া **১০০% সম্পূর্ণভাবে** কাজ করবে। AI ভবিষ্যতে একটা **Optional Service Layer** হিসেবে যুক্ত হবে — AI যোগ বা বাদ দিলে Core ERP, Website, Platform Console, Database, Business Logic বা Existing Workflow-এর কোনো পরিবর্তন লাগবে না (Part B-এর §৩০ AI Platform সবসময় এই নীতির অধীনে থাকবে)।

### ✅ চূড়ান্ত মানদণ্ড

কোনো Feature Implement করার আগে শুধু "এটা কাজ করবে কি না" ভাবলে চলবে না — বরং ভাবতে হবে **"এটা কি আগামী ১০ বছরেও সঠিক সিদ্ধান্ত থাকবে?"** দ্রুত Development-এর চেয়ে সঠিক Architecture অনেক বেশি গুরুত্বপূর্ণ।

---

## ৮. মাল্টি-টেন্যান্ট আর্কিটেকচার

```
এক Next.js প্রজেক্ট + Shared Database Infrastructure (ডিফল্ট: Supabase/PostgreSQL)
+ সবকিছু organization_id দিয়ে Isolated
= Unlimited Organizations · Branches · Users · Students · Teachers
```

> 📝 **Infrastructure-Agnostic Principle:** ডিফল্ট Cloud SaaS Deployment একটা shared Supabase/PostgreSQL Infrastructure ব্যবহার করবে। কিন্তু Architecture এমনভাবে ডিজাইন হবে যেন এটা কোনো নির্দিষ্ট Database/Hosting প্রোভাইডারের উপর নির্ভরশীল না থাকে — যাতে ভবিষ্যতে Enterprise Client বা Self-Hosted Deployment নিজেদের Database/Hosting ব্যবহার করতে পারে, Application Code পরিবর্তন ছাড়াই।

**Organization রেকর্ডে থাকবে:** Name · Slug · Logo · Theme · Colors · Address · Contact · Language · Timezone · Subscription · Status · Domain/Subdomain · Website Settings · SEO · Analytics — সবকিছু এডিটেবল।

**Branches:** প্রতিটা Organization Unlimited Branch খুলতে পারবে; Branch-level isolation existing workflow না ভেঙে আরো শক্তিশালী হবে।

## ৯. Core Platform Services (Shared Service Layer) ⭐

প্ল্যাটফর্মের প্রতিটা Module একই কেন্দ্রীয় Service ব্যবহার করবে — কোনো Module নিজের আলাদা Implementation বানাবে না। এটাই Architecture-কে সামঞ্জস্যপূর্ণ ও Duplicate-মুক্ত রাখার চাবিকাঠি।

**Shared Services তালিকা:** Authentication Service · Authorization Service · Notification Service · File Service · Media Service · Search Service · Audit Service · AI Service · Analytics Service · Billing Service · Workflow Service · Automation Service

## ১০. ডাইনামিক মডিউল সিস্টেম

মডিউল কখনো hardcode থাকবে না। **উদাহরণ মডিউল:** Accounting · Payroll · Library · Inventory · Transport · Hostel · Website · Admissions · SMS · HR · CRM · Biometric · AI

> 🔁 **Enable** করা হলে Menu/Permission/Page/Navigation/Settings স্বয়ংক্রিয়ভাবে চলে আসবে। **Disable** করা হলে সবকিছু স্বয়ংক্রিয়ভাবে অদৃশ্য হয়ে যাবে।

## ১১. ডাইনামিক ওয়েবসাইট + বিল্ডার সিস্টেম

| বিল্ডার | কাজ |
|---|---|
| **Page Builder** | পেজ তৈরি/মুছে/রিনেম/অর্ডার/পাবলিশ/হাইড — কোড ছাড়াই |
| **Section Builder** | নতুন সেকশন যোগ করলেই সাইটে স্বয়ংক্রিয়ভাবে চলে আসবে |
| **Menu Builder** | Add/Remove/Reorder/Nested Menu, Permission-based |
| **Form Builder** | নতুন ফিল্ড যোগ করলে Website/Admin Panel/DB Mapping/Validation সব auto-update |
| **PDF Template Builder** | Certificate/Marksheet/ID Card/Salary Slip/Fee Receipt/TC/Invoice — সব এডিটেবল |
| **Theme Builder** | Logo/Favicon/Font/Color/Header-Footer/Dark Mode |

**Visual Site Builder Flow:** `Platform Console → Create Organization → Choose Template → Customize → Preview → Publish` (WordPress/Shopify-এর মতো, Platform Owner এবং ভবিষ্যতে Organization নিজেও ব্যবহার করবে)

## ১২. Universal / Global Search Engine

Platform-এর প্রতিটা Data একসাথে Search করা যাবে: Student · Teacher · Employee · Guardian · Branch · Certificate · Invoice · Attendance · Notice · Blog · Event · Organization — এবং Search Result সবসময় ইউজারের **Permission অনুযায়ী ফিল্টার** হবে।

## ১৩. Media Library (Professional Media Manager)

পুরো Platform-এর জন্য একটা কেন্দ্রীয় Media Manager, যা Website Builder ও ERP দুই জায়গাতেই ব্যবহৃত হবে।

- **Support করবে:** Image · Video · Audio · PDF · Documents
- **Features:** Folder · Tags · Categories · Version History · Compression · Watermark · Duplicate Detection · Bulk Upload · Recycle Bin

## ১৪. Dynamic Dashboard Builder

Platform Owner, Organization Admin, এবং Branch Admin — প্রত্যেকে নিজের Dashboard নিজের মতো সাজাতে পারবে (Drag & Drop)।

**Widgets:** Charts · Reports · Calendar · Statistics · Recent Activity · Quick Actions · Notifications · Pending Tasks

## ১৫. No-Code Report Builder

যেকোনো Module থেকে Report তৈরি করা যাবে কোনো কোড ছাড়াই। **Output Support:** PDF · Excel · CSV · Print · Charts

## ১৬. Import & Export Engine

সব Module একই Import/Export System ব্যবহার করবে।

- **Support:** CSV · Excel · JSON · PDF
- **Features:** Auto Mapping · Duplicate Detection · Preview · Validation · Error Report

## ১৭. Automation Builder (No-Code)

উদাহরণ: `IF Student Created → THEN Send SMS + Create Invoice + Notify Guardian + Create Login + Assign Class`। ভবিষ্যতে শত শত এমন Automation Rule তৈরি করা যাবে কোনো কোড ছাড়াই।

## ১৮. Event-Driven Architecture

Platform-এর প্রতিটা গুরুত্বপূর্ণ কাজ একটা **Event** হিসেবে প্রকাশ পাবে — যেমন `Student Created` · `Attendance Marked` · `Fee Paid` · `Exam Published` · `Certificate Generated`। এই Event-গুলোই Automation, Notification, AI এবং Third-Party Integration চালাবে — অর্থাৎ Automation Builder ও Event-Driven Architecture একে অপরের ভিত্তি।

## ১৯. Notification Center (Unified)

**Support:** In-App · Email · SMS · WhatsApp · Push — সব Template Dynamic হবে, একটা কেন্দ্রীয় জায়গা থেকে পরিচালিত।

## ২০. Background Job System (Job Queue)

সময়সাপেক্ষ কাজ ব্যাকগ্রাউন্ডে চলবে: PDF Generation · Bulk Import · Bulk SMS · Email · Backup · AI Processing · Image Optimization।

## ২১. Scheduler System (Cron-Based)

উদাহরণ: Night Backup · Attendance Sync · Subscription Check · Certificate Expiry · Fee Reminder · Data Cleanup।

## ২২. পূর্ণাঙ্গ Audit Timeline

শুধু Log না — সম্পূর্ণ Activity Timeline: **কে, কখন, কোথা থেকে, কী পরিবর্তন করেছে, আগে কী ছিল, পরে কী হয়েছে** — সব সংরক্ষণ করতে হবে।

## ২৩. Soft Delete & Recycle Bin

Delete মানেই Permanent Delete না — সব Module-এ থাকবে: Recycle Bin · Restore · Permanent Delete · Retention Policy।

## ২৪. Version Control (সব Builder-এ)

Theme, Website, Page, Section, Form, Certificate, PDF, Workflow, Template — সবকিছুতে:

```
Draft → Preview → Publish → Rollback
```

## ২৫. Subscription & Billing Engine

Platform-এর নিজস্ব Billing System: Free Trial · Monthly/Yearly/Lifetime Plan · Coupons · Invoices · Renew/Upgrade/Downgrade · Usage Limits · Automatic Suspension · Automatic Reactivation।

## ২৬. White Label System

প্রতিটা Organization নিজের Branding ব্যবহার করতে পারবে: Logo · Company Name · Email · Support URL · Copyright · Login Page · Favicon · Email Templates · SMS Templates — যাতে Client বুঝতেই না পারে এটা মূলত একটা শেয়ার্ড Platform।

## ২৭. API & Integration Platform (API-First)

**Support:** REST API · Webhooks · OAuth · API Keys · SDK · Rate Limiting · API Analytics — যাতে Web, Android, iOS, Desktop, Third-Party সবাই একই API ব্যবহার করে।

## ২৮. Plugin & Extension Framework

Platform Core কখনো Custom Feature দিয়ে ভারী করা হবে না — নতুন Feature Plugin হিসেবে যোগ হবে: Install · Update · Disable · Remove · Configuration · Dependency Management।

## ২৯. Marketplace

ভবিষ্যতে: Plugin Marketplace · Theme Marketplace · Template Marketplace · Report Marketplace · Certificate Marketplace · AI Prompt Marketplace।

## ৩০. AI Platform (আলাদা Layer হিসেবে)

ভবিষ্যতে যোগ করা যাবে: AI Assistant · AI Chat · AI Report · AI Analytics · AI Form Builder · AI Website Builder · AI Theme Generator · AI Certificate Designer · AI Content Writer · AI SEO Assistant · AI Exam Generator · AI Question Bank · AI Student Performance Analysis।

## ৩১. Mobile Ecosystem

একই Backend থেকে ভবিষ্যতে তৈরি করা যাবে: Android App · iOS App · PWA · Parent App · Teacher App · Student App · Platform Owner App।

## ৩২. Academic Engine (সম্পূর্ণ Dynamic)

সব Configuration দ্বারা পরিচালিত হবে: Board · Curriculum · Session · Semester · Department · Faculty · Program · Course · Subject · Group · Shift · Section · Class — যাতে Madrasa/School/College/University/Coaching/Hifz/Kindergarten প্রতিটাই নিজের মতো Academic Structure বানাতে পারে।

## ৩৩. Multi-Country Ready (Internationalization)

শুরু থেকেই সাপোর্ট করবে: Language · Currency · Timezone · Date Format · Academic Calendar · Tax Rules · Holiday Calendar · Localization।

## ৩৪. Domain, Hosting ও Analytics

- Platform Subdomain ও Custom Domain — দুটোই সাপোর্ট, Domain mapping স্বয়ংক্রিয়, কোনো কোড পরিবর্তন লাগবে না।
- প্রতিটা Organization-এর নিজস্ব Analytics + Platform Owner-এর জন্য Platform-wide Analytics।

## ৩৫. Disaster Recovery

Database Backup · Media Backup · Point-in-Time Recovery · Restore Wizard · Disaster Recovery Plan · Health Monitoring — এবং Organization-wise Backup/Restore/Export/Clone/Migration।

## ৩৬. Performance & Scalability

Redis Cache · CDN · Search Index · Background Workers · Object Storage · Horizontal Scaling · Monitoring · Observability · Auto Scaling · Load Balancer — ৫,০০০+ Organization স্কেলে পৌঁছানোর জন্য অপরিহার্য।

## ৩৭. Self-Service Onboarding (দীর্ঘমেয়াদী লক্ষ্য)

WordPress.com-এর মতো — নতুন Organization নিজেই Register করবে, সিস্টেম নিজে থেকেই Default Setup (Website + ERP + Theme + Pages + Menus + Roles + Super Admin) তৈরি করে দেবে — সম্পূর্ণ No-Code।

## ৩৮. License System (Self-Hosted বিক্রির জন্য)

License Key · Activation · Renew · Expiry · Update Channel — Self-Hosted Version ভবিষ্যতে বিক্রি করতে চাইলে এখন থেকেই এই Foundation দরকার।

---

## ৩৯. Feature Flag System ⭐⭐⭐⭐⭐

নতুন Feature সবাইকে একসাথে দেওয়া হবে না — Microsoft/Google/GitHub-এর মতো প্রতিটা Feature একটা Flag দিয়ে নিয়ন্ত্রিত হবে।

- **State:** Enable · Disable · Beta · Internal · Experimental · Deprecated
- **Scope উদাহরণ:** নতুন Attendance System শুধু Rahmania-তে চালু, বাকিদের জন্য বন্ধ; অথবা AI Chat শুধু Premium Plan-এ চালু, Free Plan-এ বন্ধ

## ৪০. Tenant Clone System ⭐⭐⭐⭐⭐

Platform Console থেকেই এক Organization-কে Clone করে নতুন Organization তৈরি করা যাবে:

```
Create New Organization → Clone Existing Organization (যেমন Rahmania) → Everything Copy
```

Copy হবে: Website · Menus · Theme · Roles · Academic Structure · Forms · PDF Templates · Modules — এতে নতুন Organization Onboard করতে সময় অনেক কমে যাবে।

## ৪১. Template Library ⭐⭐⭐⭐⭐

Organization তৈরি করার সময় Ready-Made Template বেছে নিলেই সবকিছু প্রস্তুত হয়ে যাবে: Madrasa Template · School Template · College Template · University Template · Hifz Template · Kindergarten Template।

## ৪২. Settings Registry ⭐⭐⭐⭐⭐

আজকে General/Website/SEO/SMS/Email/Exam/Admission/Attendance Settings আছে — কিন্তু ভবিষ্যতে ১,০০০+ Settings হবে। তাই কোনো Settings Hardcode করা যাবে না — একটা **Dynamic Settings Registry** থাকবে, যেখানে নতুন Setting যোগ করা মানে শুধু Registry-তে একটা এন্ট্রি, কোনো নতুন Code না।

## ৪৩. Config Registry ⭐⭐⭐⭐⭐

সব Configuration Database থেকে আসবে, Code-এ Hardcode থাকবে না। যেমন: Attendance Start Time · Exam Grade Rules · Fee Rules · ID Format · Invoice Format · Certificate Number Format · Roll Number Format · Admission Number Format।

## ৪৪. Theme Marketplace — সম্প্রসারিত সক্ষমতা

শুধু Theme কেনাবেচা না — প্রতিটা Theme-এর জন্য থাকবে: Theme Version · Theme Update · Theme Clone · Theme Export · Theme Import · Theme Backup।

## ৪৫. Organization Snapshot ⭐⭐⭐⭐⭐

```
Platform Console → Create Snapshot → Restore / Clone / Download
```

একটা Organization-এর যেকোনো মুহূর্তের সম্পূর্ণ অবস্থা Snapshot হিসেবে সংরক্ষণ করা যাবে, এবং প্রয়োজনে সেখান থেকে Restore, Clone বা Download করা যাবে।

## ৪৬. Health Center ⭐⭐⭐⭐⭐

প্রতিটা Organization-এর জন্য একটা Health Dashboard — Green/Red Status দেখাবে: Storage · Database · Performance · API · Email · SMS · Cron · Queue · SSL · Backup · Security · Domain।

## ৪৭. Upgrade Center ⭐⭐⭐⭐⭐

নতুন Version (যেমন 2.3 → 2.4) এলে প্রতিটা Organization নিজের সুবিধামতো সিদ্ধান্ত নিতে পারবে: **Update Now · Schedule · Rollback**।

## ৪৮. Internal Package System ⭐⭐⭐⭐⭐

Attendance, Fees, Exam, Notice, Website, Library, Transport — সবকিছু একেকটা **Internal Package** হিসেবে গঠিত হবে (Plugin & Extension Framework-এর ভিত্তি — দেখুন §২৮)। এতে ভবিষ্যতে এই একই Package-গুলোকে বাইরের Plugin-এ রূপান্তর করা সহজ হবে।

## ৪৯. Capability System ⭐⭐⭐⭐⭐

**Permission** আর **Capability** — দুটো আলাদা জিনিস:

| Permission (কী করতে পারবে) | Capability (কতটুকু/কোন সুবিধা পাবে) |
|---|---|
| Create Student | Maximum Students |
| Edit Student | Unlimited Branch |
| Delete Student | AI Access, Storage Limit, SMS Quota, Export PDF, API Access, Marketplace Access |

Capability নির্ধারিত হবে Organization-এর **Subscription Plan** অনুযায়ী (Subscription & Billing Engine, §২৫-এর সাথে সরাসরি সংযুক্ত)।

## ৫০. Developer Mode ⭐⭐⭐⭐⭐

Platform Owner চাইলে একটা বিশেষ Developer Mode চালু করতে পারবেন, যেখানে Debug Info, SQL Query, Logs, Events, API Calls, Queue ও Job Status দেখা যাবে। **Production Organization এই মোড কখনো চালু করতে পারবে না।**

## ৫১. System Update Channel ⭐⭐⭐⭐⭐

Update Channel: **Stable · Beta · Alpha · Nightly** — যেমন Rahmania (Reference Implementation) Beta Channel-এ থাকতে পারে নতুন Feature আগে টেস্ট করার জন্য, আর Future Academy-র মতো Production Client Stable Channel-এ থাকবে।

## ৫২. Internal Event Bus ⭐⭐⭐⭐⭐

Event-Driven Architecture (§১৮)-এর ভিত্তি হিসেবে একটা স্পষ্ট Internal Event Bus থাকবে:

```
Internal Event Bus → Queue → Automation → Notification → Audit → AI → Analytics
```

অর্থাৎ প্রতিটা Event একবার Bus-এ প্রকাশ পেলেই Queue, Automation, Notification, Audit, AI, এবং Analytics — সবাই স্বাধীনভাবে সেটা "শুনে" নিজের কাজ করবে, একে অপরের সাথে সরাসরি সংযুক্ত থাকবে না (Loose Coupling)।

## ৫৩. System Registry — Platform-এর "Brain" ⭐⭐⭐⭐⭐

সব Registry এক জায়গায় কেন্দ্রীভূত থাকবে: Module Registry · Theme Registry · Permission Registry · Role Registry · Builder Registry · Widget Registry · Template Registry · Provider Registry · Integration Registry · Event Registry · Automation Registry · Plugin Registry · API Registry।

> 🧠 এই System Registry-ই আসলে পুরো Platform-এর "Brain" — যেকোনো নতুন Module/Theme/Permission/Builder/Widget/Template ইত্যাদি প্রথমে এখানে Register হবে, এরপর Platform-এর বাকি সব অংশ (Menu, Navigation, Settings, Permission Tree) স্বয়ংক্রিয়ভাবে সেটা চিনে নেবে।

---

## ৫৪. এখন পর্যন্ত যা তৈরি হয়েছে (Prototype Status)

আপনার আপলোড করা zip অনুযায়ী — এটা এখনো **শুধু UI Prototype**, কোনো real integration নেই:

| বিষয় | অবস্থা |
|---|---|
| নতুন ফোল্ডার | `app/(platform-console)/platform-console/` ও `src/features/platform-console/` — existing কোনো ফাইল টাচ করা হয়নি |
| ডেটা | সম্পূর্ণ Mock/In-memory (`platformConsoleClient.js`) |
| Real Supabase Connection | ❌ নেই — Phase 1 migration (`organizations` টেবিল, `organization_id` কলাম) এখনো রান হয়নি |
| Auth | Login form শুধু UI — কাজ করে না |
| Route Protection | `middleware.js`-এ এখনো `/platform-console` protect করা হয়নি |
| Security Risk | নেই — এখনো `has_permission()`/RLS-এর সাথে কোনো সংযোগ নেই |
| UI Kit | Existing shadcn/ui, Tailwind, lucide-react-ই reuse করা হয়েছে |
| ফাইল সাইজ | সব ফাইল ২০০ লাইনের নিচে |

**বসানোর উপায়:** zip-এর `app/` ও `src/` ফোল্ডার existing repo-র root-এ কপি (merge) করে `npm run dev` চালিয়ে `/platform-console` রুটে ভিজিট করলেই দেখা যাবে।

## ৫৫. Roadmap — Phase by Phase

### Phase 0 — UI Review
- [x] Platform Console UI প্রোটোটাইপ তৈরি
- [ ] Design/Flow/Layout দেখে অনুমোদন

### Phase 1 — Database Foundation
- [ ] `organizations` টেবিল, `organization_id` কলাম, RLS পলিসি, Rahmania migration
- [ ] Database Layer Infrastructure-Agnostic ভাবে ডিজাইন
- [ ] সব টেবিলে Database Standard কলাম বসানো (দেখুন Part C §৩)

### Phase 2 — Platform Console + Core Services বাস্তবায়ন
- [ ] Platform Owner-এর আলাদা Auth Flow, Route Protection
- [ ] `platformConsoleClient.js` mock → real Supabase query
- [ ] Permission Tree persist, Module Toggle real টেবিলে read/write
- [ ] **Core Platform Services** স্থাপন (Auth/Authz/Notification/File/Media/Search/Audit/AI/Analytics/Billing/Workflow/Automation Service)
- [ ] পূর্ণাঙ্গ Audit Timeline Foundation
- [ ] **System Registry** (Module/Theme/Permission/Role/Builder/Widget/Template/Provider/Integration/Event/Automation/Plugin/API Registry) — Platform-এর Brain হিসেবে সবার আগে স্থাপন
- [ ] **Settings Registry** ও **Config Registry** (Hardcode এড়িয়ে সব Setting/Config Dynamic রাখা)
- [ ] **Feature Flag System** (Enable/Disable/Beta/Internal/Experimental/Deprecated)
- [ ] **Capability System** (Permission বনাম Capability আলাদা করে ডিজাইন, Plan-ভিত্তিক)

### Phase 3 — Organization-Aware Existing Features + Academic Engine
- [ ] সব existing মডিউলে `organization_id` isolation, Branch Isolation
- [ ] **Academic Engine** (Board/Curriculum/Session/Semester/Department/Faculty/Program/Course/Subject/Group/Shift/Section/Class)
- [ ] Existing মডিউলগুলোকে ধীরে ধীরে **Internal Package** আকারে পুনর্গঠন (Attendance/Fees/Exam/Notice/Website/Library/Transport)

### Phase 4 — Website, Builder ও Media সিস্টেম
- [ ] Page/Section/Menu/Form/PDF/Theme Builder + Visual Site Builder Flow
- [ ] **Draft → Preview → Publish → Rollback** সব Builder-এ
- [ ] **Version Control** সব Builder-এ
- [ ] **Media Library** (Folder/Tags/Version History/Compression/Watermark/Duplicate Detection/Bulk Upload/Recycle Bin)
- [ ] **Soft Delete & Recycle Bin** সব Module-এ
- [ ] **Template Library** (Madrasa/School/College/University/Hifz/Kindergarten Template)

### Phase 5 — Domain, Hosting, Analytics ও White Label
- [ ] Subdomain/Custom Domain অটো-ম্যাপিং
- [ ] Organization-wise + Platform-wide Analytics
- [ ] White Label (Logo/Company Name/Support Email/Login URL/Copyright/Favicon/Email-SMS Templates)

### Phase 6 — Operations Foundation
- [ ] Job Queue System, Scheduler System (Cron)
- [ ] Notification Center, Import/Export Engine, Workflow Builder Foundation
- [ ] **Universal/Global Search Engine**
- [ ] Backup & Restore (Organization-wise: Backup/Restore/Export/Clone/Migration)
- [ ] **Dynamic Dashboard Builder**, **No-Code Report Builder**

### Phase 7 — Self-Service Onboarding & Intelligence Foundation
- [ ] Registration → Auto Organization → Default Setup পাইপলাইন
- [ ] Visual Site Builder ফ্লো Organization নিজে ব্যবহার করা
- [ ] **Automation Builder** (No-Code IF-THEN Rules)
- [ ] **Event-Driven Architecture** (Domain Events: Student Created, Fee Paid ইত্যাদি)
- [ ] **Internal Event Bus** স্পষ্টভাবে স্থাপন (Bus → Queue → Automation → Notification → Audit → AI → Analytics)

### Phase 8 — API-First, Billing, Marketplace ও Extensibility
- [ ] API-First Architecture (REST/Webhooks/OAuth/API Keys/SDK/Rate Limiting/API Analytics)
- [ ] **Subscription & Billing Engine**
- [ ] **Plugin & Extension Framework**
- [ ] Plugin/Theme/Template/Report/Certificate/AI Prompt Marketplace (Theme Marketplace-এ Version/Update/Clone/Export/Import/Backup সহ)
- [ ] License System (Self-Hosted বিক্রির জন্য)
- [ ] AI Platform Foundation (Assistant/Chat/Report/Analytics/Content/SEO/Exam Generator ইত্যাদি)

### Phase 9 — Performance & Scale
- [ ] Redis Cache, CDN, Search Index, Object Storage
- [ ] Background Workers, Horizontal Scaling, Auto Scaling, Load Balancer
- [ ] Monitoring, Observability, Disaster Recovery Plan

### Phase 10 — Mobile & Multi-Country Expansion
- [ ] Mobile Ecosystem (Android/iOS/PWA — Parent/Teacher/Student/Owner App)
- [ ] Multi-Country Readiness (Language/Currency/Timezone/Tax/Holiday Calendar)

### Phase 11 — Platform Operations Intelligence
- [ ] **Tenant Clone System** (এক Organization থেকে ক্লিক করে নতুন Organization তৈরি)
- [ ] **Organization Snapshot** (Create Snapshot → Restore/Clone/Download)
- [ ] **Health Center** (Storage/Database/Performance/API/Email/SMS/Cron/Queue/SSL/Backup/Security/Domain — Green/Red)
- [ ] **Upgrade Center** (Update Now/Schedule/Rollback প্রতি Organization-এ)
- [ ] **Developer Mode** (শুধু Platform Owner-এর জন্য: Debug/SQL/Logs/Events/API/Queue/Jobs — Production Organization-এ বন্ধ)
- [ ] **System Update Channel** (Stable/Beta/Alpha/Nightly — প্রতি Organization ভিন্ন Channel-এ থাকতে পারবে)

> ⚠️ **প্রতিটা Phase শেষে থামতে হবে এবং পরবর্তী Phase-এ যাওয়ার আগে Part D-এর Quality Gate পাশ করে স্পষ্ট অনুমোদন নিতে হবে — কখনো স্বয়ংক্রিয়ভাবে এগোনো যাবে না।**

---
---

# 🅲 PART C — ENGINEERING STANDARDS (Development Rules)

> এই অংশ **Feature না — এটা নিয়ম।** AI Agent বা যেকোনো Developer এই নিয়মগুলো ভাঙতে পারবে না, ব্যতিক্রম শুধু Platform Owner-এর স্পষ্ট অনুমোদনে।

## ৫৬. Core Design Principles ⭐⭐⭐⭐⭐

Security First · API First · Multi-Tenant by Design · Configuration over Hardcoding · No-Code First · Modular Architecture · Performance First · Accessibility · Scalability · Maintainability · Backward Compatibility · Simplicity

## ৫৭. যা কখনোই করা যাবে না (Never Rules) ⭐⭐⭐⭐⭐

- Organization ID hardcode করা
- Branch ID hardcode করা
- Module Name hardcode করা
- Menu hardcode করা
- Theme hardcode করা
- Permission hardcode করা
- Code বা Component Duplicate করা
- RLS Bypass করা
- Secret কোডের ভেতরে রাখা
- সুবিধার জন্য Security বন্ধ/শিথিল করা

## ৫৮. Database Standards ⭐⭐⭐⭐⭐

সব Table একই কলাম-প্যাটার্ন ও Naming Convention মেনে চলবে:

```
id · organization_id · branch_id
created_at · updated_at · created_by · updated_by
deleted_at · status · metadata (jsonb)
```

## ৫৯. API Standards

সব API একই প্যাটার্ন মেনে চলবে: Authentication · Authorization · Validation · Rate Limit · Audit Log · Response Format · Error Format।

## ৬০. UI Standards

সব পেজ একই Layout, Spacing, Button, Color, Table, Form, Modal, Animation, Loading State, Empty State, Error State অনুসরণ করবে — কোনো পেজ যেন "একা রকমের" না লাগে।

## ৬১. Security Standards ⭐⭐⭐⭐⭐

Zero Trust · Least Privilege · JWT · RLS · Encrypted Secrets · CSRF Protection · XSS Protection · SQL Injection Protection · Rate Limiting · Session Timeout · Audit Logging।

## ৬২. Coding Standards

Max ~400 লাইন/ফাইল · Reusable Components · Reusable Hooks · No Large Monolithic Files · No Duplicate Logic · Type-Safe Code · Well-Documented Code।

## ৬৩. Performance Standards

Lazy Loading · Caching · Image Optimization · Pagination · Server Components · React Query · Virtualization · Redis।

## ৬৪. Monitoring

Logs · Error Tracking · Performance Metrics · Database Metrics · Queue Monitoring · Health Check।

## ৬৫. Disaster Recovery (Development Practice)

Backup · Restore · Rollback · Database Recovery · File Recovery — প্রতিটা Deployment-এর আগে ভাবতে হবে "এটা ব্যর্থ হলে কীভাবে ফিরে আসব?"

## ৬৬. Internationalization (i18n)

Language · Currency · Date Format · Timezone · Number Format — সব শুরু থেকেই Dynamic/Configurable রাখতে হবে, পরে যোগ করা কঠিন হবে।

## ৬৭. Accessibility

Keyboard Navigation · Screen Reader Support · Color Contrast · Font Scaling · RTL Support।

## ৬৮. Documentation Rules

প্রতিটা বড় Feature-এর জন্য Architecture, Database, API, Flow, এবং Permission ডকুমেন্টেশন থাকতে হবে।

## ৬৯. Testing Rules ⭐⭐⭐⭐⭐

কোনো কাজ Test ছাড়া "Complete" বলা যাবে না: Unit Test · Integration Test · Permission Test · RLS Test · Performance Test · Regression Test — সব Pass করতে হবে।

## ৭০. Release Process ⭐⭐⭐⭐⭐

```
Develop → Review → Test → Staging → Approval → Production → Monitoring
```

কখনো সরাসরি Production-এ পরিবর্তন করা যাবে না।

---
---

# 🅳 PART D — QUALITY GATES

## ৭১. Phase Complete Checklist (Success Criteria)

প্রতিটা Phase শেষে AI Agent নিজেই এই তালিকা যাচাই করবে:

- ☐ Existing Features Working
- ☐ Existing SEO Unchanged
- ☐ Existing API Working
- ☐ Existing ERP Working
- ☐ Existing Website Working
- ☐ Existing Login Working
- ☐ Existing RLS Working
- ☐ No Performance Drop
- ☐ No Security Regression
- ☐ No Duplicate Code
- ☐ No Hardcoding
- ☐ All Tests Passed
- ☐ Documentation Updated
- ☐ Ready For Approval

## ৭২. Definition of Done (DoD) ⭐⭐⭐⭐⭐

> **A phase is NOT considered complete until:**
> - সব Feature কাজ করছে।
> - কোনো Existing Feature নষ্ট হয়নি।
> - Security Test Pass হয়েছে।
> - RLS Test Pass হয়েছে।
> - Performance Acceptable।
> - Documentation Update হয়েছে।
> - Code Review হয়েছে।
> - Manual Verification সম্পন্ন হয়েছে।
> - **Platform Owner Approval পাওয়া গেছে।**

এই DoD ছাড়া AI Agent যেন কখনো নিজে থেকে "কাজ শেষ" বলে ঘোষণা না দেয় — অর্ধেক কাজ করে সম্পূর্ণ বলার সুযোগ এখানেই বন্ধ করা হলো।

---
---

## ৭৩. এক নজরে সারমর্ম

| প্রশ্ন | উত্তর |
|---|---|
| এটা কী হয়ে যাচ্ছে? | Single ERP → Multi-Tenant Educational SaaS Platform (Education-এর SAP হওয়ার লক্ষ্যে) |
| Architecture আর Infrastructure কি একই জিনিস? | না — Architecture শুরু থেকেই Enterprise-Grade (১০,০০০+ Organization-Ready), কিন্তু Infrastructure শুরুতে Simple/Low-Cost রেখে ধাপে ধাপে Upgrade হবে, Core বদলাবে না |
| Rahmania-র ভূমিকা কী? | Organization #1 / Reference Implementation — বিশেষ সুবিধা নেই, তবে সচেতন Staged Rollout সম্ভব |
| Existing কিছু ভাঙবে? | না — সব Additive, Backward Compatible |
| ডেটা আলাদা থাকবে কীভাবে? | `organization_id` + RLS + Database Standards |
| সব Module একই Service ব্যবহার করবে? | হ্যাঁ — Core Platform Services (Auth/Notification/Search/Media/AI/Billing ইত্যাদি) |
| কোড কি ভবিষ্যতে বদলাতে হবে? | না — Configuration/Builder/Module/Settings দিয়েই সব সমাধান |
| Update দিলে সব Organization একসাথে বদলে যাবে? | না — Versioning/Rollback সাপোর্ট থাকবে |
| Website Edit করলে সঙ্গে সঙ্গে Live হবে? | না — Draft → Preview → Publish |
| Delete করলে ডেটা হারিয়ে যাবে? | না — Soft Delete & Recycle Bin থাকবে |
| ৫,০০০+ Organization হলে টিকবে? | হ্যাঁ — Phase 9-এ Redis/CDN/Auto-Scaling/Monitoring থাকবে |
| Developer/AI Agent ভুল করলে কীভাবে ধরা পড়বে? | Part C-এর Engineering Standards + Part D-এর Definition of Done |
| একটা Phase কখন "শেষ" ধরা হবে? | শুধু তখনই, যখন DoD-এর প্রতিটা শর্ত পূরণ হবে এবং Platform Owner Approve করবেন |
| নতুন Feature সবাইকে একসাথে দিতে হবে? | না — Feature Flag System দিয়ে Organization/Plan-ভেদে আলাদা করে Enable/Beta/Disable করা যাবে |
| নতুন Organization বানাতে সব আবার সেটআপ করতে হবে? | না — Tenant Clone System ও Template Library দিয়ে মিনিটেই Ready |
| Settings/Config যোগ করতে কোড লাগবে? | না — Settings Registry ও Config Registry সব Dynamic রাখবে |
| Organization-এর স্বাস্থ্য কীভাবে বোঝা যাবে? | Health Center-এ Green/Red স্ট্যাটাসে |
| কাজের গতি কেমন হবে? | ধাপে ধাপে (Phase 0 → 11), প্রতি Phase-এ থেমে অনুমোদন নিয়ে | 

74. Architecture Decision Records (ADR) ⭐⭐⭐⭐⭐

Every major architectural decision must be documented before implementation.

Each ADR should include:

Decision ID
Date
Context
Problem Statement
Options Considered
Selected Solution
Reasons
Consequences
Future Impact

This ensures every important architectural decision is traceable and understandable years later.

75. Domain-Driven Design (DDD) Boundaries ⭐⭐⭐⭐⭐

The platform should be organized into clear business domains.

Example domains:

Platform Management
Organization Management
Academic Management
Student Management
Teacher Management
Attendance
Finance
Website
Communication
Reporting
AI
Billing

Each domain must own its business logic.

Domains must communicate through Events, APIs, or Shared Services rather than directly accessing each other's internal implementation.

76. Repository & Service Layer Standards ⭐⭐⭐⭐⭐

Business logic must never be placed inside UI components, pages, or API routes.

Every feature should follow a layered architecture:

UI
↓
API
↓
Service Layer
↓
Repository Layer
↓
Database

Repositories are responsible only for data access.

Services contain business rules.

77. Database Migration Policy ⭐⭐⭐⭐⭐

Database changes must always be versioned.

Rules:

Never manually edit production tables.
Every schema change requires a migration.
Migrations must be reversible whenever possible.
Existing production data must always be preserved.
Backward compatibility must be maintained.
78. API Versioning Policy ⭐⭐⭐⭐⭐

Public APIs must support versioning.

Example:

/api/v1/
/api/v2/

Breaking changes must never replace existing APIs.

Older versions should remain available until officially deprecated.

79. Semantic Versioning Policy ⭐⭐⭐⭐⭐

Every platform release must follow Semantic Versioning.

Format:

Major.Minor.Patch

Example

1.0.0
1.2.0
1.2.5
2.0.0

Major

Breaking Changes

Minor

New Features

Patch

Bug Fixes

80. Deprecation Policy ⭐⭐⭐⭐⭐

No feature should be removed immediately.

Lifecycle:

Active

↓

Deprecated

↓

Hidden

↓

Disabled

↓

Removed

Organizations must receive advance notice before removal.

Whenever possible, provide migration tools.

81. Release Notes Standard ⭐⭐⭐⭐⭐

Every release must include documentation describing:

New Features
Improvements
Bug Fixes
Performance Changes
Security Fixes
Database Changes
Breaking Changes
Migration Instructions
82. Observability Standards ⭐⭐⭐⭐⭐

The platform must provide complete operational visibility.

Monitor:

Application Logs
Error Logs
API Performance
Database Queries
Queue Processing
Cache Performance
Background Jobs
Scheduled Tasks
Resource Usage

Monitoring must help diagnose problems before users notice them.

83. Secret Management & Rotation Policy ⭐⭐⭐⭐⭐

Secrets must never be hardcoded.

Examples:

JWT Secret
API Keys
Database Credentials
SMTP Passwords
Payment Gateway Keys

Requirements:

Environment Variables Only
Secure Storage
Periodic Secret Rotation
Immediate Revocation when compromised
Audit Logging for Secret Changes
84. Disaster Rollback Policy ⭐⭐⭐⭐⭐

Every deployment must support safe rollback.

Before deployment:

Database Backup
Configuration Backup
Environment Validation
Migration Validation

After deployment:

Health Verification
Performance Verification
Error Monitoring

If critical problems occur:

Rollback Application
Rollback Database (if required)
Restore Configuration
Notify Platform Owner

No deployment should leave the platform in an unrecoverable state.


Part A — Vision & Goals

Part B — Architecture & Roadmap

Part C — Engineering Standards

Part D — Quality Gates

Part E — Enterprise Governance & Lifecycle Standards
    74. Architecture Decision Records
    75. Domain-Driven Design Boundaries
    76. Repository & Service Layer Standards
    77. Database Migration Policy
    78. API Versioning Policy
    79. Semantic Versioning Policy
    80. Deprecation Policy
    81. Release Notes Standard
    82. Observability Standards
    83. Secret Management & Rotation Policy
    84. Disaster Rollback Policy  
    # Cost Optimization Rules (Current Development Phase)

The current target is to build the platform on free or very low-cost infrastructure.

... ## Cost Optimization Rules

The current target is to build the platform on free or very low-cost infrastructure.

The AI Agent must prioritize architectural quality over infrastructure complexity.

### Rules

- Do not introduce paid services unless explicitly approved by the Platform Owner.
- Prefer Supabase Free, Vercel Free, Cloudinary Free and open-source libraries.
- Design every feature so that it can scale later without changing the application architecture.
- Expensive infrastructure (Redis, CDN, Background Workers, Monitoring, Load Balancer, Marketplace, Billing, AI Services, Mobile Backend, Enterprise Analytics) must be implemented only as future-ready foundations or interfaces unless the feature is immediately required.
- Configuration, database schema, registries and APIs may be prepared in advance, but resource-intensive services should remain disabled until needed.
- Never implement infrastructure that increases monthly cost without a measurable benefit.
- Build for long-term scalability while keeping the initial operational cost as close to zero as possible.
- Every paid dependency must have a clear justification and an open-source or free alternative considered first.  

১. Project Status Rules ⭐⭐⭐⭐⭐



## Current Project Status

Current Phase:
Current Milestone:
Current Priority:
Last Completed Phase:
Next Approved Phase:

The AI Agent must always verify the current project phase before starting any implementation.

Never start a future phase unless it has been explicitly approved by the Platform Owner.
২. Change Impact Analysis ⭐⭐⭐⭐⭐

## Change Impact Analysis

Before implementing any architectural or database change, analyze:

- Existing features affected
- Database impact
- API impact
- Security impact
- SEO impact
- Performance impact
- Migration requirements
- Rollback strategy

If high risk is detected, propose alternative solutions before implementation.
৩. Technical Debt Policy ⭐⭐⭐⭐⭐



## Technical Debt Policy

Avoid temporary fixes whenever possible.

If a temporary solution is unavoidable:

- Clearly document it.
- Explain why it exists.
- Define how it should be replaced.
- Add it to the Technical Debt list.

Never leave hidden technical debt.
৪. Dependency Rules ⭐⭐⭐⭐⭐



## Dependency Policy

Before adding a new dependency:

- Check whether existing libraries already solve the problem.
- Prefer native browser or framework capabilities.
- Prefer open-source libraries.
- Avoid duplicate functionality.
- Avoid abandoned libraries.
- Justify every new dependency.
৫. Performance Budget ⭐⭐⭐⭐⭐



## Performance Budget

New features must not significantly increase:

- Bundle Size
- Initial Load Time
- Database Queries
- API Response Time
- Memory Usage

Performance regressions must be measured before approval.
৬. Security Review Checklist ⭐⭐⭐⭐⭐
## Security Review

Before marking any feature complete:

- Permission Review
- RLS Review
- Authentication Review
- Authorization Review
- Secret Exposure Review
- Input Validation Review
- Rate Limiting Review
- Audit Logging Review
৭. Database Design Principles ⭐⭐⭐⭐⭐
## Database Design Principles

Every table should:

- Support organization isolation.
- Support future extensibility.
- Avoid duplicated data.
- Prefer normalization unless denormalization is justified.
- Use proper indexes.
- Support audit logging.
- Support soft delete where appropriate.
৮. AI Decision Rules ⭐⭐⭐⭐⭐



## AI Decision Rules

When multiple implementation options exist:

- Choose the most maintainable.
- Choose the most scalable.
- Choose the least disruptive.
- Preserve backward compatibility.
- Minimize future refactoring.

If no option satisfies all goals, present alternatives and wait for Platform Owner approval.
৯. Documentation Update Policy ⭐⭐⭐⭐⭐
## Documentation Policy

Whenever architecture changes:

Update:

- Architecture Diagram
- Database Diagram
- API Documentation
- Permission Documentation
- Migration Documentation
- ADR

Documentation must never lag behind implementation.
১০. Code Review Checklist ⭐⭐⭐⭐⭐
## Code Review Checklist

Before merging:

- No duplicate logic
- No hardcoded values
- No unused imports
- No dead code
- Proper naming
- Proper error handling
- Proper logging
- Consistent formatting  

1. Risk Management Policy ⭐⭐⭐⭐⭐
## Risk Management Policy

Before implementing any major feature, the AI Agent must identify potential risks.

Risk categories:

- Security Risk
- Performance Risk
- Database Risk
- Scalability Risk
- User Experience Risk
- Cost Risk
- Migration Risk

For every high-risk change, provide:

- Risk description
- Probability
- Impact
- Mitigation strategy
- Rollback strategy

Never implement high-risk changes without Platform Owner approval.
2. Backward Compatibility Policy ⭐⭐⭐⭐⭐
## Backward Compatibility Policy

Every new feature must preserve compatibility with existing functionality.

Rules:

- Existing APIs must continue working.
- Existing URLs must remain valid.
- Existing database records must remain usable.
- Existing workflows must continue functioning.
- Existing permissions must remain valid.

Breaking changes require:

- Migration strategy
- Rollback plan
- Platform Owner approval

Backward compatibility always takes priority over rapid development.
3. Code Ownership & Responsibility ⭐⭐⭐⭐⭐
## Code Ownership Principles

Every new module must have clearly defined ownership.

Each module should define:

- Responsibilities
- Dependencies
- Public Interfaces
- Internal Components

Modules must communicate only through approved interfaces.

No module should directly manipulate another module's internal implementation.
4. Data Lifecycle Policy ⭐⭐⭐⭐⭐
## Data Lifecycle Policy

Every data entity must define its lifecycle.

Typical lifecycle:

Created
↓
Active
↓
Updated
↓
Archived
↓
Soft Deleted
↓
Permanently Deleted (Retention Policy)

The platform must preserve historical data whenever possible.

Permanent deletion should be restricted and fully audited.
5. AI Implementation Principles ⭐⭐⭐⭐⭐
## AI Implementation Principles

Artificial Intelligence is an optional enhancement layer.

AI must never become a dependency for core platform functionality.

Rules:

- The platform must operate fully without AI.
- AI services should be replaceable.
- AI providers must remain configurable.
- AI failures must never interrupt normal ERP operations.
- AI-generated content must always allow human review before publication.

# Core Non-Negotiable Principles

These principles override every other guideline in this document.

1. Never break existing production functionality.
2. Always preserve backward compatibility.
3. Never sacrifice security for convenience.
4. Prefer configuration over hardcoding.
5. Prefer reusable architecture over quick implementation.
6. Build incrementally and stop after each approved phase.
7. Never implement unapproved future phases.
8. Keep infrastructure cost low without compromising architecture.
9. Every major decision must be documented.
10. When uncertain, ask the Platform Owner before proceeding. 

## Supabase Migration Rules (Mandatory)

Whenever a database schema change is required, ALWAYS generate a proper Supabase migration SQL file.

### Rules

- NEVER ask me to manually write SQL if you can generate it.
- Create production-ready migration SQL compatible with PostgreSQL and Supabase.
- Every migration must be safe, idempotent, and backward compatible.
- Use `IF EXISTS` and `IF NOT EXISTS` wherever possible.
- Preserve all existing data.
- Never drop tables, columns, constraints, indexes, functions, or policies unless I explicitly approve.
- Never perform destructive operations without confirmation.
- Include comments explaining each section of the migration.
- Generate complete migration files, not partial SQL snippets.
- If new tables are created, also generate:
  - Primary Keys
  - Foreign Keys
  - Indexes
  - Constraints
  - RLS Enable
  - RLS Policies
  - Grants (if required)
  - Triggers (updated_at, etc.) when applicable
- If existing tables are modified, ensure the migration is fully backward compatible.
- Generate corresponding rollback SQL when feasible, or clearly document why rollback is limited.
- Follow the existing project naming conventions and database architecture.
- Name migration files using chronological timestamps or the project's existing migration naming convention.
- Before generating any migration, first analyze the current schema to avoid duplicate columns, duplicate tables, duplicate indexes, duplicate constraints, duplicate functions, duplicate triggers, or conflicting objects.
- If a migration depends on another migration, clearly state the dependency.
- Every migration must be validated for PostgreSQL syntax before considering it complete.
- At the end of every migration, provide a short verification checklist describing what should be tested after execution.

### Output Format

For every required database change, provide:

1. Migration filename
2. Purpose
3. Complete SQL migration
4. Rollback strategy (if applicable)
5. Verification checklist
6. Risk level (Low / Medium / High)

Never leave database changes undocumented.
Always prefer migration files over manual SQL instructions.