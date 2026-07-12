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
  updateSurvey,
  updateSurveyQuestion,
  updateSurveyStatus,
} from '../../services/surveyService'
import { buildDefaultQuestion, getSurveyStatusLabel, getSurveyTypeLabel, likertTypeFromScale, CUSTOM_QUESTION_TYPES } from '../../utils/surveyHelpers'

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
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadSurvey = useCallback(async () => {
    if (!user || !id) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const [surveyData, questionData, codes] = await Promise.all([
        fetchSurveyById(user.id, id),
        fetchSurveyQuestions(user.id, id),
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
      setQuestions(questionData)
      setAccessCode(codes.find((entry) => entry.resource_id === id)?.code ?? '')
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

  async function handleClose() {
    if (!user || !survey) {
      return
    }

    setStatusUpdating(true)
    setError('')

    try {
      const updated = await updateSurveyStatus(user.id, survey.id, 'closed')
      setSurvey(updated)
      setMessage('Encuesta cerrada. Ya no acepta nuevas respuestas.')
    } catch (closeError) {
      setError(closeError.message || 'No se pudo cerrar la encuesta.')
    } finally {
      setStatusUpdating(false)
    }
  }

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
          {getSurveyTypeLabel(survey.survey_type)}
          {survey.survey_type === 'satisfaction' &&
            ` · Likert 1–${survey.likert_scale ?? 5}`}
        </p>
        <span className={`interactive-status status-${survey.status}`}>
          {getSurveyStatusLabel(survey.status)}
        </span>
      </div>

      {message && <div className="auth-message success">{message}</div>}
      {error && <div className="auth-message error">{error}</div>}

      <AccessCodePanel code={accessCode} resourceLabel="Encuesta" />

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

      <section className="auth-panel">
        <h3>Preguntas</h3>
        <p className="workshop-section-copy">
          {survey.survey_type === 'satisfaction'
            ? 'Ítems prediseñados de satisfacción. Puedes eliminar los que no apliquen o agregar más.'
            : 'Diseña cada ítem con Likert 1–5, 1–7, 1–10, Sí/No o texto libre.'}
        </p>

        <div className="workshop-table-actions">
          {survey.survey_type === 'satisfaction' ? (
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
            <p>Aún no hay preguntas. Agrega la primera arriba.</p>
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

      <div className="workshop-editor-footer">
        <button
          type="button"
          className="timer-btn timer-btn-ghost"
          onClick={() => navigate('/interactivo/encuestas')}
        >
          Volver al listado
        </button>

        <Link
          to={`/interactivo/encuestas/${survey.id}/resultados`}
          className="timer-btn timer-btn-secondary btn-link"
        >
          Ver resultados
        </Link>

        {survey.status === 'draft' && (
          <button
            type="button"
            className="btn-primary"
            disabled={statusUpdating || questions.length === 0}
            onClick={handleActivate}
          >
            {statusUpdating ? 'Activando...' : 'Activar encuesta'}
          </button>
        )}

        {survey.status === 'active' && (
          <button
            type="button"
            className="btn-primary"
            disabled={statusUpdating}
            onClick={handleClose}
          >
            {statusUpdating ? 'Cerrando...' : 'Cerrar encuesta'}
          </button>
        )}
      </div>
    </main>
  )
}
