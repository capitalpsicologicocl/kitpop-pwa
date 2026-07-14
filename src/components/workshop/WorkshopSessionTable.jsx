import { Link } from 'react-router-dom'

import { formatItemTime } from '../../services/workshopService'
import { getPauseLabel, isWorkshopOpeningItem } from '../../utils/workshopHelpers'

export default function WorkshopSessionTable({
  session,
  onAddTheory,
  onAddActivity,
  onAddCustom,
  onAddPause,
  onSwapActivity,
  onUpdateItem,
  onDeleteItem,
  onMoveItem,
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
                Agrega contenido teórico, actividades KitPOP, diseño propio o pausas.
              </td>
            </tr>
          ) : (
            items.map((item, index) => {
              const isOpening = isWorkshopOpeningItem(item)
              const canMoveUp = !isOpening && index > (isWorkshopOpeningItem(items[0]) ? 1 : 0)
              const canMoveDown = !isOpening && index < items.length - 1

              return (
              <tr key={item.id} className={isOpening ? 'workshop-opening-row' : undefined}>
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
                  {item.item_type === 'custom' && !isOpening && (
                    <span className="workshop-item-tag custom">Diseño propio</span>
                  )}
                  {isOpening && (
                    <span className="workshop-item-tag opening">Apertura estándar</span>
                  )}
                  {item.item_type === 'pause' && (
                    <span className="workshop-item-tag pause">
                      {getPauseLabel(item.pause_type)}
                    </span>
                  )}
                </td>

                <td data-label="Descripción">
                  <textarea
                    className="workshop-cell-textarea"
                    value={item.description ?? ''}
                    onChange={(event) =>
                      onUpdateItem(item.id, { description: event.target.value })
                    }
                    rows={5}
                  />
                </td>

                <td data-label="Acciones">
                  <div className="workshop-row-actions">
                    {!isOpening && onMoveItem && (
                      <div className="workshop-reorder-btns">
                        <button
                          type="button"
                          className="workshop-reorder-btn"
                          disabled={!canMoveUp}
                          aria-label="Subir fila"
                          onClick={() => onMoveItem(item.id, -1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="workshop-reorder-btn"
                          disabled={!canMoveDown}
                          aria-label="Bajar fila"
                          onClick={() => onMoveItem(item.id, 1)}
                        >
                          ↓
                        </button>
                      </div>
                    )}
                    {item.item_type === 'activity' && (
                      <button
                        type="button"
                        className="timer-btn timer-btn-ghost"
                        onClick={() => onSwapActivity(item.id)}
                      >
                        Cambiar
                      </button>
                    )}
                    {!isOpening && (
                      <button
                        type="button"
                        className="journal-delete"
                        onClick={() => onDeleteItem(item.id)}
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
            })
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
        <button type="button" className="timer-btn timer-btn-secondary" onClick={onAddCustom}>
          + Otra actividad de diseño propio
        </button>
        <button type="button" className="timer-btn timer-btn-secondary" onClick={onAddPause}>
          + Pausa
        </button>
      </div>
    </div>
  )
}
