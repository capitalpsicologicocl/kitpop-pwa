import { useState } from 'react'

import { SECTION_TYPE_OPTIONS } from '../../utils/workspaceHelpers'

export default function WorkspaceAddActivities({
  addingType,
  onAdd,
  showSaveAndFinish = false,
  onSaveAndFinish,
  saveAndFinishDisabled = false,
  showPublish = false,
  onPublish,
  publishDisabled = false,
  publishLabel = 'Publicar',
  workspaceStatus,
}) {
  const [expanded, setExpanded] = useState(true)

  const canPublish = workspaceStatus === 'draft' || workspaceStatus === 'paused'

  return (
    <div className="workspace-add-activities workspace-design-footer">
      <div className="workspace-add-activities-bar">
        <button
          type="button"
          className="timer-btn timer-btn-secondary"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? 'Ocultar tipos de actividad' : 'Agregar actividades'}
        </button>

        {showSaveAndFinish && (
          <button
            type="button"
            className="timer-btn timer-btn-secondary"
            disabled={saveAndFinishDisabled}
            onClick={onSaveAndFinish}
          >
            {saveAndFinishDisabled ? 'Guardando...' : 'Guardar y finalizar espacio'}
          </button>
        )}

        {showPublish && canPublish && (
          <button
            type="button"
            className="btn-primary"
            disabled={publishDisabled}
            onClick={onPublish}
          >
            {publishDisabled ? 'Publicando...' : publishLabel}
          </button>
        )}
      </div>

      {expanded && (
        <div className="workspace-add-types">
          {SECTION_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className="timer-btn timer-btn-secondary"
              disabled={addingType === option.value}
              onClick={() => onAdd(option.value)}
            >
              + {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
