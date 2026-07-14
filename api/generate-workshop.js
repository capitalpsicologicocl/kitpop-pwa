import {
  canUseAiGeneration,
  getAiModelForTask,
} from './_lib/aiPlanLimits.js'
import {
  buildAiUsageResponse,
  fetchProfileForAi,
  incrementAiUsage,
} from './_lib/aiUsage.js'
import { callAnthropic, parseJsonFromModel } from './_lib/anthropic.js'
import { getActivityBySlug, getKitpopActivityCatalog } from './_lib/kitpopCatalog.js'
import { getAuthenticatedUser, getSupabaseAdmin } from './_lib/supabase.js'

const VALID_ITEM_TYPES = new Set(['theory', 'activity', 'custom', 'pause'])
const VALID_PAUSE_TYPES = new Set(['coffee', 'lunch', 'break'])

function parseBody(req) {
  try {
    return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    return {}
  }
}

function clampMinutes(value, fallback = 15) {
  const minutes = Number(value)
  if (!Number.isFinite(minutes) || minutes < 5) {
    return fallback
  }

  return Math.min(180, Math.round(minutes))
}

function clampDurationPart(value, max) {
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) {
    return 0
  }

  return Math.min(max, Math.round(number))
}

function normalizeProposal(rawProposal, sessions, useKitpopActivities = true) {
  if (!rawProposal || !Array.isArray(rawProposal.sessions)) {
    throw new Error('La propuesta de IA no tiene sesiones.')
  }

  const sessionNumbers = new Set(sessions.map((session) => session.session_number))
  const normalizedSessions = []

  for (const session of sessions) {
    const source =
      rawProposal.sessions.find(
        (entry) => Number(entry.sessionNumber) === session.session_number
      ) ?? rawProposal.sessions[normalizedSessions.length]

    if (!source) {
      throw new Error(`Falta la sesión ${session.session_number} en la propuesta de IA.`)
    }

    if (!sessionNumbers.has(Number(source.sessionNumber ?? session.session_number))) {
      throw new Error('La propuesta incluye sesiones inválidas.')
    }

    const items = Array.isArray(source.items) ? source.items : []
    const normalizedItems = []

    for (const item of items) {
      const itemType = VALID_ITEM_TYPES.has(item.itemType) ? item.itemType : 'custom'
      let activitySlug = item.activitySlug ?? null
      let title = String(item.title ?? '').trim()
      let description = String(item.description ?? '').trim()
      let pauseType = item.pauseType ?? null

      if (itemType === 'activity') {
        if (!useKitpopActivities) {
          normalizedItems.push({
            itemType: 'custom',
            timeMinutes: clampMinutes(item.timeMinutes),
            title: title || 'Actividad sugerida',
            description,
            activitySlug: null,
            pauseType: null,
          })
          continue
        }

        const catalogEntry = activitySlug ? getActivityBySlug(activitySlug) : null

        if (!catalogEntry) {
          normalizedItems.push({
            itemType: 'custom',
            timeMinutes: clampMinutes(item.timeMinutes),
            title: title || 'Actividad sugerida',
            description,
            activitySlug: null,
            pauseType: null,
          })
          continue
        }

        activitySlug = catalogEntry.slug
        title = title || catalogEntry.title
        description = description || catalogEntry.sub
      }

      if (itemType === 'pause') {
        pauseType = VALID_PAUSE_TYPES.has(pauseType) ? pauseType : 'break'
        title =
          title ||
          (pauseType === 'coffee'
            ? 'Coffee break'
            : pauseType === 'lunch'
              ? 'Almuerzo'
              : 'Pausa')
      }

      if (itemType === 'theory' && !title) {
        title = 'Contenido teórico'
      }

      normalizedItems.push({
        itemType,
        timeMinutes: clampMinutes(item.timeMinutes, itemType === 'pause' ? 15 : 20),
        title,
        description,
        activitySlug: itemType === 'activity' ? activitySlug : null,
        pauseType: itemType === 'pause' ? pauseType : null,
      })
    }

    if (normalizedItems.length === 0) {
      throw new Error(`La sesión ${session.session_number} quedó sin actividades.`)
    }

    normalizedSessions.push({
      sessionNumber: session.session_number,
      durationHours: clampDurationPart(
        source.durationHours ?? session.duration_hours ?? 0,
        8
      ),
      durationMinutes: clampDurationPart(
        source.durationMinutes ?? session.duration_minutes ?? 0,
        59
      ),
      narrative: String(source.narrative ?? '').trim(),
      items: normalizedItems,
    })
  }

  return {
    rationale: String(rawProposal.rationale ?? '').trim(),
    sessions: normalizedSessions,
  }
}

function buildWorkshopBrief(workshop, sessions) {
  return {
    title: workshop.title,
    organization: workshop.organization,
    team: workshop.team,
    audience: workshop.audience,
    modality: workshop.modality,
    objective: workshop.objective,
    participantsCount: workshop.participants_count,
    sessionCount: workshop.session_count,
    sessions: sessions.map((session) => ({
      sessionNumber: session.session_number,
      durationHours: session.duration_hours ?? 0,
      durationMinutes: session.duration_minutes ?? 0,
      plannedMinutes:
        (session.duration_hours ?? 0) * 60 + (session.duration_minutes ?? 0),
    })),
  }
}

function buildKitpopPrompt({ brief, catalog }) {
  const compactCatalog = catalog.map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    category: entry.category,
    durationMinutes: entry.durationMinutes,
  }))

  return `Diseña un taller formativo usando EXCLUSIVAMENTE actividades del catálogo KitPOP cuando elijas itemType "activity".

Brief del taller:
${JSON.stringify(brief, null, 2)}

Catálogo de actividades disponibles (${compactCatalog.length}):
${JSON.stringify(compactCatalog)}

Reglas:
- Devuelve SOLO JSON válido, sin markdown.
- Una entrada por cada sesión del brief (mismo sessionNumber).
- NO incluyas bienvenida ni encuadre inicial; el editor ya la agrega.
- Prioriza actividades reales del catálogo (itemType "activity" + activitySlug exacto).
- Usa "theory" para bloques expositivos breves, "pause" para coffee/lunch/break, "custom" solo si no hay actividad adecuada.
- La suma de timeMinutes por sesión debe aproximarse al tiempo planificado (±15 min).
- Incluye variedad: apertura, desarrollo, cierre/reflexión.
- Descripciones en español LATAM, tono profesional y cálido para facilitadores.
- Evita repetir la misma activitySlug en el taller completo salvo que sea imprescindible.

Formato exacto:
{
  "rationale": "2-3 frases explicando la lógica pedagógica",
  "sessions": [
    {
      "sessionNumber": 1,
      "durationHours": 2,
      "durationMinutes": 0,
      "narrative": "Hilo conductor de la sesión",
      "items": [
        {
          "itemType": "activity",
          "timeMinutes": 25,
          "title": "Título visible",
          "description": "Qué se logra y cómo facilitarlo en 1-2 frases",
          "activitySlug": "slug-del-catalogo"
        }
      ]
    }
  ]
}`
}

function buildCustomPrompt({ brief }) {
  return `Diseña un taller formativo con actividades propias (NO uses catálogo externo).

Brief del taller:
${JSON.stringify(brief, null, 2)}

Reglas:
- Devuelve SOLO JSON válido, sin markdown.
- Una entrada por cada sesión del brief (mismo sessionNumber).
- NO incluyas bienvenida ni encuadre inicial; el editor ya la agrega.
- Usa SOLO itemType "theory", "custom" o "pause". Nunca uses "activity" ni activitySlug.
- "custom" = dinámica o ejercicio grupal con título y descripción concretos para el facilitador.
- "theory" = bloque expositivo breve.
- "pause" = coffee/lunch/break con pauseType correspondiente.
- La suma de timeMinutes por sesión debe aproximarse al tiempo planificado (±15 min).
- Incluye variedad: apertura, desarrollo, cierre/reflexión.
- Descripciones en español LATAM, tono profesional y cálido para facilitadores.

Formato exacto:
{
  "rationale": "2-3 frases explicando la lógica pedagógica",
  "sessions": [
    {
      "sessionNumber": 1,
      "durationHours": 2,
      "durationMinutes": 0,
      "narrative": "Hilo conductor de la sesión",
      "items": [
        {
          "itemType": "custom",
          "timeMinutes": 25,
          "title": "Título visible",
          "description": "Qué se logra y cómo facilitarlo en 1-2 frases"
        }
      ]
    }
  ]
}`
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

    const body = parseBody(req)
    const workshopId = String(body.workshopId ?? '').trim()
    const useKitpopActivities = body.useKitpopActivities !== false

    if (!workshopId) {
      return res.status(400).json({ error: 'Falta workshopId.' })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const profile = await fetchProfileForAi(supabaseAdmin, user.id)

    if (!profile) {
      return res.status(404).json({ error: 'No encontramos tu perfil.' })
    }

    if (!canUseAiGeneration(profile)) {
      return res.status(403).json({
        error: 'No te quedan diseños con IA disponibles. Mejora a Pro o espera al próximo mes.',
        usage: buildAiUsageResponse(profile),
      })
    }

    const { data: workshop, error: workshopError } = await supabaseAdmin
      .from('workshops')
      .select('*')
      .eq('id', workshopId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (workshopError) {
      throw workshopError
    }

    if (!workshop) {
      return res.status(404).json({ error: 'Taller no encontrado.' })
    }

    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('workshop_sessions')
      .select('id, session_number, duration_hours, duration_minutes')
      .eq('workshop_id', workshopId)
      .eq('user_id', user.id)
      .order('session_number', { ascending: true })

    if (sessionsError) {
      throw sessionsError
    }

    if (!sessions?.length) {
      return res.status(400).json({
        error: 'Define al menos una sesión antes de generar con IA.',
      })
    }

    const brief = buildWorkshopBrief(workshop, sessions)
    const catalog = getKitpopActivityCatalog()
    const model = getAiModelForTask(profile, 'workshop')
    const system = useKitpopActivities
      ? `Eres un diseñador experto de talleres y reuniones para KitPOP, una plataforma de facilitación con base científica en psicología positiva, trabajo en equipo y comunicación. Seleccionas actividades del catálogo provisto y armas secuencias coherentes, variadas y realizables.`
      : `Eres un diseñador experto de talleres y reuniones. Creas secuencias pedagógicas con actividades originales, teóricas y pausas, adaptadas al brief del cliente.`

    const userPrompt = useKitpopActivities
      ? buildKitpopPrompt({ brief, catalog })
      : buildCustomPrompt({ brief })

    const rawText = await callAnthropic({
      model,
      system,
      user: userPrompt,
      maxTokens: 4096,
    })

    const rawProposal = parseJsonFromModel(rawText)
    const proposal = normalizeProposal(rawProposal, sessions, useKitpopActivities)

    await incrementAiUsage(supabaseAdmin, user.id, profile)

    const updatedProfile = await fetchProfileForAi(supabaseAdmin, user.id)

    return res.status(200).json({
      proposal,
      model,
      useKitpopActivities,
      usage: buildAiUsageResponse(updatedProfile),
    })
  } catch (error) {
    console.error('[generate-workshop]', error)
    return res.status(500).json({
      error: error.message || 'No se pudo generar la propuesta.',
    })
  }
}
