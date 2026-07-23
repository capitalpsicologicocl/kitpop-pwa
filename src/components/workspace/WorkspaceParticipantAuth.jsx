import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { formatAuthError } from '../../utils/authError'

const PRIVACY_NOTICE =
  'Tus datos (nombre, correo y respuestas) se usan solo para este taller. ' +
  'El facilitador puede ver tus aportes individuales y los de tu grupo. ' +
  'Al archivar el espacio, el facilitador conserva exportación según su política interna.'

export default function WorkspaceParticipantAuth({
  code,
  workspaceTitle,
  onJoined,
}) {
  const { user, signIn, signUp, loading: authLoading } = useAuth()
  const [mode, setMode] = useState('register')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setError('')

    if (!privacyAccepted) {
      setError('Debes aceptar el aviso de privacidad.')
      return
    }

    setSubmitting(true)

    try {
      let nameForJoin = displayName.trim()

      if (!user) {
        if (mode === 'register') {
          if (!nameForJoin) {
            setError('Indica tu nombre.')
            return
          }

          await signUp({ email, password, fullName: nameForJoin })
          await signIn({ email, password })
        } else {
          await signIn({ email, password })
          nameForJoin = nameForJoin || email.split('@')[0]
        }
      } else {
        nameForJoin = nameForJoin || user.user_metadata?.full_name || user.email?.split('@')[0] || ''
      }

      if (!nameForJoin) {
        setError('Indica tu nombre.')
        return
      }

      await onJoined(nameForJoin)
    } catch (submitError) {
      setError(formatAuthError(submitError, 'No se pudo completar el acceso.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return <p className="auth-loading">Cargando...</p>
  }

  return (
    <div className="workspace-participant-auth">
      <h1>{workspaceTitle || 'Espacio de trabajo'}</h1>
      <p className="participant-type">Inscripción al taller</p>

      {user ? (
        <p className="participant-copy">
          Sesión iniciada como <strong>{user.email}</strong>.
        </p>
      ) : (
        <div className="workspace-auth-tabs">
          <button
            type="button"
            className={`timer-btn ${mode === 'register' ? 'timer-btn-secondary' : 'timer-btn-ghost'}`}
            onClick={() => setMode('register')}
          >
            Registrarme
          </button>
          <button
            type="button"
            className={`timer-btn ${mode === 'login' ? 'timer-btn-secondary' : 'timer-btn-ghost'}`}
            onClick={() => setMode('login')}
          >
            Ya tengo cuenta
          </button>
        </div>
      )}

      <form className="form-grid workspace-auth-form" onSubmit={handleAuthSubmit}>
        {(!user && mode === 'register') || (user && !user.user_metadata?.full_name) ? (
          <div className="field full">
            <label htmlFor="ws-participant-name">Nombre</label>
            <input
              id="ws-participant-name"
              type="text"
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Tu nombre"
            />
          </div>
        ) : null}

        {!user && (
          <>
            <div className="field full">
              <label htmlFor="ws-participant-email">Correo</label>
              <input
                id="ws-participant-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="field full">
              <label htmlFor="ws-participant-password">Contraseña</label>
              <input
                id="ws-participant-password"
                type="password"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </>
        )}

        <label className="workspace-privacy-check field full">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(event) => setPrivacyAccepted(event.target.checked)}
          />
          <span>{PRIVACY_NOTICE}</span>
        </label>

        {error && <div className="auth-message error field full">{error}</div>}

        <div className="field full">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Entrar al espacio'}
          </button>
        </div>
      </form>

      {!user && mode === 'login' && (
        <p className="participant-copy">
          <Link to={`/recuperar-contrasena?redirect=${encodeURIComponent(`/p/${code}`)}`}>
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      )}

      <p className="workspace-powered-by">Powered by KitPOP</p>
    </div>
  )
}
