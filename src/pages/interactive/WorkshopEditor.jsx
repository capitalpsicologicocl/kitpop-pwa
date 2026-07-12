import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import AccessCodePanel from '../../components/interactive/AccessCodePanel'
import ActivityPicker from '../../components/workshop/ActivityPicker'
import DurationSelect from '../../components/workshop/DurationSelect'
import WorkshopSessionTable from '../../components/workshop/WorkshopSessionTable'
import { useAuth } from '../../context/AuthContext'
import { fetchAccessCodesByType } from '../../services/accessCodeService'
import {
  createWorkshopItem,
  deleteWorkshopItem,
  fetchWorkshopById,
  fetchWorkshopSessions,
  formatSessionDuration,
  syncWorkshopSessionCount,
  updateWorkshop,
  updateWorkshopItem,
  updateWorkshopSession,
} from '../../services/workshopService'

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
  const { user, loading: authLoading } = useAuth()

  const [workshop, setWorkshop] = useState(null)
  const [sessions, setSessions] = useState([])
  const [accessCode, setAccessCode] = useState('')
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingMeta, setSavingMeta] = useState(false)
  const [syncingSessions, setSyncingSessions] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [picker, setPicker] = useState(null)
  const journalTimersRef = useRef({})

  const loadWorkshop = useCallback(async () => {
    if (!user || !id) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const [workshopData, sessionData, codes] = await Promise.all([
        fetchWorkshopById(user.id, id),
        fetchWorkshopSessions(user.id, id),
        fetchAccessCodesByType(user.id, 'workshop'),
      ])

      if (!workshopData) {
        setError('No encontramos este taller.')
        setWorkshop(null)
        return
      }

      setWorkshop(workshopData)
      setForm(mapWorkshopToForm(workshopData))

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
        setSessions(sessionData)
      }

      setAccessCode(codes.find((entry) => entry.resource_id === id)?.code ?? '')
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
        status: 'draft',
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
        sortOrder: session.workshop_items.length,
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
          sortOrder: session?.workshop_items.length ?? 0,
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
      <main id="interactive-view" className="fade-in">
        <p className="auth-loading">Cargando diseño del taller...</p>
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
        <Link to="/interactivo/talleres" className="back-btn">
          ← Talleres
        </Link>
        <div className="auth-message error">{error || 'Taller no encontrado.'}</div>
      </main>
    )
  }

  return (
    <main id="interactive-view" className="fade-in workshop-editor">
      <Link to="/interactivo/talleres" className="back-btn">
        ← Talleres
      </Link>

      <div className="page-head">
        <h1 className="cv-title">{workshop.title}</h1>
        <p className="cv-desc">
          Diseña sesiones con tabla Tiempo · Actividad · Descripción y bitácora por sesión.
        </p>
      </div>

      {message && <div className="auth-message success">{message}</div>}
      {error && <div className="auth-message error">{error}</div>}

      <AccessCodePanel code={accessCode} resourceLabel="Taller" />

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
              rows={3}
              value={form.objective}
              onChange={(event) => setForm({ ...form, objective: event.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={savingMeta}>
          {savingMeta ? 'Guardando...' : 'Guardar datos'}
        </button>
      </form>

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
            onSwapActivity={(itemId) => handleSwapActivity(session.id, itemId)}
            onUpdateItem={(itemId, patch) => handleUpdateItem(session.id, itemId, patch)}
            onDeleteItem={(itemId) => handleDeleteItem(session.id, itemId)}
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

      {picker && (
        <ActivityPicker
          onSelect={handleActivitySelected}
          onClose={() => setPicker(null)}
        />
      )}

      <div className="workshop-editor-footer">
        <button
          type="button"
          className="timer-btn timer-btn-ghost"
          onClick={() => navigate('/interactivo/talleres')}
        >
          Volver al listado
        </button>
      </div>
    </main>
  )
}
