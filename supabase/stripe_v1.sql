-- KitPOP Fase 12: Stripe Billing
-- Ejecutar en Supabase → SQL Editor → Run

alter table public.profiles
  add column if not exists stripe_subscription_id text;

create or replace function public.prevent_profile_plan_self_update()
returns trigger
language plpgsql
as $$
begin
  if (
    auth.uid() = old.id
    and (
      new.plan is distinct from old.plan
      or new.subscription_status is distinct from old.subscription_status
      or new.stripe_customer_id is distinct from old.stripe_customer_id
      or new.stripe_subscription_id is distinct from old.stripe_subscription_id
      or new.plan_period_end is distinct from old.plan_period_end
    )
  ) then
    raise exception 'Los cambios de plan deben hacerse vía facturación Stripe.';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_plan on public.profiles;

create trigger profiles_protect_plan
  before update on public.profiles
  for each row execute procedure public.prevent_profile_plan_self_update();
