import { getStripe } from '../_lib/stripe.js'
import { getAppOrigin, getAuthenticatedUser, getSupabaseAdmin } from '../_lib/supabase.js'

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
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      throw profileError
    }

    if (!profile?.stripe_customer_id) {
      return res.status(400).json({
        error: 'Aún no tienes una suscripción activa con Stripe.',
      })
    }

    const stripe = getStripe()
    const origin = getAppOrigin(req)

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/perfil`,
    })

    return res.status(200).json({ url: portalSession.url })
  } catch (error) {
    console.error('create-portal-session', error)
    return res.status(500).json({
      error: error.message || 'No se pudo abrir el portal de facturación.',
    })
  }
}
