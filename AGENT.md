# AGENT.md

# Rahmania Institute ERP & Website Development Guidelines

This document defines the mandatory rules for working on the Rahmania Institute project. Every task must follow these instructions without exception.

---

# Primary Objective

The goal is to build and maintain a professional, secure, scalable, high-performance, and long-lasting ERP and public website.

Every change must improve the project, not increase unnecessary complexity.

Always think before writing code.

---

# Understand Before You Build

Never guess.

Never assume.

Before changing anything:

* Read the related files.
* Understand the current architecture.
* Understand how the feature currently works.
* Identify dependencies.
* Check whether a similar implementation already exists.
* Reuse existing code whenever possible.

If something is unclear, investigate first instead of making assumptions.

---

# Minimum Change Principle

Do not rewrite working code.

Do not replace existing functionality.

Do not redesign working systems.

Only modify the smallest amount of code necessary to solve the problem.

If a file does not need modification, leave it untouched.

---

# Avoid Duplicate Work

Never create:

* duplicate components
* duplicate pages
* duplicate APIs
* duplicate utility functions
* duplicate database tables
* duplicate SQL
* duplicate business logic

Always search the project before creating anything new.

Reuse existing code whenever possible.

---

# File Size Rules

Keep the codebase clean.

No source file should exceed **500 lines**.

Target size is **300–400 lines** whenever practical.

If a file becomes too large:

* split it into reusable components
* split utilities
* split hooks
* split services
* split API logic
* split constants
* split validation
* split types

Never split code randomly.

Split by responsibility.

---

# Clean Architecture

Every file should have a single responsibility.

Keep business logic separate from UI.

Avoid deeply nested code.

Avoid unnecessary abstractions.

Prefer readable code over clever code.

Future developers should understand the project quickly.

---

# Public Website Protection & RLS Security (পাবলিক ওয়েবসাইট ও সিকিউরিটি গাইডলাইন)

The public website is extremely important.

The following sections must always remain publicly accessible without login unless explicitly requested otherwise:

* Hero Slider
* Notice Board
* Our Mission
* Sponsors
* Why Choose Rahmania Institute
* Chairman's Message
* Facilities
* Classes
* Gallery
* Branches
* Teachers
* Testimonials
* Blogs
* Success Stories
* Events & Seminars
* FAQ
* Contact
* Institute Portal
* Footer

Never accidentally break public visibility.

Always verify after making changes.

---

# ⚠️ RLS (Row Level Security) নিয়ম — এটি কখনো ভাঙা যাবে না

## মূল নীতি (Core Principle):

**Security মানে "সবকিছু বন্ধ করা" না।**
**Security মানে: "যেটা public, সেটা সবাই দেখতে পারবে। যেটা private, সেটা শুধু authorized user দেখতে পারবে।"**

এই প্রজেক্টে দুই ধরনের table আছে — PUBLIC আর PRIVATE।
দুটোতে আলাদা RLS policy থাকবে। কখনো মিশিয়ে ফেলা যাবে না।

---

## 🟢 PUBLIC Tables — এই table গুলো login ছাড়াই সবাই দেখতে পারবে

নিচের table গুলোর data homepage ও public pages-এ দেখানো হয়।
এই table গুলোতে SELECT policy তে অবশ্যই anonymous (login ছাড়া) access থাকতে হবে।

| Table              | Homepage Section          | SELECT Policy Pattern                                         |
|--------------------|---------------------------|---------------------------------------------------------------|
| `hero_slides`      | Hero Slider               | `USING (true)` অথবা `USING (is_active = true)`               |
| `notices`          | Notice Board              | `USING (true)` — ✅ বর্তমানে ঠিক আছে                         |
| `branches`         | Branches                  | `USING (true)` অথবা `USING (is_active IS DISTINCT FROM false)` |
| `gallery`          | Gallery                   | `USING (true)` — ✅ বর্তমানে ঠিক আছে                         |
| `gallery_items`    | Gallery Photos            | `USING (true)` — ✅ বর্তমানে ঠিক আছে                         |
| `videos`           | Video Gallery             | `USING (true)` — ✅ বর্তমানে ঠিক আছে                         |
| `teachers`         | Teachers Section          | `USING (...) OR (auth.role() = 'anon')` — ✅ ঠিক আছে         |
| `students`         | Student Count (basic)     | `USING (...) OR (auth.role() = 'anon')` — ✅ ঠিক আছে         |
| `blogs`            | Blogs Section             | `USING (is_published = true) OR has_permission('blogs','view')` |
| `faqs`             | FAQ Section               | `USING (is_active IS DISTINCT FROM false) OR has_permission('faqs','view')` |
| `testimonials`     | Testimonials              | `USING (is_active IS DISTINCT FROM false) OR has_permission('testimonials','view')` |
| `courses`          | Classes Section           | `USING (is_active IS DISTINCT FROM false) OR has_permission('courses','view')` |
| `success_stories`  | Success Stories           | `USING (is_active IS DISTINCT FROM false) OR has_permission('success_stories','view')` |
| `events`           | Events & Seminars         | `USING (is_active IS DISTINCT FROM false) OR has_permission('events','view')` |
| `sponsors`         | Sponsors                  | `USING (is_active = true) OR has_permission('sponsors','view')` |
| `page_sections`    | About/Mission/Facilities  | `USING (true)` অথবা `USING (is_visible IS DISTINCT FROM false)` |
| `app_settings`     | Site Settings/Logo/Name   | `USING (true)`                                                |
| `contact_info`     | Contact Information       | `USING (true)`                                                |
| `navbar_items`     | Navigation Menu           | `USING (true)` অথবা `USING (is_active IS DISTINCT FROM false)` |
| `contact_messages` | Contact Form Submission   | INSERT → `WITH CHECK (true)` (সবাই submit করতে পারবে)       |

### PUBLIC Table-এর জন্য সঠিক RLS Pattern:

```sql
-- Pattern 1: সম্পূর্ণ public (সবাই সবকিছু দেখতে পারবে)
CREATE POLICY "table_select" ON public.table_name FOR SELECT USING (true);

-- Pattern 2: Published/Active content public + Admin সবকিছু দেখতে পারবে
CREATE POLICY "table_select" ON public.table_name FOR SELECT USING (
  (is_active IS DISTINCT FROM false)  -- visitor শুধু active item দেখবে
  OR
  (public.has_permission('module', 'view'))  -- admin সব দেখবে (drafts সহ)
);

-- Pattern 3: Published content public + Admin সবকিছু
CREATE POLICY "table_select" ON public.table_name FOR SELECT USING (
  (is_published = true)  -- visitor শুধু published item দেখবে
  OR
  (public.has_permission('module', 'view'))  -- admin সব দেখবে
);
```

**গুরুত্বপূর্ণ:** PUBLIC table-এ INSERT/UPDATE/DELETE সবসময় `has_permission()` দিয়ে protect করা থাকবে — শুধু admin পারবে।

---

## 🔴 PRIVATE Tables — এই table গুলো শুধু login করলে দেখা যাবে

নিচের table গুলোতে sensitive data আছে। এগুলো কখনো publicly accessible হবে না।

| Table                      | Data Type           | SELECT Policy Pattern                                        |
|----------------------------|---------------------|--------------------------------------------------------------|
| `student_fees`             | Fee Records         | `has_permission('fees', 'view') AND branch_isolation`        |
| `attendances`              | Attendance          | `has_permission('student-attendance', 'view') AND branch_isolation` |
| `teacher_attendance`       | Teacher Attendance  | `has_permission('teacher-attendance', 'view') AND branch_isolation` |
| `daily_lessons`            | Daily Lessons       | `has_permission('daily-lesson-tracker', 'view') AND branch_isolation` |
| `hadiya`                   | Hadiya Payments     | `has_permission('hadiya', 'view') AND branch_isolation`      |
| `teacher_payments`         | Teacher Payments    | `has_permission('hadiya', 'view') AND branch_isolation`      |
| `teacher_hadiya`           | Teacher Hadiya      | `has_permission('hadiya', 'view') AND branch_isolation`      |
| `teacher_salary_profiles`  | Salary Profiles     | `has_permission('hadiya', 'view') AND branch_isolation`      |
| `boarding_daily_reports`   | Boarding Reports    | `has_permission('boarding', 'view') AND branch_isolation`    |
| `boarding_expenses`        | Boarding Expenses   | `has_permission('boarding', 'view') AND branch_isolation`    |
| `exam_results`             | Exam Results        | `has_permission() AND branch_isolation`                      |
| `exam_inputs`              | Exam Inputs         | `has_permission('exams', 'view') AND branch_isolation`       |
| `admission_applications`   | Applications        | `has_permission('reserve', 'view') AND branch_isolation`     |
| `expenses`                 | Expenses            | `has_permission() AND branch_isolation`                      |

### PRIVATE Table-এর জন্য সঠিক RLS Pattern:

```sql
-- শুধু authorized + branch-matched user-ই দেখতে পারবে
CREATE POLICY "table_select" ON public.table_name FOR SELECT USING (
  public.has_permission('module', 'view') 
  AND public.check_branch_isolation(branch_id)
);
```

**গুরুত্বপূর্ণ:** PRIVATE table-এ কখনো `USING (true)` বা `auth.role() = 'anon'` দেওয়া যাবে না।

---

## 🏠 Homepage Data — get_home_page_data() RPC Function

Homepage-এর সব data আসে `get_home_page_data()` নামক একটি SECURITY DEFINER function থেকে।

**SECURITY DEFINER মানে:** এই function database owner হিসেবে চলে, তাই RLS policy apply হয় না।
তবুও সরাসরি (direct) Supabase query করলে RLS apply হবে।

**তাই:**
* Homepage-এর জন্য `get_home_page_data()` ব্যবহার করো — RLS bypass হবে, সব public content আসবে।
* Admin panel-এ direct query ব্যবহার করলে RLS apply হবে — এটাই চাই।
* কিন্তু public pages-এ (যেমন `/blogs`, `/events`, `/faq`) যদি direct query ব্যবহার হয়, তাহলে সেই table-এর RLS-এ public SELECT access থাকা বাধ্যতামূলক।

### কোন table-এ কোন access দরকার — সংক্ষেপে:

```
Homepage (RPC function) → SECURITY DEFINER → RLS bypass → সব public data আসে ✅
Public pages (direct query) → RLS apply হয় → SELECT policy তে public access লাগবে ✅
Admin panel (direct query) → RLS apply হয় → has_permission() দিয়ে protect ✅
Private data (fees, attendance) → RLS apply হয় → শুধু login + branch match ✅
```

---

## 🚨 কঠোর নিয়ম — কোনো AI Agent এগুলো ভাঙতে পারবে না

1. **PUBLIC table-এর SELECT policy থেকে কখনো anonymous access সরানো যাবে না।**
   - `USING (true)` বা `USING (is_active ...)` pattern ভাঙা যাবে না।
   - নতুন public table-এ অবশ্যই public SELECT access দিতে হবে।

2. **PRIVATE table-এ কখনো `USING (true)` বা anonymous access দেওয়া যাবে না।**
   - Fees, attendance, salary — এসব data কখনো publicly accessible হবে না।

3. **নতুন table তৈরি করলে, সেটা PUBLIC না PRIVATE তা অবশ্যই নির্ধারণ করতে হবে।**
   - নতুন table তৈরির সময় এই document-এ উল্লেখ করতে হবে।

4. **RLS enable করার পর সেটা disable করা যাবে না।**
   - কখনো `ALTER TABLE ... DISABLE ROW LEVEL SECURITY;` চালানো যাবে না।

5. **column-level access (students, teachers) ভাঙা যাবে না।**
   - `anon` role শুধু basic info দেখতে পারবে (id, name, photo, status)।
   - Full data (phone, address, fees) শুধু `authenticated` role দেখতে পারবে।

6. **`get_home_page_data()` function পরিবর্তন করতে হলে সতর্কতার সাথে করতে হবে।**
   - SECURITY DEFINER থাকবে — এটা সরানো যাবে না।
   - নতুন section যোগ করতে হলে শুধু published/active data fetch করতে হবে।

7. **যেকোনো RLS পরিবর্তনের পর এই verification query চালিয়ে check করতে হবে:**

```sql
-- সব table-এর policy দেখো:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

8. **fix_public_rls_policies.sql ফাইলটি শুধু 3টি table (events, success_stories, courses) fix করেছে।**
   বাকি যেগুলোতে public SELECT access নেই সেগুলোও fix করা দরকার:
   - `blogs` → public SELECT for `is_published = true`
   - `faqs` → public SELECT for `is_active IS DISTINCT FROM false`
   - `testimonials` → public SELECT for `is_active IS DISTINCT FROM false`
   - `hero_slides` → RLS enable + public SELECT policy দরকার
   - `app_settings` → RLS enable + public SELECT policy দরকার
   - `page_sections` → RLS enable + public SELECT policy দরকার
   - `sponsors` → RLS enable + public SELECT policy দরকার
   - `navbar_items` → RLS enable + public SELECT policy দরকার
   - `contact_info` → RLS enable + public SELECT policy দরকার
   - `branches` → RLS enable + public SELECT policy দরকার

---

## 📋 সম্পূর্ণ RLS Fix SQL (যা Supabase SQL Editor-এ চালাতে হবে)

নিচের SQL সব missing public table-এর সঠিক RLS policy তৈরি করবে।
এটি **supabase/migrations/fix_all_public_rls_policies.sql** ফাইলে সংরক্ষণ করতে হবে।

**গুরুত্বপূর্ণ:** এই SQL চালানোর আগে table exist করে কিনা verify করে নিতে হবে।

---

# Admin Panel

The Admin Panel is already built.

Never recreate it.

Never replace existing CRUD functionality.

Never break existing workflows.

Only improve or extend when necessary.

---

# Database Rules

Never modify the database without understanding its impact.

Never create duplicate tables.

Never remove columns without confirmation.

Never rename tables unless absolutely necessary.

Never lose user data.

Always preserve backward compatibility.

---

# Supabase Rules

The project uses Supabase Free Plan.

Always optimize for minimum usage.

Before writing any query ask yourself:

"Can this reduce database reads?"

"Can this reduce bandwidth?"

"Can this reduce API calls?"

Choose the most efficient solution.

Always:

* fetch only required columns
* never use SELECT *
* limit records
* paginate large datasets
* avoid unnecessary realtime subscriptions
* avoid duplicate queries
* reuse existing queries
* cache whenever appropriate

---

# Caching

Prefer caching over repeated database requests.

If suitable:

* Next.js Data Cache
* ISR
* Revalidation

Target cache duration:

60 minutes

Only refresh data when necessary.

Reduce Supabase usage as much as possible.

---

# Performance

Every decision must improve:

* Performance
* Stability
* Scalability

Optimize:

* Images
* JavaScript
* CSS
* Fonts
* API calls
* Bundle size

Use:

* Lazy Loading
* Dynamic Imports
* Image Optimization
* Code Splitting

Never load unnecessary resources.

---

# SEO

Every page should follow SEO best practices.

Include:

* Metadata
* Titles
* Descriptions
* Open Graph
* Structured Data
* Canonical URLs
* Sitemap compatibility
* robots.txt compatibility

Use semantic HTML.

Maintain proper heading hierarchy.

---

# GEO / AEO / AI Optimization

Optimize content for:

* Google Search
* AI Search Engines
* Answer Engines
* LLM discovery

Use:

* structured content
* schema markup
* FAQ schema
* Article schema
* Organization schema
* Breadcrumb schema

Content should be understandable by both humans and AI.

---

# Accessibility

Follow accessibility best practices.

Use:

* semantic HTML
* labels
* alt text
* keyboard navigation
* proper contrast
* accessible forms

---

# Security

Never expose:

* Service Role Keys
* Secrets
* Passwords
* Private Tokens

Never disable security to make something work.

Fix the real problem.

Always keep authentication secure.

---

# Error Handling

Never ignore errors.

Handle:

* loading
* empty states
* API failures
* validation
* unexpected errors

Provide meaningful messages.

---

# Logging

Keep logs useful.

Remove unnecessary console logs before finishing.

Never leave debug code.

---

# Code Quality

Write production-quality code.

Readable code is more important than short code.

Use meaningful names.

Avoid magic numbers.

Avoid unnecessary comments.

Comment only when it adds value.

---

# Before Making Changes

Always inspect:

* existing components
* APIs
* database
* utilities
* hooks
* types
* services

Understand first.

Change second.

---

# After Completing Every Task

Verify:

* Build succeeds
* No TypeScript errors
* No lint errors
* No broken routes
* No broken imports
* No broken components
* No broken authentication
* No broken Admin Panel
* No broken Public Website

Test everything affected by the change.

---

# Final Report

After every completed task provide a detailed report including:

1. What problem was found.
2. Root cause.
3. Files inspected.
4. Files modified.
5. Why each file was modified.
6. Database changes.
7. SQL changes (if any).
8. RLS changes (if any).
9. Performance improvements.
10. SEO improvements.
11. Security improvements.
12. Supabase usage optimization.
13. Risks considered.
14. How the solution preserves backward compatibility.
15. What should be tested next.

Never simply say "Done."

Explain everything clearly.

---

# Long-Term Vision

Every decision should make this project easier to maintain for many years.

The code should look as if it was written carefully by an experienced software engineer.

Prioritize quality over speed.

Never rush.

Think first.

Build second.

Protect the project always.

biometric hajirar jeno kaj kore seta okkhono rekhe kaj korte hobe 