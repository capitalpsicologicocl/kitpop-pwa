-- Contadores de uso IA por perfil (generador de talleres / reuniones)
-- Ejecutar en Supabase SQL Editor antes de activar /api/generate-workshop

alter table public.profiles
  add column if not exists ai_generations_lifetime_count integer not null default 0,
  add column if not exists ai_generations_month_count integer not null default 0,
  add column if not exists ai_generations_month_key text;

comment on column public.profiles.ai_generations_lifetime_count is
  'Total generaciones IA (Explorer: tope 2 de por vida).';
comment on column public.profiles.ai_generations_month_count is
  'Generaciones IA en el mes ai_generations_month_key.';
comment on column public.profiles.ai_generations_month_key is
  'Mes UTC YYYY-MM del contador mensual.';

-- Opcional: permitir plan pro_studio en profiles.plan (texto libre)
-- Valores válidos: explorer | free | pro | pro_studio | pro_team
