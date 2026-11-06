-- ============================================================================
-- Migration: 20261104_bootstrap_secure_human_teacher.sql
-- Description: Consolidated Clean Bootstrap for Fresh Databases
--              Deploys the entire Human Teacher Marketplace with zero insecure 
--              defaults, zero permissive policies, zero fake balances/reviews,
--              universal identity immutability, comment privacy masking, 
--              and hardened double-entry payment verification.
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
  rating NUMERIC DEFAULT NULL, -- Unrated until verified reviews exist
  total_reviews INT DEFAULT 0,
  total_students INT DEFAULT 0,
  total_classes INT DEFAULT 0,
  is_online BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Teacher Wallets (Authoritative Financial Balance)
CREATE TABLE IF NOT EXISTS public.teacher_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT UNIQUE NOT NULL,
  balance NUMERIC DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
  total_earned NUMERIC DEFAULT 0.00 NOT NULL,
  total_withdrawn NUMERIC DEFAULT 0.00 NOT NULL,
  currency TEXT DEFAULT 'BDT',
  is_withdrawal_held BOOLEAN DEFAULT false,
  hold_reason TEXT DEFAULT NULL,
  reconciliation_required BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Teacher Wallet Transactions (Immutable Transaction Ledger)
CREATE TABLE IF NOT EXISTS public.teacher_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT NOT NULL,
  student_id TEXT,
  student_name TEXT,
  amount_gross NUMERIC NOT NULL CHECK (amount_gross > 0),
  platform_commission_pct NUMERIC NOT NULL CHECK (platform_commission_pct >= 0 AND platform_commission_pct <= 100),
  platform_commission_amount NUMERIC NOT NULL CHECK (platform_commission_amount >= 0),
  amount_net NUMERIC NOT NULL CHECK (amount_net >= 0),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('hadia_payment', 'monthly_fee', 'withdrawal', 'refund', 'adjustment')),
  payment_gateway TEXT DEFAULT 'bkash' CHECK (payment_gateway IN ('bkash', 'nagad', 'manual')),
  merchant_account_id TEXT,
  gateway_ref TEXT,
  idempotency_key TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'pending_gateway_verification', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Teacher Group Live Rooms
CREATE TABLE IF NOT EXISTS public.teacher_live_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  room_id TEXT,
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
  role TEXT DEFAULT 'student' CHECK (role IN ('teacher', 'student', 'moderator')),
  is_speaking BOOLEAN DEFAULT false,
  hand_raised BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- 6. Teacher Genuine Reviews (Default Unverified & Pending Moderation)
CREATE TABLE IF NOT EXISTS public.teacher_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  moderation_status TEXT DEFAULT 'pending_moderation' CHECK (moderation_status IN ('pending_moderation', 'approved', 'rejected')),
  is_verified_transaction BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_teacher_marketplace_status ON public.teacher_marketplace_profiles(status);
CREATE INDEX IF NOT EXISTS idx_teacher_marketplace_online ON public.teacher_marketplace_profiles(is_online);
CREATE INDEX IF NOT EXISTS idx_teacher_wallet_tx_teacher ON public.teacher_wallet_transactions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_wallet_tx_created ON public.teacher_wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teacher_live_rooms_code ON public.teacher_live_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_teacher_live_rooms_active ON public.teacher_live_rooms(is_active);

-- Permanent Unique Constraint: Prevent reuse of gateway references across ALL statuses (completed, failed, refunded)
CREATE UNIQUE INDEX IF NOT EXISTS idx_teacher_wallet_tx_gateway_uniq 
  ON public.teacher_wallet_transactions (payment_gateway, gateway_ref) 
  WHERE gateway_ref IS NOT NULL;

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (Strict Least-Privilege from Start)
-- ----------------------------------------------------------------------------
ALTER TABLE public.teacher_marketplace_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_live_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can only view approved profiles
CREATE POLICY "Public can view approved teacher profiles"
  ON public.teacher_marketplace_profiles FOR SELECT
  USING (status = 'approved');

-- Live Rooms: Public can only view active rooms
CREATE POLICY "Public can view active live rooms"
  ON public.teacher_live_rooms FOR SELECT
  USING (is_active = true);

-- Wallets: Only verified teachers and platform admins can inspect wallet balances
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

-- Transactions: Only the verified student, teacher, or admin can inspect transactions
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

-- Live Room Participants: Zero public access; strict participant visibility
CREATE POLICY "Authorized users can view room participants"
  ON public.live_room_participants FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()::text
    OR user_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
    OR user_id = (auth.jwt() -> 'user_metadata' ->> 'loginId')
    OR room_id IN (
      SELECT id FROM public.teacher_live_rooms 
      WHERE teacher_id = auth.uid()::text 
         OR teacher_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
         OR teacher_id IN (SELECT teacher_id FROM public.teacher_marketplace_profiles WHERE user_id = auth.uid())
    )
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'platform_owner')
  );

-- Room Joining: Regular users enter strictly as 'student'
CREATE POLICY "Users can join rooms with restricted role"
  ON public.live_room_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      user_id = auth.uid()::text
      OR user_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
      OR user_id = (auth.jwt() -> 'user_metadata' ->> 'loginId')
    )
    AND (
      role = 'student'
      OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'platform_owner')
      OR room_id IN (
        SELECT id FROM public.teacher_live_rooms 
        WHERE teacher_id = auth.uid()::text 
           OR teacher_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
           OR teacher_id IN (SELECT teacher_id FROM public.teacher_marketplace_profiles WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can update own status without role escalation"
  ON public.live_room_participants FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()::text
    OR user_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
    OR user_id = (auth.jwt() -> 'user_metadata' ->> 'loginId')
    OR room_id IN (
      SELECT id FROM public.teacher_live_rooms 
      WHERE teacher_id = auth.uid()::text 
         OR teacher_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
         OR teacher_id IN (SELECT teacher_id FROM public.teacher_marketplace_profiles WHERE user_id = auth.uid())
    )
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'platform_owner')
  )
  WITH CHECK (
    user_id = auth.uid()::text
    OR user_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
    OR user_id = (auth.jwt() -> 'user_metadata' ->> 'loginId')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'platform_owner')
    OR room_id IN (
      SELECT id FROM public.teacher_live_rooms 
      WHERE teacher_id = auth.uid()::text 
         OR teacher_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
         OR teacher_id IN (SELECT teacher_id FROM public.teacher_marketplace_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can leave and hosts can remove participants"
  ON public.live_room_participants FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()::text
    OR user_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
    OR user_id = (auth.jwt() -> 'user_metadata' ->> 'loginId')
    OR room_id IN (
      SELECT id FROM public.teacher_live_rooms 
      WHERE teacher_id = auth.uid()::text 
         OR teacher_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
         OR teacher_id IN (SELECT teacher_id FROM public.teacher_marketplace_profiles WHERE user_id = auth.uid())
    )
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'platform_owner')
  );

-- Reviews: Raw records visible only to author, reviewed teacher, and platform admin
CREATE POLICY "Authors and teachers can view raw review records"
  ON public.teacher_reviews FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()::text
    OR student_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
    OR student_id = (auth.jwt() -> 'user_metadata' ->> 'loginId')
    OR teacher_id = auth.uid()::text
    OR teacher_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
    OR teacher_id = (auth.jwt() -> 'user_metadata' ->> 'loginId')
    OR teacher_id IN (
      SELECT teacher_id FROM public.teacher_marketplace_profiles WHERE user_id = auth.uid()
    )
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'platform_owner')
  );

-- ----------------------------------------------------------------------------
-- UNIVERSAL IDENTITY IMMUTABILITY TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_live_room_participant_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_is_host BOOLEAN;
BEGIN
  -- 1. UNIVERSAL IMMUTABILITY: user_id, room_id, and joined_at can NEVER be altered by ANYONE
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Access Denied: Participant user_id is strictly immutable for all users';
  END IF;

  IF NEW.room_id IS DISTINCT FROM OLD.room_id THEN
    RAISE EXCEPTION 'Access Denied: Participant room_id is strictly immutable for all users';
  END IF;

  IF NEW.joined_at IS DISTINCT FROM OLD.joined_at THEN
    RAISE EXCEPTION 'Access Denied: Participant joined_at is strictly immutable for all users';
  END IF;

  -- 2. PRIVILEGE CLAIMS
  v_is_admin := (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'platform_owner');

  -- Room teacher ownership verification (Caller must be the authoritative owner/teacher of this room)
  SELECT EXISTS (
    SELECT 1 FROM public.teacher_live_rooms r
    WHERE r.id = OLD.room_id
      AND (
        r.teacher_id = auth.uid()::text
        OR r.teacher_id = (auth.jwt() -> 'user_metadata' ->> 'profileId')
        OR r.teacher_id = (auth.jwt() -> 'user_metadata' ->> 'loginId')
        OR r.teacher_id IN (SELECT teacher_id FROM public.teacher_marketplace_profiles WHERE user_id = auth.uid())
      )
  ) INTO v_is_host;

  -- 3. ROLE ALTERATION GUARD & SEPARATION OF PRIVILEGES
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT v_is_admin AND NOT v_is_host THEN
      RAISE EXCEPTION 'Access Denied: Only the verified room teacher or platform admin can change participant roles';
    END IF;

    IF NEW.role NOT IN ('teacher', 'moderator', 'student') THEN
      RAISE EXCEPTION 'Access Denied: Invalid participant role requested';
    END IF;

    -- Strict Rule: The 'teacher' role is reserved EXCLUSIVELY for the room's verified teacher.
    -- An ordinary host or assistant cannot promote an arbitrary student to teacher.
    IF NEW.role = 'teacher' AND NOT v_is_admin THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.teacher_live_rooms r
        WHERE r.id = OLD.room_id
          AND (
            r.teacher_id = NEW.user_id
            OR r.teacher_id IN (SELECT teacher_id FROM public.teacher_marketplace_profiles WHERE user_id::text = NEW.user_id)
          )
      ) THEN
        RAISE EXCEPTION 'Access Denied: The teacher role is strictly reserved for the authorized room teacher. Students cannot be promoted to teacher.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_participant_escalation ON public.live_room_participants;
CREATE TRIGGER trg_prevent_participant_escalation
  BEFORE UPDATE ON public.live_room_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_live_room_participant_escalation();

-- ----------------------------------------------------------------------------
-- PRIVACY-SAFE PUBLIC REVIEWS VIEW
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_teacher_reviews AS
SELECT 
  r.id,
  r.teacher_id,
  CASE 
    WHEN LENGTH(TRIM(r.student_name)) > 2 THEN 
      CONCAT(SUBSTRING(TRIM(r.student_name) FROM 1 FOR 1), '***', SUBSTRING(TRIM(r.student_name) FROM LENGTH(TRIM(r.student_name)) FOR 1))
    ELSE 'শিক্ষার্থী'
  END AS student_display_name,
  r.rating,
  -- Defense-in-depth: Expose comment ONLY after explicit admin/moderator approval
  CASE 
    WHEN r.moderation_status = 'approved' THEN
      regexp_replace(
        regexp_replace(
          COALESCE(r.comment, ''),
          '(\+?8801|01)[3-9][0-9]{8}',
          '[ফোন নম্বর গোপনীয়]',
          'g'
        ),
        '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
        '[ইমেইল গোপনীয়]',
        'g'
      )
    ELSE NULL
  END AS comment,
  r.moderation_status,
  r.is_verified_transaction,
  r.created_at
FROM public.teacher_reviews r
JOIN public.teacher_marketplace_profiles p ON (p.teacher_id = r.teacher_id OR p.id::text = r.teacher_id)
WHERE p.status = 'approved' 
  AND r.is_verified_transaction = true
  AND EXISTS (
    SELECT 1 FROM public.teacher_wallet_transactions t
    WHERE t.student_id = r.student_id 
      AND (t.teacher_id = r.teacher_id OR t.teacher_id = p.teacher_id)
      AND t.status = 'completed'
      AND t.transaction_type IN ('hadia_payment', 'monthly_fee')
      AND t.created_at <= r.created_at
  );

REVOKE ALL ON public.public_teacher_reviews FROM PUBLIC;
GRANT SELECT ON public.public_teacher_reviews TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- READ-ONLY RECONCILIATION PREVIEW FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.preview_teacher_wallet_reconciliation()
RETURNS TABLE (
  teacher_id TEXT,
  current_balance NUMERIC,
  current_total_earned NUMERIC,
  verified_credits NUMERIC,
  withdrawals NUMERIC,
  refunds NUMERIC,
  adjustments NUMERIC,
  calculated_ledger_balance NUMERIC,
  discrepancy NUMERIC,
  reconciliation_status TEXT,
  withdrawal_hold_status TEXT,
  hold_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.teacher_id,
    w.balance AS current_balance,
    w.total_earned AS current_total_earned,
    COALESCE(SUM(CASE WHEN t.transaction_type IN ('hadia_payment', 'monthly_fee') THEN t.amount_net ELSE 0 END), 0.00) AS verified_credits,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'withdrawal' THEN t.amount_net ELSE 0 END), 0.00) AS withdrawals,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'refund' THEN t.amount_net ELSE 0 END), 0.00) AS refunds,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'adjustment' THEN t.amount_net ELSE 0 END), 0.00) AS adjustments,
    (
      COALESCE(SUM(CASE WHEN t.transaction_type IN ('hadia_payment', 'monthly_fee', 'adjustment') THEN t.amount_net ELSE 0 END), 0.00)
      - COALESCE(SUM(CASE WHEN t.transaction_type IN ('withdrawal', 'refund') THEN t.amount_net ELSE 0 END), 0.00)
    ) AS calculated_ledger_balance,
    (
      w.balance - (
        COALESCE(SUM(CASE WHEN t.transaction_type IN ('hadia_payment', 'monthly_fee', 'adjustment') THEN t.amount_net ELSE 0 END), 0.00)
        - COALESCE(SUM(CASE WHEN t.transaction_type IN ('withdrawal', 'refund') THEN t.amount_net ELSE 0 END), 0.00)
      )
    ) AS discrepancy,
    CASE 
      WHEN w.balance = (
        COALESCE(SUM(CASE WHEN t.transaction_type IN ('hadia_payment', 'monthly_fee', 'adjustment') THEN t.amount_net ELSE 0 END), 0.00)
        - COALESCE(SUM(CASE WHEN t.transaction_type IN ('withdrawal', 'refund') THEN t.amount_net ELSE 0 END), 0.00)
      ) THEN 'BALANCED'
      ELSE 'DISCREPANCY_DETECTED'
    END AS reconciliation_status,
    CASE 
      WHEN COALESCE(w.is_withdrawal_held, false) = true THEN 'WITHDRAWAL_HELD'
      WHEN w.balance <> (
        COALESCE(SUM(CASE WHEN t.transaction_type IN ('hadia_payment', 'monthly_fee', 'adjustment') THEN t.amount_net ELSE 0 END), 0.00)
        - COALESCE(SUM(CASE WHEN t.transaction_type IN ('withdrawal', 'refund') THEN t.amount_net ELSE 0 END), 0.00)
      ) THEN 'WITHDRAWAL_HELD_DISCREPANCY'
      ELSE 'CLEAR'
    END AS withdrawal_hold_status,
    COALESCE(w.hold_reason, 
      CASE 
        WHEN w.balance <> (
          COALESCE(SUM(CASE WHEN t.transaction_type IN ('hadia_payment', 'monthly_fee', 'adjustment') THEN t.amount_net ELSE 0 END), 0.00)
          - COALESCE(SUM(CASE WHEN t.transaction_type IN ('withdrawal', 'refund') THEN t.amount_net ELSE 0 END), 0.00)
        ) THEN 'Discrepancy detected between recorded balance and completed transactions'
        ELSE NULL 
      END
    ) AS hold_reason
  FROM public.teacher_wallets w
  LEFT JOIN public.teacher_wallet_transactions t 
    ON t.teacher_id = w.teacher_id AND t.status = 'completed'
  GROUP BY w.teacher_id, w.balance, w.total_earned, w.is_withdrawal_held, w.hold_reason;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.preview_teacher_wallet_reconciliation() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.preview_teacher_wallet_reconciliation() TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- HARDENED PAYMENT SETTLEMENT RPC (Separated Gateway Provider & Merchant Identity)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.settle_verified_teacher_hadia_payment(
  p_intent_id TEXT,
  p_gateway_ref TEXT,
  p_verified_amount NUMERIC,
  p_verified_currency TEXT,
  p_gateway_provider TEXT,
  p_merchant_account_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_intent RECORD;
  v_new_balance NUMERIC;
BEGIN
  -- 1. Validate Input Parameters for NULL and Empty values
  IF p_intent_id IS NULL OR TRIM(p_intent_id) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment intent ID cannot be empty', 'code', 'EMPTY_INTENT_ID');
  END IF;

  IF p_gateway_ref IS NULL OR TRIM(p_gateway_ref) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gateway transaction reference cannot be empty', 'code', 'EMPTY_GATEWAY_REF');
  END IF;

  IF p_gateway_provider IS NULL OR TRIM(p_gateway_provider) = '' OR LOWER(TRIM(p_gateway_provider)) NOT IN ('bkash', 'nagad') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or unapproved payment gateway provider', 'code', 'INVALID_GATEWAY_PROVIDER');
  END IF;

  IF p_merchant_account_id IS NULL OR TRIM(p_merchant_account_id) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Official merchant account identity cannot be empty', 'code', 'EMPTY_MERCHANT_ACCOUNT_ID');
  END IF;

  IF p_verified_amount IS NULL OR p_verified_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Verified amount must be strictly greater than zero', 'code', 'INVALID_VERIFIED_AMOUNT');
  END IF;

  IF p_verified_currency IS DISTINCT FROM 'BDT' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid currency: must be BDT', 'code', 'CURRENCY_MISMATCH');
  END IF;

  -- 2. Intent Validation with Exclusive Row Lock
  SELECT * INTO v_intent
  FROM public.teacher_wallet_transactions
  WHERE idempotency_key = p_intent_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment intent not found in database', 'code', 'INTENT_NOT_FOUND');
  END IF;

  IF v_intent.status = 'completed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment intent already completed and settled', 'code', 'ALREADY_COMPLETED');
  END IF;

  IF v_intent.status IS DISTINCT FROM 'pending_gateway_verification' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment intent is not awaiting gateway verification', 'code', 'INVALID_INTENT_STATUS');
  END IF;

  -- 3. Verify Immutable Intent Matching
  IF v_intent.teacher_id IS NULL OR v_intent.student_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Intent record has missing participant identity', 'code', 'CORRUPT_INTENT');
  END IF;

  IF v_intent.amount_gross IS DISTINCT FROM p_verified_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount mismatch between intent and verified gateway payload', 'code', 'AMOUNT_MISMATCH');
  END IF;

  IF v_intent.payment_gateway IS DISTINCT FROM LOWER(TRIM(p_gateway_provider)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gateway provider mismatch with original intent', 'code', 'GATEWAY_MISMATCH');
  END IF;

  -- STRICT PERSISTED MERCHANT VALIDATION: Reject NULL or empty, require exact match
  IF v_intent.merchant_account_id IS NULL OR TRIM(v_intent.merchant_account_id) = '' THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Corrupt payment intent: persisted merchant account ID is missing', 
      'code', 'MISSING_PERSISTED_MERCHANT_ID'
    );
  END IF;

  IF v_intent.merchant_account_id IS DISTINCT FROM p_merchant_account_id THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Merchant account mismatch with recorded payment intent', 
      'code', 'MERCHANT_MISMATCH'
    );
  END IF;

  -- 4. Verify Gateway Transaction ID has not been used across ANY transaction (completed, refunded, or failed)
  IF EXISTS (
    SELECT 1 FROM public.teacher_wallet_transactions 
    WHERE payment_gateway = LOWER(TRIM(p_gateway_provider)) 
      AND COALESCE(merchant_account_id, '') = COALESCE(p_merchant_account_id, '')
      AND gateway_ref = p_gateway_ref 
      AND id != v_intent.id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gateway transaction reference has already been used in another transaction', 'code', 'DUPLICATE_GATEWAY_REF');
  END IF;

  -- 5. Atomic Transition to Completed
  UPDATE public.teacher_wallet_transactions
  SET status = 'completed',
      gateway_ref = p_gateway_ref,
      payment_gateway = LOWER(TRIM(p_gateway_provider)),
      merchant_account_id = p_merchant_account_id
  WHERE id = v_intent.id;

  -- 6. Atomically Credit Teacher Wallet
  INSERT INTO public.teacher_wallets (teacher_id, balance, total_earned, total_withdrawn)
  VALUES (v_intent.teacher_id, v_intent.amount_net, v_intent.amount_net, 0.00)
  ON CONFLICT (teacher_id) DO UPDATE
  SET balance = public.teacher_wallets.balance + v_intent.amount_net,
      total_earned = public.teacher_wallets.total_earned + v_intent.amount_net,
      updated_at = now()
  RETURNING balance INTO v_new_balance;

  -- 7. Update Teacher Verified Student Count
  UPDATE public.teacher_marketplace_profiles
  SET total_students = total_students + 1,
      updated_at = now()
  WHERE (id::text = v_intent.teacher_id OR teacher_id = v_intent.teacher_id);

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_intent.id,
    'amount_gross', v_intent.amount_gross,
    'amount_net', v_intent.amount_net,
    'new_wallet_balance', v_new_balance
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.settle_verified_teacher_hadia_payment(TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_verified_teacher_hadia_payment(TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT) TO service_role;

