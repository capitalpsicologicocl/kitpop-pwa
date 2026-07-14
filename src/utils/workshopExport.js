import { formatItemTime, formatSessionDuration } from '../services/workshopService'
import {
  escapeHtml,
  downloadDocumentWord,
  printDocumentPdf,
  sanitizeFilename,
  wrapDocumentHtml,
} from './documentExport'
import { getPauseLabel, ITEM_TYPE_LABELS, isWorkshopOpeningItem } from './workshopHelpers'

function renderItemRow(item) {
  const typeLabel = isWorkshopOpeningItem(item)
    ? 'Apertura estándar'
    : item.item_type === 'pause'
      ? getPauseLabel(item.pause_type)
      : ITEM_TYPE_LABELS[item.item_type] ?? item.item_type

  return `
    <tr>
      <td>${escapeHtml(formatItemTime(item.time_minutes))}</td>
      <td>
        <strong>${escapeHtml(item.title ?? '')}</strong>
        <br /><small>${escapeHtml(typeLabel)}</small>
      </td>
      <td>${escapeHtml(item.description ?? '')}</td>
    </tr>
  `
}

export function buildWorkshopDocumentHtml(workshop, sessions, timeSummary) {
  const metaRows = [
    ['Organización', workshop.organization],
    ['Equipo / área', workshop.team],
    ['Público', workshop.audience],
    ['Modalidad', workshop.modality],
    ['Participantes', workshop.participants_count],
    ['Objetivo', workshop.objective],
  ]
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`
    )
    .join('')

  const sessionsHtml = sessions
    .map((session) => {
      const planned = formatSessionDuration(
        session.duration_hours,
        session.duration_minutes
      )
      const designed = formatItemTime(
        (session.workshop_items ?? []).reduce(
          (total, item) => total + (item.time_minutes ?? 0),
          0
        )
      )

      const itemsHtml = (session.workshop_items ?? []).map(renderItemRow).join('')

      return `
        <section>
          <h2>Sesión ${session.session_number}</h2>
          <p><strong>Tiempo programado:</strong> ${escapeHtml(planned)} ·
          <strong>Tiempo diseñado:</strong> ${escapeHtml(designed)}</p>
          <table>
            <thead>
              <tr>
                <th>Tiempo</th>
                <th>Actividad / módulo</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || '<tr><td colspan="3">Sin ítems</td></tr>'}
            </tbody>
          </table>
          ${
            session.journal_notes
              ? `<p><strong>Bitácora:</strong> ${escapeHtml(session.journal_notes)}</p>`
              : ''
          }
        </section>
      `
    })
    .join('')

  const body = `
    <h1>${escapeHtml(workshop.title)}</h1>
    <p>Diseño de taller — KitPOP</p>

    <table>${metaRows}</table>

    <div class="summary">
      <strong>Resumen de tiempos</strong><br />
      Programado total: ${escapeHtml(formatItemTime(timeSummary.totalPlanned))}<br />
      Diseñado total: ${escapeHtml(formatItemTime(timeSummary.totalDesigned))}<br />
      Diferencia: ${escapeHtml(formatItemTime(Math.abs(timeSummary.totalDelta)))}
      ${timeSummary.totalDelta > 0 ? ' (sobre tiempo)' : timeSummary.totalDelta < 0 ? ' (tiempo disponible)' : ' (equilibrado)'}
    </div>

    ${sessionsHtml}

    ${
      workshop.journal_notes
        ? `<section><h2>Bitácora general del taller</h2><p>${escapeHtml(workshop.journal_notes)}</p></section>`
        : ''
    }
  `

  return wrapDocumentHtml({
    title: workshop.title,
    body,
  })
}

export function downloadWorkshopWord(html, filename) {
  downloadDocumentWord(html, filename)
}

export function printWorkshopPdf() {
  printDocumentPdf()
}

export function getWorkshopFilename(workshop) {
  return sanitizeFilename(workshop.title)
}
