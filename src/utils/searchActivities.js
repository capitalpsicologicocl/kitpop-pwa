import { loadActivityIndex } from '../data/contentLoader'

let activityIndexCache = null

async function getIndex() {
  if (!activityIndexCache) {
    activityIndexCache = await loadActivityIndex()
  }

  return activityIndexCache
}

function stripHtml(html = '') {
  return html.replace(/<[^>]+>/g, '').trim()
}

function getSearchText(activity) {
  return stripHtml(
    [
      activity.title,
      activity.description,
      activity.categoryLabel,
      activity.subcategory,
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

function filterActivities(activities, { query, categorySlug, duration, favoritesOnly, favoriteSlugs }) {
  const normalizedQuery = query.trim().toLowerCase()

  return activities.filter((activity) => {
    if (favoritesOnly && !favoriteSlugs.includes(activity.slug)) {
      return false
    }

    if (categorySlug !== 'all' && activity.categorySlug !== categorySlug) {
      return false
    }

    if (!matchesDuration(activity, duration)) {
      return false
    }

    if (!normalizedQuery) {
      return favoritesOnly
    }

    return getSearchText(activity).includes(normalizedQuery)
  })
}

export async function searchActivitiesAsync(options) {
  const index = await getIndex()
  return filterActivities(index, options)
}

/** Síncrono sobre índice ya cargado; preferir searchActivitiesAsync en UI */
export function searchActivities(options) {
  if (!activityIndexCache) {
    return []
  }

  return filterActivities(activityIndexCache, options)
}

export async function preloadActivityIndex() {
  activityIndexCache = await getIndex()
  return activityIndexCache
}

export { stripHtml }
