import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import {
  fetchAdminAccess,
  grantAdminPlan,
  lookupAdminUser,
} from '../services/adminService'
import { fetchFoundingSlots } from '../services/paypalService'
import {
  formatPlanPeriodEnd,
  getPlanLabel,
  getSubscriptionStatusLabel,
} from '../utils/planLimits'

function formatDateTime(value) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleString('es-CL')
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth()
  const [adminLoading, setAdminLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [foundingSlots, setFoundingSlots] = useState(null)
  const [email, setEmail] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [grantLoading, setGrantLoading] = useState('')
  const [courtesyDays, setCourtesyDays] = useState('365')
  const [note, setNote] = useState('')
  const [result, setResult] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadAdmin() {
      if (!user) {
        setAdminLoading(false)
        return
      }

      try {
        const [access, slots] = await Promise.all([
          fetchAdminAccess(),
          fetchFoundingSlots().catch(() => null),
        ])

        if (mounted) {
          setIsAdmin(Boolean(access.isAdmin))
          setFoundingSlots(slots)
        }
      } finally {
        if (mounted) {
          setAdminLoading(false)
        }
      }
    }

    loadAdmin()

    return () => {
      mounted = false
    }
  }, [user])

  async function handleLookup(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLookupLoading(true)

    try {
      const data = await lookupAdminUser(email.trim())
      setResult(data)
    } catch (lookupError) {
      setResult(null)
      setError(lookupError.message || 'No se pudo buscar el usuario.')
    } finally {
      setLookupLoading(false)
    }
  }

  async function handleGrant(grantType) {
    if (!result?.user?.id) {
      return
    }

    setError('')
    setMessage('')
    setGrantLoading(grantType)

    try {
      const payload = await grantAdminPlan({
        userId: result.user.id,
        grantType,
        days: Number(courtesyDays),
        note: note.trim() || undefined,
      })

      setResult((current) => ({
        ...current,
        profile: payload.profile,
      }))

      const labels = {
        courtesy: `Pro cortesía activado por ${payload.days} días.`,
        trial: 'Prueba Pro de 7 días activada.',
        revoke: 'Plan revertido a Explorer.',
      }

      setMessage(labels[grantType] || 'Plan actualizado.')
    } catch (grantError) {
      setError(grantError.message || 'No se pudo actualizar el plan.')
    } finally {
      setGrantLoading('')
    }
  }

  if (authLoading || adminLoading) {
    return (
      <main className="fade-in">
        <p className="auth-loading">Cargando panel admin…</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: { pathname: '/admin' } }} />
  }

  if (!isAdmin) {
    return (
      <main className="fade-in">
        <Link to="/perfil" className="back-btn">
          ← Volver al perfil
        </Link>
        <div className="auth-panel">
          <h1 className="cv-title">Acceso restringido</h1>
          <p className="cv-desc">Tu cuenta no está en la lista de administradores.</p>
        </div>
      </main>
    )
  }

  const profile = result?.profile

  return (
    <main id="admin-view" className="fade-in">
      <Link to="/perfil" className="back-btn">
        ← Volver al perfil
      </Link>

      <div className="page-head">
        <h1 className="cv-title">Administración KitPOP</h1>
        <p className="cv-desc">
          Concede Pro cortesía o prueba sin editar Supabase manualmente. Sesión: {user.email}
        </p>
      </div>

      {foundingSlots && (
        <section className="auth-panel admin-stats">
          <h2>Cupos Fundador</h2>
          <p>
            {foundingSlots.remaining} disponibles de {foundingSlots.limit} ·{' '}
            {foundingSlots.used} usados · PayPal{' '}
            {foundingSlots.paypalConfigured ? 'configurado' : 'pendiente'}
          </p>
        </section>
      )}

      <section className="auth-panel admin-search">
        <h2>Buscar usuario</h2>
        <form className="admin-search-form" onSubmit={handleLookup}>
          <input
            type="email"
            className="auth-input"
            placeholder="email@ejemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={lookupLoading}>
            {lookupLoading ? 'Buscando…' : 'Buscar'}
          </button>
        </form>
      </section>

      {result && (
        <section className="auth-panel admin-user-card">
          <h2>{result.profile?.full_name || result.user.email}</h2>
          <p className="admin-user-meta">{result.user.email}</p>
          <p className="admin-user-meta">ID: {result.user.id}</p>

          <dl className="admin-details">
            <div>
              <dt>Plan</dt>
              <dd>{getPlanLabel({ plan: profile?.plan, subscription_status: profile?.subscription_status, plan_period_end: profile?.plan_period_end })}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{getSubscriptionStatusLabel(profile)}</dd>
            </div>
            <div>
              <dt>Vigencia</dt>
              <dd>{formatPlanPeriodEnd(profile) || '—'}</dd>
            </div>
            <div>
              <dt>Fundador</dt>
              <dd>{profile?.is_founding_member ? 'Sí' : 'No'}</dd>
            </div>
            <div>
              <dt>PayPal sub</dt>
              <dd>{profile?.paypal_subscription_id ? 'Activa' : '—'}</dd>
            </div>
            <div>
              <dt>Registro</dt>
              <dd>{formatDateTime(result.user.createdAt)}</dd>
            </div>
          </dl>

          <div className="admin-grant-block">
            <h3>Conceder acceso</h3>
            <label className="auth-field">
              <span>Días de cortesía Pro</span>
              <input
                type="number"
                min="1"
                max="730"
                className="auth-input"
                value={courtesyDays}
                onChange={(event) => setCourtesyDays(event.target.value)}
              />
            </label>
            <label className="auth-field">
              <span>Nota interna (opcional)</span>
              <input
                type="text"
                className="auth-input"
                placeholder="Beta tester cohorte marzo"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>

            <div className="auth-actions">
              <button
                type="button"
                className="btn-primary"
                disabled={Boolean(grantLoading)}
                onClick={() => handleGrant('courtesy')}
              >
                {grantLoading === 'courtesy' ? 'Aplicando…' : 'Dar Pro cortesía'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={Boolean(grantLoading)}
                onClick={() => handleGrant('trial')}
              >
                {grantLoading === 'trial' ? 'Aplicando…' : 'Prueba 7 días'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={Boolean(grantLoading)}
                onClick={() => handleGrant('revoke')}
              >
                {grantLoading === 'revoke' ? 'Aplicando…' : 'Revocar a Explorer'}
              </button>
            </div>
          </div>
        </section>
      )}

      {message && <div className="auth-message success">{message}</div>}
      {error && <div className="auth-message error">{error}</div>}
    </main>
  )
}
