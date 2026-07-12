-- KitPOP Fase 9: Encuestas — preguntas y respuestas
-- Ejecutar en Supabase → SQL Editor → New query → Run

create table if not exists public.survey_questions (
  id uuid default gen_random_uuid() primary key,
  survey_id uuid references public.surveys on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  sort_order integer default 0,
  question_type text default 'text'
    check (question_type in ('text', 'scale', 'yes_no', 'single_choice')),
  prompt text not null,
  options jsonb default '[]'::jsonb,
  is_required boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.survey_response_sets (
  id uuid default gen_random_uuid() primary key,
  survey_id uuid references public.surveys on delete cascade not null,
  participant_token text not null,
  created_at timestamptz default now(),
  unique (survey_id, participant_token)
);

create table if not exists public.survey_answers (
  id uuid default gen_random_uuid() primary key,
  response_set_id uuid references public.survey_response_sets on delete cascade not null,
  question_id uuid references public.survey_questions on delete cascade not null,
  survey_id uuid references public.surveys on delete cascade not null,
  answer_text text,
  answer_number numeric,
  created_at timestamptz default now(),
  unique (response_set_id, question_id)
);

create index if not exists survey_questions_survey_id_idx
  on public.survey_questions (survey_id, sort_order);

create index if not exists survey_response_sets_survey_id_idx
  on public.survey_response_sets (survey_id, created_at desc);

create index if not exists survey_answers_survey_id_idx
  on public.survey_answers (survey_id, question_id);

alter table public.survey_questions enable row level security;
alter table public.survey_response_sets enable row level security;
alter table public.survey_answers enable row level security;

create policy "survey_questions_all_own"
  on public.survey_questions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "survey_response_sets_select_own"
  on public.survey_response_sets for select
  using (
    exists (
      select 1
      from public.surveys
      where surveys.id = survey_response_sets.survey_id
        and surveys.user_id = auth.uid()
    )
  );

create policy "survey_answers_select_own"
  on public.survey_answers for select
  using (
    exists (
      select 1
      from public.surveys
      where surveys.id = survey_answers.survey_id
        and surveys.user_id = auth.uid()
    )
  );

-- Participante: obtener encuesta activa por código
create or replace function public.get_survey_for_participant(
  p_code text,
  p_participant_token text default ''
)
returns table (
  survey_id uuid,
  title text,
  description text,
  organization text,
  status text,
  already_answered boolean,
  questions jsonb
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_survey_id uuid;
begin
  select ac.resource_id
  into v_survey_id
  from public.access_codes ac
  where ac.code = upper(trim(p_code))
    and ac.is_active = true
    and ac.resource_type = 'survey'
  limit 1;

  if v_survey_id is null then
    return;
  end if;

  return query
  select
    s.id,
    s.title,
    s.description,
    s.organization,
    s.status,
    exists (
      select 1
      from public.survey_response_sets rs
      where rs.survey_id = s.id
        and rs.participant_token = trim(p_participant_token)
        and trim(p_participant_token) <> ''
    ) as already_answered,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', q.id,
            'question_type', q.question_type,
            'prompt', q.prompt,
            'options', q.options,
            'is_required', q.is_required,
            'sort_order', q.sort_order
          )
          order by q.sort_order, q.created_at
        )
        from public.survey_questions q
        where q.survey_id = s.id
      ),
      '[]'::jsonb
    ) as questions
  from public.surveys s
  where s.id = v_survey_id;
end;
$$;

-- Participante: enviar respuestas
create or replace function public.submit_survey_answers(
  p_code text,
  p_participant_token text,
  p_answers jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_survey_id uuid;
  v_status text;
  v_response_set_id uuid;
  v_answer jsonb;
  v_question_id uuid;
begin
  if p_participant_token is null or trim(p_participant_token) = '' then
    raise exception 'Token de participante inválido';
  end if;

  select ac.resource_id, s.status
  into v_survey_id, v_status
  from public.access_codes ac
  join public.surveys s on s.id = ac.resource_id
  where ac.code = upper(trim(p_code))
    and ac.is_active = true
    and ac.resource_type = 'survey'
  limit 1;

  if v_survey_id is null then
    raise exception 'Código no encontrado';
  end if;

  if v_status <> 'active' then
    raise exception 'La encuesta no está activa';
  end if;

  if exists (
    select 1
    from public.survey_response_sets
    where survey_id = v_survey_id
      and participant_token = trim(p_participant_token)
  ) then
    raise exception 'Ya respondiste esta encuesta';
  end if;

  insert into public.survey_response_sets (survey_id, participant_token)
  values (v_survey_id, trim(p_participant_token))
  returning id into v_response_set_id;

  for v_answer in select * from jsonb_array_elements(coalesce(p_answers, '[]'::jsonb))
  loop
    v_question_id := (v_answer->>'question_id')::uuid;

    insert into public.survey_answers (
      response_set_id,
      question_id,
      survey_id,
      answer_text,
      answer_number
    )
    values (
      v_response_set_id,
      v_question_id,
      v_survey_id,
      nullif(v_answer->>'answer_text', ''),
      nullif(v_answer->>'answer_number', '')::numeric
    );
  end loop;

  return v_response_set_id;
end;
$$;

grant execute on function public.get_survey_for_participant(text, text) to anon, authenticated;
grant execute on function public.submit_survey_answers(text, text, jsonb) to anon, authenticated;
