-- Migration: create_schools
-- Creates the schools table with RLS, indexes, and helper trigger.

-- ---------------------------------------------------------------------------
-- 1. Custom enum for school status
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE school_status AS ENUM (
    'En attente',
    'Contacté',
    'Client',
    'Refusé'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Schools table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schools (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  ecole       TEXT          NOT NULL,
  lieu        TEXT          NOT NULL,
  promoteur   TEXT          NOT NULL,
  phone       TEXT          NOT NULL,
  status      school_status NOT NULL DEFAULT 'En attente',
  description TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 3. Auto-update updated_at on every row change
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS schools_set_updated_at ON public.schools;
CREATE TRIGGER schools_set_updated_at
BEFORE UPDATE ON public.schools
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Indexes
-- ---------------------------------------------------------------------------
-- Speed up full-text / ILIKE searches on school name and promoteur
CREATE INDEX IF NOT EXISTS idx_schools_ecole       ON public.schools (ecole);
CREATE INDEX IF NOT EXISTS idx_schools_promoteur   ON public.schools (promoteur);
-- Speed up status filter
CREATE INDEX IF NOT EXISTS idx_schools_status      ON public.schools (status);
-- Speed up default ordering
CREATE INDEX IF NOT EXISTS idx_schools_created_at  ON public.schools (created_at DESC);

-- ---------------------------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- No role restriction: app uses anon key with custom auth (not Supabase Auth).
CREATE POLICY "read_schools"
  ON public.schools FOR SELECT USING (true);

CREATE POLICY "insert_schools"
  ON public.schools FOR INSERT WITH CHECK (true);

CREATE POLICY "update_schools"
  ON public.schools FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "delete_schools"
  ON public.schools FOR DELETE USING (true);
