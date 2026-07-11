import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const navigate = useNavigate()
  const { user, profile, loading, saveProfile, signOut } = useAuth()
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setFullName(profile?.full_name ?? '')
  }, [profile])

  if (loading) {
    return (
      <main id="auth-view" className="fade-in">
        <p className="auth-loading">Cargando perfil...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main id="auth-view" className="fade-in">
        <Link to="/" className="back-btn">
          ← Volver
        </Link>

        <div className="auth-panel">
          <h1>Perfil KitPOP</h1>
          <p>Inicia sesión para ver y editar tu perfil.</p>
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

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <main id="auth-view" className="fade-in">
      <Link to="/" className="back-btn">
        ← Volver
      </Link>

      <div className="auth-panel profile-card">
        <h1>Perfil KitPOP</h1>
        <p>Gestiona tu cuenta de facilitación.</p>

        <div className="profile-meta">
          <strong>Correo:</strong> {user.email}
        </div>

        {message && <div className="auth-message success">{message}</div>}
        {error && <div className="auth-message error">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field full">
            <label htmlFor="profile-name">Nombre</label>
            <input
              id="profile-name"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>

          <div className="field full auth-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar perfil'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleSignOut}>
              Cerrar sesión
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
