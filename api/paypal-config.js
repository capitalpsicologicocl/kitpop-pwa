import { getFoundingSlots } from './_lib/founder.js'
import { getPayPalPlanId } from './_lib/paypal.js'
import { getAuthenticatedUser, getSupabaseAdmin } from './_lib/supabase.js'

function parseBillingInterval(req) {
  const interval = req.query?.billingInterval || req.body?.billingInterval
  return interval === 'monthly' ? 'monthly' : 'yearly'
}

function parsePlanVariant(req) {
  const variant = req.query?.planVariant || req.body?.planVariant
  return variant === 'founding' ? 'founding' : 'standard'
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getAuthenticatedUser(req)

    if (!user) {
      return res.status(401).json({ error: 'Debes iniciar sesión.' })
    }

    const clientId = process.env.PAYPAL_CLIENT_ID

    if (!clientId) {
      return res.status(500).json({ error: 'Missing PAYPAL_CLIENT_ID.' })
    }

    const billingInterval = parseBillingInterval(req)
    const planVariant = parsePlanVariant(req)
    const supabaseAdmin = getSupabaseAdmin()
    const foundingSlots = await getFoundingSlots(supabaseAdmin)

    if (planVariant === 'founding') {
      if (billingInterval !== 'yearly') {
        return res.status(400).json({ error: 'El plan Fundador solo está disponible en pago anual.' })
      }

      if (!foundingSlots.available) {
        return res.status(410).json({
          error: 'El plan Fundador ya no está disponible. Elige Pro Anual.',
          foundingSlots,
        })
      }
    }

    const planId = getPayPalPlanId('pro', billingInterval, planVariant)

    return res.status(200).json({
      clientId,
      planId,
      planVariant,
      userId: user.id,
      userEmail: user.email ?? '',
      foundingSlots,
    })
  } catch (error) {
    console.error('paypal-config', error)
    return res.status(500).json({
      error: error.message || 'No se pudo cargar la configuración de PayPal.',
    })
  }
}
