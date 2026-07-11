import { Link } from 'react-router-dom'

export default function ActivityCard({ activity, icon = '✦' }) {
  const chips = activity.metas?.length
    ? activity.metas.slice(0, 4)
    : [
        activity.duration?.total !== undefined
          ? `${activity.duration.total} min`
          : null,
        Array.isArray(activity.modality)
          ? activity.modality.join(' · ')
          : activity.modality,
      ].filter(Boolean)

  const categoryLabel =
    activity.categoryLabel ||
    activity.subcategory ||
    activity.categorySlug ||
    'Actividad'

  return (
    <Link
      to={`/actividad/${activity.slug}`}
      className="act-item"
    >
      <div className="ai-icon">
        <span>{icon}</span>
      </div>

      <div className="ai-body">
        <p className="ai-cat">
          {categoryLabel}
        </p>

        <h3 className="ai-name">
          {activity.title}
        </h3>

        <p className="ai-desc">
          {activity.description}
        </p>

        {chips.length > 0 && (
          <div className="ai-chips">
            {chips.map((chip) => (
              <span key={chip} className="chip">
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      <span className="ai-arr">›</span>
    </Link>
  )
}
