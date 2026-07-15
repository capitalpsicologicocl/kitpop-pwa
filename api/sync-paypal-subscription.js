import {
  getPayPalSubscription,
  syncProfileFromPayPalSubscription,
} from './_lib/paypal.js'
import { getAuthenticatedUser, getSupabaseAdmin } from './_lib/supabase.js'

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

  return body.subscriptionId?.trim() || ''
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

    const subscriptionId = parseBody(req)

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Falta subscriptionId.' })
    }

    const subscription = await getPayPalSubscription(subscriptionId)

    if (subscription.custom_id && subscription.custom_id !== user.id) {
      return res.status(403).json({ error: 'Esta suscripción no pertenece a tu cuenta.' })
    }

    const supabaseAdmin = getSupabaseAdmin()
    await syncProfileFromPayPalSubscription(
      { ...subscription, custom_id: user.id },
      supabaseAdmin
    )

    return res.status(200).json({ ok: true, status: subscription.status })
  } catch (error) {
    console.error('sync-paypal-subscription', error)
    return res.status(500).json({
      error: error.message || 'No se pudo sincronizar la suscripción.',
    })
  }
}
