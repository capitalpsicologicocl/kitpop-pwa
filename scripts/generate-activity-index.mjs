/**
 * Genera src/data/activityIndex.json — metadatos ligeros para búsqueda y listados.
 * Uso: node scripts/generate-activity-index.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const CATEGORY_FILES = [
  'src/data/categories/facilitacion.json',
  'src/data/categories/pnl.json',
  'src/data/categories/perma.json',
  'src/data/categories/fortalezas.json',
  'src/data/categories/equipo-reunion-conexion.json',
  'src/data/categories/mindful-conversaciones-reuniones.json',
]

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

function stripHtml(html = '') {
  return html.replace(/<[^>]+>/g, '').trim()
}

function parseDuration(metas = []) {
  const text = metas.join(' ')
  const range = text.match(/(\d+)\s*[–-]\s*(\d+)\s*min/)
  if (range) {
    return { total: Number(range[2]) }
  }

  const single = text.match(/(\d+)\s*min/)
  if (single) {
    return { total: Number(single[1]) }
  }

  return { total: 15 }
}

const index = []

for (const relativePath of CATEGORY_FILES) {
  const data = JSON.parse(readFileSync(join(root, relativePath), 'utf8'))

  for (const [htmlKey, category] of Object.entries(data.CATS ?? {})) {
    const categorySlug = HTML_KEY_TO_SLUG[htmlKey] ?? htmlKey

    for (const id of category.acts ?? []) {
      const raw = data.A?.[id]
      if (!raw) {
        continue
      }

      index.push({
        slug: id,
        categorySlug,
        title: stripHtml(raw.name),
        description: raw.sub ?? '',
        categoryLabel: raw.cat ?? '',
        subcategory: raw.perma ?? stripHtml(raw.cat?.split('·')[0] ?? ''),
        permaElement: raw.perma ?? null,
        metas: raw.metas ?? [],
        duration: parseDuration(raw.metas),
      })
    }
  }
}

index.sort((a, b) => a.title.localeCompare(b.title, 'es'))

writeFileSync(
  join(root, 'src/data/activityIndex.json'),
  `${JSON.stringify(index, null, 2)}\n`
)

console.log(`activityIndex.json: ${index.length} actividades`)
