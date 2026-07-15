import { activities } from '../../data/activities'
import { categories } from '../../data/categories'
import ActivityCard from './ActivityCard'
import EmptyState from '../ui/EmptyState'

function getCategoryIcon(categorySlug) {
  return categories.find((category) => category.slug === categorySlug)?.icon ?? '✦'
}

export default function ActivityList({
  categorySlug,
  categoryIcon = '✦',
  permaFilter = 'all',
  items = null,
  useActivityIcons = false,
  emptyTitle = 'No hay actividades disponibles.',
  emptyDescription = 'Esta categoría aún no tiene actividades cargadas en la aplicación.',
  emptyVariant = 'list',
}) {
  const filteredActivities = items ?? activities.filter((activity) => {
    if (activity.categorySlug !== categorySlug) {
      return false
    }

    if (permaFilter === 'all') {
      return true
    }

    return activity.permaElement === permaFilter
  })

  if (filteredActivities.length === 0) {
    return (
      <EmptyState
        className="acts-empty"
        variant={emptyVariant}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <section className="acts-list">
      {filteredActivities.map((activity) => (
        <ActivityCard
          key={activity.slug}
          activity={activity}
          icon={
            useActivityIcons
              ? getCategoryIcon(activity.categorySlug)
              : categoryIcon
          }
        />
      ))}
    </section>
  )
}
