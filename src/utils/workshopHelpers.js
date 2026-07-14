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
