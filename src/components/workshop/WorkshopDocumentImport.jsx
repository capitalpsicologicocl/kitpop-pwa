import { useRef, useState } from 'react'

import { parseWorkshopDocument } from '../../services/aiWorkshopService'

const ACCEPT =
  '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain'

const MAX_FILE_BYTES = 4 * 1024 * 1024

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = String(reader.result ?? '')
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64)
    }

    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.readAsDataURL(file)
  })
}

export default function WorkshopDocumentImport({
  useKitpopActivities,
  onUseKitpopChange,
  includeTheoryModules,
  onIncludeTheoryChange,
  onApplyExtracted,
  disabled = false,
}) {
  const inputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const [extracted, setExtracted] = useState(null)

  async function handleFileSelected(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setError('')
    setExtracted(null)

    if (file.size > MAX_FILE_BYTES) {
      setError('El archivo supera el límite de 4 MB.')
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setParsing(true)

    try {
      const base64Data = await readFileAsBase64(file)
      const payload = await parseWorkshopDocument({
        fileName: file.name,
        mimeType: file.type,
        base64Data,
      })

      setExtracted(payload.extracted)
    } catch (parseError) {
      setError(parseError.message || 'No se pudo leer el documento.')
      setSelectedFile(null)
    } finally {
      setParsing(false)
    }
  }

  async function handleApply() {
    if (!extracted || !onApplyExtracted) {
      return
    }

    setApplying(true)
    setError('')

    try {
      await onApplyExtracted(extracted)
    } catch (applyError) {
      setError(applyError.message || 'No se pudo aplicar el documento.')
    } finally {
      setApplying(false)
    }
  }

  return (
    <section className="auth-panel workshop-document-import">
      <h3>Crear taller desde documento</h3>

      <fieldset className="workshop-kitpop-choice">
        <legend>¿Deseas armar el curso con actividades del banco KitPOP?</legend>
        <label className="workshop-kitpop-option">
          <input
            type="radio"
            name="useKitpopActivities"
            checked={useKitpopActivities}
            disabled={disabled || parsing || applying}
            onChange={() => onUseKitpopChange(true)}
          />
          <span>Sí, incluir actividades KitPOP</span>
        </label>
        <label className="workshop-kitpop-option">
          <input
            type="radio"
            name="useKitpopActivities"
            checked={!useKitpopActivities}
            disabled={disabled || parsing || applying}
            onChange={() => onUseKitpopChange(false)}
          />
          <span>No, diseñar actividades propias</span>
        </label>
      </fieldset>

      <fieldset className="workshop-kitpop-choice">
        <legend>¿Incluir módulos teóricos del documento o contenidos?</legend>
        <label className="workshop-kitpop-option">
          <input
            type="radio"
            name="includeTheoryModules"
            checked={includeTheoryModules}
            disabled={disabled || parsing || applying}
            onChange={() => onIncludeTheoryChange(true)}
          />
          <span>Sí, módulos teóricos + actividades prácticas</span>
        </label>
        <label className="workshop-kitpop-option">
          <input
            type="radio"
            name="includeTheoryModules"
            checked={!includeTheoryModules}
            disabled={disabled || parsing || applying}
            onChange={() => onIncludeTheoryChange(false)}
          />
          <span>No, solo actividades prácticas</span>
        </label>
      </fieldset>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="workshop-document-input"
        onChange={handleFileSelected}
      />

      <button
        type="button"
        className="workshop-document-upload-btn"
        disabled={disabled || parsing || applying}
        onClick={() => inputRef.current?.click()}
      >
        {parsing ? 'Leyendo documento...' : 'Sube tu documento de referencia para crear el taller'}
      </button>

      <p className="workshop-document-hint">
        Términos de Referencia o documento con descripción de cantidad de participantes, público
        objetivo, objetivos, contenidos, módulos, horas, etc. (PDF, DOCX o TXT · máx. 4 MB)
      </p>

      {selectedFile && (
        <p className="workshop-document-file">
          Archivo: <strong>{selectedFile.name}</strong>
        </p>
      )}

      {error && <div className="auth-message error">{error}</div>}

      {extracted && (
        <div className="workshop-document-preview">
          <h4>Datos detectados en el documento</h4>
          {extracted.confidence && (
            <p className="interactive-item-meta">
              Confianza de lectura: {extracted.confidence}
            </p>
          )}

          <dl className="workshop-document-fields">
            {extracted.title && (
              <>
                <dt>Título</dt>
                <dd>{extracted.title}</dd>
              </>
            )}
            {extracted.organization && (
              <>
                <dt>Organización</dt>
                <dd>{extracted.organization}</dd>
              </>
            )}
            {extracted.audience && (
              <>
                <dt>Público objetivo</dt>
                <dd>{extracted.audience}</dd>
              </>
            )}
            {extracted.participantsCount != null && (
              <>
                <dt>Participantes</dt>
                <dd>{extracted.participantsCount}</dd>
              </>
            )}
            {extracted.modality && (
              <>
                <dt>Modalidad</dt>
                <dd>{extracted.modality}</dd>
              </>
            )}
            {extracted.sessionCount != null && (
              <>
                <dt>Sesiones</dt>
                <dd>{extracted.sessionCount}</dd>
              </>
            )}
            {extracted.objective && (
              <>
                <dt>Objetivo y contenidos</dt>
                <dd className="workshop-document-rich">{extracted.objective}</dd>
              </>
            )}
            {extracted.contentOutline?.map((module) => (
              <div key={module.moduleNumber} className="workshop-document-module">
                <dt>Módulo {module.moduleNumber}</dt>
                <dd>
                  {module.title && <strong>{module.title}</strong>}
                  {module.objectives && <p>{module.objectives}</p>}
                  {module.contents && <p>{module.contents}</p>}
                </dd>
              </div>
            ))}
            {extracted.modulesSummary && (
              <>
                <dt>Resumen del programa</dt>
                <dd className="workshop-document-rich">{extracted.modulesSummary}</dd>
              </>
            )}
          </dl>

          <button
            type="button"
            className="btn-primary"
            disabled={applying}
            onClick={handleApply}
          >
            {applying ? 'Aplicando...' : 'Aplicar al formulario del taller'}
          </button>
        </div>
      )}
    </section>
  )
}
