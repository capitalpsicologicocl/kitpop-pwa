import { useState } from 'react'

import { submitSurveyAnswers } from '../../services/surveyService'
import {
  getLikertLabel,
  getLikertScaleFromType,
  isLikertType,
} from '../../utils/surveyHelpers'

function LikertScaleInput({ questionType, value, onChange, name }) {
  const scale = getLikertScaleFromType(questionType)
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
            onChange={() => onChange(String(score))}
          />
          <span className="survey-likert-score">{score}</span>
          <span className="survey-likert-label">{getLikertLabel(scale, score)}</span>
        </label>
      ))}
    </div>
  )
}

export default function SurveyParticipantForm({ survey, participantToken, code, onSubmitted }) {
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const questions = survey.questions ?? []

  function setAnswer(questionId, value, kind = 'text') {
    setAnswers((current) => ({
      ...current,
      [questionId]:
        kind === 'number'
          ? { answer_number: value, answer_text: null }
          : { answer_text: value, answer_number: null },
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    for (const question of questions) {
      if (!question.is_required) {
        continue
      }

      const answer = answers[question.id]

      if (isLikertType(question.question_type)) {
        if (!answer?.answer_number) {
          setError(`Responde la pregunta: ${question.prompt}`)
          return
        }
      } else if (!answer?.answer_text) {
        setError(`Responde la pregunta: ${question.prompt}`)
        return
      }
    }

    setSubmitting(true)

    try {
      const payload = questions.map((question) => {
        const answer = answers[question.id] ?? {}

        return {
          question_id: question.id,
          answer_text: answer.answer_text ?? null,
          answer_number: answer.answer_number ?? null,
        }
      })

      await submitSurveyAnswers(code, participantToken, payload)
      onSubmitted()
    } catch (submitError) {
      setError(submitError.message || 'No se pudieron enviar las respuestas.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="survey-participant-form" onSubmit={handleSubmit}>
      {survey.description && <p className="participant-copy">{survey.description}</p>}

      {questions.map((question, index) => (
        <fieldset key={question.id} className="survey-participant-question">
          <legend>
            {index + 1}. {question.prompt}
            {question.is_required && <span className="survey-required"> *</span>}
          </legend>

          {question.question_type === 'text' && (
            <textarea
              rows={3}
              value={answers[question.id]?.answer_text ?? ''}
              onChange={(event) => setAnswer(question.id, event.target.value)}
            />
          )}

          {isLikertType(question.question_type) && (
            <LikertScaleInput
              questionType={question.question_type}
              name={`likert-${question.id}`}
              value={answers[question.id]?.answer_number ?? ''}
              onChange={(value) => setAnswer(question.id, value, 'number')}
            />
          )}

          {question.question_type === 'yes_no' && (
            <div className="survey-choice-list">
              {['Sí', 'No'].map((option) => (
                <label key={option} className="survey-choice-item">
                  <input
                    type="radio"
                    name={`yesno-${question.id}`}
                    checked={answers[question.id]?.answer_text === option}
                    onChange={() => setAnswer(question.id, option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
      ))}

      {error && <div className="auth-message error">{error}</div>}

      <button type="submit" className="btn-primary" disabled={submitting || questions.length === 0}>
        {submitting ? 'Enviando...' : 'Enviar respuestas'}
      </button>
    </form>
  )
}
