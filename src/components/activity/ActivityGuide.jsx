import { formatPlenaryQuestion } from '../../utils/activityContent'

export default function ActivityGuide({ kitpop }) {
  const sections = kitpop.secs ?? []
  const materials = kitpop.mat ?? []
  const plenary = kitpop.plen ?? []
  const hasContent = materials.length > 0 || sections.length > 0 || plenary.length > 0

  if (!hasContent) {
    return (
      <div className="activity-pane">
        <div className="content-card">
          <p>Contenido en preparación.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="activity-pane">
      <div className="content-grid">
        {materials.length > 0 && (
          <div className="content-card full">
            <h3>Materiales</h3>
            <div className="materials-grid">
              {materials.map((item) => (
                <div key={item} className="material-item">
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {sections.map((section) => (
          <div key={section.t} className="content-card full">
            <h3>{section.t}</h3>

            {(section.rows ?? []).map((row) => (
              <div key={`${section.t}-${row.h}`} className="row-item">
                <h4>{row.h}</h4>
                <p>{row.p}</p>
              </div>
            ))}

            {section.cita && (
              <div className="quote-block">{section.cita}</div>
            )}
          </div>
        ))}

        {plenary.length > 0 && (
          <div className="content-card full">
            <h3>Preguntas para plenaria</h3>
            <ol>
              {plenary.map((question) => (
                <li key={formatPlenaryQuestion(question)}>
                  {formatPlenaryQuestion(question)}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
