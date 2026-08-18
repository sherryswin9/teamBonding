-- Team Bonding Fund — schema
-- Run this whole file once in Supabase: Dashboard → SQL Editor → New query → paste → Run

create extension if not exists pgcrypto;

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists monthly_quota (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  effective_month date not null, -- always the 1st of the month, e.g. 2026-08-01
  amount_per_member numeric not null check (amount_per_member >= 0),
  created_at timestamptz not null default now(),
  unique (team_id, effective_month)
);

create table if not exists usage_log (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  month date not null, -- which month this spend counts toward (1st of month)
  amount numeric not null check (amount >= 0),
  note text,
  created_at timestamptz not null default now()
);

-- Row Level Security
-- NOTE: this app has no login system — the "team code" is the only separation
-- between teams. Policies below are intentionally permissive (anyone with the
-- anon key can read/write any row). Fine for a low-sensitivity internal tool;
-- do NOT reuse this schema for anything sensitive without adding real auth.

alter table teams enable row level security;
alter table members enable row level security;
alter table monthly_quota enable row level security;
alter table usage_log enable row level security;

create policy "public read teams" on teams for select using (true);
create policy "public insert teams" on teams for insert with check (true);

create policy "public all members" on members for all using (true) with check (true);
create policy "public all monthly_quota" on monthly_quota for all using (true) with check (true);
create policy "public all usage_log" on usage_log for all using (true) with check (true);
