import kitpopData from './kitpopData.json'
import facilitacionData from './categories/facilitacion.json'
import pnlData from './categories/pnl.json'
import permaData from './categories/perma.json'
import fortalezasData from './categories/fortalezas.json'
import equipoReunionConexionData from './categories/equipo-reunion-conexion.json'
import mindfulConversacionesReunionesData from './categories/mindful-conversaciones-reuniones.json'

const { CATS, A } = {
  CATS: {
    ...kitpopData.CATS,
    ...facilitacionData.CATS,
    ...pnlData.CATS,
    ...permaData.CATS,
    ...fortalezasData.CATS,
    ...equipoReunionConexionData.CATS,
    ...mindfulConversacionesReunionesData.CATS,
  },
  A: {
    ...kitpopData.A,
    ...facilitacionData.A,
    ...pnlData.A,
    ...permaData.A,
    ...fortalezasData.A,
    ...equipoReunionConexionData.A,
    ...mindfulConversacionesReunionesData.A,
  },
}

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

const ICON_MAP = {
  perma: '✦',
  equipo: '◯',
  reunion: '▤',
  conexion: '♡',
  reuniones: '▣',
  conversaciones1a1: '↔',
  fortalezas: '★',
  mindful: '◐',
  facilitacion: '◎',
  pnl: '🧠',
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
  facilitacion: 'cc-facilitacion',
  pnl: 'cc-pnl',
}

const CATEGORY_ORDER = [
  'facilitacion',
  'perma',
  'equipo',
  'reunion',
  'conexion',
  'reuniones',
  'conversaciones',
  'fortalezas',
  'mindfulness',
  'pnl',
]

const SUBTITLE_MAP = {
  perma: 'Bienestar · Psicología Positiva',
  equipo: 'Trabajo en equipo · 6C',
  reunion: 'Apertura · Energización · Cierre',
  conexion: 'Conexión · Compasión · Apreciación',
  reuniones: 'Presencial · Virtual · Ágil',
  conversaciones1a1: 'Feedback · Apreciación · Conversaciones difíciles',
  fortalezas: 'VIA · Carácter · Desarrollo',
  mindful: 'Mindfulness · Atención plena',
  facilitacion: 'Oficio · Diseño · Autoinstrucción',
  pnl: 'Comunicación · PNL · Recursos personales',
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

export const kitpopCategories = Object.entries(CATS)
  .map(([key, category]) => ({
    slug: CATEGORY_SLUG_MAP[key] ?? key,
    title: stripHtml(category.title),
    subtitle: SUBTITLE_MAP[key] ?? 'Banco de actividades',
    description: category.desc,
    icon: ICON_MAP[key] ?? '✦',
    className: CLASSNAME_MAP[key] ?? '',
    order: 0,
    visible: true,
    showPermaFilter: Boolean(category.showPerma),
    htmlKey: key,
  }))
  .sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.slug)
    const bi = CATEGORY_ORDER.indexOf(b.slug)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })
  .map((category, index) => ({
    ...category,
    order: index + 1,
  }))

export const kitpopActivities = Object.entries(CATS).flatMap(([key, category]) =>
  (category.acts ?? [])
    .map((id) => buildActivity(key, id))
    .filter(Boolean)
)

export const ACTIVITY_COUNT = kitpopActivities.length

export function getActivityBySlug(slug) {
  return kitpopActivities.find((activity) => activity.slug === slug)
}

export function getCategoryBySlug(slug) {
  return kitpopCategories.find((category) => category.slug === slug)
}

export function getActivitiesByCategorySlug(slug) {
  return kitpopActivities.filter((activity) => activity.categorySlug === slug)
}
