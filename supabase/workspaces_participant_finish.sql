-- Finalización del panel participante + encuesta de cierre tras cerrar panel
-- Ejecutar en Supabase → SQL Editor

alter table public.workspace_participants
  add column if not exists panel_finished_at timestamptz;

create or replace function public.submit_workspace_panel_finish(p_code text)
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

  select ac.resource_id
  into v_workspace_id
  from public.access_codes ac
  where ac.code = upper(trim(p_code))
    and ac.is_active = true
    and ac.resource_type = 'workspace'
  limit 1;

  if v_workspace_id is null then
    raise exception 'Código no encontrado';
  end if;

  select * into v_participant
  from public.workspace_participants
  where workspace_id = v_workspace_id
    and user_id = v_user_id;

  if v_participant.id is null then
    raise exception 'No estás inscrito en este espacio';
  end if;

  update public.workspace_participants
  set panel_finished_at = coalesce(panel_finished_at, now())
  where id = v_participant.id
  returning * into v_participant;

  return jsonb_build_object(
    'participant_id', v_participant.id,
    'panel_finished_at', v_participant.panel_finished_at
  );
end;
$$;

grant execute on function public.submit_workspace_panel_finish(text) to authenticated;

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
  v_panel_finished boolean := false;
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
  v_panel_finished := v_participant.panel_finished_at is not null;

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
      'attendance_registered_at', v_participant.attendance_registered_at,
      'panel_finished_at', v_participant.panel_finished_at
    ),
    'group', (
      select jsonb_build_object('id', g.id, 'name', g.name)
      from public.workspace_groups g
      where g.id = v_participant.group_id
    ),
    'modules', jsonb_build_object(
      'attendance_prompt', v_attendance_prompt,
      'closure_survey_active', v_closure_active,
      'closure_survey_enabled', coalesce((v_settings->'closure_survey'->>'enabled')::boolean, false)
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
              when coalesce((s.config->>'closure_survey')::boolean, false) then
                v_panel_finished and v_closure_active and s.scope = 'individual'
              when s.scope = 'individual' then not v_panel_finished
              when v_participant.group_id is null then false
              else v_is_editor and not v_panel_finished
            end
          ),
          'visible', (
            case
              when coalesce((s.config->>'closure_survey')::boolean, false) then
                v_panel_finished and v_closure_active
              else
                not v_panel_finished
            end
          )
        )
        order by s.sort_order, s.created_at
      )
      from public.workspace_sections s
      where s.workspace_id = w.id
        and (
          (
            coalesce((s.config->>'closure_survey')::boolean, false) = false
            and not v_panel_finished
          )
          or (
            coalesce((s.config->>'closure_survey')::boolean, false) = true
            and v_panel_finished
            and v_closure_active
          )
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
