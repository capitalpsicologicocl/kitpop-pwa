import { supabase } from './supabaseClient'

async function getAccessToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function postPayPalEndpoint(path, body = {}) {
  const token = await getAccessToken()

  if (!token) {
    throw new Error('Debes iniciar sesión para continuar.')
  }

  const response = await fetch(path, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error || 'No se pudo conectar con PayPal.')
  }

  return payload
}

export async function fetchPayPalConfig(billingInterval) {
  const token = await getAccessToken()

  if (!token) {
    throw new Error('Debes iniciar sesión para continuar.')
  }

  const response = await fetch(
    `/api/paypal-config?billingInterval=${encodeURIComponent(billingInterval)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error || 'No se pudo cargar PayPal.')
  }

  return payload
}

export async function startPayPalSubscription({ planTier, billingInterval }) {
  const payload = await postPayPalEndpoint('/api/create-paypal-subscription', {
    planTier,
    billingInterval,
  })

  return payload.url
}

export async function syncPayPalSubscription(subscriptionId) {
  return postPayPalEndpoint('/api/sync-paypal-subscription', { subscriptionId })
}

export async function cancelPayPalSubscription() {
  return postPayPalEndpoint('/api/cancel-paypal-subscription')
}

export async function redirectToPayPalCheckout(planTier, billingInterval) {
  const url = await startPayPalSubscription({ planTier, billingInterval })
  window.location.assign(url)
}
