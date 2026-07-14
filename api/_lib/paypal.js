const PLAN_ENV_KEYS = {
  pro: {
    monthly: 'PAYPAL_PLAN_PRO_MONTHLY',
    yearly: 'PAYPAL_PLAN_PRO_YEARLY',
  },
  pro_team: {
    monthly: 'PAYPAL_PLAN_TEAM_MONTHLY',
    yearly: 'PAYPAL_PLAN_TEAM_YEARLY',
  },
}

const PAYPAL_STATUS_MAP = {
  ACTIVE: 'active',
  APPROVED: 'active',
  APPROVAL_PENDING: 'inactive',
  SUSPENDED: 'past_due',
  CANCELLED: 'canceled',
  EXPIRED: 'inactive',
}

let cachedAccessToken = null
let cachedAccessTokenExpiresAt = 0

export function getPayPalBaseUrl() {
  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

export function getPayPalPlanId(planTier, billingInterval) {
  const tier = planTier === 'pro_team' ? 'pro_team' : 'pro'
  const interval = billingInterval === 'monthly' ? 'monthly' : 'yearly'
  const envKey = PLAN_ENV_KEYS[tier][interval]
  const planId = process.env[envKey]

  if (!planId) {
    throw new Error(`Missing ${envKey}.`)
  }

  return planId
}

export function resolvePlanTierFromPayPalPlan(planId) {
  const teamPlans = [
    process.env.PAYPAL_PLAN_TEAM_MONTHLY,
    process.env.PAYPAL_PLAN_TEAM_YEARLY,
  ].filter(Boolean)

  if (teamPlans.includes(planId)) {
    return 'pro_team'
  }

  return 'pro'
}

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET.')
  }

  if (cachedAccessToken && Date.now() < cachedAccessTokenExpiresAt - 60_000) {
    return cachedAccessToken
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error_description || 'PayPal auth failed.')
  }

  cachedAccessToken = payload.access_token
  cachedAccessTokenExpiresAt = Date.now() + (payload.expires_in ?? 3600) * 1000

  return cachedAccessToken
}

export async function paypalRequest(method, path, body) {
  const token = await getAccessToken()
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }

  if (body !== undefined) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${getPayPalBaseUrl()}${path}`, options)
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const detail =
      payload.message ||
      payload.details?.[0]?.description ||
      payload.name ||
      'PayPal request failed.'

    throw new Error(detail)
  }

  return payload
}

export async function createPayPalSubscription({
  planId,
  userId,
  userEmail,
  returnUrl,
  cancelUrl,
}) {
  return paypalRequest('POST', '/v1/billing/subscriptions', {
    plan_id: planId,
    custom_id: userId,
    subscriber: userEmail
      ? {
          email_address: userEmail,
        }
      : undefined,
    application_context: {
      brand_name: 'KitPOP',
      locale: 'es-CL',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'SUBSCRIBE_NOW',
      landing_page: 'BILLING',
      payment_method: {
        payee_preferred: 'UNRESTRICTED',
      },
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  })
}

export async function getPayPalSubscription(subscriptionId) {
  return paypalRequest('GET', `/v1/billing/subscriptions/${subscriptionId}`)
}

export async function cancelPayPalSubscription(subscriptionId, reason) {
  return paypalRequest('POST', `/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    reason: reason || 'Usuario solicitó cancelar desde KitPOP.',
  })
}

export function mapPayPalSubscriptionToProfile(subscription) {
  const status = subscription.status || 'INACTIVE'
  const mappedStatus = PAYPAL_STATUS_MAP[status] || 'inactive'
  const nextBilling = subscription.billing_info?.next_billing_time
  const periodEnd = nextBilling ? new Date(nextBilling).toISOString() : null
  const periodStillValid = periodEnd && new Date(periodEnd).getTime() > Date.now()
  const isPaid =
    status === 'ACTIVE' ||
    status === 'APPROVED' ||
    (status === 'CANCELLED' && periodStillValid)

  if (!isPaid) {
    return {
      plan: 'explorer',
      subscription_status: mappedStatus,
      paypal_subscription_id: subscription.id,
      plan_period_end: periodStillValid ? periodEnd : null,
    }
  }

  return {
    plan: resolvePlanTierFromPayPalPlan(subscription.plan_id),
    subscription_status: mappedStatus === 'canceled' ? 'active' : mappedStatus,
    paypal_subscription_id: subscription.id,
    plan_period_end: periodEnd,
  }
}

export async function syncProfileFromPayPalSubscription(subscription, supabaseAdmin) {
  let userId = subscription.custom_id

  if (!userId) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('paypal_subscription_id', subscription.id)
      .maybeSingle()

    userId = profile?.id
  }

  if (!userId) {
    return null
  }

  const patch = mapPayPalSubscriptionToProfile(subscription)
  const { error } = await supabaseAdmin.from('profiles').update(patch).eq('id', userId)

  if (error) {
    throw error
  }

  return userId
}

export async function verifyPayPalWebhook(req, rawBody) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID

  if (!webhookId) {
    throw new Error('Missing PAYPAL_WEBHOOK_ID.')
  }

  const payload = JSON.parse(rawBody.toString('utf8'))

  const verification = await paypalRequest(
    'POST',
    '/v1/notifications/verify-webhook-signature',
    {
      auth_algo: req.headers['paypal-auth-algo'],
      cert_url: req.headers['paypal-cert-url'],
      transmission_id: req.headers['paypal-transmission-id'],
      transmission_sig: req.headers['paypal-transmission-sig'],
      transmission_time: req.headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: payload,
    }
  )

  if (verification.verification_status !== 'SUCCESS') {
    throw new Error('Invalid PayPal webhook signature.')
  }

  return payload
}

export function getPayPalApprovalUrl(subscription) {
  const approveLink = subscription.links?.find((link) => link.rel === 'approve')
  return approveLink?.href ?? null
}
