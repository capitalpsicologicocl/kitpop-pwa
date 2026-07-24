-- KitPOP: acceso Pro ilimitado para cuenta consultora
-- Ejecutar en Supabase → SQL Editor (después de que el usuario se haya registrado).
-- Email: capitalpsicologicocl@gmail.com
--
-- Nota: profiles.plan solo acepta explorer | pro | pro_team (ver plans_pricing_v2.sql).
-- En app, ese email tiene override staff → Pro Studio + IA ilimitada (staffAccess.js).

insert into public.profiles (id, plan, subscription_status, plan_period_end)
select
  u.id,
  'pro',
  'active',
  '2099-12-31T23:59:59+00'::timestamptz
from auth.users u
where lower(u.email) = lower('capitalpsicologicocl@gmail.com')
on conflict (id) do update
set
  plan = excluded.plan,
  subscription_status = excluded.subscription_status,
  plan_period_end = excluded.plan_period_end;

-- Verificar (debe devolver 1 fila con pro / active):
-- select u.email, p.plan, p.subscription_status, p.plan_period_end
-- from auth.users u
-- join public.profiles p on p.id = u.id
-- where lower(u.email) = lower('capitalpsicologicocl@gmail.com');
