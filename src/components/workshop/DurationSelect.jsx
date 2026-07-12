export default function DurationSelect({
  hours = 0,
  minutes = 0,
  onChange,
  disabled = false,
  idPrefix = 'duration',
}) {
  return (
    <div className="duration-select">
      <div className="duration-select-field">
        <label htmlFor={`${idPrefix}-hours`}>Horas</label>
        <select
          id={`${idPrefix}-hours`}
          value={hours}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              hours: Number(event.target.value),
              minutes,
            })
          }
        >
          {Array.from({ length: 24 }, (_, index) => (
            <option key={index} value={index}>
              {index}
            </option>
          ))}
        </select>
      </div>

      <div className="duration-select-field">
        <label htmlFor={`${idPrefix}-minutes`}>Minutos</label>
        <select
          id={`${idPrefix}-minutes`}
          value={minutes}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              hours,
              minutes: Number(event.target.value),
            })
          }
        >
          {Array.from({ length: 60 }, (_, index) => (
            <option key={index} value={index}>
              {String(index).padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
