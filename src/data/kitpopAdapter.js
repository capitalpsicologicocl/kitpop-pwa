import kitpopData from './kitpopData.json'

const { CATS, A } = kitpopData

const CATEGORY_SLUG_MAP = {
  perma: 'perma',
  equipo: 'equipo',
  reunion: 'reunion',
  conexion: 'conexion',
  reuniones: 'reuniones',
  conversaciones1a1: 'conversaciones',
  fortalezas: 'fortalezas',
  mindful: 'mindfulness',
}

const ICON_MAP = {
  perma: '✦',
  equipo: '◯',
  reunion: '▤',
  conexion: '♡',
  reuniones: '▣',
  conversaciones1a1: '↔',
  fortalezas: '★',
  mindful: '◐',
}

const CLASSNAME_MAP = {
  perma: 'cc-perma',
  equipo: 'cc-equipo',
  reunion: 'cc-reunion',
  conexion: 'cc-conexion',
  reuniones: 'cc-reunion',
  conversaciones1a1: 'cc-conexion',
  fortalezas: 'cc-perma',
  mindful: 'cc-mindful',
}

const SUBTITLE_MAP = {
  perma: 'Bienestar · Psicología Positiva',
  equipo: 'Trabajo en equipo · 6C',
  reunion: 'Apertura · Energización · Cierre',
  conexion: 'Conexión · Compasión · Apreciación',
  reuniones: 'Presencial · Virtual · Ágil',
  conversaciones1a1: 'Feedback · Apreciación · Conversaciones difíciles',
  fortalezas: 'VIA · Carácter · Desarrollo',
  mindful: 'Mindfulness · Atención plena',
}

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

function buildActivity(categoryKey, id) {
  const raw = A[id]
  if (!raw) {
    return null
  }

  return {
    id,
    slug: id,
    categorySlug: CATEGORY_SLUG_MAP[categoryKey] ?? categoryKey,
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

export const kitpopCategories = Object.entries(CATS).map(([key, category], index) => ({
  slug: CATEGORY_SLUG_MAP[key] ?? key,
  title: stripHtml(category.title),
  subtitle: SUBTITLE_MAP[key] ?? 'Banco de actividades',
  description: category.desc,
  icon: ICON_MAP[key] ?? '✦',
  className: CLASSNAME_MAP[key] ?? '',
  order: index + 1,
  visible: true,
  showPermaFilter: Boolean(category.showPerma),
  htmlKey: key,
}))

export const kitpopActivities = Object.entries(CATS).flatMap(([key, category]) =>
  (category.acts ?? [])
    .map((id) => buildActivity(key, id))
    .filter(Boolean)
)

export function getActivityBySlug(slug) {
  return kitpopActivities.find((activity) => activity.slug === slug)
}

export function getCategoryBySlug(slug) {
  return kitpopCategories.find((category) => category.slug === slug)
}

export function getActivitiesByCategorySlug(slug) {
  return kitpopActivities.filter((activity) => activity.categorySlug === slug)
}
