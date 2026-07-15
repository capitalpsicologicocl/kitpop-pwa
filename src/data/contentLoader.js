const HTML_KEY_BY_SLUG = {
  perma: 'perma',
  equipo: 'equipo',
  reunion: 'reunion',
  conexion: 'conexion',
  reuniones: 'reuniones',
  conversaciones: 'conversaciones1a1',
  fortalezas: 'fortalezas',
  mindfulness: 'mindful',
  facilitacion: 'facilitacion',
  pnl: 'pnl',
}

const HTML_KEY_TO_SLUG = {
  perma: 'perma',
  equipo: 'equipo',
  reunion: 'reunion',
  conexion: 'conexion',
  reuniones: 'reuniones',
  conversaciones1a1: 'conversaciones',
  fortalezas: 'fortalezas',
  mindful: 'mindfulness',
  facilitacion: 'facilitacion',
  pnl: 'pnl',
}

const FILE_BY_HTML_KEY = {
  facilitacion: 'facilitacion',
  perma: 'perma',
  pnl: 'pnl',
  fortalezas: 'fortalezas',
  equipo: 'equipo-reunion-conexion',
  reunion: 'equipo-reunion-conexion',
  conexion: 'equipo-reunion-conexion',
  reuniones: 'mindful-conversaciones-reuniones',
  conversaciones1a1: 'mindful-conversaciones-reuniones',
  mindful: 'mindful-conversaciones-reuniones',
}

const FILE_LOADERS = {
  facilitacion: () => import('./categories/facilitacion.json'),
  perma: () => import('./categories/perma.json'),
  pnl: () => import('./categories/pnl.json'),
  fortalezas: () => import('./categories/fortalezas.json'),
  'equipo-reunion-conexion': () => import('./categories/equipo-reunion-conexion.json'),
  'mindful-conversaciones-reuniones': () =>
    import('./categories/mindful-conversaciones-reuniones.json'),
}

const loadedFiles = new Map()
const activitiesBySlug = new Map()
const activitiesByCategory = new Map()
let activityIndexPromise = null

export function stripHtml(html = '') {
  return html.replace(/<[^>]+>/g, '').trim()
}

function parseDuration(metas = []) {
  const text = metas.join(' ')
  const range = text.match(/(\d+)\s*[–-]\s*(\d+)\s*min/)
  if (range) {
    return {
      preparation: 0,
      execution: Number(range[2]),
      debrief: 0,
      total: Number(range[2]),
    }
  }

  const single = text.match(/(\d+)\s*min/)
  if (single) {
    const minutes = Number(single[1])
    return {
      preparation: 0,
      execution: minutes,
      debrief: 0,
      total: minutes,
    }
  }

  return {
    preparation: 0,
    execution: 15,
    debrief: 0,
    total: 15,
  }
}

function parseModality(metas = []) {
  const text = metas.join(' ').toLowerCase()

  if (text.includes('virtual') && text.includes('presencial')) {
    return ['Presencial', 'Virtual']
  }

  if (text.includes('virtual')) {
    return ['Virtual']
  }

  return ['Presencial']
}

function buildActivity(htmlKey, id, raw) {
  const categorySlug = HTML_KEY_TO_SLUG[htmlKey] ?? htmlKey

  return {
    id,
    slug: id,
    categorySlug,
    title: stripHtml(raw.name),
    description: raw.sub ?? '',
    categoryLabel: raw.cat ?? '',
    subcategory: raw.perma ?? stripHtml(raw.cat?.split('·')[0] ?? ''),
    permaElement: raw.perma ?? null,
    duration: parseDuration(raw.metas),
    modality: parseModality(raw.metas),
    metas: raw.metas ?? [],
    kitpop: raw,
  }
}

function registerActivities(htmlKey, data) {
  const categorySlug = HTML_KEY_TO_SLUG[htmlKey] ?? htmlKey
  const category = data.CATS?.[htmlKey]
  if (!category) {
    return
  }

  const built = (category.acts ?? [])
    .map((id) => {
      const raw = data.A?.[id]
      if (!raw) {
        return null
      }

      const activity = buildActivity(htmlKey, id, raw)
      activitiesBySlug.set(id, activity)
      return activity
    })
    .filter(Boolean)

  const existing = activitiesByCategory.get(categorySlug) ?? []
  activitiesByCategory.set(categorySlug, [...existing, ...built])
}

async function loadContentFile(fileKey) {
  if (loadedFiles.has(fileKey)) {
    return loadedFiles.get(fileKey)
  }

  const loader = FILE_LOADERS[fileKey]
  if (!loader) {
    throw new Error(`Unknown content file: ${fileKey}`)
  }

  const module = await loader()
  const data = module.default ?? module
  loadedFiles.set(fileKey, data)
  return data
}

export async function loadCategoryContent(categorySlug) {
  const htmlKey = HTML_KEY_BY_SLUG[categorySlug]
  if (!htmlKey) {
    return []
  }

  if (activitiesByCategory.has(categorySlug)) {
    return activitiesByCategory.get(categorySlug)
  }

  const fileKey = FILE_BY_HTML_KEY[htmlKey]
  const data = await loadContentFile(fileKey)
  registerActivities(htmlKey, data)
  return activitiesByCategory.get(categorySlug) ?? []
}

export async function loadActivityContent(activitySlug) {
  if (activitiesBySlug.has(activitySlug)) {
    return activitiesBySlug.get(activitySlug)
  }

  const index = await loadActivityIndex()
  const summary = index.find((item) => item.slug === activitySlug)
  if (!summary) {
    return null
  }

  await loadCategoryContent(summary.categorySlug)
  return activitiesBySlug.get(activitySlug) ?? null
}

export async function loadAllActivityContent() {
  const fileKeys = Object.keys(FILE_LOADERS)
  await Promise.all(
    fileKeys.map(async (fileKey) => {
      const data = await loadContentFile(fileKey)
      for (const htmlKey of Object.keys(data.CATS ?? {})) {
        registerActivities(htmlKey, data)
      }
    })
  )

  return Array.from(activitiesBySlug.values())
}

export async function loadActivityIndex() {
  if (!activityIndexPromise) {
    activityIndexPromise = import('./activityIndex.json').then(
      (module) => module.default ?? module
    )
  }

  return activityIndexPromise
}

export function getCachedActivity(slug) {
  return activitiesBySlug.get(slug) ?? null
}

export function getCachedCategoryActivities(categorySlug) {
  return activitiesByCategory.get(categorySlug) ?? null
}
