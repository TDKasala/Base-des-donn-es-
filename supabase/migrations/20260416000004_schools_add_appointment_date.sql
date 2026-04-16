-- Migration: add appointment_date to schools
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS appointment_date TIMESTAMPTZ;

-- Index for fast upcoming appointment queries
CREATE INDEX IF NOT EXISTS idx_schools_appointment_date
  ON public.schools (appointment_date)
  WHERE appointment_date IS NOT NULL;
