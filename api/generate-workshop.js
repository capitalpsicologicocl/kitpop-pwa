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
import { enforceAiRateLimit } from './_lib/rateLimit.js'
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

function clampTheoryMinutes(value, fallback = 20) {
  return Math.min(30, clampMinutes(value, fallback))
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
        timeMinutes:
          itemType === 'theory'
            ? clampTheoryMinutes(item.timeMinutes)
            : clampMinutes(item.timeMinutes, itemType === 'pause' ? 15 : 20),
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

function buildTheoryRules(includeTheoryModules) {
  if (!includeTheoryModules) {
    return `- Enfócate en actividades prácticas. Usa "theory" solo si es imprescindible (máx 15 min).
- Prioriza actividades prácticas variadas.`
  }

  return `- INCLUYE módulos teóricos basados en el objective del brief (contenidos del TDR).
- Estructura pedagógica por sesión: bloques teóricos (itemType "theory", máx 30 min c/u) alternados con 1-2 actividades prácticas relacionadas.
- Títulos teóricos: "Módulo N — [tema]" o "Módulo N — Teórico parte X" si el contenido supera 30 min.
- Descripciones teóricas: contenido sustantivo del brief (conceptos, objetivos, puntos clave). NO uses placeholders genéricos.
- Si un módulo tiene mucho contenido: Teórico parte 1 → actividad → Teórico parte 2 → actividad.
- Cada bloque teórico debe aportar contenido concreto extraído o inferido del objective del brief.`
}

function buildKitpopPrompt({ brief, catalog, includeTheoryModules }) {
  const compactCatalog = catalog.map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    category: entry.category,
    durationMinutes: entry.durationMinutes,
  }))

  return `Diseña un taller formativo usando actividades del catálogo KitPOP (itemType "activity" + activitySlug exacto) y módulos teóricos cuando corresponda.

Brief del taller:
${JSON.stringify(brief, null, 2)}

Catálogo de actividades disponibles (${compactCatalog.length}):
${JSON.stringify(compactCatalog)}

Reglas:
- Devuelve SOLO JSON válido, sin markdown.
- Una entrada por cada sesión del brief (mismo sessionNumber).
- NO incluyas bienvenida ni encuadre inicial; el editor ya la agrega.
${buildTheoryRules(includeTheoryModules)}
- Usa "activity" con activitySlug del catálogo para dinámicas prácticas.
- Usa "pause" para coffee/lunch/break, "custom" solo si no hay actividad KitPOP adecuada.
- La suma de timeMinutes por sesión debe aproximarse al tiempo planificado (±15 min).
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
          "itemType": "theory",
          "timeMinutes": 25,
          "title": "Módulo 1 — Introducción al tema",
          "description": "Contenido teórico detallado del módulo"
        },
        {
          "itemType": "activity",
          "timeMinutes": 25,
          "title": "Título visible",
          "description": "Qué se logra y cómo facilitarlo",
          "activitySlug": "slug-del-catalogo"
        }
      ]
    }
  ]
}`
}

function buildCustomPrompt({ brief, includeTheoryModules }) {
  return `Diseña un taller formativo con actividades propias (NO uses catálogo externo).

Brief del taller:
${JSON.stringify(brief, null, 2)}

Reglas:
- Devuelve SOLO JSON válido, sin markdown.
- Una entrada por cada sesión del brief (mismo sessionNumber).
- NO incluyas bienvenida ni encuadre inicial; el editor ya la agrega.
${buildTheoryRules(includeTheoryModules)}
- Usa SOLO itemType "theory", "custom" o "pause". Nunca uses "activity" ni activitySlug.
- "custom" = dinámica o ejercicio grupal con título y descripción concretos.
- "pause" = coffee/lunch/break con pauseType correspondiente.
- La suma de timeMinutes por sesión debe aproximarse al tiempo planificado (±15 min).
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
          "itemType": "theory",
          "timeMinutes": 25,
          "title": "Módulo 1 — Teórico parte 1",
          "description": "Contenido teórico detallado"
        },
        {
          "itemType": "custom",
          "timeMinutes": 25,
          "title": "Título visible",
          "description": "Qué se logra y cómo facilitarlo"
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
    const includeTheoryModules = body.includeTheoryModules !== false

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

    const rateLimit = await enforceAiRateLimit(
      supabaseAdmin,
      user.id,
      profile,
      'generate-workshop'
    )

    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: 'Demasiadas solicitudes de IA en poco tiempo. Intenta de nuevo en unos minutos.',
        retryAfter: rateLimit.retryAfter,
        limit: rateLimit.limit,
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
      ? buildKitpopPrompt({ brief, catalog, includeTheoryModules })
      : buildCustomPrompt({ brief, includeTheoryModules })

    const rawText = await callAnthropic({
      model,
      system,
      user: userPrompt,
      maxTokens: 8192,
    })

    const rawProposal = parseJsonFromModel(rawText)
    const proposal = normalizeProposal(rawProposal, sessions, useKitpopActivities)

    await incrementAiUsage(supabaseAdmin, user.id, profile)

    const updatedProfile = await fetchProfileForAi(supabaseAdmin, user.id)

    return res.status(200).json({
      proposal,
      model,
      useKitpopActivities,
      includeTheoryModules,
      usage: buildAiUsageResponse(updatedProfile),
    })
  } catch (error) {
    console.error('[generate-workshop]', error)
    return res.status(500).json({
      error: error.message || 'No se pudo generar la propuesta.',
    })
  }
}
