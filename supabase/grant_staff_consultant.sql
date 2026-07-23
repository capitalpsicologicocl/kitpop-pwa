-- KitPOP: acceso Pro Studio ilimitado para cuenta consultora
-- Ejecutar en Supabase → SQL Editor después de que el usuario se haya registrado.
-- Email: capitalpsicologicocl@gmail.com

update public.profiles p
set
  plan = 'pro_studio',
  subscription_status = 'active',
  plan_period_end = '2099-12-31T23:59:59+00'::timestamptz
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('capitalpsicologicocl@gmail.com');

-- Verificar (debe devolver 1 fila con pro_studio / active):
-- select u.email, p.plan, p.subscription_status, p.plan_period_end
-- from auth.users u
-- join public.profiles p on p.id = u.id
-- where lower(u.email) = lower('capitalpsicologicocl@gmail.com');
