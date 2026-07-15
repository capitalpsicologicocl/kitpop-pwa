-- Sprint 4: idempotencia de webhooks (PayPal, etc.)

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  dedupe_key text not null,
  event_id text,
  event_type text,
  status text not null default 'processing'
    check (status in ('processing', 'processed', 'failed')),
  error_message text,
  payload jsonb,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, dedupe_key)
);

create index if not exists webhook_events_provider_status_idx
  on public.webhook_events (provider, status, created_at desc);

alter table public.webhook_events enable row level security;

-- Solo service role (API serverless) accede vía supabaseAdmin.
