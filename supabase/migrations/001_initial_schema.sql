-- SchoolConnect CRM — initial schema
-- Run this in your Supabase project: SQL Editor → New query → paste → Run

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enum ────────────────────────────────────────────────────────────────────
create type public.school_status as enum (
  'En attente',
  'Contacté',
  'Client',
  'Refusé'
);

-- ─── Table ───────────────────────────────────────────────────────────────────
create table public.schools (
  id          uuid          primary key default uuid_generate_v4(),
  ecole       text          not null,
  lieu        text          not null,
  promoteur   text          not null,
  phone       text          not null,
  status      public.school_status not null default 'En attente',
  description text,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger schools_updated_at
  before update on public.schools
  for each row execute procedure public.handle_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.schools enable row level security;

-- Open policy (no auth yet). Replace with user-scoped policies when you add auth.
create policy "public_all" on public.schools
  for all
  using (true)
  with check (true);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index idx_schools_status     on public.schools (status);
create index idx_schools_created_at on public.schools (created_at desc);
