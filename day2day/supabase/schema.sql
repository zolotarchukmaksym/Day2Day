-- =========================================================
-- DAILY PLANNER — SUPABASE SCHEMA
-- Run this in the Supabase SQL editor (Project > SQL Editor)
-- =========================================================

-- Extensions we rely on (uuid generation)
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- TABLE: tasks
-- ---------------------------------------------------------
create table if not exists public.tasks (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text not null,
  description  text,
  target_date  date not null,            -- the day the task is scheduled for
  is_completed boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Fast lookups: "give me all tasks for this user on this date"
create index if not exists tasks_user_date_idx
  on public.tasks (user_id, target_date);

-- ---------------------------------------------------------
-- TABLE: notes
-- ---------------------------------------------------------
create table if not exists public.notes (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null,
  content    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_user_created_idx
  on public.notes (user_id, created_at desc);

-- ---------------------------------------------------------
-- AUTO-UPDATE updated_at ON EVERY CHANGE
-- ---------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_tasks on public.tasks;
create trigger set_updated_at_tasks
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_notes on public.notes;
create trigger set_updated_at_notes
  before update on public.notes
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------
alter table public.tasks enable row level security;
alter table public.notes enable row level security;

-- TASKS policies: a user can only see/change their own rows
create policy "tasks_select_own"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "tasks_insert_own"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "tasks_update_own"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tasks_delete_own"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- NOTES policies: identical pattern
create policy "notes_select_own"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "notes_insert_own"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "notes_update_own"
  on public.notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notes_delete_own"
  on public.notes for delete
  using (auth.uid() = user_id);
