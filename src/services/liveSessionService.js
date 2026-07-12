import { ensureAccessCode } from './accessCodeService'
import { normalizeAccessCode } from '../utils/accessCode'
import { supabase } from './supabaseClient'

export async function fetchLiveSessions(userId) {
  const { data, error } = await supabase
    .from('live_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function fetchLiveSessionById(userId, sessionId) {
  const { data, error } = await supabase
    .from('live_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('id', sessionId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function createLiveSessionDraft(userId, payload) {
  const { data, error } = await supabase
    .from('live_sessions')
    .insert({
      user_id: userId,
      title: payload.title,
      organization: payload.organization || null,
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  const code = await ensureAccessCode(userId, 'live', data.id)

  return { session: data, code }
}

export async function updateLiveSession(userId, sessionId, payload) {
  const { data, error } = await supabase
    .from('live_sessions')
    .update({
      title: payload.title,
      organization: payload.organization ?? null,
      status: payload.status,
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

export async function deleteLiveSession(userId, sessionId) {
  await supabase
    .from('access_codes')
    .delete()
    .eq('user_id', userId)
    .eq('resource_type', 'live')
    .eq('resource_id', sessionId)

  const { error } = await supabase
    .from('live_sessions')
    .delete()
    .eq('user_id', userId)
    .eq('id', sessionId)

  if (error) {
    throw error
  }
}

export async function updateLiveSessionStatus(userId, sessionId, status) {
  const { data, error } = await supabase
    .from('live_sessions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', sessionId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function fetchLivePolls(userId, sessionId) {
  const { data, error } = await supabase
    .from('live_polls')
    .select('*')
    .eq('user_id', userId)
    .eq('live_session_id', sessionId)
    .order('sort_order', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createLivePoll(userId, sessionId, payload) {
  const { data, error } = await supabase
    .from('live_polls')
    .insert({
      user_id: userId,
      live_session_id: sessionId,
      sort_order: payload.sortOrder ?? 0,
      prompt: payload.prompt,
      poll_type: payload.pollType ?? 'single_choice',
      options: payload.options ?? [],
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateLivePoll(userId, pollId, payload) {
  const update = {
    updated_at: new Date().toISOString(),
  }

  if (payload.sortOrder !== undefined) {
    update.sort_order = payload.sortOrder
  }

  if (payload.prompt !== undefined) {
    update.prompt = payload.prompt
  }

  if (payload.pollType !== undefined) {
    update.poll_type = payload.pollType
  }

  if (payload.options !== undefined) {
    update.options = payload.options
  }

  if (payload.status !== undefined) {
    update.status = payload.status
  }

  const { data, error } = await supabase
    .from('live_polls')
    .update(update)
    .eq('user_id', userId)
    .eq('id', pollId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteLivePoll(userId, pollId) {
  const { error } = await supabase
    .from('live_polls')
    .delete()
    .eq('user_id', userId)
    .eq('id', pollId)

  if (error) {
    throw error
  }
}

export async function openLivePoll(userId, sessionId, pollId) {
  await supabase
    .from('live_polls')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('live_session_id', sessionId)
    .eq('status', 'open')

  return updateLivePoll(userId, pollId, { status: 'open' })
}

export async function closeLivePoll(userId, pollId) {
  return updateLivePoll(userId, pollId, { status: 'closed' })
}

export async function fetchLivePollVotes(userId, sessionId) {
  const { data, error } = await supabase
    .from('live_poll_votes')
    .select('*')
    .eq('live_session_id', sessionId)

  if (error) {
    throw error
  }

  return data ?? []
}

export async function duplicateLiveSession(userId, sessionId) {
  const [source, polls] = await Promise.all([
    fetchLiveSessionById(userId, sessionId),
    fetchLivePolls(userId, sessionId),
  ])

  if (!source) {
    throw new Error('No encontramos la sesión a duplicar.')
  }

  const { data: copy, error: copyError } = await supabase
    .from('live_sessions')
    .insert({
      user_id: userId,
      title: `${source.title} (copia)`,
      organization: source.organization,
      status: 'draft',
    })
    .select()
    .single()

  if (copyError) {
    throw copyError
  }

  await ensureAccessCode(userId, 'live', copy.id)

  if (polls.length > 0) {
    const rows = polls.map((poll) => ({
      user_id: userId,
      live_session_id: copy.id,
      sort_order: poll.sort_order,
      prompt: poll.prompt,
      poll_type: poll.poll_type,
      options: poll.options ?? [],
      status: 'draft',
    }))

    const { error: pollsError } = await supabase.from('live_polls').insert(rows)

    if (pollsError) {
      throw pollsError
    }
  }

  return copy
}

export async function getLiveSessionForParticipant(code, participantToken = '') {
  const { data, error } = await supabase.rpc('get_live_session_for_participant', {
    p_code: normalizeAccessCode(code),
    p_participant_token: participantToken,
  })

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function submitLivePollVote(code, pollId, participantToken, answerText) {
  const { data, error } = await supabase.rpc('submit_live_poll_vote', {
    p_code: normalizeAccessCode(code),
    p_poll_id: pollId,
    p_participant_token: participantToken,
    p_answer_text: answerText,
  })

  if (error) {
    throw error
  }

  return data
}

export function isLiveSetupError(error) {
  const message = error?.message?.toLowerCase() ?? ''

  return (
    message.includes('live_polls') ||
    message.includes('live_poll_votes') ||
    message.includes('does not exist') ||
    message.includes('schema cache')
  )
}
