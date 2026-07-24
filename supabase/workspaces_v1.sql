-- KitPOP Sprint 11: Espacios de trabajo participantes
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- Requiere: interactive.sql (access_codes, profiles)

-- Extender tipos de recurso en access_codes
alter table public.access_codes
  drop constraint if exists access_codes_resource_type_check;

alter table public.access_codes
  add constraint access_codes_resource_type_check
  check (resource_type in ('workshop', 'survey', 'live', 'workspace'));

-- Espacios de trabajo
create table if not exists public.workspaces (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  status text default 'draft'
    check (status in ('draft', 'open', 'paused', 'archived')),
  settings jsonb default '{"navigation_mode":"free"}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.workspace_groups (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  name text not null,
  sort_order integer default 0,
  editor_participant_id uuid,
  created_at timestamptz default now()
);

create table if not exists public.workspace_sections (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  sort_order integer default 0,
  title text not null default 'Sección',
  section_type text not null default 'info'
    check (section_type in (
      'info', 'text_short', 'text_long', 'single_choice', 'multi_choice',
      'boolean', 'likert', 'table'
    )),
  scope text not null default 'individual'
    check (scope in ('individual', 'group')),
  config jsonb default '{}'::jsonb,
  is_required boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.workspace_participants (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  display_name text not null,
  email text not null,
  group_id uuid references public.workspace_groups on delete set null,
  privacy_accepted_at timestamptz,
  joined_at timestamptz default now(),
  unique (workspace_id, user_id)
);

alter table public.workspace_groups
  drop constraint if exists workspace_groups_editor_participant_id_fkey;

alter table public.workspace_groups
  add constraint workspace_groups_editor_participant_id_fkey
  foreign key (editor_participant_id)
  references public.workspace_participants (id)
  on delete set null;

create table if not exists public.workspace_responses (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  section_id uuid references public.workspace_sections on delete cascade not null,
  participant_id uuid references public.workspace_participants on delete cascade,
  group_id uuid references public.workspace_groups on delete cascade,
  value jsonb default '{}'::jsonb,
  updated_at timestamptz default now(),
  constraint workspace_responses_scope_check check (
    (participant_id is not null and group_id is null)
    or (participant_id is null and group_id is not null)
  )
);

create unique index if not exists workspace_responses_individual_uniq
  on public.workspace_responses (section_id, participant_id)
  where participant_id is not null;

create unique index if not exists workspace_responses_group_uniq
  on public.workspace_responses (section_id, group_id)
  where group_id is not null;

create index if not exists workspaces_user_id_idx
  on public.workspaces (user_id, updated_at desc);

create index if not exists workspace_groups_workspace_id_idx
  on public.workspace_groups (workspace_id, sort_order);

create index if not exists workspace_sections_workspace_id_idx
  on public.workspace_sections (workspace_id, sort_order);

create index if not exists workspace_participants_workspace_id_idx
  on public.workspace_participants (workspace_id, joined_at desc);

create index if not exists workspace_responses_workspace_id_idx
  on public.workspace_responses (workspace_id, section_id);

alter table public.workspaces enable row level security;
alter table public.workspace_groups enable row level security;
alter table public.workspace_sections enable row level security;
alter table public.workspace_participants enable row level security;
alter table public.workspace_responses enable row level security;

-- Facilitador: acceso total a sus espacios
create policy "workspaces_all_own"
  on public.workspaces for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "workspace_groups_all_own"
  on public.workspace_groups for all
  using (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_groups.workspace_id
        and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_groups.workspace_id
        and w.user_id = auth.uid()
    )
  );

create policy "workspace_sections_all_own"
  on public.workspace_sections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "workspace_participants_select_own"
  on public.workspace_participants for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.workspaces w
      where w.id = workspace_participants.workspace_id
        and w.user_id = auth.uid()
    )
  );

create policy "workspace_participants_update_own"
  on public.workspace_participants for update
  using (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_participants.workspace_id
        and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_participants.workspace_id
        and w.user_id = auth.uid()
    )
  );

create policy "workspace_responses_select_own"
  on public.workspace_responses for select
  using (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_responses.workspace_id
        and w.user_id = auth.uid()
    )
    or exists (
      select 1 from public.workspace_participants p
      where p.id = workspace_responses.participant_id
        and p.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.workspace_participants p
      join public.workspace_groups g on g.id = p.group_id
      where g.id = workspace_responses.group_id
        and p.user_id = auth.uid()
    )
  );

-- Resolver código (incluye workspace)
create or replace function public.resolve_access_code(p_code text)
returns table (
  resource_type text,
  resource_id uuid,
  title text,
  status text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    ac.resource_type,
    ac.resource_id,
    coalesce(w.title, s.title, l.title, ws.title) as title,
    coalesce(w.status, s.status, l.status, ws.status) as status
  from public.access_codes ac
  left join public.workshops w
    on ac.resource_type = 'workshop' and ac.resource_id = w.id
  left join public.surveys s
    on ac.resource_type = 'survey' and ac.resource_id = s.id
  left join public.live_sessions l
    on ac.resource_type = 'live' and ac.resource_id = l.id
  left join public.workspaces ws
    on ac.resource_type = 'workspace' and ac.resource_id = ws.id
  where ac.code = upper(trim(p_code))
    and ac.is_active = true
  limit 1;
$$;

grant execute on function public.resolve_access_code(text) to anon, authenticated;

-- Inscribir participante (requiere auth)
create or replace function public.join_workspace(
  p_code text,
  p_display_name text,
  p_privacy_accepted boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_status text;
  v_user_id uuid := auth.uid();
  v_email text;
  v_participant_id uuid;
  v_count integer;
  v_limit integer := 50;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión';
  end if;

  if trim(coalesce(p_display_name, '')) = '' then
    raise exception 'Indica tu nombre';
  end if;

  if not coalesce(p_privacy_accepted, false) then
    raise exception 'Debes aceptar el aviso de privacidad';
  end if;

  select ac.resource_id, ws.status
  into v_workspace_id, v_status
  from public.access_codes ac
  join public.workspaces ws on ws.id = ac.resource_id
  where ac.code = upper(trim(p_code))
    and ac.is_active = true
    and ac.resource_type = 'workspace'
  limit 1;

  if v_workspace_id is null then
    raise exception 'Código no encontrado';
  end if;

  if v_status not in ('open', 'paused') then
    raise exception 'Este espacio no acepta inscripciones';
  end if;

  select email into v_email
  from auth.users
  where id = v_user_id;

  select id into v_participant_id
  from public.workspace_participants
  where workspace_id = v_workspace_id
    and user_id = v_user_id;

  if v_participant_id is not null then
    update public.workspace_participants
    set
      display_name = trim(p_display_name),
      email = coalesce(v_email, email),
      privacy_accepted_at = coalesce(privacy_accepted_at, now())
    where id = v_participant_id;

    return v_participant_id;
  end if;

  select count(*)::integer into v_count
  from public.workspace_participants
  where workspace_id = v_workspace_id;

  if v_count >= v_limit then
    raise exception 'Este espacio alcanzó el límite de participantes (%)', v_limit;
  end if;

  insert into public.workspace_participants (
    workspace_id,
    user_id,
    display_name,
    email,
    privacy_accepted_at
  )
  values (
    v_workspace_id,
    v_user_id,
    trim(p_display_name),
    coalesce(v_email, ''),
    now()
  )
  returning id into v_participant_id;

  return v_participant_id;
end;
$$;

grant execute on function public.join_workspace(text, text, boolean) to authenticated;

-- Vista participante
create or replace function public.get_workspace_for_participant(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_workspace_id uuid;
  v_status text;
  v_user_id uuid := auth.uid();
  v_participant record;
  v_is_editor boolean := false;
  v_result jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object(
      'error', 'auth_required',
      'title', (
        select ws.title
        from public.access_codes ac
        join public.workspaces ws on ws.id = ac.resource_id
        where ac.code = upper(trim(p_code))
          and ac.resource_type = 'workspace'
        limit 1
      )
    );
  end if;

  select ac.resource_id, ws.status
  into v_workspace_id, v_status
  from public.access_codes ac
  join public.workspaces ws on ws.id = ac.resource_id
  where ac.code = upper(trim(p_code))
    and ac.is_active = true
    and ac.resource_type = 'workspace'
  limit 1;

  if v_workspace_id is null then
    return jsonb_build_object('error', 'not_found');
  end if;

  select *
  into v_participant
  from public.workspace_participants
  where workspace_id = v_workspace_id
    and user_id = v_user_id;

  if v_participant.id is null then
    return jsonb_build_object(
      'error', 'not_enrolled',
      'workspace_id', v_workspace_id,
      'title', (select title from public.workspaces where id = v_workspace_id),
      'status', v_status
    );
  end if;

  if v_status = 'archived' then
    return jsonb_build_object(
      'error', 'archived',
      'title', (select title from public.workspaces where id = v_workspace_id)
    );
  end if;

  if v_participant.group_id is not null then
    select exists (
      select 1 from public.workspace_groups g
      where g.id = v_participant.group_id
        and g.editor_participant_id = v_participant.id
    ) into v_is_editor;
  end if;

  select jsonb_build_object(
    'workspace_id', w.id,
    'title', w.title,
    'description', w.description,
    'status', w.status,
    'settings', w.settings,
    'participant', jsonb_build_object(
      'id', v_participant.id,
      'display_name', v_participant.display_name,
      'group_id', v_participant.group_id,
      'is_group_editor', v_is_editor
    ),
    'group', (
      select jsonb_build_object('id', g.id, 'name', g.name)
      from public.workspace_groups g
      where g.id = v_participant.group_id
    ),
    'sections', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'title', s.title,
          'section_type', s.section_type,
          'scope', s.scope,
          'config', s.config,
          'is_required', s.is_required,
          'sort_order', s.sort_order,
          'response', (
            case
              when s.scope = 'individual' then (
                select r.value
                from public.workspace_responses r
                where r.section_id = s.id
                  and r.participant_id = v_participant.id
                limit 1
              )
              when v_participant.group_id is not null then (
                select r.value
                from public.workspace_responses r
                where r.section_id = s.id
                  and r.group_id = v_participant.group_id
                limit 1
              )
              else null
            end
          ),
          'can_edit', (
            case
              when s.scope = 'individual' then true
              when v_participant.group_id is null then false
              else v_is_editor
            end
          ),
          'visible', (
            case
              when s.scope = 'individual' then true
              when v_participant.group_id is not null then true
              else false
            end
          )
        )
        order by s.sort_order, s.created_at
      )
      from public.workspace_sections s
      where s.workspace_id = w.id
    ), '[]'::jsonb)
  )
  into v_result
  from public.workspaces w
  where w.id = v_workspace_id;

  return v_result;
end;
$$;

grant execute on function public.get_workspace_for_participant(text) to authenticated;

-- Guardar respuesta
create or replace function public.upsert_workspace_response(
  p_code text,
  p_section_id uuid,
  p_value jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_status text;
  v_user_id uuid := auth.uid();
  v_participant record;
  v_section record;
  v_is_editor boolean := false;
  v_response_id uuid;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión';
  end if;

  select ac.resource_id, ws.status
  into v_workspace_id, v_status
  from public.access_codes ac
  join public.workspaces ws on ws.id = ac.resource_id
  where ac.code = upper(trim(p_code))
    and ac.is_active = true
    and ac.resource_type = 'workspace'
  limit 1;

  if v_workspace_id is null then
    raise exception 'Código no encontrado';
  end if;

  if v_status <> 'open' then
    raise exception 'El espacio no está abierto para respuestas';
  end if;

  select *
  into v_participant
  from public.workspace_participants
  where workspace_id = v_workspace_id
    and user_id = v_user_id;

  if v_participant.id is null then
    raise exception 'No estás inscrito en este espacio';
  end if;

  select *
  into v_section
  from public.workspace_sections
  where id = p_section_id
    and workspace_id = v_workspace_id;

  if v_section.id is null then
    raise exception 'Sección no encontrada';
  end if;

  if v_section.scope = 'group' then
    if v_participant.group_id is null then
      raise exception 'Aún no tienes grupo asignado';
    end if;

    select exists (
      select 1 from public.workspace_groups g
      where g.id = v_participant.group_id
        and g.editor_participant_id = v_participant.id
    ) into v_is_editor;

    if not v_is_editor then
      raise exception 'Solo el editor del grupo puede modificar esta sección';
    end if;

    select id into v_response_id
    from public.workspace_responses
    where section_id = p_section_id
      and group_id = v_participant.group_id;

    if v_response_id is not null then
      update public.workspace_responses
      set value = coalesce(p_value, '{}'::jsonb), updated_at = now()
      where id = v_response_id;
    else
      insert into public.workspace_responses (
        workspace_id, section_id, group_id, value, updated_at
      )
      values (
        v_workspace_id, p_section_id, v_participant.group_id, coalesce(p_value, '{}'::jsonb), now()
      )
      returning id into v_response_id;
    end if;
  else
    select id into v_response_id
    from public.workspace_responses
    where section_id = p_section_id
      and participant_id = v_participant.id;

    if v_response_id is not null then
      update public.workspace_responses
      set value = coalesce(p_value, '{}'::jsonb), updated_at = now()
      where id = v_response_id;
    else
      insert into public.workspace_responses (
        workspace_id, section_id, participant_id, value, updated_at
      )
      values (
        v_workspace_id, p_section_id, v_participant.id, coalesce(p_value, '{}'::jsonb), now()
      )
      returning id into v_response_id;
    end if;
  end if;

  return v_response_id;
end;
$$;

grant execute on function public.upsert_workspace_response(text, uuid, jsonb) to authenticated;

-- Panel facilitador (resumen en vivo)
create or replace function public.get_workspace_panel_summary(p_workspace_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_owner uuid;
  v_section_count integer;
begin
  select user_id into v_owner
  from public.workspaces
  where id = p_workspace_id;

  if v_owner is null or v_owner <> auth.uid() then
    raise exception 'Sin permiso';
  end if;

  select count(*)::integer into v_section_count
  from public.workspace_sections
  where workspace_id = p_workspace_id
    and section_type <> 'info';

  return jsonb_build_object(
    'participants', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'display_name', p.display_name,
          'email', p.email,
          'group_id', p.group_id,
          'joined_at', p.joined_at,
          'completion_pct', (
            case
              when v_section_count = 0 then 100
              else round((
                select count(distinct r.section_id)::numeric
                from public.workspace_responses r
                join public.workspace_sections s on s.id = r.section_id
                where s.workspace_id = p_workspace_id
                  and s.section_type <> 'info'
                  and (
                    (s.scope = 'individual' and r.participant_id = p.id)
                    or (s.scope = 'group' and r.group_id = p.group_id and p.group_id is not null)
                  )
              ) / v_section_count * 100)
            end
          ),
          'is_group_editor', exists (
            select 1 from public.workspace_groups g
            where g.id = p.group_id
              and g.editor_participant_id = p.id
          )
        )
        order by p.joined_at
      )
      from public.workspace_participants p
      where p.workspace_id = p_workspace_id
    ), '[]'::jsonb),
    'groups', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', g.id,
          'name', g.name,
          'sort_order', g.sort_order,
          'editor_participant_id', g.editor_participant_id,
          'member_count', (
            select count(*) from public.workspace_participants mp
            where mp.group_id = g.id
          )
        )
        order by g.sort_order, g.created_at
      )
      from public.workspace_groups g
      where g.workspace_id = p_workspace_id
    ), '[]'::jsonb),
    'responses', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'section_id', r.section_id,
          'participant_id', r.participant_id,
          'group_id', r.group_id,
          'value', r.value,
          'updated_at', r.updated_at
        )
      )
      from public.workspace_responses r
      where r.workspace_id = p_workspace_id
    ), '[]'::jsonb)
  );
end;
$$;

grant execute on function public.get_workspace_panel_summary(uuid) to authenticated;
