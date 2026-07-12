import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import {
  fetchWorkshopById,
  fetchWorkshopSessions,
  formatItemTime,
  formatSessionDuration,
} from '../../services/workshopService'
import {
  buildWorkshopDocumentHtml,
  downloadWorkshopWord,
  printWorkshopPdf,
} from '../../utils/workshopExport'
import {
  getPauseLabel,
  getWorkshopStatusLabel,
  getWorkshopTimeSummary,
  ITEM_TYPE_LABELS,
} from '../../utils/workshopHelpers'

export default function WorkshopSummary() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
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
  const filename = workshop.title.replace(/[^\w\s-]/g, '').trim() || 'taller-kitpop'

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
      </div>

      <div className="workshop-summary-actions no-print">
        <button type="button" className="btn-primary" onClick={handleDownloadWord}>
          Descargar Word
        </button>
        <button type="button" className="timer-btn timer-btn-secondary" onClick={printWorkshopPdf}>
          Descargar PDF
        </button>
      </div>

      <article className="auth-panel workshop-summary-document">
        <header className="workshop-summary-head">
          <p className="workshop-summary-kicker">KitPOP · Diseño de taller</p>
          <h1>{workshop.title}</h1>
          <span className="interactive-status status-ready">
            {getWorkshopStatusLabel(workshop.status)}
          </span>
        </header>

        <section className="workshop-summary-meta">
          {workshop.organization && <p><strong>Organización:</strong> {workshop.organization}</p>}
          {workshop.team && <p><strong>Equipo / área:</strong> {workshop.team}</p>}
          {workshop.audience && <p><strong>Público:</strong> {workshop.audience}</p>}
          {workshop.modality && <p><strong>Modalidad:</strong> {workshop.modality}</p>}
          {workshop.participants_count && (
            <p><strong>Participantes:</strong> {workshop.participants_count}</p>
          )}
          {workshop.objective && <p><strong>Objetivo:</strong> {workshop.objective}</p>}
        </section>

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
            <h2>Sesión {session.session_number}</h2>
            <p className="interactive-item-meta">
              Tiempo programado: {formatSessionDuration(session.duration_hours, session.duration_minutes)}
              {' · '}
              Tiempo diseñado:{' '}
              {formatItemTime(
                (session.workshop_items ?? []).reduce(
                  (total, item) => total + (item.time_minutes ?? 0),
                  0
                )
              )}
            </p>

            <table className="workshop-session-table workshop-summary-table">
              <thead>
                <tr>
                  <th>Tiempo</th>
                  <th>Actividad / módulo</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {(session.workshop_items ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={3}>Sin ítems en esta sesión.</td>
                  </tr>
                ) : (
                  session.workshop_items.map((item) => (
                    <tr key={item.id}>
                      <td>{formatItemTime(item.time_minutes)}</td>
                      <td>
                        <strong>{item.title}</strong>
                        <br />
                        <small>
                          {item.item_type === 'pause'
                            ? getPauseLabel(item.pause_type)
                            : ITEM_TYPE_LABELS[item.item_type]}
                        </small>
                      </td>
                      <td>{item.description || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {session.journal_notes && (
              <div className="workshop-summary-journal">
                <strong>Bitácora de sesión</strong>
                <p>{session.journal_notes}</p>
              </div>
            )}
          </section>
        ))}
      </article>
    </main>
  )
}
