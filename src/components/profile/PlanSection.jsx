import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import PayPalSubscribeButtons from './PayPalSubscribeButtons'
import { cancelPayPalSubscription, fetchFoundingSlots } from '../../services/paypalService'
import {
  PLANS,
  formatPlanPeriodEnd,
  formatPlanPrice,
  getAiGenerationRemaining,
  getPlanLabel,
  getProYearlySavingsPercent,
  getSubscriptionStatusLabel,
  getUserPlan,
  getVisiblePlans,
  formatAiLimitLabel,
  hasPaidPlan,
} from '../../utils/planLimits'

export default function PlanSection({ profile, onPlanChange }) {
  const [billingInterval, setBillingInterval] = useState('yearly')
  const [loadingPlan, setLoadingPlan] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [foundingSlots, setFoundingSlots] = useState(null)
  const currentPlanId = getUserPlan(profile)
  const isPaid = hasPaidPlan(profile)
  const periodEnd = formatPlanPeriodEnd(profile)
  const hasPayPalSubscription = Boolean(profile?.paypal_subscription_id)
  const aiRemaining = getAiGenerationRemaining(profile)
  const aiLimitLabel = formatAiLimitLabel(currentPlanId)
  const showLaunchOffer = foundingSlots?.available && !isPaid
  const showFounding = showLaunchOffer && foundingSlots?.paypalConfigured
  const visiblePlans = getVisiblePlans({ includeFounding: showFounding })
  const yearlySavings = getProYearlySavingsPercent('pro')

  useEffect(() => {
    let mounted = true

    async function loadFounding() {
      try {
        const slots = await fetchFoundingSlots()

        if (mounted) {
          setFoundingSlots(slots)
        }
      } catch {
        if (mounted) {
          setFoundingSlots(null)
        }
      }
    }

    loadFounding()

    return () => {
      mounted = false
    }
  }, [])

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

  function handleSubscribeSuccess() {
    setError('')
    setMessage('¡KitPOP Pro activado! Ya puedes exportar y crear sin límites.')
    onPlanChange?.()
  }

  return (
    <section className="auth-panel plan-section" id="plan">
      <div className="plan-section-head">
        <h2>Tu plan KitPOP</h2>
        <p>
          Explorer es gratis para probar. Pro desbloquea exports Word/PDF, talleres ilimitados
          y 18 diseños con IA al mes. Recomendamos el <strong>pago anual</strong> (−{yearlySavings}%
          vs mensual).
        </p>
      </div>

      {showLaunchOffer && (
        <div className="plan-founding-banner">
          <strong>Oferta de Lanzamiento.</strong> Pocos cupos disponibles.
        </div>
      )}

      <div className="plan-billing-toggle no-print">
        <button
          type="button"
          className={billingInterval === 'yearly' ? 'on' : ''}
          onClick={() => setBillingInterval('yearly')}
        >
          Pago anual (recomendado)
        </button>
        <button
          type="button"
          className={billingInterval === 'monthly' ? 'on' : ''}
          onClick={() => setBillingInterval('monthly')}
        >
          Pago mensual (USD 6,99)
        </button>
      </div>

      <div className={`plan-cards ${showFounding ? 'plan-cards-three' : ''}`}>
        {visiblePlans.map((plan) => {
          const isCurrent = currentPlanId === plan.id || (plan.id === 'pro_founding' && profile?.is_founding_member)
          const isExplorer = plan.id === 'explorer'
          const isFounding = plan.id === 'pro_founding'

          return (
            <article
              key={plan.id}
              className={`plan-card ${isCurrent ? 'plan-card-current' : ''} ${isFounding ? 'plan-card-founding' : ''}`}
            >
              <p className="plan-card-kicker">{plan.kicker}</p>
              <h3>{plan.label}</h3>
              {plan.subtitle && <p className="plan-card-subtitle">{plan.subtitle}</p>}
              <p className="plan-card-price">
                {isFounding
                  ? formatPlanPrice('pro_founding', 'yearly')
                  : formatPlanPrice(plan.id, billingInterval)}
              </p>

              {!isExplorer && billingInterval === 'yearly' && plan.id === 'pro' && (
                <p className="plan-card-anchor">
                  vs USD {PLANS.pro.priceMonthly.toFixed(2)}/mes (USD {(PLANS.pro.priceMonthly * 12).toFixed(0)}/año)
                </p>
              )}

              <ul className="plan-card-list">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              {isCurrent && <span className="plan-card-badge">Plan actual</span>}

              {!isExplorer && !isPaid && (
                <PayPalSubscribeButtons
                  billingInterval={isFounding ? 'yearly' : billingInterval}
                  planVariant={isFounding ? 'founding' : 'standard'}
                  onSuccess={handleSubscribeSuccess}
                  onError={setError}
                />
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
        <p>
          <strong>Diseños con IA:</strong> {aiLimitLabel}
          {Number.isFinite(aiRemaining) && (
            <>
              {' '}
              · <strong>{aiRemaining}</strong> disponibles ahora
            </>
          )}
        </p>
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
          <Link to="/talleres" className="btn-secondary btn-link">
            Volver a talleres
          </Link>
        )}
      </div>

      <p className="plan-footnote">
        Pro Anual USD 39/año · Pro Mensual USD 6,99/mes · Fundador USD 29/año (100 cupos).
        Prueba Pro 7 días disponible vía invitación admin. Paga con tarjeta o PayPal.
      </p>
    </section>
  )
}
