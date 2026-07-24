/** Cuentas con Pro Studio ilimitado (consultoras / staff). */
const DEFAULT_STAFF_EMAILS = ['capitalpsicologicocl@gmail.com']

export function getStaffEmails() {
  const fromEnv = import.meta.env.VITE_STAFF_EMAILS || ''

  const envList = fromEnv
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  return [...new Set([...DEFAULT_STAFF_EMAILS.map((e) => e.toLowerCase()), ...envList])]
}

export function isStaffEmail(email) {
  if (!email) {
    return false
  }

  return getStaffEmails().includes(email.trim().toLowerCase())
}
