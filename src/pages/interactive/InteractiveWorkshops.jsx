import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import AccessCodePanel from '../../components/interactive/AccessCodePanel'
import InteractiveNav from '../../components/interactive/InteractiveNav'
import EmptyState from '../../components/ui/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { fetchAccessCodesByType } from '../../services/accessCodeService'
import {
  createWorkshopDraft,
  deleteWorkshop,
  fetchWorkshops,
} from '../../services/workshopService'
import { canCreateResource, getPlanLabel } from '../../utils/planLimits'

export default function InteractiveWorkshops() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [workshops, setWorkshops] = useState([])
  const [codeMap, setCodeMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    organization: '',
    team: '',
    audience: '',
  })

  async function loadWorkshops() {
    if (!user) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const [items, codes] = await Promise.all([
        fetchWorkshops(user.id),
        fetchAccessCodesByType(user.id, 'workshop'),
      ])

      setWorkshops(items)
      setCodeMap(
        Object.fromEntries(codes.map((entry) => [entry.resource_id, entry.code]))
      )
    } catch (loadError) {
      setError(loadError.message || 'No se pudieron cargar los talleres.')
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

    loadWorkshops()
  }, [authLoading, user])

  async function handleCreate(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!canCreateResource(profile, 'workshop', workshops.length)) {
      setError('Alcanzaste el límite de talleres del plan Explorer.')
      return
    }

    if (!form.title.trim()) {
      setError('Escribe un nombre para el taller.')
      return
    }

    setSubmitting(true)

    try {
      const { workshop, code } = await createWorkshopDraft(user.id, form)
      setCodeMap((current) => ({ ...current, [workshop.id]: code }))
      setForm({ title: '', organization: '', team: '', audience: '' })
      navigate(`/interactivo/talleres/${workshop.id}`)
    } catch (createError) {
      setError(createError.message || 'No se pudo crear el taller.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(workshopId) {
    if (!user) {
      return
    }

    try {
      await deleteWorkshop(user.id, workshopId)
      setWorkshops((current) => current.filter((item) => item.id !== workshopId))
    } catch (deleteError) {
      setError(deleteError.message || 'No se pudo eliminar el taller.')
    }
  }

  if (authLoading || loading) {
    return (
      <main id="interactive-view" className="fade-in">
        <p className="auth-loading">Cargando talleres...</p>
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
        <h1 className="cv-title">Talleres</h1>
        <p className="cv-desc">Organiza por equipo u organización y diseña cada sesión.</p>
        <span className="profile-badge">{getPlanLabel(profile)}</span>
      </div>

      <InteractiveNav />

      {message && <div className="auth-message success">{message}</div>}
      {error && <div className="auth-message error">{error}</div>}

      <form className="auth-panel interactive-form" onSubmit={handleCreate}>
        <h3>Nuevo taller</h3>

        <div className="form-grid">
          <div className="field full">
            <label htmlFor="workshop-title">Nombre del taller</label>
            <input
              id="workshop-title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Liderazgo positivo"
            />
          </div>

          <div className="field">
            <label htmlFor="workshop-org">Organización</label>
            <input
              id="workshop-org"
              value={form.organization}
              onChange={(event) => setForm({ ...form, organization: event.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="workshop-team">Equipo / área</label>
            <input
              id="workshop-team"
              value={form.team}
              onChange={(event) => setForm({ ...form, team: event.target.value })}
            />
          </div>

          <div className="field full">
            <label htmlFor="workshop-audience">Público objetivo</label>
            <input
              id="workshop-audience"
              value={form.audience}
              onChange={(event) => setForm({ ...form, audience: event.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Creando...' : 'Crear taller'}
        </button>
      </form>

      <div className="interactive-list">
        {workshops.length === 0 ? (
          <EmptyState
            variant="workshops"
            title="Aún no tienes talleres"
            description="Crea el primero arriba y diseña sesiones con actividades del Kit."
          />
        ) : (
          workshops.map((workshop) => (
            <article key={workshop.id} className="interactive-item auth-panel">
              <div className="interactive-item-head">
                <div>
                  <h3>{workshop.title}</h3>
                  <p className="interactive-item-meta">
                    {[workshop.organization, workshop.team].filter(Boolean).join(' · ') ||
                      'Sin organización'}
                  </p>
                  <span className="interactive-status">{workshop.status}</span>
                </div>

                <button
                  type="button"
                  className="journal-delete"
                  onClick={() => handleDelete(workshop.id)}
                >
                  Eliminar
                </button>
              </div>

              <AccessCodePanel code={codeMap[workshop.id]} resourceLabel="Taller" />

              <div className="interactive-item-actions">
                <Link
                  to={`/interactivo/talleres/${workshop.id}`}
                  className="btn-primary btn-link"
                >
                  Editar diseño
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  )
}
