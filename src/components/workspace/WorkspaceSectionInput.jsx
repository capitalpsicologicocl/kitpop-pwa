import { getLikertLabel } from '../../utils/surveyHelpers'
import {
  emptyTableRows,
  normalizeTableValue,
} from '../../utils/workspaceHelpers'

function LikertInput({ scale, value, onChange, disabled, name }) {
  const values = Array.from({ length: scale }, (_, index) => index + 1)

  return (
    <div className="survey-likert-input">
      {values.map((score) => (
        <label key={score} className="survey-likert-option">
          <input
            type="radio"
            name={name}
            value={score}
            checked={Number(value) === score}
            disabled={disabled}
            onChange={() => onChange(score)}
          />
          <span className="survey-likert-score">{score}</span>
          <span className="survey-likert-label">{getLikertLabel(scale, score)}</span>
        </label>
      ))}
    </div>
  )
}

export default function WorkspaceSectionInput({
  section,
  value,
  onChange,
  disabled = false,
}) {
  const config = section.config ?? {}

  if (section.section_type === 'info') {
    return <div className="workspace-info-block">{config.content}</div>
  }

  if (section.section_type === 'text_short') {
    return (
      <input
        type="text"
        value={value?.text ?? ''}
        disabled={disabled}
        onChange={(event) => onChange({ text: event.target.value })}
      />
    )
  }

  if (section.section_type === 'text_long') {
    return (
      <textarea
        rows={4}
        value={value?.text ?? ''}
        disabled={disabled}
        onChange={(event) => onChange({ text: event.target.value })}
      />
    )
  }

  if (section.section_type === 'single_choice') {
    return (
      <div className="workspace-choice-list">
        {(config.options ?? []).map((option) => (
          <label key={option.id} className="workspace-choice-item">
            <input
              type="radio"
              name={`choice-${section.id}`}
              checked={value?.choice === option.id}
              disabled={disabled}
              onChange={() => onChange({ choice: option.id })}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    )
  }

  if (section.section_type === 'multi_choice') {
    const selected = new Set(value?.choices ?? [])

    return (
      <div className="workspace-choice-list">
        {(config.options ?? []).map((option) => (
          <label key={option.id} className="workspace-choice-item">
            <input
              type="checkbox"
              checked={selected.has(option.id)}
              disabled={disabled}
              onChange={(event) => {
                const next = new Set(selected)

                if (event.target.checked) {
                  next.add(option.id)
                } else {
                  next.delete(option.id)
                }

                onChange({ choices: [...next] })
              }}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    )
  }

  if (section.section_type === 'boolean') {
    return (
      <div className="workspace-choice-list">
        <label className="workspace-choice-item">
          <input
            type="radio"
            name={`bool-${section.id}`}
            checked={value?.value === true}
            disabled={disabled}
            onChange={() => onChange({ value: true })}
          />
          <span>{config.true_label ?? 'Sí'}</span>
        </label>
        <label className="workspace-choice-item">
          <input
            type="radio"
            name={`bool-${section.id}`}
            checked={value?.value === false}
            disabled={disabled}
            onChange={() => onChange({ value: false })}
          />
          <span>{config.false_label ?? 'No'}</span>
        </label>
      </div>
    )
  }

  if (section.section_type === 'likert') {
    const scale = config.scale ?? 5

    return (
      <LikertInput
        scale={scale}
        name={`likert-${section.id}`}
        value={value?.score ?? ''}
        disabled={disabled}
        onChange={(score) => onChange({ score })}
      />
    )
  }

  if (section.section_type === 'table') {
    const tableValue = normalizeTableValue(section, value)
    const columns = config.columns ?? []
    const canAddRows = config.row_mode !== 'fixed' && !disabled

    function updateCell(rowIndex, key, cellValue) {
      const rows = tableValue.rows.map((row, index) =>
        index === rowIndex ? { ...row, [key]: cellValue } : row
      )
      onChange({ rows })
    }

    function addRow() {
      onChange({ rows: [...tableValue.rows, ...emptyTableRows(section).slice(0, 1)] })
    }

    function removeRow(rowIndex) {
      if (tableValue.rows.length <= 1) {
        return
      }

      onChange({ rows: tableValue.rows.filter((_, index) => index !== rowIndex) })
    }

    return (
      <div className="workspace-table-wrap">
        <table className="workspace-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              {canAddRows && <th aria-label="Acciones" />}
            </tr>
          </thead>
          <tbody>
            {tableValue.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={column.key}>
                    <input
                      type="text"
                      value={row[column.key] ?? ''}
                      disabled={disabled}
                      onChange={(event) => updateCell(rowIndex, column.key, event.target.value)}
                    />
                  </td>
                ))}
                {canAddRows && (
                  <td>
                    <button
                      type="button"
                      className="timer-btn timer-btn-ghost"
                      onClick={() => removeRow(rowIndex)}
                    >
                      Quitar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {canAddRows && (
          <button type="button" className="timer-btn timer-btn-secondary" onClick={addRow}>
            + Agregar fila
          </button>
        )}
      </div>
    )
  }

  return null
}
