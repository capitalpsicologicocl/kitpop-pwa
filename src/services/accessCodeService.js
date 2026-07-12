import { generateAccessCode, normalizeAccessCode } from '../utils/accessCode'
import { supabase } from './supabaseClient'

const MAX_CODE_ATTEMPTS = 8

export async function fetchAccessCodesByType(userId, resourceType) {
  const { data, error } = await supabase
    .from('access_codes')
    .select('code, resource_id, is_active')
    .eq('user_id', userId)
    .eq('resource_type', resourceType)

  if (error) {
    throw error
  }

  return data ?? []
}

export async function resolveAccessCode(code) {
  const { data, error } = await supabase.rpc('resolve_access_code', {
    p_code: normalizeAccessCode(code),
  })

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function fetchAccessCodeForResource(userId, resourceType, resourceId) {
  const { data, error } = await supabase
    .from('access_codes')
    .select('code, is_active')
    .eq('user_id', userId)
    .eq('resource_type', resourceType)
    .eq('resource_id', resourceId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function ensureAccessCode(userId, resourceType, resourceId) {
  const existing = await fetchAccessCodeForResource(userId, resourceType, resourceId)

  if (existing?.code) {
    return existing.code
  }

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = generateAccessCode()
    const { error } = await supabase.from('access_codes').insert({
      code,
      user_id: userId,
      resource_type: resourceType,
      resource_id: resourceId,
    })

    if (!error) {
      return code
    }

    if (error.code !== '23505') {
      throw error
    }
  }

  throw new Error('No se pudo generar un código de acceso único.')
}

export async function setAccessCodeActive(userId, code, isActive) {
  const { error } = await supabase
    .from('access_codes')
    .update({ is_active: isActive })
    .eq('user_id', userId)
    .eq('code', normalizeAccessCode(code))

  if (error) {
    throw error
  }
}
