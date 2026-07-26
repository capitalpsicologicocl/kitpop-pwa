import { LIKERT_SCALE_INFO, LIKERT_SCALES } from '../../utils/surveyHelpers'

export default function WorkspaceModulesSettings({
  moduleSettings,
  onChange,
  closureSectionCount,
}) {
  const closure = moduleSettings.closure_survey ?? {}
  const attendance = moduleSettings.attendance ?? {}

  function updateClosure(patch) {
    onChange({
      ...moduleSettings,
      closure_survey: { ...closure, ...patch },
    })
  }

  function updateAttendance(patch) {
    onChange({
      ...moduleSettings,
      attendance: { ...attendance, ...patch },
    })
  }

  return (
    <div className="auth-panel interactive-form workspace-modules-panel">
      <h3>Módulos opcionales</h3>
      <p className="field-hint">
        Activa funciones extra que controlas desde el panel en vivo.
      </p>

      <div className="workspace-module-card">
        <label className="workspace-field-check">
          <input
            type="checkbox"
            checked={Boolean(closure.enabled)}
            onChange={(event) => updateClosure({ enabled: event.target.checked })}
          />
          <span>Encuesta de satisfacción al cierre</span>
        </label>
        <p className="field-hint">
          Usa la plantilla KitPOP (notas Likert, sí/no y comentarios). Los participantes la ven
          solo cuando tú la actives en el panel en vivo.
        </p>

        {closure.enabled && (
          <div className="field">
            <label htmlFor="closure-likert">Escala Likert</label>
            <select
              id="closure-likert"
              value={closure.likert_scale ?? 5}
              onChange={(event) => updateClosure({ likert_scale: Number(event.target.value) })}
            >
              {LIKERT_SCALES.map((scale) => (
                <option key={scale} value={scale}>
                  {LIKERT_SCALE_INFO[scale]?.label ?? `Escala 1–${scale}`}
                </option>
              ))}
            </select>
            {closureSectionCount > 0 && (
              <p className="field-hint">{closureSectionCount} preguntas listas al final.</p>
            )}
          </div>
        )}
      </div>

      <div className="workspace-module-card">
        <label className="workspace-field-check">
          <input
            type="checkbox"
            checked={Boolean(attendance.enabled)}
            onChange={(event) => updateAttendance({ enabled: event.target.checked })}
          />
          <span>Registro de asistencia</span>
        </label>
        <p className="field-hint">
          Los participantes con login completan nombre, apellido, RUT y cargo. Tú disparas el
          popup desde el panel en vivo cuando lo indiques.
        </p>
      </div>

      <p className="field-hint workspace-modules-save-note">
        Después de cambiar estos módulos, pulsa <strong>Guardar datos</strong> en la sección superior.
      </p>
    </div>
  )
}
