import { Link } from 'react-router-dom'

import ActivityList from '../components/categories/ActivityList'
import { useAuth } from '../context/AuthContext'
import { activities } from '../data/activities'

export default function Favorites() {
  const { user, loading, favoriteSlugs } = useAuth()

  const favoriteActivities = activities.filter((activity) =>
    favoriteSlugs.includes(activity.slug)
  )

  if (loading) {
    return (
      <main id="favorites-view" className="fade-in">
        <p className="auth-loading">Cargando favoritos...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main id="favorites-view" className="fade-in">
        <Link to="/" className="back-btn">
          ← Volver
        </Link>

        <div className="page-head">
          <h1 className="cv-title">Favoritos</h1>
          <p className="cv-desc">Selección personal de actividades.</p>
        </div>

        <div className="auth-panel">
          <p>Inicia sesión para guardar y ver tus actividades favoritas.</p>
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
    <main id="favorites-view" className="fade-in">
      <Link to="/" className="back-btn">
        ← Volver
      </Link>

      <div className="page-head">
        <h1 className="cv-title">Favoritos</h1>
        <p className="cv-desc">
          {favoriteActivities.length}{' '}
          {favoriteActivities.length === 1 ? 'actividad guardada' : 'actividades guardadas'}.
        </p>
      </div>

      <ActivityList
        items={favoriteActivities}
        useActivityIcons
        emptyTitle="Aún no tienes favoritos"
        emptyDescription="Marca actividades con ☆ desde la vista de detalle."
      />
    </main>
  )
}
