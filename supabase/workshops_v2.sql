-- KitPOP Fase 8: Talleres v2 — sesiones e ítems
-- Ejecutar en Supabase → SQL Editor → Run

alter table public.workshops
  add column if not exists participants_count integer;

alter table public.workshops
  add column if not exists session_count integer default 1;

create table if not exists public.workshop_sessions (
  id uuid default gen_random_uuid() primary key,
  workshop_id uuid references public.workshops on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  session_number integer not null,
  duration_hours integer default 0 check (duration_hours >= 0 and duration_hours <= 23),
  duration_minutes integer default 0 check (duration_minutes >= 0 and duration_minutes <= 59),
  journal_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (workshop_id, session_number)
);

create table if not exists public.workshop_items (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.workshop_sessions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  sort_order integer default 0,
  time_minutes integer default 15 check (time_minutes >= 0),
  item_type text default 'theory'
    check (item_type in ('theory', 'activity')),
  title text not null,
  description text,
  activity_slug text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists workshop_sessions_workshop_id_idx
  on public.workshop_sessions (workshop_id, session_number);

create index if not exists workshop_items_session_id_idx
  on public.workshop_items (session_id, sort_order);

alter table public.workshop_sessions enable row level security;
alter table public.workshop_items enable row level security;

create policy "workshop_sessions_all_own"
  on public.workshop_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "workshop_items_all_own"
  on public.workshop_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
