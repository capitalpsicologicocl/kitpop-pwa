export const LIKERT_SCALES = [5, 7, 10]

export const LIKERT_SCALE_INFO = {
  5: {
    label: 'Escala 1–5 (la más utilizada)',
    description: 'Visión clara y rápida, evita la indecisión.',
  },
  7: {
    label: 'Escala 1–7 (mayor precisión)',
    description: 'Más matices, sin llegar a los extremos.',
  },
  10: {
    label: 'Escala 1–10 (gran detalle)',
    description: 'Métrica específica, alineada con NPS.',
  },
}

export const LIKERT_LABELS = {
  5: {
    1: 'Muy insatisfecho',
    2: 'Insatisfecho',
    3: 'Neutral',
    4: 'Satisfecho',
    5: 'Muy satisfecho',
  },
  7: {
    1: 'Totalmente insatisfecho',
    2: 'Muy insatisfecho',
    3: 'Algo insatisfecho',
    4: 'Neutral',
    5: 'Algo satisfecho',
    6: 'Muy satisfecho',
    7: 'Totalmente satisfecho',
  },
  10: {
    1: 'Extremadamente insatisfecho',
    2: 'Extremadamente insatisfecho',
    3: 'Insatisfecho',
    4: 'Insatisfecho',
    5: 'Moderadamente satisfecho',
    6: 'Moderadamente satisfecho',
    7: 'Satisfecho',
    8: 'Satisfecho',
    9: 'Extremadamente satisfecho',
    10: 'Extremadamente satisfecho',
  },
}

export const CUSTOM_QUESTION_TYPES = [
  { value: 'likert_5', label: 'Escala Likert 1–5' },
  { value: 'likert_7', label: 'Escala Likert 1–7' },
  { value: 'likert_10', label: 'Escala Likert 1–10' },
  { value: 'yes_no', label: 'Sí / No' },
  { value: 'text', label: 'Texto libre' },
]

export const SATISFACTION_TEMPLATE_ITEMS = [
  { prompt: 'Nota general al taller.', kind: 'likert' },
  { prompt: 'Nota al facilitador.', kind: 'likert' },
  {
    prompt: 'Nota a las actividades, estrategias y dinámicas.',
    kind: 'likert',
  },
  { prompt: 'Nota al contenido.', kind: 'likert' },
  { prompt: 'Nota al lugar o espacio físico.', kind: 'likert' },
  {
    prompt:
      'Nota al servicio de alimentación (desayuno, almuerzo, coffee break).',
    kind: 'likert',
  },
  {
    prompt:
      '¿Aprendiste y/o te llevas algo nuevo de este taller, que pudieses aplicar en tu contexto laboral / personal?',
    kind: 'yes_no',
  },
  { prompt: '¿Recomendarías este taller?', kind: 'yes_no' },
  { prompt: 'Comentario acerca de la experiencia.', kind: 'text' },
  { prompt: '¿Qué mejorarías de este curso?', kind: 'text' },
  {
    prompt: 'Nombre (opcional y autorización para uso en redes sociales).',
    kind: 'text',
    isRequired: false,
  },
]

export function likertTypeFromScale(scale) {
  if (scale === 7) {
    return 'likert_7'
  }

  if (scale === 10) {
    return 'likert_10'
  }

  return 'likert_5'
}

export function getLikertScaleFromType(type) {
  if (type === 'likert_7') {
    return 7
  }

  if (type === 'likert_10') {
    return 10
  }

  if (type === 'likert_5') {
    return 5
  }

  return null
}

export function isLikertType(type) {
  return type === 'likert_5' || type === 'likert_7' || type === 'likert_10'
}

export function getLikertLabel(scale, value) {
  return LIKERT_LABELS[scale]?.[value] ?? String(value)
}

export function getQuestionTypeLabel(type) {
  if (type === 'yes_no') {
    return 'Sí / No'
  }

  if (type === 'text') {
    return 'Texto libre'
  }

  const scale = getLikertScaleFromType(type)

  if (scale) {
    return LIKERT_SCALE_INFO[scale]?.label ?? `Escala 1–${scale}`
  }

  return type
}

export function getSurveyTypeLabel(type) {
  if (type === 'satisfaction') {
    return 'Encuesta de satisfacción'
  }

  return 'Encuesta libre'
}

export function getSurveyStatusLabel(status) {
  if (status === 'active') {
    return 'Activa · recibiendo respuestas'
  }

  if (status === 'paused') {
    return 'Pausada'
  }

  if (status === 'closed') {
    return 'Finalizada'
  }

  return 'Borrador'
}

export function getParticipantToken(surveyId) {
  const key = `kitpop-survey-token-${surveyId}`
  let token = localStorage.getItem(key)

  if (!token) {
    token =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(key, token)
  }

  return token
}

export function buildDefaultQuestion(type, sortOrder = 0) {
  const base = {
    questionType: type,
    prompt: '',
    isRequired: true,
    sortOrder,
    options: [],
  }

  if (isLikertType(type)) {
    return {
      ...base,
      prompt: '¿Qué tan satisfecho/a estás con este aspecto?',
    }
  }

  if (type === 'yes_no') {
    return {
      ...base,
      prompt: '¿Recomendarías esta experiencia?',
    }
  }

  return {
    ...base,
    prompt: 'Comparte tu comentario',
  }
}

export function buildSatisfactionQuestions(likertScale = 5) {
  const likertType = likertTypeFromScale(likertScale)

  return SATISFACTION_TEMPLATE_ITEMS.map((item, index) => ({
    sortOrder: index,
    questionType:
      item.kind === 'likert'
        ? likertType
        : item.kind === 'yes_no'
          ? 'yes_no'
          : 'text',
    prompt: item.prompt,
    isRequired: item.isRequired ?? true,
    options: [],
  }))
}

export function computeQuestionStats(question, answers) {
  const questionAnswers = answers.filter((entry) => entry.question_id === question.id)

  if (isLikertType(question.question_type)) {
    const scale = getLikertScaleFromType(question.question_type)
    const values = questionAnswers
      .map((entry) => Number(entry.answer_number))
      .filter((value) => !Number.isNaN(value))

    if (values.length === 0) {
      return { count: 0, average: null, distribution: {}, scale }
    }

    const total = values.reduce((sum, value) => sum + value, 0)
    const distribution = values.reduce((map, value) => {
      const label = `${value} · ${getLikertLabel(scale, value)}`
      map[label] = (map[label] ?? 0) + 1
      return map
    }, {})

    return {
      count: values.length,
      average: (total / values.length).toFixed(1),
      distribution,
      scale,
    }
  }

  if (question.question_type === 'yes_no') {
    const distribution = questionAnswers.reduce((map, entry) => {
      const key = entry.answer_text || 'Sin respuesta'
      map[key] = (map[key] ?? 0) + 1
      return map
    }, {})

    return {
      count: questionAnswers.length,
      distribution,
    }
  }

  return {
    count: questionAnswers.length,
    texts: questionAnswers.map((entry) => entry.answer_text).filter(Boolean),
  }
}
