export const category = {
  slug: 'perma',
  title: 'POP Cards PERMA',
  subtitle: 'Bienestar · Psicología Positiva',
  description: 'Herramientas basadas en el modelo de bienestar de Seligman para cultivar emociones positivas, compromiso, relaciones, sentido y logro en equipos.',
  icon: '✦',
  className: 'cc-perma',
  order: 1,
  visible: true,
}

export const activities = [
  {
    id: "ronda-noticias",
    slug: "ronda-noticias",
    title: "Ronda de Buenas Noticias",
    subtitle: "Cada persona comparte una noticia positiva laboral o personal antes de comenzar la jornada o reunión. Refuerza la conexión, el optimismo y la cohesión del equipo desde el primer minuto.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "P",
    competencies: [
      "Emociones Positivas"
    ],
    tags: [
      "PERMA",
      "Emociones Positivas"
    ],
    language: "es",
    objective: "Generar un estado emocional positivo al inicio del espacio compartido. Las emociones positivas compartidas al comienzo de una reunión aumentan la apertura, la creatividad y la disposición a colaborar.",
    description: "Cada persona comparte una noticia positiva laboral o personal antes de comenzar la jornada o reunión. Refuerza la conexión, el optimismo y la cohesión del equipo desde el primer minuto.",
    benefits: [
      "Generar un estado emocional positivo al inicio del espacio compartido. Las emociones positivas compartidas al comienzo de una reunión aumentan la apertura, la creatividad y la disposición a colaborar."
    ],
    expectedOutcome: "",
    participants: {
      min: 3,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: true,
    duration: {
      preparation: 0,
      execution: 15,
      debrief: 0,
      total: 15
    },
    recommendedMoment: [
      "Ideal para apertura de reunión"
    ],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Sin materiales físicos",
      "Espacio en círculo donde todos se vean",
      "Objeto de turno opcional (pelota, piedra)",
      "Temporizador si el grupo es grande"
    ],
    preparation: [],
    instructions: [
      {
        section: "Instrucciones paso a paso",
        steps: [
          {
            title: "Paso 1 · Invitar (1 min)",
            description: "El/la facilitador/a invita al grupo: \"Vamos a comenzar con una ronda de buenas noticias. Puede ser algo laboral o personal — un logro, algo que aprendiste, algo que te alegró esta semana. No tiene que ser extraordinario: lo cotidiano también cuenta.\""
          },
          {
            title: "Paso 2 · Modelar (30 seg)",
            description: "El/la facilitador/a comienza compartiendo SU propia noticia positiva. Esto rompe el hielo y muestra el nivel de profundidad esperado."
          },
          {
            title: "Paso 3 · Ronda completa",
            description: "Cada persona comparte en 30–60 segundos. El resto escucha en silencio activo — sin interrumpir, sin comentar. Al terminar cada turno, el grupo puede celebrar brevemente (aplauso, \"gracias\")."
          },
          {
            title: "Paso 4 · Cierre (1 min)",
            description: "El/la facilitador/a señala algún hilo común: \"Escuché X, Y, Z... hay mucha energía en este grupo hoy. Con eso, comenzamos.\""
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "¿Cómo está la energía?",
        question: "¿Cómo te sientes ahora comparado con cómo llegaste a este espacio?"
      },
      {
        category: "Patrones del grupo",
        question: "¿Qué notan de lo que se compartió? ¿Hay algo en común en las buenas noticias de hoy?"
      },
      {
        category: "Transferencia",
        question: "¿Podríamos hacer esto como ritual de apertura en todas nuestras reuniones?"
      }
    ],
    closingPhrase: "\"Las emociones positivas compartidas fortalecen la unión del equipo y aumentan la resiliencia.\" — Modelo PERMA, Seligman",
    facilitatorTips: [],
    commonMistakes: [],
    variations: [
      {
        title: "Versión rápida (5 min)",
        description: "Solo 3–4 personas comparten voluntariamente. Útil cuando el tiempo es muy limitado."
      },
      {
        title: "Versión virtual",
        description: "En videollamada, usar el chat para que todos escriban su noticia primero, y luego el facilitador/a llama a algunos a compartir verbalmente."
      },
      {
        title: "Con objeto de turno",
        description: "Una pelota, piedra o cualquier objeto circula por el grupo. Solo quien lo tiene habla. Esto regula los tiempos y da estructura."
      }
    ],
    scientificFoundation: "Basado en la investigación de Barbara Fredrickson sobre Emociones Positivas (modelo PERMA de Seligman): compartir lo positivo amplía el repertorio de pensamiento y acción del equipo, y construye resiliencia colectiva.",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "cadena-agradecimiento",
    slug: "cadena-agradecimiento",
    title: "Cadena de Agradecimientos",
    subtitle: "El equipo se reúne en círculo. Una persona inicia agradeciendo a un compañero/a por una acción, actitud o gesto específico. La cadena recorre al equipo completo hasta que todos hayan dado y recibido gratitud.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "P",
    competencies: [
      "Emociones Positivas"
    ],
    tags: [
      "PERMA",
      "Emociones Positivas"
    ],
    language: "es",
    objective: "Reforzar los vínculos del equipo, generar reconocimiento mutuo y fortalecer la cohesión. Compartir gratitud activa emociones positivas en quien da Y en quien recibe, multiplicando la energía colectiva.\n\nExplica antes de comenzar: \"Este ejercicio es de reconocimiento genuino y específico. No se trata de decir algo bonito por cumplir — sino de nombrar una acción real, una actitud concreta, un gesto que te impactó. Eso es lo que hace poderoso al agradecimiento.\"",
    description: "El equipo se reúne en círculo. Una persona inicia agradeciendo a un compañero/a por una acción, actitud o gesto específico. La cadena recorre al equipo completo hasta que todos hayan dado y recibido gratitud.",
    benefits: [
      "Reforzar los vínculos del equipo, generar reconocimiento mutuo y fortalecer la cohesión. Compartir gratitud activa emociones positivas en quien da Y en quien recibe, multiplicando la energía colectiva.",
      "Explica antes de comenzar: \"Este ejercicio es de reconocimiento genuino y específico. No se trata de decir algo bonito por cumplir — sino de nombrar una acción real, una actitud concreta, un gesto que te impactó. Eso es lo que hace poderoso al agradecimiento.\""
    ],
    expectedOutcome: "",
    participants: {
      min: 3,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: false,
    duration: {
      preparation: 0,
      execution: 20,
      debrief: 0,
      total: 20
    },
    recommendedMoment: [
      "Ideal para cierre de proyecto o etapa"
    ],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Sin materiales (versión básica)",
      "Opcional: tarjetas donde escribir el agradecimiento para que la persona se lo lleve",
      "Espacio en círculo"
    ],
    preparation: [],
    instructions: [
      {
        section: "Instrucciones paso a paso",
        steps: [
          {
            title: "Paso 1 · Postura y círculo",
            description: "El grupo se organiza en círculo — todos visibles entre sí. Pide un momento de silencio para conectar: \"Cierra los ojos un segundo. Piensa en alguien de este grupo que haya hecho algo que te impactó positivamente esta semana o en este proyecto.\""
          },
          {
            title: "Paso 2 · Formato del agradecimiento",
            description: "El formato es: \"Quiero agradecer a [nombre] porque [acción específica] y el impacto que tuvo en mí/en el equipo fue [impacto concreto].\" Ejemplo: \"Quiero agradecer a Ana porque cuando tuvimos el problema del lunes, ella se quedó hasta tarde buscando la solución, y eso me permitió llegar tranquila al cliente.\""
          },
          {
            title: "Paso 3 · La cadena",
            description: "Quien inicia elige a alguien del grupo para agradecer. Esa persona recibe el agradecimiento con un simple \"gracias\" — sin minimizar (\"ay, no fue nada\") ni justificar. Luego esa misma persona agradece a otra, y así sucesivamente hasta que todos hayan dado y recibido."
          },
          {
            title: "Paso 4 · Cierre",
            description: "El/la facilitador/a cierra la cadena con una observación del grupo: \"Hoy se nombraron X cosas. Todas son reales, todas importan. Eso es el equipo que somos.\""
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "¿Cómo fue dar?",
        question: "¿Cómo fue para ti dar un agradecimiento en voz alta, frente al grupo?"
      },
      {
        category: "¿Cómo fue recibir?",
        question: "¿Cómo te sentiste cuando te nombraron? ¿Fue fácil recibir o te costó?"
      },
      {
        category: "Cultura del equipo",
        question: "¿Con qué frecuencia nos agradecemos así en el día a día? ¿Qué cambiaría si lo hiciéramos más seguido?"
      }
    ],
    closingPhrase: "\"Compartir gratitud multiplica la energía positiva en el equipo.\"",
    facilitatorTips: [
      {
        title: "Si alguien no recibe agradecimiento",
        description: "Vigilar que todos reciban. Si alguien queda sin recibir, el/la facilitador/a puede cerrar el círculo agradeciendo a esa persona o invitando a alguien a completarlo."
      },
      {
        title: "Si el grupo es grande (+15 personas)",
        description: "Hacer la cadena en subgrupos de 8–10 personas simultáneamente. Luego una ronda voluntaria de 3–4 personas en plenario."
      }
    ],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "momento-wow",
    slug: "momento-wow",
    title: "Momento WOW Colectivo",
    subtitle: "Cada integrante recuerda y comparte una experiencia laboral que generó alegría, gratitud o inspiración. Estas historias fortalecen el sentido colectivo del trabajo y generan emoción compartida.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "P",
    competencies: [
      "Emociones Positivas"
    ],
    tags: [
      "PERMA",
      "Emociones Positivas"
    ],
    language: "es",
    objective: "Las historias positivas inspiran y construyen confianza. Narrar experiencias de impacto activa la memoria emocional del equipo y refuerza el sentido de propósito colectivo. Ideal para equipos que están en un momento de desgaste o transición.",
    description: "Cada integrante recuerda y comparte una experiencia laboral que generó alegría, gratitud o inspiración. Estas historias fortalecen el sentido colectivo del trabajo y generan emoción compartida.",
    benefits: [
      "Las historias positivas inspiran y construyen confianza. Narrar experiencias de impacto activa la memoria emocional del equipo y refuerza el sentido de propósito colectivo. Ideal para equipos que están en un momento de desgaste o transición."
    ],
    expectedOutcome: "",
    participants: {
      min: 3,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: false,
    duration: {
      preparation: 0,
      execution: 25,
      debrief: 0,
      total: 25
    },
    recommendedMoment: [],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Post-its de colores (2 por persona)",
      "Marcadores",
      "Pizarra o mural grande",
      "Papel kraft si no hay pizarra",
      "Opcional: música suave de fondo"
    ],
    preparation: [],
    instructions: [
      {
        section: "Instrucciones paso a paso",
        steps: [
          {
            title: "Paso 1 · Reflexión individual (5 min)",
            description: "Cada persona recibe 2 post-its. Consigna: \"Recuerda un momento WOW de tu trabajo — una situación donde sentiste alegría, orgullo, gratitud o inspiración. Puede ser reciente o de hace tiempo. Escribe en un post-it: ¿qué pasó? y en el otro: ¿cómo te hizo sentir?\""
          },
          {
            title: "Paso 2 · Compartir en grupo",
            description: "Por turnos (1–2 min por persona), cada persona comparte su momento WOW. El grupo escucha en silencio — sin interrumpir, sin comentar todavía. El/la facilitador/a pega los post-its en el mural."
          },
          {
            title: "Paso 3 · Mapear y conectar (5 min)",
            description: "Una vez que todos compartieron, el/la facilitador/a agrupa los post-its por temas emergentes: ¿Cuántos hablan de impacto en personas? ¿Cuántos de trabajo en equipo? ¿Cuántos de resolver desafíos? Esto hace visible los patrones de significado del grupo."
          },
          {
            title: "Paso 4 · Nombrar lo que vemos",
            description: "El/la facilitador/a señala los patrones: \"Lo que escucho es que nuestros momentos WOW están relacionados con... Eso dice algo sobre quiénes somos como equipo.\""
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "Patrones del grupo",
        question: "¿Qué tienen en común los momentos WOW que compartimos? ¿Qué dice eso de nosotros como equipo?"
      },
      {
        category: "Condiciones",
        question: "¿Qué condiciones estaban presentes cuando ocurrieron esos momentos? ¿Cómo podemos crear esas condiciones más seguido?"
      },
      {
        category: "Acción",
        question: "¿Qué podemos hacer diferente a partir de mañana para generar más de estos momentos?"
      }
    ],
    closingPhrase: "\"Las historias positivas inspiran y construyen confianza.\" — POP Cards PERMA Team",
    facilitatorTips: [],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "circulo-cierre",
    slug: "circulo-cierre",
    title: "Círculo de Cierre Positivo",
    subtitle: "Ritual de cierre donde cada integrante comparte algo bueno que experimentó en la jornada o reunión. Ayuda a cerrar con gratitud, revalorizar lo vivido y mantener presente que incluso en días complejos siempre hay algo positivo que destacar.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "P",
    competencies: [
      "Emociones Positivas"
    ],
    tags: [
      "PERMA",
      "Emociones Positivas"
    ],
    language: "es",
    objective: "Los rituales de cierre colectivos aumentan el bienestar individual y fortalecen el sentido de pertenencia al grupo. Cerrar una reunión o jornada nombrando lo positivo activa la memoria emocional positiva del equipo y mejora la predisposición para la próxima vez.",
    description: "Ritual de cierre donde cada integrante comparte algo bueno que experimentó en la jornada o reunión. Ayuda a cerrar con gratitud, revalorizar lo vivido y mantener presente que incluso en días complejos siempre hay algo positivo que destacar.",
    benefits: [
      "Los rituales de cierre colectivos aumentan el bienestar individual y fortalecen el sentido de pertenencia al grupo. Cerrar una reunión o jornada nombrando lo positivo activa la memoria emocional positiva del equipo y mejora la predisposición para la próxima vez."
    ],
    expectedOutcome: "",
    participants: {
      min: 3,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: false,
    duration: {
      preparation: 0,
      execution: 12,
      debrief: 0,
      total: 12
    },
    recommendedMoment: [
      "Ideal para cierre de jornada o reunión"
    ],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Sin materiales físicos",
      "Espacio en círculo",
      "Objeto de turno si el grupo es grande (pelota, vela, piedra)"
    ],
    preparation: [],
    instructions: [
      {
        section: "Instrucciones paso a paso",
        steps: [
          {
            title: "Paso 1 · Invitar al círculo",
            description: "El/la facilitador/a invita al grupo a formar un círculo físico — si es posible de pie. Dice: \"Vamos a cerrar con algo que a veces no hacemos: nombrar lo bueno de hoy. Antes de irnos, cada uno va a compartir algo positivo que vivió — un aprendizaje, un momento que le gustó, algo que lo alegró, algo que le sorprendió bien.\""
          },
          {
            title: "Paso 2 · Ronda de cierre",
            description: "Por turnos (20–30 seg por persona), cada integrante comparte. El/la facilitador/a puede modelar comenzando: \"A mí hoy me alegró que...\" El resto escucha sin comentar."
          },
          {
            title: "Paso 3 · Cierre del facilitador/a",
            description: "El/la facilitador/a cierra la ronda con una síntesis breve: \"Hoy vivimos [X]. Eso habla de quiénes somos como equipo. Nos vemos [próxima vez].\" Si hay intención para la próxima sesión, se nombra aquí."
          },
          {
            title: "Gesto de cierre (opcional)",
            description: "Un gesto simbólico final: mano al centro, aplauso colectivo, una respiración juntos, o un breve silencio de reconocimiento. Esto marca la transición."
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "¿Cómo te vas?",
        question: "¿Cómo te sientes comparado a cómo llegaste al inicio de esta jornada/reunión?"
      },
      {
        category: "Lo más valioso",
        question: "¿Qué es lo más valioso que te llevas de hoy?"
      },
      {
        category: "Compromiso",
        question: "¿Con qué intención o compromiso te vas?"
      }
    ],
    closingPhrase: "\"Los rituales colectivos cierran el día con bienestar compartido.\" — POP Cards PERMA Team",
    facilitatorTips: [],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "bloque-enfoque",
    slug: "bloque-enfoque",
    title: "Bloques de Enfoque Compartido",
    subtitle: "El equipo acuerda trabajar en paralelo y en silencio durante un período definido en tareas prioritarias. Al terminar, comparten avances para reconocer el esfuerzo y motivarse mutuamente. Fomenta el estado de flow colectivo.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "E",
    competencies: [
      "Compromiso"
    ],
    tags: [
      "PERMA",
      "Compromiso"
    ],
    language: "es",
    objective: "El estado de flow (Csikszentmihalyi) ocurre cuando hay concentración profunda en una tarea desafiante. Los bloques de enfoque compartido crean las condiciones colectivas para ese estado, eliminando las interrupciones sociales que fragmentan el trabajo.",
    description: "El equipo acuerda trabajar en paralelo y en silencio durante un período definido en tareas prioritarias. Al terminar, comparten avances para reconocer el esfuerzo y motivarse mutuamente. Fomenta el estado de flow colectivo.",
    benefits: [
      "El estado de flow (Csikszentmihalyi) ocurre cuando hay concentración profunda en una tarea desafiante. Los bloques de enfoque compartido crean las condiciones colectivas para ese estado, eliminando las interrupciones sociales que fragmentan el trabajo."
    ],
    expectedOutcome: "",
    participants: {
      min: 2,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: true,
    duration: {
      preparation: 0,
      execution: 45,
      debrief: 0,
      total: 45
    },
    recommendedMoment: [],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Cada persona su material de trabajo propio",
      "Temporizador visible para todos",
      "Música instrumental sin letra — opcional",
      "Sin notificaciones activas (modo avión o silencio)"
    ],
    preparation: [],
    instructions: [
      {
        section: "Instrucciones paso a paso",
        steps: [
          {
            title: "Paso 1 · Definir antes del bloque (5 min)",
            description: "Cada persona define EN VOZ ALTA una sola tarea prioritaria para el bloque: \"Yo voy a [tarea específica].\" Esto crea compromiso social y claridad de foco. No vale decir \"voy a trabajar en mis pendientes\" — debe ser algo concreto."
          },
          {
            title: "Paso 2 · Configurar el ambiente",
            description: "Silenciar teléfonos. Cerrar chats y redes. Poner música instrumental si el grupo lo prefiere. El facilitador/a activa el temporizador visible: 25 min (técnica Pomodoro) o el tiempo acordado."
          },
          {
            title: "Paso 3 · Bloque de trabajo en silencio",
            description: "Todos trabajan en paralelo. Sin reuniones, sin consultas, sin interrupciones. Si alguien necesita algo urgente, escríbelo en un papel para después. El silencio compartido no es incómodo — es energizante."
          },
          {
            title: "Paso 4 · Compartir avances (5–10 min)",
            description: "Al sonar el timer, cada persona comparte brevemente (30 seg): \"Logré [X]. El próximo paso es [Y].\" El grupo reconoce con aplausos o un \"bien hecho\". No se comenta ni se da retroalimentación — solo se reconoce."
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "¿Cómo fue la experiencia?",
        question: "¿Cómo fue concentrarte sabiendo que todos a tu alrededor también lo estaban haciendo?"
      },
      {
        category: "Calidad del trabajo",
        question: "¿Lograste más en este bloque de lo que normalmente logras en el mismo tiempo? ¿Por qué crees que es?"
      },
      {
        category: "Implementación",
        question: "¿Podrían incluir un bloque de enfoque compartido en su rutina semanal? ¿Cuándo y cómo?"
      }
    ],
    closingPhrase: "\"El flow colectivo aumenta el foco y la creatividad del equipo.\" — POP Cards PERMA Team",
    facilitatorTips: [
      {
        title: "Técnica Pomodoro",
        description: "25 min de trabajo + 5 min de descanso. Después de 4 bloques, descanso largo (15–30 min). Puedes hacer 2 bloques seguidos con descanso entre ellos."
      },
      {
        title: "Resistencia inicial",
        description: "Es normal que al principio el grupo sienta incomodidad con el silencio. Normalízalo: \"Los primeros minutos pueden sentirse raros. Eso pasa siempre. Sigan.\""
      }
    ],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "mapa-fortalezas",
    slug: "mapa-fortalezas",
    title: "Mapa de Fortalezas",
    subtitle: "Cada persona identifica una fortaleza propia y la comparte con el grupo. El equipo construye colectivamente un mapa de talentos y conversa sobre cómo aprovecharlos en proyectos y desafíos comunes.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "E",
    competencies: [
      "Compromiso"
    ],
    tags: [
      "PERMA",
      "Compromiso"
    ],
    language: "es",
    objective: "Cuando los equipos conocen y usan sus fortalezas individuales, el compromiso aumenta significativamente. Esta actividad hace visible el \"capital de talentos\" del equipo y genera conversaciones sobre cómo alinearlo con los objetivos colectivos.",
    description: "Cada persona identifica una fortaleza propia y la comparte con el grupo. El equipo construye colectivamente un mapa de talentos y conversa sobre cómo aprovecharlos en proyectos y desafíos comunes.",
    benefits: [
      "Cuando los equipos conocen y usan sus fortalezas individuales, el compromiso aumenta significativamente. Esta actividad hace visible el \"capital de talentos\" del equipo y genera conversaciones sobre cómo alinearlo con los objetivos colectivos."
    ],
    expectedOutcome: "",
    participants: {
      min: 2,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: false,
    duration: {
      preparation: 0,
      execution: 30,
      debrief: 0,
      total: 30
    },
    recommendedMoment: [],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Tarjetas grandes o post-its (1 por persona)",
      "Marcadores de colores",
      "Pizarra o cartulina grande para el mapa colectivo",
      "Opcional: imprimir lista de Fortalezas VIA para referencia"
    ],
    preparation: [],
    instructions: [
      {
        section: "Instrucciones paso a paso",
        steps: [
          {
            title: "Paso 1 · Identificar la fortaleza (5 min)",
            description: "Cada persona recibe una tarjeta grande. Consigna: \"Identifica tu mayor fortaleza — algo en lo que genuinamente destacas y que aporta valor al equipo. Puede ser una habilidad técnica, una habilidad de relación, una forma de pensar. Escríbela grande en tu tarjeta y agrega 2 ejemplos concretos de cuándo la usas.\""
          },
          {
            title: "Paso 2 · Ronda de presentación (10 min)",
            description: "Por turnos, cada persona presenta su fortaleza en 60 segundos: \"Mi fortaleza es [X]. La uso cuando [ejemplo 1] y también cuando [ejemplo 2].\" El grupo puede sumar: \"Yo también veo en ti la fortaleza de [Y]\" — solo si es genuino."
          },
          {
            title: "Paso 3 · Construir el mapa colectivo (10 min)",
            description: "Se pegan todas las tarjetas en la pizarra. El facilitador/a pregunta: \"¿Qué vemos aquí? ¿Qué fortalezas tenemos como equipo? ¿Hay algo que nos falta? ¿Hay talentos que no estamos usando lo suficiente?\" Agrupar por categorías emergentes."
          },
          {
            title: "Paso 4 · Conectar con los proyectos",
            description: "Para cada proyecto o desafío actual del equipo, identificar qué fortalezas del mapa son más relevantes. ¿Quién debería liderar qué?"
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "Descubrimientos",
        question: "¿Hubo alguna fortaleza de un compañero/a que no conocías o que te sorprendió? ¿Cuál?"
      },
      {
        category: "Uso actual",
        question: "¿Estamos aprovechando bien las fortalezas de todos en el equipo? ¿Qué cambiaría si lo hiciéramos mejor?"
      },
      {
        category: "Acción concreta",
        question: "¿Hay alguien con una fortaleza que podría tomar más protagonismo en algún proyecto actual? ¿Cuál?"
      }
    ],
    closingPhrase: "\"El compromiso crece cuando usamos nuestras fortalezas en equipo.\" — POP Cards PERMA Team",
    facilitatorTips: [],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "carta-primer-dia",
    slug: "carta-primer-dia",
    title: "Carta al Primer Día",
    subtitle: "En duplas, los integrantes escriben un mensaje a su \"yo del primer día\" en el equipo. Comparten expectativas, aprendizajes y desafíos superados. Reactiva el sentido de propósito y valora el camino recorrido juntos.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "E",
    competencies: [
      "Compromiso"
    ],
    tags: [
      "PERMA",
      "Compromiso"
    ],
    language: "es",
    objective: "",
    description: "En duplas, los integrantes escriben un mensaje a su \"yo del primer día\" en el equipo. Comparten expectativas, aprendizajes y desafíos superados. Reactiva el sentido de propósito y valora el camino recorrido juntos.",
    benefits: [],
    expectedOutcome: "",
    participants: {
      min: 2,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: false,
    duration: {
      preparation: 0,
      execution: 25,
      debrief: 0,
      total: 25
    },
    recommendedMoment: [],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Papel y lápiz por persona",
      "Espacio tranquilo",
      "Música suave — opcional",
      "Sobres para guardar la carta — opcional"
    ],
    preparation: [],
    instructions: [
      {
        section: "Instrucciones",
        steps: [
          {
            title: "Paso 1 · Invitar la reflexión (2 min)",
            description: "Dice el/la facilitador/a: \"Viaja mentalmente a tu primer día en este equipo. ¿Cómo llegaste? ¿Qué esperabas? ¿Qué no sabías aún? ¿Qué te daba curiosidad o miedo?\""
          },
          {
            title: "Paso 2 · Escribir la carta (8 min)",
            description: "Cada persona escribe a su \"yo del primer día\": qué aprendiste, qué desafío superaste que parecía imposible, qué personas te cambiaron, qué te sorprendió para bien, y qué le dirías hoy a ese yo de entonces."
          },
          {
            title: "Paso 3 · Compartir en duplas (8 min)",
            description: "En parejas, cada persona comparte lo más significativo — no la carta completa. La dupla escucha con atención plena. Turnos de 3–4 min."
          },
          {
            title: "Paso 4 · Plenario (5 min)",
            description: "\"¿Hay alguna frase de tu carta que quieras regalarle al grupo?\""
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "El camino",
        question: "¿Qué logros o aprendizajes no habías valorado suficientemente hasta hoy?"
      },
      {
        category: "Cambio",
        question: "¿Cómo eres diferente hoy en comparación a ese primer día?"
      },
      {
        category: "El futuro",
        question: "¿Qué quieres que el \"yo del futuro\" pueda decir sobre este período?"
      }
    ],
    closingPhrase: "\"Recordar los inicios reactiva la motivación colectiva.\"",
    facilitatorTips: [],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "espacio-inspirador",
    slug: "espacio-inspirador",
    title: "Espacio Inspirador",
    subtitle: "Cada integrante trae un objeto o imagen que lo inspire y lo presenta al grupo explicando por qué lo motiva. Compartir estos símbolos personales genera conexión emocional y enriquece el ambiente de trabajo.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "E",
    competencies: [
      "Compromiso"
    ],
    tags: [
      "PERMA",
      "Compromiso"
    ],
    language: "es",
    objective: "",
    description: "Cada integrante trae un objeto o imagen que lo inspire y lo presenta al grupo explicando por qué lo motiva. Compartir estos símbolos personales genera conexión emocional y enriquece el ambiente de trabajo.",
    benefits: [],
    expectedOutcome: "",
    participants: {
      min: 3,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: false,
    duration: {
      preparation: 0,
      execution: 25,
      debrief: 0,
      total: 25
    },
    recommendedMoment: [],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Cada persona trae un objeto o imagen (avisar con 24–48 hrs de anticipación)",
      "Pantalla para imágenes digitales",
      "Papel para notar observaciones — opcional"
    ],
    preparation: [],
    instructions: [
      {
        section: "Instrucciones",
        steps: [
          {
            title: "Preparación previa",
            description: "Avisar con anticipación: \"Trae un objeto físico o imagen que represente algo que te inspire en tu vida o trabajo. Puede ser cualquier cosa — una foto, una herramienta, un libro, un recuerdo.\""
          },
          {
            title: "Presentación (2 min c/u)",
            description: "¿Qué es? ¿Por qué lo elegiste? ¿Qué te inspira de él? ¿Cómo se conecta con tu trabajo o con quién eres en este equipo?"
          },
          {
            title: "Una pregunta del grupo",
            description: "Después de cada presentación, el grupo puede hacer UNA sola pregunta de curiosidad genuina — no de análisis ni de juicio."
          },
          {
            title: "Mapa de inspiraciones",
            description: "El/la facilitador/a anota en la pizarra palabras clave que emergen. Al final: un \"mapa de lo que nos inspira como equipo\"."
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "Sorpresas",
        question: "¿Hubo algún objeto que te sorprendió? ¿Qué dice de tu compañero/a?"
      },
      {
        category: "Colectivo",
        question: "¿Qué tienen en común las fuentes de inspiración del equipo?"
      }
    ],
    closingPhrase: "\"La inspiración compartida enciende la energía del equipo.\"",
    facilitatorTips: [],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "cafe-conectar",
    slug: "cafe-conectar",
    title: "Café para Conectar",
    subtitle: "Integrantes que normalmente no interactúan se dividen en duplas o triadas y comparten un café mientras conversan sobre motivaciones, intereses o desafíos personales. Rompe barreras y humaniza las relaciones.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "R",
    competencies: [
      "Relaciones Positivas"
    ],
    tags: [
      "PERMA",
      "Relaciones Positivas"
    ],
    language: "es",
    objective: "",
    description: "Integrantes que normalmente no interactúan se dividen en duplas o triadas y comparten un café mientras conversan sobre motivaciones, intereses o desafíos personales. Rompe barreras y humaniza las relaciones.",
    benefits: [],
    expectedOutcome: "",
    participants: {
      min: 2,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: false,
    duration: {
      preparation: 0,
      execution: 30,
      debrief: 0,
      total: 30
    },
    recommendedMoment: [],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Café, té o infusión para todos",
      "Espacio cómodo e informal",
      "Tarjetas con preguntas disparadoras — opcional"
    ],
    preparation: [],
    instructions: [
      {
        section: "Instrucciones",
        steps: [
          {
            title: "Paso 1 · Formar las duplas o triadas",
            description: "Juntar personas que no se conozcan mucho o que no trabajen directamente juntas. Sortear al azar o asignación intencional del/la facilitador/a."
          },
          {
            title: "Paso 2 · Preguntas guía (15–20 min)",
            description: "Conversar libremente. Si el grupo no está acostumbrado a charlas personales, usar preguntas disparadoras: ¿Qué te trajo a este trabajo? / ¿Qué te recarga fuera del trabajo? / ¿Cuál ha sido tu mayor aprendizaje este año? / ¿Qué te daría orgullo lograr en los próximos meses?"
          },
          {
            title: "Paso 3 · Descubrimientos (5 min)",
            description: "\"¿Alguien quiere compartir algo que descubrió de su compañero/a?\""
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "Descubriste",
        question: "¿Hay algo de tu compañero/a que cambia cómo lo/la ves en el trabajo?"
      },
      {
        category: "Impacto",
        question: "¿Cómo cambiaría el ambiente si tuviéramos estas conversaciones más seguido?"
      }
    ],
    closingPhrase: "\"Conectarse en lo humano fortalece la confianza.\"",
    facilitatorTips: [],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "mis-tres-apoyos",
    slug: "mis-tres-apoyos",
    title: "Mis Tres Apoyos",
    subtitle: "Cada persona identifica a tres colegas que han sido clave en su camino laboral y comparte con el grupo su importancia. Hace visible la red de apoyo que sostiene al equipo y fortalece los lazos de confianza mutua.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "R",
    competencies: [
      "Relaciones Positivas"
    ],
    tags: [
      "PERMA",
      "Relaciones Positivas"
    ],
    language: "es",
    objective: "",
    description: "Cada persona identifica a tres colegas que han sido clave en su camino laboral y comparte con el grupo su importancia. Hace visible la red de apoyo que sostiene al equipo y fortalece los lazos de confianza mutua.",
    benefits: [],
    expectedOutcome: "",
    participants: {
      min: 3,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: false,
    duration: {
      preparation: 0,
      execution: 20,
      debrief: 0,
      total: 20
    },
    recommendedMoment: [],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Papel y lápiz por persona",
      "Pizarra para el mapa colectivo — opcional"
    ],
    preparation: [],
    instructions: [
      {
        section: "Instrucciones",
        steps: [
          {
            title: "Paso 1 · Reflexión individual (5 min)",
            description: "\"Piensa en tres personas de este equipo (o de tu vida laboral) que han sido clave en tu camino. No necesariamente las que más te gustan — sino las que más han contribuido a tu crecimiento o que te apoyaron en momentos difíciles.\""
          },
          {
            title: "Paso 2 · Compartir en grupo (2 min c/u)",
            description: "Cada persona nombra a sus tres apoyos y dice brevemente por qué. Las personas nombradas solo escuchan — no comentan."
          },
          {
            title: "Paso 3 · Mapa de redes",
            description: "El/la facilitador/a traza conexiones en la pizarra: cada persona es un nodo, y se conectan quienes se nombraron mutuamente. El mapa revela la red de apoyo real del equipo."
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "La red",
        question: "¿Qué ven en el mapa? ¿Hay personas muy conectadas? ¿Alguna menos?"
      },
      {
        category: "Lo no dicho",
        question: "¿Le dijiste alguna vez a tus apoyos lo que significan para ti?"
      }
    ],
    closingPhrase: "\"Los apoyos internos son redes de contención.\"",
    facilitatorTips: [],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "apreciograma",
    slug: "apreciograma",
    title: "El Apreciograma",
    subtitle: "Cada integrante escribe su nombre en una hoja que circula por el grupo. Los demás escriben una cualidad positiva o aporte que valoran. Al final, todos reciben su hoja llena de reconocimientos.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "R",
    competencies: [
      "Relaciones Positivas"
    ],
    tags: [
      "PERMA",
      "Relaciones Positivas"
    ],
    language: "es",
    objective: "",
    description: "Cada integrante escribe su nombre en una hoja que circula por el grupo. Los demás escriben una cualidad positiva o aporte que valoran. Al final, todos reciben su hoja llena de reconocimientos.",
    benefits: [],
    expectedOutcome: "",
    participants: {
      min: 3,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: false,
    duration: {
      preparation: 0,
      execution: 25,
      debrief: 0,
      total: 25
    },
    recommendedMoment: [],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Una hoja A4 por persona",
      "Lápices o bolígrafos para todos",
      "Espacio donde las hojas puedan circular cómodamente"
    ],
    preparation: [],
    instructions: [
      {
        section: "Instrucciones",
        steps: [
          {
            title: "Paso 1",
            description: "Cada persona escribe su nombre en la parte superior de una hoja y la pasa a la derecha."
          },
          {
            title: "Paso 2 · Escribir en silencio (8–10 min)",
            description: "Al recibir una hoja, se escribe UNA cualidad positiva, un aporte valorado o reconocimiento específico. Luego se pasa. Se repite hasta que cada hoja vuelve a su dueño/a."
          },
          {
            title: "Paso 3 · Leer y compartir",
            description: "2 minutos de lectura silenciosa. Luego, voluntariamente: \"¿Alguien quiere compartir algo que le llegó especialmente?\""
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "Lo que recibiste",
        question: "¿Hubo algún reconocimiento que no esperabas?"
      },
      {
        category: "Cultura",
        question: "¿Qué pasaría si el aprecio mutuo fuera parte de nuestra cultura cotidiana?"
      }
    ],
    closingPhrase: "\"El aprecio mutuo fortalece los lazos y eleva el ánimo colectivo.\"",
    facilitatorTips: [],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "conversaciones-conectan",
    slug: "conversaciones-conectan",
    title: "Conversaciones que Conectan",
    subtitle: "El equipo se divide en duplas y responde preguntas humanas y ligeras que van más allá del rol laboral. Luego comparten algunos descubrimientos en el grupo completo.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "R",
    competencies: [
      "Relaciones Positivas"
    ],
    tags: [
      "PERMA",
      "Relaciones Positivas"
    ],
    language: "es",
    objective: "",
    description: "El equipo se divide en duplas y responde preguntas humanas y ligeras que van más allá del rol laboral. Luego comparten algunos descubrimientos en el grupo completo.",
    benefits: [],
    expectedOutcome: "",
    participants: {
      min: 2,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: false,
    duration: {
      preparation: 0,
      execution: 20,
      debrief: 0,
      total: 20
    },
    recommendedMoment: [],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Tarjetas con preguntas — preparar con anticipación o leer en voz alta",
      "Espacio donde las duplas puedan conversar"
    ],
    preparation: [],
    instructions: [
      {
        section: "Preguntas por nivel",
        steps: [
          {
            title: "Nivel 1 · Ligeras",
            description: "¿Qué música escuchas cuando necesitas energía? / ¿Cuál es tu lugar favorito en el mundo? / ¿Qué serie o película recomendarías sin dudar?"
          },
          {
            title: "Nivel 2 · Personales",
            description: "¿Qué actividad fuera del trabajo te recarga completamente? / ¿Qué fue lo más valioso que aprendiste en el último año? / ¿Cuál es el mejor consejo que alguien te ha dado?"
          },
          {
            title: "Nivel 3 · Reflexivas",
            description: "¿Cuál es una creencia que tenías hace 5 años y que hoy ya no sostienes? / ¿Qué cambiarías de cómo trabajas si pudieras?"
          }
        ]
      },
      {
        section: "Instrucciones",
        steps: [
          {
            title: "Elegir el nivel",
            description: "Según el nivel de confianza del grupo: nivel 1 para grupos nuevos, nivel 2–3 para equipos con historia."
          },
          {
            title: "Duplas al azar (15 min)",
            description: "Mezclar personas que no se conozcan mucho. Cada dupla tiene 5 min para 2–3 preguntas. Rotar y repetir con nueva dupla."
          },
          {
            title: "Ronda final (5 min)",
            description: "\"¿Alguien quiere compartir algo que descubrió?\""
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "Sorpresas",
        question: "¿Hubo algo que te sorprendió de alguien que ya conocías?"
      },
      {
        category: "Ambiente",
        question: "¿Cómo está el ambiente del equipo ahora comparado con el inicio?"
      }
    ],
    closingPhrase: "\"Conectar desde lo cotidiano nos recuerda que somos más que trabajo.\"",
    facilitatorTips: [],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "historias-impacto",
    slug: "historias-impacto",
    title: "Historias de Impacto",
    subtitle: "Cada integrante comparte una experiencia donde su labor tuvo un efecto positivo real en usuarios, clientes, compañeros o la comunidad. Escuchar el impacto real fortalece la motivación y el sentido colectivo del trabajo.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "M",
    competencies: [
      "Sentido"
    ],
    tags: [
      "PERMA",
      "Sentido"
    ],
    language: "es",
    objective: "El Sentido o Propósito (M del modelo PERMA) se activa cuando conectamos el trabajo cotidiano con el impacto que genera en otras personas. Esta actividad es especialmente poderosa en momentos de desgaste o cuando el equipo siente que su trabajo \"no importa\".",
    description: "Cada integrante comparte una experiencia donde su labor tuvo un efecto positivo real en usuarios, clientes, compañeros o la comunidad. Escuchar el impacto real fortalece la motivación y el sentido colectivo del trabajo.",
    benefits: [
      "El Sentido o Propósito (M del modelo PERMA) se activa cuando conectamos el trabajo cotidiano con el impacto que genera en otras personas. Esta actividad es especialmente poderosa en momentos de desgaste o cuando el equipo siente que su trabajo \"no importa\"."
    ],
    expectedOutcome: "",
    participants: {
      min: 3,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: false,
    duration: {
      preparation: 0,
      execution: 25,
      debrief: 0,
      total: 25
    },
    recommendedMoment: [],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Sin materiales especiales",
      "Espacio cómodo",
      "Papel para anotar insights del grupo",
      "Opcional: mural con la pregunta disparadora"
    ],
    preparation: [],
    instructions: [
      {
        section: "Instrucciones paso a paso",
        steps: [
          {
            title: "Paso 1 · Reflexión individual (3 min)",
            description: "Consigna: \"Recuerda una situación donde tu trabajo — o el trabajo de este equipo — tuvo un impacto positivo real en alguien. Puede ser un usuario que te lo agradeció, un cliente que cambió gracias a lo que hiciste, un colega que pudiste apoyar en un momento difícil. Anota: ¿qué pasó? ¿a quién impactó? ¿cómo lo supiste?\""
          },
          {
            title: "Paso 2 · Ronda de historias (2 min c/u)",
            description: "Cada persona comparte su historia. El grupo escucha en silencio — sin aplaudir todavía, sin interrumpir. El/la facilitador/a puede preguntar al final de cada historia: \"¿Qué significó eso para ti?\""
          },
          {
            title: "Paso 3 · Mapear el impacto (5 min)",
            description: "El/la facilitador/a pregunta: \"¿Qué patrones ven en estas historias? ¿A quién impactamos más frecuentemente? ¿Cuál es el hilo común entre todas estas historias?\" Anotar en pizarra."
          },
          {
            title: "Paso 4 · La frase del equipo",
            description: "Invitar al grupo a completar: \"Como equipo, nuestro trabajo importa porque...\" Buscar una frase que el grupo sienta verdadera."
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "Sentido personal",
        question: "¿Cómo cambia tu perspectiva sobre tu trabajo después de escuchar estas historias?"
      },
      {
        category: "Impacto oculto",
        question: "¿Hay impactos de nuestro trabajo que normalmente no vemos o no nos contamos? ¿Cuáles?"
      },
      {
        category: "Acción",
        question: "¿Cómo podemos hacer más visible el impacto de nuestro trabajo en el día a día?"
      }
    ],
    closingPhrase: "\"Reconocer el impacto conecta el trabajo con un propósito mayor.\" — POP Cards PERMA Team",
    facilitatorTips: [],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "mision-frase",
    slug: "mision-frase",
    title: "Misión en Una Frase",
    subtitle: "El equipo redacta colectivamente una frase que sintetice su propósito común. Analiza avances y puntos de mejora. Alinea la identidad grupal y refuerza la dirección compartida.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "M",
    competencies: [
      "Sentido"
    ],
    tags: [
      "PERMA",
      "Sentido"
    ],
    language: "es",
    objective: "",
    description: "El equipo redacta colectivamente una frase que sintetice su propósito común. Analiza avances y puntos de mejora. Alinea la identidad grupal y refuerza la dirección compartida.",
    benefits: [],
    expectedOutcome: "",
    participants: {
      min: 3,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: false,
    duration: {
      preparation: 0,
      execution: 35,
      debrief: 0,
      total: 35
    },
    recommendedMoment: [],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Post-its de dos colores",
      "Marcadores",
      "Pizarra o papel kraft grande",
      "Puntos adhesivos para votar"
    ],
    preparation: [],
    instructions: [
      {
        section: "Instrucciones",
        steps: [
          {
            title: "Paso 1 · Reflexión (5 min)",
            description: "Cada persona responde en post-its: ¿Para qué existe este equipo? ¿A quién le cambia la vida lo que hacemos? ¿Qué pasaría si desapareciéramos mañana?"
          },
          {
            title: "Paso 2 · Subgrupos (10 min)",
            description: "En grupos de 3–4, compartir post-its y proponer una frase de propósito: \"Existimos para [acción] + [a quién] + [para que].\""
          },
          {
            title: "Paso 3 · Votar y refinar (10 min)",
            description: "Cada subgrupo comparte su frase. El grupo vota por los elementos que más resuenan. Con los más votados, co-construir una frase final."
          },
          {
            title: "Paso 4 · Validar",
            description: "\"¿Podemos todos comprometernos con esto?\" La frase se escribe grande y se fotografía."
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "¿Qué tan cerca?",
        question: "Del 1 al 10, ¿qué tan alineado está nuestro trabajo cotidiano con esta misión?"
      },
      {
        category: "Brechas",
        question: "¿Qué haríamos diferente si esta frase fuera nuestra guía diaria?"
      }
    ],
    closingPhrase: "\"Un equipo con propósito trabaja con mayor sentido y dirección.\"",
    facilitatorTips: [],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "linea-vida-equipo",
    slug: "linea-vida-equipo",
    title: "Línea de Vida del Equipo",
    subtitle: "El grupo dibuja colectivamente una línea de tiempo con hitos, aprendizajes y momentos significativos. Énfasis en logros y victorias. Refuerza la identidad grupal y valora la historia colectiva.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "M",
    competencies: [
      "Sentido"
    ],
    tags: [
      "PERMA",
      "Sentido"
    ],
    language: "es",
    objective: "",
    description: "El grupo dibuja colectivamente una línea de tiempo con hitos, aprendizajes y momentos significativos. Énfasis en logros y victorias. Refuerza la identidad grupal y valora la historia colectiva.",
    benefits: [],
    expectedOutcome: "",
    participants: {
      min: 3,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: false,
    duration: {
      preparation: 0,
      execution: 40,
      debrief: 0,
      total: 40
    },
    recommendedMoment: [],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Papel kraft o papel de rollo largo (mínimo 2 metros)",
      "Marcadores de varios colores",
      "Cinta adhesiva",
      "Post-its de dos colores",
      "Fotos del equipo — opcional"
    ],
    preparation: [],
    instructions: [
      {
        section: "Instrucciones",
        steps: [
          {
            title: "Paso 1 · Montar la línea",
            description: "Pegar el papel kraft en la pared horizontalmente. Trazar una línea con el inicio del equipo a la izquierda y el presente a la derecha. Dividir en períodos según la historia del equipo."
          },
          {
            title: "Paso 2 · Recordar hitos (10 min)",
            description: "Post-its de dos colores: uno para MOMENTOS DIFÍCILES y otro para LOGROS/VICTORIAS. En silencio, cada quien anota los hitos que recuerda y los pega en el período correspondiente."
          },
          {
            title: "Paso 3 · Narrar la historia (15 min)",
            description: "Recorrido de izquierda a derecha. Para cada hito importante, invitar a alguien a contar qué pasó y qué significó."
          },
          {
            title: "Paso 4 · El patrón",
            description: "\"¿Cómo superamos los momentos difíciles? ¿Qué dice de nosotros como equipo?\""
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "Orgullo",
        question: "¿De qué estamos más orgullosos al mirar esta línea de tiempo?"
      },
      {
        category: "Resiliencia",
        question: "¿Qué recurso colectivo usamos para superar los momentos difíciles?"
      },
      {
        category: "Futuro",
        question: "¿Cuál sería el próximo hito que queremos agregar?"
      }
    ],
    closingPhrase: "\"La trayectoria compartida da sentido al presente.\"",
    facilitatorTips: [],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "elogio-constructivo",
    slug: "elogio-constructivo",
    title: "Ronda del Elogio Constructivo",
    subtitle: "Cada integrante destaca una fortaleza concreta o acción específica de otro miembro del equipo. La retroalimentación positiva y el reconocimiento genuino generan confianza y fortalecen la cultura apreciativa.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "A",
    competencies: [
      "Logro"
    ],
    tags: [
      "PERMA",
      "Logro"
    ],
    language: "es",
    objective: "El reconocimiento específico y genuino es uno de los factores más poderosos de compromiso y bienestar en equipos. Esta actividad formaliza algo que debería ocurrir naturalmente pero raramente lo hace: decirle a alguien, en voz alta y frente al grupo, lo que valoras de ellos.",
    description: "Cada integrante destaca una fortaleza concreta o acción específica de otro miembro del equipo. La retroalimentación positiva y el reconocimiento genuino generan confianza y fortalecen la cultura apreciativa.",
    benefits: [
      "El reconocimiento específico y genuino es uno de los factores más poderosos de compromiso y bienestar en equipos. Esta actividad formaliza algo que debería ocurrir naturalmente pero raramente lo hace: decirle a alguien, en voz alta y frente al grupo, lo que valoras de ellos."
    ],
    expectedOutcome: "",
    participants: {
      min: 2,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: false,
    duration: {
      preparation: 0,
      execution: 20,
      debrief: 0,
      total: 20
    },
    recommendedMoment: [],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Tarjetas o post-its (uno por persona)",
      "Lapiceros",
      "Caja simbólica donde depositar las tarjetas (opcional)",
      "Espacio en círculo"
    ],
    preparation: [],
    instructions: [
      {
        section: "Instrucciones paso a paso",
        steps: [
          {
            title: "Paso 1 · Preparación silenciosa (3 min)",
            description: "Cada persona piensa en UN compañero/a y anota: (a) una fortaleza o acción concreta y reciente que quiere reconocer, y (b) el impacto que eso tuvo. Importante: debe ser algo real y específico, no un cumplido genérico."
          },
          {
            title: "Paso 2 · Formato del elogio",
            description: "El formato es: \"Quiero reconocer a [nombre] por [acción/fortaleza específica]. Eso me impactó porque [impacto concreto].\" Ejemplo: \"Quiero reconocer a Pedro por la forma en que manejó la reunión del martes con el cliente difícil. Su calma e inteligencia emocional hicieron que saliéramos adelante cuando yo ya había perdido la paciencia.\""
          },
          {
            title: "Paso 3 · Ronda de elogios",
            description: "Por turnos, cada persona entrega su elogio directamente a la persona, mirándola a los ojos. El grupo escucha. El silencio entre elogio y elogio es parte de la dinámica — no hay que llenarlo."
          },
          {
            title: "Paso 4 · Recibir con dignidad",
            description: "Quien recibe el elogio responde solo con: \"Gracias, me alegra que lo hayas notado\" o simplemente \"Gracias.\" NO minimiza (\"ay, no fue para tanto\"), NO desvía (\"tú también lo hiciste bien\"), NO explica. Recibir con dignidad es una habilidad que también se practica."
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "¿Cómo fue dar el elogio?",
        question: "¿Qué se sintió decirle algo positivo a alguien en voz alta y frente al grupo?"
      },
      {
        category: "¿Cómo fue recibirlo?",
        question: "¿Cómo fue para ti recibir el reconocimiento? ¿Te costó aceptarlo? ¿Por qué?"
      },
      {
        category: "Frecuencia",
        question: "¿Con qué frecuencia nos reconocemos así en el equipo? ¿Qué pasaría si lo hiciéramos más?"
      }
    ],
    closingPhrase: "\"El feedback positivo es una herramienta poderosa de crecimiento.\" — POP Cards PERMA Team",
    facilitatorTips: [],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "bitacora-avances",
    slug: "bitacora-avances",
    title: "Bitácora de Avances Colectivos",
    subtitle: "El equipo lleva un registro visible de sus progresos semanales. Analizan propulsores y obstaculizadores. Revisar estos avances fortalece la percepción de logro y genera orgullo compartido.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "A",
    competencies: [
      "Logro"
    ],
    tags: [
      "PERMA",
      "Logro"
    ],
    language: "es",
    objective: "",
    description: "El equipo lleva un registro visible de sus progresos semanales. Analizan propulsores y obstaculizadores. Revisar estos avances fortalece la percepción de logro y genera orgullo compartido.",
    benefits: [],
    expectedOutcome: "",
    participants: {
      min: 3,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: false,
    duration: {
      preparation: 0,
      execution: 20,
      debrief: 0,
      total: 20
    },
    recommendedMoment: [
      "20 min semanal"
    ],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Pizarra o tablero visible permanentemente",
      "Post-its de tres colores",
      "Marcadores",
      "Digital: Notion, Trello o Miro"
    ],
    preparation: [],
    instructions: [
      {
        section: "Estructura semanal",
        steps: [
          {
            title: "Tres secciones fijas",
            description: "(1) LOGRAMOS ESTA SEMANA — avances concretos por pequeños que sean. (2) NOS COSTÓ — obstáculos y bloqueos sin buscar culpables. (3) LA PRÓXIMA SEMANA — compromisos específicos del equipo."
          },
          {
            title: "La reunión de bitácora (20 min)",
            description: "Cada semana: (5 min) cada persona anota sus logros en post-its. (5 min) se leen en voz alta — el equipo celebra cada logro. (5 min) se nombran los obstáculos. (5 min) se definen 3 compromisos para la semana."
          },
          {
            title: "Celebrar también lo pequeño",
            description: "La bitácora hace visible lo que normalmente se invisibiliza. Celebrar lo pequeño construye cultura de reconocimiento."
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "Patrón de logros",
        question: "¿Qué tipo de logros aparecen más? ¿Qué dice de las fortalezas del equipo?"
      },
      {
        category: "Obstáculos recurrentes",
        question: "¿Hay obstáculos que aparecen semana a semana? ¿Qué cambiar estructuralmente?"
      }
    ],
    closingPhrase: "\"Celebrar avances aumenta la motivación del equipo.\"",
    facilitatorTips: [],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  },
  {
    id: "escalera-proyecto",
    slug: "escalera-proyecto",
    title: "Escalera del Proyecto",
    subtitle: "El equipo construye una escalera simbólica con los pasos necesarios para alcanzar una meta, asignando responsabilidades en cada peldaño. Ver el camino claro motiva y ordena los esfuerzos colectivos.",
    version: "1.0",
    status: "published",
    categorySlug: "perma",
    subcategory: "A",
    competencies: [
      "Logro"
    ],
    tags: [
      "PERMA",
      "Logro"
    ],
    language: "es",
    objective: "",
    description: "El equipo construye una escalera simbólica con los pasos necesarios para alcanzar una meta, asignando responsabilidades en cada peldaño. Ver el camino claro motiva y ordena los esfuerzos colectivos.",
    benefits: [],
    expectedOutcome: "",
    participants: {
      min: 3,
      ideal: 12,
      max: 30
    },
    modality: [
      "Presencial"
    ],
    virtualCompatible: false,
    duration: {
      preparation: 0,
      execution: 40,
      debrief: 0,
      total: 40
    },
    recommendedMoment: [],
    facilitationDifficulty: 1,
    energyLevel: 3,
    movementLevel: 1,
    emotionalDepth: 2,
    reflectionDepth: 2,
    noiseLevel: 1,
    materials: [
      "Pizarra o papel kraft",
      "Marcadores de dos colores",
      "Post-its (uno por tarea)",
      "Cinta adhesiva"
    ],
    preparation: [],
    instructions: [
      {
        section: "Instrucciones",
        steps: [
          {
            title: "Paso 1 · Definir la meta (5 min)",
            description: "\"En [plazo], habremos logrado [resultado concreto y medible].\""
          },
          {
            title: "Paso 2 · Dibujar la escalera (5 min)",
            description: "Escalera de 5–8 peldaños. Abajo: punto actual (hoy). Arriba: la meta. Los peldaños intermedios son los pasos necesarios."
          },
          {
            title: "Paso 3 · Llenar los peldaños (15 min)",
            description: "Para cada peldaño: nombre de la tarea + responsable + fecha límite. Escribir en post-its y pegar en el peldaño."
          },
          {
            title: "Paso 4 · Revisión",
            description: "En la siguiente reunión: ¿cuántos peldaños subimos? ¿Qué necesita ajuste?"
          }
        ]
      }
    ],
    reflectionQuestions: [
      {
        category: "Claridad",
        question: "¿Cómo se siente tener el camino visible y organizado?"
      },
      {
        category: "Compromiso",
        question: "¿Todos sienten que su peldaño es justo y alcanzable?"
      }
    ],
    closingPhrase: "\"Los logros colectivos fortalecen la autoeficacia del equipo.\"",
    facilitatorTips: [],
    commonMistakes: [],
    variations: [],
    scientificFoundation: "",
    theories: [],
    authors: [],
    references: [],
    resources: [],
    relatedActivities: [],
    recommendedPrograms: []
  }
]