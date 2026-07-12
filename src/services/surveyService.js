import { ensureAccessCode } from './accessCodeService'
import { normalizeAccessCode } from '../utils/accessCode'
import { buildSatisfactionQuestions } from '../utils/surveyHelpers'
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

export async function fetchSurveyById(userId, surveyId) {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('user_id', userId)
    .eq('id', surveyId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function createSurveyDraft(userId, payload) {
  const surveyType = payload.surveyType ?? 'custom'
  const likertScale =
    surveyType === 'satisfaction' ? Number(payload.likertScale) || 5 : null

  const { data, error } = await supabase
    .from('surveys')
    .insert({
      user_id: userId,
      title: payload.title,
      description: payload.description || null,
      organization: payload.organization || null,
      survey_type: surveyType,
      likert_scale: likertScale,
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  if (surveyType === 'satisfaction') {
    const templateQuestions = buildSatisfactionQuestions(likertScale)
    const rows = templateQuestions.map((question) => ({
      user_id: userId,
      survey_id: data.id,
      sort_order: question.sortOrder,
      question_type: question.questionType,
      prompt: question.prompt,
      options: question.options ?? [],
      is_required: question.isRequired ?? true,
    }))

    const { error: questionsError } = await supabase.from('survey_questions').insert(rows)

    if (questionsError) {
      throw questionsError
    }
  }

  const code = await ensureAccessCode(userId, 'survey', data.id)

  return { survey: data, code }
}

export async function updateSurvey(userId, surveyId, payload) {
  const { data, error } = await supabase
    .from('surveys')
    .update({
      title: payload.title,
      description: payload.description ?? null,
      organization: payload.organization ?? null,
      status: payload.status,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('id', surveyId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
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

export async function fetchSurveyQuestions(userId, surveyId) {
  const { data, error } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('user_id', userId)
    .eq('survey_id', surveyId)
    .order('sort_order', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createSurveyQuestion(userId, surveyId, payload) {
  const { data, error } = await supabase
    .from('survey_questions')
    .insert({
      user_id: userId,
      survey_id: surveyId,
      sort_order: payload.sortOrder ?? 0,
      question_type: payload.questionType ?? 'text',
      prompt: payload.prompt,
      options: payload.options ?? [],
      is_required: payload.isRequired ?? true,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  await supabase
    .from('surveys')
    .update({ updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', surveyId)

  return data
}

export async function updateSurveyQuestion(userId, questionId, payload) {
  const update = {
    updated_at: new Date().toISOString(),
  }

  if (payload.sortOrder !== undefined) {
    update.sort_order = payload.sortOrder
  }

  if (payload.questionType !== undefined) {
    update.question_type = payload.questionType
  }

  if (payload.prompt !== undefined) {
    update.prompt = payload.prompt
  }

  if (payload.options !== undefined) {
    update.options = payload.options
  }

  if (payload.isRequired !== undefined) {
    update.is_required = payload.isRequired
  }

  const { data, error } = await supabase
    .from('survey_questions')
    .update(update)
    .eq('user_id', userId)
    .eq('id', questionId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteSurveyQuestion(userId, questionId) {
  const { error } = await supabase
    .from('survey_questions')
    .delete()
    .eq('user_id', userId)
    .eq('id', questionId)

  if (error) {
    throw error
  }
}

export async function duplicateSurvey(userId, surveyId) {
  const [source, questions] = await Promise.all([
    fetchSurveyById(userId, surveyId),
    fetchSurveyQuestions(userId, surveyId),
  ])

  if (!source) {
    throw new Error('No encontramos la encuesta a duplicar.')
  }

  const { data: copy, error: copyError } = await supabase
    .from('surveys')
    .insert({
      user_id: userId,
      title: `${source.title} (copia)`,
      description: source.description,
      organization: source.organization,
      survey_type: source.survey_type ?? 'custom',
      likert_scale: source.likert_scale ?? null,
      status: 'draft',
    })
    .select()
    .single()

  if (copyError) {
    throw copyError
  }

  await ensureAccessCode(userId, 'survey', copy.id)

  if (questions.length > 0) {
    const rows = questions.map((question) => ({
      user_id: userId,
      survey_id: copy.id,
      sort_order: question.sort_order,
      question_type: question.question_type,
      prompt: question.prompt,
      options: question.options ?? [],
      is_required: question.is_required,
    }))

    const { error: questionsError } = await supabase.from('survey_questions').insert(rows)

    if (questionsError) {
      throw questionsError
    }
  }

  return copy
}

export async function fetchSurveyResults(userId, surveyId) {
  const [questions, responseSets, answers] = await Promise.all([
    fetchSurveyQuestions(userId, surveyId),
    supabase
      .from('survey_response_sets')
      .select('*')
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false }),
    supabase.from('survey_answers').select('*').eq('survey_id', surveyId),
  ])

  if (responseSets.error) {
    throw responseSets.error
  }

  if (answers.error) {
    throw answers.error
  }

  return {
    questions,
    responseCount: responseSets.data?.length ?? 0,
    answers: answers.data ?? [],
  }
}

export async function getSurveyForParticipant(code, participantToken = '') {
  const { data, error } = await supabase.rpc('get_survey_for_participant', {
    p_code: normalizeAccessCode(code),
    p_participant_token: participantToken,
  })

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function submitSurveyAnswers(code, participantToken, answers) {
  const { data, error } = await supabase.rpc('submit_survey_answers', {
    p_code: normalizeAccessCode(code),
    p_participant_token: participantToken,
    p_answers: answers,
  })

  if (error) {
    throw error
  }

  return data
}
