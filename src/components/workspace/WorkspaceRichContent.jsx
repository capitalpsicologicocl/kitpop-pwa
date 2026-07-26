import { sanitizeWorkspaceHtml } from '../../utils/sanitizeHtml'

export default function WorkspaceRichContent({ html, className = '' }) {
  const safeHtml = sanitizeWorkspaceHtml(html)

  if (!safeHtml) {
    return null
  }

  return (
    <div
      className={`workspace-rich-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}
