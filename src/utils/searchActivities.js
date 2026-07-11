import { activities } from '../data/activities'
import { stripHtml } from '../data/kitpopAdapter'

function getSearchText(activity) {
  const kitpop = activity.kitpop ?? {}

  return stripHtml(
    [
      activity.title,
      activity.description,
      activity.categoryLabel,
      kitpop.name,
      kitpop.sub,
      kitpop.cat,
    ].join(' ')
  ).toLowerCase()
}

function matchesDuration(activity, duration) {
  if (duration === 'all') {
    return true
  }

  const total = activity.duration?.total ?? 15

  if (duration === 'short') {
    return total <= 15
  }

  if (duration === 'medium') {
    return total >= 16 && total <= 35
  }

  if (duration === 'long') {
    return total >= 36
  }

  return true
}

export function searchActivities({
  query = '',
  categorySlug = 'all',
  duration = 'all',
  favoritesOnly = false,
  favoriteSlugs = [],
}) {
  const normalizedQuery = query.trim().toLowerCase()

  if (favoritesOnly) {
    if (!favoriteSlugs.length) {
      return []
    }

    return activities.filter((activity) => {
      if (!favoriteSlugs.includes(activity.slug)) {
        return false
      }

      if (categorySlug !== 'all' && activity.categorySlug !== categorySlug) {
        return false
      }

      if (!matchesDuration(activity, duration)) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      return getSearchText(activity).includes(normalizedQuery)
    })
  }

  if (!normalizedQuery) {
    return []
  }

  return activities.filter((activity) => {
    if (categorySlug !== 'all' && activity.categorySlug !== categorySlug) {
      return false
    }

    if (!matchesDuration(activity, duration)) {
      return false
    }

    if (!normalizedQuery) {
      return false
    }

    return getSearchText(activity).includes(normalizedQuery)
  })
}
