const DEFAULT_STEPS = [
  { id: 'prepare', label: 'Preparando datos' },
  { id: 'catalog', label: 'Consultando catálogo KitPOP' },
  { id: 'generate', label: 'Generando propuesta con IA' },
]

export default function AiProgressPanel({
  steps = DEFAULT_STEPS,
  activeStep = 0,
  title = 'Procesando con IA…',
}) {
  const progress = Math.min(
    100,
    Math.round(((activeStep + 1) / steps.length) * 100)
  )

  return (
    <div className="ai-progress-panel" role="status" aria-live="polite">
      <div className="ai-progress-head">
        <strong>{title}</strong>
        <span>{progress}%</span>
      </div>

      <div className="ai-progress-track" aria-hidden="true">
        <div className="ai-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <ol className="ai-progress-steps">
        {steps.map((step, index) => {
          const state =
            index < activeStep ? 'done' : index === activeStep ? 'active' : 'pending'

          return (
            <li key={step.id} className={`ai-progress-step ai-progress-step--${state}`}>
              <span className="ai-progress-dot" aria-hidden="true" />
              <span>{step.label}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export const DOCUMENT_PARSE_STEPS = [
  { id: 'read', label: 'Leyendo archivo' },
  { id: 'analyze', label: 'Analizando contenido con IA' },
  { id: 'extract', label: 'Extrayendo estructura del taller' },
]

export const WORKSHOP_GENERATE_STEPS = [
  { id: 'save', label: 'Guardando datos del taller' },
  { id: 'catalog', label: 'Consultando catálogo KitPOP' },
  { id: 'generate', label: 'Generando propuesta con IA' },
]
