import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { categories } from '../../data/categories'
import { searchActivities } from '../../utils/searchActivities'

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { user, profile, favoriteSlugs, signOut } = useAuth()
  const [query, setQuery] = useState('')
  const [categorySlug, setCategorySlug] = useState('all')
  const [duration, setDuration] = useState('all')
  const [favoritesOnly, setFavoritesOnly] = useState('all')

  const results = useMemo(() => {
    if (!user) {
      return []
    }

    const trimmedQuery = query.trim()

    if (favoritesOnly === 'fav' && !user) {
      return []
    }

    if (!trimmedQuery && favoritesOnly !== 'fav') {
      return []
    }

    return searchActivities({
      query: trimmedQuery,
      categorySlug,
      duration,
      favoritesOnly: favoritesOnly === 'fav',
      favoriteSlugs,
    }).slice(0, 8)
  }, [query, categorySlug, duration, favoritesOnly, favoriteSlugs, user])

  function handleSubmit(event) {
    event.preventDefault()

    const trimmedQuery = query.trim()

    if (!trimmedQuery && favoritesOnly !== 'fav') {
      return
    }

    if (favoritesOnly === 'fav' && !user) {
      onClose()
      navigate('/login')
      return
    }

    if (!user) {
      onClose()
      navigate('/login', {
        state: {
          from: {
            pathname: '/buscar',
            search: trimmedQuery ? `?q=${encodeURIComponent(trimmedQuery)}` : '',
          },
        },
      })
      return
    }

    const params = new URLSearchParams()

    if (trimmedQuery) {
      params.set('q', trimmedQuery)
    }

    if (categorySlug !== 'all') {
      params.set('categoria', categorySlug)
    }

    if (duration !== 'all') {
      params.set('duracion', duration)
    }

    if (favoritesOnly === 'fav') {
      params.set('favoritas', '1')
    }

    onClose()
    navigate(`/buscar?${params.toString()}`)
  }

  return (
    <>
      <div
        className={`kp-menu-backdrop ${isOpen ? 'on' : ''}`}
        onClick={onClose}
      />

      <aside
        className={`kp-menu-drawer ${isOpen ? 'on' : ''}`}
        aria-hidden={!isOpen}
      >
        <div className="kp-menu-head">
          <img src="/kitpop-logo.png" alt="KitPOP de Facilitación" />

          <button
            className="kp-menu-close"
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            ×
          </button>
        </div>

        <div className="kp-auth-box">
          <p className="kp-menu-label">Cuenta KitPOP</p>

          {user ? (
            <>
              <div className="kp-auth-user">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="kp-auth-avatar"
                  />
                ) : (
                  <span className="kp-auth-avatar kp-auth-avatar-fallback" aria-hidden="true">
                    {(profile?.full_name || user.email || 'K').slice(0, 1).toUpperCase()}
                  </span>
                )}

                <p className="kp-menu-note">
                  Hola, {profile?.full_name || user.email}
                </p>
              </div>

              <div className="kp-auth-actions">
                <Link to="/perfil" onClick={onClose}>Mi espacio</Link>
                <button type="button" onClick={signOut}>Cerrar sesión</button>
              </div>
            </>
          ) : (
            <>
              <div className="kp-auth-actions">
                <Link to="/login" onClick={onClose}>Iniciar sesión</Link>
                <Link to="/registro" onClick={onClose}>Registro</Link>
              </div>

              <p className="kp-menu-note">
                Con tu cuenta puedes guardar favoritos y bitácoras.
              </p>
            </>
          )}
        </div>

        {user ? (
          <div className="kp-menu-section">
            <p className="kp-menu-label">Buscar actividades</p>

            <form onSubmit={handleSubmit}>
              <input
                className="kp-menu-input"
                placeholder="Buscar por nombre, objetivo o material."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />

              <div className="kp-menu-filters">
                <select
                  value={categorySlug}
                  onChange={(event) => setCategorySlug(event.target.value)}
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.title}
                    </option>
                  ))}
                </select>

                <select
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                >
                  <option value="all">Cualquier duración</option>
                  <option value="short">Hasta 15 min</option>
                  <option value="medium">16 a 35 min</option>
                  <option value="long">36 min o más</option>
                </select>

                <select
                  value={favoritesOnly}
                  onChange={(event) => setFavoritesOnly(event.target.value)}
                >
                  <option value="all">Todas</option>
                  <option value="fav">Favoritas</option>
                </select>
              </div>

              <button type="submit" className="kp-menu-search-btn">
                Buscar
              </button>
            </form>

            <div className="kp-menu-results">
              {favoritesOnly === 'fav' && favoriteSlugs.length === 0 ? (
                <p className="kp-menu-empty">
                  Aún no tienes actividades favoritas guardadas.
                </p>
              ) : results.length > 0 ? (
                results.map((activity) => (
                  <Link
                    key={activity.slug}
                    to={`/actividad/${activity.slug}`}
                    className="kp-menu-result-item"
                    onClick={onClose}
                  >
                    <strong>{activity.title}</strong>
                    <span>{activity.categoryLabel}</span>
                  </Link>
                ))
              ) : (
                <p className="kp-menu-empty">
                  {query.trim()
                    ? 'No hay coincidencias rápidas. Pulsa Buscar para ver todos los resultados.'
                    : 'Escribe una palabra para buscar actividades.'}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="kp-menu-section">
            <p className="kp-menu-label">Banco de actividades</p>
            <p className="kp-menu-note">
              Inicia sesión para buscar dinámicas y explorar categorías.
            </p>
          </div>
        )}

        {user && (
          <div className="kp-menu-section">
            <p className="kp-menu-label">Diseño de talleres</p>
            <Link to="/talleres" className="kp-menu-workshop-btn" onClick={onClose}>
              <span className="kp-menu-workshop-icon" aria-hidden="true">
                ◫
              </span>
              Diseña tu Workshop
            </Link>
          </div>
        )}

        <div className="kp-menu-section">
          <p className="kp-menu-label">Navegación</p>

          <div className="kp-menu-cats">
            <Link to="/" className="kp-menu-cat-btn" onClick={onClose}>
              Inicio
            </Link>

            {user &&
              categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/categoria/${category.slug}`}
                  className="kp-menu-cat-btn"
                  onClick={onClose}
                >
                  {category.title}
                </Link>
              ))}

            <Link to="/interactivo" className="kp-menu-cat-btn" onClick={onClose}>
              Espacio interactivo
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
