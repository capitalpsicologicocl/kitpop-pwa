import { requireAdminUser } from '../_lib/adminAuth.js'
import { getSupabaseAdmin } from '../_lib/supabase.js'

const GRANT_TYPES = new Set(['courtesy', 'trial', 'revoke'])

function buildPlanPatch(grantType, days) {
  if (grantType === 'revoke') {
    return {
      plan: 'explorer',
      subscription_status: 'inactive',
      plan_period_end: null,
    }
  }

  const periodEnd = new Date()
  periodEnd.setUTCDate(periodEnd.getUTCDate() + days)

  if (grantType === 'trial') {
    return {
      plan: 'pro',
      subscription_status: 'trialing',
      plan_period_end: periodEnd.toISOString(),
    }
  }

  return {
    plan: 'pro',
    subscription_status: 'active',
    plan_period_end: periodEnd.toISOString(),
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const adminUser = await requireAdminUser(req)
    const userId = String(req.body?.userId || '').trim()
    const grantType = String(req.body?.grantType || 'courtesy')
    const days = Number(req.body?.days)

    if (!userId) {
      return res.status(400).json({ error: 'Indica el userId.' })
    }

    if (!GRANT_TYPES.has(grantType)) {
      return res.status(400).json({ error: 'Tipo de concesión no válido.' })
    }

    const effectiveDays =
      grantType === 'trial'
        ? 7
        : grantType === 'revoke'
          ? 0
          : Number.isFinite(days) && days > 0
            ? Math.min(days, 730)
            : 365

    const patch = buildPlanPatch(grantType, effectiveDays)
    const supabaseAdmin = getSupabaseAdmin()

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select(
        'full_name, plan, subscription_status, plan_period_end, is_founding_member, paypal_subscription_id'
      )
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!profile) {
      return res.status(404).json({ error: 'Perfil no encontrado.' })
    }

    console.info('[admin/grant-plan]', {
      adminEmail: adminUser.email,
      targetUserId: userId,
      grantType,
      days: effectiveDays,
      note: req.body?.note || null,
    })

    return res.status(200).json({
      ok: true,
      grantType,
      days: grantType === 'revoke' ? 0 : effectiveDays,
      profile,
    })
  } catch (error) {
    const status = error.statusCode || 500
    console.error('[admin/grant-plan]', error)

    return res.status(status).json({
      error: error.message || 'No se pudo actualizar el plan.',
    })
  }
}
