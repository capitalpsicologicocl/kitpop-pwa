import {
  aggregateBooleanResponses,
  aggregateChoiceResponses,
  aggregateLikertResponses,
  getWorkspaceStatusLabel,
} from './workspaceHelpers'

export function buildWorkspaceExportHtml({
  workspace,
  sections,
  participants,
  groups,
  responses,
}) {
  const groupMap = Object.fromEntries((groups ?? []).map((group) => [group.id, group.name]))
  const participantMap = Object.fromEntries(
    (participants ?? []).map((participant) => [participant.id, participant.display_name])
  )

  const sectionBlocks = (sections ?? [])
    .map((section) => {
      const sectionResponses = (responses ?? []).filter(
        (response) => response.section_id === section.id
      )

      const body = (() => {
        if (section.section_type === 'info') {
          return `<p>${escapeHtml(section.config?.content ?? '')}</p>`
        }

        if (
          section.section_type === 'single_choice' ||
          section.section_type === 'multi_choice'
        ) {
          const aggregated = aggregateChoiceResponses(section, sectionResponses)
          return `<ul>${aggregated
            .map(
              (option) =>
                `<li><strong>${escapeHtml(option.label)}</strong>: ${option.count}</li>`
            )
            .join('')}</ul>`
        }

        if (section.section_type === 'likert') {
          const { average, counts, total } = aggregateLikertResponses(section, sectionResponses)
          return `<p>Promedio: ${average} (${total} respuestas)</p><ul>${Object.entries(counts)
            .map(([score, count]) => `<li>${score}: ${count}</li>`)
            .join('')}</ul>`
        }

        if (section.section_type === 'boolean') {
          const { yes, no, yesPct } = aggregateBooleanResponses(section, sectionResponses)
          return `<p>Sí: ${yes} (${yesPct}%) · No: ${no}</p>`
        }

        return `<ul>${sectionResponses
          .map((response) => {
            const label =
              section.scope === 'group'
                ? groupMap[response.group_id] ?? 'Grupo'
                : participantMap[response.participant_id] ?? 'Participante'

            return `<li><strong>${escapeHtml(label)}</strong>: ${escapeHtml(
              JSON.stringify(response.value)
            )}</li>`
          })
          .join('')}</ul>`
      })()

      return `
        <section style="margin-bottom:24px;">
          <h2>${escapeHtml(section.title)}</h2>
          <p><em>${section.scope === 'group' ? 'Grupal' : 'Individual'} · ${escapeHtml(section.section_type)}</em></p>
          ${body}
        </section>
      `
    })
    .join('')

  const roster = (participants ?? [])
    .map(
      (participant) =>
        `<tr>
          <td>${escapeHtml(participant.display_name)}</td>
          <td>${escapeHtml(participant.email ?? '')}</td>
          <td>${escapeHtml(groupMap[participant.group_id] ?? 'Sin grupo')}</td>
          <td>${participant.completion_pct ?? 0}%</td>
        </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(workspace.title)} — Resumen</title>
  <style>
    body { font-family: Arial, sans-serif; color: #222; margin: 24px; }
    h1 { margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0 32px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
  <h1>${escapeHtml(workspace.title)}</h1>
  <p>Estado: ${escapeHtml(getWorkspaceStatusLabel(workspace.status))}</p>
  ${workspace.description ? `<p>${escapeHtml(workspace.description)}</p>` : ''}

  <h2>Inscripciones</h2>
  <table>
    <thead>
      <tr><th>Nombre</th><th>Correo</th><th>Grupo</th><th>Avance</th></tr>
    </thead>
    <tbody>${roster}</tbody>
  </table>

  <h2>Respuestas</h2>
  ${sectionBlocks}
</body>
</html>`
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function getWorkspaceExportFilename(workspace) {
  const slug = (workspace?.title ?? 'espacio')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')

  return `kitpop-espacio-${slug || 'resumen'}.html`
}
