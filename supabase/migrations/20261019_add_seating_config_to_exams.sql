-- Migration: Add seating_config column to exams table
-- Used by SeatingArrangementManager and AdmitCardManager to store hall layout, bench configuration, and seat allocations.

ALTER TABLE public.exams 
ADD COLUMN IF NOT EXISTS seating_config JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.exams.seating_config IS 'Stores seating hall layout, bench configuration, and student seat allocations for the exam.';
