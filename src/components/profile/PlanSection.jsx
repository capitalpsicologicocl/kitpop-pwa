import { useState } from 'react'
import { Link } from 'react-router-dom'

import { redirectToBillingPortal, redirectToCheckout } from '../../services/stripeService'
import {
  PLANS,
  formatPlanPeriodEnd,
  formatPlanPrice,
  getPlanLabel,
  getSubscriptionStatusLabel,
  getUserPlan,
  hasPaidPlan,
} from '../../utils/planLimits'

export default function PlanSection({ profile }) {
  const [billingInterval, setBillingInterval] = useState('yearly')
  const [loadingPlan, setLoadingPlan] = useState('')
  const [error, setError] = useState('')
  const currentPlanId = getUserPlan(profile)
  const isPaid = hasPaidPlan(profile)
  const periodEnd = formatPlanPeriodEnd(profile)

  async function handleUpgrade(planTier) {
    setError('')
    setLoadingPlan(planTier)

    try {
      await redirectToCheckout(planTier, billingInterval)
    } catch (upgradeError) {
      setError(upgradeError.message || 'No se pudo iniciar el pago.')
      setLoadingPlan('')
    }
  }

  async function handleManageBilling() {
    setError('')
    setLoadingPlan('portal')

    try {
      await redirectToBillingPortal()
    } catch (portalError) {
      setError(portalError.message || 'No se pudo abrir el portal de facturación.')
      setLoadingPlan('')
    }
  }

  return (
    <section className="auth-panel plan-section" id="plan">
      <div className="plan-section-head">
        <h2>Tu plan KitPOP</h2>
        <p>
          Explorer es gratis. Pro y Pro TEAM desbloquean talleres, encuestas y sesiones
          en vivo sin límites.
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

      <div className="plan-cards plan-cards-three">
        {Object.values(PLANS).map((plan) => {
          const isCurrent = currentPlanId === plan.id
          const isTeam = plan.id === 'pro_team'
          const isExplorer = plan.id === 'explorer'

          return (
            <article
              key={plan.id}
              className={`plan-card ${isTeam ? 'plan-card-team' : ''} ${isCurrent ? 'plan-card-current' : ''}`}
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
                    ? 'Redirigiendo a Stripe...'
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

      {error && <div className="auth-message error">{error}</div>}

      <div className="auth-actions">
        {isPaid && (
          <button
            type="button"
            className="btn-primary"
            disabled={Boolean(loadingPlan)}
            onClick={handleManageBilling}
          >
            {loadingPlan === 'portal' ? 'Abriendo...' : 'Gestionar suscripción'}
          </button>
        )}

        {!isPaid && (
          <Link to="/interactivo" className="btn-secondary btn-link">
            Ver espacio interactivo
          </Link>
        )}
      </div>

      <p className="plan-footnote">
        Pagos seguros con Stripe. Tarjetas internacionales para LATAM. Pro: USD 2.99/mes
        o USD 29/año. Pro TEAM: USD 6.99/mes o USD 69/año (2 a 5 facilitadores).
        Renovación automática hasta que canceles desde el portal de facturación.
      </p>
    </section>
  )
}
