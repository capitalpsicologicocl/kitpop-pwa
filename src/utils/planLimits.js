export const PLANS = {
  explorer: {
    id: 'explorer',
    label: 'KitPOP Explorer',
    kicker: 'Explorer',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      'Banco completo de actividades',
      '1 taller, 1 encuesta, 1 sesión en vivo',
      'Favoritos y bitácora',
    ],
  },
  pro: {
    id: 'pro',
    label: 'KitPOP Pro',
    kicker: 'Pro',
    priceMonthly: 2.99,
    priceYearly: 29,
    features: [
      'Talleres ilimitados',
      'Encuestas ilimitadas',
      'Polls en vivo ilimitados',
      'Exports Word/PDF completos',
    ],
  },
  pro_team: {
    id: 'pro_team',
    label: 'KitPOP Pro TEAM',
    kicker: 'Pro TEAM',
    priceMonthly: 6.99,
    priceYearly: 69,
    subtitle: 'Equipos de 2 a 5 facilitadores',
    features: [
      'Todo lo de Pro',
      'Licencia para 2 a 5 facilitadores',
      'Ideal para consultoras y áreas de formación',
    ],
  },
}

export const PLAN_LIMITS = {
  explorer: {
    workshops: 1,
    surveys: 1,
    liveSessions: 1,
  },
  pro: {
    workshops: Infinity,
    surveys: Infinity,
    liveSessions: Infinity,
  },
  pro_team: {
    workshops: Infinity,
    surveys: Infinity,
    liveSessions: Infinity,
  },
}

const ACTIVE_STATUSES = new Set(['active', 'trialing'])
const PAID_PLANS = new Set(['pro', 'pro_team'])

export function normalizePlanId(plan) {
  if (plan === 'free' || !plan) {
    return 'explorer'
  }

  return plan
}

export function getUserPlan(profile) {
  const planId = normalizePlanId(profile?.plan)

  if (!PAID_PLANS.has(planId)) {
    return 'explorer'
  }

  if (ACTIVE_STATUSES.has(profile.subscription_status)) {
    return planId
  }

  if (profile.plan_period_end) {
    const periodEnd = new Date(profile.plan_period_end)

    if (!Number.isNaN(periodEnd.getTime()) && periodEnd > new Date()) {
      return planId
    }
  }

  return 'explorer'
}

export function hasPaidPlan(profile) {
  return PAID_PLANS.has(getUserPlan(profile))
}

export function isProUser(profile) {
  return hasPaidPlan(profile)
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
  const planId = getUserPlan(profile)
  return PLANS[planId]?.label ?? PLANS.explorer.label
}

export function formatPlanPrice(planId, billingInterval = 'yearly') {
  const plan = PLANS[planId]

  if (!plan) {
    return ''
  }

  if (plan.priceMonthly === 0) {
    return 'USD 0'
  }

  if (billingInterval === 'monthly') {
    return `USD ${plan.priceMonthly.toFixed(2)}/mes`
  }

  return `USD ${plan.priceYearly}/año`
}

export function getSubscriptionStatusLabel(profile) {
  const status = profile?.subscription_status

  if (!status || status === 'inactive') {
    return 'Sin suscripción activa'
  }

  if (status === 'active') {
    return 'Suscripción activa'
  }

  if (status === 'trialing') {
    return 'Periodo de prueba'
  }

  if (status === 'past_due') {
    return 'Pago pendiente'
  }

  if (status === 'canceled') {
    return 'Cancelada'
  }

  return status
}

export function formatPlanPeriodEnd(profile) {
  if (!profile?.plan_period_end) {
    return null
  }

  const date = new Date(profile.plan_period_end)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
