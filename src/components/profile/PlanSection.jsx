import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  cancelPayPalSubscription,
  redirectToPayPalCheckout,
} from '../../services/paypalService'
import {
  getVisiblePlans,
  formatPlanPeriodEnd,
  formatPlanPrice,
  getPlanLabel,
  getSubscriptionStatusLabel,
  getUserPlan,
  hasPaidPlan,
} from '../../utils/planLimits'

export default function PlanSection({ profile, onPlanChange }) {
  const [billingInterval, setBillingInterval] = useState('yearly')
  const [loadingPlan, setLoadingPlan] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const currentPlanId = getUserPlan(profile)
  const isPaid = hasPaidPlan(profile)
  const periodEnd = formatPlanPeriodEnd(profile)
  const hasPayPalSubscription = Boolean(profile?.paypal_subscription_id)

  async function handleUpgrade(planTier) {
    setError('')
    setMessage('')
    setLoadingPlan(planTier)

    try {
      await redirectToPayPalCheckout(planTier, billingInterval)
    } catch (upgradeError) {
      setError(upgradeError.message || 'No se pudo iniciar el pago.')
      setLoadingPlan('')
    }
  }

  async function handleCancelSubscription() {
    const confirmed = window.confirm(
      '¿Cancelar KitPOP Pro? Mantendrás acceso hasta el fin del periodo pagado y no se renovará automáticamente.'
    )

    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')
    setLoadingPlan('cancel')

    try {
      await cancelPayPalSubscription()
      setMessage('Suscripción cancelada. Tu acceso Pro sigue vigente hasta la fecha de renovación.')
      onPlanChange?.()
    } catch (cancelError) {
      setError(cancelError.message || 'No se pudo cancelar la suscripción.')
    } finally {
      setLoadingPlan('')
    }
  }

  return (
    <section className="auth-panel plan-section" id="plan">
      <div className="plan-section-head">
        <h2>Tu plan KitPOP</h2>
        <p>
          Explorer es gratis. Pro desbloquea talleres, encuestas y sesiones en vivo sin
          límites.
        </p>
      </div>

      <div className="plan-billing-toggle no-print">
        <button
          type="button"
          className={billingInterval === 'monthly' ? 'on' : ''}
          onClick={() => setBillingInterval('monthly')}
        >
          Pago mensual
        </button>
        <button
          type="button"
          className={billingInterval === 'yearly' ? 'on' : ''}
          onClick={() => setBillingInterval('yearly')}
        >
          Pago anual
        </button>
      </div>

      <div className="plan-cards">
        {getVisiblePlans().map((plan) => {
          const isCurrent = currentPlanId === plan.id
          const isExplorer = plan.id === 'explorer'

          return (
            <article
              key={plan.id}
              className={`plan-card ${isCurrent ? 'plan-card-current' : ''}`}
            >
              <p className="plan-card-kicker">{plan.kicker}</p>
              <h3>{plan.label}</h3>
              {plan.subtitle && <p className="plan-card-subtitle">{plan.subtitle}</p>}
              <p className="plan-card-price">
                {formatPlanPrice(plan.id, billingInterval)}
              </p>

              <ul className="plan-card-list">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              {isCurrent && <span className="plan-card-badge">Plan actual</span>}

              {!isExplorer && !isPaid && (
                <button
                  type="button"
                  className="btn-primary plan-card-btn"
                  disabled={Boolean(loadingPlan)}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {loadingPlan === plan.id
                    ? 'Redirigiendo a PayPal...'
                    : `Activar ${plan.kicker}`}
                </button>
              )}
            </article>
          )
        })}
      </div>

      <div className="plan-status">
        <p>
          <strong>Estado:</strong> {getPlanLabel(profile)} ·{' '}
          {getSubscriptionStatusLabel(profile)}
        </p>
        {periodEnd && (
          <p>
            <strong>Renovación / vigencia:</strong> {periodEnd}
          </p>
        )}
      </div>

      {message && <div className="auth-message success">{message}</div>}
      {error && <div className="auth-message error">{error}</div>}

      <div className="auth-actions">
        {isPaid && hasPayPalSubscription && (
          <button
            type="button"
            className="btn-secondary"
            disabled={Boolean(loadingPlan)}
            onClick={handleCancelSubscription}
          >
            {loadingPlan === 'cancel' ? 'Cancelando...' : 'Cancelar renovación'}
          </button>
        )}

        {!isPaid && (
          <Link to="/interactivo" className="btn-secondary btn-link">
            Ver espacio interactivo
          </Link>
        )}
      </div>

      <p className="plan-footnote">
        Pagos seguros con PayPal. Tarjeta o cuenta PayPal desde Chile y LATAM. Pro: USD
        3.99/mes o USD 29/año. Renovación automática hasta que canceles desde aquí o
        desde tu cuenta PayPal.
      </p>
    </section>
  )
}
