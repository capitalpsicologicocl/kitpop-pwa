import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function QuickGrid() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearch(event) {
    event.preventDefault()

    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      return
    }

    navigate(`/buscar?q=${encodeURIComponent(trimmedQuery)}`)
  }

  return (
    <div className="quick-grid">
      <div className="home-panel">
        <h2>Encuentra una actividad</h2>
        <p>Busca por nombre, categoría, objetivo o contenido.</p>

        <form className="search-row" onSubmit={handleSearch}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej.: confianza, cierre, feedback..."
          />

          <button type="submit" className="btn-primary">
            Buscar
          </button>
        </form>
      </div>

      <div className="home-panel">
        <h2>Diseña un workshop</h2>
        <p>Estructura sesiones y selecciona actividades del banco KitPOP.</p>

        <Link to="/talleres" className="btn-primary btn-link">
          Abrir diseñador
        </Link>
      </div>
    </div>
  )
}
