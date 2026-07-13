import {
  computePollResults,
  getLiveStatusLabel,
  getPollStatusLabel,
} from './liveHelpers'
import {
  escapeHtml,
  renderDistributionTable,
  sanitizeFilename,
  wrapDocumentHtml,
} from './documentExport'

export function buildLiveSessionResultsDocumentHtml(session, polls, votes) {
  const pollsHtml = (polls ?? [])
    .map((poll, index) => {
      const results = computePollResults(poll, votes ?? [])
      const distributionWithPct = Object.fromEntries(
        Object.entries(results.distribution).map(([label, count]) => [
          `${label} (${results.percentages[label] ?? 0}%)`,
          count,
        ])
      )

      return `
        <section>
          <h2>Poll ${index + 1}: ${escapeHtml(poll.prompt)}</h2>
          <p class="meta">
            ${poll.poll_type === 'yes_no' ? 'Sí / No' : 'Opción múltiple'} ·
            ${escapeHtml(getPollStatusLabel(poll.status))} ·
            ${results.total} voto${results.total === 1 ? '' : 's'}
          </p>
          ${renderDistributionTable(distributionWithPct)}
        </section>
      `
    })
    .join('')

  const body = `
    <h1>${escapeHtml(session.title)}</h1>
    <p>Resultados de sesión en vivo — KitPOP</p>

    <div class="summary">
      <strong>Resumen</strong><br />
      Estado: ${escapeHtml(getLiveStatusLabel(session.status))}<br />
      Polls: ${polls?.length ?? 0}<br />
      Votos totales: ${(votes ?? []).length}
      ${session.organization ? `<br />Organización: ${escapeHtml(session.organization)}` : ''}
    </div>

    ${pollsHtml || '<p>Esta sesión aún no tiene polls.</p>'}
  `

  return wrapDocumentHtml({
    title: session.title,
    body,
  })
}

export function getLiveSessionResultsFilename(session) {
  return sanitizeFilename(`${session.title}-resultados-en-vivo`)
}
