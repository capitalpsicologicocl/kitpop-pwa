const ALLOWED_TAGS = new Set([
  'B',
  'STRONG',
  'I',
  'EM',
  'U',
  'UL',
  'OL',
  'LI',
  'P',
  'BR',
  'SPAN',
  'DIV',
])

const ALLOWED_STYLES = new Set(['text-align', 'font-size'])

function sanitizeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return ''
  }

  const tag = node.tagName.toUpperCase()

  if (!ALLOWED_TAGS.has(tag)) {
    return [...node.childNodes].map(sanitizeNode).join('')
  }

  let styleAttr = ''

  if (node.hasAttribute('style')) {
    const styles = node
      .getAttribute('style')
      .split(';')
      .map((rule) => rule.trim())
      .filter(Boolean)
      .filter((rule) => {
        const [property] = rule.split(':')
        return ALLOWED_STYLES.has(property?.trim().toLowerCase())
      })

    if (styles.length > 0) {
      styleAttr = ` style="${styles.join('; ')}"`
    }
  }

  const inner = [...node.childNodes].map(sanitizeNode).join('')
  const voidTags = new Set(['BR'])

  if (voidTags.has(tag)) {
    return `<${tag.toLowerCase()}${styleAttr}>`
  }

  return `<${tag.toLowerCase()}${styleAttr}>${inner}</${tag.toLowerCase()}>`
}

export function sanitizeWorkspaceHtml(html) {
  const source = String(html ?? '').trim()

  if (!source) {
    return ''
  }

  if (!/[<>]/.test(source)) {
    return source
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
  }

  if (typeof DOMParser === 'undefined') {
    return source
  }

  const doc = new DOMParser().parseFromString(source, 'text/html')
  return sanitizeNode(doc.body).trim()
}

export function isRichHtml(value) {
  return /<[^>]+>/.test(String(value ?? ''))
}
