import { loadActivityIndex } from '../data/contentLoader'
import { escapeHtml, sanitizeFilename, wrapDocumentHtml } from './documentExport'

function formatJournalDate(value) {
  if (!value) {
    return 'Sin fecha'
  }

  return new Date(`${value}T12:00:00`).toLocaleDateString('es-CL')
}

export async function buildJournalDocumentHtml(entries) {
  const index = await loadActivityIndex()
  const titleBySlug = Object.fromEntries(index.map((item) => [item.slug, item.title]))

  const entriesHtml = (entries ?? [])
    .map((entry) => {
      const title = entry.activity_slug
        ? titleBySlug[entry.activity_slug] || 'Registro de facilitación'
        : 'Registro de facilitación'

      const meta = [
        formatJournalDate(entry.entry_date),
        entry.organization,
        entry.participants_count
          ? `${entry.participants_count} participantes`
          : null,
        entry.duration_real,
      ]
        .filter(Boolean)
        .map((item) => escapeHtml(item))
        .join(' · ')

      return `
        <section>
          <h2>${escapeHtml(title)}</h2>
          <p class="meta">${meta || 'Sin metadatos'}</p>
          ${entry.notes ? `<p>${escapeHtml(entry.notes)}</p>` : '<p>Sin notas.</p>'}
        </section>
      `
    })
    .join('')

  const body = `
    <h1>Bitácora de facilitación</h1>
    <p>Registros personales — KitPOP</p>

    <div class="summary">
      <strong>Resumen</strong><br />
      ${entries?.length ?? 0} registro${entries?.length === 1 ? '' : 's'} exportado${entries?.length === 1 ? '' : 's'}
    </div>

    ${entriesHtml || '<p>No hay registros en la bitácora.</p>'}
  `

  return wrapDocumentHtml({
    title: 'Bitácora de facilitación',
    body,
  })
}

export function getJournalFilename() {
  return sanitizeFilename('bitacora-kitpop')
}
