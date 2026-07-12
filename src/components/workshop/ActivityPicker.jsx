import { useMemo, useState } from 'react'

import { activities } from '../../data/activities'
import { categories } from '../../data/categories'
import { stripHtml } from '../../data/kitpopAdapter'

function matchesActivity(activity, query, categorySlug) {
  if (categorySlug !== 'all' && activity.categorySlug !== categorySlug) {
    return false
  }

  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  const haystack = stripHtml(
    [
      activity.title,
      activity.description,
      activity.categoryLabel,
      activity.kitpop?.sub,
    ].join(' ')
  ).toLowerCase()

  return haystack.includes(normalizedQuery)
}

export default function ActivityPicker({ onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const [categorySlug, setCategorySlug] = useState('all')

  const results = useMemo(
    () =>
      activities
        .filter((activity) => matchesActivity(activity, query, categorySlug))
        .slice(0, 24),
    [query, categorySlug]
  )

  return (
    <div className="workshop-modal-backdrop" onClick={onClose}>
      <div
        className="workshop-modal auth-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-picker-title"
      >
        <div className="workshop-modal-head">
          <h3 id="activity-picker-title">Banco KitPOP</h3>
          <button type="button" className="workshop-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <p className="workshop-modal-copy">
          Elige una actividad para agregar al taller. Puedes cambiarla después.
        </p>

        <div className="workshop-picker-filters">
          <input
            type="search"
            placeholder="Buscar actividad..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <select
            value={categorySlug}
            onChange={(event) => setCategorySlug(event.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.title}
              </option>
            ))}
          </select>
        </div>

        <div className="workshop-picker-list">
          {results.length === 0 ? (
            <p className="interactive-item-meta">No hay actividades con ese filtro.</p>
          ) : (
            results.map((activity) => (
              <button
                key={activity.slug}
                type="button"
                className="workshop-picker-item"
                onClick={() => onSelect(activity)}
              >
                <strong>{activity.title}</strong>
                <span>{activity.categoryLabel}</span>
                <p>{activity.description}</p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
