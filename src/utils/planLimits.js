export const PLAN_LIMITS = {
  free: {
    workshops: 1,
    surveys: 1,
    liveSessions: 1,
  },
  pro: {
    workshops: Infinity,
    surveys: Infinity,
    liveSessions: Infinity,
  },
}

export function getUserPlan(profile) {
  if (profile?.plan === 'pro' && profile?.subscription_status === 'active') {
    return 'pro'
  }

  if (profile?.plan === 'pro') {
    return 'pro'
  }

  return 'free'
}

export function getPlanLimits(profile) {
  return PLAN_LIMITS[getUserPlan(profile)]
}

export function canCreateResource(profile, resourceType, currentCount) {
  const limits = getPlanLimits(profile)

  const limitMap = {
    workshop: limits.workshops,
    survey: limits.surveys,
    live: limits.liveSessions,
  }

  const limit = limitMap[resourceType] ?? 0

  if (!Number.isFinite(limit)) {
    return true
  }

  return currentCount < limit
}

export function getPlanLabel(profile) {
  return getUserPlan(profile) === 'pro' ? 'KitPOP Pro' : 'KitPOP Free'
}
