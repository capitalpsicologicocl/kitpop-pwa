import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { createJournalEntry } from '../../services/journalService'

export default function ActivityJournalForm({
  activitySlug,
  activityTitle,
}) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [entryDate, setEntryDate] = useState('')
  const [organization, setOrganization] = useState('')
  const [participantsCount, setParticipantsCount] = useState('')
  const [durationReal, setDurationReal] = useState('')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!user) {
      navigate('/login')
      return
    }

    setSubmitting(true)

    try {
      await createJournalEntry(user.id, {
        activitySlug,
        entryDate: entryDate || null,
        organization,
        participantsCount: participantsCount ? Number(participantsCount) : null,
        durationReal,
        notes,
      })

      setMessage('Registro guardado en tu bitácora KitPOP.')
      setOrganization('')
      setParticipantsCount('')
      setDurationReal('')
      setNotes('')
    } catch (submitError) {
      setError(submitError.message || 'No se pudo guardar el registro.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="activity-pane">
      <div className="content-card">
        <h3>Registrar experiencia en bitácora</h3>

        {activityTitle && (
          <p className="profile-meta">
            Actividad: <strong>{activityTitle}</strong>
          </p>
        )}

        {!user && (
          <div className="auth-message info">
            <Link to="/login">Inicia sesión</Link> para guardar registros en
            Supabase.
          </div>
        )}

        {message && <div className="auth-message success">{message}</div>}
        {error && <div className="auth-message error">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="journal-date">Fecha</label>
            <input
              id="journal-date"
              type="date"
              value={entryDate}
              onChange={(event) => setEntryDate(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="journal-org">Organización</label>
            <input
              id="journal-org"
              type="text"
              value={organization}
              onChange={(event) => setOrganization(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="journal-participants">Participantes</label>
            <input
              id="journal-participants"
              type="number"
              min="1"
              value={participantsCount}
              onChange={(event) => setParticipantsCount(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="journal-duration">Duración real</label>
            <input
              id="journal-duration"
              type="text"
              value={durationReal}
              onChange={(event) => setDurationReal(event.target.value)}
            />
          </div>

          <div className="field full">
            <label htmlFor="journal-notes">Notas y aprendizajes</label>
            <textarea
              id="journal-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <div className="field full">
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : 'Guardar registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
