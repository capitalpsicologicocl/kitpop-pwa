import WorkspaceRichContent from './WorkspaceRichContent'

export default function WorkspaceParticipantResponsesModal({
  participant,
  sections,
  responses,
  groups,
  onClose,
}) {
  if (!participant) {
    return null
  }

  const groupName =
    groups.find((group) => group.id === participant.group_id)?.name ?? 'Sin grupo'

  const participantResponses = sections
    .filter((section) => section.section_type !== 'info')
    .map((section) => {
      const response = responses.find((item) => {
        if (item.section_id !== section.id) {
          return false
        }

        if (section.scope === 'individual') {
          return item.participant_id === participant.id
        }

        return item.group_id === participant.group_id && participant.group_id
      })

      return { section, response }
    })

  return (
    <div className="workspace-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="workspace-modal auth-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="participant-responses-title"
      >
        <div className="workspace-modal-head">
          <div>
            <h3 id="participant-responses-title">{participant.display_name}</h3>
            <p className="interactive-item-meta">
              {participant.email} · {groupName} · Avance {participant.completion_pct ?? 0}%
            </p>
          </div>
          <button type="button" className="timer-btn timer-btn-ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="workspace-modal-body">
          {participantResponses.length === 0 ? (
            <p className="interactive-item-meta">Aún no hay respuestas registradas.</p>
          ) : (
            participantResponses.map(({ section, response }) => (
              <article key={section.id} className="workspace-participant-response-item">
                <h4>{section.title}</h4>
                <p className="interactive-item-meta">
                  {section.scope === 'group' ? 'Grupal' : 'Individual'} ·{' '}
                  {section.section_type.replace('_', ' ')}
                </p>

                {!response ? (
                  <p className="workspace-response-empty">Sin respuesta</p>
                ) : section.section_type === 'table' ? (
                  <pre className="workspace-response-table-json">
                    {JSON.stringify(response.value, null, 2)}
                  </pre>
                ) : section.section_type === 'text_long' ? (
                  <WorkspaceRichContent
                    html={response.value?.text ?? ''}
                    className="workspace-response-text"
                  />
                ) : (
                  <p className="workspace-response-text">{formatDisplayValue(section, response.value)}</p>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function formatDisplayValue(section, value) {
  const config = section.config ?? {}

  if (section.section_type === 'text_short') {
    return value?.text ?? '—'
  }

  if (section.section_type === 'single_choice') {
    return (config.options ?? []).find((option) => option.id === value?.choice)?.label ?? '—'
  }

  if (section.section_type === 'multi_choice') {
    return (value?.choices ?? [])
      .map((choiceId) => (config.options ?? []).find((option) => option.id === choiceId)?.label)
      .filter(Boolean)
      .join(', ') || '—'
  }

  if (section.section_type === 'boolean') {
    if (value?.value === true) {
      return config.true_label ?? 'Sí'
    }

    if (value?.value === false) {
      return config.false_label ?? 'No'
    }

    return '—'
  }

  if (section.section_type === 'likert') {
    return value?.score ? `${value.score} / ${config.scale ?? 5}` : '—'
  }

  return JSON.stringify(value)
}
