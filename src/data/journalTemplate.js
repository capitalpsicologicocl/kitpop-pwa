/**
 * KITPOP
 * Plantilla oficial para bitácoras de actividad o taller.
 */

const journalTemplate = {
  id: '',
  userId: '',

  // Puede ser "activity" o "workshop"
  entryType: 'activity',

  // Referencia al elemento utilizado
  activitySlug: '',
  workshopId: '',

  // DATOS DE APLICACIÓN
  title: '',
  facilitatorName: '',
  date: '',
  organization: '',
  participantsCount: 0,
  modality: 'Presencial',

  // REGISTRO LIBRE
  observations: '',
  results: '',
  learnings: '',
  futureAdjustments: '',

  // ARCHIVOS FUTUROS
  attachments: [],

  createdAt: '',
  updatedAt: '',
}

export default journalTemplate