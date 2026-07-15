export const PAUSE_OPTIONS = [
  { type: 'coffee', label: 'Coffee break', defaultMinutes: 15, title: 'Coffee break' },
  { type: 'lunch', label: 'Almuerzo', defaultMinutes: 60, title: 'Almuerzo' },
  { type: 'break', label: 'Solo pausa', defaultMinutes: 10, title: 'Pausa' },
]

export const WORKSHOP_OPENING_MARKER = '__workshop_opening__'

export const WORKSHOP_OPENING_ITEM = {
  timeMinutes: 20,
  itemType: 'custom',
  title: 'Bienvenida y Encuadre',
  description:
    'Presentación de facilitador(es), presentación del programa, objetivos de la capacitación, metodología de trabajo y acuerdos iniciales de participación.',
  activitySlug: WORKSHOP_OPENING_MARKER,
}

export const ITEM_TYPE_LABELS = {
  theory: 'Teoría',
  activity: 'Actividad KitPOP',
  custom: 'Diseño propio',
  pause: 'Pausa',
}

export function getPauseLabel(pauseType) {
  return PAUSE_OPTIONS.find((option) => option.type === pauseType)?.label ?? 'Pausa'
}

export function isWorkshopOpeningItem(item) {
  return item?.activity_slug === WORKSHOP_OPENING_MARKER
}

export function getNextWorkshopItemSortOrder(session) {
  const items = session?.workshop_items ?? []

  if (items.length === 0) {
    return 0
  }

  return Math.max(...items.map((item) => item.sort_order ?? 0)) + 1
}

export function getSessionPlannedMinutes(session) {
  return (session.duration_hours ?? 0) * 60 + (session.duration_minutes ?? 0)
}

export function getSessionDesignedMinutes(session) {
  return (session.workshop_items ?? []).reduce(
    (total, item) => total + (item.time_minutes ?? 0),
    0
  )
}

export function getWorkshopTimeSummary(sessions) {
  const perSession = sessions.map((session) => {
    const planned = getSessionPlannedMinutes(session)
    const designed = getSessionDesignedMinutes(session)

    return {
      sessionNumber: session.session_number,
      planned,
      designed,
      delta: designed - planned,
    }
  })

  const totalPlanned = perSession.reduce((sum, entry) => sum + entry.planned, 0)
  const totalDesigned = perSession.reduce((sum, entry) => sum + entry.designed, 0)

  return {
    perSession,
    totalPlanned,
    totalDesigned,
    totalDelta: totalDesigned - totalPlanned,
  }
}

export function getWorkshopStatusLabel(status) {
  if (status === 'ready') {
    return 'Estructura lista'
  }

  if (status === 'published') {
    return 'Publicado'
  }

  if (status === 'archived') {
    return 'Archivado'
  }

  return 'Borrador'
}

export function formatWorkshopDate(iso) {
  if (!iso) {
    return ''
  }

  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatExtractedObjective(extracted) {
  const parts = []

  if (extracted.objective) {
    parts.push(extracted.objective.trim())
  }

  if (extracted.contentOutline?.length) {
    parts.push('\n\n--- Contenidos por módulo ---\n')

    for (const module of extracted.contentOutline) {
      const lines = []

      if (module.title) {
        lines.push(`Módulo ${module.moduleNumber}: ${module.title}`)
      }

      if (module.objectives) {
        lines.push(`Objetivos: ${module.objectives}`)
      }

      if (module.contents) {
        lines.push(`Contenidos: ${module.contents}`)
      }

      if (module.durationMinutes) {
        lines.push(`Duración sugerida: ${module.durationMinutes} min`)
      }

      if (lines.length) {
        parts.push(lines.join('\n'))
      }
    }
  }

  if (extracted.modulesSummary) {
    parts.push(`\n\n--- Resumen del programa ---\n${extracted.modulesSummary.trim()}`)
  }

  return parts.join('\n').trim()
}

function normalizeObjectiveText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\s+(?=---\s*Contenidos por módulo\s*---)/gi, '\n\n')
    .replace(/\s+(?=---\s*Resumen del programa\s*---)/gi, '\n\n')
    .replace(/\s+(?=Módulo\s+\d+\s*[:：])/gi, '\n\n')
    .replace(/([^\n])\s+(?=Objetivos?\s*[:：])/gi, '$1\n')
    .replace(/([^\n])\s+(?=Contenidos?\s*[:：])/gi, '$1\n')
    .replace(/([^\n])\s+(?=Duración\s+sugerida\s*[:：])/gi, '$1\n')
    .trim()
}

const MODULE_HEADER_PATTERN = /(?:^|\n)\s*Módulo\s+(\d+)\s*[:：]\s*/im
const OBJECTIVES_PATTERN =
  /(?:^|\n)\s*Objetivos?\s*[:：]\s*([\s\S]*?)(?=(?:\n\s*Contenidos?\s*[:：]|\n\s*Duración\s+sugerida\s*[:：]|$))/im
const CONTENTS_PATTERN =
  /(?:^|\n)\s*Contenidos?\s*[:：]\s*([\s\S]*?)(?=(?:\n\s*Duración\s+sugerida\s*[:：]|$))/im
const DURATION_PATTERN = /(?:^|\n)\s*Duración\s+sugerida\s*[:：]\s*(\d+)/im

function parseModuleBlock(chunk) {
  const headerMatch = chunk.match(/^\s*Módulo\s+(\d+)\s*[:：]\s*(.+?)(?:\n|$)/im)

  if (!headerMatch) {
    return null
  }

  const moduleNumber = Number(headerMatch[1])
  const title = headerMatch[2].trim()
  const rest = chunk.slice(headerMatch[0].length)

  const objectivesMatch = rest.match(OBJECTIVES_PATTERN)
  const contentsMatch = rest.match(CONTENTS_PATTERN)
  const durationMatch = rest.match(DURATION_PATTERN)

  let objectives = objectivesMatch?.[1]?.trim() ?? ''
  let contents = contentsMatch?.[1]?.trim() ?? ''

  if (!objectives && !contents) {
    contents = rest.trim()
  }

  return {
    moduleNumber,
    title,
    objectives,
    contents,
    durationMinutes: durationMatch ? Number(durationMatch[1]) : null,
  }
}

function parseModuleBlocks(modulesText) {
  if (!modulesText?.trim()) {
    return []
  }

  return modulesText
    .split(/(?=(?:^|\n)\s*Módulo\s+\d+\s*[:：])/im)
    .map((chunk) => parseModuleBlock(chunk))
    .filter(Boolean)
}

/**
 * Separa el campo `objective` mezclado (descripción + módulos + resumen) en bloques legibles.
 */
export function parseWorkshopObjectiveText(raw) {
  if (!raw?.trim()) {
    return null
  }

  let text = normalizeObjectiveText(raw.trim())
  let programSummary = ''

  const summarySplit = text.split(/\n*---\s*Resumen del programa\s*---\n*/i)

  if (summarySplit.length > 1) {
    text = summarySplit[0].trim()
    programSummary = summarySplit.slice(1).join('\n').trim()
  }

  let generalDescription = text
  let modulesText = ''

  const contentSplit = text.split(/\n*---\s*Contenidos por módulo\s*---\n*/i)

  if (contentSplit.length > 1) {
    generalDescription = contentSplit[0].trim()
    modulesText = contentSplit.slice(1).join('\n').trim()
  } else {
    const moduleStart = text.search(MODULE_HEADER_PATTERN)

    if (moduleStart >= 0) {
      generalDescription = text.slice(0, moduleStart).trim()
      modulesText = text.slice(moduleStart).trim()
    }
  }

  const modules = parseModuleBlocks(modulesText)

  return {
    generalDescription,
    programSummary,
    modules,
    hasStructure: modules.length > 0 || Boolean(programSummary),
  }
}
