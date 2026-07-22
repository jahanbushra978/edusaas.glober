# 🏫 রহমানিয়া ইনস্টিটিউট — RAHMANIA INSTITUTE
> Next.js App Router project for Rahmania Institute, deployed on Vercel and connected to Supabase and Cloudinary.

রহমানিয়া ইনস্টিটিউট-এর জন্য একটি আধুনিক, প্রফেশনাল এবং সম্পূর্ণ ডাইনামিক **Educational Institute Management System (EIMS)**। এটি মাল্টি-ব্রাঞ্চ একাডেমিক স্ট্রাকচার, বেতন/ফি কালেকশন, হোস্টেল/বোর্ডিং, হাদিআ বিতরণ, নোটিশ বোর্ড এবং পরীক্ষা ফলাফল ব্যবস্থাপনার জন্য একটি ওয়ান-স্টপ প্ল্যাটফর্ম।

---

## 🌟 Key Feature Modules (প্রধান ফিচারসমূহ)

### 1. 📊 Admin Portal (সুপার এডমিন ও ব্রাঞ্চ প্যানেল)
* **মাল্টি-ব্রাঞ্চ একাডেমিক স্ট্রাকচার**: প্রতিটি ব্রাঞ্চের জন্য নিজস্ব ক্লাস, সেকশন এবং ক্লাস পিরিয়ড কনফিগারেশন।
* **ফি ও বেতন ম্যানেজমেন্ট (Fee Setup & Collection)**:
  * শিক্ষার্থীদের মাসিক বেতন সেটআপ ও ডাইনামিক রসিদ সংরক্ষণ।
  * আংশিক পেমেন্ট (Partial Payment) এবং বকেয়া কালেকশনের নিখুঁত স্বয়ংক্রিয় হিসাব।
  * সফল পেমেন্টের সাথে সাথে ডাইনামিক **A4 PDF Receipt** প্রিন্ট করার সুবিধা।
* **পরীক্ষা ও মার্কশীট (Exam & Grade management)**: 
  * পরীক্ষা তৈরি, নম্বর এন্ট্রি এবং জিপিএ হিসাবসহ অটো-জেনারেটেড মার্কশীট প্রিন্ট।
* **হোস্টেল ও বোর্ডিং (Boarding/Hostel management)**:
  * ডরমিটরি সিট বুকিং, বোর্ডিং মিল ট্র্যাকিং এবং পেমেন্ট মনিটরিং।
* **কর্মচারী হাদিআ বিতরণ (Hadiya/Salary ledger)**:
  * শিক্ষক ও কর্মচারীদের মাসিক হাদিআ বিতরণ ও পেমেন্ট হিস্ট্রি ট্র্যাকিং।

### 2. 👨‍🏫 Teacher Portal (শিক্ষক প্যানেল)
* শিক্ষক প্রোফাইল ও দৈনিক ক্লাসের ডায়েরি (Daily Lesson Logs)।
* শিক্ষার্থীদের ক্লাসে উপস্থিতি ও পঠন লগ (Reading Logs/Nazera tracker) ইনপুট।
* পরীক্ষার নম্বর সরাসরি সাবমিট করার সুবিধা।

### 3. 🎓 Student Portal (ছাত্র/অভিভাবক প্যানেল)
* ড্যাশবোর্ড থেকে নিজস্ব উপস্থিতি ট্র্যাকিং।
* পেমেন্ট হিস্ট্রি, রসিদ এবং পরীক্ষার ফলাফলের লাইভ ট্র্যাকিং।

### 4. 🌐 Public Website (পাবলিক ওয়েবসাইট)
* সম্পূর্ণ ডাইনামিক হোমপেজ, নোটিশ বোর্ড, ব্রাঞ্চ গ্যালারি, ভিডিও গ্যালারি ও ভর্তি ফরম।
* ইংরেজি এবং বাংলা ভাষার জন্য **ডাইনামিক ট্রান্সলেশন সিস্টেম (i18n)**।
* সাইট জুড়ে দ্রুত তথ্য খোঁজার জন্য বিশেষ **গ্লোবাল সার্চ ইঞ্জিন (PostgreSQL FTS)**।

---

## 🛠️ Technology Stack (ব্যবহৃত প্রযুক্তি)

* **Frontend**: Next.js 16 (App Router, TailwindCSS, Radix UI Components)
* **State & Query**: React Query (`@tanstack/react-query`) ও Date-fns
* **Backend Database**: Supabase PostgreSQL (Row-Level Security / RLS সংবলিত)
* **Media Storage**: Cloudinary (ছবি ও ভিডিও আপলোডের জন্য)
* **Deployment**: Vercel

---

## 🚀 Local Setup Guide (লোকাল সেটআপ)

১. **ডিপেন্ডেন্সি ইনস্টল করুন**:
   ```bash
   npm install
   ```

২. **এনভায়রনমেন্ট ফাইল সেটআপ**:
   `.env.example` ফাইলটি কপি করে `.env.local` নামে একটি ফাইল তৈরি করুন এবং প্রয়োজনীয় ক্রেডেনশিয়াল বসিয়ে দিন।

৩. **অ্যাপ্লিকেশনটি লোকাল সার্ভারে রান করুন**:
   ```bash
   npm run dev
   ```
   *লোকাল ডোমেইন:* `http://localhost:3000` এ অ্যাপটি চালু হবে।

৪. **প্রোডাকশন বিল্ড এবং পরীক্ষা**:
   ```bash
   # প্রোডাকশন বিল্ড চেক করুন
   npm run build
   
   # টাইপচেক ভ্যালিডেশন
   npm run typecheck
   
   # লিন্ট চেকার
   npm run lint
   ```

---

## 🔑 Required Environment Variables

নিচের ভ্যারিয়েবলগুলো আপনার `.env.local` ফাইলে এবং Vercel ড্যাশবোর্ডে সেট থাকতে হবে:

```ini
# Public / Browser Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset

# Server-Only Variables
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
ADMIN_LOGIN_PASSWORD=your_admin_panel_secure_password

# Database / Postgres Connection (Server-Only)
POSTGRES_URL=your_postgresql_connection_url
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_db_name
```

---

## 🔒 Security & Database Migration

- **RLS Policies**: ডাটাবেজের সকল সংবেদনশীল টেবিলে Supabase-এর Row-Level Security পলিসি সক্রিয় রয়েছে। ব্যবহারকারীর রোল (Role) অনুযায়ী অ্যাক্সেস কন্ট্রোল করা হয়।
- **Integrity Check**: অ্যাপ্লিকেশনের রানটাইম ইন্টিগ্রেশন হেলথ চেক করতে ব্রাউজারে `/api/health/integrations` লিঙ্কটি ভিজিট করুন।
- **DB Migrations**: সকল এসকিউএল মাইগ্রেশন ফাইল `supabase/migrations/` ডিরেক্টরিতে সংরক্ষিত আছে। নতুন কোনো টেবিলে পরিবর্তন করতে হলে সেখানে স্ক্রিপ্ট যুক্ত করুন।

---

## 📞 Support & Maintenance
সিস্টেমের যেকোনো তথ্যের জন্য অথোরাইজড সিস্টেম এডমিন অথবা রহমানিয়া ইনস্টিটিউট আইটি সেন্টারে যোগাযোগ করুন।