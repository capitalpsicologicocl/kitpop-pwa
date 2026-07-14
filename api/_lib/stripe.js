import Stripe from 'stripe'

let stripeClient = null

const PRICE_ENV_KEYS = {
  pro: {
    monthly: 'STRIPE_PRICE_PRO_MONTHLY',
    yearly: 'STRIPE_PRICE_PRO_YEARLY',
  },
  pro_team: {
    monthly: 'STRIPE_PRICE_TEAM_MONTHLY',
    yearly: 'STRIPE_PRICE_TEAM_YEARLY',
  },
}

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY.')
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)
  }

  return stripeClient
}

export function getStripePriceId(planTier, billingInterval) {
  const tier = planTier === 'pro_team' ? 'pro_team' : 'pro'
  const interval = billingInterval === 'monthly' ? 'monthly' : 'yearly'
  const envKey = PRICE_ENV_KEYS[tier][interval]
  const priceId = process.env[envKey]

  if (!priceId) {
    throw new Error(`Missing ${envKey}.`)
  }

  return priceId
}

export function resolvePlanTierFromSubscription(subscription) {
  const metadataTier = subscription.metadata?.plan_tier

  if (metadataTier === 'pro_team' || metadataTier === 'pro') {
    return metadataTier
  }

  const priceId = subscription.items?.data?.[0]?.price?.id

  if (priceId) {
    const teamPrices = [
      process.env.STRIPE_PRICE_TEAM_MONTHLY,
      process.env.STRIPE_PRICE_TEAM_YEARLY,
    ].filter(Boolean)

    if (teamPrices.includes(priceId)) {
      return 'pro_team'
    }
  }

  return 'pro'
}

export function mapSubscriptionToProfile(subscription) {
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null
  const activeLike = ['active', 'trialing'].includes(subscription.status)
  const periodStillValid =
    subscription.current_period_end &&
    subscription.current_period_end * 1000 > Date.now()

  const isPaid =
    activeLike ||
    (periodStillValid && subscription.status !== 'incomplete_expired')

  if (!isPaid) {
    return {
      plan: 'explorer',
      subscription_status: subscription.status || 'inactive',
      stripe_subscription_id: subscription.id,
      plan_period_end: periodStillValid ? periodEnd : null,
    }
  }

  return {
    plan: resolvePlanTierFromSubscription(subscription),
    subscription_status: subscription.status,
    stripe_subscription_id: subscription.id,
    plan_period_end: periodEnd,
  }
}

export async function syncProfileFromSubscription(subscription, supabaseAdmin) {
  let userId = subscription.metadata?.user_id

  if (!userId) {
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id

    if (customerId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle()

      userId = profile?.id
    }
  }

  if (!userId) {
    return null
  }

  const patch = mapSubscriptionToProfile(subscription)

  const { error } = await supabaseAdmin.from('profiles').update(patch).eq('id', userId)

  if (error) {
    throw error
  }

  return userId
}

export async function ensureStripeCustomer({ stripe, supabaseAdmin, user, profile }) {
  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id
  }

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: {
      user_id: user.id,
    },
  })

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', user.id)

  if (error) {
    throw error
  }

  return customer.id
}
