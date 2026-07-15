import { extractScienceRows } from '../../utils/activityContent'

export default function ActivityScience({ kitpop }) {
  const rows = extractScienceRows(kitpop.secs ?? [])

  return (
    <div className="activity-pane">
      <div className="content-card">
        <h3>Evidencia y fundamento</h3>

        {rows.length > 0 ? (
          rows.map((row) => (
            <div key={row.h} className="row-item">
              <h4>{row.h}</h4>
              <p>{row.p}</p>
            </div>
          ))
        ) : (
          <p>
            La actividad conserva el fundamento y las orientaciones técnicas
            incluidas en su guía completa.
          </p>
        )}
      </div>
    </div>
  )
}
