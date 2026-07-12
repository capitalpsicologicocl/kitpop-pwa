import { LIVE_POLL_TYPES, getPollStatusLabel } from '../../utils/liveHelpers'

export default function LivePollCard({
  poll,
  index,
  sessionStatus,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onOpen,
  onClose,
  results,
  isFirst,
  isLast,
  busy,
}) {
  const options = Array.isArray(poll.options) ? poll.options : []
  const isOpen = poll.status === 'open'

  function updateOption(optionIndex, value) {
    const nextOptions = options.map((option, currentIndex) =>
      currentIndex === optionIndex ? value : option
    )
    onChange({ options: nextOptions })
  }

  function addOption() {
    onChange({ options: [...options, `Opción ${options.length + 1}`] })
  }

  function removeOption(optionIndex) {
    onChange({ options: options.filter((_, currentIndex) => currentIndex !== optionIndex) })
  }

  return (
    <article className={`live-poll-card auth-panel ${isOpen ? 'is-open' : ''}`}>
      <div className="survey-question-head">
        <strong>Poll {index + 1}</strong>
        <span className="survey-question-type">{getPollStatusLabel(poll.status)}</span>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor={`poll-type-${poll.id}`}>Tipo</label>
          <select
            id={`poll-type-${poll.id}`}
            value={poll.poll_type}
            disabled={isOpen || poll.status === 'closed'}
            onChange={(event) => onChange({ pollType: event.target.value })}
          >
            {LIVE_POLL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field full">
          <label htmlFor={`poll-prompt-${poll.id}`}>Pregunta</label>
          <textarea
            id={`poll-prompt-${poll.id}`}
            rows={2}
            disabled={isOpen}
            value={poll.prompt ?? ''}
            onChange={(event) => onChange({ prompt: event.target.value })}
          />
        </div>
      </div>

      {poll.poll_type === 'single_choice' && (
        <div className="survey-options-editor">
          <p className="interactive-item-meta">Opciones de respuesta</p>
          {options.map((option, optionIndex) => (
            <div key={`${poll.id}-opt-${optionIndex}`} className="survey-option-row">
              <input
                type="text"
                disabled={isOpen}
                value={option}
                onChange={(event) => updateOption(optionIndex, event.target.value)}
              />
              <button
                type="button"
                className="journal-delete"
                disabled={isOpen}
                onClick={() => removeOption(optionIndex)}
              >
                Quitar
              </button>
            </div>
          ))}
          {!isOpen && (
            <button type="button" className="timer-btn timer-btn-ghost" onClick={addOption}>
              + Agregar opción
            </button>
          )}
        </div>
      )}

      {results && results.total > 0 && (
        <div className="live-poll-results-inline">
          <p className="interactive-item-meta">{results.total} voto{results.total === 1 ? '' : 's'}</p>
          {Object.entries(results.distribution).map(([label, count]) => (
            <div key={label} className="live-result-row">
              <span>{label}</span>
              <div className="live-result-bar-wrap">
                <div
                  className="live-result-bar"
                  style={{ width: `${results.percentages[label] ?? 0}%` }}
                />
              </div>
              <strong>
                {count} ({results.percentages[label] ?? 0}%)
              </strong>
            </div>
          ))}
        </div>
      )}

      <div className="survey-question-actions">
        {!isOpen && (
          <>
            <button
              type="button"
              className="timer-btn timer-btn-ghost"
              disabled={isFirst}
              onClick={onMoveUp}
            >
              ↑ Subir
            </button>
            <button
              type="button"
              className="timer-btn timer-btn-ghost"
              disabled={isLast}
              onClick={onMoveDown}
            >
              ↓ Bajar
            </button>
          </>
        )}

        {sessionStatus === 'live' && poll.status !== 'closed' && !isOpen && (
          <button
            type="button"
            className="btn-primary"
            disabled={busy}
            onClick={onOpen}
          >
            Abrir poll
          </button>
        )}

        {isOpen && (
          <button
            type="button"
            className="timer-btn timer-btn-secondary"
            disabled={busy}
            onClick={onClose}
          >
            Cerrar poll
          </button>
        )}

        {!isOpen && poll.status !== 'open' && (
          <button type="button" className="journal-delete" onClick={onDelete}>
            Eliminar
          </button>
        )}
      </div>
    </article>
  )
}
