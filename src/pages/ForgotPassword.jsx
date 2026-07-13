import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { formatAuthError } from '../utils/authError'

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      await requestPasswordReset(email)
      setSuccess(
        'Te enviamos un correo con instrucciones para restablecer tu contraseña. Revisa también spam.'
      )
    } catch (submitError) {
      setError(formatAuthError(submitError, 'No se pudo enviar el correo de recuperación.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main id="auth-view" className="fade-in">
      <Link to="/login" className="back-btn">
        ← Volver a iniciar sesión
      </Link>

      <div className="auth-panel">
        <h1>Recuperar contraseña</h1>
        <p>
          Escribe tu correo y te enviaremos un enlace seguro para crear una nueva contraseña.
        </p>

        {error && <div className="auth-message error">{error}</div>}
        {success && <div className="auth-message success">{success}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field full">
            <label htmlFor="forgot-email">Correo</label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="field full">
            <button type="submit" className="btn-primary" disabled={submitting || Boolean(success)}>
              {submitting ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </div>
        </form>

        <p className="auth-footer">
          ¿Recordaste tu contraseña? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </main>
  )
}
