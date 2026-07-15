import { isAdminEmail, requireAdminUser, findAuthUserByEmail } from './adminAuth.js'
import { getSupabaseAdmin } from './supabase.js'

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

export async function handleAdminMe(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await requireAdminUser(req)

    return res.status(200).json({
      isAdmin: isAdminEmail(user.email),
      email: user.email,
    })
  } catch (error) {
    const status = error.statusCode || 500

    return res.status(status).json({
      error: error.message || 'No se pudo verificar permisos.',
      isAdmin: false,
    })
  }
}

export async function handleAdminLookupUser(req, res) {
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
    console.error('[admin lookup-user]', error)

    return res.status(status).json({
      error: error.message || 'No se pudo buscar el usuario.',
    })
  }
}

export async function handleAdminGrantPlan(req, res) {
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

    console.info('[admin grant-plan]', {
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
    console.error('[admin grant-plan]', error)

    return res.status(status).json({
      error: error.message || 'No se pudo actualizar el plan.',
    })
  }
}
