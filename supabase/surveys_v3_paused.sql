-- KitPOP Fase 9: estado "paused" para encuestas
-- Ejecutar en Supabase → SQL Editor → New query → Run

alter table public.surveys
  drop constraint if exists surveys_status_check;

alter table public.surveys
  add constraint surveys_status_check
  check (status in ('draft', 'active', 'paused', 'closed'));
