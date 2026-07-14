import mammoth from 'mammoth'

const MAX_FILE_BYTES = 4 * 1024 * 1024

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
])

const EXTENSION_MIME = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
}

export function resolveDocumentMimeType(fileName, mimeType) {
  const normalizedMime = String(mimeType ?? '')
    .split(';')[0]
    .trim()
    .toLowerCase()

  if (ALLOWED_MIME_TYPES.has(normalizedMime)) {
    return normalizedMime
  }

  const extension = String(fileName ?? '')
    .split('.')
    .pop()
    ?.toLowerCase()

  return EXTENSION_MIME[extension] ?? null
}

export function decodeDocumentPayload(base64Data) {
  const raw = String(base64Data ?? '').trim()

  if (!raw) {
    throw new Error('El archivo está vacío.')
  }

  const buffer = Buffer.from(raw, 'base64')

  if (!buffer.length) {
    throw new Error('No se pudo leer el archivo.')
  }

  if (buffer.length > MAX_FILE_BYTES) {
    throw new Error('El archivo supera el límite de 4 MB.')
  }

  return buffer
}

export async function extractDocumentText({ fileName, mimeType, base64Data }) {
  const resolvedMime = resolveDocumentMimeType(fileName, mimeType)

  if (!resolvedMime) {
    throw new Error('Formato no soportado. Usa PDF, DOCX o TXT.')
  }

  const buffer = decodeDocumentPayload(base64Data)

  if (resolvedMime === 'application/pdf') {
    return {
      mimeType: resolvedMime,
      mode: 'pdf',
      text: null,
      base64Data: buffer.toString('base64'),
    }
  }

  if (resolvedMime === 'text/plain') {
    return {
      mimeType: resolvedMime,
      mode: 'text',
      text: buffer.toString('utf8').trim(),
      base64Data: null,
    }
  }

  const result = await mammoth.extractRawText({ buffer })
  const text = String(result.value ?? '').trim()

  if (!text) {
    throw new Error('No se encontró texto legible en el documento DOCX.')
  }

  return {
    mimeType: resolvedMime,
    mode: 'text',
    text,
    base64Data: null,
  }
}
