# Mosque SaaS — member contributions, expenses, approvals, reminders

Next.js 14 (App Router) · TypeScript · PostgreSQL · Prisma 6 (Rust-free client + `pg` adapter). Mobile-first, light/dark/system theme, Bengali + English.

## Run locally
```bash
npm install
cp .env.example .env          # set DATABASE_URL, AUTH_SECRET, CRON_SECRET
npx prisma generate
npx prisma migrate deploy     # 0001_init, 0002_integrity, 0003_expenses_notifications
npm run db:seed               # demo mosque "baitun-noor"; logins: president, treasurer, imam, member01..24; password Mosque@12345
npm run dev
```
Reminders: call every ~5 minutes from any scheduler:
`curl -X POST -H "Authorization: Bearer $CRON_SECRET" -H "content-type: application/json" -d '{}' https://your-host/api/cron/reminders`

## What works
- **Accounts per mosque**: members register with their own ID + password under a mosque; committee verifies. Roles/permissions are rows in the database (dynamic), re-read on every request.
- **Dynamic tenants & roles**: `/new-mosque` opens a mosque (creator becomes ACTIVE president); `/settings` lets an admin edit roles/permissions, create/delete custom roles, add funds, toggle contributor privacy and verification. Members get a role from their member page. At least one active admin always remains (`LAST_ADMIN`).
- **Month-by-month contributions**: `/months` → `/months/2026-10` (who paid / partial / unpaid, infinite scroll) → `/members/:id` (every month, receipts). `/members/me` is the member's own account. Each member has their own monthly amount.
- **Privacy**: `Mosque.showContributors` controls whether ordinary members see names; otherwise totals only.
- **Collections**: treasurer/imam record payments (idempotent, receipt number, audit row). Printable/shareable receipt at `/receipts/:id`.
- **Funds**: dashboard fund cards open `/funds/:id` (12-month income/expense). Restricted funds stay separate; a payout can never exceed its own fund's balance.
- **Expenses**: submit → approve/reject (reason required for reject) → mark paid. Server-side status transitions, no self-approval, race-safe decisions, voucher numbers, full audit history. Members only see published (approved/paid) expenses.
- **Reminders & escalation**: submission notifies approvers at once; default schedule 2h, 6h reminders, 24h escalation to leadership, 48h overdue flag. Idempotent (unique `(expense, step)`), multi-instance safe, stops the moment a request is decided, never approves automatically. Schedule can be overridden per mosque in `Mosque.reminderSteps`.
- **In-app notifications** (bell + `/notifications`), rendered in the user's language.
- **Outbound channels (SMS / email / push) are wired**: after the transaction commits, every notification (approval request, reminders, escalation, approved/rejected/paid) is also handed to the registered `NotificationChannel`s via `src/services/dispatch.ts`. Nothing is sent until a provider is registered; a failing provider never breaks the request. Messages carry Bengali and English together (the user's language is a browser setting, not stored on the server).
- **DB guards**: CHECK constraints, append-only `AuditLog`, payments and expenses cannot be deleted.

## Tests
`npm test` (43 unit tests) and, with the app running and seeded, `npm run test:integration` (63 checks: auth, permissions, pagination, exactly-once payments, approval rules, reminder idempotency/escalation, privacy).

## Not built yet
Evidence/receipt file uploads for expenses, multi-stage and amount-based approval policies, delegates/reassignment, signature re-authentication, **an actual SMS / email / web push provider** (needs a real provider account; the delivery pipeline is wired and tested with a mock, quiet hours not applied yet, per-user language not stored), member self-donation with payment gateway, reversal/correction screens, Quran/maktab/prayer/meal roster, PWA install, BYOK AI, subscriptions, Postgres row-level security.

## Production notes
Rate limiter is in-memory (use Redis for multiple instances). Dues are generated lazily and idempotently (`ensureDues`). Change seed passwords; the seed refuses to run when `NODE_ENV=production`.

## Ops
`docs/RUNBOOK.md` — deploy, daily backup, restore, weekly restore test. `src/services/channels.ts` — SMS/email provider interface; `src/services/dispatch.ts` sends committed notifications through it.

## Rules for agents
See `AGENT.md` (rules) and `docs/SPEC.md` (product spec and per-phase acceptance checklist).
