import { supabase } from './supabaseClient'

async function getAccessToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export async function parseWorkshopDocument({ fileName, mimeType, base64Data }) {
  const token = await getAccessToken()

  if (!token) {
    throw new Error('Debes iniciar sesión para continuar.')
  }

  const response = await fetch('/api/parse-workshop-document', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileName, mimeType, base64Data }),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error || 'No se pudo leer el documento.')
  }

  return payload
}

export async function generateWorkshopProposal(workshopId, { useKitpopActivities = true } = {}) {
  const token = await getAccessToken()

  if (!token) {
    throw new Error('Debes iniciar sesión para continuar.')
  }

  const response = await fetch('/api/generate-workshop', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ workshopId, useKitpopActivities }),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error || 'No se pudo generar la propuesta con IA.')
  }

  return payload
}
