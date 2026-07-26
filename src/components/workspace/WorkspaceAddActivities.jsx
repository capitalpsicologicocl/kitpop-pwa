import { useState } from 'react'

import { SECTION_TYPE_OPTIONS } from '../../utils/workspaceHelpers'

export default function WorkspaceAddActivities({
  addingType,
  onAdd,
  compact = false,
  showPublish = false,
  onPublish,
  publishDisabled = false,
  publishLabel = 'Publicar espacio de trabajo',
  workspaceStatus,
}) {
  const [expanded, setExpanded] = useState(!compact)

  const canPublish = workspaceStatus === 'draft' || workspaceStatus === 'paused'

  return (
    <div className={`workspace-add-activities ${compact ? 'is-compact' : ''}`}>
      <div className="workspace-add-activities-bar">
        <button
          type="button"
          className="timer-btn timer-btn-secondary"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? 'Ocultar tipos de actividad' : 'Agregar actividades'}
        </button>

        {showPublish && canPublish && (
          <button
            type="button"
            className="btn-primary"
            disabled={publishDisabled}
            onClick={onPublish}
          >
            {publishLabel}
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
