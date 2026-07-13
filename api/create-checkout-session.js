import {
  ensureStripeCustomer,
  getStripe,
  getStripePriceId,
  profileHasActivePaidPlan,
} from '../_lib/stripe.js'
import {
  getAppOrigin,
  getAuthenticatedUser,
  getSupabaseAdmin,
} from '../_lib/supabase.js'

function parseCheckoutBody(req) {
  let body = {}

  try {
    body =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : req.body || {}
  } catch {
    body = {}
  }

  const planTier = body.planTier === 'pro_team' ? 'pro_team' : 'pro'
  const billingInterval = body.billingInterval === 'monthly' ? 'monthly' : 'yearly'

  return { planTier, billingInterval }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getAuthenticatedUser(req)

    if (!user) {
      return res.status(401).json({ error: 'Debes iniciar sesión.' })
    }

    const { planTier, billingInterval } = parseCheckoutBody(req)
    const stripe = getStripe()
    const supabaseAdmin = getSupabaseAdmin()
    const origin = getAppOrigin(req)

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('plan, subscription_status, stripe_customer_id, plan_period_end')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      throw profileError
    }

    if (profileHasActivePaidPlan(profile)) {
      return res.status(400).json({
        error: 'Ya tienes un plan de pago activo. Gestiona tu suscripción desde el perfil.',
      })
    }

    const customerId = await ensureStripeCustomer({
      stripe,
      supabaseAdmin,
      user,
      profile,
    })

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.id,
      line_items: [
        {
          price: getStripePriceId(planTier, billingInterval),
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      success_url: `${origin}/perfil?checkout=success`,
      cancel_url: `${origin}/perfil?checkout=canceled`,
      metadata: {
        user_id: user.id,
        plan_tier: planTier,
        billing_interval: billingInterval,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_tier: planTier,
          billing_interval: billingInterval,
        },
      },
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('create-checkout-session', error)
    return res.status(500).json({
      error: error.message || 'No se pudo iniciar el checkout.',
    })
  }
}
