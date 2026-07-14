const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

function getAnthropicApiKey() {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY no está configurada en el servidor.')
  }

  return apiKey
}

function extractTextFromAnthropicPayload(payload) {
  const text = (payload.content ?? [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim()

  if (!text) {
    throw new Error('Anthropic no devolvió contenido.')
  }

  return text
}

export async function callAnthropicMessages({
  model,
  system,
  messages,
  maxTokens = 4096,
  temperature = 0.35,
}) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': getAnthropicApiKey(),
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system,
      messages,
    }),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const detail = payload?.error?.message || payload?.error || 'Error al llamar a Anthropic.'
    throw new Error(detail)
  }

  return extractTextFromAnthropicPayload(payload)
}

export async function callAnthropic({ model, system, user, maxTokens = 4096 }) {
  return callAnthropicMessages({
    model,
    system,
    maxTokens,
    messages: [{ role: 'user', content: user }],
  })
}

export function parseJsonFromModel(text) {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1].trim() : trimmed

  try {
    return JSON.parse(candidate)
  } catch {
    const start = candidate.indexOf('{')
    const end = candidate.lastIndexOf('}')

    if (start === -1 || end === -1 || end <= start) {
      throw new Error('La respuesta de IA no es JSON válido.')
    }

    return JSON.parse(candidate.slice(start, end + 1))
  }
}
