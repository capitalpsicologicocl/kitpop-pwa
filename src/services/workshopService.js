import { ensureAccessCode } from './accessCodeService'
import { supabase } from './supabaseClient'
import {
  isWorkshopOpeningItem,
  WORKSHOP_OPENING_ITEM,
} from '../utils/workshopHelpers'

export async function ensureWorkshopOpeningItem(userId, sessionId) {
  const { data: items, error } = await supabase
    .from('workshop_items')
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .order('sort_order', { ascending: true })

  if (error) {
    throw error
  }

  if ((items ?? []).some(isWorkshopOpeningItem)) {
    return null
  }

  for (const item of items ?? []) {
    await updateWorkshopItem(userId, item.id, {
      sortOrder: (item.sort_order ?? 0) + 1,
    })
  }

  return createWorkshopItem(userId, sessionId, {
    sortOrder: 0,
    timeMinutes: WORKSHOP_OPENING_ITEM.timeMinutes,
    itemType: WORKSHOP_OPENING_ITEM.itemType,
    title: WORKSHOP_OPENING_ITEM.title,
    description: WORKSHOP_OPENING_ITEM.description,
    activitySlug: WORKSHOP_OPENING_ITEM.activitySlug,
  })
}

export async function ensureWorkshopOpeningItems(userId, workshopId) {
  const sessions = await fetchWorkshopSessions(userId, workshopId)

  for (const session of sessions) {
    await ensureWorkshopOpeningItem(userId, session.id)
  }

  return fetchWorkshopSessions(userId, workshopId)
}

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
    return ensureWorkshopOpeningItems(userId, workshopId)
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

  return ensureWorkshopOpeningItems(userId, workshopId)
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

  return ensureWorkshopOpeningItems(userId, workshopId)
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
      pause_type: payload.pauseType ?? null,
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

  if (payload.pauseType !== undefined) {
    update.pause_type = payload.pauseType ?? null
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
  const { data: item, error: fetchError } = await supabase
    .from('workshop_items')
    .select('*')
    .eq('user_id', userId)
    .eq('id', itemId)
    .maybeSingle()

  if (fetchError) {
    throw fetchError
  }

  if (item && isWorkshopOpeningItem(item)) {
    throw new Error('La bienvenida y encuadre es un módulo estándar de apertura y no se puede quitar.')
  }

  const { error } = await supabase
    .from('workshop_items')
    .delete()
    .eq('user_id', userId)
    .eq('id', itemId)

  if (error) {
    throw error
  }
}

export async function finalizeWorkshopStructure(userId, workshopId) {
  const { data, error } = await supabase
    .from('workshops')
    .update({
      status: 'ready',
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

export async function duplicateWorkshop(userId, workshopId) {
  const [source, sessions] = await Promise.all([
    fetchWorkshopById(userId, workshopId),
    fetchWorkshopSessions(userId, workshopId),
  ])

  if (!source) {
    throw new Error('No encontramos el taller a duplicar.')
  }

  const { data: copy, error: copyError } = await supabase
    .from('workshops')
    .insert({
      user_id: userId,
      title: `${source.title} (copia)`,
      audience: source.audience,
      organization: source.organization,
      team: source.team,
      modality: source.modality,
      objective: source.objective,
      participants_count: source.participants_count,
      session_count: source.session_count,
      status: 'draft',
    })
    .select()
    .single()

  if (copyError) {
    throw copyError
  }

  await ensureAccessCode(userId, 'workshop', copy.id)

  for (const session of sessions) {
    const { data: newSession, error: sessionError } = await supabase
      .from('workshop_sessions')
      .insert({
        user_id: userId,
        workshop_id: copy.id,
        session_number: session.session_number,
        duration_hours: session.duration_hours ?? 0,
        duration_minutes: session.duration_minutes ?? 0,
        journal_notes: session.journal_notes ?? '',
      })
      .select()
      .single()

    if (sessionError) {
      throw sessionError
    }

    const items = session.workshop_items ?? []

    if (items.length === 0) {
      continue
    }

    const rows = items.map((item) => ({
      user_id: userId,
      session_id: newSession.id,
      sort_order: item.sort_order,
      time_minutes: item.time_minutes,
      item_type: item.item_type,
      title: item.title,
      description: item.description,
      activity_slug: item.activity_slug,
      pause_type: item.pause_type ?? null,
    }))

    const { error: itemsError } = await supabase.from('workshop_items').insert(rows)

    if (itemsError) {
      throw itemsError
    }
  }

  return copy
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
