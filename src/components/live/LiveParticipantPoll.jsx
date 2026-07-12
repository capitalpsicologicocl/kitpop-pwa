import { useState } from 'react'

import { submitLivePollVote } from '../../services/liveSessionService'
import { getPollChoices } from '../../utils/liveHelpers'

export default function LiveParticipantPoll({ liveSession, code, participantToken, onVoted }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const poll = liveSession.active_poll
  const votedIds = liveSession.voted_poll_ids ?? []
  const alreadyVoted = votedIds.includes(poll?.id)

  if (!poll) {
    return (
      <p className="participant-copy participant-wait">
        Esperando la siguiente pregunta del facilitador...
      </p>
    )
  }

  if (alreadyVoted) {
    return (
      <p className="participant-copy">
        Tu voto fue registrado. Espera la siguiente pregunta.
      </p>
    )
  }

  const choices = getPollChoices(poll)

  async function handleVote(answer) {
    setSubmitting(true)
    setError('')

    try {
      await submitLivePollVote(code, poll.id, participantToken, answer)
      onVoted(poll.id)
    } catch (voteError) {
      setError(voteError.message || 'No se pudo registrar tu voto.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="live-participant-poll">
      <h2>{poll.prompt}</h2>

      <div className="survey-choice-list">
        {choices.map((choice) => (
          <button
            key={choice}
            type="button"
            className="live-vote-btn"
            disabled={submitting}
            onClick={() => handleVote(choice)}
          >
            {choice}
          </button>
        ))}
      </div>

      {error && <div className="auth-message error">{error}</div>}
    </div>
  )
}
