import { useEffect, useRef, useState } from 'react'

import { parseTimerMinutes } from '../../utils/activityContent'

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function ActivityTimer({ metas = [] }) {
  const initialMinutes = parseTimerMinutes(metas)
  const [minutes, setMinutes] = useState(initialMinutes)
  const [remaining, setRemaining] = useState(initialMinutes * 60)
  const timerRef = useRef(null)

  useEffect(() => {
    setMinutes(initialMinutes)
    setRemaining(initialMinutes * 60)
  }, [initialMinutes])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  function pauseTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  function startTimer() {
    if (timerRef.current) {
      return
    }

    const nextRemaining = Number(minutes) * 60
    setRemaining(nextRemaining)

    timerRef.current = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          pauseTimer()
          window.alert('Tiempo finalizado')
          return 0
        }

        return current - 1
      })
    }, 1000)
  }

  function handleMinutesChange(event) {
    const value = Number(event.target.value)
    setMinutes(value)
    setRemaining(value * 60)
    pauseTimer()
  }

  return (
    <div className="activity-pane">
      <div className="activity-timer">
        <div className="activity-clock">
          {formatClock(remaining)}
        </div>

        <div className="activity-timer-body">
          <h3>Temporizador integrado</h3>
          <p>Ajusta el tiempo y facilita sin salir de la actividad.</p>

          <div className="timer-controls">
            <input
              type="number"
              min="1"
              value={minutes}
              onChange={handleMinutesChange}
            />

            <button type="button" className="btn-primary" onClick={startTimer}>
              Iniciar
            </button>

            <button type="button" className="btn-secondary" onClick={pauseTimer}>
              Pausar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
