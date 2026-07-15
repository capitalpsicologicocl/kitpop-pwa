export const FOUNDING_MEMBER_LIMIT = 100

export async function countFoundingMembers(supabaseAdmin) {
  const { count, error } = await supabaseAdmin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('is_founding_member', true)

  if (error) {
    throw error
  }

  return count ?? 0
}

export async function getFoundingSlots(supabaseAdmin) {
  const used = await countFoundingMembers(supabaseAdmin)

  return {
    limit: FOUNDING_MEMBER_LIMIT,
    used,
    remaining: Math.max(0, FOUNDING_MEMBER_LIMIT - used),
    available: used < FOUNDING_MEMBER_LIMIT,
  }
}

export function isFoundingPayPalPlan(planId) {
  const foundingPlanId = process.env.PAYPAL_PLAN_PRO_FOUNDING_YEARLY

  return Boolean(foundingPlanId && planId === foundingPlanId)
}
