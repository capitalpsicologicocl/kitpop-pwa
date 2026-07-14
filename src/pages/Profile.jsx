import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import PlanSection from '../components/profile/PlanSection'
import { useAuth } from '../context/AuthContext'
import { fetchJournalEntries } from '../services/journalService'
import { syncPayPalSubscription } from '../services/paypalService'
import { fetchWorkshops } from '../services/workshopService'

function getInitials(name = '', email = '') {
  const source = name.trim() || email.trim()

  if (!source) {
    return 'KP'
  }

  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

export default function Profile() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const fileInputRef = useRef(null)
  const {
    user,
    profile,
    favoriteSlugs,
    loading,
    saveProfile,
    saveAvatar,
    refreshProfile,
    signOut,
  } = useAuth()
  const [fullName, setFullName] = useState('')
  const [journalCount, setJournalCount] = useState(0)
  const [workshopCount, setWorkshopCount] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [facilitationFilter, setFacilitationFilter] = useState('todas')

  useEffect(() => {
    setFullName(profile?.full_name ?? '')
  }, [profile])

  useEffect(() => {
    const checkoutState = searchParams.get('checkout')
    const subscriptionId = searchParams.get('subscription_id')

    if (!user || !checkoutState) {
      return
    }

    async function handleCheckoutReturn() {
      if (checkoutState === 'success') {
        if (subscriptionId) {
          try {
            await syncPayPalSubscription(subscriptionId)
            setMessage('¡KitPOP Pro activado! Ya puedes crear sin límites.')
          } catch {
            setMessage(
              'Pago recibido. Tu plan Pro se activará en unos segundos.'
            )
          }
        } else {
          setMessage('Pago recibido. Tu plan Pro se activará en unos segundos.')
        }

        await refreshProfile(user.id)
      } else if (checkoutState === 'canceled') {
        setMessage('Pago cancelado. Puedes activar Pro cuando quieras.')
      }

      setSearchParams({}, { replace: true })
    }

    handleCheckoutReturn()
  }, [refreshProfile, searchParams, setSearchParams, user])

  useEffect(() => {
    if (!user || loading) {
      return
    }

    let mounted = true

    async function loadCounts() {
      try {
        const [entries, workshops] = await Promise.all([
          fetchJournalEntries(user.id),
          fetchWorkshops(user.id),
        ])

        if (mounted) {
          setJournalCount(entries.length)
          setWorkshopCount(workshops.length)
        }
      } catch {
        if (mounted) {
          setJournalCount(0)
          setWorkshopCount(0)
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
      <main id="profile-view" className="fade-in">
        <p className="auth-loading">Cargando perfil...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main id="profile-view" className="fade-in">
        <Link to="/" className="back-btn">
          ← Volver
        </Link>

        <div className="auth-panel">
          <h1>Mi espacio KitPOP</h1>
          <p>Inicia sesión para acceder a tu perfil, favoritos, bitácora y talleres.</p>
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

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    setSubmitting(true)

    try {
      await saveProfile(fullName)
      setMessage('Perfil actualizado correctamente.')
    } catch (submitError) {
      setError(submitError.message || 'No se pudo guardar el perfil.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setMessage('')
    setError('')
    setUploadingAvatar(true)

    try {
      await saveAvatar(file)
      setMessage('Foto de perfil actualizada.')
    } catch (uploadError) {
      setError(uploadError.message || 'No se pudo subir la foto.')
    } finally {
      setUploadingAvatar(false)
      event.target.value = ''
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const displayName = profile?.full_name?.trim() || 'Facilitador/a KitPOP'
  const initials = getInitials(profile?.full_name, user.email)
  const activeTab = searchParams.get('tab') === 'plan'
    ? 'plan'
    : searchParams.get('tab') === 'cuenta'
      ? 'cuenta'
      : 'facilitacion'

  function setProfileTab(tab) {
    if (tab === 'facilitacion') {
      setSearchParams({}, { replace: true })
      return
    }

    setSearchParams({ tab }, { replace: true })
  }

  const hubCards = [
    {
      id: 'talleres',
      filter: 'talleres',
      to: '/talleres',
      icon: '🛠',
      title: 'Talleres / Workshops',
      copy: 'Diseña sesiones, actividades y pausas. Descarga la estructura en Word o PDF.',
      count: `${workshopCount} taller${workshopCount === 1 ? '' : 'es'}`,
      featured: true,
    },
    {
      id: 'reuniones',
      filter: 'reuniones',
      to: '/interactivo',
      icon: '⚡',
      title: 'Reuniones interactivas',
      copy: 'Encuestas y polls en vivo con códigos para participantes.',
      count: 'Encuestas · En vivo',
    },
    {
      id: 'favoritos',
      filter: 'todas',
      to: '/favoritos',
      icon: '☆',
      title: 'Favoritos',
      copy: 'Actividades que marcaste para usar después.',
      count: `${favoriteSlugs.length} guardada${favoriteSlugs.length === 1 ? '' : 's'}`,
    },
    {
      id: 'bitacora',
      filter: 'todas',
      to: '/bitacora',
      icon: '📓',
      title: 'Bitácora',
      copy: 'Registros de sesiones y aprendizajes de facilitación.',
      count: `${journalCount} registro${journalCount === 1 ? '' : 's'}`,
    },
  ]

  const visibleHubCards = hubCards.filter((card) => {
    if (facilitationFilter === 'todas') {
      return true
    }

    return card.filter === facilitationFilter
  })

  return (
    <main id="profile-view" className="fade-in">
      <Link to="/" className="back-btn">
        ← Volver al inicio
      </Link>

      <div className="profile-hub">
        <div className="profile-tabs" role="tablist" aria-label="Secciones del perfil">
          <button
            type="button"
            role="tab"
            className={`profile-tab-btn${activeTab === 'facilitacion' ? ' active' : ''}`}
            aria-selected={activeTab === 'facilitacion'}
            onClick={() => setProfileTab('facilitacion')}
          >
            Facilitación
          </button>
          <button
            type="button"
            role="tab"
            className={`profile-tab-btn${activeTab === 'cuenta' ? ' active' : ''}`}
            aria-selected={activeTab === 'cuenta'}
            onClick={() => setProfileTab('cuenta')}
          >
            Cuenta
          </button>
          <button
            type="button"
            role="tab"
            className={`profile-tab-btn${activeTab === 'plan' ? ' active' : ''}`}
            aria-selected={activeTab === 'plan'}
            onClick={() => setProfileTab('plan')}
          >
            Plan
          </button>
        </div>

        {activeTab === 'cuenta' && (
        <section className="auth-panel profile-card">
          <div className="profile-head">
            <div className="profile-avatar-wrap">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar profile-avatar-fallback" aria-hidden="true">
                  {initials}
                </div>
              )}

              <button
                type="button"
                className="profile-avatar-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="profile-avatar-input"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="profile-head-copy">
              <h1>{displayName}</h1>
              <p>{user.email}</p>
            </div>
          </div>

          {message && <div className="auth-message success">{message}</div>}
          {error && <div className="auth-message error">{error}</div>}

          <form className="form-grid profile-form" onSubmit={handleSubmit}>
            <div className="field full">
              <label htmlFor="profile-name">Nombre para mostrar</label>
              <input
                id="profile-name"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>

            <div className="field full auth-actions">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar nombre'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleSignOut}>
                Cerrar sesión
              </button>
            </div>
          </form>
        </section>
        )}

        {activeTab === 'plan' && (
          <PlanSection
            profile={profile}
            onPlanChange={() => user && refreshProfile(user.id)}
          />
        )}

        {activeTab === 'facilitacion' && (
        <section className="profile-section">
          <div className="profile-section-head">
            <h2>Tu espacio de facilitación</h2>
            <p>Diseño de talleres / reuniones y herramientas interactivas.</p>
          </div>

          <div className="facilitation-filter-tabs" role="tablist" aria-label="Filtrar herramientas">
            {[
              { id: 'todas', label: 'Todas' },
              { id: 'talleres', label: 'Talleres / Workshops' },
              { id: 'reuniones', label: 'Reuniones' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                role="tab"
                className={`facilitation-filter-btn${facilitationFilter === option.id ? ' active' : ''}`}
                aria-selected={facilitationFilter === option.id}
                onClick={() => setFacilitationFilter(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="profile-hub-grid">
            {visibleHubCards.map((card) => (
              <Link
                key={card.id}
                to={card.to}
                className={`profile-hub-card${card.featured ? ' profile-hub-card-featured' : ''}`}
              >
                <span className="profile-hub-icon">{card.icon}</span>
                <strong>{card.title}</strong>
                <p>{card.copy}</p>
                <span className="profile-hub-count">{card.count}</span>
              </Link>
            ))}
          </div>
        </section>
        )}
      </div>
    </main>
  )
}
