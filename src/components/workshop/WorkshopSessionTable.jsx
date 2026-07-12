import { Link } from 'react-router-dom'

import { formatItemTime } from '../../services/workshopService'

export default function WorkshopSessionTable({
  session,
  onAddTheory,
  onAddActivity,
  onSwapActivity,
  onUpdateItem,
  onDeleteItem,
}) {
  const items = session.workshop_items ?? []

  return (
    <div className="workshop-session-table-wrap">
      <table className="workshop-session-table">
        <thead>
          <tr>
            <th>Tiempo</th>
            <th>Actividad / módulo</th>
            <th>Descripción</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="workshop-empty-row">
                Agrega contenido teórico o una actividad del banco KitPOP.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td data-label="Tiempo">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    className="workshop-time-input"
                    value={item.time_minutes ?? 0}
                    onChange={(event) =>
                      onUpdateItem(item.id, {
                        timeMinutes: Math.max(0, Number(event.target.value) || 0),
                      })
                    }
                  />
                  <span className="workshop-time-unit">min</span>
                  <small>{formatItemTime(item.time_minutes)}</small>
                </td>

                <td data-label="Actividad / módulo">
                  <input
                    type="text"
                    className="workshop-cell-input"
                    value={item.title ?? ''}
                    onChange={(event) =>
                      onUpdateItem(item.id, { title: event.target.value })
                    }
                  />
                  {item.item_type === 'activity' && item.activity_slug && (
                    <Link
                      to={`/actividad/${item.activity_slug}`}
                      className="workshop-activity-link"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver guía KitPOP ↗
                    </Link>
                  )}
                  {item.item_type === 'activity' && (
                    <span className="workshop-item-tag">Actividad KitPOP</span>
                  )}
                  {item.item_type === 'theory' && (
                    <span className="workshop-item-tag theory">Teoría</span>
                  )}
                </td>

                <td data-label="Descripción">
                  <textarea
                    className="workshop-cell-textarea"
                    value={item.description ?? ''}
                    onChange={(event) =>
                      onUpdateItem(item.id, { description: event.target.value })
                    }
                    rows={3}
                  />
                </td>

                <td data-label="Acciones">
                  <div className="workshop-row-actions">
                    {item.item_type === 'activity' && (
                      <button
                        type="button"
                        className="timer-btn timer-btn-ghost"
                        onClick={() => onSwapActivity(item.id)}
                      >
                        Cambiar
                      </button>
                    )}
                    <button
                      type="button"
                      className="journal-delete"
                      onClick={() => onDeleteItem(item.id)}
                    >
                      Quitar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="workshop-table-actions">
        <button type="button" className="timer-btn timer-btn-secondary" onClick={onAddTheory}>
          + Contenido teórico
        </button>
        <button type="button" className="timer-btn timer-btn-primary" onClick={onAddActivity}>
          + Actividad KitPOP
        </button>
      </div>
    </div>
  )
}
