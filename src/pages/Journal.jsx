import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { getActivityBySlug } from '../data/kitpopAdapter'
import {
  deleteJournalEntry,
  fetchJournalEntries,
} from '../services/journalService'

function formatDate(value) {
  if (!value) {
    return 'Sin fecha'
  }

  return new Date(`${value}T12:00:00`).toLocaleDateString('es-CL')
}

export default function Journal() {
  const { user, loading: authLoading } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }

    let mounted = true

    async function loadEntries() {
      setLoading(true)
      setError('')

      try {
        const data = await fetchJournalEntries(user.id)

        if (mounted) {
          setEntries(data)
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'No se pudieron cargar los registros.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadEntries()

    return () => {
      mounted = false
    }
  }, [authLoading, user])

  async function handleDelete(entryId) {
    if (!user) {
      return
    }

    try {
      await deleteJournalEntry(user.id, entryId)
      setEntries((current) => current.filter((entry) => entry.id !== entryId))
    } catch (deleteError) {
      setError(deleteError.message || 'No se pudo eliminar el registro.')
    }
  }

  if (authLoading || loading) {
    return (
      <main id="journal-view" className="fade-in">
        <p className="auth-loading">Cargando bitácora...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main id="journal-view" className="fade-in">
        <Link to="/" className="back-btn">
          ← Volver
        </Link>

        <div className="page-head">
          <h1 className="cv-title">Bitácora de facilitación</h1>
          <p className="cv-desc">
            Registros por actividad, fecha, organización y resultado.
          </p>
        </div>

        <div className="auth-panel">
          <p>Inicia sesión para guardar y consultar tu bitácora.</p>
          <div className="auth-actions">
            <Link to="/login" className="btn-primary btn-link">
              Iniciar sesión
            </Link>
            <Link to="/registro" className="btn-secondary btn-link">
              Crear cuenta
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main id="journal-view" className="fade-in">
      <Link to="/perfil" className="back-btn">
        ← Volver al perfil
      </Link>

      <div className="page-head">
        <h1 className="cv-title">Bitácora de facilitación</h1>
        <p className="cv-desc">
          {entries.length}{' '}
          {entries.length === 1 ? 'registro guardado' : 'registros guardados'}.
        </p>
      </div>

      {error && <div className="auth-message error">{error}</div>}

      {entries.length === 0 ? (
        <div className="home-panel">
          <p>
            Aún no tienes registros. Guarda experiencias desde la pestaña
            Bitácora de cualquier actividad.
          </p>
        </div>
      ) : (
        <div className="journal-list">
          {entries.map((entry) => {
            const activity = entry.activity_slug
              ? getActivityBySlug(entry.activity_slug)
              : null

            return (
              <article key={entry.id} className="journal-item">
                <div className="journal-item-head">
                  <h3>{activity?.title || 'Registro de facilitación'}</h3>

                  {entry.activity_slug && (
                    <Link to={`/actividad/${entry.activity_slug}`}>
                      Ver actividad
                    </Link>
                  )}
                </div>

                <div className="journal-item-meta">
                  <span>{formatDate(entry.entry_date)}</span>
                  {entry.organization && <span>{entry.organization}</span>}
                  {entry.participants_count && (
                    <span>{entry.participants_count} participantes</span>
                  )}
                  {entry.duration_real && <span>{entry.duration_real}</span>}
                </div>

                {entry.notes && <p>{entry.notes}</p>}

                <div className="auth-actions">
                  <button
                    type="button"
                    className="journal-delete"
                    onClick={() => handleDelete(entry.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
