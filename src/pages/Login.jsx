import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await signIn({ email, password })
      navigate(redirectTo, { replace: true })
    } catch (submitError) {
      setError(submitError.message || 'No se pudo iniciar sesión.')
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
        <h1>Iniciar sesión</h1>
        <p>Accede al banco de actividades, favoritos, bitácora y tu perfil KitPOP.</p>

        {error && <div className="auth-message error">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field full">
            <label htmlFor="login-email">Correo</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="field full">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="field full">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
        </p>
      </div>
    </main>
  )
}
