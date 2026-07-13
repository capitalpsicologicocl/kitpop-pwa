import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      await signUp({ email, password, fullName })
      setSuccess(
        'Cuenta creada. Te enviamos un correo de bienvenida para confirmar tu cuenta. Revisa tu bandeja y spam antes de iniciar sesión.'
      )
    } catch (submitError) {
      setError(submitError.message || 'No se pudo crear la cuenta.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main id="auth-view" className="fade-in">
      <Link to="/" className="back-btn">
        ← Volver
      </Link>

      <div className="auth-panel">
        <h1>Crear cuenta</h1>
        <p>Regístrate para guardar favoritos y bitácoras de facilitación.</p>

        {error && <div className="auth-message error">{error}</div>}
        {success && <div className="auth-message success">{success}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field full">
            <label htmlFor="register-name">Nombre</label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>

          <div className="field full">
            <label htmlFor="register-email">Correo</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="field full">
            <label htmlFor="register-password">Contraseña</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="field full">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creando cuenta...' : 'Registrarme'}
            </button>
          </div>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </main>
  )
}
