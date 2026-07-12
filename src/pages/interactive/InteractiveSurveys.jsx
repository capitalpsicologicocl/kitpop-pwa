import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import AccessCodePanel from '../../components/interactive/AccessCodePanel'
import InteractiveNav from '../../components/interactive/InteractiveNav'
import { useAuth } from '../../context/AuthContext'
import { fetchAccessCodesByType } from '../../services/accessCodeService'
import {
  createSurveyDraft,
  deleteSurvey,
  duplicateSurvey,
  fetchSurveys,
  isSurveySetupError,
} from '../../services/surveyService'
import { canCreateResource, getPlanLabel } from '../../utils/planLimits'
import { getSurveyStatusLabel, getSurveyTypeLabel, LIKERT_SCALE_INFO, LIKERT_SCALES } from '../../utils/surveyHelpers'

export default function InteractiveSurveys() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [surveys, setSurveys] = useState([])
  const [codeMap, setCodeMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState('')
  const [form, setForm] = useState({
    title: '',
    organization: '',
    description: '',
    surveyType: 'satisfaction',
    likertScale: 5,
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
      const { survey } = await createSurveyDraft(user.id, form)
      setForm({
        title: '',
        organization: '',
        description: '',
        surveyType: 'satisfaction',
        likertScale: 5,
      })
      navigate(`/interactivo/encuestas/${survey.id}`)
    } catch (createError) {
      setError(
        isSurveySetupError(createError)
          ? 'Ejecuta los SQL de encuestas en Supabase antes de crear (surveys_v1, v2_likert, v3_paused).'
          : createError.message || 'No se pudo crear la encuesta.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(surveyId) {
    if (!user) {
      return
    }

    if (!window.confirm('¿Eliminar esta encuesta y sus respuestas?')) {
      return
    }

    try {
      await deleteSurvey(user.id, surveyId)
      setSurveys((current) => current.filter((item) => item.id !== surveyId))
    } catch (deleteError) {
      setError(deleteError.message || 'No se pudo eliminar la encuesta.')
    }
  }

  async function handleDuplicate(surveyId) {
    if (!user) {
      return
    }

    if (!canCreateResource(profile, 'survey', surveys.length)) {
      setError('Alcanzaste el límite de encuestas del plan Free.')
      return
    }

    setDuplicatingId(surveyId)
    setError('')

    try {
      const copy = await duplicateSurvey(user.id, surveyId)
      await loadSurveys()
      navigate(`/interactivo/encuestas/${copy.id}`)
    } catch (duplicateError) {
      setError(duplicateError.message || 'No se pudo duplicar la encuesta.')
    } finally {
      setDuplicatingId('')
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
        <p className="cv-desc">Satisfacción y feedback con respuestas anónimas por código.</p>
        <span className="profile-badge">{getPlanLabel(profile)}</span>
      </div>

      <InteractiveNav />

      {error && <div className="auth-message error">{error}</div>}

      <form className="auth-panel interactive-form" onSubmit={handleCreate}>
        <h3>Nueva encuesta</h3>

        <div className="survey-create-types">
          <label className={`survey-create-type ${form.surveyType === 'satisfaction' ? 'on' : ''}`}>
            <input
              type="radio"
              name="survey-type"
              value="satisfaction"
              checked={form.surveyType === 'satisfaction'}
              onChange={() => setForm({ ...form, surveyType: 'satisfaction' })}
            />
            <strong>Encuesta de satisfacción</strong>
            <p>Ítems prediseñados post-taller. Elige escala Likert 5, 7 o 10.</p>
          </label>

          <label className={`survey-create-type ${form.surveyType === 'custom' ? 'on' : ''}`}>
            <input
              type="radio"
              name="survey-type"
              value="custom"
              checked={form.surveyType === 'custom'}
              onChange={() => setForm({ ...form, surveyType: 'custom' })}
            />
            <strong>Encuesta libre</strong>
            <p>Diseña cada pregunta con Likert, Sí/No o texto libre.</p>
          </label>
        </div>

        {form.surveyType === 'satisfaction' && (
          <div className="survey-likert-picker">
            <p className="interactive-item-meta">Escala Likert para las notas de satisfacción</p>
            <div className="survey-likert-picker-grid">
              {LIKERT_SCALES.map((scale) => (
                <label
                  key={scale}
                  className={`survey-likert-picker-card ${form.likertScale === scale ? 'on' : ''}`}
                >
                  <input
                    type="radio"
                    name="likert-scale"
                    value={scale}
                    checked={form.likertScale === scale}
                    onChange={() => setForm({ ...form, likertScale: scale })}
                  />
                  <strong>{LIKERT_SCALE_INFO[scale].label}</strong>
                  <span>{LIKERT_SCALE_INFO[scale].description}</span>
                </label>
              ))}
            </div>
          </div>
        )}

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
          {submitting ? 'Creando...' : 'Crear y editar preguntas →'}
        </button>
        <p className="interactive-item-meta survey-create-note">
          Al crear, entrarás al editor para ver los ítems y elegir activar la encuesta.
        </p>
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
                    {getSurveyTypeLabel(survey.survey_type)}
                    {survey.survey_type === 'satisfaction' &&
                      ` · Likert 1–${survey.likert_scale ?? 5}`}
                    {' · '}
                    {survey.organization || 'Sin organización'}
                  </p>
                  <span className={`interactive-status status-${survey.status}`}>
                    {getSurveyStatusLabel(survey.status)}
                  </span>
                </div>

                <button
                  type="button"
                  className="journal-delete"
                  onClick={() => handleDelete(survey.id)}
                >
                  Eliminar
                </button>
              </div>

              <AccessCodePanel code={codeMap[survey.id]} resourceLabel="Encuesta" />

              <div className="interactive-item-actions">
                <Link
                  to={`/interactivo/encuestas/${survey.id}/resultados`}
                  className="btn-primary btn-link"
                >
                  Resultados y promedios
                </Link>

                <Link
                  to={`/interactivo/encuestas/${survey.id}`}
                  className="timer-btn timer-btn-secondary btn-link"
                >
                  Editar preguntas
                </Link>

                <button
                  type="button"
                  className="timer-btn timer-btn-ghost"
                  disabled={duplicatingId === survey.id}
                  onClick={() => handleDuplicate(survey.id)}
                >
                  {duplicatingId === survey.id ? 'Duplicando...' : 'Duplicar'}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  )
}
