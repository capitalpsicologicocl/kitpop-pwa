export const WORKSPACE_STATUSES = {
  draft: 'Borrador',
  open: 'Abierto',
  paused: 'Pausado',
  archived: 'Archivado',
}

export const WORKSPACE_SECTION_TYPES = {
  info: 'Instrucciones',
  text_short: 'Texto corto',
  text_long: 'Texto largo',
  single_choice: 'Alternativa única',
  multi_choice: 'Alternativas múltiples',
  boolean: 'Verdadero / Falso',
  likert: 'Escala Likert',
  table: 'Tabla',
}

export const WORKSPACE_SCOPES = {
  individual: 'Individual',
  group: 'Grupal',
}

export const WORKSPACE_PARTICIPANT_LIMIT = 50

export const SECTION_TYPE_OPTIONS = Object.entries(WORKSPACE_SECTION_TYPES).map(
  ([value, label]) => ({ value, label })
)

export function getWorkspaceStatusLabel(status) {
  return WORKSPACE_STATUSES[status] ?? status
}

export function getSectionTypeLabel(type) {
  return WORKSPACE_SECTION_TYPES[type] ?? type
}

export function getScopeLabel(scope) {
  return WORKSPACE_SCOPES[scope] ?? scope
}

export function buildDefaultSection(type, sortOrder = 0, scope = 'individual') {
  const base = {
    title: getSectionTypeLabel(type),
    section_type: type,
    scope,
    sort_order: sortOrder,
    is_required: type !== 'info',
    config: {},
  }

  switch (type) {
    case 'info':
      return { ...base, config: { content: 'Escribe aquí las instrucciones para los participantes.' } }
    case 'single_choice':
    case 'multi_choice':
      return {
        ...base,
        config: {
          options: [
            { id: 'opt1', label: 'Opción 1' },
            { id: 'opt2', label: 'Opción 2' },
          ],
        },
      }
    case 'likert':
      return { ...base, config: { scale: 5 } }
    case 'boolean':
      return { ...base, config: { true_label: 'Sí', false_label: 'No' } }
    case 'table':
      return {
        ...base,
        config: {
          columns: [
            { key: 'col1', label: 'Columna 1' },
            { key: 'col2', label: 'Columna 2' },
          ],
          row_mode: 'expandable',
          fixed_row_count: 3,
        },
      }
    default:
      return base
  }
}

export function isResponseSection(section) {
  return section?.section_type && section.section_type !== 'info'
}

export function computeParticipantCompletion(sections, responses, participant) {
  const answerable = (sections ?? []).filter(isResponseSection)
  if (answerable.length === 0) {
    return 100
  }

  let answered = 0

  for (const section of answerable) {
    const hasResponse = (responses ?? []).some((response) => {
      if (response.section_id !== section.id) {
        return false
      }

      if (section.scope === 'individual') {
        return response.participant_id === participant.id
      }

      return response.group_id === participant.group_id && participant.group_id
    })

    if (hasResponse) {
      answered += 1
    }
  }

  return Math.round((answered / answerable.length) * 100)
}

export function aggregateChoiceResponses(section, responses) {
  const options = section.config?.options ?? []
  const counts = Object.fromEntries(options.map((option) => [option.id, 0]))

  for (const response of responses) {
    if (response.section_id !== section.id) {
      continue
    }

    const value = response.value ?? {}

    if (section.section_type === 'single_choice' && value.choice) {
      counts[value.choice] = (counts[value.choice] ?? 0) + 1
    }

    if (section.section_type === 'multi_choice' && Array.isArray(value.choices)) {
      for (const choice of value.choices) {
        counts[choice] = (counts[choice] ?? 0) + 1
      }
    }
  }

  return options.map((option) => ({
    ...option,
    count: counts[option.id] ?? 0,
  }))
}

export function aggregateLikertResponses(section, responses) {
  const scale = section.config?.scale ?? 5
  const counts = Object.fromEntries(
    Array.from({ length: scale }, (_, index) => [index + 1, 0])
  )

  for (const response of responses) {
    if (response.section_id !== section.id) {
      continue
    }

    const score = Number(response.value?.score)

    if (score >= 1 && score <= scale) {
      counts[score] += 1
    }
  }

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
  const average =
    total === 0
      ? 0
      : Object.entries(counts).reduce(
          (sum, [score, count]) => sum + Number(score) * count,
          0
        ) / total

  return { counts, total, average: Math.round(average * 10) / 10 }
}

export function aggregateBooleanResponses(section, responses) {
  let yes = 0
  let no = 0

  for (const response of responses) {
    if (response.section_id !== section.id) {
      continue
    }

    if (response.value?.value === true) {
      yes += 1
    } else if (response.value?.value === false) {
      no += 1
    }
  }

  const total = yes + no
  return {
    yes,
    no,
    yesPct: total ? Math.round((yes / total) * 100) : 0,
  }
}

export function emptyTableRows(section) {
  const columns = section.config?.columns ?? []
  const emptyRow = Object.fromEntries(columns.map((column) => [column.key, '']))

  if (section.config?.row_mode === 'fixed') {
    const count = Math.max(1, Number(section.config?.fixed_row_count) || 3)
    return Array.from({ length: count }, () => ({ ...emptyRow }))
  }

  return [{ ...emptyRow }]
}

export function normalizeTableValue(section, value) {
  const rows = value?.rows

  if (Array.isArray(rows) && rows.length > 0) {
    return { rows }
  }

  return { rows: emptyTableRows(section) }
}

export function isWorkspaceSetupError(error) {
  const message = error?.message ?? ''
  return (
    message.includes('workspaces') ||
    message.includes('workspace_') ||
    error?.code === '42P01' ||
    error?.code === 'PGRST205'
  )
}
