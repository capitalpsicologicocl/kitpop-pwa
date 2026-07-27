import { LIKERT_SCALE_INFO, LIKERT_SCALES, SATISFACTION_TEMPLATE_ITEMS } from '../../utils/surveyHelpers'

export default function WorkspaceClosureSurveyPreview({ likertScale = 5, questionCount = 0 }) {
  const scaleLabel = LIKERT_SCALE_INFO[likertScale]?.label ?? `Escala 1–${likertScale}`

  return (
    <div className="workspace-closure-preview auth-panel">
      <h4>Encuesta de satisfacción (plantilla KitPOP)</h4>
      <p className="field-hint">
        No se edita pregunta por pregunta: usa la plantilla estándar de KitPOP con escala{' '}
        <strong>{scaleLabel}</strong>.
        {questionCount > 0
          ? ` ${questionCount} preguntas ya están cargadas en este espacio.`
          : ' Agrégala desde Diseño → Agregar actividades → Encuesta de satisfacción.'}
      </p>

      <ol className="workspace-closure-preview-list">
        {SATISFACTION_TEMPLATE_ITEMS.map((item, index) => (
          <li key={index}>
            <span className="workspace-closure-preview-kind">
              {item.kind === 'likert'
                ? scaleLabel
                : item.kind === 'yes_no'
                  ? 'Sí / No'
                  : 'Texto libre'}
            </span>
            {item.prompt}
          </li>
        ))}
      </ol>

      <div className="workspace-closure-preview-steps">
        <p className="field-hint">
          <strong>Facilitador:</strong> activa la encuesta en Panel en vivo → Activar encuesta de
          cierre, después de que los participantes pulsen{' '}
          <strong>Finalizar panel de participación</strong>.
        </p>
        <p className="field-hint">
          Escala Likert configurable al agregar la encuesta ({LIKERT_SCALES.join(', ')} puntos).
        </p>
      </div>
    </div>
  )
}
