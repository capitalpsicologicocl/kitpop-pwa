/**
 * Límites IA para API serverless — mantener sincronizado con src/utils/planLimits.js
 */

export const AI_MODELS = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-5-20250929',
}

export const AI_PLAN_LIMITS = {
  explorer: {
    monthly: 0,
    lifetime: 2,
    defaultModel: AI_MODELS.haiku,
    narrativeModel: AI_MODELS.haiku,
  },
  pro: {
    monthly: 18,
    lifetime: null,
    defaultModel: AI_MODELS.haiku,
    narrativeModel: AI_MODELS.haiku,
  },
  pro_studio: {
    monthly: 40,
    lifetime: null,
    defaultModel: AI_MODELS.haiku,
    narrativeModel: AI_MODELS.sonnet,
  },
  pro_team: {
    monthly: 40,
    lifetime: null,
    defaultModel: AI_MODELS.haiku,
    narrativeModel: AI_MODELS.sonnet,
  },
}

const PAID_PLANS = new Set(['pro', 'pro_studio', 'pro_team'])
const ACTIVE_STATUSES = new Set(['active', 'trialing'])

export function normalizePlanId(plan) {
  if (plan === 'free' || !plan) {
    return 'explorer'
  }

  return plan
}

export function getUserPlanFromProfile(profile) {
  const planId = normalizePlanId(profile?.plan)

  if (!PAID_PLANS.has(planId)) {
    return 'explorer'
  }

  if (ACTIVE_STATUSES.has(profile.subscription_status)) {
    return planId
  }

  if (profile.plan_period_end) {
    return new Date(profile.plan_period_end).getTime() > Date.now() ? planId : 'explorer'
  }

  return 'explorer'
}

export function getCurrentAiMonthKey(date = new Date()) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function resolveAiUsage(profile) {
  const planId = getUserPlanFromProfile(profile)
  const limits = AI_PLAN_LIMITS[planId] ?? AI_PLAN_LIMITS.explorer
  const monthKey = getCurrentAiMonthKey()
  const storedMonthKey = profile?.ai_generations_month_key ?? ''
  const monthlyUsed =
    storedMonthKey === monthKey ? Number(profile?.ai_generations_month_count ?? 0) : 0
  const lifetimeUsed = Number(profile?.ai_generations_lifetime_count ?? 0)

  return { planId, limits, monthKey, monthlyUsed, lifetimeUsed }
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
  const { limits } = resolveAiUsage(profile)

  if (task === 'narrative' && limits.narrativeModel) {
    return limits.narrativeModel
  }

  return limits.defaultModel
}
