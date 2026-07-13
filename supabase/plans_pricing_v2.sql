-- KitPOP: nuevos planes Explorer / Pro / Pro TEAM
-- Ejecutar en Supabase → SQL Editor → Run

alter table public.profiles drop constraint if exists profiles_plan_check;

alter table public.profiles
  alter column plan set default 'explorer';

update public.profiles
set plan = 'explorer'
where plan = 'free';

alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('explorer', 'pro', 'pro_team'));
