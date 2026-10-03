# 🏛️ Rahmania ERP — Secure Multi-Provider AI Assistant & Fee Automation Engine
## 📖 Production Master Engineering Specification (v2.4 — Production Lock Edition)

---

## ১. কোর সিকিউরিটি দর্শন ও জিরো-ট্রাস্ট নীতি (Core Philosophy)

**Rahmania ERP AI Assistant** কোনো ডিসিশন মেকার বা পারমিশনের মালিক নয়; এটি হলো Rahmania ERP-এর জন্য একটি **সুরক্ষিত, পারমিশন-বাউন্ড AI ইন্টারফেস ও অপারেটর (Secure AI Operator)**।

### গোল্ডেন সিকিউরিটি নীতি (The Golden Security Invariant):
> **"AI-generated tool arguments are untrusted input. Every tool invocation must independently resolve authenticated identity, permission, scope, target ownership, business rules, and data constraints on the server before execution."**
> 
> *(বাংলা: AI যে প্যারামিটারই পাঠাক তা কখনো বিশ্বাসযোগ্য ইনপুট হিসেবে গণ্য হবে না। প্রতিটি Tool Call-এর সময় সার্ভার নিজে অথেনটিকেটেড ইউজার, পারমিশন, ব্রাঞ্চ/ক্লাস স্কোপ, টার্গেট ওনারশিপ এবং বিজনেস রুল ডাটাবেস থেকে স্বাধীনভাবে যাচাই করে তারপর অ্যাকশন সম্পাদন করবে।)*

### মূল নীতিসমূহ (Core Engineering Principles):
1. **Zero-Trust AI Execution:** AI মডেল কখনো সরাসরি ডাটাবেসে কাঁচা SQL কোয়েরি চালাবে না। AI শুধুমাত্র অনুমোদিত সার্ভার ফাংশন (Controlled Server Tools) কল করার অনুরোধ জানাতে পারবে।
2. **Authoritative Server Identity:** ফ্রন্টএন্ড বা AI-এর পাঠানো কোনো `role`, `branch_id` বা `user_id` কখনো সিকিউরিটি ইনপুট হিসেবে গৃহীত হবে না। ব্যাকএন্ড সরাসরি ভ্যালিডেটেড সেশন ও ডাটাবেস থেকে আসল পরিচয় নির্ধারণ করবে।
3. **Single Source of Truth:** ERP-এর বিদ্যমান বিজনেস লজিকই একমাত্র কার্যকর থাকবে। AI-এর জন্য কোনো সমান্তরাল বা দ্বিতীয় বিজনেস লজিক লেখা হবে না।
4. **Deterministic Payable Validation:** টাকার অংক AI বা ফ্রন্টএন্ড থেকে ইনপুট হিসেবে নেওয়া হবে না; ডাটাবেস লেজার ও ইনভয়েস ইঞ্জিন থেকে স্বয়ংক্রিয়ভাবে আসল বকেয়া হিসাব হবে।
5. **No AI Chat DB Bloat:** AI chat history বা raw AI conversation Supabase-এ সংরক্ষণ করা হবে না; তবে ERP-এর প্রয়োজনীয় payment, audit, operation ও business records স্বাভাবিক নিয়মে সংরক্ষিত থাকবে।

---

## ২. সিস্টেম সিকিউরিটি আর্কিটেকচার (End-to-End Security Gate & RPC Flow)

```text
[ ব্যবহারকারী (Student / Teacher / Branch Admin / Super Admin) ]
                             │
                             ▼ (১. Authenticated Session Token + CSRF)
             [ Backend Auth & Identity Resolver ]
            (Resolves real-time user_id, active status from DB)
                             │
                             ▼ (২. AI Intent Parsing via Provider Adapter)
                 [ AI Provider Adapter ]
          (OpenRouter / OpenAI / Gemini / Anthropic)
                             │
                             ▼ (৩. Untrusted Tool Arguments Request)
┌────────────────────────────────────────────────────────────────────────┐
│                   🛡️ AUTHORIZATION SECURITY GATE                       │
│                                                                        │
│  • Authenticated user_id from secure session                           │
│  • Real-time Active Role & Database Permissions                        │
│  • Branch Scope Matching (Strict branch isolation)                     │
│  • Teacher Scope (Branch + Assigned Class + Assigned Subject)          │
│  • Target Ownership (Student can only access own student_id)           │
│  • AI Data Minimization (Pseudonymization: STUDENT_A1, no PII/Roll)    │
│  • Deterministic Payable Validation (DB recalculates exact payable)    │
│  • User Rate Limit & Global Provider Ceiling Gate (OpenRouter safety)  │
└────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼ (৪. Sensitive Action? Yes -> Confirmation UI)
              [ Interactive Confirmation Card in Chat ]
              (Server-Signed Operation Token: OP-XXXXXX)
                             │
                             ▼ (৫. User Confirms -> Server Re-checks Authorization)
┌────────────────────────────────────────────────────────────────────────┐
│                  🔒 POST-CONFIRMATION RE-VALIDATION                    │
│                                                                        │
│  • Verify Cryptographically Signed Operation Token                     │
│  • Re-verify current user permissions (in case role changed)           │
│  • Re-verify invoice payable status (prevent concurrent desk payment)  │
│  • Check DB-Level Unique Idempotency Key (prevent double click)        │
└────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼ (৬. Server-Side PostgreSQL RPC Transaction)
┌────────────────────────────────────────────────────────────────────────┐
│           ⚡ POSTGRESQL ATOMIC RPC (SECURITY DEFINER LOCKED)            │
│                                                                        │
│  process_fee_payment_atomic(p_invoice_id, p_operation_id, p_idemp_key)│
│  BEGIN TRANSACTION                                                     │
│    ├── Lock Invoice Row (SELECT FOR UPDATE)                            │
│    ├── Derive Exact Payable Amount directly from invoice record        │
│    ├── Validate Collector Branch vs Invoice Branch                     │
│    ├── Insert Payment Record (Unique constraint on idempotency_key)    │
│    ├── Update Invoice status = 'paid'                                  │
│    └── Insert Audit Record (operation_id, request_source: AI_ASSISTANT)│
│  COMMIT (Rollback automatically on any single failure)                 │
└────────────────────────────────────────────────────────────────────────┘
                             │
             ┌───────────────┴───────────────┐
             ▼                               ▼
 [ Immutable-by-App Audit Trail ] [ Print-Ready Digital Receipt ]
(Immutable user_id, timestamp)     (Official Format with Barcode)
```

---

## ৩. এআই ডাটা মিনিমাইজেশন ও সম্পূর্ণ ছদ্মনামকরণ (Pseudonymization)

বাহ্যিক কোনো AI প্রোভাইডারে ব্যক্তিগত পরিচয় (PII) বা রোল নম্বর পাঠানো সম্পূর্ণ নিষিদ্ধ:

```text
প্রয়োজনীয় অপারেশন              AI-কে যা পাঠানো যাবে                   যা পাঠানো সম্পূর্ণ নিষিদ্ধ (REDACTED)
─────────────────────────────────────────────────────────────────────────────────────────────────────────
দুর্বল ছাত্র এনালাইসিস    ──►  ছদ্মনাম (STUDENT_A1), বিষয় ও নম্বর  ──►  আসল নাম, রোল নম্বর, ফোন, এনআইডি, ঠিকানা
হাজিরা সামারি রিপোর্ট     ──►  উপস্থিতির হার (%) ও ক্লাস আইডি   ──►  অভিভাবকের ফোন, পারিবারিক তথ্য
বকেয়া ফি যাচাই            ──►  ইনভয়েস আইডি ও প্রদেয় মাস         ──►  পাসওয়ার্ড হ্যাশ, অন্য ব্যাংকিং তথ্য
```

> **ম্যাপিং নিয়ম:** AI শুধুমাত্র `STUDENT_A1` দেখতে পাবে। সার্ভার ক্লায়েন্ট-সাইডে রেসপন্স রেন্ডার করার সময় `STUDENT_A1` কে আসল নাম ও রোলে ম্যাপ করে দেবে। AI কখনো এই আসল ম্যাপিং জানবে না।

---

## ৪. এআই টুল রিস্ক লেভেল ও অপারেশন্স ক্লাসিফিকেশন (4-Tier Risk Model)

```text
🟢 LOW RISK (Instant Read):
   ├── get_my_profile
   ├── get_my_attendance
   └── get_my_result
   👉 কোনো কনফার্মেশন ছাড়া তাৎক্ষণিক উত্তর দেবে।

🔵 SCOPED READ (Sensitive Data Read):
   ├── search_students (সম্পূর্ণ ছদ্মনামযুক্ত ডাটা)
   └── generate_academic_summary
   👉 গ্র্যানুলার স্কোপ ও পারমিশন ভ্যালিডেশন শেষে উত্তর দেবে।

🟡 CONTROLLED WRITE (State Mutation with Idempotency):
   ├── mark_class_attendance (DB Unique: student_id + date + class_id)
   └── draft_notice
   👉 আইডেম্পোটেন্সি চেক করে সরাসরি এন্ট্রি করবে।

🔴 HIGH RISK (Financial / Soft Mutation):
   ├── collect_student_fee (ফি আদায়)
   ├── reverse_payment_ledger (ভুল সংশোধন)
   └── request_student_deactivation (সফট-আর্কাইভ অনুরোধ)
   👉 বাধ্যতামূলক Interactive Confirmation + Signed Operation Token + Post-Re-validation + Atomic Postgres RPC + Audit Log।
```

> **হার্ড ডিলিট সম্পূর্ণ নিষিদ্ধ:** এআই দিয়ে সরাসরি ডাটাবেস থেকে কোনো ছাত্র বা শিক্ষকের রেকর্ড চিরতরে মুছে ফেলা (Hard Delete) যাবে না; কেবল Soft Delete বা Deactivation অনুরোধ করা যাবে।

---

## ৫. সাইনড অপারেশন টোকেন ও কনফার্মেশন রি-ভ্যালিডেশন (Signed Operation Token)

কনফার্মেশন কার্ডের কোনো ডাটা ফ্রন্টএন্ড থেকে বিশ্বাস করা হবে না। সার্ভার সাইন করা টোকেন দিয়ে ভেরিফাই করবে:

```json
{
  "operation_id": "OP-20260816-10294",
  "user_id": 42,
  "student_id": 138,
  "invoice_id": 892,
  "branch_id": 12,
  "action_type": "FEE_COLLECTION",
  "issued_at": "2026-08-16T09:15:00Z",
  "expires_at": "2026-08-16T09:17:00Z",
  "nonce": "c8f1e29..."
}
```

* **টাকার অংক বাদ:** ক্লায়েন্ট বা AI থেকে কোনো `amount` প্যারামিটার পাঠানো হবে না।
* **ম্যানিপুলেশন প্রতিরোধ:** ফ্রন্টএন্ড থেকে কেউ ছাত্রের আইডি বা ইনভয়েস আইডি এডিট করার চেষ্টা করলে সাইন করা টোকেনের সাথে অমিল থাকায় সার্ভার রিকোয়েস্ট তাৎক্ষণিক বাতিল করবে।
* **ডাবল পেমেন্ট প্রতিরোধ:** কনফার্ম বাটনে চাপার সাথে সাথে সার্ভার ক্যাশ কাউন্টারের আসল ইনভয়েস স্ট্যাটাস রি-চেক করবে।

---

## ৬. সার্ভার-সাইড PostgreSQL RPC ও ডাটাবেস লেভেল ইমিউটেবিলিটি (Hardened RPC)

টাকার অংক কোনো ক্লায়েন্ট ইনপুট থেকে আসবে না; ডাটাবেসের লক করা ইনভয়েস থেকে স্বয়ংক্রিয়ভাবে হিসাব হবে:

```sql
-- PostgreSQL Security Definer RPC Function with Privilege Lock
CREATE OR REPLACE FUNCTION process_fee_payment_atomic(
  p_invoice_id INT,
  p_operation_id TEXT,
  p_idempotency_key TEXT,
  p_collector_user_id INT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invoice RECORD;
  v_collector RECORD;
BEGIN
  -- ১. কালেক্টরের রিয়েল-টাইম ব্রাঞ্চ ও রোল যাচাই
  SELECT id, branch_id, role, is_active INTO v_collector 
  FROM profiles WHERE id = p_collector_user_id;
  
  IF NOT FOUND OR v_collector.is_active IS NOT TRUE THEN
    RAISE EXCEPTION 'Unauthorized collector user';
  END IF;

  -- ২. ইনভয়েস রো লক ও ব্রাঞ্চ যাচাই (Concurrency Lock)
  SELECT * INTO v_invoice FROM invoices 
  WHERE id = p_invoice_id AND status = 'unpaid' FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice already paid or does not exist';
  END IF;

  IF v_collector.role <> 'super_admin' AND v_collector.branch_id <> v_invoice.branch_id THEN
    RAISE EXCEPTION 'Cross-branch fee collection denied';
  END IF;

  -- ৩. পেমেন্ট রেকর্ড ইনসার্ট (টাকার অংক ইনভয়েস থেকে গৃহীত)
  INSERT INTO fee_payments (
    student_id, invoice_id, amount, collected_by_user_id, 
    operation_id, idempotency_key, created_at
  ) VALUES (
    v_invoice.student_id, p_invoice_id, v_invoice.payable_amount, 
    p_collector_user_id, p_operation_id, p_idempotency_key, NOW()
  );

  -- ৪. ইনভয়েস স্ট্যাটাস আপডেট
  UPDATE invoices SET status = 'paid', updated_date = NOW() WHERE id = p_invoice_id;

  -- ৫. অডিট ট্রেইল ইনসার্ট
  INSERT INTO audit_logs (operation_id, request_source, user_id, action, branch_id, created_at)
  VALUES (p_operation_id, 'AI_ASSISTANT', p_collector_user_id, 'FEE_COLLECTION', v_invoice.branch_id, NOW());

  RETURN jsonb_build_object(
    'success', true, 
    'operation_id', p_operation_id, 
    'paid_amount', v_invoice.payable_amount
  );
END;
$$;

-- প্রিভিলেজ লক (Direct RPC Protection)
REVOKE ALL ON FUNCTION process_fee_payment_atomic FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION process_fee_payment_atomic TO service_role;
```

### ডাটাবেস লেভেল ইউনিক কনস্ট্রেইন্ট (DB Constraints):
```sql
-- ডাবল পেমেন্ট ও ডাবল হাজিরা ডাটাবেস লেভেলে রোধ
ALTER TABLE fee_payments ADD CONSTRAINT uq_fee_payments_idempotency UNIQUE (idempotency_key);
ALTER TABLE fee_payments ADD CONSTRAINT uq_fee_payments_operation UNIQUE (operation_id);
ALTER TABLE student_attendance ADD CONSTRAINT uq_attendance_student_date_class UNIQUE (student_id, attendance_date, class_id);
```

---

## ৭. BYOK ও সেন্ট্রাল এআই সিক্রেট পলিসি (Secret Handling Policy)

### ক. BYOK (User-Supplied API Key):
```text
BYOK Architecture
 ├── Mode 1: Session-Only (Memory-First Default)
 │      └── ব্রাউজারের রিঅ্যাক্ট স্টেট/মেমোরিতে থাকবে। পেজ বন্ধ হলে মুছে যাবে।
 └── Mode 2: Remember Key (Optional)
        └── ক্লায়েন্ট-সাইড এনক্রিপ্টেড লোকাল স্টোরেজ (Web Crypto Threat-Modeled)।
```
* **রিকোয়েস্ট ফ্লো:** Browser (Memory) ──► HTTPS Request ──► Server Request Scope Memory ──► AI Provider ──► Discard from Memory।
* **জিরো-লিক গ্যারান্টি:** BYOK কী কখনো সার্ভার লগ, ডাটাবেস, এরর ট্র্যাকার, URL বা প্রম্পটে পাঠানো বা সংরক্ষণ করা হবে না।

### খ. Central AI Secret Policy:
* সেন্ট্রাল এআই কী সম্পূর্ণ **Server-Only Secret** হিসেবে `.env.local` বা ক্লাউড সিক্রেট স্টোরে থাকবে।
* সেন্ট্রাল কী কখনো ব্রাউজার/ক্লায়েন্টে পাঠানো হবে না এবং API রেসপন্সে এক্সপোজ করা সম্পূর্ণ নিষিদ্ধ।

---

## ৮. সেন্ট্রাল এআই ও ওপেনরাউটার ফ্রি লিমিট কোটা (Provider-Aware Rate Limiting)

OpenRouter-এর বর্তমান ফ্রি অ্যাকাউন্ট লিমিট (৫০ রিকোয়েস্ট/দিন এবং ২০ রিকোয়েস্ট/মিনিট) মাথায় রেখে টু-টায়ার কোটা নির্ধারণ করা হয়েছে:

```text
┌────────────────────────────────────────────────────────┐
│               RAHMANIA AI GATEWAY QUOTA                │
├───────────────────────────┬────────────────────────────┤
│ ১. Per-User Quota (ERP)   │ ২. Global Provider Ceiling │
├───────────────────────────┼────────────────────────────┤
│ • Student: 10 / hour      │ • Daily Ceiling: 45 / day  │
│ • Teacher: 20 / hour      │ • Max Concurrency: 15 RPM  │
│ • Branch Admin: 30 / hour │ • Safety Buffer: 5 req/day │
│ • Super Admin: Custom     │                            │
└───────────────────────────┴────────────────────────────┘
```

### সেনসিটিভ টুলের জন্য মডেল রাউটিং পলিসি (Tool-Capable Model Allowlist):
* **সাধারণ প্রশ্নোত্তর (Chat):** `openrouter/free` রাউটার বা যেকোনো ফ্রি মডেল ব্যবহারযোগ্য।
* **ফিনান্সিয়াল ও মিউটেশন টুলস (Tool Calling):** টুল কলিং সমর্থন করে এমন পরীক্ষিত মডেল এলাউলিস্ট বাধ্যতামূলক (যেমন: `meta-llama/llama-3.3-70b-instruct:free`, `google/gemini-2.0-flash`, `gpt-4o-mini`, `deepseek-chat`)।

---

## ৯. এআই মেমোরি মডেল (Rolling 10 Memory)

* **ডাটাবেস সংরক্ষণ নীতি:** এআই চ্যাট হিস্ট্রি Supabase-এ সংরক্ষণ করা হবে না এবং এআই-এর কারণে অপ্রয়োজনীয় ডাটাবেস স্টোরেজ ব্যবহার সম্পূর্ণরূপে নিয়ন্ত্রণ করা হবে।
* **১০-মেসেজ মেমোরি সংজ্ঞা (Exact Technical Definition):** 
  * ১টি ব্যবহারকারীর মেসেজ = ১টি মেসেজ।
  * ১টি এআই অ্যাসিস্ট্যান্ট মেসেজ = ১টি মেসেজ।
  * সর্বমোট ৫ বার প্রশ্নোত্তর আদান-প্রদান = ১০টি মেসেজ (FIFO Sliding Window)।
  * **টুল কল (Tool Calls), র' ডাটাবেস রেজাল্ট (Raw Tool Payloads), বড় রসিদ বা ইমেজ কোড মেমোরি কাউন্টে আসবে না; কেবল দৃশ্যমান সংক্ষিপ্ত টেক্সট সংরক্ষিত থাকবে।**

---

## ১০. প্রোভাইডার-নির্দিষ্ট পেমেন্ট গেটওয়ে ভেরিফিকেশন (Payment Gateway Layer)

```text
Payment Gateway Abstraction Layer
 ├── bKashAdapter   (Tokenized Checkout + Query API Protocol)
 ├── NagadAdapter   (Public/Private RSA Key Verification)
 ├── RocketAdapter  (Merchant API Protocol Verification)
 └── BankCardAdapter(SSLCommerz / Direct IPN Hash Protocol)
```

* প্রতিটি প্রোভাইডারের নিজস্ব অফিসিয়াল প্রোটোকল অনুযায়ী ডিজিটাল সিগনেচার ও ওয়েব-হুক ভেরিফাই হবে।
* ডাটাবেস লেভেল ইউনিক কনস্ট্রেইন্টের মাধ্যমে ডাবল পেমেন্ট নোটিফিকেশন হলেও একটিমাত্র ইনভয়েস পেইড হবে।

---

## ১১. কোডের ফাইল ও ফোল্ডার স্ট্রাকচার (Code Structure Map)

```text
src/
 ├── lib/
 │    ├── ai/
 │    │    ├── providers/
 │    │    │    ├── index.js         # প্রোভাইডার অ্যাডাপ্টার ফ্যাক্টরি
 │    │    │    ├── openrouter.js   # OpenRouter অ্যাডাপ্টার
 │    │    │    ├── openai.js       # OpenAI অ্যাডাপ্টার
 │    │    │    ├── gemini.js       # Google Gemini অ্যাডাপ্টার
 │    │    │    └── anthropic.js    # Anthropic অ্যাডাপ্টার
 │    │    ├── auth-context.js       # রিয়েল-টাইম ইউজার ও গ্র্যানুলার স্কোপ রেজলভার
 │    │    ├── fee-engine.js         # বকেয়া হিসাব ও সাইনড টোকেন জেনারেটর
 │    │    ├── rate-limiter.js       # টু-টায়ার রেট লিমিটিং (User + Global Ceiling)
 │    │    └── tools/
 │    │         ├── index.js         # অনুমোদিত এআই টুল রেজিস্ট্রি
 │    │         ├── studentTools.js  # স্টুডেন্ট স্কোপ ফাংশন (Pseudonymized STUDENT_A1)
 │    │         ├── feeTools.js      # ফি কালেকশন ও ইনভয়েস ফাংশন (Amount Excluded)
 │    │         └── attendanceTools.js # হাজিরা ফাংশন (Idempotent Compound Key)
 │    └── payment/
 │         ├── gatewayAdapter.js     # পেমেন্ট প্রোভাইডার ইন্টারফেস
 │         └── webhookHandler.js     # প্রোভাইডার-নির্দিষ্ট সিগনেচার ভেরিফিকেশন
 │
 ├── features/
 │    └── ai/
 │         ├── components/
 │         │    ├── AIChatDrawer.jsx       # এআই সাইডবার ও চ্যাট ইন্টারফেস
 │         │    ├── AISettingsModal.jsx    # BYOK / Central এআই কনফিগ ও মডেল হাব
 │         │    ├── FeeConfirmationCard.jsx# সাইনড অপারেশন কনফার্মেশন পপ-আপ
 │         │    └── ReceiptCard.jsx        # প্রিন্ট-রেডি রসিদ কার্ড
 │         └── hooks/
 │              └── useAIChat.js           # ১০-মেসেজ রোলিং স্টেট হুক
 │
 └── app/
      └── api/
           ├── ai/
           │    ├── chat/route.js          # প্রধান সিকিউর এআই চ্যাট এপিআই
           │    ├── confirm/route.js       # পোস্ট-কনফার্মেশন RPC রুট
           │    └── test-connection/route.js # এপিআই কী যাচাই রুট
           └── payment/
                └── webhook/route.js       # আইডেম্পোটেন্ট পেমেন্ট ওয়েবহুক
```

---

## ১২. চূড়ান্ত অপরিবর্তনীয় নীতিসমূহ (Non-Negotiable Invariants)

1. AI কখনো সোর্স কোড, `.env` বা ডাটাবেস পাসওয়ার্ড দেখতে বা জানাতে পারবে না।
2. AI-এর সিদ্ধান্তের ওপর নয়, বরং সার্ভার-ভ্যালিডেটেড ERP পারমিশন ও এসাইন করা স্কোপের ওপর কাজের সুযোগ নির্ধারিত হবে।
3. এক ব্রাঞ্চের ইউজার অন্য ব্রাঞ্চের ডাটা দেখতে পারবে না।
4. শিক্ষক শুধুমাত্র তার এসাইন করা ক্লাস ও বিষয়ের তথ্য দেখতে ও কাজ করতে পারবেন।
5. এআই-কে কোনো আসল নাম, রোল, ফোন বা এনআইডি পাঠানো যাবে না; ছদ্মনাম (`STUDENT_A1`) ব্যবহৃত হবে (Pseudonymization)।
6. টাকার অংক AI বা ফ্রন্টএন্ড থেকে নেওয়া হবে না; ডাটাবেস ইনভয়েস থেকে স্বয়ংক্রিয়ভাবে হিসাব হবে।
7. কনফার্মেশনের পর সাইন করা অপারেশন টোকেন যাচাই করে পুনরায় পারমিশন ও বকেয়া স্ট্যাটাস রি-চেক করতে হবে।
8. আর্থিক পরিবর্তনসমূহ PostgreSQL RPC Transaction-এর ভেতরে অ্যাটোমিকভাবে সম্পাদিত হতে হবে (`SECURITY DEFINER` ও ফিক্সড `search_path`)।
9. ডাবল পেমেন্ট ও ডাবল হাজিরা প্রতিরোধে ডাটাবেস লেভেল `UNIQUE` কনস্ট্রেইন্ট বজায় থাকবে।
10. সেন্ট্রাল এআই-তে অপচয় রোধে পার-ইউজার কোটার পাশাপাশি গ্লোবাল প্রোভাইডার সিলিং (যেমন: OpenRouter ৪৫ রিকোয়েস্ট/দিন) কার্যকর থাকবে।
11. ফিনান্সিয়াল ও সংবেদনশীল টুলের জন্য পরীক্ষিত Tool-Capable মডেল এলাউলিস্ট ব্যবহৃত হবে।
12. এআই চ্যাট হিস্ট্রি Supabase-এ জমা হবে না, লোকাল ব্রাউজারে টুল পেলোড ছাড়া সর্বোচ্চ ১০টি দৃশ্যমান মেসেজ থাকবে।
13. বিদ্যমান ERP-এর বিজনেস লজিক অপরিবর্তিত থাকবে; AI শুধুমাত্র তার সামনে একটি নিরাপদ ন্যাচারাল-ল্যাঙ্গুয়েজ ইন্টারফেস হিসেবে কাজ করবে।

---
*এই মাস্টার স্পেসিফিকেশনটি Rahmania ERP-এর স্থায়ী প্রাতিষ্ঠানিক ইঞ্জিনিয়ারিং রেফারেন্স হিসেবে লক করা হলো।*
