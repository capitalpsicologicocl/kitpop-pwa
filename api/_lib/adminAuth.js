import { getAuthenticatedUser } from './supabase.js'

export function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || ''

  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email) {
  if (!email) {
    return false
  }

  const admins = getAdminEmails()

  if (admins.length === 0) {
    return false
  }

  return admins.includes(email.trim().toLowerCase())
}

export async function requireAdminUser(req) {
  const user = await getAuthenticatedUser(req)

  if (!user) {
    const error = new Error('Debes iniciar sesión.')
    error.statusCode = 401
    throw error
  }

  if (!isAdminEmail(user.email)) {
    const error = new Error('No tienes permisos de administrador.')
    error.statusCode = 403
    throw error
  }

  return user
}

export async function findAuthUserByEmail(supabaseAdmin, email) {
  const target = email.trim().toLowerCase()

  if (!target) {
    return null
  }

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 100,
    })

    if (error) {
      throw error
    }

    const match = data.users.find((user) => user.email?.toLowerCase() === target)

    if (match) {
      return match
    }

    if (data.users.length < 100) {
      break
    }
  }

  return null
}
