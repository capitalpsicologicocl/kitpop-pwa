const PERMA_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'P', label: 'P — Emociones Positivas' },
  { value: 'E', label: 'E — Compromiso' },
  { value: 'R', label: 'R — Relaciones' },
  { value: 'M', label: 'M — Sentido' },
  { value: 'A', label: 'A — Logro' },
]

export default function PermaFilters({ value, onChange }) {
  return (
    <div className="perma-filters">
      <small>Filtrar por elemento PERMA</small>

      <div className="filter-row">
        {PERMA_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`filter-btn ${value === option.value ? 'on' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
