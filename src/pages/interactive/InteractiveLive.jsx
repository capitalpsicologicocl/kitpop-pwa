import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import AccessCodePanel from '../../components/interactive/AccessCodePanel'
import InteractiveNav from '../../components/interactive/InteractiveNav'
import { useAuth } from '../../context/AuthContext'
import { fetchAccessCodesByType } from '../../services/accessCodeService'
import {
  createLiveSessionDraft,
  deleteLiveSession,
  fetchLiveSessions,
  updateLiveSessionStatus,
} from '../../services/liveSessionService'
import { canCreateResource, getPlanLabel } from '../../utils/planLimits'

export default function InteractiveLive() {
  const { user, profile, loading: authLoading } = useAuth()
  const [sessions, setSessions] = useState([])
  const [codeMap, setCodeMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    organization: '',
  })

  async function loadSessions() {
    if (!user) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const [items, codes] = await Promise.all([
        fetchLiveSessions(user.id),
        fetchAccessCodesByType(user.id, 'live'),
      ])

      setSessions(items)
      setCodeMap(
        Object.fromEntries(codes.map((entry) => [entry.resource_id, entry.code]))
      )
    } catch (loadError) {
      setError(loadError.message || 'No se pudieron cargar las sesiones.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user) {
      setLoading(false)
      return
    }

    loadSessions()
  }, [authLoading, user])

  async function handleCreate(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!canCreateResource(profile, 'live', sessions.length)) {
      setError('Alcanzaste el límite de sesiones en vivo del plan Free.')
      return
    }

    if (!form.title.trim()) {
      setError('Escribe un nombre para la sesión.')
      return
    }

    setSubmitting(true)

    try {
      const { session, code } = await createLiveSessionDraft(user.id, form)
      setSessions((current) => [session, ...current])
      setCodeMap((current) => ({ ...current, [session.id]: code }))
      setForm({ title: '', organization: '' })
      setMessage('Sesión creada. Polls en vivo completos en Fase 10.')
    } catch (createError) {
      setError(createError.message || 'No se pudo crear la sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(sessionId) {
    if (!user) {
      return
    }

    try {
      await deleteLiveSession(user.id, sessionId)
      setSessions((current) => current.filter((item) => item.id !== sessionId))
    } catch (deleteError) {
      setError(deleteError.message || 'No se pudo eliminar la sesión.')
    }
  }

  async function handleGoLive(sessionId) {
    if (!user) {
      return
    }

    try {
      const updated = await updateLiveSessionStatus(user.id, sessionId, 'live')
      setSessions((current) =>
        current.map((item) => (item.id === sessionId ? updated : item))
      )
      setMessage('Sesión en vivo. Panel de votación en Fase 10.')
    } catch (liveError) {
      setError(liveError.message || 'No se pudo activar la sesión.')
    }
  }

  if (authLoading || loading) {
    return (
      <main id="interactive-view" className="fade-in">
        <p className="auth-loading">Cargando sesiones en vivo...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main id="interactive-view" className="fade-in">
        <Link to="/login" className="back-btn">← Iniciar sesión</Link>
      </main>
    )
  }

  return (
    <main id="interactive-view" className="fade-in">
      <Link to="/interactivo" className="back-btn">
        ← Espacio interactivo
      </Link>

      <div className="page-head">
        <h1 className="cv-title">En vivo</h1>
        <p className="cv-desc">Polls sincronizados con participantes. Fase 10.</p>
        <span className="profile-badge">{getPlanLabel(profile)}</span>
      </div>

      <InteractiveNav />

      {message && <div className="auth-message success">{message}</div>}
      {error && <div className="auth-message error">{error}</div>}

      <form className="auth-panel interactive-form" onSubmit={handleCreate}>
        <h3>Nueva sesión en vivo</h3>

        <div className="form-grid">
          <div className="field full">
            <label htmlFor="live-title">Nombre de la sesión</label>
            <input
              id="live-title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Poll apertura taller"
            />
          </div>

          <div className="field full">
            <label htmlFor="live-org">Organización</label>
            <input
              id="live-org"
              value={form.organization}
              onChange={(event) => setForm({ ...form, organization: event.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Creando...' : 'Crear sesión'}
        </button>
      </form>

      <div className="interactive-list">
        {sessions.length === 0 ? (
          <div className="auth-panel">
            <p>Aún no tienes sesiones en vivo.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <article key={session.id} className="interactive-item auth-panel">
              <div className="interactive-item-head">
                <div>
                  <h3>{session.title}</h3>
                  <p className="interactive-item-meta">
                    {session.organization || 'Sin organización'}
                  </p>
                  <span className="interactive-status">{session.status}</span>
                </div>

                <div className="interactive-item-actions">
                  {session.status !== 'live' && (
                    <button
                      type="button"
                      className="timer-btn timer-btn-secondary"
                      onClick={() => handleGoLive(session.id)}
                    >
                      Ir en vivo
                    </button>
                  )}

                  <button
                    type="button"
                    className="journal-delete"
                    onClick={() => handleDelete(session.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <AccessCodePanel code={codeMap[session.id]} resourceLabel="Sesión en vivo" />
            </article>
          ))
        )}
      </div>
    </main>
  )
}
