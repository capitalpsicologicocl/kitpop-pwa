export default function HtmlContent({ as: Tag = 'span', className, html }) {
  if (!html) {
    return null
  }

  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
