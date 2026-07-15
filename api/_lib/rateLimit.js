import { getUserPlanFromProfile } from './aiPlanLimits.js'

/** Límite HTTP por hora (independiente de cuota mensual de IA). */
export const AI_HOURLY_RATE_LIMITS = {
  explorer: {
    'generate-workshop': 2,
    'parse-workshop-document': 3,
  },
  pro: {
    'generate-workshop': 12,
    'parse-workshop-document': 24,
  },
  pro_studio: {
    'generate-workshop': 30,
    'parse-workshop-document': 40,
  },
  pro_team: {
    'generate-workshop': 30,
    'parse-workshop-document': 40,
  },
}

function getHourWindowKey(date = new Date()) {
  const bucket = new Date(date)
  bucket.setUTCMinutes(0, 0, 0)
  return bucket.toISOString()
}

function getRetryAfterSeconds(date = new Date()) {
  const nextHour = new Date(date)
  nextHour.setUTCMinutes(0, 0, 0)
  nextHour.setUTCHours(nextHour.getUTCHours() + 1)
  return Math.max(60, Math.ceil((nextHour.getTime() - date.getTime()) / 1000))
}

export async function enforceAiRateLimit(supabaseAdmin, userId, profile, routeKey) {
  const planId = getUserPlanFromProfile(profile)
  const limits = AI_HOURLY_RATE_LIMITS[planId] ?? AI_HOURLY_RATE_LIMITS.explorer
  const maxRequests = limits[routeKey] ?? limits['generate-workshop'] ?? 2
  const windowKey = getHourWindowKey()

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('api_rate_limits')
    .select('id, request_count')
    .eq('user_id', userId)
    .eq('route_key', routeKey)
    .eq('window_key', windowKey)
    .maybeSingle()

  if (fetchError) {
    if (fetchError.code === '42P01') {
      return { allowed: true, skipped: true }
    }

    throw fetchError
  }

  const currentCount = Number(existing?.request_count ?? 0)

  if (currentCount >= maxRequests) {
    return {
      allowed: false,
      limit: maxRequests,
      retryAfter: getRetryAfterSeconds(),
    }
  }

  const nextCount = currentCount + 1
  const { error: upsertError } = await supabaseAdmin.from('api_rate_limits').upsert(
    {
      user_id: userId,
      route_key: routeKey,
      window_key: windowKey,
      request_count: nextCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,route_key,window_key' }
  )

  if (upsertError) {
    if (upsertError.code === '42P01') {
      return { allowed: true, skipped: true }
    }

    throw upsertError
  }

  return {
    allowed: true,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - nextCount),
  }
}
