-- KitPOP Fase 8 extensión: tipos custom/pausa y estado ready
-- Ejecutar en Supabase → SQL Editor → Run

alter table public.workshop_items
  add column if not exists pause_type text
    check (pause_type is null or pause_type in ('coffee', 'lunch', 'break'));

alter table public.workshop_items
  drop constraint if exists workshop_items_item_type_check;

alter table public.workshop_items
  add constraint workshop_items_item_type_check
  check (item_type in ('theory', 'activity', 'custom', 'pause'));

alter table public.workshops
  drop constraint if exists workshops_status_check;

alter table public.workshops
  add constraint workshops_status_check
  check (status in ('draft', 'ready', 'published', 'archived'));
