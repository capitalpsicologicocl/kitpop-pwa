import { Link } from 'react-router-dom'

import {
  formatItemTime,
  formatSessionDuration,
} from '../../services/workshopService'
import {
  getPauseLabel,
  isWorkshopOpeningItem,
  ITEM_TYPE_LABELS,
} from '../../utils/workshopHelpers'

export default function WorkshopSummarySessionTable({ session }) {
  const items = session.workshop_items ?? []

  return (
    <div className="workshop-summary-table-wrap">
      <table className="workshop-session-table workshop-summary-table">
        <thead>
          <tr>
            <th>Tiempo</th>
            <th>Actividad / módulo</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={3}>Sin ítems en esta sesión.</td>
            </tr>
          ) : (
            items.map((item) => {
              const isOpening = isWorkshopOpeningItem(item)
              const typeLabel =
                item.item_type === 'pause'
                  ? getPauseLabel(item.pause_type)
                  : ITEM_TYPE_LABELS[item.item_type]
              const showActivityLink =
                item.item_type === 'activity' &&
                item.activity_slug &&
                !isOpening

              return (
                <tr key={item.id}>
                  <td data-label="Tiempo">{formatItemTime(item.time_minutes)}</td>
                  <td data-label="Actividad / módulo">
                    <strong>{item.title}</strong>
                    <br />
                    <small>{typeLabel}</small>
                    {showActivityLink && (
                      <Link
                        to={`/actividad/${item.activity_slug}`}
                        className="workshop-summary-activity-link"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir guía y temporizador ↗
                      </Link>
                    )}
                  </td>
                  <td data-label="Descripción">{item.description || '—'}</td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export function WorkshopSummarySessionMeta({ session }) {
  const designed = formatItemTime(
    (session.workshop_items ?? []).reduce(
      (total, item) => total + (item.time_minutes ?? 0),
      0
    )
  )

  return (
    <p className="interactive-item-meta workshop-summary-session-meta">
      Tiempo programado: {formatSessionDuration(session.duration_hours, session.duration_minutes)}
      {' · '}
      Tiempo diseñado: {designed}
    </p>
  )
}
