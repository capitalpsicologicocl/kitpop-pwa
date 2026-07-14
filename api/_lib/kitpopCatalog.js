import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const DATA_FILES = [
  'src/data/kitpopData.json',
  'src/data/categories/facilitacion.json',
  'src/data/categories/pnl.json',
  'src/data/categories/perma.json',
  'src/data/categories/fortalezas.json',
  'src/data/categories/equipo-reunion-conexion.json',
  'src/data/categories/mindful-conversaciones-reuniones.json',
]

const CATEGORY_SLUG_MAP = {
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

let cachedCatalog = null
let cachedSlugSet = null

function stripHtml(html = '') {
  return html.replace(/<[^>]+>/g, '').trim()
}

function parseDurationMinutes(metas = []) {
  const text = metas.join(' ')
  const range = text.match(/(\d+)\s*[–-]\s*(\d+)\s*min/i)
  if (range) {
    return Number(range[2])
  }

  const single = text.match(/(\d+)\s*min/i)
  if (single) {
    return Number(single[1])
  }

  return 15
}

function loadMergedData() {
  let CATS = {}
  let A = {}

  for (const relativePath of DATA_FILES) {
    const absolutePath = join(process.cwd(), relativePath)
    const data = JSON.parse(readFileSync(absolutePath, 'utf8'))
    CATS = { ...CATS, ...data.CATS }
    A = { ...A, ...data.A }
  }

  return { CATS, A }
}

export function getKitpopActivityCatalog() {
  if (cachedCatalog) {
    return cachedCatalog
  }

  const { CATS, A } = loadMergedData()
  const entries = []

  for (const [catKey, category] of Object.entries(CATS)) {
    for (const slug of category.acts ?? []) {
      const raw = A[slug]
      if (!raw) {
        continue
      }

      entries.push({
        slug,
        title: stripHtml(raw.name),
        category: CATEGORY_SLUG_MAP[catKey] ?? catKey,
        categoryLabel: stripHtml(category.title),
        durationMinutes: parseDurationMinutes(raw.metas),
        sub: (raw.sub ?? '').slice(0, 140),
      })
    }
  }

  cachedCatalog = entries
  cachedSlugSet = new Set(entries.map((entry) => entry.slug))
  return cachedCatalog
}

export function isValidActivitySlug(slug) {
  if (!cachedSlugSet) {
    getKitpopActivityCatalog()
  }

  return cachedSlugSet.has(slug)
}

export function getActivityBySlug(slug) {
  return getKitpopActivityCatalog().find((entry) => entry.slug === slug) ?? null
}
