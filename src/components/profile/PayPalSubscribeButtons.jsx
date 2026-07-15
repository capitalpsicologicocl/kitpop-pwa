import { useEffect, useMemo, useState } from 'react'
import { FUNDING, PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'

import { fetchPayPalConfig, syncPayPalSubscription } from '../../services/paypalService'

export default function PayPalSubscribeButtons({
  billingInterval,
  planVariant = 'standard',
  onSuccess,
  onError,
}) {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadConfig() {
      setLoading(true)
      setLoadError('')

      try {
        const nextConfig = await fetchPayPalConfig(billingInterval, planVariant)

        if (mounted) {
          setConfig(nextConfig)
        }
      } catch (error) {
        if (mounted) {
          setLoadError(error.message || 'No se pudo cargar PayPal.')
          setConfig(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadConfig()

    return () => {
      mounted = false
    }
  }, [billingInterval, planVariant])

  const scriptOptions = useMemo(() => {
    if (!config?.clientId) {
      return null
    }

    return {
      clientId: config.clientId,
      vault: true,
      intent: 'subscription',
      currency: 'USD',
      components: 'buttons',
      enableFunding: 'card,venmo',
    }
  }, [config?.clientId])

  if (loading) {
    return <p className="plan-paypal-loading">Cargando opciones de pago…</p>
  }

  if (loadError) {
    return <p className="auth-message error">{loadError}</p>
  }

  if (!scriptOptions || !config?.planId) {
    return null
  }

  const subscriptionPayload = {
    plan_id: config.planId,
    custom_id: config.userId,
    subscriber: config.userEmail
      ? {
          email_address: config.userEmail,
        }
      : undefined,
  }

  async function handleApprove(data) {
    try {
      await syncPayPalSubscription(data.subscriptionID)
      onSuccess?.()
    } catch (error) {
      onError?.(error.message || 'No se pudo activar tu suscripción.')
    }
  }

  function renderButton(fundingSource, label) {
    return (
      <PayPalButtons
        key={fundingSource}
        fundingSource={fundingSource}
        style={{
          layout: 'vertical',
          color: fundingSource === FUNDING.CARD ? 'black' : 'gold',
          shape: 'rect',
          label: 'subscribe',
          height: 44,
        }}
        createSubscription={(_, actions) =>
          actions.subscription.create(subscriptionPayload)
        }
        onApprove={handleApprove}
        onError={(error) => {
          onError?.(error?.message || 'PayPal no pudo completar el pago.')
        }}
        aria-label={label}
      />
    )
  }

  return (
    <div className="plan-paypal-buttons">
      <PayPalScriptProvider options={scriptOptions}>
        {renderButton(FUNDING.CARD, 'Pagar con tarjeta')}
        {renderButton(FUNDING.PAYPAL, 'Pagar con PayPal')}
      </PayPalScriptProvider>
    </div>
  )
}
