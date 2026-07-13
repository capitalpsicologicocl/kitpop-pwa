import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import AccessCodePanel from '../../components/interactive/AccessCodePanel'
import InteractiveNav from '../../components/interactive/InteractiveNav'
import PlanUpgradeHint, { isPlanLimitMessage } from '../../components/profile/PlanUpgradeHint'
import { useAuth } from '../../context/AuthContext'
import { fetchAccessCodesByType } from '../../services/accessCodeService'
import {
  createLiveSessionDraft,
  deleteLiveSession,
  duplicateLiveSession,
  fetchLiveSessions,
  isLiveSetupError,
} from '../../services/liveSessionService'
import { canCreateResource, getPlanLabel } from '../../utils/planLimits'
import { getLiveStatusLabel } from '../../utils/liveHelpers'

export default function InteractiveLive() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [sessions, setSessions] = useState([])
  const [codeMap, setCodeMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState('')
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
    setError('')

    if (!canCreateResource(profile, 'live', sessions.length)) {
      setError('Alcanzaste el límite de sesiones en vivo del plan Explorer.')
      return
    }

    if (!form.title.trim()) {
      setError('Escribe un nombre para la sesión.')
      return
    }

    setSubmitting(true)

    try {
      const { session } = await createLiveSessionDraft(user.id, form)
      setForm({ title: '', organization: '' })
      navigate(`/interactivo/en-vivo/${session.id}`)
    } catch (createError) {
      setError(
        isLiveSetupError(createError)
          ? 'Ejecuta live_polls_v1.sql en Supabase antes de crear.'
          : createError.message || 'No se pudo crear la sesión.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(sessionId) {
    if (!user) {
      return
    }

    if (!window.confirm('¿Eliminar esta sesión y sus votos?')) {
      return
    }

    try {
      await deleteLiveSession(user.id, sessionId)
      setSessions((current) => current.filter((item) => item.id !== sessionId))
    } catch (deleteError) {
      setError(deleteError.message || 'No se pudo eliminar la sesión.')
    }
  }

  async function handleDuplicate(sessionId) {
    if (!user) {
      return
    }

    if (!canCreateResource(profile, 'live', sessions.length)) {
      setError('Alcanzaste el límite del plan Explorer.')
      return
    }

    setDuplicatingId(sessionId)
    setError('')

    try {
      const copy = await duplicateLiveSession(user.id, sessionId)
      await loadSessions()
      navigate(`/interactivo/en-vivo/${copy.id}`)
    } catch (duplicateError) {
      setError(duplicateError.message || 'No se pudo duplicar.')
    } finally {
      setDuplicatingId('')
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
        <p className="cv-desc">Polls sincronizados con participantes en tiempo real.</p>
        <span className="profile-badge">{getPlanLabel(profile)}</span>
      </div>

      <InteractiveNav />

      {error && <div className="auth-message error">{error}</div>}
      {isPlanLimitMessage(error) && <PlanUpgradeHint />}

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
          {submitting ? 'Creando...' : 'Crear y diseñar polls →'}
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
                  <span className={`interactive-status status-${session.status}`}>
                    {getLiveStatusLabel(session.status)}
                  </span>
                </div>

                <button
                  type="button"
                  className="journal-delete"
                  onClick={() => handleDelete(session.id)}
                >
                  Eliminar
                </button>
              </div>

              <AccessCodePanel code={codeMap[session.id]} resourceLabel="Sesión en vivo" />

              <div className="interactive-item-actions">
                <Link
                  to={`/interactivo/en-vivo/${session.id}`}
                  className="btn-primary btn-link"
                >
                  Panel de polls
                </Link>

                <button
                  type="button"
                  className="timer-btn timer-btn-ghost"
                  disabled={duplicatingId === session.id}
                  onClick={() => handleDuplicate(session.id)}
                >
                  {duplicatingId === session.id ? 'Duplicando...' : 'Duplicar'}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  )
}
