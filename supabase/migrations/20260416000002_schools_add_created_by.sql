-- Migration: add created_by to schools
-- Tracks which app_user created each school record.

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS created_by TEXT;
