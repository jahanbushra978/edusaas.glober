-- ====================================================================
-- MIGRATION: 20261116_user_points_wallet.sql
-- Description: Centralized User Points Wallet & Secure Daily Login Bonus
-- Target: Supabase PostgreSQL (Run Manually in Supabase SQL Editor)
-- Security: Strict RLS, Atomic Transactions, auth.uid() Verification, Idempotency
-- ====================================================================

-- 1. USER WALLETS TABLE
CREATE TABLE IF NOT EXISTS public.user_wallets (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned INT NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
  total_spent INT NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  last_daily_bonus_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON public.user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_last_bonus ON public.user_wallets(last_daily_bonus_at);

-- 2. WALLET TRANSACTIONS LEDGER TABLE (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'WELCOME_BONUS',
    'DAILY_LOGIN',
    'REFERRAL_REWARD',
    'GAME_START',
    'GAME_WIN',
    'GAME_LOSS',
    'FEATURE_USAGE'
  )),
  description TEXT NOT NULL,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created ON public.wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_type ON public.wallet_transactions(transaction_type);

-- 3. ENABLE ROW LEVEL SECURITY (Zero Trust Isolation)
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own wallet
CREATE POLICY "Users can view own wallet"
  ON public.user_wallets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only view their own transaction history
CREATE POLICY "Users can view own transactions"
  ON public.wallet_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Deny direct client inserts/updates (All mutations must go through authorized RPCs)
CREATE POLICY "Deny direct wallet mutations"
  ON public.user_wallets
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny direct transaction mutations"
  ON public.wallet_transactions
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- 4. SECURE ATOMIC RPC FUNCTION: claim_daily_login_bonus
-- Resolves authenticated identity directly from auth.uid() or verified session
CREATE OR REPLACE FUNCTION public.claim_daily_login_bonus(p_target_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_wallet RECORD;
  v_now TIMESTAMPTZ := clock_timestamp();
  v_idempotency TEXT;
BEGIN
  -- Security check: derive user from authenticated session context
  IF p_target_user_id IS NOT NULL THEN
    -- If explicit ID is passed (e.g., from server-side admin client), ensure caller has service role or matches
    IF auth.role() = 'service_role' OR auth.uid() = p_target_user_id THEN
      v_user_id := p_target_user_id;
    ELSE
      RAISE EXCEPTION 'Access Denied: unauthorized user ID parameter' USING ERRCODE = '42501';
    END IF;
  ELSE
    v_user_id := auth.uid();
  END IF;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'লগইন সেশন পাওয়া যায়নি।'
    );
  END IF;

  -- Ensure wallet row exists with atomic row-level lock
  INSERT INTO public.user_wallets (user_id, balance, total_earned, total_spent)
  VALUES (v_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_wallet
  FROM public.user_wallets
  WHERE user_id = v_user_id
  FOR UPDATE;

  -- Strict 24-hour verification: user cannot claim if 24 hours have not elapsed
  IF v_wallet.last_daily_bonus_at IS NOT NULL AND 
     v_wallet.last_daily_bonus_at > (v_now - INTERVAL '24 hours') THEN
    RETURN jsonb_build_object(
      'success', false,
      'already_claimed', true,
      'message', 'আজকের লগইন বোনাস ইতিমধ্যে নেওয়া হয়েছে। ২৪ ঘণ্টা পর পুনরায় পাবেন।',
      'last_claimed_at', v_wallet.last_daily_bonus_at,
      'next_eligible_at', v_wallet.last_daily_bonus_at + INTERVAL '24 hours',
      'balance', v_wallet.balance
    );
  END IF;

  -- Generate atomic idempotency key based on rolling 24h window
  v_idempotency := v_user_id || '_daily_' || to_char(v_now, 'YYYYMMDD_HH24');

  -- Atomically award +20 points
  UPDATE public.user_wallets
  SET balance = balance + 20,
      total_earned = total_earned + 20,
      last_daily_bonus_at = v_now,
      updated_at = v_now
  WHERE user_id = v_user_id;

  -- Record transaction ledger entry
  INSERT INTO public.wallet_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    idempotency_key
  ) VALUES (
    v_user_id,
    20,
    'DAILY_LOGIN',
    'দৈনিক লগইন বোনাস (+২০ পয়েন্ট)',
    v_idempotency
  );

  RETURN jsonb_build_object(
    'success', true,
    'already_claimed', false,
    'points_awarded', 20,
    'new_balance', v_wallet.balance + 20,
    'message', 'মাশাআল্লাহ! সফল লগইনের জন্য ২০ পয়েন্ট দৈনিক বোনাস যুক্ত হয়েছে।'
  );
END;
$$;

-- Revoke public execution, allow only authenticated users and service role
REVOKE EXECUTE ON FUNCTION public.claim_daily_login_bonus FROM public;
GRANT EXECUTE ON FUNCTION public.claim_daily_login_bonus TO authenticated, service_role;
