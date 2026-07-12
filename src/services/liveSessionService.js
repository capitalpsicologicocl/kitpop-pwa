import { ensureAccessCode } from './accessCodeService'
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
