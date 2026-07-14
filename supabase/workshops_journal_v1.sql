-- Bitácora general del taller (registro completo post-diseño / post-ejecución)
alter table public.workshops
  add column if not exists journal_notes text;

comment on column public.workshops.journal_notes is
  'Bitácora general del taller: aprendizajes, ajustes y registro de la experiencia completa.';
