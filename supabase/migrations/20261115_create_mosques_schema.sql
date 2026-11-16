-- ====================================================================
-- MIGRATION: 20261115_create_mosques_schema.sql
-- Description: Digital Mosque Platform Cloud Schema with Enterprise RLS
-- Target: Supabase PostgreSQL
-- ====================================================================

-- 1. MOSQUES TABLE (Central Registry of independent Mosques / Tenants)
CREATE TABLE IF NOT EXISTS public.mosques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  arabic_name TEXT,
  established TEXT DEFAULT '১৯৯৮',
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  division TEXT DEFAULT 'ঢাকা',
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  custom_domain TEXT UNIQUE,
  logo_letter TEXT DEFAULT 'বা',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_mosques_status ON public.mosques(status);
CREATE INDEX IF NOT EXISTS idx_mosques_district ON public.mosques(district);
CREATE INDEX IF NOT EXISTS idx_mosques_custom_domain ON public.mosques(custom_domain);

-- 2. MOSQUE PRAYER SCHEDULES (Live Azan, Jama'at and Prohibited Times)
CREATE TABLE IF NOT EXISTS public.mosque_prayer_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  schedule JSONB NOT NULL DEFAULT '[
    {"id": "fajr", "name": "ফজর", "arabic": "الفجر", "start": "০৫:০২ AM", "jamaat": "০৫:২৫ AM", "end": "০৬:১৮ AM"},
    {"id": "sunrise", "name": "সূর্যোদয়", "arabic": "الشروق", "start": "০৬:১৯ AM", "jamaat": "—", "end": "০৬:৩৫ AM", "isForbidden": true},
    {"id": "dhuhr", "name": "যোহর", "arabic": "الظهر", "start": "১১:৪৬ AM", "jamaat": "০১:১৫ PM", "end": "০৩:৪৩ PM"},
    {"id": "asr", "name": "আসর", "arabic": "العصر", "start": "০৩:৪৪ PM", "jamaat": "০৪:১৫ PM", "end": "০৫:০৮ PM"},
    {"id": "maghrib", "name": "মাগরিব", "arabic": "المغرب", "start": "০৫:০৯ PM", "jamaat": "০৫:১৫ PM", "end": "০৬:২৩ PM"},
    {"id": "isha", "name": "এশা", "arabic": "العشاء", "start": "০৬:২৪ PM", "jamaat": "০৭:৩০ PM", "end": "০৪:৫৯ AM"},
    {"id": "jumuah", "name": "পবিত্র জুমু''আ", "arabic": "الجمعة", "start": "১১:৪৬ AM", "jamaat": "০১:৩০ PM", "end": "০৩:৪৩ PM", "isJummah": true}
  ]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_mosque_prayer_schedule UNIQUE (mosque_id)
);

-- 3. MOSQUE FUNDS TABLE (General, Construction, Zakat, Fitra, Welfare, etc.)
CREATE TABLE IF NOT EXISTS public.mosque_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC(12, 2) DEFAULT 0.00,
  current_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mosque_funds_mosque ON public.mosque_funds(mosque_id);

-- 4. MOSQUE DONATIONS / INFLOWS TABLE (Cash, bKash, Bank, Box Collections)
CREATE TABLE IF NOT EXISTS public.mosque_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  receipt_no TEXT NOT NULL,
  donor_name TEXT NOT NULL,
  donor_phone TEXT,
  fund_id UUID REFERENCES public.mosque_funds(id) ON DELETE SET NULL,
  fund_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT DEFAULT 'সাধারণ দান',
  payment_method TEXT NOT NULL DEFAULT 'নগদ (Cash)',
  status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mosque_donations_mosque ON public.mosque_donations(mosque_id);
CREATE INDEX IF NOT EXISTS idx_mosque_donations_created ON public.mosque_donations(created_at DESC);

-- 5. MOSQUE MEMBERS & EXECUTIVE COMMITTEE (President, Treasurer, Imam, Musalli)
CREATE TABLE IF NOT EXISTS public.mosque_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  member_code TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('PRESIDENT', 'SECRETARY', 'TREASURER', 'IMAM', 'KHATIB', 'MUEZZIN', 'COMMITTEE', 'MEMBER', 'STAFF')),
  phone TEXT NOT NULL,
  email TEXT,
  monthly_pledge NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mosque_members_mosque ON public.mosque_members(mosque_id);
CREATE INDEX IF NOT EXISTS idx_mosque_members_role ON public.mosque_members(role);

-- 6. MOSQUE EXPENSES & VOUCHERS TABLE (Bills, Maintenance, Salaries, Construction)
CREATE TABLE IF NOT EXISTS public.mosque_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  voucher_no TEXT NOT NULL,
  title TEXT NOT NULL,
  fund_id UUID REFERENCES public.mosque_funds(id) ON DELETE SET NULL,
  fund_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  spent_by TEXT,
  approved_by TEXT,
  status TEXT NOT NULL DEFAULT 'APPROVED' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mosque_expenses_mosque ON public.mosque_expenses(mosque_id);

-- 7. NOORANI MAKTAB & EDUCATION SUMMARY
CREATE TABLE IF NOT EXISTS public.mosque_maktab (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  students_count INT NOT NULL DEFAULT 0,
  teachers_count INT NOT NULL DEFAULT 0,
  active_session TEXT DEFAULT 'সকাল ও বিকাল ব্যাচ',
  monthly_fee NUMERIC(10, 2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_mosque_maktab UNIQUE (mosque_id)
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - ZERO TRUST MULTI-TENANCY
-- ====================================================================

-- Enable RLS on all 7 tables
ALTER TABLE public.mosques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mosque_prayer_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mosque_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mosque_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mosque_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mosque_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mosque_maktab ENABLE ROW LEVEL SECURITY;

-- 1. MOSQUES POLICIES:
-- Public can view approved mosques
CREATE POLICY "Public can view approved mosques"
  ON public.mosques
  FOR SELECT
  USING (status = 'APPROVED');

-- Anyone (public/unauthenticated) can submit a new Mosque registration form
CREATE POLICY "Anyone can register a new mosque"
  ON public.mosques
  FOR INSERT
  WITH CHECK (status = 'PENDING');

-- Mosque owners / admins can view and update their own mosque
CREATE POLICY "Creators can view their own pending mosques"
  ON public.mosques
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- 2. PRAYER SCHEDULES POLICIES:
-- Public read for approved mosque prayer schedules
CREATE POLICY "Public can view prayer schedules of approved mosques"
  ON public.mosque_prayer_schedules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mosques
      WHERE public.mosques.id = public.mosque_prayer_schedules.mosque_id
      AND public.mosques.status = 'APPROVED'
    )
  );

-- 3. FUNDS POLICIES:
-- Public can view active funds for approved mosques
CREATE POLICY "Public can view active mosque funds"
  ON public.mosque_funds
  FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.mosques
      WHERE public.mosques.id = public.mosque_funds.mosque_id
      AND public.mosques.status = 'APPROVED'
    )
  );

-- 4. DONATIONS POLICIES:
-- Anyone (Public) can donate online to an approved mosque
CREATE POLICY "Public can submit online donations"
  ON public.mosque_donations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mosques
      WHERE public.mosques.id = public.mosque_donations.mosque_id
      AND public.mosques.status = 'APPROVED'
    )
  );

-- 5. MAKTAB POLICIES:
-- Public read for approved mosque maktab info
CREATE POLICY "Public can view maktab details"
  ON public.mosque_maktab
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mosques
      WHERE public.mosques.id = public.mosque_maktab.mosque_id
      AND public.mosques.status = 'APPROVED'
    )
  );

-- Grant appropriate permissions to anon and authenticated roles
GRANT SELECT, INSERT ON public.mosques TO anon, authenticated;
GRANT SELECT ON public.mosque_prayer_schedules TO anon, authenticated;
GRANT SELECT ON public.mosque_funds TO anon, authenticated;
GRANT INSERT ON public.mosque_donations TO anon, authenticated;
GRANT SELECT ON public.mosque_maktab TO anon, authenticated;
