import { findAuthUserByEmail, requireAdminUser } from '../_lib/adminAuth.js'
import { getSupabaseAdmin } from '../_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await requireAdminUser(req)

    const email = String(req.body?.email || '').trim()

    if (!email) {
      return res.status(400).json({ error: 'Indica el email del usuario.' })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const authUser = await findAuthUserByEmail(supabaseAdmin, email)

    if (!authUser) {
      return res.status(404).json({ error: 'No hay ningún usuario con ese email.' })
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select(
        'full_name, plan, subscription_status, plan_period_end, is_founding_member, paypal_subscription_id, created_at'
      )
      .eq('id', authUser.id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return res.status(200).json({
      user: {
        id: authUser.id,
        email: authUser.email,
        createdAt: authUser.created_at,
      },
      profile: profile ?? {
        full_name: null,
        plan: 'explorer',
        subscription_status: 'inactive',
        plan_period_end: null,
        is_founding_member: false,
        paypal_subscription_id: null,
      },
    })
  } catch (error) {
    const status = error.statusCode || 500
    console.error('[admin/lookup-user]', error)

    return res.status(status).json({
      error: error.message || 'No se pudo buscar el usuario.',
    })
  }
}
