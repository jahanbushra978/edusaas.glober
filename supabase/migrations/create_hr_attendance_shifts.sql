-- HR Attendance Management: Shifts & Schedule Tables
-- Part of the Professional Office HR Attendance Management System

-- =============================================
-- 1. SHIFTS TABLE (Teacher/Employee Shifts)
-- =============================================
CREATE TABLE IF NOT EXISTS attendance_shifts (
  id BIGSERIAL PRIMARY KEY,
  branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  shift_name TEXT NOT NULL DEFAULT 'General',
  shift_type TEXT NOT NULL DEFAULT 'teacher' CHECK (shift_type IN ('teacher', 'student')),
  start_time TIME NOT NULL DEFAULT '08:00:00',
  end_time TIME NOT NULL DEFAULT '16:00:00',
  grace_time INTEGER NOT NULL DEFAULT 0 COMMENT 'Grace period in minutes',
  lunch_start TIME,
  lunch_end TIME,
  working_days TEXT DEFAULT 'Sat,Sun,Mon,Tue,Wed,Thu',
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shifts_branch ON attendance_shifts(branch_id);

-- =============================================
-- 2. USER SHIFT ASSIGNMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS attendance_user_shifts (
  id BIGSERIAL PRIMARY KEY,
  user_type TEXT NOT NULL CHECK (user_type IN ('teacher', 'student')),
  user_id BIGINT NOT NULL,
  shift_id BIGINT NOT NULL REFERENCES attendance_shifts(id) ON DELETE CASCADE,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_type, user_id, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_user_shifts_lookup ON attendance_user_shifts(user_type, user_id, is_active);

-- =============================================
-- 3. ENHANCED ATTENDANCE RECORDS (add missing columns if not exist)
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance_records' AND column_name = 'early_leave_minutes'
  ) THEN
    ALTER TABLE attendance_records ADD COLUMN early_leave_minutes INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance_records' AND column_name = 'overtime_minutes'
  ) THEN
    ALTER TABLE attendance_records ADD COLUMN overtime_minutes INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance_records' AND column_name = 'is_holiday'
  ) THEN
    ALTER TABLE attendance_records ADD COLUMN is_holiday BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance_records' AND column_name = 'shift_id'
  ) THEN
    ALTER TABLE attendance_records ADD COLUMN shift_id BIGINT REFERENCES attendance_shifts(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance_records' AND column_name = 'punch_in'
  ) THEN
    ALTER TABLE attendance_records ADD COLUMN punch_in TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance_records' AND column_name = 'punch_out'
  ) THEN
    ALTER TABLE attendance_records ADD COLUMN punch_out TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance_records' AND column_name = 'late_minutes'
  ) THEN
    ALTER TABLE attendance_records ADD COLUMN late_minutes INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance_records' AND column_name = 'total_work_minutes'
  ) THEN
    ALTER TABLE attendance_records ADD COLUMN total_work_minutes INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance_records' AND column_name = 'working_hours'
  ) THEN
    ALTER TABLE attendance_records ADD COLUMN working_hours NUMERIC(5,2) DEFAULT 0;
  END IF;
END $$;

-- =============================================
-- 4. HOLIDAYS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS attendance_holidays (
  id BIGSERIAL PRIMARY KEY,
  branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  holiday_date DATE NOT NULL,
  holiday_name TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(branch_id, holiday_date)
);

CREATE INDEX IF NOT EXISTS idx_holidays_date ON attendance_holidays(holiday_date);

-- =============================================
-- 5. ENHANCED RPC: Calculate attendance stats with shifts
-- =============================================
CREATE OR REPLACE FUNCTION fn_get_hr_today_stats(p_branch_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_teachers', (SELECT COUNT(*) FROM teachers WHERE branch_id = p_branch_id AND is_active = true),
    'total_students', (SELECT COUNT(*) FROM students WHERE branch_id = p_branch_id AND status = 'active'),
    'teacher_present', COALESCE((SELECT COUNT(*) FROM attendance_records
      WHERE user_type = 'teacher'
      AND attendance_date = CURRENT_DATE
      AND status IN ('present', 'late')), 0),
    'teacher_absent', COALESCE((SELECT COUNT(*) FROM attendance_records
      WHERE user_type = 'teacher'
      AND attendance_date = CURRENT_DATE
      AND status = 'absent'), 0),
    'teacher_late', COALESCE((SELECT COUNT(*) FROM attendance_records
      WHERE user_type = 'teacher'
      AND attendance_date = CURRENT_DATE
      AND status = 'late'), 0),
    'teacher_inside', COALESCE((SELECT COUNT(*) FROM attendance_records
      WHERE user_type = 'teacher'
      AND attendance_date = CURRENT_DATE
      AND punch_in IS NOT NULL
      AND punch_out IS NULL), 0),
    'student_present', COALESCE((SELECT COUNT(*) FROM attendance_records
      WHERE user_type = 'student'
      AND attendance_date = CURRENT_DATE
      AND status IN ('present', 'late')), 0),
    'student_absent', COALESCE((SELECT COUNT(*) FROM attendance_records
      WHERE user_type = 'student'
      AND attendance_date = CURRENT_DATE
      AND status = 'absent'), 0),
    'student_late', COALESCE((SELECT COUNT(*) FROM attendance_records
      WHERE user_type = 'student'
      AND attendance_date = CURRENT_DATE
      AND status = 'late'), 0)
  ) INTO result;
  RETURN result;
END;
$$;

-- =============================================
-- 6. ENHANCED RPC: Monthly attendance report for a user
-- =============================================
CREATE OR REPLACE FUNCTION fn_get_user_monthly_report(
  p_user_type TEXT,
  p_user_id BIGINT,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  start_date DATE := make_date(p_year, p_month, 1);
  end_date DATE := (start_date + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_days', (end_date - start_date + 1),
    'present_days', COALESCE((SELECT COUNT(*) FROM attendance_records
      WHERE user_type = p_user_type AND user_id = p_user_id
      AND attendance_date BETWEEN start_date AND end_date
      AND status = 'present'), 0),
    'absent_days', COALESCE((SELECT COUNT(*) FROM attendance_records
      WHERE user_type = p_user_type AND user_id = p_user_id
      AND attendance_date BETWEEN start_date AND end_date
      AND status = 'absent'), 0),
    'late_days', COALESCE((SELECT COUNT(*) FROM attendance_records
      WHERE user_type = p_user_type AND user_id = p_user_id
      AND attendance_date BETWEEN start_date AND end_date
      AND status = 'late'), 0),
    'half_days', COALESCE((SELECT COUNT(*) FROM attendance_records
      WHERE user_type = p_user_type AND user_id = p_user_id
      AND attendance_date BETWEEN start_date AND end_date
      AND status = 'half_day'), 0),
    'total_late_minutes', COALESCE((SELECT SUM(late_minutes) FROM attendance_records
      WHERE user_type = p_user_type AND user_id = p_user_id
      AND attendance_date BETWEEN start_date AND end_date), 0),
    'total_overtime_minutes', COALESCE((SELECT SUM(overtime_minutes) FROM attendance_records
      WHERE user_type = p_user_type AND user_id = p_user_id
      AND attendance_date BETWEEN start_date AND end_date), 0),
    'total_work_minutes', COALESCE((SELECT SUM(total_work_minutes) FROM attendance_records
      WHERE user_type = p_user_type AND user_id = p_user_id
      AND attendance_date BETWEEN start_date AND end_date), 0),
    'attendance_percentage', CASE
      WHEN (SELECT COUNT(*) FROM attendance_records
        WHERE user_type = p_user_type AND user_id = p_user_id
        AND attendance_date BETWEEN start_date AND end_date) > 0
      THEN ROUND(
        (SELECT COUNT(*) FROM attendance_records
          WHERE user_type = p_user_type AND user_id = p_user_id
          AND attendance_date BETWEEN start_date AND end_date
          AND status IN ('present', 'late'))::NUMERIC * 100 /
        (SELECT COUNT(*) FROM attendance_records
          WHERE user_type = p_user_type AND user_id = p_user_id
          AND attendance_date BETWEEN start_date AND end_date)::NUMERIC, 1)
      ELSE 0
    END
  ) INTO result;
  RETURN result;
END;
$$;
