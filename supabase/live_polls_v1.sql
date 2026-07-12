-- KitPOP Fase 10: Polls en vivo
-- Ejecutar en Supabase → SQL Editor → New query → Run

create table if not exists public.live_polls (
  id uuid default gen_random_uuid() primary key,
  live_session_id uuid references public.live_sessions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  sort_order integer default 0,
  prompt text not null,
  poll_type text default 'single_choice'
    check (poll_type in ('single_choice', 'yes_no')),
  options jsonb default '[]'::jsonb,
  status text default 'draft'
    check (status in ('draft', 'open', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.live_poll_votes (
  id uuid default gen_random_uuid() primary key,
  poll_id uuid references public.live_polls on delete cascade not null,
  live_session_id uuid references public.live_sessions on delete cascade not null,
  participant_token text not null,
  answer_text text not null,
  created_at timestamptz default now(),
  unique (poll_id, participant_token)
);

create index if not exists live_polls_session_id_idx
  on public.live_polls (live_session_id, sort_order);

create index if not exists live_poll_votes_poll_id_idx
  on public.live_poll_votes (poll_id);

alter table public.live_polls enable row level security;
alter table public.live_poll_votes enable row level security;

create policy "live_polls_all_own"
  on public.live_polls for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "live_poll_votes_select_own"
  on public.live_poll_votes for select
  using (
    exists (
      select 1
      from public.live_sessions ls
      where ls.id = live_poll_votes.live_session_id
        and ls.user_id = auth.uid()
    )
  );

alter table public.live_sessions
  drop constraint if exists live_sessions_status_check;

alter table public.live_sessions
  add constraint live_sessions_status_check
  check (status in ('draft', 'live', 'paused', 'closed'));

-- Participante: estado de sesión en vivo
create or replace function public.get_live_session_for_participant(
  p_code text,
  p_participant_token text default ''
)
returns table (
  session_id uuid,
  title text,
  organization text,
  status text,
  active_poll jsonb,
  voted_poll_ids jsonb
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_session_id uuid;
begin
  select ac.resource_id
  into v_session_id
  from public.access_codes ac
  where ac.code = upper(trim(p_code))
    and ac.is_active = true
    and ac.resource_type = 'live'
  limit 1;

  if v_session_id is null then
    return;
  end if;

  return query
  select
    ls.id,
    ls.title,
    ls.organization,
    ls.status,
    (
      select jsonb_build_object(
        'id', lp.id,
        'prompt', lp.prompt,
        'poll_type', lp.poll_type,
        'options', lp.options,
        'status', lp.status
      )
      from public.live_polls lp
      where lp.live_session_id = ls.id
        and lp.status = 'open'
      order by lp.sort_order, lp.created_at
      limit 1
    ) as active_poll,
    coalesce(
      (
        select jsonb_agg(distinct lv.poll_id)
        from public.live_poll_votes lv
        where lv.live_session_id = ls.id
          and lv.participant_token = trim(p_participant_token)
          and trim(p_participant_token) <> ''
      ),
      '[]'::jsonb
    ) as voted_poll_ids
  from public.live_sessions ls
  where ls.id = v_session_id;
end;
$$;

-- Participante: votar en poll abierto
create or replace function public.submit_live_poll_vote(
  p_code text,
  p_poll_id uuid,
  p_participant_token text,
  p_answer_text text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
  v_status text;
  v_poll_status text;
  v_vote_id uuid;
begin
  if p_participant_token is null or trim(p_participant_token) = '' then
    raise exception 'Token de participante inválido';
  end if;

  if p_answer_text is null or trim(p_answer_text) = '' then
    raise exception 'Debes elegir una opción';
  end if;

  select ac.resource_id, ls.status
  into v_session_id, v_status
  from public.access_codes ac
  join public.live_sessions ls on ls.id = ac.resource_id
  where ac.code = upper(trim(p_code))
    and ac.is_active = true
    and ac.resource_type = 'live'
  limit 1;

  if v_session_id is null then
    raise exception 'Código no encontrado';
  end if;

  if v_status <> 'live' then
    raise exception 'La sesión no está en vivo';
  end if;

  select lp.status
  into v_poll_status
  from public.live_polls lp
  where lp.id = p_poll_id
    and lp.live_session_id = v_session_id;

  if v_poll_status is null then
    raise exception 'Poll no encontrado';
  end if;

  if v_poll_status <> 'open' then
    raise exception 'Este poll no está abierto';
  end if;

  if exists (
    select 1
    from public.live_poll_votes
    where poll_id = p_poll_id
      and participant_token = trim(p_participant_token)
  ) then
    raise exception 'Ya votaste en este poll';
  end if;

  insert into public.live_poll_votes (
    poll_id,
    live_session_id,
    participant_token,
    answer_text
  )
  values (
    p_poll_id,
    v_session_id,
    trim(p_participant_token),
    trim(p_answer_text)
  )
  returning id into v_vote_id;

  return v_vote_id;
end;
$$;

grant execute on function public.get_live_session_for_participant(text, text) to anon, authenticated;
grant execute on function public.submit_live_poll_vote(text, uuid, text, text) to anon, authenticated;
