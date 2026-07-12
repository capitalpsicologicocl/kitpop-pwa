import { formatItemTime } from '../../services/workshopService'
import { getWorkshopTimeSummary } from '../../utils/workshopHelpers'

function DeltaBadge({ delta }) {
  if (delta === 0) {
    return <span className="workshop-time-badge ok">Equilibrado</span>
  }

  if (delta > 0) {
    return (
      <span className="workshop-time-badge over">
        +{formatItemTime(delta)} sobre tiempo
      </span>
    )
  }

  return (
    <span className="workshop-time-badge under">
      {formatItemTime(Math.abs(delta))} disponible
    </span>
  )
}

export default function WorkshopTimeSummary({ sessions }) {
  const summary = getWorkshopTimeSummary(sessions)

  if (sessions.length === 0) {
    return null
  }

  return (
    <section className="auth-panel workshop-time-summary">
      <h3>Control de tiempos</h3>
      <p className="workshop-section-copy">
        Compara el tiempo programado de cada sesión con la suma de los módulos diseñados.
      </p>

      <div className="workshop-time-total">
        <div>
          <span>Total programado</span>
          <strong>{formatItemTime(summary.totalPlanned)}</strong>
        </div>
        <div>
          <span>Total diseñado</span>
          <strong>{formatItemTime(summary.totalDesigned)}</strong>
        </div>
        <div>
          <span>Balance</span>
          <DeltaBadge delta={summary.totalDelta} />
        </div>
      </div>

      <div className="workshop-time-rows">
        {summary.perSession.map((entry) => (
          <div key={entry.sessionNumber} className="workshop-time-row">
            <strong>Sesión {entry.sessionNumber}</strong>
            <span>{formatItemTime(entry.planned)} programado</span>
            <span>{formatItemTime(entry.designed)} diseñado</span>
            <DeltaBadge delta={entry.delta} />
          </div>
        ))}
      </div>
    </section>
  )
}
