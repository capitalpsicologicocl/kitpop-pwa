import EmptyIllustration from './EmptyIllustration'

export default function EmptyState({
  variant = 'default',
  title,
  description,
  action = null,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      <EmptyIllustration variant={variant} />
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}
