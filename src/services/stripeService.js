import { supabase } from './supabaseClient'

async function getAccessToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function postStripeEndpoint(path, body = {}) {
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
    throw new Error(payload.error || 'No se pudo conectar con Stripe.')
  }

  return payload
}

export async function startCheckout({ planTier, billingInterval }) {
  const payload = await postStripeEndpoint('/api/create-checkout-session', {
    planTier,
    billingInterval,
  })

  return payload.url
}

export async function openBillingPortal() {
  const payload = await postStripeEndpoint('/api/create-portal-session')
  return payload.url
}

export async function redirectToCheckout(planTier, billingInterval) {
  const url = await startCheckout({ planTier, billingInterval })
  window.location.assign(url)
}

export async function redirectToBillingPortal() {
  const url = await openBillingPortal()
  window.location.assign(url)
}
