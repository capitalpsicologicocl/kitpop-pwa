import {
  SECTION_TYPE_OPTIONS,
  getScopeLabel,
  getSectionTypeLabel,
} from '../../utils/workspaceHelpers'

export default function WorkspaceSectionEditor({
  section,
  onChange,
  onSave,
  onDelete,
  saving,
  hasResponses,
}) {
  const config = section.config ?? {}

  function updateField(field, value) {
    onChange({ ...section, [field]: value })
  }

  function updateConfig(key, value) {
    onChange({ ...section, config: { ...config, [key]: value } })
  }

  function updateOption(index, label) {
    const options = [...(config.options ?? [])]
    options[index] = { ...options[index], label }
    updateConfig('options', options)
  }

  function addOption() {
    const options = [...(config.options ?? [])]
    options.push({ id: `opt${Date.now()}`, label: `Opción ${options.length + 1}` })
    updateConfig('options', options)
  }

  function removeOption(index) {
    updateConfig(
      'options',
      (config.options ?? []).filter((_, optionIndex) => optionIndex !== index)
    )
  }

  function updateColumn(index, field, value) {
    const columns = [...(config.columns ?? [])]
    columns[index] = { ...columns[index], [field]: value }
    updateConfig('columns', columns)
  }

  function addColumn() {
    const columns = [...(config.columns ?? [])]
    const key = `col${columns.length + 1}`
    columns.push({ key, label: `Columna ${columns.length + 1}` })
    updateConfig('columns', columns)
  }

  return (
    <article className="workspace-section-editor auth-panel">
      <div className="interactive-item-head">
        <div className="form-grid workspace-section-fields">
          <div className="field">
            <label>Título</label>
            <input
              value={section.title ?? ''}
              onChange={(event) => updateField('title', event.target.value)}
            />
          </div>

          <div className="field">
            <label>Tipo</label>
            <select
              value={section.section_type}
              onChange={(event) => updateField('section_type', event.target.value)}
              disabled={hasResponses}
            >
              {SECTION_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Alcance</label>
            <select
              value={section.scope}
              onChange={(event) => updateField('scope', event.target.value)}
              disabled={hasResponses}
            >
              <option value="individual">Individual</option>
              <option value="group">Grupal</option>
            </select>
          </div>

          {section.section_type !== 'info' && (
            <label className="workspace-inline-check field">
              <input
                type="checkbox"
                checked={section.is_required ?? true}
                onChange={(event) => updateField('is_required', event.target.checked)}
              />
              <span>Obligatoria</span>
            </label>
          )}
        </div>

        <button type="button" className="journal-delete" onClick={onDelete}>
          Eliminar
        </button>
      </div>

      <p className="interactive-item-meta">
        {getSectionTypeLabel(section.section_type)} · {getScopeLabel(section.scope)}
      </p>

      {section.section_type === 'info' && (
        <div className="field full">
          <label>Instrucciones</label>
          <textarea
            rows={4}
            value={config.content ?? ''}
            onChange={(event) => updateConfig('content', event.target.value)}
          />
        </div>
      )}

      {(section.section_type === 'single_choice' ||
        section.section_type === 'multi_choice') && (
        <div className="workspace-options-editor">
          <p className="interactive-item-meta">Alternativas</p>
          {(config.options ?? []).map((option, index) => (
            <div key={option.id} className="workspace-option-row">
              <input
                value={option.label}
                onChange={(event) => updateOption(index, event.target.value)}
              />
              <button
                type="button"
                className="timer-btn timer-btn-ghost"
                onClick={() => removeOption(index)}
              >
                Quitar
              </button>
            </div>
          ))}
          <button type="button" className="timer-btn timer-btn-secondary" onClick={addOption}>
            + Alternativa
          </button>
        </div>
      )}

      {section.section_type === 'likert' && (
        <div className="field">
          <label>Escala</label>
          <select
            value={config.scale ?? 5}
            onChange={(event) => updateConfig('scale', Number(event.target.value))}
          >
            <option value={5}>1–5</option>
            <option value={7}>1–7</option>
            <option value={10}>1–10</option>
          </select>
        </div>
      )}

      {section.section_type === 'table' && (
        <div className="workspace-table-config">
          <div className="field">
            <label>Filas</label>
            <select
              value={config.row_mode ?? 'expandable'}
              onChange={(event) => updateConfig('row_mode', event.target.value)}
            >
              <option value="expandable">Expandibles (participante agrega)</option>
              <option value="fixed">Fijas (N filas vacías)</option>
            </select>
          </div>

          {config.row_mode === 'fixed' && (
            <div className="field">
              <label>Cantidad de filas</label>
              <input
                type="number"
                min={1}
                max={20}
                value={config.fixed_row_count ?? 3}
                onChange={(event) =>
                  updateConfig('fixed_row_count', Number(event.target.value))
                }
              />
            </div>
          )}

          <p className="interactive-item-meta">Columnas</p>
          {(config.columns ?? []).map((column, index) => (
            <div key={column.key} className="workspace-option-row">
              <input
                value={column.label}
                onChange={(event) => updateColumn(index, 'label', event.target.value)}
              />
            </div>
          ))}
          <button type="button" className="timer-btn timer-btn-secondary" onClick={addColumn}>
            + Columna
          </button>
        </div>
      )}

      <button type="button" className="btn-primary" disabled={saving} onClick={onSave}>
        {saving ? 'Guardando...' : 'Guardar bloque'}
      </button>
    </article>
  )
}
