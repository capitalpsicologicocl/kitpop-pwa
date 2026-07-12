import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { resolveAccessCode } from '../../services/accessCodeService'
import { normalizeAccessCode, RESOURCE_LABELS } from '../../utils/accessCode'

export default function ParticipantJoin() {
  const { code = '' } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      setLoading(true)
      setError('')
      setSession(null)

      try {
        const result = await resolveAccessCode(code)

        if (!mounted) {
          return
        }

        if (!result) {
          setError('Código no encontrado o inactivo.')
          return
        }

        setSession(result)
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'No se pudo validar el código.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadSession()
  }, [code])

  const normalizedCode = normalizeAccessCode(code)

  return (
    <main id="participant-view" className="fade-in">
      <Link to="/" className="back-btn">
        ← KitPOP
      </Link>

      <div className="auth-panel participant-panel">
        <p className="profile-badge">Acceso participante</p>

        {loading && <p className="auth-loading">Validando código...</p>}

        {!loading && error && (
          <>
            <h1>Código inválido</h1>
            <p>{error}</p>
            <p className="interactive-item-meta">Código ingresado: {normalizedCode}</p>
          </>
        )}

        {!loading && session && (
          <>
            <h1>{session.title}</h1>
            <p className="participant-type">
              {RESOURCE_LABELS[session.resource_type] || 'Sesión KitPOP'}
            </p>
            <span className="interactive-status">{session.status}</span>

            {session.resource_type === 'survey' && session.status === 'active' && (
              <p className="participant-copy">
                Encuesta activa. El formulario de respuestas se habilitará en Fase 9.
              </p>
            )}

            {session.resource_type === 'live' && session.status === 'live' && (
              <p className="participant-copy">
                Sesión en vivo. La votación sincronizada llegará en Fase 10.
              </p>
            )}

            {session.resource_type === 'workshop' && (
              <p className="participant-copy">
                Taller registrado. El material compartido se habilitará con Talleres v2 (Fase 8).
              </p>
            )}

            {(session.status === 'draft' ||
              (session.resource_type === 'survey' && session.status !== 'active') ||
              (session.resource_type === 'live' && session.status !== 'live')) && (
              <p className="participant-copy participant-wait">
                Espera a que el facilitador active esta sesión.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  )
}
