-- ============================================================================
-- Migration: 20261105_harden_human_teacher_security.sql
-- Description: Alternative B: Forward Migration for EXISTING Databases
--              (Upgrades schemas created by 20261103_human_teacher_marketplace.sql)
--              Remediates Permissive RLS Policies, Live Room Role Escalation,
--              Review Privacy Masking, Double-Entry Wallet Reconciliation & 
--              Hardened Settlement RPC with Strict Merchant ID Matching.
-- WARNING:     MUTUALLY EXCLUSIVE with 20261104_bootstrap_secure_human_teacher.sql.
--              DO NOT run this migration on a fresh database.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SCHEMA COMPATIBILITY & ALTER TABLE OPERATIONS
-- ----------------------------------------------------------------------------

-- Ensure status default on profiles is strictly 'pending' (requires admin approval)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teacher_marketplace_profiles') THEN
    ALTER TABLE public.teacher_marketplace_profiles 
      ALTER COLUMN status SET DEFAULT 'pending';

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'teacher_marketplace_profiles_status_check'
    ) THEN
      ALTER TABLE public.teacher_marketplace_profiles 
        ADD CONSTRAINT teacher_marketplace_profiles_status_check 
        CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));
    END IF;
  END IF;
END $$;

-- Update status check constraint and add merchant_account_id on teacher_wallet_transactions
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teacher_wallet_transactions') THEN
    ALTER TABLE public.teacher_wallet_transactions 
      DROP CONSTRAINT IF EXISTS teacher_wallet_transactions_status_check;

    ALTER TABLE public.teacher_wallet_transactions 
      ADD CONSTRAINT teacher_wallet_transactions_status_check 
      CHECK (status IN ('pending', 'pending_gateway_verification', 'completed', 'failed', 'refunded'));

    ALTER TABLE public.teacher_wallet_transactions 
      ADD COLUMN IF NOT EXISTS merchant_account_id TEXT;
  END IF;
END $$;

-- Permanent Unique Index: Audit duplicates first, then enforce permanent uniqueness
DO $$ 
DECLARE
  v_dup_count INT;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teacher_wallet_transactions') THEN
    -- Audit existing records to verify no duplicate gateway reference collision exists
    SELECT COUNT(*) INTO v_dup_count
    FROM (
      SELECT payment_gateway, COALESCE(merchant_account_id, ''), gateway_ref
      FROM public.teacher_wallet_transactions
      WHERE gateway_ref IS NOT NULL
      GROUP BY payment_gateway, COALESCE(merchant_account_id, ''), gateway_ref
      HAVING COUNT(*) > 1
    ) dups;

    IF v_dup_count > 0 THEN
      RAISE EXCEPTION 'CANNOT_CREATE_INDEX: Found % duplicate gateway reference groups in teacher_wallet_transactions. Audit and deduplicate before applying unique index.', v_dup_count;
    END IF;

    -- Purge previous index definitions to prevent naming/definition conflicts
    DROP INDEX IF EXISTS public.idx_teacher_wallet_tx_unique_gateway_ref;
    DROP INDEX IF EXISTS public.idx_teacher_wallet_tx_gateway_uniq;

    -- Create permanent unique constraint across provider, merchant, and gateway reference
    CREATE UNIQUE INDEX idx_teacher_wallet_tx_gateway_uniq 
      ON public.teacher_wallet_transactions (payment_gateway, COALESCE(merchant_account_id, ''), gateway_ref) 
      WHERE gateway_ref IS NOT NULL;
  END IF;
END $$;

-- Ensure reviews default to unverified and add explicit comment moderation
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teacher_reviews') THEN
    ALTER TABLE public.teacher_reviews 
      ALTER COLUMN is_verified_transaction SET DEFAULT false;

    ALTER TABLE public.teacher_reviews 
      ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending_moderation';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teacher_marketplace_reviews') THEN
    ALTER TABLE public.teacher_marketplace_reviews 
      ALTER COLUMN is_verified_transaction SET DEFAULT false;

    ALTER TABLE public.teacher_marketplace_reviews 
      ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending_moderation';
  END IF;
END $$;

-- Room ID / Room Code Compatibility in teacher_live_rooms
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teacher_live_rooms') THEN
    ALTER TABLE public.teacher_live_rooms 
      ADD COLUMN IF NOT EXISTS room_code TEXT;

    ALTER TABLE public.teacher_live_rooms 
      ADD COLUMN IF NOT EXISTS room_id TEXT;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. EXPLICIT PURGE OF ALL LEGACY & PERMISSIVE RLS POLICIES & INSECURE RPCS
-- ----------------------------------------------------------------------------

-- Drop legacy insecure RPC if it exists from 20261103 migration
DROP FUNCTION IF EXISTS public.process_teacher_hadia_payment(TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, TEXT);

-- Purge all legacy permissive wallet policies
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teacher_wallets') THEN
    DROP POLICY IF EXISTS "Public can read teacher wallet balances" ON public.teacher_wallets;
    DROP POLICY IF EXISTS "Teachers and admins can view own wallet balances" ON public.teacher_wallets;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teacher_wallet_transactions') THEN
    DROP POLICY IF EXISTS "Users can view relevant transactions" ON public.teacher_wallet_transactions;
    DROP POLICY IF EXISTS "Users and admins can view own transactions" ON public.teacher_wallet_transactions;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'live_room_participants') THEN
    DROP POLICY IF EXISTS "Public can view live room participants" ON public.live_room_participants;
    DROP POLICY IF EXISTS "Participants can manage their room participation" ON public.live_room_participants;
    DROP POLICY IF EXISTS "Room participants and teachers can view attendance" ON public.live_room_participants;
    DROP POLICY IF EXISTS "Authorized users can view room participants" ON public.live_room_participants;
    DROP POLICY IF EXISTS "Users can join rooms with restricted role" ON public.live_room_participants;
    DROP POLICY IF EXISTS "Users can update own status without role escalation" ON public.live_room_participants;
    DROP POLICY IF EXISTS "Users can leave and hosts can remove participants" ON public.live_room_participants;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teacher_reviews') THEN
    DROP POLICY IF EXISTS "Public can read reviews of approved teachers" ON public.teacher_reviews;
    DROP POLICY IF EXISTS "Public can view verified teacher reviews" ON public.teacher_reviews;
    DROP POLICY IF EXISTS "Authors and teachers can view raw review records" ON public.teacher_reviews;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teacher_marketplace_reviews') THEN
    DROP POLICY IF EXISTS "Public can read reviews of approved teachers" ON public.teacher_marketplace_reviews;
    DROP POLICY IF EXISTS "Authors and teachers can view raw review records" ON public.teacher_marketplace_reviews;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 3. REPLACEMENT LEAST-PRIVILEGE RLS POLICIES
-- ----------------------------------------------------------------------------

-- A. Wallets: Strict authenticated teacher & admin access only
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

-- B. Transactions: Strict relevant student, teacher & admin access only
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

-- C. Live Room Participants: Privilege Separation
-- C1. SELECT: Participants of active rooms, hosts, and admins only (ZERO public access)
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

-- C2. INSERT: Users can join rooms as student only (No self-promotion to teacher/moderator)
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

-- C3. UPDATE: Users can update speaking/hand-raise only
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

-- C4. DELETE: Users can leave; hosts and admins can remove participants
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

-- ----------------------------------------------------------------------------
-- 4. DATABASE TRIGGER: ENFORCE STRICT LIVE ROOM PARTICIPANT ROLE IMMUTABILITY
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
  -- (Applies strictly to normal participants, hosts, and platform administrators alike)
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Access Denied: Participant user_id is strictly immutable for all users';
  END IF;

  IF NEW.room_id IS DISTINCT FROM OLD.room_id THEN
    RAISE EXCEPTION 'Access Denied: Participant room_id is strictly immutable for all users';
  END IF;

  IF NEW.joined_at IS DISTINCT FROM OLD.joined_at THEN
    RAISE EXCEPTION 'Access Denied: Participant joined_at is strictly immutable for all users';
  END IF;

  -- 2. DETERMINE PRIVILEGED CALLER CLAIMS
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
    -- Only platform admin or verified room teacher can change participant roles
    IF NOT v_is_admin AND NOT v_is_host THEN
      RAISE EXCEPTION 'Access Denied: Only the verified room teacher or platform admin can change participant roles';
    END IF;

    -- Guard against unknown roles
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
-- 5. TEACHER REVIEWS PRIVACY & APPROVED DISPLAY VIEW
-- ----------------------------------------------------------------------------

-- Raw table is restricted to authors, reviewed teachers, and admins
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

-- Safe Public Reviews View: Masks student identifiers, redacts sensitive contact data, and verifies dual ownership
CREATE OR REPLACE VIEW public.public_teacher_reviews AS
SELECT 
  r.id,
  r.teacher_id,
  -- Mask student full name for public privacy (e.g. "আ***দ" or "শিক্ষার্থী")
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
-- 6. READ-ONLY WALLET RECONCILIATION PREVIEW (NON-DESTRUCTIVE)
-- ----------------------------------------------------------------------------
-- Safely previews discrepancies between recorded wallet balances and completed ledger transactions
-- Preserves genuine historical financial data; DOES NOT destructively overwrite balances automatically.

ALTER TABLE public.teacher_wallets 
  ADD COLUMN IF NOT EXISTS is_withdrawal_held BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS hold_reason TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reconciliation_required BOOLEAN DEFAULT false;

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
-- 6B. SAFE HISTORICAL SEED DATA SANITIZATION (NON-DESTRUCTIVE)
-- ----------------------------------------------------------------------------
-- In the historical base migration 20261103, four demo profiles ('teacher-1', 'teacher-2',
-- 'teacher-3', 'teacher-4') were seeded with unearned 'approved' status, fabricated ratings,
-- and unbacked wallet balances totaling 50,900 BDT.
--
-- Financial Data Preservation Invariants:
-- 1. DO NOT DELETE rows: Preserves foreign key integrity and audit logs.
-- 2. FINANCIAL DATA PRESERVED: NEVER automatically zero out recorded balances or earnings.
--    All recorded values are preserved for manual accounting and authorized finance review.
-- 3. WITHDRAWAL HOLD PLACED:
--    Unverified seed wallets are flagged with is_withdrawal_held = true, reconciliation_required = true,
--    and a documented hold_reason, preventing any payout until authorized audit reconciliation.
-- 4. RECOMPUTE PROFILE STATS FROM AUTHENTIC LEDGER:
--    - Set status = 'suspended' (or 'pending' if linked to an authenticated user).
--    - Recompute rating and total_reviews strictly from genuine, approved reviews with matching transactions.
--    - Recompute total_students and total_classes from genuine completed transactions and classes.

-- A. Recompute profile metrics and exclude unverified seeds from public marketplace
UPDATE public.teacher_marketplace_profiles p
SET 
  status = CASE 
    WHEN p.user_id IS NOT NULL THEN 'pending' 
    ELSE 'suspended' 
  END,
  rating = COALESCE(
    (
      SELECT ROUND(AVG(r.rating)::numeric, 2)
      FROM public.teacher_reviews r
      WHERE (r.teacher_id = p.teacher_id OR r.teacher_id = p.id::text)
        AND r.is_verified_transaction = true
        AND r.moderation_status = 'approved'
        AND EXISTS (
          SELECT 1 FROM public.teacher_wallet_transactions t
          WHERE t.student_id = r.student_id 
            AND (t.teacher_id = r.teacher_id OR t.teacher_id = p.teacher_id)
            AND t.status = 'completed'
            AND t.transaction_type IN ('hadia_payment', 'monthly_fee')
            AND t.created_at <= r.created_at
        )
    ),
    0.00
  ),
  total_reviews = COALESCE(
    (
      SELECT COUNT(*)::int
      FROM public.teacher_reviews r
      WHERE (r.teacher_id = p.teacher_id OR r.teacher_id = p.id::text)
        AND r.is_verified_transaction = true
        AND r.moderation_status = 'approved'
        AND EXISTS (
          SELECT 1 FROM public.teacher_wallet_transactions t
          WHERE t.student_id = r.student_id 
            AND (t.teacher_id = r.teacher_id OR t.teacher_id = p.teacher_id)
            AND t.status = 'completed'
            AND t.transaction_type IN ('hadia_payment', 'monthly_fee')
            AND t.created_at <= r.created_at
        )
    ),
    0
  ),
  total_students = COALESCE(
    (
      SELECT COUNT(DISTINCT t.student_id)::int
      FROM public.teacher_wallet_transactions t
      WHERE (t.teacher_id = p.teacher_id OR t.teacher_id = p.id::text)
        AND t.status = 'completed'
    ),
    0
  ),
  total_classes = COALESCE(
    (
      SELECT COUNT(*)::int
      FROM public.teacher_live_rooms lr
      WHERE (lr.teacher_id = p.teacher_id OR lr.teacher_id = p.id::text)
        AND lr.is_active = false
    ),
    0
  )
WHERE p.teacher_id IN ('teacher-1', 'teacher-2', 'teacher-3', 'teacher-4');

-- B. Non-Destructive Wallet Hold: Preserve balance and earnings while placing administrative hold
UPDATE public.teacher_wallets
SET 
  is_withdrawal_held = true,
  hold_reason = 'SEED_WALLET_UNRECONCILED_HOLD: Preserved historical balance pending authorized finance review',
  reconciliation_required = true
WHERE teacher_id IN ('teacher-1', 'teacher-2', 'teacher-3', 'teacher-4');

-- ----------------------------------------------------------------------------
-- 7. HARDENED PAYMENT SETTLEMENT RPC (Separated Gateway Provider & Merchant Identity)
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
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Payment intent ID cannot be empty', 
      'code', 'EMPTY_INTENT_ID'
    );
  END IF;

  IF p_gateway_ref IS NULL OR TRIM(p_gateway_ref) = '' THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Gateway transaction reference cannot be empty', 
      'code', 'EMPTY_GATEWAY_REF'
    );
  END IF;

  IF p_gateway_provider IS NULL OR TRIM(p_gateway_provider) = '' OR LOWER(TRIM(p_gateway_provider)) NOT IN ('bkash', 'nagad') THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Invalid or unapproved payment gateway provider', 
      'code', 'INVALID_GATEWAY_PROVIDER'
    );
  END IF;

  IF p_merchant_account_id IS NULL OR TRIM(p_merchant_account_id) = '' THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Official merchant account identity cannot be empty', 
      'code', 'EMPTY_MERCHANT_ACCOUNT_ID'
    );
  END IF;

  IF p_verified_amount IS NULL OR p_verified_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Verified amount must be strictly greater than zero', 
      'code', 'INVALID_VERIFIED_AMOUNT'
    );
  END IF;

  IF p_verified_currency IS DISTINCT FROM 'BDT' THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Invalid currency: must be BDT', 
      'code', 'CURRENCY_MISMATCH'
    );
  END IF;

  -- 2. Intent Validation with Exclusive Row Lock (Prevent concurrent double settlement)
  SELECT * INTO v_intent
  FROM public.teacher_wallet_transactions
  WHERE idempotency_key = p_intent_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Payment intent not found in database', 
      'code', 'INTENT_NOT_FOUND'
    );
  END IF;

  IF v_intent.status = 'completed' THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Payment intent already completed and settled', 
      'code', 'ALREADY_COMPLETED'
    );
  END IF;

  IF v_intent.status IS DISTINCT FROM 'pending_gateway_verification' THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Payment intent is not awaiting gateway verification', 
      'code', 'INVALID_INTENT_STATUS'
    );
  END IF;

  -- 3. Verify Immutable Intent Matching
  IF v_intent.teacher_id IS NULL OR v_intent.student_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Intent record has missing participant identity', 
      'code', 'CORRUPT_INTENT'
    );
  END IF;

  IF v_intent.amount_gross IS DISTINCT FROM p_verified_amount THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Amount mismatch between intent and verified gateway payload', 
      'code', 'AMOUNT_MISMATCH'
    );
  END IF;

  IF v_intent.payment_gateway IS DISTINCT FROM LOWER(TRIM(p_gateway_provider)) THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Gateway provider mismatch with original intent', 
      'code', 'GATEWAY_MISMATCH'
    );
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
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Gateway transaction reference has already been settled in another transaction', 
      'code', 'DUPLICATE_GATEWAY_REF'
    );
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

-- Restrict RPC execution strictly to backend service role
REVOKE EXECUTE ON FUNCTION public.settle_verified_teacher_hadia_payment(TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_verified_teacher_hadia_payment(TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT) TO service_role;
