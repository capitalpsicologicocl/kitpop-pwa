import { supabase } from './supabaseClient'

const AVATAR_BUCKET = 'avatars'
const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'full_name, avatar_url, plan, subscription_status, paypal_subscription_id, plan_period_end, ai_generations_lifetime_count, ai_generations_month_count, ai_generations_month_key'
    )
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function updateProfile(userId, fullName) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: fullName,
    })
    .select(
      'full_name, avatar_url, plan, subscription_status, paypal_subscription_id, plan_period_end, ai_generations_lifetime_count, ai_generations_month_count, ai_generations_month_key'
    )
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function uploadAvatar(userId, file) {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw new Error('Usa una imagen JPG, PNG, WebP o GIF.')
  }

  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error('La imagen debe pesar menos de 2 MB.')
  }

  const extension = file.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
  const path = `${userId}/avatar.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data: publicData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(path)

  const avatarUrl = `${publicData.publicUrl}?t=${Date.now()}`

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      avatar_url: avatarUrl,
    })
    .select(
      'full_name, avatar_url, plan, subscription_status, paypal_subscription_id, plan_period_end, ai_generations_lifetime_count, ai_generations_month_count, ai_generations_month_key'
    )
    .single()

  if (error) {
    throw error
  }

  return data
}
