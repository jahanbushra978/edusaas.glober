# C3 — Manual RLS Verification Checklist

**Why this exists:** this repo has no network access to your live Supabase project, and
`supabase/migrations/` is not present in the repo, so the code audit **cannot** confirm
what RLS policies are actually active right now. `docs/archive/supabass-OLD-DANGEROUS-open-rls.sql.txt`
shows a policy pattern (`USING (true) WITH CHECK (true)`) that would let anyone with the
anon key read/write every row. It is filed under `archive/` and a later migration name
(`z_enterprise_security_hardening.sql`) is referenced in `app/api/db/migrate/route.js`,
which suggests it was superseded — but that is an inference, not a verification.
**Nothing here was guessed at or changed automatically. Do this by hand.**

## How to check (Supabase Dashboard → Authentication → Policies)

For **every table below**, open its policy list and confirm:
1. RLS is **enabled** (toggle at the top of the table's policy panel).
2. No policy has `USING (true)` (or blank/`true` condition) for `SELECT`/`UPDATE`/`DELETE`
   combined with the `anon` or `authenticated` role — that's the dangerous "open" pattern.
3. `INSERT`/`UPDATE`/`DELETE` policies scope to the expected role (`service_role` for
   admin-managed tables written only through server routes, or an appropriately scoped
   `authenticated` policy if the client ever writes directly).

## Tables to check (derived from `src/api/appClient.js` ENTITY_TABLES + one extra table used directly)

Grouped by sensitivity — check the 🔴 group first.

### 🔴 High sensitivity — PII, credentials, financial, or security data
- [ ] `students` (contains PII, `assigned_teacher_id`, and — until first login — a legacy
      plaintext password column per M2; branch-scoped)
- [ ] `teachers` (PII + branch-scoped)
- [ ] `student_fees` (financial)
- [ ] `hadiya`, `teacher_hadiya`, `teacher_payments`, `teacher_salary_profiles` (financial)
- [ ] `boarding_daily_reports`, `boarding_expenses` (financial)
- [ ] `expenses` (financial)
- [ ] `admission_applications` (PII submitted by prospective families)
- [ ] `login_attempts`, `blocked_devices`, `trusted_devices`, `active_sessions`, `security_events`, `security_settings` (auth/security telemetry — must not be readable by `anon`)
- [ ] `app_settings` (may contain `admin_login_password` per `managed-auth-server.js` — this table must **not** be readable by `anon`/`authenticated`)
- [ ] `contact_messages` (PII submitted by site visitors)
- [ ] `image_metadata` (not in ENTITY_TABLES but written directly by `app/api/uploads/cloudinary/route.js`)

### 🟠 Medium sensitivity — operational, branch-scoped
- [ ] `attendances`, `teacher_attendance`
- [ ] `daily_lessons`, `reading_logs`
- [ ] `exams`, `exam_inputs`, `exam_results`
- [ ] `promotions`, `promotion_students`, `promotion_certificates`
- [ ] `branches` (contains `admin_password`/`boarding_manager_password` columns per `managed-auth-server.js` — **must not** be selectable by `anon`)

### 🟢 Lower sensitivity — public-site content (should be `SELECT`-open, write-restricted)
For these, `SELECT` being open to `anon` is expected (they power the public website), but
`INSERT`/`UPDATE`/`DELETE` must still be restricted (service role only):
- [ ] `notices`, `blogs`, `events`, `faqs`, `testimonials`, `success_stories`
- [ ] `gallery`, `gallery_categories`, `gallery_items`, `videos`, `video_categories`
- [ ] `hero_slides`, `page_sections`, `navbar_items`, `sponsors`, `facilities`, `courses`, `contact_info`

## Specific things to look for
- [ ] Search every table's policy list for the literal text `true` used as the entire
      `USING`/`WITH CHECK` expression — this is the exact pattern in the archived
      "OLD-DANGEROUS" file.
- [ ] Confirm `app_settings` and `branches` are not exposed to `anon`/`authenticated` for
      `SELECT` on the raw row (they hold secrets in-row, not just references to secrets).
- [ ] Confirm the tables written only through server API routes with the service-role key
      (e.g. `security_events`, `login_attempts`) have **no** `authenticated`/`anon` INSERT
      policy that would let a client fabricate audit trail entries.
- [ ] If you find any `USING (true)`-style policy still active outside the intentionally-public
      content tables listed above, replace it with a properly scoped policy before treating
      this project as production-ready. This is the single highest-impact item in the whole
      audit — everything else assumes RLS is actually enforcing branch/role boundaries.

## What was *not* done here
- No migration file was written or run against your database.
- No assumption was made that `z_enterprise_security_hardening.sql` actually superseded the
  archived open-RLS file — that migration file is not in this repo, so its contents (and
  whether it was ever applied) are unverified.
- If, after checking, you find gaps, the fix is a normal Supabase migration (`ALTER POLICY`/
  `CREATE POLICY ... USING (...)` scoped to `branch_id`/role) applied through the Supabase CLI
  or SQL editor — not something to script blind from this repo.
