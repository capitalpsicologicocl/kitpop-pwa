import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import ActivityPicker from '../../components/workshop/ActivityPicker'
import DurationSelect from '../../components/workshop/DurationSelect'
import PausePicker from '../../components/workshop/PausePicker'
import WorkshopDocumentImport from '../../components/workshop/WorkshopDocumentImport'
import AiProgressPanel, { WORKSHOP_GENERATE_STEPS } from '../../components/workshop/AiProgressPanel'
import WorkshopSessionTable from '../../components/workshop/WorkshopSessionTable'
import { ListPageSkeleton } from '../../components/ui/Skeleton'
import WorkshopTimeSummary from '../../components/workshop/WorkshopTimeSummary'
import { useAuth } from '../../context/AuthContext'
import { generateWorkshopProposal } from '../../services/aiWorkshopService'
import {
  createWorkshopItem,
  deleteWorkshopItem,
  ensureWorkshopOpeningItems,
  applyAiWorkshopProposal,
  fetchWorkshopById,
  fetchWorkshopSessions,
  finalizeWorkshopStructure,
  formatSessionDuration,
  reorderWorkshopItems,
  syncWorkshopSessionCount,
  updateWorkshop,
  updateWorkshopItem,
  updateWorkshopSession,
} from '../../services/workshopService'
import {
  formatExtractedObjective,
  getNextWorkshopItemSortOrder,
  isWorkshopOpeningItem,
} from '../../utils/workshopHelpers'
import {
  canUseAiGeneration,
  formatAiLimitLabel,
  getAiGenerationRemaining,
  getUserPlan,
} from '../../utils/planLimits'

const MAX_SESSIONS = 12

function mapWorkshopToForm(workshop) {
  return {
    title: workshop.title ?? '',
    organization: workshop.organization ?? '',
    team: workshop.team ?? '',
    audience: workshop.audience ?? '',
    modality: workshop.modality ?? 'Presencial',
    objective: workshop.objective ?? '',
    participantsCount: workshop.participants_count ?? '',
    sessionCount: workshop.session_count ?? 1,
  }
}

export default function WorkshopEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, refreshProfile, loading: authLoading } = useAuth()

  const [workshop, setWorkshop] = useState(null)
  const [sessions, setSessions] = useState([])
  const [form, setForm] = useState(null)
  const [workshopJournal, setWorkshopJournal] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingMeta, setSavingMeta] = useState(false)
  const [syncingSessions, setSyncingSessions] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [picker, setPicker] = useState(null)
  const [pausePickerSessionId, setPausePickerSessionId] = useState('')
  const [generatingAi, setGeneratingAi] = useState(false)
  const [aiProgressStep, setAiProgressStep] = useState(0)
  const [aiPreview, setAiPreview] = useState(null)
  const [useKitpopActivities, setUseKitpopActivities] = useState(true)
  const [includeTheoryModules, setIncludeTheoryModules] = useState(true)
  const aiPanelRef = useRef(null)
  const journalTimersRef = useRef({})
  const workshopJournalTimerRef = useRef(null)

  const loadWorkshop = useCallback(async () => {
    if (!user || !id) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const [workshopData, sessionData] = await Promise.all([
        fetchWorkshopById(user.id, id),
        fetchWorkshopSessions(user.id, id),
      ])

      if (!workshopData) {
        setError('No encontramos este taller.')
        setWorkshop(null)
        return
      }

      setWorkshop(workshopData)
      setForm(mapWorkshopToForm(workshopData))
      setWorkshopJournal(workshopData.journal_notes ?? '')

      if (
        (workshopData.session_count ?? 1) > 0 &&
        sessionData.length === 0
      ) {
        const synced = await syncWorkshopSessionCount(
          user.id,
          id,
          workshopData.session_count ?? 1
        )
        setSessions(synced)
      } else {
        const withOpening = await ensureWorkshopOpeningItems(user.id, id)
        setSessions(withOpening)
      }
    } catch (loadError) {
      setError(loadError.message || 'No se pudo cargar el taller.')
    } finally {
      setLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user) {
      setLoading(false)
      return
    }

    loadWorkshop()
  }, [authLoading, loadWorkshop, user])

  function updateSessionInState(sessionId, patch) {
    setSessions((current) =>
      current.map((session) =>
        session.id === sessionId ? { ...session, ...patch } : session
      )
    )
  }

  function updateItemInState(sessionId, itemId, patch) {
    setSessions((current) =>
      current.map((session) => {
        if (session.id !== sessionId) {
          return session
        }

        return {
          ...session,
          workshop_items: session.workshop_items.map((item) =>
            item.id === itemId ? { ...item, ...patch } : item
          ),
        }
      })
    )
  }

  function removeItemFromState(sessionId, itemId) {
    setSessions((current) =>
      current.map((session) => {
        if (session.id !== sessionId) {
          return session
        }

        return {
          ...session,
          workshop_items: session.workshop_items.filter((item) => item.id !== itemId),
        }
      })
    )
  }

  function appendItemToState(sessionId, item) {
    setSessions((current) =>
      current.map((session) => {
        if (session.id !== sessionId) {
          return session
        }

        return {
          ...session,
          workshop_items: [...session.workshop_items, item],
        }
      })
    )
  }

  async function handleSaveMeta(event) {
    event.preventDefault()

    if (!user || !workshop || !form) {
      return
    }

    setSavingMeta(true)
    setMessage('')
    setError('')

    try {
      const updated = await updateWorkshop(user.id, workshop.id, {
        title: form.title.trim(),
        organization: form.organization.trim(),
        team: form.team.trim(),
        audience: form.audience.trim(),
        modality: form.modality,
        objective: form.objective.trim(),
        participantsCount: form.participantsCount
          ? Number(form.participantsCount)
          : null,
        sessionCount: Number(form.sessionCount) || 1,
        status: workshop.status ?? 'draft',
      })

      setWorkshop(updated)
      setMessage('Datos del taller guardados.')
    } catch (saveError) {
      setError(saveError.message || 'No se pudieron guardar los datos.')
    } finally {
      setSavingMeta(false)
    }
  }

  async function handleSyncSessions() {
    if (!user || !workshop || !form) {
      return
    }

    const desiredCount = Math.min(
      MAX_SESSIONS,
      Math.max(1, Number(form.sessionCount) || 1)
    )

    if (
      desiredCount < sessions.length &&
      !window.confirm(
        'Reducir sesiones eliminará el contenido de las sesiones que queden fuera. ¿Continuar?'
      )
    ) {
      return
    }

    setSyncingSessions(true)
    setMessage('')
    setError('')

    try {
      const nextSessions = await syncWorkshopSessionCount(
        user.id,
        workshop.id,
        desiredCount
      )

      setSessions(nextSessions)
      setForm((current) => ({ ...current, sessionCount: desiredCount }))
      setWorkshop((current) => ({ ...current, session_count: desiredCount }))
      setMessage(
        nextSessions.length === desiredCount
          ? 'Sesiones actualizadas.'
          : 'No hubo cambios en las sesiones.'
      )
    } catch (syncError) {
      setError(syncError.message || 'No se pudieron actualizar las sesiones.')
    } finally {
      setSyncingSessions(false)
    }
  }

  async function handleSessionDurationChange(session, nextDuration) {
    if (!user) {
      return
    }

    updateSessionInState(session.id, {
      duration_hours: nextDuration.hours,
      duration_minutes: nextDuration.minutes,
    })

    try {
      await updateWorkshopSession(user.id, session.id, {
        durationHours: nextDuration.hours,
        durationMinutes: nextDuration.minutes,
      })
    } catch (durationError) {
      setError(durationError.message || 'No se pudo guardar el tiempo de sesión.')
    }
  }

  async function handleJournalChange(session, notes) {
    if (!user) {
      return
    }

    updateSessionInState(session.id, { journal_notes: notes })

    clearTimeout(journalTimersRef.current[session.id])

    journalTimersRef.current[session.id] = setTimeout(async () => {
      try {
        await updateWorkshopSession(user.id, session.id, {
          journalNotes: notes,
        })
      } catch (journalError) {
        setError(journalError.message || 'No se pudo guardar la bitácora.')
      }
    }, 600)
  }

  useEffect(
    () => () => {
      Object.values(journalTimersRef.current).forEach(clearTimeout)
      clearTimeout(workshopJournalTimerRef.current)
    },
    []
  )

  async function handleAddTheory(sessionId) {
    if (!user) {
      return
    }

    const session = sessions.find((entry) => entry.id === sessionId)

    if (!session) {
      return
    }

    try {
      const item = await createWorkshopItem(user.id, sessionId, {
        sortOrder: getNextWorkshopItemSortOrder(session),
        timeMinutes: 15,
        itemType: 'theory',
        title: 'Contenido teórico',
        description: '',
      })

      appendItemToState(sessionId, item)
    } catch (createError) {
      setError(createError.message || 'No se pudo agregar el módulo teórico.')
    }
  }

  function handleAddActivity(sessionId) {
    setPicker({ mode: 'add', sessionId })
  }

  async function handleAddCustom(sessionId) {
    if (!user) {
      return
    }

    const session = sessions.find((entry) => entry.id === sessionId)

    if (!session) {
      return
    }

    try {
      const item = await createWorkshopItem(user.id, sessionId, {
        sortOrder: getNextWorkshopItemSortOrder(session),
        timeMinutes: 20,
        itemType: 'custom',
        title: 'Actividad de diseño propio',
        description: '',
      })

      appendItemToState(sessionId, item)
    } catch (createError) {
      setError(createError.message || 'No se pudo agregar la actividad propia.')
    }
  }

  function handleAddPause(sessionId) {
    setPausePickerSessionId(sessionId)
  }

  async function handlePauseSelected(option) {
    if (!user || !pausePickerSessionId) {
      return
    }

    const sessionId = pausePickerSessionId
    setPausePickerSessionId('')

    const session = sessions.find((entry) => entry.id === sessionId)

    if (!session) {
      return
    }

    try {
      const item = await createWorkshopItem(user.id, sessionId, {
        sortOrder: getNextWorkshopItemSortOrder(session),
        timeMinutes: option.minutes,
        itemType: 'pause',
        title: option.title,
        description: '',
        pauseType: option.type,
      })

      appendItemToState(sessionId, item)
    } catch (createError) {
      setError(createError.message || 'No se pudo agregar la pausa.')
    }
  }

  async function handleApplyExtracted(extracted) {
    if (!user || !workshop || !form) {
      return
    }

    const sessionCount = Math.min(
      MAX_SESSIONS,
      Math.max(1, Number(extracted.sessionCount) || 1)
    )

    const nextForm = {
      title: extracted.title || form.title,
      organization: extracted.organization || form.organization,
      team: extracted.team || form.team,
      audience: extracted.audience || form.audience,
      modality: extracted.modality || form.modality,
      objective: formatExtractedObjective(extracted) || form.objective,
      participantsCount:
        extracted.participantsCount != null
          ? extracted.participantsCount
          : form.participantsCount,
      sessionCount,
    }

    setForm(nextForm)

    const updated = await updateWorkshop(user.id, workshop.id, {
      title: nextForm.title.trim(),
      organization: nextForm.organization.trim(),
      team: nextForm.team.trim(),
      audience: nextForm.audience.trim(),
      modality: nextForm.modality,
      objective: nextForm.objective.trim(),
      participantsCount: nextForm.participantsCount
        ? Number(nextForm.participantsCount)
        : null,
      sessionCount,
      status: workshop.status ?? 'draft',
    })

    setWorkshop(updated)

    const nextSessions = await syncWorkshopSessionCount(user.id, workshop.id, sessionCount)

    for (const sessionData of extracted.sessions ?? []) {
      const session = nextSessions.find(
        (entry) => entry.session_number === sessionData.sessionNumber
      )

      if (!session) {
        continue
      }

      await updateWorkshopSession(user.id, session.id, {
        durationHours: sessionData.durationHours ?? session.duration_hours ?? 2,
        durationMinutes: sessionData.durationMinutes ?? session.duration_minutes ?? 0,
      })
    }

    await loadWorkshop()
    setMessage('Documento aplicado al taller. Revisa los datos y genera la propuesta con IA.')
  }

  async function handleGenerateAi() {
    if (!user || !workshop) {
      return
    }

    if (sessions.length === 0) {
      setError('Define al menos una sesión antes de generar con IA.')
      return
    }

    if (!form?.objective?.trim()) {
      setError('Completa el objetivo del taller antes de generar con IA.')
      return
    }

    const hasDesignedItems = sessions.some((session) =>
      (session.workshop_items ?? []).some((item) => !isWorkshopOpeningItem(item))
    )

    if (hasDesignedItems) {
      const confirmed = window.confirm(
        'La IA reemplazará las actividades actuales de cada sesión (se conserva la bienvenida y encuadre). ¿Continuar?'
      )

      if (!confirmed) {
        return
      }
    }

    setGeneratingAi(true)
    setAiProgressStep(0)
    setError('')
    setMessage('')

    try {
      await updateWorkshop(user.id, workshop.id, {
        title: form.title.trim(),
        organization: form.organization.trim(),
        team: form.team.trim(),
        audience: form.audience.trim(),
        modality: form.modality,
        objective: form.objective.trim(),
        participantsCount: form.participantsCount
          ? Number(form.participantsCount)
          : null,
        sessionCount: Number(form.sessionCount) || 1,
        status: workshop.status ?? 'draft',
      })

      setAiProgressStep(1)

      const payload = await generateWorkshopProposal(workshop.id, {
        useKitpopActivities,
        includeTheoryModules,
      })

      setAiProgressStep(2)
      setAiPreview(payload.proposal)
      setMessage('Propuesta generada. Revisa el resumen abajo y aplícala al taller.')
      await refreshProfile(user.id)
      aiPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (generateError) {
      setError(generateError.message || 'No se pudo generar la propuesta con IA.')
      aiPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } finally {
      setGeneratingAi(false)
      setAiProgressStep(0)
    }
  }

  async function handleApplyAiPreview() {
    if (!user || !workshop || !aiPreview) {
      return
    }

    setGeneratingAi(true)
    setError('')
    setMessage('')

    try {
      const nextSessions = await applyAiWorkshopProposal(user.id, workshop.id, aiPreview)
      setSessions(nextSessions)
      setAiPreview(null)
      setMessage('Propuesta de IA aplicada al taller.')
    } catch (applyError) {
      setError(applyError.message || 'No se pudo aplicar la propuesta de IA.')
    } finally {
      setGeneratingAi(false)
    }
  }

  async function handleMoveItem(sessionId, itemId, direction) {
    if (!user) {
      return
    }

    const session = sessions.find((entry) => entry.id === sessionId)

    if (!session) {
      return
    }

    const items = session.workshop_items ?? []
    const index = items.findIndex((item) => item.id === itemId)

    if (index === -1) {
      return
    }

    const targetIndex = index + direction

    if (targetIndex < 0 || targetIndex >= items.length) {
      return
    }

    if (isWorkshopOpeningItem(items[index]) || isWorkshopOpeningItem(items[targetIndex])) {
      return
    }

    const reordered = [...items]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    updateSessionInState(sessionId, { workshop_items: reordered })

    try {
      await reorderWorkshopItems(
        user.id,
        reordered.map((item) => item.id)
      )
    } catch (moveError) {
      setError(moveError.message || 'No se pudo reordenar.')
      loadWorkshop()
    }
  }

  function handleWorkshopJournalChange(notes) {
    if (!user || !workshop) {
      return
    }

    setWorkshopJournal(notes)
    clearTimeout(workshopJournalTimerRef.current)

    workshopJournalTimerRef.current = setTimeout(async () => {
      try {
        await updateWorkshop(user.id, workshop.id, {
          title: form.title.trim(),
          organization: form.organization.trim(),
          team: form.team.trim(),
          audience: form.audience.trim(),
          modality: form.modality,
          objective: form.objective.trim(),
          participantsCount: form.participantsCount ? Number(form.participantsCount) : null,
          sessionCount: Number(form.sessionCount) || 1,
          status: workshop.status ?? 'draft',
          journalNotes: notes,
        })
      } catch (journalError) {
        setError(journalError.message || 'No se pudo guardar la bitácora general.')
      }
    }, 600)
  }

  async function handleFinalizeStructure() {
    if (!user || !workshop) {
      return
    }

    if (sessions.length === 0) {
      setError('Define al menos una sesión antes de finalizar la estructura.')
      return
    }

    setFinalizing(true)
    setError('')
    setMessage('')

    try {
      const updated = await finalizeWorkshopStructure(user.id, workshop.id)
      setWorkshop(updated)
      navigate(`/talleres/${workshop.id}/resumen`)
    } catch (finalizeError) {
      setError(finalizeError.message || 'No se pudo finalizar la estructura.')
    } finally {
      setFinalizing(false)
    }
  }

  function handleSwapActivity(sessionId, itemId) {
    setPicker({ mode: 'swap', sessionId, itemId })
  }

  async function handleActivitySelected(activity) {
    if (!user || !picker) {
      return
    }

    const { mode, sessionId, itemId } = picker
    setPicker(null)

    try {
      if (mode === 'add') {
        const session = sessions.find((entry) => entry.id === sessionId)

        const item = await createWorkshopItem(user.id, sessionId, {
          sortOrder: getNextWorkshopItemSortOrder(session),
          timeMinutes: 30,
          itemType: 'activity',
          title: activity.title,
          description: activity.description,
          activitySlug: activity.slug,
        })

        appendItemToState(sessionId, item)
        return
      }

      const updated = await updateWorkshopItem(user.id, itemId, {
        itemType: 'activity',
        title: activity.title,
        description: activity.description,
        activitySlug: activity.slug,
      })

      updateItemInState(sessionId, itemId, updated)
    } catch (pickerError) {
      setError(pickerError.message || 'No se pudo asignar la actividad.')
    }
  }

  async function handleUpdateItem(sessionId, itemId, patch) {
    if (!user) {
      return
    }

    const dbPatch = {}

    if (patch.timeMinutes !== undefined) {
      dbPatch.timeMinutes = patch.timeMinutes
    }

    if (patch.title !== undefined) {
      dbPatch.title = patch.title
    }

    if (patch.description !== undefined) {
      dbPatch.description = patch.description
    }

    updateItemInState(sessionId, itemId, {
      ...(patch.timeMinutes !== undefined ? { time_minutes: patch.timeMinutes } : {}),
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.description !== undefined ? { description: patch.description } : {}),
    })

    try {
      await updateWorkshopItem(user.id, itemId, dbPatch)
    } catch (updateError) {
      setError(updateError.message || 'No se pudo actualizar la fila.')
    }
  }

  async function handleDeleteItem(sessionId, itemId) {
    if (!user) {
      return
    }

    removeItemFromState(sessionId, itemId)

    try {
      await deleteWorkshopItem(user.id, itemId)
    } catch (deleteError) {
      setError(deleteError.message || 'No se pudo quitar el ítem.')
      loadWorkshop()
    }
  }

  if (authLoading || loading) {
    return (
      <main id="interactive-view" className="fade-in workshop-editor-loading">
        <ListPageSkeleton rows={3} showForm />
      </main>
    )
  }

  if (!user) {
    return (
      <main id="interactive-view" className="fade-in">
        <Link to="/login" className="back-btn">
          ← Iniciar sesión
        </Link>
      </main>
    )
  }

  if (!workshop || !form) {
    return (
      <main id="interactive-view" className="fade-in">
        <Link to="/talleres" className="back-btn">
          ← Talleres
        </Link>
        <div className="auth-message error">{error || 'Taller no encontrado.'}</div>
      </main>
    )
  }

  const aiRemaining = getAiGenerationRemaining(profile)
  const aiLimitLabel = formatAiLimitLabel(getUserPlan(profile))
  const canUseAi = canUseAiGeneration(profile)

  return (
    <main id="interactive-view" className="fade-in workshop-editor">
      <Link to="/talleres" className="back-btn">
        ← Talleres
      </Link>

      <div className="page-head">
        <p className="workshop-editor-kicker">Diseño de talleres / reuniones</p>
        <h1 className="cv-title">{workshop.title}</h1>
        <p className="cv-desc">
          Diseña sesiones con tabla Tiempo · Actividad · Descripción y bitácora por sesión.
        </p>
        {workshop.status === 'ready' && (
          <Link to={`/talleres/${workshop.id}/resumen`} className="workshop-view-summary-link">
            Ver estructura finalizada →
          </Link>
        )}
      </div>

      {message && <div className="auth-message success">{message}</div>}
      {error && <div className="auth-message error">{error}</div>}

      <WorkshopDocumentImport
        useKitpopActivities={useKitpopActivities}
        onUseKitpopChange={setUseKitpopActivities}
        includeTheoryModules={includeTheoryModules}
        onIncludeTheoryChange={setIncludeTheoryModules}
        onApplyExtracted={handleApplyExtracted}
        disabled={savingMeta || syncingSessions || generatingAi}
      />

      <form className="auth-panel interactive-form workshop-meta-form" onSubmit={handleSaveMeta}>
        <h3>Datos del taller</h3>

        <div className="form-grid">
          <div className="field full">
            <label htmlFor="editor-title">Nombre del taller</label>
            <input
              id="editor-title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="editor-org">Organización</label>
            <input
              id="editor-org"
              value={form.organization}
              onChange={(event) => setForm({ ...form, organization: event.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="editor-team">Equipo / área</label>
            <input
              id="editor-team"
              value={form.team}
              onChange={(event) => setForm({ ...form, team: event.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="editor-audience">Público objetivo</label>
            <input
              id="editor-audience"
              value={form.audience}
              onChange={(event) => setForm({ ...form, audience: event.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="editor-modality">Modalidad</label>
            <select
              id="editor-modality"
              value={form.modality}
              onChange={(event) => setForm({ ...form, modality: event.target.value })}
            >
              <option value="Presencial">Presencial</option>
              <option value="Online">Online</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="editor-participants">Participantes</label>
            <input
              id="editor-participants"
              type="number"
              min="1"
              value={form.participantsCount}
              onChange={(event) =>
                setForm({ ...form, participantsCount: event.target.value })
              }
            />
          </div>

          <div className="field full">
            <label htmlFor="editor-objective">Objetivo y contenidos</label>
            <textarea
              id="editor-objective"
              rows={10}
              value={form.objective}
              onChange={(event) => setForm({ ...form, objective: event.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={savingMeta}>
          {savingMeta ? 'Guardando...' : 'Guardar datos'}
        </button>
      </form>

      <section ref={aiPanelRef} className="auth-panel workshop-ai-panel">
        <div className="workshop-ai-head">
          <div>
            <h3>Diseño con IA</h3>
            <p className="workshop-section-copy">
              {includeTheoryModules
                ? useKitpopActivities
                  ? 'Genera módulos teóricos (máx. 30 min) alternados con actividades KitPOP según el objetivo del taller.'
                  : 'Genera módulos teóricos (máx. 30 min) alternados con actividades propias según el objetivo del taller.'
                : useKitpopActivities
                  ? 'Genera una propuesta con actividades prácticas del banco KitPOP según el objetivo del taller.'
                  : 'Genera una propuesta con actividades prácticas propias según el objetivo del taller.'}
            </p>
          </div>
          <div className="workshop-ai-quota">
            <strong>{aiLimitLabel}</strong>
            {Number.isFinite(aiRemaining) && (
              <span>
                {aiRemaining} disponible{aiRemaining === 1 ? '' : 's'} ahora
              </span>
            )}
          </div>
        </div>

        <div className="workshop-ai-actions">
          <button
            type="button"
            className="btn-primary"
            disabled={generatingAi || !canUseAi || sessions.length === 0}
            onClick={handleGenerateAi}
          >
            {generatingAi ? 'Generando...' : 'Generar propuesta con IA'}
          </button>

          {!canUseAi && (
            <Link to="/perfil" className="workshop-ai-upgrade">
              Ver planes →
            </Link>
          )}
        </div>

        {generatingAi && (
          <AiProgressPanel
            steps={WORKSHOP_GENERATE_STEPS}
            activeStep={aiProgressStep}
            title="Generando propuesta de taller"
          />
        )}

        {aiPreview && (
          <div className="workshop-ai-preview">
            {aiPreview.rationale && (
              <p className="workshop-ai-rationale">{aiPreview.rationale}</p>
            )}

            {aiPreview.sessions?.map((session) => (
              <div key={session.sessionNumber} className="workshop-ai-preview-session">
                <h4>Sesión {session.sessionNumber}</h4>
                {session.narrative && (
                  <p className="interactive-item-meta">{session.narrative}</p>
                )}
                <ul>
                  {session.items?.map((item, index) => (
                    <li key={`${session.sessionNumber}-${index}`}>
                      <strong>{item.timeMinutes} min</strong> · {item.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="workshop-ai-preview-actions">
              <button
                type="button"
                className="timer-btn timer-btn-secondary"
                disabled={generatingAi}
                onClick={() => setAiPreview(null)}
              >
                Descartar
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={generatingAi}
                onClick={handleApplyAiPreview}
              >
                {generatingAi ? 'Aplicando...' : 'Aplicar al taller'}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="auth-panel workshop-sessions-setup">
        <h3>Sesiones</h3>
        <p className="workshop-section-copy">
          Indica cuántas sesiones tendrá el taller y el tiempo de cada una.
        </p>

        <div className="workshop-session-count-row">
          <div className="field">
            <label htmlFor="editor-session-count">Número de sesiones</label>
            <input
              id="editor-session-count"
              type="number"
              min="1"
              max={MAX_SESSIONS}
              value={form.sessionCount}
              onChange={(event) =>
                setForm({ ...form, sessionCount: event.target.value })
              }
            />
          </div>

          <button
            type="button"
            className="timer-btn timer-btn-secondary"
            disabled={syncingSessions}
            onClick={handleSyncSessions}
          >
            {syncingSessions ? 'Actualizando...' : 'Aplicar sesiones'}
          </button>
        </div>

        {sessions.length === 0 ? (
          <p className="interactive-item-meta">
            Aún no hay sesiones. Define la cantidad y pulsa «Aplicar sesiones».
          </p>
        ) : (
          <div className="workshop-session-durations">
            {sessions.map((session) => (
              <div key={session.id} className="workshop-session-duration-card">
                <strong>Sesión {session.session_number}</strong>
                <span className="interactive-item-meta">Tiempo de sesión</span>
                <DurationSelect
                  idPrefix={`session-${session.session_number}`}
                  hours={session.duration_hours ?? 0}
                  minutes={session.duration_minutes ?? 0}
                  onChange={(nextDuration) =>
                    handleSessionDurationChange(session, nextDuration)
                  }
                />
                <small>{formatSessionDuration(session.duration_hours, session.duration_minutes)}</small>
              </div>
            ))}
          </div>
        )}
      </section>

      <WorkshopTimeSummary sessions={sessions} />

      {sessions.map((session) => (
        <section key={session.id} className="auth-panel workshop-session-panel">
          <div className="workshop-session-head">
            <div>
              <h3>Sesión {session.session_number}</h3>
              <p className="interactive-item-meta">
                {formatSessionDuration(session.duration_hours, session.duration_minutes)}
              </p>
            </div>
          </div>

          <WorkshopSessionTable
            session={session}
            onAddTheory={() => handleAddTheory(session.id)}
            onAddActivity={() => handleAddActivity(session.id)}
            onAddCustom={() => handleAddCustom(session.id)}
            onAddPause={() => handleAddPause(session.id)}
            onSwapActivity={(itemId) => handleSwapActivity(session.id, itemId)}
            onUpdateItem={(itemId, patch) => handleUpdateItem(session.id, itemId, patch)}
            onDeleteItem={(itemId) => handleDeleteItem(session.id, itemId)}
            onMoveItem={(itemId, direction) => handleMoveItem(session.id, itemId, direction)}
          />

          <div className="field workshop-journal-field">
            <label htmlFor={`journal-${session.id}`}>Bitácora de sesión</label>
            <textarea
              id={`journal-${session.id}`}
              rows={4}
              placeholder="Notas de facilitación, aprendizajes y ajustes para la próxima sesión..."
              value={session.journal_notes ?? ''}
              onChange={(event) => handleJournalChange(session, event.target.value)}
            />
          </div>
        </section>
      ))}

      <section className="auth-panel workshop-journal-general">
        <h3>Bitácora general del taller</h3>
        <p className="workshop-section-copy">
          Registro completo del taller: aprendizajes, ajustes, participación y notas para futuras
          versiones. Complementa la bitácora por sesión.
        </p>
        <div className="field workshop-journal-field">
          <label htmlFor="workshop-journal-general">Bitácora del taller completo</label>
          <textarea
            id="workshop-journal-general"
            rows={8}
            placeholder="Ej.: qué funcionó bien, qué cambiarías, observaciones del grupo, acuerdos de seguimiento..."
            value={workshopJournal}
            onChange={(event) => handleWorkshopJournalChange(event.target.value)}
          />
        </div>
      </section>

      {picker && (
        <ActivityPicker
          onSelect={handleActivitySelected}
          onClose={() => setPicker(null)}
        />
      )}

      {pausePickerSessionId && (
        <PausePicker
          onSelect={handlePauseSelected}
          onClose={() => setPausePickerSessionId('')}
        />
      )}

      <div className="workshop-editor-footer">
        <button
          type="button"
          className="timer-btn timer-btn-ghost"
          onClick={() => navigate('/talleres')}
        >
          Volver al listado
        </button>

        <button
          type="button"
          className="btn-primary"
          disabled={finalizing || sessions.length === 0}
          onClick={handleFinalizeStructure}
        >
          {finalizing ? 'Finalizando...' : 'Finalizar estructura del taller'}
        </button>
      </div>
    </main>
  )
}
