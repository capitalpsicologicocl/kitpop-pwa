import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import AccessCodePanel from '../../components/interactive/AccessCodePanel'
import InteractiveNav from '../../components/interactive/InteractiveNav'
import { useAuth } from '../../context/AuthContext'
import { fetchAccessCodesByType } from '../../services/accessCodeService'
import {
  createSurveyDraft,
  deleteSurvey,
  fetchSurveys,
  updateSurveyStatus,
} from '../../services/surveyService'
import { canCreateResource, getPlanLabel } from '../../utils/planLimits'

export default function InteractiveSurveys() {
  const { user, profile, loading: authLoading } = useAuth()
  const [surveys, setSurveys] = useState([])
  const [codeMap, setCodeMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    organization: '',
    description: '',
  })

  async function loadSurveys() {
    if (!user) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const [items, codes] = await Promise.all([
        fetchSurveys(user.id),
        fetchAccessCodesByType(user.id, 'survey'),
      ])

      setSurveys(items)
      setCodeMap(
        Object.fromEntries(codes.map((entry) => [entry.resource_id, entry.code]))
      )
    } catch (loadError) {
      setError(loadError.message || 'No se pudieron cargar las encuestas.')
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

    loadSurveys()
  }, [authLoading, user])

  async function handleCreate(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!canCreateResource(profile, 'survey', surveys.length)) {
      setError('Alcanzaste el límite de encuestas del plan Free.')
      return
    }

    if (!form.title.trim()) {
      setError('Escribe un título para la encuesta.')
      return
    }

    setSubmitting(true)

    try {
      const { survey, code } = await createSurveyDraft(user.id, form)
      setSurveys((current) => [survey, ...current])
      setCodeMap((current) => ({ ...current, [survey.id]: code }))
      setForm({ title: '', organization: '', description: '' })
      setMessage('Encuesta creada. El editor de preguntas llega en Fase 9.')
    } catch (createError) {
      setError(createError.message || 'No se pudo crear la encuesta.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(surveyId) {
    if (!user) {
      return
    }

    try {
      await deleteSurvey(user.id, surveyId)
      setSurveys((current) => current.filter((item) => item.id !== surveyId))
    } catch (deleteError) {
      setError(deleteError.message || 'No se pudo eliminar la encuesta.')
    }
  }

  async function handleActivate(surveyId) {
    if (!user) {
      return
    }

    try {
      const updated = await updateSurveyStatus(user.id, surveyId, 'active')
      setSurveys((current) =>
        current.map((item) => (item.id === surveyId ? updated : item))
      )
      setMessage('Encuesta activa. Los participantes pueden ingresar con el código.')
    } catch (activateError) {
      setError(activateError.message || 'No se pudo activar la encuesta.')
    }
  }

  if (authLoading || loading) {
    return (
      <main id="interactive-view" className="fade-in">
        <p className="auth-loading">Cargando encuestas...</p>
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
        <h1 className="cv-title">Encuestas</h1>
        <p className="cv-desc">Satisfacción y feedback. Formulario completo en Fase 9.</p>
        <span className="profile-badge">{getPlanLabel(profile)}</span>
      </div>

      <InteractiveNav />

      {message && <div className="auth-message success">{message}</div>}
      {error && <div className="auth-message error">{error}</div>}

      <form className="auth-panel interactive-form" onSubmit={handleCreate}>
        <h3>Nueva encuesta</h3>

        <div className="form-grid">
          <div className="field full">
            <label htmlFor="survey-title">Título</label>
            <input
              id="survey-title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Satisfacción post-taller"
            />
          </div>

          <div className="field">
            <label htmlFor="survey-org">Organización</label>
            <input
              id="survey-org"
              value={form.organization}
              onChange={(event) => setForm({ ...form, organization: event.target.value })}
            />
          </div>

          <div className="field full">
            <label htmlFor="survey-desc">Descripción</label>
            <textarea
              id="survey-desc"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Creando...' : 'Crear encuesta'}
        </button>
      </form>

      <div className="interactive-list">
        {surveys.length === 0 ? (
          <div className="auth-panel">
            <p>Aún no tienes encuestas.</p>
          </div>
        ) : (
          surveys.map((survey) => (
            <article key={survey.id} className="interactive-item auth-panel">
              <div className="interactive-item-head">
                <div>
                  <h3>{survey.title}</h3>
                  <p className="interactive-item-meta">
                    {survey.organization || 'Sin organización'}
                  </p>
                  <span className="interactive-status">{survey.status}</span>
                </div>

                <div className="interactive-item-actions">
                  {survey.status === 'draft' && (
                    <button
                      type="button"
                      className="timer-btn timer-btn-secondary"
                      onClick={() => handleActivate(survey.id)}
                    >
                      Activar
                    </button>
                  )}

                  <button
                    type="button"
                    className="journal-delete"
                    onClick={() => handleDelete(survey.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <AccessCodePanel code={codeMap[survey.id]} resourceLabel="Encuesta" />
            </article>
          ))
        )}
      </div>
    </main>
  )
}
