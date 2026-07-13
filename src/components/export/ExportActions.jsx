export default function ExportActions({
  onDownloadWord,
  onPrintPdf,
  disabled = false,
  className = '',
}) {
  return (
    <div className={`export-actions no-print ${className}`.trim()}>
      <button
        type="button"
        className="btn-primary"
        disabled={disabled}
        onClick={onDownloadWord}
      >
        Descargar Word
      </button>
      <button
        type="button"
        className="timer-btn timer-btn-secondary"
        disabled={disabled}
        onClick={onPrintPdf}
      >
        Descargar PDF
      </button>
    </div>
  )
}
