import { ensureAccessCode } from './accessCodeService'
import { supabase } from './supabaseClient'
import {
  WORKSPACE_PARTICIPANT_LIMIT,
  isWorkspaceSetupError,
} from '../utils/workspaceHelpers'

const WORKSPACE_RESOURCE = 'workspace'

export async function fetchWorkspaces(userId) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function fetchWorkspaceById(userId, workspaceId) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', userId)
    .eq('id', workspaceId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function createWorkspace(userId, payload) {
  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      user_id: userId,
      title: payload.title?.trim() || 'Nuevo espacio de trabajo',
      description: payload.description?.trim() ?? '',
      status: 'draft',
      settings: payload.settings ?? { navigation_mode: 'free' },
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  await ensureAccessCode(userId, WORKSPACE_RESOURCE, data.id)
  return data
}

export async function updateWorkspace(userId, workspaceId, payload) {
  const { data, error } = await supabase
    .from('workspaces')
    .update({
      title: payload.title?.trim(),
      description: payload.description?.trim() ?? '',
      status: payload.status,
      settings: payload.settings,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('id', workspaceId)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteWorkspace(userId, workspaceId) {
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('user_id', userId)
    .eq('id', workspaceId)

  if (error) {
    throw error
  }
}

export async function duplicateWorkspace(userId, workspaceId) {
  const [workspace, sections, groups] = await Promise.all([
    fetchWorkspaceById(userId, workspaceId),
    fetchWorkspaceSections(userId, workspaceId),
    fetchWorkspaceGroups(userId, workspaceId),
  ])

  if (!workspace) {
    throw new Error('No encontramos este espacio.')
  }

  const copy = await createWorkspace(userId, {
    title: `${workspace.title?.trim() || 'Espacio'} (copia)`,
    description: workspace.description ?? '',
    settings: {
      ...(workspace.settings ?? {}),
      closure_survey: {
        ...(workspace.settings?.closure_survey ?? {}),
        active: false,
      },
      attendance: {
        ...(workspace.settings?.attendance ?? {}),
        prompt_active: false,
      },
    },
  })

  if (groups.length > 0) {
    await replaceWorkspaceGroups(
      userId,
      copy.id,
      groups.map((group) => ({ name: group.name }))
    )
  }

  const orderedSections = [...sections].sort(
    (left, right) =>
      (left.sort_order ?? 0) - (right.sort_order ?? 0) ||
      String(left.created_at ?? '').localeCompare(String(right.created_at ?? ''))
  )

  for (const [index, section] of orderedSections.entries()) {
    await createWorkspaceSection(userId, copy.id, {
      title: section.title,
      section_type: section.section_type,
      scope: section.scope,
      config: section.config ?? {},
      sort_order: index,
      is_required: section.is_required ?? true,
    })
  }

  return copy
}

export async function fetchWorkspaceGroups(userId, workspaceId) {
  const { data, error } = await supabase
    .from('workspace_groups')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('sort_order')
    .order('created_at')

  if (error) {
    throw error
  }

  return data ?? []
}

export async function replaceWorkspaceGroups(userId, workspaceId, groups) {
  const { error: deleteError } = await supabase
    .from('workspace_groups')
    .delete()
    .eq('workspace_id', workspaceId)

  if (deleteError) {
    throw deleteError
  }

  if (!groups.length) {
    return []
  }

  const rows = groups.map((group, index) => ({
    workspace_id: workspaceId,
    name: group.name?.trim() || `Grupo ${index + 1}`,
    sort_order: index,
  }))

  const { data, error } = await supabase
    .from('workspace_groups')
    .insert(rows)
    .select('*')

  if (error) {
    throw error
  }

  return data ?? []
}

export async function fetchWorkspaceSections(userId, workspaceId) {
  const { data, error } = await supabase
    .from('workspace_sections')
    .select('*')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .order('sort_order')
    .order('created_at')

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createWorkspaceSection(userId, workspaceId, section) {
  const { data, error } = await supabase
    .from('workspace_sections')
    .insert({
      user_id: userId,
      workspace_id: workspaceId,
      title: section.title,
      section_type: section.section_type,
      scope: section.scope,
      config: section.config ?? {},
      sort_order: section.sort_order ?? 0,
      is_required: section.is_required ?? true,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateWorkspaceSection(userId, sectionId, section) {
  const { data, error } = await supabase
    .from('workspace_sections')
    .update({
      title: section.title,
      section_type: section.section_type,
      scope: section.scope,
      config: section.config ?? {},
      sort_order: section.sort_order,
      is_required: section.is_required,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('id', sectionId)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteWorkspaceSection(userId, sectionId) {
  const { error } = await supabase
    .from('workspace_sections')
    .delete()
    .eq('user_id', userId)
    .eq('id', sectionId)

  if (error) {
    throw error
  }
}

export async function fetchWorkspaceParticipants(userId, workspaceId) {
  const { data, error } = await supabase
    .from('workspace_participants')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('joined_at', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function assignParticipantGroup(participantId, groupId) {
  const { data, error } = await supabase
    .from('workspace_participants')
    .update({ group_id: groupId || null })
    .eq('id', participantId)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function setGroupEditor(groupId, participantId) {
  const { data, error } = await supabase
    .from('workspace_groups')
    .update({ editor_participant_id: participantId || null })
    .eq('id', groupId)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function fetchWorkspaceResponses(userId, workspaceId) {
  const { data, error } = await supabase
    .from('workspace_responses')
    .select('*')
    .eq('workspace_id', workspaceId)

  if (error) {
    throw error
  }

  return data ?? []
}

export async function getWorkspacePanelSummary(workspaceId) {
  const { data, error } = await supabase.rpc('get_workspace_panel_summary', {
    p_workspace_id: workspaceId,
  })

  if (error) {
    throw error
  }

  return data ?? { participants: [], groups: [], responses: [] }
}

export async function joinWorkspace(code, displayName, privacyAccepted) {
  const { data, error } = await supabase.rpc('join_workspace', {
    p_code: code.trim().toUpperCase(),
    p_display_name: displayName,
    p_privacy_accepted: privacyAccepted,
  })

  if (error) {
    throw error
  }

  return data
}

export async function getWorkspaceForParticipant(code) {
  const { data, error } = await supabase.rpc('get_workspace_for_participant', {
    p_code: code.trim().toUpperCase(),
  })

  if (error) {
    throw error
  }

  return data
}

export async function setWorkspaceModuleFlags(workspaceId, flags = {}) {
  const { data, error } = await supabase.rpc('set_workspace_module_flags', {
    p_workspace_id: workspaceId,
    p_closure_survey_active: flags.closureSurveyActive ?? null,
    p_attendance_prompt_active: flags.attendancePromptActive ?? null,
  })

  if (error) {
    throw error
  }

  return data
}

export async function submitWorkspaceAttendance(code, payload) {
  const { data, error } = await supabase.rpc('submit_workspace_attendance', {
    p_code: code.trim().toUpperCase(),
    p_first_name: payload.firstName,
    p_last_name: payload.lastName,
    p_rut: payload.rut,
    p_job_title: payload.jobTitle,
  })

  if (error) {
    throw error
  }

  return data
}

export async function touchWorkspacePresence(code) {
  const { error } = await supabase.rpc('touch_workspace_presence', {
    p_code: code.trim().toUpperCase(),
  })

  if (error && !error.message?.includes('touch_workspace_presence')) {
    throw error
  }
}

export async function upsertWorkspaceResponse(code, sectionId, value) {
  const { data, error } = await supabase.rpc('upsert_workspace_response', {
    p_code: code.trim().toUpperCase(),
    p_section_id: sectionId,
    p_value: value,
  })

  if (error) {
    throw error
  }

  return data
}

export async function publishWorkspace(userId, workspaceId) {
  return updateWorkspace(userId, workspaceId, { status: 'open' })
}

export async function pauseWorkspace(userId, workspaceId) {
  return updateWorkspace(userId, workspaceId, { status: 'paused' })
}

export async function archiveWorkspace(userId, workspaceId) {
  return updateWorkspace(userId, workspaceId, { status: 'archived' })
}

export async function reopenWorkspace(userId, workspaceId) {
  return updateWorkspace(userId, workspaceId, { status: 'open' })
}

export function getParticipantLimitMessage(count) {
  if (count >= WORKSPACE_PARTICIPANT_LIMIT) {
    return `Límite alcanzado (${WORKSPACE_PARTICIPANT_LIMIT} participantes).`
  }

  return `${count} / ${WORKSPACE_PARTICIPANT_LIMIT} participantes`
}

export {
  WORKSPACE_PARTICIPANT_LIMIT,
  WORKSPACE_RESOURCE,
  isWorkspaceSetupError,
}
