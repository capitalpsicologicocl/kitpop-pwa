export default function PausePicker({ onSelect, onClose }) {
  const options = [
    { type: 'coffee', label: 'Coffee break', minutes: 15, title: 'Coffee break' },
    { type: 'lunch', label: 'Almuerzo', minutes: 60, title: 'Almuerzo' },
    { type: 'break', label: 'Solo pausa', minutes: 10, title: 'Pausa' },
  ]

  return (
    <div className="workshop-modal-backdrop" onClick={onClose}>
      <div
        className="workshop-modal auth-panel workshop-modal-compact"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-picker-title"
      >
        <div className="workshop-modal-head">
          <h3 id="pause-picker-title">Agregar pausa</h3>
          <button type="button" className="workshop-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <p className="workshop-modal-copy">Elige el tipo de pausa para esta sesión.</p>

        <div className="workshop-picker-list">
          {options.map((option) => (
            <button
              key={option.type}
              type="button"
              className="workshop-picker-item"
              onClick={() => onSelect(option)}
            >
              <strong>{option.label}</strong>
              <span>{option.minutes} min sugeridos</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
