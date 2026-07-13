import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true

    async function verifyRecoverySession() {
      const { data } = await supabase.auth.getSession()

      if (!mounted) {
        return
      }

      if (data.session) {
        setReady(true)
      }

      setChecking(false)
    }

    verifyRecoverySession()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setReady(true)
        setChecking(false)
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setSubmitting(true)

    try {
      await updatePassword(password)
      setSuccess('Contraseña actualizada. Redirigiendo al inicio de sesión...')
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1800)
    } catch (submitError) {
      setError(submitError.message || 'No se pudo actualizar la contraseña.')
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <main id="auth-view" className="fade-in">
        <p className="auth-loading">Verificando enlace...</p>
      </main>
    )
  }

  if (!ready) {
    return (
      <main id="auth-view" className="fade-in">
        <Link to="/recuperar-contrasena" className="back-btn">
          ← Solicitar nuevo enlace
        </Link>

        <div className="auth-panel">
          <h1>Enlace inválido o expirado</h1>
          <p>
            El enlace de recuperación ya no es válido. Solicita uno nuevo desde recuperar
            contraseña.
          </p>

          <div className="auth-actions">
            <Link to="/recuperar-contrasena" className="btn-primary btn-link">
              Recuperar contraseña
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main id="auth-view" className="fade-in">
      <Link to="/login" className="back-btn">
        ← Volver a iniciar sesión
      </Link>

      <div className="auth-panel">
        <h1>Nueva contraseña</h1>
        <p>Elige una contraseña segura para tu cuenta KitPOP.</p>

        {error && <div className="auth-message error">{error}</div>}
        {success && <div className="auth-message success">{success}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field full">
            <label htmlFor="reset-password">Nueva contraseña</label>
            <input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="field full">
            <label htmlFor="reset-password-confirm">Confirmar contraseña</label>
            <input
              id="reset-password-confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          <div className="field full">
            <button type="submit" className="btn-primary" disabled={submitting || Boolean(success)}>
              {submitting ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
