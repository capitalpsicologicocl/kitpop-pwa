import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import WorkshopObjectiveSections from '../../components/workshop/WorkshopObjectiveSections'
import WorkshopSummarySessionTable, {
  WorkshopSummarySessionMeta,
} from '../../components/workshop/WorkshopSummarySessionTable'
import {
  fetchWorkshopById,
  fetchWorkshopSessions,
  formatItemTime,
} from '../../services/workshopService'
import {
  buildWorkshopDocumentHtml,
  downloadWorkshopWord,
  getWorkshopFilename,
  printWorkshopPdf,
} from '../../utils/workshopExport'
import ExportActions from '../../components/export/ExportActions'
import ExportProGate from '../../components/export/ExportProGate'
import {
  getWorkshopStatusLabel,
  getWorkshopTimeSummary,
} from '../../utils/workshopHelpers'

export default function WorkshopSummary() {
  const { id } = useParams()
  const { user, profile, loading: authLoading } = useAuth()
  const [workshop, setWorkshop] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSummary = useCallback(async () => {
    if (!user || !id) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const [workshopData, sessionData] = await Promise.all([
        fetchWorkshopById(user.id, id),
        fetchWorkshopSessions(user.id, id),
      ])

      if (!workshopData) {
        setError('No encontramos este taller.')
        return
      }

      setWorkshop(workshopData)
      setSessions(sessionData)
    } catch (loadError) {
      setError(loadError.message || 'No se pudo cargar la estructura del taller.')
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

    loadSummary()
  }, [authLoading, loadSummary, user])

  if (authLoading || loading) {
    return (
      <main id="workshops-view" className="fade-in">
        <p className="auth-loading">Cargando estructura del taller...</p>
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

  if (!workshop) {
    return (
      <main id="workshops-view" className="fade-in">
        <Link to="/talleres" className="back-btn">
          ← Talleres
        </Link>
        <div className="auth-message error">{error || 'Taller no encontrado.'}</div>
      </main>
    )
  }

  const timeSummary = getWorkshopTimeSummary(sessions)
  const filename = getWorkshopFilename(workshop)

  function handleDownloadWord() {
    const html = buildWorkshopDocumentHtml(workshop, sessions, timeSummary)
    downloadWorkshopWord(html, filename)
  }

  return (
    <main id="workshops-view" className="fade-in workshop-summary">
      <div className="workshop-summary-toolbar no-print">
        <Link to={`/talleres/${workshop.id}`} className="back-btn">
          ← Editar diseño
        </Link>
        <Link to="/talleres" className="back-btn">
          Listado de talleres
        </Link>
        <Link
          to={`/talleres/${workshop.id}#workshop-journal-general`}
          className="back-btn workshop-summary-journal-link"
        >
          Bitácora del taller
        </Link>
      </div>

      <ExportProGate profile={profile} featureLabel="del taller">
        <ExportActions
          onDownloadWord={handleDownloadWord}
          onPrintPdf={printWorkshopPdf}
        />
      </ExportProGate>

      <article className="auth-panel workshop-summary-document">
        <header className="workshop-summary-head">
          <p className="workshop-summary-kicker">KitPOP · Diseño de taller</p>
          <h1>{workshop.title}</h1>
          <span className="interactive-status status-ready">
            {getWorkshopStatusLabel(workshop.status)}
          </span>
        </header>

        <section className="workshop-summary-meta">
          {workshop.organization && (
            <p>
              <strong>Organización:</strong> {workshop.organization}
            </p>
          )}
          {workshop.team && (
            <p>
              <strong>Equipo / área:</strong> {workshop.team}
            </p>
          )}
          {workshop.audience && (
            <p>
              <strong>Público:</strong> {workshop.audience}
            </p>
          )}
          {workshop.modality && (
            <p>
              <strong>Modalidad:</strong> {workshop.modality}
            </p>
          )}
          {workshop.participants_count && (
            <p>
              <strong>Participantes:</strong> {workshop.participants_count}
            </p>
          )}
        </section>

        <WorkshopObjectiveSections objective={workshop.objective} />

        <section className="workshop-time-summary compact">
          <h2>Resumen de tiempos</h2>
          <div className="workshop-time-total">
            <div>
              <span>Total programado</span>
              <strong>{formatItemTime(timeSummary.totalPlanned)}</strong>
            </div>
            <div>
              <span>Total diseñado</span>
              <strong>{formatItemTime(timeSummary.totalDesigned)}</strong>
            </div>
          </div>
        </section>

        {sessions.map((session) => (
          <section key={session.id} className="workshop-summary-session">
            <div className="workshop-summary-session-head">
              <h2>Sesión {session.session_number}</h2>
              <Link
                to={`/talleres/${workshop.id}#journal-${session.id}`}
                className="workshop-summary-journal-link no-print"
              >
                Bitácora de sesión
              </Link>
            </div>

            <WorkshopSummarySessionMeta session={session} />

            <WorkshopSummarySessionTable session={session} />

            {session.journal_notes && (
              <div className="workshop-summary-journal">
                <strong>Bitácora de sesión</strong>
                <p>{session.journal_notes}</p>
              </div>
            )}
          </section>
        ))}

        {workshop.journal_notes && (
          <section className="workshop-summary-journal workshop-summary-journal-general">
            <div className="workshop-summary-session-head">
              <h2>Bitácora general del taller</h2>
              <Link
                to={`/talleres/${workshop.id}#workshop-journal-general`}
                className="workshop-summary-journal-link no-print"
              >
                Editar bitácora
              </Link>
            </div>
            <p>{workshop.journal_notes}</p>
          </section>
        )}
      </article>
    </main>
  )
}
