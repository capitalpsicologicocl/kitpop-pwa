import { AI_MODELS } from './_lib/aiPlanLimits.js'
import { callAnthropicMessages, parseJsonFromModel } from './_lib/anthropic.js'
import { extractDocumentText } from './_lib/documentText.js'
import { enforceAiRateLimit } from './_lib/rateLimit.js'
import { fetchProfileForAi } from './_lib/aiUsage.js'
import { getAuthenticatedUser, getSupabaseAdmin } from './_lib/supabase.js'

const PARSE_SYSTEM = `Eres un analista de documentos formativos. Extraes metadatos estructurados de Términos de Referencia, propuestas de taller, planes de capacitación o documentos similares. Respondes solo con JSON válido.`

const PARSE_PROMPT = `Lee el documento y extrae los datos del taller con el máximo detalle posible.

Devuelve SOLO JSON válido, sin markdown, con esta forma exacta:
{
  "title": "",
  "organization": "",
  "team": "",
  "audience": "",
  "modality": "Presencial|Online|Híbrido",
  "objective": "",
  "participantsCount": null,
  "sessionCount": 1,
  "sessions": [
    {
      "sessionNumber": 1,
      "durationHours": 2,
      "durationMinutes": 0,
      "label": "Módulo 1"
    }
  ],
  "contentOutline": [
    {
      "moduleNumber": 1,
      "title": "",
      "objectives": "",
      "contents": "",
      "durationMinutes": null
    }
  ],
  "modulesSummary": "",
  "confidence": "high|medium|low"
}

Reglas:
- Si un dato no aparece en el documento, usa "" para strings o null para números.
- modality debe ser "Presencial", "Online" o "Híbrido" (infierelo solo si hay pistas claras).
- objective: texto COMPLETO y detallado con objetivos generales, resultados de aprendizaje, competencias, metodología y temas transversales del documento. No resumas en una frase; conserva la riqueza del TDR.
- contentOutline: un objeto por cada módulo/unidad/sesión identificada. objectives y contents deben ser extensos y fieles al documento (viñetas, temas, subtemas).
- modulesSummary: síntesis narrativa de la estructura del programa (2-4 párrafos si hay información).
- sessionCount debe coincidir con sesiones/módulos identificados (mínimo 1).
- sessions: una entrada por sesión con tiempos del documento.
- No inventes organizaciones, cifras ni módulos sin respaldo en el texto.`

function parseBody(req) {
  try {
    return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    return {}
  }
}

function clampDurationPart(value, max) {
  const number = Number(value)

  if (!Number.isFinite(number) || number < 0) {
    return 0
  }

  return Math.min(max, Math.round(number))
}

function normalizeModality(value) {
  const normalized = String(value ?? '').trim().toLowerCase()

  if (normalized.includes('online') || normalized.includes('virtual')) {
    return 'Online'
  }

  if (normalized.includes('híbrid') || normalized.includes('hibrid')) {
    return 'Híbrido'
  }

  if (normalized.includes('presencial')) {
    return 'Presencial'
  }

  return 'Presencial'
}

function normalizeExtracted(raw) {
  const sessionCount = Math.min(
    12,
    Math.max(1, Number(raw?.sessionCount) || 1)
  )

  const rawSessions = Array.isArray(raw?.sessions) ? raw.sessions : []
  const sessions = []

  for (let index = 0; index < sessionCount; index += 1) {
    const source =
      rawSessions.find((entry) => Number(entry.sessionNumber) === index + 1) ??
      rawSessions[index] ??
      {}

    sessions.push({
      sessionNumber: index + 1,
      durationHours: clampDurationPart(source.durationHours ?? 2, 8),
      durationMinutes: clampDurationPart(source.durationMinutes ?? 0, 59),
      label: String(source.label ?? `Sesión ${index + 1}`).trim(),
    })
  }

  const participantsCount = Number(raw?.participantsCount)

  const contentOutline = (Array.isArray(raw?.contentOutline) ? raw.contentOutline : [])
    .map((entry, index) => ({
      moduleNumber: Number(entry.moduleNumber) || index + 1,
      title: String(entry.title ?? '').trim(),
      objectives: String(entry.objectives ?? '').trim(),
      contents: String(entry.contents ?? '').trim(),
      durationMinutes: Number.isFinite(Number(entry.durationMinutes))
        ? Number(entry.durationMinutes)
        : null,
    }))
    .filter((entry) => entry.title || entry.objectives || entry.contents)

  return {
    title: String(raw?.title ?? '').trim(),
    organization: String(raw?.organization ?? '').trim(),
    team: String(raw?.team ?? '').trim(),
    audience: String(raw?.audience ?? '').trim(),
    modality: normalizeModality(raw?.modality),
    objective: String(raw?.objective ?? '').trim(),
    participantsCount: Number.isFinite(participantsCount) && participantsCount > 0
      ? participantsCount
      : null,
    sessionCount,
    sessions,
    contentOutline,
    modulesSummary: String(raw?.modulesSummary ?? '').trim(),
    confidence: ['high', 'medium', 'low'].includes(raw?.confidence)
      ? raw.confidence
      : 'medium',
  }
}

async function parseWithAnthropic(document) {
  const model = AI_MODELS.haiku

  if (document.mode === 'pdf') {
    const rawText = await callAnthropicMessages({
      model,
      system: PARSE_SYSTEM,
      maxTokens: 4096,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: document.base64Data,
              },
            },
            {
              type: 'text',
              text: PARSE_PROMPT,
            },
          ],
        },
      ],
    })

    return parseJsonFromModel(rawText)
  }

  const rawText = await callAnthropicMessages({
    model,
    system: PARSE_SYSTEM,
    maxTokens: 2048,
    temperature: 0.2,
    messages: [
      {
        role: 'user',
        content: `${PARSE_PROMPT}\n\n---\nDocumento:\n\n${document.text}`,
      },
    ],
  })

  return parseJsonFromModel(rawText)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getAuthenticatedUser(req)

    if (!user) {
      return res.status(401).json({ error: 'Debes iniciar sesión.' })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const profile = await fetchProfileForAi(supabaseAdmin, user.id)

    const rateLimit = await enforceAiRateLimit(
      supabaseAdmin,
      user.id,
      profile,
      'parse-workshop-document'
    )

    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: 'Demasiadas importaciones de documento en poco tiempo. Intenta de nuevo en unos minutos.',
        retryAfter: rateLimit.retryAfter,
        limit: rateLimit.limit,
      })
    }

    const body = parseBody(req)
    const fileName = String(body.fileName ?? '').trim()
    const mimeType = String(body.mimeType ?? '').trim()
    const base64Data = String(body.base64Data ?? '').trim()

    if (!fileName || !base64Data) {
      return res.status(400).json({ error: 'Falta el archivo a procesar.' })
    }

    const document = await extractDocumentText({ fileName, mimeType, base64Data })
    const rawExtracted = await parseWithAnthropic(document)
    const extracted = normalizeExtracted(rawExtracted)

    return res.status(200).json({
      extracted,
      fileName,
      parseOnly: true,
    })
  } catch (error) {
    console.error('[parse-workshop-document]', error)
    return res.status(500).json({
      error: error.message || 'No se pudo leer el documento.',
    })
  }
}
