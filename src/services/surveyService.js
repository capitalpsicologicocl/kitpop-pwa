import { ensureAccessCode } from './accessCodeService'
import { supabase } from './supabaseClient'

export async function fetchSurveys(userId) {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createSurveyDraft(userId, payload) {
  const { data, error } = await supabase
    .from('surveys')
    .insert({
      user_id: userId,
      title: payload.title,
      description: payload.description || null,
      organization: payload.organization || null,
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  const code = await ensureAccessCode(userId, 'survey', data.id)

  return { survey: data, code }
}

export async function deleteSurvey(userId, surveyId) {
  await supabase
    .from('access_codes')
    .delete()
    .eq('user_id', userId)
    .eq('resource_type', 'survey')
    .eq('resource_id', surveyId)

  const { error } = await supabase
    .from('surveys')
    .delete()
    .eq('user_id', userId)
    .eq('id', surveyId)

  if (error) {
    throw error
  }
}

export async function updateSurveyStatus(userId, surveyId, status) {
  const { data, error } = await supabase
    .from('surveys')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', surveyId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
