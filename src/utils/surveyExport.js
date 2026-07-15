import {
  computeQuestionStats,
  getQuestionTypeLabel,
  getSurveyStatusLabel,
  getSurveyTypeLabel,
  isLikertType,
} from './surveyHelpers'
import {
  escapeHtml,
  renderDistributionTable,
  sanitizeFilename,
  wrapDocumentHtml,
} from './documentExport'

export function buildSurveyResultsDocumentHtml(survey, results) {
  const questionsHtml = (results?.questions ?? [])
    .map((question, index) => {
      const stats = computeQuestionStats(question, results.answers ?? [])

      let statsHtml

      if (isLikertType(question.question_type)) {
        statsHtml = `
          <p><strong>Promedio:</strong> ${escapeHtml(stats.average ?? '—')}</p>
          ${renderDistributionTable(stats.distribution)}
        `
      } else if (question.question_type === 'yes_no') {
        statsHtml = renderDistributionTable(stats.distribution)
      } else {
        const texts = stats.texts ?? []
        statsHtml =
          texts.length === 0
            ? '<p>Sin comentarios aún.</p>'
            : `<div>${texts.map((text) => `<blockquote>${escapeHtml(text)}</blockquote>`).join('')}</div>`
      }

      return `
        <section>
          <h2>${index + 1}. ${escapeHtml(question.prompt)}</h2>
          <p class="meta">${escapeHtml(getQuestionTypeLabel(question.question_type))} · ${stats.count} respuesta${stats.count === 1 ? '' : 's'}</p>
          ${statsHtml}
        </section>
      `
    })
    .join('')

  const body = `
    <h1>${escapeHtml(survey.title)}</h1>
    <p>Resultados de encuesta — KitPOP</p>

    <div class="summary">
      <strong>Resumen</strong><br />
      Tipo: ${escapeHtml(getSurveyTypeLabel(survey.survey_type))}<br />
      Estado: ${escapeHtml(getSurveyStatusLabel(survey.status))}<br />
      Respuestas totales: ${results?.responseCount ?? 0}
      ${survey.organization ? `<br />Organización: ${escapeHtml(survey.organization)}` : ''}
    </div>

    ${questionsHtml || '<p>Esta encuesta aún no tiene preguntas.</p>'}
  `

  return wrapDocumentHtml({
    title: survey.title,
    body,
  })
}

export function getSurveyResultsFilename(survey) {
  return sanitizeFilename(`${survey.title}-resultados`)
}
