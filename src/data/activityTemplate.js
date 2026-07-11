/**
 * ============================================================
 * KITPOP
 * Plantilla Oficial de Actividades
 * Modelo de Datos v1.0
 * ============================================================
 *
 * Esta estructura será la base para:
 * - Banco de actividades
 * - Buscador
 * - Filtros
 * - Favoritos
 * - Bitácora
 * - Diseñador de talleres
 * - Supabase
 *
 */

const activityTemplate = {
  // IDENTIDAD
  id: '',
  slug: '',
  title: '',
  subtitle: '',
  version: '1.0',
  status: 'published',

  // CLASIFICACIÓN
  categorySlug: '',
  subcategory: '',
  competencies: [],
  tags: [],
  language: 'es',

  // INFORMACIÓN GENERAL
  objective: '',
  description: '',
  benefits: [],
  expectedOutcome: '',

  // PARTICIPANTES
  participants: {
    min: 2,
    ideal: 12,
    max: 30,
  },

  // MODALIDAD
  modality: ['Presencial'],
  virtualCompatible: false,

  // TIEMPO
  duration: {
    preparation: 0,
    execution: 15,
    debrief: 0,
    total: 15,
  },

  // PERFIL DE USO
  recommendedMoment: ['Inicio'],
  facilitationDifficulty: 1,
  energyLevel: 3,
  movementLevel: 1,
  emotionalDepth: 2,
  reflectionDepth: 2,
  noiseLevel: 1,

  // MATERIALES
  materials: [],

  // DESARROLLO
  preparation: [],
  instructions: [],
  reflectionQuestions: [],
  closingPhrase: '',

  // FACILITACIÓN
  facilitatorTips: [],
  commonMistakes: [],
  variations: [],

  // FUNDAMENTO
  scientificFoundation: '',
  theories: [],
  authors: [],
  references: [],

  // RECURSOS
  resources: [],

  // RELACIONES FUTURAS
  relatedActivities: [],
  recommendedPrograms: [],
}

export default activityTemplate