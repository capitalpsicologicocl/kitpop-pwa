export default function WorkspaceAttendanceModal({ onSubmit, submitting, error }) {
  return (
    <div className="workspace-modal-backdrop workspace-attendance-backdrop" role="presentation">
      <div
        className="workspace-modal auth-panel workspace-attendance-modal"
        role="dialog"
        aria-labelledby="attendance-modal-title"
      >
        <h3 id="attendance-modal-title">Registro de asistencia</h3>
        <p className="interactive-item-meta">
          El facilitador solicita confirmar tu asistencia. Completa tus datos para continuar.
        </p>

        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            onSubmit({
              firstName: String(formData.get('firstName') ?? '').trim(),
              lastName: String(formData.get('lastName') ?? '').trim(),
              rut: String(formData.get('rut') ?? '').trim(),
              jobTitle: String(formData.get('jobTitle') ?? '').trim(),
            })
          }}
        >
          <div className="field">
            <label htmlFor="attendance-first-name">Nombre</label>
            <input id="attendance-first-name" name="firstName" required autoComplete="given-name" />
          </div>

          <div className="field">
            <label htmlFor="attendance-last-name">Apellido</label>
            <input id="attendance-last-name" name="lastName" required autoComplete="family-name" />
          </div>

          <div className="field full">
            <label htmlFor="attendance-rut">RUT</label>
            <input id="attendance-rut" name="rut" required placeholder="12.345.678-9" />
          </div>

          <div className="field full">
            <label htmlFor="attendance-job">Cargo</label>
            <input id="attendance-job" name="jobTitle" required placeholder="Ej. Analista" />
          </div>

          {error && <div className="auth-message error field full">{error}</div>}

          <div className="form-actions field full">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Registrar asistencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
