import { getPayPalPlanId } from './_lib/paypal.js'
import { getAuthenticatedUser } from './_lib/supabase.js'

function parseBillingInterval(req) {
  const interval = req.query?.billingInterval || req.body?.billingInterval
  return interval === 'monthly' ? 'monthly' : 'yearly'
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
    const planId = getPayPalPlanId('pro', billingInterval)

    return res.status(200).json({
      clientId,
      planId,
      userId: user.id,
      userEmail: user.email ?? '',
    })
  } catch (error) {
    console.error('paypal-config', error)
    return res.status(500).json({
      error: error.message || 'No se pudo cargar la configuración de PayPal.',
    })
  }
}
