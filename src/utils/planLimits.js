/** IDs de modelo Anthropic (sincronizar con api/_lib/aiPlanLimits.js). */
export const AI_MODELS = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-5-20250929',
}

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
      '2 diseños con IA (prueba)',
      'Favoritos y bitácora',
    ],
  },
  pro: {
    id: 'pro',
    label: 'KitPOP Pro',
    kicker: 'Pro',
    priceMonthly: 3.99,
    priceYearly: 29,
    features: [
      'Talleres ilimitados',
      'Encuestas ilimitadas',
      'Polls en vivo ilimitados',
      'Exports Word/PDF completos',
      '18 diseños con IA al mes (talleres y reuniones)',
    ],
  },
  pro_studio: {
    id: 'pro_studio',
    label: 'KitPOP Pro Studio',
    kicker: 'Pro Studio',
    priceMonthly: 5.99,
    priceYearly: 49,
    subtitle: 'Para facilitadores que diseñan a diario',
    features: [
      'Todo lo de Pro',
      '40 diseños con IA al mes',
      'Propuesta narrativa con modelo avanzado',
      'Regenerar bloques del taller (próximamente)',
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
      'Todo lo de Pro Studio por facilitador',
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
    ai: {
      /** Generaciones por mes calendario (0 = no mensual). */
      monthly: 0,
      /** Prueba total de por vida (Explorer). */
      lifetime: 2,
      defaultModel: AI_MODELS.haiku,
      narrativeModel: AI_MODELS.haiku,
    },
  },
  pro: {
    workshops: Infinity,
    surveys: Infinity,
    liveSessions: Infinity,
    ai: {
      monthly: 18,
      lifetime: null,
      defaultModel: AI_MODELS.haiku,
      narrativeModel: AI_MODELS.haiku,
    },
  },
  pro_studio: {
    workshops: Infinity,
    surveys: Infinity,
    liveSessions: Infinity,
    ai: {
      monthly: 40,
      lifetime: null,
      defaultModel: AI_MODELS.haiku,
      narrativeModel: AI_MODELS.sonnet,
    },
  },
  pro_team: {
    workshops: Infinity,
    surveys: Infinity,
    liveSessions: Infinity,
    ai: {
      monthly: 40,
      lifetime: null,
      defaultModel: AI_MODELS.haiku,
      narrativeModel: AI_MODELS.sonnet,
    },
  },
}

const ACTIVE_STATUSES = new Set(['active', 'trialing'])
const PAID_PLANS = new Set(['pro', 'pro_studio', 'pro_team'])

/** Planes visibles en checkout (Studio y TEAM cuando existan planes PayPal). */
export const VISIBLE_PLAN_IDS = ['explorer', 'pro']

export function getVisiblePlans() {
  return VISIBLE_PLAN_IDS.map((id) => PLANS[id]).filter(Boolean)
}

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

export function getAiLimits(profile) {
  return getPlanLimits(profile).ai
}

/** Clave YYYY-MM en UTC para reinicio mensual de cupo IA. */
export function getCurrentAiMonthKey(date = new Date()) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Uso IA efectivo según columnas en profiles (ver supabase/ai_usage_v1.sql).
 */
export function resolveAiUsage(profile) {
  const limits = getAiLimits(profile)
  const monthKey = getCurrentAiMonthKey()
  const storedMonthKey = profile?.ai_generations_month_key ?? ''
  const monthlyUsed =
    storedMonthKey === monthKey ? Number(profile?.ai_generations_month_count ?? 0) : 0
  const lifetimeUsed = Number(profile?.ai_generations_lifetime_count ?? 0)

  return { limits, monthKey, monthlyUsed, lifetimeUsed }
}

export function getAiGenerationRemaining(profile) {
  const { limits, monthlyUsed, lifetimeUsed } = resolveAiUsage(profile)

  if (limits.lifetime != null && limits.lifetime > 0) {
    return Math.max(0, limits.lifetime - lifetimeUsed)
  }

  if (!Number.isFinite(limits.monthly)) {
    return Infinity
  }

  return Math.max(0, limits.monthly - monthlyUsed)
}

export function canUseAiGeneration(profile) {
  return getAiGenerationRemaining(profile) > 0
}

export function getAiModelForTask(profile, task = 'workshop') {
  const { defaultModel, narrativeModel } = getAiLimits(profile)

  if (task === 'narrative' && narrativeModel) {
    return narrativeModel
  }

  return defaultModel
}

export function formatAiLimitLabel(planId = 'explorer') {
  const ai = PLAN_LIMITS[planId]?.ai

  if (!ai) {
    return 'Sin IA'
  }

  if (ai.lifetime != null && ai.lifetime > 0) {
    return `${ai.lifetime} diseños con IA (prueba)`
  }

  if (!Number.isFinite(ai.monthly)) {
    return 'Diseños con IA ilimitados'
  }

  return `${ai.monthly} diseños con IA al mes`
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
