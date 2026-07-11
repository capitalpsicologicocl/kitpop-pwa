const SCIENCE_PATTERN =
  /evidencia|fundamento|modelo|teor|marco conceptual|investig/

export function parseTimerMinutes(metas = []) {
  const match = metas.join(' ').match(/(\d+)/)
  return match ? Number(match[1]) : 15
}

export function formatPlenaryQuestion(question) {
  if (typeof question === 'string') {
    return question
  }

  return question?.q || question?.p || JSON.stringify(question)
}

export function extractScienceRows(sections = []) {
  const rows = []

  sections.forEach((section) => {
    ;(section.rows || []).forEach((row) => {
      const text = `${section.t || ''} ${row.h || ''}`.toLowerCase()

      if (SCIENCE_PATTERN.test(text)) {
        rows.push(row)
      }
    })
  })

  return rows
}
