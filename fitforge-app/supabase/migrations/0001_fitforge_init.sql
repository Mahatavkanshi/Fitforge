create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  goal text check (goal in ('weight_loss', 'muscle_gain', 'endurance', 'general_fitness')),
  age smallint check (age between 13 and 100),
  height_cm numeric(5,2) check (height_cm between 100 and 250),
  weight_kg numeric(5,2) check (weight_kg between 30 and 300),
  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'athlete')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_type text not null,
  duration_minutes integer check (duration_minutes >= 0),
  calories_burned integer check (calories_burned >= 0),
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_name text not null,
  reps integer check (reps >= 0),
  sets integer check (sets >= 0),
  form_score numeric(5,2) check (form_score between 0 and 100),
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.exercise_logs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "sessions_select_own" on public.workout_sessions;
create policy "sessions_select_own"
on public.workout_sessions
for select
using (auth.uid() = user_id);

drop policy if exists "sessions_insert_own" on public.workout_sessions;
create policy "sessions_insert_own"
on public.workout_sessions
for insert
with check (auth.uid() = user_id);

drop policy if exists "sessions_update_own" on public.workout_sessions;
create policy "sessions_update_own"
on public.workout_sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "logs_select_own" on public.exercise_logs;
create policy "logs_select_own"
on public.exercise_logs
for select
using (auth.uid() = user_id);

drop policy if exists "logs_insert_own" on public.exercise_logs;
create policy "logs_insert_own"
on public.exercise_logs
for insert
with check (auth.uid() = user_id);

drop policy if exists "logs_update_own" on public.exercise_logs;
create policy "logs_update_own"
on public.exercise_logs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists workout_sessions_user_id_idx on public.workout_sessions(user_id);
create index if not exists exercise_logs_user_id_idx on public.exercise_logs(user_id);
create index if not exists exercise_logs_session_id_idx on public.exercise_logs(session_id);
