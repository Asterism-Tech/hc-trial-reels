-- ============================================================
-- Hobbycraft Reel Hub — Supabase Schema
-- Run this in the Supabase SQL editor BEFORE deploying.
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

create table trial_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'live', -- 'live' | 'won' | 'archived'
  test_type text,
  content_theme text[],
  upload_date date,
  publish_date date,
  tags text[],
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table versions (
  id uuid primary key default gen_random_uuid(),
  trial_group_id uuid references trial_groups(id) on delete cascade,
  version_number integer not null,
  total_versions integer not null,
  is_winner boolean default false,
  is_published boolean default false,
  platform text[],
  differences text,
  hook_type text,
  hook_text text,
  video_length_seconds integer,
  face_on_camera boolean,
  has_voiceover boolean,
  audio_type text,
  text_overlay boolean,
  caption text,
  cta_used text[],
  target_age_group text,
  views integer default 0,
  accounts_reached integer default 0,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  saves integer default 0,
  profile_visits integer default 0,
  followers_gained integer default 0,
  watch_time_seconds integer default 0,
  completion_rate_pct numeric(5,2) default 0,
  team_comments text,
  thumbnail_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table custom_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  color text,
  created_at timestamptz default now()
);

create table chat_history (
  id uuid primary key default gen_random_uuid(),
  role text not null, -- 'user' | 'assistant'
  content text not null,
  created_at timestamptz default now()
);

create table ai_insights_cache (
  id integer primary key default 1, -- singleton row
  insights jsonb not null,
  data_hash text not null,
  refreshed_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- Run AFTER creating the tables above.
-- ============================================================

alter table trial_groups enable row level security;
alter table versions enable row level security;
alter table custom_tags enable row level security;
alter table chat_history enable row level security;
alter table ai_insights_cache enable row level security;

create policy "anon can read trial_groups" on trial_groups
  for select to anon using (true);
create policy "anon can insert trial_groups" on trial_groups
  for insert to anon with check (true);
create policy "anon can update trial_groups" on trial_groups
  for update to anon using (true);
create policy "anon can delete trial_groups" on trial_groups
  for delete to anon using (true);

create policy "anon can read versions" on versions
  for select to anon using (true);
create policy "anon can insert versions" on versions
  for insert to anon with check (true);
create policy "anon can update versions" on versions
  for update to anon using (true);
create policy "anon can delete versions" on versions
  for delete to anon using (true);

create policy "anon can read custom_tags" on custom_tags
  for select to anon using (true);
create policy "anon can insert custom_tags" on custom_tags
  for insert to anon with check (true);
create policy "anon can delete custom_tags" on custom_tags
  for delete to anon using (true);

create policy "anon can read chat_history" on chat_history
  for select to anon using (true);
create policy "anon can insert chat_history" on chat_history
  for insert to anon with check (true);

create policy "anon can read ai_insights_cache" on ai_insights_cache
  for select to anon using (true);
create policy "anon can upsert ai_insights_cache" on ai_insights_cache
  for all to anon using (true) with check (true);
