import {
  cancelPayPalSubscription,
  getPayPalSubscription,
  syncProfileFromPayPalSubscription,
} from './_lib/paypal.js'
import { getAuthenticatedUser, getSupabaseAdmin } from './_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getAuthenticatedUser(req)

    if (!user) {
      return res.status(401).json({ error: 'Debes iniciar sesión.' })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('paypal_subscription_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      throw profileError
    }

    if (!profile?.paypal_subscription_id) {
      return res.status(400).json({
        error: 'No encontramos una suscripción PayPal activa en tu cuenta.',
      })
    }

    await cancelPayPalSubscription(profile.paypal_subscription_id)
    const subscription = await getPayPalSubscription(profile.paypal_subscription_id)
    await syncProfileFromPayPalSubscription(subscription, supabaseAdmin)

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('cancel-paypal-subscription', error)
    return res.status(500).json({
      error: error.message || 'No se pudo cancelar la suscripción.',
    })
  }
}
