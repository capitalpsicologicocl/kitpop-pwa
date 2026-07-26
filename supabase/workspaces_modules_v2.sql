-- KitPOP: encuesta de cierre + registro de asistencia en espacios de trabajo
-- Ejecutar en Supabase → SQL Editor

alter table public.workspace_participants
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists rut text,
  add column if not exists job_title text,
  add column if not exists attendance_registered_at timestamptz;

create or replace function public.set_workspace_module_flags(
  p_workspace_id uuid,
  p_closure_survey_active boolean default null,
  p_attendance_prompt_active boolean default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings jsonb;
begin
  if not exists (
    select 1 from public.workspaces
    where id = p_workspace_id and user_id = auth.uid()
  ) then
    raise exception 'Sin permiso';
  end if;

  select settings into v_settings
  from public.workspaces
  where id = p_workspace_id;

  v_settings := coalesce(v_settings, '{}'::jsonb);

  if p_closure_survey_active is not null then
    v_settings := jsonb_set(
      v_settings,
      '{closure_survey,active}',
      to_jsonb(p_closure_survey_active),
      true
    );
  end if;

  if p_attendance_prompt_active is not null then
    v_settings := jsonb_set(
      v_settings,
      '{attendance,prompt_active}',
      to_jsonb(p_attendance_prompt_active),
      true
    );
  end if;

  update public.workspaces
  set settings = v_settings, updated_at = now()
  where id = p_workspace_id;

  return v_settings;
end;
$$;

grant execute on function public.set_workspace_module_flags(uuid, boolean, boolean) to authenticated;

create or replace function public.submit_workspace_attendance(
  p_code text,
  p_first_name text,
  p_last_name text,
  p_rut text,
  p_job_title text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_user_id uuid := auth.uid();
  v_participant record;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión';
  end if;

  select ac.resource_id into v_workspace_id
  from public.access_codes ac
  where ac.code = upper(trim(p_code))
    and ac.resource_type = 'workspace'
    and ac.is_active = true
  limit 1;

  if v_workspace_id is null then
    raise exception 'Código no encontrado';
  end if;

  select * into v_participant
  from public.workspace_participants
  where workspace_id = v_workspace_id
    and user_id = v_user_id;

  if v_participant.id is null then
    raise exception 'Debes inscribirte en el espacio primero';
  end if;

  update public.workspace_participants
  set
    first_name = nullif(trim(p_first_name), ''),
    last_name = nullif(trim(p_last_name), ''),
    rut = nullif(trim(p_rut), ''),
    job_title = nullif(trim(p_job_title), ''),
    attendance_registered_at = now(),
    display_name = trim(concat_ws(' ', nullif(trim(p_first_name), ''), nullif(trim(p_last_name), '')))
  where id = v_participant.id;

  return jsonb_build_object(
    'ok', true,
    'attendance_registered_at', now()
  );
end;
$$;

grant execute on function public.submit_workspace_attendance(text, text, text, text, text) to authenticated;

-- Actualizar payload participante con módulos y filtrar encuesta de cierre
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
  v_settings jsonb;
  v_user_id uuid := auth.uid();
  v_participant record;
  v_is_editor boolean := false;
  v_closure_active boolean := false;
  v_attendance_prompt boolean := false;
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

  select ac.resource_id, ws.status, ws.settings
  into v_workspace_id, v_status, v_settings
  from public.access_codes ac
  join public.workspaces ws on ws.id = ac.resource_id
  where ac.code = upper(trim(p_code))
    and ac.is_active = true
    and ac.resource_type = 'workspace'
  limit 1;

  if v_workspace_id is null then
    return jsonb_build_object('error', 'not_found');
  end if;

  if v_status = 'archived' then
    return jsonb_build_object('error', 'archived', 'title', (
      select title from public.workspaces where id = v_workspace_id
    ));
  end if;

  select * into v_participant
  from public.workspace_participants
  where workspace_id = v_workspace_id
    and user_id = v_user_id;

  if v_participant.id is null then
    return jsonb_build_object(
      'error', 'not_enrolled',
      'title', (select title from public.workspaces where id = v_workspace_id),
      'status', v_status
    );
  end if;

  if v_participant.group_id is not null then
    select exists (
      select 1 from public.workspace_groups g
      where g.id = v_participant.group_id
        and g.editor_participant_id = v_participant.id
    ) into v_is_editor;
  end if;

  v_closure_active := coalesce((v_settings->'closure_survey'->>'active')::boolean, false);
  v_attendance_prompt := coalesce((v_settings->'attendance'->>'prompt_active')::boolean, false)
    and coalesce((v_settings->'attendance'->>'enabled')::boolean, false)
    and v_participant.attendance_registered_at is null;

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
      'is_group_editor', v_is_editor,
      'first_name', v_participant.first_name,
      'last_name', v_participant.last_name,
      'rut', v_participant.rut,
      'job_title', v_participant.job_title,
      'attendance_registered_at', v_participant.attendance_registered_at
    ),
    'group', (
      select jsonb_build_object('id', g.id, 'name', g.name)
      from public.workspace_groups g
      where g.id = v_participant.group_id
    ),
    'modules', jsonb_build_object(
      'attendance_prompt', v_attendance_prompt,
      'closure_survey_active', v_closure_active
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
              when coalesce((s.config->>'closure_survey')::boolean, false) then v_closure_active
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
        and (
          coalesce((s.config->>'closure_survey')::boolean, false) = false
          or v_closure_active
        )
    ), '[]'::jsonb)
  )
  into v_result
  from public.workspaces w
  where w.id = v_workspace_id;

  return v_result;
end;
$$;

grant execute on function public.get_workspace_for_participant(text) to authenticated;

-- Panel facilitador: datos de asistencia
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
  v_settings jsonb;
begin
  select user_id, settings into v_owner, v_settings
  from public.workspaces
  where id = p_workspace_id;

  if v_owner is null or v_owner <> auth.uid() then
    raise exception 'Sin permiso';
  end if;

  select count(*)::integer into v_section_count
  from public.workspace_sections
  where workspace_id = p_workspace_id
    and section_type <> 'info'
    and coalesce((config->>'closure_survey')::boolean, false) = false;

  return jsonb_build_object(
    'settings', coalesce(v_settings, '{}'::jsonb),
    'participants', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'display_name', p.display_name,
          'email', p.email,
          'group_id', p.group_id,
          'joined_at', p.joined_at,
          'last_seen_at', p.last_seen_at,
          'first_name', p.first_name,
          'last_name', p.last_name,
          'rut', p.rut,
          'job_title', p.job_title,
          'attendance_registered_at', p.attendance_registered_at,
          'completion_pct', (
            case
              when v_section_count = 0 then 100
              else round((
                select count(distinct r.section_id)::numeric
                from public.workspace_responses r
                join public.workspace_sections s on s.id = r.section_id
                where s.workspace_id = p_workspace_id
                  and s.section_type <> 'info'
                  and coalesce((s.config->>'closure_survey')::boolean, false) = false
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
