import { Link } from 'react-router-dom'

import KitpopIcon from '../../icons/kitpopIcons'

export default function CategoryCard({ category }) {
  const activityCount = category.activityCount ?? 0

  return (
    <Link
      to={`/categoria/${category.slug}`}
      className={`cat-card ${category.className || ''}`}
    >
      <div className="cat-icon-box">
        <KitpopIcon name={category.icon} size={22} className="cat-icon-symbol" />
      </div>

      <p className="cat-tag-lbl">
        {category.subtitle || 'Banco de actividades'}
      </p>

      <h3 className="cat-name">
        {category.title}
      </h3>

      <p className="cat-desc">
        {category.description}
      </p>

      <span className="cat-count">
        {activityCount} {activityCount === 1 ? 'actividad' : 'actividades'}
      </span>
    </Link>
  )
}
