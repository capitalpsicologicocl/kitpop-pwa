import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ListPageSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import CompactPlanStrip from '../../components/profile/CompactPlanStrip'
import { useAuth } from '../../context/AuthContext'
import PlanUpgradeHint, { isPlanLimitMessage } from '../../components/profile/PlanUpgradeHint'
import { fetchAccessCodesByType } from '../../services/accessCodeService'
import {
  createWorkshopDraft,
  deleteWorkshop,
  duplicateWorkshop,
  fetchWorkshops,
} from '../../services/workshopService'
import { canCreateResource } from '../../utils/planLimits'
import { getWorkshopStatusLabel, formatWorkshopDate } from '../../utils/workshopHelpers'

export default function Workshops() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [workshops, setWorkshops] = useState([])
  const [codeMap, setCodeMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState('')
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
      const { workshop } = await createWorkshopDraft(user.id, form)
      setForm({ title: '', organization: '', team: '', audience: '' })
      navigate(`/talleres/${workshop.id}`)
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

    if (!window.confirm('¿Eliminar este taller? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await deleteWorkshop(user.id, workshopId)
      setWorkshops((current) => current.filter((item) => item.id !== workshopId))
    } catch (deleteError) {
      setError(deleteError.message || 'No se pudo eliminar el taller.')
    }
  }

  async function handleDuplicate(workshopId) {
    if (!user) {
      return
    }

    if (!canCreateResource(profile, 'workshop', workshops.length)) {
      setError('Alcanzaste el límite de talleres del plan Explorer.')
      return
    }

    setDuplicatingId(workshopId)
    setError('')

    try {
      const copy = await duplicateWorkshop(user.id, workshopId)
      await loadWorkshops()
      navigate(`/talleres/${copy.id}`)
    } catch (duplicateError) {
      setError(duplicateError.message || 'No se pudo duplicar el taller.')
    } finally {
      setDuplicatingId('')
    }
  }

  if (authLoading || loading) {
    return (
      <main id="workshops-view" className="fade-in">
        <ListPageSkeleton rows={5} />
      </main>
    )
  }

  if (!user) {
    return (
      <main id="workshops-view" className="fade-in">
        <Link to="/login" className="back-btn">
          ← Iniciar sesión
        </Link>
      </main>
    )
  }

  return (
    <main id="workshops-view" className="fade-in">
      <Link to="/perfil" className="back-btn">
        ← Mi espacio de facilitación
      </Link>

      <div className="page-head">
        <h1 className="cv-title">Diseño de talleres / reuniones</h1>
        <p className="cv-desc">
          Crea, edita y duplica tus talleres o workshops. Cuando finalices la estructura podrás
          descargarla en Word o PDF.
        </p>
        <CompactPlanStrip profile={profile} />
      </div>

      {error && <div className="auth-message error">{error}</div>}
      {isPlanLimitMessage(error) && <PlanUpgradeHint />}

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
            title="Aún no tienes talleres diseñados"
            description="Crea el primero arriba y arma sesiones con actividades KitPOP e IA."
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
                    {workshop.created_at && (
                      <>
                        {' · '}
                        Creado {formatWorkshopDate(workshop.created_at)}
                      </>
                    )}
                  </p>
                  <span className={`interactive-status status-${workshop.status}`}>
                    {getWorkshopStatusLabel(workshop.status)}
                  </span>
                </div>

                <button
                  type="button"
                  className="journal-delete"
                  onClick={() => handleDelete(workshop.id)}
                >
                  Eliminar
                </button>
              </div>

              <div className="interactive-item-actions">
                <Link to={`/talleres/${workshop.id}`} className="btn-primary btn-link">
                  Editar diseño
                </Link>

                {workshop.status === 'ready' && (
                  <Link
                    to={`/talleres/${workshop.id}/resumen`}
                    className="timer-btn timer-btn-secondary btn-link"
                  >
                    Ver estructura
                  </Link>
                )}

                <button
                  type="button"
                  className="timer-btn timer-btn-ghost"
                  disabled={duplicatingId === workshop.id}
                  onClick={() => handleDuplicate(workshop.id)}
                >
                  {duplicatingId === workshop.id ? 'Duplicando...' : 'Duplicar'}
                </button>
              </div>

              {codeMap[workshop.id] && (
                <p className="interactive-item-meta workshop-code-hint">
                  Código participantes: {codeMap[workshop.id]}
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </main>
  )
}
