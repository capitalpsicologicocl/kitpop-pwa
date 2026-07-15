-- Plan Fundador: primeros 100 clientes Pro anual a USD 29/año
alter table public.profiles
  add column if not exists is_founding_member boolean not null default false;

comment on column public.profiles.is_founding_member is
  'True si compró el plan Fundador (USD 29/año, cupo limitado).';

create index if not exists profiles_founding_member_idx
  on public.profiles (is_founding_member)
  where is_founding_member = true;
