/**
 * KITPOP
 * Plantilla oficial para sesiones de talleres, cursos y capacitaciones.
 */

const sessionTemplate = {
  id: '',
  workshopId: '',
  sessionNumber: 1,
  title: '',
  objective: '',

  durationMinutes: 60,

  // Contenidos conceptuales de la sesión
  contents: [],

  // Agenda ordenada
  agenda: [
    /*
    {
      id: '',
      type: 'activity',
      title: '',
      activitySlug: '',
      durationMinutes: 15,
      order: 1,
      notes: '',
    }
    */
  ],

  resources: [],
  facilitatorNotes: [],
}

export default sessionTemplate