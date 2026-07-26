import RichTextEditor from '../ui/RichTextEditor'
import {
  SECTION_TYPE_OPTIONS,
  getScopeLabel,
  getSectionTypeLabel,
  resolveSectionModuleName,
} from '../../utils/workspaceHelpers'

export default function WorkspaceSectionEditor({
  section,
  sectionIndex,
  sections,
  onChange,
  onSave,
  onDelete,
  saving,
  hasResponses,
}) {
  const config = section.config ?? {}
  const previousModule =
    sectionIndex > 0 ? resolveSectionModuleName(sections, sectionIndex - 1) : ''
  const effectiveModule = resolveSectionModuleName(sections, sectionIndex)
  const moduleContinues = Boolean(config.module_continue) && sectionIndex > 0

  function updateField(field, value) {
    onChange({ ...section, [field]: value })
  }

  function updateConfig(key, value) {
    onChange({ ...section, config: { ...config, [key]: value } })
  }

  function updatePrompt(value) {
    const nextConfig = { ...config, prompt: value }

    if (section.section_type === 'info') {
      nextConfig.content = value
    }

    onChange({ ...section, config: nextConfig })
  }

  function handleModuleContinueChange(checked) {
    onChange({
      ...section,
      config: {
        ...config,
        module_continue: checked,
        module_name: checked ? config.module_name : config.module_name || previousModule || 'Módulo 1',
      },
    })
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
      <div className="interactive-item-head workspace-section-editor-head">
        <div className="workspace-section-order">
          <span className="profile-badge">Actividad {sectionIndex + 1}</span>
          <p className="interactive-item-meta">
            {getSectionTypeLabel(section.section_type)} · {getScopeLabel(section.scope)}
            {moduleContinues ? ` · ${effectiveModule}` : ''}
          </p>
        </div>

        <button type="button" className="journal-delete" onClick={onDelete}>
          Eliminar
        </button>
      </div>

      <div className="workspace-design-form form-grid">
        <div className="workspace-design-block field full">
          <span className="workspace-design-block-label">Módulo</span>

          {sectionIndex > 0 ? (
            <label className="workspace-field-check">
              <input
                type="checkbox"
                checked={moduleContinues}
                onChange={(event) => handleModuleContinueChange(event.target.checked)}
              />
              <span>
                Continuidad del módulo anterior
                {previousModule ? ` (${previousModule})` : ''}
              </span>
            </label>
          ) : null}

          {moduleContinues ? (
            <p className="field-hint workspace-module-resolved">
              Módulo activo: <strong>{effectiveModule}</strong>
            </p>
          ) : (
            <div className="field full">
              <label htmlFor={`module-${section.id}`}>Nombre del módulo</label>
              <input
                id={`module-${section.id}`}
                value={config.module_name ?? ''}
                onChange={(event) => updateConfig('module_name', event.target.value)}
                placeholder="Ej. Módulo 1 — Diagnóstico"
              />
            </div>
          )}
        </div>

        <div className="field full">
          <label htmlFor={`activity-title-${section.id}`}>Título de la actividad</label>
          <input
            id={`activity-title-${section.id}`}
            value={section.title ?? ''}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Ej. Mapa de stakeholders"
          />
        </div>

        <div className="field full">
          <label htmlFor={`description-${section.id}`}>Descripción</label>
          <RichTextEditor
            id={`description-${section.id}`}
            value={config.description ?? ''}
            onChange={(value) => updateConfig('description', value)}
            placeholder="Contexto breve para el participante (opcional)."
            minHeight={100}
          />
        </div>

        <div className="field full">
          <label htmlFor={`prompt-${section.id}`}>
            {section.section_type === 'info' ? 'Instrucciones' : 'Pregunta o actividad'}
          </label>
          <RichTextEditor
            id={`prompt-${section.id}`}
            value={config.prompt ?? config.content ?? ''}
            onChange={updatePrompt}
            placeholder={
              section.section_type === 'info'
                ? 'Texto que verán los participantes en este bloque.'
                : 'Enunciado de la pregunta o consigna de la actividad.'
            }
            minHeight={140}
          />
        </div>

        <div className="field">
          <label htmlFor={`type-${section.id}`}>Tipo de respuesta</label>
          <select
            id={`type-${section.id}`}
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
          <label htmlFor={`scope-${section.id}`}>Alcance</label>
          <select
            id={`scope-${section.id}`}
            value={section.scope}
            onChange={(event) => updateField('scope', event.target.value)}
            disabled={hasResponses}
          >
            <option value="individual">Individual</option>
            <option value="group">Grupal</option>
          </select>
        </div>

        {section.section_type !== 'info' && (
          <div className="field full">
            <label className="workspace-field-check">
              <input
                type="checkbox"
                checked={section.is_required ?? true}
                onChange={(event) => updateField('is_required', event.target.checked)}
              />
              <span>Actividad obligatoria</span>
            </label>
          </div>
        )}
      </div>

      {(section.section_type === 'single_choice' ||
        section.section_type === 'multi_choice') && (
        <div className="workspace-options-editor form-grid">
          <div className="field full">
            <label>Alternativas de respuesta</label>
            {(config.options ?? []).map((option, index) => (
              <div key={option.id} className="workspace-option-row">
                <input
                  value={option.label}
                  onChange={(event) => updateOption(index, event.target.value)}
                  placeholder={`Alternativa ${index + 1}`}
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
        </div>
      )}

      {section.section_type === 'likert' && (
        <div className="field workspace-type-extra">
          <label>Escala Likert</label>
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
        <div className="workspace-table-config form-grid">
          <div className="field">
            <label>Filas de la tabla</label>
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

          <div className="field full">
            <label>Columnas</label>
            {(config.columns ?? []).map((column, index) => (
              <div key={column.key} className="workspace-option-row">
                <input
                  value={column.label}
                  onChange={(event) => updateColumn(index, 'label', event.target.value)}
                  placeholder={`Columna ${index + 1}`}
                />
              </div>
            ))}
            <button type="button" className="timer-btn timer-btn-secondary" onClick={addColumn}>
              + Columna
            </button>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn-primary" disabled={saving} onClick={onSave}>
          {saving ? 'Guardando...' : 'Guardar actividad'}
        </button>
      </div>
    </article>
  )
}
