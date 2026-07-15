-- Sprint 4: rate limiting HTTP por usuario y ruta (ventana horaria).

create table if not exists public.api_rate_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  route_key text not null,
  window_key timestamptz not null,
  request_count integer not null default 1,
  updated_at timestamptz not null default now(),
  unique (user_id, route_key, window_key)
);

create index if not exists api_rate_limits_user_route_idx
  on public.api_rate_limits (user_id, route_key, window_key desc);

alter table public.api_rate_limits enable row level security;

-- Solo service role (API serverless) accede vía supabaseAdmin.
