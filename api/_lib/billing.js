const PAID_PLANS = new Set(['pro', 'pro_studio', 'pro_team'])
const ACTIVE_STATUSES = new Set(['active', 'trialing'])

export function profileHasActivePaidPlan(profile) {
  const plan = profile?.plan

  if (!plan || !PAID_PLANS.has(plan)) {
    return false
  }

  if (ACTIVE_STATUSES.has(profile.subscription_status)) {
    return true
  }

  if (profile.plan_period_end) {
    return new Date(profile.plan_period_end).getTime() > Date.now()
  }

  return false
}
