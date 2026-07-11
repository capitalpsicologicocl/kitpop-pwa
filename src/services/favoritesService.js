import { supabase } from './supabaseClient'

export async function fetchFavoriteSlugs(userId) {
  const { data, error } = await supabase
    .from('favorites')
    .select('activity_slug')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map((row) => row.activity_slug)
}

export async function addFavorite(userId, activitySlug) {
  const { error } = await supabase.from('favorites').insert({
    user_id: userId,
    activity_slug: activitySlug,
  })

  if (error) {
    throw error
  }
}

export async function removeFavorite(userId, activitySlug) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('activity_slug', activitySlug)

  if (error) {
    throw error
  }
}
