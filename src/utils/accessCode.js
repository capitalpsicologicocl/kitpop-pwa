const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateAccessCode(length = 6) {
  let code = ''

  for (let index = 0; index < length; index += 1) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }

  return code
}

export function normalizeAccessCode(code = '') {
  return code.trim().toUpperCase()
}

export function getParticipantUrl(code) {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://app.kitpopapp.com'

  return `${origin}/p/${normalizeAccessCode(code)}`
}

export const RESOURCE_LABELS = {
  workshop: 'Taller',
  survey: 'Encuesta',
  live: 'Sesión en vivo',
}
