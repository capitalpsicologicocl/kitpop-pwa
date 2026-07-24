import {
  getAiGenerationRemaining,
  resolveAiUsage,
} from './aiPlanLimits.js'

export function buildAiUsageResponse(profile, email) {
  const usage = resolveAiUsage(profile, email)

  return {
    planId: usage.planId,
    remaining: getAiGenerationRemaining(profile, email),
    monthlyUsed: usage.monthlyUsed,
    lifetimeUsed: usage.lifetimeUsed,
    monthKey: usage.monthKey,
  }
}

export async function incrementAiUsage(supabaseAdmin, userId, profile) {
  const { limits, monthKey, monthlyUsed, lifetimeUsed } = resolveAiUsage(profile)

  if (limits.lifetime != null && limits.lifetime > 0) {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        ai_generations_lifetime_count: lifetimeUsed + 1,
      })
      .eq('id', userId)

    if (error) {
      throw error
    }

    return
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      ai_generations_month_count: monthlyUsed + 1,
      ai_generations_month_key: monthKey,
    })
    .eq('id', userId)

  if (error) {
    throw error
  }
}

export async function fetchProfileForAi(supabaseAdmin, userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(
      'plan, subscription_status, plan_period_end, ai_generations_lifetime_count, ai_generations_month_count, ai_generations_month_key'
    )
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}
