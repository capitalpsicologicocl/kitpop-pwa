import { useState } from 'react'

import { ADD_ACTIVITY_MENU_OPTIONS } from '../../utils/workspaceHelpers'

export default function WorkspaceAddActivities({
  addingType,
  onAdd,
  onSave,
  onFinish,
  saving = false,
  moduleSettings,
}) {
  const [expanded, setExpanded] = useState(false)

  const closureEnabled = Boolean(moduleSettings?.closure_survey?.enabled)
  const attendanceEnabled = Boolean(moduleSettings?.attendance?.enabled)

  function handleOptionClick(option) {
    onAdd(option)
    setExpanded(false)
  }

  return (
    <div className="workspace-add-activities workspace-design-footer">
      <div className="workspace-footer-actions">
        <button
          type="button"
          className="workspace-footer-btn workspace-footer-btn-secondary"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          Agregar actividades
        </button>

        <button
          type="button"
          className="workspace-footer-btn workspace-footer-btn-secondary"
          disabled={saving}
          onClick={onSave}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>

        <button
          type="button"
          className="workspace-footer-btn workspace-footer-btn-primary"
          disabled={saving}
          onClick={onFinish}
        >
          Finalizar
        </button>
      </div>

      {expanded && (
        <div className="workspace-add-types">
          {ADD_ACTIVITY_MENU_OPTIONS.map((option) => {
            const isModuleOn =
              (option.value === 'closure_survey' && closureEnabled) ||
              (option.value === 'attendance' && attendanceEnabled)
            const isLoading = addingType === option.value

            return (
              <button
                key={`${option.kind}-${option.value}`}
                type="button"
                className="workspace-add-type-btn"
                disabled={isLoading || (option.kind === 'module' && isModuleOn)}
                onClick={() => handleOptionClick(option)}
              >
                + {option.label}
                {isModuleOn ? ' ✓' : ''}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
