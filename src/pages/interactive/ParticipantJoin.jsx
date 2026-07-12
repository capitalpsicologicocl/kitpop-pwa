import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import SurveyParticipantForm from '../../components/survey/SurveyParticipantForm'
import { getSurveyForParticipant } from '../../services/surveyService'
import { resolveAccessCode } from '../../services/accessCodeService'
import { getParticipantToken } from '../../utils/surveyHelpers'
import { normalizeAccessCode, RESOURCE_LABELS } from '../../utils/accessCode'

export default function ParticipantJoin() {
  const { code = '' } = useParams()
  const [session, setSession] = useState(null)
  const [survey, setSurvey] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      setLoading(true)
      setError('')
      setSession(null)
      setSurvey(null)
      setSubmitted(false)

      try {
        const result = await resolveAccessCode(code)

        if (!mounted) {
          return
        }

        if (!result) {
          setError('Código no encontrado o inactivo.')
          return
        }

        setSession(result)

        if (result.resource_type === 'survey') {
          const participantToken = getParticipantToken(result.resource_id)
          const surveyData = await getSurveyForParticipant(code, participantToken)

          if (mounted) {
            setSurvey(surveyData)
          }
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'No se pudo validar el código.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadSession()
  }, [code])

  const normalizedCode = normalizeAccessCode(code)
  const participantToken = survey?.survey_id
    ? getParticipantToken(survey.survey_id)
    : ''

  return (
    <main id="participant-view" className="fade-in">
      <Link to="/" className="back-btn">
        ← KitPOP
      </Link>

      <div className="auth-panel participant-panel">
        <p className="profile-badge">Acceso participante</p>

        {loading && <p className="auth-loading">Validando código...</p>}

        {!loading && error && (
          <>
            <h1>Código inválido</h1>
            <p>{error}</p>
            <p className="interactive-item-meta">Código ingresado: {normalizedCode}</p>
          </>
        )}

        {!loading && session && session.resource_type !== 'survey' && (
          <>
            <h1>{session.title}</h1>
            <p className="participant-type">
              {RESOURCE_LABELS[session.resource_type] || 'Sesión KitPOP'}
            </p>
            <span className="interactive-status">{session.status}</span>

            {session.resource_type === 'live' && session.status === 'live' && (
              <p className="participant-copy">
                Sesión en vivo. La votación sincronizada llegará en Fase 10.
              </p>
            )}

            {session.resource_type === 'workshop' && (
              <p className="participant-copy">
                Taller registrado. Comparte este espacio con tu facilitador/a.
              </p>
            )}

            {(session.status === 'draft' ||
              (session.resource_type === 'live' && session.status !== 'live')) && (
              <p className="participant-copy participant-wait">
                Espera a que el facilitador active esta sesión.
              </p>
            )}
          </>
        )}

        {!loading && session?.resource_type === 'survey' && survey && (
          <>
            <h1>{survey.title}</h1>
            {survey.organization && (
              <p className="interactive-item-meta">{survey.organization}</p>
            )}

            {survey.status !== 'active' && (
              <p className="participant-copy participant-wait">
                {survey.status === 'closed'
                  ? 'Esta encuesta ya está cerrada.'
                  : 'Espera a que el facilitador active la encuesta.'}
              </p>
            )}

            {survey.status === 'active' && survey.already_answered && !submitted && (
              <p className="participant-copy participant-wait">
                Ya enviaste tus respuestas. Gracias por participar.
              </p>
            )}

            {survey.status === 'active' && submitted && (
              <p className="participant-copy">
                ¡Gracias! Tus respuestas fueron enviadas correctamente.
              </p>
            )}

            {survey.status === 'active' &&
              !survey.already_answered &&
              !submitted &&
              (survey.questions?.length ?? 0) === 0 && (
                <p className="participant-copy participant-wait">
                  La encuesta aún no tiene preguntas publicadas.
                </p>
              )}

            {survey.status === 'active' &&
              !survey.already_answered &&
              !submitted &&
              (survey.questions?.length ?? 0) > 0 && (
                <SurveyParticipantForm
                  survey={survey}
                  code={code}
                  participantToken={participantToken}
                  onSubmitted={() => setSubmitted(true)}
                />
              )}
          </>
        )}
      </div>
    </main>
  )
}
