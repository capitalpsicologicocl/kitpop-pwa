import { stripHtml } from '../data/kitpopAdapter'
import { extractScienceRows, formatPlenaryQuestion } from './activityContent'
import { escapeHtml, sanitizeFilename, wrapDocumentHtml } from './documentExport'

function renderGuideSections(kitpop) {
  const materials = kitpop.mat ?? []
  const sections = kitpop.secs ?? []
  const plenary = kitpop.plen ?? []

  let html = ''

  if (materials.length > 0) {
    html += `
      <section>
        <h2>Materiales</h2>
        <ul>${materials.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </section>
    `
  }

  sections.forEach((section) => {
    const rows = (section.rows ?? [])
      .map(
        (row) =>
          `<div><strong>${escapeHtml(row.h)}</strong><p>${escapeHtml(row.p)}</p></div>`
      )
      .join('')

    html += `
      <section>
        <h2>${escapeHtml(section.t)}</h2>
        ${rows}
        ${section.cita ? `<blockquote>${escapeHtml(section.cita)}</blockquote>` : ''}
      </section>
    `
  })

  if (plenary.length > 0) {
    html += `
      <section>
        <h2>Preguntas para plenaria</h2>
        <ol>${plenary.map((question) => `<li>${escapeHtml(formatPlenaryQuestion(question))}</li>`).join('')}</ol>
      </section>
    `
  }

  return html
}

function renderScienceSection(kitpop) {
  const rows = extractScienceRows(kitpop.secs ?? [])

  if (rows.length === 0) {
    return ''
  }

  return `
    <section>
      <h2>Fundamento científico y técnico</h2>
      ${rows
        .map(
          (row) =>
            `<div><strong>${escapeHtml(row.h)}</strong><p>${escapeHtml(row.p)}</p></div>`
        )
        .join('')}
    </section>
  `
}

export function buildActivityGuideDocumentHtml(activity) {
  const kitpop = activity.kitpop ?? {}
  const title = stripHtml(kitpop.name || activity.title)
  const subtitle = stripHtml(kitpop.sub || activity.description || '')
  const metas = (kitpop.metas ?? []).map((meta) => escapeHtml(meta)).join(' · ')

  const body = `
    <h1>${escapeHtml(title)}</h1>
    <p>Guía de facilitación — KitPOP</p>
    ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}

    <div class="summary">
      <strong>Metadatos</strong><br />
      Categoría: ${escapeHtml(activity.categoryLabel || kitpop.cat || 'Actividad KitPOP')}
      ${metas ? `<br />${metas}` : ''}
    </div>

    ${renderGuideSections(kitpop)}
    ${renderScienceSection(kitpop)}
  `

  return wrapDocumentHtml({
    title,
    body,
  })
}

export function getActivityGuideFilename(activity) {
  const kitpop = activity.kitpop ?? {}
  return sanitizeFilename(stripHtml(kitpop.name || activity.title || 'actividad'))
}
