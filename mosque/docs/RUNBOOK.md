# RUNBOOK — চালানো, ব্যাকআপ, রিস্টোর

নিচের ব্যাকআপ/রিস্টোর ধাপ লোকাল Postgres 16-এ বাস্তবে চালিয়ে পরীক্ষা করা হয়েছে (Payment/AuditLog/Membership সংখ্যা মিলেছে)। আপনার প্রোডাকশন হোস্টে প্রথমবার নিজে একবার চালিয়ে দেখুন।

## ১. প্রয়োজনীয় env
`DATABASE_URL`, `AUTH_SECRET` (৩২+ অক্ষর), `CRON_SECRET` (১৬+ অক্ষর)। প্রোডাকশনে সিড চালানো যাবে না।

## ২. ডিপ্লয়
```bash
npm ci
npx prisma generate
npx prisma migrate deploy   # শুধু নতুন migration প্রয়োগ হয়
npm run build && npm start
```
Reminder শিডিউলার: প্রতি ৫ মিনিটে
`curl -X POST -H "Authorization: Bearer $CRON_SECRET" -H "content-type: application/json" -d '{}' https://HOST/api/cron/reminders`
(একাধিক ইনস্ট্যান্সেও নিরাপদ — প্রতি ধাপ ঠিক একবার চলে।)

## ৩. ব্যাকআপ (দৈনিক)
```bash
pg_dump -Fc "$DATABASE_URL" -f /backups/mosque-$(date +%F).dump
find /backups -name 'mosque-*.dump' -mtime +30 -delete    # ৩০ দিন রাখুন
```
- ব্যাকআপ অন্য মেশিন/স্টোরেজে কপি করুন (একই ডিস্কে নয়)।
- `AuditLog` ব্যাকআপে থাকে; আলাদা করে বাদ দেবেন না।

## ৪. রিস্টোর
```bash
createdb mosque_restored
pg_restore --no-owner -d mosque_restored /backups/mosque-YYYY-MM-DD.dump
# সংখ্যা মিলিয়ে দেখুন
psql -d mosque_restored -c 'select count(*) from "Payment"'
```
ঠিক থাকলে অ্যাপের `DATABASE_URL` নতুন ডাটাবেসে ঘুরিয়ে অ্যাপ রিস্টার্ট করুন। রিস্টোরের পর `migrate deploy` চালান।

## ৫. সাপ্তাহিক রিস্টোর পরীক্ষা
সপ্তাহে একবার সর্বশেষ ডাম্প একটি আলাদা ডাটাবেসে রিস্টোর করে Payment/AuditLog/Membership গণনা মূল ডাটাবেসের সাথে মেলান। মিললে পরীক্ষা ডাটাবেস মুছে দিন।

## ৬. SMS / ইমেইল (প্রোভাইডার বাকি)
`src/services/channels.ts`-এ `NotificationChannel` ইন্টারফেস আছে এবং `src/services/dispatch.ts` এখন খরচ জমা, রিমাইন্ডার, এসকেলেশন, অনুমোদন/বাতিল ও পরিশোধের প্রতিটি নোটিফিকেশন (ট্রানজ্যাকশন কমিট হওয়ার **পরে**) নিবন্ধিত চ্যানেলে পাঠায়। প্রোভাইডার ঠিক হলে শুধু একটি `send()` লিখে অ্যাপ চালুর সময় `registerChannel` করুন — আর কিছু জোড়ার দরকার নেই। কোনো চ্যানেল নিবন্ধিত না থাকলে কিছুই পাঠানো হয় না; প্রোভাইডার ব্যর্থ হলেও মূল রিকোয়েস্ট ভাঙে না।
- বার্তায় বাংলা ও ইংরেজি একসাথে যায় (ব্যবহারকারীর ভাষা এখন সার্ভারে সংরক্ষিত নয়)।
- প্রোভাইডার ধীর হলে রিকোয়েস্টও ধীর হতে পারে (এখন `await` করা হয়); প্রোডাকশনে প্রোভাইডার বসানোর সময় সময়সীমা/কিউ ভাবুন।
- ঘুমের সময় (quiet hours) এখনো প্রয়োগ হয় না।
