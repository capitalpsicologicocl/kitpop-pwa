-- KitPOP Fase 7: base interactiva (encuestas, talleres, polls en vivo)
-- Ejecutar en Supabase → SQL Editor → Run

-- Planes (Stripe en Fase 12)
alter table public.profiles
  add column if not exists plan text default 'free'
    check (plan in ('free', 'pro'));

alter table public.profiles
  add column if not exists subscription_status text default 'inactive';

alter table public.profiles
  add column if not exists stripe_customer_id text;

alter table public.profiles
  add column if not exists plan_period_end timestamptz;

-- Talleres (Fase 8 expande editor)
create table if not exists public.workshops (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  audience text,
  organization text,
  team text,
  modality text default 'Presencial',
  objective text,
  status text default 'draft'
    check (status in ('draft', 'published', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Encuestas (Fase 9 expande preguntas)
create table if not exists public.surveys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  organization text,
  status text default 'draft'
    check (status in ('draft', 'active', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sesiones en vivo / polls (Fase 10)
create table if not exists public.live_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  organization text,
  status text default 'draft'
    check (status in ('draft', 'live', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Códigos de acceso público (link /p/CODIGO)
create table if not exists public.access_codes (
  code text primary key,
  user_id uuid references auth.users on delete cascade not null,
  resource_type text not null
    check (resource_type in ('workshop', 'survey', 'live')),
  resource_id uuid not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists workshops_user_id_idx
  on public.workshops (user_id, updated_at desc);

create index if not exists surveys_user_id_idx
  on public.surveys (user_id, updated_at desc);

create index if not exists live_sessions_user_id_idx
  on public.live_sessions (user_id, updated_at desc);

create index if not exists access_codes_resource_idx
  on public.access_codes (resource_type, resource_id);

alter table public.workshops enable row level security;
alter table public.surveys enable row level security;
alter table public.live_sessions enable row level security;
alter table public.access_codes enable row level security;

create policy "workshops_all_own"
  on public.workshops for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "surveys_all_own"
  on public.surveys for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "live_sessions_all_own"
  on public.live_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "access_codes_all_own"
  on public.access_codes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Resolver código sin login (solo metadatos públicos)
create or replace function public.resolve_access_code(p_code text)
returns table (
  resource_type text,
  resource_id uuid,
  title text,
  status text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    ac.resource_type,
    ac.resource_id,
    coalesce(w.title, s.title, l.title) as title,
    coalesce(w.status, s.status, l.status) as status
  from public.access_codes ac
  left join public.workshops w
    on ac.resource_type = 'workshop' and ac.resource_id = w.id
  left join public.surveys s
    on ac.resource_type = 'survey' and ac.resource_id = s.id
  left join public.live_sessions l
    on ac.resource_type = 'live' and ac.resource_id = l.id
  where ac.code = upper(trim(p_code))
    and ac.is_active = true
  limit 1;
$$;

grant execute on function public.resolve_access_code(text) to anon, authenticated;
