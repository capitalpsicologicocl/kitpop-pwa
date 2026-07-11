/**
 * KITPOP
 * Plantilla oficial para talleres, cursos, capacitaciones y reuniones.
 */

const workshopTemplate = {
  // IDENTIDAD
  id: '',
  userId: '',
  title: '',
  type: 'Taller',
  status: 'draft',

  // INFORMACIÓN GENERAL
  objective: '',
  description: '',
  expectedOutcomes: [],
  contents: [],
  competencies: [],

  // PÚBLICO
  targetAudience: '',
  participants: {
    estimated: 0,
    min: 1,
    max: 0,
  },

  // FORMATO
  modality: 'Presencial',
  numberOfSessions: 1,
  hoursPerSession: 1,
  totalHours: 1,

  // CONTEXTO
  organization: '',
  facilitatorName: '',
  country: '',
  location: '',

  // PLANIFICACIÓN
  sessions: [],

  // RECURSOS
  resources: [],

  // ASISTENCIA FUTURA
  aiGenerated: false,
  aiPrompt: '',

  // CONTROL
  createdAt: '',
  updatedAt: '',
}

export default workshopTemplate