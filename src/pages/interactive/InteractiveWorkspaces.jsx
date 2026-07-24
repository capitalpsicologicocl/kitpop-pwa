import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ListPageSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import AccessCodePanel from '../../components/interactive/AccessCodePanel'
import InteractiveNav from '../../components/interactive/InteractiveNav'
import CompactPlanStrip from '../../components/profile/CompactPlanStrip'
import { useAuth } from '../../context/AuthContext'
import { fetchAccessCodesByType } from '../../services/accessCodeService'
import {
  createWorkspace,
  deleteWorkspace,
  fetchWorkspaces,
  isWorkspaceSetupError,
} from '../../services/workspaceService'
import { hasPaidPlan } from '../../utils/planLimits'
import { getWorkspaceStatusLabel } from '../../utils/workspaceHelpers'

export default function InteractiveWorkspaces() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [workspaces, setWorkspaces] = useState([])
  const [codeMap, setCodeMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })

  async function loadWorkspaces() {
    if (!user) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const [items, codes] = await Promise.all([
        fetchWorkspaces(user.id),
        fetchAccessCodesByType(user.id, 'workspace'),
      ])

      setWorkspaces(items)
      setCodeMap(Object.fromEntries(codes.map((entry) => [entry.resource_id, entry.code])))
    } catch (loadError) {
      setError(loadError.message || 'No se pudieron cargar los espacios.')
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

    loadWorkspaces()
  }, [authLoading, user])

  async function handleCreate(event) {
    event.preventDefault()
    setError('')

    if (!hasPaidPlan(profile)) {
      setError('Los espacios de trabajo requieren KitPOP Pro.')
      return
    }

    if (!form.title.trim()) {
      setError('Escribe un título para el espacio.')
      return
    }

    setSubmitting(true)

    try {
      const workspace = await createWorkspace(user.id, form)
      setForm({ title: '', description: '' })
      navigate(`/interactivo/espacios/${workspace.id}`)
    } catch (createError) {
      setError(
        isWorkspaceSetupError(createError)
          ? 'Ejecuta supabase/workspaces_v1.sql en Supabase antes de crear espacios.'
          : createError.message || 'No se pudo crear el espacio.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(workspaceId) {
    if (!user || !window.confirm('¿Eliminar este espacio y todas sus respuestas?')) {
      return
    }

    try {
      await deleteWorkspace(user.id, workspaceId)
      setWorkspaces((current) => current.filter((item) => item.id !== workspaceId))
    } catch (deleteError) {
      setError(deleteError.message || 'No se pudo eliminar el espacio.')
    }
  }

  if (authLoading || loading) {
    return (
      <main id="interactive-view" className="fade-in">
        <ListPageSkeleton rows={4} />
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
        <h1 className="cv-title">Espacios de trabajo</h1>
        <p className="cv-desc">
          Paneles colaborativos con inscripción, grupos y respuestas individual/grupal.
        </p>
        <CompactPlanStrip profile={profile} />
      </div>

      <InteractiveNav />

      {error && <div className="auth-message error">{error}</div>}

      {!hasPaidPlan(profile) && (
        <div className="auth-panel interactive-note">
          <h3>Requiere KitPOP Pro</h3>
          <p>Los espacios de trabajo están disponibles en planes Pro. Actualiza tu plan para crear paneles.</p>
        </div>
      )}

      {hasPaidPlan(profile) && (
        <form className="auth-panel interactive-form" onSubmit={handleCreate}>
          <h3>Nuevo espacio de trabajo</h3>

          <div className="form-grid">
            <div className="field full">
              <label htmlFor="workspace-title">Título del taller</label>
              <input
                id="workspace-title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Taller PERMA – Empresa X"
              />
            </div>

            <div className="field full">
              <label htmlFor="workspace-desc">Descripción (opcional)</label>
              <textarea
                id="workspace-desc"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear y configurar →'}
            </button>
          </div>
        </form>
      )}

      <div className="interactive-list">
        {workspaces.length === 0 ? (
          <EmptyState
            variant="surveys"
            title="Aún no tienes espacios de trabajo"
            description="Crea un panel con bloques, grupos e inscripción de participantes."
          />
        ) : (
          workspaces.map((workspace) => (
            <article key={workspace.id} className="interactive-item auth-panel">
              <div className="interactive-item-head">
                <div>
                  <h3>{workspace.title}</h3>
                  <span className={`interactive-status status-${workspace.status}`}>
                    {getWorkspaceStatusLabel(workspace.status)}
                  </span>
                </div>

                <button
                  type="button"
                  className="journal-delete"
                  onClick={() => handleDelete(workspace.id)}
                >
                  Eliminar
                </button>
              </div>

              <AccessCodePanel code={codeMap[workspace.id]} resourceLabel="Espacio de trabajo" />

              <div className="interactive-item-actions">
                <Link
                  to={`/interactivo/espacios/${workspace.id}`}
                  className="btn-primary btn-link"
                >
                  Editar y panel en vivo
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  )
}
