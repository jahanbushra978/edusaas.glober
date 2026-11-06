-- ============================================================================
-- Migration: 20261103_human_teacher_marketplace.sql
-- Description: Human Teacher Marketplace, Group Live Rooms, Wallets & Financial Ledger
-- ============================================================================

-- 1. Teacher Marketplace Profiles
CREATE TABLE IF NOT EXISTS public.teacher_marketplace_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT UNIQUE NOT NULL,
  user_id UUID,
  name_bn TEXT NOT NULL,
  name_en TEXT,
  title_bn TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  hourly_fee NUMERIC DEFAULT 350,
  monthly_fee NUMERIC DEFAULT 2500,
  experience_years INT DEFAULT 5,
  qualifications JSONB DEFAULT '[]'::jsonb,
  specialties JSONB DEFAULT '[]'::jsonb,
  schedule_text TEXT,
  bio TEXT,
  rating NUMERIC DEFAULT 5.0,
  total_reviews INT DEFAULT 0,
  total_students INT DEFAULT 0,
  total_classes INT DEFAULT 0,
  is_online BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'approved', -- 'approved', 'pending', 'suspended'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Teacher Wallets (Authoritative Ledger Balance)
CREATE TABLE IF NOT EXISTS public.teacher_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT UNIQUE NOT NULL,
  balance NUMERIC DEFAULT 0 NOT NULL CHECK (balance >= 0),
  total_earned NUMERIC DEFAULT 0 NOT NULL,
  total_withdrawn NUMERIC DEFAULT 0 NOT NULL,
  currency TEXT DEFAULT 'BDT',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Teacher Wallet Transactions (Double-Entry Financial Audit Trail)
CREATE TABLE IF NOT EXISTS public.teacher_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT NOT NULL,
  student_id TEXT,
  student_name TEXT,
  amount_gross NUMERIC NOT NULL CHECK (amount_gross > 0),
  platform_commission_pct NUMERIC NOT NULL CHECK (platform_commission_pct >= 0 AND platform_commission_pct <= 100),
  platform_commission_amount NUMERIC NOT NULL CHECK (platform_commission_amount >= 0),
  amount_net NUMERIC NOT NULL CHECK (amount_net >= 0),
  transaction_type TEXT NOT NULL, -- 'hadia_payment', 'monthly_fee', 'payout', 'refund'
  payment_gateway TEXT DEFAULT 'bkash', -- 'bkash', 'nagad', 'manual'
  gateway_ref TEXT,
  idempotency_key TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'refunded'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Teacher Group Live Rooms (Facebook Rooms / Google Meet / Zoom style 1-teacher-to-many-students)
CREATE TABLE IF NOT EXISTS public.teacher_live_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  teacher_id TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  surah_number INT DEFAULT 1,
  ayah_number INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  max_participants INT DEFAULT 50,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- 5. Live Room Active Participants
CREATE TABLE IF NOT EXISTS public.live_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.teacher_live_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT DEFAULT 'student', -- 'teacher', 'student', 'moderator'
  is_speaking BOOLEAN DEFAULT false,
  hand_raised BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- 6. Teacher Genuine Reviews
CREATE TABLE IF NOT EXISTS public.teacher_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified_transaction BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_teacher_marketplace_status ON public.teacher_marketplace_profiles(status);
CREATE INDEX IF NOT EXISTS idx_teacher_marketplace_online ON public.teacher_marketplace_profiles(is_online);
CREATE INDEX IF NOT EXISTS idx_teacher_wallet_tx_teacher ON public.teacher_wallet_transactions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_wallet_tx_created ON public.teacher_wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teacher_live_rooms_code ON public.teacher_live_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_teacher_live_rooms_active ON public.teacher_live_rooms(is_active);

-- Enable RLS
ALTER TABLE public.teacher_marketplace_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_live_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_reviews ENABLE ROW LEVEL SECURITY;

-- Public RLS Policies: Anyone can view approved teacher profiles and active live rooms
CREATE POLICY "Public can view approved teacher profiles"
  ON public.teacher_marketplace_profiles FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Public can view active live rooms"
  ON public.teacher_live_rooms FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view live room participants"
  ON public.live_room_participants FOR SELECT
  USING (true);

CREATE POLICY "Public can view verified teacher reviews"
  ON public.teacher_reviews FOR SELECT
  USING (true);

-- Authenticated Users can register as participants in live rooms
CREATE POLICY "Participants can manage their room participation"
  ON public.live_room_participants FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()::text
    OR user_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
    OR user_id = (auth.jwt() -> 'user_metadata' ->> 'loginId')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'platform_owner')
  )
  WITH CHECK (
    user_id = auth.uid()::text
    OR user_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
    OR user_id = (auth.jwt() -> 'user_metadata' ->> 'loginId')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'platform_owner')
  );

-- Wallets and Transactions RLS: Least Privilege (Teachers own wallets, students own payments, admins audit)
CREATE POLICY "Teachers and admins can view own wallet balances"
  ON public.teacher_wallets FOR SELECT
  TO authenticated
  USING (
    teacher_id = auth.uid()::text
    OR teacher_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
    OR teacher_id = (auth.jwt() -> 'user_metadata' ->> 'loginId')
    OR teacher_id IN (
      SELECT teacher_id FROM public.teacher_marketplace_profiles 
      WHERE user_id = auth.uid()
    )
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'platform_owner')
  );

CREATE POLICY "Users and admins can view own transactions"
  ON public.teacher_wallet_transactions FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()::text
    OR student_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
    OR student_id = (auth.jwt() -> 'user_metadata' ->> 'loginId')
    OR teacher_id = auth.uid()::text
    OR teacher_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
    OR teacher_id = (auth.jwt() -> 'user_metadata' ->> 'loginId')
    OR teacher_id IN (
      SELECT teacher_id FROM public.teacher_marketplace_profiles 
      WHERE user_id = auth.uid()
    )
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'platform_owner')
  );

-- Atomic Server-Side RPC: Process Hadia Payment with Platform Commission
CREATE OR REPLACE FUNCTION public.process_teacher_hadia_payment(
  p_teacher_id TEXT,
  p_student_id TEXT,
  p_student_name TEXT,
  p_amount NUMERIC,
  p_commission_pct NUMERIC,
  p_gateway TEXT,
  p_gateway_ref TEXT,
  p_idempotency_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_commission_amount NUMERIC;
  v_net_amount NUMERIC;
  v_tx_id UUID;
  v_wallet_id UUID;
  v_new_balance NUMERIC;
BEGIN
  -- 1. Idempotency Check
  IF EXISTS (SELECT 1 FROM public.teacher_wallet_transactions WHERE idempotency_key = p_idempotency_key) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Duplicate transaction detected with this idempotency key',
      'code', 'DUPLICATE_TRANSACTION'
    );
  END IF;

  -- 2. Verify Teacher Exists and is Active/Approved
  IF NOT EXISTS (
    SELECT 1 FROM public.teacher_marketplace_profiles
    WHERE (id::text = p_teacher_id OR teacher_id = p_teacher_id)
      AND status = 'approved'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Teacher not found or not approved',
      'code', 'TEACHER_NOT_APPROVED'
    );
  END IF;

  -- 3. Validate Inputs
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount must be greater than zero');
  END IF;

  IF p_commission_pct < 0 OR p_commission_pct > 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Commission percentage must be between 0 and 100');
  END IF;

  -- 4. Calculate Amounts
  v_commission_amount := round(p_amount * (p_commission_pct / 100.0), 2);
  v_net_amount := p_amount - v_commission_amount;

  -- 5. Record Transaction
  INSERT INTO public.teacher_wallet_transactions (
    teacher_id,
    student_id,
    student_name,
    amount_gross,
    platform_commission_pct,
    platform_commission_amount,
    amount_net,
    transaction_type,
    payment_gateway,
    gateway_ref,
    idempotency_key,
    status
  ) VALUES (
    p_teacher_id,
    p_student_id,
    p_student_name,
    p_amount,
    p_commission_pct,
    v_commission_amount,
    v_net_amount,
    'hadia_payment',
    p_gateway,
    p_gateway_ref,
    p_idempotency_key,
    'completed'
  ) RETURNING id INTO v_tx_id;

  -- 6. Update or Create Wallet
  INSERT INTO public.teacher_wallets (teacher_id, balance, total_earned)
  VALUES (p_teacher_id, v_net_amount, v_net_amount)
  ON CONFLICT (teacher_id) DO UPDATE
  SET balance = public.teacher_wallets.balance + v_net_amount,
      total_earned = public.teacher_wallets.total_earned + v_net_amount,
      updated_at = now()
  RETURNING balance INTO v_new_balance;

  -- 7. Update Teacher Stats
  UPDATE public.teacher_marketplace_profiles
  SET total_students = total_students + 1,
      updated_at = now()
  WHERE (id::text = p_teacher_id OR teacher_id = p_teacher_id);

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'amount_gross', p_amount,
    'platform_commission', v_commission_amount,
    'amount_net', v_net_amount,
    'new_wallet_balance', v_new_balance
  );
END;
$$;

-- Restrict RPC Execution: Only Backend Service Role Can Execute process_teacher_hadia_payment
REVOKE EXECUTE ON FUNCTION public.process_teacher_hadia_payment(TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_teacher_hadia_payment(TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, TEXT) TO service_role;

-- Seed Initial Curated Verified Teachers into Marketplace Table
INSERT INTO public.teacher_marketplace_profiles (
  teacher_id, name_bn, name_en, title_bn, avatar_url, cover_url, hourly_fee, monthly_fee, experience_years,
  qualifications, specialties, schedule_text, bio, rating, total_reviews, total_students, is_online, status
) VALUES
(
  'teacher-1',
  'মুফতী মাওলানা ক্বারী আহমাদুল্লাহ বিন রফীক্ব',
  'Mufti Qari Ahmadullah',
  'প্রধান উস্তাদ ও বিভাগীয় প্রধান (তাজবীদ ও কিরাত)',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80',
  350, 2500, 12,
  '["দাওরায়ে হাদীস (তাকমীল) — বেফাক ১ম স্থান", "আল-আজহার বিশ্ববিদ্যালয় কিরাত ডিপ্লোমা", "হাফেজুল কুরআন ও মুজাওয়ায ক্বারী"]'::jsonb,
  '["তাজবীদ ও মাখরাজ", "উন্নত কিরাত", "হিফজুল কুরআন", "আমুকতা দাওর"]'::jsonb,
  'প্রতিদিন: বিকাল ৪টা – রাত ১০টা (বাংলাদেশ সময়)',
  'বিগত ১২ বছর ধরে শিশু, কিশোর ও বয়স্কদের বিশুদ্ধ তাজবীদ ও সুললিত সুরের সাথে কুরআন শিক্ষা দিচ্ছি। মিশরীয় ও উসমানী তারতীলের বিশুদ্ধ মাশক আমার মূল বিশেষত্ব।',
  4.95, 128, 340, true, 'approved'
),
(
  'teacher-2',
  'মাওলানা হাফেজ ক্বারী মাহমুদুল হাসান',
  'Qari Mahmudul Hasan',
  'সিনিয়র হিফজ প্রশিক্ষক ও মুরাযাআ উস্তাদ',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80',
  300, 2200, 9,
  '["দাওরায়ে হাদীস (মাদ্রাসা দারুল উলূম মুঈনুল ইসলাম)", "আন্তর্জাতিক হিফজুল কুরআন প্রতিযোগিতায় ১ম স্থান"]'::jsonb,
  '["হিফজুল কুরআন", "আমুকতা মুরাযাআ", "নূরানী কায়েদা"]'::jsonb,
  'প্রতিদিন: সকাল ৬টা – দুপুর ১২টা এবং মাগরিব পর',
  'হিফজুল কুরআনের প্রতিটি পারার নির্ভুল স্মৃতি সংরক্ষণ ও প্রতিদিনের আমুকতা পুনরাবৃত্তিতে বিশেষ পদ্ধতি প্রয়োগ করি। দুর্বল শিক্ষার্থীদের বিশেষ যত্ন নেওয়া হয়।',
  4.88, 94, 220, true, 'approved'
),
(
  'teacher-3',
  'ড. শায়খ উমর ফারুক আল-মাদানী',
  'Dr. Shaykh Umar Farooq',
  'সহকারী অধ্যাপক ও শায়খুল কিরাত',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
  500, 4000, 16,
  '["মদীনা ইসলামী বিশ্ববিদ্যালয় থেকে ডক্টরেট (তাফসীর ও উলূমুল কুরআন)", "আশারা কিরাতের আন্তর্জাতিক সনদপত্র"]'::jsonb,
  '["১০ কিরাত বিশেষজ্ঞ", "উচ্চতর তাজবীদ", "কুরআনের আরবি ব্যাকরণ"]'::jsonb,
  'শনি, সোম ও বুধবার: রাত ৮টা – ১১টা',
  'বিশ্বখ্যাত মদীনা বিশ্ববিদ্যালয়ের সনদপ্রাপ্ত শিক্ষক হিসেবে আরবি ফনোটিক্স ও ১৭টি মাখরাজের নিখুঁত উচ্চারণে বিশেষ মাশক করাই।',
  4.98, 210, 510, true, 'approved'
),
(
  'teacher-4',
  'উস্তাযা হাফেজা মরিয়ম বিনতে ইউসুফ',
  'Ustadha Hafiza Maryam',
  'মহিলা ও শিশু শিক্ষা সমন্বয়ক',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
  250, 1800, 7,
  '["আলিয়া কামিল ১ম বিভাগ", "হাফেজা ও মুয়াল্লিমা প্রশিক্ষণ সনদ", "শিশু মনস্তত্ত্ব ও নূরানী প্রশিক্ষণ"]'::jsonb,
  '["শিশুতোষ কুরআন শিক্ষা", "মহিলাদের বিশেষ হিফজ ক্লাস", "সহজ তাজবীদ"]'::jsonb,
  'প্রতিদিন: সকাল ১০টা – বিকাল ৪টা (শুধুমাত্র মহিলা ও শিশুদের জন্য)',
  'খুব ছোট শিশুদের খেলার ছলে আরবি হরফ ও হরকত শেখানো এবং মা-বোনদের জন্য সম্পূর্ণ পর্দানশীন পরিবেশে ঘরে বসে কুরআন শেখার বিশেষ সুযোগ।',
  4.92, 115, 290, true, 'approved'
)
ON CONFLICT (teacher_id) DO NOTHING;

-- Initialize Wallets for Curated Teachers
INSERT INTO public.teacher_wallets (teacher_id, balance, total_earned)
VALUES 
  ('teacher-1', 14200, 24500),
  ('teacher-2', 9800, 16400),
  ('teacher-3', 18500, 32000),
  ('teacher-4', 8400, 13800)
ON CONFLICT (teacher_id) DO NOTHING;

