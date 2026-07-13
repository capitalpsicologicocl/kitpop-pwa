export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function sanitizeFilename(name = 'documento-kitpop') {
  return name.replace(/[^\w\s-]/g, '').trim() || 'documento-kitpop'
}

export const DOCUMENT_STYLES = `
  body { font-family: Arial, sans-serif; color: #222; line-height: 1.5; }
  h1 { color: #5b21b6; }
  h2 { color: #6d28d9; margin-top: 28px; }
  h3 { color: #374151; margin-top: 18px; }
  table { border-collapse: collapse; margin: 12px 0 24px; width: 100%; }
  th { background: #f3f4f6; text-align: left; }
  td, th { border: 1px solid #d1d5db; padding: 8px; vertical-align: top; }
  .summary { background: #faf5ff; padding: 12px; border-radius: 8px; margin: 16px 0; }
  .meta { color: #6b7280; font-size: 13px; }
  blockquote { margin: 8px 0; padding: 8px 12px; border-left: 3px solid #c4b5fd; background: #faf5ff; }
  ul { padding-left: 20px; }
  ol { padding-left: 20px; }
`

export function wrapDocumentHtml({ title, body }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)} — KitPOP</title>
  <style>${DOCUMENT_STYLES}</style>
</head>
<body>
  ${body}
</body>
</html>`
}

export function downloadDocumentWord(html, filename) {
  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${sanitizeFilename(filename)}.doc`
  link.click()
  URL.revokeObjectURL(url)
}

export function printDocumentPdf() {
  window.print()
}

export function renderDistributionTable(distribution = {}) {
  const entries = Object.entries(distribution)

  if (entries.length === 0) {
    return '<p>Sin respuestas aún.</p>'
  }

  const rows = entries
    .map(
      ([label, count]) =>
        `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(count)}</td></tr>`
    )
    .join('')

  return `
    <table>
      <thead>
        <tr><th>Respuesta</th><th>Cantidad</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `
}
