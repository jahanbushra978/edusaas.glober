# যা আমি করতে পারিনি — আপনাকে নিজে করতে হবে (Manual Action Required)

এই ফাইলে শুধু সেই কাজগুলো আছে যেগুলো আমি এই sandbox থেকে নিরাপদে করতে পারিনি —
হয় network/database access না থাকার কারণে, অথবা verify করার কোনো উপায় না থাকার কারণে।
এগুলো আমি "না করে" রাখিনি ভুলে — ইচ্ছাকৃতভাবে বাদ দিয়েছি যাতে আপনি ভুল তথ্যের উপর
ভরসা না করেন।

## ১. Build ও Lint verification (সবচেয়ে জরুরি)
আমার sandbox-এ কোনো network access নেই (`npm install` করলে registry থেকে 403 Forbidden
পাওয়া যায়, লাইভ টেস্ট করে দেখানো হয়েছে)। ফলে:
- `npm install` — নতুন dependency (`isomorphic-dompurify`, H1 fix-এর জন্য) install হয়নি।
- `npm run build` — চালানো সম্ভব হয়নি।
- `npx eslint .` — চালানো সম্ভব হয়নি।

**আপনাকে করতে হবে:** deploy করার আগে
```
npm install && npm run build && npx eslint .
```
চালিয়ে নিশ্চিত করুন সব ঠিক আছে। আমি প্রতিটি পরিবর্তিত ফাইলে `node --check` (syntax) এবং
bracket-balance check করেছি — এটা syntax error ধরবে, কিন্তু build-time বা logic error না।

## ২. C3 — RLS Policy সরাসরি Supabase Dashboard-এ verify করা
`docs/audit/C3_RLS_MANUAL_VERIFICATION_CHECKLIST.md` ফাইলে বিস্তারিত checklist দেওয়া আছে।
আমার এই DB-তে কোনো access নেই, তাই এটা কেউ ম্যানুয়ালি Supabase Dashboard →
Authentication → Policies-এ গিয়ে চেক করতে হবে।

## ৩. আর্থিক ও একাডেমিক dashboard-এর জন্য Aggregate Query (ভবিষ্যতের কাজ, এখন জরুরি না)
Architecture review-তে চিহ্নিত হয়েছে যে `StudentFees`, `FeeManager`, `HadiyaForm`,
`BoardingManager`, `ExamManager`-এর মতো পেজগুলো এখনো পুরো dataset browser-এ এনে
client-side-এ যোগফল/গড় হিসাব করে। বর্তমান স্কেলে (একটা institute, কয়েকশ-কয়েক হাজার
রেকর্ড) এটা এখনই সমস্যা করছে না — তাই এখন পরিবর্তন করিনি (কারণ ব্যাখ্যা করা আছে মূল
রিপোর্টে)। কিন্তু ভবিষ্যতে ডেটা অনেক বেড়ে গেলে, সঠিক সমাধান হবে Postgres-এ
`SUM()`/`COUNT()`/`AVG()` ভিত্তিক একটা নতুন RPC ফাংশন বা view বানানো। এই কাজটা আমি এখন
করিনি কারণ:
- এটা নতুন SQL লেখা এবং আপনার লাইভ ডাটাবেসে টেস্ট করা লাগবে, যেটা আমি করতে পারি না।
- ভুল SUM/AVG থাকলে financial রিপোর্টে ভুল সংখ্যা দেখাবে — এটা এমন ঝুঁকি যেটা আমি
  যাচাই ছাড়া নিতে চাইনি।

যদি ভবিষ্যতে দরকার পড়ে, একজন developer-কে বলবেন Supabase-এ একটা RPC ফাংশন বানাতে,
যেমন:
```sql
create or replace function get_fee_totals(branch_filter int default null)
returns table(total_paid numeric, total_due numeric) as $$
  select sum(paid_amount), sum(due_amount) from student_fees
  where (branch_filter is null or branch_id = branch_filter);
$$ language sql stable;
```
(এটা শুধু উদাহরণ — আসল কলাম নাম যাচাই করে লিখতে হবে।)

## ৪. Supabase Free Plan-এর প্রকৃত ব্যবহার পরিমাপ করা
আমি অনুমান-ভিত্তিক বিশ্লেষণ দিয়েছি (কতগুলো query, কত ডেটা) — কিন্তু আপনার Supabase
Dashboard-এর Usage/Reports section-এ গিয়ে actual request count, bandwidth, ও database
size দেখে নিশ্চিত করা উচিত যে সত্যিই free plan limit-এর কাছাকাছি যাচ্ছেন কিনা। আমার কোনো
access নেই সেই ড্যাশবোর্ডে।

## সারকথা
এই sandbox-এর সীমাবদ্ধতা শুধু: **network access নেই, live database access নেই।**
এর বাইরে কোড-লেভেলে যা করা দরকার ছিল বলে আমি মনে করেছি, তা করে দিয়েছি (মূল রিপোর্ট দেখুন)।
