import { parseWorkshopObjectiveText } from '../../utils/workshopHelpers'

function TextBlock({ children, className = '' }) {
  if (!children?.trim()) {
    return null
  }

  return <p className={`workshop-objective-text ${className}`.trim()}>{children.trim()}</p>
}

export default function WorkshopObjectiveSections({ objective }) {
  const parsed = parseWorkshopObjectiveText(objective)

  if (!parsed) {
    return null
  }

  if (!parsed.hasStructure) {
    return (
      <section className="workshop-summary-objective">
        <h2>Descripción y objetivos del taller</h2>
        <TextBlock>{parsed.generalDescription}</TextBlock>
      </section>
    )
  }

  return (
    <section className="workshop-summary-objective">
      {parsed.generalDescription && (
        <div className="workshop-objective-block">
          <h2>Descripción general</h2>
          <TextBlock>{parsed.generalDescription}</TextBlock>
        </div>
      )}

      {parsed.modules.length > 0 && (
        <div className="workshop-objective-block">
          <h2>Contenidos por módulo</h2>
          <div className="workshop-module-grid">
            {parsed.modules.map((module) => (
              <article
                key={`${module.moduleNumber}-${module.title}`}
                className="workshop-module-card"
              >
                <h3>
                  Módulo {module.moduleNumber}
                  {module.title ? `: ${module.title}` : ''}
                </h3>
                {module.durationMinutes != null && (
                  <p className="workshop-module-meta">
                    Duración sugerida: {module.durationMinutes} min
                  </p>
                )}
                {module.objectives && (
                  <>
                    <h4>Objetivos</h4>
                    <TextBlock>{module.objectives}</TextBlock>
                  </>
                )}
                {module.contents && (
                  <>
                    <h4>Contenidos</h4>
                    <TextBlock>{module.contents}</TextBlock>
                  </>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      {parsed.programSummary && (
        <div className="workshop-objective-block">
          <h2>Resumen del programa</h2>
          <TextBlock>{parsed.programSummary}</TextBlock>
        </div>
      )}
    </section>
  )
}
