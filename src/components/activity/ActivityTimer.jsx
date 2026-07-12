import { useEffect, useRef, useState } from 'react'

import { parseTimerMinutes } from '../../utils/activityContent'

const MIN_MINUTES = 1
const MAX_MINUTES = 180

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function clampMinutes(value) {
  return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, value))
}

export default function ActivityTimer({ metas = [] }) {
  const suggestedMinutes = parseTimerMinutes(metas)
  const [minutes, setMinutes] = useState(suggestedMinutes)
  const [remaining, setRemaining] = useState(suggestedMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    setMinutes(suggestedMinutes)
    setRemaining(suggestedMinutes * 60)
    setIsRunning(false)
    setFinished(false)
    pauseTimer()
  }, [suggestedMinutes])

  useEffect(() => {
    return () => {
      pauseTimer()
    }
  }, [])

  function pauseTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setIsRunning(false)
  }

  function applyMinutes(nextMinutes) {
    const value = clampMinutes(nextMinutes)
    setMinutes(value)
    setRemaining(value * 60)
    setFinished(false)
    pauseTimer()
  }

  function startTimer() {
    if (timerRef.current) {
      return
    }

    if (remaining <= 0) {
      setRemaining(minutes * 60)
    }

    setFinished(false)
    setIsRunning(true)

    timerRef.current = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          pauseTimer()
          setFinished(true)
          return 0
        }

        return current - 1
      })
    }, 1000)
  }

  function resetTimer() {
    pauseTimer()
    setFinished(false)
    setRemaining(minutes * 60)
  }

  function handleMinutesInput(event) {
    applyMinutes(Number(event.target.value) || MIN_MINUTES)
  }

  const isUrgent = isRunning && remaining > 0 && remaining <= 60
  const isCustomDuration = minutes !== suggestedMinutes

  return (
    <div
      className={`activity-timer-bar ${isRunning ? 'running' : ''} ${isUrgent ? 'urgent' : ''} ${finished ? 'finished' : ''}`}
      aria-label="Temporizador de actividad"
    >
      <div className="activity-timer-bar-main">
        <div className="activity-timer-block">
          <span className="activity-timer-label">Tiempo restante</span>
          <span className="activity-timer-clock" aria-live="polite">
            {formatClock(remaining)}
          </span>
          <span className="activity-timer-hint">min : seg</span>
        </div>

        <div className="activity-timer-block activity-timer-duration">
          <span className="activity-timer-label">Duración (minutos)</span>

          <div className="activity-timer-stepper">
            <button
              type="button"
              className="timer-step-btn"
              onClick={() => applyMinutes(minutes - 1)}
              disabled={isRunning || minutes <= MIN_MINUTES}
              aria-label="Disminuir minutos"
            >
              −
            </button>

            <input
              type="number"
              min={MIN_MINUTES}
              max={MAX_MINUTES}
              value={minutes}
              onChange={handleMinutesInput}
              disabled={isRunning}
              aria-label="Minutos de duración"
            />

            <button
              type="button"
              className="timer-step-btn"
              onClick={() => applyMinutes(minutes + 1)}
              disabled={isRunning || minutes >= MAX_MINUTES}
              aria-label="Aumentar minutos"
            >
              +
            </button>

            <span className="activity-timer-unit">minutos</span>
          </div>

          <span className="activity-timer-suggested">
            Sugerido por actividad: {suggestedMinutes} min
            {isCustomDuration ? ' · ajustado por ti' : ''}
          </span>
        </div>
      </div>

      <div className="activity-timer-actions">
        {!isRunning ? (
          <button type="button" className="timer-btn timer-btn-primary" onClick={startTimer}>
            Iniciar
          </button>
        ) : (
          <button type="button" className="timer-btn timer-btn-secondary" onClick={pauseTimer}>
            Pausar
          </button>
        )}

        <button type="button" className="timer-btn timer-btn-ghost" onClick={resetTimer}>
          Reiniciar
        </button>
      </div>

      {finished && (
        <p className="activity-timer-done" role="status">
          Tiempo finalizado
        </p>
      )}
    </div>
  )
}
