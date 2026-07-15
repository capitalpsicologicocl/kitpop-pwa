import {
  categories,
  ACTIVITY_COUNT,
  getCategoryBySlug,
} from './categoriesIndex'

export {
  categories,
  ACTIVITY_COUNT,
  getCategoryBySlug,
}

export {
  stripHtml,
  loadActivityContent,
  loadCategoryContent,
  loadAllActivityContent,
  loadActivityIndex,
  getCachedActivity,
  getCachedCategoryActivities,
} from './contentLoader'

export const kitpopCategories = categories
export let kitpopActivities = []

export async function ensureKitpopActivities() {
  const { loadAllActivityContent } = await import('./contentLoader')
  kitpopActivities = await loadAllActivityContent()
  return kitpopActivities
}

/** @deprecated Usa loadActivityContent() */
export async function getActivityBySlug(slug) {
  const { loadActivityContent } = await import('./contentLoader')
  return loadActivityContent(slug)
}

/** @deprecated Usa loadCategoryContent() */
export async function getActivitiesByCategorySlug(slug) {
  const { loadCategoryContent } = await import('./contentLoader')
  return loadCategoryContent(slug)
}
