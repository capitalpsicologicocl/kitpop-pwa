import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import AccessCodePanel from '../../components/interactive/AccessCodePanel'
import SurveyQuestionEditor from '../../components/survey/SurveyQuestionEditor'
import { useAuth } from '../../context/AuthContext'
import { fetchAccessCodesByType } from '../../services/accessCodeService'
import {
  createSurveyQuestion,
  deleteSurveyQuestion,
  fetchSurveyById,
  fetchSurveyQuestions,
  isSurveySetupError,
  seedSatisfactionQuestions,
  updateSurvey,
  updateSurveyQuestion,
  updateSurveyStatus,
} from '../../services/surveyService'
import { buildDefaultQuestion, getSurveyStatusLabel, getSurveyTypeLabel, likertTypeFromScale, CUSTOM_QUESTION_TYPES, LIKERT_SCALES, LIKERT_SCALE_INFO } from '../../utils/surveyHelpers'

export default function SurveyEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [survey, setSurvey] = useState(null)
  const [questions, setQuestions] = useState([])
  const [accessCode, setAccessCode] = useState('')
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingMeta, setSavingMeta] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [addingType, setAddingType] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [seedScale, setSeedScale] = useState(5)
  const [setupError, setSetupError] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadSurvey = useCallback(async () => {
    if (!user || !id) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const [surveyData, , codes] = await Promise.all([
        fetchSurveyById(user.id, id),
        Promise.resolve(null),
        fetchAccessCodesByType(user.id, 'survey'),
      ])

      if (!surveyData) {
        setError('No encontramos esta encuesta.')
        setSurvey(null)
        return
      }

      setSurvey(surveyData)
      setForm({
        title: surveyData.title ?? '',
        organization: surveyData.organization ?? '',
        description: surveyData.description ?? '',
      })
      setSeedScale(surveyData.likert_scale ?? 5)
      setAccessCode(codes.find((entry) => entry.resource_id === id)?.code ?? '')

      try {
        const questionData = await fetchSurveyQuestions(user.id, id)
        setQuestions(questionData)
        setSetupError(false)
      } catch (questionsError) {
        setQuestions([])
        const missingSetup = isSurveySetupError(questionsError)
        setSetupError(missingSetup)
        setError(
          missingSetup
            ? 'Falta configurar Supabase. Ejecuta surveys_v1.sql, surveys_v2_likert.sql y surveys_v3_paused.sql en SQL Editor.'
            : questionsError.message || 'No se pudieron cargar las preguntas.'
        )
      }
    } catch (loadError) {
      setError(loadError.message || 'No se pudo cargar la encuesta.')
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

    loadSurvey()
  }, [authLoading, loadSurvey, user])

  async function handleSaveMeta(event) {
    event.preventDefault()

    if (!user || !survey || !form) {
      return
    }

    setSavingMeta(true)
    setMessage('')
    setError('')

    try {
      const updated = await updateSurvey(user.id, survey.id, {
        title: form.title.trim(),
        organization: form.organization.trim(),
        description: form.description.trim(),
        status: survey.status,
      })

      setSurvey(updated)
      setMessage('Datos de la encuesta guardados.')
    } catch (saveError) {
      setError(saveError.message || 'No se pudieron guardar los datos.')
    } finally {
      setSavingMeta(false)
    }
  }

  async function handleAddQuestion(questionType) {
    if (!user || !survey) {
      return
    }

    setAddingType(questionType)
    setError('')

    try {
      const defaults = buildDefaultQuestion(questionType, questions.length)
      const created = await createSurveyQuestion(user.id, survey.id, defaults)
      setQuestions((current) => [...current, created])
      setMessage('Pregunta agregada.')
    } catch (createError) {
      setError(createError.message || 'No se pudo agregar la pregunta.')
    } finally {
      setAddingType('')
    }
  }

  async function handleQuestionChange(question, patch) {
    if (!user) {
      return
    }

    const dbPatch = {}

    if (patch.questionType !== undefined) {
      dbPatch.questionType = patch.questionType
    }

    if (patch.prompt !== undefined) {
      dbPatch.prompt = patch.prompt
    }

    if (patch.options !== undefined) {
      dbPatch.options = patch.options
    }

    if (patch.isRequired !== undefined) {
      dbPatch.isRequired = patch.isRequired
    }

    setQuestions((current) =>
      current.map((entry) =>
        entry.id === question.id
          ? {
              ...entry,
              ...(patch.questionType !== undefined
                ? { question_type: patch.questionType }
                : {}),
              ...(patch.prompt !== undefined ? { prompt: patch.prompt } : {}),
              ...(patch.options !== undefined ? { options: patch.options } : {}),
              ...(patch.isRequired !== undefined
                ? { is_required: patch.isRequired }
                : {}),
            }
          : entry
      )
    )

    try {
      await updateSurveyQuestion(user.id, question.id, dbPatch)
    } catch (updateError) {
      setError(updateError.message || 'No se pudo actualizar la pregunta.')
      loadSurvey()
    }
  }

  async function handleDeleteQuestion(questionId) {
    if (!user) {
      return
    }

    setQuestions((current) => current.filter((entry) => entry.id !== questionId))

    try {
      await deleteSurveyQuestion(user.id, questionId)
    } catch (deleteError) {
      setError(deleteError.message || 'No se pudo eliminar la pregunta.')
      loadSurvey()
    }
  }

  async function handleMoveQuestion(index, direction) {
    if (!user) {
      return
    }

    const targetIndex = index + direction

    if (targetIndex < 0 || targetIndex >= questions.length) {
      return
    }

    const reordered = [...questions]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    setQuestions(reordered)

    try {
      await Promise.all(
        reordered.map((question, sortOrder) =>
          updateSurveyQuestion(user.id, question.id, { sortOrder })
        )
      )
    } catch (moveError) {
      setError(moveError.message || 'No se pudo reordenar.')
      loadSurvey()
    }
  }

  async function handleSeedTemplate() {
    if (!user || !survey) {
      return
    }

    setSeeding(true)
    setError('')
    setMessage('')

    try {
      const items = await seedSatisfactionQuestions(user.id, survey.id, seedScale)
      setQuestions(items)
      setSurvey((current) => ({
        ...current,
        survey_type: 'satisfaction',
        likert_scale: seedScale,
      }))
      setSetupError(false)
      setMessage(`Se cargaron ${items.length} ítems de satisfacción (Likert 1–${seedScale}).`)
    } catch (seedError) {
      setError(
        isSurveySetupError(seedError)
          ? 'Ejecuta los SQL de encuestas en Supabase (surveys_v1, v2_likert, v3_paused).'
          : seedError.message || 'No se pudieron cargar los ítems.'
      )
    } finally {
      setSeeding(false)
    }
  }

  async function handlePause() {
    if (!user || !survey) {
      return
    }

    setStatusUpdating(true)
    setError('')

    try {
      const updated = await updateSurveyStatus(user.id, survey.id, 'paused')
      setSurvey(updated)
      setMessage('Encuesta pausada. Puedes reactivarla cuando quieras.')
    } catch (pauseError) {
      setError(pauseError.message || 'No se pudo pausar la encuesta.')
    } finally {
      setStatusUpdating(false)
    }
  }

  async function handleReactivate() {
    if (!user || !survey) {
      return
    }

    setStatusUpdating(true)
    setError('')

    try {
      const updated = await updateSurveyStatus(user.id, survey.id, 'active')
      setSurvey(updated)
      setMessage('Encuesta reactivada. Vuelve a recibir respuestas.')
    } catch (reactivateError) {
      setError(reactivateError.message || 'No se pudo reactivar la encuesta.')
    } finally {
      setStatusUpdating(false)
    }
  }

  async function handleFinalize() {
    if (!user || !survey) {
      return
    }

    if (
      !window.confirm(
        '¿Finalizar esta encuesta? No podrá reabrirse ni recibir más respuestas.'
      )
    ) {
      return
    }

    setStatusUpdating(true)
    setError('')

    try {
      const updated = await updateSurveyStatus(user.id, survey.id, 'closed')
      setSurvey(updated)
      setMessage('Encuesta finalizada.')
    } catch (finalizeError) {
      setError(finalizeError.message || 'No se pudo finalizar la encuesta.')
    } finally {
      setStatusUpdating(false)
    }
  }

  async function handleActivate() {
    if (!user || !survey) {
      return
    }

    if (questions.length === 0) {
      setError('Agrega al menos una pregunta antes de activar.')
      return
    }

    setStatusUpdating(true)
    setError('')

    try {
      const updated = await updateSurveyStatus(user.id, survey.id, 'active')
      setSurvey(updated)
      setMessage('Encuesta activa. Comparte el código con los participantes.')
    } catch (activateError) {
      setError(activateError.message || 'No se pudo activar la encuesta.')
    } finally {
      setStatusUpdating(false)
    }
  }

  const surveyType = survey?.survey_type ?? 'custom'
  const isSatisfaction = surveyType === 'satisfaction'

  if (authLoading || loading) {
    return (
      <main id="interactive-view" className="fade-in">
        <p className="auth-loading">Cargando editor de encuesta...</p>
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

  if (!survey || !form) {
    return (
      <main id="interactive-view" className="fade-in">
        <Link to="/interactivo/encuestas" className="back-btn">
          ← Encuestas
        </Link>
        <div className="auth-message error">{error || 'Encuesta no encontrada.'}</div>
      </main>
    )
  }

  return (
    <main id="interactive-view" className="fade-in survey-editor">
      <Link to="/interactivo/encuestas" className="back-btn">
        ← Encuestas
      </Link>

      <div className="page-head">
        <h1 className="cv-title">{survey.title}</h1>
        <p className="cv-desc">
          {getSurveyTypeLabel(surveyType)}
          {isSatisfaction && ` · Likert 1–${survey.likert_scale ?? 5}`}
        </p>
        <span className={`interactive-status status-${survey.status}`}>
          {getSurveyStatusLabel(survey.status)}
        </span>
      </div>

      {message && <div className="auth-message success">{message}</div>}
      {error && <div className="auth-message error">{error}</div>}

      {setupError && (
        <div className="auth-panel survey-setup-alert">
          <h3>Configuración pendiente en Supabase</h3>
          <p>
            Para ver y editar preguntas, ejecuta en <strong>Supabase → SQL Editor</strong>:
            <code>surveys_v1.sql</code>, <code>surveys_v2_likert.sql</code> y{' '}
            <code>surveys_v3_paused.sql</code>.
          </p>
        </div>
      )}

      <section className="auth-panel survey-management-bar">
        <h3>Gestionar encuesta</h3>
        <div className="survey-management-actions">
          <Link
            to={`/interactivo/encuestas/${survey.id}/resultados`}
            className="btn-primary btn-link"
          >
            Resultados y promedios
          </Link>

          {survey.status === 'draft' && (
            <button
              type="button"
              className="timer-btn timer-btn-secondary"
              disabled={statusUpdating || questions.length === 0}
              onClick={handleActivate}
            >
              {statusUpdating ? 'Activando...' : 'Activar encuesta'}
            </button>
          )}

          {survey.status === 'active' && (
            <>
              <button
                type="button"
                className="timer-btn timer-btn-secondary"
                disabled={statusUpdating}
                onClick={handlePause}
              >
                {statusUpdating ? 'Pausando...' : 'Pausar encuesta'}
              </button>
              <button
                type="button"
                className="timer-btn timer-btn-ghost"
                disabled={statusUpdating}
                onClick={handleFinalize}
              >
                Finalizar encuesta
              </button>
            </>
          )}

          {survey.status === 'paused' && (
            <>
              <button
                type="button"
                className="timer-btn timer-btn-secondary"
                disabled={statusUpdating}
                onClick={handleReactivate}
              >
                Reactivar encuesta
              </button>
              <button
                type="button"
                className="timer-btn timer-btn-ghost"
                disabled={statusUpdating}
                onClick={handleFinalize}
              >
                Finalizar encuesta
              </button>
            </>
          )}
        </div>
      </section>

      <AccessCodePanel code={accessCode} resourceLabel="Encuesta" />

      <section className="auth-panel survey-questions-panel">
        <h3>Preguntas e ítems ({questions.length})</h3>
        <p className="workshop-section-copy">
          {isSatisfaction
            ? 'Ítems prediseñados de satisfacción. Elimina los que no apliquen o agrega más.'
            : 'Diseña cada ítem con Likert 1–5, 1–7, 1–10, Sí/No o texto libre.'}
        </p>

        {questions.length === 0 && (
          <div className="survey-empty-template auth-panel">
            <h4>Sin preguntas cargadas</h4>
            <p>
              Si creaste una encuesta de satisfacción, carga los ítems prediseñados aquí.
            </p>
            <div className="survey-seed-row">
              <label htmlFor="seed-scale">Escala Likert</label>
              <select
                id="seed-scale"
                value={seedScale}
                onChange={(event) => setSeedScale(Number(event.target.value))}
              >
                {LIKERT_SCALES.map((scale) => (
                  <option key={scale} value={scale}>
                    {LIKERT_SCALE_INFO[scale].label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-primary"
                disabled={seeding}
                onClick={handleSeedTemplate}
              >
                {seeding ? 'Cargando...' : 'Cargar ítems de satisfacción'}
              </button>
            </div>
          </div>
        )}

        <div className="workshop-table-actions">
          {isSatisfaction ? (
            <>
              <button
                type="button"
                className="timer-btn timer-btn-primary"
                disabled={addingType === likertTypeFromScale(survey.likert_scale ?? 5)}
                onClick={() =>
                  handleAddQuestion(likertTypeFromScale(survey.likert_scale ?? 5))
                }
              >
                + Nota Likert 1–{survey.likert_scale ?? 5}
              </button>
              <button
                type="button"
                className="timer-btn timer-btn-secondary"
                disabled={addingType === 'yes_no'}
                onClick={() => handleAddQuestion('yes_no')}
              >
                + Sí / No
              </button>
              <button
                type="button"
                className="timer-btn timer-btn-secondary"
                disabled={addingType === 'text'}
                onClick={() => handleAddQuestion('text')}
              >
                + Texto libre
              </button>
            </>
          ) : (
            CUSTOM_QUESTION_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                className={
                  type.value.startsWith('likert')
                    ? 'timer-btn timer-btn-primary'
                    : 'timer-btn timer-btn-secondary'
                }
                disabled={addingType === type.value}
                onClick={() => handleAddQuestion(type.value)}
              >
                + {type.label}
              </button>
            ))
          )}
        </div>
      </section>

      <div className="survey-question-list">
        {questions.length === 0 ? (
          <div className="auth-panel">
            <p>Usa el botón «Cargar ítems de satisfacción» o agrega preguntas manualmente.</p>
          </div>
        ) : (
          questions.map((question, index) => (
            <SurveyQuestionEditor
              key={question.id}
              survey={survey}
              question={question}
              index={index}
              isFirst={index === 0}
              isLast={index === questions.length - 1}
              onChange={(patch) => handleQuestionChange(question, patch)}
              onDelete={() => handleDeleteQuestion(question.id)}
              onMoveUp={() => handleMoveQuestion(index, -1)}
              onMoveDown={() => handleMoveQuestion(index, 1)}
            />
          ))
        )}
      </div>

      <form className="auth-panel interactive-form" onSubmit={handleSaveMeta}>
        <h3>Datos de la encuesta</h3>

        <div className="form-grid">
          <div className="field full">
            <label htmlFor="editor-survey-title">Título</label>
            <input
              id="editor-survey-title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="editor-survey-org">Organización</label>
            <input
              id="editor-survey-org"
              value={form.organization}
              onChange={(event) => setForm({ ...form, organization: event.target.value })}
            />
          </div>

          <div className="field full">
            <label htmlFor="editor-survey-desc">Descripción para participantes</label>
            <textarea
              id="editor-survey-desc"
              rows={3}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={savingMeta}>
          {savingMeta ? 'Guardando...' : 'Guardar datos'}
        </button>
      </form>

      <div className="workshop-editor-footer">
        <button
          type="button"
          className="timer-btn timer-btn-ghost"
          onClick={() => navigate('/interactivo/encuestas')}
        >
          Volver al listado
        </button>
      </div>
    </main>
  )
}
