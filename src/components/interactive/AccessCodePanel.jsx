import { getParticipantUrl } from '../../utils/accessCode'

export default function AccessCodePanel({ code, resourceLabel }) {
  if (!code) {
    return null
  }

  const participantUrl = getParticipantUrl(code)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(participantUrl)
    } catch {
      window.prompt('Copia este enlace:', participantUrl)
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      window.prompt('Copia este código:', code)
    }
  }

  return (
    <div className="access-code-panel">
      <p className="access-code-label">
        Acceso participantes · {resourceLabel}
      </p>

      <div className="access-code-row">
        <strong className="access-code-value">{code}</strong>
        <button type="button" className="timer-btn timer-btn-ghost" onClick={copyCode}>
          Copiar código
        </button>
      </div>

      <div className="access-code-link-row">
        <code>{participantUrl}</code>
        <button type="button" className="timer-btn timer-btn-secondary" onClick={copyLink}>
          Copiar enlace
        </button>
      </div>

      <p className="access-code-note">
        Comparte el enlace o el código. En Fase 9–10 se añadirá QR y respuesta en vivo.
      </p>
    </div>
  )
}
