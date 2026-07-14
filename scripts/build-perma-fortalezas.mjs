#!/usr/bin/env node
/**
 * Genera perma.json y fortalezas.json con fundamentos científicos y actividades nuevas.
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const kitpopPath = join(root, 'src/data/kitpopData.json')
const kitpop = JSON.parse(readFileSync(kitpopPath, 'utf8'))

const SCIENCE_SECTION = (p) => ({
  t: 'Fundamento científico',
  rows: [{ ic: 'science', h: 'Evidencia y fundamento', p }],
})

const SCIENCE = {
  'ronda-noticias':
    'Basado en la teoría broaden-and-build de Barbara Fredrickson (2001): las emociones positivas compartidas amplían el repertorio cognitivo y conductual del equipo. La revisión narrativa PERMA-P (Hernández, 2026) sintetiza evidencia de que practicas como gratitud, saboreo y afecto positivo en contextos grupales se asocian con mayor bienestar y colaboración, con efectos pequeños a moderados según meta-análisis de intervenciones de psicología positiva (Bolier et al., 2013; Carr et al., 2021).',
  'cadena-agradecimiento':
    'La gratitud interpersonal activa emociones positivas en quien da y en quien recibe, fortaleciendo vínculos (componente R del PERMA). Meta-análisis sobre intervenciones de gratitud reportan mejoras modestas en bienestar (Dickens, 2017; Emmons & McCullough, 2003). En equipos, el reconocimiento específico —no genérico— aumenta cohesión y reduce conflictos latentes.',
  'momento-wow':
    'El saboreo (savoring) prolonga y intensifica experiencias positivas mediante atención deliberada (Klibert et al., 2022). Narrar momentos de impacto en grupo activa memoria emocional positiva y construye identidad colectiva, conectando P (emociones) con M (sentido). La evidencia sugiere que compartir lo positivo en contexto seguro multiplica su efecto relacional.',
  'circulo-cierre':
    'Los rituales de cierre que nombran lo positivo favorecen consolidación emocional y pertenencia grupal. Desde PERMA-P, cerrar conscientemente la jornada reduce el sesgo de negatividad retrospectiva y entrena la regulación de emociones positivas (saboreo y gratitud breve). La flexibilidad emocional —no positividad forzada— es clave para bienestar sostenible (Houben et al., 2015).',
  'bloque-enfoque':
    'Inspirado en el concepto de flow de Csíkszentmihályi y en el engagement (E) del PERMA: estados de absorción profunda con metas claras y feedback inmediato. Meta-análisis reciente vincula flow laboral con bienestar y desempeño (Liu et al., 2023). El modelo demandas-recursos (Bakker & Demerouti, 2017) subraya que el engagement sostenible requiere recuperación, no solo intensidad.',
  'mapa-fortalezas':
    'Seligman y Peterson identificaron 24 fortalezas de carácter agrupadas en seis virtudes (VIA). Usar fortalezas signature en el trabajo aumenta engagement y bienestar (Niemiec, 2018; Linley et al., 2010). Esta actividad hace visible el capital de talentos del equipo antes de asignar roles, alineando E (compromiso) con fortalezas reales.',
  'carta-primer-dia':
    'La narrativa autobiográfica sobre el propio recorrido activa identidad y motivación (componentes E y M del PERMA). Revisar expectativas iniciales versus aprendizajes consolidados favorece coherencia narrativa y sentido de progreso, factores asociados con persistencia y bienestar en equipos de trabajo.',
  'espacio-inspirador':
    'Conectar objetos personales con significado activa motivación intrínseca y autenticidad (Self-Determination Theory). Compartir fuentes de inspiración en equipo humaniza relaciones (R) y revela valores compartidos que sustentan engagement (E), sin exigir vulnerabilidad clínica.',
  'cafe-conectar':
    'Las relaciones positivas (R) son pilar del PERMA: el apoyo social percibido se asocia consistentemente con menor depresión y mayor bienestar (Rueger et al., 2016). El contacto informal entre personas que no interactúan habitualmente reduce barreras jerárquicas y construye capital social, base de confianza en equipos (Holt-Lunstad, 2024).',
  'mis-tres-apoyos':
    'Mapear redes de apoyo hace visible la estructura relacional del equipo. La literatura PERMA-R distingue cantidad versus calidad de vínculos: lo subjetivo (sentirse apoyado) predice mejor el bienestar que el simple conteo de contactos (Wang et al., 2018). Nombrar apoyos en voz alta refuerza gratitud y reciprocidad.',
  'apreciograma':
    'Basado en prácticas apreciativas y reconocimiento mutuo anónimo. El feedback positivo específico fortalece autoeficacia y pertenencia (A y R del PERMA). Meta-evidencia sobre intervenciones de psicología positiva respalda beneficios promedio en bienestar cuando el reconocimiento es concreto y creíble (Carr et al., 2021).',
  'conversaciones-conectan':
    'Las conversaciones graduadas en profundidad facilitan autorrevelación controlada y confianza interpersonal, principio validado en investigación sobre intimidad progresiva (Aron et al., 1997). En PERMA-R, la calidad relacional —escucha, reciprocidad, curiosidad genuina— predice bienestar más que la frecuencia de contacto (Taşfiliz et al., 2018).',
  'historias-impacto':
    'El sentido (M) del PERMA se activa cuando conectamos el trabajo cotidiano con impacto en otros. Wrzesniewski et al. muestran que percibir propósito en la labor predice engagement y satisfacción. Escuchar historias de impacto real contrarresta desgaste y anhedonia laboral, reconectando con el «para qué» del equipo.',
  'mision-frase':
    'Co-construir propósito compartido alinea identidad grupal y dirección (M del PERMA). Seligman (2018) sitúa el meaning como pertenencia a algo mayor que uno mismo. La co-creación de una frase de misión aumenta compromiso cuando el grupo valida auténticamente la formulación, no cuando se impone desde arriba.',
  'linea-vida-equipo':
    'La identidad narrativa colectiva integra logros y adversidades superadas, fortaleciendo resiliencia grupal (M y A del PERMA). Revisar hitos compartidos activa orgullo y aprendizaje organizacional, conectando pasado y presente con dirección futura —práctica alineada con indagación apreciativa en contextos organizacionales.',
  'elogio-constructivo':
    'El reconocimiento específico de fortalezas observadas en otros activa emociones positivas, refuerza conductas deseadas y construye cultura apreciativa (P, R y A). Las intervenciones basadas en fortalezas del carácter (VIA/Niemiec, 2018) muestran que el feedback anclado en fortalezas concretas es más duradero que el elogio genérico.',
  'bitacora-avances':
    'El principio de progreso (Amabile & Kramer, 2011) demuestra que registrar avances —aunque pequeños— aumenta motivación intrínseca. En PERMA-A (logro), hacer visible el progreso semanal combate invisibilización del esfuerzo y fortalece autoeficacia colectiva, especialmente en proyectos de largo aliento.',
  'escalera-proyecto':
    'Descomponer metas en pasos secuenciales con responsables claros activa logro (A) y engagement (E). La meta-análisis sobre goal setting (Locke & Latham) respalda metas específicas y desafiantes con feedback. Visualizar el camino reduce ansiedad ante la incertidumbre y distribuye carga equitativa en el equipo.',
  'fc-intro':
    'Peterson y Seligman (2004) clasificaron 24 fortalezas de carácter en seis virtudes universales tras revisión intercultural. Las fortalezas son rasgos morales que expresan lo mejor de la persona y se asocian con bienestar, resiliencia y relaciones saludables. Niemiec (2018) propone usarlas como lente de desarrollo, no de déficit.',
  'fc-test-via':
    'El VIA Character Strengths Survey (viacharacter.org) es el instrumento psicométrico más validado para identificar las 24 fortalezas. Las cinco superiores suelen sentirse naturales, energizantes y auténticas —fortalezas signature— (Peterson & Seligman, 2004). Conocerlas es punto de partida para intervenciones basadas en fortalezas (Niemiec, 2018).',
  'fc-sabiduria':
    'Las fortalezas cognitivas (creatividad, curiosidad, juicio, amor por aprender, perspectiva) facilitan aprendizaje organizacional y decisiones complejas. En liderazgo, la perspectiva y el juicio crítico predicen calidad de decisiones bajo incertidumbre (Peterson & Seligman, 2004; Niemiec, 2018).',
  'fc-valor':
    'Valor (valentía, perseverancia, honestidad, vitalidad) sostiene acción frente a obstáculos. Meta-análisis vinculan perseverancia y grit con logro a largo plazo (Duckworth et al., 2007). En equipos, la honestidad respetuosa y la valentía interpersonal habilitan conversaciones difíciles necesarias.',
  'fc-humanidad':
    'Amor, bondad e inteligencia social son fortalezas interpersonales centrales en clima laboral. La compasión y el cuidado mutuo se asocian con menor burnout y mayor engagement (Kirby et al., 2017). Desarrollarlas fortalece el componente R del PERMA desde un enfoque basado en fortalezas.',
  'fc-justicia':
    'Liderazgo, equidad y trabajo en equipo son fortalezas cívicas esenciales en organizaciones. Equipos con liderazgo facilitador y distribución justa de roles muestran mayor engagement (Decuypere & Schaufeli, 2021). Estas fortalezas conectan desarrollo personal con justicia organizacional.',
  'fc-moderacion':
    'Autorregulación, humildad, perdón y prudencia protegen contra excesos de otras fortalezas. Niemiec (2018) destaca el sobreuso y subuso de fortalezas: una fortaleza usada en exceso puede volverse limitante (p. ej., prudencia excesiva → parálisis). La moderación equilibra el perfil de carácter.',
  'fc-trascendencia':
    'Gratitud, esperanza, humor, espiritualidad y apreciación de belleza conectan con trascendencia y sentido (M del PERMA). Intervenciones de gratitud y asombro muestran efectos positivos en bienestar (Dickens, 2017; Monroy & Keltner, 2022). Son fortalezas clave para sostener optimismo realista en equipos.',
}

function addScience(activity, slug) {
  const text = SCIENCE[slug]
  if (!text) return activity
  const copy = JSON.parse(JSON.stringify(activity))
  const hasScience = copy.secs?.some((s) =>
    s.rows?.some((r) => r.ic === 'science')
  )
  if (hasScience) return copy
  copy.secs = copy.secs || []
  copy.secs.push(SCIENCE_SECTION(text))
  return copy
}

const NEW_PERMA = {
  'tres-cosas-buenas': {
    ic: 'star',
    cat: 'PERMA · P — Emociones Positivas',
    perma: 'P',
    clr: 'brand',
    name: 'Tres <em>Cosas Buenas</em>',
    sub: 'Ritual breve —individual o en equipo— para registrar tres experiencias positivas del día o de la semana. Entrena la atención hacia lo que funciona y construye un repertorio de gratitud cotidiana.',
    metas: ['5–10 min', 'Individual o equipo', 'Bitácora o app', 'Ritual diario o semanal'],
    mat: ['Cuaderno, app de notas o plantilla KitPOP', '2–5 min de silencio inicial', 'Opcional: compartir en ronda de 1 min'],
    secs: [
      {
        t: 'Objetivo y propósito',
        rows: [
          {
            ic: 'star',
            h: '¿Para qué sirve?',
            p: 'Entrenar la detección de lo positivo cotidiano, contrarrestando el sesgo de negatividad. Ideal como cierre de jornada personal o apertura semanal de equipo.',
          },
        ],
      },
      {
        t: 'Instrucciones paso a paso',
        rows: [
          {
            ic: 'edit',
            h: 'Paso 1 · Tres columnas (3 min)',
            p: 'Anota tres cosas que fueron bien hoy/esta semana. Para cada una responde: ¿Qué pasó? ¿Qué rol tuviste tú? ¿Cómo te sentiste?',
          },
          {
            ic: 'heart',
            h: 'Paso 2 · Profundizar una (2 min)',
            p: 'Elige la más significativa y escribe por qué importó —conecta con una fortaleza tuya o de alguien del equipo.',
          },
          {
            ic: 'spark',
            h: 'Paso 3 · Compartir (opcional, 5 min)',
            p: 'En equipo: una persona comparte solo UNA cosa buena en 60 segundos. Sin comentarios, solo escucha. Rotar semanalmente quién abre.',
          },
        ],
        cita: '"Lo que apreciamos, aprecia." — Emmons & McCullough',
      },
      {
        t: 'Reflexión',
        plen: [
          { c: 'Patrón', q: '¿Qué tipo de cosas buenas aparecen más seguido? ¿Qué dice de ti o del equipo?' },
          { c: 'Transferencia', q: '¿Podemos hacer de esto un ritual fijo —al cerrar el día o la semana?' },
        ],
      },
      SCIENCE_SECTION(
        'Intervención clásica de psicología positiva: Emmons & McCullough (2003) demostraron que contar bendiciones mejora bienestar subjetivo. Meta-análisis confirman efectos modestos de prácticas de gratitud (Dickens, 2017). En PERMA-P, registrar lo positivo entrena saboreo y reduce «dampening» —minimizar lo bueno— (Hernández, 2026).'
      ),
    ],
  },
  'saboreo-consciente': {
    ic: 'sun',
    cat: 'PERMA · P — Emociones Positivas',
    perma: 'P',
    clr: 'brand',
    name: '<em>Saboreo</em> Consciente',
    sub: 'Práctica guiada para prolongar e intensificar una experiencia positiva reciente —laboral o personal— mediante atención plena al recuerdo. Individual o en parejas.',
    metas: ['10–15 min', 'Individual o duplas', 'Sin materiales', 'Tras un logro o momento agradable'],
    mat: ['Espacio tranquilo', 'Opcional: objeto simbólico del momento a saborear'],
    secs: [
      {
        t: 'Instrucciones',
        rows: [
          {
            ic: 'sun',
            h: 'Paso 1 · Elegir el momento (1 min)',
            p: 'Recuerda algo positivo de las últimas 48 horas —un logro, un gesto, un aprendizaje, un encuentro.',
          },
          {
            ic: 'eye',
            h: 'Paso 2 · Revivir con los sentidos (4 min)',
            p: 'Cierra los ojos. ¿Qué veías? ¿Qué escuchabas? ¿Qué sentías en el cuerpo? Permanece en el recuerdo sin apresurarte.',
          },
          {
            ic: 'heart',
            h: 'Paso 3 · Ampliar (3 min)',
            p: 'Pregunta: ¿Qué hizo especial este momento? ¿Quién contribuyó? ¿Cómo puedo crear condiciones para repetirlo?',
          },
          {
            ic: 'spark',
            h: 'Paso 4 · Compartir en dupla (5 min)',
            p: 'Si es grupal: en parejas, comparte solo la sensación principal —no la historia completa— y escucha la de tu compañero/a.',
          },
        ],
        cita: '"Saborear es estirar lo bueno." — Bryant & Veroff',
      },
      SCIENCE_SECTION(
        'El saboreo (savoring) busca aumentar intensidad y duración de emociones positivas mediante atención deliberada. Meta-análisis reportan efectos pequeños a moderados en bienestar (Klibert et al., 2022). En PERMA-P, saborear no depende de más eventos externos: transforma cómo procesamos lo que ya ocurrió (Hernández, 2026).'
      ),
    ],
  },
  'perma-pulso-equipo': {
    ic: 'therm',
    cat: 'PERMA · Diagnóstico de equipo',
    perma: 'P',
    clr: 'brand',
    name: 'PERMA <em>Pulso</em> del Equipo',
    sub: 'Check-in rápido de los cinco pilares PERMA en escala 1–10. Permite detectar desbalances, priorizar conversaciones y medir evolución mes a mes.',
    metas: ['15–20 min', 'Equipo completo', 'Pizarra o mural digital', 'Mensual o trimestral'],
    mat: [
      'Pizarra o Miro con 5 columnas: P · E · R · M · A',
      'Post-its de colores (uno por persona)',
      'Plantilla PERMA-Pulso (opcional)',
    ],
    secs: [
      {
        t: 'Instrucciones',
        rows: [
          {
            ic: 'therm',
            h: 'Paso 1 · Autoevaluación silenciosa (3 min)',
            p: 'Cada persona anota del 1 al 10: P (¿Cuánta energía positiva siento en el trabajo?), E (¿Estoy absorbedo/a en lo que hago?), R (¿Me siento conectado/a con el equipo?), M (¿Mi trabajo tiene sentido?), A (¿Percibo avances y logros?).',
          },
          {
            ic: 'therm',
            h: 'Paso 2 · Promedios anónimos (5 min)',
            p: 'Recoger puntuaciones (anónimas o en confianza). Calcular promedio por pilar en la pizarra. No juzgar: observar el perfil.',
          },
          {
            ic: 'focus',
            h: 'Paso 3 · Un pilar bajo (7 min)',
            p: 'Si algún pilar promedia bajo 6, el grupo elige UNO para conversar: ¿Qué lo está afectando? ¿Una acción pequeña para las próximas dos semanas?',
          },
          {
            ic: 'spark',
            h: 'Paso 4 · Un pilar alto (3 min)',
            p: 'Celebrar el pilar más fuerte: ¿Qué lo sostiene? ¿Cómo protegerlo?',
          },
        ],
        cita: '"Lo que se mide, se puede cuidar." — PERMA-Profiler, Butler & Kern (2016)',
      },
      SCIENCE_SECTION(
        'El PERMA-Profiler (Butler & Kern, 2016) mide los cinco componentes del bienestar de Seligman de forma breve y diferenciada. Usar los cinco pilares evita colapsar bienestar en un solo indicador y permite detectar perfiles (p. ej., alto logro con bajo sentido). La revisión PERMA organizacional (164 Press, 2024) respalda su aplicación en contextos laborales latinoamericanos.'
      ),
    ],
  },
  'proposito-tres-niveles': {
    ic: 'compass',
    cat: 'PERMA · M — Sentido',
    perma: 'M',
    clr: 'brand',
    name: 'Propósito en <em>Tres Niveles</em>',
    sub: 'Reflexión individual sobre el trabajo como job (sustento), career (trayectoria) y calling (vocación). Alinea la labor cotidiana con sentido personal y profesional.',
    metas: ['25–30 min', 'Individual', 'Papel y lápiz', 'Ideal tras cambio de rol o burnout leve'],
    mat: ['Plantilla de tres columnas', 'Espacio tranquilo', 'Opcional: compartir en plenario voluntario'],
    secs: [
      {
        t: 'Instrucciones',
        rows: [
          {
            ic: 'compass',
            h: 'Job · El trabajo como sustento',
            p: '¿Qué te da este trabajo en lo material y práctico? ¿Qué habilidades estás desarrollando aunque no sean tu pasión?',
          },
          {
            ic: 'compass',
            h: 'Career · El trabajo como trayectoria',
            p: '¿Hacia dónde te acerca este rol en 3–5 años? ¿Qué puertas abre? ¿Qué red estás construyendo?',
          },
          {
            ic: 'compass',
            h: 'Calling · El trabajo como vocación',
            p: '¿En qué momentos sientes que tu labor importa más allá del sueldo? ¿A quién ayudas? ¿Qué fortalezas tuyas brillan ahí?',
          },
          {
            ic: 'spark',
            h: 'Integración',
            p: 'Completa: «Hoy elijo ver mi trabajo como... porque...» Define una micro-acción esta semana que conecte al menos dos niveles.',
          },
        ],
        cita: '"El sentido emerge cuando conectamos lo que hacemos con quiénes somos." — Wrzesniewski et al.',
      },
      SCIENCE_SECTION(
        'Wrzesniewski et al. distinguen job, career y calling como orientaciones al trabajo. Percibir la labor como calling se asocia con mayor engagement y satisfacción, pero job crafting —rediseñar tareas y relaciones— puede aumentar sentido sin cambiar de empleo (Wrzesniewski & Dutton, 2001). Conecta directamente con M (meaning) del PERMA (Seligman, 2018).'
      ),
    ],
  },
  'job-crafting-perma': {
    ic: 'briefcase',
    cat: 'PERMA · E — Compromiso',
    perma: 'E',
    clr: 'brand',
    name: '<em>Job Crafting</em> en Equipo',
    sub: 'Sesión estructurada para rediseñar tareas, relaciones y significado del rol dentro de los límites reales del puesto. Aumenta engagement al alinear trabajo con fortalezas y valores.',
    metas: ['45–60 min', 'Equipo o subgrupos', 'Post-its y pizarra', 'Trimestral o tras restructuración'],
    mat: [
      'Plantilla job crafting (tareas / relaciones / significado)',
      'Post-its de tres colores',
      'Acuerdos con liderazgo sobre límites de cambio',
    ],
    secs: [
      {
        t: 'Instrucciones',
        rows: [
          {
            ic: 'briefcase',
            h: 'Paso 1 · Mapa actual (10 min)',
            p: 'Cada persona lista: 3 tareas que energizan, 3 que drenan, 3 relaciones clave, 1 aspecto de significado que ya existe.',
          },
          {
            ic: 'briefcase',
            h: 'Paso 2 · Tres tipos de crafting (15 min)',
            p: 'Task crafting: ¿Qué puedo hacer más/menos/diferente? Relational crafting: ¿Con quién quiero colaborar más? Cognitive crafting: ¿Cómo puedo reencuadrar una tarea aburrida conectándola con impacto?',
          },
          {
            ic: 'briefcase',
            h: 'Paso 3 · Propuesta al equipo (15 min)',
            p: 'Compartir UNA propuesta concreta y negociable. El equipo responde: ¿Qué apoyo necesitas? ¿Qué intercambio es justo?',
          },
          {
            ic: 'spark',
            h: 'Paso 4 · Compromiso',
            p: 'Registrar 1–2 cambios acordados con responsable y fecha de revisión en 30 días.',
          },
        ],
        cita: '"No necesitas otro trabajo para tener otro trabajo." — Berg, Dutton & Wrzesniewski',
      },
      SCIENCE_SECTION(
        'Job crafting —rediseñar activamente tareas, relaciones y significado del rol— aumenta engagement con efectos respaldados por meta-análisis (Oprea et al., 2019; Sakuraya et al., 2020). El modelo demandas-recursos (Bakker & Demerouti, 2017) explica por qué alinear trabajo con fortalezas y autonomía sostiene E del PERMA sin exigir sobretrabajo.'
      ),
    ],
  },
}

const NEW_FORTALEZAS = {
  'fc-spotting-parejas': {
    ic: 'eye',
    cat: 'Fortalezas del Carácter · Equipo',
    clr: 'brand',
    name: 'Strength <em>Spotting</em> en Parejas',
    sub: 'Cada persona observa y nombra fortalezas VIA concretas en su compañero/a durante una tarea o conversación. Entrena el reconocimiento basado en evidencia conductual, no en cumplidos genéricos.',
    metas: ['20–25 min', 'Duplas', 'Lista VIA de referencia', 'Tras proyecto o retro'],
    mat: ['Lista de 24 fortalezas VIA (impresa o digital)', 'Ficha: fortaleza + conducta observada + impacto', 'Temporizador'],
    secs: [
      {
        t: 'Instrucciones',
        rows: [
          {
            ic: 'eye',
            h: 'Paso 1 · Observar (10 min)',
            p: 'En duplas, compartan brevemente un desafío reciente del trabajo. Mientras uno habla, el otro escucha buscando activamente 2 fortalezas VIA en acción —no rasgos abstractos, sino conductas concretas.',
          },
          {
            ic: 'star',
            h: 'Paso 2 · Nombrar con precisión (5 min)',
            p: 'Formato: «Observé tu fortaleza de [X] cuando [conducta específica]. Eso impactó en [resultado].» Usar vocabulario VIA.',
          },
          {
            ic: 'spark',
            h: 'Paso 3 · Intercambiar roles',
            p: 'Repetir. Cerrar: ¿Alguna fortaleza nombrada te sorprendió? ¿La reconoces como tuya?',
          },
        ],
      },
      SCIENCE_SECTION(
        'Strength spotting es intervención central en la guía de Niemiec (2018): reconocer fortalezas en otros aumenta vínculo, autoeficacia y uso de fortalezas propias. Proctor et al. (2011) mostraron que intervenciones breves de fortalezas mejoran bienestar cuando incluyen identificación, uso y reconocimiento mutuo.'
      ),
    ],
  },
  'fc-feedback-fortalezas': {
    ic: 'chat',
    cat: 'Fortalezas del Carácter · Feedback',
    clr: 'brand',
    name: 'Feedback con <em>Fortalezas</em>',
    sub: 'Estructura de conversación 1:1 para entregar reconocimiento o feedback de mejora anclado en fortalezas VIA —qué fortaleza está en juego y cómo usarla mejor.',
    metas: ['15–20 min', 'Conversación 1:1', 'Ficha de feedback VIA', 'Liderazgo y pares'],
    mat: ['Top 5 fortalezas de cada persona (ideal: test VIA previo)', 'Plantilla: Fortaleza → Evidencia → Impacto → Siguiente paso'],
    secs: [
      {
        t: 'Estructura de la conversación',
        rows: [
          {
            ic: 'chat',
            h: '1 · Fortaleza observada',
            p: '«En [situación], vi tu fortaleza de [VIA] cuando [conducta].»',
          },
          {
            ic: 'chat',
            h: '2 · Impacto',
            p: '«Eso generó [efecto concreto en el equipo/proyecto/persona].»',
          },
          {
            ic: 'chat',
            h: '3 · Potenciar o calibrar',
            p: 'Para reconocimiento: «¿Cómo podrías usar más esta fortaleza en X?» Para mejora: «¿Qué fortaleza complementaria podría equilibrar [sobreuso]?»',
          },
          {
            ic: 'spark',
            h: '4 · Acuerdo',
            p: 'Una acción concreta en 7 días. Agendar seguimiento breve.',
          },
        ],
        cita: '"El feedback más duradero nombra lo que la persona ya es." — Niemiec, 2018',
      },
      SCIENCE_SECTION(
        'El feedback basado en fortalezas (strengths-based feedback) contrasta con el enfoque por déficit. Linley & Harrington (2006) reportan que trabajar desde fortalezas signature mejora desempeño y bienestar. Niemiec (2018) advierte calibrar sobreuso: una fortaleza en exceso puede obstaculizar —p. ej., honestidad sin tacto.',
      ),
    ],
  },
  'fc-matriz-uso': {
    ic: 'balance',
    cat: 'Fortalezas del Carácter · Autoconocimiento',
    clr: 'brand',
    name: 'Matriz de <em>Uso</em> de Fortalezas',
    sub: 'Mapea cada fortaleza signature en subuso, uso óptimo o sobreuso. Herramienta individual para calibrar el carácter en contextos laborales concretos.',
    metas: ['30 min', 'Individual', 'Top 5 VIA', 'Ideal tras test oficial'],
    mat: ['Top 5 fortalezas del test VIA', 'Matriz 5×3 (subuso / óptimo / sobreuso)', 'Ejemplos de situaciones laborales recientes'],
    secs: [
      {
        t: 'Instrucciones',
        rows: [
          {
            ic: 'balance',
            h: 'Por cada fortaleza top',
            p: 'Describe: ¿Cuándo la uso poco (subuso)? ¿Cuándo en medida justa (óptimo)? ¿Cuándo en exceso (sobreuso)? Ejemplo: Perseverancia en subuso → abandono prematuro; en sobreuso → no delegar.',
          },
          {
            ic: 'focus',
            h: 'Elegir una calibración',
            p: 'Selecciona UNA fortaleza para ajustar esta semana. Si es subuso: una situación donde usarla más. Si es sobreuso: una fortaleza complementaria que equilibre.',
          },
        ],
      },
      SCIENCE_SECTION(
        'Peterson y Seligman (2004) y Niemiec (2018) enfatizan que las fortalezas tienen «sombra»: cada virtud puede sobreutilizarse. La matriz de uso convierte el perfil VIA en guía de conducta situacional, no en etiqueta fija —principio clave de intervenciones basadas en fortalezas en organizaciones.',
      ),
    ],
  },
  'fc-equipo-por-virtudes': {
    ic: 'team',
    cat: 'Fortalezas del Carácter · Equipo',
    clr: 'brand',
    name: 'Equipo por <em>Virtudes</em>',
    sub: 'Mapa colectivo de las seis virtudes VIA: el equipo distribuye sus fortalezas predominantes y detecta vacíos o excesos en el perfil grupal.',
    metas: ['40–50 min', 'Equipo 5–15 personas', 'Test VIA previo recomendado', 'Onboarding o planificación'],
    mat: [
      'Pizarra con 6 columnas (virtudes VIA)',
      'Post-its: nombre + fortaleza top de cada persona',
      'Lista de 24 fortalezas',
    ],
    secs: [
      {
        t: 'Instrucciones',
        rows: [
          {
            ic: 'team',
            h: 'Paso 1 · Aportar fortaleza top (10 min)',
            p: 'Cada persona coloca su fortaleza #1 del VIA en la columna de virtud correspondiente. Si no hizo el test: elige la que más resuene de la lista.',
          },
          {
            ic: 'team',
            h: 'Paso 2 · Leer el mapa (10 min)',
            p: '¿Qué virtudes están sobrepobladas? ¿Cuáles vacías? ¿Es un problema para nuestros objetivos actuales?',
          },
          {
            ic: 'team',
            h: 'Paso 3 · Diseñar complemento (15 min)',
            p: 'Para un proyecto concreto: ¿Qué virtud necesitamos activar más? ¿Quién puede liderar con su fortaleza? ¿Necesitamos aliado externo?',
          },
        ],
      },
      SCIENCE_SECTION(
        'El modelo VIA agrupa 24 fortalezas en seis virtudes universales (Peterson & Seligman, 2004). Equipos diversos en virtudes suelen resolver problemas complejos mejor que grupos homogéneos (Ruch et al., 2010). Mapear virtudes colectivas orienta asignación de roles desde recursos, no desde déficits —enfoque central de psicología organizacional positiva.',
      ),
    ],
  },
  'fc-activacion-semanal': {
    ic: 'target',
    cat: 'Fortalezas del Carácter · Individual',
    clr: 'brand',
    name: 'Activación <em>Semanal</em> de Fortaleza',
    sub: 'Compromiso individual de usar deliberadamente una fortaleza signature cada semana en una situación laboral específica. Seguimiento en 5 minutos el viernes.',
    metas: ['5 min planificación + 5 min cierre', 'Individual', 'Bitácora', 'Semanal'],
    mat: ['Top 5 VIA anotadas', 'Plantilla: Fortaleza → Situación → Acción → Resultado'],
    secs: [
      {
        t: 'Ritual semanal',
        rows: [
          {
            ic: 'target',
            h: 'Lunes · Elegir',
            p: 'Selecciona UNA fortaleza signature y UNA situación de la semana (reunión, proyecto, conversación difícil) donde la usarás deliberadamente.',
          },
          {
            ic: 'edit',
            h: 'Durante la semana · Actuar',
            p: 'Antes de la situación, pregúntate: «¿Cómo se vería [fortaleza] aquí?» Anota brevemente después qué hiciste.',
          },
          {
            ic: 'spark',
            h: 'Viernes · Revisar (5 min)',
            p: '¿La usé? ¿Qué efecto tuvo? ¿Qué fortaleza elijo la próxima semana? Opcional: compartir en stand-up de equipo.',
          },
        ],
      },
      SCIENCE_SECTION(
        'Seligman et al. (2005) mostraron que usar fortalezas signature en contextos nuevos aumenta felicidad y reduce depresión durante meses. Niemiec (2018) recomienda ciclos de activación deliberada —no solo identificar fortalezas— como ingrediente activo de intervenciones VIA. La repetición semanal construye hábito de aplicación consciente.',
      ),
    ],
  },
}

const PERMA_SLUGS = [
  'ronda-noticias',
  'cadena-agradecimiento',
  'momento-wow',
  'circulo-cierre',
  'tres-cosas-buenas',
  'saboreo-consciente',
  'bloque-enfoque',
  'mapa-fortalezas',
  'job-crafting-perma',
  'carta-primer-dia',
  'espacio-inspirador',
  'cafe-conectar',
  'mis-tres-apoyos',
  'apreciograma',
  'conversaciones-conectan',
  'perma-pulso-equipo',
  'historias-impacto',
  'mision-frase',
  'linea-vida-equipo',
  'proposito-tres-niveles',
  'elogio-constructivo',
  'bitacora-avances',
  'escalera-proyecto',
]

const FORTALEZAS_SLUGS = [
  'fc-intro',
  'fc-test-via',
  'fc-sabiduria',
  'fc-valor',
  'fc-humanidad',
  'fc-justicia',
  'fc-moderacion',
  'fc-trascendencia',
  'fc-spotting-parejas',
  'fc-feedback-fortalezas',
  'fc-matriz-uso',
  'fc-equipo-por-virtudes',
  'fc-activacion-semanal',
]

function buildActivities(slugs, newActs) {
  const A = {}
  for (const slug of slugs) {
    if (newActs[slug]) {
      A[slug] = newActs[slug]
    } else if (kitpop.A[slug]) {
      A[slug] = addScience(kitpop.A[slug], slug)
    } else {
      console.warn('Missing activity:', slug)
    }
  }
  return A
}

const ACTIVITY_PATCHES = {
  'conversaciones-conectan': (a) => {
    a.sub =
      'Duplas rotativas con preguntas graduadas en profundidad —de lo ligero a lo significativo— para construir confianza sin forzar intimidad. Basado en el principio de autorrevelación progresiva.'
    const nivel = a.secs?.find((s) => s.t === 'Preguntas por nivel')
    if (nivel) {
      nivel.rows.push({
        ic: 'heart',
        h: 'Nivel 4 · Conexión (solo equipos con confianza)',
        p: '¿Qué valor personal guía tus decisiones importantes? / ¿Qué aprendiste de alguien que te desafió? / ¿Qué te gustaría que este equipo supiera de ti que aún no sabe?',
      })
    }
    return a
  },
  'mapa-fortalezas': (a) => {
    a.sub =
      'Cada persona identifica una fortaleza VIA y la comparte con el grupo. El equipo construye un mapa de talentos y acuerda cómo alinearlo con proyectos. Recomendado tras la actividad «Test Oficial VIA».'
    return a
  },
}

function applyPatches(A, slugs) {
  for (const slug of slugs) {
    if (ACTIVITY_PATCHES[slug] && A[slug]) {
      A[slug] = ACTIVITY_PATCHES[slug](A[slug])
    }
  }
  return A
}

const permaOut = {
  CATS: {
    perma: {
      ...kitpop.CATS.perma,
      desc: 'Actividades del modelo PERMA de Seligman con fundamento científico. Filtra por P (Emociones Positivas), E (Compromiso), R (Relaciones), M (Sentido), A (Logro). Incluye rituales individuales y dinámicas de equipo.',
      acts: PERMA_SLUGS,
    },
  },
  A: applyPatches(buildActivities(PERMA_SLUGS, NEW_PERMA), PERMA_SLUGS),
}

const fortalezasOut = {
  CATS: {
    fortalezas: {
      ...kitpop.CATS.fortalezas,
      desc: 'Modelo VIA de 24 fortalezas en seis virtudes universales (Peterson & Seligman). Teoría, test oficial, intervenciones individuales y dinámicas de equipo con base en Niemiec (2018).',
      acts: FORTALEZAS_SLUGS,
    },
  },
  A: applyPatches(buildActivities(FORTALEZAS_SLUGS, NEW_FORTALEZAS), FORTALEZAS_SLUGS),
}

const outDir = join(root, 'src/data/categories')
writeFileSync(join(outDir, 'perma.json'), JSON.stringify(permaOut, null, 2) + '\n')
writeFileSync(join(outDir, 'fortalezas.json'), JSON.stringify(fortalezasOut, null, 2) + '\n')

console.log('PERMA:', PERMA_SLUGS.length, 'activities')
console.log('Fortalezas:', FORTALEZAS_SLUGS.length, 'activities')
