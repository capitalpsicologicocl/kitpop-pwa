import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import InteractiveNav from '../../components/interactive/InteractiveNav'
import { useAuth } from '../../context/AuthContext'
import { fetchLiveSessions } from '../../services/liveSessionService'
import { fetchSurveys } from '../../services/surveyService'
import { fetchWorkshops } from '../../services/workshopService'
import { getPlanLabel, getPlanLimits } from '../../utils/planLimits'

export default function InteractiveHub() {
  const { user, profile, loading } = useAuth()
  const [counts, setCounts] = useState({
    workshops: 0,
    surveys: 0,
    live: 0,
  })

  useEffect(() => {
    if (!user || loading) {
      return
    }

    let mounted = true

    async function loadCounts() {
      try {
        const [workshops, surveys, liveSessions] = await Promise.all([
          fetchWorkshops(user.id),
          fetchSurveys(user.id),
          fetchLiveSessions(user.id),
        ])

        if (mounted) {
          setCounts({
            workshops: workshops.length,
            surveys: surveys.length,
            live: liveSessions.length,
          })
        }
      } catch {
        if (mounted) {
          setCounts({ workshops: 0, surveys: 0, live: 0 })
        }
      }
    }

    loadCounts()

    return () => {
      mounted = false
    }
  }, [user, loading])

  if (loading) {
    return (
      <main id="interactive-view" className="fade-in">
        <p className="auth-loading">Cargando espacio interactivo...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main id="interactive-view" className="fade-in">
        <Link to="/" className="back-btn">
          ← Volver
        </Link>

        <div className="auth-panel">
          <h1>Espacio interactivo</h1>
          <p>Inicia sesión para crear talleres, encuestas y sesiones en vivo.</p>
          <div className="auth-actions">
            <Link to="/login" className="btn-primary btn-link">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const limits = getPlanLimits(profile)

  return (
    <main id="interactive-view" className="fade-in">
      <Link to="/perfil" className="back-btn">
        ← Volver al perfil
      </Link>

      <div className="page-head">
        <h1 className="cv-title">Espacio interactivo</h1>
        <p className="cv-desc">
          Talleres, encuestas y polls en vivo para facilitar con datos reales.
        </p>
        <span className="profile-badge">{getPlanLabel(profile)}</span>
      </div>

      <InteractiveNav />

      <div className="profile-hub-grid">
        <Link to="/interactivo/talleres" className="profile-hub-card">
          <span className="profile-hub-icon">🛠</span>
          <strong>Talleres</strong>
          <p>Diseña sesiones con actividades KitPOP.</p>
          <span className="profile-hub-count">
            {counts.workshops} / {limits.workshops === Infinity ? '∞' : limits.workshops}
          </span>
        </Link>

        <Link to="/interactivo/encuestas" className="profile-hub-card">
          <span className="profile-hub-icon">📋</span>
          <strong>Encuestas</strong>
          <p>Satisfacción y feedback post-taller.</p>
          <span className="profile-hub-count">
            {counts.surveys} / {limits.surveys === Infinity ? '∞' : limits.surveys}
          </span>
        </Link>

        <Link to="/interactivo/en-vivo" className="profile-hub-card">
          <span className="profile-hub-icon">📡</span>
          <strong>En vivo</strong>
          <p>Polls sincronizados con participantes.</p>
          <span className="profile-hub-count">
            {counts.live} / {limits.liveSessions === Infinity ? '∞' : limits.liveSessions}
          </span>
        </Link>
      </div>

      <div className="auth-panel interactive-note">
        <h3>Fase 7 — Base lista</h3>
        <p>
          Ya puedes crear borradores, generar códigos y enlaces para participantes
          (<code>/p/CODIGO</code>). Los editores completos llegan en Fases 8–10.
        </p>
      </div>
    </main>
  )
}
