import { formatItemTime, formatSessionDuration } from '../services/workshopService'
import { getPauseLabel, ITEM_TYPE_LABELS } from './workshopHelpers'

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderItemRow(item) {
  const typeLabel =
    item.item_type === 'pause'
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
          <table border="1" cellpadding="8" cellspacing="0" width="100%">
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

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(workshop.title)} — KitPOP</title>
  <style>
    body { font-family: Arial, sans-serif; color: #222; line-height: 1.5; }
    h1 { color: #5b21b6; }
    h2 { color: #6d28d9; margin-top: 28px; }
    table { border-collapse: collapse; margin: 12px 0 24px; }
    th { background: #f3f4f6; text-align: left; }
    td, th { border: 1px solid #d1d5db; padding: 8px; vertical-align: top; }
    .summary { background: #faf5ff; padding: 12px; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(workshop.title)}</h1>
  <p>Diseño de taller — KitPOP</p>

  <table width="100%">${metaRows}</table>

  <div class="summary">
    <strong>Resumen de tiempos</strong><br />
    Programado total: ${escapeHtml(formatItemTime(timeSummary.totalPlanned))}<br />
    Diseñado total: ${escapeHtml(formatItemTime(timeSummary.totalDesigned))}<br />
    Diferencia: ${escapeHtml(formatItemTime(Math.abs(timeSummary.totalDelta)))}
    ${timeSummary.totalDelta > 0 ? ' (sobre tiempo)' : timeSummary.totalDelta < 0 ? ' (tiempo disponible)' : ' (equilibrado)'}
  </div>

  ${sessionsHtml}
</body>
</html>`
}

export function downloadWorkshopWord(html, filename) {
  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.doc`
  link.click()
  URL.revokeObjectURL(url)
}

export function printWorkshopPdf() {
  window.print()
}
