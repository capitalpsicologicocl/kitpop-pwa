import {
  CUSTOM_QUESTION_TYPES,
  getLikertScaleFromType,
  getQuestionTypeLabel,
  isLikertType,
  likertTypeFromScale,
} from '../../utils/surveyHelpers'

function getAllowedTypes(survey) {
  if (survey?.survey_type === 'satisfaction') {
    const likertType = likertTypeFromScale(survey.likert_scale ?? 5)

    return CUSTOM_QUESTION_TYPES.filter(
      (type) =>
        type.value === likertType ||
        type.value === 'yes_no' ||
        type.value === 'text'
    )
  }

  return CUSTOM_QUESTION_TYPES
}

export default function SurveyQuestionEditor({
  question,
  survey,
  index,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) {
  const allowedTypes = getAllowedTypes(survey)

  return (
    <article className="survey-question-card auth-panel">
      <div className="survey-question-head">
        <strong>Pregunta {index + 1}</strong>
        <span className="survey-question-type">{getQuestionTypeLabel(question.question_type)}</span>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor={`question-type-${question.id}`}>Tipo de respuesta</label>
          <select
            id={`question-type-${question.id}`}
            value={question.question_type}
            onChange={(event) => onChange({ questionType: event.target.value })}
          >
            {allowedTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor={`question-required-${question.id}`}>Obligatoria</label>
          <select
            id={`question-required-${question.id}`}
            value={question.is_required ? 'yes' : 'no'}
            onChange={(event) =>
              onChange({ isRequired: event.target.value === 'yes' })
            }
          >
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </select>
        </div>

        <div className="field full">
          <label htmlFor={`question-prompt-${question.id}`}>Pregunta</label>
          <textarea
            id={`question-prompt-${question.id}`}
            rows={2}
            value={question.prompt ?? ''}
            onChange={(event) => onChange({ prompt: event.target.value })}
          />
        </div>
      </div>

      {isLikertType(question.question_type) && (
        <p className="survey-likert-hint">
          Escala Likert 1–{getLikertScaleFromType(question.question_type)} con etiquetas de
          satisfacción para el participante.
        </p>
      )}

      <div className="survey-question-actions">
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
        <button type="button" className="journal-delete" onClick={onDelete}>
          Eliminar pregunta
        </button>
      </div>
    </article>
  )
}
