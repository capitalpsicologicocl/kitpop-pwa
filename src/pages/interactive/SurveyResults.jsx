import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import {
  fetchSurveyById,
  fetchSurveyResults,
} from '../../services/surveyService'
import {
  computeQuestionStats,
  getQuestionTypeLabel,
  getSurveyStatusLabel,
  isLikertType,
} from '../../utils/surveyHelpers'

function DistributionList({ distribution }) {
  const entries = Object.entries(distribution ?? {})

  if (entries.length === 0) {
    return <p className="interactive-item-meta">Sin respuestas aún.</p>
  }

  return (
    <ul className="survey-distribution-list">
      {entries.map(([label, count]) => (
        <li key={label}>
          <strong>{label}</strong>
          <span>{count}</span>
        </li>
      ))}
    </ul>
  )
}

export default function SurveyResults() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [survey, setSurvey] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadResults = useCallback(async () => {
    if (!user || !id) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const [surveyData, resultData] = await Promise.all([
        fetchSurveyById(user.id, id),
        fetchSurveyResults(user.id, id),
      ])

      if (!surveyData) {
        setError('No encontramos esta encuesta.')
        return
      }

      setSurvey(surveyData)
      setResults(resultData)
    } catch (loadError) {
      setError(loadError.message || 'No se pudieron cargar los resultados.')
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

    loadResults()
  }, [authLoading, loadResults, user])

  if (authLoading || loading) {
    return (
      <main id="interactive-view" className="fade-in">
        <p className="auth-loading">Cargando resultados...</p>
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

  if (!survey || !results) {
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
    <main id="interactive-view" className="fade-in survey-results">
      <Link to={`/interactivo/encuestas/${survey.id}`} className="back-btn">
        ← Editar encuesta
      </Link>

      <div className="page-head">
        <h1 className="cv-title">Resultados · {survey.title}</h1>
        <p className="cv-desc">
          {results.responseCount} respuesta{results.responseCount === 1 ? '' : 's'} recibida
          {results.responseCount === 1 ? '' : 's'}.
        </p>
        <span className={`interactive-status status-${survey.status}`}>
          {getSurveyStatusLabel(survey.status)}
        </span>
      </div>

      {error && <div className="auth-message error">{error}</div>}

      {results.questions.length === 0 ? (
        <div className="auth-panel">
          <p>Esta encuesta aún no tiene preguntas.</p>
        </div>
      ) : (
        results.questions.map((question, index) => {
          const stats = computeQuestionStats(question, results.answers)

          return (
            <section key={question.id} className="auth-panel survey-result-card">
              <div className="survey-question-head">
                <strong>
                  {index + 1}. {question.prompt}
                </strong>
                <span className="survey-question-type">
                  {getQuestionTypeLabel(question.question_type)}
                </span>
              </div>

              <p className="interactive-item-meta">
                {stats.count} respuesta{stats.count === 1 ? '' : 's'}
              </p>

              {isLikertType(question.question_type) && (
                <>
                  <p className="survey-result-highlight">
                    Promedio: {stats.average ?? '—'}
                  </p>
                  <DistributionList distribution={stats.distribution} />
                </>
              )}

              {(question.question_type === 'yes_no') && (
                <DistributionList distribution={stats.distribution} />
              )}

              {question.question_type === 'text' && (
                <div className="survey-text-answers">
                  {(stats.texts ?? []).length === 0 ? (
                    <p className="interactive-item-meta">Sin comentarios aún.</p>
                  ) : (
                    stats.texts.map((text, textIndex) => (
                      <blockquote key={`${question.id}-${textIndex}`}>{text}</blockquote>
                    ))
                  )}
                </div>
              )}
            </section>
          )
        })
      )}
    </main>
  )
}
