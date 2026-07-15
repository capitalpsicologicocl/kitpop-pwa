import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import LivePollCard from '../../components/live/LivePollCard'
import AccessCodePanel from '../../components/interactive/AccessCodePanel'
import ExportActions from '../../components/export/ExportActions'
import ExportProGate from '../../components/export/ExportProGate'
import { useAuth } from '../../context/AuthContext'
import { fetchAccessCodesByType } from '../../services/accessCodeService'
import {
  closeLivePoll,
  createLivePoll,
  deleteLivePoll,
  fetchLivePollVotes,
  fetchLivePolls,
  fetchLiveSessionById,
  isLiveSetupError,
  openLivePoll,
  updateLivePoll,
  updateLiveSession,
  updateLiveSessionStatus,
} from '../../services/liveSessionService'
import {
  buildDefaultLivePoll,
  computePollResults,
  getLiveStatusLabel,
} from '../../utils/liveHelpers'
import {
  buildLiveSessionResultsDocumentHtml,
  getLiveSessionResultsFilename,
} from '../../utils/liveExport'
import {
  downloadDocumentWord,
  printDocumentPdf,
} from '../../utils/documentExport'

export default function LiveSessionEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()

  const [session, setSession] = useState(null)
  const [polls, setPolls] = useState([])
  const [votes, setVotes] = useState([])
  const [accessCode, setAccessCode] = useState('')
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingMeta, setSavingMeta] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [pollBusyId, setPollBusyId] = useState('')
  const [setupError, setSetupError] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadSession = useCallback(async () => {
    if (!user || !id) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const [sessionData, codes] = await Promise.all([
        fetchLiveSessionById(user.id, id),
        fetchAccessCodesByType(user.id, 'live'),
      ])

      if (!sessionData) {
        setError('No encontramos esta sesión.')
        setSession(null)
        return
      }

      setSession(sessionData)
      setForm({
        title: sessionData.title ?? '',
        organization: sessionData.organization ?? '',
      })
      setAccessCode(codes.find((entry) => entry.resource_id === id)?.code ?? '')

      try {
        const [pollData, voteData] = await Promise.all([
          fetchLivePolls(user.id, id),
          fetchLivePollVotes(user.id, id),
        ])
        setPolls(pollData)
        setVotes(voteData)
        setSetupError(false)
      } catch (pollsError) {
        setPolls([])
        setVotes([])
        const missingSetup = isLiveSetupError(pollsError)
        setSetupError(missingSetup)
        setError(
          missingSetup
            ? 'Ejecuta live_polls_v1.sql en Supabase SQL Editor.'
            : pollsError.message || 'No se pudieron cargar los polls.'
        )
      }
    } catch (loadError) {
      setError(loadError.message || 'No se pudo cargar la sesión.')
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

    loadSession()
  }, [authLoading, loadSession, user])

  useEffect(() => {
    if (!user || !id || session?.status !== 'live') {
      return undefined
    }

    const intervalId = setInterval(async () => {
      try {
        const voteData = await fetchLivePollVotes(user.id, id)
        setVotes(voteData)
      } catch {
        // ignore polling errors
      }
    }, 3000)

    return () => clearInterval(intervalId)
  }, [id, session?.status, user])

  async function handleSaveMeta(event) {
    event.preventDefault()

    if (!user || !session || !form) {
      return
    }

    setSavingMeta(true)
    setError('')

    try {
      const updated = await updateLiveSession(user.id, session.id, {
        title: form.title.trim(),
        organization: form.organization.trim(),
        status: session.status,
      })
      setSession(updated)
      setMessage('Datos guardados.')
    } catch (saveError) {
      setError(saveError.message || 'No se pudieron guardar los datos.')
    } finally {
      setSavingMeta(false)
    }
  }

  async function handleAddPoll() {
    if (!user || !session) {
      return
    }

    setError('')

    try {
      const defaults = buildDefaultLivePoll(polls.length)
      const created = await createLivePoll(user.id, session.id, defaults)
      setPolls((current) => [...current, created])
      setMessage('Poll agregado.')
    } catch (createError) {
      setError(createError.message || 'No se pudo agregar el poll.')
    }
  }

  async function handlePollChange(poll, patch) {
    if (!user) {
      return
    }

    const dbPatch = {}

    if (patch.prompt !== undefined) {
      dbPatch.prompt = patch.prompt
    }

    if (patch.pollType !== undefined) {
      dbPatch.pollType = patch.pollType
    }

    if (patch.options !== undefined) {
      dbPatch.options = patch.options
    }

    setPolls((current) =>
      current.map((entry) =>
        entry.id === poll.id
          ? {
              ...entry,
              ...(patch.prompt !== undefined ? { prompt: patch.prompt } : {}),
              ...(patch.pollType !== undefined ? { poll_type: patch.pollType } : {}),
              ...(patch.options !== undefined ? { options: patch.options } : {}),
            }
          : entry
      )
    )

    try {
      await updateLivePoll(user.id, poll.id, dbPatch)
    } catch (updateError) {
      setError(updateError.message || 'No se pudo actualizar el poll.')
      loadSession()
    }
  }

  async function handleDeletePoll(pollId) {
    if (!user) {
      return
    }

    setPolls((current) => current.filter((entry) => entry.id !== pollId))

    try {
      await deleteLivePoll(user.id, pollId)
    } catch (deleteError) {
      setError(deleteError.message || 'No se pudo eliminar el poll.')
      loadSession()
    }
  }

  async function handleMovePoll(index, direction) {
    if (!user) {
      return
    }

    const targetIndex = index + direction

    if (targetIndex < 0 || targetIndex >= polls.length) {
      return
    }

    const reordered = [...polls]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)
    setPolls(reordered)

    try {
      await Promise.all(
        reordered.map((poll, sortOrder) => updateLivePoll(user.id, poll.id, { sortOrder }))
      )
    } catch {
      loadSession()
    }
  }

  async function handleOpenPoll(pollId) {
    if (!user || !session) {
      return
    }

    setPollBusyId(pollId)
    setError('')

    try {
      const updated = await openLivePoll(user.id, session.id, pollId)
      setPolls((current) =>
        current.map((poll) => ({
          ...poll,
          status: poll.id === updated.id ? 'open' : poll.status === 'open' ? 'closed' : poll.status,
        }))
      )
      setMessage('Poll abierto. Los participantes pueden votar.')
    } catch (openError) {
      setError(openError.message || 'No se pudo abrir el poll.')
    } finally {
      setPollBusyId('')
    }
  }

  async function handleClosePoll(pollId) {
    if (!user) {
      return
    }

    setPollBusyId(pollId)
    setError('')

    try {
      await closeLivePoll(user.id, pollId)
      setPolls((current) =>
        current.map((poll) => (poll.id === pollId ? { ...poll, status: 'closed' } : poll))
      )
      setMessage('Poll cerrado.')
    } catch (closeError) {
      setError(closeError.message || 'No se pudo cerrar el poll.')
    } finally {
      setPollBusyId('')
    }
  }

  async function handleGoLive() {
    if (!user || !session) {
      return
    }

    if (polls.length === 0) {
      setError('Agrega al menos un poll antes de ir en vivo.')
      return
    }

    setStatusUpdating(true)
    setError('')

    try {
      const updated = await updateLiveSessionStatus(user.id, session.id, 'live')
      setSession(updated)
      setMessage('Sesión en vivo. Abre un poll para recibir votos.')
    } catch (liveError) {
      setError(liveError.message || 'No se pudo activar la sesión.')
    } finally {
      setStatusUpdating(false)
    }
  }

  async function handlePause() {
    if (!user || !session) {
      return
    }

    setStatusUpdating(true)

    try {
      const updated = await updateLiveSessionStatus(user.id, session.id, 'paused')
      setSession(updated)
      setMessage('Sesión pausada.')
    } catch (pauseError) {
      setError(pauseError.message || 'No se pudo pausar.')
    } finally {
      setStatusUpdating(false)
    }
  }

  async function handleReactivate() {
    if (!user || !session) {
      return
    }

    setStatusUpdating(true)

    try {
      const updated = await updateLiveSessionStatus(user.id, session.id, 'live')
      setSession(updated)
      setMessage('Sesión reactivada.')
    } catch (reactivateError) {
      setError(reactivateError.message || 'No se pudo reactivar.')
    } finally {
      setStatusUpdating(false)
    }
  }

  async function handleFinalize() {
    if (!user || !session) {
      return
    }

    if (!window.confirm('¿Finalizar la sesión en vivo? No podrá reabrirse.')) {
      return
    }

    setStatusUpdating(true)

    try {
      for (const poll of polls.filter((entry) => entry.status === 'open')) {
        await closeLivePoll(user.id, poll.id)
      }

      const updated = await updateLiveSessionStatus(user.id, session.id, 'closed')
      setSession(updated)
      setPolls((current) =>
        current.map((poll) =>
          poll.status === 'open' ? { ...poll, status: 'closed' } : poll
        )
      )
      setMessage('Sesión finalizada.')
    } catch (finalizeError) {
      setError(finalizeError.message || 'No se pudo finalizar.')
    } finally {
      setStatusUpdating(false)
    }
  }

  if (authLoading || loading) {
    return (
      <main id="interactive-view" className="fade-in">
        <p className="auth-loading">Cargando sesión en vivo...</p>
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

  if (!session || !form) {
    return (
      <main id="interactive-view" className="fade-in">
        <Link to="/interactivo/en-vivo" className="back-btn">← En vivo</Link>
        <div className="auth-message error">{error || 'Sesión no encontrada.'}</div>
      </main>
    )
  }

  const openPoll = polls.find((poll) => poll.status === 'open')

  function handleDownloadResultsWord() {
    const html = buildLiveSessionResultsDocumentHtml(session, polls, votes)
    downloadDocumentWord(html, getLiveSessionResultsFilename(session))
  }

  return (
    <main id="interactive-view" className="fade-in live-session-editor export-document">
      <Link to="/interactivo/en-vivo" className="back-btn">← En vivo</Link>

      <div className="page-head">
        <h1 className="cv-title">{session.title}</h1>
        <p className="cv-desc">Panel de polls en vivo para participantes con código.</p>
        <span className={`interactive-status status-${session.status}`}>
          {getLiveStatusLabel(session.status)}
        </span>
      </div>

      {polls.length > 0 && (
        <ExportProGate profile={profile} featureLabel="de sesión en vivo">
          <ExportActions
            onDownloadWord={handleDownloadResultsWord}
            onPrintPdf={printDocumentPdf}
          />
        </ExportProGate>
      )}

      {message && <div className="auth-message success">{message}</div>}
      {error && <div className="auth-message error">{error}</div>}

      {setupError && (
        <div className="auth-panel survey-setup-alert">
          <h3>Configuración pendiente en Supabase</h3>
          <p>Ejecuta <code>live_polls_v1.sql</code> en SQL Editor.</p>
        </div>
      )}

      <section className="auth-panel survey-management-bar">
        <h3>Gestionar sesión</h3>
        <div className="survey-management-actions">
          {session.status === 'draft' && (
            <button
              type="button"
              className="btn-primary"
              disabled={statusUpdating || polls.length === 0}
              onClick={handleGoLive}
            >
              {statusUpdating ? 'Activando...' : 'Ir en vivo'}
            </button>
          )}

          {session.status === 'live' && (
            <>
              <button
                type="button"
                className="timer-btn timer-btn-secondary"
                disabled={statusUpdating}
                onClick={handlePause}
              >
                Pausar sesión
              </button>
              <button
                type="button"
                className="timer-btn timer-btn-ghost"
                disabled={statusUpdating}
                onClick={handleFinalize}
              >
                Finalizar sesión
              </button>
            </>
          )}

          {session.status === 'paused' && (
            <>
              <button
                type="button"
                className="btn-primary"
                disabled={statusUpdating}
                onClick={handleReactivate}
              >
                Reactivar sesión
              </button>
              <button
                type="button"
                className="timer-btn timer-btn-ghost"
                disabled={statusUpdating}
                onClick={handleFinalize}
              >
                Finalizar sesión
              </button>
            </>
          )}
        </div>

        {openPoll && session.status === 'live' && (
          <p className="live-active-hint">
            Poll activo: <strong>{openPoll.prompt}</strong> — los votos se actualizan cada 3 s.
          </p>
        )}
      </section>

      <AccessCodePanel code={accessCode} resourceLabel="Sesión en vivo" />

      <section className="auth-panel survey-questions-panel">
        <h3>Polls ({polls.length})</h3>
        <p className="workshop-section-copy">
          Diseña las preguntas. Cuando estés en vivo, abre un poll a la vez para que voten.
        </p>
        <button type="button" className="timer-btn timer-btn-primary" onClick={handleAddPoll}>
          + Nuevo poll
        </button>
      </section>

      <div className="survey-question-list">
        {polls.length === 0 ? (
          <div className="auth-panel">
            <p>Agrega polls antes de ir en vivo.</p>
          </div>
        ) : (
          polls.map((poll, index) => (
            <LivePollCard
              key={poll.id}
              poll={poll}
              index={index}
              sessionStatus={session.status}
              busy={pollBusyId === poll.id}
              results={computePollResults(poll, votes)}
              isFirst={index === 0}
              isLast={index === polls.length - 1}
              onChange={(patch) => handlePollChange(poll, patch)}
              onDelete={() => handleDeletePoll(poll.id)}
              onMoveUp={() => handleMovePoll(index, -1)}
              onMoveDown={() => handleMovePoll(index, 1)}
              onOpen={() => handleOpenPoll(poll.id)}
              onClose={() => handleClosePoll(poll.id)}
            />
          ))
        )}
      </div>

      <form className="auth-panel interactive-form" onSubmit={handleSaveMeta}>
        <h3>Datos de la sesión</h3>
        <div className="form-grid">
          <div className="field full">
            <label htmlFor="live-editor-title">Nombre</label>
            <input
              id="live-editor-title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </div>
          <div className="field full">
            <label htmlFor="live-editor-org">Organización</label>
            <input
              id="live-editor-org"
              value={form.organization}
              onChange={(event) => setForm({ ...form, organization: event.target.value })}
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
          onClick={() => navigate('/interactivo/en-vivo')}
        >
          Volver al listado
        </button>
      </div>
    </main>
  )
}
