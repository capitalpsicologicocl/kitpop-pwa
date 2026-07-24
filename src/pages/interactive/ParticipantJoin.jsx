import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import LiveParticipantPoll from '../../components/live/LiveParticipantPoll'
import SurveyParticipantForm from '../../components/survey/SurveyParticipantForm'
import WorkspaceParticipantShell from '../../components/workspace/WorkspaceParticipantShell'
import { getLiveSessionForParticipant } from '../../services/liveSessionService'
import { subscribeLiveSessionRealtime } from '../../services/livePollRealtime'
import { getSurveyForParticipant } from '../../services/surveyService'
import { resolveAccessCode } from '../../services/accessCodeService'
import { getParticipantToken as getLiveToken } from '../../utils/liveHelpers'
import { getParticipantToken as getSurveyToken } from '../../utils/surveyHelpers'
import { normalizeAccessCode, RESOURCE_LABELS } from '../../utils/accessCode'

export default function ParticipantJoin() {
  const { code = '' } = useParams()
  const [session, setSession] = useState(null)
  const [survey, setSurvey] = useState(null)
  const [liveSession, setLiveSession] = useState(null)
  const [votedPollIds, setVotedPollIds] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadLive = useCallback(async (resourceId) => {
    const token = getLiveToken(resourceId)
    const data = await getLiveSessionForParticipant(code, token)
    setLiveSession(data)
    setVotedPollIds(data?.voted_poll_ids ?? [])
    return data
  }, [code])

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      setLoading(true)
      setError('')
      setSession(null)
      setSurvey(null)
      setLiveSession(null)
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
          const participantToken = getSurveyToken(result.resource_id)
          const surveyData = await getSurveyForParticipant(code, participantToken)

          if (mounted) {
            setSurvey(surveyData)
          }
        }

        if (result.resource_type === 'live') {
          await loadLive(result.resource_id)
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
  }, [code, loadLive])

  useEffect(() => {
    if (!session || session.resource_type !== 'live' || session.status !== 'live') {
      return undefined
    }

    const resourceId = session.resource_id

    const unsubscribe = subscribeLiveSessionRealtime(resourceId, {
      onBroadcast: () => {
        loadLive(resourceId).catch(() => {})
      },
      onPollChange: () => {
        loadLive(resourceId).catch(() => {})
      },
      onSessionChange: () => {
        loadLive(resourceId).catch(() => {})
      },
    })

    return unsubscribe
  }, [loadLive, session])

  const normalizedCode = normalizeAccessCode(code)
  const surveyParticipantToken = survey?.survey_id
    ? getSurveyToken(survey.survey_id)
    : ''
  const liveParticipantToken = liveSession?.session_id
    ? getLiveToken(liveSession.session_id)
    : ''

  function handleLiveVoted(pollId) {
    setVotedPollIds((current) => [...new Set([...current, pollId])])
  }

  return (
    <main id="participant-view" className="fade-in">
      {session?.resource_type !== 'workspace' && (
        <Link to="/" className="back-btn">
          ← KitPOP
        </Link>
      )}

      <div className={`auth-panel participant-panel ${session?.resource_type === 'workspace' ? 'participant-panel-workspace' : ''}`}>
        {session?.resource_type !== 'workspace' && (
          <p className="profile-badge">Acceso participante</p>
        )}

        {loading && <p className="auth-loading">Validando código...</p>}

        {!loading && error && (
          <>
            <h1>Código inválido</h1>
            <p>{error}</p>
            <p className="interactive-item-meta">Código ingresado: {normalizedCode}</p>
          </>
        )}

        {!loading && session?.resource_type === 'workspace' && (
          <WorkspaceParticipantShell code={code} />
        )}

        {!loading && session?.resource_type === 'workshop' && (
          <>
            <h1>{session.title}</h1>
            <p className="participant-type">{RESOURCE_LABELS.workshop}</p>
            <p className="participant-copy">
              Taller registrado. Comparte este espacio con tu facilitador/a.
            </p>
          </>
        )}

        {!loading && session?.resource_type === 'live' && liveSession && (
          <>
            <h1>{liveSession.title}</h1>
            {liveSession.organization && (
              <p className="interactive-item-meta">{liveSession.organization}</p>
            )}
            <p className="participant-type">{RESOURCE_LABELS.live}</p>

            {liveSession.status !== 'live' && (
              <p className="participant-copy participant-wait">
                {liveSession.status === 'closed'
                  ? 'La sesión en vivo ya finalizó.'
                  : liveSession.status === 'paused'
                    ? 'La sesión está pausada. Espera a que el facilitador la reactive.'
                    : 'Espera a que el facilitador inicie la sesión en vivo.'}
              </p>
            )}

            {liveSession.status === 'live' && (
              <LiveParticipantPoll
                liveSession={{
                  ...liveSession,
                  voted_poll_ids: votedPollIds,
                }}
                code={code}
                participantToken={liveParticipantToken}
                onVoted={handleLiveVoted}
              />
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
                  ? 'Esta encuesta ya fue finalizada.'
                  : survey.status === 'paused'
                    ? 'La encuesta está pausada. Espera a que el facilitador la reactive.'
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
                  participantToken={surveyParticipantToken}
                  onSubmitted={() => setSubmitted(true)}
                />
              )}
          </>
        )}
      </div>
    </main>
  )
}
