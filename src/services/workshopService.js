import { ensureAccessCode } from './accessCodeService'
import { supabase } from './supabaseClient'

export async function fetchWorkshops(userId) {
  const { data, error } = await supabase
    .from('workshops')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function fetchWorkshopById(userId, workshopId) {
  const { data, error } = await supabase
    .from('workshops')
    .select('*')
    .eq('user_id', userId)
    .eq('id', workshopId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function createWorkshopDraft(userId, payload) {
  const { data, error } = await supabase
    .from('workshops')
    .insert({
      user_id: userId,
      title: payload.title,
      audience: payload.audience || null,
      organization: payload.organization || null,
      team: payload.team || null,
      modality: payload.modality || 'Presencial',
      objective: payload.objective || null,
      participants_count: payload.participantsCount || null,
      session_count: payload.sessionCount || 1,
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  const code = await ensureAccessCode(userId, 'workshop', data.id)

  return { workshop: data, code }
}

export async function updateWorkshop(userId, workshopId, payload) {
  const { data, error } = await supabase
    .from('workshops')
    .update({
      title: payload.title,
      audience: payload.audience ?? null,
      organization: payload.organization ?? null,
      team: payload.team ?? null,
      modality: payload.modality ?? 'Presencial',
      objective: payload.objective ?? null,
      participants_count: payload.participantsCount ?? null,
      session_count: payload.sessionCount ?? 1,
      status: payload.status ?? 'draft',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('id', workshopId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function fetchWorkshopSessions(userId, workshopId) {
  const { data, error } = await supabase
    .from('workshop_sessions')
    .select('*, workshop_items(*)')
    .eq('user_id', userId)
    .eq('workshop_id', workshopId)
    .order('session_number', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []).map((session) => ({
    ...session,
    workshop_items: (session.workshop_items ?? []).sort(
      (left, right) => left.sort_order - right.sort_order
    ),
  }))
}

export async function syncWorkshopSessionCount(
  userId,
  workshopId,
  desiredCount,
  defaultDuration = { hours: 2, minutes: 0 }
) {
  const current = await fetchWorkshopSessions(userId, workshopId)

  if (desiredCount === current.length) {
    return current
  }

  if (desiredCount > current.length) {
    const rows = []

    for (let sessionNumber = current.length + 1; sessionNumber <= desiredCount; sessionNumber += 1) {
      rows.push({
        user_id: userId,
        workshop_id: workshopId,
        session_number: sessionNumber,
        duration_hours: defaultDuration.hours ?? 0,
        duration_minutes: defaultDuration.minutes ?? 0,
        journal_notes: '',
      })
    }

    const { error } = await supabase.from('workshop_sessions').insert(rows)

    if (error) {
      throw error
    }
  } else {
    const sessionsToRemove = current.filter(
      (session) => session.session_number > desiredCount
    )

    for (const session of sessionsToRemove) {
      const { error } = await supabase
        .from('workshop_sessions')
        .delete()
        .eq('user_id', userId)
        .eq('id', session.id)

      if (error) {
        throw error
      }
    }
  }

  await supabase
    .from('workshops')
    .update({
      session_count: desiredCount,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('id', workshopId)

  return fetchWorkshopSessions(userId, workshopId)
}

export async function initializeWorkshopSessions(userId, workshopId, sessions) {
  await supabase
    .from('workshop_sessions')
    .delete()
    .eq('user_id', userId)
    .eq('workshop_id', workshopId)

  if (!sessions.length) {
    return []
  }

  const rows = sessions.map((session) => ({
    user_id: userId,
    workshop_id: workshopId,
    session_number: session.sessionNumber,
    duration_hours: session.durationHours ?? 0,
    duration_minutes: session.durationMinutes ?? 0,
    journal_notes: '',
  }))

  const { data, error } = await supabase
    .from('workshop_sessions')
    .insert(rows)
    .select('*, workshop_items(*)')

  if (error) {
    throw error
  }

  await supabase
    .from('workshops')
    .update({
      session_count: sessions.length,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('id', workshopId)

  return data ?? []
}

export async function updateWorkshopSession(userId, sessionId, payload) {
  const { data, error } = await supabase
    .from('workshop_sessions')
    .update({
      duration_hours: payload.durationHours ?? 0,
      duration_minutes: payload.durationMinutes ?? 0,
      journal_notes: payload.journalNotes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('id', sessionId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function createWorkshopItem(userId, sessionId, payload) {
  const { data, error } = await supabase
    .from('workshop_items')
    .insert({
      user_id: userId,
      session_id: sessionId,
      sort_order: payload.sortOrder ?? 0,
      time_minutes: payload.timeMinutes ?? 15,
      item_type: payload.itemType ?? 'theory',
      title: payload.title,
      description: payload.description ?? null,
      activity_slug: payload.activitySlug ?? null,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateWorkshopItem(userId, itemId, payload) {
  const update = {
    updated_at: new Date().toISOString(),
  }

  if (payload.sortOrder !== undefined) {
    update.sort_order = payload.sortOrder
  }

  if (payload.timeMinutes !== undefined) {
    update.time_minutes = payload.timeMinutes
  }

  if (payload.itemType !== undefined) {
    update.item_type = payload.itemType
  }

  if (payload.title !== undefined) {
    update.title = payload.title
  }

  if (payload.description !== undefined) {
    update.description = payload.description ?? null
  }

  if (payload.activitySlug !== undefined) {
    update.activity_slug = payload.activitySlug ?? null
  }

  const { data, error } = await supabase
    .from('workshop_items')
    .update(update)
    .eq('user_id', userId)
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteWorkshopItem(userId, itemId) {
  const { error } = await supabase
    .from('workshop_items')
    .delete()
    .eq('user_id', userId)
    .eq('id', itemId)

  if (error) {
    throw error
  }
}

export async function deleteWorkshop(userId, workshopId) {
  await supabase
    .from('access_codes')
    .delete()
    .eq('user_id', userId)
    .eq('resource_type', 'workshop')
    .eq('resource_id', workshopId)

  const { error } = await supabase
    .from('workshops')
    .delete()
    .eq('user_id', userId)
    .eq('id', workshopId)

  if (error) {
    throw error
  }
}

export function formatSessionDuration(hours = 0, minutes = 0) {
  if (hours === 0 && minutes === 0) {
    return 'Sin tiempo definido'
  }

  if (hours === 0) {
    return `${minutes} min`
  }

  if (minutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${String(minutes).padStart(2, '0')} min`
}

export function formatItemTime(minutes = 0) {
  if (!minutes) {
    return '—'
  }

  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  if (remainder === 0) {
    return `${hours} h`
  }

  return `${hours} h ${remainder} min`
}
