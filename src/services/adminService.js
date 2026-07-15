import { supabase } from './supabaseClient'

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data.session?.access_token ?? null
}

async function adminRequest(path, options = {}) {
  const token = await getAccessToken()

  if (!token) {
    throw new Error('Debes iniciar sesión.')
  }

  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error || 'La solicitud de administración falló.')
  }

  return payload
}

export async function fetchAdminAccess() {
  try {
    return await adminRequest('/api/admin?action=me')
  } catch (error) {
    return { isAdmin: false, error: error.message }
  }
}

export async function lookupAdminUser(email) {
  return adminRequest('/api/admin?action=lookup-user', {
    method: 'POST',
    body: JSON.stringify({ action: 'lookup-user', email }),
  })
}

export async function grantAdminPlan({ userId, grantType, days, note }) {
  return adminRequest('/api/admin?action=grant-plan', {
    method: 'POST',
    body: JSON.stringify({ action: 'grant-plan', userId, grantType, days, note }),
  })
}
