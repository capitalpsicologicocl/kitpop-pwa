import { useMemo, useState } from 'react'

import { categories } from '../../data/categories'
import { stripHtml } from '../../data/contentLoader'
import { useActivityIndex } from '../../hooks/useContent'

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
      activity.subcategory,
    ].join(' ')
  ).toLowerCase()

  return haystack.includes(normalizedQuery)
}

export default function ActivityPicker({ onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const [categorySlug, setCategorySlug] = useState('all')
  const { index, loading } = useActivityIndex()

  const results = useMemo(
    () =>
      index
        .filter((activity) => matchesActivity(activity, query, categorySlug))
        .slice(0, 24),
    [index, query, categorySlug]
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

        {loading ? (
          <p className="auth-loading">Cargando banco de actividades…</p>
        ) : (
          <ul className="workshop-picker-results">
            {results.map((activity) => (
              <li key={activity.slug}>
                <button type="button" onClick={() => onSelect(activity)}>
                  <strong>{activity.title}</strong>
                  <span>{activity.description}</span>
                </button>
              </li>
            ))}

            {results.length === 0 && (
              <li className="workshop-picker-empty">Sin resultados para esta búsqueda.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
