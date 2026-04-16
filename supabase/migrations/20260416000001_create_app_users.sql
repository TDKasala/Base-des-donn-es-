-- Migration: create_app_users
-- Custom username-only auth table managed by the super admin.

CREATE TABLE IF NOT EXISTS public.app_users (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  username   TEXT        UNIQUE NOT NULL,
  is_admin   BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast username lookups (login)
CREATE INDEX IF NOT EXISTS idx_app_users_username ON public.app_users (username);

-- Row Level Security
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Anon can SELECT (needed to verify a username at login time)
CREATE POLICY "Anyone can read app_users"
  ON public.app_users FOR SELECT TO anon, authenticated USING (true);

-- Anon can INSERT (admin creates users from the frontend with the anon key)
CREATE POLICY "Anyone can insert app_users"
  ON public.app_users FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Anon can DELETE (admin deletes users from the frontend)
CREATE POLICY "Anyone can delete app_users"
  ON public.app_users FOR DELETE TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Seed: initial super admin account
-- Change 'admin' to whatever username you want for the first admin.
-- ---------------------------------------------------------------------------
INSERT INTO public.app_users (username, is_admin)
VALUES ('admin', true)
ON CONFLICT (username) DO NOTHING;
