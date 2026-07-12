export const PAUSE_OPTIONS = [
  { type: 'coffee', label: 'Coffee break', defaultMinutes: 15, title: 'Coffee break' },
  { type: 'lunch', label: 'Almuerzo', defaultMinutes: 60, title: 'Almuerzo' },
  { type: 'break', label: 'Solo pausa', defaultMinutes: 10, title: 'Pausa' },
]

export const ITEM_TYPE_LABELS = {
  theory: 'Teoría',
  activity: 'Actividad KitPOP',
  custom: 'Diseño propio',
  pause: 'Pausa',
}

export function getPauseLabel(pauseType) {
  return PAUSE_OPTIONS.find((option) => option.type === pauseType)?.label ?? 'Pausa'
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
