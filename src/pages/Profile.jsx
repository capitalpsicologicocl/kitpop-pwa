import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { fetchJournalEntries } from '../services/journalService'
import { fetchWorkshops } from '../services/workshopService'
import { getPlanLabel } from '../utils/planLimits'

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
  const fileInputRef = useRef(null)
  const {
    user,
    profile,
    favoriteSlugs,
    loading,
    saveProfile,
    saveAvatar,
    signOut,
  } = useAuth()
  const [fullName, setFullName] = useState('')
  const [journalCount, setJournalCount] = useState(0)
  const [workshopCount, setWorkshopCount] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    setFullName(profile?.full_name ?? '')
  }, [profile])

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

  return (
    <main id="profile-view" className="fade-in">
      <Link to="/" className="back-btn">
        ← Volver al inicio
      </Link>

      <div className="profile-hub">
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
              <span className="profile-badge">{getPlanLabel(profile)}</span>
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

        <section className="profile-section">
          <div className="profile-section-head">
            <h2>Tu espacio de facilitación</h2>
            <p>Accede a tus recursos guardados y herramientas de trabajo.</p>
          </div>

          <div className="profile-hub-grid">
            <Link to="/talleres" className="profile-hub-card profile-hub-card-featured">
              <span className="profile-hub-icon">🛠</span>
              <strong>Talleres</strong>
              <p>Diseña sesiones, actividades y pausas. Descarga la estructura en Word o PDF.</p>
              <span className="profile-hub-count">
                {workshopCount} taller{workshopCount === 1 ? '' : 'es'}
              </span>
            </Link>

            <Link to="/interactivo" className="profile-hub-card">
              <span className="profile-hub-icon">⚡</span>
              <strong>Espacio interactivo</strong>
              <p>Encuestas y polls en vivo con códigos para participantes.</p>
              <span className="profile-hub-count">{getPlanLabel(profile)}</span>
            </Link>

            <Link to="/favoritos" className="profile-hub-card">
              <span className="profile-hub-icon">☆</span>
              <strong>Favoritos</strong>
              <p>Actividades que marcaste para usar después.</p>
              <span className="profile-hub-count">
                {favoriteSlugs.length} guardada{favoriteSlugs.length === 1 ? '' : 's'}
              </span>
            </Link>

            <Link to="/bitacora" className="profile-hub-card">
              <span className="profile-hub-icon">📓</span>
              <strong>Bitácora</strong>
              <p>Registros de sesiones y aprendizajes de facilitación.</p>
              <span className="profile-hub-count">
                {journalCount} registro{journalCount === 1 ? '' : 's'}
              </span>
            </Link>

          </div>
        </section>
      </div>
    </main>
  )
}
