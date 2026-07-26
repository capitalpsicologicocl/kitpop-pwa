-- KitPOP: presencia en espacios de trabajo (opcional)
-- Ejecutar en Supabase → SQL Editor si quieres conteo preciso de conectados.

alter table public.workspace_participants
  add column if not exists last_seen_at timestamptz;

create or replace function public.touch_workspace_presence(p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
begin
  select ac.resource_id into v_workspace_id
  from public.access_codes ac
  where ac.code = upper(trim(p_code))
    and ac.resource_type = 'workspace'
    and ac.is_active = true
  limit 1;

  if v_workspace_id is null then
    return;
  end if;

  update public.workspace_participants
  set last_seen_at = now()
  where workspace_id = v_workspace_id
    and user_id = auth.uid();
end;
$$;

grant execute on function public.touch_workspace_presence(text) to authenticated;

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
          'last_seen_at', p.last_seen_at,
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
