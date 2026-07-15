import { profileHasActivePaidPlan } from './_lib/billing.js'
import {
  createPayPalSubscription,
  getPayPalApprovalUrl,
  getPayPalPlanId,
} from './_lib/paypal.js'
import {
  getAppOrigin,
  getAuthenticatedUser,
  getSupabaseAdmin,
} from './_lib/supabase.js'

function parseBody(req) {
  let body

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

    const { planTier, billingInterval } = parseBody(req)
    const supabaseAdmin = getSupabaseAdmin()
    const origin = getAppOrigin(req)

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('plan, subscription_status, plan_period_end, paypal_subscription_id')
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

    const planId = getPayPalPlanId(planTier, billingInterval)
    const returnUrl = `${origin}/perfil?checkout=success`
    const cancelUrl = `${origin}/perfil?checkout=canceled`

    const subscription = await createPayPalSubscription({
      planId,
      userId: user.id,
      userEmail: user.email,
      returnUrl,
      cancelUrl,
    })

    const approvalUrl = getPayPalApprovalUrl(subscription)

    if (!approvalUrl) {
      throw new Error('PayPal no devolvió URL de aprobación.')
    }

    return res.status(200).json({
      url: approvalUrl,
      subscriptionId: subscription.id,
    })
  } catch (error) {
    console.error('create-paypal-subscription', error)
    return res.status(500).json({
      error: error.message || 'No se pudo iniciar el pago con PayPal.',
    })
  }
}
