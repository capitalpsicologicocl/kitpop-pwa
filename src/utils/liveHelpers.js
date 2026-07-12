export const LIVE_POLL_TYPES = [
  { value: 'single_choice', label: 'Opción múltiple' },
  { value: 'yes_no', label: 'Sí / No' },
]

export function getLiveStatusLabel(status) {
  if (status === 'live') {
    return 'En vivo'
  }

  if (status === 'paused') {
    return 'Pausada'
  }

  if (status === 'closed') {
    return 'Finalizada'
  }

  return 'Borrador'
}

export function getPollStatusLabel(status) {
  if (status === 'open') {
    return 'Abierto · recibiendo votos'
  }

  if (status === 'closed') {
    return 'Cerrado'
  }

  return 'Listo'
}

export function getParticipantToken(sessionId) {
  const key = `kitpop-live-token-${sessionId}`
  let token = localStorage.getItem(key)

  if (!token) {
    token =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `live-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(key, token)
  }

  return token
}

export function normalizePollOptions(options) {
  if (Array.isArray(options)) {
    return options.filter(Boolean)
  }

  return []
}

export function buildDefaultLivePoll(sortOrder = 0) {
  return {
    pollType: 'single_choice',
    prompt: '¿Qué opción prefieres?',
    sortOrder,
    options: ['Opción A', 'Opción B', 'Opción C'],
  }
}

export function getPollChoices(poll) {
  if (poll.poll_type === 'yes_no') {
    return ['Sí', 'No']
  }

  const options = normalizePollOptions(poll.options)

  return options.length > 0 ? options : ['Opción 1', 'Opción 2']
}

export function computePollResults(poll, votes) {
  const pollVotes = votes.filter((vote) => vote.poll_id === poll.id)
  const choices = getPollChoices(poll)
  const distribution = Object.fromEntries(choices.map((choice) => [choice, 0]))

  pollVotes.forEach((vote) => {
    if (distribution[vote.answer_text] !== undefined) {
      distribution[vote.answer_text] += 1
    } else {
      distribution[vote.answer_text] = (distribution[vote.answer_text] ?? 0) + 1
    }
  })

  const total = pollVotes.length

  return {
    total,
    distribution,
    percentages: Object.fromEntries(
      Object.entries(distribution).map(([label, count]) => [
        label,
        total > 0 ? Math.round((count / total) * 100) : 0,
      ])
    ),
  }
}
